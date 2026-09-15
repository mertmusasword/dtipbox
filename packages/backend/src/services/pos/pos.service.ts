import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { encryptJson, decryptJson, maskCredentials } from '../../utils/crypto.util';
import { createAuditLog } from '../audit.service';
import { GLOBAL_POS_CATALOG, PosCatalogItem } from './core/posCatalog';
import { mockPosAdapter } from './adapters/mockPos.adapter';
import { IPosProvider } from './core/pos.interface';

// Registry of active POS adapters
const ADAPTER_MAP: Record<string, IPosProvider> = {
  mock_pos: mockPosAdapter,
};

export class PosService {
  /**
   * 1. Get filtered POS Catalog
   */
  getCatalog(filters: { country?: string; search?: string } = {}): PosCatalogItem[] {
    return GLOBAL_POS_CATALOG.filter((item) => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.display_name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.region_label.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Country filter
      if (filters.country && filters.country !== 'ALL') {
        const c = filters.country.toUpperCase();
        const matchCountry = item.countries.includes('*') || item.countries.includes(c);
        if (!matchCountry) return false;
      }

      return true;
    });
  }

  /**
   * 2. Get active POS connections for business
   */
  async getBusinessConnections(businessId: string) {
    const connections = await prisma.posConnection.findMany({
      where: { business_id: businessId },
      include: {
        employee_mappings: {
          include: {
            employee: {
              select: { id: true, first_name: true, last_name: true, role_title: true, avatar: true },
            },
          },
        },
        sync_logs: {
          take: 5,
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return connections.map((conn) => {
      let maskedCreds: Record<string, string> = {};
      if (conn.credentials_encrypted) {
        try {
          const raw = decryptJson<Record<string, any>>(conn.credentials_encrypted);
          maskedCreds = maskCredentials(raw);
        } catch {
          maskedCreds = { error: 'Unable to decrypt credentials' };
        }
      }

      const catalogDef = GLOBAL_POS_CATALOG.find((p) => p.id === conn.provider);

      return {
        id: conn.id,
        provider: conn.provider,
        providerName: catalogDef?.display_name || conn.provider,
        status: conn.status,
        branchId: conn.branch_id,
        externalAccountId: conn.external_account_id,
        externalLocationId: conn.external_location_id,
        locationName: conn.location_name,
        credentialsMasked: maskedCreds,
        configuration: conn.configuration,
        lastSyncAt: conn.last_sync_at,
        lastSyncStatus: conn.last_sync_status,
        lastErrorMessage: conn.last_error_message,
        createdAt: conn.created_at,
        employeeMappingsCount: conn.employee_mappings.length,
        mappedEmployeesCount: conn.employee_mappings.filter((m) => m.employee_id !== null).length,
        employeeMappings: conn.employee_mappings,
        syncLogs: conn.sync_logs,
      };
    });
  }

  /**
   * 3. Connect POS system (Test connectivity, encrypt credentials, record connection)
   */
  async connectPos(
    businessId: string,
    userId: string,
    data: {
      provider: string;
      credentials: Record<string, any>;
      branchId?: string;
      locationName?: string;
    }
  ) {
    const catalogItem = GLOBAL_POS_CATALOG.find((p) => p.id === data.provider);
    if (!catalogItem) {
      throw new AppError('Geçersiz veya desteklenmeyen POS sistemi seçildi', 400);
    }

    if (!catalogItem.has_adapter) {
      throw new AppError(
        `${catalogItem.display_name} entegrasyonu henüz geliştirme aşamasındadır (Coming Soon). Test için Naponi POS Sandbox seçeneğini kullanabilirsiniz.`,
        400
      );
    }

    const adapter = ADAPTER_MAP[data.provider];
    if (!adapter) {
      throw new AppError('Bu POS sağlayıcısı için aktif adaptör bulunamadı', 500);
    }

    // Test connectivity
    const testResult = await adapter.testConnection(data.credentials);
    if (!testResult.success) {
      throw new AppError(`POS bağlantı testi başarısız: ${testResult.message}`, 400);
    }

    // Encrypt credentials
    const credentialsEncrypted = encryptJson(data.credentials);

    // Upsert POS connection
    const locationId = testResult.externalLocationId || data.branchId || null;
    const locationName = data.locationName || testResult.locationName || 'Main Store';

    const connection = await prisma.posConnection.upsert({
      where: {
        business_id_provider_external_location_id: {
          business_id: businessId,
          provider: data.provider,
          external_location_id: locationId as any,
        },
      },
      update: {
        status: 'CONNECTED',
        branch_id: data.branchId || null,
        external_account_id: testResult.externalAccountId || null,
        external_location_id: locationId,
        location_name: locationName,
        credentials_encrypted: credentialsEncrypted,
        last_error_message: null,
        last_sync_status: 'CONNECTED',
      },
      create: {
        business_id: businessId,
        provider: data.provider,
        branch_id: data.branchId || null,
        status: 'CONNECTED',
        external_account_id: testResult.externalAccountId || null,
        external_location_id: locationId,
        location_name: locationName,
        credentials_encrypted: credentialsEncrypted,
        last_sync_status: 'CONNECTED',
      },
    });

    // Initial sync of POS employees to populate employee mappings
    try {
      const posEmployees = await adapter.getEmployees(data.credentials, locationId || undefined);
      for (const pEmp of posEmployees) {
        await prisma.posEmployeeMapping.upsert({
          where: {
            pos_connection_id_external_employee_id: {
              pos_connection_id: connection.id,
              external_employee_id: pEmp.externalId,
            },
          },
          update: {
            external_employee_name: `${pEmp.firstName} ${pEmp.lastName}`.trim(),
            external_role: pEmp.roleTitle || null,
          },
          create: {
            pos_connection_id: connection.id,
            business_id: businessId,
            external_employee_id: pEmp.externalId,
            external_employee_name: `${pEmp.firstName} ${pEmp.lastName}`.trim(),
            external_role: pEmp.roleTitle || null,
          },
        });
      }
    } catch (err: any) {
      console.warn('[POS] Initial employee pull warning:', err?.message);
    }

    await createAuditLog({
      businessId,
      actorUserId: userId,
      action: 'POS_CONNECTED',
      entityType: 'PosConnection',
      entityId: connection.id,
      metadata: { provider: data.provider, locationName },
    });

    return {
      success: true,
      connectionId: connection.id,
      provider: data.provider,
      locationName,
      message: `${catalogItem.display_name} başarıyla bağlandı!`,
    };
  }

  /**
   * 4. Disconnect POS
   */
  async disconnectPos(businessId: string, userId: string, connectionId: string) {
    const connection = await prisma.posConnection.findFirst({
      where: { id: connectionId, business_id: businessId },
    });

    if (!connection) {
      throw new AppError('POS bağlantısı bulunamadı veya yetkiniz yok', 404);
    }

    await prisma.posConnection.update({
      where: { id: connectionId },
      data: {
        status: 'DISCONNECTED',
        credentials_encrypted: null,
        last_sync_status: 'DISCONNECTED',
      },
    });

    await createAuditLog({
      businessId,
      actorUserId: userId,
      action: 'POS_DISCONNECTED',
      entityType: 'PosConnection',
      entityId: connectionId,
      metadata: { provider: connection.provider },
    });

    return {
      success: true,
      message: 'POS bağlantısı güvenli bir şekilde sonlandırıldı.',
    };
  }

  /**
   * 5. Sync POS data (Employees, Closed Orders, Tips)
   */
  async syncPosConnection(businessId: string, userId: string, connectionId: string) {
    const connection = await prisma.posConnection.findFirst({
      where: { id: connectionId, business_id: businessId },
    });

    if (!connection) {
      throw new AppError('POS bağlantısı bulunamadı', 404);
    }

    if (connection.status !== 'CONNECTED') {
      throw new AppError('Bağlantı aktif değil. Lütfen önce bağlantıyı yeniden sağlayın.', 400);
    }

    if (!connection.credentials_encrypted) {
      throw new AppError('Kayıtlı POS kimlik bilgisi bulunamadı', 400);
    }

    const credentials = decryptJson<Record<string, any>>(connection.credentials_encrypted);
    if (!credentials) {
      throw new AppError('Kayıtlı POS kimlik bilgileri çözülemedi', 400);
    }
    const adapter = ADAPTER_MAP[connection.provider];
    if (!adapter) {
      throw new AppError('Bu POS sağlayıcısı için adaptör bulunamadı', 500);
    }

    // Set connection status to SYNCING
    await prisma.posConnection.update({
      where: { id: connectionId },
      data: { status: 'SYNCING' },
    });

    try {
      const syncResult = await adapter.sync(credentials, {
        locationId: connection.external_location_id || undefined,
        since: connection.last_sync_at || undefined,
      });

      // Update employee mappings if new staff discovered
      const posEmployees = await adapter.getEmployees(credentials, connection.external_location_id || undefined);
      for (const pEmp of posEmployees) {
        await prisma.posEmployeeMapping.upsert({
          where: {
            pos_connection_id_external_employee_id: {
              pos_connection_id: connection.id,
              external_employee_id: pEmp.externalId,
            },
          },
          update: {
            external_employee_name: `${pEmp.firstName} ${pEmp.lastName}`.trim(),
            external_role: pEmp.roleTitle || null,
          },
          create: {
            pos_connection_id: connection.id,
            business_id: businessId,
            external_employee_id: pEmp.externalId,
            external_employee_name: `${pEmp.firstName} ${pEmp.lastName}`.trim(),
            external_role: pEmp.roleTitle || null,
          },
        });
      }

      // Record Sync Log
      await prisma.posSyncLog.create({
        data: {
          pos_connection_id: connectionId,
          business_id: businessId,
          records_synced: syncResult.recordsSynced,
          tips_imported: syncResult.tipsImported,
          status: 'SUCCESS',
        },
      });

      // Update connection
      await prisma.posConnection.update({
        where: { id: connectionId },
        data: {
          status: 'CONNECTED',
          last_sync_at: new Date(),
          last_sync_status: 'SUCCESS',
          last_error_message: null,
        },
      });

      await createAuditLog({
        businessId,
        actorUserId: userId,
        action: 'POS_SYNC_EXECUTED',
        entityType: 'PosConnection',
        entityId: connectionId,
        metadata: {
          recordsSynced: syncResult.recordsSynced,
          tipsImported: syncResult.tipsImported,
        },
      });

      return {
        success: true,
        data: syncResult,
      };
    } catch (err: any) {
      await prisma.posConnection.update({
        where: { id: connectionId },
        data: {
          status: 'ERROR',
          last_error_message: err?.message || 'Sync failed',
          last_sync_status: 'FAILED',
        },
      });

      await prisma.posSyncLog.create({
        data: {
          pos_connection_id: connectionId,
          business_id: businessId,
          records_synced: 0,
          tips_imported: 0,
          status: 'FAILED',
          error_details: err?.message || 'Unknown sync error',
        },
      });

      throw new AppError(`Senkronizasyon hatası: ${err?.message}`, 500);
    }
  }

  /**
   * 6. Get employee mappings
   */
  async getEmployeeMappings(businessId: string, connectionId: string) {
    const connection = await prisma.posConnection.findFirst({
      where: { id: connectionId, business_id: businessId },
    });

    if (!connection) {
      throw new AppError('POS bağlantısı bulunamadı', 404);
    }

    const mappings = await prisma.posEmployeeMapping.findMany({
      where: { pos_connection_id: connectionId },
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, role_title: true, avatar: true },
        },
      },
      orderBy: { external_employee_name: 'asc' },
    });

    // Also get business employees for mapping select
    const businessEmployees = await prisma.employee.findMany({
      where: { business_id: businessId, is_active: true, deleted_at: null },
      select: { id: true, first_name: true, last_name: true, role_title: true },
      orderBy: { first_name: 'asc' },
    });

    return {
      mappings,
      businessEmployees,
    };
  }

  /**
   * 7. Map POS employee to Naponi employee
   */
  async mapEmployee(
    businessId: string,
    connectionId: string,
    externalEmployeeId: string,
    employeeId: string | null
  ) {
    const mapping = await prisma.posEmployeeMapping.findFirst({
      where: {
        pos_connection_id: connectionId,
        business_id: businessId,
        external_employee_id: externalEmployeeId,
      },
    });

    if (!mapping) {
      throw new AppError('Eşleştirilecek POS çalışanı bulunamadı', 404);
    }

    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, business_id: businessId },
      });
      if (!employee) {
        throw new AppError('Seçilen Naponi çalışanı bu işletmeye ait değil', 400);
      }
    }

    const updated = await prisma.posEmployeeMapping.update({
      where: { id: mapping.id },
      data: { employee_id: employeeId },
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, role_title: true },
        },
      },
    });

    return {
      success: true,
      mapping: updated,
      message: 'Çalışan eşleştirmesi güncellendi.',
    };
  }

  /**
   * 8. Submit custom POS integration request
   */
  async submitPosRequest(
    businessId: string,
    userId: string,
    data: {
      providerName: string;
      country: string;
      website?: string;
      notes?: string;
    }
  ) {
    const created = await prisma.paymentProviderRequest.create({
      data: {
        business_id: businessId,
        provider_name: `[POS] ${data.providerName}`,
        country: data.country.toUpperCase(),
        website: data.website || null,
        payment_type: 'POS_SYSTEM',
        description: data.notes || 'POS Integration Request',
        status: 'PENDING',
      },
    });

    await createAuditLog({
      businessId,
      actorUserId: userId,
      action: 'POS_REQUEST_SUBMITTED',
      entityType: 'PaymentProviderRequest',
      entityId: created.id,
      metadata: { providerName: data.providerName, country: data.country },
    });

    return created;
  }
}

export const posService = new PosService();
