import prisma from '../utils/prisma';
import { PaymentStatus } from '@prisma/client';

export async function getBusinessAnalytics(businessId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Consider successful, unverified (bank transfer), or pending (external card link) tips in metrics
  const validStatuses: PaymentStatus[] = [
    PaymentStatus.SUCCESS,
    PaymentStatus.UNVERIFIED,
    PaymentStatus.PENDING,
    PaymentStatus.CANCELLED,
  ];

  const [
    allTips,
    employeeCount,
    tableCount,
    qrCount,
    activePaymentMethodsCount,
    employees,
    tables,
    qrCodes,
  ] = await Promise.all([
    prisma.tip.findMany({
      where: {
        business_id: businessId,
        payment_status: { in: validStatuses },
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        payment_method: true,
        payment_status: true,
        employee_id: true,
        table_id: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.employee.count({
      where: { business_id: businessId, deleted_at: null, is_active: true },
    }),
    prisma.table.count({
      where: { business_id: businessId, is_active: true },
    }),
    prisma.qrCode.count({
      where: { business_id: businessId, is_active: true },
    }),
    prisma.paymentMethod.count({
      where: { business_id: businessId, status: 'ACTIVE' },
    }),
    prisma.employee.findMany({
      where: { business_id: businessId, deleted_at: null },
      select: { id: true, first_name: true, last_name: true, position: true },
    }),
    prisma.table.findMany({
      where: { business_id: businessId },
      select: { id: true, name: true },
    }),
    prisma.qrCode.findMany({
      where: { business_id: businessId },
      select: {
        id: true,
        type: true,
        public_token: true,
        table_id: true,
        table: { select: { name: true } },
      },
    }),
  ]);

  let todayAmount = 0;
  let weeklyAmount = 0;
  let monthlyAmount = 0;
  let totalAmount = 0;
  let confirmedTipCount = 0;
  let pendingTipCount = 0;
  let pendingAmount = 0;

  const employeeMap = new Map<string, { name: string; count: number; total: number }>();
  for (const emp of employees) {
    employeeMap.set(emp.id, {
      name: `${emp.first_name} ${emp.last_name}`,
      count: 0,
      total: 0,
    });
  }

  const tableMap = new Map<string, { name: string; count: number; total: number }>();
  for (const tbl of tables) {
    tableMap.set(tbl.id, { name: tbl.name, count: 0, total: 0 });
  }

  const paymentMethodUsage: Record<string, { count: number; total: number }> = {};

  for (const tip of allTips) {
    const amt = Number(tip.amount);

    if (tip.payment_status === PaymentStatus.SUCCESS) {
      totalAmount += amt;
      confirmedTipCount += 1;

      const createdAt = new Date(tip.created_at);
      if (createdAt >= startOfToday) todayAmount += amt;
      if (createdAt >= startOfWeek) weeklyAmount += amt;
      if (createdAt >= startOfMonth) monthlyAmount += amt;

      // Employee aggregation
      if (tip.employee_id && employeeMap.has(tip.employee_id)) {
        const e = employeeMap.get(tip.employee_id)!;
        e.count += 1;
        e.total += amt;
      }

      // Table aggregation
      if (tip.table_id && tableMap.has(tip.table_id)) {
        const t = tableMap.get(tip.table_id)!;
        t.count += 1;
        t.total += amt;
      }

      // Method aggregation
      const method = tip.payment_method;
      if (!paymentMethodUsage[method]) {
        paymentMethodUsage[method] = { count: 0, total: 0 };
      }
      paymentMethodUsage[method].count += 1;
      paymentMethodUsage[method].total += amt;
    } else if (tip.payment_status === PaymentStatus.UNVERIFIED || tip.payment_status === PaymentStatus.PENDING) {
      pendingTipCount += 1;
      pendingAmount += amt;
    }
  }

  const tipCount = confirmedTipCount;
  const averageTip = tipCount > 0 ? Number((totalAmount / tipCount).toFixed(2)) : 0;

  return {
    todayTips: Number(todayAmount.toFixed(2)),
    weeklyTips: Number(weeklyAmount.toFixed(2)),
    monthlyTips: Number(monthlyAmount.toFixed(2)),
    totalTips: Number(totalAmount.toFixed(2)),
    tipCount,
    averageTip,
    pendingTipCount,
    pendingTipAmount: Number(pendingAmount.toFixed(2)),
    employeeCount,
    tableCount,
    qrCount,
    activePaymentMethodsCount,
    employeePerformance: Array.from(employeeMap.values()).map((v) => ({
      ...v,
      total: Number(v.total.toFixed(2)),
    })),
    tablePerformance: Array.from(tableMap.values()).map((v) => ({
      ...v,
      total: Number(v.total.toFixed(2)),
    })),
    paymentMethodUsage: Object.entries(paymentMethodUsage).map(([method, data]) => ({
      method,
      count: data.count,
      total: Number(data.total.toFixed(2)),
    })),
    qrUsage: qrCodes.map((q) => {
      let count = 0;
      let total = 0;
      if (q.table_id) {
        const tableTips = allTips.filter((t) => t.table_id === q.table_id && t.payment_status === PaymentStatus.SUCCESS);
        count = tableTips.length;
        total = tableTips.reduce((sum, t) => sum + Number(t.amount), 0);
      } else {
        const generalTips = allTips.filter((t) => !t.table_id && t.payment_status === PaymentStatus.SUCCESS);
        count = generalTips.length;
        total = generalTips.reduce((sum, t) => sum + Number(t.amount), 0);
      }
      return {
        id: q.id,
        token: q.public_token,
        publicToken: q.public_token,
        type: q.type,
        target: q.table?.name ? `Table: ${q.table.name}` : 'General Business QR',
        table: q.table?.name ? `Table: ${q.table.name}` : 'Venue General',
        count,
        total: Number(total.toFixed(2)),
      };
    }),
    recentTips: allTips.slice(0, 10).map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      currency: t.currency,
      payment_method: t.payment_method,
      status: t.payment_status,
      created_at: t.created_at,
    })),
  };
}

export async function getEmployeeAnalytics(employeeId: string, businessId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const validStatuses: PaymentStatus[] = [PaymentStatus.SUCCESS, PaymentStatus.UNVERIFIED, PaymentStatus.PENDING];

  const tips = await prisma.tip.findMany({
    where: {
      employee_id: employeeId,
      business_id: businessId,
      payment_status: { in: validStatuses },
    },
    orderBy: { created_at: 'desc' },
  });

  let todayAmount = 0;
  let weeklyAmount = 0;
  let monthlyAmount = 0;
  let totalAmount = 0;
  let confirmedTipCount = 0;

  for (const tip of tips) {
    if (tip.payment_status === PaymentStatus.SUCCESS) {
      const amt = Number(tip.amount);
      totalAmount += amt;
      confirmedTipCount += 1;

      const createdAt = new Date(tip.created_at);
      if (createdAt >= startOfToday) todayAmount += amt;
      if (createdAt >= startOfWeek) weeklyAmount += amt;
      if (createdAt >= startOfMonth) monthlyAmount += amt;
    }
  }

  const tipCount = confirmedTipCount;
  const averageTip = tipCount > 0 ? Number((totalAmount / tipCount).toFixed(2)) : 0;

  return {
    todayTips: Number(todayAmount.toFixed(2)),
    weeklyTips: Number(weeklyAmount.toFixed(2)),
    monthlyTips: Number(monthlyAmount.toFixed(2)),
    totalTips: Number(totalAmount.toFixed(2)),
    tipCount,
    averageTip,
    recentTips: tips.slice(0, 15).map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      currency: t.currency,
      payment_method: t.payment_method,
      created_at: t.created_at,
      customer_name: t.customer_name,
      customer_message: t.customer_message,
    })),
  };
}

export async function exportTipsCsv(
  businessId: string,
  options: {
    type?: 'transactions' | 'staff' | 'summary';
    startDate?: Date;
    endDate?: Date;
    delimiter?: ',' | ';';
  } = {}
): Promise<{ filename: string; csv: string }> {
  const { type = 'transactions', startDate, endDate, delimiter = ';' } = options;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, currency: true },
  });
  const businessName = business?.name || 'Naponi_Business';
  const currency = business?.currency || 'TRY';

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;

  if (type === 'staff') {
    const employees = await prisma.employee.findMany({
      where: { business_id: businessId, deleted_at: null },
      include: {
        tips: {
          where: {
            payment_status: PaymentStatus.SUCCESS,
            ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
          },
          select: { amount: true },
        },
      },
      orderBy: { first_name: 'asc' },
    });

    const headers = [
      'Personel Adı',
      'Pozisyon / Görev',
      'Bahşiş Adedi',
      `Toplam Tutar (${currency})`,
      `Ortalama Bahşiş (${currency})`,
    ];

    const rows = employees.map((emp) => {
      const count = emp.tips.length;
      const total = emp.tips.reduce((sum, t) => sum + Number(t.amount), 0);
      const avg = count > 0 ? (total / count).toFixed(2) : '0.00';
      return [
        `"${`${emp.first_name} ${emp.last_name || ''}`.trim()}"`,
        `"${emp.position || 'Servis Ekibi'}"`,
        count,
        total.toFixed(2),
        avg,
      ].join(delimiter);
    });

    const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows].join('\r\n');
    const safeBizName = businessName.replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, '_');
    const filename = `${safeBizName}_Personel_Hakedis_${new Date().toISOString().slice(0, 10)}.csv`;
    return { filename, csv: csvContent };
  }

  // Default: Detailed Transactions
  const tips = await prisma.tip.findMany({
    where: {
      business_id: businessId,
      payment_status: PaymentStatus.SUCCESS,
      ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter }),
    },
    include: {
      employee: { select: { first_name: true, last_name: true } },
      table: { select: { name: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  const headers = [
    'İşlem ID',
    'Tarih',
    'Saat',
    `Tutar (${currency})`,
    'Para Birimi',
    'Ödeme Yöntemi',
    'Durum',
    'Personel',
    'Masa / Alan',
    'Referans Kodu',
  ];

  const rows = tips.map((t) => {
    const d = new Date(t.created_at);
    const dateStr = d.toISOString().slice(0, 10);
    const timeStr = d.toTimeString().slice(0, 5);
    const empName = t.employee
      ? `${t.employee.first_name} ${t.employee.last_name || ''}`.trim()
      : 'İşletme Havuzu';
    const tableName = t.table?.name || 'Genel';
    const refCode = t.provider_transaction_id || '—';

    return [
      `"${t.id}"`,
      `"${dateStr}"`,
      `"${timeStr}"`,
      Number(t.amount).toFixed(2),
      `"${t.currency || currency}"`,
      `"${t.payment_method}"`,
      `"${t.payment_status}"`,
      `"${empName}"`,
      `"${tableName}"`,
      `"${refCode}"`,
    ].join(delimiter);
  });

  const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows].join('\r\n');
  const safeBizName = businessName.replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, '_');
  const filename = `${safeBizName}_Bahsis_Islem_Raporu_${new Date().toISOString().slice(0, 10)}.csv`;
  return { filename, csv: csvContent };
}

export const analyticsService = {
  getBusinessAnalytics,
  getEmployeeAnalytics,
  exportTipsCsv,
};

