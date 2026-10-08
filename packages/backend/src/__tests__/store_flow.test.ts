import { describe, it } from 'vitest';
import { PrismaClient, StoreOrderStatus } from '@prisma/client';
import {
  listStoreProducts,
  createStoreOrder,
  getBusinessOrders,
  getOrderById,
  markTransferSent,
  listAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../services/store.service';

const prisma = new PrismaClient();

async function runStoreVerification() {
  console.log('🧪 Starting End-to-End Store & Founder/Admin Panel Verification Test...\n');

  let testTrBusinessId = '';
  let testDeBusinessId = '';
  let testUkBusinessId = '';

  try {
    // ----------------------------------------------------
    // STEP 1: Verify Store Catalog in DB
    // ----------------------------------------------------
    console.log('--- 1. Testing Store Products & Badge Cleanup ---');
    const products = await listStoreProducts();
    console.log(`📦 Loaded ${products.length} products from store catalog.`);

    if (products.length === 0) {
      throw new Error('Store catalog is empty! Seed products expected.');
    }

    for (const p of products) {
      console.log(`   • [${p.slug}] min_qty: ${p.min_quantity}, step: ${p.quantity_step}, badge: ${p.badge || 'none'}`);
      if (p.badge && (p.badge.includes('104') || p.badge.includes('100 ve Katları'))) {
        throw new Error(`Product ${p.slug} still has badge "${p.badge}"!`);
      }
      if (p.quantity_step !== 1) {
        throw new Error(`Product ${p.slug} has quantity_step=${p.quantity_step}, expected 1!`);
      }
    }
    console.log('✅ Products have no rigid 104/100 multiples and badges are clean.\n');

    // ----------------------------------------------------
    // STEP 2: Setup Test Businesses (TR, DE, UK)
    // ----------------------------------------------------
    console.log('--- 2. Setting Up Test Businesses (TR, DE, UK) ---');
    
    // Create TR business
    const trUser = await prisma.user.upsert({
      where: { email: 'owner_tr_test@naponi.com' },
      update: {},
      create: {
        email: 'owner_tr_test@naponi.com',
        password_hash: 'dummyhash',
        role: 'BUSINESS',
      },
    });

    const trBiz = await prisma.business.upsert({
      where: { owner_user_id: trUser.id },
      update: { country: 'TR', currency: 'TRY', name: 'Lezzet Dünyası Restoran', phone: '+905551112233' },
      create: {
        owner_user_id: trUser.id,
        name: 'Lezzet Dünyası Restoran',
        phone: '+905551112233',
        country: 'TR',
        currency: 'TRY',
        address: 'Kadıköy, İstanbul',
        timezone: 'Europe/Istanbul',
      },
    });
    testTrBusinessId = trBiz.id;
    console.log(`🏢 TR Business ready: ${trBiz.name} (${trBiz.country} • ${trBiz.currency})`);

    // Create DE business (Germany / EUR)
    const deUser = await prisma.user.upsert({
      where: { email: 'owner_de_test@naponi.com' },
      update: {},
      create: {
        email: 'owner_de_test@naponi.com',
        password_hash: 'dummyhash',
        role: 'BUSINESS',
      },
    });

    const deBiz = await prisma.business.upsert({
      where: { owner_user_id: deUser.id },
      update: { country: 'DE', currency: 'EUR', name: 'Berlin Bistro & Bar', phone: '+49301234567' },
      create: {
        owner_user_id: deUser.id,
        name: 'Berlin Bistro & Bar',
        phone: '+49301234567',
        country: 'DE',
        currency: 'EUR',
        address: 'Mitte, Berlin',
        timezone: 'Europe/Berlin',
      },
    });
    testDeBusinessId = deBiz.id;
    console.log(`🏢 DE Business ready: ${deBiz.name} (${deBiz.country} • ${deBiz.currency})`);

    // Create UK business (United Kingdom / GBP registered)
    const ukUser = await prisma.user.upsert({
      where: { email: 'owner_uk_test@naponi.com' },
      update: {},
      create: {
        email: 'owner_uk_test@naponi.com',
        password_hash: 'dummyhash',
        role: 'BUSINESS',
      },
    });

    const ukBiz = await prisma.business.upsert({
      where: { owner_user_id: ukUser.id },
      update: { country: 'GB', currency: 'GBP', name: 'London Coffee Lab', phone: '+442079460991' },
      create: {
        owner_user_id: ukUser.id,
        name: 'London Coffee Lab',
        phone: '+442079460991',
        country: 'GB',
        currency: 'GBP',
        address: 'Soho, London',
        timezone: 'Europe/London',
      },
    });
    testUkBusinessId = ukBiz.id;
    console.log(`🏢 UK Business ready: ${ukBiz.name} (${ukBiz.country} • registered cur: ${ukBiz.currency})\n`);

    // ----------------------------------------------------
    // STEP 3: Business 1 (TR) Orders Hardware (TRY, 200 TL Shipping)
    // ----------------------------------------------------
    console.log('--- 3. Testing Domestic Order (TR • TRY) ---');
    const targetProduct = products[0];

    const trOrderResult = await createStoreOrder(trBiz.id, {
      items: [
        {
          product_id: targetProduct.id,
          quantity: 5, // Flexible quantity (not 104!)
          customization: {
            qrType: 'table',
            tableStart: 1,
            tableEnd: 5,
            notes: 'Masa 1-5 arası lütfen özenli basılsın',
          },
        },
      ],
      recipient_name: 'Mert Yılmaz',
      phone: '+905551112233',
      address_line: 'Moda Cad. No: 42',
      city: 'İstanbul',
      country: 'TR',
      postal_code: '34710',
      currency: 'TRY',
    });

    const trOrder = trOrderResult.order;
    console.log(`📦 TR Order Created: #${trOrder.order_number} (Ref: ${trOrder.bank_reference_code})`);
    console.log(`   Total Amount: ${trOrder.total_amount} ${trOrder.currency}`);
    console.log(`   Status: ${trOrder.status} • Payment: ${trOrder.payment_status}`);

    if (trOrder.currency !== 'TRY') {
      throw new Error(`Expected TR order currency TRY, got ${trOrder.currency}`);
    }

    // Verify wire instruction accounts
    console.log(`   Wire accounts provided: ${trOrderResult.wireInstructions.accounts.map((a: any) => a.currency).join(', ')}`);
    const matchingTryAccount = trOrderResult.wireInstructions.accounts.find((a: any) => a.currency === 'TRY');
    if (!matchingTryAccount) {
      throw new Error('TRY wire instruction account not found!');
    }
    console.log(`   Matching TRY Bank: ${matchingTryAccount.bankName} - IBAN: ${matchingTryAccount.iban}`);

    // Business marks transfer as sent
    console.log('   Action: Business marks transfer as sent...');
    const transferSentTr = await markTransferSent(trOrder.id, trBiz.id, 'Garanti Bankasından saat 14:15te havale gönderildi');
    console.log(`   Updated TR Order Payment Status: ${transferSentTr.payment_status}`);
    if (transferSentTr.payment_status !== 'TRANSFER_NOTIFIED') {
      throw new Error(`Expected payment_status TRANSFER_NOTIFIED, got ${transferSentTr.payment_status}`);
    }
    console.log('✅ TR Domestic Order flow verified successfully.\n');

    // ----------------------------------------------------
    // STEP 4: Business 2 (DE) Orders Hardware (EUR, 15 EUR Flat Shipping)
    // ----------------------------------------------------
    console.log('--- 4. Testing Abroad Order (DE • EUR • 15 EUR Shipping) ---');
    const deOrderResult = await createStoreOrder(deBiz.id, {
      items: [
        {
          product_id: targetProduct.id,
          quantity: 20,
          customization: {
            qrType: 'menu',
            notes: 'Digital menu QR stickers for tables',
          },
        },
      ],
      recipient_name: 'Hans Gruber',
      phone: '+49301234567',
      address_line: 'Friedrichstraße 100',
      city: 'Berlin',
      country: 'DE',
      postal_code: '10117',
      currency: 'EUR',
    });

    const deOrder = deOrderResult.order;
    console.log(`📦 DE Order Created: #${deOrder.order_number} (Ref: ${deOrder.bank_reference_code})`);
    console.log(`   Total Amount: ${deOrder.total_amount} ${deOrder.currency}`);
    if (deOrder.currency !== 'EUR') {
      throw new Error(`Expected EUR currency for DE order, got ${deOrder.currency}`);
    }

    const matchingEurAccount = deOrderResult.wireInstructions.accounts.find((a: any) => a.currency === 'EUR');
    if (!matchingEurAccount) {
      throw new Error('EUR bank account not found in wire instructions!');
    }
    console.log(`   Matching EUR Bank: ${matchingEurAccount.bankName} - IBAN: ${matchingEurAccount.iban}`);
    console.log('✅ DE International Order flow verified successfully.\n');

    // ----------------------------------------------------
    // STEP 5: Business 3 (UK) - Fallback from GBP to USD
    // ----------------------------------------------------
    console.log('--- 5. Testing UK Business Non-GBP Fallback (Company has no GBP account) ---');
    const ukOrderResult = await createStoreOrder(ukBiz.id, {
      items: [
        {
          product_id: targetProduct.id,
          quantity: 10,
          customization: {
            qrType: 'smart_hub',
            notes: 'All-in-one Smart Hub QR codes',
          },
        },
      ],
      recipient_name: 'James Oliver',
      phone: '+442079460991',
      address_line: '221B Baker Street',
      city: 'London',
      country: 'GB',
      postal_code: 'NW1 6XE',
      currency: 'GBP', // Requesting GBP when no GBP bank account exists
    });

    const ukOrder = ukOrderResult.order;
    console.log(`📦 UK Order Created: #${ukOrder.order_number}`);
    console.log(`   Requested Currency: GBP -> Resolved Store Currency: ${ukOrder.currency}`);
    if (ukOrder.currency === 'GBP') {
      throw new Error('Store allowed GBP order despite company having no GBP account!');
    }
    if (ukOrder.currency !== 'USD') {
      throw new Error(`Expected fallback to USD, got ${ukOrder.currency}`);
    }
    console.log('✅ UK Order successfully and safely protected with USD fallback.\n');

    // ----------------------------------------------------
    // STEP 6: Founder / Admin Panel Interactions
    // ----------------------------------------------------
    console.log('--- 6. Testing Founder / Admin Panel Management & Status Updates ---');
    const adminOrders = await listAllOrdersAdmin();
    console.log(`👔 Admin orders list loaded: total ${adminOrders.length} orders in system.`);

    const foundTrOrder = adminOrders.find((o) => o.id === trOrder.id);
    if (!foundTrOrder) {
      throw new Error(`Admin could not find TR order #${trOrder.order_number}!`);
    }
    console.log(`   Found TR order in Admin list: #${foundTrOrder.order_number} (${foundTrOrder.business?.name})`);

    // Founder inspects order details
    const orderDetails = await getOrderById(trOrder.id);
    console.log(`   Admin inspected order details: ${orderDetails.order.items.length} items, recipient: ${orderDetails.order.recipient_name}`);

    // Founder approves payment and puts into PREPARING
    console.log('   Action: Founder approves payment -> PREPARING...');
    const preparingOrder = await updateOrderStatusAdmin(trOrder.id, {
      status: StoreOrderStatus.PREPARING,
      payment_status: 'PAID',
    });
    console.log(`   Updated status: ${preparingOrder.status}, payment: ${preparingOrder.payment_status}`);
    if (preparingOrder.status !== StoreOrderStatus.PREPARING || preparingOrder.payment_status !== 'PAID') {
      throw new Error('Failed to update order to PREPARING / PAID');
    }

    // Founder ships the order with tracking number
    console.log('   Action: Founder ships order -> SHIPPED (Yurtiçi Kargo, Track: YK987654321)...');
    const shippedOrder = await updateOrderStatusAdmin(trOrder.id, {
      status: StoreOrderStatus.SHIPPED,
      carrier: 'Yurtiçi Kargo',
      tracking_number: 'YK987654321',
    });
    console.log(`   Updated status: ${shippedOrder.status}, Carrier: ${shippedOrder.carrier}, Tracking: ${shippedOrder.tracking_number}`);

    // ----------------------------------------------------
    // STEP 7: Business Orders Tab Reflects Founder Updates
    // ----------------------------------------------------
    console.log('\n--- 7. Verifying Business Sees Founder Updates in Real-Time ---');
    const myOrdersTr = await getBusinessOrders(trBiz.id);
    const myTrOrder = myOrdersTr.find((o) => o.id === trOrder.id);
    if (!myTrOrder) {
      throw new Error('Business cannot see their order in my-orders!');
    }
    console.log(`   Business order status in panel: ${myTrOrder.status}`);
    console.log(`   Business tracking info: ${myTrOrder.carrier} - ${myTrOrder.tracking_number}`);

    if (myTrOrder.status !== StoreOrderStatus.SHIPPED || myTrOrder.tracking_number !== 'YK987654321') {
      throw new Error('Founder status update did not reflect in business panel!');
    }
    console.log('✅ Real-time integration between Founder Panel and Business Store confirmed!\n');

    console.log('======================================================');
    console.log('🎉 ALL STORE & FOUNDER PANEL INTEGRATION TESTS PASSED!');
    console.log('======================================================');
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  } finally {
    // Cleanup test data
    console.log('🧹 Cleaning up test orders and test businesses...');
    if (testTrBusinessId) {
      await prisma.storeOrderItem.deleteMany({ where: { order: { business_id: testTrBusinessId } } });
      await prisma.storeOrder.deleteMany({ where: { business_id: testTrBusinessId } });
      await prisma.business.delete({ where: { id: testTrBusinessId } }).catch(() => {});
    }
    if (testDeBusinessId) {
      await prisma.storeOrderItem.deleteMany({ where: { order: { business_id: testDeBusinessId } } });
      await prisma.storeOrder.deleteMany({ where: { business_id: testDeBusinessId } });
      await prisma.business.delete({ where: { id: testDeBusinessId } }).catch(() => {});
    }
    if (testUkBusinessId) {
      await prisma.storeOrderItem.deleteMany({ where: { order: { business_id: testUkBusinessId } } });
      await prisma.storeOrder.deleteMany({ where: { business_id: testUkBusinessId } });
      await prisma.business.delete({ where: { id: testUkBusinessId } }).catch(() => {});
    }
    await prisma.user.deleteMany({
      where: {
        email: { in: ['owner_tr_test@naponi.com', 'owner_de_test@naponi.com', 'owner_uk_test@naponi.com'] }
      }
    }).catch(() => {});
    await prisma.$disconnect();
  }
}

describe('Store Flow Verification', () => {
  it('runs full store verification flow', async () => {
    await runStoreVerification();
  }, 45000);
});
