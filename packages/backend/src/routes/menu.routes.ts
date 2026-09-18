import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as menuService from '../services/menu.service';

const router = Router();

// Public Rate Limiter for Menu Browsing (Generous for real customers)
const publicMenuLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
});

const getBizId = (req: any) => (req as AuthRequest).user?.businessId || req.user?.business?.id;

// ==================== PUBLIC CUSTOMER MENU ROUTE ====================

// GET /api/menu/public/:publicToken
router.get('/public/:publicToken', publicMenuLimiter, async (req, res, next) => {
  try {
    const publicToken = req.params.publicToken as string;
    const menuData = await menuService.getPublicMenu(publicToken);
    res.json({
      success: true,
      data: menuData,
    });
  } catch (err) {
    next(err);
  }
});

// ==================== BUSINESS MENU MANAGEMENT (AUTH REQUIRED) ====================

// GET /api/business/menu
router.get('/', authenticate, authorize('BUSINESS', 'ADMIN'), requireBusinessOwnership, async (req, res, next) => {
  try {
    const businessId = getBizId(req);
    const menu = await menuService.getBusinessMenu(businessId);
    res.json({ success: true, data: menu });
  } catch (err) {
    next(err);
  }
});

const updateMenuConfigSchema = {
  body: z.object({
    menu_mode: z.enum(['DISABLED', 'EXTERNAL_URL', 'NATIVE']).optional(),
    primary_action: z.enum(['TIP', 'MENU']).optional(),
    menu_url: z.string().trim().max(1000).optional().nullable(),
    menu_title: z.string().trim().max(100).optional().nullable(),
  }),
};

// PUT /api/business/menu/config
router.put(
  '/config',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  validate(updateMenuConfigSchema),
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const updated = await menuService.updateMenuConfig(businessId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

const createCategorySchema = {
  body: z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional().nullable(),
    sort_order: z.number().int().optional(),
  }),
};

// POST /api/business/menu/categories
router.post(
  '/categories',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  validate(createCategorySchema),
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const category = await menuService.createCategory(businessId, req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/business/menu/categories/reorder
router.put(
  '/categories/reorder',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const { categoryIds } = req.body;
      const result = await menuService.reorderCategories(businessId, categoryIds);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

const updateCategorySchema = {
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
};

// PUT /api/business/menu/categories/:id
router.put(
  '/categories/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  validate(updateCategorySchema),
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const category = await menuService.updateCategory(businessId, req.params.id as string, req.body);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/business/menu/categories/:id
router.delete(
  '/categories/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const result = await menuService.deleteCategory(businessId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

const createMenuItemSchema = {
  body: z.object({
    category_id: z.string().uuid(),
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(1000).optional().nullable(),
    price: z.number().min(0),
    currency: z.string().trim().length(3).optional(),
    image_url: z.string().trim().max(2000).optional().nullable(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
    allergens: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
};

// POST /api/business/menu/items
router.post(
  '/items',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  validate(createMenuItemSchema),
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const item = await menuService.createMenuItem(businessId, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/business/menu/items/reorder
router.put(
  '/items/reorder',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const { itemIds } = req.body;
      const result = await menuService.reorderMenuItems(businessId, itemIds);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/business/menu/items/:id/status
router.patch(
  '/items/:id/status',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const { is_active } = req.body;
      const updated = await menuService.toggleMenuItemStatus(businessId, req.params.id as string, Boolean(is_active));
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

const updateMenuItemSchema = {
  body: z.object({
    category_id: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    price: z.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    image_url: z.string().trim().max(2000).optional().nullable(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().optional(),
    allergens: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
};

// PUT /api/business/menu/items/:id
router.put(
  '/items/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  validate(updateMenuItemSchema),
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const item = await menuService.updateMenuItem(businessId, req.params.id as string, req.body);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/business/menu/items/:id
router.delete(
  '/items/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req, res, next) => {
    try {
      const businessId = getBizId(req);
      const result = await menuService.deleteMenuItem(businessId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
