import { describe, it, expect } from 'vitest';
import { isOriginAllowed } from '../index';

describe('CORS Security Hardening', () => {
  it('should allow legitimate canonical production domains', () => {
    expect(isOriginAllowed('https://naponi.com')).toBe(true);
    expect(isOriginAllowed('https://www.naponi.com')).toBe(true);
    expect(isOriginAllowed('https://api.naponi.com')).toBe(true);
    expect(isOriginAllowed('https://admin.naponi.com')).toBe(true);
  });

  it('should strictly BLOCK phishing and substring matching domains', () => {
    // Attack domains that previously could bypass origin.includes('naponi.com')
    expect(isOriginAllowed('https://attacker-naponi.com')).toBe(false);
    expect(isOriginAllowed('https://naponi.com.evil.com')).toBe(false);
    expect(isOriginAllowed('https://fake-naponi.com')).toBe(false);
    expect(isOriginAllowed('https://naponicom.attacker.com')).toBe(false);
    expect(isOriginAllowed('https://evilnaponi.com')).toBe(false);
  });

  it('should BLOCK insecure plain HTTP origins in production', () => {
    expect(isOriginAllowed('http://naponi.com')).toBe(false);
    expect(isOriginAllowed('http://www.naponi.com')).toBe(false);
  });

  it('should allow localhost only in development mode', () => {
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
  });
});
