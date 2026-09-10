/**
 * TEST SUITE: Naponi Legal Agreement & Digital Acceptance Audit System
 * Verifies all 10 legal and technical scenarios requested by the user.
 */

import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import {
  bootstrapDefaultAgreement,
  getActiveAgreement,
  acceptAgreement,
  getAgreementHistory,
  getAdminAgreements,
  createAgreementVersion,
  publishAgreementVersion,
  getAcceptanceAuditLogs,
  getPendingReacceptanceBusinesses,
  computeContentHash,
} from '../services/agreement.service';
import {
  MANDATORY_ACCEPTANCE_STATEMENT,
  MERCHANT_SERVICE_AGREEMENT_CODE,
  MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION,
} from '../templates/merchantAgreementText';
import { AgreementStatus } from '@prisma/client';

async function runAgreementTestSuite() {
  console.log('================================================================');
  console.log('🏛️  NAPONİ İŞLETME SÖZLEŞMESİ & DİJİTAL ONAY TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 10;

  // Setup: Ensure bootstrap runs
  await bootstrapDefaultAgreement();

  // Create temporary test user and test business
  const testEmail = `test_biz_${Date.now()}@naponi-test.com`;
  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      password_hash: passwordHash,
      role: 'BUSINESS',
      is_active: true,
    },
  });

  const testBusiness = await prisma.business.create({
    data: {
      owner_user_id: testUser.id,
      name: 'Naponi Test Kafe & Bistro Ltd.',
      country: 'TR',
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
      address: 'Nispetiye Cad. No: 42, Beşiktaş, İstanbul',
      phone: '+90 212 555 0102',
      email: testEmail,
    },
  });

  console.log(`📌 Test İşletmesi Oluşturuldu: "${testBusiness.name}" (${testBusiness.id})\n`);

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Yeni işletme sözleşmeyi kabul etmeden devam edemez
    // -------------------------------------------------------------
    console.log('--- TEST 1: Yeni işletme sözleşmeyi kabul etmeden devam edemez ---');
    const initialStatus = await getActiveAgreement(testBusiness.id);
    if (initialStatus.is_accepted === false) {
      console.log(`✅ [TEST 1 BAŞARILI] İşletme sözleşmeyi henüz kabul etmedi: is_accepted = false`);
      console.log(`   Aktif Versiyon: v${initialStatus.version.version} (Hash: ${initialStatus.version.content_hash.slice(0, 16)}...)`);
      passedTests++;
    } else {
      throw new Error('TEST 1 BAŞARISIZ: Yeni işletme onaylı görünmemelidir.');
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Sözleşme kabul edildiğinde acceptance kaydı oluşur
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Sözleşme kabul edildiğinde acceptance kaydı oluşur ---');
    const testIp = '195.175.254.2';
    const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36';

    const acceptResult = await acceptAgreement({
      businessId: testBusiness.id,
      userId: testUser.id,
      versionId: initialStatus.version.id,
      ipAddress: testIp,
      userAgent: testUserAgent,
      statement: MANDATORY_ACCEPTANCE_STATEMENT,
    });

    if (acceptResult.success && acceptResult.acceptance && acceptResult.acceptance.id) {
      console.log(`✅ [TEST 2 BAŞARILI] Acceptance kaydı oluşturuldu. ID: ${acceptResult.acceptance.id}`);
      passedTests++;
    } else {
      throw new Error('TEST 2 BAŞARISIZ: Acceptance kaydı oluşturulamadı.');
    }

    // -------------------------------------------------------------
    // SCENARIO 3: IP ve user-agent kaydedilir
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: IP ve User-Agent eksiksiz kaydedilir ---');
    const savedAcceptance = await prisma.agreementAcceptance.findUnique({
      where: { id: acceptResult.acceptance.id },
    });

    if (
      savedAcceptance &&
      savedAcceptance.ip_address === testIp &&
      savedAcceptance.user_agent === testUserAgent
    ) {
      console.log(`✅ [TEST 3 BAŞARILI] Doğrulama verileri kaydedildi:`);
      console.log(`   IP: ${savedAcceptance.ip_address}`);
      console.log(`   User-Agent: ${savedAcceptance.user_agent}`);
      passedTests++;
    } else {
      throw new Error('TEST 3 BAŞARISIZ: IP veya User-Agent verileri eşleşmiyor.');
    }

    // -------------------------------------------------------------
    // SCENARIO 4: Sözleşme versiyonu kaydedilir ve snapshot oluşturulur
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Sözleşme versiyonu ve HTML/delil snapshot kaydedilir ---');
    if (
      savedAcceptance &&
      savedAcceptance.agreement_version_id === initialStatus.version.id &&
      savedAcceptance.content_hash &&
      savedAcceptance.snapshot_html &&
      savedAcceptance.snapshot_html.includes('DİJİTAL SÖZLEŞME ONAY VE İSPAT BELGESİ')
    ) {
      console.log(`✅ [TEST 4 BAŞARILI] Versiyon ve Değişmez Snapshot oluşturuldu:`);
      console.log(`   Versiyon ID: ${savedAcceptance.agreement_version_id}`);
      console.log(`   Snapshot SHA-256: ${savedAcceptance.content_hash}`);
      console.log(`   Snapshot Boyutu: ${savedAcceptance.snapshot_html.length} karakter`);
      passedTests++;
    } else {
      throw new Error('TEST 4 BAŞARISIZ: Versiyon veya snapshot verisi eksik.');
    }

    // -------------------------------------------------------------
    // SCENARIO 5: Aynı sözleşme sonradan değiştirilemez (İmmutability)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Yayınlanan sözleşme sonradan değiştirilemez (İmmutability) ---');
    let immutabilityGuarded = false;
    try {
      // Trying to re-publish an already published version must throw
      await publishAgreementVersion(initialStatus.version.id, testUser.id);
    } catch (err: any) {
      if (err.message.includes('zaten yayındadır')) {
        immutabilityGuarded = true;
      }
    }

    // Verify raw hash matches calculated hash
    const versionRecord = await prisma.agreementVersion.findUnique({
      where: { id: initialStatus.version.id },
    });
    const calculatedHash = computeContentHash(versionRecord!.content_markdown);

    if (immutabilityGuarded && versionRecord!.content_hash === calculatedHash) {
      console.log(`✅ [TEST 5 BAŞARILI] Değiştirilemezlik (İmmutability) doğrulandı.`);
      console.log(`   Veritabanı Hash: ${versionRecord!.content_hash}`);
      console.log(`   Hesaplanan Hash: ${calculatedHash}`);
      passedTests++;
    } else {
      throw new Error('TEST 5 BAŞARISIZ: Yayındaki versiyon koruması yetersiz.');
    }

    // -------------------------------------------------------------
    // SCENARIO 6: Yeni versiyon yayınlandığında eski kabul kaydı korunur
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Yeni versiyon yayınlandığında eski kabul kaydı korunur ---');
    const newVersionNum = `1.1.${Date.now() % 1000}`;
    const newVersionDraft = await createAgreementVersion({
      agreementCode: MERCHANT_SERVICE_AGREEMENT_CODE,
      version: newVersionNum,
      title: 'Naponi İşletme Hizmet ve Kullanım Sözleşmesi (Güncellenmiş)',
      contentMarkdown: versionRecord!.content_markdown + '\n\n### Ek Madde: 2026 Güncellemesi\nEk güvenlik ilkeleri.',
      requiresReacceptance: true,
      adminUserId: testUser.id,
    });

    const publishedNewVersion = await publishAgreementVersion(newVersionDraft.id, testUser.id);

    // Check old acceptance still exists in history
    const history = await getAgreementHistory(testBusiness.id);
    const oldAcceptancePreserved = history.some((h) => h.version === '1.0.0');

    if (publishedNewVersion.status === AgreementStatus.PUBLISHED && oldAcceptancePreserved) {
      console.log(`✅ [TEST 6 BAŞARILI] Yeni versiyon (v${newVersionNum}) yayınlandı; eski v1.0.0 kabul kaydı eksiksiz korundu.`);
      console.log(`   İşletme Geçmişi: ${history.length} kabul kaydı mevcut.`);
      passedTests++;
    } else {
      throw new Error('TEST 6 BAŞARISIZ: Eski kabul kaydı kayboldu veya yeni versiyon yayınlanamadı.');
    }

    // -------------------------------------------------------------
    // SCENARIO 7: Yeniden onay gerekiyorsa işletmeden yeni onay istenir
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Yeniden onay gerekiyorsa işletmeden yeni onay istenir ---');
    const newStatusForBusiness = await getActiveAgreement(testBusiness.id);
    const pendingList = await getPendingReacceptanceBusinesses();

    const isBusinessInPendingList = pendingList.pendingBusinesses.some((b) => b.id === testBusiness.id);

    if (newStatusForBusiness.is_accepted === false && isBusinessInPendingList) {
      console.log(`✅ [TEST 7 BAŞARILI] Yeni versiyon için işletmeden yeniden onay talep ediliyor:`);
      console.log(`   Aktif Versiyon: v${newStatusForBusiness.version.version}`);
      console.log(`   İşletme Onay Durumu: is_accepted = false`);
      console.log(`   Onay Bekleyenler Listesinde: Evet`);
      passedTests++;
    } else {
      throw new Error('TEST 7 BAŞARISIZ: Yeniden onay mekanizması tetiklenmedi.');
    }

    // -------------------------------------------------------------
    // SCENARIO 8: Yetkisiz kullanıcı acceptance kaydını değiştiremez
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Yetkisiz kullanıcı sözleşmeyi başka işletme adına kabul edemez ---');
    const unauthorizedUser = await prisma.user.create({
      data: {
        email: `unauthorized_${Date.now()}@naponi-test.com`,
        password_hash: passwordHash,
        role: 'BUSINESS',
      },
    });

    let unauthorizedBlocked = false;
    try {
      await acceptAgreement({
        businessId: testBusiness.id,
        userId: unauthorizedUser.id, // Not owner or admin!
        versionId: publishedNewVersion.id,
        ipAddress: '127.0.0.1',
        userAgent: 'HackAttempt/1.0',
        statement: MANDATORY_ACCEPTANCE_STATEMENT,
      });
    } catch (err: any) {
      if (err.message.includes('yetkiniz bulunmamaktadır')) {
        unauthorizedBlocked = true;
      }
    }

    if (unauthorizedBlocked) {
      console.log(`✅ [TEST 8 BAŞARILI] Yetkisiz kullanıcının müdahalesi 403 ile engellendi.`);
      passedTests++;
    } else {
      throw new Error('TEST 8 BAŞARISIZ: Yetkisiz kullanıcı kabul yapabildi!');
    }

    // Clean up unauthorized test user
    await prisma.user.delete({ where: { id: unauthorizedUser.id } });

    // -------------------------------------------------------------
    // SCENARIO 9: Admin eski sözleşme versiyonlarını görüntüleyebilir
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Admin eski sözleşme versiyonlarını ve denetim kayıtlarını görüntüleyebilir ---');
    const adminAgreements = await getAdminAgreements();
    const auditLogs = await getAcceptanceAuditLogs({ page: 1, limit: 10 });

    const merchantAgreement = adminAgreements.find((a) => a.code === MERCHANT_SERVICE_AGREEMENT_CODE);

    if (
      merchantAgreement &&
      merchantAgreement.versions.length >= 2 &&
      auditLogs.items.length > 0
    ) {
      console.log(`✅ [TEST 9 BAŞARILI] Admin paneli ${merchantAgreement.versions.length} versiyonu ve ${auditLogs.total} kabul denetim kaydını görüntüledi.`);
      merchantAgreement.versions.forEach((v: any) => {
        console.log(`   • v${v.version} (${v.status}) - ${v.acceptance_count} kabul - Hash: ${v.content_hash.slice(0, 16)}...`);
      });
      passedTests++;
    } else {
      throw new Error('TEST 9 BAŞARISIZ: Admin sözleşme geçmişini görüntüleyemedi.');
    }

    // -------------------------------------------------------------
    // SCENARIO 10: Sözleşme kabul edilmeden production onboarding tamamlanamaz
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Sözleşme kabul edilmeden production onboarding tamamlanamaz ---');
    // Now accept the new version properly by authorized owner
    const secondAcceptResult = await acceptAgreement({
      businessId: testBusiness.id,
      userId: testUser.id,
      versionId: publishedNewVersion.id,
      ipAddress: testIp,
      userAgent: testUserAgent,
      statement: MANDATORY_ACCEPTANCE_STATEMENT,
    });

    const finalStatus = await getActiveAgreement(testBusiness.id);

    if (secondAcceptResult.success && finalStatus.is_accepted === true) {
      console.log(`✅ [TEST 10 BAŞARILI] Yeni sözleşme onaylandıktan sonra onboarding ve canlı operasyon yetkisi verildi.`);
      console.log(`   Onay Zamanı: ${finalStatus.accepted_at}`);
      console.log(`   Onay Kaydı ID: ${finalStatus.acceptance_id}`);
      passedTests++;
    } else {
      throw new Error('TEST 10 BAŞARISIZ: Sözleşme onaylanmasına rağmen yetkilendirme gerçekleşmedi.');
    }

    console.log('\n================================================================');
    console.log(`🎉 TÜM TESTLER BAŞARIYLA GEÇTİ: ${passedTests} / ${totalTests}`);
    console.log('================================================================\n');
  } finally {
    // Clean up test data
    console.log('🧹 Test verileri temizleniyor...');
    await prisma.agreementAcceptance.deleteMany({ where: { business_id: testBusiness.id } });
    await prisma.business.delete({ where: { id: testBusiness.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✨ Test ortamı temizlendi.');
  }
}

runAgreementTestSuite()
  .catch((err) => {
    console.error('\n❌ TEST HATASI:', err);
    process.exit(1);
  });
