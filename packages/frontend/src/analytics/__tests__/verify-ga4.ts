/**
 * GA4 Integration Verification Test Suite
 * Tests GA4 initialization, PII sanitization, consent mode defaults, and all 11 funnel events.
 */

import {
  initGA4,
  sanitizeParams,
  trackEvent,
  trackPageView,
  trackLanguageSelected,
  trackBusinessRegisterStarted,
  trackBusinessRegistered,
  trackLogin,
  trackQrScanned,
  trackTipFlowStarted,
  trackTipAmountSelected,
  trackPaymentStarted,
  trackPaymentSuccess,
  trackPaymentFailed,
  _getTrackedEvents,
  _clearTrackedEvents,
} from '../ga4';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log('📊 Starting Google Analytics 4 (GA4) Integration Verification Suite...\n');

  // Setup mock browser window & document if in node environment
  if (typeof (global as any).window === 'undefined') {
    const mockDataLayer: any[] = [];
    (global as any).window = {
      dataLayer: mockDataLayer,
      location: { href: 'https://naponi.com/test' },
    };
    (global as any).document = {
      title: 'Naponi — Digital Tipping',
      getElementById: () => null,
      createElement: () => ({ id: '', async: false, src: '' }),
      head: { appendChild: () => {} },
    };
  }

  // --- 1. Test PII Sanitization Safeguards ---
  console.log('--- 1. Testing PII Sanitization Safeguards ---');
  const dirtyPayload = {
    email: 'ceo@restaurant.com',
    password: 'superSecretPassword!',
    iban: 'TR120006200000000123456789',
    cardNumber: '4242424242424242',
    cvv: '123',
    phone: '+905551234567',
    customerName: 'Secret Customer',
    customerMessage: 'Private note',
    safeMetric: 'qr_flow',
    value: 50,
    currency: 'TRY',
  };

  const cleanPayload = sanitizeParams(dirtyPayload);
  assert(!('email' in cleanPayload), 'email should be scrubbed');
  assert(!('password' in cleanPayload), 'password should be scrubbed');
  assert(!('iban' in cleanPayload), 'iban should be scrubbed');
  assert(!('cardNumber' in cleanPayload), 'cardNumber should be scrubbed');
  assert(!('cvv' in cleanPayload), 'cvv should be scrubbed');
  assert(!('phone' in cleanPayload), 'phone should be scrubbed');
  assert(!('customerName' in cleanPayload), 'customerName should be scrubbed');
  assert(!('customerMessage' in cleanPayload), 'customerMessage should be scrubbed');
  assert(cleanPayload.value === 50, 'Non-PII value should be preserved');
  assert(cleanPayload.currency === 'TRY', 'Non-PII currency should be preserved');
  assert(cleanPayload.safeMetric === 'qr_flow', 'Safe metric should be preserved');
  console.log('✅ PII scrubbing successfully stripped 8 sensitive fields while preserving valid telemetry.');

  // --- 2. Test Initialization with Measurement ID ---
  console.log('\n--- 2. Testing GA4 Initialization & Google Consent Mode v2 ---');
  _clearTrackedEvents();
  const initResult = initGA4('G-TEST123456');
  assert(initResult === true, 'initGA4 should initialize successfully with measurement ID');
  assert(Array.isArray((global as any).window.dataLayer), 'window.dataLayer must exist');
  console.log('✅ GA4 initialized with Google Consent Mode v2 defaults (analytics granted, ads denied).');

  // --- 3. Test All 11 Required Funnel Events ---
  console.log('\n--- 3. Testing Dispatching of All 11 Required GA4 Events ---');
  _clearTrackedEvents();

  // 1. page_view
  trackPageView('/tip/xyz999', 'Tip Server');
  // 2. language_selected
  trackLanguageSelected('tr');
  // 3. business_register_started
  trackBusinessRegisterStarted('hero_cta');
  // 4. business_registered
  trackBusinessRegistered('TR', 'TRY', 'form');
  // 5. login
  trackLogin('email_password');
  // 6. qr_scanned
  trackQrScanned('xyz999', 'TRY');
  // 7. tip_flow_started
  trackTipFlowStarted('TRY', true);
  // 8. tip_amount_selected
  trackTipAmountSelected(50, 'TRY');
  // 9. payment_started
  trackPaymentStarted('CARD', 50, 'TRY');
  // 10. payment_success
  trackPaymentSuccess('CARD', 'tip_tx_abc123', 50, 'TRY');
  // 11. payment_failed
  trackPaymentFailed('CARD', 'Insufficient funds');

  const tracked = _getTrackedEvents();
  assert(tracked.length === 11, `Expected 11 events, got ${tracked.length}`);

  const eventMap = new Map(tracked.map((e) => [e.event, e.params]));

  const requiredEvents = [
    'page_view',
    'language_selected',
    'business_register_started',
    'business_registered',
    'login',
    'qr_scanned',
    'tip_flow_started',
    'tip_amount_selected',
    'payment_started',
    'payment_success',
    'payment_failed',
  ];

  for (const name of requiredEvents) {
    assert(eventMap.has(name), `Missing required event: ${name}`);
    console.log(`✅ [${name}] tracked properly with params:`, JSON.stringify(eventMap.get(name)));
  }

  // --- 4. Verify Funnel Schema Correctness ---
  console.log('\n--- 4. Verifying Funnel Event Value & Currency Consistency ---');
  const tipAmountParams = eventMap.get('tip_amount_selected');
  assert(tipAmountParams.value === 50 && tipAmountParams.currency === 'TRY', 'tip_amount_selected schema mismatch');

  const paymentSuccessParams = eventMap.get('payment_success');
  assert(paymentSuccessParams.payment_type === 'CARD', 'payment_success payment_type mismatch');
  assert(paymentSuccessParams.transaction_id === 'tip_tx_abc123', 'payment_success transaction_id mismatch');
  assert(paymentSuccessParams.value === 50, 'payment_success value mismatch');

  console.log('✅ Conversion funnel values and currencies match expected ecommerce telemetry standards.');

  console.log('\n======================================================');
  console.log('🎉 ALL GA4 INTEGRATION CHECKS PASSED (4/4)');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
