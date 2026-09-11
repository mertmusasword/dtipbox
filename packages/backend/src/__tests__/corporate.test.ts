import { prisma } from '../utils/prisma';
import { corporateService } from '../services/corporate.service';

async function runCorporateTests() {
  console.log('🚀 Starting Corporate Applications End-to-End Test Suite...\n');

  const runId = Date.now();
  const testCompany = `BigChefs Group ${runId}`;
  const testEmail = `test-corp-${runId}@bigchefs-test.com`;
  const testPhone = `+90555${runId.toString().slice(-7)}`;

  try {
    // 1. Submit Application
    console.log('--- 1. Testing Corporate Application Submission ---');
    const created = await corporateService.createCorporateApplication({
      company_name: testCompany,
      contact_name: 'Ahmet Yılmaz',
      phone: testPhone,
      email: testEmail,
      sector: 'Restoran & Cafe Zinciri',
      branch_count: 35,
      message: 'Türkiye genelindeki tüm şubelerimizde merkezi bahşiş ve QR entegrasyonu talep ediyoruz.',
    });

    console.log('✅ Application created successfully:', {
      id: created.id,
      company_name: created.company_name,
      contact_name: created.contact_name,
      phone: created.phone,
      email: created.email,
      sector: created.sector,
      branch_count: created.branch_count,
      status: created.status,
      created_at: created.created_at,
      isDuplicate: created.isDuplicate,
    });

    if (created.isDuplicate) {
      throw new Error('Initial creation should not be marked as duplicate');
    }
    if (created.status !== 'NEW') {
      throw new Error(`Expected status NEW, got ${created.status}`);
    }
    if (String(created.branch_count) !== '35') {
      throw new Error(`Expected branch_count 35, got ${created.branch_count}`);
    }

    // 2. Anti-Spam / Anti-Duplicate Protection
    console.log('\n--- 2. Testing Anti-Spam / Duplicate Submission Guard ---');
    const duplicateSubmission = await corporateService.createCorporateApplication({
      company_name: testCompany,
      contact_name: 'Ahmet Yılmaz',
      phone: testPhone,
      email: testEmail,
      sector: 'Restoran & Cafe Zinciri',
      branch_count: 35,
    });
    if (!duplicateSubmission.isDuplicate) {
      throw new Error('Anti-duplicate protection failed to flag duplicate submission!');
    }
    console.log('✅ Duplicate submission successfully recognized and handled gracefully without duplicate DB rows (isDuplicate: true)');

    // 3. Admin Listing & Status Counts
    console.log('\n--- 3. Testing Admin Retrieval & Filter Counts ---');
    const listResult = await corporateService.getCorporateApplications(1, 10);
    console.log(`✅ Retrieved ${listResult.items.length} applications. Total: ${listResult.total}`);
    console.log('Status Counts:', listResult.statusCounts);

    const found = listResult.items.find((item) => item.id === created.id);
    if (!found) {
      throw new Error('Created application not found in admin list!');
    }

    // 4. Status Transitions & Admin Notes
    console.log('\n--- 4. Testing Status Updates & Admin Notes ---');
    const statuses: Array<'CONTACTED' | 'IN_DISCUSSION' | 'COMPLETED' | 'REJECTED'> = [
      'CONTACTED',
      'IN_DISCUSSION',
      'COMPLETED',
    ];

    for (const st of statuses) {
      const updated = await corporateService.updateCorporateApplicationStatus(
        created.id,
        st,
        `Görüşme notu: Durum ${st} olarak güncellendi.`
      );
      if (updated.status !== st) {
        throw new Error(`Failed to transition to ${st}`);
      }
      console.log(`✅ Status transitioned to ${st} with note: "${updated.admin_notes}"`);
    }

    // 5. Cleanup Test Record
    console.log('\n--- 5. Testing Application Deletion & Cleanup ---');
    await corporateService.deleteCorporateApplication(created.id);
    const afterDelete = await prisma.corporateApplication.findUnique({ where: { id: created.id } });
    if (afterDelete) {
      throw new Error('Record was not properly deleted');
    }
    console.log('✅ Test application deleted cleanly.');

    console.log('\n======================================================');
    console.log('🎉 ALL CORPORATE APPLICATION TESTS PASSED SUCCESSFULLY');
    console.log('======================================================');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCorporateTests();
