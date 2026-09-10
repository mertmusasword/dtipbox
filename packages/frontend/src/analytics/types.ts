/**
 * Google Analytics 4 (GA4) Types & Event Interfaces
 * D-TIPBOX / Naponi Digital Tipping Platform
 */

export type GAEventName =
  | 'page_view'
  | 'language_selected'
  | 'business_register_started'
  | 'business_registered'
  | 'login'
  | 'qr_scanned'
  | 'tip_flow_started'
  | 'tip_amount_selected'
  | 'payment_started'
  | 'payment_success'
  | 'payment_failed';

export interface PageViewParams {
  page_path: string;
  page_title?: string;
  page_location?: string;
}

export interface LanguageSelectedParams {
  language: string;
}

export interface BusinessRegisterStartedParams {
  source?: string;
}

export interface BusinessRegisteredParams {
  country?: string;
  currency?: string;
  method?: string;
}

export interface LoginParams {
  method?: string;
}

export interface QrScannedParams {
  code_id?: string;
  currency?: string;
}

export interface TipFlowStartedParams {
  currency?: string;
  has_employee?: boolean;
}

export interface TipAmountSelectedParams {
  value: number;
  currency: string;
}

export interface PaymentStartedParams {
  payment_type: string;
  value: number;
  currency: string;
}

export interface PaymentSuccessParams {
  payment_type: string;
  transaction_id?: string;
  value?: number;
  currency?: string;
}

export interface PaymentFailedParams {
  payment_type: string;
  error_reason?: string;
}

export type GAEventParams =
  | PageViewParams
  | LanguageSelectedParams
  | BusinessRegisterStartedParams
  | BusinessRegisteredParams
  | LoginParams
  | QrScannedParams
  | TipFlowStartedParams
  | TipAmountSelectedParams
  | PaymentStartedParams
  | PaymentSuccessParams
  | PaymentFailedParams
  | Record<string, any>;

export interface GA4Config {
  measurementId?: string;
  debug?: boolean;
  isProd?: boolean;
}
