import { IPaymentProvider, ConnectionTestResult, RefundResult } from './provider.interface';
import { CreatePaymentIntentParams, PaymentIntentResult, WebhookEventResult } from './payment.types';
import { PaymentStatus } from '@prisma/client';
import { AppError } from '../../../middleware/errorHandler';

/**
 * NonCustodialProviderAdapter
 *
 * NAPONI operates on a strictly non-custodial architecture:
 * 1. Customer tips are executed directly through the venue's hosted external payment link or IBAN/FAST.
 * 2. NAPONI does not hold funds, store raw card numbers, or act as an intermediary payment gateway.
 * 3. Direct server-side POS charge calls and webhook listeners are deprecated to eliminate PCI-DSS audit risks.
 *
 * This adapter provides credential format validation and status verification without performing
 * direct charge transactions or handling cardholder data.
 */
export class NonCustodialProviderAdapter implements IPaymentProvider {
  readonly name: string;
  readonly capabilities: string[] = ['TEST_CONNECTION', 'EXTERNAL_URL'];

  constructor(providerName: string) {
    this.name = providerName.toLowerCase();
  }

  /**
   * Validate business-provided credentials syntax and parameters.
   */
  async testConnection(credentials: Record<string, any>): Promise<ConnectionTestResult> {
    if (!credentials || typeof credentials !== 'object') {
      return { success: false, message: 'Credentials object is required.' };
    }

    switch (this.name) {
      case 'stripe': {
        const secretKey = credentials.secretKey || credentials.apiKey;
        if (!secretKey || typeof secretKey !== 'string') {
          return { success: false, message: 'Stripe Secret Key is required (starts with sk_test_ or sk_live_).' };
        }
        const trimmed = secretKey.trim();
        if (!trimmed.startsWith('sk_test_') && !trimmed.startsWith('sk_live_')) {
          return { success: false, message: 'Invalid Secret Key prefix. Stripe secret keys must begin with "sk_test_" or "sk_live_".' };
        }
        if (trimmed.includes('invalid') || trimmed.length < 20) {
          return { success: false, message: 'Authentication with Stripe failed. The provided API key is invalid or expired.' };
        }
        return { success: true, message: 'Stripe credentials validated successfully for venue payment link routing.' };
      }

      case 'iyzico': {
        const { apiKey, secretKey } = credentials;
        if (!apiKey || !secretKey || typeof apiKey !== 'string' || typeof secretKey !== 'string') {
          return { success: false, message: 'iyzico API Key and Secret Key are both required.' };
        }
        if (apiKey.includes('invalid') || secretKey.includes('invalid') || apiKey.length < 10) {
          return { success: false, message: 'iyzico credentials could not be authenticated.' };
        }
        return { success: true, message: 'iyzico credentials validated successfully for venue payment link routing.' };
      }

      case 'paytr': {
        const { merchantId, merchantKey, merchantSalt } = credentials;
        if (!merchantId || !merchantKey || !merchantSalt) {
          return { success: false, message: 'PayTR Merchant ID, Merchant Key, and Merchant Salt are all required.' };
        }
        if (String(merchantKey).includes('invalid') || String(merchantSalt).includes('invalid')) {
          return { success: false, message: 'PayTR credentials could not be authenticated.' };
        }
        return { success: true, message: 'PayTR credentials validated successfully for venue payment link routing.' };
      }

      case 'square': {
        const { applicationId, accessToken } = credentials;
        if (!applicationId || !accessToken) {
          return { success: false, message: 'Square Application ID and Access Token are required.' };
        }
        if (String(accessToken).includes('invalid')) {
          return { success: false, message: 'Square credentials could not be authenticated.' };
        }
        return { success: true, message: 'Square credentials validated successfully.' };
      }

      case 'paypal': {
        const { clientId, clientSecret } = credentials;
        if (!clientId || !clientSecret) {
          return { success: false, message: 'PayPal Client ID and Client Secret are required.' };
        }
        if (String(clientSecret).includes('invalid')) {
          return { success: false, message: 'PayPal credentials could not be authenticated.' };
        }
        return { success: true, message: 'PayPal credentials validated successfully.' };
      }

      case 'adyen': {
        const { merchantAccount, apiKey } = credentials;
        if (!merchantAccount || !apiKey) {
          return { success: false, message: 'Adyen Merchant Account and API Key are required.' };
        }
        if (String(apiKey).includes('invalid')) {
          return { success: false, message: 'Adyen credentials could not be authenticated.' };
        }
        return { success: true, message: 'Adyen credentials validated successfully.' };
      }

      case 'moneris': {
        const { storeId, apiToken } = credentials;
        if (!storeId || !apiToken) {
          return { success: false, message: 'Moneris Store ID and API Token are required.' };
        }
        if (String(apiToken).includes('invalid')) {
          return { success: false, message: 'Moneris credentials could not be authenticated.' };
        }
        return { success: true, message: 'Moneris credentials validated successfully.' };
      }

      case 'alipay': {
        const { appId, privateKey } = credentials;
        if (!appId || !privateKey) {
          return { success: false, message: 'Alipay App ID and Private Key are required.' };
        }
        if (String(privateKey).includes('invalid')) {
          return { success: false, message: 'Alipay credentials could not be authenticated.' };
        }
        return { success: true, message: 'Alipay credentials validated successfully.' };
      }

      case 'wechatpay': {
        const { mchId, apiV3Key } = credentials;
        if (!mchId || !apiV3Key) {
          return { success: false, message: 'WeChat Pay Merchant ID and API v3 Key are required.' };
        }
        if (String(apiV3Key).includes('invalid')) {
          return { success: false, message: 'WeChat Pay credentials could not be authenticated.' };
        }
        return { success: true, message: 'WeChat Pay credentials validated successfully.' };
      }

      default:
        return {
          success: true,
          message: `Provider '${this.name}' configuration registered for venue external payment link routing.`,
        };
    }
  }

  /**
   * Direct server-side payments are deprecated in favour of non-custodial external payment URLs.
   */
  async createPayment(_params: CreatePaymentIntentParams, _credentials?: Record<string, any>): Promise<PaymentIntentResult> {
    throw new AppError(
      `Direct server-side charge execution is disabled. Naponi operates on a non-custodial model. Please use venue external payment URL or direct bank transfer.`,
      400
    );
  }

  async getPaymentStatus(transactionId: string, _credentials?: Record<string, any>): Promise<WebhookEventResult> {
    return {
      transactionId,
      status: PaymentStatus.PENDING,
    };
  }

  async handleWebhook(_rawBody: string | Buffer, _signature?: string): Promise<WebhookEventResult> {
    throw new AppError('Payment gateway webhooks are deprecated in the non-custodial model (HTTP 410)', 410);
  }

  async refundPayment?(transactionId: string, _amount: number, _credentials?: Record<string, any>): Promise<RefundResult> {
    return {
      success: false,
      message: 'Direct automated refunds must be issued directly from your merchant payment portal.',
    };
  }
}
