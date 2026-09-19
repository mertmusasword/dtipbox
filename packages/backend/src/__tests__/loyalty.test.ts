import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../utils/prisma';
import { loyaltyService } from '../services/loyalty.service';
import bcrypt from 'bcrypt';

describe('V1 Loyalty / Sadakat System Suite', () => {
  let businessA: any;
  let businessB: any;
  let userA: any;
  let userB: any;
  let employeeA: any;
  let programA: any;

  beforeAll(async () => {
    // Clean up test data if any
    const passwordHash = await bcrypt.hash('TestPass123!', 10);
    const runId = Date.now();

    // Create Business A & Owner
    userA = await prisma.user.create({
      data: {
        email: `biz-a-${runId}@example.com`,
        password_hash: passwordHash,
        role: 'BUSINESS',
      },
    });

    businessA = await prisma.business.create({
      data: {
        owner_user_id: userA.id,
        name: 'Coffee Lab A',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });

    // Create Employee in Business A
    employeeA = await prisma.employee.create({
      data: {
        business_id: businessA.id,
        first_name: 'Barista',
        last_name: 'Ahmet',
        position: 'Barista',
      },
    });

    // Create Business B (for cross-business isolation checks)
    userB = await prisma.user.create({
      data: {
        email: `biz-b-${runId}@example.com`,
        password_hash: passwordHash,
        role: 'BUSINESS',
      },
    });

    businessB = await prisma.business.create({
      data: {
        owner_user_id: userB.id,
        name: 'Burger Joint B',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    try {
      if (businessA) await prisma.business.delete({ where: { id: businessA.id } });
      if (businessB) await prisma.business.delete({ where: { id: businessB.id } });
      if (userA) await prisma.user.delete({ where: { id: userA.id } });
      if (userB) await prisma.user.delete({ where: { id: userB.id } });
    } catch {
      // ignore cleanup errors
    }
  });

  it('should create and update a business loyalty program', async () => {
    programA = await loyaltyService.upsertBusinessProgram(businessA.id, {
      name: 'Kahve Sadakat Kartı',
      targetStamps: 5,
      rewardDescription: '1 Ücretsiz Espresso',
      isActive: true,
    });

    expect(programA).toBeDefined();
    expect(programA.name).toBe('Kahve Sadakat Kartı');
    expect(programA.target_stamps).toBe(5);
    expect(programA.reward_description).toBe('1 Ücretsiz Espresso');
    expect(programA.is_active).toBe(true);

    const fetched = await loyaltyService.getBusinessProgram(businessA.id);
    expect(fetched?.id).toBe(programA.id);
  });

  it('should enroll customer and return unique public card and code', async () => {
    const email = 'loyalty.tester@example.com';
    const result = await loyaltyService.enrollCustomer({
      businessId: businessA.id,
      programId: programA.id,
      email,
      name: 'Mert Müşteri',
    });

    expect(result.isNew).toBe(true);
    expect(result.card.public_id).toMatch(/^c_/);
    expect(result.card.card_code).toHaveLength(6);
    expect(result.card.current_stamps).toBe(0);
    expect(result.card.target_stamps).toBe(5);

    // Enrolling same email returns existing card gracefully
    const reEnroll = await loyaltyService.enrollCustomer({
      businessId: businessA.id,
      programId: programA.id,
      email,
    });
    expect(reEnroll.isNew).toBe(false);
    expect(reEnroll.card.public_id).toBe(result.card.public_id);
    expect(reEnroll.card.card_code).toBe(result.card.card_code);
  });

  it('should generate dynamic scan token for customer card', async () => {
    const card = await prisma.loyaltyCard.findFirst({
      where: { business_id: businessA.id },
    });
    expect(card).toBeDefined();

    const tokenData = await loyaltyService.generateCardScanToken(card!.public_id);
    expect(tokenData.token).toMatch(/^t_/);
    expect(tokenData.valid_seconds).toBe(60);
  });

  it('should add stamp via dynamic QR scan token and prevent replay', async () => {
    const card = await prisma.loyaltyCard.findFirst({
      where: { business_id: businessA.id },
    });
    const tokenData = await loyaltyService.generateCardScanToken(card!.public_id);

    // First scan succeeds: 0 -> 1
    const stampResult = await loyaltyService.addStampViaQr({
      token: tokenData.token,
      businessId: businessA.id,
      employeeId: employeeA.id,
      userId: userA.id,
    });

    expect(stampResult.success).toBe(true);
    expect(stampResult.previousStamps).toBe(0);
    expect(stampResult.currentStamps).toBe(1);
    expect(stampResult.rewardEarned).toBe(false);

    // Replay attempt with same token MUST throw
    await expect(
      loyaltyService.addStampViaQr({
        token: tokenData.token,
        businessId: businessA.id,
        employeeId: employeeA.id,
        userId: userA.id,
      })
    ).rejects.toThrow(/kullanılmış/i);
  });

  it('should add stamp via card code and increment safely', async () => {
    const card = await prisma.loyaltyCard.findFirst({
      where: { business_id: businessA.id },
    });

    const codeResult = await loyaltyService.addStampViaCode({
      cardCode: card!.card_code,
      businessId: businessA.id,
      employeeId: employeeA.id,
      userId: userA.id,
    });

    expect(codeResult.success).toBe(true);
    expect(codeResult.previousStamps).toBe(1);
    expect(codeResult.currentStamps).toBe(2);
  });

  it('should enforce business isolation - Business B cannot stamp Business A card', async () => {
    const cardA = await prisma.loyaltyCard.findFirst({
      where: { business_id: businessA.id },
    });

    // Business B tries to stamp Business A's card code
    await expect(
      loyaltyService.addStampViaCode({
        cardCode: cardA!.card_code,
        businessId: businessB.id,
      })
    ).rejects.toThrow(/bu işletmeye ait değil/i);
  });

  it('should trigger reward when target stamps is reached', async () => {
    const card = await prisma.loyaltyCard.findFirst({
      where: { business_id: businessA.id },
    });

    // Card currently has 2 stamps, target is 5. Add 3 more stamps.
    await loyaltyService.addStampViaCode({ cardCode: card!.card_code, businessId: businessA.id, cooldownSeconds: 0 });
    await loyaltyService.addStampViaCode({ cardCode: card!.card_code, businessId: businessA.id, cooldownSeconds: 0 });
    const finalStamp = await loyaltyService.addStampViaCode({
      cardCode: card!.card_code,
      businessId: businessA.id,
      cooldownSeconds: 0,
    });

    expect(finalStamp.currentStamps).toBe(5);
    expect(finalStamp.rewardEarned).toBe(true);
  });

  it('should handle reward redemption flow and reset stamps', async () => {
    const card = await prisma.loyaltyCard.findFirst({
      where: { business_id: businessA.id },
    });

    // Customer requests redemption code
    const redemptionReq = await loyaltyService.requestCardRedemption(card!.public_id);
    expect(redemptionReq.code).toMatch(/^RDW-/);
    expect(redemptionReq.status).toBe('PENDING');

    // Staff confirms redemption code
    const confirmRes = await loyaltyService.confirmRewardRedemption({
      code: redemptionReq.code,
      businessId: businessA.id,
      employeeId: employeeA.id,
    });

    expect(confirmRes.success).toBe(true);
    expect(confirmRes.remainingStamps).toBe(0);

    // Double redemption MUST fail
    await expect(
      loyaltyService.confirmRewardRedemption({
        code: redemptionReq.code,
        businessId: businessA.id,
      })
    ).rejects.toThrow(/daha önce kullanılmıştır/i);

    // Check updated card in db
    const updatedCard = await prisma.loyaltyCard.findUnique({
      where: { id: card!.id },
    });
    expect(updatedCard!.current_stamps).toBe(0);
    expect(updatedCard!.total_rewards_earned).toBe(1);
  });

  it('should return correct dashboard statistics and audit transactions', async () => {
    const stats = await loyaltyService.getBusinessLoyaltyStats(businessA.id);
    expect(stats.totalCards).toBeGreaterThanOrEqual(1);
    expect(stats.totalStampsGiven).toBeGreaterThanOrEqual(5);
    expect(stats.redeemedRewards).toBeGreaterThanOrEqual(1);

    const txs = await loyaltyService.getBusinessLoyaltyTransactions(businessA.id, 1, 10);
    expect(txs.items.length).toBeGreaterThan(0);
    expect(txs.items[0].card_code).toBeDefined();
    expect(txs.items[0].customer_masked_email).toContain('***@');
  });

  describe('Manual Code 5-Minute Cooldown & Anti-Abuse Protection', () => {
    it('should enforce 5-minute cooldown on manual code stamps, allow after expiry, and isolate between cards and businesses', async () => {
      // 1. Enroll Customer A and Customer B in Business A
      const enrollA = await loyaltyService.enrollCustomer({
        businessId: businessA.id,
        email: 'customer.cd.a@example.com',
        name: 'Müşteri CD A',
      });
      const cardA = enrollA.card;

      const enrollB = await loyaltyService.enrollCustomer({
        businessId: businessA.id,
        email: 'customer.cd.b@example.com',
        name: 'Müşteri CD B',
      });
      const cardB = enrollB.card;

      // 2. Enroll Customer C in Business B
      const enrollC = await loyaltyService.enrollCustomer({
        businessId: businessB.id,
        email: 'customer.cd.c@example.com',
        name: 'Müşteri CD C',
      });
      const cardC = enrollC.card;

      // Step A: Manuel kod → 1. stamp → PASS
      const firstStampA = await loyaltyService.addStampViaCode({
        cardCode: cardA.card_code,
        businessId: businessA.id,
        employeeId: employeeA.id,
        userId: userA.id,
      });
      expect(firstStampA.success).toBe(true);
      expect(firstStampA.currentStamps).toBe(1);

      // Step B: Aynı kod → hemen tekrar → BLOCK
      await expect(
        loyaltyService.addStampViaCode({
          cardCode: cardA.card_code,
          businessId: businessA.id,
          employeeId: employeeA.id,
          userId: userA.id,
        })
      ).rejects.toThrow(/çok yakın zamanda manuel damga eklenmiş/i);

      // Step C: Aynı kod → 5 dakika dolmadan (simüle 2.5 dakika) → BLOCK
      const dbCardA = await prisma.loyaltyCard.findUnique({
        where: { card_code: cardA.card_code },
      });
      const txA = await prisma.loyaltyStampTransaction.findFirst({
        where: { card_id: dbCardA!.id, action_type: 'STAMP_ADDED', method: 'CODE' },
        orderBy: { created_at: 'desc' },
      });
      expect(txA).toBeDefined();

      // Simulate 150 seconds (2.5 mins) ago
      await prisma.loyaltyStampTransaction.update({
        where: { id: txA!.id },
        data: { created_at: new Date(Date.now() - 150 * 1000) },
      });

      await expect(
        loyaltyService.addStampViaCode({
          cardCode: cardA.card_code,
          businessId: businessA.id,
        })
      ).rejects.toThrow(/kalan süre/i);

      // Step D: Cooldown süresi dolduktan sonra (simüle 6 dakika) → PASS
      await prisma.loyaltyStampTransaction.update({
        where: { id: txA!.id },
        data: { created_at: new Date(Date.now() - 360 * 1000) },
      });

      const secondStampA = await loyaltyService.addStampViaCode({
        cardCode: cardA.card_code,
        businessId: businessA.id,
        employeeId: employeeA.id,
      });
      expect(secondStampA.success).toBe(true);
      expect(secondStampA.currentStamps).toBe(2);

      // Step E: Yanlış kod → cooldown oluşmamalı
      await expect(
        loyaltyService.addStampViaCode({
          cardCode: 'INVALID-CODE-999',
          businessId: businessA.id,
        })
      ).rejects.toThrow(/bulunamadı/i);

      // Step F: Müşteri A kodu → Müşteri B'yi etkilememeli (Customer B gets stamp without cooldown)
      const firstStampB = await loyaltyService.addStampViaCode({
        cardCode: cardB.card_code,
        businessId: businessA.id,
      });
      expect(firstStampB.success).toBe(true);
      expect(firstStampB.currentStamps).toBe(1);

      // Step G: Business A → Business B'yi etkilememeli (Customer C gets stamp in Business B)
      const firstStampC = await loyaltyService.addStampViaCode({
        cardCode: cardC.card_code,
        businessId: businessB.id,
      });
      expect(firstStampC.success).toBe(true);
      expect(firstStampC.currentStamps).toBe(1);
    });
  });
});
