import { PaymentMethodType, PaymentStatus } from '@prisma/client';

export interface CreatePaymentIntentParams {
  tipId: string;
  businessId: string;
  amount: number;
  currency: string;
  paymentMethodType: PaymentMethodType;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  transactionId: string;
  status: PaymentStatus;
  clientSecret?: string;
  paymentUrl?: string;
  instructions?: string;
  ibanDetails?: {
    accountHolderName: string;
    iban?: string | null;
    bankName?: string | null;
    swiftBic?: string | null;
    referenceCode: string;
  };
}

export interface WebhookEventResult {
  transactionId: string;
  status: PaymentStatus;
  tipId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
}
