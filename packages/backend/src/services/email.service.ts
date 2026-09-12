import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

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
            rejectUnauthorized: false,
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
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    const subject = 'Naponi - Şifre Sıfırlama Talebi';

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    .logo { font-size: 24px; font-weight: 800; color: #38bdf8; text-decoration: none; display: inline-block; margin-bottom: 24px; letter-spacing: -0.5px; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; margin-bottom: 24px; }
    .notice { font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; line-height: 1.5; }
    .raw-link { word-break: break-all; color: #38bdf8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <a href="${env.APP_URL}" class="logo">⚡ Naponi</a>
    <h1>Şifre Sıfırlama Talebi</h1>
    <p>Naponi hesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi yenilemek için aşağıdaki butona tıklayabilirsiniz. Bu bağlantı <strong>1 saat</strong> boyunca geçerlidir.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Şifremi Sıfırla</a>
    </div>
    <p class="notice">
      Eğer bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayınız. Hesabınız güvendedir.<br><br>
      Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:<br>
      <a href="${resetUrl}" class="raw-link">${resetUrl}</a>
    </p>
  </div>
</body>
</html>
    `.trim();

    const textContent = `
Naponi - Şifre Sıfırlama Talebi

Hesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi yenilemek için aşağıdaki bağlantıyı ziyaret edebilirsiniz (1 saat geçerlidir):
${resetUrl}

Eğer bu talebi siz yapmadıysanız bu mesajı dikkate almayınız.
    `.trim();

    // 1. Resend Cloud API (Over HTTPS port 443 - zero firewall blockage)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromAddress = process.env.RESEND_FROM || 'Naponi <onboarding@resend.dev>';
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
          logger.info(`Password reset email sent via Resend to ${to} (ID: ${data?.id})`, 'EMAIL');
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
        logger.info(`Password reset email sent via SMTP to ${to}`, 'EMAIL');
        return true;
      } catch (error) {
        logger.error(`Failed to send password reset email to ${to}`, 'EMAIL', { error: String(error) });
        return false;
      }
    } else {
      // Fallback: log reset link securely for administrative / dev access
      logger.info(`[SIMULATED EMAIL] Password reset link generated for ${to}: ${resetUrl}`, 'EMAIL', {
        to,
        resetUrl,
      });
      return true;
    }
  }
}

export const emailService = new EmailService();
