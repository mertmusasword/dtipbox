import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validation';
import * as supportService from '../services/support.service';
import { authenticate } from '../middleware/auth';
import { verifyTurnstileToken } from '../utils/turnstile';

const router = Router();

const supportSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Çok fazla destek talebi gönderildi. Lütfen biraz bekledikten sonra tekrar deneyiniz.',
  },
});

const createSupportTicketSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100),
    email: z.string().trim().email('Geçerli bir e-posta adresi giriniz').max(150),
    phone: z.string().trim().max(35).optional(),
    businessName: z.string().trim().max(150).optional(),
    business_name: z.string().trim().max(150).optional(),
    category: z.enum([
      'POS_INTEGRATION',
      'ACCOUNT_BILLING',
      'TECHNICAL_SUPPORT',
      'GENERAL_INQUIRY',
      'FEEDBACK_SUGGESTION',
      'TIP_PAYOUT',
      'QR_PROFILE',
    ]).optional(),
    subject: z.string().trim().min(2, 'Konu başlığı en az 2 karakter olmalıdır').max(200),
    message: z.string().trim().min(5, 'Mesajınız en az 5 karakter olmalıdır').max(3000),
    turnstileToken: z.string().optional(),
    // Bot honeypot traps
    website_url_hp: z.string().max(0).optional(),
    _hp: z.string().max(0).optional(),
  }),
};

// Optional auth middleware helper
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

router.post(
  '/',
  supportSubmissionLimiter,
  optionalAuth,
  validate(createSupportTicketSchema),
  async (req: any, res, next) => {
    try {
      // Honeypot detection
      if (req.body.website_url_hp || req.body._hp) {
        // Silently return success to mislead bots without polluting DB
        return res.status(201).json({
          success: true,
          message: 'Destek talebiniz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.',
        });
      }

      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';

      // Cloudflare Turnstile Verification (Mandatory for unauthenticated public request in production)
      const isPublicSubmission = !req.user;
      if (isPublicSubmission && process.env.NODE_ENV === 'production') {
        if (!req.body.turnstileToken) {
          return res.status(400).json({
            success: false,
            error: 'Güvenlik doğrulaması zorunludur. Lütfen sayfayı yenileyip tekrar deneyiniz.',
          });
        }
      }

      if (req.body.turnstileToken && isPublicSubmission) {
        const turnstileCheck = await verifyTurnstileToken(req.body.turnstileToken, ipAddress);
        if (!turnstileCheck.success) {
          return res.status(403).json({
            success: false,
            error: 'Güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyip tekrar deneyiniz.',
          });
        }
      }

      const userId = req.user?.id || undefined;
      const businessId = req.user?.business?.id || undefined;

      const ticket = await supportService.createSupportTicket({
        ...req.body,
        userId,
        businessId,
        ipAddress,
      });

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Destek talebiniz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
