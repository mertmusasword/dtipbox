import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validation';
import * as supportService from '../services/support.service';
import { authenticate } from '../middleware/auth';

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
    ]).optional(),
    subject: z.string().trim().min(2, 'Konu başlığı en az 2 karakter olmalıdır').max(200),
    message: z.string().trim().min(5, 'Mesajınız en az 5 karakter olmalıdır').max(3000),
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
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
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
