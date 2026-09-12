import { describe, it, expect } from 'vitest';
import { emailService } from '../services/email.service';

describe('Email Service & Templates Suite', () => {
  it('should export emailService singleton instance', () => {
    expect(emailService).toBeDefined();
    expect(typeof emailService.sendPasswordResetEmail).toBe('function');
    expect(typeof emailService.sendBusinessWelcomeEmail).toBe('function');
    expect(typeof emailService.sendEmployeeWelcomeEmail).toBe('function');
    expect(typeof emailService.verifyConnection).toBe('function');
  });

  it('should handle simulated password reset email generation without throwing', async () => {
    const result = await emailService.sendPasswordResetEmail(
      'test@example.com',
      'https://www.naponi.com/reset-password?token=abcdef123456'
    );
    expect(result).toBe(true);
  });

  it('should handle simulated business welcome email without throwing', async () => {
    const result = await emailService.sendBusinessWelcomeEmail(
      'business@example.com',
      'Naponi Bistro & Lounge'
    );
    expect(result).toBe(true);
  });

  it('should handle simulated employee welcome email without throwing', async () => {
    const result = await emailService.sendEmployeeWelcomeEmail(
      'staff@example.com',
      'Ahmet Yılmaz',
      'Naponi Bistro & Lounge'
    );
    expect(result).toBe(true);
  });
});
