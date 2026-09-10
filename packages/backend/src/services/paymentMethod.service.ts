import prisma from '../utils/prisma';
import { PaymentMethodStatus, PaymentMethodType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from './audit.service';

/**
 * Get all payment methods for a business (with connection status).
 */
export async function getPaymentMethods(businessId: string) {
  const [methods, integrations, paymentAccount] = await Promise.all([
    prisma.paymentMethod.findMany({
      where: { business_id: businessId },
      orderBy: { type: 'asc' },
    }),
    prisma.paymentIntegration.findMany({
      where: { business_id: businessId },
    }),
    prisma.businessPaymentAccount.findUnique({
      where: { business_id: businessId },
    }),
  ]);

  // Build a unified view of payment methods with their availability
  const allTypes: PaymentMethodType[] = ['IBAN_TRANSFER', 'CARD', 'APPLE_PAY', 'GOOGLE_PAY'];

  return allTypes.map((type) => {
    const method = methods.find((m) => m.type === type);
    const isIban = type === 'IBAN_TRANSFER';

    let connectionStatus: 'CONNECTED' | 'NOT_CONNECTED';
    if (isIban) {
      connectionStatus = paymentAccount ? 'CONNECTED' : 'NOT_CONNECTED';
    } else {
      const integration = integrations.find((i) => i.provider === type);
      connectionStatus = integration?.status === 'CONNECTED' ? 'CONNECTED' : 'NOT_CONNECTED';
    }

    return {
      id: method?.id,
      type,
      status: method?.status || 'INACTIVE',
      connectionStatus,
      canActivate: connectionStatus === 'CONNECTED',
      provider: method?.provider,
      configuration: method?.configuration,
      created_at: method?.created_at,
      updated_at: method?.updated_at,
    };
  });
}

/**
 * Update payment method status (activate/deactivate).
 * Cannot activate if not connected.
 */
export async function updatePaymentMethodStatus(
  businessId: string,
  actorUserId: string,
  type: PaymentMethodType,
  status: PaymentMethodStatus
) {
  // Verify the method can be activated
  if (status === 'ACTIVE') {
    const isConnected = await checkConnection(businessId, type);
    if (!isConnected) {
      throw new AppError(
        `Cannot activate ${type}: payment provider is not connected`,
        400
      );
    }
  }

  const method = await prisma.paymentMethod.upsert({
    where: {
      business_id_type: {
        business_id: businessId,
        type,
      },
    },
    create: {
      business_id: businessId,
      type,
      status,
    },
    update: { status },
  });

  const action = status === 'ACTIVE'
    ? 'PAYMENT_METHOD_ACTIVATED'
    : 'PAYMENT_METHOD_DEACTIVATED';

  await createAuditLog({
    actorUserId,
    businessId,
    action,
    entityType: 'payment_method',
    entityId: method.id,
    metadata: { type, status },
  });

  return method;
}

/**
 * Check if a payment method type has its required connection.
 */
async function checkConnection(
  businessId: string,
  type: PaymentMethodType
): Promise<boolean> {
  if (type === 'IBAN_TRANSFER') {
    const account = await prisma.businessPaymentAccount.findUnique({
      where: { business_id: businessId },
    });
    return !!account;
  }

  // For provider-based methods, check integration status
  const integration = await prisma.paymentIntegration.findFirst({
    where: {
      business_id: businessId,
      provider: type,
      status: 'CONNECTED',
    },
  });

  return !!integration;
}

/**
 * Deactivate all payment methods for a business.
 */
export async function deactivateAllPaymentMethods(businessId: string, actorUserId: string) {
  await prisma.paymentMethod.updateMany({
    where: { business_id: businessId },
    data: { status: 'INACTIVE' },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'PAYMENT_METHODS_BULK_DEACTIVATED',
    entityType: 'payment_method',
    entityId: businessId,
    metadata: { allInactive: true },
  });

  return getPaymentMethods(businessId);
}

/**
 * Set provider integration status (e.g. CONNECTED / NOT_CONNECTED).
 * When integration becomes NOT_CONNECTED, associated payment method is automatically deactivated.
 */
export async function updateIntegrationStatus(
  businessId: string,
  actorUserId: string,
  provider: string,
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'ERROR',
  configuration?: any
) {
  const integration = await prisma.paymentIntegration.upsert({
    where: {
      business_id_provider: {
        business_id: businessId,
        provider,
      },
    },
    create: {
      business_id: businessId,
      provider,
      status,
      configuration: configuration || {},
    },
    update: {
      status,
      ...(configuration ? { configuration } : {}),
    },
  });

  // If disconnected, automatically deactivate the associated payment method to prevent invalid payments
  if (status !== 'CONNECTED') {
    await prisma.paymentMethod.updateMany({
      where: {
        business_id: businessId,
        type: provider as PaymentMethodType,
      },
      data: { status: 'INACTIVE' },
    });
  }

  await createAuditLog({
    actorUserId,
    businessId,
    action: `PAYMENT_INTEGRATION_${status}`,
    entityType: 'payment_integration',
    entityId: integration.id,
    metadata: { provider, status },
  });

  return integration;
}

/**
 * Get active payment methods for a business (public use — customer facing).
 * Only returns methods that are both ACTIVE by business choice AND CONNECTED at infrastructure level.
 */
export async function getActivePaymentMethods(businessId: string) {
  const methods = await getPaymentMethods(businessId);
  return methods.filter(
    (m) => m.status === 'ACTIVE' && m.connectionStatus === 'CONNECTED'
  );
}

/**
 * Get customer-facing payment methods catalog with usable / disabled statuses.
 * Shows customer which methods can be used (USABLE) vs which are disabled by business (DISABLED).
 */
export async function getCustomerPaymentMethodsCatalog(businessId: string) {
  const all = await getPaymentMethods(businessId);
  return all.map((m) => ({
    type: m.type,
    isUsable: m.status === 'ACTIVE' && m.connectionStatus === 'CONNECTED',
    status: (m.status === 'ACTIVE' && m.connectionStatus === 'CONNECTED') ? 'USABLE' : 'DISABLED',
    reason: m.connectionStatus !== 'CONNECTED'
      ? 'Not configured by business'
      : m.status !== 'ACTIVE'
      ? 'Currently disabled by business'
      : undefined,
  }));
}
