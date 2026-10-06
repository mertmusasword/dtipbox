const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { slug: 'l-type-acrylic-table-stand', image: '/hardware/table-stand.jpg' },
  { slug: 't-type-dual-sided-stand', image: '/hardware/dual-stand.jpg' },
  { slug: 'smart-staff-nfc-badge', image: '/hardware/staff-badge.jpg' },
  { slug: 'check-presenter-nfc-card', image: '/hardware/check-card.jpg' },
  { slug: 'waterproof-table-stickers-pack-20', image: '/hardware/epoxy-sticker.jpg' },
  { slug: 'all-in-one-starter-bundle', image: '/hardware/bundle-kit.jpg' }
];

async function main() {
  for (const u of updates) {
    const res = await prisma.storeProduct.updateMany({
      where: { slug: u.slug },
      data: { image_url: u.image }
    });
    console.log(`Updated ${u.slug} -> ${u.image} (${res.count} updated)`);
  }
  
  const all = await prisma.storeProduct.findMany({
    select: { slug: true, name: true, image_url: true }
  });
  console.log('All DB store products:', all);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
