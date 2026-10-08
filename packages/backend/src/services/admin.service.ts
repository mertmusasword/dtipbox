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
            employees: { where: { deleted_at: null } },
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

export async function getAdminCommissionsAndRevenue(
  page: number = 1,
  limit: number = 50,
  filter?: string,
  search?: string
) {
  const [allTips, totalVenues, founderVenuesCount, allBusinesses, declarationLogs] = await Promise.all([
    prisma.tip.findMany({
      where: { payment_status: 'SUCCESS' },
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
    prisma.business.findMany({
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
    prisma.auditLog.findMany({
      where: {
        entity_type: 'COMMISSION_SETTLEMENT',
      },
      orderBy: { created_at: 'desc' },
    }),
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
    const fee = Number(t.platform_fee_amount) || Number((amt * 0.035).toFixed(2));
    const method = (t.payment_method || '').toUpperCase();
    const isBank =
      method === 'BANK_TRANSFER' ||
      method === 'IBAN' ||
      method === 'IBAN_TRANSFER' ||
      method === 'FAST' ||
      method === 'HAVALE' ||
      method === 'EFT' ||
      method.includes('IBAN') ||
      method.includes('BANK') ||
      method.includes('HAVALE');
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

  const declarationMap = new Map<string, any>();
  for (const log of declarationLogs) {
    if (!declarationMap.has(log.business_id!)) {
      if (log.action === 'COMMISSION_SETTLEMENT_DECLARED') {
        declarationMap.set(log.business_id!, {
          declaredAt: log.created_at,
          ...(log.metadata as any || {}),
        });
      } else {
        declarationMap.set(log.business_id!, null);
      }
    }
  }

  const allVenueRows = allBusinesses.map((b) => {
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

    const pendingDecl = declarationMap.get(b.id);
    let settlementStatus: 'PENDING' | 'PENDING_VERIFICATION' | 'SETTLED' = 'SETTLED';
    if (pendingDecl) {
      settlementStatus = 'PENDING_VERIFICATION';
    } else if (stats.bankCommissionPending > 0.05) {
      settlementStatus = 'PENDING';
    }

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
      settlementStatus,
      hasPendingDeclaration: Boolean(pendingDecl),
      pendingDeclaration: pendingDecl || null,
    };
  });

  // Calculate category counts across all venues before filtering
  let pendingVerificationCount = 0;
  let pendingCollectionCount = 0;
  let settledCount = 0;

  for (const v of allVenueRows) {
    if (v.hasPendingDeclaration) {
      pendingVerificationCount++;
    } else if (v.settlementStatus === 'PENDING') {
      pendingCollectionCount++;
    } else {
      settledCount++;
    }
  }

  // Priority sorting:
  // 1. Pending verification declarations at the VERY TOP (action required!)
  // 2. Pending collections next (highest pending commission first)
  // 3. Settled / clean accounts last (newest first)
  allVenueRows.sort((a, b) => {
    if (a.hasPendingDeclaration && !b.hasPendingDeclaration) return -1;
    if (!a.hasPendingDeclaration && b.hasPendingDeclaration) return 1;

    const aIsPending = a.settlementStatus === 'PENDING';
    const bIsPending = b.settlementStatus === 'PENDING';
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;

    if (aIsPending && bIsPending) {
      return b.bankCommissionPending - a.bankCommissionPending;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Apply filters
  let filteredRows = allVenueRows;

  if (filter && filter !== 'ALL') {
    const f = filter.toUpperCase();
    if (f === 'PENDING_VERIFICATION' || f === 'DECLARED' || f === 'ONAY_BEKLEYEN') {
      filteredRows = filteredRows.filter((v) => v.hasPendingDeclaration);
    } else if (f === 'PENDING' || f === 'TAHSILAT_BEKLEYEN') {
      filteredRows = filteredRows.filter((v) => v.settlementStatus === 'PENDING');
    } else if (f === 'SETTLED' || f === 'MUTABIK') {
      filteredRows = filteredRows.filter((v) => v.settlementStatus === 'SETTLED');
    }
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    filteredRows = filteredRows.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        (v.ownerEmail && v.ownerEmail.toLowerCase().includes(term))
    );
  }

  const total = filteredRows.length;
  const skip = (page - 1) * limit;
  const pagedRows = filteredRows.slice(skip, skip + limit);

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
      pendingVerificationCount,
      pendingCollectionCount,
      settledCount,
    },
    venues: pagedRows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function confirmAdminVenueSettlement(businessId: string, adminUserId: string) {
  const result = await prisma.tip.updateMany({
    where: {
      business_id: businessId,
      payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'FAST', 'IBAN_TRANSFER', 'HAVALE', 'EFT'] },
      is_settled: false,
    },
    data: { is_settled: true },
  });

  await createAuditLog({
    actorUserId: adminUserId,
    businessId,
    action: 'COMMISSION_SETTLEMENT_CONFIRMED',
    entityType: 'COMMISSION_SETTLEMENT',
    metadata: {
      action: 'ADMIN_VENUE_SETTLEMENT_CONFIRMED',
      settledCount: result.count,
      confirmedAt: new Date().toISOString(),
    },
  });

  return { success: true, count: result.count };
}

export async function rejectAdminVenueSettlement(businessId: string, adminUserId: string, reason?: string) {
  await createAuditLog({
    actorUserId: adminUserId,
    businessId,
    action: 'COMMISSION_SETTLEMENT_REJECTED',
    entityType: 'COMMISSION_SETTLEMENT',
    metadata: {
      reason: reason || 'Banka hesabında eşleşen havale transferi tespit edilemedi.',
      rejectedAt: new Date().toISOString(),
    },
  });

  return { success: true, message: 'Havale bildirimi reddedildi.' };
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
  rejectAdminVenueSettlement,
};
