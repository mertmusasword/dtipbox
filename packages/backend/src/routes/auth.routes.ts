import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import * as authService from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

const registerSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(Role).optional(),
    businessName: z.string().min(2).optional(),
    country: z.string().length(2).optional(),
    currency: z.string().min(3).max(4).optional(),
    timezone: z.string().optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
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

router.post('/login', validate(loginSchema), async (req, res, next) => {
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
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
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
