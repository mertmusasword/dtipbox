import prisma from '../utils/prisma';
import { PartnerApplicationStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { emailService } from './email.service';
import { logger } from '../utils/logger';

export interface CreatePartnerApplicationInput {
  companyName?: string;
  company_name?: string;
  website?: string;
  contactName?: string;
  contact_name?: string;
  email: string;
  phone?: string;
  companyType?: string;
  company_type?: string;
  customerCount?: string;
  customer_count?: string;
  countries?: string;
  integrationIdea?: string;
  integration_idea?: string;
  message?: string;
  ipAddress?: string;
  ip_address?: string;
}

export async function createPartnerApplication(data: CreatePartnerApplicationInput) {
  const cleanEmail = data.email.toLowerCase().trim();
  const cleanCompany = (data.companyName || data.company_name || '').trim();
  const cleanContact = (data.contactName || data.contact_name || '').trim();
  const cleanType = (data.companyType || data.company_type || '').trim();
  const cleanPhone = data.phone?.trim() || null;
  const cleanWebsite = data.website?.trim() || null;
  const cleanCustomerCount = (data.customerCount || data.customer_count || '').trim() || null;
  const cleanCountries = data.countries?.trim() || null;
  const cleanIntegrationIdea = (data.integrationIdea || data.integration_idea || '').trim() || null;
  const cleanMessage = data.message?.trim() || null;
  const ip = data.ipAddress || data.ip_address || null;

  if (!cleanCompany || !cleanContact || !cleanEmail || !cleanType) {
    throw new AppError('Lütfen tüm zorunlu alanları (Firma adı, yetkili kişi, e-posta ve firma türü) doldurunuz', 400);
  }

  // Anti-Spam & Duplicate Check: prevent rapid resubmissions within 60 seconds
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  const recentSubmission = await prisma.partnerApplication.findFirst({
    where: {
      OR: [
        { email: cleanEmail },
        { company_name: { equals: cleanCompany, mode: 'insensitive' } },
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
      ],
      created_at: { gte: sixtySecondsAgo },
    },
  });

  if (recentSubmission) {
    return {
      ...recentSubmission,
      isDuplicate: true,
    };
  }

  const application = await prisma.partnerApplication.create({
    data: {
      company_name: cleanCompany,
      website: cleanWebsite,
      contact_name: cleanContact,
      email: cleanEmail,
      phone: cleanPhone,
      company_type: cleanType,
      customer_count: cleanCustomerCount,
      countries: cleanCountries,
      integration_idea: cleanIntegrationIdea,
      message: cleanMessage,
      status: PartnerApplicationStatus.NEW,
      ip_address: ip,
    },
  });

  // 1. Asynchronously notify Admin at info@naponi.com
  emailService
    .sendPartnerApplicationAdminNotificationEmail({
      applicationId: application.id,
      companyName: application.company_name,
      contactName: application.contact_name,
      email: application.email,
      phone: application.phone,
      website: application.website,
      companyType: application.company_type,
      customerCount: application.customer_count,
      countries: application.countries,
      integrationIdea: application.integration_idea,
      message: application.message,
    })
    .catch((err) => {
      logger.error('Failed to send partner application admin notification email', 'PARTNER', {
        error: String(err),
        applicationId: application.id,
      });
    });

  // 2. Asynchronously send confirmation to the applicant
  emailService
    .sendPartnerApplicationConfirmationEmail({
      to: application.email,
      companyName: application.company_name,
      contactName: application.contact_name,
      applicationId: application.id,
    })
    .catch((err) => {
      logger.error('Failed to send partner application confirmation email', 'PARTNER', {
        error: String(err),
        applicationId: application.id,
      });
    });

  return {
    ...application,
    isDuplicate: false,
  };
}

export async function getPartnerApplications(
  page = 1,
  limit = 20,
  status?: PartnerApplicationStatus,
  search?: string
) {
  const skip = (page - 1) * limit;

  const where: Prisma.PartnerApplicationWhereInput = {};

  if (status && status !== ('ALL' as any)) {
    where.status = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { company_name: { contains: q, mode: 'insensitive' } },
      { contact_name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { company_type: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.partnerApplication.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.partnerApplication.count({ where }),
  ]);

  const countsByStatus = await prisma.partnerApplication.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const statusCounts: Record<string, number> = {
    ALL: 0,
    NEW: 0,
    REVIEWING: 0,
    CONTACTED: 0,
    INTEGRATION_DISCUSSION: 0,
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

export async function updatePartnerApplicationStatus(
  id: string,
  status: PartnerApplicationStatus,
  adminNotes?: string
) {
  const existing = await prisma.partnerApplication.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Partner başvurusu bulunamadı', 404);
  }

  const updated = await prisma.partnerApplication.update({
    where: { id },
    data: {
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
    },
  });

  return updated;
}

export async function deletePartnerApplication(id: string) {
  const existing = await prisma.partnerApplication.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Partner başvurusu bulunamadı', 404);
  }

  await prisma.partnerApplication.delete({ where: { id } });
  return { success: true };
}

export const partnerService = {
  createPartnerApplication,
  getPartnerApplications,
  updatePartnerApplicationStatus,
  deletePartnerApplication,
};

export default partnerService;
