import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

interface AuditLogInput {
  actorUserId?: string;
  businessId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry. Fire-and-forget — never throws.
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actor_user_id: input.actorUserId,
        business_id: input.businessId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        metadata: input.metadata as any,
      },
    });
  } catch (error) {
    // Audit logs should never break the main flow
    console.error('[AUDIT] Failed to create audit log:', error);
  }
}

/**
 * Fetch audit logs for a business (paginated).
 */
export async function getAuditLogs(
  businessId: string,
  page: number = 1,
  limit: number = 50
) {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        actor: { select: { id: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where: { business_id: businessId } }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Fetch all audit logs (admin only).
 */
export async function getAllAuditLogs(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        actor: { select: { id: true, email: true, role: true } },
        business: { select: { id: true, name: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
