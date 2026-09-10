import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import * as tipService from '../services/tip.service';
import { PaymentMethodType } from '@prisma/client';

import rateLimit from 'express-rate-limit';

const router = Router();

// Abuse protection: limit tip creation attempts per IP to prevent spam or flood attacks
const tipSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // max 15 tip attempts per minute per IP
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
  }),
};

// Public: Submit tip and start payment (no login required, rate-limited against abuse)
router.post('/:publicToken', tipSubmissionLimiter, validate(createTipSchema), async (req, res, next) => {
  try {
    const result = await tipService.createTip({
      publicToken: req.params.publicToken,
      ...req.body,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
