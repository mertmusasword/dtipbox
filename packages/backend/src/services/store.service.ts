import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { StoreOrderStatus, StorePaymentMethod } from '@prisma/client';

export interface CreateOrderInput {
  items: Array<{
    productId?: string;
    product_id?: string;
    quantity: number;
    customization?: {
      size?: string;
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
    companyName: process.env.SETTLEMENT_COMPANY_NAME || 'Naponi İnternet Alışveriş Ve Mağazacılık İth.İhr.Ltd.Şti.',
    bankName: process.env.SETTLEMENT_BANK_NAME_USD || process.env.SETTLEMENT_BANK_NAME || 'Enpara Bank A.Ş.',
    iban: process.env.SETTLEMENT_IBAN_USD || 'TR20 0015 7000 0000 0095 1325 08',
    swiftCode: process.env.SETTLEMENT_SWIFT_CODE_USD || process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
  },
  {
    currency: 'EUR',
    currencySymbol: '€',
    label: 'Euro (EUR / SWIFT)',
    companyName: process.env.SETTLEMENT_COMPANY_NAME || 'Naponi İnternet Alışveriş Ve Mağazacılık İth.İhr.Ltd.Şti.',
    bankName: process.env.SETTLEMENT_BANK_NAME_EUR || process.env.SETTLEMENT_BANK_NAME || 'Enpara Bank A.Ş.',
    iban: process.env.SETTLEMENT_IBAN_EUR || 'TR34 0015 7000 0000 0095 1325 47',
    swiftCode: process.env.SETTLEMENT_SWIFT_CODE_EUR || process.env.SETTLEMENT_SWIFT_CODE || 'ENASTRISXXX',
  },
];

const INITIAL_PRODUCTS = [
  {
    slug: 'l-type-acrylic-table-stand',
    name: 'L-Tipi Akrilik QR & NFC Masa Standı',
    description: 'Masalarınız için lüks pleksi akrilik stant. Temassız NFC ve masaya özel dinamik QR kod entegreli. Suya ve darbelere dayanıklı UV baskı.',
    features: [
      'Lüks Şeffaf Pleksi / Mat Siyah Seçeneği',
      'Entegre NTAG213/215 Temassız NFC Çip',
      'Yüksek Çözünürlüklü Kalıcı UV Baskı',
      'Masaya Özel QR Kod Eşleştirme',
      'Kolay Temizlenebilir Yüzey'
    ],
    price: 180.00,
    currency: 'TRY',
    category: 'table_stand',
    image_url: '/hardware/table-stand.jpg',
    gallery: [],
    video_url: null,
    stock: 999,
    min_quantity: 1,
    badge: 'En Çok Satan',
    sort_order: 1,
  },
  {
    slug: 't-type-dual-sided-stand',
    name: 'T-Tipi Çift Yönlü QR Menü & Bahşiş Standı',
    description: 'Bir yüzünde QR Menü, diğer yüzünde Bahşiş ve Müşteri Değerlendirmesi sunan devrilmez ağır tabanlı çift yönlü masa standı.',
    features: [
      'Çift Taraflı Sunum (Ön: Menü, Arka: Bahşiş)',
      'NFC Hızlı Temassız Dokunma Noktası',
      'Ağırlaştırılmış Taban (Devrilmez)',
      'Değiştirilebilir İç Kartvizit Alanı'
    ],
    price: 240.00,
    currency: 'TRY',
    category: 'table_stand',
    image_url: '/hardware/dual-stand.jpg',
    gallery: [],
    video_url: null,
    stock: 999,
    min_quantity: 1,
    badge: 'Popüler',
    sort_order: 2,
  },
  {
    slug: 'smart-staff-nfc-badge',
    name: 'Akıllı Personel Yaka Kartı (NFC + QR)',
    description: 'Garson ve servis ekibi için kıyafetlere zarar vermeyen güçlü manyetik klipsli, personele özel QR ve NFC donanımlı akıllı rozet.',
    features: [
      'Kıyafetlere Zarar Vermeyen Güçlü Manyetik Klips',
      'Garsona Özel Kişisel QR Kod',
      'NFC Çip ile Telefona Dokundurarak Bahşiş',
      'İsim & Unvan Baskısı',
      'Hafif ve Ergonomik Tasarım'
    ],
    price: 120.00,
    currency: 'TRY',
    category: 'badge',
    image_url: '/hardware/staff-badge.jpg',
    gallery: [],
    video_url: null,
    stock: 999,
    min_quantity: 1,
    badge: 'Ekip Tercihi',
    sort_order: 3,
  },
  {
    slug: 'check-presenter-nfc-card',
    name: 'Adisyon & Hesap Sümen Kartı (QR + NFC)',
    description: 'Hesapla birlikte masaya sunulan prestijli adisyon kartı. Müşterilerin hesabı incelerken kolayca bahşiş bırakmasını sağlar.',
    features: [
      'Lüks Ahşap / Deri Görünümlü / Mat Pleksi',
      'Hesap İle Birlikte Masaya Bırakılır',
      'Bahşiş Dönüşümünü %40 Artırır',
      'Kalıcı Lazer Kazıma & UV'
    ],
    price: 140.00,
    currency: 'TRY',
    category: 'check_card',
    image_url: '/hardware/check-card.jpg',
    gallery: [],
    video_url: null,
    stock: 999,
    min_quantity: 1,
    badge: 'Yüksek Dönüşüm',
    sort_order: 4,
  },
  {
    slug: 'opaque-qr-sticker',
    name: 'Opak QR Etiket Sticker',
    description: 'Suya, sıvı dökülmelerine ve çizilmelere karşı koruyucu laminasyonlu beyaz opak zeminli yüksek çözünürlüklü QR etiket. Masa, bar ve menülere kolayca yapışır.',
    features: [
      '24 ve Katları Şeklinde Sipariş Edilebilir',
      'Lüks Beyaz Opak Parlak Zemin',
      'Su ve Dış Ortam Koşullarına Dayanıklı Laminasyon',
      'Özel Masaya/Garsona Özel Dinamik QR Entegrasyonu',
      'Kolay Sökülür, Masada İz Bırakmaz'
    ],
    price: 11.50,
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/opaque-sticker.jpg',
    gallery: [],
    video_url: null,
    stock: 9999,
    min_quantity: 1,
    quantity_step: 1,
    badge: null,
    sort_order: 5,
    variants: {
      type: 'sizes',
      defaultSize: '7x7',
      sizes: [
        { id: '3x3', label: '3x3 cm', price: 4.50 },
        { id: '4x6', label: '4x6 cm', price: 6.00 },
        { id: '5x5', label: '5x5 cm', price: 7.50 },
        { id: '5x7', label: '5x7 cm', price: 9.00 },
        { id: '7x7', label: '7x7 cm', price: 11.50 },
        { id: '10x10', label: '10x10 cm', price: 16.00 }
      ]
    }
  },
  {
    slug: 'transparent-qr-sticker',
    name: 'Şeffaf QR Sticker',
    description: 'Cam, akrilik, ayna, metal ve açık renkli ahşap yüzeylerde kusursuz eriyen %100 kristal şeffaf transparan UV baskılı akıllı QR etiket.',
    features: [
      'İstediğiniz Adette Esnek Sipariş İmkanı',
      '%100 Kristal Şeffaf Transparan Görünüm',
      'Beyaz & Altın Yaldız Premium UV Baskı',
      'Cam, Akrilik ve Ahşap Masalarda Eriyip Bütünleşen Tasarım',
      'Yırtılmaz, Çizilmez ve Su Geçirmez'
    ],
    price: 8.50,
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/transparent-sticker.jpg',
    gallery: [],
    video_url: null,
    stock: 9999,
    min_quantity: 1,
    quantity_step: 1,
    badge: null,
    sort_order: 6,
    variants: {
      type: 'sizes',
      defaultSize: '7x7',
      sizes: [
        { id: '3x3', label: '3x3 cm', price: 3.20 },
        { id: '4x6', label: '4x6 cm', price: 4.50 },
        { id: '5x5', label: '5x5 cm', price: 5.50 },
        { id: '5x7', label: '5x7 cm', price: 6.80 },
        { id: '7x7', label: '7x7 cm', price: 8.50 },
        { id: '10x10', label: '10x10 cm', price: 12.50 }
      ]
    }
  },
  {
    slug: 'all-in-one-starter-bundle',
    name: 'Naponi Hepsi Bir Arada Başlangıç Paketi',
    description: 'İşletmenizin tüm donanım ihtiyacını tek pakette karşılayan, logo baskılı avantajlı lansman seti.',
    features: [
      '10x L-Tipi Akrilik Masa Standı',
      '5x Akıllı Personel Yaka Kartı',
      '2x Adisyon Hesap Kartı',
      '1x Kasa Önü Teşekkür Totemi',
      'Özel İşletme Logo Baskısı Dahil',
      'Ücretsiz Kargo & Hızlı Teslimat'
    ],
    price: 2850.00,
    currency: 'TRY',
    category: 'bundle',
    image_url: '/hardware/bundle-kit.jpg',
    gallery: [],
    video_url: null,
    stock: 999,
    min_quantity: 1,
    quantity_step: 1,
    badge: 'En Avantajlı Paket',
    sort_order: 7,
  },
];

/**
 * Seed initial products if none exist
 */
export async function seedProductsIfEmpty() {
  try {
    const count = await prisma.storeProduct.count();
    if (count === 0) {
      for (const prod of INITIAL_PRODUCTS) {
        await prisma.storeProduct.create({
          data: prod,
        });
      }
      console.log('[StoreService] Initial store products seeded successfully.');
    }
  } catch (err) {
    console.error('[StoreService] Error seeding store products:', err);
  }
}

/**
 * List all active products for the store
 */
export async function listStoreProducts() {
  await seedProductsIfEmpty();
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

  const order = await prisma.storeOrder.create({
    data: {
      business_id: business.id,
      order_number: orderNumber,
      total_amount: totalAmount,
      currency,
      status: StoreOrderStatus.PENDING_PAYMENT,
      payment_method: StorePaymentMethod.BANK_TRANSFER,
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

  return {
    order,
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

  return {
    order,
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
