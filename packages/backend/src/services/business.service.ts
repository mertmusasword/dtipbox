import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './audit.service';

interface UpdateBusinessInput {
  name?: string;
  logo?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  locale?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
}

interface PaymentAccountInput {
  country: string;
  account_holder_name: string;
  iban?: string;
  account_number?: string;
  routing_number?: string;
  sort_code?: string;
  swift_bic?: string;
  bank_name?: string;
}

/**
 * Get business by ID (with ownership check).
 */
export async function getBusiness(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
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
  });

  if (!business) {
    throw new AppError('Business not found', 404);
  }

  return business;
}

/**
 * Update business profile.
 */
export async function updateBusiness(
  businessId: string,
  userId: string,
  input: UpdateBusinessInput
) {
  const business = await prisma.business.update({
    where: { id: businessId },
    data: input,
  });

  await createAuditLog({
    actorUserId: userId,
    businessId,
    action: 'BUSINESS_UPDATED',
    entityType: 'business',
    entityId: businessId,
    metadata: { changes: Object.keys(input) },
  });

  return business;
}

/**
 * Create or update business payment account.
 */
export async function upsertPaymentAccount(
  businessId: string,
  userId: string,
  input: PaymentAccountInput
) {
  const account = await prisma.businessPaymentAccount.upsert({
    where: { business_id: businessId },
    create: {
      business_id: businessId,
      ...input,
    },
    update: input,
  });

  // When a payment account exists, auto-create IBAN_TRANSFER payment method if not exists
  await prisma.paymentMethod.upsert({
    where: {
      business_id_type: {
        business_id: businessId,
        type: 'IBAN_TRANSFER',
      },
    },
    create: {
      business_id: businessId,
      type: 'IBAN_TRANSFER',
      status: 'INACTIVE', // Business must manually activate
    },
    update: {}, // Don't change status if it already exists
  });

  await createAuditLog({
    actorUserId: userId,
    businessId,
    action: 'PAYMENT_ACCOUNT_UPDATED',
    entityType: 'business_payment_account',
    entityId: account.id,
  });

  return account;
}

/**
 * Get business payment account.
 */
export async function getPaymentAccount(businessId: string) {
  return prisma.businessPaymentAccount.findUnique({
    where: { business_id: businessId },
  });
}

/**
 * Delete business payment account.
 */
export async function deletePaymentAccount(businessId: string, userId: string) {
  const existing = await prisma.businessPaymentAccount.findUnique({
    where: { business_id: businessId },
  });

  if (!existing) {
    throw new AppError('Payment account not found', 404);
  }

  await prisma.businessPaymentAccount.delete({
    where: { business_id: businessId },
  });

  // Deactivate IBAN payment method
  await prisma.paymentMethod.updateMany({
    where: { business_id: businessId, type: 'IBAN_TRANSFER' },
    data: { status: 'INACTIVE' },
  });

  await createAuditLog({
    actorUserId: userId,
    businessId,
    action: 'PAYMENT_ACCOUNT_DELETED',
    entityType: 'business_payment_account',
    entityId: existing.id,
  });
}
