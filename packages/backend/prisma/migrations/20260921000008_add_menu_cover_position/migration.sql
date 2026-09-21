-- AlterTable: Add menu_cover_position to smart_qr_configs
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "menu_cover_position" INTEGER NOT NULL DEFAULT 50;
