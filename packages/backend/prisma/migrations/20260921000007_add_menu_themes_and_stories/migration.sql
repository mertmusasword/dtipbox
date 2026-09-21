-- AlterTable: Add menu theme, cover image, and item stories toggle to smart_qr_configs
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "menu_theme" TEXT NOT NULL DEFAULT 'DARK_LUXURY';
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "menu_cover_image" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "enable_item_stories" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Add is_featured to menu_items
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;
