import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { storageService } from '../services/storage.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const uploadImageSchema = {
  body: z.object({
    image: z.string().min(1, 'Image data is required'),
    folder: z.enum(['menu', 'avatars', 'logos', 'general']).default('general'),
  }),
};

/**
 * POST /api/upload/image
 * Uploads an image (compressed Base64 Data URI) to Cloudflare R2 or local static storage.
 * Returns the public CDN / static URL to be saved in database records.
 */
router.post('/image', authenticate, validate(uploadImageSchema), async (req: AuthRequest, res, next) => {
  try {
    const { image, folder } = req.body;

    const result = await storageService.uploadBase64(image, folder);

    res.status(200).json({
      success: true,
      url: result.url,
      storage: result.storage,
      size: result.size,
      mimeType: result.mimeType,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/upload/status
 * Check storage configuration health.
 */
router.get('/status', authenticate, async (_req: AuthRequest, res) => {
  res.json({
    success: true,
    isCloudStorageActive: storageService.isConfigured(),
    storageProvider: storageService.isConfigured() ? 'Cloudflare R2 (S3-Compatible)' : 'Local File System Fallback (/uploads)',
  });
});

export default router;
