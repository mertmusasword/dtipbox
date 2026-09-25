import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  storage: 'r2' | 'local';
}

/**
 * Validates SVG content against Stored Cross-Site Scripting (XSS) and XML Entity injection.
 * Throws AppError(400) if any executable scripts, handlers, or dangerous tags are found.
 */
export function validateSvgSecurity(buffer: Buffer): void {
  const content = buffer.toString('utf-8');

  // 1. Prohibit XML/DOCTYPE Entity attacks (XXE)
  if (/<!DOCTYPE[\s\S]*?>/i.test(content) || /<!ENTITY[\s\S]*?>/i.test(content)) {
    throw new AppError('SVG contains prohibited DOCTYPE or ENTITY definitions.', 400);
  }

  // 2. Prohibit script tags (including namespaced tags like <svg:script> or <html:script>)
  if (/<\s*([a-zA-Z0-9_]+:)?script[\s\S]*?>/i.test(content)) {
    throw new AppError('SVG contains executable script tags and was rejected for security.', 400);
  }

  // 3. Prohibit dangerous HTML / external embedding elements
  if (/<\s*([a-zA-Z0-9_]+:)?(foreignObject|iframe|object|embed|applet|meta|link)[\s\S]*?>/i.test(content)) {
    throw new AppError('SVG contains prohibited HTML or external object elements.', 400);
  }

  // 4. Prohibit inline event handlers (onload, onerror, onclick, etc.)
  if (/\bon[a-zA-Z]+\s*=/i.test(content)) {
    throw new AppError('SVG contains executable event handlers (e.g. onload) and was rejected.', 400);
  }

  // 5. Prohibit javascript: or data:text/html URI schemes in attributes like href, xlink:href, src
  if (/(href|src|action|formaction)\s*=\s*['"]?\s*(javascript:|vbscript:|data:text\/html)/i.test(content)) {
    throw new AppError('SVG contains unsafe javascript URI references and was rejected.', 400);
  }

  // 6. Prohibit CSS expressions or javascript: inside style attributes or tags
  if (/style[\s\S]*?expression\s*\(|style[\s\S]*?javascript\s*:/i.test(content)) {
    throw new AppError('SVG contains unsafe CSS expressions and was rejected.', 400);
  }
}

class StorageService {
  private s3Client: S3Client | null = null;
  private isR2Active = false;
  private localUploadsDir: string;

  constructor() {
    this.localUploadsDir = path.resolve(__dirname, '../../uploads');

    // Ensure local uploads directory exists for fallback
    if (!fs.existsSync(this.localUploadsDir)) {
      try {
        fs.mkdirSync(this.localUploadsDir, { recursive: true });
      } catch (err: any) {
        logger.error(`Failed to initialize local uploads directory: ${err.message}`, 'STORAGE');
      }
    }

    this.initCloudStorage();
  }

  private initCloudStorage() {
    const hasKeys = !!(env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY);
    const hasEndpoint = !!(env.R2_ACCOUNT_ID || env.S3_ENDPOINT);

    if (hasKeys && hasEndpoint) {
      const endpoint = env.S3_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
      try {
        this.s3Client = new S3Client({
          region: 'auto',
          endpoint,
          credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
          },
        });
        this.isR2Active = true;
        logger.info(`Cloudflare R2 / S3 Object Storage initialized with bucket '${env.R2_BUCKET_NAME}'.`, 'STORAGE');
      } catch (err: any) {
        this.s3Client = null;
        this.isR2Active = false;
        logger.warn(`Failed to connect to Cloudflare R2; falling back to local static storage. Error: ${err.message}`, 'STORAGE');
      }
    } else {
      this.isR2Active = false;
      logger.info('Cloudflare R2 credentials not configured. Using local /uploads/ directory as static fallback.', 'STORAGE');
    }
  }

  /**
   * Check if Cloudflare R2 / S3 cloud storage is currently active.
   */
  isConfigured(): boolean {
    return this.isR2Active;
  }

  /**
   * Upload binary buffer to Cloudflare R2 or local static folder fallback.
   */
  async uploadBuffer(
    buffer: Buffer,
    mimeType: string,
    folder: 'menu' | 'avatars' | 'logos' | 'general' = 'general',
    customFileName?: string
  ): Promise<UploadResult> {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new AppError(`File exceeds maximum allowed size of 10 MB (${Math.round(buffer.length / 1024)} KB).`, 400);
    }

    const cleanMime = mimeType.toLowerCase().split(';')[0].trim();
    const ext = ALLOWED_MIME_TYPES[cleanMime];
    if (!ext) {
      throw new AppError(`Unsupported image format '${mimeType}'. Allowed formats: JPEG, PNG, WebP, GIF, SVG.`, 400);
    }

    // Security: Validate SVG to prevent Stored XSS attacks
    if (cleanMime === 'image/svg+xml') {
      validateSvgSecurity(buffer);
    }

    const uniqueId = crypto.randomBytes(12).toString('hex');
    const safeName = customFileName
      ? `${customFileName.replace(/[^a-zA-Z0-9_-]/g, '_')}-${uniqueId}${ext}`
      : `${uniqueId}-${Date.now()}${ext}`;
    const key = `${folder}/${safeName}`;

    // 1. Upload to Cloudflare R2 if active
    if (this.isR2Active && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: cleanMime,
          CacheControl: 'public, max-age=31536000, immutable',
        });

        await this.s3Client.send(command);

        const publicBaseUrl = env.R2_PUBLIC_URL.replace(/\/+$/, '');
        const publicUrl = publicBaseUrl
          ? `${publicBaseUrl}/${key}`
          : `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

        return {
          url: publicUrl,
          key,
          size: buffer.length,
          mimeType: cleanMime,
          storage: 'r2',
        };
      } catch (err: any) {
        logger.error(`Cloudflare R2 PutObject failed (${err.message}). Falling back to local storage.`, 'STORAGE');
      }
    }

    // 2. Local File System Fallback
    const targetFolder = path.join(this.localUploadsDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const filePath = path.join(targetFolder, safeName);
    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${folder}/${safeName}`;
    const fullUrl = env.isDev ? `${env.API_URL}${relativeUrl}` : relativeUrl;

    return {
      url: fullUrl,
      key,
      size: buffer.length,
      mimeType: cleanMime,
      storage: 'local',
    };
  }

  /**
   * Upload Base64 Data URL (e.g. data:image/webp;base64,...) directly.
   * Strips prefix, converts to Buffer, and uploads to R2 or local storage.
   */
  async uploadBase64(
    dataUri: string,
    folder: 'menu' | 'avatars' | 'logos' | 'general' = 'general'
  ): Promise<UploadResult> {
    if (!dataUri || typeof dataUri !== 'string') {
      throw new AppError('Invalid image data. Expected Base64 data URI.', 400);
    }

    // Check if it's already an HTTP / CDN URL (skip re-uploading)
    if (dataUri.startsWith('http://') || dataUri.startsWith('https://') || dataUri.startsWith('/uploads/')) {
      return {
        url: dataUri,
        key: dataUri,
        size: 0,
        mimeType: 'image/webp',
        storage: this.isR2Active ? 'r2' : 'local',
      };
    }

    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new AppError('Invalid Base64 Data URI format.', 400);
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    return this.uploadBuffer(buffer, mimeType, folder);
  }
}

export const storageService = new StorageService();
