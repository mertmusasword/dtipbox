import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog, getAllAuditLogs } from './audit.service';
import { invalidateUserAuthCache } from '../middleware/auth';

export async function getAdminBusinesses(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      skip,
      take: limit,
      include: {
        owner: { select: { id: true, email: true, role: true } },
        payment_account: true,
        _count: {
          select: {
            employees: true,
            tables: true,
            qr_codes: true,
            tips: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.business.count(),
  ]);

  return { businesses, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAdminBusinessDetails(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      owner: { select: { id: true, email: true } },
      payment_account: true,
      employees: {
        where: { deleted_at: null },
        include: { user: { select: { id: true, email: true } } },
      },
      tables: true,
      qr_codes: true,
      payment_methods: true,
      payment_integrations: true,
      _count: { select: { tips: true } },
    },
  });

  if (!business) {
    throw new AppError('Business not found', 404);
  }

  return business;
}

export async function toggleBusinessStatus(businessId: string, isActive: boolean, adminUserId: string) {
  const business = await prisma.business.update({
    where: { id: businessId },
    data: { is_active: isActive },
    include: {
      owner: { select: { id: true } },
      employees: { select: { user_id: true } },
    },
  });

  // Security: Invalidate auth cache immediately so active/inactive state takes effect on the next request
  if (business.owner?.id) {
    invalidateUserAuthCache(business.owner.id);
  }
  for (const emp of business.employees) {
    if (emp.user_id) {
      invalidateUserAuthCache(emp.user_id);
    }
  }

  await createAuditLog({
    actorUserId: adminUserId,
    businessId,
    action: isActive ? 'ADMIN_BUSINESS_ACTIVATED' : 'ADMIN_BUSINESS_DEACTIVATED',
    entityType: 'business',
    entityId: businessId,
    metadata: { is_active: isActive },
  });

  return business;
}

export async function getAdminPlatformStatistics() {
  const [
    totalBusinesses,
    activeBusinesses,
    totalEmployees,
    totalQrs,
    totalTips,
    tipsVolume,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { is_active: true } }),
    prisma.employee.count({ where: { deleted_at: null } }),
    prisma.qrCode.count(),
    prisma.tip.count({ where: { payment_status: 'SUCCESS' } }),
    prisma.tip.groupBy({
      by: ['currency'],
      where: { payment_status: 'SUCCESS' },
      _sum: { amount: true },
    }),
  ]);

  // Aggregate platform volumes by currency directly via SQL engine
  const volumeByCurrency: Record<string, number> = {};
  for (const t of tipsVolume) {
    const curr = t.currency.toUpperCase();
    volumeByCurrency[curr] = Number(t._sum.amount || 0);
  }

  return {
    totalBusinesses,
    activeBusinesses,
    totalEmployees,
    totalQrs,
    totalTips,
    volumeByCurrency,
  };
}

export async function getAdminPayments(page: number = 1, limit: number = 30) {
  const skip = (page - 1) * limit;

  const [tips, total] = await Promise.all([
    prisma.tip.findMany({
      skip,
      take: limit,
      include: {
        business: { select: { id: true, name: true, currency: true } },
        employee: { select: { id: true, first_name: true, last_name: true } },
        table: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.tip.count(),
  ]);

  return { tips, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAdminEmployees(page: number = 1, limit: number = 30) {
  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      skip,
      take: limit,
      where: { deleted_at: null },
      include: {
        business: { select: { id: true, name: true, currency: true } },
        user: { select: { id: true, email: true } },
        _count: { select: { tips: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.employee.count({ where: { deleted_at: null } }),
  ]);

  return { employees, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAdminQrs(page: number = 1, limit: number = 30) {
  const skip = (page - 1) * limit;

  const [qrCodes, total] = await Promise.all([
    prisma.qrCode.findMany({
      skip,
      take: limit,
      include: {
        business: { select: { id: true, name: true } },
        table: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.qrCode.count(),
  ]);

  return { qrCodes, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAdminCommissionsAndRevenue(page: number = 1, limit: number = 30) {
  const skip = (page - 1) * limit;

  const [allTips, totalVenues, founderVenuesCount] = await Promise.all([
    prisma.tip.findMany({
      where: { payment_status: { in: ['SUCCESS', 'UNVERIFIED', 'PENDING'] } },
      select: {
        id: true,
        business_id: true,
        amount: true,
        currency: true,
        payment_method: true,
        platform_fee_rate: true,
        platform_fee_amount: true,
        is_settled: true,
        created_at: true,
      },
    }),
    prisma.business.count(),
    prisma.business.count({ where: { is_founder_member: true } }),
  ]);

  let totalVolume = 0;
  let cardVolume = 0;
  let bankVolume = 0;
  let cashVolume = 0;
  let totalPlatformRevenue = 0;
  let cardRevenueCollected = 0;
  let bankRevenueTotal = 0;
  let bankRevenueSettled = 0;
  let bankRevenuePending = 0;

  const venueStatsMap = new Map<string, {
    totalVolume: number;
    cardVolume: number;
    bankVolume: number;
    cashVolume: number;
    tipCount: number;
    totalCommission: number;
    cardCommission: number;
    bankCommissionTotal: number;
    bankCommissionSettled: number;
    bankCommissionPending: number;
  }>();

  for (const t of allTips) {
    const amt = Number(t.amount);
    const fee = Number(t.platform_fee_amount) || Number((amt * 0.005).toFixed(2));
    const method = (t.payment_method || '').toUpperCase();
    const isBank = method === 'BANK_TRANSFER' || method === 'IBAN' || method === 'FAST';
    const isCash = method === 'CASH';
    const isCard = !isBank && !isCash;

    totalVolume += amt;
    totalPlatformRevenue += fee;

    if (!venueStatsMap.has(t.business_id)) {
      venueStatsMap.set(t.business_id, {
        totalVolume: 0,
        cardVolume: 0,
        bankVolume: 0,
        cashVolume: 0,
        tipCount: 0,
        totalCommission: 0,
        cardCommission: 0,
        bankCommissionTotal: 0,
        bankCommissionSettled: 0,
        bankCommissionPending: 0,
      });
    }
    const vs = venueStatsMap.get(t.business_id)!;
    vs.totalVolume += amt;
    vs.tipCount += 1;
    vs.totalCommission += fee;

    if (isBank) {
      bankVolume += amt;
      bankRevenueTotal += fee;
      vs.bankVolume += amt;
      vs.bankCommissionTotal += fee;

      if (t.is_settled) {
        bankRevenueSettled += fee;
        vs.bankCommissionSettled += fee;
      } else {
        bankRevenuePending += fee;
        vs.bankCommissionPending += fee;
      }
    } else if (isCash) {
      cashVolume += amt;
      vs.cashVolume += amt;
    } else {
      cardVolume += amt;
      cardRevenueCollected += fee;
      vs.cardVolume += amt;
      vs.cardCommission += fee;
    }
  }

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        country: true,
        currency: true,
        is_founder_member: true,
        membership_plan: true,
        membership_status: true,
        is_active: true,
        created_at: true,
        owner: { select: { id: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.business.count(),
  ]);

  const venueRows = businesses.map((b) => {
    const stats = venueStatsMap.get(b.id) || {
      totalVolume: 0,
      cardVolume: 0,
      bankVolume: 0,
      cashVolume: 0,
      tipCount: 0,
      totalCommission: 0,
      cardCommission: 0,
      bankCommissionTotal: 0,
      bankCommissionSettled: 0,
      bankCommissionPending: 0,
    };

    return {
      id: b.id,
      name: b.name,
      country: b.country,
      currency: b.currency || 'TRY',
      isFounderMember: b.is_founder_member,
      membershipPlan: b.membership_plan,
      membershipStatus: b.membership_status,
      isActive: b.is_active,
      createdAt: b.created_at,
      ownerEmail: b.owner?.email,
      totalVolume: Number(stats.totalVolume.toFixed(2)),
      cardVolume: Number(stats.cardVolume.toFixed(2)),
      bankVolume: Number(stats.bankVolume.toFixed(2)),
      tipCount: stats.tipCount,
      totalCommission: Number(stats.totalCommission.toFixed(2)),
      cardCommission: Number(stats.cardCommission.toFixed(2)),
      bankCommissionPending: Number(stats.bankCommissionPending.toFixed(2)),
      bankCommissionSettled: Number(stats.bankCommissionSettled.toFixed(2)),
      settlementStatus: stats.bankCommissionPending > 0.05 ? 'PENDING' : 'SETTLED',
    };
  });

  return {
    summary: {
      totalVolume: Number(totalVolume.toFixed(2)),
      cardVolume: Number(cardVolume.toFixed(2)),
      bankVolume: Number(bankVolume.toFixed(2)),
      cashVolume: Number(cashVolume.toFixed(2)),
      totalPlatformRevenue: Number(totalPlatformRevenue.toFixed(2)),
      cardRevenueCollected: Number(cardRevenueCollected.toFixed(2)),
      bankRevenueTotal: Number(bankRevenueTotal.toFixed(2)),
      bankRevenueSettled: Number(bankRevenueSettled.toFixed(2)),
      bankRevenuePending: Number(bankRevenuePending.toFixed(2)),
      totalVenues,
      founderVenuesCount,
      founderRatio: totalVenues > 0 ? Math.round((founderVenuesCount / totalVenues) * 100) : 0,
    },
    venues: venueRows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function confirmAdminVenueSettlement(businessId: string, adminUserId: string) {
  const result = await prisma.tip.updateMany({
    where: {
      business_id: businessId,
      payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'FAST'] },
      is_settled: false,
    },
    data: { is_settled: true },
  });

  await createAuditLog({
    actorUserId: adminUserId,
    businessId,
    action: 'ADMIN_VENUE_SETTLEMENT_CONFIRMED',
    entityType: 'BUSINESS_SETTLEMENT',
    metadata: {
      updatedTipsCount: result.count,
    },
  });

  return { success: true, count: result.count };
}

export const adminService = {
  getAdminBusinesses,
  getAdminBusinessDetails,
  toggleBusinessStatus,
  getAdminPlatformStatistics,
  getPlatformStatistics: getAdminPlatformStatistics,
  getAdminPayments,
  getAdminAuditLogs: getAllAuditLogs,
  getAdminEmployees,
  getAdminQrs,
  getAdminCommissionsAndRevenue,
  confirmAdminVenueSettlement,
};
