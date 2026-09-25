import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    businessId?: string;
    employeeId?: string;
  };
}

interface CachedAuthUser {
  user: {
    id: string;
    email: string;
    role: Role;
    businessId?: string;
    employeeId?: string;
  };
  cachedAt: number;
}

const userAuthCache = new Map<string, CachedAuthUser>();
const AUTH_CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateUserAuthCache(userId?: string) {
  if (userId) {
    userAuthCache.delete(userId);
  } else {
    userAuthCache.clear();
  }
}

/**
 * JWT authentication middleware.
 * Verifies the access token from the Authorization header.
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: Role;
    };

    // Check in-memory cache first to avoid DB round-trip on every single API request
    const cached = userAuthCache.get(decoded.userId);
    const now = Date.now();
    if (cached && now - cached.cachedAt < AUTH_CACHE_TTL_MS) {
      req.user = cached.user;
      next();
      return;
    }

    // Fetch user and check is_active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: { select: { id: true, is_active: true } },
        employee: {
          select: {
            id: true,
            business_id: true,
            is_active: true,
            deleted_at: true,
            business: { select: { is_active: true } },
          },
        },
      },
    });

    if (!user || !user.is_active) {
      userAuthCache.delete(decoded.userId);
      res.status(401).json({ success: false, error: 'User not found or inactive' });
      return;
    }

    // Role-specific active verification: Business owner
    if (user.role === 'BUSINESS' && user.business && !user.business.is_active) {
      userAuthCache.delete(decoded.userId);
      res.status(403).json({ success: false, error: 'Business account is suspended or inactive' });
      return;
    }

    // Role-specific active verification: Employee
    if (user.role === 'EMPLOYEE') {
      if (!user.employee || !user.employee.is_active || user.employee.deleted_at !== null) {
        userAuthCache.delete(decoded.userId);
        res.status(403).json({ success: false, error: 'Employee account is deactivated' });
        return;
      }
      if (user.employee.business && !user.employee.business.is_active) {
        userAuthCache.delete(decoded.userId);
        res.status(403).json({ success: false, error: 'Business account is suspended or inactive' });
        return;
      }
    }

    const authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business?.id || user.employee?.business_id,
      employeeId: user.employee?.id,
    };

    // Prevent unbounded memory growth
    if (userAuthCache.size > 2000) {
      userAuthCache.clear();
    }
    userAuthCache.set(user.id, { user: authUser, cachedAt: now });

    req.user = authUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }
    next(error);
  }
}

/**
 * Role-based access control middleware.
 * Use after authenticate middleware.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Ensure the authenticated user is operating on their own business.
 * Prevents IDOR — Business A cannot access Business B's data.
 */
export function requireBusinessOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // Admins can access any business if specified via header/query or linked
  if (req.user.role === 'ADMIN') {
    const adminBizId =
      req.user.businessId ||
      (req.query.businessId as string) ||
      (req.headers['x-business-id'] as string);
    if (adminBizId) {
      req.user.businessId = adminBizId;
      next();
      return;
    }
  }

  if (!req.user.businessId) {
    res.status(403).json({ success: false, error: 'No business associated with this account' });
    return;
  }

  next();
}
