import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import bcrypt from 'bcrypt';
import { env } from './config/env';
import prisma from './utils/prisma';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { providerRegistry } from './services/payment/core/providerRegistry';
import { bootstrapDefaultAgreement } from './services/agreement.service';
import { logger, requestLogger } from './utils/logger';

const app = express();

// Trust reverse proxy (Cloudflare, Railway) for accurate client IP in rate limiting
app.set('trust proxy', 1);

// Security headers with production CSP
app.use(
  helmet({
    contentSecurityPolicy: env.isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://www.googletagmanager.com',
              'https://*.googletagmanager.com',
            ],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            imgSrc: [
              "'self'",
              'data:',
              'https:',
              'blob:',
              'https://*.google-analytics.com',
              'https://*.googletagmanager.com',
            ],
            connectSrc: [
              "'self'",
              'https:',
              'wss:',
              'https://*.google-analytics.com',
              'https://*.analytics.google.com',
              'https://*.googletagmanager.com',
            ],
            frameSrc: [
              "'self'",
              'https://www.youtube.com',
              'https://www.youtube-nocookie.com',
              'https://youtube.com',
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Canonical apex domain redirect (naponi.com -> https://www.naponi.com)
app.use((req, res, next) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  if (host === 'naponi.com') {
    return res.redirect(301, `https://www.naponi.com${req.originalUrl}`);
  }
  next();
});

// SEO & Privacy: prevent search engines from indexing private dashboards, api, customer tip sessions, and loyalty cards
app.use((req, res, next) => {
  const privatePrefixes = ['/admin', '/business', '/employee', '/dashboard', '/api', '/tip', '/loyalty/card', '/loyalty/scan'];
  if (privatePrefixes.some((prefix) => req.path.startsWith(prefix))) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

// CORS - Strict Production Whitelist
const configuredOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter((o) => o.length > 0 && o !== '*');

const officialAllowedOrigins = new Set<string>([
  'https://naponi.com',
  'https://www.naponi.com',
]);

// Include normalized APP_URL if specified (e.g. Railway public domain)
if (env.APP_URL && env.APP_URL.startsWith('http')) {
  try {
    officialAllowedOrigins.add(new URL(env.APP_URL).origin);
  } catch {
    officialAllowedOrigins.add(env.APP_URL);
  }
}

// Include explicitly configured CORS_ORIGIN entries
configuredOrigins.forEach((orig) => {
  try {
    officialAllowedOrigins.add(new URL(orig).origin);
  } catch {
    officialAllowedOrigins.add(orig);
  }
});

export function isOriginAllowed(origin: string): boolean {
  // 1. Exact match against whitelist
  if (officialAllowedOrigins.has(origin)) {
    return true;
  }

  // 2. Strict HTTPS subdomain check for naponi.com (e.g. https://api.naponi.com)
  // Rejects attacker-naponi.com, naponi.com.evil.com, and insecure http://
  try {
    const parsed = new URL(origin);
    if (parsed.protocol === 'https:' && (parsed.hostname === 'naponi.com' || parsed.hostname.endsWith('.naponi.com'))) {
      return true;
    }
  } catch {
    return false;
  }

  // 3. In development mode only: allow localhost / 127.0.0.1
  if (env.isDev) {
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return true;
    }
  }

  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing with raw buffer preservation for webhook signature checks
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);

// Mount API routes
app.use('/api', apiRouter);

// Serve static media uploads (local fallback storage)
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '30d',
    immutable: true,
    setHeaders: (res, filePath) => {
      // Security: Prevent MIME confusion and XSS execution on uploaded assets
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
      }
    },
  })
);

// Serve frontend static assets in production with Cloudflare & CDN caching headers
if (env.isProd) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(
    express.static(frontendDist, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        // HTML files and SEO descriptors (sitemap, robots.txt) must never be aggressively cached
        if (
          filePath.endsWith('.html') ||
          filePath.endsWith('robots.txt') ||
          filePath.endsWith('sitemap.xml') ||
          filePath.endsWith('llms.txt')
        ) {
          res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        }
      },
    })
  );

  // SPA fallback
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ success: false, error: 'API route not found' });
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Initial admin bootstrap (ensures an ADMIN account exists in production without manual shell commands)
async function bootstrapAdmin() {
  try {
    const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      logger.info('ADMIN_EMAIL or ADMIN_PASSWORD not specified; skipping initial admin creation.', 'BOOTSTRAP');
      return;
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password_hash: passwordHash,
          role: 'ADMIN',
          is_active: true,
        },
      });
      logger.info(`Initial platform admin account created: ${adminEmail}`, 'BOOTSTRAP');
    } else {
      // Security guard: If admin account already exists, DO NOT overwrite their password.
      if (existingAdmin.role !== 'ADMIN' || !existingAdmin.is_active) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            role: 'ADMIN',
            is_active: true,
          },
        });
        logger.info(`Platform admin role/status ensured: ${adminEmail}`, 'BOOTSTRAP');
      }
    }
  } catch (err) {
    logger.warn(`Admin bootstrap skipped/deferred: ${(err as Error).message}`, 'BOOTSTRAP');
  }
}

async function bootstrapFounderMembership() {
  try {
    const deadline = new Date(env.FOUNDER_MEMBER_DEADLINE);
    const updated = await prisma.business.updateMany({
      where: {
        created_at: { lte: deadline },
        is_founder_member: false,
      },
      data: {
        is_founder_member: true,
        is_lifetime_free: true,
        membership_plan: 'FOUNDER',
        membership_status: 'LIFETIME_FREE',
      },
    });
    if (updated.count > 0) {
      logger.info(`Bootstrapped ${updated.count} existing businesses to Founder Member status`, 'FOUNDER');
    }
  } catch (err) {
    logger.warn(`Founder membership bootstrap skipped/deferred: ${(err as Error).message}`, 'FOUNDER');
  }
}

// Start server
const PORT = env.PORT;
app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Naponi Backend running on port ${PORT} [${env.NODE_ENV}] - API: ${env.API_URL}/api`, 'SERVER');
  await bootstrapAdmin();
  await providerRegistry.syncCatalogToDatabase();
  await bootstrapDefaultAgreement();
  await bootstrapFounderMembership();
});

export default app;
