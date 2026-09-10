import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token.
 * Used for QR public tokens — never sequential IDs.
 */
export function generatePublicToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a shorter but still secure token for URLs.
 * 16 bytes = 32 hex chars — secure and URL-friendly.
 */
export function generateShortToken(): string {
  return crypto.randomBytes(16).toString('base64url');
}
