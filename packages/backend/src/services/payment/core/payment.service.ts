import prisma from '../../../utils/prisma';
import { AppError } from '../../../middleware/errorHandler';
import { CreatePaymentIntentParams, PaymentIntentResult, WebhookEventResult } from './payment.types';
import { ibanService } from '../iban/iban.service';
import { stripeProvider } from '../providers/stripe/stripe.provider';
import { IPaymentProvider } from './provider.interface';
import { PaymentMethodType, PaymentStatus } from '@prisma/client';
import { createAuditLog } from '../../audit.service';
import { decryptJson } from '../../../utils/crypto.util';
import { providerRegistry } from './providerRegistry';

export class PaymentService {
  private providers: Map<string, IPaymentProvider> = new Map();

  constructor() {
    this.registerProvider('stripe', stripeProvider);
    // Generic payment channel aliases default to primary card provider
    this.registerProvider('card', stripeProvider);
    this.registerProvider('apple_pay', stripeProvider);
    this.registerProvider('google_pay', stripeProvider);
  }

  registerProvider(name: string, provider: IPaymentProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  getProvider(name: string): IPaymentProvider {
    const provider = this.providers.get(name.toLowerCase()) || providerRegistry.getAdapter(name.toLowerCase());
    if (!provider) {
      throw new AppError(`Payment provider '${name}' is not supported`, 400);
    }
    return provider;
  }

  /**
   * Initialize a payment for a tip.
   * Handles both IBAN direct and online provider methods.
   */
  async processPayment(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    // 1. Verify that the payment method is ACTIVE and valid for the business
    const method = await prisma.paymentMethod.findUnique({
      where: {
        business_id_type: {
          business_id: params.businessId,
          type: params.paymentMethodType,
        },
      },
    });

    if (!method || method.status !== 'ACTIVE') {
      throw new AppError(`Payment method ${params.paymentMethodType} is currently unavailable for this business`, 400);
    }

    let result: PaymentIntentResult;

    if (params.paymentMethodType === PaymentMethodType.IBAN_TRANSFER) {
      result = await ibanService.processIbanPayment(params);
    } else {
      // Find connected integration for business
      const integration = await prisma.paymentIntegration.findFirst({
        where: {
          business_id: params.businessId,
          status: 'CONNECTED',
        },
      });

      let credentials: Record<string, any> | undefined;
      if (integration?.credentials_encrypted) {
        credentials = decryptJson(integration.credentials_encrypted) || undefined;
      }

      const providerName = integration?.provider || 'stripe';
      const provider = this.getProvider(providerName);
      result = await provider.createPayment(params, credentials);
    }

    // 2. Update tip with transaction details and status
    await prisma.tip.update({
      where: { id: params.tipId },
      data: {
        payment_status: result.status,
        provider_transaction_id: result.transactionId,
        payment_method: params.paymentMethodType,
      },
    });

    return result;
  }

  /**
   * Process webhook notifications with idempotency and duplicate event protection.
   */
  async processWebhook(providerName: string, rawBody: string | Buffer, signature?: string): Promise<{ success: boolean; message: string }> {
    const provider = this.getProvider(providerName);
    const eventResult: WebhookEventResult = await provider.handleWebhook(rawBody, signature);

    if (!eventResult.transactionId) {
      return { success: false, message: 'Missing transaction identifier' };
    }

    // Duplicate protection: Find tip by provider_transaction_id
    const tip = await prisma.tip.findFirst({
      where: {
        OR: [
          { provider_transaction_id: eventResult.transactionId },
          ...(eventResult.tipId ? [{ id: eventResult.tipId }] : []),
        ],
      },
      include: { business: true },
    });

    if (!tip) {
      console.warn(`[PaymentWebhook] No tip found for transaction: ${eventResult.transactionId}`);
      return { success: true, message: 'Event ignored: No matching tip' };
    }

    // If payment already in final status (SUCCESS/CANCELLED), protect against duplicates
    if (tip.payment_status === PaymentStatus.SUCCESS && eventResult.status === PaymentStatus.SUCCESS) {
      return { success: true, message: 'Duplicate success event ignored' };
    }

    // Update status
    await prisma.tip.update({
      where: { id: tip.id },
      data: {
        payment_status: eventResult.status,
        provider_transaction_id: eventResult.transactionId,
      },
    });

    await createAuditLog({
      businessId: tip.business_id,
      action: `PAYMENT_${eventResult.status}`,
      entityType: 'tip',
      entityId: tip.id,
      metadata: {
        provider: providerName,
        transactionId: eventResult.transactionId,
        amount: tip.amount.toString(),
        currency: tip.currency,
      },
    });

    return { success: true, message: `Payment updated to ${eventResult.status}` };
  }
}

export const paymentService = new PaymentService();
