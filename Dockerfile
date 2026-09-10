# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

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

# Build frontend
RUN npm run build:frontend

# Build backend
RUN npm run build:backend

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

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

# Expose port
ENV PORT=3000
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/backend/prisma/schema.prisma && node packages/backend/dist/index.js"]
