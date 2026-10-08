import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/turnstile', () => ({
  verifyTurnstileToken: vi.fn(),
}));

import { requireTurnstile } from '../middleware/turnstile.middleware';
import { verifyTurnstileToken } from '../utils/turnstile';

const mockedVerify = vi.mocked(verifyTurnstileToken);

function run(
  middleware: ReturnType<typeof requireTurnstile>,
  reqOverrides: Record<string, any> = {}
) {
  const result: { status?: number; body?: any; nextCalled: boolean; nextArg?: any } = { nextCalled: false };
  const req: any = { body: {}, ip: '1.2.3.4', socket: {}, ...reqOverrides };
  const res: any = {
    status: (code: number) => {
      result.status = code;
      return { json: (data: any) => { result.body = data; } };
    },
  };
  const next = (arg?: any) => {
    result.nextCalled = true;
    result.nextArg = arg;
  };
  return middleware(req, res, next).then(() => result);
}

describe('requireTurnstile middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockedVerify.mockReset();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('rejects missing token with 400 in production', async () => {
    process.env.NODE_ENV = 'production';
    const r = await run(requireTurnstile());
    expect(r.status).toBe(400);
    expect(r.body.success).toBe(false);
    expect(r.nextCalled).toBe(false);
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('allows missing token outside production', async () => {
    process.env.NODE_ENV = 'test';
    const r = await run(requireTurnstile());
    expect(r.nextCalled).toBe(true);
    expect(r.status).toBeUndefined();
  });

  it('rejects an invalid token with 403', async () => {
    process.env.NODE_ENV = 'production';
    mockedVerify.mockResolvedValue({ success: false });
    const r = await run(requireTurnstile(), { body: { turnstileToken: 'bad' } });
    expect(r.status).toBe(403);
    expect(r.nextCalled).toBe(false);
    expect(mockedVerify).toHaveBeenCalledWith('bad', '1.2.3.4');
  });

  it('passes a valid token', async () => {
    process.env.NODE_ENV = 'production';
    mockedVerify.mockResolvedValue({ success: true });
    const r = await run(requireTurnstile(), { body: { turnstileToken: 'good' } });
    expect(r.nextCalled).toBe(true);
    expect(r.status).toBeUndefined();
  });

  it('lets honeypot submissions through so the handler can fake success', async () => {
    process.env.NODE_ENV = 'production';
    const r = await run(requireTurnstile(), { body: { website_url_hp: 'spam' } });
    expect(r.nextCalled).toBe(true);
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('skips verification for authenticated users when skipIfAuthenticated is set', async () => {
    process.env.NODE_ENV = 'production';
    const r = await run(requireTurnstile({ skipIfAuthenticated: true }), { user: { id: 'u1' } });
    expect(r.nextCalled).toBe(true);
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('still enforces unauthenticated requests when skipIfAuthenticated is set', async () => {
    process.env.NODE_ENV = 'production';
    const r = await run(requireTurnstile({ skipIfAuthenticated: true }));
    expect(r.status).toBe(400);
  });

  it('forwards unexpected errors to next()', async () => {
    process.env.NODE_ENV = 'production';
    const boom = new Error('boom');
    mockedVerify.mockRejectedValue(boom);
    const r = await run(requireTurnstile(), { body: { turnstileToken: 'x' } });
    expect(r.nextCalled).toBe(true);
    expect(r.nextArg).toBe(boom);
  });
});
