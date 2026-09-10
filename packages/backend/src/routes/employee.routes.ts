import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import * as analyticsService from '../services/analytics.service';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Only employees can access this route
router.use(authenticate);
router.use(authorize('EMPLOYEE'));

router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.employeeId || !req.user?.businessId) {
      throw new AppError('No employee profile associated with this account', 403);
    }

    const [employee, stats] = await Promise.all([
      prisma.employee.findUnique({
        where: { id: req.user.employeeId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          position: true,
          avatar: true,
          created_at: true,
          business: {
            select: {
              name: true,
              currency: true,
            },
          },
        },
      }),
      analyticsService.getEmployeeAnalytics(req.user.employeeId, req.user.businessId),
    ]);

    res.json({
      success: true,
      data: {
        profile: employee,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/statistics', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.employeeId || !req.user?.businessId) {
      throw new AppError('No employee profile associated with this account', 403);
    }

    const stats = await analyticsService.getEmployeeAnalytics(
      req.user.employeeId,
      req.user.businessId
    );

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
