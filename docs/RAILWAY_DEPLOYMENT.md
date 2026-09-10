# D-TIPBOX — Railway Production Deployment Guide

This guide provides step-by-step instructions for deploying the **D-TIPBOX** platform to [Railway](https://railway.app/) using the unified Docker architecture and Railway's managed PostgreSQL database.

---

## 1. Architecture Overview

- **Unified Production Container**:
  - The single multi-stage [Dockerfile](../Dockerfile) compiles both the Vite React SPA frontend and the Express TypeScript backend.
  - In production (`NODE_ENV=production`), Express directly serves static assets from `/app/packages/frontend/dist` with SPA history fallback to `index.html`.
  - All API routes are mounted under `/api/*`.
  - **Zero Cross-Origin Issues**: Because the frontend and backend share the exact same host and port, cookies and API calls work seamlessly without CORS headers or third-party cookie blocking.
- **Managed PostgreSQL**:
  - Railway provisions a high-availability PostgreSQL 16 database.
  - Automated Prisma migrations run automatically upon container startup via:
    `npx prisma migrate deploy --schema=packages/backend/prisma/schema.prisma`

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub
Ensure all code and migrations are pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: production deployment setup"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin master
```
*(Verify that `.env` is NOT in the repository. Only `.env.example` should be committed).*

### Step 2: Create a New Project on Railway
1. Log in to [Railway](https://railway.app/).
2. Click **+ New Project**.
3. Select **Deploy from GitHub repo** and choose your D-TIPBOX repository.

### Step 3: Add Managed PostgreSQL Database
1. In your Railway project canvas, click **+ Create** or **+ New Service**.
2. Select **Database** -> **PostgreSQL**.
3. Railway will provision a dedicated PostgreSQL instance and automatically inject the `DATABASE_URL` into your project environment.

### Step 4: Configure Environment Variables
In your Railway web service (the service connected to your GitHub repo), navigate to the **Variables** tab and configure:

| Variable | Description | Recommended Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | *Linked automatically by Railway (`${{Postgres.DATABASE_URL}}`)* |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Web port | *Assigned dynamically by Railway* |
| `APP_URL` | Public application URL | `https://${{RAILWAY_PUBLIC_DOMAIN}}` (or custom domain) |
| `API_URL` | Public API URL | `https://${{RAILWAY_PUBLIC_DOMAIN}}` (or custom domain) |
| `JWT_SECRET` | 256-bit cryptographic secret | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET`| 256-bit cryptographic secret | `openssl rand -hex 32` |
| `JWT_EXPIRY` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRY`| Refresh token lifespan | `7d` |
| `ADMIN_EMAIL` | Superadmin bootstrap email | `admin@dtipbox.com` (or your email) |
| `ADMIN_PASSWORD` | Superadmin bootstrap password | *Strong secure password (min 12 chars)* |
| `CORS_ORIGIN` | Allowed web origins | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per IP | `100` |
| `STRIPE_SECRET_KEY` | Stripe live/test secret key | *Optional (sk_...)* |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | *Optional (pk_...)* |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook HMAC secret | *Optional (whsec_...)* |

### Step 5: Generate Public Domain
1. In your web service settings, go to **Networking** -> **Public Networking**.
2. Click **Generate Domain** (e.g. `d-tipbox-production.up.railway.app`) or attach your custom domain.
3. Update `APP_URL`, `API_URL`, and `CORS_ORIGIN` with this domain.

### Step 6: Deploy & Automated Migration
1. Trigger a deployment by clicking **Deploy** or pushing to `master`.
2. Railway will:
   - Build the Dockerfile multi-stage container.
   - Run `prisma migrate deploy` against Railway's PostgreSQL database.
   - Run `bootstrapAdmin` on backend startup to ensure your superadmin account is ready.
   - Verify health at `/api/health`.

---

## 3. Post-Deployment Smoke Verification Checklist

After the Railway deployment completes, verify each critical flow:

- [ ] **Health Check**:
  ```bash
  curl -I https://<your-railway-domain>/api/health
  # Expected: HTTP 200 OK
  ```
- [ ] **Frontend Single Page Application**:
  Visit `https://<your-railway-domain>/` in your browser. The landing/auth interface should load cleanly with all styling and Google fonts.
- [ ] **Superadmin Authentication**:
  Navigate to `/login` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
  Confirm access to `/admin` dashboard.
- [ ] **Public QR & Customer Tip Flow**:
  Navigate to `/tip/<public_token>` (e.g., generated from business QR tab).
  Confirm venue branding, staff selection, tip amount presets, and payment method choices are rendered.
- [ ] **Audit Logs**:
  Confirm actions are recorded in `/admin/audit`.

---

## 4. Troubleshooting & Maintenance

- **View Logs**: In Railway, open your web service and click **Deployments** -> **View Logs**.
- **Database Studio**: To inspect production data safely, run locally:
  ```bash
  DATABASE_URL="<railway-postgres-external-url>" npx prisma studio --schema=packages/backend/prisma/schema.prisma
  ```
- **Force Migrations**: If needed, run migrations directly against Railway from your machine:
  ```bash
  DATABASE_URL="<railway-postgres-external-url>" npx prisma migrate deploy --schema=packages/backend/prisma/schema.prisma
  ```
