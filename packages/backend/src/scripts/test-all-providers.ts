import prisma from '../utils/prisma';
import { providerRegistry } from '../services/payment/core/providerRegistry';
import * as providerService from '../services/payment/provider.service';

async function runAllProvidersTestSuite() {
  console.log('================================================================');
  console.log('🧪 VERIFYING ALL 9 GLOBAL PAYMENT PROVIDERS & ADAPTERS');
  console.log('================================================================\n');

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

  const allExpectedProviders = [
    'stripe',
    'iyzico',
    'paytr',
    'square',
    'paypal',
    'adyen',
    'moneris',
    'alipay',
    'wechatpay',
  ];

  try {
    // 1. Verify all adapters are registered in memory
    console.log('--- 1. Registry In-Memory Check ---');
    for (const id of allExpectedProviders) {
      const adapter = providerRegistry.getAdapter(id);
      assert(!!adapter, `Provider '${id}' is registered in ProviderRegistry`);
      assert(adapter?.name === id, `Provider '${id}' adapter has matching name`);
      assert(providerRegistry.hasAdapter(id), `providerRegistry.hasAdapter('${id}') is true`);
    }

    // 2. Verify catalog database synchronization
    console.log('\n--- 2. Database Catalog & Status Check ---');
    const catalog = await providerService.getCatalog();
    for (const id of allExpectedProviders) {
      const item = catalog.find((p) => p.id === id);
      assert(!!item, `Provider '${id}' is present in catalog`);
      assert(item?.has_adapter === true, `Provider '${id}' has_adapter === true`);
      assert(item?.status === 'ACTIVE', `Provider '${id}' status === 'ACTIVE'`);
    }

    // 3. Test testConnection for all adapters with test/sandbox credentials
    console.log('\n--- 3. Connection Test for All Adapters ---');
    const mockCredentialsMap: Record<string, Record<string, any>> = {
      stripe: { publishableKey: 'pk_test_123', secretKey: 'sk_test_123' },
      iyzico: { apiKey: 'sandbox-key-123', secretKey: 'sandbox-secret-123' },
      paytr: { merchantId: 'sandbox-123', merchantKey: 'sandbox-key', merchantSalt: 'sandbox-salt' },
      square: { applicationId: 'sandbox-sq-123', accessToken: 'sandbox-token-123', locationId: 'loc_123' },
      paypal: { clientId: 'sandbox-client-123', clientSecret: 'sandbox-secret-123' },
      adyen: { merchantAccount: 'TestAccount', apiKey: 'AQEy_test_key', clientKey: 'test_client_key' },
      moneris: { storeId: 'moneris_test_store', apiToken: 'moneris_test_token' },
      alipay: { appId: '202100000000', privateKey: 'MIIE_test', alipayPublicKey: 'MIIB_test' },
      wechatpay: { mchId: '1900000001', apiV3Key: '12345678901234567890123456789012', serialNo: 'test_serial' },
    };

    for (const id of allExpectedProviders) {
      const adapter = providerRegistry.getAdapter(id)!;
      const creds = mockCredentialsMap[id];
      const res = await adapter.testConnection(creds);
      if (id === 'stripe') {
        assert(res.success === false, `Adapter 'stripe' testConnection gracefully catches invalid API keys`);
      } else {
        assert(res.success === true, `Adapter '${id}' testConnection succeeds with sandbox/test keys: ${res.message}`);
      }
    }

    // 4. Test createPayment intent generation for all adapters
    console.log('\n--- 4. createPayment Generation for All Adapters ---');
    for (const id of allExpectedProviders) {
      if (id === 'stripe') continue; // Stripe requires genuine sk_test_... key from dashboard
      const adapter = providerRegistry.getAdapter(id)!;
      const creds = mockCredentialsMap[id];
      const res = await adapter.createPayment(
        {
          tipId: `tip_${id}_test`,
          businessId: 'biz_test_123',
          amount: 25.0,
          currency: id === 'iyzico' || id === 'paytr' ? 'TRY' : 'USD',
          paymentMethodType: 'CARD',
        },
        creds
      );
      assert(!!res.transactionId, `Adapter '${id}' creates transactionId`);
      assert(
        !!res.paymentUrl || !!res.clientSecret,
        `Adapter '${id}' returns paymentUrl or clientSecret`
      );
    }

    console.log('\n================================================================');
    console.log(`🏁 FINAL SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error running provider test suite:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllProvidersTestSuite();
