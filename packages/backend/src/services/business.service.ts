import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './audit.service';
import { AgreementStatus } from '@prisma/client';
import { MERCHANT_SERVICE_AGREEMENT_CODE } from '../templates/merchantAgreementText';

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
 * Onboarding checklist status, computed from real data (no extra storage).
 */
export async function getOnboardingStatus(businessId: string) {
  const [business, activeVersion, paymentAccount, activePaymentMethods, connectedIntegrations, qrCount, staffCount, tipsCount] =
    await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: { logo: true, external_payment_url: true },
      }),
      prisma.agreementVersion.findFirst({
        where: { agreement: { code: MERCHANT_SERVICE_AGREEMENT_CODE }, status: AgreementStatus.PUBLISHED },
        orderBy: { effective_date: 'desc' },
      }),
      prisma.businessPaymentAccount.findUnique({
        where: { business_id: businessId },
        select: { iban: true, account_number: true },
      }),
      prisma.paymentMethod.count({ where: { business_id: businessId, status: 'ACTIVE' } }),
      prisma.paymentIntegration.count({ where: { business_id: businessId, status: 'CONNECTED' } }),
      prisma.qrCode.count({ where: { business_id: businessId, is_active: true } }),
      prisma.employee.count({ where: { business_id: businessId, deleted_at: null } }),
      prisma.tip.count({ where: { business_id: businessId } }),
    ]);

  let agreementDone = true;
  if (activeVersion) {
    const acceptance = await prisma.agreementAcceptance.findUnique({
      where: {
        business_id_agreement_version_id: { business_id: businessId, agreement_version_id: activeVersion.id },
      },
    });
    agreementDone = !!acceptance;
  }

  const paymentDone =
    !!(paymentAccount?.iban || paymentAccount?.account_number) ||
    !!business?.external_payment_url ||
    connectedIntegrations > 0 ||
    activePaymentMethods > 0;

  const steps = [
    { key: 'agreement', done: agreementDone, required: true },
    { key: 'profile', done: !!business?.logo, required: false },
    { key: 'payment', done: paymentDone, required: true },
    { key: 'qr', done: qrCount > 0, required: true },
    { key: 'staff', done: staffCount > 0, required: false },
    { key: 'test', done: tipsCount > 0, required: false },
  ];

  return {
    steps,
    required_done: steps.filter((s) => s.required).every((s) => s.done),
    all_done: steps.every((s) => s.done),
  };
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

  const hasBankDetails = Boolean(
    (account.iban && account.iban.trim()) ||
    (account.account_number && account.account_number.trim())
  );
  const methodStatus = hasBankDetails ? 'ACTIVE' : 'INACTIVE';

  // When a payment account exists with bank details, automatically enable IBAN_TRANSFER payment method
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
      status: methodStatus,
    },
    update: {
      status: methodStatus,
    },
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
