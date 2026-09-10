import prisma from '../utils/prisma';
import * as paymentMethodService from '../services/paymentMethod.service';
import * as businessService from '../services/business.service';
import * as tipService from '../services/tip.service';
import { paymentService } from '../services/payment/core/payment.service';
import { PaymentMethodType, PaymentStatus, Prisma } from '@prisma/client';

async function runPaymentMethodTestSuite() {
  console.log('🧪 Starting Payment Method Architecture & Master Rules Test Suite...\n');

  // 1. Fetch Demo Business
  const business = await prisma.business.findFirst({
    include: { owner: true, payment_account: true, payment_methods: true },
  });
  if (!business) throw new Error('No business found');

  const businessId = business.id;
  const ownerId = business.owner_user_id;
  console.log(`🏢 Testing with Business: "${business.name}" (${businessId})`);

  // ==========================================
  // 1. GLOBAL BANK ACCOUNT & IBAN ACTIVATION RULES
  // ==========================================
  console.log('\n--- 1. Testing IBAN / Bank Account Rules ---');

  // Ensure bank account is present
  await businessService.upsertPaymentAccount(businessId, ownerId, {
    country: 'TR',
    account_holder_name: 'Grand Gourmet Bistro Global A.S.',
    iban: 'TR330006100511123456789012',
    bank_name: 'Isbank',
    swift_bic: 'ISBKTRIS',
  });
  console.log('✅ [1/7] Global Bank Account configured (IBAN, Swift, Account Holder, Bank Name).');

  // When payment account exists, IBAN can be set to ACTIVE
  const activatedIban = await paymentMethodService.updatePaymentMethodStatus(
    businessId,
    ownerId,
    'IBAN_TRANSFER',
    'ACTIVE'
  );
  console.log(`✅ [2/7] IBAN Payment Method set to ACTIVE (Status: ${activatedIban.status})`);

  // Verify that if payment account is deleted, IBAN cannot be activated
  await businessService.deletePaymentAccount(businessId, ownerId);
  console.log('ℹ️ Temporarily deleted bank account to test connection guard.');

  let ibanBlockPassed = false;
  try {
    await paymentMethodService.updatePaymentMethodStatus(
      businessId,
      ownerId,
      'IBAN_TRANSFER',
      'ACTIVE'
    );
  } catch (err: any) {
    if (err.statusCode === 400 && err.message.includes('not connected')) {
      ibanBlockPassed = true;
    }
  }
  if (!ibanBlockPassed) {
    throw new Error('FAILED: IBAN was activated without a payment account!');
  }
  console.log('✅ [3/7] Rule Enforced: IBAN method CANNOT be activated without payment account.');

  // Restore global payment account
  await businessService.upsertPaymentAccount(businessId, ownerId, {
    country: 'TR',
    account_holder_name: 'Grand Gourmet Bistro Global A.S.',
    iban: 'TR330006100511123456789012',
    bank_name: 'Isbank',
    swift_bic: 'ISBKTRIS',
  });
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'IBAN_TRANSFER', 'ACTIVE');
  console.log('ℹ️ Restored bank account & reactivated IBAN transfer.');

  // ==========================================
  // 2. SEPARATION OF INTEGRATION STATUS & ACTIVATION STATUS
  // ==========================================
  console.log('\n--- 2. Testing Provider Integration vs Activation Status ---');

  // Disconnect provider CARD
  await paymentMethodService.updateIntegrationStatus(
    businessId,
    ownerId,
    'CARD',
    'NOT_CONNECTED'
  );

  let providerBlockPassed = false;
  try {
    await paymentMethodService.updatePaymentMethodStatus(
      businessId,
      ownerId,
      'CARD',
      'ACTIVE'
    );
  } catch (err: any) {
    if (err.statusCode === 400 && err.message.includes('not connected')) {
      providerBlockPassed = true;
    }
  }
  if (!providerBlockPassed) {
    throw new Error('FAILED: Unconnected provider was activated!');
  }
  console.log('✅ [4/7] Rule Enforced: Unconnected provider CANNOT be activated.');

  // Connect provider CARD -> now activation is permitted
  await paymentMethodService.updateIntegrationStatus(
    businessId,
    ownerId,
    'CARD',
    'CONNECTED',
    { sandbox: true, provider: 'stripe' }
  );
  const activatedCard = await paymentMethodService.updatePaymentMethodStatus(
    businessId,
    ownerId,
    'CARD',
    'ACTIVE'
  );
  console.log(`✅ [5/7] Connected provider successfully activated (Status: ${activatedCard.status}).`);

  // ==========================================
  // 3. BUSINESS DEACTIVATE ALL PAYMENT METHODS
  // ==========================================
  console.log('\n--- 3. Testing Bulk Deactivation ---');

  const allDeactivated = await paymentMethodService.deactivateAllPaymentMethods(businessId, ownerId);
  const activeCount = allDeactivated.filter((m) => m.status === 'ACTIVE').length;
  if (activeCount !== 0) {
    throw new Error(`Expected 0 active methods after deactivateAll, found ${activeCount}`);
  }
  console.log('✅ [6/7] Business successfully deactivated ALL payment methods in one click.');

  // ==========================================
  // 4. CUSTOMER-FACING USABLE VS DISABLED CATALOG
  // ==========================================
  console.log('\n--- 4. Testing Customer-Facing Catalog (Usable vs Disabled) ---');

  // Reactivate IBAN only
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'IBAN_TRANSFER', 'ACTIVE');

  const catalog = await paymentMethodService.getCustomerPaymentMethodsCatalog(businessId);
  console.log('Customer Catalog state:');
  for (const item of catalog) {
    console.log(`  • ${item.type}: [${item.status}] (isUsable: ${item.isUsable}) ${item.reason ? `-> Reason: ${item.reason}` : ''}`);
  }

  const ibanEntry = catalog.find((c) => c.type === 'IBAN_TRANSFER');
  const cardEntry = catalog.find((c) => c.type === 'CARD');

  if (!ibanEntry?.isUsable || ibanEntry.status !== 'USABLE') {
    throw new Error('IBAN should be USABLE for customer');
  }
  if (cardEntry?.isUsable || cardEntry?.status !== 'DISABLED') {
    throw new Error('CARD should be DISABLED for customer because it was deactivated');
  }
  console.log('✅ [7/7] Customer catalog correctly reports USABLE vs DISABLED with explicit reasons.');

  // Restore CARD for general dev
  await paymentMethodService.updatePaymentMethodStatus(businessId, ownerId, 'CARD', 'ACTIVE');

  console.log('\n======================================================');
  console.log('🎉 ALL PAYMENT METHOD ARCHITECTURE TESTS PASSED (7/7)');
  console.log('======================================================\n');
}

runPaymentMethodTestSuite()
  .catch((err) => {
    console.error('❌ Test suite error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
