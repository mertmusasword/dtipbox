import crypto from 'crypto';
import { env } from '../config/env';

// Derive 32-byte encryption key deterministically from JWT_SECRET
const ENCRYPTION_SALT = 'naponi-credential-enc-salt-v1';
const KEY = crypto.scryptSync(env.JWT_SECRET, ENCRYPTION_SALT, 32);

/**
 * Encrypt arbitrary JSON object using AES-256-GCM.
 * Output format: iv:authTag:encryptedContent
 */
export function encryptJson(data: object): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted string back to JSON.
 */
export function decryptJson<T = any>(ciphertext: string): T | null {
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      return null;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err: any) {
    console.error('[CryptoUtil] Decryption failed:', err.message);
    return null;
  }
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
