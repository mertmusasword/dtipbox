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

const app = express();

// Security headers with production CSP
app.use(
  helmet({
    contentSecurityPolicy: env.isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            connectSrc: ["'self'", 'https:', 'wss:'],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
const allowedOrigins = env.CORS_ORIGIN.includes(',')
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [env.CORS_ORIGIN];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (env.isDev || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      callback(new Error('Blocked by CORS policy'));
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
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing with raw buffer preservation for webhook signature checks
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/api', apiRouter);

// Serve frontend static assets in production
if (env.isProd) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));

  // SPA fallback
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ success: false, error: 'API route not found' });
      return;
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Initial admin bootstrap (ensures an ADMIN account exists in production without manual shell commands)
async function bootstrapAdmin() {
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) {
      const adminEmail = env.ADMIN_EMAIL;
      const adminPassword = env.ADMIN_PASSWORD;
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password_hash: passwordHash,
          role: 'ADMIN',
          is_active: true,
        },
      });
      console.log(`[BOOTSTRAP] Initial platform admin created: ${adminEmail}`);
    }
  } catch (err) {
    console.warn('[BOOTSTRAP] Admin bootstrap skipped/deferred:', (err as Error).message);
  }
}

// Start server
const PORT = env.PORT;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`=========================================`);
  console.log(`🚀 D-TIPBOX Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API URL: ${env.API_URL}/api`);
  console.log(`=========================================`);
  await bootstrapAdmin();
});

export default app;
