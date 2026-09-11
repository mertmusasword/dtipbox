import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog, getAllAuditLogs } from './audit.service';

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
  });

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
    prisma.tip.findMany({
      where: { payment_status: 'SUCCESS' },
      select: { amount: true, currency: true },
    }),
  ]);

  // Aggregate platform volumes by currency
  const volumeByCurrency: Record<string, number> = {};
  for (const t of tipsVolume) {
    const curr = t.currency.toUpperCase();
    volumeByCurrency[curr] = (volumeByCurrency[curr] || 0) + Number(t.amount);
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
};
