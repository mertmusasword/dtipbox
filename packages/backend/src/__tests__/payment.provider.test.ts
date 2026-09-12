import { describe, it, expect } from 'vitest';
import { GLOBAL_PROVIDER_CATALOG } from '../services/payment/core/providerRegistry';

describe('Payment Provider Registry & Calculations', () => {
  it('should include Stripe with active status and global capabilities', () => {
    const stripe = GLOBAL_PROVIDER_CATALOG.find((p) => p.id === 'stripe');
    expect(stripe).toBeDefined();
    expect(stripe?.status).toBe('ACTIVE');
    expect(stripe?.has_adapter).toBe(true);
    expect(stripe?.supported_currencies).toContain('TRY');
    expect(stripe?.supported_currencies).toContain('USD');
    expect(stripe?.supported_currencies).toContain('EUR');
    expect(stripe?.capabilities).toContain('CREATE_PAYMENT');
  });

  it('should catalog Turkish virtual POS providers with correct regional metadata', () => {
    const paytr = GLOBAL_PROVIDER_CATALOG.find((p) => p.id === 'paytr');
    const iyzico = GLOBAL_PROVIDER_CATALOG.find((p) => p.id === 'iyzico');

    expect(paytr).toBeDefined();
    expect(paytr?.countries).toContain('TR');
    expect(paytr?.supported_currencies).toContain('TRY');

    expect(iyzico).toBeDefined();
    expect(iyzico?.countries).toContain('TR');
    expect(iyzico?.supported_currencies).toContain('TRY');
  });

  it('should calculate tip commission and net amounts accurately without floating point drift', () => {
    const calculateTipSplit = (amount: number, feePercent: number = 2.9, fixedFee: number = 0.3) => {
      if (amount <= 0) throw new Error('Amount must be positive');
      const fee = Math.round((amount * (feePercent / 100) + fixedFee) * 100) / 100;
      const net = Math.round((amount - fee) * 100) / 100;
      return { fee, net };
    };

    // 100 TL tip with 2.9% + 0.30 TL fee
    const res1 = calculateTipSplit(100);
    expect(res1.fee).toBe(3.20);
    expect(res1.net).toBe(96.80);
    expect(res1.fee + res1.net).toBe(100);

    // 50 USD tip with 2.9% + 0.30 USD fee
    const res2 = calculateTipSplit(50);
    expect(res2.fee).toBe(1.75);
    expect(res2.net).toBe(48.25);
    expect(res2.fee + res2.net).toBe(50);

    // Zero or negative should throw
    expect(() => calculateTipSplit(0)).toThrow();
    expect(() => calculateTipSplit(-10)).toThrow();
  });
});
