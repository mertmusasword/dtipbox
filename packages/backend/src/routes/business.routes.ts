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
import * as auditService from '../services/audit.service';
import { PaymentMethodType, PaymentMethodStatus, QrType } from '@prisma/client';
import { requireAcceptedAgreement } from '../middleware/agreement.middleware';
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

const updateBusinessSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    logo: z.string().url().nullable().optional(),
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
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    position: z.string().optional(),
    avatar: z.string().nullable().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
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
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    position: z.string().optional(),
    avatar: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
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

    const updatedTip = await prisma.tip.update({
      where: { id: tip.id },
      data: {
        payment_status: 'SUCCESS',
      },
    });

    res.json({
      success: true,
      data: updatedTip,
      message: 'Banka transferi başarıyla onaylandı ve kesinleştirildi.',
    });
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

    const updatedTip = await prisma.tip.update({
      where: { id: tip.id },
      data: {
        payment_status: 'CANCELLED',
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

export default router;
