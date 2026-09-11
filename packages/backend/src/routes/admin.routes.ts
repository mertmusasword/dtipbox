import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import * as adminService from '../services/admin.service';
import * as auditService from '../services/audit.service';
import * as providerService from '../services/payment/provider.service';
import * as agreementService from '../services/agreement.service';
import * as corporateService from '../services/corporate.service';
import * as supportService from '../services/support.service';
import { ProviderCatalogStatus, ProviderRequestStatus } from '@prisma/client';

const router = Router();

// Only ADMIN can access
router.use(authenticate);
router.use(authorize('ADMIN'));

// Safely parse and clamp pagination parameters to prevent DoS via huge take or negative skip
function parsePagination(query: any, defaultLimit = 20) {
  const page = Math.max(1, parseInt(query.page as string || '1', 10) || 1);
  const rawLimit = parseInt(query.limit as string || String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(100, Math.max(1, rawLimit));
  return { page, limit };
}

router.get('/businesses', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 20);
    const data = await adminService.getAdminBusinesses(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/businesses/:id', async (req, res, next) => {
  try {
    const data = await adminService.getAdminBusinessDetails(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

const toggleStatusSchema = {
  body: z.object({
    is_active: z.boolean(),
  }),
};

router.put('/businesses/:id/status', validate(toggleStatusSchema), async (req: AuthRequest, res, next) => {
  try {
    const data = await adminService.toggleBusinessStatus(
      req.params.id as string,
      req.body.is_active,
      req.user!.id
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/statistics', async (_req, res, next) => {
  try {
    const stats = await adminService.getAdminPlatformStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/employees', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 30);
    const data = await adminService.getAdminEmployees(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/qr', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 30);
    const data = await adminService.getAdminQrs(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 30);
    const data = await adminService.getAdminPayments(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 50);
    const data = await auditService.getAllAuditLogs(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// --- Payment Providers Management ---

// 1. Get full platform provider catalog with metrics
router.get('/payment-providers/catalog', async (_req, res, next) => {
  try {
    const data = await providerService.getAdminCatalog();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 2. Update provider catalog status (strict guard: cannot set ACTIVE if has_adapter: false)
const updateProviderStatusSchema = {
  body: z.object({
    status: z.nativeEnum(ProviderCatalogStatus),
  }),
};

router.put('/payment-providers/:id/status', validate(updateProviderStatusSchema), async (req: AuthRequest, res, next) => {
  try {
    const updated = await providerService.updateProviderStatus(
      req.params.id as string,
      req.body.status,
      req.user!.id
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// 3. Get merchant unlisted provider requests
router.get('/payment-providers/requests', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 20);
    const data = await providerService.getAdminProviderRequests(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 4. Update status of a merchant provider request
const updateRequestStatusSchema = {
  body: z.object({
    status: z.nativeEnum(ProviderRequestStatus),
  }),
};

router.put('/payment-providers/requests/:id/status', validate(updateRequestStatusSchema), async (req: AuthRequest, res, next) => {
  try {
    const updated = await providerService.updateProviderRequestStatus(
      req.params.id as string,
      req.body.status,
      req.user!.id
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ==================== AGREEMENTS (SÖZLEŞMELER) ====================

// 1. List all agreements and versions
router.get('/agreements', async (_req, res, next) => {
  try {
    const data = await agreementService.getAdminAgreements();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 2. Create a new draft agreement version
const createVersionSchema = {
  body: z.object({
    agreementCode: z.string().optional(),
    version: z.string().min(1, 'Versiyon zorunludur'),
    title: z.string().min(1, 'Başlık zorunludur'),
    contentMarkdown: z.string().min(10, 'Sözleşme metni zorunludur'),
    requiresReacceptance: z.boolean().optional(),
    effectiveDate: z.string().optional(),
  }),
};

router.post('/agreements/versions', validate(createVersionSchema), async (req: AuthRequest, res, next) => {
  try {
    const { agreementCode, version, title, contentMarkdown, requiresReacceptance, effectiveDate } = req.body;
    const data = await agreementService.createAgreementVersion({
      agreementCode,
      version,
      title,
      contentMarkdown,
      requiresReacceptance,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      adminUserId: req.user!.id,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 3. Publish a draft agreement version (immutable)
router.post('/agreements/versions/:id/publish', async (req: AuthRequest, res, next) => {
  try {
    const data = await agreementService.publishAgreementVersion(req.params.id as string, req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 4. Get acceptance audit logs
router.get('/agreements/audit', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 20);
    const businessId = req.query.businessId as string | undefined;
    const versionId = req.query.versionId as string | undefined;

    const data = await agreementService.getAcceptanceAuditLogs({
      page,
      limit,
      businessId,
      versionId,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 5. Get businesses requiring re-acceptance
router.get('/agreements/pending', async (_req, res, next) => {
  try {
    const data = await agreementService.getPendingReacceptanceBusinesses();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ==================== Corporate Applications ====================

// 1. List corporate applications with pagination & status filter
router.get('/corporate-applications', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 20);
    const status = req.query.status as any;
    const data = await corporateService.getCorporateApplications(page, limit, status);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 2. Update status & admin notes
const updateStatusSchema = {
  body: z.object({
    status: z.enum(['NEW', 'CONTACTED', 'IN_DISCUSSION', 'COMPLETED', 'REJECTED']),
    adminNotes: z.string().optional(),
  }),
};

router.patch('/corporate-applications/:id/status', validate(updateStatusSchema), async (req, res, next) => {
  try {
    const updated = await corporateService.updateCorporateApplicationStatus(
      req.params.id as string,
      req.body.status,
      req.body.adminNotes
    );
    res.json({ success: true, data: updated, message: 'Başvuru durumu güncellendi' });
  } catch (error) {
    next(error);
  }
});

// 3. Delete corporate application
router.delete('/corporate-applications/:id', async (req, res, next) => {
  try {
    const result = await corporateService.deleteCorporateApplication(req.params.id as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ==================== Support Tickets ====================

// 1. List support tickets with pagination, status & category filters and search
router.get('/support-tickets', async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query, 20);
    const status = req.query.status as any;
    const category = req.query.category as any;
    const search = req.query.search as string;
    const data = await supportService.getSupportTickets(page, limit, status, category, search);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// 2. Update support ticket status & admin notes
const updateTicketStatusSchema = {
  body: z.object({
    status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    adminNotes: z.string().optional(),
    admin_notes: z.string().optional(),
  }),
};

router.patch('/support-tickets/:id/status', validate(updateTicketStatusSchema), async (req, res, next) => {
  try {
    const adminNotes = req.body.adminNotes || req.body.admin_notes;
    const updated = await supportService.updateSupportTicketStatus(
      req.params.id as string,
      req.body.status,
      adminNotes
    );
    res.json({ success: true, data: updated, message: 'Destek talebi durumu güncellendi' });
  } catch (error) {
    next(error);
  }
});

// 3. Delete support ticket
router.delete('/support-tickets/:id', async (req, res, next) => {
  try {
    const result = await supportService.deleteSupportTicket(req.params.id as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
