# NAPONI — Archived Virtual POS & Direct-Charge Payment Adapters

## Background & Architecture Decision

This directory contains legacy, server-side direct-charge payment adapters (`Stripe`, `PayTR`, `iyzico`, `Square`, `PayPal`, `Adyen`, `Moneris`, `Alipay`, `WeChat Pay`) and their corresponding standalone test scripts.

In NAPONI's production architecture:
1. **100% Non-Custodial Model:**
   NAPONI never holds funds, acts as a payment intermediary, or collects raw cardholder data.
2. **Production Tip Flows:**
   - **External Payment URL:** Venues configure their own hosted payment checkout links (`external_payment_url` e.g., Stripe Payment Link, iyzico Link, Shopify buy button) and customers pay directly on the venue's merchant provider.
   - **Direct Bank Transfer (IBAN / FAST):** Customers initiate instant bank transfers directly into the venue's verified IBAN with instant QR reference generation.
3. **Webhooks Deprecated:**
   Incoming charge webhooks have been deprecated (`HTTP 410 Gone`) because NAPONI does not manage server-side payment reconciliation or escrow accounts.

## Why Were These Adapters Archived?

- **Audit & Regulatory Compliance:**
  Retaining unused server-side card payment intent and charge routines within the active application code exposed NAPONI to unnecessary PCI-DSS compliance audits, banking regulator scrutiny, and custodial liability questions.
- **Codebase Health & Attack Surface Reduction:**
  Removes ~1,500+ lines of dead virtual POS gateway logic, XML/SOAP Moneris parsers, and HMAC webhook signature handlers that were never invoked during live customer tipping.
- **Maintenance & Build Speed:**
  Eliminates maintenance overhead for legacy sandbox test suites and dependencies.

## Contained Files

- `adyen/adyen.provider.ts`: Direct Adyen checkout API integration
- `alipay/alipay.provider.ts`: Direct Alipay China & Global gateway integration
- `iyzico/iyzico.provider.ts`: Direct iyzico ThreeD / direct card charge integration
- `moneris/moneris.provider.ts`: Direct Moneris Canada XML charge integration
- `paypal/paypal.provider.ts`: Direct PayPal Orders v2 integration
- `paytr/paytr.provider.ts`: Direct PayTR iframe/token generation integration
- `square/square.provider.ts`: Direct Square Payments API integration
- `stripe/stripe.provider.ts`: Direct Stripe PaymentIntents API integration
- `wechatpay/wechatpay.provider.ts`: Direct WeChat Pay Native QR integration
- `scripts/`:
  - `test-all-providers.ts`: Verification script for all 9 adapters
  - `test-iyzico.ts`: Standalone iyzico integration test
  - `test-paytr.ts`: Standalone PayTR integration test

## Restoration Guide

If NAPONI ever decides in a future enterprise tier to offer direct, white-labeled virtual POS charge processing:
1. Copy the respective provider folder from this archive back to `packages/backend/src/services/payment/providers/`.
2. Ensure full PCI-DSS Level 1 / SAQ-D certification and merchant aggregator contracts are secured.
3. Re-enable webhook handlers in `packages/backend/src/routes/webhook.routes.ts`.
