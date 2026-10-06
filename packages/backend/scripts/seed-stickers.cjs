const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sizes = [
  { id: '3x3', label: '3x3 cm', factor: 0.4 },
  { id: '4x6', label: '4x6 cm', factor: 0.55 },
  { id: '5x5', label: '5x5 cm', factor: 0.65 },
  { id: '5x7', label: '5x7 cm', factor: 0.8 },
  { id: '7x7', label: '7x7 cm', factor: 1.0 }, // default
  { id: '10x10', label: '10x10 cm', factor: 1.45 }
];

const newProducts = [
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
    price: 11.50, // 7x7 cm default unit price
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/opaque-sticker.jpg',
    gallery: [],
    video_url: null,
    stock: 9999,
    min_quantity: 24,
    quantity_step: 24,
    badge: '24 ve Katları',
    sort_order: 5,
    is_active: true,
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
      '100 ve Katları Şeklinde Sipariş Edilebilir',
      '%100 Kristal Şeffaf Transparan Görünüm',
      'Beyaz & Altın Yaldız Premium UV Baskı',
      'Cam, Akrilik ve Ahşap Masalarda Eriyip Bütünleşen Tasarım',
      'Yırtılmaz, Çizilmez ve Su Geçirmez'
    ],
    price: 8.50, // 7x7 cm default unit price
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/transparent-sticker.jpg',
    gallery: [],
    video_url: null,
    stock: 9999,
    min_quantity: 100,
    quantity_step: 100,
    badge: '100 ve Katları',
    sort_order: 6,
    is_active: true,
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
  }
];

async function main() {
  // Deactivate old generic sticker if exists
  await prisma.storeProduct.updateMany({
    where: { slug: 'waterproof-table-stickers-pack-20' },
    data: { is_active: false }
  });

  for (const p of newProducts) {
    const existing = await prisma.storeProduct.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.storeProduct.update({
        where: { slug: p.slug },
        data: p
      });
      console.log('Updated existing product:', p.slug);
    } else {
      await prisma.storeProduct.create({ data: p });
      console.log('Created new product:', p.slug);
    }
  }

  // Update bundle sort order to 7
  await prisma.storeProduct.updateMany({
    where: { slug: 'all-in-one-starter-bundle' },
    data: { sort_order: 7 }
  });

  const all = await prisma.storeProduct.findMany({
    where: { is_active: true },
    select: { slug: true, name: true, min_quantity: true, quantity_step: true, price: true, variants: true },
    orderBy: { sort_order: 'asc' }
  });
  console.log('Active Store Products in DB:', JSON.stringify(all, null, 2));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
