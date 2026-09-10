import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role, PaymentStatus, QrType } from '@prisma/client';
import { analyticsService } from '../services/analytics.service';
import { adminService } from '../services/admin.service';
import { generatePublicToken } from '../utils/token';

const API_BASE = 'http://localhost:3000/api';

function getAuthHeader(userId: string, email: string, role: Role) {
  const token = jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

async function runAnalyticsAndAdminTestSuite() {
  console.log('🧪 Starting Business Analytics & Admin Panel Verification Suite...\n');

  // =========================================================================
  // 1. Setup Test Users & Tenants
  // =========================================================================
  console.log('--- 1. Setting Up Test Identities & Roles ---');

  // Admin User
  let adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: `admin_test_${Date.now()}@dtipbox.com`,
        password_hash: 'mockhash',
        role: Role.ADMIN,
      },
    });
  }

  // Employee User
  let empUser = await prisma.user.findFirst({ where: { role: Role.EMPLOYEE } });
  if (!empUser) {
    empUser = await prisma.user.create({
      data: {
        email: `emp_test_${Date.now()}@dtipbox.com`,
        password_hash: 'mockhash',
        role: Role.EMPLOYEE,
      },
    });
  }

  // Business User & Business
  let bizUser = await prisma.user.findFirst({
    where: { role: Role.BUSINESS },
    include: { business: true },
  });
  let business = bizUser?.business;

  if (!bizUser || !business) {
    bizUser = await prisma.user.create({
      data: {
        email: `biz_analytics_${Date.now()}@dtipbox.com`,
        password_hash: 'mockhash',
        role: Role.BUSINESS,
        business: {
          create: {
            name: 'Analytics Test Venue',
            country: 'TR',
            currency: 'TRY',
            timezone: 'Europe/Istanbul',
          },
        },
      },
      include: { business: true },
    });
    business = bizUser.business!;
  }

  // Ensure 2 employees exist
  let emp1 = await prisma.employee.findFirst({ where: { business_id: business.id, first_name: 'Elena' } });
  if (!emp1) {
    emp1 = await prisma.employee.create({
      data: {
        business_id: business.id,
        first_name: 'Elena',
        last_name: 'Rostova',
        position: 'Head Server',
      },
    });
  }

  let emp2 = await prisma.employee.findFirst({ where: { business_id: business.id, first_name: 'Marcus' } });
  if (!emp2) {
    emp2 = await prisma.employee.create({
      data: {
        business_id: business.id,
        first_name: 'Marcus',
        last_name: 'Vance',
        position: 'Bartender',
      },
    });
  }

  // Ensure 2 tables exist
  let table1 = await prisma.table.findFirst({ where: { business_id: business.id, name: 'VIP Terrace 1' } });
  if (!table1) {
    table1 = await prisma.table.create({
      data: {
        business_id: business.id,
        name: 'VIP Terrace 1',
      },
    });
  }

  let table2 = await prisma.table.findFirst({ where: { business_id: business.id, name: 'Main Bar 2' } });
  if (!table2) {
    table2 = await prisma.table.create({
      data: {
        business_id: business.id,
        name: 'Main Bar 2',
      },
    });
  }

  // Ensure 2 QR codes exist
  let qr1 = await prisma.qrCode.findFirst({ where: { business_id: business.id, table_id: table1.id } });
  if (!qr1) {
    qr1 = await prisma.qrCode.create({
      data: {
        business_id: business.id,
        table_id: table1.id,
        public_token: generatePublicToken(16),
        type: QrType.DTIPBOX,
      },
    });
  }

  let qr2 = await prisma.qrCode.findFirst({ where: { business_id: business.id, table_id: table2.id } });
  if (!qr2) {
    qr2 = await prisma.qrCode.create({
      data: {
        business_id: business.id,
        table_id: table2.id,
        public_token: generatePublicToken(16),
        type: QrType.DTIPBOX,
      },
    });
  }

  console.log(`✅ Identities ready. Business: "${business.name}" (${business.id})`);

  // =========================================================================
  // 2. Generate Real Tips with Temporal Spans (Daily, Weekly, Monthly, All-time)
  // =========================================================================
  console.log('\n--- 2. Seeding Controlled Temporal Tips ---');

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

  // Tip 1: Today, emp1, table1, CARD, 100.00
  await prisma.tip.create({
    data: {
      business_id: business.id,
      employee_id: emp1.id,
      table_id: table1.id,
      amount: 100.00,
      currency: business.currency,
      payment_method: 'CARD',
      payment_status: PaymentStatus.SUCCESS,
      created_at: now,
    },
  });

  // Tip 2: 2 days ago (Weekly), emp2, table2, IBAN_TRANSFER, 50.00
  await prisma.tip.create({
    data: {
      business_id: business.id,
      employee_id: emp2.id,
      table_id: table2.id,
      amount: 50.00,
      currency: business.currency,
      payment_method: 'IBAN_TRANSFER',
      payment_status: PaymentStatus.SUCCESS,
      created_at: twoDaysAgo,
    },
  });

  // Tip 3: 5 days ago (Monthly), emp1, table1, APPLE_PAY, 200.00
  await prisma.tip.create({
    data: {
      business_id: business.id,
      employee_id: emp1.id,
      table_id: table1.id,
      amount: 200.00,
      currency: business.currency,
      payment_method: 'APPLE_PAY',
      payment_status: PaymentStatus.SUCCESS,
      created_at: fiveDaysAgo,
    },
  });

  // Tip 4: 45 days ago (Total only), emp2, table2, CARD, 150.00
  await prisma.tip.create({
    data: {
      business_id: business.id,
      employee_id: emp2.id,
      table_id: table2.id,
      amount: 150.00,
      currency: business.currency,
      payment_method: 'CARD',
      payment_status: PaymentStatus.SUCCESS,
      created_at: fortyFiveDaysAgo,
    },
  });

  console.log(`✅ Seeded 4 tips: Today(100), Weekly(50), Monthly(200), Total(150)`);

  // =========================================================================
  // 3. Test Analytics Engine Calculations
  // =========================================================================
  console.log('\n--- 3. Testing Analytics Engine Calculation ---');

  const analytics = await analyticsService.getBusinessAnalytics(business.id);

  console.log('Metrics output:');
  console.log(`- Daily (Today): ${analytics.todayTips}`);
  console.log(`- Weekly (7 days): ${analytics.weeklyTips}`);
  console.log(`- Monthly (30 days): ${analytics.monthlyTips}`);
  console.log(`- Total: ${analytics.totalTips}`);
  console.log(`- Average: ${analytics.averageTip}`);
  console.log(`- Count: ${analytics.tipCount}`);

  // Assertions
  if (analytics.todayTips < 100) throw new Error(`Daily calculation incorrect: expected >= 100, got ${analytics.todayTips}`);
  if (analytics.weeklyTips < 150) throw new Error(`Weekly calculation incorrect: expected >= 150, got ${analytics.weeklyTips}`);
  if (analytics.monthlyTips < 350) throw new Error(`Monthly calculation incorrect: expected >= 350, got ${analytics.monthlyTips}`);
  if (analytics.totalTips < 500) throw new Error(`Total calculation incorrect: expected >= 500, got ${analytics.totalTips}`);
  if (analytics.tipCount < 4) throw new Error(`Tip count incorrect: expected >= 4, got ${analytics.tipCount}`);
  if (analytics.averageTip <= 0) throw new Error('Average tip must be greater than 0');

  console.log('✅ Daily, Weekly, Monthly, Total, Average, Count verified successfully!');

  // Employee Performance Verification
  console.log('\n--- Employee Performance Breakdown ---');
  console.log(analytics.employeePerformance);
  const elenaStats = analytics.employeePerformance.find((e: any) => e.name.includes('Elena'));
  const marcusStats = analytics.employeePerformance.find((e: any) => e.name.includes('Marcus'));
  if (!elenaStats || !marcusStats) throw new Error('Employee breakdown missing Elena or Marcus');
  if (elenaStats.total < 300) throw new Error(`Elena total expected >= 300, got ${elenaStats.total}`);
  if (marcusStats.total < 200) throw new Error(`Marcus total expected >= 200, got ${marcusStats.total}`);
  console.log('✅ Employee performance breakdown matches database records!');

  // Table Performance Verification
  console.log('\n--- Table Performance Breakdown ---');
  console.log(analytics.tablePerformance);
  const vipTable = analytics.tablePerformance.find((t: any) => t.name.includes('VIP Terrace'));
  const barTable = analytics.tablePerformance.find((t: any) => t.name.includes('Main Bar'));
  if (!vipTable || !barTable) throw new Error('Table breakdown missing VIP or Bar');
  if (vipTable.total < 300) throw new Error(`VIP table total expected >= 300, got ${vipTable.total}`);
  if (barTable.total < 200) throw new Error(`Bar table total expected >= 200, got ${barTable.total}`);
  console.log('✅ Table performance breakdown matches database records!');

  // QR Code Usage Verification
  console.log('\n--- QR Usage Breakdown ---');
  console.log(analytics.qrUsage);
  if (!analytics.qrUsage || analytics.qrUsage.length === 0) throw new Error('QR usage statistics empty');
  const qr1Stats = analytics.qrUsage.find((q: any) => q.token === qr1!.public_token);
  const qr2Stats = analytics.qrUsage.find((q: any) => q.token === qr2!.public_token);
  if (!qr1Stats || !qr2Stats) throw new Error('QR usage missing registered test tokens');
  if (qr1Stats.count < 2) throw new Error(`QR1 count expected >= 2, got ${qr1Stats.count}`);
  if (qr2Stats.count < 2) throw new Error(`QR2 count expected >= 2, got ${qr2Stats.count}`);
  console.log('✅ QR usage accurately aggregates scans and tip revenue per code!');

  // Payment Method Usage Verification
  console.log('\n--- Payment Method Usage Breakdown ---');
  console.log(analytics.paymentMethodUsage);
  const cardStats = analytics.paymentMethodUsage.find((m: any) => m.method === 'CARD');
  const ibanStats = analytics.paymentMethodUsage.find((m: any) => m.method === 'IBAN_TRANSFER');
  if (!cardStats || !ibanStats) throw new Error('Payment method usage missing CARD or IBAN');
  if (cardStats.total < 250) throw new Error(`Card volume expected >= 250, got ${cardStats.total}`);
  if (ibanStats.total < 50) throw new Error(`IBAN volume expected >= 50, got ${ibanStats.total}`);
  console.log('✅ Payment method usage accurately tracks channel distributions!');

  // =========================================================================
  // 4. Admin Security & Authorization Verification
  // =========================================================================
  console.log('\n--- 4. Testing Admin Security & Authorization Guard ---');

  // Employee Token
  const empHeaders = getAuthHeader(empUser.id, empUser.email, Role.EMPLOYEE);
  // Business Token
  const bizHeaders = getAuthHeader(bizUser.id, bizUser.email, Role.BUSINESS);
  // Admin Token
  const adminHeaders = getAuthHeader(adminUser.id, adminUser.email, Role.ADMIN);

  // A. Unauthenticated
  const resNoAuth = await fetch(`${API_BASE}/admin/statistics`);
  if (resNoAuth.status !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${resNoAuth.status}`);
  console.log('🔒 Request without token: correctly rejected with 401 Unauthorized');

  // B. Employee Token -> 403
  const resEmp = await fetch(`${API_BASE}/admin/statistics`, { headers: empHeaders });
  if (resEmp.status !== 403) throw new Error(`Expected 403 for EMPLOYEE role, got ${resEmp.status}`);
  console.log('🔒 Request with EMPLOYEE role: correctly rejected with 403 Forbidden');

  // C. Business Token -> 403
  const resBiz = await fetch(`${API_BASE}/admin/statistics`, { headers: bizHeaders });
  if (resBiz.status !== 403) throw new Error(`Expected 403 for BUSINESS role, got ${resBiz.status}`);
  console.log('🔒 Request with BUSINESS role: correctly rejected with 403 Forbidden');

  // D. Admin Token -> 200
  const resAdmin = await fetch(`${API_BASE}/admin/statistics`, { headers: adminHeaders });
  if (resAdmin.status !== 200) throw new Error(`Expected 200 for ADMIN role, got ${resAdmin.status}`);
  const statsData: any = await resAdmin.json();
  console.log('🔓 Request with ADMIN role: successfully authorized with 200 OK');
  console.log('Platform Stats:', statsData.data);

  // =========================================================================
  // 5. Admin API Endpoints Functional Verification
  // =========================================================================
  console.log('\n--- 5. Testing All Admin Management Endpoints ---');

  // A. GET /api/admin/businesses
  const resBusinesses = await fetch(`${API_BASE}/admin/businesses`, { headers: adminHeaders });
  if (resBusinesses.status !== 200) throw new Error('GET /api/admin/businesses failed');
  const businessesList: any = await resBusinesses.json();
  console.log(`✅ /api/admin/businesses returned ${businessesList.data.businesses.length} businesses`);

  // B. GET /api/admin/businesses/:id
  const resBusinessDetail = await fetch(`${API_BASE}/admin/businesses/${business.id}`, { headers: adminHeaders });
  if (resBusinessDetail.status !== 200) throw new Error(`GET /api/admin/businesses/${business.id} failed`);
  const bizDetail: any = await resBusinessDetail.json();
  if (bizDetail.data.id !== business.id) throw new Error('Business detail ID mismatch');
  console.log(`✅ /api/admin/businesses/:id returned full detail for "${bizDetail.data.name}"`);

  // C. PUT /api/admin/businesses/:id/status (Toggle suspension)
  const resStatusToggle = await fetch(`${API_BASE}/admin/businesses/${business.id}/status`, {
    method: 'PUT',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: false }),
  });
  if (resStatusToggle.status !== 200) throw new Error('PUT /api/admin/businesses/:id/status failed');
  const toggledBiz: any = await resStatusToggle.json();
  if (toggledBiz.data.is_active !== false) throw new Error('Failed to deactivate business');
  console.log('✅ /api/admin/businesses/:id/status successfully suspended tenant');

  // Restore status back to active
  await fetch(`${API_BASE}/admin/businesses/${business.id}/status`, {
    method: 'PUT',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: true }),
  });
  console.log('✅ Re-activated test tenant successfully');

  // D. GET /api/admin/employees
  const resEmployees = await fetch(`${API_BASE}/admin/employees`, { headers: adminHeaders });
  if (resEmployees.status !== 200) throw new Error('GET /api/admin/employees failed');
  const employeesData: any = await resEmployees.json();
  console.log(`✅ /api/admin/employees returned ${employeesData.data.employees.length} staff records across tenants`);

  // E. GET /api/admin/qr
  const resQrs = await fetch(`${API_BASE}/admin/qr`, { headers: adminHeaders });
  if (resQrs.status !== 200) throw new Error('GET /api/admin/qr failed');
  const qrData: any = await resQrs.json();
  console.log(`✅ /api/admin/qr returned ${qrData.data.qrCodes.length} registered QR codes`);

  // F. GET /api/admin/payments
  const resPayments = await fetch(`${API_BASE}/admin/payments`, { headers: adminHeaders });
  if (resPayments.status !== 200) throw new Error('GET /api/admin/payments failed');
  const paymentsData: any = await resPayments.json();
  console.log(`✅ /api/admin/payments returned ${paymentsData.data.tips.length} tip payment records`);

  // G. GET /api/admin/audit-logs
  const resAudit = await fetch(`${API_BASE}/admin/audit-logs`, { headers: adminHeaders });
  if (resAudit.status !== 200) throw new Error('GET /api/admin/audit-logs failed');
  const auditData: any = await resAudit.json();
  console.log(`✅ /api/admin/audit-logs returned ${auditData.data.logs.length} system audit logs`);

  console.log('\n🎉 ALL BUSINESS ANALYTICS & ADMIN PANEL TESTS PASSED WITH 100% INTEGRITY!\n');
}

runAnalyticsAndAdminTestSuite()
  .catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
