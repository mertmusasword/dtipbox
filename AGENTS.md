# NAPONI (D-TIPBOX) — CORE PROJECT CONTEXT & AGENT MEMORY

> **SYSTEM INSTRUCTION FOR AI AGENTS:**
> This document is the permanent single source of truth for the Naponi project.
> Read and strictly respect these architectural patterns, product boundaries, and operational workflows on every turn.

---

## 1. Project Overview & Identity

* **Brand Name:** Naponi (Platform repository: `d-tipbox`)
* **Primary Domain:** `https://www.naponi.com` (Live production CNAME: `47pjbrc6.up.railway.app`)
* **Secondary Production Domain:** `https://dtipbox-production.up.railway.app`
* **Official Legal Entity (Resmi Şirket Bilgileri):**
  * **Ticari Unvan:** `Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi`
  * **Vergi Kimlik No (VKN):** `6291105866`
  * **Kayıtlı Merkez / Adres:** `Bakırköy Dünya Ticaret Merkezi, Bakırköy / İstanbul, Türkiye`
  * **Resmi İletişim E-Postası:** `info@naponi.com`
  * **Hukuki Durum:** Sözleşmeler ve KVKK metinleri `packages/backend/src/services/agreement.service.ts` üzerinde SHA-256 değişmez denetim iziyle (immutable snapshot) işletme onayına bağlıdır.
* **Google Analytics (GA4):** `G-R74SGVQH08` (Configured in `packages/frontend/index.html` and `packages/frontend/src/analytics/`)
* **Core Purpose:** Direct QR digital tipping and service payment platform for hospitality venues (restaurants, cafes, hotels, bars, barbers, valets) allowing cashless guests to tip frontline staff instantly without app downloads or guest accounts.

---

## 2. Technical Stack & Deployment Architecture

```
d-tipbox (Monorepo)
├── packages/
│   ├── frontend/        # React 18/19, TypeScript, Vite 6, Vanilla CSS (home.css, blog.css, catalog.css)
│   └── backend/         # Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
├── Dockerfile           # Multi-stage production build (compiles frontend + backend into single container)
├── railway.toml         # Railway configuration (healthcheck: /api/health)
└── package.json         # Workspace root scripts: build:frontend, build:backend, dev
```

* **Frontend Build Process:**
  `"build": "tsc -b && vite build && npx tsx scripts/generate-static-seo.ts"`
  *Crucial:* After Vite bundles the SPA, `generate-static-seo.ts` executes to pre-render static HTML for all blog articles, solutions, tools, catalog, and auto-generates `sitemap.xml`.
* **Backend Serving:**
  In production, Express serves static assets from `packages/frontend/dist` with SPA history fallback, while mounting all REST endpoints under `/api/*`.
* **Database:** Managed PostgreSQL via Railway, managed with Prisma (`packages/backend/prisma/schema.prisma`).

---

## 3. Active Features & Product Capabilities

### 3.1. Payment & Tipping Engine
* **Non-Custodial Architecture:** Naponi does not hold customer funds in proprietary custody. Tips settle directly into the venue or staff bank account (IBAN/FAST wire) or route through merchant-configured payment providers.
* **Provider Catalog & Adapters:**
  * Active adapters: `Stripe`, `PayTR`, `Iyzico`, `Square`, `PayPal`, `Adyen`, `Moneris`, `Alipay`, `WeChat Pay`.
  * Businesses configure their own payment credentials via Business Dashboard (`/business/payments`).
* **Tip Flow:**
  1. Guest scans QR code with standard phone camera.
  2. Mobile web tipping screen opens (`/tip/:slug` or table-bound link).
  3. Guest selects tip preset or custom amount, leaves optional rating/feedback.
  4. Instant checkout via Apple Pay, Google Pay, Credit Card, or FAST/IBAN wire.

### 3.2. QR Code System
* **Table QR:** Placed on dining tables/stands; attributes gratuities to table zones or pooled shifts.
* **Staff QR (Badge QR):** Wearable badges/cards for individual waiters, bellhops, valets.
* **Venue Master QR:** Placed at cash registers, takeaway pickup, or hotel desks.

### 3.3. Multilingual System (i18n)
* **Supported Languages (10):** English (`en`), Turkish (`tr`), German (`de`), Spanish (`es`), French (`fr`), Portuguese (`pt`), Arabic (`ar` - RTL), Chinese (`zh`), Japanese (`ja`), Indonesian (`id`).
* **Routing / Detection:** URL query parameter `?lang=xx`, `localStorage`, and browser language fallback.
* **Merchant Agreements:** Fully localized 10-language contracts stored in `packages/backend/src/templates/merchantAgreementText.ts`.

### 3.4. Transactional Email Infrastructure (LIVE & FULLY CONFIGURED)
* **Dual-Engine Architecture:** Resend Cloud API (HTTPS Port 443, zero firewall blocking) + Nodemailer SMTP (Natro SMTP & standard TLS).
* **Production Credentials Location:** `RESEND_API_KEY` is configured in **Railway Production Environment Variables**. The local `.env` is intentionally gitignored to prevent credential leaks.
* **Automated Triggers:**
  * Password reset (`sendPasswordResetEmail`)
  * Staff invitation (`sendStaffInviteEmail`)
  * Corporate branch applications (`sendCorporateApplicationReceivedEmail`)
  * Support tickets (`sendSupportTicketReceivedEmail`)
  * Shift summary & daily reports (`sendShiftSummaryEmail`)
* **Diagnostic Endpoints:** `/api/auth/smtp-status` and `/api/auth/email-diagnostic`.

### 3.5. B2B Corporate Product Catalog & Presentation Deck
* **Routes:** `/catalog`, `/katalog`, `/kurumsal-katalog`.
* **Deck Structure:** 10 slides designed for enterprise pitching (Problem, 6s Guest Flow, Hardware Touchpoints, Executive Dashboard Mockup, Industry Verticals, Non-Custodial Architecture, Global Tourism, 2-min Onboarding, Interactive Camera QR Demo).
* **Multilingual:** In-toolbar language switcher supporting Turkish (`tr`) and English (`en`) with fallback.
* **1-Click Vector PDF:** Native `@media print` styles for A4 Landscape (297mm x 210mm, 300 DPI vector) with localized PDF download filename (`Naponi-Kurumsal-Urun-Katalogu-2026-TR.pdf` / `Naponi-Corporate-Product-Catalog-2026-EN.pdf`).

### 3.6. Support & Enterprise Features
* **Support Ticket System:** Built-in dashboard for support tickets and founder review (`/admin`).
* **POS Integration Assistance:** Venues can request POS setup assistance via dedicated modals. (Note: Not an automated live POS sync; it is an assistance service).
* **Corporate Multi-Branch:** Application modal for enterprise multi-location groups.

### 3.7. Legal, Compliance & Cookie Consent (KVKK & GDPR)
* **Legal Modal (`LegalModal.tsx`):** Central interactive modal supporting 4 primary documents:
  1. KVKK Aydınlatma Metni (Turkish Law No. 6698) & GDPR Data Notice
  2. Gizlilik Politikası / Privacy Policy (PCI-DSS Level 1 tokenization, non-custodial zero-escrow)
  3. Kullanım Koşulları / Terms of Service (Platform rules, voluntary gratuities, Bakırköy jurisdiction)
  4. Çerez Politikası / Cookie Policy (Essential session cookies, GA4 analytics)
* **Language Support:** Bilingual Turkish (`tr`) and English (`en`) with official legal credentials (`Naponi İnternet Alışveriş ve Mağazacılık İth. İhr. Ltd. Şti.`, VKN: `6291105866`, Bakırköy DTM).
* **Cookie Banner (`CookieBanner.tsx`):** Fixed bottom glassmorphism banner, non-blocking, persists consent in `localStorage` (`naponi_cookie_consent: 'accepted_all' | 'essential_only'`).
* **Footer Accessibility:** Linked in `HomePage.tsx` footer bottom row with direct tab triggers.

### 3.8. B2B Technology Partners Channel (Teknoloji Partnerleri)
* **Two-Channel Growth Strategy:**
  1. **Direct Sales (Doğrudan Satış):** Cafes, restaurants, hotels, and venues register directly on Naponi.
  2. **Partner Sales (Partner Satışı):** POS software, QR menus, payment gateways, PMS/hotel tech, kiosks, and CRM/loyalty platforms partner with Naponi to offer tipping, staff tip management, and digital loyalty to their own merchant client base.
* **Landing Page:** `/technology-partners` (alias: `/teknoloji-partnerleri`).
* **Public Page Structure:** 8 sections adhering to Naponi's fintech dark theme (Single H1, Two-Channel Comparison Cards, 8 Industry Verticals, 6 Partner Advantages, 4-Step Visual Roadmap, 4 Partnership Models, Core Callout, and Interactive Application Form with server-side validation and honeypot spam protection).
* **Backend Database & API:**
  * Model: `PartnerApplication` (`partner_applications` table) with enum `PartnerApplicationStatus` (`NEW`, `REVIEWING`, `CONTACTED`, `INTEGRATION_DISCUSSION`, `COMPLETED`, `REJECTED`).
  * Endpoints: `POST /api/partner-applications` (public, rate-limited) and `GET/PATCH/DELETE /api/admin/partner-applications` (admin protected).
* **Admin Management:** `/admin/partner-applications` for filtering, viewing full vendor specs, and recording internal admin review notes.
* **SEO & Sitemap:** Fully pre-rendered static HTML via `generate-static-seo.ts` with hreflang, OpenGraph, Schema.org, and `sitemap.xml` inclusion.

---

## 4. SEO, Blog & Organic Content Engine

### 4.1. Blog Structure & Topic Clusters
* **Content Source:**
  * `packages/frontend/src/content/blog/posts.ts` (Core definitions & TR posts)
  * `packages/frontend/src/content/blog/posts-en.ts` (15 Full English articles)
* **Total Live Articles:** **30 Articles** (15 Turkish + 15 English) spanning 10 strategic categories:
  1. Digital Tipping (Pillar)
  2. QR Codes
  3. Restaurants
  4. Cafes
  5. Hotels
  6. Waiters & Staff
  7. Cash vs. Digital Comparison
  8. Pros & Cons Analysis
  9. QR Use Cases
  10. Guest Experience
  11. Staff Management & Pooling
  12. Security & Encryption
  13. Restaurant Digitalization
  14. QR Payments & Tipping
  15. Platform Buyer's Guide

### 4.2. Bilateral Cross-Language Hreflang Mapping
* Every Turkish article (`language: 'tr'`) and English article (`language: 'en'`) share reciprocal `alternateSlugs`.
* `<head>` pre-renders:
  * `<link rel="alternate" hreflang="tr" href="https://www.naponi.com/blog/[tr-slug]" />`
  * `<link rel="alternate" hreflang="en" href="https://www.naponi.com/blog/[en-slug]" />`
  * `<link rel="alternate" hreflang="x-default" href="https://www.naponi.com/blog/[en-slug]" />`
* In `dist/sitemap.xml` and `public/sitemap.xml`, all 30 posts are dynamically listed with corresponding `xhtml:link` tags.

### 4.3. UI & Navigation Rules for Blog
* **Never add Blog to the main navigation header** unless explicitly requested by the user.
* Access is provided via **Footer** ("Blog") and Homepage Section 10B ("Son Yazılar" / "Recent Articles").
* On `/blog`, visitors can toggle between `🇹🇷 Türkçe (15)` and `🇬🇧 English (15)` with instant category re-filtering.

### 4.4. Sector Solutions, Tools & B2B POS Companions
* **6 Sector Landing Pages:** `/solutions/restaurants`, `/solutions/cafes`, `/solutions/hotels`, `/solutions/bars`, `/solutions/barbers`, `/solutions/valet`.
* **4 Free Interactive Calculators & Tools:** `/tools/tip-calculator`, `/tools/tip-split-calculator`, `/tools/restaurant-tip-pool-calculator`, `/tools/free-hospitality-qr-generator`.
* **4 B2B POS Ecosystem Companions:** `/integrations/toast-pos-smart-qr`, `/integrations/square-pos-digital-tipping`, `/integrations/clover-pos-qr-hospitality`, `/integrations/lightspeed-pos-smart-qr`.
* **4 High-Intent B2B Comparisons:** `/compare/card-machine-vs-qr-tipping`, `/compare/best-cashless-tipping-systems`, `/compare/naponi-vs-sunday-app`, `/compare/naponi-vs-tiptap`.
* **Enterprise Trust & Security Center:** `/trust` (aliases: `/security`, `/guvenlik`) highlighting non-custodial architecture, PCI-DSS Level 1 tokenization, GDPR, and SHA-256 cryptographic audit logs.
* **33 Total Live Blog Articles:** Includes high-impact US & EU regulatory and compliance guides (`us-restaurant-tip-regulations-flsa-irs-compliance`, `uk-employment-allocation-of-tips-act-tronc-compliance`, `german-tax-free-tips-gastronomie-estg-guide`).
* **Global Tipping Guides (10 Countries):** `/guides/tipping-in-[country]` with pre-rendered SEO and hreflang tags.
* **Root Homepage & Subfolder Pre-Rendering:**
  * `dist/index.html` (EN default root), `dist/tr/index.html` (TR), `dist/de/index.html` (DE), `dist/fr/index.html` (FR), and `dist/es/index.html` (ES) are statically pre-rendered with fully localized semantic HTML, OpenGraph tags, JSON-LD schemas, and reciprocal hreflangs.
  * Ensures search engine crawlers from USA, UK, Germany, France, and Spain index rich localized content immediately without JavaScript evaluation.

### 4.5. Edge Caching & CDN Strategy (Cloudflare on Railway)
* **Static Assets (`/assets/*`, `*.js`, `*.css`, images, fonts):** Cache-Control `public, max-age=31536000, immutable` (Cloudflare Cache Everything, 1-month TTL).
* **HTML Pages (`/`, `/tr`, `/de`, `/fr`, `/es`, `/blog/*`, `/solutions/*`, `/guides/*`, `/compare/*`, `/integrations/*`, `/trust`):** Edge TTL 2 hours with `stale-while-revalidate=86400`.
* **Dynamic & Protected Routes (`/api/*`, `/tip/*`, `/business/*`, `/employee/*`, `/admin/*`):** Bypass Cache (Proxy only, SSL/TLS strict, WebSockets enabled).

---

## 5. Security & Indexing Boundaries

* **Strictly Disallowed (noindex, nofollow) in robots.txt:**
  * `/admin/*`
  * `/business/*`
  * `/employee/*`
  * `/tip/*` (Customer payment screens must NEVER be indexed by search engines)
  * `/dashboard/*`
  * `/api/*`
* **Allowed & Indexable:**
  * `/` (Homepage)
  * `/blog/*`
  * `/solutions/*`
  * `/tools/*`
  * `/guides/*`
  * `/compare/*`
  * `/integrations/*`
  * `/trust`
  * `/catalog`
  * `/sitemap.xml`

---

## 6. Critical Operational Rules for AI Agents

1. **Do not break working features:** Always preserve existing payment adapters, auth guards, Prisma migrations, and mobile responsive CSS.
2. **No fake stats or unverified features:** Never claim live POS synchronization exists (it is an assistance request service) or that NFC hardware is supported in MVP.
3. **Automated Publishing Workflow:** When the user approves deployment (e.g., *"yap her zaman"*), stage changes (`git add .`), commit with semantic message, and push to `origin main` to trigger Railway's automated build.
4. **Preserve Pre-Rendering:** Never remove `npx tsx scripts/generate-static-seo.ts` from the `build` script in `packages/frontend/package.json`.
5. **GROUND TRUTH RULE (NEVER ASSUME MISSING BASED ON LOCAL .ENV):**
   * Live production credentials (e.g., `RESEND_API_KEY`, database credentials, live secrets) are stored in **Railway Dashboard Environment Variables** to prevent security leaks on GitHub.
   * NEVER look at an empty local `.env` and claim that an integration (such as email, company details, or payment providers) is unconfigured or missing.
   * Always cross-reference this `AGENTS.md` file, `git log`, and backend service implementations before stating project status.
6. **NO GENERIC CHECKLISTS:** When asked "Eksik bir şey kaldı mı?" or assessing production readiness, do not output generic textbook checklists. Base answers strictly on the verified factual state recorded in this document.
7. **Mandatory Live Deployment Status Notification:** Her işlem ve kod değişikliği tamamlandığında kullanıcının her zaman açıkça durumdan haberdar olması için: yapılan işlemin **canlıda olup olmadığını** belirt ve yereldeyse **"Canlıya alayım mı?"** diye bilgi verip onay sor.
