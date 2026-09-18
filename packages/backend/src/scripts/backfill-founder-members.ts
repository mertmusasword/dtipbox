import prisma from '../utils/prisma';
import { env } from '../config/env';

async function backfillFounderMembers() {
  console.log('[FOUNDER-MIGRATION] Checking businesses for Founder Member status...');
  const deadline = new Date(env.FOUNDER_MEMBER_DEADLINE);

  const eligibleBusinesses = await prisma.business.findMany({
    where: {
      created_at: {
        lte: deadline,
      },
      is_founder_member: false,
    },
  });

  console.log(`[FOUNDER-MIGRATION] Found ${eligibleBusinesses.length} eligible businesses to update.`);

  for (const biz of eligibleBusinesses) {
    await prisma.business.update({
      where: { id: biz.id },
      data: {
        is_founder_member: true,
        is_lifetime_free: true,
        founder_joined_at: biz.created_at,
        membership_plan: 'FOUNDER',
        membership_status: 'LIFETIME_FREE',
      },
    });
    console.log(`[FOUNDER-MIGRATION] Granted Founder status to: ${biz.name} (${biz.id})`);
  }

  console.log('[FOUNDER-MIGRATION] Completed successfully.');
}

backfillFounderMembers()
  .catch((err) => {
    console.error('[FOUNDER-MIGRATION] Error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
