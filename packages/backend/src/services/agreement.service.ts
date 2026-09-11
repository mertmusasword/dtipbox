import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AgreementStatus, AgreementType } from '@prisma/client';
import {
  MERCHANT_SERVICE_AGREEMENT_CODE,
  MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION,
  MERCHANT_AGREEMENT_RAW_TEMPLATE,
  MANDATORY_ACCEPTANCE_STATEMENT,
  GLOBAL_MANDATORY_ACCEPTANCE_STATEMENT,
  GLOBAL_MERCHANT_AGREEMENT_RAW_TEMPLATE,
  interpolateAgreementText,
  DEFAULT_NAPONI_META,
} from '../templates/merchantAgreementText';
import { createAuditLog } from './audit.service';

/**
 * Compute SHA-256 cryptographic hash of UTF-8 content
 */
export function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Ensure database tables exist automatically via raw SQL (Self-healing DDL)
 */
export async function ensureAgreementTablesExist(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "AgreementType" AS ENUM ('MERCHANT_TERMS', 'PRIVACY_POLICY', 'KVKK_DISCLOSURE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS "agreements" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" "AgreementType" NOT NULL DEFAULT 'MERCHANT_TERMS',
          "description" TEXT,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "agreement_versions" (
          "id" TEXT NOT NULL,
          "agreement_id" TEXT NOT NULL,
          "version" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "content_markdown" TEXT NOT NULL,
          "content_hash" TEXT NOT NULL,
          "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
          "requires_reacceptance" BOOLEAN NOT NULL DEFAULT true,
          "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "published_at" TIMESTAMP(3),
          "created_by_user_id" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "agreement_versions_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "agreement_acceptances" (
          "id" TEXT NOT NULL,
          "business_id" TEXT NOT NULL,
          "user_id" TEXT NOT NULL,
          "agreement_version_id" TEXT NOT NULL,
          "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "ip_address" TEXT NOT NULL,
          "user_agent" TEXT NOT NULL,
          "content_hash" TEXT NOT NULL,
          "snapshot_html" TEXT,
          "statement" TEXT NOT NULL,
          "metadata" JSONB,
          CONSTRAINT "agreement_acceptances_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "agreements_code_key" ON "agreements"("code");
      CREATE INDEX IF NOT EXISTS "agreement_versions_status_idx" ON "agreement_versions"("status");
      CREATE UNIQUE INDEX IF NOT EXISTS "agreement_versions_agreement_id_version_key" ON "agreement_versions"("agreement_id", "version");
      CREATE INDEX IF NOT EXISTS "agreement_acceptances_business_id_idx" ON "agreement_acceptances"("business_id");
      CREATE INDEX IF NOT EXISTS "agreement_acceptances_agreement_version_id_idx" ON "agreement_acceptances"("agreement_version_id");
      CREATE INDEX IF NOT EXISTS "agreement_acceptances_accepted_at_idx" ON "agreement_acceptances"("accepted_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "agreement_acceptances_business_id_agreement_version_id_key" ON "agreement_acceptances"("business_id", "agreement_version_id");

      DO $$ BEGIN
        ALTER TABLE "agreement_versions" ADD CONSTRAINT "agreement_versions_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "agreement_acceptances" ADD CONSTRAINT "agreement_acceptances_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "agreement_acceptances" ADD CONSTRAINT "agreement_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TABLE "agreement_acceptances" ADD CONSTRAINT "agreement_acceptances_agreement_version_id_fkey" FOREIGN KEY ("agreement_version_id") REFERENCES "agreement_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
  } catch (err) {
    console.error('[AGREEMENT] Auto-migration execution error:', err);
  }
}

/**
 * Initialize / Bootstrap the master Merchant Agreement and initial 1.0.0 published version
 */
export async function bootstrapDefaultAgreement(): Promise<void> {
  try {
    await ensureAgreementTablesExist();

    let agreement = await prisma.agreement.findUnique({
      where: { code: MERCHANT_SERVICE_AGREEMENT_CODE },
    });

    if (!agreement) {
      agreement = await prisma.agreement.create({
        data: {
          code: MERCHANT_SERVICE_AGREEMENT_CODE,
          name: 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi',
          type: AgreementType.MERCHANT_TERMS,
          description:
            "Naponi platformu üzerinden sunulan dijital bahşiş ve ödeme altyapısına ilişkin üye işyeri çerçeve hizmet sözleşmesi.",
          is_active: true,
        },
      });
      console.log(`[AGREEMENT] Created master agreement: ${agreement.code}`);
    }

    const version1 = await prisma.agreementVersion.findUnique({
      where: {
        agreement_id_version: {
          agreement_id: agreement.id,
          version: MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION,
        },
      },
    });

    if (!version1) {
      const contentHash = computeContentHash(MERCHANT_AGREEMENT_RAW_TEMPLATE);
      await prisma.agreementVersion.create({
        data: {
          agreement_id: agreement.id,
          version: MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION,
          title: 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi (Standart)',
          content_markdown: MERCHANT_AGREEMENT_RAW_TEMPLATE,
          content_hash: contentHash,
          status: AgreementStatus.PUBLISHED,
          requires_reacceptance: true,
          effective_date: new Date(),
          published_at: new Date(),
        },
      });
      console.log(`[AGREEMENT] Created and published version ${MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION}`);
    }
  } catch (error) {
    console.error('[AGREEMENT] Failed to bootstrap default agreement:', error);
  }
}

/**
 * Get active published agreement, optional interpolation for specific business, multilingual support
 */
export async function getActiveAgreement(businessId?: string, lang: string = 'tr') {
  try {
    let agreement = await prisma.agreement.findUnique({
      where: { code: MERCHANT_SERVICE_AGREEMENT_CODE },
      include: {
        versions: {
          where: { status: AgreementStatus.PUBLISHED },
          orderBy: { effective_date: 'desc' },
          take: 1,
        },
      },
    });

    if (!agreement || agreement.versions.length === 0) {
      await bootstrapDefaultAgreement();
      agreement = await prisma.agreement.findUnique({
        where: { code: MERCHANT_SERVICE_AGREEMENT_CODE },
        include: {
          versions: {
            where: { status: AgreementStatus.PUBLISHED },
            orderBy: { effective_date: 'desc' },
            take: 1,
          },
        },
      });
    }

    if (agreement && agreement.versions.length > 0) {
      return formatAgreementResponse(agreement, agreement.versions[0], businessId, lang);
    }
  } catch (err: any) {
    console.warn('[AGREEMENT] Database error in getActiveAgreement, attempting auto-fix:', err.message);
    try {
      await ensureAgreementTablesExist();
      await bootstrapDefaultAgreement();
      const retryAgreement = await prisma.agreement.findUnique({
        where: { code: MERCHANT_SERVICE_AGREEMENT_CODE },
        include: {
          versions: {
            where: { status: AgreementStatus.PUBLISHED },
            orderBy: { effective_date: 'desc' },
            take: 1,
          },
        },
      });
      if (retryAgreement && retryAgreement.versions.length > 0) {
        return formatAgreementResponse(retryAgreement, retryAgreement.versions[0], businessId, lang);
      }
    } catch (retryErr) {
      console.error('[AGREEMENT] Retry failed:', retryErr);
    }
  }

  // Graceful Fallback if DB table is completely unreachable
  const isGlobal = lang !== 'tr';
  const fallbackTemplate = isGlobal ? GLOBAL_MERCHANT_AGREEMENT_RAW_TEMPLATE : MERCHANT_AGREEMENT_RAW_TEMPLATE;
  const defaultHash = computeContentHash(fallbackTemplate);
  const fallbackInterpolated = interpolateAgreementText(
    fallbackTemplate,
    { businessName: isGlobal ? 'Merchant' : 'İşletme' },
    MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION
  );

  return {
    agreement: {
      id: 'fallback-agr-id',
      code: MERCHANT_SERVICE_AGREEMENT_CODE,
      name: isGlobal ? 'Naponi Global Merchant Services Agreement' : 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi',
      type: 'MERCHANT_TERMS',
    },
    version: {
      id: 'fallback-ver-id',
      version: MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION,
      title: isGlobal ? 'Naponi Global Merchant Services & Digital Tipping Agreement' : 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi',
      effective_date: new Date().toISOString(),
      published_at: new Date().toISOString(),
      content_hash: defaultHash,
      requires_reacceptance: true,
    },
    content: fallbackInterpolated,
    raw_content_hash: defaultHash,
    mandatory_statement: isGlobal ? GLOBAL_MANDATORY_ACCEPTANCE_STATEMENT : MANDATORY_ACCEPTANCE_STATEMENT,
    is_accepted: false,
    accepted_at: null,
    acceptance_id: null,
  };
}

async function formatAgreementResponse(
  agreement: any,
  version: any,
  businessId?: string,
  lang: string = 'tr'
) {
  const isGlobal = lang !== 'tr';
  const rawTemplate = isGlobal ? GLOBAL_MERCHANT_AGREEMENT_RAW_TEMPLATE : version.content_markdown;
  const rawHash = isGlobal ? computeContentHash(rawTemplate) : version.content_hash;
  const mandatoryStatement = isGlobal ? GLOBAL_MANDATORY_ACCEPTANCE_STATEMENT : MANDATORY_ACCEPTANCE_STATEMENT;
  const agreementTitle = isGlobal ? 'Naponi Global Merchant Services & Digital Tipping Agreement' : version.title;

  let isAccepted = false;
  let acceptanceRecord: any = null;
  let businessData: any = { businessName: isGlobal ? 'Merchant' : 'İşletme' };

  if (businessId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: { select: { email: true } } },
    });

    if (business) {
      businessData = {
        businessName: business.name,
        businessAddress: business.address || (isGlobal ? 'Registered business address' : 'Kayıtlı işletme adresi'),
        businessEmail: business.email || business.owner.email,
        businessPhone: business.phone || (isGlobal ? 'Not specified' : 'Belirtilmedi'),
        authorizedPerson: business.owner.email,
      };
    }

    acceptanceRecord = await prisma.agreementAcceptance.findUnique({
      where: {
        business_id_agreement_version_id: {
          business_id: businessId,
          agreement_version_id: version.id,
        },
      },
    });

    isAccepted = !!acceptanceRecord;
  }

  const interpolatedContent = interpolateAgreementText(
    rawTemplate,
    businessData,
    version.version
  );

  return {
    agreement: {
      id: agreement.id,
      code: agreement.code,
      name: isGlobal ? 'Naponi Global Merchant Services Agreement' : agreement.name,
      type: agreement.type,
    },
    version: {
      id: version.id,
      version: version.version,
      title: agreementTitle,
      effective_date: version.effective_date,
      published_at: version.published_at,
      content_hash: rawHash,
      requires_reacceptance: version.requires_reacceptance,
    },
    content: interpolatedContent,
    raw_content_hash: rawHash,
    mandatory_statement: mandatoryStatement,
    is_accepted: isAccepted,
    accepted_at: acceptanceRecord ? acceptanceRecord.accepted_at : null,
    acceptance_id: acceptanceRecord ? acceptanceRecord.id : null,
  };
}

/**
 * Record digital acceptance of agreement by business with legal proof & audit trail
 */
export async function acceptAgreement(params: {
  businessId: string;
  userId: string;
  versionId: string;
  ipAddress: string;
  userAgent: string;
  statement: string;
}) {
  const { businessId, userId, versionId, ipAddress, userAgent, statement } = params;

  // Strict statement validation
  if (!statement || statement.trim() !== MANDATORY_ACCEPTANCE_STATEMENT) {
    throw new Error(
      `Sözleşme kabul beyanı geçersiz. Zorunlu metin: "${MANDATORY_ACCEPTANCE_STATEMENT}"`
    );
  }

  // Check version existence and status
  const version = await prisma.agreementVersion.findUnique({
    where: { id: versionId },
    include: { agreement: true },
  });

  if (!version) {
    throw new Error('Sözleşme versiyonu bulunamadı.');
  }

  if (version.status !== AgreementStatus.PUBLISHED) {
    throw new Error('Yalnızca yayında olan sözleşme versiyonları kabul edilebilir.');
  }

  // Check business and user relationship
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { owner: { select: { id: true, email: true } } },
  });

  if (!business) {
    throw new Error('İşletme bulunamadı.');
  }

  // Verify authorization (user must be owner or authorized)
  if (business.owner_user_id !== userId) {
    // Check if user is an ADMIN
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new Error('İşletme adına sözleşmeyi kabul etme yetkiniz bulunmamaktadır.');
    }
  }

  // Check if already accepted
  const existing = await prisma.agreementAcceptance.findUnique({
    where: {
      business_id_agreement_version_id: {
        business_id: businessId,
        agreement_version_id: versionId,
      },
    },
  });

  if (existing) {
    return {
      success: true,
      already_accepted: true,
      acceptance: existing,
      message: 'Bu sözleşme versiyonu daha önce zaten kabul edilmiştir.',
    };
  }

  // Interpolate full legal text for snapshot
  const interpolatedText = interpolateAgreementText(
    version.content_markdown,
    {
      businessName: business.name,
      businessAddress: business.address || 'Kayıtlı işletme adresi',
      businessEmail: business.email || business.owner.email,
      businessPhone: business.phone || 'Belirtilmedi',
      authorizedPerson: business.owner.email,
    },
    version.version
  );

  const snapshotHash = computeContentHash(interpolatedText);

  // HTML snapshot format for non-repudiation
  const snapshotHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Naponi Dijital Sözleşme Kabul Kaydı - ${version.version}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    .audit-box { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 1rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="audit-box">
    <h3>DİJİTAL SÖZLEŞME ONAY VE İSPAT BELGESİ</h3>
    <p><strong>İşletme ID:</strong> ${business.id}</p>
    <p><strong>İşletme Unvanı:</strong> ${business.name}</p>
    <p><strong>Kabul Eden Kullanıcı ID:</strong> ${userId}</p>
    <p><strong>Sözleşme Versiyonu:</strong> ${version.version}</p>
    <p><strong>Kabul Zamanı (UTC):</strong> ${new Date().toISOString()}</p>
    <p><strong>IP Adresi:</strong> ${ipAddress}</p>
    <p><strong>User-Agent:</strong> ${userAgent}</p>
    <p><strong>Belge SHA-256 Hash:</strong> ${snapshotHash}</p>
    <p><strong>Onay Beyanı:</strong> ${statement}</p>
  </div>
  <hr/>
  <pre style="white-space: pre-wrap;">${interpolatedText}</pre>
</body>
</html>`;

  // Create immutable acceptance record
  const acceptance = await prisma.agreementAcceptance.create({
    data: {
      business_id: businessId,
      user_id: userId,
      agreement_version_id: versionId,
      accepted_at: new Date(),
      ip_address: ipAddress || '0.0.0.0',
      user_agent: userAgent || 'Unknown',
      content_hash: snapshotHash,
      snapshot_html: snapshotHtml,
      statement: statement,
      metadata: {
        agreement_code: version.agreement.code,
        version: version.version,
        business_name: business.name,
        user_email: business.owner.email,
        master_content_hash: version.content_hash,
      },
    },
  });

  // Log in system AuditLog
  await createAuditLog({
    actorUserId: userId,
    businessId: businessId,
    action: 'AGREEMENT_ACCEPTED',
    entityType: 'AgreementAcceptance',
    entityId: acceptance.id,
    metadata: {
      version: version.version,
      version_id: version.id,
      content_hash: snapshotHash,
      ip_address: ipAddress,
      user_agent: userAgent,
    },
  });

  return {
    success: true,
    already_accepted: false,
    acceptance: {
      id: acceptance.id,
      business_id: acceptance.business_id,
      user_id: acceptance.user_id,
      agreement_version_id: acceptance.agreement_version_id,
      version: version.version,
      accepted_at: acceptance.accepted_at,
      ip_address: acceptance.ip_address,
      user_agent: acceptance.user_agent,
      content_hash: acceptance.content_hash,
      statement: acceptance.statement,
    },
    verification: {
      hash_algorithm: 'SHA-256',
      content_hash: snapshotHash,
      timestamp: acceptance.accepted_at.toISOString(),
      legal_basis: 'HMK m. 193 Delil Sözleşmesi Uyarınca Elektronik Onay',
    },
  };
}

/**
 * Get all past acceptances for a given business
 */
export async function getAgreementHistory(businessId: string) {
  const acceptances = await prisma.agreementAcceptance.findMany({
    where: { business_id: businessId },
    include: {
      version: {
        select: {
          version: true,
          title: true,
          status: true,
          effective_date: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: { accepted_at: 'desc' },
  });

  return acceptances.map((acc) => ({
    id: acc.id,
    version: acc.version.version,
    title: acc.version.title,
    accepted_at: acc.accepted_at,
    accepted_by: acc.user.email,
    ip_address: acc.ip_address,
    user_agent: acc.user_agent,
    content_hash: acc.content_hash,
    statement: acc.statement,
  }));
}

// ==================== ADMIN OPERATIONS ====================

/**
 * List all agreements, their versions, and acceptance counts (Admin)
 */
export async function getAdminAgreements() {
  const agreements = await prisma.agreement.findMany({
    include: {
      versions: {
        orderBy: { created_at: 'desc' },
        include: {
          _count: { select: { acceptances: true } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return agreements.map((agr) => ({
    id: agr.id,
    code: agr.code,
    name: agr.name,
    type: agr.type,
    description: agr.description,
    is_active: agr.is_active,
    versions: agr.versions.map((v) => ({
      id: v.id,
      version: v.version,
      title: v.title,
      status: v.status,
      content_hash: v.content_hash,
      effective_date: v.effective_date,
      published_at: v.published_at,
      requires_reacceptance: v.requires_reacceptance,
      created_at: v.created_at,
      acceptance_count: v._count.acceptances,
    })),
  }));
}

/**
 * Create a new draft agreement version (Admin)
 */
export async function createAgreementVersion(params: {
  agreementCode?: string;
  version: string;
  title: string;
  contentMarkdown: string;
  requiresReacceptance?: boolean;
  effectiveDate?: Date;
  adminUserId: string;
}) {
  const code = params.agreementCode || MERCHANT_SERVICE_AGREEMENT_CODE;

  const agreement = await prisma.agreement.findUnique({
    where: { code },
  });

  if (!agreement) {
    throw new Error(`Sözleşme tipi bulunamadı: ${code}`);
  }

  // Check version uniqueness
  const existingVersion = await prisma.agreementVersion.findUnique({
    where: {
      agreement_id_version: {
        agreement_id: agreement.id,
        version: params.version,
      },
    },
  });

  if (existingVersion) {
    throw new Error(`Bu sözleşme için "${params.version}" versiyonu zaten mevcut.`);
  }

  const contentHash = computeContentHash(params.contentMarkdown);

  const newVersion = await prisma.agreementVersion.create({
    data: {
      agreement_id: agreement.id,
      version: params.version,
      title: params.title,
      content_markdown: params.contentMarkdown,
      content_hash: contentHash,
      status: AgreementStatus.DRAFT,
      requires_reacceptance: params.requiresReacceptance !== false,
      effective_date: params.effectiveDate || new Date(),
      created_by_user_id: params.adminUserId,
    },
  });

  await createAuditLog({
    actorUserId: params.adminUserId,
    action: 'AGREEMENT_VERSION_CREATED',
    entityType: 'AgreementVersion',
    entityId: newVersion.id,
    metadata: {
      version: newVersion.version,
      agreement_code: code,
      content_hash: contentHash,
    },
  });

  return newVersion;
}

/**
 * Publish a draft agreement version (Admin)
 * Makes version PUBLISHED and immutable.
 */
export async function publishAgreementVersion(versionId: string, adminUserId: string) {
  const version = await prisma.agreementVersion.findUnique({
    where: { id: versionId },
    include: { agreement: true },
  });

  if (!version) {
    throw new Error('Sözleşme versiyonu bulunamadı.');
  }

  if (version.status === AgreementStatus.PUBLISHED) {
    throw new Error('Bu sözleşme versiyonu zaten yayındadır (değiştirilemez).');
  }

  // Archive older published versions of the same agreement if required
  await prisma.agreementVersion.updateMany({
    where: {
      agreement_id: version.agreement_id,
      status: AgreementStatus.PUBLISHED,
      id: { not: versionId },
    },
    data: {
      status: AgreementStatus.ARCHIVED,
    },
  });

  const updated = await prisma.agreementVersion.update({
    where: { id: versionId },
    data: {
      status: AgreementStatus.PUBLISHED,
      published_at: new Date(),
    },
  });

  await createAuditLog({
    actorUserId: adminUserId,
    action: 'AGREEMENT_VERSION_PUBLISHED',
    entityType: 'AgreementVersion',
    entityId: updated.id,
    metadata: {
      version: updated.version,
      agreement_code: version.agreement.code,
      content_hash: updated.content_hash,
    },
  });

  return updated;
}

/**
 * Query acceptance audit records with filtering & pagination (Admin)
 */
export async function getAcceptanceAuditLogs(params: {
  page?: number;
  limit?: number;
  businessId?: string;
  versionId?: string;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.businessId) where.business_id = params.businessId;
  if (params.versionId) where.agreement_version_id = params.versionId;

  const [acceptances, total] = await Promise.all([
    prisma.agreementAcceptance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { accepted_at: 'desc' },
      include: {
        business: {
          select: { id: true, name: true, country: true },
        },
        user: {
          select: { id: true, email: true, role: true },
        },
        version: {
          select: { id: true, version: true, title: true, status: true },
        },
      },
    }),
    prisma.agreementAcceptance.count({ where }),
  ]);

  return {
    items: acceptances.map((acc) => ({
      id: acc.id,
      business: acc.business,
      user: acc.user,
      version: acc.version,
      accepted_at: acc.accepted_at,
      ip_address: acc.ip_address,
      user_agent: acc.user_agent,
      content_hash: acc.content_hash,
      statement: acc.statement,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get list of businesses requiring re-acceptance of active agreement (Admin)
 */
export async function getPendingReacceptanceBusinesses() {
  const activeVersion = await prisma.agreementVersion.findFirst({
    where: {
      agreement: { code: MERCHANT_SERVICE_AGREEMENT_CODE },
      status: AgreementStatus.PUBLISHED,
    },
    orderBy: { effective_date: 'desc' },
  });

  if (!activeVersion) {
    return { activeVersion: null, pendingBusinesses: [] };
  }

  // Get all active businesses
  const businesses = await prisma.business.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      email: true,
      owner: { select: { id: true, email: true } },
      agreement_acceptances: {
        where: { agreement_version_id: activeVersion.id },
        select: { id: true },
      },
    },
  });

  const pending = businesses
    .filter((b) => b.agreement_acceptances.length === 0)
    .map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email || b.owner.email,
      owner_email: b.owner.email,
    }));

  return {
    activeVersion: {
      id: activeVersion.id,
      version: activeVersion.version,
      title: activeVersion.title,
    },
    pendingCount: pending.length,
    pendingBusinesses: pending,
  };
}
