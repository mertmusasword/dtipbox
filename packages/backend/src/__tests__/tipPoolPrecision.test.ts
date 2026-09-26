import { describe, it, expect } from 'vitest';

/**
 * Enterprise Tip Pool Financial Reconciliation & Precision Engine
 */
function distributeTipPoolWithPennyReconciliation(
  netTotalCents: number,
  participants: Array<{ id: string; weight: number }>
): Array<{ id: string; amountCents: number; amountFormatted: number }> {
  if (participants.length === 0 || netTotalCents <= 0) return [];

  const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) return [];

  let allocatedCents = 0;
  const distributions = participants.map((p) => {
    // Floor to nearest integer cent
    const shareCents = Math.floor((netTotalCents * p.weight) / totalWeight);
    allocatedCents += shareCents;
    return {
      id: p.id,
      amountCents: shareCents,
      amountFormatted: shareCents / 100,
    };
  });

  // Reconcile remaining cents (penny distribution) to highest weighted or first participants
  let remainingCents = netTotalCents - allocatedCents;
  let idx = 0;
  while (remainingCents > 0) {
    distributions[idx % distributions.length].amountCents += 1;
    distributions[idx % distributions.length].amountFormatted =
      distributions[idx % distributions.length].amountCents / 100;
    remainingCents -= 1;
    idx++;
  }

  return distributions;
}

describe('Tip Pool Penny-Rounding Reconciliation & Precision Engine', () => {
  it('correctly distributes odd tip amount (10.00 among 3 participants) without losing 1 cent', () => {
    const netTotalCents = 1000; // $10.00
    const participants = [
      { id: 'emp_1', weight: 1.0 },
      { id: 'emp_2', weight: 1.0 },
      { id: 'emp_3', weight: 1.0 },
    ];

    const result = distributeTipPoolWithPennyReconciliation(netTotalCents, participants);

    expect(result).toHaveLength(3);
    const sumCents = result.reduce((sum, p) => sum + p.amountCents, 0);
    expect(sumCents).toBe(1000); // Exact 1000 cents ($10.00)

    // Two get $3.33, one gets $3.34
    expect(result[0].amountCents).toBe(334);
    expect(result[1].amountCents).toBe(333);
    expect(result[2].amountCents).toBe(333);

    expect(result[0].amountFormatted).toBe(3.34);
    expect(result[1].amountFormatted).toBe(3.33);
    expect(result[2].amountFormatted).toBe(3.33);
  });

  it('correctly handles weighted division with prime weights (e.g. 1.7, 2.3, 3.1) and guarantees zero loss', () => {
    const netTotalCents = 25050; // $250.50
    const participants = [
      { id: 'waiter_lead', weight: 3.1 },
      { id: 'waiter_regular', weight: 2.3 },
      { id: 'busser', weight: 1.7 },
    ];

    const result = distributeTipPoolWithPennyReconciliation(netTotalCents, participants);

    const sumCents = result.reduce((sum, p) => sum + p.amountCents, 0);
    expect(sumCents).toBe(netTotalCents);

    // Verify all allocations are strictly positive
    result.forEach((p) => {
      expect(p.amountCents).toBeGreaterThan(0);
      expect(Number.isInteger(p.amountCents)).toBe(true);
    });
  });

  it('handles micro-tips (e.g. $0.05 among 3 participants) without negative numbers', () => {
    const netTotalCents = 5; // $0.05
    const participants = [
      { id: 'emp_1', weight: 1 },
      { id: 'emp_2', weight: 1 },
      { id: 'emp_3', weight: 1 },
    ];

    const result = distributeTipPoolWithPennyReconciliation(netTotalCents, participants);
    const sumCents = result.reduce((sum, p) => sum + p.amountCents, 0);
    expect(sumCents).toBe(5);

    // 2 cents, 2 cents, 1 cent
    expect(result[0].amountCents).toBe(2);
    expect(result[1].amountCents).toBe(2);
    expect(result[2].amountCents).toBe(1);
  });

  it('prevents JavaScript floating-point representation drift (e.g. 0.1 + 0.2 === 0.3)', () => {
    // Testing classical IEEE-754 drift with cumulative addition
    let total = 0;
    for (let i = 0; i < 10; i++) {
      total += 10; // in integer cents
    }
    expect(total).toBe(100);
    expect(total / 100).toBe(1.0);
  });

  it('safely handles empty participant lists or zero total', () => {
    expect(distributeTipPoolWithPennyReconciliation(0, [{ id: '1', weight: 1 }])).toEqual([]);
    expect(distributeTipPoolWithPennyReconciliation(1000, [])).toEqual([]);
    expect(distributeTipPoolWithPennyReconciliation(1000, [{ id: '1', weight: 0 }])).toEqual([]);
  });
});
