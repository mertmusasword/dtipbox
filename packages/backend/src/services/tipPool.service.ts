import prisma from '../utils/prisma';
import { TipDistributionMode, PosFeePayer } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export interface UpdateTipDistributionSettingsInput {
  tip_distribution_mode?: TipDistributionMode;
  pos_fee_payer?: PosFeePayer;
  custom_pos_fee_rate?: number;
  tax_deduction_enabled?: boolean;
  tax_deduction_rate?: number;
}

export async function getTipDistributionSettings(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      currency: true,
      tip_distribution_mode: true,
      pos_fee_payer: true,
      custom_pos_fee_rate: true,
      tax_deduction_enabled: true,
      tax_deduction_rate: true,
    },
  });

  if (!business) {
    throw new AppError('İşletme bulunamadı', 404);
  }

  return business;
}

export async function updateTipDistributionSettings(
  businessId: string,
  data: UpdateTipDistributionSettingsInput
) {
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      tip_distribution_mode: data.tip_distribution_mode,
      pos_fee_payer: data.pos_fee_payer,
      custom_pos_fee_rate: data.custom_pos_fee_rate !== undefined ? data.custom_pos_fee_rate : undefined,
      tax_deduction_enabled: data.tax_deduction_enabled,
      tax_deduction_rate: data.tax_deduction_rate !== undefined ? data.tax_deduction_rate : undefined,
    },
    select: {
      id: true,
      tip_distribution_mode: true,
      pos_fee_payer: true,
      custom_pos_fee_rate: true,
      tax_deduction_enabled: true,
      tax_deduction_rate: true,
    },
  });

  return updated;
}

export async function getTipPoolSimulation(
  businessId: string,
  options?: { startDate?: Date; endDate?: Date; activeEmployeeIds?: string[] }
) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      currency: true,
      tip_distribution_mode: true,
      pos_fee_payer: true,
      custom_pos_fee_rate: true,
      tax_deduction_enabled: true,
      tax_deduction_rate: true,
    },
  });

  if (!business) {
    throw new AppError('İşletme bulunamadı', 404);
  }

  // Check for the most recent settlement for this business
  const lastDistribution = await prisma.tipPoolDistribution.findFirst({
    where: { business_id: businessId },
    orderBy: { created_at: 'desc' },
    select: { id: true, created_at: true },
  });

  const isCustomRange = Boolean(options?.startDate || options?.endDate);
  const now = new Date();

  let periodStart: Date = options?.startDate || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  let periodEnd: Date = options?.endDate || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let tipsWhere: any;

  if (isCustomRange) {
    tipsWhere = {
      business_id: businessId,
      payment_status: 'SUCCESS',
      created_at: {
        gte: periodStart,
        lte: periodEnd,
      },
    };
  } else {
    // Default mode: all un-settled tips in the cashbox!
    tipsWhere = {
      business_id: businessId,
      payment_status: 'SUCCESS',
      is_settled: false,
    };
  }

  // Query COMPLETED tips
  const tips = await prisma.tip.findMany({
    where: tipsWhere,
    select: {
      id: true,
      amount: true,
      employee_id: true,
      created_at: true,
    },
    orderBy: { created_at: 'asc' },
  });

  if (!isCustomRange) {
    if (tips.length > 0) {
      periodStart = tips[0].created_at;
      periodEnd = tips[tips.length - 1].created_at;
    } else {
      periodStart = lastDistribution ? lastDistribution.created_at : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      periodEnd = now;
    }
  }

  let accumulationNote = 'Son Kasa Kapanışından Beri';
  if (!lastDistribution) {
    accumulationNote = 'İlk Kasa Kapanışı (Kasadaki tüm biriken bahşişler)';
  } else {
    const diffMs = now.getTime() - lastDistribution.created_at.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      accumulationNote = 'Son kasa kapanışından bu yana';
    } else {
      const diffDays = Math.max(1, Math.round(diffHours / 24));
      accumulationNote = `${diffDays} gündür biriken bahşişler (${diffHours} saat)`;
    }
  }

  const grossAmount = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
  const tipCount = tips.length;

  // POS Commission calculation
  const posFeeRate = business.custom_pos_fee_rate ? Number(business.custom_pos_fee_rate) : 2.90;
  let posFeeAmount = 0;
  if (business.pos_fee_payer === 'STAFF') {
    posFeeAmount = Number(((grossAmount * posFeeRate) / 100).toFixed(2));
  }

  // Tax/Accounting deduction calculation
  const taxDeductionEnabled = Boolean(business.tax_deduction_enabled);
  const taxFeeRate = business.tax_deduction_rate ? Number(business.tax_deduction_rate) : 0;
  let taxFeeAmount = 0;
  if (taxDeductionEnabled && taxFeeRate > 0) {
    const taxableBase = Math.max(0, grossAmount - posFeeAmount);
    taxFeeAmount = Number(((taxableBase * taxFeeRate) / 100).toFixed(2));
  }

  const netDistributedAmount = Math.max(0, Number((grossAmount - posFeeAmount - taxFeeAmount).toFixed(2)));

  // Fetch active employees
  const allEmployees = await prisma.employee.findMany({
    where: {
      business_id: businessId,
      is_active: true,
      deleted_at: null,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      position: true,
      role_title: true,
      share_weight: true,
    },
    orderBy: { first_name: 'asc' },
  });

  // Filter if specific participating employee IDs are provided
  const participatingEmployees = options?.activeEmployeeIds?.length
    ? allEmployees.filter((emp) => options.activeEmployeeIds!.includes(emp.id))
    : allEmployees;

  const mode = business.tip_distribution_mode;

  let employeeShares: Array<{
    employeeId: string;
    employeeName: string;
    position?: string | null;
    roleTitle?: string | null;
    shareWeight: number;
    grossShare: number;
    posFeeShare: number;
    taxFeeShare: number;
    netShare: number;
  }> = [];

  if (participatingEmployees.length === 0 || grossAmount === 0) {
    employeeShares = participatingEmployees.map((emp) => ({
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`.trim(),
      position: emp.position,
      roleTitle: emp.role_title,
      shareWeight: Number(emp.share_weight || 1.0),
      grossShare: 0,
      posFeeShare: 0,
      taxFeeShare: 0,
      netShare: 0,
    }));
  } else if (mode === 'EQUAL_POOL') {
    // Equal distribution among active participating employees
    const count = participatingEmployees.length;
    const grossPerPerson = Number((grossAmount / count).toFixed(2));
    const netPerPerson = Number((netDistributedAmount / count).toFixed(2));
    const posPerPerson = Number((posFeeAmount / count).toFixed(2));
    const taxPerPerson = Number((taxFeeAmount / count).toFixed(2));

    employeeShares = participatingEmployees.map((emp) => ({
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`.trim(),
      position: emp.position,
      roleTitle: emp.role_title,
      shareWeight: 1.0,
      grossShare: grossPerPerson,
      posFeeShare: posPerPerson,
      taxFeeShare: taxPerPerson,
      netShare: netPerPerson,
    }));
  } else if (mode === 'POINT_POOL') {
    // Weighted point/share distribution
    const totalPoints = participatingEmployees.reduce(
      (sum, emp) => sum + Math.max(0.1, Number(emp.share_weight || 1.0)),
      0
    );

    employeeShares = participatingEmployees.map((emp) => {
      const weight = Math.max(0.1, Number(emp.share_weight || 1.0));
      const ratio = weight / totalPoints;

      const empGross = Number((grossAmount * ratio).toFixed(2));
      const empNet = Number((netDistributedAmount * ratio).toFixed(2));
      const empPos = Number((posFeeAmount * ratio).toFixed(2));
      const empTax = Number((taxFeeAmount * ratio).toFixed(2));

      return {
        employeeId: emp.id,
        employeeName: `${emp.first_name} ${emp.last_name}`.trim(),
        position: emp.position,
        roleTitle: emp.role_title,
        shareWeight: weight,
        grossShare: empGross,
        posFeeShare: empPos,
        taxFeeShare: empTax,
        netShare: empNet,
      };
    });
  } else {
    // INDIVIDUAL: Direct tips to each employee + remainder distributed
    const empGrossMap = new Map<string, number>();
    let unassignedGross = 0;

    for (const tip of tips) {
      const amt = Number(tip.amount);
      if (tip.employee_id && participatingEmployees.some((e) => e.id === tip.employee_id)) {
        empGrossMap.set(tip.employee_id, (empGrossMap.get(tip.employee_id) || 0) + amt);
      } else {
        unassignedGross += amt;
      }
    }

    // Distribute unassigned table tips equally if any
    const extraPerPerson = participatingEmployees.length > 0 ? unassignedGross / participatingEmployees.length : 0;
    const deductionRatio = grossAmount > 0 ? netDistributedAmount / grossAmount : 1;

    employeeShares = participatingEmployees.map((emp) => {
      const directGross = empGrossMap.get(emp.id) || 0;
      const empGross = Number((directGross + extraPerPerson).toFixed(2));
      const empNet = Number((empGross * deductionRatio).toFixed(2));
      const empDeduction = Number((empGross - empNet).toFixed(2));

      return {
        employeeId: emp.id,
        employeeName: `${emp.first_name} ${emp.last_name}`.trim(),
        position: emp.position,
        roleTitle: emp.role_title,
        shareWeight: Number(emp.share_weight || 1.0),
        grossShare: empGross,
        posFeeShare: Number(((empDeduction * (posFeeAmount / Math.max(1, posFeeAmount + taxFeeAmount))) || 0).toFixed(2)),
        taxFeeShare: Number(((empDeduction * (taxFeeAmount / Math.max(1, posFeeAmount + taxFeeAmount))) || 0).toFixed(2)),
        netShare: empNet,
      };
    });
  }

  return {
    period: {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString(),
      accumulationNote,
      lastSettlementAt: lastDistribution ? lastDistribution.created_at.toISOString() : null,
      isAccumulated: !isCustomRange,
    },
    currency: business.currency,
    settings: {
      mode: business.tip_distribution_mode,
      posFeePayer: business.pos_fee_payer,
      posFeeRate,
      taxDeductionEnabled,
      taxFeeRate,
    },
    summary: {
      grossAmount,
      tipCount,
      posFeeAmount,
      taxFeeAmount,
      netDistributedAmount,
      participatingCount: participatingEmployees.length,
    },
    employees: employeeShares,
    tipIds: tips.map((t) => t.id),
  };
}

export async function settleTipPool(
  businessId: string,
  data: {
    startDate?: string;
    endDate?: string;
    notes?: string;
    activeEmployeeIds?: string[];
  }
) {
  const start = data.startDate ? new Date(data.startDate) : undefined;
  const end = data.endDate ? new Date(data.endDate) : undefined;

  const simulation = await getTipPoolSimulation(businessId, {
    startDate: start,
    endDate: end,
    activeEmployeeIds: data.activeEmployeeIds,
  });

  if (simulation.summary.grossAmount <= 0) {
    throw new AppError('Kasadaki dağıtılacak bahşiş tutarı 0. Dağıtılacak işlem bulunmamaktadır.', 400);
  }

  // Create distribution record and shares in transaction
  const result = await prisma.$transaction(async (tx) => {
    const distribution = await tx.tipPoolDistribution.create({
      data: {
        business_id: businessId,
        period_start: new Date(simulation.period.start),
        period_end: new Date(simulation.period.end),
        gross_amount: simulation.summary.grossAmount,
        pos_fee_amount: simulation.summary.posFeeAmount,
        tax_fee_amount: simulation.summary.taxFeeAmount,
        net_distributed_amount: simulation.summary.netDistributedAmount,
        notes: data.notes || null,
      },
    });

    const sharesData = simulation.employees.map((emp) => ({
      distribution_id: distribution.id,
      employee_id: emp.employeeId,
      share_weight: emp.shareWeight,
      gross_share: emp.grossShare,
      net_share: emp.netShare,
      is_paid: false,
    }));

    if (sharesData.length > 0) {
      await tx.tipPoolShare.createMany({
        data: sharesData,
      });
    }

    // Mark settled tips
    if (simulation.tipIds && simulation.tipIds.length > 0) {
      await tx.tip.updateMany({
        where: {
          id: { in: simulation.tipIds },
        },
        data: {
          is_settled: true,
          tip_pool_distribution_id: distribution.id,
        },
      });
    }

    return distribution;
  });

  return result;
}

export async function getTipPoolHistory(businessId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.tipPoolDistribution.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        shares: {
          include: {
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                position: true,
                role_title: true,
              },
            },
          },
        },
      },
    }),
    prisma.tipPoolDistribution.count({ where: { business_id: businessId } }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
