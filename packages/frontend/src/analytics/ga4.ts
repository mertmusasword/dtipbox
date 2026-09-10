/**
 * Google Analytics 4 (GA4) Integration
 * Production-Ready, Privacy-Preserving, Non-blocking
 * D-TIPBOX / Naponi Digital Tipping Platform
 */

import {
  GAEventName,
  GAEventParams,
  PageViewParams,
  LanguageSelectedParams,
  BusinessRegisterStartedParams,
  BusinessRegisteredParams,
  LoginParams,
  QrScannedParams,
  TipFlowStartedParams,
  TipAmountSelectedParams,
  PaymentStartedParams,
  PaymentSuccessParams,
  PaymentFailedParams,
} from './types';

// Declare global gtag types on window
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Sensitive keys that MUST NEVER be sent to GA4 (KVKK / GDPR / PCI-DSS compliance)
const PII_DISALLOWED_KEYS = new Set([
  'email',
  'password',
  'token',
  'jwt',
  'secret',
  'iban',
  'accountnumber',
  'card',
  'cardnumber',
  'cvv',
  'cvc',
  'expiry',
  'phone',
  'phonenumber',
  'name',
  'fullname',
  'customername',
  'customermessage',
  'address',
  'ssn',
  'identity',
]);

/**
 * Strips PII / sensitive data from any event parameters.
 */
export function sanitizeParams(params?: Record<string, any>): Record<string, any> {
  if (!params || typeof params !== 'object') return {};

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    if (PII_DISALLOWED_KEYS.has(lowerKey)) {
      continue; // Strip PII completely
    }

    if (val === null || val === undefined) {
      continue;
    }

    if (typeof val === 'object' && !Array.isArray(val)) {
      clean[key] = sanitizeParams(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

// Module state
let isInitialized = false;
let currentMeasurementId: string | null = null;
let isDevMode = false;
const eventLog: Array<{ event: string; params: any; timestamp: number }> = [];

/**
 * Initializes GA4 tracking.
 * - Reads measurement ID from VITE_GA_MEASUREMENT_ID environment variable.
 * - Distinguishes between Dev and Production environments.
 * - Sets Google Consent Mode v2 defaults.
 * - Loads gtag.js asynchronously without blocking rendering.
 */
export function initGA4(customId?: string): boolean {
  if (typeof window === 'undefined') return false;
  if (isInitialized) return true;

  const envId = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_GA_MEASUREMENT_ID
    : undefined;

  const measurementId = customId || envId;
  isDevMode = typeof import.meta !== 'undefined' && import.meta.env
    ? Boolean(import.meta.env.DEV)
    : false;

  currentMeasurementId = measurementId || null;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
  }

  // Google Consent Mode v2 defaults (Privacy-first)
  // Analytics is allowed; Ad personalization & remarketing are denied by default.
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  if (!measurementId) {
    if (isDevMode) {
      console.info('ℹ️ [GA4] No VITE_GA_MEASUREMENT_ID configured. Operating in telemetry mock mode.');
    }
    isInitialized = true;
    return false;
  }

  // Configure gtag
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // SPA handles page views manually
    anonymize_ip: true,    // Mask IP address
    cookie_flags: 'SameSite=None;Secure',
  });

  // Inject script asynchronously
  if (!document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  isInitialized = true;
  if (isDevMode) {
    console.info(`✅ [GA4] Initialized with measurement ID: ${measurementId}`);
  }
  return true;
}

/**
 * Dispatches a sanitized GA4 event.
 */
export function trackEvent(eventName: GAEventName, rawParams?: GAEventParams): void {
  const sanitized = sanitizeParams(rawParams);

  // Always log in development or keep record for testing
  eventLog.push({
    event: eventName,
    params: sanitized,
    timestamp: Date.now(),
  });

  if (isDevMode) {
    console.debug(`📊 [GA4 Event] ${eventName}`, sanitized);
  }

  if (typeof window !== 'undefined' && window.gtag && currentMeasurementId) {
    window.gtag('event', eventName, sanitized);
  }
}

// =============================================================================
// Specific Typed Event Trackers
// =============================================================================

/**
 * 1. page_view — Track SPA Route Change
 */
export function trackPageView(page_path: string, page_title?: string): void {
  const params: PageViewParams = {
    page_path,
    page_title: page_title || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  };
  trackEvent('page_view', params);
}

/**
 * 2. language_selected — Track when user switches language
 */
export function trackLanguageSelected(language: string): void {
  const params: LanguageSelectedParams = { language };
  trackEvent('language_selected', params);
}

/**
 * 3. business_register_started — Funnel step 1: intent to register
 */
export function trackBusinessRegisterStarted(source = 'unknown'): void {
  const params: BusinessRegisterStartedParams = { source };
  trackEvent('business_register_started', params);
}

/**
 * 4. business_registered — Funnel step 2: registration success
 */
export function trackBusinessRegistered(country?: string, currency?: string, method = 'form'): void {
  const params: BusinessRegisteredParams = { country, currency, method };
  trackEvent('business_registered', params);
}

/**
 * 5. login — Track user authentication
 */
export function trackLogin(method = 'email_password'): void {
  const params: LoginParams = { method };
  trackEvent('login', params);
}

/**
 * 6. qr_scanned — Funnel step 1 (customer tipping): QR code opened
 */
export function trackQrScanned(code_id?: string, currency?: string): void {
  const params: QrScannedParams = { code_id, currency };
  trackEvent('qr_scanned', params);
}

/**
 * 7. tip_flow_started — Funnel step 2: Tipping screen active
 */
export function trackTipFlowStarted(currency?: string, has_employee?: boolean): void {
  const params: TipFlowStartedParams = { currency, has_employee };
  trackEvent('tip_flow_started', params);
}

/**
 * 8. tip_amount_selected — Funnel step 3: Preset or custom tip chosen
 */
export function trackTipAmountSelected(value: number, currency: string): void {
  const params: TipAmountSelectedParams = { value, currency };
  trackEvent('tip_amount_selected', params);
}

/**
 * 9. payment_started — Funnel step 4: User clicks submit / checkout
 */
export function trackPaymentStarted(payment_type: string, value: number, currency: string): void {
  const params: PaymentStartedParams = { payment_type, value, currency };
  trackEvent('payment_started', params);
}

/**
 * 10. payment_success — Funnel step 5 (Conversion): Payment completed
 */
export function trackPaymentSuccess(
  payment_type: string,
  transaction_id?: string,
  value?: number,
  currency?: string
): void {
  const params: PaymentSuccessParams = {
    payment_type,
    transaction_id,
    value,
    currency,
  };
  trackEvent('payment_success', params);
}

/**
 * 11. payment_failed — Failure drop-off tracking
 */
export function trackPaymentFailed(payment_type: string, error_reason?: string): void {
  const params: PaymentFailedParams = {
    payment_type,
    error_reason: error_reason ? error_reason.slice(0, 100) : 'unknown',
  };
  trackEvent('payment_failed', params);
}

// =============================================================================
// Testing & Telemetry Inspection Helpers
// =============================================================================

export function _getTrackedEvents() {
  return [...eventLog];
}

export function _clearTrackedEvents() {
  eventLog.length = 0;
}

export function isGA4Active(): boolean {
  return isInitialized;
}
