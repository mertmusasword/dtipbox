import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyTurnstileToken, TURNSTILE_NETWORK_ERROR } from '../utils/turnstile';

describe('verifyTurnstileToken (fail-closed)', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects when the network request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')));
    const result = await verifyTurnstileToken('tok', '1.1.1.1');
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain(TURNSTILE_NETWORK_ERROR);
  });

  it('rejects when Cloudflare answers with a non-2xx status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ success: true }) }));
    const result = await verifyTurnstileToken('tok');
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain(TURNSTILE_NETWORK_ERROR);
  });

  it('rejects when the response body is not valid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json'); } }));
    const result = await verifyTurnstileToken('tok');
    expect(result.success).toBe(false);
  });

  it('accepts when Cloudflare confirms the token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, hostname: 'naponi.com' }) }));
    const result = await verifyTurnstileToken('tok');
    expect(result.success).toBe(true);
    expect(result.hostname).toBe('naponi.com');
  });

  it('rejects when Cloudflare says the token is invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }) }));
    const result = await verifyTurnstileToken('tok');
    expect(result.success).toBe(false);
    expect(result.errorCodes).toEqual(['invalid-input-response']);
  });

  it('rejects an empty token without calling Cloudflare', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await verifyTurnstileToken('   ');
    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
