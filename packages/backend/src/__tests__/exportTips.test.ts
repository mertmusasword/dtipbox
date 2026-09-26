import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportTipsCsv } from '../services/analytics.service';
import prisma from '../utils/prisma';
import { PaymentStatus } from '@prisma/client';

vi.mock('../utils/prisma', () => ({
  default: {
    business: {
      findUnique: vi.fn(),
    },
    employee: {
      findMany: vi.fn(),
    },
    tip: {
      findMany: vi.fn(),
    },
  },
}));

describe('Financial Export Engine (Excel / CSV)', () => {
  const mockBusiness = {
    id: 'biz-123',
    name: 'Naponi Bistro & Lounge',
    currency: 'EUR',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.business.findUnique as any).mockResolvedValue(mockBusiness);
  });

  it('prepends UTF-8 BOM (\\uFEFF) for native Excel compatibility', async () => {
    (prisma.tip.findMany as any).mockResolvedValue([]);

    const result = await exportTipsCsv('biz-123', { type: 'transactions' });

    expect(result.csv.startsWith('\uFEFF')).toBe(true);
    expect(result.filename).toContain('Naponi_Bistro');
    expect(result.filename).toContain('Bahsis_Islem_Raporu');
    expect(result.filename.endsWith('.csv')).toBe(true);
  });

  it('exports transactions with correct headers, semi-colon delimiter, and values', async () => {
    const mockTips = [
      {
        id: 'tip-001',
        amount: 25.5,
        currency: 'EUR',
        payment_method: 'CREDIT_CARD',
        payment_status: PaymentStatus.SUCCESS,
        created_at: new Date('2026-09-26T19:30:00Z'),
        provider_transaction_id: 'REF-99881',
        employee: { first_name: 'Ahmet', last_name: 'Yılmaz' },
        table: { name: 'Masa 4' },
      },
      {
        id: 'tip-002',
        amount: 15.0,
        currency: 'EUR',
        payment_method: 'APPLE_PAY',
        payment_status: PaymentStatus.SUCCESS,
        created_at: new Date('2026-09-26T20:15:00Z'),
        transfer_reference_code: null,
        employee: null,
        table: null,
      },
    ];

    (prisma.tip.findMany as any).mockResolvedValue(mockTips);

    const result = await exportTipsCsv('biz-123', {
      type: 'transactions',
      delimiter: ';',
    });

    const lines = result.csv.replace('\uFEFF', '').split('\r\n');
    expect(lines.length).toBe(3); // Header + 2 rows

    // Header check
    expect(lines[0]).toBe(
      'İşlem ID;Tarih;Saat;Tutar (EUR);Para Birimi;Ödeme Yöntemi;Durum;Personel;Masa / Alan;Referans Kodu'
    );

    // Row 1 check
    expect(lines[1]).toContain('"tip-001"');
    expect(lines[1]).toContain('25.50');
    expect(lines[1]).toContain('"EUR"');
    expect(lines[1]).toContain('"Ahmet Yılmaz"');
    expect(lines[1]).toContain('"Masa 4"');
    expect(lines[1]).toContain('"REF-99881"');

    // Row 2 check (pool fallback)
    expect(lines[2]).toContain('"tip-002"');
    expect(lines[2]).toContain('15.00');
    expect(lines[2]).toContain('"İşletme Havuzu"');
    expect(lines[2]).toContain('"Genel"');
    expect(lines[2]).toContain('"—"');
  });

  it('supports comma delimiter when requested', async () => {
    (prisma.tip.findMany as any).mockResolvedValue([]);

    const result = await exportTipsCsv('biz-123', {
      type: 'transactions',
      delimiter: ',',
    });

    const lines = result.csv.replace('\uFEFF', '').split('\r\n');
    expect(lines[0]).toContain('İşlem ID,Tarih,Saat,Tutar (EUR)');
  });

  it('exports staff settlement breakdown with totals and averages', async () => {
    const mockEmployees = [
      {
        id: 'emp-1',
        first_name: 'Zeynep',
        last_name: 'Kaya',
        position: 'Kıdemli Garson',
        tips: [{ amount: 40 }, { amount: 60 }],
      },
      {
        id: 'emp-2',
        first_name: 'Can',
        last_name: null,
        position: null,
        tips: [],
      },
    ];

    (prisma.employee.findMany as any).mockResolvedValue(mockEmployees);

    const result = await exportTipsCsv('biz-123', {
      type: 'staff',
      delimiter: ';',
    });

    expect(result.filename).toContain('Personel_Hakedis');
    const lines = result.csv.replace('\uFEFF', '').split('\r\n');
    expect(lines.length).toBe(3); // Header + 2 staff

    // Header check
    expect(lines[0]).toBe(
      'Personel Adı;Pozisyon / Görev;Bahşiş Adedi;Toplam Tutar (EUR);Ortalama Bahşiş (EUR)'
    );

    // Row 1 (Zeynep: 2 tips, 100.00 total, 50.00 avg)
    expect(lines[1]).toBe('"Zeynep Kaya";"Kıdemli Garson";2;100.00;50.00');

    // Row 2 (Can: 0 tips, 0.00 total, 0.00 avg, default position)
    expect(lines[2]).toBe('"Can";"Servis Ekibi";0;0.00;0.00');
  });
});
