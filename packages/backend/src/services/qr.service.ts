import prisma from '../utils/prisma';
import { QrType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './audit.service';
import { generateShortToken } from '../utils/token';

interface CreateQrInput {
  table_id?: string;
  type?: QrType;
}

/**
 * Get all QR codes for a business.
 */
export async function getQrCodes(businessId: string) {
  return prisma.qrCode.findMany({
    where: { business_id: businessId },
    include: {
      table: { select: { id: true, name: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Create a new QR code with a crypto-random public token.
 */
export async function createQrCode(
  businessId: string,
  actorUserId: string,
  input: CreateQrInput
) {
  // Validate table ownership if provided
  if (input.table_id) {
    const table = await prisma.table.findFirst({
      where: { id: input.table_id, business_id: businessId },
    });
    if (!table) {
      throw new AppError('Table not found', 404);
    }
  }

  // Generate unique public token
  let publicToken: string;
  let attempts = 0;
  do {
    publicToken = generateShortToken();
    const existing = await prisma.qrCode.findUnique({
      where: { public_token: publicToken },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 5);

  if (attempts >= 5) {
    throw new AppError('Failed to generate unique token', 500);
  }

  const qrCode = await prisma.qrCode.create({
    data: {
      business_id: businessId,
      table_id: input.table_id,
      type: input.type || QrType.DTIPBOX,
      public_token: publicToken,
    },
    include: {
      table: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'QR_CREATED',
    entityType: 'qr_code',
    entityId: qrCode.id,
    metadata: { type: qrCode.type, tableId: input.table_id },
  });

  return qrCode;
}

/**
 * Delete a QR code.
 */
export async function deleteQrCode(
  qrCodeId: string,
  businessId: string,
  actorUserId: string
) {
  const existing = await prisma.qrCode.findFirst({
    where: { id: qrCodeId, business_id: businessId },
  });

  if (!existing) {
    throw new AppError('QR code not found', 404);
  }

  await prisma.qrCode.delete({ where: { id: qrCodeId } });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'QR_DELETED',
    entityType: 'qr_code',
    entityId: qrCodeId,
  });
}

/**
 * Get QR code by public token (public route — no auth needed).
 */
export async function getQrCodeByToken(publicToken: string) {
  const qrCode = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          logo: true,
          currency: true,
          country: true,
          is_active: true,
        },
      },
      table: { select: { id: true, name: true } },
    },
  });

  if (!qrCode || !qrCode.is_active) {
    throw new AppError('QR code not found or inactive', 404);
  }

  if (!qrCode.business.is_active) {
    throw new AppError('Business is not active', 404);
  }

  return qrCode;
}
