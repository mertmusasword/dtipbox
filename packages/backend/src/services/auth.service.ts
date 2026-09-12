import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

interface RegisterInput {
  email: string;
  password: string;
  role?: Role;
  businessName?: string;
  country?: string;
  currency?: string;
  timezone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function generateTokens(userId: string, email: string, role: Role): TokenPair {
  const accessToken = jwt.sign(
    { userId, email, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY as any }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as any }
  );

  return { accessToken, refreshToken };
}

/**
 * Register a new user.
 * If role is BUSINESS, also create an associated Business record.
 */
export async function register(input: RegisterInput) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  if (input.role === Role.ADMIN) {
    throw new AppError('Admin registration is not permitted', 403);
  }

  if (!input.password || input.password.length < 6 || input.password.length > 128) {
    throw new AppError('Şifre en az 6, en fazla 128 karakter olmalıdır', 400);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const role = input.role || Role.BUSINESS;

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
      ...(role === Role.BUSINESS && {
        business: {
          create: {
            name: input.businessName || 'My Business',
            country: input.country || 'US',
            currency: input.currency || 'USD',
            timezone: input.timezone || 'America/New_York',
          },
        },
      }),
    },
    include: {
      business: true,
    },
  });

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      business: user.business,
    },
    ...tokens,
  };
}

/**
 * Login with email and password.
 */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
    include: {
      business: { select: { id: true, name: true } },
      employee: { select: { id: true, business_id: true, first_name: true, last_name: true } },
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account is deactivated', 403);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      business: user.business,
      employee: user.employee,
    },
    ...tokens,
  };
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: Role;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    const tokens = generateTokens(user.id, user.email, user.role);
    return tokens;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid refresh token', 401);
  }
}

/**
 * Get current user profile.
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      business: true,
      employee: {
        select: {
          id: true,
          business_id: true,
          first_name: true,
          last_name: true,
          position: true,
          avatar: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

/**
 * Update current user profile (email and/or password with current password verification).
 */
export async function updateProfile(
  userId: string,
  input: {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      business: { select: { id: true, name: true } },
      employee: { select: { id: true, business_id: true, first_name: true, last_name: true } },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Security guard: verify current password if changing email or password
  if (input.email || input.newPassword) {
    if (!input.currentPassword) {
      throw new AppError('Current password is required to update credentials', 400);
    }
    const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }
  }

  const updateData: { email?: string; password_hash?: string } = {};

  if (input.email) {
    const newEmail = input.email.toLowerCase().trim();
    if (newEmail !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: newEmail } });
      if (existing && existing.id !== user.id) {
        throw new AppError('Email is already registered with another account', 409);
      }
      updateData.email = newEmail;
    }
  }

  if (input.newPassword) {
    if (input.newPassword.length < 8 || input.newPassword.length > 128) {
      throw new AppError('New password must be between 8 and 128 characters', 400);
    }
    updateData.password_hash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      business: { select: { id: true, name: true } },
      employee: { select: { id: true, business_id: true, first_name: true, last_name: true } },
    },
  });

  // Generate fresh token pair with updated email
  const tokens = generateTokens(updatedUser.id, updatedUser.email, updatedUser.role);

  return {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      business: updatedUser.business,
      employee: updatedUser.employee,
    },
    ...tokens,
  };
}

/**
 * Request password reset link.
 * Sends email if user exists. Always returns a generic success response to prevent email enumeration.
 */
export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user && user.is_active) {
    const crypto = await import('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: user.id,
        used_at: null,
      },
      data: {
        used_at: new Date(),
      },
    });

    // Create new password reset token
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;
    const { emailService } = await import('./email.service');
    await emailService.sendPasswordResetEmail(user.email, resetUrl);
  }

  // Consistent security response: do not reveal whether email exists
  return {
    success: true,
    message: 'Şifre sıfırlama talebiniz alındı. E-posta adresinize sıfırlama bağlantısı iletilecektir.',
  };
}

/**
 * Reset password using verification token.
 */
export async function resetPassword(rawToken: string, newPassword: string) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new AppError('Geçersiz veya eksik sıfırlama kodu', 400);
  }

  if (!newPassword || newPassword.length < 8 || newPassword.length > 128) {
    throw new AppError('Yeni şifre en az 8, en fazla 128 karakter olmalıdır', 400);
  }

  const crypto = await import('crypto');
  const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.used_at !== null) {
    throw new AppError('Geçersiz veya daha önce kullanılmış sıfırlama bağlantısı', 400);
  }

  if (new Date() > tokenRecord.expires_at) {
    throw new AppError('Sıfırlama bağlantısının geçerlilik süresi (1 saat) dolmuştur', 400);
  }

  if (!tokenRecord.user || !tokenRecord.user.is_active) {
    throw new AppError('Kullanıcı hesabı aktif değil', 400);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update user password and mark token as used atomically
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.user_id },
      data: { password_hash: newPasswordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used_at: new Date() },
    }),
  ]);

  return {
    success: true,
    message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
  };
}

