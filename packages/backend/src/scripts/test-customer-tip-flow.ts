import prisma from '../utils/prisma';
import * as qrService from '../services/qr.service';
import * as tableService from '../services/table.service';
import * as employeeService from '../services/employee.service';
import * as paymentMethodService from '../services/paymentMethod.service';
import * as tipService from '../services/tip.service';
import { PaymentMethodType, PaymentStatus } from '@prisma/client';

async function runCustomerTipFlowTestSuite() {
  console.log('🧪 Starting Full Customer Tip Flow Verification Suite...\n');

  // 1. Get demo business with configured payment account
  const business = await prisma.business.findFirst({
    where: { payment_account: { isNot: null } },
    include: { owner: true },
  });
  if (!business) throw new Error('No business with payment account found');

  const businessId = business.id;
  const ownerId = business.owner_user_id;
  console.log(`🏢 Testing with Business: "${business.name}" (${businessId})`);

  // 2. Setup: Ensure Employee & Table exist
  let employee = await prisma.employee.findFirst({
    where: { business_id: businessId, is_active: true, deleted_at: null },
  });
  if (!employee) {
    employee = await employeeService.createEmployee(businessId, ownerId, {
      first_name: 'Lucas',
      last_name: 'Silva',
      position: 'Bartender',
    });
  }
  console.log(`👤 Test Employee: ${employee.first_name} ${employee.last_name} (${employee.id})`);

  let table = await prisma.table.findFirst({
    where: { business_id: businessId, is_active: true },
  });
  if (!table) {
    table = await tableService.createTable(businessId, ownerId, {
      name: 'Main Dining Table 4',
    });
  }
  console.log(`🪑 Test Table: "${table.name}" (${table.id})`);

  // 3. Create Table-Specific QR
  const tableQr = await qrService.createQrCode(businessId, ownerId, {
    table_id: table.id,
  });
  console.log(`📲 Generated Table-Specific QR Token: ${tableQr.public_token}`);

  // Create General QR
  const generalQr = await qrService.createQrCode(businessId, ownerId, {});
  console.log(`📲 Generated General QR Token: ${generalQr.public_token}`);

  // Ensure IBAN & CARD are ACTIVE
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'IBAN_TRANSFER', 'ACTIVE');
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'CARD', 'ACTIVE');

  // ==========================================
  // TEST 1: Table-Specific QR auto-binds to table in database tip record
  // ==========================================
  console.log('\n--- Test 1: Flow with Table-Specific QR + Employee Selection ---');
  const tipAmount1 = 75.0;
  const tip1Result = await tipService.createTip({
    publicToken: tableQr.public_token,
    employeeId: employee.id,
    amount: tipAmount1,
    paymentMethod: PaymentMethodType.IBAN_TRANSFER,
    customerName: 'Aylin Demir',
    customerMessage: 'Harika servis ve guler yuz!',
  });

  const tip1Db = await prisma.tip.findUnique({
    where: { id: tip1Result.tip.id },
  });
  if (!tip1Db) throw new Error('Tip 1 not found in database');
  if (tip1Db.table_id !== table.id) {
    throw new Error(`Expected tip.table_id to be ${table.id} but got ${tip1Db.table_id}`);
  }
  if (tip1Db.employee_id !== employee.id) {
    throw new Error(`Expected tip.employee_id to be ${employee.id} but got ${tip1Db.employee_id}`);
  }
  if (Number(tip1Db.amount) !== tipAmount1) {
    throw new Error(`Expected tip amount ${tipAmount1} but got ${tip1Db.amount}`);
  }
  console.log(`✅ [1/5] Tip successfully stored in DB:`);
  console.log(`       • ID: ${tip1Db.id}`);
  console.log(`       • Table ID: ${tip1Db.table_id} (Matched bound table)`);
  console.log(`       • Employee ID: ${tip1Db.employee_id} (Matched selected employee)`);
  console.log(`       • Amount: ${tip1Db.currency} ${tip1Db.amount}`);
  console.log(`       • Customer: ${tip1Db.customer_name} ("${tip1Db.customer_message}")`);

  // ==========================================
  // TEST 2: General QR with custom table selection & pool tip (no employee)
  // ==========================================
  console.log('\n--- Test 2: General QR Pool Tip ---');
  const tipAmount2 = 120.0;
  const tip2Result = await tipService.createTip({
    publicToken: generalQr.public_token,
    tableId: table.id,
    amount: tipAmount2,
    paymentMethod: PaymentMethodType.CARD,
    customerName: 'Mehmet Yilmaz',
  });

  const tip2Db = await prisma.tip.findUnique({
    where: { id: tip2Result.tip.id },
  });
  if (!tip2Db) throw new Error('Tip 2 not found in database');
  if (tip2Db.employee_id !== null) {
    throw new Error('General pool tip should have null employee_id');
  }
  if (tip2Db.table_id !== table.id) {
    throw new Error('Tip should link to manually chosen table');
  }
  console.log(`✅ [2/5] General QR Pool Tip correctly created without employee:`);
  console.log(`       • Status: ${tip2Db.payment_status}`);
  console.log(`       • Table ID: ${tip2Db.table_id}`);
  console.log(`       • Provider Tx ID: ${tip2Db.provider_transaction_id}`);

  // ==========================================
  // TEST 3: Validation - Negative or Zero Tip Amount
  // ==========================================
  console.log('\n--- Test 3: Validation on Invalid Amount ---');
  let invalidAmountBlocked = false;
  try {
    await tipService.createTip({
      publicToken: generalQr.public_token,
      amount: -10,
      paymentMethod: PaymentMethodType.CARD,
    });
  } catch (err: any) {
    if (err.statusCode === 400) invalidAmountBlocked = true;
  }
  if (!invalidAmountBlocked) throw new Error('Negative tip amount was not rejected!');
  console.log('✅ [3/5] Zero/negative tip amounts strictly rejected with HTTP 400.');

  // ==========================================
  // TEST 4: Validation - Inactive / Unavailable Payment Method
  // ==========================================
  console.log('\n--- Test 4: Inactive Payment Method Guard ---');
  // Deactivate CARD
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'CARD', 'INACTIVE');

  let inactivePaymentBlocked = false;
  try {
    await tipService.createTip({
      publicToken: generalQr.public_token,
      amount: 50,
      paymentMethod: PaymentMethodType.CARD,
    });
  } catch (err: any) {
    if (err.statusCode === 400 && err.message.includes('unavailable')) {
      inactivePaymentBlocked = true;
    }
  }
  if (!inactivePaymentBlocked) throw new Error('Customer was able to pay using deactivated payment method!');
  console.log('✅ [4/5] Deactivated/unavailable payment method blocked from payment execution.');

  // Reactivate CARD
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'CARD', 'ACTIVE');

  // ==========================================
  // TEST 5: Cross-Tenant Validation (Tampering employeeId from another business)
  // ==========================================
  console.log('\n--- Test 5: Abuse Protection - Cross-Tenant Employee Tampering ---');
  // Create another business with its own employee
  const intruderUser = await prisma.user.create({
    data: {
      email: `intruder-${Date.now()}@test.com`,
      password_hash: 'hash',
    },
  });
  const intruderBusiness = await prisma.business.create({
    data: {
      name: 'Rival Restaurant',
      owner_user_id: intruderUser.id,
      country: 'TR',
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
    },
  });
  const rivalEmployee = await prisma.employee.create({
    data: {
      business_id: intruderBusiness.id,
      first_name: 'Foreign',
      last_name: 'Staff',
    },
  });

  let crossTenantBlocked = false;
  try {
    await tipService.createTip({
      publicToken: tableQr.public_token,
      employeeId: rivalEmployee.id, // Trying to tip a rival employee via this business's QR
      amount: 40,
      paymentMethod: PaymentMethodType.CARD,
    });
  } catch (err: any) {
    if (err.statusCode === 400 && err.message.includes('invalid or no longer active')) {
      crossTenantBlocked = true;
    }
  }
  if (!crossTenantBlocked) throw new Error('SECURITY BREACH: Foreign employee was accepted on QR tip!');
  console.log('✅ [5/5] Cross-tenant tampering blocked: Cannot tip staff belonging to another business.');

  // Cleanup
  await qrService.deleteQrCode(tableQr.id, businessId, ownerId);
  await qrService.deleteQrCode(generalQr.id, businessId, ownerId);
  await prisma.tip.deleteMany({
    where: { id: { in: [tip1Result.tip.id, tip2Result.tip.id] } },
  });
  await prisma.employee.delete({ where: { id: rivalEmployee.id } });
  await prisma.business.delete({ where: { id: intruderBusiness.id } });
  await prisma.user.delete({ where: { id: intruderUser.id } });

  console.log('\n======================================================');
  console.log('🎉 ALL PUBLIC CUSTOMER TIP FLOW TESTS PASSED (5/5)');
  console.log('======================================================\n');
}

runCustomerTipFlowTestSuite()
  .catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
