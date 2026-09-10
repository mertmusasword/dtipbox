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
