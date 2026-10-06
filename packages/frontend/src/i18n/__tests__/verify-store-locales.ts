import {
  PRODUCT_TRANSLATIONS,
  QR_TYPE_TRANSLATIONS,
  getLocalizedProduct,
  getLocalizedQrTypeOptions,
} from '../storeProductLocales';
import { SupportedLanguage } from '../types';
import { StoreProduct } from '../../types';

const ALL_LANGUAGES: SupportedLanguage[] = ['tr', 'en', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'zh', 'id', 'ja'];

const mockProduct: StoreProduct = {
  id: 'prod-1',
  slug: 'opaque-qr-sticker',
  name: 'Opak QR Etiket Sticker',
  description: 'Varsayılan açıklama',
  features: ['Özellik 1'],
  price: 11.5,
  currency: 'TRY',
  category: 'sticker',
  image_url: '/hardware/opaque-sticker.jpg',
  gallery: [],
  video_url: null,
  stock: 9999,
  min_quantity: 1,
  quantity_step: 1,
  badge: null,
  is_active: true,
  sort_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockTransparentProduct: StoreProduct = {
  ...mockProduct,
  id: 'prod-2',
  slug: 'transparent-qr-sticker',
  name: 'Şeffaf QR Sticker',
};

async function test11LanguageStoreLocales() {
  console.log('🌐 Testing 11-Language Product & QR Type Localization System...\n');

  // 1. Verify all 11 languages for opaque-qr-sticker
  console.log('--- 1. Testing opaque-qr-sticker Across 11 Languages ---');
  for (const lang of ALL_LANGUAGES) {
    const localized = getLocalizedProduct(mockProduct, lang);
    console.log(`[${lang.toUpperCase()}] Name: "${localized.name}" | Features: ${localized.features?.length || 0} items | Badge: ${localized.badge || 'None'}`);

    if (!localized.name || localized.name.trim() === '') {
      throw new Error(`[${lang}] Missing localized name for opaque-qr-sticker`);
    }
    if (!localized.description || localized.description.trim() === '') {
      throw new Error(`[${lang}] Missing localized description for opaque-qr-sticker`);
    }
    if (!localized.features || localized.features.length === 0) {
      throw new Error(`[${lang}] Missing features for opaque-qr-sticker`);
    }
    if (localized.badge && (localized.badge.includes('104') || localized.badge.includes('Katları'))) {
      throw new Error(`[${lang}] "104 ve Katları" badge still present! Found: ${localized.badge}`);
    }
    // Verify flexible quantity feature exists
    const hasFlexibleQtyFeature = localized.features.some(f => 
      f.toLowerCase().includes('esnek') || 
      f.toLowerCase().includes('flexib') || 
      f.toLowerCase().includes('flexív') || 
      f.toLowerCase().includes('fleksib') || 
      f.toLowerCase().includes('гибк') || 
      f.toLowerCase().includes('مرن') || 
      f.toLowerCase().includes('自由') ||
      f.toLowerCase().includes('按需')
    );
    if (!hasFlexibleQtyFeature) {
      throw new Error(`[${lang}] Missing flexible quantity feature statement in features!`);
    }
  }
  console.log('✅ All 11 languages verified for opaque-qr-sticker (zero rigid 104 badges).\n');

  // 2. Verify all 11 languages for transparent-qr-sticker
  console.log('--- 2. Testing transparent-qr-sticker Across 11 Languages ---');
  for (const lang of ALL_LANGUAGES) {
    const localized = getLocalizedProduct(mockTransparentProduct, lang);
    console.log(`[${lang.toUpperCase()}] Name: "${localized.name}" | Badge: ${localized.badge || 'None'}`);

    if (!localized.name) throw new Error(`[${lang}] Missing name for transparent-qr-sticker`);
    if (localized.badge && (localized.badge.includes('100') || localized.badge.includes('Katları'))) {
      throw new Error(`[${lang}] "100 ve Katları" badge still present! Found: ${localized.badge}`);
    }
  }
  console.log('✅ All 11 languages verified for transparent-qr-sticker (zero 100 badges).\n');

  // 3. Verify all 7 QR Types across 11 Languages
  console.log('--- 3. Testing 7 QR Types Across 11 Languages ---');
  const EXPECTED_QR_TYPES = ['table', 'staff', 'pool', 'menu', 'smart_hub', 'review', 'custom'];

  for (const lang of ALL_LANGUAGES) {
    const qrOptions = getLocalizedQrTypeOptions(lang);
    if (qrOptions.length !== 7) {
      throw new Error(`[${lang}] Expected 7 QR types, found ${qrOptions.length}`);
    }
    for (const expectedId of EXPECTED_QR_TYPES) {
      const opt = qrOptions.find(o => o.id === expectedId);
      if (!opt || !opt.label || !opt.desc) {
        throw new Error(`[${lang}] QR Type "${expectedId}" missing label or description!`);
      }
    }
    const sample = qrOptions[0];
    console.log(`[${lang.toUpperCase()}] 7/7 QR types verified. Sample: "${sample.label}" (${sample.icon})`);
  }
  console.log('✅ All 7 QR Types completely translated into all 11 languages.\n');

  console.log('======================================================');
  console.log('🎉 ALL 11-LANGUAGE HARDWARE STORE VERIFICATIONS PASSED!');
  console.log('======================================================');
}

test11LanguageStoreLocales();
