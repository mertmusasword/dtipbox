import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import * as businessService from '../services/business.service';
import * as employeeService from '../services/employee.service';
import * as tableService from '../services/table.service';
import * as qrService from '../services/qr.service';
import * as paymentMethodService from '../services/paymentMethod.service';
import * as analyticsService from '../services/analytics.service';
import * as auditService from '../services/audit.service';
import { PaymentMethodType, PaymentMethodStatus, QrType } from '@prisma/client';

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

router.post('/payment-account', validate(paymentAccountSchema), async (req: AuthRequest, res, next) => {
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
    avatar: z.string().url().nullable().optional(),
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
    avatar: z.string().url().nullable().optional(),
    is_active: z.boolean().optional(),
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

router.post('/qr', validate(createQrSchema), async (req: AuthRequest, res, next) => {
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
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const logs = await auditService.getAuditLogs(req.user!.businessId!, page, limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
