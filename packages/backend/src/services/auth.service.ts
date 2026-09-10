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

  if (!input.password || input.password.length < 8 || input.password.length > 128) {
    throw new AppError('Password must be between 8 and 128 characters', 400);
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

