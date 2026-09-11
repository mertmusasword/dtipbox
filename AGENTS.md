# NAPONI (D-TIPBOX) — CORE PROJECT CONTEXT & AGENT MEMORY

> **SYSTEM INSTRUCTION FOR AI AGENTS:**
> This document is the permanent single source of truth for the Naponi project.
> Read and strictly respect these architectural patterns, product boundaries, and operational workflows on every turn.

---

## 1. Project Overview & Identity

* **Brand Name:** Naponi (Platform repository: `d-tipbox`)
* **Primary Domain:** `https://www.naponi.com` (Live production CNAME: `47pjbrc6.up.railway.app`)
* **Secondary Production Domain:** `https://dtipbox-production.up.railway.app`
* **Google Analytics (GA4):** `G-R74SGVQH08` (Configured in `packages/frontend/index.html` and `packages/frontend/src/analytics/`)
* **Core Purpose:** Direct QR digital tipping and service payment platform for hospitality venues (restaurants, cafes, hotels, bars, barbers, valets) allowing cashless guests to tip frontline staff instantly without app downloads or guest accounts.

---

## 2. Technical Stack & Deployment Architecture

```
d-tipbox (Monorepo)
├── packages/
│   ├── frontend/        # React 18/19, TypeScript, Vite 6, Vanilla CSS (home.css, blog.css)
│   └── backend/         # Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
├── Dockerfile           # Multi-stage production build (compiles frontend + backend into single container)
├── railway.toml         # Railway configuration (healthcheck: /api/health)
└── package.json         # Workspace root scripts: build:frontend, build:backend, dev
```

* **Frontend Build Process:**
  `"build": "tsc -b && vite build && npx tsx scripts/generate-static-seo.ts"`
  *Crucial:* After Vite bundles the SPA, `generate-static-seo.ts` executes to pre-render static HTML for all blog articles, solutions, tools, and auto-generates `sitemap.xml`.
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
* **Supported Languages (10):** English (`en`), Turkish (`tr`), German (`de`), Spanish (`es`), French (`fr`), Portuguese (`pt`), Arabic (`ar`), Chinese (`zh`), Japanese (`ja`), Indonesian (`id`).
* **Routing / Detection:** URL query parameter `?lang=xx`, `localStorage`, and browser language fallback.
* **Merchant Agreements:** Fully localized 10-language contracts stored in `packages/backend/src/templates/merchantAgreementText.ts`.

### 3.4. Support & Enterprise Features
* **Support Ticket System:** Built-in dashboard for support tickets and founder review (`/admin`).
* **POS Integration Assistance:** Venues can request POS setup assistance via dedicated modals. (Note: Not an automated live POS sync; it is an assistance service).
* **Corporate Multi-Branch:** Application modal for enterprise multi-location groups.

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

### 4.4. Sector Solutions & SEO Tools
* **6 Sector Landing Pages:** `/solutions/restaurants`, `/solutions/cafes`, `/solutions/hotels`, `/solutions/bars`, `/solutions/barbers`, `/solutions/valet`.
* **2 Free Interactive Calculators:** `/tools/tip-calculator`, `/tools/tip-split-calculator`.

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
  * `/sitemap.xml`

---

## 6. Critical Operational Rules for AI Agents

1. **Do not break working features:** Always preserve existing payment adapters, auth guards, Prisma migrations, and mobile responsive CSS.
2. **No fake stats or unverified features:** Never claim live POS synchronization exists (it is an assistance request service) or that NFC hardware is supported in MVP.
3. **Automated Publishing Workflow:** When the user approves deployment (e.g., *"yap her zaman"*), stage changes (`git add .`), commit with semantic message, and push to `origin main` to trigger Railway's automated build.
4. **Preserve Pre-Rendering:** Never remove `npx tsx scripts/generate-static-seo.ts` from the `build` script in `packages/frontend/package.json`.
