import { describe, it, expect } from 'vitest';
import { PaymentStatus } from '@prisma/client';

describe('GET /api/business/tips Query Sanitization Logic', () => {
  function buildTipsWhereClause(businessId: string, status?: string) {
    const where: any = { business_id: businessId };
    const rawStatus = typeof status === 'string' ? status.trim().toUpperCase() : undefined;

    if (rawStatus && rawStatus !== 'ALL') {
      if (rawStatus === 'UNVERIFIED_OR_PENDING' || rawStatus === 'UNVERIFIED') {
        where.payment_status = { in: ['UNVERIFIED', 'PENDING'] };
        where.OR = [
          { payment_method: { in: ['BANK_TRANSFER', 'IBAN', 'IBAN_TRANSFER', 'FAST', 'HAVALE', 'EFT'] } },
          { payment_method: { contains: 'IBAN', mode: 'insensitive' } },
          { payment_method: { contains: 'BANK', mode: 'insensitive' } },
          { payment_method: { contains: 'HAVALE', mode: 'insensitive' } },
        ];
      } else if (rawStatus === 'PENDING') {
        where.payment_status = 'PENDING';
      } else if (['SUCCESS', 'FAILED', 'CANCELLED'].includes(rawStatus)) {
        where.payment_status = rawStatus;
      }
    }
    return where;
  }

  it('safely handles missing or undefined status', () => {
    const where = buildTipsWhereClause('biz-1', undefined);
    expect(where).toEqual({ business_id: 'biz-1' });
    expect(where.payment_status).toBeUndefined();
  });

  it('safely ignores ALL or lowercase all', () => {
    expect(buildTipsWhereClause('biz-1', 'ALL')).toEqual({ business_id: 'biz-1' });
    expect(buildTipsWhereClause('biz-1', 'all')).toEqual({ business_id: 'biz-1' });
  });

  it('safely ignores invalid, rogue, or arbitrary strings without crashing Prisma validation', () => {
    // These previously caused PrismaClientValidationError
    const invalidStatuses = ['COMPLETED', 'PAID', 'undefined', 'null', 'INVALID_STATUS', '12345', ''];
    for (const invalid of invalidStatuses) {
      const where = buildTipsWhereClause('biz-1', invalid);
      expect(where.payment_status).toBeUndefined();
    }
  });

  it('correctly maps valid enum statuses', () => {
    expect(buildTipsWhereClause('biz-1', 'SUCCESS').payment_status).toBe('SUCCESS');
    expect(buildTipsWhereClause('biz-1', 'success').payment_status).toBe('SUCCESS');
    expect(buildTipsWhereClause('biz-1', 'FAILED').payment_status).toBe('FAILED');
    expect(buildTipsWhereClause('biz-1', 'CANCELLED').payment_status).toBe('CANCELLED');
    expect(buildTipsWhereClause('biz-1', 'PENDING').payment_status).toBe('PENDING');
  });

  it('correctly sets bank transfer multi-filter for UNVERIFIED_OR_PENDING and UNVERIFIED', () => {
    const whereUnverified = buildTipsWhereClause('biz-1', 'UNVERIFIED');
    expect(whereUnverified.payment_status).toEqual({ in: ['UNVERIFIED', 'PENDING'] });
    expect(whereUnverified.OR).toBeDefined();

    const wherePendingOrUnverified = buildTipsWhereClause('biz-1', 'unverified_or_pending');
    expect(wherePendingOrUnverified.payment_status).toEqual({ in: ['UNVERIFIED', 'PENDING'] });
    expect(wherePendingOrUnverified.OR).toBeDefined();
  });
});
