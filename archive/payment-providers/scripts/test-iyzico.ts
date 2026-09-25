import prisma from '../utils/prisma';
import { providerRegistry } from '../services/payment/core/providerRegistry';
import * as providerService from '../services/payment/provider.service';
import * as paymentMethodService from '../services/paymentMethod.service';
import bcrypt from 'bcrypt';

async function runIyzicoTests() {
  console.log('====================================================');
  console.log('🧪 TESTING IYZICO SANAL POS ADAPTER & INTEGRATION');
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
    const iyzico = providerRegistry.getAdapter('iyzico');
    assert(!!iyzico, 'iyzico provider is registered in providerRegistry');
    assert(iyzico?.name === 'iyzico', 'iyzico provider has correct name "iyzico"');

    // 2. Check catalog sync
    const catalog = await providerService.getCatalog();
    const iyzicoInCatalog = catalog.find((c) => c.id === 'iyzico');
    assert(!!iyzicoInCatalog, 'iyzico found in catalog');
    assert(iyzicoInCatalog?.has_adapter === true, 'iyzico catalog has_adapter is true');
    assert(iyzicoInCatalog?.status === 'ACTIVE', 'iyzico catalog status is ACTIVE');

    // 3. Test invalid connection test
    console.log('\n--- Testing testConnection with invalid credentials ---');
    const invalidTestResult = await iyzico!.testConnection({
      apiKey: 'invalid_api_key',
      secretKey: 'invalid_secret_key',
      baseUrl: 'https://sandbox-api.iyzipay.com',
    });
    assert(
      invalidTestResult.success === false,
      'testConnection with invalid credentials fails gracefully',
      invalidTestResult.message
    );

    // 4. Test missing credentials
    const missingTestResult = await iyzico!.testConnection({
      apiKey: '',
      secretKey: '',
    });
    assert(
      missingTestResult.success === false,
      'testConnection with empty credentials fails immediately'
    );

    // 5. Test Business Integration Flow
    console.log('\n--- Testing Business Integration Flow ---');
    const testEmail = `iyzico-test-${Date.now()}@naponi.com`;
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
        name: 'Tesla Bistro Istanbul',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    // Test saving credentials via providerService
    // Using sandbox credentials for testing service layer
    const result = await providerService.testAndSaveIntegration(
      business.id,
      user.id,
      'iyzico',
      {
        apiKey: 'sandbox-test-key-12345',
        secretKey: 'sandbox-test-secret-67890',
        baseUrl: 'https://sandbox-api.iyzipay.com',
      }
    );

    assert(
      result.success === true,
      'testAndSaveIntegration validates sandbox credentials successfully and sets CONNECTED status'
    );

    const integrations = await providerService.getBusinessIntegrations(business.id);
    const iyzicoIntegration = integrations.find((i) => i.provider === 'iyzico');
    assert(!!iyzicoIntegration, 'iyzico integration record created in database');
    assert(
      iyzicoIntegration?.credentials?.apiKey?.includes('•••'),
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

runIyzicoTests();
