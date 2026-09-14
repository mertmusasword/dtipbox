import { describe, it, expect } from 'vitest';
import { partnerService } from '../services/partner.service';

describe('Partner Applications Service Unit Tests', () => {
  it('should validate and reject missing required fields', async () => {
    await expect(
      partnerService.createPartnerApplication({
        companyName: '',
        contactName: 'Test Contact',
        email: 'test@pospartner.com',
        companyType: 'POS',
      })
    ).rejects.toThrow('Lütfen tüm zorunlu alanları');

    await expect(
      partnerService.createPartnerApplication({
        companyName: 'OmniPOS Inc.',
        contactName: '',
        email: 'test@pospartner.com',
        companyType: 'POS',
      })
    ).rejects.toThrow('Lütfen tüm zorunlu alanları');

    await expect(
      partnerService.createPartnerApplication({
        companyName: 'OmniPOS Inc.',
        contactName: 'Test Contact',
        email: '',
        companyType: 'POS',
      })
    ).rejects.toThrow('Lütfen tüm zorunlu alanları');

    await expect(
      partnerService.createPartnerApplication({
        companyName: 'OmniPOS Inc.',
        contactName: 'Test Contact',
        email: 'test@pospartner.com',
        companyType: '',
      })
    ).rejects.toThrow('Lütfen tüm zorunlu alanları');
  });
});
