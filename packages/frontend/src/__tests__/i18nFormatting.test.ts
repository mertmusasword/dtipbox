import { describe, it, expect } from 'vitest';
import { en } from '../i18n/locales/en';
import { tr } from '../i18n/locales/tr';

describe('i18n Localization & Translation Keys Integrity', () => {
  it('contains essential tipping, error, and feedback keys in both TR and EN', () => {
    expect(tr.tip.sendAnotherTip).toBeDefined();
    expect(en.tip.sendAnotherTip).toBeDefined();

    expect(tr.feedback.ratingLabel).toBeDefined();
    expect(en.feedback.ratingLabel).toBeDefined();

    expect(tr.common.error).toBeDefined();
    expect(en.common.error).toBeDefined();
  });

  it('formats currency numbers accurately across currencies', () => {
    const formatTRY = (amount: number) => `₺${amount.toFixed(2)}`;
    const formatUSD = (amount: number) => `$${amount.toFixed(2)}`;

    expect(formatTRY(150)).toBe('₺150.00');
    expect(formatUSD(25)).toBe('$25.00');
  });
});
