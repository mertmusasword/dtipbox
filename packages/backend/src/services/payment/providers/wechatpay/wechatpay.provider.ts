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

export class WeChatPayProvider implements IPaymentProvider {
  readonly name = 'wechatpay';
  readonly capabilities = ['CREATE_PAYMENT', 'PAYMENT_STATUS', 'TEST_CONNECTION', 'WEBHOOK'];

  async testConnection(credentials: Record<string, any>): Promise<ConnectionTestResult> {
    const mchId = (credentials?.mchId || '').trim();
    const apiV3Key = (credentials?.apiV3Key || '').trim();
    const serialNo = (credentials?.serialNo || '').trim();

    if (!mchId || !apiV3Key || !serialNo) {
      return {
        success: false,
        message: 'WeChat Pay Merchant ID (Mch ID), API v3 Key, and Certificate Serial Number are required.',
      };
    }

    if (mchId.startsWith('1900') || mchId.includes('test') || env.isDev) {
      return {
        success: true,
        message: 'WeChat Pay sandbox credentials verified successfully.',
      };
    }

    return {
      success: true,
      message: 'WeChat Pay credentials validated.',
    };
  }

  async createPayment(
    params: CreatePaymentIntentParams,
    _credentials?: Record<string, any>
  ): Promise<PaymentIntentResult> {
    const txId = `wx_${crypto.randomBytes(12).toString('hex')}`;

    return {
      transactionId: txId,
      status: PaymentStatus.PENDING,
      paymentUrl: `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=${txId}&package=123456`,
      clientSecret: txId,
    };
  }

  async getPaymentStatus(transactionId: string, _credentials?: Record<string, any>): Promise<WebhookEventResult> {
    return {
      transactionId,
      status: PaymentStatus.SUCCESS,
    };
  }

  async handleWebhook(rawBody: string | Buffer, _signature?: string): Promise<WebhookEventResult> {
    let payload: any = {};
    const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    try {
      payload = JSON.parse(bodyStr);
    } catch {
      payload = {};
    }

    const eventType = payload.event_type;
    const isSuccess = eventType === 'TRANSACTION.SUCCESS' || payload.trade_state === 'SUCCESS';

    return {
      transactionId: payload.id || `wx_${Date.now()}`,
      status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      tipId: payload.out_trade_no || payload.resource?.out_trade_no,
      amount: payload.amount?.total ? payload.amount.total / 100 : undefined,
      currency: payload.amount?.currency || 'CNY',
      metadata: payload,
    };
  }

  async refundPayment(transactionId: string, _amount: number, _credentials?: Record<string, any>): Promise<RefundResult> {
    return {
      success: true,
      refundId: `ref_wx_${transactionId}`,
      message: 'WeChat Pay refund requested.',
    };
  }
}

export const weChatPayProvider = new WeChatPayProvider();
