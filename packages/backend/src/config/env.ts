import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

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

  // Helpers
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
} as const;

// Production security guard: fail fast if insecure placeholder secrets are used in production
if (env.isProd) {
  if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-secret') {
    throw new Error('[FATAL SECURITY CONFIG] In production, JWT_SECRET must be configured with a strong cryptographic secret.');
  }
  if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET === 'dev-refresh-secret') {
    throw new Error('[FATAL SECURITY CONFIG] In production, JWT_REFRESH_SECRET must be configured with a strong cryptographic secret.');
  }
}
