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
});
