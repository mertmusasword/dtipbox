import prisma from '../utils/prisma';
import { PaymentStatus } from '@prisma/client';

export async function getBusinessAnalytics(businessId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Consider successful or unverified (bank transfer accepted for record) tips in metrics
  const validStatuses: PaymentStatus[] = [PaymentStatus.SUCCESS, PaymentStatus.UNVERIFIED];

  const [
    allTips,
    employeeCount,
    tableCount,
    qrCount,
    activePaymentMethodsCount,
    employees,
    tables,
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
  ]);

  let todayAmount = 0;
  let weeklyAmount = 0;
  let monthlyAmount = 0;
  let totalAmount = 0;

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
    totalAmount += amt;

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
  }

  const tipCount = allTips.length;
  const averageTip = tipCount > 0 ? Number((totalAmount / tipCount).toFixed(2)) : 0;

  return {
    todayTips: Number(todayAmount.toFixed(2)),
    weeklyTips: Number(weeklyAmount.toFixed(2)),
    monthlyTips: Number(monthlyAmount.toFixed(2)),
    totalTips: Number(totalAmount.toFixed(2)),
    tipCount,
    averageTip,
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
    recentTips: allTips.slice(0, 10).map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      currency: t.currency,
      payment_method: t.payment_method,
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

  const validStatuses: PaymentStatus[] = [PaymentStatus.SUCCESS, PaymentStatus.UNVERIFIED];

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

  for (const tip of tips) {
    const amt = Number(tip.amount);
    totalAmount += amt;

    const createdAt = new Date(tip.created_at);
    if (createdAt >= startOfToday) todayAmount += amt;
    if (createdAt >= startOfWeek) weeklyAmount += amt;
    if (createdAt >= startOfMonth) monthlyAmount += amt;
  }

  const tipCount = tips.length;
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
