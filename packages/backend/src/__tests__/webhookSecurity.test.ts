import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

/**
 * Timing-safe cryptographic HMAC-SHA256 signature verifier
 * with tolerance window against replay attacks.
 */
function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds: number = 300
): boolean {
  if (!signatureHeader || !secret) {
    throw new Error('Signature header and secret are required');
  }

  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='))?.split('=')[1];
  const v1Signature = parts.find((p) => p.startsWith('v1='))?.split('=')[1];

  if (!timestampPart || !v1Signature) {
    throw new Error('Invalid signature header structure');
  }

  const eventTimestamp = parseInt(timestampPart, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (isNaN(eventTimestamp)) {
    throw new Error('Invalid timestamp in signature header');
  }

  // Check replay window (timestamp expired or drifted too far in the future)
  if (Math.abs(currentTimestamp - eventTimestamp) > toleranceSeconds) {
    throw new Error('Webhook timestamp expired or out of tolerance window (replay attack detected)');
  }

  const signedPayload = `${timestampPart}.${rawBody}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  const expectedBuffer = Buffer.from(expectedSig, 'utf8');
  const signatureBuffer = Buffer.from(v1Signature, 'utf8');

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error('Invalid webhook signature');
  }

  return true;
}

describe('Payment Webhook Cryptographic Security & Anti-Replay Engine', () => {
  const mockSecret = 'whsec_enterprise_top_secret_key_84920';
  const validPayload = JSON.stringify({
    id: 'evt_test_123',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test_456', amount: 5000, currency: 'eur', status: 'succeeded' } },
  });

  it('successfully validates authentic signature within valid tolerance window', () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${currentTimestamp}.${validPayload}`;
    const validSig = crypto.createHmac('sha256', mockSecret).update(signedPayload).digest('hex');
    const header = `t=${currentTimestamp},v1=${validSig}`;

    const isValid = verifyWebhookSignature(validPayload, header, mockSecret, 300);
    expect(isValid).toBe(true);
  });

  it('rejects replay attack with timestamp older than 300 seconds', () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const signedPayload = `${oldTimestamp}.${validPayload}`;
    const sig = crypto.createHmac('sha256', mockSecret).update(signedPayload).digest('hex');
    const header = `t=${oldTimestamp},v1=${sig}`;

    expect(() => verifyWebhookSignature(validPayload, header, mockSecret, 300)).toThrow(
      /replay attack detected/
    );
  });

  it('rejects future timestamp drift greater than tolerance', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 500; // 500 seconds into future
    const signedPayload = `${futureTimestamp}.${validPayload}`;
    const sig = crypto.createHmac('sha256', mockSecret).update(signedPayload).digest('hex');
    const header = `t=${futureTimestamp},v1=${sig}`;

    expect(() => verifyWebhookSignature(validPayload, header, mockSecret, 300)).toThrow(
      /replay attack detected/
    );
  });

  it('rejects tampered payload body when signature was generated from different data', () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${currentTimestamp}.${validPayload}`;
    const validSig = crypto.createHmac('sha256', mockSecret).update(signedPayload).digest('hex');
    const header = `t=${currentTimestamp},v1=${validSig}`;

    const tamperedPayload = JSON.stringify({
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_456', amount: 999999, currency: 'eur', status: 'succeeded' } },
    });

    expect(() => verifyWebhookSignature(tamperedPayload, header, mockSecret, 300)).toThrow(
      /Invalid webhook signature/
    );
  });

  it('rejects forged signature using timing-safe buffer comparison', () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const fakeSig = 'a'.repeat(64);
    const header = `t=${currentTimestamp},v1=${fakeSig}`;

    expect(() => verifyWebhookSignature(validPayload, header, mockSecret, 300)).toThrow(
      /Invalid webhook signature/
    );
  });

  it('rejects malformed header missing t= or v1=', () => {
    expect(() => verifyWebhookSignature(validPayload, 'malformed-header', mockSecret, 300)).toThrow(
      /Invalid signature header structure/
    );
  });
});
