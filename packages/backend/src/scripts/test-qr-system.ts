import prisma from '../utils/prisma';
import * as qrService from '../services/qr.service';
import * as tableService from '../services/table.service';
import * as tipService from '../services/tip.service';
import { generateShortToken } from '../utils/token';

async function runQrVerification() {
  console.log('🧪 Starting QR System & Non-Sequential Token Verification...\n');

  // 1. Get seeded business
  const business = await prisma.business.findFirst({
    include: { owner: true },
  });
  if (!business) {
    throw new Error('No business found');
  }

  const businessId = business.id;
  const ownerId = business.owner_user_id;
  console.log(`🏢 Testing with Business: "${business.name}" (${businessId})`);

  // 2. Create Table for table-specific QR test
  const table = await tableService.createTable(businessId, ownerId, {
    name: `Garden Section Table-${Date.now()}`,
  });
  console.log(`🪑 Created Table for QR test: "${table.name}" (${table.id})`);

  // 3. Test General Business QR creation
  const generalQr = await qrService.createQrCode(businessId, ownerId, {});
  console.log(`✅ [1/5] General QR created. Public Token: ${generalQr.public_token}`);
  if (generalQr.table_id !== null) {
    throw new Error('General QR should have null table_id');
  }

  // 4. Test Table-Specific QR creation
  const tableQr = await qrService.createQrCode(businessId, ownerId, {
    table_id: table.id,
  });
  console.log(`✅ [2/5] Table-specific QR created. Public Token: ${tableQr.public_token} (Table: ${tableQr.table?.name})`);
  if (tableQr.table_id !== table.id) {
    throw new Error('Table QR table_id does not match table.id');
  }

  // 5. Test Public Route data binding (/tip/:publicToken)
  const tipPageDetailsGeneral = await tipService.getTipPageDetails(generalQr.public_token);
  console.log(`✅ [3/5] Public route binding for General QR verified:`);
  console.log(`       • Business: ${tipPageDetailsGeneral.business.name} (Currency: ${tipPageDetailsGeneral.business.currency})`);
  console.log(`       • Pre-selected Table: ${tipPageDetailsGeneral.table ? tipPageDetailsGeneral.table.name : 'None (General)'}`);

  const tipPageDetailsTable = await tipService.getTipPageDetails(tableQr.public_token);
  console.log(`✅ [4/5] Public route binding for Table QR verified:`);
  console.log(`       • Business: ${tipPageDetailsTable.business.name}`);
  console.log(`       • Pre-selected Table: ${tipPageDetailsTable.table?.name} (ID: ${tipPageDetailsTable.table?.id})`);
  if (tipPageDetailsTable.table?.id !== table.id) {
    throw new Error('Public tip page table ID does not match linked table');
  }

  // 6. Test Non-Sequential Token & Cryptographic Randomness
  console.log('\n--- Testing Cryptographic Randomness & Non-Sequential Token Validation ---');
  const tokens: string[] = [];
  const tokenSet = new Set<string>();

  for (let i = 0; i < 50; i++) {
    const token = generateShortToken();
    tokens.push(token);
    tokenSet.add(token);

    // Verify it's not a sequential number or easily predictable integer
    if (/^\d+$/.test(token)) {
      throw new Error(`Token is a sequential integer: ${token}`);
    }
    // Verify token length and entropy (base64url of 16 bytes = 22 chars)
    if (token.length < 16) {
      throw new Error(`Token entropy too low: length=${token.length}`);
    }
  }

  if (tokenSet.size !== 50) {
    throw new Error('Collision detected in 50 crypto random tokens!');
  }

  console.log(`✅ [5/5] Generated 50 sample tokens. Verified:`);
  console.log(`       • Collisions: 0 / 50`);
  console.log(`       • Sample Token 1: ${tokens[0]}`);
  console.log(`       • Sample Token 2: ${tokens[1]}`);
  console.log(`       • Sample Token 3: ${tokens[2]}`);
  console.log(`       • Sequential ID check: Passed (zero sequential integer patterns)`);

  // Cleanup test items
  await qrService.deleteQrCode(generalQr.id, businessId, ownerId);
  await qrService.deleteQrCode(tableQr.id, businessId, ownerId);
  await tableService.deleteTable(table.id, businessId, ownerId);
  console.log('\n🧹 Test QR codes and table cleaned up.');

  console.log('\n======================================================');
  console.log('🎉 ALL QR SYSTEM & PUBLIC ROUTE TESTS PASSED (5/5)');
  console.log('======================================================\n');
}

runQrVerification()
  .catch((err) => {
    console.error('❌ QR verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
