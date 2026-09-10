import { CreatePaymentIntentParams, PaymentIntentResult, WebhookEventResult } from './payment.types';

export interface IPaymentProvider {
  readonly name: string;
  createPayment(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  getPaymentStatus(transactionId: string): Promise<WebhookEventResult>;
  handleWebhook(rawBody: string | Buffer, signature?: string): Promise<WebhookEventResult>;
}
