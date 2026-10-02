/**
 * Cloudflare Turnstile Server-Side Verification Utility
 * Validates invisible/managed CAPTCHA response tokens with Cloudflare API.
 */

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const DEFAULT_SECRET_KEY = '0x4AAAAAAFL2TnlPFAIAS5WzAZR--2lzjJc';

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

  // In test environment or if secret key is omitted, allow bypass
  if (process.env.NODE_ENV === 'test' && !token) {
    return { success: true };
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      success: false,
      errorCodes: ['missing-input-response'],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const outcome = (await res.json()) as Record<string, any>;
    return {
      success: Boolean(outcome.success),
      errorCodes: outcome['error-codes'],
      challengeTs: outcome.challenge_ts,
      hostname: outcome.hostname,
    };
  } catch (error: any) {
    console.error('[Turnstile] Verification API request error:', error);
    // On unexpected upstream network error, fail closed or open based on policy
    return {
      success: true, // Allow fallback if Cloudflare verification endpoint is unreachable
      errorCodes: ['network-error-fallback'],
    };
  }
}
