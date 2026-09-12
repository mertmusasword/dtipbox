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

    const feedbackService = await import('../services/feedback.service');

    const [employee, stats, feedbackData] = await Promise.all([
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
      feedbackService.getEmployeeFeedbacks(req.user.employeeId, req.user.businessId, 1, 10),
    ]);

    res.json({
      success: true,
      data: {
        profile: employee,
        stats,
        feedbacks: feedbackData,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/feedbacks', async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.employeeId || !req.user?.businessId) {
      throw new AppError('No employee profile associated with this account', 403);
    }

    const feedbackService = await import('../services/feedback.service');
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await feedbackService.getEmployeeFeedbacks(
      req.user.employeeId,
      req.user.businessId,
      page,
      limit
    );

    res.json({ success: true, data });
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
