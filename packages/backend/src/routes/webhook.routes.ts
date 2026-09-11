import { Router, Request, Response } from 'express';
import { paymentService } from '../services/payment/core/payment.service';

const router = Router();

async function handleWebhookRequest(req: Request, res: Response) {
  const provider = req.params.provider as string;
  const signature = (
    req.headers['stripe-signature'] ||
    req.headers['x-webhook-signature'] ||
    req.headers['x-signature']
  ) as string | undefined;

  try {
    const rawBody = (req as any).rawBody || JSON.stringify(Object.keys(req.body || {}).length > 0 ? req.body : req.query);
    const result = await paymentService.processWebhook(provider, rawBody, signature);
    res.json(result);
  } catch (error: any) {
    console.error(`[Webhook] Error processing ${provider} webhook:`, error);
    res.status(400).json({ success: false, error: error.message || 'Webhook processing failed' });
  }
}

router.post('/:provider', handleWebhookRequest);
router.get('/:provider', handleWebhookRequest);

export default router;
