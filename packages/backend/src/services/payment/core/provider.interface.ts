import { CreatePaymentIntentParams, PaymentIntentResult, WebhookEventResult } from './payment.types';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
}

export interface IPaymentProvider {
  readonly name: string;
  readonly capabilities: string[];

  /**
   * Validate credentials and test connectivity with provider gateway/API.
   */
  testConnection(credentials: Record<string, any>): Promise<ConnectionTestResult>;

  /**
   * Initialize a payment intent/charge with provider.
   */
  createPayment(params: CreatePaymentIntentParams, credentials?: Record<string, any>): Promise<PaymentIntentResult>;

  /**
   * Fetch payment transaction status from provider.
   */
  getPaymentStatus(transactionId: string, credentials?: Record<string, any>): Promise<WebhookEventResult>;

  /**
   * Handle incoming provider webhook notifications.
   */
  handleWebhook(rawBody: string | Buffer, signature?: string): Promise<WebhookEventResult>;

  /**
   * Optional refund capability.
   */
  refundPayment?(transactionId: string, amount: number, credentials?: Record<string, any>): Promise<RefundResult>;
}
