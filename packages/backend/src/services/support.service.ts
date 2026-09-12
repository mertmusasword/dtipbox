import prisma from '../utils/prisma';
import { SupportTicketStatus, SupportTicketCategory } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { emailService } from './email.service';
import { logger } from '../utils/logger';

export interface CreateSupportTicketInput {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  business_name?: string;
  category?: SupportTicketCategory;
  subject: string;
  message: string;
  userId?: string;
  user_id?: string;
  businessId?: string;
  business_id?: string;
  ipAddress?: string;
  ip_address?: string;
}

export async function createSupportTicket(data: CreateSupportTicketInput) {
  const cleanEmail = data.email.toLowerCase().trim();
  const cleanName = data.name.trim();
  const cleanSubject = data.subject.trim();
  const cleanMessage = data.message.trim();
  const cleanPhone = data.phone?.trim() || null;
  const cleanBusinessName = (data.businessName || data.business_name || '').trim() || null;
  const category = data.category || SupportTicketCategory.GENERAL_INQUIRY;
  const userId = data.userId || data.user_id || null;
  const businessId = data.businessId || data.business_id || null;
  const ip = data.ipAddress || data.ip_address || null;

  if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
    throw new AppError('Lütfen tüm zorunlu alanları doldurunuz', 400);
  }

  // 60-second anti-spam duplicate guard
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  const recentTicket = await prisma.supportTicket.findFirst({
    where: {
      email: cleanEmail,
      subject: { equals: cleanSubject, mode: 'insensitive' },
      created_at: { gte: sixtySecondsAgo },
    },
  });

  if (recentTicket) {
    return {
      ...recentTicket,
      isDuplicate: true,
    };
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      business_name: cleanBusinessName,
      category,
      subject: cleanSubject,
      message: cleanMessage,
      status: SupportTicketStatus.NEW,
      user_id: userId,
      business_id: businessId,
      ip_address: ip,
    },
  });

  // Asynchronously dispatch confirmation to user and notification to info@naponi.com
  Promise.allSettled([
    emailService.sendSupportTicketConfirmationEmail({
      to: cleanEmail,
      name: cleanName,
      ticketId: ticket.id,
      subject: cleanSubject,
      category: ticket.category,
      message: cleanMessage,
      businessName: cleanBusinessName || undefined,
    }),
    emailService.sendSupportTicketAdminNotificationEmail({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      businessName: cleanBusinessName || undefined,
      ticketId: ticket.id,
      subject: cleanSubject,
      category: ticket.category,
      message: cleanMessage,
    }),
  ]).catch((err) => {
    logger.error('Failed to dispatch support ticket emails', 'SUPPORT_TICKET', { error: String(err) });
  });

  return {
    ...ticket,
    isDuplicate: false,
  };
}

export async function getSupportTickets(
  page = 1,
  limit = 20,
  status?: SupportTicketStatus | 'ALL',
  category?: SupportTicketCategory | 'ALL',
  search?: string
) {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { business_name: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  // Aggregate counts by status
  const countsByStatus = await prisma.supportTicket.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const statusCounts: Record<string, number> = {
    ALL: 0,
    NEW: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  let allTotal = 0;
  for (const c of countsByStatus) {
    statusCounts[c.status] = c._count._all;
    allTotal += c._count._all;
  }
  statusCounts.ALL = allTotal;

  // Aggregate counts by category
  const countsByCategory = await prisma.supportTicket.groupBy({
    by: ['category'],
    _count: { _all: true },
  });

  const categoryCounts: Record<string, number> = {
    POS_INTEGRATION: 0,
    ACCOUNT_BILLING: 0,
    TECHNICAL_SUPPORT: 0,
    GENERAL_INQUIRY: 0,
    FEEDBACK_SUGGESTION: 0,
  };

  for (const c of countsByCategory) {
    categoryCounts[c.category] = c._count._all;
  }

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    statusCounts,
    categoryCounts,
  };
}

export async function updateSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
  adminNotes?: string
) {
  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Destek talebi bulunamadı', 404);
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: {
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
    },
  });

  return updated;
}

export async function deleteSupportTicket(id: string) {
  const existing = await prisma.supportTicket.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Destek talebi bulunamadı', 404);
  }

  await prisma.supportTicket.delete({ where: { id } });
  return { success: true };
}

export const supportService = {
  createSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
  deleteSupportTicket,
};

export default supportService;
