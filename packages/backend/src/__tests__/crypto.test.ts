import { describe, it, expect } from 'vitest';
import { encryptJson, decryptJson, maskCredentials } from '../utils/crypto.util';
import { generatePublicToken, generateShortToken } from '../utils/token';

describe('Crypto & Security Utilities', () => {
  it('should encrypt and decrypt JSON data correctly with AES-256-GCM', () => {
    const sensitivePayload = {
      apiKey: 'sk_live_999888777666555',
      secret: 'super_secret_webhook_key_xyz',
      merchantId: 12345,
    };

    const ciphertext = encryptJson(sensitivePayload);
    expect(ciphertext).toBeDefined();
    expect(ciphertext).toContain(':');
    expect(ciphertext.split(':')).toHaveLength(3); // iv:authTag:content

    const decrypted = decryptJson<typeof sensitivePayload>(ciphertext);
    expect(decrypted).toEqual(sensitivePayload);
  });

  it('should return null and not crash if ciphertext is tampered with', () => {
    const sensitivePayload = { key: 'secret_value' };
    const ciphertext = encryptJson(sensitivePayload);
    const parts = ciphertext.split(':');
    
    // Corrupt encrypted payload
    const corrupted = `${parts[0]}:${parts[1]}:badhex123`;
    const result = decryptJson(corrupted);
    expect(result).toBeNull();
  });

  it('should securely mask sensitive credentials for client-safe responses', () => {
    const creds = {
      publishableKey: 'pk_live_1234567890abcdef',
      secretKey: 'sk_live_secretkey999',
      shortKey: 'abc',
      isEnabled: true,
      retryCount: 3,
    };

    const masked = maskCredentials(creds);
    expect(masked.publishableKey).toBe('••••••••cdef');
    expect(masked.secretKey).toBe('••••••••y999');
    expect(masked.shortKey).toBe('••••••••');
    expect(masked.isEnabled).toBe(true);
    expect(masked.retryCount).toBe(3);
  });

  it('should generate cryptographically secure unique public tokens', () => {
    const token1 = generatePublicToken(32);
    const token2 = generatePublicToken(32);

    expect(token1).toHaveLength(64); // 32 bytes hex = 64 chars
    expect(token2).toHaveLength(64);
    expect(token1).not.toEqual(token2);

    const shortToken = generateShortToken();
    expect(shortToken).toBeDefined();
    expect(shortToken.length).toBeGreaterThan(10);
  });

  it('should seamlessly decrypt legacy data encrypted with JWT_SECRET-derived key (backward compatibility)', async () => {
    const cryptoModule = await import('crypto');
    const { env } = await import('../config/env');
    const { isLegacyEncrypted, migrateEncryptedPayload } = await import('../utils/crypto.util');

    const legacyPayload = {
      provider: 'iyzico',
      legacyApiKey: 'legacy_key_12345',
      legacySecret: 'legacy_secret_abcde',
    };

    // Manually create legacy ciphertext using the old derivation method (scryptSync with env.JWT_SECRET)
    const legacySalt = 'naponi-credential-enc-salt-v1';
    const legacyKey = cryptoModule.default.scryptSync(env.JWT_SECRET, legacySalt, 32);
    const iv = cryptoModule.default.randomBytes(16);
    const cipher = cryptoModule.default.createCipheriv('aes-256-gcm', legacyKey, iv);
    let enc = cipher.update(JSON.stringify(legacyPayload), 'utf8', 'hex');
    enc += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const legacyCiphertext = `${iv.toString('hex')}:${authTag.toString('hex')}:${enc}`;

    // 1. Verify decryptJson can decrypt legacy ciphertext without errors
    const decrypted = decryptJson<typeof legacyPayload>(legacyCiphertext);
    expect(decrypted).toEqual(legacyPayload);

    // 2. Verify isLegacyEncrypted detects legacy ciphertext
    expect(isLegacyEncrypted(legacyCiphertext)).toBe(true);

    // 3. Verify migrateEncryptedPayload re-encrypts with primary ENCRYPTION_KEY
    const migrated = migrateEncryptedPayload(legacyCiphertext);
    expect(migrated).not.toBeNull();
    expect(isLegacyEncrypted(migrated!)).toBe(false);

    // 4. Verify migrated ciphertext decrypts to exact original payload
    const decryptedMigrated = decryptJson<typeof legacyPayload>(migrated!);
    expect(decryptedMigrated).toEqual(legacyPayload);
  });
});
