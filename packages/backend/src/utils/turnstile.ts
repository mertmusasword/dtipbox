/**
 * Cloudflare Turnstile Server-Side Verification Utility
 * Validates invisible/managed CAPTCHA response tokens with Cloudflare API.
 */

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
// Cloudflare official dummy secret key for testing (always passes)
const DEFAULT_SECRET_KEY = '1x0000000000000000000000000000000AA';

/** Error code returned when Cloudflare could not be reached or answered abnormally. */
export const TURNSTILE_NETWORK_ERROR = 'network-error';

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  challengeTs?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || DEFAULT_SECRET_KEY;

  // In test environment or development without explicit key, allow bypass
  if ((process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') && (!token || token === 'test-token')) {
    return { success: true };
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      success: false,
      errorCodes: ['missing-input-response'],
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Turnstile siteverify responded with HTTP ${res.status}`);
    }

    const outcome = (await res.json()) as Record<string, any>;
    return {
      success: Boolean(outcome.success),
      errorCodes: outcome['error-codes'],
      challengeTs: outcome.challenge_ts,
      hostname: outcome.hostname,
    };
  } catch (error: any) {
    console.error('[Turnstile] Verification API request error:', error);
    // Fail closed: if Cloudflare cannot be reached we cannot prove the request is human,
    // so an attacker must not be able to bypass the CAPTCHA by forcing an upstream failure.
    return {
      success: false,
      errorCodes: [TURNSTILE_NETWORK_ERROR],
    };
  } finally {
    clearTimeout(timeout);
  }
}
