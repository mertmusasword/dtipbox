import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validation';
import * as authService from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Strict rate limiter for authentication endpoints against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

const registerSchema = {
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz').max(255),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').max(128),
    role: z.enum(['BUSINESS', 'CUSTOMER']).optional(),
    businessName: z.string().min(2, 'İşletme adı en az 2 karakter olmalıdır').max(100).optional(),
    country: z.string().length(2, 'Geçerli bir ülke kodu seçiniz').optional(),
    currency: z.string().min(3).max(4).optional(),
    timezone: z.string().max(50).optional(),
    acceptedAgreement: z.boolean().optional(),
    agreementVersionId: z.string().optional(),
    agreementStatement: z.string().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(128),
  }),
};

router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    // If agreement was accepted during registration, record it immediately
    if (req.body.acceptedAgreement && result.user.business?.id) {
      try {
        const agreementService = await import('../services/agreement.service');
        const activeAgreement = await agreementService.getActiveAgreement();
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || req.ip || '0.0.0.0';
        const userAgent = req.headers['user-agent'] || 'Unknown Browser';

        await agreementService.acceptAgreement({
          businessId: result.user.business.id,
          userId: result.user.id,
          versionId: req.body.agreementVersionId || activeAgreement.version.id,
          ipAddress: ip,
          userAgent: userAgent,
          statement: req.body.agreementStatement || activeAgreement.mandatory_statement,
        });
      } catch (agreeErr) {
        console.error('[AUTH] Failed to record agreement acceptance during registration:', agreeErr);
      }
    }

    // Set HTTP-only refresh cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, error: 'No refresh token provided' });
      return;
    }
    const tokens = await authService.refreshToken(token);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

const updateProfileSchema = {
  body: z.object({
    email: z.string().email().max(255).optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  }),
};

router.put('/profile', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await authService.updateProfile(req.user!.id, req.body);
    // Refresh cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
