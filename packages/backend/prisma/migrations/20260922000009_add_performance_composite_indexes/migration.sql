-- AlterTable
ALTER TABLE "tips" ALTER COLUMN "platform_fee_rate" SET DEFAULT 3.50;

-- CreateIndex
CREATE INDEX "audit_logs_business_id_created_at_idx" ON "audit_logs"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "store_orders_business_id_status_created_at_idx" ON "store_orders"("business_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "tips_business_id_payment_status_created_at_idx" ON "tips"("business_id", "payment_status", "created_at");

-- CreateIndex
CREATE INDEX "tips_business_id_created_at_idx" ON "tips"("business_id", "created_at");
