import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { loyaltyService } from '../services/loyalty.service';
import { authenticate, authorize, requireBusinessOwnership, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Anti-abuse rate limiter for public loyalty endpoints (max 60 requests per 15 min per IP)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'Çok fazla istek yapıldı, lütfen birkaç dakika sonra tekrar deneyiniz.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dynamic QR token generation limiter (max 60 token gens per 5 min)
const tokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'Token yenileme limitine ulaşıldı, lütfen biraz bekleyiniz.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// 1. PUBLIC CUSTOMER ROUTES
// ==========================================

/**
 * GET /api/loyalty/enroll/:businessId or /api/loyalty/program/:businessId
 * Returns business name, logo, active loyalty program for customer registration
 */
router.get(['/enroll/:businessId', '/program/:businessId'], publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await loyaltyService.getPublicEnrollmentInfo(req.params.businessId as string);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loyalty/enroll
 * Registers customer with email, creates/retrieves loyalty card
 */
const enrollSchema = z.object({
  businessId: z.string().uuid().optional(),
  business_id: z.string().uuid().optional(),
  programId: z.string().uuid().optional(),
  program_id: z.string().uuid().optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  name: z.string().max(100).optional(),
});

router.post('/enroll', publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = enrollSchema.parse(req.body);
    const bId = parsed.businessId || parsed.business_id;
    if (!bId) {
      throw new AppError('İşletme kimliği zorunludur', 400);
    }
    const result = await loyaltyService.enrollCustomer({
      businessId: bId,
      programId: parsed.programId || parsed.program_id,
      email: parsed.email,
      name: parsed.name,
    });
    res.status(result.isNew ? 201 : 200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/loyalty/card/:publicId
 * Gets public customer card data (stamps, reward info, business details)
 */
router.get('/card/:publicId', publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await loyaltyService.getCardByPublicId(req.params.publicId as string);
    res.json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
});

/**
 * GET or POST /api/loyalty/card/:publicId/token
 * Generates fresh short-lived dynamic QR token for customer screen
 */
router.all('/card/:publicId/token', tokenLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenData = await loyaltyService.generateCardScanToken(req.params.publicId as string);
    res.json({ success: true, data: tokenData });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loyalty/card/:publicId/redeem-request
 * Customer requests reward redemption verification code
 */
router.post('/card/:publicId/redeem-request', publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redemption = await loyaltyService.requestCardRedemption(req.params.publicId as string);
    res.json({ success: true, data: redemption });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/loyalty/recover
 * Customer requests their active loyalty cards via email
 */
const recoverSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  businessId: z.string().uuid().optional(),
  business_id: z.string().uuid().optional(),
});

router.post('/recover', publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = recoverSchema.parse(req.body);
    const result = await loyaltyService.recoverCardsByEmail(
      parsed.email,
      parsed.businessId || parsed.business_id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. BUSINESS MANAGEMENT PROTECTED ROUTES
// ==========================================

/**
 * GET /api/loyalty/business/program
 * Get current business loyalty program & enrollment link
 */
router.get(
  '/business/program',
  authenticate,
  authorize(Role.BUSINESS, Role.ADMIN),
  requireBusinessOwnership,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId!;
      const program = await loyaltyService.getBusinessProgram(businessId);
      res.json({ success: true, data: program });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/loyalty/business/program
 * Create or update business loyalty program
 */
const programSchema = z.object({
  name: z.string().min(2, 'Program adı en az 2 karakter olmalıdır'),
  targetStamps: z.coerce.number().int().min(2).max(50).optional(),
  target_stamps: z.coerce.number().int().min(2).max(50).optional(),
  rewardDescription: z.string().optional(),
  reward_description: z.string().optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

router.put(
  '/business/program',
  authenticate,
  authorize(Role.BUSINESS, Role.ADMIN),
  requireBusinessOwnership,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = programSchema.parse(req.body);
      const target = parsed.targetStamps ?? parsed.target_stamps ?? 10;
      const reward = (parsed.rewardDescription ?? parsed.reward_description ?? '').trim();
      if (!reward || reward.length < 2) {
        throw new AppError('Ödül açıklaması en az 2 karakter olmalıdır', 400);
      }
      const businessId = req.user!.businessId!;
      const updated = await loyaltyService.upsertBusinessProgram(businessId, {
        name: parsed.name,
        targetStamps: target,
        rewardDescription: reward,
        isActive: parsed.isActive ?? parsed.is_active ?? true,
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/loyalty/business/stats
 * Overview numbers for business loyalty dashboard
 */
router.get(
  '/business/stats',
  authenticate,
  authorize(Role.BUSINESS, Role.ADMIN),
  requireBusinessOwnership,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId!;
      const stats = await loyaltyService.getBusinessLoyaltyStats(businessId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/loyalty/business/transactions
 * Stamp & redemption audit trail for business
 */
router.get(
  '/business/transactions',
  authenticate,
  authorize(Role.BUSINESS, Role.ADMIN),
  requireBusinessOwnership,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await loyaltyService.getBusinessLoyaltyTransactions(businessId, page, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 3. STAFF STAMP & REWARD OPERATION ROUTES
// ==========================================

/**
 * POST /api/loyalty/staff/stamp-qr
 * Employee or business owner scans customer's dynamic QR
 */
const stampQrSchema = z.object({
  token: z.string().min(5, 'Geçersiz QR kodu'),
});

router.post(
  '/staff/stamp-qr',
  authenticate,
  authorize(Role.EMPLOYEE, Role.BUSINESS, Role.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;
      if (!businessId) {
        throw new AppError('İşlem yapabilmek için bir işletmeye bağlı olmalısınız', 403);
      }
      const parsed = stampQrSchema.parse(req.body);
      const result = await loyaltyService.addStampViaQr({
        token: parsed.token,
        businessId,
        employeeId: req.user!.employeeId,
        userId: req.user!.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/loyalty/staff/stamp-code
 * Employee or business owner enters customer's 6-8 char card code
 */
const stampCodeSchema = z.object({
  cardCode: z.string().min(4).max(12),
});

router.post(
  '/staff/stamp-code',
  authenticate,
  authorize(Role.EMPLOYEE, Role.BUSINESS, Role.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;
      if (!businessId) {
        throw new AppError('İşlem yapabilmek için bir işletmeye bağlı olmalısınız', 403);
      }
      const parsed = stampCodeSchema.parse(req.body);
      const result = await loyaltyService.addStampViaCode({
        cardCode: parsed.cardCode,
        businessId,
        employeeId: req.user!.employeeId,
        userId: req.user!.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/loyalty/staff/confirm-reward
 * Employee or business owner verifies and confirms customer's reward redemption
 */
const confirmRewardSchema = z.object({
  code: z.string().min(3),
});

router.post(
  '/staff/confirm-reward',
  authenticate,
  authorize(Role.EMPLOYEE, Role.BUSINESS, Role.ADMIN),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user!.businessId;
      if (!businessId) {
        throw new AppError('İşlem yapabilmek için bir işletmeye bağlı olmalısınız', 403);
      }
      const parsed = confirmRewardSchema.parse(req.body);
      const result = await loyaltyService.confirmRewardRedemption({
        code: parsed.code,
        businessId,
        employeeId: req.user!.employeeId,
        userId: req.user!.id,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
