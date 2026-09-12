# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install all dependencies
RUN npm ci

# Copy source code
COPY packages/backend/ packages/backend/
COPY packages/frontend/ packages/frontend/

# Generate Prisma client
RUN npx prisma generate --schema=packages/backend/prisma/schema.prisma

# Build frontend with GA4 configuration
ARG VITE_GA_MEASUREMENT_ID="G-R74SGVQH08"
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
RUN npm run build:frontend

# Build backend
RUN npm run build:backend

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy Prisma schema + migrations
COPY packages/backend/prisma/ packages/backend/prisma/

# Generate Prisma client in production
RUN npx prisma generate --schema=packages/backend/prisma/schema.prisma

# Copy built backend
COPY --from=builder /app/packages/backend/dist/ packages/backend/dist/

# Copy built frontend
COPY --from=builder /app/packages/frontend/dist/ packages/frontend/dist/

# Environment defaults (can be overridden by Railway / Docker)
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Run db push to sync schema with production database and start server
CMD ["sh", "-c", "npx prisma db push --schema=packages/backend/prisma/schema.prisma && node packages/backend/dist/index.js"]
