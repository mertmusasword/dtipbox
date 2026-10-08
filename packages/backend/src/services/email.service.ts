import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  renderPasswordResetEmail,
  renderBusinessWelcomeEmail,
  renderEmployeeWelcomeEmail,
  renderSupportTicketConfirmationEmail,
  renderSupportTicketAdminNotificationEmail,
  renderPartnerApplicationAdminNotificationEmail,
  renderPartnerApplicationConfirmationEmail,
  renderLoyaltyCardWelcomeEmail,
  renderLoyaltyCardRecoveryEmail,
  renderDigitalReceiptEmail,
  type SupportTicketConfirmationParams,
  type SupportTicketAdminParams,
  type PartnerAdminNotificationParams,
  type PartnerConfirmationParams,
  type LoyaltyCardWelcomeParams,
  type LoyaltyCardRecoveryParams,
  type DigitalReceiptParams,
} from '../templates/emails';

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: !env.isDev,
          },
        });
        this.isConfigured = true;
        logger.info(`SMTP Transporter configured successfully: ${env.SMTP_HOST}:${env.SMTP_PORT} (${env.SMTP_USER})`, 'EMAIL');
      } catch (err) {
        logger.error('Failed to initialize SMTP transporter', 'EMAIL', { error: String(err) });
        this.transporter = null;
        this.isConfigured = false;
      }
    } else {
      logger.info('SMTP credentials not configured. Email fallback simulation mode active.', 'EMAIL');
      this.isConfigured = false;
    }
  }

  async verifyConnection() {
    if (!this.transporter && env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.initTransporter();
    }

    if (!this.transporter) {
      return {
        configured: false,
        host: env.SMTP_HOST || 'none',
        user: env.SMTP_USER || 'none',
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
      };
    }

    try {
      await this.transporter.verify();
      return {
        configured: true,
        verified: true,
        host: env.SMTP_HOST,
        user: env.SMTP_USER,
        port: env.SMTP_PORT,
      };
    } catch (err: any) {
      return {
        configured: true,
        verified: false,
        error: err.message,
        code: err.code,
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
      };
    }
  }

  /**
   * Internal helper to send email via Resend (preferred) or SMTP (fallback)
   */
  private async sendEmail(to: string, subject: string, htmlContent: string, textContent: string): Promise<boolean> {
    // 1. Resend Cloud API (Over HTTPS port 443 - zero firewall blockage)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromAddress = process.env.RESEND_FROM || 'Naponi <info@naponi.com>';
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject,
            html: htmlContent,
            text: textContent,
          }),
        });

        const data = (await response.json()) as any;
        if (response.ok) {
          logger.info(`Email successfully dispatched via Resend to ${to} (ID: ${data?.id})`, 'EMAIL');
          return true;
        } else {
          logger.error(`Resend API returned error: ${JSON.stringify(data)}`, 'EMAIL');
        }
      } catch (resendErr: any) {
        logger.error(`Failed to send via Resend: ${resendErr.message}`, 'EMAIL');
      }
    }

    // 2. Standard SMTP Transporter
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to,
          subject,
          text: textContent,
          html: htmlContent,
        });
        logger.info(`Email successfully dispatched via SMTP to ${to}`, 'EMAIL');
        return true;
      } catch (error) {
        logger.error(`Failed to send email to ${to} via SMTP`, 'EMAIL', { error: String(error) });
        return false;
      }
    } else {
      // Fallback: log for administrative / dev access
      logger.info(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`, 'EMAIL');
      return true;
    }
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(to: string, resetUrl: string, lang: string = 'tr'): Promise<boolean> {
    const { subject, html, text } = renderPasswordResetEmail({ resetUrl, lang });
    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Send Welcome Email to Newly Registered Business
   */
  async sendBusinessWelcomeEmail(to: string, businessName: string, lang: string = 'tr'): Promise<boolean> {
    const { subject, html, text } = renderBusinessWelcomeEmail({ businessName, lang });
    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Send Welcome Email to newly registered Employee
   */
  async sendEmployeeWelcomeEmail(
    to: string,
    employeeName: string,
    businessName: string,
    lang: string = 'tr'
  ): Promise<boolean> {
    const { subject, html, text } = renderEmployeeWelcomeEmail({ to, employeeName, businessName, lang });
    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Send Support Ticket Confirmation to User
   */
  async sendSupportTicketConfirmationEmail(params: SupportTicketConfirmationParams): Promise<boolean> {
    const { subject, html, text } = renderSupportTicketConfirmationEmail(params);
    return this.sendEmail(params.to, subject, html, text);
  }

  /**
   * Send Support Ticket Notification to Admin (info@naponi.com)
   */
  async sendSupportTicketAdminNotificationEmail(params: SupportTicketAdminParams): Promise<boolean> {
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || 'info@naponi.com';
    const { subject, html, text } = renderSupportTicketAdminNotificationEmail(params);
    return this.sendEmail(adminTo, subject, html, text);
  }

  /**
   * Send Partner Application Notification to Admin (info@naponi.com)
   */
  async sendPartnerApplicationAdminNotificationEmail(params: PartnerAdminNotificationParams): Promise<boolean> {
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || 'info@naponi.com';
    const { subject, html, text } = renderPartnerApplicationAdminNotificationEmail(params);
    return this.sendEmail(adminTo, subject, html, text);
  }

  /**
   * Send Partner Application Confirmation to Applicant
   */
  async sendPartnerApplicationConfirmationEmail(params: PartnerConfirmationParams): Promise<boolean> {
    const { subject, html, text } = renderPartnerApplicationConfirmationEmail(params);
    return this.sendEmail(params.to, subject, html, text);
  }

  /**
   * Send Loyalty Card Welcome Email to Customer
   */
  async sendLoyaltyCardWelcomeEmail(params: LoyaltyCardWelcomeParams & { to: string }): Promise<boolean> {
    const { subject, html, text } = renderLoyaltyCardWelcomeEmail(params);
    return this.sendEmail(params.to, subject, html, text);
  }

  /**
   * Send Loyalty Cards Recovery Email to Customer
   */
  async sendLoyaltyCardRecoveryEmail(params: LoyaltyCardRecoveryParams & { to: string }): Promise<boolean> {
    const { subject, html, text } = renderLoyaltyCardRecoveryEmail(params);
    return this.sendEmail(params.to, subject, html, text);
  }

  /**
   * Send Digital Tip Receipt Email from info@naponi.com
   */
  async sendDigitalReceiptEmail(payload: DigitalReceiptParams & { to: string }): Promise<boolean> {
    const { subject, html, text } = renderDigitalReceiptEmail(payload);
    return this.sendEmail(payload.to, subject, html, text);
  }
}

export const emailService = new EmailService();
