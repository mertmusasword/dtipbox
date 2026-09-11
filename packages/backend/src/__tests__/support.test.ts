import { prisma } from '../utils/prisma';
import { supportService } from '../services/support.service';
import { SupportTicketCategory, SupportTicketStatus } from '@prisma/client';

async function runSupportTests() {
  console.log('🚀 Starting Support Tickets End-to-End Test Suite...\n');

  const runId = Date.now();
  const testEmail = `test-user-${runId}@example.com`;
  const testPhone = `+90544${runId.toString().slice(-7)}`;
  const testSubject = `POS Entegrasyon Sorusu - ${runId}`;

  try {
    // 1. Submit Support Ticket
    console.log('--- 1. Testing Support Ticket Creation ---');
    const created = await supportService.createSupportTicket({
      name: 'Mert Destek',
      email: testEmail,
      phone: testPhone,
      business_name: 'Bosphorus Lounge',
      category: SupportTicketCategory.POS_INTEGRATION,
      subject: testSubject,
      message: 'PayTR sanal POS entegrasyonunda API anahtarlarını girerken test bağlantısı hatası alıyoruz, teknik destek rica ederiz.',
    });

    console.log('✅ Ticket created successfully:', {
      id: created.id,
      name: created.name,
      email: created.email,
      category: created.category,
      subject: created.subject,
      status: created.status,
      isDuplicate: created.isDuplicate,
    });

    if (created.isDuplicate) {
      throw new Error('Initial ticket creation should not be duplicate');
    }
    if (created.status !== SupportTicketStatus.NEW) {
      throw new Error(`Expected status NEW, got ${created.status}`);
    }
    if (created.category !== SupportTicketCategory.POS_INTEGRATION) {
      throw new Error(`Expected category POS_INTEGRATION, got ${created.category}`);
    }

    // 2. Anti-Spam / Duplicate Guard
    console.log('\n--- 2. Testing Anti-Spam / Duplicate Submission Guard ---');
    const duplicateSubmission = await supportService.createSupportTicket({
      name: 'Mert Destek',
      email: testEmail,
      phone: testPhone,
      category: SupportTicketCategory.POS_INTEGRATION,
      subject: testSubject,
      message: 'Tekrar gönderim testi',
    });

    if (!duplicateSubmission.isDuplicate) {
      throw new Error('Anti-duplicate protection failed to flag duplicate submission!');
    }
    console.log('✅ Duplicate ticket submission successfully prevented (isDuplicate: true)');

    // 3. Admin Retrieval, Filter & Status Counts
    console.log('\n--- 3. Testing Admin Retrieval & Filter Counts ---');
    const listResult = await supportService.getSupportTickets(1, 10, 'ALL', 'ALL', runId.toString());
    console.log(`✅ Retrieved ${listResult.items.length} tickets matching search '${runId}'. Total: ${listResult.total}`);
    console.log('Status Counts:', listResult.statusCounts);
    console.log('Category Counts:', listResult.categoryCounts);

    const found = listResult.items.find((item) => item.id === created.id);
    if (!found) {
      throw new Error('Created ticket not found in admin list!');
    }

    // 4. Status Transitions & Admin Notes
    console.log('\n--- 4. Testing Status Transitions & Admin Notes ---');
    const transitions: SupportTicketStatus[] = [
      SupportTicketStatus.IN_PROGRESS,
      SupportTicketStatus.RESOLVED,
      SupportTicketStatus.CLOSED,
    ];

    for (const st of transitions) {
      const updated = await supportService.updateSupportTicketStatus(
        created.id,
        st,
        `Destek ekibi aksiyonu: Durum ${st} olarak güncellendi. Kullanıcıya ulaşıldı.`
      );
      if (updated.status !== st) {
        throw new Error(`Failed to transition to ${st}`);
      }
      console.log(`✅ Ticket status transitioned to ${st} with notes: "${updated.admin_notes}"`);
    }

    // 5. Cleanup Test Record
    console.log('\n--- 5. Testing Ticket Deletion & Cleanup ---');
    await supportService.deleteSupportTicket(created.id);
    const afterDelete = await prisma.supportTicket.findUnique({ where: { id: created.id } });
    if (afterDelete) {
      throw new Error('Ticket was not properly deleted');
    }
    console.log('✅ Test ticket deleted cleanly.');

    console.log('\n======================================================');
    console.log('🎉 ALL SUPPORT TICKET TESTS PASSED SUCCESSFULLY');
    console.log('======================================================');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSupportTests();
