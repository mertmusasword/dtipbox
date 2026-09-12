import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Password Reset Token Logic', () => {
  it('should generate 32-byte secure random tokens and correctly hash with SHA-256', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    expect(rawToken).toHaveLength(64);

    const tokenHash1 = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenHash2 = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Deterministic hashing check
    expect(tokenHash1).toHaveLength(64);
    expect(tokenHash1).toEqual(tokenHash2);

    // Hash should not equal raw token
    expect(tokenHash1).not.toEqual(rawToken);
  });

  it('should accurately calculate 1-hour expiration timestamp', () => {
    const before = Date.now();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const after = Date.now();

    const diffMs = expiresAt.getTime() - before;
    expect(diffMs).toBeGreaterThanOrEqual(3600000);
    expect(diffMs).toBeLessThanOrEqual(3600000 + (after - before));
  });

  it('should validate password length constraints correctly', () => {
    const isValidPassword = (pwd: string) => typeof pwd === 'string' && pwd.length >= 8 && pwd.length <= 128;

    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('SecureP@ssword2026!')).toBe(true);
    expect(isValidPassword('a'.repeat(129))).toBe(false);
  });
});
