-- CreateTable
CREATE TABLE IF NOT EXISTS "loyalty_programs" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_stamps" INTEGER NOT NULL DEFAULT 10,
    "reward_description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "loyalty_cards" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT,
    "card_code" TEXT NOT NULL,
    "current_stamps" INTEGER NOT NULL DEFAULT 0,
    "target_stamps" INTEGER NOT NULL DEFAULT 10,
    "total_rewards_earned" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "loyalty_scan_tokens" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_scan_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "loyalty_stamp_transactions" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "user_id" TEXT,
    "action_type" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "previous_stamps" INTEGER NOT NULL,
    "new_stamps" INTEGER NOT NULL,
    "notes" TEXT,
    "scan_token_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_stamp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "loyalty_redemptions" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "reward_title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "redeemed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "loyalty_programs_business_id_idx" ON "loyalty_programs"("business_id");
CREATE INDEX IF NOT EXISTS "loyalty_programs_is_active_idx" ON "loyalty_programs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_cards_public_id_key" ON "loyalty_cards"("public_id");
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_cards_card_code_key" ON "loyalty_cards"("card_code");
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_cards_business_id_program_id_customer_email_key" ON "loyalty_cards"("business_id", "program_id", "customer_email");
CREATE INDEX IF NOT EXISTS "loyalty_cards_business_id_idx" ON "loyalty_cards"("business_id");
CREATE INDEX IF NOT EXISTS "loyalty_cards_program_id_idx" ON "loyalty_cards"("program_id");
CREATE INDEX IF NOT EXISTS "loyalty_cards_customer_email_idx" ON "loyalty_cards"("customer_email");
CREATE INDEX IF NOT EXISTS "loyalty_cards_card_code_idx" ON "loyalty_cards"("card_code");
CREATE INDEX IF NOT EXISTS "loyalty_cards_public_id_idx" ON "loyalty_cards"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_scan_tokens_token_key" ON "loyalty_scan_tokens"("token");
CREATE INDEX IF NOT EXISTS "loyalty_scan_tokens_card_id_idx" ON "loyalty_scan_tokens"("card_id");
CREATE INDEX IF NOT EXISTS "loyalty_scan_tokens_token_idx" ON "loyalty_scan_tokens"("token");
CREATE INDEX IF NOT EXISTS "loyalty_scan_tokens_expires_at_idx" ON "loyalty_scan_tokens"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "loyalty_stamp_transactions_card_id_idx" ON "loyalty_stamp_transactions"("card_id");
CREATE INDEX IF NOT EXISTS "loyalty_stamp_transactions_business_id_idx" ON "loyalty_stamp_transactions"("business_id");
CREATE INDEX IF NOT EXISTS "loyalty_stamp_transactions_program_id_idx" ON "loyalty_stamp_transactions"("program_id");
CREATE INDEX IF NOT EXISTS "loyalty_stamp_transactions_employee_id_idx" ON "loyalty_stamp_transactions"("employee_id");
CREATE INDEX IF NOT EXISTS "loyalty_stamp_transactions_created_at_idx" ON "loyalty_stamp_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_redemptions_code_key" ON "loyalty_redemptions"("code");
CREATE INDEX IF NOT EXISTS "loyalty_redemptions_card_id_idx" ON "loyalty_redemptions"("card_id");
CREATE INDEX IF NOT EXISTS "loyalty_redemptions_business_id_idx" ON "loyalty_redemptions"("business_id");
CREATE INDEX IF NOT EXISTS "loyalty_redemptions_code_idx" ON "loyalty_redemptions"("code");
CREATE INDEX IF NOT EXISTS "loyalty_redemptions_status_idx" ON "loyalty_redemptions"("status");

-- AddForeignKey
ALTER TABLE "loyalty_programs" DROP CONSTRAINT IF EXISTS "loyalty_programs_business_id_fkey";
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_cards" DROP CONSTRAINT IF EXISTS "loyalty_cards_business_id_fkey";
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_cards" DROP CONSTRAINT IF EXISTS "loyalty_cards_program_id_fkey";
ALTER TABLE "loyalty_cards" ADD CONSTRAINT "loyalty_cards_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_scan_tokens" DROP CONSTRAINT IF EXISTS "loyalty_scan_tokens_card_id_fkey";
ALTER TABLE "loyalty_scan_tokens" ADD CONSTRAINT "loyalty_scan_tokens_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "loyalty_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_stamp_transactions" DROP CONSTRAINT IF EXISTS "loyalty_stamp_transactions_card_id_fkey";
ALTER TABLE "loyalty_stamp_transactions" ADD CONSTRAINT "loyalty_stamp_transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "loyalty_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_stamp_transactions" DROP CONSTRAINT IF EXISTS "loyalty_stamp_transactions_business_id_fkey";
ALTER TABLE "loyalty_stamp_transactions" ADD CONSTRAINT "loyalty_stamp_transactions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_stamp_transactions" DROP CONSTRAINT IF EXISTS "loyalty_stamp_transactions_program_id_fkey";
ALTER TABLE "loyalty_stamp_transactions" ADD CONSTRAINT "loyalty_stamp_transactions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_stamp_transactions" DROP CONSTRAINT IF EXISTS "loyalty_stamp_transactions_employee_id_fkey";
ALTER TABLE "loyalty_stamp_transactions" ADD CONSTRAINT "loyalty_stamp_transactions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "loyalty_stamp_transactions" DROP CONSTRAINT IF EXISTS "loyalty_stamp_transactions_user_id_fkey";
ALTER TABLE "loyalty_stamp_transactions" ADD CONSTRAINT "loyalty_stamp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_redemptions" DROP CONSTRAINT IF EXISTS "loyalty_redemptions_card_id_fkey";
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "loyalty_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_redemptions" DROP CONSTRAINT IF EXISTS "loyalty_redemptions_business_id_fkey";
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_redemptions" DROP CONSTRAINT IF EXISTS "loyalty_redemptions_program_id_fkey";
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "loyalty_redemptions" DROP CONSTRAINT IF EXISTS "loyalty_redemptions_employee_id_fkey";
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
