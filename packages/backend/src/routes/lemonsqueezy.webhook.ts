import { Router, Request, Response } from 'express';
import { lemonSqueezyService } from '../services/lemonsqueezy.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/webhooks/lemonsqueezy
 * Lemon Squeezy Webhook Handler
 */
router.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string | undefined;
  const rawBody = (req as any).rawBody;

  if (!rawBody) {
    logger.error('[LemonSqueezy Webhook] Missing raw body for webhook verification.', 'LemonSqueezy');
    res.status(500).json({ success: false, error: 'Server misconfiguration: Raw payload buffer unavailable' });
    return;
  }

  if (!signature || !lemonSqueezyService.verifyWebhookSignature(rawBody, signature)) {
    logger.warn('[LemonSqueezy Webhook] Invalid signature received.', 'LemonSqueezy');
    res.status(401).json({ success: false, error: 'Invalid webhook signature' });
    return;
  }

  try {
    const result = await lemonSqueezyService.handleWebhook(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    logger.error('[LemonSqueezy Webhook] Handler error:', err);
    res.status(500).json({ success: false, error: 'Webhook processing error' });
  }
});

export default router;
