import { PrismaClient, Role, PaymentMethodType, PaymentMethodStatus, QrType } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dtipbox.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // 1. Create or update ADMIN user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password_hash: passwordHash,
      role: Role.ADMIN,
      is_active: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Create Demo Business User
  const demoEmail = 'business@dtipbox.com';
  const demoBusinessUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      password_hash: await bcrypt.hash('Business123!', 12),
      role: Role.BUSINESS,
      business: {
        create: {
          name: 'Grand Gourmet Bistro',
          country: 'US',
          currency: 'USD',
          timezone: 'America/New_York',
          description: 'Contemporary culinary experience with artisanal cuisine and specialty drinks.',
          email: 'contact@grandgourmet.com',
          phone: '+1 555-0199',
          address: '452 Broadway, New York, NY 10013',
        },
      },
    },
    include: { business: true },
  });

  const businessId = demoBusinessUser.business!.id;
  console.log(`✅ Demo Business seeded: ${demoBusinessUser.business!.name} (${businessId})`);

  // 3. Create Business Payment Account
  await prisma.businessPaymentAccount.upsert({
    where: { business_id: businessId },
    update: {},
    create: {
      business_id: businessId,
      country: 'US',
      account_holder_name: 'Grand Gourmet Bistro LLC',
      account_number: '9876543210',
      routing_number: '021000021',
      bank_name: 'JPMorgan Chase',
    },
  });
  console.log('✅ Business Payment Account seeded');

  // 4. Create Employees
  const emp1 = await prisma.employee.create({
    data: {
      business_id: businessId,
      first_name: 'Alex',
      last_name: 'Rivera',
      position: 'Head Server',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      business_id: businessId,
      first_name: 'Elena',
      last_name: 'Vance',
      position: 'Lead Mixologist',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });
  console.log('✅ Demo Employees created');

  // 5. Create Tables
  const tbl1 = await prisma.table.create({
    data: { business_id: businessId, name: 'Table 1 - Patio' },
  });
  const tbl2 = await prisma.table.create({
    data: { business_id: businessId, name: 'Table 2 - Dining Room' },
  });
  console.log('✅ Demo Tables created');

  // 6. Create QR Codes
  const generalQr = await prisma.qrCode.create({
    data: {
      business_id: businessId,
      type: QrType.DTIPBOX,
      public_token: 'demo-general-qr',
    },
  });

  const tableQr = await prisma.qrCode.create({
    data: {
      business_id: businessId,
      table_id: tbl1.id,
      type: QrType.DTIPBOX,
      public_token: 'demo-table-1-qr',
    },
  });
  console.log(`✅ Demo QR Codes created (tokens: ${generalQr.public_token}, ${tableQr.public_token})`);

  // 7. Payment Methods & Integration
  await prisma.paymentMethod.upsert({
    where: { business_id_type: { business_id: businessId, type: PaymentMethodType.IBAN_TRANSFER } },
    update: { status: PaymentMethodStatus.ACTIVE },
    create: {
      business_id: businessId,
      type: PaymentMethodType.IBAN_TRANSFER,
      status: PaymentMethodStatus.ACTIVE,
    },
  });

  await prisma.paymentIntegration.upsert({
    where: { business_id_provider: { business_id: businessId, provider: 'CARD' } },
    update: { status: 'CONNECTED' },
    create: {
      business_id: businessId,
      provider: 'CARD',
      status: 'CONNECTED',
    },
  });

  await prisma.paymentMethod.upsert({
    where: { business_id_type: { business_id: businessId, type: PaymentMethodType.CARD } },
    update: { status: PaymentMethodStatus.ACTIVE },
    create: {
      business_id: businessId,
      type: PaymentMethodType.CARD,
      status: PaymentMethodStatus.ACTIVE,
    },
  });
  console.log('✅ Demo Payment Methods configured');

  console.log('\n🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
