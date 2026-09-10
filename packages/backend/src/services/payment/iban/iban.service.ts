import prisma from '../../../utils/prisma';
import { AppError } from '../../../middleware/errorHandler';
import { CreatePaymentIntentParams, PaymentIntentResult } from '../core/payment.types';
import { PaymentStatus } from '@prisma/client';

export class IbanService {
  /**
   * Process IBAN / Bank Transfer flow.
   * Master rule: Since D-TIPBOX does not automatically verify bank wire receipts,
   * IBAN transfers must ALWAYS be marked as UNVERIFIED (never auto SUCCESS).
   */
  async processIbanPayment(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const paymentAccount = await prisma.businessPaymentAccount.findUnique({
      where: { business_id: params.businessId },
    });

    if (!paymentAccount) {
      throw new AppError('Business bank payment details not configured', 400);
    }

    const referenceCode = `TIP-${params.tipId.slice(0, 8).toUpperCase()}`;
    const transactionId = `IBAN_${referenceCode}_${Date.now()}`;

    return {
      transactionId,
      status: PaymentStatus.UNVERIFIED,
      instructions: `Please transfer ${params.amount} ${params.currency} to the following bank account with reference code "${referenceCode}".`,
      ibanDetails: {
        accountHolderName: paymentAccount.account_holder_name,
        iban: paymentAccount.iban,
        bankName: paymentAccount.bank_name,
        swiftBic: paymentAccount.swift_bic,
        referenceCode,
      },
    };
  }
}

export const ibanService = new IbanService();
