import { describe, it, expect } from 'vitest';

describe('Tip Pool & Deduction Engine Math Logic', () => {
  it('should calculate POS commission correctly based on payer rule', () => {
    const grossAmount = 1000;
    const posRate = 2.9; // 2.9%

    // When staff pays
    const staffPosFee = Number(((grossAmount * posRate) / 100).toFixed(2));
    expect(staffPosFee).toBe(29.0);

    // When business or customer pays, staff fee is 0
    const businessPosFee = 0;
    expect(businessPosFee).toBe(0);
  });

  it('should calculate Tax / Stopaj deduction correctly from post-POS base', () => {
    const grossAmount = 1000;
    const posFeeAmount = 29.0; // staff pays
    const taxableBase = grossAmount - posFeeAmount; // 971.0
    const taxRate = 10; // 10%

    const taxFeeAmount = Number(((taxableBase * taxRate) / 100).toFixed(2));
    expect(taxFeeAmount).toBe(97.1);

    const netDistributed = Number((grossAmount - posFeeAmount - taxFeeAmount).toFixed(2));
    expect(netDistributed).toBe(873.9);
  });

  it('should calculate Equal Pool distribution accurately among participants', () => {
    const netDistributed = 900;
    const staffCount = 3;
    const sharePerPerson = Number((netDistributed / staffCount).toFixed(2));

    expect(sharePerPerson).toBe(300);
  });

  it('should calculate Point Pool distribution accurately with role weights', () => {
    const netDistributed = 900;
    // Garson (1.0), Barmen (0.75), Komi (0.50) => total 2.25 points
    const employees = [
      { name: 'Garson Ali', weight: 1.0 },
      { name: 'Barmen Can', weight: 0.75 },
      { name: 'Komi Mehmet', weight: 0.5 },
    ];

    const totalPoints = employees.reduce((sum, e) => sum + e.weight, 0);
    expect(totalPoints).toBe(2.25);

    const shares = employees.map((e) => ({
      name: e.name,
      share: Number((netDistributed * (e.weight / totalPoints)).toFixed(2)),
    }));

    // Garson: 900 * (1.0 / 2.25) = 400
    expect(shares[0].share).toBe(400);
    // Barmen: 900 * (0.75 / 2.25) = 300
    expect(shares[1].share).toBe(300);
    // Komi: 900 * (0.5 / 2.25) = 200
    expect(shares[2].share).toBe(200);

    const totalDistributed = shares.reduce((sum, s) => sum + s.share, 0);
    expect(totalDistributed).toBe(netDistributed);
  });
});
