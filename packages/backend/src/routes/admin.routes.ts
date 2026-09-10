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

router.get('/businesses', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
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

router.get('/payments', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '30', 10);
    const data = await adminService.getAdminPayments(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const data = await auditService.getAllAuditLogs(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
