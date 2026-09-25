import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './audit.service';

interface CreateTableInput {
  name: string;
}

interface UpdateTableInput {
  name?: string;
  is_active?: boolean;
}

/**
 * Get all tables for a business.
 */
export async function getTables(businessId: string) {
  return prisma.table.findMany({
    where: { business_id: businessId },
    include: {
      _count: { select: { qr_codes: true, tips: true } },
    },
    orderBy: { created_at: 'asc' },
  });
}

/**
 * Create a new table.
 */
export async function createTable(
  businessId: string,
  actorUserId: string,
  input: CreateTableInput
) {
  const trimmedName = input.name?.trim();
  if (!trimmedName) {
    throw new AppError('Table name is required', 400);
  }

  const duplicate = await prisma.table.findFirst({
    where: {
      business_id: businessId,
      name: { equals: trimmedName, mode: 'insensitive' },
    },
  });

  if (duplicate) {
    throw new AppError('A table with this name already exists in your business', 409);
  }

  const table = await prisma.table.create({
    data: {
      business_id: businessId,
      name: trimmedName,
    },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'TABLE_CREATED',
    entityType: 'table',
    entityId: table.id,
    metadata: { name: trimmedName },
  });

  return table;
}

/**
 * Update a table.
 */
export async function updateTable(
  tableId: string,
  businessId: string,
  actorUserId: string,
  input: UpdateTableInput
) {
  const existing = await prisma.table.findFirst({
    where: { id: tableId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Table not found', 404);
  }

  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new AppError('Table name cannot be empty', 400);
    }

    const duplicate = await prisma.table.findFirst({
      where: {
        business_id: businessId,
        id: { not: tableId },
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new AppError('A table with this name already exists in your business', 409);
    }

    input.name = trimmedName;
  }

  const table = await prisma.table.update({
    where: { id: tableId },
    data: input,
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'TABLE_UPDATED',
    entityType: 'table',
    entityId: tableId,
  });

  return table;
}

/**
 * Delete a table.
 */
export async function deleteTable(
  tableId: string,
  businessId: string,
  actorUserId: string
) {
  const existing = await prisma.table.findFirst({
    where: { id: tableId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Table not found', 404);
  }

  await prisma.table.delete({ where: { id: tableId } });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'TABLE_DELETED',
    entityType: 'table',
    entityId: tableId,
    metadata: { name: existing.name },
  });
}
