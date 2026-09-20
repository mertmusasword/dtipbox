import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: (process.env.APP_URL && !process.env.APP_URL.includes('railway.app'))
    ? process.env.APP_URL
    : (process.env.NODE_ENV === 'production' ? 'https://www.naponi.com' : (process.env.APP_URL || 'http://localhost:5173')),
  API_URL: (process.env.API_URL && !process.env.API_URL.includes('railway.app'))
    ? process.env.API_URL
    : (process.env.NODE_ENV === 'production' ? 'https://www.naponi.com' : (process.env.API_URL || 'http://localhost:3000')),

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // Encryption (Dedicated AES-256 Key separated from JWT auth)
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-min!',

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'info@naponi.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Email / SMTP (Optional)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Naponi <noreply@naponi.com>',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',

  // 2026 Founder Membership Campaign Deadline (ISO string)
  FOUNDER_MEMBER_DEADLINE: process.env.FOUNDER_MEMBER_DEADLINE || '2026-12-31T23:59:59.999Z',

  // Helpers
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
} as const;

// Production security guard: fail fast if insecure placeholder secrets are used in production
if (env.isProd) {
  if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-secret' || env.JWT_SECRET === 'dev-jwt-secret-change-in-production' || env.JWT_SECRET.length < 32) {
    throw new Error('[FATAL SECURITY CONFIG] In production, JWT_SECRET must be configured with a strong cryptographic secret (min 32 chars).');
  }
  if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET === 'dev-refresh-secret' || env.JWT_REFRESH_SECRET === 'dev-jwt-refresh-secret-change-in-production' || env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('[FATAL SECURITY CONFIG] In production, JWT_REFRESH_SECRET must be configured with a strong cryptographic secret (min 32 chars).');
  }
  if (!env.ENCRYPTION_KEY || env.ENCRYPTION_KEY === 'dev-encryption-key-32-chars-min!' || env.ENCRYPTION_KEY.length < 32) {
    throw new Error('[FATAL SECURITY CONFIG] In production, ENCRYPTION_KEY must be configured with a dedicated strong cryptographic secret (min 32 chars).');
  }
}
