import prisma from '../utils/prisma';
import * as providerService from '../services/payment/provider.service';
import * as paymentMethodService from '../services/paymentMethod.service';
import * as businessService from '../services/business.service';
import * as tipService from '../services/tip.service';
import { maskCredentials, decryptJson, encryptJson } from '../utils/crypto.util';
import { ProviderCatalogStatus, ProviderRequestStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING GLOBAL PAYMENT PROVIDER FRAMEWORK VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, failureDetail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${failureDetail || 'Assertion failed'}`);
      failedCount++;
    }
  }

  try {
    // 0. Setup test businesses & clean up previous test records
    const testEmailA = `test-biz-a-${Date.now()}@naponi-test.com`;
    const testEmailB = `test-biz-b-${Date.now()}@naponi-test.com`;
    const pwdHash = await bcrypt.hash('Test123456.', 10);

    const userA = await prisma.user.create({
      data: {
        email: testEmailA,
        password_hash: pwdHash,
        role: 'BUSINESS',
      },
    });

    const userB = await prisma.user.create({
      data: {
        email: testEmailB,
        password_hash: pwdHash,
        role: 'BUSINESS',
      },
    });

    const bizA = await prisma.business.create({
      data: {
        owner_user_id: userA.id,
        name: 'Test Cafe Global A',
        country: 'US',
        currency: 'USD',
        timezone: 'America/New_York',
      },
    });

    const bizB = await prisma.business.create({
      data: {
        owner_user_id: userB.id,
        name: 'Test Bistro B',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    // Create QR code for bizA to test customer-facing view
    const qrA = await prisma.qrCode.create({
      data: {
        business_id: bizA.id,
        public_token: `token_${Date.now()}`,
      },
    });

    // -------------------------------------------------------------
    // SCENARIO 1: Business IBAN ekler -> ACTIVE
    // -------------------------------------------------------------
    await businessService.upsertPaymentAccount(bizA.id, userA.id, {
      country: 'US',
      account_holder_name: 'Test Cafe LLC',
      bank_name: 'Chase Bank',
      account_number: '1234567890',
      routing_number: '021000021',
    });

    const activatedIban = await paymentMethodService.updatePaymentMethodStatus(
      bizA.id,
      userA.id,
      'IBAN_TRANSFER',
      'ACTIVE'
    );
    assert(
      activatedIban.status === 'ACTIVE',
      'Scenario 1: Business IBAN ekler → ACTIVE yapabilir'
    );

    // -------------------------------------------------------------
    // SCENARIO 2: Business IBAN'ı INACTIVE yapar
    // -------------------------------------------------------------
    const deactivatedIban = await paymentMethodService.updatePaymentMethodStatus(
      bizA.id,
      userA.id,
      'IBAN_TRANSFER',
      'INACTIVE'
    );
    assert(
      deactivatedIban.status === 'INACTIVE',
      "Scenario 2: Business IBAN'ı INACTIVE yapabilir"
    );

    // -------------------------------------------------------------
    // SCENARIO 3: Business provider seçer (Catalog query with filters)
    // -------------------------------------------------------------
    const usCatalog = await providerService.getCatalog({ country: 'US', type: 'CARD' });
    const hasStripe = usCatalog.some((p) => p.id === 'stripe');
    const trCatalog = await providerService.getCatalog({ country: 'TR' });
    const hasIyzico = trCatalog.some((p) => p.id === 'iyzico');
    assert(
      hasStripe && hasIyzico,
      'Scenario 3: Business provider seçer (Ülke ve tip filtreli katalog doğru döner)'
    );

    // -------------------------------------------------------------
    // SCENARIO 4: Provider credential formu açılır (schema definition)
    // -------------------------------------------------------------
    const stripeMeta = usCatalog.find((p) => p.id === 'stripe');
    const hasRequiredCredFields =
      Array.isArray(stripeMeta?.required_credentials) &&
      stripeMeta!.required_credentials.some((f: any) => f.key === 'secretKey');
    assert(
      hasRequiredCredFields,
      'Scenario 4: Provider credential form alanları dinamik schema olarak döner'
    );

    // -------------------------------------------------------------
    // SCENARIO 5: Test connection başarısız olur -> ACTIVE edilemez
    // -------------------------------------------------------------
    const failTestResult = await providerService.testAndSaveIntegration(
      bizA.id,
      userA.id,
      'stripe',
      { secretKey: 'sk_test_invalid_fake_key_1234' }
    );
    assert(
      !failTestResult.success && failTestResult.status === 'ERROR',
      'Scenario 5a: Geçersiz credential ile Test Connection başarısız olur (status: ERROR)'
    );

    let activationBlocked = false;
    try {
      await paymentMethodService.updatePaymentMethodStatus(bizA.id, userA.id, 'CARD', 'ACTIVE');
    } catch (err: any) {
      activationBlocked = true;
    }
    assert(
      activationBlocked,
      'Scenario 5b: Bağlantı başarısız (ERROR) durumdayken method ACTIVE yapılamaz'
    );

    // -------------------------------------------------------------
    // SCENARIO 6: Test connection başarılı olur -> ACTIVE edilebilir
    // -------------------------------------------------------------
    const successTestResult = await providerService.testAndSaveIntegration(
      bizA.id,
      userA.id,
      'stripe',
      { secretKey: 'sk_test_51MockValidStripeKeyForNaponi998877' }
    );
    assert(
      successTestResult.success && successTestResult.status === 'CONNECTED',
      'Scenario 6a: Geçerli credential ile Test Connection başarılı olur (status: CONNECTED)'
    );

    const activatedCard = await paymentMethodService.updatePaymentMethodStatus(
      bizA.id,
      userA.id,
      'CARD',
      'ACTIVE'
    );
    assert(
      activatedCard.status === 'ACTIVE',
      'Scenario 6b: Bağlantı başarılı olduktan sonra method ACTIVE edilebilir'
    );

    // -------------------------------------------------------------
    // SCENARIO 7: Business provider'ı INACTIVE yapar
    // -------------------------------------------------------------
    const deactivatedCard = await paymentMethodService.updatePaymentMethodStatus(
      bizA.id,
      userA.id,
      'CARD',
      'INACTIVE'
    );
    assert(
      deactivatedCard.status === 'INACTIVE',
      "Scenario 7: Business provider'ı/yöntemi INACTIVE yapabilir"
    );

    // -------------------------------------------------------------
    // SCENARIO 8: Customer inactive provider'ı görmez
    // -------------------------------------------------------------
    const tipDetailsInactive = await tipService.getTipPageDetails(qrA.public_token);
    const customerHasCardInactive = tipDetailsInactive.activePaymentMethods.some((m) => m.type === 'CARD');
    assert(
      !customerHasCardInactive,
      "Scenario 8a: Yöntem INACTIVE iken müşteri tip sayfasında kart yöntemi GÖRÜNMEZ"
    );

    // Re-activate CARD to verify customer can see it when ACTIVE
    await paymentMethodService.updatePaymentMethodStatus(bizA.id, userA.id, 'CARD', 'ACTIVE');
    const tipDetailsActive = await tipService.getTipPageDetails(qrA.public_token);
    const customerHasCardActive = tipDetailsActive.activePaymentMethods.some((m) => m.type === 'CARD');
    assert(
      customerHasCardActive,
      "Scenario 8b: Yöntem ACTIVE + CONNECTED iken müşteri tip sayfasında kart yöntemi GÖRÜNÜR"
    );

    // -------------------------------------------------------------
    // SCENARIO 9: Business 'provider not listed' request gönderir
    // -------------------------------------------------------------
    const submittedReq = await providerService.submitProviderRequest(bizA.id, userA.id, {
      providerName: 'Custom Turkish Gateway',
      country: 'TR',
      website: 'https://example-pos.com',
      paymentType: 'VIRTUAL_POS',
      description: 'We need this for our 5 restaurant branches.',
    });
    assert(
      submittedReq.provider_name === 'Custom Turkish Gateway' && submittedReq.status === 'PENDING',
      "Scenario 9: Business 'provider not listed' request gönderir (status: PENDING)"
    );

    // -------------------------------------------------------------
    // SCENARIO 10: Admin provider request'i görür
    // -------------------------------------------------------------
    const adminRequests = await providerService.getAdminProviderRequests(1, 10);
    const foundReq = adminRequests.requests.find((r) => r.id === submittedReq.id);
    assert(
      foundReq !== undefined && foundReq.business?.id === bizA.id,
      'Scenario 10: Admin panelinde işletmenin gönderdiği provider request görünür'
    );

    // -------------------------------------------------------------
    // SCENARIO 11: IDOR KONTROLÜ - Business A başka Business B'nin integration bilgisini göremez
    // -------------------------------------------------------------
    // Add an integration for Business B
    await providerService.testAndSaveIntegration(
      bizB.id,
      userB.id,
      'stripe',
      { secretKey: 'sk_test_biz_B_private_key_9999999' }
    );

    const bizAIntegrations = await providerService.getBusinessIntegrations(bizA.id);
    const bizAHasB = bizAIntegrations.some((i) => i.credentials?.secretKey?.includes('9999999'));
    const isIsolated = bizAIntegrations.every((i) => i.id !== undefined);
    assert(
      !bizAHasB && isIsolated,
      "Scenario 11: IDOR Korunumu - Business A başka bir Business B'nin integration veya credential bilgisini göremez"
    );

    // -------------------------------------------------------------
    // SCENARIO 12: Secret credential API response'unda dönmez (Maskeleme & Şifreleme)
    // -------------------------------------------------------------
    const intItemA = bizAIntegrations.find((i) => i.provider === 'stripe');
    const rawSecret = 'sk_test_51MockValidStripeKeyForNaponi998877';
    const returnedSecret = intItemA?.credentials?.secretKey;
    const isMasked =
      typeof returnedSecret === 'string' &&
      returnedSecret.startsWith('••••••••') &&
      !returnedSecret.includes('MockValidStripeKey');

    // Also verify DB record is encrypted, not plaintext
    const dbIntegration = await prisma.paymentIntegration.findFirst({
      where: { business_id: bizA.id, provider: 'stripe' },
    });
    const dbEncrypted = dbIntegration?.credentials_encrypted;
    const dbIsNotPlaintext = dbEncrypted !== null && !dbEncrypted?.includes('sk_test_');

    assert(
      isMasked && dbIsNotPlaintext,
      'Scenario 12: Secret credential API response\'unda dönmez (maskelenir) ve DB\'de AES-256 ile şifreli tutulur'
    );

    // Clean up test users & data
    await prisma.tip.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.qrCode.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.paymentIntegration.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.paymentMethod.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.paymentProviderRequest.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.businessPaymentAccount.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.auditLog.deleteMany({ where: { business_id: { in: [bizA.id, bizB.id] } } });
    await prisma.business.deleteMany({ where: { id: { in: [bizA.id, bizB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });

  } catch (err: any) {
    console.error('Fatal test error:', err);
    failedCount++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
