import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import {
  listStoreProducts,
  getStoreProduct,
  createStoreOrder,
  getBusinessOrders,
  getOrderById,
  markTransferSent,
  listAllOrdersAdmin,
  updateOrderStatusAdmin,
  listAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} from '../services/store.service';

const router = Router();

const storeOrderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Çok fazla sipariş oluşturma denemesi yapıldı. Lütfen biraz bekleyiniz.',
  },
});

/**
 * GET /api/store/products
 * List all active products
 */
router.get('/products', async (_req, res: Response, next) => {
  try {
    const products = await listStoreProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/store/products/:id
 * Get single product details
 */
router.get('/products/:id', async (req, res: Response, next) => {
  try {
    const product = await getStoreProduct(req.params.id as string);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/store/orders
 * Create new store order (Business)
 */
router.post(
  '/orders',
  storeOrderLimiter,
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const businessId = req.user!.businessId!;
      const result = await createStoreOrder(businessId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/store/orders/my-orders
 * List orders of current business
 */
router.get(
  '/orders/my-orders',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  requireBusinessOwnership,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const businessId = req.user!.businessId!;
      const orders = await getBusinessOrders(businessId);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/store/orders/:id
 * Get order details and bank wire instructions
 */
router.get(
  '/orders/:id',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const isPrivilegedAdmin = req.user!.role === 'ADMIN';
      const businessId = isPrivilegedAdmin ? undefined : req.user!.businessId;
      const result = await getOrderById(req.params.id as string, businessId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/store/orders/:id/transfer-sent
 * Business declares that bank wire was completed
 */
router.post(
  '/orders/:id/transfer-sent',
  authenticate,
  authorize('BUSINESS', 'ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const businessId = req.user?.role === 'ADMIN' ? undefined : req.user?.businessId;
      const order = await markTransferSent(req.params.id as string, businessId, req.body.note);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/store/admin/orders
 * Admin: List all orders
 */
router.get(
  '/admin/orders',
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const orders = await listAllOrdersAdmin({
        status: req.query.status as any,
        search: req.query.search as string,
      });
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/store/admin/orders/:id/status
 * Admin: Update order status & carrier info
 */
router.patch(
  '/admin/orders/:id/status',
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const order = await updateOrderStatusAdmin(req.params.id as string, req.body);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/store/admin/products
 * Admin: List all products
 */
router.get(
  '/admin/products',
  authenticate,
  authorize('ADMIN'),
  async (_req: AuthRequest, res: Response, next) => {
    try {
      const products = await listAllProductsAdmin();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/store/admin/products
 * Admin: Create a new product
 */
router.post(
  '/admin/products',
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const product = await createProductAdmin(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/store/admin/products/:id
 * Admin: Update product details, sizes & prices
 */
router.put(
  '/admin/products/:id',
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const product = await updateProductAdmin(req.params.id as string, req.body);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/store/admin/products/:id
 * Admin: Delete or deactivate product
 */
router.delete(
  '/admin/products/:id',
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const result = await deleteProductAdmin(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
