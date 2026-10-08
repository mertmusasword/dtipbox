import crypto from 'crypto';
import prisma from '../utils/prisma';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { StoreOrderStatus, StorePaymentMethod } from '@prisma/client';
import { logger } from '../utils/logger';

export interface CreateStoreCheckoutParams {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  redirectUrl?: string;
}

export interface CreateCommissionCheckoutParams {
  businessId: string;
  businessName: string;
  periodKey?: string;
  totalAmount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  redirectUrl?: string;
}

interface CachedRate {
  rate: number;
  timestamp: number;
}

const exchangeRateCache = new Map<string, CachedRate>();

/**
 * Lemon Squeezy Global Merchant of Record (MoR) Integration
 * Powers credit card, debit card, Apple Pay, Google Pay, and international multi-currency checkouts.
 */
export class LemonSqueezyService {
  private get apiKey(): string {
    return env.LEMONSQUEEZY_API_KEY || process.env.LEMONSQUEEZY_API_KEY || '';
  }

  private get storeId(): string {
    return env.LEMONSQUEEZY_STORE_ID || process.env.LEMONSQUEEZY_STORE_ID || '';
  }

  private get variantId(): string {
    return env.LEMONSQUEEZY_VARIANT_ID || process.env.LEMONSQUEEZY_VARIANT_ID || '2219925';
  }

  private get webhookSecret(): string {
    return env.LEMONSQUEEZY_WEBHOOK_SECRET || process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
  }

  /**
   * Verify whether Lemon Squeezy is configured
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.storeId && this.variantId);
  }

  /**
   * Fetch live forex exchange rate with in-memory TTL caching and fast fallback
   */
  private async getUsdRate(currency: string): Promise<number> {
    const cur = currency.toUpperCase();
    if (cur === 'USD') return 1;

    const cached = exchangeRateCache.get(cur);
    const now = Date.now();
    if (cached && now - cached.timestamp < 60 * 60 * 1000) {
      return cached.rate;
    }

    const defaultFallback = cur === 'TRY' ? 1 / 38.5 : cur === 'EUR' ? 1.08 : cur === 'GBP' ? 1.28 : 1;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`https://open.er-api.com/v6/latest/${cur}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        if (data?.rates?.USD && typeof data.rates.USD === 'number') {
          const liveRate = data.rates.USD;
          exchangeRateCache.set(cur, { rate: liveRate, timestamp: now });
          return liveRate;
        }
      }
    } catch (err: any) {
      logger.warn(`[LemonSqueezy] Live FX rate fetch failed for ${cur}: ${err.message}. Using fallback.`, 'LemonSqueezy');
    }

    if (cached) {
      return cached.rate;
    }

    exchangeRateCache.set(cur, { rate: defaultFallback, timestamp: now });
    return defaultFallback;
  }

  /**
   * Convert an arbitrary currency amount to USD cents (Lemon Squeezy store currency)
   */
  private async convertToUsdCents(amount: number, currency: string): Promise<number> {
    const usdRate = await this.getUsdRate(currency);
    const usdAmount = amount * usdRate;
    // Minimum Lemon Squeezy checkout is $0.50 (50 cents)
    return Math.max(50, Math.round(usdAmount * 100));
  }

  /**
   * Create dynamic Lemon Squeezy hosted checkout for a store order
   */
  public async createStoreCheckout(params: CreateStoreCheckoutParams): Promise<{ checkoutUrl: string }> {
    if (!this.isConfigured()) {
      throw new AppError('Global payment gateway is not properly configured.', 503);
    }

    const amountInCents = await this.convertToUsdCents(params.totalAmount, params.currency);
    const publicAppUrl =
      env.APP_URL && !env.APP_URL.includes('localhost') && env.APP_URL.startsWith('http')
        ? env.APP_URL
        : 'https://www.naponi.com';
    const redirectUrl =
      params.redirectUrl ||
      `${publicAppUrl}/business/store?tab=orders&order=${encodeURIComponent(params.orderNumber)}&payment=success`;

    const requestPayload = {
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: amountInCents,
          checkout_options: {
            dark: true,
            button_color: '#0284c7',
          },
          product_options: {
            name: `Naponi Order #${params.orderNumber}`,
            description:
              params.description ||
              `Naponi Hardware & Table QR Delivery (${params.totalAmount} ${params.currency})`,
            redirect_url: redirectUrl,
          },
          checkout_data: {
            email: params.customerEmail || undefined,
            name: params.customerName || undefined,
            custom: {
              order_id: params.orderId,
              order_number: params.orderNumber,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: this.storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: this.variantId,
            },
          },
        },
      },
    };

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('[LemonSqueezy] Checkout creation failed', 'LemonSqueezy', { status: response.status, error: errText });
      throw new AppError('Kredi kartı ile ödeme oturumu başlatılamadı. Lütfen daha sonra tekrar deneyiniz.', 502);
    }

    const resJson: any = await response.json();
    const checkoutUrl = resJson?.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new AppError('Ödeme oturumu adresi oluşturulamadı.', 502);
    }

    return { checkoutUrl };
  }

  /**
   * Create dynamic Lemon Squeezy hosted checkout for a business commission settlement
   */
  public async createCommissionCheckout(params: CreateCommissionCheckoutParams): Promise<{ checkoutUrl: string }> {
    if (!this.isConfigured()) {
      throw new AppError('Global payment gateway is not properly configured.', 503);
    }

    const amountInCents = await this.convertToUsdCents(params.totalAmount, params.currency);
    const publicAppUrl =
      env.APP_URL && !env.APP_URL.includes('localhost') && env.APP_URL.startsWith('http')
        ? env.APP_URL
        : 'https://www.naponi.com';
    const redirectUrl =
      params.redirectUrl ||
      `${publicAppUrl}/business/payment-settings?tab=commissions&settled=success&period=${encodeURIComponent(params.periodKey || 'ALL_PENDING')}`;

    const periodLabel = params.periodKey && params.periodKey !== 'ALL_PENDING' ? params.periodKey : 'Cari Dönem';

    const requestPayload = {
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: amountInCents,
          checkout_options: {
            dark: true,
            button_color: '#0284c7',
          },
          product_options: {
            name: `Naponi Platform Mutabakatı - ${params.businessName}`,
            description: `Dönem: ${periodLabel} • Mutabakat Komisyon Ödemesi (${params.totalAmount} ${params.currency})`,
            redirect_url: redirectUrl,
          },
          checkout_data: {
            email: params.customerEmail || undefined,
            name: params.customerName || undefined,
            custom: {
              type: 'COMMISSION_SETTLEMENT',
              business_id: params.businessId,
              period_key: params.periodKey || 'ALL_PENDING',
              amount: params.totalAmount,
              currency: params.currency,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: this.storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: this.variantId,
            },
          },
        },
      },
    };

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('[LemonSqueezy] Commission checkout creation failed', 'LemonSqueezy', { status: response.status, error: errText });
      throw new AppError('Kredi kartı ile ödeme oturumu başlatılamadı.', 502);
    }

    const resJson: any = await response.json();
    const checkoutUrl = resJson?.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new AppError('Ödeme oturumu adresi oluşturulamadı.', 502);
    }

    return { checkoutUrl };
  }

  /**
   * Verify Lemon Squeezy webhook signature (X-Signature HMAC SHA-256)
   */
  public verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    if (!signature || !this.webhookSecret) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
      const signatureBuffer = Buffer.from(signature, 'utf8');

      if (digest.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(digest, signatureBuffer);
    } catch (err) {
      logger.error('[LemonSqueezy] Webhook signature verification error: ' + String(err), 'LemonSqueezy');
      return false;
    }
  }

  /**
   * Handle incoming Lemon Squeezy webhook event
   */
  public async handleWebhook(payload: any): Promise<{ handled: boolean; event: string }> {
    const eventName = payload?.meta?.event_name;
    const customData = payload?.meta?.custom_data || {};
    const orderId = customData.order_id;
    const orderNumber = customData.order_number;

    logger.info(`[LemonSqueezy Webhook] Received event: ${eventName}`, 'LemonSqueezy', { orderId, orderNumber, customData });

    if (eventName === 'order_created') {
      const attributes = payload?.data?.attributes || {};

      // 1. Commission Settlement Payment
      if (customData.type === 'COMMISSION_SETTLEMENT') {
        const { business_id, period_key, amount, currency } = customData;
        if (business_id) {
          const commissionService = await import('./commission.service');
          await commissionService.settleCommissionViaCard(business_id, {
            periodKey: period_key,
            paymentMethod: 'CREDIT_CARD',
            lemonSqueezyOrderId: payload?.data?.id ? String(payload.data.id) : undefined,
            userEmail: attributes.user_email,
            amount: Number(amount) || 0,
            currency: currency || 'TRY',
          });
          logger.info(`[LemonSqueezy Webhook] Commission settlement for business ${business_id} marked as SETTLED.`);
        }
        return { handled: true, event: eventName };
      }

      // 2. Hardware / QR Store Order Payment
      if (orderId) {
        const existingOrder = await prisma.storeOrder.findUnique({
          where: { id: orderId },
        });

        if (existingOrder) {
          await prisma.storeOrder.update({
            where: { id: orderId },
            data: {
              status: StoreOrderStatus.PREPARING,
              payment_status: 'PAID',
              payment_method: StorePaymentMethod.CREDIT_CARD,
              transfer_sender_note: `Lemon Squeezy Order #${payload?.data?.id || ''} (${attributes.user_email || ''})`,
            },
          });
          logger.info(`[LemonSqueezy Webhook] Order ${orderId} marked as PAID & PREPARING.`);
        }
      }
      return { handled: true, event: eventName };
    }

    if (eventName === 'order_refunded') {
      if (orderId) {
        await prisma.storeOrder.updateMany({
          where: { id: orderId },
          data: {
            payment_status: 'REFUNDED',
            status: StoreOrderStatus.CANCELLED,
          },
        });
        logger.info(`[LemonSqueezy Webhook] Order ${orderId} marked as REFUNDED & CANCELLED.`);
      }
      return { handled: true, event: eventName };
    }

    return { handled: true, event: eventName || 'unknown' };
  }
}

export const lemonSqueezyService = new LemonSqueezyService();
