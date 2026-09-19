-- AlterTable: Add social media and contact links to smart_qr_configs
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_instagram" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_facebook" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_tiktok" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_twitter" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_youtube" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_whatsapp" TEXT;
ALTER TABLE "smart_qr_configs" ADD COLUMN IF NOT EXISTS "social_website" TEXT;
