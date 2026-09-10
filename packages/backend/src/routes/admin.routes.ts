import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import * as adminService from '../services/admin.service';
import * as auditService from '../services/audit.service';

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

export default router;
