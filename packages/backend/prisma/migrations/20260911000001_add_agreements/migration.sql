-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('MERCHANT_TERMS', 'PRIVACY_POLICY', 'KVKK_DISCLOSURE');

-- CreateTable
CREATE TABLE IF NOT EXISTS "agreements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AgreementType" NOT NULL DEFAULT 'MERCHANT_TERMS',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "agreement_versions" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "requires_reacceptance" BOOLEAN NOT NULL DEFAULT true,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agreement_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "agreement_acceptances" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agreement_version_id" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "snapshot_html" TEXT,
    "statement" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "agreement_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agreements_code_key" ON "agreements"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agreement_versions_status_idx" ON "agreement_versions"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agreement_versions_agreement_id_version_key" ON "agreement_versions"("agreement_id", "version");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agreement_acceptances_business_id_idx" ON "agreement_acceptances"("business_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agreement_acceptances_agreement_version_id_idx" ON "agreement_acceptances"("agreement_version_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "agreement_acceptances_accepted_at_idx" ON "agreement_acceptances"("accepted_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "agreement_acceptances_business_id_agreement_version_id_key" ON "agreement_acceptances"("business_id", "agreement_version_id");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agreement_versions" ADD CONSTRAINT "agreement_versions_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agreement_acceptances" ADD CONSTRAINT "agreement_acceptances_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agreement_acceptances" ADD CONSTRAINT "agreement_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "agreement_acceptances" ADD CONSTRAINT "agreement_acceptances_agreement_version_id_fkey" FOREIGN KEY ("agreement_version_id") REFERENCES "agreement_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
