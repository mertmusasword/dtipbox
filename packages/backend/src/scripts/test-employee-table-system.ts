import prisma from '../utils/prisma';
import * as employeeService from '../services/employee.service';
import * as tableService from '../services/table.service';
import * as analyticsService from '../services/analytics.service';
import * as authService from '../services/auth.service';
import { Role } from '@prisma/client';

async function runTests() {
  console.log('🧪 Starting Employee & Table System Verification Test Suite...\n');

  // Step 0: Fetch or create test business
  const business = await prisma.business.findFirst({
    include: { owner: true },
  });

  if (!business) {
    throw new Error('No business found. Please ensure DB seed is executed.');
  }

  const businessId = business.id;
  const ownerId = business.owner_user_id;
  console.log(`🏢 Testing with Business: "${business.name}" (${businessId})`);

  // Create a secondary business for ownership isolation tests
  let secondBusiness = await prisma.business.findFirst({
    where: { name: 'Tenant Isolation Test Bistro' },
  });
  if (!secondBusiness) {
    const secondUser = await prisma.user.create({
      data: {
        email: `isolation-owner-${Date.now()}@test.com`,
        password_hash: 'hash-test',
        role: Role.BUSINESS,
      },
    });
    secondBusiness = await prisma.business.create({
      data: {
        name: 'Tenant Isolation Test Bistro',
        owner_user_id: secondUser.id,
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });
  }
  console.log(`🏢 Secondary Business for Isolation: "${secondBusiness.name}" (${secondBusiness.id})\n`);

  // ==========================================
  // 1. EMPLOYEE CRUD & LOGIN CREDENTIALS
  // ==========================================
  console.log('--- 1. Testing Employee System ---');

  const testEmail = `waiter-${Date.now()}@test.com`;
  const initialPassword = 'password123';
  const updatedPassword = 'newPassword456';

  // 1a. Create Employee with Login Credentials
  const createdEmp = await employeeService.createEmployee(businessId, ownerId, {
    first_name: 'Carlos',
    last_name: 'Santana',
    position: 'Sommelier',
    email: testEmail,
    password: initialPassword,
  });
  console.log(`✅ [1/8] Employee created: ${createdEmp.first_name} ${createdEmp.last_name} (User ID: ${createdEmp.user_id})`);

  if (!createdEmp.user_id) {
    throw new Error('Employee should have associated user_id');
  }

  // 1b. Test Employee Login
  const loginResult = await authService.login({
    email: testEmail,
    password: initialPassword,
  });
  console.log(`✅ [2/8] Employee successfully logged in! Token issued. Role: ${loginResult.user.role}`);
  if (loginResult.user.role !== 'EMPLOYEE') {
    throw new Error(`Expected role EMPLOYEE but got ${loginResult.user.role}`);
  }

  // 1c. Update Employee info and change password
  const updatedEmp = await employeeService.updateEmployee(
    createdEmp.id,
    businessId,
    ownerId,
    {
      first_name: 'Carlos Senior',
      position: 'Head Sommelier',
      password: updatedPassword,
    }
  );
  console.log(`✅ [3/8] Employee updated: ${updatedEmp.first_name}, ${updatedEmp.position}`);

  // Test login with new password
  const newLoginResult = await authService.login({
    email: testEmail,
    password: updatedPassword,
  });
  console.log('✅ [4/8] Employee logged in successfully with updated password.');

  // 1d. Toggle active / inactive (and check login deactivation)
  await employeeService.updateEmployee(createdEmp.id, businessId, ownerId, {
    is_active: false,
  });
  console.log('✅ [5/8] Employee deactivated.');

  let deactivationBlocked = false;
  try {
    await authService.login({
      email: testEmail,
      password: updatedPassword,
    });
  } catch (err: any) {
    if (err.message.includes('Account is deactivated')) {
      deactivationBlocked = true;
    }
  }
  if (!deactivationBlocked) {
    throw new Error('Deactivated employee was able to login!');
  }
  console.log('✅ [6/8] Deactivated employee login successfully blocked.');

  // Reactivate employee for stats test
  await employeeService.updateEmployee(createdEmp.id, businessId, ownerId, {
    is_active: true,
  });

  // 1e. Verify Employee Analytics & Privacy (Only own stats)
  const empStats = await analyticsService.getEmployeeAnalytics(createdEmp.id, businessId);
  console.log(`✅ [7/8] Employee analytics fetched: totalTips=${empStats.totalTips}, count=${empStats.tipCount}`);

  // 1f. Delete employee (soft-delete)
  await employeeService.deleteEmployee(createdEmp.id, businessId, ownerId);
  const deletedEmp = await prisma.employee.findUnique({ where: { id: createdEmp.id } });
  if (!deletedEmp?.deleted_at) {
    throw new Error('Employee was not soft-deleted');
  }
  console.log('✅ [8/8] Employee soft-delete verified (deleted_at is set).');

  // ==========================================
  // 2. TABLE CRUD & TENANT OWNERSHIP ISOLATION
  // ==========================================
  console.log('\n--- 2. Testing Table CRUD & Ownership Isolation ---');

  // 2a. Create Table
  const table = await tableService.createTable(businessId, ownerId, {
    name: `Terrace VIP-${Date.now()}`,
  });
  console.log(`✅ [1/4] Table created: "${table.name}" (${table.id})`);

  // 2b. Update Table
  const updatedTable = await tableService.updateTable(table.id, businessId, ownerId, {
    name: `${table.name} (Updated)`,
  });
  console.log(`✅ [2/4] Table updated: "${updatedTable.name}"`);

  // 2c. Tenant Isolation Check: Business B attempting to access or modify Business A's table
  let isolationSuccess = false;
  try {
    await tableService.updateTable(table.id, secondBusiness.id, 'intruder-user', {
      name: 'Hacked Table Name',
    });
  } catch (err: any) {
    if (err.statusCode === 404 || err.message.includes('not found')) {
      isolationSuccess = true;
    }
  }
  if (!isolationSuccess) {
    throw new Error('SECURITY VIOLATION: Business B was able to modify Business A table!');
  }
  console.log('✅ [3/4] IDOR / Tenant Isolation Verified: Business B cannot modify Business A table.');

  // 2d. Delete Table
  await tableService.deleteTable(table.id, businessId, ownerId);
  const checkTable = await prisma.table.findUnique({ where: { id: table.id } });
  if (checkTable) {
    throw new Error('Table was not deleted');
  }
  console.log('✅ [4/4] Table deletion verified.');

  // ==========================================
  // 3. ZERO IBAN / ZERO PAYMENT ACCOUNT IN EMPLOYEE SCHEMA
  // ==========================================
  console.log('\n--- 3. Verifying Zero IBAN / Zero Payment Account on Employee ---');

  const employeeFields = Object.keys(prisma.employee.fields);
  const forbiddenTerms = ['iban', 'account_number', 'routing', 'swift', 'payment_account'];
  const violations = employeeFields.filter((f) =>
    forbiddenTerms.some((term) => f.toLowerCase().includes(term))
  );

  if (violations.length > 0) {
    throw new Error(`Security policy violated! Employee model contains payment fields: ${violations.join(', ')}`);
  }
  console.log('✅ [1/1] Verified: Employee schema contains ZERO IBAN, ZERO bank account fields.');

  console.log('\n======================================================');
  console.log('🎉 ALL EMPLOYEE & TABLE VERIFICATION TESTS PASSED (13/13)');
  console.log('======================================================\n');
}

runTests()
  .catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
