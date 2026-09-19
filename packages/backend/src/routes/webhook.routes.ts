import { Router, Request, Response } from 'express';

const router = Router();

// HTTP 410 Gone: Naponi operates via non-custodial external payment links and direct bank transfer.
router.all('*', (_req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    error: 'This webhook endpoint has been permanently deprecated (HTTP 410 Gone). Naponi operates via external payment links and direct bank transfers without webhook ingestion.',
  });
});

export default router;
