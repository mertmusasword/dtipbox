import crypto from 'crypto';
import { env } from '../config/env';

// Dedicated salt for ENCRYPTION_KEY derivation
const DEDICATED_SALT = 'naponi-dedicated-enc-salt-v2';

// Legacy salt used previously when encryption key was derived from JWT_SECRET
const LEGACY_ENCRYPTION_SALT = 'naponi-credential-enc-salt-v1';

/**
 * Derives a 32-byte AES-256 key from the independent ENCRYPTION_KEY.
 */
function getPrimaryKey(): Buffer {
  const rawKey = env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-min!';
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }
  return crypto.scryptSync(rawKey, DEDICATED_SALT, 32);
}

/**
 * Derives legacy 32-byte key from JWT_SECRET for backward-compatible decryption
 * of existing records in the database.
 */
function getLegacyKey(): Buffer | null {
  if (!env.JWT_SECRET) return null;
  try {
    return crypto.scryptSync(env.JWT_SECRET, LEGACY_ENCRYPTION_SALT, 32);
  } catch {
    return null;
  }
}

/**
 * Internal helper to attempt AES-256-GCM decryption with a specific 32-byte key.
 */
function tryDecryptWithKey(ciphertext: string, key: Buffer): any | null {
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      return null;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

/**
 * Encrypt arbitrary JSON object using AES-256-GCM with the dedicated ENCRYPTION_KEY.
 * Output format: iv:authTag:encryptedContent
 */
export function encryptJson(data: object): string {
  const key = getPrimaryKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted string back to JSON.
 * Step 1: Attempt decryption with primary dedicated ENCRYPTION_KEY.
 * Step 2 (Backward compatibility): If primary fails, attempt with legacy JWT_SECRET-derived key.
 * This guarantees zero data loss for existing encrypted database records.
 */
export function decryptJson<T = any>(ciphertext: string): T | null {
  if (!ciphertext || typeof ciphertext !== 'string') {
    return null;
  }

  // 1. Try primary dedicated ENCRYPTION_KEY
  const primaryResult = tryDecryptWithKey(ciphertext, getPrimaryKey());
  if (primaryResult !== null) {
    return primaryResult;
  }

  // 2. Backward compatibility fallback: Try legacy JWT_SECRET-derived key
  const legacyKey = getLegacyKey();
  if (legacyKey) {
    const legacyResult = tryDecryptWithKey(ciphertext, legacyKey);
    if (legacyResult !== null) {
      return legacyResult;
    }
  }

  return null;
}

/**
 * Checks if a given ciphertext was encrypted with the legacy JWT_SECRET-derived key.
 */
export function isLegacyEncrypted(ciphertext: string): boolean {
  if (tryDecryptWithKey(ciphertext, getPrimaryKey()) !== null) {
    return false;
  }
  const legacyKey = getLegacyKey();
  return legacyKey !== null && tryDecryptWithKey(ciphertext, legacyKey) !== null;
}

/**
 * Re-encrypts a legacy-encrypted string with the new dedicated ENCRYPTION_KEY.
 */
export function migrateEncryptedPayload(ciphertext: string): string | null {
  const data = decryptJson(ciphertext);
  if (!data) return null;
  return encryptJson(data);
}

/**
 * Mask credential values so raw secrets are never sent to clients or logged.
 * Keeps last 4 chars if length >= 8, otherwise replaces with asterisks.
 */
export function maskCredentials(credentials: Record<string, any> | null | undefined): Record<string, any> {
  if (!credentials || typeof credentials !== 'object') {
    return {};
  }

  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value === 'string') {
      const val = value.trim();
      if (val.length <= 4) {
        masked[key] = '••••••••';
      } else {
        masked[key] = `••••••••${val.slice(-4)}`;
      }
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      masked[key] = value;
    } else {
      masked[key] = '••••••••';
    }
  }

  return masked;
}
