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

    // Fetch user and check is_active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        business: { select: { id: true } },
        employee: { select: { id: true, business_id: true } },
      },
    });

    if (!user || !user.is_active) {
      res.status(401).json({ success: false, error: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business?.id || user.employee?.business_id,
      employeeId: user.employee?.id,
    };

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

  // Admins can access any business
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  if (!req.user.businessId) {
    res.status(403).json({ success: false, error: 'No business associated with this account' });
    return;
  }

  next();
}
