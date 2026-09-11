import prisma from '../utils/prisma';
import { CorporateApplicationStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export interface CreateCorporateApplicationInput {
  companyName?: string;
  company_name?: string;
  contactName?: string;
  contact_name?: string;
  phone: string;
  email: string;
  sector: string;
  branchCount?: string | number;
  branch_count?: string | number;
  message?: string;
  ipAddress?: string;
  ip_address?: string;
}

export async function createCorporateApplication(data: CreateCorporateApplicationInput) {
  const cleanEmail = data.email.toLowerCase().trim();
  const cleanPhone = data.phone.trim();
  const cleanCompany = (data.companyName || data.company_name || '').trim();
  const cleanContact = (data.contactName || data.contact_name || '').trim();
  const cleanSector = data.sector.trim();
  const rawBranchCount = data.branchCount ?? data.branch_count ?? '1';
  const cleanBranchCount = String(rawBranchCount).trim();
  const cleanMessage = data.message?.trim() || null;
  const ip = data.ipAddress || data.ip_address || null;

  if (!cleanCompany || !cleanContact || !cleanEmail || !cleanPhone || !cleanSector) {
    throw new AppError('Lütfen tüm zorunlu alanları doldurunuz', 400);
  }

  // Anti-Spam & Duplicate Check: prevent rapid resubmissions from same email/phone within 60 seconds
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  const recentSubmission = await prisma.corporateApplication.findFirst({
    where: {
      OR: [
        { email: cleanEmail },
        { phone: cleanPhone },
        { company_name: { equals: cleanCompany, mode: 'insensitive' } },
      ],
      created_at: { gte: sixtySecondsAgo },
    },
  });

  if (recentSubmission) {
    // Return existing submission gracefully without creating duplicate
    return {
      ...recentSubmission,
      isDuplicate: true,
    };
  }

  const application = await prisma.corporateApplication.create({
    data: {
      company_name: cleanCompany,
      contact_name: cleanContact,
      phone: cleanPhone,
      email: cleanEmail,
      sector: cleanSector,
      branch_count: cleanBranchCount,
      message: cleanMessage,
      status: CorporateApplicationStatus.NEW,
      ip_address: ip,
    },
  });

  return {
    ...application,
    isDuplicate: false,
  };
}

export async function getCorporateApplications(
  page = 1,
  limit = 20,
  status?: CorporateApplicationStatus
) {
  const skip = (page - 1) * limit;
  const where = status && status !== ('ALL' as any) ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.corporateApplication.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.corporateApplication.count({ where }),
  ]);

  const countsByStatus = await prisma.corporateApplication.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const statusCounts: Record<string, number> = {
    ALL: 0,
    NEW: 0,
    CONTACTED: 0,
    IN_DISCUSSION: 0,
    COMPLETED: 0,
    REJECTED: 0,
  };

  let allTotal = 0;
  for (const c of countsByStatus) {
    statusCounts[c.status] = c._count._all;
    allTotal += c._count._all;
  }
  statusCounts.ALL = allTotal;

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    statusCounts,
    stats: statusCounts,
  };
}

export async function updateCorporateApplicationStatus(
  id: string,
  status: CorporateApplicationStatus,
  adminNotes?: string
) {
  const existing = await prisma.corporateApplication.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Kurumsal başvuru bulunamadı', 404);
  }

  const updated = await prisma.corporateApplication.update({
    where: { id },
    data: {
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
    },
  });

  return updated;
}

export async function deleteCorporateApplication(id: string) {
  const existing = await prisma.corporateApplication.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Kurumsal başvuru bulunamadı', 404);
  }

  await prisma.corporateApplication.delete({ where: { id } });
  return { success: true };
}

export const corporateService = {
  createCorporateApplication,
  getCorporateApplications,
  updateCorporateApplicationStatus,
  deleteCorporateApplication,
};

export default corporateService;
