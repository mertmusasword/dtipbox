import prisma from '../utils/prisma';
import { PaymentStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';

export interface MonthlySettlementPeriod {
  periodKey: string; // e.g. '2026-10'
  year: number;
  month: number;
  totalTipsVolume: number;
  cardTipsVolume: number;
  bankTipsVolume: number;
  cashTipsVolume: number;
  totalTipsCount: number;
  commissionRate: number; // 0.50
  totalCommission: number;
  cardCommission: number; // collected at gateway
  bankCommissionTotal: number;
  bankCommissionSettled: number;
  bankCommissionPending: number;
  status: 'CURRENT_OPEN' | 'PENDING_PAYMENT' | 'SETTLED';
  dueDate: string; // e.g. '2026-11-15'
}

export interface BusinessCommissionsReport {
  business: {
    id: string;
    name: string;
    currency: string;
    isFounderMember: boolean;
    membershipPlan: string;
    joinedAt: Date;
  };
  summary: {
    totalTipsVolume: number;
    cardTipsVolume: number;
    bankTipsVolume: number;
    cashTipsVolume: number;
    totalTipsCount: number;
    platformFeeRate: number; // 0.50
    totalPlatformFee: number;
    cardPlatformFee: number;
    bankPlatformFeeTotal: number;
    bankPlatformFeeSettled: number;
    bankPlatformFeePending: number;
    currency: string;
  };
  monthlyPeriods: MonthlySettlementPeriod[];
  settlementIbanInfo: {
    companyName: string;
    taxOffice: string;
    taxNumber: string;
    bankName: string;
    iban: string;
    fastAddress: string;
    paymentReference: string;
  };
}

/**
 * Get comprehensive commission & wire transfer settlement report for a venue
 */
export async function getBusinessCommissionsReport(businessId: string): Promise<BusinessCommissionsReport> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      currency: true,
      is_founder_member: true,
      membership_plan: true,
      created_at: true,
    },
  });

  if (!business) {
    throw new Error('İşletme bulunamadı');
  }

  // Fetch all tips with financial relevance
  const tips = await prisma.tip.findMany({
    where: {
      business_id: businessId,
      payment_status: { in: [PaymentStatus.SUCCESS, PaymentStatus.UNVERIFIED, PaymentStatus.PENDING] },
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      payment_method: true,
      payment_status: true,
      platform_fee_rate: true,
      platform_fee_amount: true,
      is_settled: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });

  let totalTipsVolume = 0;
  let cardTipsVolume = 0;
  let bankTipsVolume = 0;
  let cashTipsVolume = 0;
  let totalPlatformFee = 0;
  let cardPlatformFee = 0;
  let bankPlatformFeeTotal = 0;
  let bankPlatformFeeSettled = 0;
  let bankPlatformFeePending = 0;

  // Group by YYYY-MM
  const monthMap = new Map<string, {
    totalTipsVolume: number;
    cardTipsVolume: number;
    bankTipsVolume: number;
    cashTipsVolume: number;
    totalTipsCount: number;
    totalCommission: number;
    cardCommission: number;
    bankCommissionTotal: number;
    bankCommissionSettled: number;
    bankCommissionPending: number;
  }>();

  const now = new Date();
  const currentPeriodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  for (const tip of tips) {
    const amt = Number(tip.amount);
    const fee = Number(tip.platform_fee_amount) || Number((amt * 0.005).toFixed(2));
    const method = (tip.payment_method || '').toUpperCase();
    const isBank = method === 'BANK_TRANSFER' || method === 'IBAN' || method === 'FAST';
    const isCash = method === 'CASH';
    const isCard = !isBank && !isCash;

    totalTipsVolume += amt;
    totalPlatformFee += fee;

    const createdAt = new Date(tip.created_at);
    const periodKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(periodKey)) {
      monthMap.set(periodKey, {
        totalTipsVolume: 0,
        cardTipsVolume: 0,
        bankTipsVolume: 0,
        cashTipsVolume: 0,
        totalTipsCount: 0,
        totalCommission: 0,
        cardCommission: 0,
        bankCommissionTotal: 0,
        bankCommissionSettled: 0,
        bankCommissionPending: 0,
      });
    }

    const m = monthMap.get(periodKey)!;
    m.totalTipsVolume += amt;
    m.totalTipsCount += 1;
    m.totalCommission += fee;

    if (isBank) {
      bankTipsVolume += amt;
      bankPlatformFeeTotal += fee;
      m.bankTipsVolume += amt;
      m.bankCommissionTotal += fee;

      if (tip.is_settled) {
        bankPlatformFeeSettled += fee;
        m.bankCommissionSettled += fee;
      } else {
        bankPlatformFeePending += fee;
        m.bankCommissionPending += fee;
      }
    } else if (isCash) {
      cashTipsVolume += amt;
      m.cashTipsVolume += amt;
    } else {
      cardTipsVolume += amt;
      cardPlatformFee += fee;
      m.cardTipsVolume += amt;
      m.cardCommission += fee;
    }
  }

  // Ensure current period exists even if no tips yet
  if (!monthMap.has(currentPeriodKey)) {
    monthMap.set(currentPeriodKey, {
      totalTipsVolume: 0,
      cardTipsVolume: 0,
      bankTipsVolume: 0,
      cashTipsVolume: 0,
      totalTipsCount: 0,
      totalCommission: 0,
      cardCommission: 0,
      bankCommissionTotal: 0,
      bankCommissionSettled: 0,
      bankCommissionPending: 0,
    });
  }

  const sortedPeriodKeys = Array.from(monthMap.keys()).sort().reverse();
  const monthlyPeriods: MonthlySettlementPeriod[] = sortedPeriodKeys.map((pKey) => {
    const data = monthMap.get(pKey)!;
    const [yStr, mStr] = pKey.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);

    // Due date is the 15th of next month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dueDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`;

    let status: 'CURRENT_OPEN' | 'PENDING_PAYMENT' | 'SETTLED' = 'SETTLED';
    if (pKey === currentPeriodKey) {
      status = 'CURRENT_OPEN';
    } else if (data.bankCommissionPending > 0.05) {
      status = 'PENDING_PAYMENT';
    } else {
      status = 'SETTLED';
    }

    return {
      periodKey: pKey,
      year,
      month,
      totalTipsVolume: Number(data.totalTipsVolume.toFixed(2)),
      cardTipsVolume: Number(data.cardTipsVolume.toFixed(2)),
      bankTipsVolume: Number(data.bankTipsVolume.toFixed(2)),
      cashTipsVolume: Number(data.cashTipsVolume.toFixed(2)),
      totalTipsCount: data.totalTipsCount,
      commissionRate: 0.50,
      totalCommission: Number(data.totalCommission.toFixed(2)),
      cardCommission: Number(data.cardCommission.toFixed(2)),
      bankCommissionTotal: Number(data.bankCommissionTotal.toFixed(2)),
      bankCommissionSettled: Number(data.bankCommissionSettled.toFixed(2)),
      bankCommissionPending: Number(data.bankCommissionPending.toFixed(2)),
      status,
      dueDate,
    };
  });

  return {
    business: {
      id: business.id,
      name: business.name,
      currency: business.currency || 'TRY',
      isFounderMember: business.is_founder_member,
      membershipPlan: business.membership_plan,
      joinedAt: business.created_at,
    },
    summary: {
      totalTipsVolume: Number(totalTipsVolume.toFixed(2)),
      cardTipsVolume: Number(cardTipsVolume.toFixed(2)),
      bankTipsVolume: Number(bankTipsVolume.toFixed(2)),
      cashTipsVolume: Number(cashTipsVolume.toFixed(2)),
      totalTipsCount: tips.length,
      platformFeeRate: 0.50,
      totalPlatformFee: Number(totalPlatformFee.toFixed(2)),
      cardPlatformFee: Number(cardPlatformFee.toFixed(2)),
      bankPlatformFeeTotal: Number(bankPlatformFeeTotal.toFixed(2)),
      bankPlatformFeeSettled: Number(bankPlatformFeeSettled.toFixed(2)),
      bankPlatformFeePending: Number(bankPlatformFeePending.toFixed(2)),
      currency: business.currency || 'TRY',
    },
    monthlyPeriods,
    settlementIbanInfo: {
      companyName: 'Naponi Dijital Teknoloji ve Ödeme Çözümleri A.Ş.',
      taxOffice: 'Beşiktaş V.D.',
      taxNumber: '6290887123',
      bankName: 'QNB Finansbank / Garanti BBVA',
      iban: 'TR56 0006 2000 0001 2990 0000 01',
      fastAddress: 'muhasebe@naponi.com',
      paymentReference: `NAP-${business.id.slice(0, 8).toUpperCase()}`,
    },
  };
}

/**
 * Record settlement confirmation for wire transfer commissions
 */
export async function settleCommission(
  businessId: string,
  input: {
    periodKey?: string;
    note?: string;
    actorUserId?: string;
  }
) {
  const whereClause: any = {
    business_id: businessId,
    payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'FAST'] },
    is_settled: false,
  };

  if (input.periodKey) {
    const [yStr, mStr] = input.periodKey.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    whereClause.created_at = { gte: startDate, lt: endDate };
  }

  const result = await prisma.tip.updateMany({
    where: whereClause,
    data: { is_settled: true },
  });

  await createAuditLog({
    actorUserId: input.actorUserId,
    businessId,
    action: 'COMMISSION_SETTLEMENT_RECORDED',
    entityType: 'TIP_COMMISSION',
    metadata: {
      periodKey: input.periodKey || 'ALL_PENDING',
      updatedCount: result.count,
      note: input.note,
    },
  });

  return {
    success: true,
    settledCount: result.count,
    periodKey: input.periodKey || 'ALL_PENDING',
  };
}
