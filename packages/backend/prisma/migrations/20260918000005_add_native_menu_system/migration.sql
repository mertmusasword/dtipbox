-- AlterTable: Add menu_mode and primary_action to smart_qr_configs
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "menu_mode" TEXT NOT NULL DEFAULT 'DISABLED';
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "primary_action" TEXT NOT NULL DEFAULT 'TIP';

-- Backfill existing enable_menu = true to menu_mode = 'EXTERNAL_URL' if menu_url is not null
UPDATE "smart_qr_configs"
SET "menu_mode" = 'EXTERNAL_URL'
WHERE "enable_menu" = true AND ("menu_url" IS NOT NULL AND "menu_url" != '');

-- CreateTable
CREATE TABLE IF NOT EXISTS "menu_categories" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "menu_items" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "menu_categories_business_id_idx" ON "menu_categories"("business_id");
CREATE INDEX IF NOT EXISTS "menu_categories_is_active_idx" ON "menu_categories"("is_active");
CREATE INDEX IF NOT EXISTS "menu_categories_sort_order_idx" ON "menu_categories"("sort_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "menu_items_business_id_idx" ON "menu_items"("business_id");
CREATE INDEX IF NOT EXISTS "menu_items_category_id_idx" ON "menu_items"("category_id");
CREATE INDEX IF NOT EXISTS "menu_items_is_active_idx" ON "menu_items"("is_active");
CREATE INDEX IF NOT EXISTS "menu_items_sort_order_idx" ON "menu_items"("sort_order");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'menu_categories_business_id_fkey'
    ) THEN
        ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_business_id_fkey" 
        FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_business_id_fkey'
    ) THEN
        ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_business_id_fkey" 
        FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_category_id_fkey'
    ) THEN
        ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" 
        FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
