const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const activeStickers = [
  {
    slug: 'opaque-qr-sticker',
    name: 'Opak QR Etiket Sticker',
    description: 'Suya, neme, sıvı dökülmelerine ve çizilmelere karşı ultra koruyucu laminasyonlu parlak beyaz opak zeminli QR etiket. Masa, bar ve menülere kusursuz yapışır.',
    features: [
      '104, 208, 312, 416, 520, 1040 Sabit Paket Adetleri',
      'Parlak Beyaz Opak Lüks Zemin',
      'Suya, Yağa ve Çizilmeye Dayanıklı UV Koruma',
      'Masaya / Menüye Özel Dinamik QR Entegrasyonu',
      'Kolay Sökülür, Masada Leke ve İz Bırakmaz'
    ],
    price: 680.00, // 7x7 cm 104-adet default package price
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/opaque-qr-sticker-en.jpg',
    gallery: [],
    video_url: null,
    stock: 9999,
    min_quantity: 104,
    quantity_step: 104,
    badge: '104 ve Katları',
    sort_order: 1,
    is_active: true,
    variants: {
      type: 'sizes_and_tiers',
      defaultSize: '7x7',
      defaultQuantity: 104,
      quantities: [104, 208, 312, 416, 520, 1040],
      sizes: [
        {
          id: '3x3',
          label: '3x3 cm',
          price: 350,
          quantities: [250, 500, 750, 1000, 1250, 2500],
          prices: { '250': 350, '500': 620, '750': 880, '1000': 1100, '1250': 1300, '2500': 2350 }
        },
        {
          id: '4x6',
          label: '4x6 cm',
          price: 380,
          quantities: [150, 300, 450, 600, 750, 1500],
          prices: { '150': 380, '300': 680, '450': 960, '600': 1200, '750': 1420, '1500': 2550 }
        },
        {
          id: '5x5',
          label: '5x5 cm',
          price: 420,
          quantities: [140, 280, 420, 560, 700, 1400],
          prices: { '140': 420, '280': 760, '420': 1080, '560': 1350, '700': 1600, '1400': 2900 }
        },
        {
          id: '5x7',
          label: '5x7 cm',
          price: 460,
          quantities: [120, 240, 360, 480, 600, 1200],
          prices: { '120': 460, '240': 840, '360': 1180, '480': 1480, '600': 1750, '1200': 3150 }
        },
        {
          id: '7x7',
          label: '7x7 cm',
          price: 680,
          quantities: [104, 208, 312, 416, 520, 1040],
          prices: { '104': 680, '208': 1220, '312': 1740, '416': 2200, '520': 2650, '1040': 4750 }
        },
        {
          id: '10x10',
          label: '10x10 cm',
          price: 580,
          quantities: [52, 104, 156, 208, 260, 520],
          prices: { '52': 580, '104': 1050, '156': 1480, '208': 1880, '260': 2250, '520': 4100 }
        }
      ]
    }
  },
  {
    slug: 'transparent-qr-sticker',
    name: 'Şeffaf QR Sticker',
    description: 'Cam, akrilik, metal ve açık renkli ahşap yüzeylerde kusursuz eriyip bütünleşen %100 kristal şeffaf transparan UV baskılı akıllı QR etiket.',
    features: [
      '100 ve Katları Şeklinde Sipariş Edilebilir',
      '%100 Kristal Şeffaf Transparan Görünüm',
      'Beyaz & Altın Yaldız Premium UV Kalıcı Baskı',
      'Cam ve Masalarda Eriyip Bütünleşen Tasarım',
      'Yırtılmaz, Çizilmez ve Sıvı Geçirmez'
    ],
    price: 8.50, // 7x7 cm default unit price
    currency: 'TRY',
    category: 'sticker',
    image_url: '/hardware/transparent-qr-sticker-en.jpg',
    gallery: [],
    video_url: null,
    stock: 9999,
    min_quantity: 100,
    quantity_step: 100,
    badge: '100 ve Katları',
    sort_order: 2,
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
  // 1. Deactivate ALL other products
  await prisma.storeProduct.updateMany({
    where: {
      slug: { notIn: ['opaque-qr-sticker', 'transparent-qr-sticker'] }
    },
    data: { is_active: false }
  });
  console.log('Deactivated all non-sticker products.');

  // 2. Upsert the 2 stickers
  for (const p of activeStickers) {
    await prisma.storeProduct.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
    console.log('Active product ready:', p.name);
  }

  const active = await prisma.storeProduct.findMany({
    where: { is_active: true },
    select: { slug: true, name: true, min_quantity: true, quantity_step: true, is_active: true }
  });
  console.log('Currently Active Products in DB:', active);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
