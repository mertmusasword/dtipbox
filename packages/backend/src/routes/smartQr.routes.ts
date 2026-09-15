import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as smartQrService from '../services/smartQr.service';

const router = Router();

// Abuse protection for public interactions
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
});

// Helper to get businessId safely
const getBizId = (req: any) => (req as AuthRequest).user?.businessId || req.user?.business?.id;

// ==================== BUSINESS MANAGEMENT (AUTH REQUIRED) ====================

// GET /api/smart-qr/config
router.get('/config', authenticate, authorize('BUSINESS', 'ADMIN'), requireBusinessOwnership, async (req: any, res, next) => {
  try {
    const businessId = getBizId(req);
    const config = await smartQrService.getOrCreateSmartQrConfig(businessId);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

// PUT /api/smart-qr/config
router.put('/config', authenticate, authorize('BUSINESS', 'ADMIN'), requireBusinessOwnership, async (req: any, res, next) => {
  try {
    const businessId = getBizId(req);
    const config = await smartQrService.updateSmartQrConfig(businessId, req.body);
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

// GET /api/smart-qr/campaigns
router.get('/campaigns', authenticate, authorize('BUSINESS', 'ADMIN'), requireBusinessOwnership, async (req: any, res, next) => {
  try {
    const businessId = getBizId(req);
    const campaigns = await smartQrService.getCampaigns(businessId);
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
});

const createCampaignSchema = {
  body: z.object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().max(1000).optional(),
    badge: z.string().trim().max(50).optional(),
    discount_code: z.string().trim().max(50).optional(),
    expires_at: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
  }),
};

// POST /api/smart-qr/campaigns
router.post(
  '/campaigns',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  validate(createCampaignSchema),
  async (req: any, res, next) => {
    try {
      const businessId = getBizId(req);
      const campaign = await smartQrService.createCampaign(businessId, req.body);
      res.status(201).json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/smart-qr/campaigns/:id
router.put(
  '/campaigns/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req: any, res, next) => {
    try {
      const businessId = getBizId(req);
      const campaign = await smartQrService.updateCampaign(businessId, req.params.id, req.body);
      res.json({ success: true, data: campaign });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/smart-qr/campaigns/:id
router.delete(
  '/campaigns/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req: any, res, next) => {
    try {
      const businessId = getBizId(req);
      const result = await smartQrService.deleteCampaign(businessId, req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/smart-qr/leads
router.get('/leads', authenticate, authorize('BUSINESS', 'ADMIN'), requireBusinessOwnership, async (req: any, res, next) => {
  try {
    const businessId = getBizId(req);
    const leads = await smartQrService.getCustomerLeads(businessId);
    res.json({ success: true, data: leads });
  } catch (err) {
    next(err);
  }
});

// GET /api/smart-qr/analytics
router.get('/analytics', authenticate, authorize('BUSINESS', 'ADMIN'), requireBusinessOwnership, async (req: any, res, next) => {
  try {
    const businessId = getBizId(req);
    const analytics = await smartQrService.getSmartQrAnalytics(businessId);
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
});

// ==================== PUBLIC SMART QR CUSTOMER ENDPOINTS ====================

const publicLeadSchema = {
  params: z.object({
    publicToken: z.string().min(1).max(100),
  }),
  body: z.object({
    name: z.string().trim().max(100).optional(),
    email: z.string().trim().email().max(150).optional().or(z.literal('')),
    phone: z.string().trim().max(35).optional().or(z.literal('')),
    consent_marketing: z.boolean().optional(),
  }),
};

// POST /api/smart-qr/public/:publicToken/lead
router.post(
  '/public/:publicToken/lead',
  publicLimiter,
  validate(publicLeadSchema),
  async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for']?.toString();
      const lead = await smartQrService.submitCustomerLead(req.params.publicToken as string, {
        ...req.body,
        ip_address: ip,
      });
      res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  }
);

const publicFeedbackSchema = {
  params: z.object({
    publicToken: z.string().min(1).max(100),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(500).optional(),
  }),
};

// POST /api/smart-qr/public/:publicToken/feedback
router.post(
  '/public/:publicToken/feedback',
  publicLimiter,
  validate(publicFeedbackSchema),
  async (req, res, next) => {
    try {
      const feedback = await smartQrService.submitSmartQrFeedback(
        req.params.publicToken as string,
        req.body
      );
      res.status(201).json({ success: true, data: feedback });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/smart-qr/public/:publicToken/event
router.post('/public/:publicToken/event', publicLimiter, async (req, res, next) => {
  try {
    const { event_type, metadata } = req.body;
    if (!event_type) {
      res.status(400).json({ success: false, error: 'event_type is required' });
      return;
    }
    const result = await smartQrService.recordSmartQrEvent(
      req.params.publicToken as string,
      event_type,
      metadata
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
