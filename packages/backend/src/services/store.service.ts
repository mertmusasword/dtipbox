import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { StoreOrderStatus, StorePaymentMethod } from '@prisma/client';
import { lemonSqueezyService } from './lemonsqueezy.service';

export interface CreateOrderInput {
  items: Array<{
    productId?: string;
    product_id?: string;
    quantity: number;
    customization?: {
      size?: string;
      color?: string;
      sizePrice?: number;
      qrType?: string;
      qrTypeLabel?: string;
      customQrImageUrl?: string;
      tableStart?: number;
      tableEnd?: number;
      useLogo?: boolean;
      staffIds?: string[];
      notes?: string;
    };
  }>;
  recipientName?: string;
  recipient_name?: string;
  phone?: string;
  addressLine?: string;
  address_line?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  postal_code?: string;
  country?: string;
  companyName?: string;
  company_name?: string;
  taxOffice?: string;
  tax_office?: string;
  taxNumber?: string;
  tax_number?: string;
  notes?: string;
  currency?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CREDIT_CARD';
  payment_method?: 'BANK_TRANSFER' | 'CREDIT_CARD';
}

export const STORE_BANK_ACCOUNTS = [
  {
    currency: 'TRY',
    currencySymbol: '₺',
    label: 'Türk Lirası (TL / FAST / EFT)',
    companyName: process.env.SETTLEMENT_COMPANY_NAME || 'Naponi İnternet Alışveriş Ve Mağazacılık İth.İhr.Ltd.Şti.',
    bankName: process.env.SETTLEMENT_BANK_NAME_TRY || process.env.SETTLEMENT_BANK_NAME || 'Enpara Bank A.Ş.',
    iban: process.env.SETTLEMENT_IBAN_TRY || 'TR45 0015 7000 0000 0084 2975 46',
    swiftCode: process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
    fastAddress: process.env.SETTLEMENT_FAST_ADDRESS || 'destek@naponi.com',
  },
  {
    currency: 'USD',
    currencySymbol: '$',
    label: 'US Dollar (USD / SWIFT)',
    companyName: process.env.SETTLEMENT_COMPANY_NAME_INTL || process.env.SETTLEMENT_COMPANY_NAME_EN || 'Naponi Internet Alisveris Ve Magazacilik Ith. Ihr. Ltd. Sti.',
    bankName: process.env.SETTLEMENT_BANK_NAME_USD || 'Enpara Bank A.S.',
    iban: process.env.SETTLEMENT_IBAN_USD || 'TR20 0015 7000 0000 0095 1325 08',
    swiftCode: process.env.SETTLEMENT_SWIFT_CODE_USD || process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
  },
  {
    currency: 'EUR',
    currencySymbol: '€',
    label: 'Euro (EUR / SWIFT)',
    companyName: process.env.SETTLEMENT_COMPANY_NAME_INTL || process.env.SETTLEMENT_COMPANY_NAME_EN || 'Naponi Internet Alisveris Ve Magazacilik Ith. Ihr. Ltd. Sti.',
    bankName: process.env.SETTLEMENT_BANK_NAME_EUR || 'Enpara Bank A.S.',
    iban: process.env.SETTLEMENT_IBAN_EUR || 'TR34 0015 7000 0000 0095 1325 47',
    swiftCode: process.env.SETTLEMENT_SWIFT_CODE_EUR || process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
  },
];

const METAL_STAND_SLUG = 'metal-qr-menu-stand';
const METAL_STAND_PRICES: Record<string, number> = {
  '1': 158.40, '2': 316.80, '3': 475.20, '4': 633.60, '5': 792.00,
  '10': 1578.72, '15': 2370.72, '20': 3157.44, '30': 4736.16, '40': 6314.88, '50': 7893.60,
};

// Seeded create-only: founder panel edits (price, tiers, active state) are preserved.
const METAL_STAND_PRODUCT = {
  slug: METAL_STAND_SLUG,
  name: 'Metal QR Karekod Menü Standı',
  description: 'Gümüş eloksallı alüminyumdan üretilen, 10x5 cm ebadında kırımlı (çadır formlu) QR menü standı. Dış etkenlere dayanıklı süblimasyon baskı ile ön ve arka yüzüne QR kodunuzu veya masa numaranızı basıyoruz. Düz kargolanır; kırım hattından elle bükerek kolayca kurarsınız. Restoran, kafe ve otellerde QR menüyü şık ve hijyenik sunar.',
  features: [
    'Eloksallı alüminyum, 0,45 mm kalınlık, gümüş zemin',
    '10x5 cm kompakt ebat, masada yer kaplamaz',
    'Dış etkenlere dayanıklı süblimasyon baskı',
    'Her stand için farklı masa numarası / QR basılabilir',
    'Ön ve arka yüzde 4x4 cm baskı alanı',
    'Düz kargolanır, kırım hattından elle bükülerek kurulur',
  ],
  price: 158.40,
  currency: 'TRY',
  category: 'metal_stand',
  image_url: '/hardware/metal-qr-menu-stand-v2.jpg',
  gallery: ['/hardware/metal-qr-menu-stand-design-area-v2.jpg'],
  video_url: '/hardware/metal-qr-menu-stand.mp4',
  stock: 9999,
  min_quantity: 1,
  quantity_step: 1,
  badge: null,
  sort_order: 3,
  is_active: true,
  variants: {
    type: 'sizes_and_tiers',
    defaultSize: '10x5',
    defaultQuantity: 1,
    quantities: [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50],
    sizes: [
      {
        id: '10x5',
        label: '10x5 cm',
        price: 158.40,
        prices: METAL_STAND_PRICES,
        quantities: [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50],
      },
    ],
  },
};

const METAL_PLATE_SLUG = 'metal-qr-plate';
const METAL_PLATE_QTYS = [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50];
const METAL_PLATE_PRICES_5X5: Record<string, number> = {
  '1': 110.40, '2': 220.80, '3': 331.20, '4': 441.60, '5': 552.00,
  '10': 1104.00, '15': 1657.38, '20': 2209.38, '30': 3313.38, '40': 4418.76, '50': 5522.76,
};
const METAL_PLATE_PRICES_10X5: Record<string, number> = {
  '1': 220.80, '2': 441.60, '3': 662.40, '4': 883.20, '5': 1104.00,
  '10': 2208.00, '15': 3314.76, '20': 4418.76, '30': 6626.76, '40': 8837.52, '50': 11045.52,
};

// Seeded create-only: founder panel edits (price, tiers, active state) are preserved.
// Colors (Gümüş, Altın, Bronz, Beyaz) are offered in the store UI for category 'metal_plate'.
const METAL_PLATE_PRODUCT = {
  slug: METAL_PLATE_SLUG,
  name: 'Metal QR Kod Menü',
  description: 'Gümüş, altın, bronz ve beyaz renk seçenekleriyle dayanıklı metal QR kod plakası. 5x5 cm ve 10x5 cm ebatlarında, masaya kolayca yapıştırılır ve misafirleri rahatsız etmez. Dış etkenlere dayanıklı süblimasyon baskı ile QR kodunuz kalıcı olarak basılır. Restoran, kafe ve otellerde QR menüyü şık ve hijyenik sunar.',
  features: [
    '4 renk seçeneği: Gümüş, Altın, Bronz, Beyaz',
    '5x5 cm ve 10x5 cm ebat seçenekleri',
    'Dış etkenlere dayanıklı süblimasyon baskı',
    'Darbelere dayanıklı metal malzeme',
    'Masaya kolayca yapıştırılır',
    'Her plakaya farklı masa numarası / QR basılabilir',
  ],
  price: 110.40,
  currency: 'TRY',
  category: 'metal_plate',
  image_url: '/hardware/metal-qr-plate.jpg',
  gallery: [] as string[],
  video_url: '/hardware/metal-qr-plate.mp4',
  stock: 9999,
  min_quantity: 1,
  quantity_step: 1,
  badge: null,
  sort_order: 4,
  is_active: true,
  variants: {
    type: 'sizes_and_tiers',
    defaultSize: '5x5',
    defaultQuantity: 1,
    quantities: METAL_PLATE_QTYS,
    sizes: [
      { id: '5x5', label: '5x5 cm', price: 110.40, prices: METAL_PLATE_PRICES_5X5, quantities: METAL_PLATE_QTYS },
      { id: '10x5', label: '10x5 cm', price: 220.80, prices: METAL_PLATE_PRICES_10X5, quantities: METAL_PLATE_QTYS },
    ],
  },
};

const PLEKSI_STAND_SLUG = 'pleksi-qr-menu-stand';
const PLEKSI_STAND_QTYS = [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50];
const PLEKSI_BASE_PRICES: Record<string, number> = {
  '1': 193.20, '2': 386.40, '3': 579.60, '4': 772.80, '5': 966.00,
  '10': 1932.00, '15': 2898.00, '20': 3864.00, '30': 5796.00, '40': 7728.00, '50': 9660.00,
};
const pleksiPrices = (mult: number): Record<string, number> =>
  Object.fromEntries(Object.entries(PLEKSI_BASE_PRICES).map(([q, p]) => [q, Math.round(p * mult * 100) / 100]));
const pleksiSize = (id: string, mult: number) => ({
  id,
  label: `${id} cm`,
  price: Math.round(193.20 * mult * 100) / 100,
  prices: pleksiPrices(mult),
  quantities: PLEKSI_STAND_QTYS,
});

// Seeded create-only: founder panel edits are preserved. Larger sizes are estimated by area; adjust from the panel.
// Plate colors (Gümüş, Altın, Beyaz, Bronz) are offered in the store UI for category 'pleksi_stand'.
const PLEKSI_STAND_PRODUCT = {
  slug: PLEKSI_STAND_SLUG,
  name: 'Pleksi QR Karekod Menü Standı',
  description: 'Siyah pleksi kırımlı (çadır formlu) stand üzerine yapıştırılmış metal plaka ile şık bir QR menü standı. Kırımlı yapısı sayesinde dayanıklılığı artırılmış, uzun ömürlü kullanıma uygundur. Metal plaka üzerine dış etkenlere dayanıklı süblimasyon baskı yapılır. Restoran, kafe ve otellerde QR menüyü pratik ve şık sunar.',
  features: [
    'Pleksi stand üzerine metal plaka',
    '4 plaka rengi: Gümüş, Altın, Beyaz, Bronz',
    '3 ebat: 4.5x5, 7x7, 9x5 cm',
    'Dış etkenlere dayanıklı süblimasyon baskı',
    'Kırımlı yapı, uzun ömürlü kullanım',
    'Her stand için farklı masa numarası / QR basılabilir',
  ],
  price: 193.20,
  currency: 'TRY',
  category: 'pleksi_stand',
  image_url: '/hardware/pleksi-qr-menu-stand.jpg',
  gallery: [] as string[],
  video_url: '/hardware/pleksi-qr-menu-stand-v2.mp4' as string | null,
  stock: 9999,
  min_quantity: 1,
  quantity_step: 1,
  badge: null,
  sort_order: 5,
  is_active: true,
  variants: {
    type: 'sizes_and_tiers',
    defaultSize: '4.5x5',
    defaultQuantity: 1,
    quantities: PLEKSI_STAND_QTYS,
    sizes: [pleksiSize('4.5x5', 1), pleksiSize('7x7', 2)],
  },
};

const ACTIVE_STICKERS = [
  {
    slug: 'opaque-qr-sticker',
    name: 'Opak QR Etiket Sticker',
    description: 'Suya, neme, sıvı dökülmelerine ve çizilmelere karşı ultra koruyucu laminasyonlu parlak beyaz opak zeminli QR etiket. Masa, bar ve menülere kusursuz yapışır.',
    features: [
      'Parlak Beyaz Opak Lüks Zemin',
      'Suya, Yağa ve Çizilmeye Dayanıklı UV Koruma',
      'Masaya / Menüye Özel Dinamik QR Entegrasyonu',
      'Kolay Sökülür, Masada Leke ve İz Bırakmaz',
    ],
    price: 250.00,
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/opaque-qr-sticker-en.jpg',
    gallery: [],
    video_url: '/hardware/opaque-qr-sticker.mp4',
    stock: 9999,
    min_quantity: 1,
    quantity_step: 1,
    badge: null,
    sort_order: 1,
    is_active: true,
    variants: {
      type: 'sizes_and_tiers',
      defaultSize: '3x3',
      defaultQuantity: 104,
      quantities: [104, 208, 312, 416, 520, 1040],
      sizes: [
        {
          id: '3x3',
          label: '3x3 cm',
          price: 350,
          prices: { '104': 250, '208': 400, '250': 350, '312': 550, '416': 700, '500': 620, '520': 750, '750': 880, '1000': 1100, '1040': 1100, '1250': 1300, '2500': 2350 },
          quantities: [104, 208, 312, 416, 520, 1040],
        },
        {
          id: '4x6',
          label: '4x6 cm',
          price: 380,
          prices: { '80': 450, '120': 550, '150': 380, '200': 800, '300': 680, '400': 1400, '450': 960, '600': 1900, '750': 1420, '1500': 2550 },
          quantities: [80, 120, 200, 400, 600],
        },
        {
          id: '5x5',
          label: '5x5 cm',
          price: 420,
          prices: { '80': 450, '120': 550, '140': 420, '200': 800, '280': 760, '400': 1400, '420': 1080, '560': 1350, '600': 1900, '700': 1600, '1000': 2500, '1400': 2900 },
          quantities: [80, 120, 200, 400, 600, 1000],
        },
        {
          id: '5x7',
          label: '5x7 cm',
          price: 460,
          prices: { '30': 250, '60': 400, '90': 500, '120': 600, '240': 1050, '360': 1180, '480': 1650, '600': 1750, '1200': 3150 },
          quantities: [30, 60, 90, 120, 240, 480],
        },
        {
          id: '7x7',
          label: '7x7 cm',
          price: 680,
          prices: { '24': 250, '48': 400, '96': 650, '104': 680, '192': 1100, '208': 1220, '312': 1740, '384': 2000, '416': 2200, '520': 2650, '768': 3100, '1040': 4750 },
          quantities: [24, 48, 96, 192, 384, 768],
        },
        {
          id: '10x10',
          label: '10x10 cm',
          price: 580,
          prices: { '52': 580, '64': 1700, '104': 1050, '128': 2700, '156': 1480, '192': 3500, '208': 1880, '256': 4000, '260': 2250, '320': 4800, '520': 4100, '640': 7500 },
          quantities: [64, 128, 192, 256, 320, 640],
        },
      ],
    },
  },
  {
    slug: 'transparent-qr-sticker',
    name: 'Şeffaf QR Sticker',
    description: 'Cam, akrilik, metal ve açık renkli ahşap yüzeylerde kusursuz eriyip bütünleşen %100 kristal şeffaf transparan UV baskılı akıllı QR etiket.',
    features: [
      '%100 Kristal Şeffaf Transparan Görünüm',
      'Cam ve Masalarda Eriyip Bütünleşen Tasarım',
      'Yırtılmaz, Çizilmez ve Sıvı Geçirmez',
    ],
    price: 250.00,
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/transparent-qr-sticker-en.jpg',
    gallery: [],
    video_url: '/hardware/transparent-qr-sticker.mp4',
    stock: 9999,
    min_quantity: 1,
    quantity_step: 1,
    badge: null,
    sort_order: 2,
    is_active: true,
    variants: {
      type: 'sizes_and_tiers',
      defaultSize: '3x3',
      defaultQuantity: 104,
      quantities: [104, 208, 312, 416, 520, 1040],
      sizes: [
        {
          id: '3x3',
          label: '3x3 cm',
          price: 300,
          prices: { '104': 250, '208': 400, '312': 550, '416': 650, '520': 1000, '1040': 1700 },
          quantities: [104, 208, 312, 416, 520, 1040],
        },
        {
          id: '4x6',
          label: '4x6 cm',
          price: 4.5,
          prices: { '80': 450, '120': 550, '200': 800, '400': 1400, '600': 1900, '1000': 2500 },
          quantities: [80, 120, 200, 400, 600, 1000],
        },
        {
          id: '5x5',
          label: '5x5 cm',
          price: 5.5,
          prices: { '80': 450, '120': 600, '200': 850, '400': 1400, '600': 1900, '1000': 2500 },
          quantities: [80, 120, 200, 400, 600, 1000],
        },
        {
          id: '5x7',
          label: '5x7 cm',
          price: 6.8,
          prices: { '30': 250, '60': 400, '90': 550, '120': 650, '240': 1100, '480': 1700 },
          quantities: [30, 60, 90, 120, 240, 480],
        },
        {
          id: '7x7',
          label: '7x7 cm',
          price: 8.5,
          prices: { '24': 250, '48': 400, '96': 700, '192': 1200, '384': 2000, '768': 3300 },
          quantities: [24, 48, 96, 192, 384, 768],
        },
        {
          id: '10x10',
          label: '10x10 cm',
          price: 12.5,
          prices: { '64': 1700, '128': 2800, '192': 3800, '256': 4300, '320': 5000, '640': 7800 },
          quantities: [64, 128, 192, 256, 320, 640],
        },
      ],
    },
  },
];

/**
 * Sync and seed store products: Ensures only the 2 stickers are active and non-stickers deactivated
 */
export async function syncStoreProducts() {
  try {
    // 1. Deactivate any non-sticker products (stands, badges, bundle) so only the 2 stickers are active
    await prisma.storeProduct.updateMany({
      where: {
        slug: { notIn: ['opaque-qr-sticker', 'transparent-qr-sticker', METAL_STAND_SLUG, METAL_PLATE_SLUG, PLEKSI_STAND_SLUG] },
        is_active: true,
      },
      data: { is_active: false },
    });

    // 2. Ensure both active stickers are upserted with current variants & price
    for (const prod of ACTIVE_STICKERS) {
      await prisma.storeProduct.upsert({
        where: { slug: prod.slug },
        update: {
          ...prod,
          is_active: true,
        },
        create: {
          ...prod,
          is_active: true,
        },
      });
    }

    // 3. Metal stand: create only if missing, never overwrite founder edits
    await prisma.storeProduct.upsert({
      where: { slug: METAL_STAND_SLUG },
      update: {},
      create: METAL_STAND_PRODUCT,
    });
    // One-time migration to the refreshed (cache-busted) images
    await prisma.storeProduct.updateMany({
      where: { slug: METAL_STAND_SLUG, image_url: '/hardware/metal-qr-menu-stand.jpg' },
      data: {
        image_url: '/hardware/metal-qr-menu-stand-v2.jpg',
        gallery: ['/hardware/metal-qr-menu-stand-design-area-v2.jpg'],
      },
    });
    // One-time cleanup: remove the seeded 'Yeni' badge from the metal stand
    await prisma.storeProduct.updateMany({
      where: { slug: METAL_STAND_SLUG, badge: 'Yeni' },
      data: { badge: null },
    });
    // Attach the product video to an already-seeded row only while video_url is empty
    await prisma.storeProduct.updateMany({
      where: { slug: METAL_STAND_SLUG, video_url: null },
      data: { video_url: '/hardware/metal-qr-menu-stand.mp4' },
    });
    // Metal plate: create only if missing, never overwrite founder edits
    await prisma.storeProduct.upsert({
      where: { slug: METAL_PLATE_SLUG },
      update: {},
      create: METAL_PLATE_PRODUCT,
    });
    // Pleksi stand: create only if missing, never overwrite founder edits
    await prisma.storeProduct.upsert({
      where: { slug: PLEKSI_STAND_SLUG },
      update: {},
      create: PLEKSI_STAND_PRODUCT,
    });
    // Attach the pleksi video to an already-seeded row only while video_url is empty
    await prisma.storeProduct.updateMany({
      where: { slug: PLEKSI_STAND_SLUG, video_url: null },
      data: { video_url: '/hardware/pleksi-qr-menu-stand-v2.mp4' },
    });
    // One-time migration: replace the old pleksi video with the refreshed one
    await prisma.storeProduct.updateMany({
      where: { slug: PLEKSI_STAND_SLUG, video_url: '/hardware/pleksi-qr-menu-stand.mp4' },
      data: { video_url: '/hardware/pleksi-qr-menu-stand-v2.mp4' },
    });
    // One-time cleanup: drop cancelled sizes (15x7, 9x5) from an already-seeded pleksi stand
    const pleksiRow = await prisma.storeProduct.findUnique({ where: { slug: PLEKSI_STAND_SLUG } });
    const pleksiVariants = pleksiRow?.variants as any;
    const CANCELLED_PLEKSI_SIZES = ['15x7', '9x5'];
    if (pleksiRow && pleksiVariants?.sizes?.some((s: any) => CANCELLED_PLEKSI_SIZES.includes(s.id))) {
      await prisma.storeProduct.update({
        where: { slug: PLEKSI_STAND_SLUG },
        data: {
          variants: { ...pleksiVariants, sizes: pleksiVariants.sizes.filter((s: any) => !CANCELLED_PLEKSI_SIZES.includes(s.id)) },
          features: (pleksiRow.features || []).map((f: string) =>
            /^\d ebat:/.test(f) ? '2 ebat: 4.5x5, 7x7 cm' : f
          ),
        },
      });
    }
    // Attach the plate video to an already-seeded row only while video_url is empty
    await prisma.storeProduct.updateMany({
      where: { slug: METAL_PLATE_SLUG, video_url: null },
      data: { video_url: '/hardware/metal-qr-plate.mp4' },
    });
  } catch (err) {
    console.error('[StoreService] Error syncing store products:', err);
  }
}

/**
 * List all active products for the store
 */
export async function listStoreProducts() {
  await syncStoreProducts();
  return prisma.storeProduct.findMany({
    where: { is_active: true },
    orderBy: { sort_order: 'asc' },
  });
}

/**
 * Get product by slug or id
 */
export async function getStoreProduct(identifier: string) {
  return prisma.storeProduct.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      is_active: true,
    },
  });
}

/**
 * Create a new store order
 */
export async function createStoreOrder(businessId: string, input: CreateOrderInput) {
  if (!input.items || input.items.length === 0) {
    throw new AppError('Sepetinizde ürün bulunmamaktadır.', 400);
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, currency: true, email: true },
  });

  if (!business) {
    throw new AppError('İşletme bulunamadı.', 404);
  }

  // Fetch products and validate quantities
  const productIds = input.items.map((i) => i.productId || (i as any).product_id);
  const products = await prisma.storeProduct.findMany({
    where: { id: { in: productIds.filter(Boolean) }, is_active: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  const orderItemsData: any[] = [];

  for (const item of input.items) {
    const pId = item.productId || (item as any).product_id;
    const product = productMap.get(pId);
    if (!product) {
      throw new AppError(`Seçilen ürün geçerli değil (ID: ${pId})`, 400);
    }

    if (item.quantity < (product.min_quantity || 1)) {
      throw new AppError(`${product.name} için minimum sipariş adedi: ${product.min_quantity}`, 400);
    }

    // Calculate unit price from selected size variant or tiered package if specified
    let unitPrice = Number(product.price);
    if (item.customization && (item.customization as any).size && product.variants) {
      const variantsData = product.variants as any;
      const matchedSize = variantsData?.sizes?.find(
        (s: any) => s.id === (item.customization as any).size || s.label === (item.customization as any).size
      );
      if (matchedSize) {
        if (matchedSize.prices && matchedSize.prices[item.quantity]) {
          unitPrice = Number(matchedSize.prices[item.quantity]) / item.quantity;
        } else if (matchedSize.price) {
          unitPrice = Number(matchedSize.price);
        }
      }
    }

    const itemTotal = unitPrice * item.quantity;
    totalAmount += itemTotal;

    orderItemsData.push({
      product_id: product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      customization: item.customization || null,
    });
  }

  // Handle currency: products are priced in base TRY
  // Supported store currencies strictly match available bank accounts (TRY, USD, EUR)
  let rawCurrency = (input.currency || business.currency || 'TRY').toUpperCase();
  const targetCurrency = ['TRY', 'USD', 'EUR'].includes(rawCurrency) ? rawCurrency : 'USD';

  if (targetCurrency !== 'TRY') {
    const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
      TRY: 1,
      USD: 1 / 38.5,
      EUR: 1 / 41.8,
    };
    let rate = FALLBACK_EXCHANGE_RATES[targetCurrency] || 1;
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/TRY');
      if (res.ok) {
        const data: any = await res.json();
        if (data?.rates?.[targetCurrency]) {
          rate = data.rates[targetCurrency];
        }
      }
    } catch {}

    totalAmount = Math.round(totalAmount * rate * 100) / 100;
    for (const oi of orderItemsData) {
      oi.unit_price = Math.round(oi.unit_price * rate * 100) / 100;
    }
  }

  // Calculate Shipping Fee:
  // - Domestic (TR): 200 TL base (converted if paying in foreign currency)
  // - Abroad (non-TR): Flat 15 in selected foreign currency (15 USD or 15 EUR), or 15 USD equivalent in TRY
  const countryCode = (input.country || 'TR').trim().toUpperCase();
  const isDomestic = countryCode === 'TR' || countryCode === 'TÜRKİYE' || countryCode === 'TURKEY';
  let shippingFee = 0;

  if (isDomestic) {
    if (targetCurrency === 'TRY') {
      shippingFee = 200;
    } else {
      const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
        TRY: 1,
        USD: 1 / 38.5,
        EUR: 1 / 41.8,
      };
      let r = FALLBACK_EXCHANGE_RATES[targetCurrency] || 1;
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/TRY');
        if (res.ok) {
          const data: any = await res.json();
          if (data?.rates?.[targetCurrency]) {
            r = data.rates[targetCurrency];
          }
        }
      } catch {}
      shippingFee = Math.round(200 * r * 100) / 100;
    }
  } else {
    // International: Flat 15 in selected foreign currency (USD or EUR)
    if (['USD', 'EUR'].includes(targetCurrency)) {
      shippingFee = 15;
    } else {
      shippingFee = Math.round(15 * 38.5);
    }
  }

  totalAmount = Math.round((totalAmount + shippingFee) * 100) / 100;

  const currency = targetCurrency;
  const orderNumber = `NAP-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
  const bankReferenceCode = `ORD-${orderNumber.replace('NAP-', '')}`;

  const chosenMethod = String(input.paymentMethod || (input as any).payment_method || 'BANK_TRANSFER').toUpperCase();
  const paymentMethod = chosenMethod === 'CREDIT_CARD' ? StorePaymentMethod.CREDIT_CARD : StorePaymentMethod.BANK_TRANSFER;

  const order = await prisma.storeOrder.create({
    data: {
      business_id: business.id,
      order_number: orderNumber,
      total_amount: totalAmount,
      currency,
      status: StoreOrderStatus.PENDING_PAYMENT,
      payment_method: paymentMethod,
      payment_status: 'UNPAID',
      bank_reference_code: bankReferenceCode,
      recipient_name: input.recipientName || (input as any).recipient_name || business.name,
      phone: input.phone || (input as any).phone || '',
      address_line: input.addressLine || (input as any).address_line || '',
      city: input.city || (input as any).city || '',
      state: input.state || (input as any).state || null,
      postal_code: input.postalCode || (input as any).postal_code || null,
      country: input.country || (input as any).country || 'TR',
      company_name: input.companyName || (input as any).company_name || business.name,
      tax_office: input.taxOffice || (input as any).tax_office || null,
      tax_number: input.taxNumber || (input as any).tax_number || null,
      notes: input.notes || null,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  let checkoutUrl: string | null = null;
  if (paymentMethod === StorePaymentMethod.CREDIT_CARD) {
    try {
      const checkoutSession = await lemonSqueezyService.createStoreCheckout({
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: Number(order.total_amount),
        currency: order.currency,
        customerEmail: business.email || undefined,
        customerName: order.recipient_name || business.name,
        description: `Naponi Hardware Store Order #${order.order_number}`,
      });
      checkoutUrl = checkoutSession.checkoutUrl;
    } catch (checkoutErr: any) {
      throw checkoutErr;
    }
  }

  return {
    order,
    checkoutUrl,
    wireInstructions: {
      orderNumber: order.order_number,
      bankReferenceCode: order.bank_reference_code,
      totalAmount: order.total_amount,
      currency: order.currency,
      accounts: STORE_BANK_ACCOUNTS,
    },
  };
}

/**
 * Get orders for a specific business
 */
export async function getBusinessOrders(businessId: string) {
  return prisma.storeOrder.findMany({
    where: { business_id: businessId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Get specific order details
 */
export async function getOrderById(orderId: string, businessId?: string) {
  const where: any = { id: orderId };
  if (businessId) {
    where.business_id = businessId;
  }

  const order = await prisma.storeOrder.findFirst({
    where,
    include: {
      items: {
        include: { product: true },
      },
      business: {
        select: { id: true, name: true, phone: true, email: true },
      },
    },
  });

  if (!order) {
    throw new AppError('Sipariş bulunamadı.', 404);
  }

  let checkoutUrl: string | null = null;
  if (order.payment_method === StorePaymentMethod.CREDIT_CARD && order.payment_status === 'UNPAID') {
    try {
      const checkoutSession = await lemonSqueezyService.createStoreCheckout({
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: Number(order.total_amount),
        currency: order.currency,
        customerEmail: order.business?.email || undefined,
        customerName: order.recipient_name || order.business?.name,
        description: `Naponi Hardware Store Order #${order.order_number}`,
      });
      checkoutUrl = checkoutSession.checkoutUrl;
    } catch {
      // Non-fatal if offline
    }
  }

  return {
    order,
    checkoutUrl,
    wireInstructions: {
      orderNumber: order.order_number,
      bankReferenceCode: order.bank_reference_code,
      totalAmount: order.total_amount,
      currency: order.currency,
      accounts: STORE_BANK_ACCOUNTS,
    },
  };
}

/**
 * Mark transfer as sent by business
 */
export async function markTransferSent(orderId: string, businessId?: string, note?: string) {
  const where: any = { id: orderId };
  if (businessId) {
    where.business_id = businessId;
  }
  const order = await prisma.storeOrder.findFirst({
    where,
  });

  if (!order) {
    throw new AppError('Sipariş bulunamadı.', 404);
  }

  return prisma.storeOrder.update({
    where: { id: orderId },
    data: {
      payment_status: 'TRANSFER_NOTIFIED',
      transfer_sender_note: note || 'Banka havalesi işletme tarafından gönderildi olarak bildirildi.',
      updated_at: new Date(),
    },
  });
}

/**
 * Admin: List all orders
 */
export async function listAllOrdersAdmin(filters?: { status?: StoreOrderStatus; search?: string }) {
  const where: any = {};
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.search) {
    where.OR = [
      { order_number: { contains: filters.search, mode: 'insensitive' } },
      { recipient_name: { contains: filters.search, mode: 'insensitive' } },
      { company_name: { contains: filters.search, mode: 'insensitive' } },
      { business: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  return prisma.storeOrder.findMany({
    where,
    include: {
      business: {
        select: { id: true, name: true, email: true, phone: true },
      },
      items: {
        include: { product: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Admin: Update order status & shipping info
 */
export async function updateOrderStatusAdmin(
  orderId: string,
  data: {
    status?: StoreOrderStatus;
    payment_status?: string;
    tracking_number?: string;
    carrier?: string;
  }
) {
  const order = await prisma.storeOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Sipariş bulunamadı.', 404);
  }

  return prisma.storeOrder.update({
    where: { id: orderId },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.payment_status && { payment_status: data.payment_status }),
      ...(data.tracking_number !== undefined && { tracking_number: data.tracking_number }),
      ...(data.carrier !== undefined && { carrier: data.carrier }),
    },
  });
}

/**
 * Admin: List all products (active and inactive)
 */
export async function listAllProductsAdmin() {
  return prisma.storeProduct.findMany({
    orderBy: { sort_order: 'asc' },
  });
}

/**
 * Admin: Create a new product
 */
export async function createProductAdmin(data: {
  slug: string;
  name: string;
  description: string;
  features?: string[];
  price: number;
  currency?: string;
  category?: string;
  image_url?: string;
  gallery?: string[];
  video_url?: string | null;
  stock?: number;
  min_quantity?: number;
  quantity_step?: number;
  variants?: any;
  badge?: string | null;
  sort_order?: number;
  is_active?: boolean;
}) {
  const existing = await prisma.storeProduct.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new AppError('Bu slug/kod ile bir ürün zaten mevcut.', 400);
  }
  return prisma.storeProduct.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      features: data.features || [],
      price: data.price,
      currency: data.currency || 'TRY',
      category: data.category || 'sticker',
      image_url: data.image_url || '/hardware/opaque-qr-sticker-en.jpg',
      gallery: data.gallery || [],
      video_url: data.video_url || null,
      stock: data.stock ?? 9999,
      min_quantity: data.min_quantity ?? 1,
      quantity_step: data.quantity_step ?? 1,
      variants: data.variants || null,
      badge: data.badge || null,
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    },
  });
}

/**
 * Admin: Update product details, prices, size variants, etc.
 */
export async function updateProductAdmin(
  productId: string,
  data: {
    slug?: string;
    name?: string;
    description?: string;
    features?: string[];
    price?: number;
    currency?: string;
    category?: string;
    image_url?: string;
    gallery?: string[];
    video_url?: string | null;
    stock?: number;
    min_quantity?: number;
    quantity_step?: number;
    variants?: any;
    badge?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }
) {
  const product = await prisma.storeProduct.findUnique({
    where: { id: productId },
  });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  return prisma.storeProduct.update({
    where: { id: productId },
    data: {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.features !== undefined && { features: data.features }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.image_url !== undefined && { image_url: data.image_url }),
      ...(data.gallery !== undefined && { gallery: data.gallery }),
      ...(data.video_url !== undefined && { video_url: data.video_url }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.min_quantity !== undefined && { min_quantity: data.min_quantity }),
      ...(data.quantity_step !== undefined && { quantity_step: data.quantity_step }),
      ...(data.variants !== undefined && { variants: data.variants }),
      ...(data.badge !== undefined && { badge: data.badge }),
      ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
    },
  });
}

/**
 * Admin: Delete or deactivate product
 */
export async function deleteProductAdmin(productId: string) {
  const product = await prisma.storeProduct.findUnique({
    where: { id: productId },
  });
  if (!product) {
    throw new AppError('Ürün bulunamadı.', 404);
  }

  const orderCount = await prisma.storeOrderItem.count({
    where: { product_id: productId },
  });

  if (orderCount > 0) {
    return prisma.storeProduct.update({
      where: { id: productId },
      data: { is_active: false },
    });
  }

  return prisma.storeProduct.delete({
    where: { id: productId },
  });
}
