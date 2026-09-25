import prisma from '../../../utils/prisma';
import { AppError } from '../../../middleware/errorHandler';
import { CreatePaymentIntentParams, PaymentIntentResult } from './payment.types';
import { ibanService } from '../iban/iban.service';
import { PaymentMethodType, PaymentStatus } from '@prisma/client';
import { createAuditLog } from '../../audit.service';

export class PaymentService {
  /**
   * Process tip payment redirect or direct bank transfer instruction.
   * Naponi does NOT hold funds, process card data, or act as payment gateway.
   * Flow 1: Direct Bank Transfer (IBAN) -> Venue's bank account
   * Flow 2: External Payment Link (HTTPS) -> Venue's hosted checkout page
   */
  async processPayment(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    let result: PaymentIntentResult;

    if (params.paymentMethodType === PaymentMethodType.IBAN_TRANSFER) {
      result = await ibanService.processIbanPayment(params);
    } else {
      // Find business external payment URL
      const business = await prisma.business.findUnique({
        where: { id: params.businessId },
        select: { external_payment_url: true, name: true },
      });

      if (!business?.external_payment_url || !business.external_payment_url.startsWith('https://')) {
        throw new AppError(
          'Online payment link is not configured for this venue. Please use direct bank transfer or contact the staff.',
          400
        );
      }

      let paymentUrl = business.external_payment_url.trim();

      // Check if template variables are used: {amount}, {currency}, {tip_id}, {reference}
      if (
        paymentUrl.includes('{amount}') ||
        paymentUrl.includes('{currency}') ||
        paymentUrl.includes('{tip_id}') ||
        paymentUrl.includes('{reference}')
      ) {
        paymentUrl = paymentUrl
          .replace(/{amount}/g, encodeURIComponent(String(params.amount)))
          .replace(/{currency}/g, encodeURIComponent(params.currency))
          .replace(/{tip_id}/g, encodeURIComponent(params.tipId))
          .replace(/{reference}/g, encodeURIComponent(params.tipId));
      } else {
        // Automatically append standard query parameters for hosted payment gateways
        const separator = paymentUrl.includes('?') ? '&' : '?';
        paymentUrl = `${paymentUrl}${separator}amount=${encodeURIComponent(String(params.amount))}&currency=${encodeURIComponent(params.currency)}&ref=${encodeURIComponent(params.tipId)}&tip_id=${encodeURIComponent(params.tipId)}`;
      }

      result = {
        transactionId: `ext_${params.tipId}`,
        status: PaymentStatus.PENDING,
        paymentUrl,
      };
    }

    // Update tip record with transaction details and initial status
    await prisma.tip.update({
      where: { id: params.tipId },
      data: {
        payment_status: result.status,
        provider_transaction_id: result.transactionId,
        payment_method: params.paymentMethodType,
      },
    });

    await createAuditLog({
      businessId: params.businessId,
      action: `TIP_INITIATED_${params.paymentMethodType}`,
      entityType: 'tip',
      entityId: params.tipId,
      metadata: {
        amount: params.amount,
        currency: params.currency,
        paymentMethod: params.paymentMethodType,
      },
    });

    return result;
  }

  // Deprecated legacy stubs to prevent legacy script breakage
  getProvider(_name: string): any {
    return null;
  }
  registerProvider(_name: string, _provider: any): void {}
  async processWebhook(_providerName: string, _rawBody: any, _sig?: string): Promise<any> {
    return { success: false, message: 'Webhooks are deprecated (HTTP 410)' };
  }
}

export const paymentService = new PaymentService();
