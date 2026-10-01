import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import * as tipService from '../services/tip.service';
import { PaymentMethodType } from '@prisma/client';
import prisma from '../utils/prisma';
import { emailService } from '../services/email.service';
import rateLimit from 'express-rate-limit';

const router = Router();

// Abuse protection: limit tip creation attempts per IP to prevent spam or flood attacks
// Configured to 60/min to safely support high-density venue Wi-Fi NAT IPs during rush hours
const tipSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max 60 tip attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many tip attempts from this device. Please wait a moment before trying again.',
  },
});

// Public: Get tip page details by public token (no login required)
router.get('/:publicToken', async (req, res, next) => {
  try {
    const details = await tipService.getTipPageDetails(req.params.publicToken);
    res.json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
});

const createTipSchema = {
  params: z.object({
    publicToken: z.string().min(1).max(100),
  }),
  body: z.object({
    employeeId: z.string().uuid().optional(),
    tableId: z.string().uuid().optional(),
    amount: z
      .number()
      .positive('Tip amount must be positive')
      .max(100000, 'Tip amount exceeds maximum allowed single transaction limit (100,000)'),
    paymentMethod: z.nativeEnum(PaymentMethodType),
    customerName: z
      .string()
      .trim()
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    customerMessage: z
      .string()
      .trim()
      .max(500, 'Message cannot exceed 500 characters')
      .optional(),
    idempotencyKey: z
      .string()
      .trim()
      .max(128, 'Idempotency key exceeds maximum length')
      .optional(),
  }),
};

// Public: Submit tip and start payment (no login required, rate-limited against abuse)
router.post('/:publicToken', tipSubmissionLimiter, validate(createTipSchema), async (req, res, next) => {
  try {
    const idempotencyKey = (req.body.idempotencyKey || req.headers['idempotency-key']) as string | undefined;
    const result = await tipService.createTip({
      publicToken: req.params.publicToken,
      ...req.body,
      idempotencyKey: idempotencyKey?.trim() || undefined,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many feedback submissions from this device. Please try again later.',
  },
});

const createFeedbackSchema = {
  params: z.object({
    publicToken: z.string().min(1).max(100),
  }),
  body: z.object({
    tipId: z.string().uuid().optional(),
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().trim().max(500, 'Comment cannot exceed 500 characters').optional(),
  }),
};

// Public: Submit customer rating & feedback after tip
router.post('/:publicToken/feedback', feedbackLimiter, validate(createFeedbackSchema), async (req, res, next) => {
  try {
    const feedbackService = await import('../services/feedback.service');
    const feedback = await feedbackService.createTipFeedback({
      publicToken: req.params.publicToken as string,
      tipId: req.body.tipId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
});

// Public: Send Digital Tip Receipt Email
router.post('/:publicToken/send-receipt', async (req, res, next) => {
  try {
    const { email, tipId, language } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Geçerli bir e-posta adresi giriniz.' });
      return;
    }

    // Find the tip record
    let tip = null;
    if (tipId) {
      tip = await prisma.tip.findUnique({
        where: { id: tipId },
        include: {
          business: true,
          table: true,
          employee: true,
        },
      });
    }

    if (!tip) {
      // Find latest tip for this QR token as fallback
      const qr = await prisma.qrCode.findUnique({
        where: { public_token: req.params.publicToken },
        include: { business: true },
      });
      if (qr) {
        tip = await prisma.tip.findFirst({
          where: { business_id: qr.business_id },
          orderBy: { created_at: 'desc' },
          include: {
            business: true,
            table: true,
            employee: true,
          },
        });
      }
    }

    if (!tip) {
      res.status(404).json({ success: false, error: 'Bahşiş kaydı bulunamadı.' });
      return;
    }

    const refCode = `TIP-${tip.id.slice(0, 8).toUpperCase()}`;
    const staffName = tip.employee ? `${tip.employee.first_name} ${tip.employee.last_name}`.trim() : null;
    const isIban = (tip.payment_method || '').toUpperCase().includes('IBAN') || (tip.payment_method || '').toUpperCase().includes('BANK');
    const paymentMethodLabel = isIban
      ? (language === 'tr' ? 'Doğrudan Havale / IBAN' : 'Bank Transfer / IBAN')
      : (language === 'tr' ? 'Kart / Online Ödeme' : 'Credit Card / Online Payment');

    await emailService.sendDigitalReceiptEmail({
      to: email.trim(),
      businessName: tip.business.name,
      referenceNo: refCode,
      amount: Number(tip.amount),
      currency: tip.currency || tip.business.currency || 'TRY',
      paymentMethod: paymentMethodLabel,
      dateStr: new Date(tip.created_at).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US'),
      tableName: tip.table?.name || null,
      staffName,
      lang: language || 'tr',
    });

    res.json({ success: true, message: 'Makbuz e-posta adresinize başarıyla gönderildi.' });
  } catch (error) {
    next(error);
  }
});

export default router;

