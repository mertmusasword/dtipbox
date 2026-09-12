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

    const [employee, stats, feedbackData, poolShares] = await Promise.all([
      prisma.employee.findUnique({
        where: { id: req.user.employeeId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          position: true,
          role_title: true,
          share_weight: true,
          avatar: true,
          created_at: true,
          business: {
            select: {
              name: true,
              currency: true,
              tip_distribution_mode: true,
            },
          },
        },
      }),
      analyticsService.getEmployeeAnalytics(req.user.employeeId, req.user.businessId),
      feedbackService.getEmployeeFeedbacks(req.user.employeeId, req.user.businessId, 1, 10),
      prisma.tipPoolShare.findMany({
        where: { employee_id: req.user.employeeId },
        orderBy: { distribution: { created_at: 'desc' } },
        take: 10,
        include: {
          distribution: {
            select: {
              id: true,
              period_start: true,
              period_end: true,
              net_distributed_amount: true,
              notes: true,
              created_at: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        profile: employee,
        stats,
        feedbacks: feedbackData,
        poolShares: poolShares.map((ps) => ({
          id: ps.id,
          date: ps.distribution.created_at,
          startDate: ps.distribution.period_start,
          endDate: ps.distribution.period_end,
          shareWeight: Number(ps.share_weight),
          grossShare: Number(ps.gross_share),
          netShare: Number(ps.net_share),
          isPaid: ps.is_paid,
          paidAt: ps.paid_at,
          notes: ps.distribution.notes,
        })),
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
