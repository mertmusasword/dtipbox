import { describe, it, expect } from 'vitest';
import { GLOBAL_POS_CATALOG } from '../services/pos/core/posCatalog';
import { posService } from '../services/pos/pos.service';
import { mockPosAdapter } from '../services/pos/adapters/mockPos.adapter';
import { encryptJson, decryptJson, maskCredentials } from '../utils/crypto.util';

describe('Global POS Integration Layer', () => {
  describe('Catalog & Regional Coverage', () => {
    it('should include key regional and global POS systems with correct country tags', () => {
      // US & Global
      const toast = GLOBAL_POS_CATALOG.find((p) => p.id === 'toast');
      const square = GLOBAL_POS_CATALOG.find((p) => p.id === 'square_pos');
      const clover = GLOBAL_POS_CATALOG.find((p) => p.id === 'clover');

      expect(toast).toBeDefined();
      expect(toast?.countries).toContain('US');
      expect(toast?.has_adapter).toBe(false); // Coming soon
      expect(toast?.status).toBe('COMING_SOON');

      expect(square).toBeDefined();
      expect(clover).toBeDefined();

      // Turkey
      const simpra = GLOBAL_POS_CATALOG.find((p) => p.id === 'simpra');
      const sambapos = GLOBAL_POS_CATALOG.find((p) => p.id === 'sambapos');
      expect(simpra).toBeDefined();
      expect(simpra?.countries).toContain('TR');
      expect(sambapos).toBeDefined();
      expect(sambapos?.countries).toContain('TR');

      // Gulf / MENA
      const foodics = GLOBAL_POS_CATALOG.find((p) => p.id === 'foodics');
      expect(foodics).toBeDefined();
      expect(foodics?.countries).toContain('AE');
      expect(foodics?.countries).toContain('SA');

      // China
      const meituan = GLOBAL_POS_CATALOG.find((p) => p.id === 'meituan_pos');
      expect(meituan).toBeDefined();
      expect(meituan?.countries).toContain('CN');

      // Europe
      const vectron = GLOBAL_POS_CATALOG.find((p) => p.id === 'vectron');
      expect(vectron).toBeDefined();
      expect(vectron?.countries).toContain('DE');
    });

    it('should filter catalog by country correctly', () => {
      const trCatalog = posService.getCatalog({ country: 'TR' });
      const trIds = trCatalog.map((p) => p.id);
      expect(trIds).toContain('simpra');
      expect(trIds).toContain('sambapos');
      expect(trIds).toContain('mock_pos'); // global
      expect(trIds).not.toContain('toast'); // US only

      const usCatalog = posService.getCatalog({ country: 'US' });
      const usIds = usCatalog.map((p) => p.id);
      expect(usIds).toContain('toast');
      expect(usIds).toContain('square_pos');
      expect(usIds).not.toContain('simpra');

      const cnCatalog = posService.getCatalog({ country: 'CN' });
      const cnIds = cnCatalog.map((p) => p.id);
      expect(cnIds).toContain('meituan_pos');
    });

    it('should filter catalog by search keyword', () => {
      const results = posService.getCatalog({ search: 'aloha' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('ncr_aloha');
    });
  });

  describe('Mock POS Sandbox Adapter', () => {
    it('should successfully test connection with sandbox credentials', async () => {
      const validTest = await mockPosAdapter.testConnection({ apiKey: 'mock_sandbox_key_123' });
      expect(validTest.success).toBe(true);
      expect(validTest.externalAccountId).toBe('sandbox_acc_001');

      const invalidTest = await mockPosAdapter.testConnection({ apiKey: 'invalid_key' });
      expect(invalidTest.success).toBe(false);
    });

    it('should retrieve mock locations and employees', async () => {
      const creds = { apiKey: 'mock_sandbox_key_123' };
      const locations = await mockPosAdapter.getLocations(creds);
      expect(locations.length).toBe(2);
      expect(locations[0].name).toBe('Main Dining Room & Terrace');

      const employees = await mockPosAdapter.getEmployees(creds);
      expect(employees.length).toBeGreaterThanOrEqual(3);
      expect(employees.some((e) => e.externalId === 'pos_emp_101')).toBe(true);
    });

    it('should perform sandbox data sync and return tip summaries', async () => {
      const creds = { apiKey: 'mock_sandbox_key_123' };
      const syncResult = await mockPosAdapter.sync(creds);

      expect(syncResult.recordsSynced).toBeGreaterThan(0);
      expect(syncResult.tipsImported).toBeGreaterThan(0);
      expect(syncResult.employeesFound).toBeGreaterThan(0);
      expect(syncResult.success).toBe(true);
    });
  });

  describe('POS Credential Encryption & Masking', () => {
    it('should securely encrypt and decrypt POS API keys', () => {
      const originalCredentials = {
        apiKey: 'toast_live_sec_99482910492810',
        restaurantId: 'rest_771829',
        webhookSecret: 'whsec_99218204921',
      };

      const encrypted = encryptJson(originalCredentials);
      expect(encrypted).not.toContain('toast_live_sec');

      const decrypted = decryptJson<typeof originalCredentials>(encrypted);
      expect(decrypted).not.toBeNull();
      expect(decrypted!.apiKey).toBe(originalCredentials.apiKey);
      expect(decrypted!.restaurantId).toBe(originalCredentials.restaurantId);
      expect(decrypted!.webhookSecret).toBe(originalCredentials.webhookSecret);
    });

    it('should mask sensitive credential fields for frontend display', () => {
      const credentials = {
        apiKey: 'toast_live_sec_99482910492810',
        restaurantId: 'rest_771829',
      };

      const masked = maskCredentials(credentials);
      expect(masked.apiKey).toContain('••••');
      expect(masked.apiKey).toContain('2810');
      expect(masked.apiKey).not.toBe(credentials.apiKey);
      expect(masked.restaurantId).toContain('••••');
      expect(masked.restaurantId).toContain('1829');
    });
  });
});
