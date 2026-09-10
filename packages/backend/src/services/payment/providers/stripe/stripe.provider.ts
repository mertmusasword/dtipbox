import { IPaymentProvider } from '../../core/provider.interface';
import { CreatePaymentIntentParams, PaymentIntentResult, WebhookEventResult } from '../../core/payment.types';
import { PaymentStatus } from '@prisma/client';
import { env } from '../../../../config/env';
import { AppError } from '../../../../middleware/errorHandler';
import crypto from 'crypto';

export class StripeProvider implements IPaymentProvider {
  readonly name = 'stripe';

  async createPayment(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    // If stripe secret key is configured, interact with Stripe API or generate checkout session
    const txId = `pi_mock_${crypto.randomBytes(12).toString('hex')}`;
    
    // Check if Stripe key is available for real integration
    if (env.STRIPE_SECRET_KEY) {
      try {
        // Dynamic fetch to avoid crashing if SDK is optional
        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: Math.round(params.amount * 100).toString(),
            currency: params.currency.toLowerCase(),
            'metadata[tipId]': params.tipId,
            'metadata[businessId]': params.businessId,
          }).toString(),
        });

        const data: any = await response.json();
        if (!response.ok) {
          throw new AppError(`Stripe error: ${data.error?.message || 'Failed to create intent'}`, 400);
        }

        return {
          transactionId: data.id,
          status: PaymentStatus.PENDING,
          clientSecret: data.client_secret,
        };
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        console.warn('[StripeProvider] Stripe API call failed, falling back to mock payment session:', err.message);
      }
    }

    // Default simulation fallback for development/sandbox testing
    return {
      transactionId: txId,
      status: PaymentStatus.PENDING,
      clientSecret: `seti_${txId}_secret_${crypto.randomBytes(8).toString('hex')}`,
      paymentUrl: `${env.APP_URL}/tip/checkout-simulate?tx=${txId}&tipId=${params.tipId}`,
    };
  }

  async getPaymentStatus(transactionId: string): Promise<WebhookEventResult> {
    if (env.STRIPE_SECRET_KEY && transactionId.startsWith('pi_') && !transactionId.startsWith('pi_mock_')) {
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${transactionId}`, {
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
      });
      const data: any = await response.json();
      let status: PaymentStatus = PaymentStatus.PENDING;
      if (data.status === 'succeeded') status = PaymentStatus.SUCCESS;
      else if (data.status === 'canceled') status = PaymentStatus.CANCELLED;
      else if (data.status === 'requires_payment_method') status = PaymentStatus.FAILED;

      return {
        transactionId,
        status,
        tipId: data.metadata?.tipId,
      };
    }

    return {
      transactionId,
      status: PaymentStatus.SUCCESS,
    };
  }

  async handleWebhook(rawBody: string | Buffer, signature?: string): Promise<WebhookEventResult> {
    const rawBodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');

    // Webhook signature verification if webhook secret is configured
    if (env.STRIPE_WEBHOOK_SECRET && signature) {
      // If signature is provided, verify HMAC SHA256
      try {
        const parts = signature.split(',');
        const timestampPart = parts.find((p) => p.startsWith('t='))?.split('=')[1];
        const v1Signature = parts.find((p) => p.startsWith('v1='))?.split('=')[1];

        if (timestampPart && v1Signature) {
          // Replay attack prevention: reject events older than 300 seconds (5 minutes)
          const eventTimestamp = parseInt(timestampPart, 10);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          if (isNaN(eventTimestamp) || Math.abs(currentTimestamp - eventTimestamp) > 300) {
            throw new AppError('Webhook timestamp expired or out of tolerance', 400);
          }

          const signedPayload = `${timestampPart}.${rawBodyString}`;
          const expectedSig = crypto
            .createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
            .update(signedPayload)
            .digest('hex');

          const expectedBuffer = Buffer.from(expectedSig, 'utf8');
          const signatureBuffer = Buffer.from(v1Signature, 'utf8');

          if (
            expectedBuffer.length !== signatureBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
          ) {
            throw new AppError('Invalid webhook signature', 400);
          }
        }
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        throw new AppError('Webhook signature verification failed', 400);
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBodyString);
    } catch {
      throw new AppError('Invalid webhook payload format', 400);
    }

    const type = event.type;
    const object = event.data?.object || event;
    const transactionId = object.id || object.transactionId || 'unknown_tx';
    const tipId = object.metadata?.tipId;

    let status: PaymentStatus = PaymentStatus.PENDING;
    if (type === 'payment_intent.succeeded' || event.status === 'succeeded' || event.status === 'SUCCESS') {
      status = PaymentStatus.SUCCESS;
    } else if (type === 'payment_intent.payment_failed' || event.status === 'failed' || event.status === 'FAILED') {
      status = PaymentStatus.FAILED;
    } else if (type === 'payment_intent.canceled' || event.status === 'canceled' || event.status === 'CANCELLED') {
      status = PaymentStatus.CANCELLED;
    }

    return {
      transactionId,
      status,
      tipId,
      metadata: object.metadata,
    };
  }
}

export const stripeProvider = new StripeProvider();
