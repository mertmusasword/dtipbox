import prisma from '../utils/prisma';
import { providerRegistry } from '../services/payment/core/providerRegistry';
import * as providerService from '../services/payment/provider.service';
import bcrypt from 'bcrypt';

async function runPayTrTests() {
  console.log('====================================================');
  console.log('🧪 TESTING PAYTR SANAL POS ADAPTER & INTEGRATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string, detail?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`, detail || '');
      failed++;
    }
  }

  try {
    // 1. Check provider in registry
    const paytr = providerRegistry.getAdapter('paytr');
    assert(!!paytr, 'paytr provider is registered in providerRegistry');
    assert(paytr?.name === 'paytr', 'paytr provider has correct name "paytr"');

    // 2. Check catalog sync
    const catalog = await providerService.getCatalog();
    const paytrInCatalog = catalog.find((c) => c.id === 'paytr');
    assert(!!paytrInCatalog, 'paytr found in catalog');
    assert(paytrInCatalog?.has_adapter === true, 'paytr catalog has_adapter is true');
    assert(paytrInCatalog?.status === 'ACTIVE', 'paytr catalog status is ACTIVE');

    // 3. Test missing credentials
    console.log('\n--- Testing testConnection with missing credentials ---');
    const missingTestResult = await paytr!.testConnection({
      merchantId: '',
      merchantKey: '',
      merchantSalt: '',
    });
    assert(
      missingTestResult.success === false,
      'testConnection with empty credentials fails immediately'
    );

    // 4. Test sandbox credentials validation
    console.log('\n--- Testing testConnection with sandbox credentials ---');
    const sandboxTestResult = await paytr!.testConnection({
      merchantId: 'sandbox-merchant-12345',
      merchantKey: 'sandbox-key-67890',
      merchantSalt: 'sandbox-salt-abcde',
    });
    assert(
      sandboxTestResult.success === true,
      'testConnection with sandbox credentials succeeds'
    );

    // 5. Test createPayment
    console.log('\n--- Testing createPayment ---');
    const paymentResult = await paytr!.createPayment(
      {
        tipId: 'test_tip_123',
        businessId: 'test_biz_123',
        amount: 50.0,
        currency: 'TRY',
        paymentMethodType: 'CARD',
      },
      {
        merchantId: 'sandbox-merchant-12345',
        merchantKey: 'sandbox-key-67890',
        merchantSalt: 'sandbox-salt-abcde',
        testMode: '1',
      }
    );
    assert(!!paymentResult.transactionId, 'createPayment returns transactionId');
    assert(
      !!paymentResult.paymentUrl?.startsWith('https://www.paytr.com/odeme/guvenli/'),
      'createPayment returns secure PayTR checkout paymentUrl',
      paymentResult.paymentUrl
    );

    // 6. Test handleWebhook
    console.log('\n--- Testing handleWebhook ---');
    const webhookResult = await paytr!.handleWebhook(
      JSON.stringify({
        merchant_oid: 'test_tip_123',
        status: 'success',
        total_amount: '5000', // 50.00 TL in kuruş
      })
    );
    assert(webhookResult.status === 'SUCCESS', 'handleWebhook processes successful transaction');
    assert(webhookResult.amount === 50, 'handleWebhook parses amount in TL correctly');

    // 7. Test Business Integration Flow
    console.log('\n--- Testing Business Integration Flow ---');
    const testEmail = `paytr-test-${Date.now()}@naponi.com`;
    const pwdHash = await bcrypt.hash('Test123456.', 10);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password_hash: pwdHash,
        role: 'BUSINESS',
      },
    });

    const business = await prisma.business.create({
      data: {
        owner_user_id: user.id,
        name: 'Tesla Bistro PayTR Test',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    // Test saving credentials via providerService
    const result = await providerService.testAndSaveIntegration(
      business.id,
      user.id,
      'paytr',
      {
        merchantId: 'sandbox-12345',
        merchantKey: 'sandbox-key-abc',
        merchantSalt: 'sandbox-salt-xyz',
        testMode: '1',
      }
    );

    assert(
      result.success === true,
      'testAndSaveIntegration validates sandbox credentials successfully and sets CONNECTED status'
    );

    const integrations = await providerService.getBusinessIntegrations(business.id);
    const paytrIntegration = integrations.find((i) => i.provider === 'paytr');
    assert(!!paytrIntegration, 'paytr integration record created in database');
    assert(
      paytrIntegration?.credentials?.merchantId?.includes('•••'),
      'Credentials are masked in returned integrations'
    );

    // Clean up test data
    await prisma.paymentIntegration.deleteMany({ where: { business_id: business.id } });
    await prisma.business.delete({ where: { id: business.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log('\n====================================================');
    console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error in tests:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPayTrTests();
