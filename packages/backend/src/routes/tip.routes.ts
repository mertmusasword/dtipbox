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
    const { email, tipId, referenceCode, language } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Geçerli bir e-posta adresi giriniz.' });
      return;
    }

    // Verify the public QR token first to scope by venue
    const qr = await prisma.qrCode.findUnique({
      where: { public_token: req.params.publicToken },
      include: { business: true },
    });

    if (!qr) {
      res.status(404).json({ success: false, error: 'Geçersiz QR kodu.' });
      return;
    }

    if (!tipId && !referenceCode) {
      res.status(400).json({ success: false, error: 'Bahşiş referansı veya kimliği gereklidir.' });
      return;
    }

    // Find the tip record strictly within this venue
    let tip = null;
    if (tipId && typeof tipId === 'string') {
      try {
        tip = await prisma.tip.findFirst({
          where: { id: tipId, business_id: qr.business_id },
          include: {
            business: true,
            table: true,
            employee: true,
          },
        });
      } catch {
        tip = null;
      }
    }

    // Fallback: search by reference code strictly within this venue
    if (!tip && referenceCode && typeof referenceCode === 'string') {
      const cleanRef = String(referenceCode).replace(/^TIP-/, '').replace(/^IBAN_TIP-/, '').trim();
      if (cleanRef.length >= 4) {
        tip = await prisma.tip.findFirst({
          where: {
            business_id: qr.business_id,
            OR: [
              { id: { startsWith: cleanRef.toLowerCase() } },
              { provider_transaction_id: { contains: cleanRef } },
            ],
          },
          include: {
            business: true,
            table: true,
            employee: true,
          },
        });
      }
    }

    if (!tip) {
      res.status(404).json({ success: false, error: 'Belirtilen referansa ait bahşiş kaydı bulunamadı.' });
      return;
    }

    const refCode = referenceCode || `TIP-${tip.id.slice(0, 8).toUpperCase()}`;
    const staffName = tip.employee ? `${tip.employee.first_name} ${tip.employee.last_name}`.trim() : null;
    const isIban = (tip.payment_method || '').toUpperCase().includes('IBAN') || (tip.payment_method || '').toUpperCase().includes('BANK');
    const paymentMethodLabel = isIban
      ? (language === 'tr' ? 'Doğrudan Havale / IBAN' : 'Bank Transfer / IBAN')
      : (language === 'tr' ? 'Kart / Online Ödeme' : 'Credit Card / Online Payment');

    // If tip is not yet confirmed by the venue (Havale / IBAN transfer pending verification)
    if (tip.payment_status !== 'SUCCESS') {
      const auditService = await import('../services/audit.service');
      await auditService.createAuditLog({
        businessId: tip.business_id,
        action: 'RECEIPT_EMAIL_REQUESTED',
        entityType: 'TIP',
        entityId: tip.id,
        metadata: {
          email: email.trim(),
          referenceCode: refCode,
          language: language || 'tr',
          requestedAt: new Date().toISOString(),
        },
      });

      res.json({
        success: true,
        pendingApproval: true,
        message: language === 'tr'
          ? 'E-posta adresiniz kaydedildi. İşletme havalenizi onayladığı anda doğrulanmış resmi makbuzunuz e-postanıza otomatik olarak iletilecektir.'
          : 'Email recorded. Once the venue confirms your transfer, your verified digital receipt will be automatically sent to your email.',
      });
      return;
    }

    try {
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
    } catch (mailErr) {
      console.warn('Digital receipt email dispatch warning:', mailErr);
    }

    res.json({
      success: true,
      pendingApproval: false,
      message: language === 'tr'
        ? 'Doğrulanmış dijital makbuz e-posta adresinize başarıyla gönderildi.'
        : 'Verified digital receipt has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

