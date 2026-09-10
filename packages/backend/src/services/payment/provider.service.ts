import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { providerRegistry } from './core/providerRegistry';
import { encryptJson, decryptJson, maskCredentials } from '../../utils/crypto.util';
import { createAuditLog } from '../audit.service';
import { ProviderCatalogStatus, ProviderRequestStatus, ProviderType, PaymentIntegrationStatus } from '@prisma/client';

export interface CatalogFilterOptions {
  country?: string;
  currency?: string;
  type?: string;
  search?: string;
}

export interface CreateProviderRequestDto {
  providerName: string;
  country: string;
  website?: string;
  paymentType: string;
  description?: string;
}

/**
 * Fetch provider catalog filtered by merchant country, currency, payment type, or search term.
 */
export async function getCatalog(filters: CatalogFilterOptions = {}) {
  // Ensure DB catalog is initialized
  const count = await prisma.paymentProvider.count();
  if (count === 0) {
    await providerRegistry.syncCatalogToDatabase();
  }

  const providers = await prisma.paymentProvider.findMany({
    orderBy: [
      { has_adapter: 'desc' },
      { status: 'asc' },
      { display_name: 'asc' },
    ],
  });

  return providers.filter((p) => {
    // Search query filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'ALL') {
      if (p.type !== filters.type) return false;
    }

    // Country filter
    if (filters.country && filters.country !== 'ALL') {
      const targetCountry = filters.country.toUpperCase();
      const matchesCountry =
        p.is_global ||
        p.countries.includes('*') ||
        p.countries.some((c) => c.toUpperCase() === targetCountry);
      if (!matchesCountry) return false;
    }

    // Currency filter
    if (filters.currency && filters.currency !== 'ALL') {
      const targetCurr = filters.currency.toUpperCase();
      const matchesCurr = p.supported_currencies.some((c) => c.toUpperCase() === targetCurr);
      if (!matchesCurr) return false;
    }

    return true;
  });
}

/**
 * Get all payment integrations configured for a business.
 * Masks credentials so secret keys are NEVER leaked in API responses.
 */
export async function getBusinessIntegrations(businessId: string) {
  const [integrations, providers] = await Promise.all([
    prisma.paymentIntegration.findMany({
      where: { business_id: businessId },
    }),
    prisma.paymentProvider.findMany(),
  ]);

  return integrations.map((integration) => {
    const providerMeta = providers.find((p) => p.id === integration.provider);
    let maskedCreds: Record<string, any> = {};
    let hasCredentials = false;

    if (integration.credentials_encrypted) {
      const decrypted = decryptJson(integration.credentials_encrypted);
      if (decrypted) {
        hasCredentials = true;
        maskedCreds = maskCredentials(decrypted);
      }
    }

    return {
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
      last_tested_at: integration.last_tested_at,
      last_error_message: integration.last_error_message,
      hasCredentials,
      credentials: maskedCreds,
      meta: providerMeta
        ? {
            display_name: providerMeta.display_name,
            type: providerMeta.type,
            description: providerMeta.description,
            capabilities: providerMeta.capabilities,
            required_credentials: providerMeta.required_credentials,
            has_adapter: providerMeta.has_adapter,
          }
        : null,
    };
  });
}

/**
 * Save provider credentials and execute automated testConnection.
 * Updates integration status to CONNECTED if verified, or ERROR if test fails.
 */
export async function testAndSaveIntegration(
  businessId: string,
  actorUserId: string,
  providerId: string,
  incomingCredentials: Record<string, any>
) {
  const providerKey = providerId.toLowerCase();
  const provider = await prisma.paymentProvider.findUnique({
    where: { id: providerKey },
  });

  if (!provider) {
    throw new AppError(`Payment provider '${providerId}' does not exist in platform catalog`, 404);
  }

  if (!provider.has_adapter || !providerRegistry.hasAdapter(providerKey)) {
    throw new AppError(
      `Integration for '${provider.display_name}' is currently in ${provider.status}. An automated code adapter is not yet available.`,
      400
    );
  }

  const adapter = providerRegistry.getAdapter(providerKey)!;

  // If business already has encrypted credentials and incoming credentials contain masked fields, merge them
  let effectiveCredentials = { ...incomingCredentials };
  const existingIntegration = await prisma.paymentIntegration.findUnique({
    where: {
      business_id_provider: {
        business_id: businessId,
        provider: providerKey,
      },
    },
  });

  if (existingIntegration?.credentials_encrypted) {
    const saved = decryptJson(existingIntegration.credentials_encrypted);
    if (saved) {
      for (const [k, v] of Object.entries(incomingCredentials)) {
        if (typeof v === 'string' && v.startsWith('••••••••')) {
          effectiveCredentials[k] = saved[k];
        }
      }
    }
  }

  // 1. Run connection test via adapter
  const testResult = await adapter.testConnection(effectiveCredentials);

  const nextStatus: PaymentIntegrationStatus = testResult.success
    ? PaymentIntegrationStatus.CONNECTED
    : PaymentIntegrationStatus.ERROR;

  // 2. Encrypt credentials at rest
  const encrypted = encryptJson(effectiveCredentials);

  // 3. Persist integration
  const integration = await prisma.paymentIntegration.upsert({
    where: {
      business_id_provider: {
        business_id: businessId,
        provider: providerKey,
      },
    },
    create: {
      business_id: businessId,
      provider: providerKey,
      status: nextStatus,
      credentials_encrypted: encrypted,
      last_tested_at: new Date(),
      last_error_message: testResult.success ? null : testResult.message,
    },
    update: {
      status: nextStatus,
      credentials_encrypted: encrypted,
      last_tested_at: new Date(),
      last_error_message: testResult.success ? null : testResult.message,
    },
  });

  // If connection failed, automatically deactivate payment method for this business to protect customers
  if (!testResult.success) {
    await prisma.paymentMethod.updateMany({
      where: {
        business_id: businessId,
        provider: providerKey,
      },
      data: { status: 'INACTIVE' },
    });
  }

  await createAuditLog({
    actorUserId,
    businessId,
    action: testResult.success ? 'PROVIDER_CONNECTION_SUCCESS' : 'PROVIDER_CONNECTION_FAILED',
    entityType: 'payment_integration',
    entityId: integration.id,
    metadata: {
      provider: providerKey,
      success: testResult.success,
      message: testResult.message,
    },
  });

  return {
    success: testResult.success,
    status: nextStatus,
    message: testResult.message,
    lastTestedAt: integration.last_tested_at,
  };
}

/**
 * Disconnect a provider integration and disable any associated payment method.
 */
export async function deleteIntegration(businessId: string, actorUserId: string, providerId: string) {
  const providerKey = providerId.toLowerCase();

  await prisma.paymentIntegration.deleteMany({
    where: {
      business_id: businessId,
      provider: providerKey,
    },
  });

  await prisma.paymentMethod.updateMany({
    where: {
      business_id: businessId,
      provider: providerKey,
    },
    data: { status: 'INACTIVE' },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'PROVIDER_INTEGRATION_DISCONNECTED',
    entityType: 'payment_integration',
    entityId: `${businessId}:${providerKey}`,
    metadata: { provider: providerKey },
  });

  return { success: true, message: `Provider '${providerId}' disconnected` };
}

/**
 * Submit a request when a merchant's desired provider is not listed.
 */
export async function submitProviderRequest(
  businessId: string,
  actorUserId: string,
  data: CreateProviderRequestDto
) {
  if (!data.providerName || !data.country || !data.paymentType) {
    throw new AppError('Provider name, country, and payment type are required', 400);
  }

  const reqRecord = await prisma.paymentProviderRequest.create({
    data: {
      business_id: businessId,
      provider_name: data.providerName.trim(),
      country: data.country.trim().toUpperCase(),
      website: data.website?.trim() || null,
      payment_type: data.paymentType.trim().toUpperCase(),
      description: data.description?.trim() || null,
      status: ProviderRequestStatus.PENDING,
    },
  });

  await createAuditLog({
    actorUserId,
    businessId,
    action: 'PAYMENT_PROVIDER_REQUESTED',
    entityType: 'payment_provider_request',
    entityId: reqRecord.id,
    metadata: {
      providerName: data.providerName,
      country: data.country,
      paymentType: data.paymentType,
    },
  });

  return reqRecord;
}

// ==================== ADMIN METHODS ====================

/**
 * Admin view of platform provider catalog with connected businesses count.
 */
export async function getAdminCatalog() {
  const count = await prisma.paymentProvider.count();
  if (count === 0) {
    await providerRegistry.syncCatalogToDatabase();
  }

  const providers = await prisma.paymentProvider.findMany({
    orderBy: [
      { has_adapter: 'desc' },
      { status: 'asc' },
      { display_name: 'asc' },
    ],
  });

  // Calculate connected business count for each provider
  const integrations = await prisma.paymentIntegration.groupBy({
    by: ['provider'],
    where: { status: 'CONNECTED' },
    _count: { business_id: true },
  });

  const countMap = new Map<string, number>();
  for (const item of integrations) {
    countMap.set(item.provider.toLowerCase(), item._count.business_id);
  }

  return providers.map((p) => ({
    ...p,
    connectedBusinessCount: countMap.get(p.id.toLowerCase()) || 0,
  }));
}

/**
 * Admin update provider status in catalog.
 * Strict rule: Admin CANNOT set status to ACTIVE if provider does not have an active code adapter.
 */
export async function updateProviderStatus(
  providerId: string,
  status: ProviderCatalogStatus,
  adminUserId: string
) {
  const provider = await prisma.paymentProvider.findUnique({
    where: { id: providerId.toLowerCase() },
  });

  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  if (status === ProviderCatalogStatus.ACTIVE && !provider.has_adapter) {
    throw new AppError(
      `Cannot activate provider '${provider.display_name}' as an active integration because it does not have an implemented code adapter.`,
      400
    );
  }

  const updated = await prisma.paymentProvider.update({
    where: { id: provider.id },
    data: { status },
  });

  await createAuditLog({
    actorUserId: adminUserId,
    action: 'ADMIN_PROVIDER_STATUS_UPDATED',
    entityType: 'payment_provider',
    entityId: provider.id,
    metadata: { oldStatus: provider.status, newStatus: status },
  });

  return updated;
}

/**
 * Admin view of merchant provider requests.
 */
export async function getAdminProviderRequests(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.paymentProviderRequest.findMany({
      skip,
      take: limit,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
            currency: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.paymentProviderRequest.count(),
  ]);

  return {
    requests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Admin update status of a merchant provider request (e.g. REVIEWED, PLANNED, REJECTED).
 */
export async function updateProviderRequestStatus(
  requestId: string,
  status: ProviderRequestStatus,
  adminUserId: string
) {
  const request = await prisma.paymentProviderRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError('Provider request not found', 404);
  }

  const updated = await prisma.paymentProviderRequest.update({
    where: { id: requestId },
    data: { status },
  });

  await createAuditLog({
    actorUserId: adminUserId,
    businessId: request.business_id,
    action: 'ADMIN_PROVIDER_REQUEST_STATUS_UPDATED',
    entityType: 'payment_provider_request',
    entityId: request.id,
    metadata: { status },
  });

  return updated;
}
