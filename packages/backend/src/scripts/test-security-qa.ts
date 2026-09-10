import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role, PaymentMethodType, PaymentStatus, QrType } from '@prisma/client';
import * as employeeService from '../services/employee.service';
import * as tableService from '../services/table.service';
import { stripeProvider } from '../services/payment/providers/stripe/stripe.provider';
import crypto from 'crypto';

const API_BASE = 'http://localhost:3000/api';

function getAuthHeader(userId: string, email: string, role: Role) {
  const token = jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function runSecurityAndQASuite() {
  console.log('🛡️  STARTING COMPREHENSIVE SECURITY & QA VERIFICATION SUITE\n');

  // =========================================================================
  // 1. Privilege Escalation Guard (Disallow Self-Admin Registration)
  // =========================================================================
  console.log('--- 1. Testing Privilege Escalation Protection ---');
  const resAdminRegister = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `hacker_${Date.now()}@evil.com`,
      password: 'HackerPassword123!',
      role: 'ADMIN',
      businessName: 'Fake Venue',
    }),
  });

  if (resAdminRegister.status !== 400 && resAdminRegister.status !== 403) {
    throw new Error(`CRITICAL VULNERABILITY: Admin registration was allowed! Status: ${resAdminRegister.status}`);
  }
  console.log(`✅ Admin registration attempt blocked as expected (HTTP ${resAdminRegister.status})`);

  // =========================================================================
  // 2. Password Length Boundary Testing (DoS & Weakness Protection)
  // =========================================================================
  console.log('\n--- 2. Testing Password Constraints & DoS Boundaries ---');
  
  // A. Too short (< 8 chars)
  const resShortPass = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `shortpass_${Date.now()}@test.com`,
      password: 'short',
      role: 'BUSINESS',
    }),
  });
  if (resShortPass.status !== 400) throw new Error('Short password was not rejected with 400');
  console.log('✅ Short password (<8 chars) correctly rejected');

  // B. Too long (> 128 chars, bcrypt CPU DoS prevention)
  const longPassword = 'A'.repeat(200);
  const resLongPass = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `longpass_${Date.now()}@test.com`,
      password: longPassword,
      role: 'BUSINESS',
    }),
  });
  if (resLongPass.status !== 400) throw new Error('Overly long password (>128 chars) was not rejected with 400');
  console.log('✅ Excessive length password (>128 chars) correctly rejected');

  // =========================================================================
  // 3. Deleted Employee Revocation & Deactivation Test
  // =========================================================================
  console.log('\n--- 3. Testing Deleted Employee Credential Revocation ---');

  // Find demo business
  const business = await prisma.business.findFirst({
    include: { owner: true },
  });
  if (!business) throw new Error('Demo business not found');

  const empEmail = `revoked_emp_${Date.now()}@test.com`;
  const empPassword = 'EmployeePassword123!';

  // Create an employee with login account
  const emp = await employeeService.createEmployee(business.id, business.owner_user_id, {
    first_name: 'TestRevoke',
    last_name: 'Employee',
    email: empEmail,
    password: empPassword,
  });

  // Verify employee can login
  const resEmpLoginBefore = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: empEmail, password: empPassword }),
  });
  if (resEmpLoginBefore.status !== 200) throw new Error('Employee initial login failed');
  const loginData: any = await resEmpLoginBefore.json();
  const refreshToken = loginData.data.refreshToken;
  console.log('✅ Created test employee and verified active login');

  // Soft-delete employee
  await employeeService.deleteEmployee(emp.id, business.id, business.owner_user_id);
  console.log('🗑️  Soft-deleted employee via business owner');

  // Verify employee login is immediately blocked
  const resEmpLoginAfter = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: empEmail, password: empPassword }),
  });
  if (resEmpLoginAfter.status !== 403) {
    throw new Error(`CRITICAL: Deleted employee could still log in! Got status ${resEmpLoginAfter.status}`);
  }
  console.log('🔒 Deleted employee login blocked with HTTP 403 (Account is deactivated)');

  // Verify refresh token cannot be refreshed
  const resRefresh = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (resRefresh.status !== 401) {
    throw new Error(`CRITICAL: Deleted employee could refresh token! Got status ${resRefresh.status}`);
  }
  console.log('🔒 Deleted employee refresh token blocked with HTTP 401 (User inactive)');

  // =========================================================================
  // 4. Tenant IDOR Isolation Tests (Cross-Tenant Tampering Prevention)
  // =========================================================================
  console.log('\n--- 4. Testing Multi-Tenant IDOR Isolation ---');

  // Create Business A and Business B
  const bizUserA = await prisma.user.create({
    data: {
      email: `biz_idor_a_${Date.now()}@test.com`,
      password_hash: 'mockhash',
      role: Role.BUSINESS,
      business: { create: { name: 'Tenant A', country: 'US', currency: 'USD', timezone: 'UTC' } },
    },
    include: { business: true },
  });

  const bizUserB = await prisma.user.create({
    data: {
      email: `biz_idor_b_${Date.now()}@test.com`,
      password_hash: 'mockhash',
      role: Role.BUSINESS,
      business: { create: { name: 'Tenant B', country: 'US', currency: 'USD', timezone: 'UTC' } },
    },
    include: { business: true },
  });

  const tableA = await tableService.createTable(bizUserA.business!.id, bizUserA.id, { name: 'VIP A' });
  const empA = await employeeService.createEmployee(bizUserA.business!.id, bizUserA.id, {
    first_name: 'Alice',
    last_name: 'TenantA',
  });

  // Business B tries to update Table A
  const headersB = getAuthHeader(bizUserB.id, bizUserB.email, Role.BUSINESS);
  const resUpdateTableA = await fetch(`${API_BASE}/business/tables/${tableA.id}`, {
    method: 'PUT',
    headers: headersB,
    body: JSON.stringify({ name: 'Hacked Table' }),
  });
  if (resUpdateTableA.status !== 404) {
    throw new Error(`IDOR VULNERABILITY: Tenant B updated Tenant A table! Status: ${resUpdateTableA.status}`);
  }
  console.log('🛡️  Cross-tenant table update blocked with 404 (IDOR safe)');

  // Business B tries to delete Table A
  const resDeleteTableA = await fetch(`${API_BASE}/business/tables/${tableA.id}`, {
    method: 'DELETE',
    headers: headersB,
  });
  if (resDeleteTableA.status !== 404) {
    throw new Error(`IDOR VULNERABILITY: Tenant B deleted Tenant A table! Status: ${resDeleteTableA.status}`);
  }
  console.log('🛡️  Cross-tenant table deletion blocked with 404 (IDOR safe)');

  // Business B tries to update Employee A
  const resUpdateEmpA = await fetch(`${API_BASE}/business/employees/${empA.id}`, {
    method: 'PUT',
    headers: headersB,
    body: JSON.stringify({ first_name: 'Hacked Employee' }),
  });
  if (resUpdateEmpA.status !== 404) {
    throw new Error(`IDOR VULNERABILITY: Tenant B updated Tenant A employee! Status: ${resUpdateEmpA.status}`);
  }
  console.log('🛡️  Cross-tenant employee update blocked with 404 (IDOR safe)');

  // Business B tries to delete Employee A
  const resDeleteEmpA = await fetch(`${API_BASE}/business/employees/${empA.id}`, {
    method: 'DELETE',
    headers: headersB,
  });
  if (resDeleteEmpA.status !== 404) {
    throw new Error(`IDOR VULNERABILITY: Tenant B deleted Tenant A employee! Status: ${resDeleteEmpA.status}`);
  }
  console.log('🛡️  Cross-tenant employee deletion blocked with 404 (IDOR safe)');

  // =========================================================================
  // 5. Webhook Security: Timing Attacks & Replay Window Protection
  // =========================================================================
  console.log('\n--- 5. Testing Webhook Timing-Safe & Replay Protection ---');

  const webhookPayload = JSON.stringify({
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test_123', status: 'succeeded' } },
  });

  // A. Replay attack: timestamp older than 300 seconds
  const oldTimestamp = Math.floor(Date.now() / 1000) - 500;
  const oldPayloadToSign = `${oldTimestamp}.${webhookPayload}`;
  const oldSig = crypto.createHmac('sha256', 'mock_secret').update(oldPayloadToSign).digest('hex');

  // Test provider handleWebhook with expired signature
  try {
    // Override STRIPE_WEBHOOK_SECRET temporarily
    (env as any).STRIPE_WEBHOOK_SECRET = 'mock_secret';
    await stripeProvider.handleWebhook(webhookPayload, `t=${oldTimestamp},v1=${oldSig}`);
    throw new Error('Webhook replay attack was not rejected');
  } catch (err: any) {
    if (!err.message.includes('expired or out of tolerance')) {
      throw new Error(`Expected replay tolerance error, got: ${err.message}`);
    }
    console.log('✅ Webhook replay attack (>300s old) correctly rejected');
  }

  // B. Timing attack & invalid signature
  const freshTimestamp = Math.floor(Date.now() / 1000);
  try {
    await stripeProvider.handleWebhook(webhookPayload, `t=${freshTimestamp},v1=invalid_fake_signature_hash`);
    throw new Error('Invalid webhook signature was not rejected');
  } catch (err: any) {
    if (!err.message.includes('signature verification failed') && !err.message.includes('Invalid webhook signature')) {
      throw new Error(`Expected signature verification error, got: ${err.message}`);
    }
    console.log('✅ Invalid webhook signature correctly rejected via timingSafeEqual');
  }

  // Reset STRIPE_WEBHOOK_SECRET
  (env as any).STRIPE_WEBHOOK_SECRET = '';

  // =========================================================================
  // 6. Public QR Endpoint Data Leakage Audit
  // =========================================================================
  console.log('\n--- 6. Auditing Public QR Page Data Exposure ---');

  const qr = await prisma.qrCode.findFirst({
    where: { is_active: true },
  });
  if (!qr) throw new Error('No active QR code found');

  const resPublicTip = await fetch(`${API_BASE}/tip/${qr.public_token}`);
  if (resPublicTip.status !== 200) throw new Error('Public tip endpoint failed');
  const publicDataText = await resPublicTip.text();
  const publicData = JSON.parse(publicDataText);

  // Assertions against data leakage
  if (publicDataText.includes('password_hash')) throw new Error('LEAK: Response includes password_hash!');
  if (publicDataText.includes('iban') && publicData.data.business.iban) throw new Error('LEAK: Response directly exposes raw IBAN on page load!');
  if (publicData.data.employees?.some((e: any) => e.email)) throw new Error('LEAK: Response exposes employee email addresses!');
  if (publicData.data.employees?.some((e: any) => e.user_id)) throw new Error('LEAK: Response exposes internal user IDs!');

  console.log('✅ Zero sensitive information (no passwords, no employee emails, no raw credentials) leaked on public QR route');

  // =========================================================================
  // 7. Pagination DoS Clamping Verification
  // =========================================================================
  console.log('\n--- 7. Testing Pagination Boundaries & DoS Clamping ---');

  let adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!adminUser) throw new Error('Admin user not found');
  const adminHeaders = getAuthHeader(adminUser.id, adminUser.email, Role.ADMIN);

  // A. Negative values shouldn't crash Prisma
  const resNegativePagination = await fetch(`${API_BASE}/admin/businesses?page=-5&limit=-20`, {
    headers: adminHeaders,
  });
  if (resNegativePagination.status !== 200) {
    throw new Error(`Negative pagination crashed! Status: ${resNegativePagination.status}`);
  }
  const negData: any = await resNegativePagination.json();
  if (negData.data.page < 1) throw new Error('Page was not clamped to >= 1');
  console.log('✅ Negative pagination query clamped safely without database error');

  // B. Enormous limit shouldn't allocate memory unbounded
  const resHugeLimit = await fetch(`${API_BASE}/admin/businesses?limit=1000000`, {
    headers: adminHeaders,
  });
  if (resHugeLimit.status !== 200) {
    throw new Error(`Huge limit failed! Status: ${resHugeLimit.status}`);
  }
  const hugeData: any = await resHugeLimit.json();
  if (hugeData.data.limit > 100) throw new Error('Limit was not clamped to maximum 100');
  console.log(`✅ Excessive limit (1,000,000) clamped safely to max limit (${hugeData.data.limit})`);

  console.log('\n🎉 ALL SECURITY & QA AUDIT CHECKS PASSED WITH 100% SUCCESS!\n');
}

runSecurityAndQASuite()
  .catch((err) => {
    console.error('❌ Security & QA test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
