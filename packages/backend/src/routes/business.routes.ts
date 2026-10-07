import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import * as businessService from '../services/business.service';
import * as employeeService from '../services/employee.service';
import * as tableService from '../services/table.service';
import * as qrService from '../services/qr.service';
import * as paymentMethodService from '../services/paymentMethod.service';
import * as providerService from '../services/payment/provider.service';
import * as analyticsService from '../services/analytics.service';
import * as commissionService from '../services/commission.service';
import * as auditService from '../services/audit.service';
import * as tipPoolService from '../services/tipPool.service';
import { planGuardService } from '../services/plan-guard.service';
import { PaymentMethodType, PaymentMethodStatus, QrType, TipDistributionMode, PosFeePayer } from '@prisma/client';
import { requireAcceptedAgreement } from '../middleware/agreement.middleware';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../services/email.service';
import { lemonSqueezyService } from '../services/lemonsqueezy.service';
import prisma from '../utils/prisma';

const router = Router();

// Apply auth and business ownership to all business endpoints
router.use(authenticate);
router.use(authorize('BUSINESS', 'ADMIN'));
router.use(requireBusinessOwnership);

// --- Business Profile ---
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const business = await businessService.getBusiness(req.user!.businessId!);
    res.json({ success: true, data: business });
  } catch (error) {
    next(error);
  }
});

router.get('/onboarding-status', async (req: AuthRequest, res, next) => {
  try {
    const data = await businessService.getOnboardingStatus(req.user!.businessId!);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

const updateBusinessSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    logo: z.string().nullable().optional(),
    country: z.string().length(2).optional(),
    currency: z.string().min(3).max(4).optional(),
    timezone: z.string().optional(),
    locale: z.string().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    address: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  }),
};

router.put('/', validate(updateBusinessSchema), async (req: AuthRequest, res, next) => {
  try {
    const business = await businessService.updateBusiness(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: business });
  } catch (error) {
    next(error);
  }
});

// --- Business Payment Account ---
const paymentAccountSchema = {
  body: z.object({
    country: z.string().min(2),
    account_holder_name: z.string().min(2),
    iban: z.string().nullable().optional(),
    account_number: z.string().nullable().optional(),
    routing_number: z.string().nullable().optional(),
    sort_code: z.string().nullable().optional(),
    swift_bic: z.string().nullable().optional(),
    bank_name: z.string().nullable().optional(),
  }),
};

router.get('/payment-account', async (req: AuthRequest, res, next) => {
  try {
    const account = await businessService.getPaymentAccount(req.user!.businessId!);
    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

router.post('/payment-account', requireAcceptedAgreement, validate(paymentAccountSchema), async (req: AuthRequest, res, next) => {
  try {
    const account = await businessService.upsertPaymentAccount(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

router.delete('/payment-account', async (req: AuthRequest, res, next) => {
  try {
    await businessService.deletePaymentAccount(req.user!.businessId!, req.user!.id);
    res.json({ success: true, message: 'Payment account deleted' });
  } catch (error) {
    next(error);
  }
});

// --- Employees CRUD ---
router.get('/employees', async (req: AuthRequest, res, next) => {
  try {
    const employees = await employeeService.getEmployees(req.user!.businessId!);
    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
});

const createEmployeeSchema = {
  body: z.object({
    first_name: z.string().trim().min(1, 'Ad zorunludur').max(100),
    last_name: z.string().trim().min(1, 'Soyad zorunludur').max(100),
    position: z.string().trim().max(100).optional(),
    avatar: z.string().nullable().optional(),
    email: z.string().trim().email('Geçerli bir e-posta adresi giriniz').max(150).optional(),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır').max(128).optional(),
    role_title: z.string().trim().max(100).optional(),
    share_weight: z.number().min(0).max(10).optional(),
  }),
};

router.post('/employees', validate(createEmployeeSchema), async (req: AuthRequest, res, next) => {
  try {
    const employee = await employeeService.createEmployee(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
});

const updateEmployeeSchema = {
  body: z.object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
    position: z.string().trim().max(100).optional(),
    avatar: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    email: z.string().trim().email('Geçerli bir e-posta adresi giriniz').max(150).optional(),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır').max(128).optional(),
    role_title: z.string().trim().max(100).optional(),
    share_weight: z.number().min(0).max(10).optional(),
  }),
};

router.put('/employees/:id', validate(updateEmployeeSchema), async (req: AuthRequest, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(
      req.params.id as string,
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
});

router.delete('/employees/:id', async (req: AuthRequest, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id as string, req.user!.businessId!, req.user!.id);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (error) {
    next(error);
  }
});

// --- Tables CRUD ---
router.get('/tables', async (req: AuthRequest, res, next) => {
  try {
    const tables = await tableService.getTables(req.user!.businessId!);
    res.json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
});

const createTableSchema = {
  body: z.object({
    name: z.string().min(1),
  }),
};

router.post('/tables', validate(createTableSchema), async (req: AuthRequest, res, next) => {
  try {
    await planGuardService.assertCanAddTable(req.user!.businessId!);
    const table = await tableService.createTable(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
});

router.put('/tables/:id', validate(createTableSchema), async (req: AuthRequest, res, next) => {
  try {
    const table = await tableService.updateTable(
      req.params.id as string,
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
});

router.delete('/tables/:id', async (req: AuthRequest, res, next) => {
  try {
    await tableService.deleteTable(req.params.id as string, req.user!.businessId!, req.user!.id);
    res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
});

// --- QR Codes CRUD ---
router.get('/qr', async (req: AuthRequest, res, next) => {
  try {
    const qrCodes = await qrService.getQrCodes(req.user!.businessId!);
    res.json({ success: true, data: qrCodes });
  } catch (error) {
    next(error);
  }
});

const createQrSchema = {
  body: z.object({
    table_id: z.string().uuid().optional(),
    type: z.nativeEnum(QrType).optional(),
  }),
};

router.post('/qr', requireAcceptedAgreement, validate(createQrSchema), async (req: AuthRequest, res, next) => {
  try {
    const qrCode = await qrService.createQrCode(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: qrCode });
  } catch (error) {
    next(error);
  }
});

router.delete('/qr/:id', async (req: AuthRequest, res, next) => {
  try {
    await qrService.deleteQrCode(req.params.id as string, req.user!.businessId!, req.user!.id);
    res.json({ success: true, message: 'QR code deleted' });
  } catch (error) {
    next(error);
  }
});

// --- Unified Payment Settings (External Payment Link & Direct Bank Transfer) ---
router.get('/payment-settings', async (req: AuthRequest, res, next) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.user!.businessId! },
      select: {
        external_payment_url: true,
        payment_account: {
          select: {
            account_holder_name: true,
            bank_name: true,
            iban: true,
            swift_bic: true,
            country: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        externalPaymentUrl: business?.external_payment_url || null,
        paymentAccount: business?.payment_account || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

const updatePaymentSettingsSchema = {
  body: z.object({
    externalPaymentUrl: z
      .string()
      .trim()
      .max(1000, 'URL en fazla 1000 karakter olabilir')
      .nullable()
      .optional(),
  }),
};

router.put('/payment-settings', validate(updatePaymentSettingsSchema), async (req: AuthRequest, res, next) => {
  try {
    let cleanUrl: string | null = null;
    if (req.body.externalPaymentUrl && req.body.externalPaymentUrl.trim().length > 0) {
      const raw = req.body.externalPaymentUrl.trim();
      let parsed: URL;
      try {
        parsed = new URL(raw);
      } catch {
        throw new AppError('Geçersiz URL formatı. Lütfen geçerli bir https:// bağlantısı giriniz.', 400);
      }

      if (parsed.protocol !== 'https:') {
        throw new AppError('Ödeme bağlantısı güvenlik nedeniyle zorunlu olarak "https://" ile başlamalıdır.', 400);
      }

      cleanUrl = parsed.toString();
    }

    const updated = await prisma.business.update({
      where: { id: req.user!.businessId! },
      data: {
        external_payment_url: cleanUrl,
      },
      select: {
        external_payment_url: true,
        payment_account: true,
      },
    });

    await auditService.createAuditLog({
      actorUserId: req.user!.id,
      businessId: req.user!.businessId!,
      action: 'PAYMENT_SETTINGS_UPDATED',
      entityType: 'business_payment_settings',
      entityId: req.user!.businessId!,
      metadata: { hasExternalUrl: Boolean(cleanUrl) },
    });

    res.json({
      success: true,
      data: {
        externalPaymentUrl: updated.external_payment_url,
        paymentAccount: updated.payment_account,
      },
      message: 'Ödeme ayarları başarıyla güncellendi.',
    });
  } catch (error) {
    next(error);
  }
});

// --- Payment Methods Management ---
router.get('/payment-methods', async (req: AuthRequest, res, next) => {
  try {
    const methods = await paymentMethodService.getPaymentMethods(req.user!.businessId!);
    res.json({ success: true, data: methods });
  } catch (error) {
    next(error);
  }
});

const updatePaymentMethodSchema = {
  body: z.object({
    type: z.nativeEnum(PaymentMethodType),
    status: z.nativeEnum(PaymentMethodStatus),
  }),
};

router.put('/payment-methods', validate(updatePaymentMethodSchema), async (req: AuthRequest, res, next) => {
  try {
    const updated = await paymentMethodService.updatePaymentMethodStatus(
      req.user!.businessId!,
      req.user!.id,
      req.body.type,
      req.body.status
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Bulk deactivate all payment methods for business
router.post('/payment-methods/deactivate-all', async (req: AuthRequest, res, next) => {
  try {
    const methods = await paymentMethodService.deactivateAllPaymentMethods(
      req.user!.businessId!,
      req.user!.id
    );
    res.json({ success: true, data: methods });
  } catch (error) {
    next(error);
  }
});

// Manage payment provider integration status (e.g. CONNECTED / NOT_CONNECTED)
const updateIntegrationSchema = {
  body: z.object({
    provider: z.string().min(1),
    status: z.enum(['CONNECTED', 'NOT_CONNECTED', 'ERROR']),
  }),
};

router.put('/payment-methods/integrations', validate(updateIntegrationSchema), async (req: AuthRequest, res, next) => {
  try {
    const integration = await paymentMethodService.updateIntegrationStatus(
      req.user!.businessId!,
      req.user!.id,
      req.body.provider,
      req.body.status
    );
    res.json({ success: true, data: integration });
  } catch (error) {
    next(error);
  }
});

// --- Payment Providers & POS Framework ---

// 1. Get filtered catalog for business
router.get('/payment-providers/catalog', async (req: AuthRequest, res, next) => {
  try {
    const { country, currency, type, search } = req.query;
    const catalog = await providerService.getCatalog({
      country: country as string,
      currency: currency as string,
      type: type as string,
      search: search as string,
    });
    res.json({ success: true, data: catalog });
  } catch (error) {
    next(error);
  }
});

// 2. Get business integrations with masked credentials
router.get('/payment-providers/integrations', async (req: AuthRequest, res, next) => {
  try {
    const integrations = await providerService.getBusinessIntegrations(req.user!.businessId!);
    res.json({ success: true, data: integrations });
  } catch (error) {
    next(error);
  }
});

// 3. Save credentials & test connection
const testIntegrationSchema = {
  body: z.object({
    credentials: z.record(z.any()),
  }),
};

router.post('/payment-providers/:id/test', validate(testIntegrationSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await providerService.testAndSaveIntegration(
      req.user!.businessId!,
      req.user!.id,
      req.params.id as string,
      req.body.credentials
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// 4. Disconnect provider integration
router.delete('/payment-providers/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await providerService.deleteIntegration(
      req.user!.businessId!,
      req.user!.id,
      req.params.id as string
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// 5. Submit "+ My provider isn't listed" request
const providerRequestSchema = {
  body: z.object({
    providerName: z.string().min(1),
    country: z.string().min(2),
    website: z.string().optional(),
    paymentType: z.string().min(1),
    description: z.string().optional(),
  }),
};

router.post('/payment-providers/request', validate(providerRequestSchema), async (req: AuthRequest, res, next) => {
  try {
    const created = await providerService.submitProviderRequest(
      req.user!.businessId!,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: created, message: 'Provider request submitted' });
  } catch (error) {
    next(error);
  }
});

// --- Analytics ---
router.get('/analytics', async (req: AuthRequest, res, next) => {
  try {
    const analytics = await analyticsService.getBusinessAnalytics(req.user!.businessId!);
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
});

// --- Platform Commissions & Wire Transfer Settlement ---
router.get('/commissions', async (req: AuthRequest, res, next) => {
  try {
    const report = await commissionService.getBusinessCommissionsReport(req.user!.businessId!);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
});

router.post('/commissions/settle', async (req: AuthRequest, res, next) => {
  try {
    const { periodKey, note } = req.body || {};
    const result = await commissionService.settleCommission(req.user!.businessId!, {
      periodKey,
      note,
      actorUserId: req.user!.id,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/commissions/card-checkout', async (req: AuthRequest, res, next) => {
  try {
    const { periodKey } = req.body || {};
    const businessId = req.user!.businessId!;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, currency: true },
    });
    if (!business) {
      throw new AppError('İşletme bulunamadı', 404);
    }

    const report = await commissionService.getBusinessCommissionsReport(businessId);
    let amountToPay = report.summary.bankPlatformFeePending;
    if (periodKey && periodKey !== 'ALL_PENDING') {
      const p = report.monthlyPeriods.find((x) => x.periodKey === periodKey);
      if (p) {
        amountToPay = p.bankCommissionPending;
      }
    }

    if (amountToPay <= 0) {
      throw new AppError('Ödenecek cari komisyon borcu bulunmuyor.', 400);
    }

    const SETTLEMENT_MIN_THRESHOLDS: Record<string, number> = {
      TRY: 100,
      USD: 5,
      EUR: 5,
      GBP: 5,
    };
    const bCurrency = (business.currency || 'TRY').toUpperCase();
    const minThreshold = SETTLEMENT_MIN_THRESHOLDS[bCurrency] || 5;

    if (amountToPay < minThreshold) {
      throw new AppError(
        `Asgari kartlı mutabakat eşiği ${minThreshold} ${bCurrency}'dir. Bakiyeniz bu eşiğe ulaştığında kartla ödenebilir.`,
        400
      );
    }

    const { checkoutUrl } = await lemonSqueezyService.createCommissionCheckout({
      businessId,
      businessName: business.name,
      periodKey,
      totalAmount: amountToPay,
      currency: business.currency || 'TRY',
      customerEmail: req.user!.email,
      customerName: business.name,
    });

    res.json({ success: true, data: { checkoutUrl, amount: amountToPay, currency: business.currency || 'TRY' } });
  } catch (error) {
    next(error);
  }
});

// --- Export CSV / Excel ---
router.get('/export/tips', async (req: AuthRequest, res, next) => {
  try {
    const type = (req.query.type as any) || 'transactions';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const delimiter = req.query.delimiter === ',' ? ',' : ';';

    const { filename, csv } = await analyticsService.exportTipsCsv(req.user!.businessId!, {
      type,
      startDate,
      endDate,
      delimiter,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
});

// --- Audit Logs ---
router.get('/audit-logs', async (req: AuthRequest, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10) || 1);
    const rawLimit = parseInt(req.query.limit as string || '50', 10) || 50;
    const limit = Math.min(100, Math.max(1, rawLimit));
    const logs = await auditService.getAuditLogs(req.user!.businessId!, page, limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

// --- Get Business Tips (with filtering by status and pagination) ---
router.get('/tips', async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user!.businessId!;
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '50', 10) || 50));
    const skip = (page - 1) * limit;

    const where: any = { business_id: businessId };
    if (status && status !== 'ALL') {
      if (status === 'UNVERIFIED_OR_PENDING' || status === 'UNVERIFIED' || status === 'PENDING') {
        where.payment_status = { in: ['UNVERIFIED', 'PENDING'] };
      } else {
        where.payment_status = status as any;
      }
    }

    const [tips, total] = await Promise.all([
      prisma.tip.findMany({
        where,
        include: {
          table: { select: { id: true, name: true } },
          employee: { select: { id: true, first_name: true, last_name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tip.count({ where }),
    ]);

    const formattedTips = tips.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      currency: t.currency || 'TRY',
      paymentMethod: t.payment_method,
      payment_method: t.payment_method,
      paymentStatus: t.payment_status,
      status: t.payment_status,
      isSettled: t.is_settled,
      is_settled: t.is_settled,
      customerName: t.customer_name,
      customer_name: t.customer_name,
      customerMessage: t.customer_message,
      customer_message: t.customer_message,
      tableName: t.table?.name || null,
      table_name: t.table?.name || null,
      employeeName: t.employee ? `${t.employee.first_name} ${t.employee.last_name}`.trim() : null,
      employee_name: t.employee ? `${t.employee.first_name} ${t.employee.last_name}`.trim() : null,
      createdAt: t.created_at,
      created_at: t.created_at,
    }));

    res.json({
      success: true,
      data: {
        tips: formattedTips,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// --- Bulk Verify All Pending Bank Transfers ---
router.post('/tips/verify-all', async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user!.businessId!;
    const unverifiedTips = await prisma.tip.findMany({
      where: {
        business_id: businessId,
        payment_status: { in: ['UNVERIFIED', 'PENDING'] },
      },
      select: { id: true, amount: true, payment_method: true },
    });

    if (unverifiedTips.length === 0) {
      res.json({ success: true, count: 0, message: 'Onay bekleyen transfer bulunmuyor.' });
      return;
    }

    const tipIds = unverifiedTips.map((t) => t.id);
    await prisma.tip.updateMany({
      where: { id: { in: tipIds } },
      data: { payment_status: 'SUCCESS' },
    });

    await auditService.createAuditLog({
      actorUserId: req.user?.id,
      businessId,
      action: 'BULK_TIPS_VERIFIED',
      entityType: 'TIP',
      metadata: {
        count: unverifiedTips.length,
        tipIds,
      },
    });

    res.json({
      success: true,
      count: unverifiedTips.length,
      message: `${unverifiedTips.length} adet transfer başarıyla onaylandı ve hacme eklendi.`,
    });
  } catch (error) {
    next(error);
  }
});

// --- Bulk Reject All Pending Bank Transfers (if fake/unpaid/test) ---
router.post('/tips/reject-all', async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.user!.businessId!;
    const unverifiedTips = await prisma.tip.findMany({
      where: {
        business_id: businessId,
        payment_status: { in: ['UNVERIFIED', 'PENDING'] },
      },
      select: { id: true },
    });

    if (unverifiedTips.length === 0) {
      res.json({ success: true, count: 0, message: 'İptal edilecek onay bekleyen transfer bulunmuyor.' });
      return;
    }

    const tipIds = unverifiedTips.map((t) => t.id);
    await prisma.tip.updateMany({
      where: { id: { in: tipIds } },
      data: { payment_status: 'CANCELLED' },
    });

    await auditService.createAuditLog({
      actorUserId: req.user?.id,
      businessId,
      action: 'BULK_TIPS_REJECTED',
      entityType: 'TIP',
      metadata: {
        count: unverifiedTips.length,
        tipIds,
      },
    });

    res.json({
      success: true,
      count: unverifiedTips.length,
      message: `${unverifiedTips.length} adet transfer iptal edildi ve kaldırıldı.`,
    });
  } catch (error) {
    next(error);
  }
});

// --- Verify Tip (Confirm incoming IBAN bank transfer) ---
router.put('/tips/:id/verify', async (req: AuthRequest, res, next) => {
  try {
    const tipId = req.params.id as string;
    const businessId = req.user!.businessId!;

    const tip = await prisma.tip.findFirst({
      where: { id: tipId, business_id: businessId },
    });

    if (!tip) {
      res.status(404).json({ success: false, error: 'Bahşiş kaydı bulunamadı.' });
      return;
    }

    if (tip.payment_status === 'SUCCESS') {
      res.status(400).json({ success: false, error: 'Bu bahşiş zaten onaylanmış.' });
      return;
    }

    if (tip.payment_status === 'CANCELLED') {
      res.status(400).json({ success: false, error: 'İptal edilmiş bir bahşiş tekrar onaylanamaz.' });
      return;
    }

    const updatedTip = await prisma.tip.update({
      where: { id: tip.id },
      data: {
        payment_status: 'SUCCESS',
      },
    });

    // Record audit log entry
    await auditService.createAuditLog({
      actorUserId: req.user?.id,
      businessId,
      action: 'TIP_VERIFIED',
      entityType: 'TIP',
      entityId: tip.id,
      metadata: {
        amount: tip.amount,
        currency: tip.currency,
        previousStatus: tip.payment_status,
        paymentMethod: tip.payment_method,
      },
    });

    // Automatically send verified receipt email if customer requested it
    let autoReceiptSent = false;
    let recipientEmail: string | null = null;
    try {
      const pendingReceiptLog = await prisma.auditLog.findFirst({
        where: {
          entity_type: 'TIP',
          entity_id: tip.id,
          action: 'RECEIPT_EMAIL_REQUESTED',
        },
        orderBy: { created_at: 'desc' },
      });

      if (pendingReceiptLog && pendingReceiptLog.metadata) {
        const meta = pendingReceiptLog.metadata as any;
        const targetEmail = meta.email;
        const lang = meta.language || 'tr';
        if (targetEmail && typeof targetEmail === 'string' && targetEmail.includes('@')) {
          recipientEmail = targetEmail;
          const fullTip = await prisma.tip.findUnique({
            where: { id: tip.id },
            include: { business: true, table: true, employee: true },
          });

          if (fullTip) {
            const refCode = meta.referenceCode || `TIP-${fullTip.id.slice(0, 8).toUpperCase()}`;
            const staffName = fullTip.employee ? `${fullTip.employee.first_name} ${fullTip.employee.last_name}`.trim() : null;
            const isIban = (fullTip.payment_method || '').toUpperCase().includes('IBAN') || (fullTip.payment_method || '').toUpperCase().includes('BANK');
            const paymentMethodLabel = isIban
              ? (lang === 'tr' ? 'Doğrudan Havale / IBAN' : 'Bank Transfer / IBAN')
              : (lang === 'tr' ? 'Kart / Online Ödeme' : 'Credit Card / Online Payment');

            await emailService.sendDigitalReceiptEmail({
              to: targetEmail.trim(),
              businessName: fullTip.business.name,
              referenceNo: refCode,
              amount: Number(fullTip.amount),
              currency: fullTip.currency || fullTip.business.currency || 'TRY',
              paymentMethod: paymentMethodLabel,
              dateStr: new Date(fullTip.created_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'),
              tableName: fullTip.table?.name || null,
              staffName,
              lang,
            });

            await auditService.createAuditLog({
              actorUserId: req.user?.id,
              businessId,
              action: 'RECEIPT_EMAIL_AUTO_SENT',
              entityType: 'TIP',
              entityId: tip.id,
              metadata: {
                recipientEmail: targetEmail.trim(),
                sentAt: new Date().toISOString(),
              },
            });
            autoReceiptSent = true;
          }
        }
      }
    } catch (receiptErr) {
      console.warn('Auto receipt dispatch warning on tip verify:', receiptErr);
    }

    res.json({
      success: true,
      data: updatedTip,
      receiptSent: autoReceiptSent,
      recipientEmail,
      message: autoReceiptSent
        ? 'Banka transferi onaylandı ve müşteriye resmi makbuz e-posta ile iletildi.'
        : 'Banka transferi başarıyla onaylandı ve kesinleştirildi.',
    });
  } catch (error) {
    next(error);
  }
});

// --- Send Receipt for Verified Tip (Manual trigger from venue dashboard) ---
router.post('/tips/:id/send-receipt', async (req: AuthRequest, res, next) => {
  try {
    const tipId = req.params.id as string;
    const businessId = req.user!.businessId!;
    const { email, language } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Geçerli bir e-posta adresi giriniz.' });
      return;
    }

    const tip = await prisma.tip.findFirst({
      where: { id: tipId, business_id: businessId },
      include: { business: true, table: true, employee: true },
    });

    if (!tip) {
      res.status(404).json({ success: false, error: 'Bahşiş kaydı bulunamadı.' });
      return;
    }

    if (tip.payment_status !== 'SUCCESS') {
      res.status(400).json({
        success: false,
        error: 'Havale henüz onaylanmamış. Doğrulanmış makbuz göndermek için lütfen önce havaleyi onaylayınız.',
      });
      return;
    }

    const refCode = `TIP-${tip.id.slice(0, 8).toUpperCase()}`;
    const staffName = tip.employee ? `${tip.employee.first_name} ${tip.employee.last_name}`.trim() : null;
    const isIban = (tip.payment_method || '').toUpperCase().includes('IBAN') || (tip.payment_method || '').toUpperCase().includes('BANK');
    const paymentMethodLabel = isIban
      ? (language === 'tr' ? 'Doğrudan Havale / IBAN' : 'Bank Transfer / IBAN')
      : (language === 'tr' ? 'Kart / Online Ödeme' : 'Credit Card / Online Payment');

    await emailService.sendDigitalReceiptEmail({
      to: email.trim(),
      businessName: tip.business.name,
      referenceNo: refCode,
      amount: Number(tip.amount),
      currency: tip.currency || tip.business.currency || 'TRY',
      paymentMethod: paymentMethodLabel,
      dateStr: new Date(tip.created_at).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US'),
      tableName: tip.table?.name || null,
      staffName,
      lang: language || 'tr',
    });

    res.json({ success: true, message: 'Doğrulanmış makbuz müşteriye başarıyla iletildi.' });
  } catch (error) {
    next(error);
  }
});

// --- Reject Tip (Mark IBAN bank transfer as not received / cancelled) ---
router.put('/tips/:id/reject', async (req: AuthRequest, res, next) => {
  try {
    const tipId = req.params.id as string;
    const businessId = req.user!.businessId!;

    const tip = await prisma.tip.findFirst({
      where: { id: tipId, business_id: businessId },
    });

    if (!tip) {
      res.status(404).json({ success: false, error: 'Bahşiş kaydı bulunamadı.' });
      return;
    }

    if (tip.payment_status === 'CANCELLED') {
      res.status(400).json({ success: false, error: 'Bu bahşiş zaten iptal edilmiş.' });
      return;
    }

    if (tip.payment_status === 'SUCCESS') {
      res.status(400).json({ success: false, error: 'Onaylanmış bir bahşiş doğrudan iptal edilemez.' });
      return;
    }

    const updatedTip = await prisma.tip.update({
      where: { id: tip.id },
      data: {
        payment_status: 'CANCELLED',
      },
    });

    // Record audit log entry
    await auditService.createAuditLog({
      actorUserId: req.user?.id,
      businessId,
      action: 'TIP_REJECTED',
      entityType: 'TIP',
      entityId: tip.id,
      metadata: {
        amount: tip.amount,
        currency: tip.currency,
        previousStatus: tip.payment_status,
        paymentMethod: tip.payment_method,
      },
    });

    res.json({
      success: true,
      data: updatedTip,
      message: 'Banka transferi alınmadı olarak işaretlendi ve iptal edildi.',
    });
  } catch (error) {
    next(error);
  }
});

// --- Customer Feedbacks & Reviews ---
router.get('/feedbacks', async (req: AuthRequest, res, next) => {
  try {
    const feedbackService = await import('../services/feedback.service');
    const data = await feedbackService.getBusinessFeedbacks(req.user!.businessId!, {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      employeeId: req.query.employeeId as string | undefined,
      rating: req.query.rating ? parseInt(req.query.rating as string, 10) : undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// --- Tip Distribution & Pool Settings ---
router.get('/tip-distribution-settings', async (req: AuthRequest, res, next) => {
  try {
    const settings = await tipPoolService.getTipDistributionSettings(req.user!.businessId!);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

const updateTipDistributionSchema = {
  body: z.object({
    tip_distribution_mode: z.nativeEnum(TipDistributionMode).optional(),
    pos_fee_payer: z.nativeEnum(PosFeePayer).optional(),
    custom_pos_fee_rate: z.number().min(0).max(100).nullable().optional(),
    tax_deduction_enabled: z.boolean().optional(),
    tax_deduction_rate: z.number().min(0).max(100).nullable().optional(),
  }),
};

router.put(
  '/tip-distribution-settings',
  validate(updateTipDistributionSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const updated = await tipPoolService.updateTipDistributionSettings(
        req.user!.businessId!,
        req.body
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// --- Tip Pool Simulation & Settlement ---
router.get('/tip-pool/simulation', async (req: AuthRequest, res, next) => {
  try {
    let activeEmployeeIds: string[] | undefined;
    if (req.query.activeEmployeeIds) {
      if (Array.isArray(req.query.activeEmployeeIds)) {
        activeEmployeeIds = req.query.activeEmployeeIds as string[];
      } else if (typeof req.query.activeEmployeeIds === 'string') {
        activeEmployeeIds = (req.query.activeEmployeeIds as string).split(',').map((id) => id.trim()).filter(Boolean);
      }
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const manualCashAmount = req.query.manualCashAmount ? parseFloat(req.query.manualCashAmount as string) : undefined;
    const manualPosAmount = req.query.manualPosAmount ? parseFloat(req.query.manualPosAmount as string) : undefined;
    const deductPosFeeFromManualPos = req.query.deductPosFeeFromManualPos !== undefined
      ? req.query.deductPosFeeFromManualPos === 'true'
      : undefined;

    const simulation = await tipPoolService.getTipPoolSimulation(req.user!.businessId!, {
      startDate,
      endDate,
      activeEmployeeIds,
      manualCashAmount,
      manualPosAmount,
      deductPosFeeFromManualPos,
    });
    res.json({ success: true, data: simulation });
  } catch (error) {
    next(error);
  }
});

const settleTipPoolSchema = {
  body: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    note: z.string().optional(),
    active_employee_ids: z.array(z.string()).optional(),
    manual_cash_amount: z.number().min(0).optional(),
    manual_pos_amount: z.number().min(0).optional(),
    deduct_pos_fee_from_manual_pos: z.boolean().optional(),
  }),
};

router.post(
  '/tip-pool/settle',
  validate(settleTipPoolSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const distribution = await tipPoolService.settleTipPool(
        req.user!.businessId!,
        {
          startDate: req.body.start_date,
          endDate: req.body.end_date,
          notes: req.body.note,
          activeEmployeeIds: req.body.active_employee_ids,
          manualCashAmount: req.body.manual_cash_amount,
          manualPosAmount: req.body.manual_pos_amount,
          deductPosFeeFromManualPos: req.body.deduct_pos_fee_from_manual_pos,
        }
      );
      res.status(201).json({
        success: true,
        data: distribution,
        message: 'Bahşiş havuz dağıtımı başarıyla kesinleştirildi ve kaydedildi.',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/tip-pool/history', async (req: AuthRequest, res, next) => {
  try {
    const rawPage = parseInt(req.query.page as string || '1', 10) || 1;
    const page = Math.max(1, rawPage);
    const rawLimit = parseInt(req.query.limit as string || '20', 10) || 20;
    const limit = Math.min(100, Math.max(1, rawLimit));

    const history = await tipPoolService.getTipPoolHistory(req.user!.businessId!, page, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

router.put('/tip-pool/shares/:id/pay', async (req: AuthRequest, res, next) => {
  try {
    const isPaid = req.body.is_paid !== false;
    const updated = await tipPoolService.markSharePaymentStatus(
      req.user!.businessId!,
      req.params.id as string,
      isPaid
    );
    res.json({ success: true, data: updated, message: 'Personel payı ödeme durumu güncellendi.' });
  } catch (error) {
    next(error);
  }
});

router.put('/tip-pool/distributions/:id/pay-all', async (req: AuthRequest, res, next) => {
  try {
    const updated = await tipPoolService.markDistributionAllPaid(
      req.user!.businessId!,
      req.params.id as string
    );
    res.json({ success: true, data: updated, message: 'Tüm personel payları ödendi olarak işaretlendi.' });
  } catch (error) {
    next(error);
  }
});

// --- Membership & Plan Capabilities Guard ---
router.get('/plan-status', async (req: AuthRequest, res, next) => {
  try {
    const status = await planGuardService.getBusinessPlanStatus(req.user!.businessId!);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

export default router;
