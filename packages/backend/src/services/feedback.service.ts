import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateFeedbackInput {
  publicToken: string;
  tipId?: string;
  rating: number;
  comment?: string;
}

export interface BusinessFeedbackFilter {
  page?: number;
  limit?: number;
  employeeId?: string;
  rating?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Public customer feedback submission linked to a QR session and optional Tip.
 */
export async function createTipFeedback(input: CreateFeedbackInput) {
  const { publicToken, tipId, rating, comment } = input;

  // 1. Validate rating
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new AppError('Puan 1 ile 5 arasında bir tam sayı olmalıdır', 400);
  }

  // 2. Validate comment length
  const sanitizedComment = comment?.trim() ? comment.trim().slice(0, 500) : null;

  // 3. Resolve QR and Business
  const qr = await prisma.qrCode.findUnique({
    where: { public_token: publicToken },
    include: { business: true },
  });

  if (!qr || !qr.is_active || !qr.business?.is_active) {
    throw new AppError('Geçersiz veya aktif olmayan QR kod oturumu', 404);
  }

  const businessId = qr.business_id;
  let employeeId: string | null = null;
  let verifiedTipId: string | null = null;

  // 4. If tipId is provided, verify ownership and prevent duplicate reviews
  if (tipId) {
    const tip = await prisma.tip.findFirst({
      where: {
        id: tipId,
        business_id: businessId,
      },
    });

    if (!tip) {
      throw new AppError('Belirtilen bahşiş işlemi bu işletmeye ait değil veya bulunamadı', 404);
    }

    // Check if feedback already submitted for this tip
    const existingFeedback = await prisma.feedback.findUnique({
      where: { tip_id: tip.id },
    });

    if (existingFeedback) {
      throw new AppError('Bu bahşiş işlemi için zaten bir değerlendirme gönderilmiş', 409);
    }

    verifiedTipId = tip.id;
    employeeId = tip.employee_id || null;
  }

  // 5. Create Feedback record
  const feedback = await prisma.feedback.create({
    data: {
      business_id: businessId,
      employee_id: employeeId,
      tip_id: verifiedTipId,
      rating: Math.round(rating),
      comment: sanitizedComment,
    },
    include: {
      employee: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          position: true,
          avatar: true,
        },
      },
    },
  });

  return {
    id: feedback.id,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.created_at,
    employee: feedback.employee
      ? {
          id: feedback.employee.id,
          name: `${feedback.employee.first_name} ${feedback.employee.last_name}`.trim(),
          position: feedback.employee.position,
        }
      : null,
  };
}

/**
 * Fetch feedbacks and aggregated metrics for a business dashboard.
 */
export async function getBusinessFeedbacks(businessId: string, filters: BusinessFeedbackFilter = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    business_id: businessId,
  };

  if (filters.employeeId) {
    if (filters.employeeId === 'pool') {
      whereClause.employee_id = null;
    } else {
      whereClause.employee_id = filters.employeeId;
    }
  }

  if (filters.rating && filters.rating >= 1 && filters.rating <= 5) {
    whereClause.rating = Number(filters.rating);
  }

  if (filters.startDate || filters.endDate) {
    whereClause.created_at = {};
    if (filters.startDate) {
      whereClause.created_at.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.created_at.lte = new Date(filters.endDate);
    }
  }

  // Fetch paginated reviews and total count
  const [items, totalFilteredCount, allBusinessFeedbacks, staffList] = await Promise.all([
    prisma.feedback.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            position: true,
            avatar: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.feedback.count({ where: whereClause }),
    prisma.feedback.findMany({
      where: { business_id: businessId },
      select: { rating: true, employee_id: true },
    }),
    prisma.employee.findMany({
      where: { business_id: businessId, deleted_at: null },
      select: { id: true, first_name: true, last_name: true, position: true },
    }),
  ]);

  // Calculate overall metrics
  const totalAllReviews = allBusinessFeedbacks.length;
  const ratingSum = allBusinessFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalAllReviews > 0 ? Number((ratingSum / totalAllReviews).toFixed(1)) : 0;

  // Rating distribution: 5, 4, 3, 2, 1
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allBusinessFeedbacks.forEach((fb) => {
    if (distribution[fb.rating] !== undefined) {
      distribution[fb.rating] += 1;
    }
  });

  // Calculate staff averages
  const staffStatsMap: Record<string, { total: number; count: number; name: string; position?: string | null }> = {};
  staffList.forEach((st) => {
    staffStatsMap[st.id] = {
      total: 0,
      count: 0,
      name: `${st.first_name} ${st.last_name}`.trim(),
      position: st.position,
    };
  });

  allBusinessFeedbacks.forEach((fb) => {
    if (fb.employee_id && staffStatsMap[fb.employee_id]) {
      staffStatsMap[fb.employee_id].total += fb.rating;
      staffStatsMap[fb.employee_id].count += 1;
    }
  });

  const staffStats = Object.keys(staffStatsMap).map((empId) => {
    const item = staffStatsMap[empId];
    return {
      employeeId: empId,
      name: item.name,
      position: item.position,
      reviewCount: item.count,
      averageRating: item.count > 0 ? Number((item.total / item.count).toFixed(1)) : 0,
    };
  }).sort((a, b) => b.reviewCount - a.reviewCount || b.averageRating - a.averageRating);

  return {
    metrics: {
      averageRating,
      totalReviews: totalAllReviews,
      distribution,
      filteredTotal: totalFilteredCount,
      staffStats,
    },
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalFilteredCount / limit) || 1,
      totalItems: totalFilteredCount,
    },
    items: items.map((fb) => ({
      id: fb.id,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.created_at,
      employee: fb.employee
        ? {
            id: fb.employee.id,
            name: `${fb.employee.first_name} ${fb.employee.last_name}`.trim(),
            position: fb.employee.position,
            avatar: fb.employee.avatar,
          }
        : null,
    })),
  };
}

/**
 * Fetch reviews and satisfaction metrics for an individual employee.
 * Note: Never exposes customer personal information.
 */
export async function getEmployeeFeedbacks(employeeId: string, businessId: string, page = 1, limit = 20) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [feedbacks, totalCount, allEmployeeFeedbacks] = await Promise.all([
    prisma.feedback.findMany({
      where: {
        employee_id: employeeId,
        business_id: businessId,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: safeLimit,
    }),
    prisma.feedback.count({
      where: {
        employee_id: employeeId,
        business_id: businessId,
      },
    }),
    prisma.feedback.findMany({
      where: {
        employee_id: employeeId,
        business_id: businessId,
      },
      select: { rating: true },
    }),
  ]);

  const totalReviews = allEmployeeFeedbacks.length;
  const ratingSum = allEmployeeFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0;

  return {
    metrics: {
      averageRating,
      totalReviews,
    },
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(totalCount / safeLimit) || 1,
      totalItems: totalCount,
    },
    items: feedbacks.map((fb) => ({
      id: fb.id,
      rating: fb.rating,
      comment: fb.comment,
      createdAt: fb.created_at,
    })),
  };
}
