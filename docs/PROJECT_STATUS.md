# NAPONI — Project Status & Architecture Reference

> **Last Updated:** 2026-09-29
> **Platform:** [naponi.com](https://www.naponi.com) | [Railway Production](https://dtipbox-production.up.railway.app)

---

## 🟢 Live Production Status

| Property | Value |
|---|---|
| **Primary Domain** | `https://www.naponi.com` (CNAME → `47pjbrc6.up.railway.app`) |
| **Secondary Domain** | `https://dtipbox-production.up.railway.app` |
| **Healthcheck** | `GET /api/health` → `200 OK` |
| **GitHub Repository** | [mertmusasword/dtipbox](https://github.com/mertmusasword/dtipbox) |
| **Auto-Deploy** | `main` branch → Railway container auto-build |
| **Google Analytics** | `G-R74SGVQH08` |

---

## 1. Technical Architecture

```
d-tipbox (Monorepo)
├── packages/
│   ├── frontend/        # React 18/19 · TypeScript · Vite 6 · Vanilla CSS
│   └── backend/         # Node.js · Express · TypeScript · Prisma ORM · PostgreSQL
├── Dockerfile           # Multi-stage production build (frontend + backend → single container)
├── railway.toml         # Railway config (healthcheck: /api/health)
└── package.json         # Workspace root scripts
```

### Database Schema (Prisma)

**18 Enums:**
`Role`, `AgreementStatus`, `AgreementType`, `QrType`, `PaymentMethodType`, `PaymentMethodStatus`, `PaymentIntegrationStatus`, `PaymentStatus`, `ProviderType`, `ProviderCatalogStatus`, `ProviderRequestStatus`, `CorporateApplicationStatus`, `PartnerApplicationStatus`, `SupportTicketStatus`, `SupportTicketCategory`, `TipDistributionMode`, `PosFeePayer`, `PosConnectionStatus`

**30 Models:**
`User`, `Business`, `BusinessPaymentAccount`, `Employee`, `Table`, `QrCode`, `PaymentMethod`, `PaymentProvider`, `PaymentIntegration`, `PaymentProviderRequest`, `Tip`, `AuditLog`, `Agreement`, `AgreementVersion`, `AgreementAcceptance`, `CorporateApplication`, `PartnerApplication`, `SupportTicket`, `Feedback`, `PasswordResetToken`, `TipPoolDistribution`, `TipPoolShare`, `LoyaltyProgram`, `LoyaltyCard`, `LoyaltyScanToken`, `LoyaltyStampTransaction`, `LoyaltyRedemption`, `PosConnection`, `PosEmployeeMapping`, `PosSyncLog`, `SmartQrConfig`, `SmartQrCampaign`, `CustomerLead`, `SmartQrEvent`, `MenuCategory`, `MenuItem`

### Backend Services (21 Service Files)

| Service | Purpose |
|---|---|
| `auth.service.ts` | JWT auth, password hashing, role-based registration, password reset |
| `business.service.ts` | Business CRUD, profile management |
| `employee.service.ts` | Staff CRUD, soft-delete, credential management |
| `tip.service.ts` | Tip processing, validation, abuse protection |
| `tipPool.service.ts` | Tip pooling, distribution, settlement |
| `payment/` | Modular payment provider adapters (Stripe, PayTR, Iyzico, Square, PayPal, Adyen, etc.) |
| `paymentMethod.service.ts` | Payment method activation/deactivation logic |
| `qr.service.ts` | QR code generation with crypto-random tokens |
| `smartQr.service.ts` | Smart QR routing, campaigns, customer leads |
| `menu.service.ts` | QR menu categories, items, ordering |
| `loyalty.service.ts` | Loyalty programs, stamp cards, scan tokens, redemptions |
| `feedback.service.ts` | Customer feedback & ratings |
| `analytics.service.ts` | Business analytics aggregation |
| `admin.service.ts` | Platform-wide admin metrics |
| `agreement.service.ts` | Legal agreements, SHA-256 immutable audit, digital consent |
| `corporate.service.ts` | Corporate multi-branch applications |
| `partner.service.ts` | Technology partner applications |
| `support.service.ts` | Support ticket system |
| `email.service.ts` | Dual-engine email (Resend + Nodemailer), multilingual templates |
| `storage.service.ts` | Cloudflare R2 object storage with local fallback |
| `audit.service.ts` | System audit trail logging |

---

## 2. Active Features & Product Capabilities

### 2.1. Payment & Tipping Engine
- ✅ Non-custodial architecture (no fund custody)
- ✅ 9 payment provider adapters: Stripe, PayTR, Iyzico, Square, PayPal, Adyen, Moneris, Alipay, WeChat Pay
- ✅ IBAN/FAST direct wire transfers
- ✅ Apple Pay, Google Pay, Credit Card support
- ✅ HMAC SHA-256 webhook signature verification
- ✅ Duplicate event protection (idempotency)
- ✅ PCI-DSS Level 1 tokenization (zero card data stored)

### 2.2. Tip Pool & Settlement System
- ✅ Configurable tip distribution modes (equal, weighted, custom)
- ✅ Settlement slips (compact A4 print format with signature boxes)
- ✅ Excel and CSV financial report export
- ✅ Penny reconciliation for accurate pool splits

### 2.3. QR Code System
- ✅ Table QR, Staff Badge QR, Venue Master QR
- ✅ Crypto-random 128-bit public tokens
- ✅ PNG download, Print, PDF export
- ✅ Smart QR routing with campaigns and customer leads

### 2.4. QR Menu System
- ✅ Full menu management (categories, items, ordering)
- ✅ Customizable themes, hero cover banner
- ✅ Chef stories showcase
- ✅ Cloudflare R2 media storage with local fallback
- ✅ Public customer-facing menu pages

### 2.5. Loyalty Program
- ✅ Digital stamp card system
- ✅ QR-based scan tokens for staff
- ✅ Anti-fraud cooldown enforcement
- ✅ Reward redemption tracking
- ✅ Expired token automatic purge

### 2.6. Customer Feedback System
- ✅ Rating collection per tip/visit
- ✅ Business dashboard feedback view
- ✅ Customer message and satisfaction tracking

### 2.7. Multilingual System (i18n)
- ✅ **11 Languages:** `en`, `tr`, `de`, `es`, `fr`, `pt`, `ar` (RTL), `zh`, `ja`, `id`, `ru`
- ✅ Automated 11-language i18n parity tests
- ✅ URL query parameter, localStorage, browser fallback detection
- ✅ Multilingual email templates
- ✅ Localized merchant agreements (11 languages)

### 2.8. Legal, Compliance & Cookie Consent
- ✅ 20-article İşletme Hizmet ve Kullanım Sözleşmesi (KVKK, TBK, HMK compliant)
- ✅ SHA-256 cryptographic audit trail for digital consent
- ✅ Agreement versioning with re-acceptance triggers
- ✅ KVKK Aydınlatma Metni & GDPR Data Notice
- ✅ Privacy Policy, Terms of Service, Cookie Policy
- ✅ Cookie Banner with localStorage persistence

### 2.9. Transactional Email Infrastructure
- ✅ Dual-engine: Resend Cloud API + Nodemailer SMTP
- ✅ Password reset, staff invitation, corporate application notifications
- ✅ Support ticket confirmations
- ✅ Shift summary & daily reports

### 2.10. Storage & Media
- ✅ Cloudflare R2 object storage integration
- ✅ Local filesystem fallback
- ✅ Image upload with referrerPolicy and multi-casing support
- ✅ Unauthenticated storage status endpoint for monitoring

### 2.11. Business Dashboard
- ✅ Real-time analytics (daily, weekly, monthly, total)
- ✅ Employee performance metrics
- ✅ Table performance tracking
- ✅ QR code usage attribution
- ✅ Payment method utilization breakdown

### 2.12. Admin Panel
- ✅ Platform-wide overview & statistics
- ✅ Business management (suspension/activation, bank details)
- ✅ Corporate application review
- ✅ Partner application review with internal notes
- ✅ Support ticket management
- ✅ Global employee directory
- ✅ Central QR registry
- ✅ Platform payment ledger
- ✅ Payment provider management
- ✅ Agreement & digital consent audit
- ✅ System audit trail with JSON metadata
- ✅ Admin profile & security settings

### 2.13. Employee Portal
- ✅ Personal tip stats dashboard (scoped to employee only)
- ✅ Loyalty scan page for stamp collection

### 2.14. Support System
- ✅ In-app support ticket modal (business & employee)
- ✅ Category-based ticket routing
- ✅ Admin review and management dashboard
- ✅ Email notifications on ticket creation

---

## 3. SEO, Content & Organic Engine

### 3.1. Blog
- ✅ 30+ articles (15 TR + 15 EN + regulatory guides)
- ✅ 15 strategic categories
- ✅ Bilateral cross-language hreflang mapping
- ✅ Language toggle (TR/EN) with instant category re-filtering

### 3.2. SEO Infrastructure
- ✅ Static HTML pre-rendering via `generate-static-seo.ts`
- ✅ Root homepage pre-rendered in 5 languages (EN, TR, DE, FR, ES)
- ✅ OpenGraph, JSON-LD Schema.org, reciprocal hreflangs
- ✅ Dynamic `sitemap.xml` generation

### 3.3. Landing Pages & Content
- ✅ 6 sector solution pages (restaurants, cafes, hotels, bars, barbers, valet)
- ✅ 4 free interactive tools (tip calculator, split calculator, pool calculator, QR generator)
- ✅ 4 B2B POS companion pages (Toast, Square, Clover, Lightspeed)
- ✅ 4 high-intent B2B comparison pages
- ✅ 10 global tipping country guides
- ✅ Enterprise Trust & Security Center (`/trust`)
- ✅ B2B Corporate Product Catalog (`/catalog`)
- ✅ Technology Partners Channel (`/technology-partners`)

### 3.4. Edge Caching (Cloudflare on Railway)
- ✅ Static assets: `max-age=31536000, immutable`
- ✅ HTML pages: Edge TTL 2h with `stale-while-revalidate=86400`
- ✅ Dynamic/protected routes: Cache bypass (proxy only)

---

## 4. Security & Hardening

- ✅ Self-registration admin escalation prevention
- ✅ Password length limits (8–128) against bcrypt DoS
- ✅ Brute-force protection: 10 attempts / 15 min per IP
- ✅ Soft-deleted employee instant token revocation
- ✅ `crypto.timingSafeEqual` for webhook HMAC verification
- ✅ 5-minute webhook timestamp freshness tolerance (replay attack defense)
- ✅ Pagination query clamping (max 100 per page)
- ✅ Production secrets startup guard
- ✅ Zero sensitive data leakage on public QR routes
- ✅ SVG stored XSS prevention
- ✅ Auth cache de-sync fix
- ✅ Loyalty privacy noindex
- ✅ Disposable email blocking on applications
- ✅ ITU-T E.164 phone validation
- ✅ Honeypot spam protection on public forms
- ✅ Rate limiting on tip submissions (15/min per IP)
- ✅ Cross-tenant IDOR protection

---

## 5. Frontend Components (22 Components)

| Component | Purpose |
|---|---|
| `Sidebar.tsx` | Role-based navigation (Business/Employee/Admin) |
| `PublicNavbar.tsx` | Floating island capsule navbar |
| `UserNavbarAction.tsx` | Authenticated user navbar with business name & role chip |
| `AgreementModal.tsx` | Legal agreement consent with scroll tracking |
| `CookieBanner.tsx` | GDPR/KVKK cookie consent banner |
| `CorporateApplicationModal.tsx` | Enterprise multi-branch application |
| `CustomerFeedbacks.tsx` | Customer feedback display |
| `SupportTicketModal.tsx` | In-app support ticket form |
| `TipPoolSettlementModal.tsx` | Tip pool settlement with print layout |
| `QrModal.tsx` | QR code preview, download, print |
| `LegalModal.tsx` | 4-document legal modal (KVKK, Privacy, Terms, Cookies) |
| `SeoHead.tsx` | Dynamic SEO meta tags |
| `SocialLinksSection.tsx` | Social media links |
| `FloatingSupportWidget.tsx` | Floating support button |
| `Toast.tsx` | Toast notification system |
| `MetricCard.tsx` | Dashboard metric display card |
| `Modal.tsx` | Reusable modal component |
| `EmptyState.tsx` | Empty state placeholder |
| `ErrorBoundary.tsx` | React error boundary |
| `ErrorState.tsx` | Error state display |
| `LoadingState.tsx` | Loading spinner/skeleton |
| `ScrollToTop.tsx` | Scroll-to-top on navigation |

---

## 6. Test Suites

- ✅ 11-language i18n parity test
- ✅ Tip pool penny reconciliation test
- ✅ Webhook anti-replay security test
- ✅ Smart QR router test
- ✅ Agreement system test (10/10)
- ✅ Employee & table system test (13/13)
- ✅ QR system test (5/5)
- ✅ Payment method test (7/7)
- ✅ Customer tip flow test (5/5)
- ✅ Modular payment test (7/7)
- ✅ Analytics & admin test (10/10)
- ✅ Security & QA audit test (7/7)
- ✅ Production Docker smoke test (6/6)
- ✅ Live Railway production test (9/9)

---

## 7. Deployment

| Item | Details |
|---|---|
| **Container** | Multi-stage `node:20-alpine` with Prisma + OpenSSL |
| **Build Process** | `tsc -b && vite build && npx tsx scripts/generate-static-seo.ts` |
| **Serving** | Express serves `/api/*` + frontend SPA from same origin |
| **Database** | Railway managed PostgreSQL |
| **Migrations** | `prisma migrate deploy` runs automatically on container start |
| **Admin Bootstrap** | Idempotent `bootstrapAdmin` on startup |
| **Healthcheck** | `/api/health` with 120s timeout window |
| **Auto-restart** | `ON_FAILURE`, max 5 retries |

---

## 8. Pending / Future Milestones

> These items are not currently blocking and will be triggered by business growth milestones.

1. **Cross-border Payment Compliance (MASAK/TCMB KYC):** Required when international business registrations reach 50.
2. **KVKK Article 9 — International Data Transfer Notice:** Required when using overseas cloud infrastructure at scale (50+ international businesses).
3. **POS Live Sync:** Currently an assistance request service; automated real-time POS synchronization is a future milestone.
4. **Homepage & Conversion Optimizations (Item 4):** Postponed for future iteration per business preference.

---

## 9. Recent Releases & UX Enhancements (2026-09-29)

- **Customer Tipping Experience:**
  - Quick compliment badges (`⚡ Hızlı Servis`, `😊 Güler Yüz`, `🍲 Harika Lezzet`, `⭐ Süper İlgi`) & custom thank-you note inputs.
  - Digital E-Receipt modal with unique reference codes (`TIP-XXXXXX`), print/save PDF action, and direct email delivery flow.
- **Business Administration:**
  - Corporate Invoice & Tax information fields (Commercial title, Tax office, Tax ID / VKN) with verified status badge.
  - Live activity table enhanced with Staff/Table attribution and Guest Compliment & Note badges.
- **Waiter / Staff Experience:**
  - Live Today's Earnings hero card on `EmployeeDashboard.tsx`.
  - In-browser Web Audio API chime bell notification (`playChimeSound`) with toggle switch and test button.

