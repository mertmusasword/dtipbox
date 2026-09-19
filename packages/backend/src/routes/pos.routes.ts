import { Router, Request, Response } from 'express';

const router = Router();

// HTTP 410 Gone: Naponi does not integrate physical POS or require POS sync credentials.
router.all('*', (_req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    error: 'POS endpoints have been permanently deprecated (HTTP 410 Gone). Naponi operates via QR code, external payment links, and direct bank transfer without physical POS integrations.',
  });
});

export default router;
