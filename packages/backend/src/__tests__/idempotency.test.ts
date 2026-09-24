import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '../utils/prisma';
import * as tipService from '../services/tip.service';
import { PaymentMethodType } from '@prisma/client';

describe('Tip Idempotency, Concurrency & Security Suite', () => {
  let testUser: any;
  let testBusiness: any;
  let testQr: any;

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `idempotency-test-${Date.now()}@naponi.com`,
        password_hash: 'hashed_password',
        role: 'BUSINESS',
      },
    });

    testBusiness = await prisma.business.create({
      data: {
        owner_user_id: testUser.id,
        name: 'Idempotency Bistro',
        country: 'TR',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
        external_payment_url: 'https://pay.example.com/checkout',
      },
    });

    await prisma.businessPaymentAccount.create({
      data: {
        business_id: testBusiness.id,
        country: 'TR',
        account_holder_name: 'Idempotency Bistro Ltd',
        iban: 'TR330006100511123456789012',
        bank_name: 'Test Bank',
      },
    });

    testQr = await prisma.qrCode.create({
      data: {
        business_id: testBusiness.id,
        type: 'DTIPBOX',
        public_token: `token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
    });
  });

  afterEach(async () => {
    if (testBusiness?.id) {
      await prisma.tip.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.qrCode.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.businessPaymentAccount.deleteMany({ where: { business_id: testBusiness.id } });
      await prisma.business.deleteMany({ where: { id: testBusiness.id } });
    }
    if (testUser?.id) {
      await prisma.user.deleteMany({ where: { id: testUser.id } });
    }
  });

  it('should return identical response and NOT create duplicate tips when using the same idempotencyKey', async () => {
    const idempotencyKey = `idem-${Date.now()}-test1`;

    const firstResult = await tipService.createTip({
      publicToken: testQr.public_token,
      amount: 100,
      paymentMethod: PaymentMethodType.IBAN_TRANSFER,
      customerName: 'Ahmet Yilmaz',
      customerMessage: 'Harika servis',
      idempotencyKey,
    });

    expect(firstResult.tip).toBeDefined();
    expect(Number(firstResult.tip.amount)).toBe(100);

    // Second request with exact same idempotencyKey
    const secondResult = await tipService.createTip({
      publicToken: testQr.public_token,
      amount: 100,
      paymentMethod: PaymentMethodType.IBAN_TRANSFER,
      customerName: 'Ahmet Yilmaz',
      customerMessage: 'Harika servis',
      idempotencyKey,
    });

    // Both should return the same tip ID
    expect(secondResult.tip.id).toBe(firstResult.tip.id);

    // Verify exactly ONE tip exists in DB
    const tipCount = await prisma.tip.count({
      where: { business_id: testBusiness.id, idempotency_key: idempotencyKey },
    });
    expect(tipCount).toBe(1);
  });

  it('should handle concurrent double-tap requests with same idempotencyKey gracefully without race condition', async () => {
    const idempotencyKey = `idem-concurrent-${Date.now()}`;

    // Execute 3 concurrent requests at the exact same millisecond
    const [res1, res2, res3] = await Promise.all([
      tipService.createTip({
        publicToken: testQr.public_token,
        amount: 250,
        paymentMethod: PaymentMethodType.IBAN_TRANSFER,
        idempotencyKey,
      }),
      tipService.createTip({
        publicToken: testQr.public_token,
        amount: 250,
        paymentMethod: PaymentMethodType.IBAN_TRANSFER,
        idempotencyKey,
      }),
      tipService.createTip({
        publicToken: testQr.public_token,
        amount: 250,
        paymentMethod: PaymentMethodType.IBAN_TRANSFER,
        idempotencyKey,
      }),
    ]);

    expect(res1.tip.id).toBe(res2.tip.id);
    expect(res2.tip.id).toBe(res3.tip.id);

    const count = await prisma.tip.count({
      where: { business_id: testBusiness.id, idempotency_key: idempotencyKey },
    });
    expect(count).toBe(1);
  });

  it('should sanitize customerName and customerMessage against script and HTML injection', async () => {
    const maliciousPayload = "<script>alert('XSS')</script><b>John Doe</b>";
    const maliciousMessage = "<img src=x onerror=alert('hacked')>Harika servis! <a href='javascript:void(0)'>Link</a>";

    const result = await tipService.createTip({
      publicToken: testQr.public_token,
      amount: 75,
      paymentMethod: PaymentMethodType.IBAN_TRANSFER,
      customerName: maliciousPayload,
      customerMessage: maliciousMessage,
    });

    const savedTip = await prisma.tip.findUnique({
      where: { id: result.tip.id },
    });

    expect(savedTip?.customer_name).not.toContain('<script>');
    expect(savedTip?.customer_name).not.toContain('</script>');
    expect(savedTip?.customer_name).not.toContain('<b>');
    expect(savedTip?.customer_name).toBe("alert('XSS')John Doe");

    expect(savedTip?.customer_message).not.toContain('<img');
    expect(savedTip?.customer_message).not.toContain('javascript:');
    expect(savedTip?.customer_message).toContain('Harika servis!');
  });
});
