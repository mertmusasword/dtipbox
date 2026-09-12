import { describe, it, expect } from 'vitest';
import { emailService } from '../services/email.service';

describe('Email Service & Templates Suite', () => {
  it('should export emailService singleton instance', () => {
    expect(emailService).toBeDefined();
    expect(typeof emailService.sendPasswordResetEmail).toBe('function');
    expect(typeof emailService.sendBusinessWelcomeEmail).toBe('function');
    expect(typeof emailService.sendEmployeeWelcomeEmail).toBe('function');
    expect(typeof emailService.sendSupportTicketConfirmationEmail).toBe('function');
    expect(typeof emailService.sendSupportTicketAdminNotificationEmail).toBe('function');
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

  it('should handle simulated support ticket confirmation email without throwing', async () => {
    const result = await emailService.sendSupportTicketConfirmationEmail({
      to: 'customer@example.com',
      name: 'Mert Kılıç',
      ticketId: 'clx123456789',
      subject: 'POS Entegrasyonu Hk.',
      category: 'POS_INTEGRATION',
      message: 'Masaüstü QR kodlarımızı POS ile bağlamak istiyoruz.',
      businessName: 'Naponi Bistro',
    });
    expect(result).toBe(true);
  });

  it('should handle simulated support ticket admin notification email without throwing', async () => {
    const result = await emailService.sendSupportTicketAdminNotificationEmail({
      name: 'Mert Kılıç',
      email: 'customer@example.com',
      phone: '+905551234567',
      businessName: 'Naponi Bistro',
      ticketId: 'clx123456789',
      subject: 'POS Entegrasyonu Hk.',
      category: 'POS_INTEGRATION',
      message: 'Masaüstü QR kodlarımızı POS ile bağlamak istiyoruz.',
    });
    expect(result).toBe(true);
  });
});
