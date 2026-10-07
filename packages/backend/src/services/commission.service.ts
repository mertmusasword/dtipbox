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
  status: 'CURRENT_OPEN' | 'PENDING_PAYMENT' | 'PENDING_VERIFICATION' | 'SETTLED';
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
    unverifiedTipsVolume: number;
    unverifiedTipsCount: number;
    platformFeeRate: number; // 0.50
    totalPlatformFee: number;
    cardPlatformFee: number;
    bankPlatformFeeTotal: number;
    bankPlatformFeeSettled: number;
    bankPlatformFeePending: number;
    currency: string;
    hasPendingDeclaration: boolean;
    pendingDeclarationDetails?: {
      declaredAt: string | Date;
      note?: string;
      declaredAmount: number;
      periodKey?: string;
    } | null;
  };
  monthlyPeriods: MonthlySettlementPeriod[];
  settlementIbanInfo: {
    companyName: string;
    taxOffice?: string;
    taxNumber?: string;
    bankName: string;
    iban: string;
    swiftCode?: string;
    fastAddress?: string;
    paymentReference: string;
    accounts?: Array<{
      currency: string;
      currencySymbol: string;
      label: string;
      companyName?: string;
      bankName: string;
      iban: string;
      swiftCode?: string;
      fastAddress?: string;
    }>;
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
  let totalTipsCount = 0;
  let unverifiedTipsVolume = 0;
  let unverifiedTipsCount = 0;
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
    const method = (tip.payment_method || '').toUpperCase();
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

    // CRITICAL BUSINESS RULE:
    // Platform fee (commission) applies ONLY to tips that have been successfully received and verified!
    // If an incoming tip is UNVERIFIED or PENDING, the venue has NOT verified receipt of funds yet.
    // Zero commission is accrued until the venue confirms the payment from their dashboard.
    if (tip.payment_status !== PaymentStatus.SUCCESS) {
      unverifiedTipsVolume += amt;
      unverifiedTipsCount += 1;
      continue;
    }

    const fee = Number(tip.platform_fee_amount) || Number((amt * 0.005).toFixed(2));

    totalTipsVolume += amt;
    totalTipsCount += 1;
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

  // Fetch settlement declaration status from audit logs
  const settlementLogs = await prisma.auditLog.findMany({
    where: {
      business_id: businessId,
      entity_type: 'COMMISSION_SETTLEMENT',
    },
    orderBy: { created_at: 'desc' },
    take: 5,
  });

  const latestLog = settlementLogs[0];
  const hasPendingDeclaration =
    Boolean(latestLog) && latestLog.action === 'COMMISSION_SETTLEMENT_DECLARED';
  const declarationMetadata = hasPendingDeclaration && latestLog.metadata ? (latestLog.metadata as any) : null;

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

    let status: 'CURRENT_OPEN' | 'PENDING_PAYMENT' | 'PENDING_VERIFICATION' | 'SETTLED' = 'SETTLED';
    const isPeriodDeclared =
      hasPendingDeclaration &&
      (declarationMetadata?.periodKey === pKey || declarationMetadata?.periodKey === 'ALL_PENDING' || !declarationMetadata?.periodKey);

    if (data.bankCommissionPending > 0.05 && isPeriodDeclared) {
      status = 'PENDING_VERIFICATION';
    } else if (pKey === currentPeriodKey) {
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
      totalTipsCount,
      unverifiedTipsVolume: Number(unverifiedTipsVolume.toFixed(2)),
      unverifiedTipsCount,
      platformFeeRate: 0.50,
      totalPlatformFee: Number(totalPlatformFee.toFixed(2)),
      cardPlatformFee: Number(cardPlatformFee.toFixed(2)),
      bankPlatformFeeTotal: Number(bankPlatformFeeTotal.toFixed(2)),
      bankPlatformFeeSettled: Number(bankPlatformFeeSettled.toFixed(2)),
      bankPlatformFeePending: Number(bankPlatformFeePending.toFixed(2)),
      currency: business.currency || 'TRY',
      hasPendingDeclaration,
      pendingDeclarationDetails: hasPendingDeclaration
        ? {
            declaredAt: latestLog.created_at,
            note: declarationMetadata?.note || '',
            declaredAmount: declarationMetadata?.declaredAmount || Number(bankPlatformFeePending.toFixed(2)),
            periodKey: declarationMetadata?.periodKey || 'ALL_PENDING',
          }
        : null,
    },
    monthlyPeriods,
    settlementIbanInfo: {
      companyName:
        business.currency === 'USD' || business.currency === 'EUR'
          ? (process.env.SETTLEMENT_COMPANY_NAME_INTL || process.env.SETTLEMENT_COMPANY_NAME_EN || 'Naponi Internet Alisveris Ve Magazacilik Ith. Ihr. Ltd. Sti.')
          : (process.env.SETTLEMENT_COMPANY_NAME || 'Naponi İnternet Alışveriş Ve Mağazacılık İth.İhr.Ltd.Şti.'),
      taxOffice: process.env.SETTLEMENT_TAX_OFFICE || '',
      taxNumber: process.env.SETTLEMENT_TAX_NUMBER || '',
      bankName:
        business.currency === 'USD'
          ? (process.env.SETTLEMENT_BANK_NAME_USD || 'Enpara Bank A.S.')
          : business.currency === 'EUR'
            ? (process.env.SETTLEMENT_BANK_NAME_EUR || 'Enpara Bank A.S.')
            : (process.env.SETTLEMENT_BANK_NAME || 'Enpara Bank A.Ş.'),
      iban:
        business.currency === 'USD'
          ? (process.env.SETTLEMENT_IBAN_USD || 'TR20 0015 7000 0000 0095 1325 08')
          : business.currency === 'EUR'
            ? (process.env.SETTLEMENT_IBAN_EUR || 'TR34 0015 7000 0000 0095 1325 47')
            : (process.env.SETTLEMENT_IBAN_TRY || 'TR45 0015 7000 0000 0084 2975 46'),
      swiftCode: process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
      fastAddress: process.env.SETTLEMENT_FAST_ADDRESS || 'destek@naponi.com',
      paymentReference: `NAP-${business.id.slice(0, 8).toUpperCase()}`,
      accounts: [
        {
          currency: 'TRY',
          currencySymbol: '₺',
          label: 'Türk Lirası (TL / FAST / EFT)',
          companyName: process.env.SETTLEMENT_COMPANY_NAME || 'Naponi İnternet Alışveriş Ve Mağazacılık İth.İhr.Ltd.Şti.',
          bankName: process.env.SETTLEMENT_BANK_NAME_TRY || process.env.SETTLEMENT_BANK_NAME || 'Enpara Bank A.Ş.',
          iban: process.env.SETTLEMENT_IBAN_TRY || 'TR45 0015 7000 0000 0084 2975 46',
          swiftCode: process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
          fastAddress: process.env.SETTLEMENT_FAST_ADDRESS || 'destek@naponi.com',
        },
        {
          currency: 'USD',
          currencySymbol: '$',
          label: 'US Dollar (USD / SWIFT)',
          companyName: process.env.SETTLEMENT_COMPANY_NAME_INTL || process.env.SETTLEMENT_COMPANY_NAME_EN || 'Naponi Internet Alisveris Ve Magazacilik Ith. Ihr. Ltd. Sti.',
          bankName: process.env.SETTLEMENT_BANK_NAME_USD || 'Enpara Bank A.S.',
          iban: process.env.SETTLEMENT_IBAN_USD || 'TR20 0015 7000 0000 0095 1325 08',
          swiftCode: process.env.SETTLEMENT_SWIFT_CODE_USD || process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
        },
        {
          currency: 'EUR',
          currencySymbol: '€',
          label: 'Euro (EUR / SWIFT)',
          companyName: process.env.SETTLEMENT_COMPANY_NAME_INTL || process.env.SETTLEMENT_COMPANY_NAME_EN || 'Naponi Internet Alisveris Ve Magazacilik Ith. Ihr. Ltd. Sti.',
          bankName: process.env.SETTLEMENT_BANK_NAME_EUR || 'Enpara Bank A.S.',
          iban: process.env.SETTLEMENT_IBAN_EUR || 'TR34 0015 7000 0000 0095 1325 47',
          swiftCode: process.env.SETTLEMENT_SWIFT_CODE_EUR || process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
        },
      ],
    },
  };
}

/**
 * Venue declares that they sent the wire transfer payment (Pending founder / admin verification)
 */
export async function declareBusinessSettlement(
  businessId: string,
  input: {
    periodKey?: string;
    note?: string;
    actorUserId?: string;
  }
) {
  const whereClause: any = {
    business_id: businessId,
    payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'FAST', 'IBAN_TRANSFER', 'HAVALE', 'EFT'] },
    is_settled: false,
    payment_status: PaymentStatus.SUCCESS,
  };

  if (input.periodKey && input.periodKey !== 'ALL_PENDING') {
    const [yStr, mStr] = input.periodKey.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    whereClause.created_at = { gte: startDate, lt: endDate };
  }

  const unsettledTips = await prisma.tip.findMany({
    where: whereClause,
    select: { amount: true, platform_fee_amount: true },
  });

  let declaredAmount = 0;
  for (const t of unsettledTips) {
    const amt = Number(t.amount);
    const fee = Number(t.platform_fee_amount) || Number((amt * 0.005).toFixed(2));
    declaredAmount += fee;
  }
  declaredAmount = Number(declaredAmount.toFixed(2));

  await createAuditLog({
    actorUserId: input.actorUserId,
    businessId,
    action: 'COMMISSION_SETTLEMENT_DECLARED',
    entityType: 'COMMISSION_SETTLEMENT',
    metadata: {
      periodKey: input.periodKey || 'ALL_PENDING',
      declaredAmount,
      note: input.note || '',
      status: 'PENDING_ADMIN_VERIFICATION',
      declaredAt: new Date().toISOString(),
    },
  });

  return {
    success: true,
    status: 'PENDING_VERIFICATION',
    declaredAmount,
    periodKey: input.periodKey || 'ALL_PENDING',
    message: 'Havale bildirimi alındı. Kurucu / Finans doğrulaması bekleniyor.',
  };
}

/**
 * Super Admin confirms venue settlement after verifying corporate bank account
 */
export async function confirmAdminVenueSettlement(
  businessId: string,
  adminUserId: string,
  periodKey?: string
) {
  const whereClause: any = {
    business_id: businessId,
    payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'FAST', 'IBAN_TRANSFER', 'HAVALE', 'EFT'] },
    is_settled: false,
    payment_status: PaymentStatus.SUCCESS,
  };

  if (periodKey && periodKey !== 'ALL_PENDING') {
    const [yStr, mStr] = periodKey.split('-');
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
    actorUserId: adminUserId,
    businessId,
    action: 'COMMISSION_SETTLEMENT_CONFIRMED',
    entityType: 'COMMISSION_SETTLEMENT',
    metadata: {
      periodKey: periodKey || 'ALL_PENDING',
      settledCount: result.count,
      confirmedAt: new Date().toISOString(),
    },
  });

  return {
    success: true,
    settledCount: result.count,
    periodKey: periodKey || 'ALL_PENDING',
  };
}

/**
 * Super Admin rejects venue settlement declaration if transfer not received
 */
export async function rejectAdminVenueSettlement(
  businessId: string,
  adminUserId: string,
  reason?: string
) {
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

  return {
    success: true,
    message: 'Havale bildirimi reddedildi.',
  };
}

/**
 * Automatically confirms commission settlement paid via Credit Card / Apple Pay (Lemon Squeezy)
 */
export async function settleCommissionViaCard(
  businessId: string,
  input: {
    periodKey?: string;
    paymentMethod: string;
    lemonSqueezyOrderId?: string;
    userEmail?: string;
    amount?: number;
    currency?: string;
  }
) {
  const whereClause: any = {
    business_id: businessId,
    payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'FAST', 'IBAN_TRANSFER', 'HAVALE', 'EFT'] },
    is_settled: false,
    payment_status: PaymentStatus.SUCCESS,
  };

  if (input.periodKey && input.periodKey !== 'ALL_PENDING') {
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
    businessId,
    action: 'COMMISSION_SETTLEMENT_CONFIRMED',
    entityType: 'COMMISSION_SETTLEMENT',
    metadata: {
      periodKey: input.periodKey || 'ALL_PENDING',
      settledCount: result.count,
      paymentMethod: 'CREDIT_CARD',
      lemonSqueezyOrderId: input.lemonSqueezyOrderId,
      userEmail: input.userEmail,
      amount: input.amount,
      currency: input.currency,
      confirmedAt: new Date().toISOString(),
      note: 'Lemon Squeezy kredi kartı / Apple Pay ile anında otomatik tahsil edildi.',
    },
  });

  return {
    success: true,
    settledCount: result.count,
    periodKey: input.periodKey || 'ALL_PENDING',
  };
}

// Backward compatibility alias: settleCommission now declares settlement for verification
export const settleCommission = declareBusinessSettlement;
