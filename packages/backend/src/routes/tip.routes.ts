import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import * as tipService from '../services/tip.service';
import { PaymentMethodType } from '@prisma/client';

const router = Router();

// Public: Get tip page details by public token
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
    publicToken: z.string().min(1),
  }),
  body: z.object({
    employeeId: z.string().uuid().optional(),
    tableId: z.string().uuid().optional(),
    amount: z.number().positive(),
    paymentMethod: z.nativeEnum(PaymentMethodType),
    customerName: z.string().max(100).optional(),
    customerMessage: z.string().max(500).optional(),
  }),
};

// Public: Submit tip and start payment
router.post('/:publicToken', validate(createTipSchema), async (req, res, next) => {
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
