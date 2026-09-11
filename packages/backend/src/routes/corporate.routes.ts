import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validation';
import * as corporateService from '../services/corporate.service';

const router = Router();

const corporateSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 applications per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Çok fazla başvuru denemesi yapıldı. Lütfen biraz bekledikten sonra tekrar deneyiniz.',
  },
});

const createCorporateApplicationSchema = {
  body: z.object({
    companyName: z.string().trim().min(2).max(150).optional(),
    company_name: z.string().trim().min(2).max(150).optional(),
    contactName: z.string().trim().min(2).max(100).optional(),
    contact_name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(5, 'Geçerli bir telefon numarası giriniz').max(35),
    email: z.string().trim().email('Geçerli bir e-posta adresi giriniz').max(150),
    sector: z.string().trim().min(2, 'Sektör seçimi zorunludur').max(100),
    branchCount: z.union([z.string(), z.number()]).optional(),
    branch_count: z.union([z.string(), z.number()]).optional(),
    message: z.string().trim().max(2000).optional(),
  }).refine((data) => !!(data.companyName || data.company_name), {
    message: 'Firma adı zorunludur',
    path: ['company_name'],
  }).refine((data) => !!(data.contactName || data.contact_name), {
    message: 'Yetkili adı zorunludur',
    path: ['contact_name'],
  }),
};

router.post(
  '/',
  corporateSubmissionLimiter,
  validate(createCorporateApplicationSchema),
  async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
      const application = await corporateService.createCorporateApplication({
        ...req.body,
        ipAddress,
      });

      res.status(201).json({
        success: true,
        data: application,
        message: 'Kurumsal başvurunuz başarıyla alındı. Uzman ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
