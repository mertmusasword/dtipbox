-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PartnerApplicationStatus') THEN
        CREATE TYPE "PartnerApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'CONTACTED', 'INTEGRATION_DISCUSSION', 'COMPLETED', 'REJECTED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "partner_applications" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "website" TEXT,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company_type" TEXT NOT NULL,
    "customer_count" TEXT,
    "countries" TEXT,
    "integration_idea" TEXT,
    "message" TEXT,
    "status" "PartnerApplicationStatus" NOT NULL DEFAULT 'NEW',
    "admin_notes" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partner_applications_status_idx" ON "partner_applications"("status");
CREATE INDEX IF NOT EXISTS "partner_applications_company_type_idx" ON "partner_applications"("company_type");
CREATE INDEX IF NOT EXISTS "partner_applications_created_at_idx" ON "partner_applications"("created_at");
CREATE INDEX IF NOT EXISTS "partner_applications_email_idx" ON "partner_applications"("email");
