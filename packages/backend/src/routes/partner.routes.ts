import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validation';
import * as partnerService from '../services/partner.service';
import { validateEmailQuality } from '../utils/emailValidator';
import { validateGlobalPhoneNumber } from '../utils/phoneValidator';

const router = Router();

const partnerSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 applications per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Çok fazla başvuru denemesi yapıldı. Lütfen biraz bekledikten sonra tekrar deneyiniz.',
  },
});

const createPartnerApplicationSchema = {
  body: z.object({
    companyName: z.string().trim().min(2, 'Firma adı en az 2 karakter olmalıdır').max(150).optional(),
    company_name: z.string().trim().min(2, 'Firma adı en az 2 karakter olmalıdır').max(150).optional(),
    website: z.string().trim().max(250).optional(),
    contactName: z.string().trim().min(2, 'Yetkili kişi adı zorunludur').max(100).optional(),
    contact_name: z.string().trim().min(2, 'Yetkili kişi adı zorunludur').max(100).optional(),
    email: z
      .string()
      .trim()
      .email('Geçerli bir e-posta adresi giriniz')
      .max(150)
      .refine((val) => validateEmailQuality(val).isValid, (val) => ({
        message: validateEmailQuality(val).error || 'Geçerli bir kurumsal e-posta adresi giriniz',
      })),
    phone: z
      .string()
      .trim()
      .max(35)
      .optional()
      .refine((val) => !val || validateGlobalPhoneNumber(val).isValid, (val) => ({
        message: validateGlobalPhoneNumber(val || '').error || 'Geçerli bir telefon numarası giriniz',
      })),
    companyType: z.string().trim().min(2, 'Firma türü seçimi zorunludur').max(100).optional(),
    company_type: z.string().trim().min(2, 'Firma türü seçimi zorunludur').max(100).optional(),
    customerCount: z.string().trim().max(100).optional(),
    customer_count: z.string().trim().max(100).optional(),
    countries: z.string().trim().max(200).optional(),
    integrationIdea: z.string().trim().max(2000).optional(),
    integration_idea: z.string().trim().max(2000).optional(),
    message: z.string().trim().max(2000).optional(),
    // Bot honeypot check (hidden field in frontend)
    website_url_hp: z.string().max(0).optional(),
  }).refine((data) => !!(data.companyName || data.company_name), {
    message: 'Firma adı zorunludur',
    path: ['company_name'],
  }).refine((data) => !!(data.contactName || data.contact_name), {
    message: 'Yetkili kişi adı zorunludur',
    path: ['contact_name'],
  }).refine((data) => !!(data.companyType || data.company_type), {
    message: 'Firma türü zorunludur',
    path: ['company_type'],
  }),
};

router.post(
  '/',
  partnerSubmissionLimiter,
  validate(createPartnerApplicationSchema),
  async (req, res, next) => {
    try {
      // Honeypot detection
      if (req.body.website_url_hp) {
        // Silently return success to mislead bots
        return res.status(201).json({
          success: true,
          message: 'Partnerlik başvurunuz başarıyla alındı.',
        });
      }

      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
      const application = await partnerService.createPartnerApplication({
        ...req.body,
        ipAddress,
      });

      res.status(201).json({
        success: true,
        data: application,
        message: 'Partnerlik başvurunuz başarıyla alındı. Teknoloji ortaklığı ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
