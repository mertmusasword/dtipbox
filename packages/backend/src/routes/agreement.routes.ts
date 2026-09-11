import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getActiveAgreement,
  acceptAgreement,
  getAgreementHistory,
} from '../services/agreement.service';
import prisma from '../utils/prisma';

const router = Router();

/**
 * Helper to safely extract client IP
 */
function getClientIp(req: AuthRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '0.0.0.0';
}

/**
 * GET /api/agreements/active
 * Get active published agreement.
 * If user is authenticated as BUSINESS, interpolates business data and returns acceptance status.
 */
router.get('/active', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Optional auth check without throwing 401
    let businessId: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
          };
          if (decoded?.userId) {
            const user = await prisma.user.findUnique({
              where: { id: decoded.userId },
              include: {
                business: { select: { id: true } },
                employee: { select: { id: true, business_id: true } },
              },
            });
            if (user?.is_active) {
              businessId = user.business?.id || user.employee?.business_id;
            }
          }
        } catch {
          // Token expired or invalid - silently continue as unauthenticated guest
        }
      }
    }

    const data = await getActiveAgreement(businessId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agreements/accept
 * Record digital acceptance with non-repudiation audit data (IP, User-Agent, SHA-256 hash, timestamp)
 */
router.post('/accept', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const businessId = req.user?.businessId;

    if (!userId || !businessId) {
      res.status(400).json({
        success: false,
        error: 'İşletme hesabı bulunamadı. Lütfen işletme sahibi olarak giriş yapınız.',
      });
      return;
    }

    const { versionId, statement } = req.body;

    if (!versionId) {
      res.status(400).json({
        success: false,
        error: 'Sözleşme versiyon kimliği (versionId) zorunludur.',
      });
      return;
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    const result = await acceptAgreement({
      businessId,
      userId,
      versionId,
      ipAddress,
      userAgent,
      statement,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agreements/history
 * List past accepted agreement versions for the authenticated business
 */
router.get('/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(400).json({ success: false, error: 'İşletme kimliği bulunamadı.' });
      return;
    }

    const history = await getAgreementHistory(businessId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agreements/receipt/:acceptanceId
 * Fetch full proof receipt and cryptographic verification details
 */
router.get('/receipt/:acceptanceId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const acceptanceId = req.params.acceptanceId as string;
    const businessId = req.user?.businessId;
    const isSuperAdmin = req.user?.role === 'ADMIN';

    const acceptance = await prisma.agreementAcceptance.findUnique({
      where: { id: acceptanceId },
      include: {
        version: {
          include: { agreement: true },
        },
        business: {
          select: { id: true, name: true, email: true },
        },
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!acceptance) {
      res.status(404).json({ success: false, error: 'Sözleşme kabul kaydı bulunamadı.' });
      return;
    }

    // Security check: Only the owning business or an admin can view receipt
    if (!isSuperAdmin && acceptance.business_id !== businessId) {
      res.status(403).json({ success: false, error: 'Bu belgeyi görüntüleme yetkiniz yok.' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: acceptance.id,
        business: acceptance.business,
        user: acceptance.user,
        agreement: {
          code: acceptance.version.agreement.code,
          name: acceptance.version.agreement.name,
          version: acceptance.version.version,
          title: acceptance.version.title,
        },
        verification: {
          accepted_at: acceptance.accepted_at,
          ip_address: acceptance.ip_address,
          user_agent: acceptance.user_agent,
          content_hash: acceptance.content_hash,
          statement: acceptance.statement,
          hash_algorithm: 'SHA-256',
          legal_basis: 'HMK m. 193 Uyarınca Kesin Delil Niteliğinde Elektronik İspat Kaydı',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
