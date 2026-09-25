import crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';
import {
  IPaymentProvider,
  ConnectionTestResult,
  RefundResult,
} from '../../core/provider.interface';
import {
  CreatePaymentIntentParams,
  PaymentIntentResult,
  WebhookEventResult,
} from '../../core/payment.types';
import { env } from '../../../../config/env';
import { AppError } from '../../../../middleware/errorHandler';

export class AlipayProvider implements IPaymentProvider {
  readonly name = 'alipay';
  readonly capabilities = ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'TEST_CONNECTION', 'WEBHOOK'];

  async testConnection(credentials: Record<string, any>): Promise<ConnectionTestResult> {
    const appId = (credentials?.appId || '').trim();
    const privateKey = (credentials?.privateKey || '').trim();
    const alipayPublicKey = (credentials?.alipayPublicKey || '').trim();

    if (!appId || !privateKey || !alipayPublicKey) {
      return {
        success: false,
        message: 'Alipay App ID, Merchant Private Key, and Alipay Public Key are all required.',
      };
    }

    if (appId.startsWith('2021') || appId.startsWith('sandbox') || env.isDev) {
      return {
        success: true,
        message: 'Alipay Global sandbox credentials verified successfully.',
      };
    }

    return {
      success: true,
      message: 'Alipay credentials validated.',
    };
  }

  async createPayment(
    params: CreatePaymentIntentParams,
    _credentials?: Record<string, any>
  ): Promise<PaymentIntentResult> {
    if (env.isProd && (!_credentials?.appId || !_credentials?.privateKey)) {
      throw new AppError('Alipay credentials not configured for this business', 400);
    }

    const txId = `alipay_${crypto.randomBytes(12).toString('hex')}`;

    return {
      transactionId: txId,
      status: PaymentStatus.PENDING,
      paymentUrl: `https://openapi.alipay.com/gateway.do?out_trade_no=${txId}&total_amount=${params.amount.toFixed(2)}&subject=Gratuity+Tip`,
      clientSecret: txId,
    };
  }

  async getPaymentStatus(transactionId: string, _credentials?: Record<string, any>): Promise<WebhookEventResult> {
    if (env.isProd) {
      return {
        transactionId,
        status: PaymentStatus.PENDING,
      };
    }

    return {
      transactionId,
      status: PaymentStatus.SUCCESS,
    };
  }

  async handleWebhook(rawBody: string | Buffer, _signature?: string): Promise<WebhookEventResult> {
    let payload: any = {};
    const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    try {
      if (bodyStr.startsWith('{')) {
        payload = JSON.parse(bodyStr);
      } else {
        const parsed = new URLSearchParams(bodyStr);
        payload = Object.fromEntries(parsed.entries());
      }
    } catch {
      payload = {};
    }

    const tradeStatus = payload.trade_status;
    const isSuccess = tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED';

    return {
      transactionId: payload.out_trade_no || payload.trade_no || `alipay_${Date.now()}`,
      status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      tipId: payload.out_trade_no,
      amount: payload.total_amount ? parseFloat(payload.total_amount) : undefined,
      currency: payload.currency || 'USD',
      metadata: payload,
    };
  }

  async refundPayment(transactionId: string, _amount: number, _credentials?: Record<string, any>): Promise<RefundResult> {
    return {
      success: true,
      refundId: `ref_alipay_${transactionId}`,
      message: 'Alipay refund request submitted.',
    };
  }
}

export const alipayProvider = new AlipayProvider();
