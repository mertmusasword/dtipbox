import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../utils/prisma';
import { AgreementStatus } from '@prisma/client';
import { MERCHANT_SERVICE_AGREEMENT_CODE } from '../templates/merchantAgreementText';

/**
 * Middleware ensuring that the business has accepted the active published agreement version.
 * If not accepted, returns HTTP 403 with AGREEMENT_REQUIRED error code.
 */
export async function requireAcceptedAgreement(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only applies to business accounts
    if (req.user?.role !== 'BUSINESS') {
      next();
      return;
    }

    const businessId = req.user?.businessId;
    if (!businessId) {
      next();
      return;
    }

    // Find active published version
    const activeVersion = await prisma.agreementVersion.findFirst({
      where: {
        agreement: { code: MERCHANT_SERVICE_AGREEMENT_CODE },
        status: AgreementStatus.PUBLISHED,
      },
      orderBy: { effective_date: 'desc' },
    });

    if (!activeVersion) {
      next();
      return;
    }

    const acceptance = await prisma.agreementAcceptance.findUnique({
      where: {
        business_id_agreement_version_id: {
          business_id: businessId,
          agreement_version_id: activeVersion.id,
        },
      },
    });

    if (!acceptance) {
      res.status(403).json({
        success: false,
        error: 'AGREEMENT_REQUIRED',
        message:
          "Devam etmek için lütfen güncel Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni inceleyip onaylayınız.",
        agreementVersionId: activeVersion.id,
        version: activeVersion.version,
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
