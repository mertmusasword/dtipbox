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
   * Send Password Reset Email
   */
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
    const isTr = lang.toLowerCase().startsWith('tr');
    const subject = isTr ? '⚡ Naponi - Şifre Sıfırlama Talebi' : '⚡ Naponi - Password Reset Request';

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a13; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #38bdf8, #3b82f6, #818cf8);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${env.APP_URL}" style="text-decoration: none; display: inline-block;">
                      <img src="${env.APP_URL}/naponi-brand.png" alt="Naponi" width="145" height="43" style="display: block; width: 145px; height: auto; border: 0;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); color: #38bdf8; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
                      ${isTr ? '🔒 Güvenlik Talebi' : '🔒 Security Request'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #1e293b;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 40px 28px 40px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                ${isTr ? 'Şifre Sıfırlama Talebi' : 'Password Reset Request'}
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                ${isTr 
                  ? 'Naponi hesabınız için bir şifre yenileme talebinde bulunuldu. Hesabınıza güvenle erişebilmeniz ve yeni şifrenizi oluşturmak için aşağıdaki butona tıklayabilirsiniz.' 
                  : 'A password reset was requested for your Naponi account. Click the button below to securely access your account and create a new password.'}
              </p>

              <!-- Expiry Alert Pill -->
              <div style="margin-bottom: 28px; background-color: #131d35; border: 1px solid #1e3a8a; border-radius: 10px; padding: 12px 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 20px; font-size: 14px; vertical-align: middle;">⏱️</td>
                    <td style="font-size: 13px; color: #93c5fd; font-weight: 500; padding-left: 8px;">
                      ${isTr 
                        ? 'Bu bağlantı güvenlik sebebiyle <strong>60 dakika</strong> boyunca geçerlidir.' 
                        : 'This link is valid for <strong>60 minutes</strong> for security reasons.'}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Action Button CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5); letter-spacing: 0.2px;">
                  ${isTr ? 'Şifremi Sıfırla &rarr;' : 'Reset My Password &rarr;'}
                </a>
              </div>

              <!-- Security Notice Box -->
              <div style="background-color: rgba(15, 23, 42, 0.6); border-left: 3px solid #38bdf8; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-top: 32px;">
                <p style="margin: 0; font-size: 12.5px; line-height: 1.6; color: #64748b;">
                  ${isTr
                    ? '<strong style="color: #cbd5e1;">Bu işlemi siz başlatmadıysanız:</strong> Bu e-postayı güvenle dikkate almayabilirsiniz. Mevcut şifreniz değişmeden kalacaktır.'
                    : '<strong style="color: #cbd5e1;">If you did not request this:</strong> You can safely ignore this email. Your current password will remain unchanged.'}
                </p>
              </div>

              <!-- Fallback Link Section -->
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #1e293b;">
                <p style="margin: 0 0 8px 0; font-size: 11.5px; color: #64748b;">
                  ${isTr
                    ? 'Buton çalışmıyorsa aşağıdaki güvenli bağlantıyı tarayıcınıza kopyalayabilirsiniz:'
                    : 'If the button does not work, copy and paste this secure link into your browser:'}
                </p>
                <div style="background-color: #070a13; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 14px; word-break: break-all;">
                  <a href="${resetUrl}" style="color: #38bdf8; font-size: 11px; text-decoration: none; line-height: 1.5; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                    ${resetUrl}
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                ${isTr ? '© 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri' : '© 2026 Naponi Technology • Digital Tipping & Payment Solutions'}
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                ${isTr ? 'Bu otomatik bir güvenlik bildirimidir. Lütfen bu e-postayı doğrudan yanıtlamayınız.' : 'This is an automated security notification. Please do not reply directly to this email.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = isTr
      ? `Naponi - Şifre Sıfırlama Talebi\n\nHesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi yenilemek için aşağıdaki bağlantıyı ziyaret edebilirsiniz (1 saat geçerlidir):\n${resetUrl}\n\nEğer bu talebi siz yapmadıysanız bu mesajı dikkate almayınız.`.trim()
      : `Naponi - Password Reset Request\n\nA password reset was requested for your Naponi account. Visit the following link to reset your password (valid for 1 hour):\n${resetUrl}\n\nIf you did not make this request, please ignore this email.`.trim();

    return this.sendEmail(to, subject, htmlContent, textContent);
  }

  /**
   * Send Business Welcome & Onboarding Guide Email
   */
  async sendBusinessWelcomeEmail(to: string, businessName: string, lang: string = 'tr'): Promise<boolean> {
    const isTr = lang.toLowerCase().startsWith('tr');
    const subject = isTr
      ? `⚡ Naponi'ye Hoş Geldiniz! İşletmenizi 3 Adımda Hazırlayın`
      : `⚡ Welcome to Naponi! Set Up Your Business in 3 Steps`;
    const loginUrl = `${env.APP_URL}/login`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a13; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Gradient Line (Emerald/Cyan/Blue) -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${env.APP_URL}" style="text-decoration: none; display: inline-block;">
                      <img src="${env.APP_URL}/naponi-brand.png" alt="Naponi" width="145" height="43" style="display: block; width: 145px; height: auto; border: 0;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
                      ${isTr ? '🏢 İşletme Hesabı' : '🏢 Business Account'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #1e293b;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 40px 28px 40px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                ${isTr ? `Aramıza Hoş Geldiniz, <span style="color: #38bdf8;">${businessName}</span>! 🎉` : `Welcome to Naponi, <span style="color: #38bdf8;">${businessName}</span>! 🎉`}
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                ${isTr
                  ? 'Müşterilerinizden kredi kartı ile doğrudan masada veya kasada temassız bahşiş toplamanızı sağlayan yeni nesil dijital bahşiş sistemine hoş geldiniz. İşletmenizi hemen faaliyete geçirmek için aşağıdaki 3 kolay adımı takip edebilirsiniz:'
                  : 'Welcome to the next-generation digital tipping and guest engagement platform. Follow these 3 easy steps to activate your venue and start receiving tips immediately:'}
              </p>

              <!-- Step 1 Card -->
              <div style="margin-bottom: 16px; background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 32px; height: 32px; background-color: #0284c7; color: #ffffff; font-weight: 700; font-size: 14px; text-align: center; border-radius: 8px; vertical-align: middle;">
                      1
                    </td>
                    <td style="padding-left: 14px;">
                      <div style="font-size: 14px; font-weight: 600; color: #f8fafc; margin-bottom: 4px;">
                        ${isTr ? 'Personellerinizi Ekleyin' : 'Add Your Staff Members'}
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        ${isTr
                          ? 'Ekip üyelerinizi tanımlayın; her çalışanınız için kişisel bahşiş profili ve performansı otomatik oluşsun.'
                          : 'Set up your team members so each employee receives their own personal profile and transparent performance metrics.'}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Step 2 Card -->
              <div style="margin-bottom: 16px; background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 32px; height: 32px; background-color: #0284c7; color: #ffffff; font-weight: 700; font-size: 14px; text-align: center; border-radius: 8px; vertical-align: middle;">
                      2
                    </td>
                    <td style="padding-left: 14px;">
                      <div style="font-size: 14px; font-weight: 600; color: #f8fafc; margin-bottom: 4px;">
                        ${isTr ? 'Masa & Personel QR Kodlarınızı İndirin' : 'Download Table & Staff QR Codes'}
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        ${isTr
                          ? 'Masalarınız veya personelleriniz için dinamik QR kodları panelinizden tek tıkla indirin ve yazdırın.'
                          : 'Download and print custom branded QR stands and table cards directly from your dashboard.'}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Step 3 Card -->
              <div style="margin-bottom: 28px; background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 32px; height: 32px; background-color: #0284c7; color: #ffffff; font-weight: 700; font-size: 14px; text-align: center; border-radius: 8px; vertical-align: middle;">
                      3
                    </td>
                    <td style="padding-left: 14px;">
                      <div style="font-size: 14px; font-weight: 600; color: #f8fafc; margin-bottom: 4px;">
                        ${isTr ? 'Ödeme Bilgilerinizi Bağlayın' : 'Connect Your Payout Account'}
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        ${isTr
                          ? 'Bahşişlerin kesintisiz aktarılması için ödeme/banka hesabınızı tanımlayın ve hemen kazanmaya başlayın.'
                          : 'Connect your bank or merchant account to ensure seamless direct payouts for collected tips.'}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5); letter-spacing: 0.2px;">
                  ${isTr ? 'Yönetim Paneline Git &rarr;' : 'Go to Dashboard &rarr;'}
                </a>
              </div>

              <!-- Support Contact Box -->
              <div style="background-color: rgba(15, 23, 42, 0.6); border-left: 3px solid #10b981; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-top: 32px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                  ${isTr
                    ? '<strong>Yardıma mı ihtiyacınız var?</strong> Kurulum, QR kartlıklar veya ödeme entegrasyonuyla ilgili her konuda <a href="mailto:info@naponi.com" style="color: #38bdf8; text-decoration: none; font-weight: 600;">info@naponi.com</a> adresinden bize dilediğiniz an ulaşabilirsiniz.'
                    : '<strong>Need assistance?</strong> For onboarding support, QR hardware, or payment integrations, contact us anytime at <a href="mailto:info@naponi.com" style="color: #38bdf8; text-decoration: none; font-weight: 600;">info@naponi.com</a>.'}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                ${isTr ? '© 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri' : '© 2026 Naponi Technology • Digital Tipping & Payment Solutions'}
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                ${isTr
                  ? 'Bu e-posta Naponi platformuna kayıt olan işletmelere bilgilendirme amacıyla gönderilmiştir.'
                  : 'This email was sent to notify registered businesses on the Naponi platform.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = isTr
      ? `
Naponi'ye Hoş Geldiniz, ${businessName}!

Müşterilerinizden kredi kartı ile doğrudan masada veya kasada dijital bahşiş toplamanızı sağlayan yeni nesil sisteme hoş geldiniz.

İşletmenizi hemen faaliyete geçirmek için:
1. Personellerinizi Ekleyin: Ekip üyelerinizi tanımlayın.
2. Masa & Personel QR Kodlarınızı İndirin: Panelinizden QR kodları indirin ve bastırın.
3. Ödeme Bilgilerinizi Bağlayın: Bahşiş aktarımı için bilgilerinizi tamamlayın.

Yönetim Paneli: ${loginUrl}
Sorularınız için: info@naponi.com
      `.trim()
      : `
Welcome to Naponi, ${businessName}!

Welcome to the next-generation digital tipping and guest engagement platform.

Quick setup steps:
1. Add Your Staff Members
2. Download & Print Table/Staff QR Codes
3. Connect Your Payout Account

Management Dashboard: ${loginUrl}
Support: info@naponi.com
      `.trim();

    return this.sendEmail(to, subject, htmlContent, textContent);
  }

  /**
   * Send Employee Welcome & Orientation Email
   */
  async sendEmployeeWelcomeEmail(to: string, employeeName: string, businessName: string, lang: string = 'tr'): Promise<boolean> {
    const isTr = lang.toLowerCase().startsWith('tr');
    const subject = isTr
      ? `⚡ ${businessName} Ekibine Hoş Geldiniz! Dijital Bahşiş Profiliniz Hazır`
      : `⚡ Welcome to ${businessName}! Your Digital Tip Profile is Ready`;
    const loginUrl = `${env.APP_URL}/login`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a13; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Gradient Line (Purple/Indigo/Blue) -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a855f7, #6366f1, #38bdf8);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${env.APP_URL}" style="text-decoration: none; display: inline-block;">
                      <img src="${env.APP_URL}/naponi-brand.png" alt="Naponi" width="145" height="43" style="display: block; width: 145px; height: auto; border: 0;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
                      ${isTr ? '👤 Personel Hesabı' : '👤 Staff Account'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #1e293b;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 40px 28px 40px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                ${isTr ? `Merhaba ${employeeName}, Hoş Geldin! 👋` : `Welcome aboard, ${employeeName}! 👋`}
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                ${isTr
                  ? `<strong style="color: #f8fafc;">${businessName}</strong> işletmesi seni Naponi dijital bahşiş sistemine ekledi! Artık misafirlerinden kredi kartı ile doğrudan sana özel dijital bahşiş toplayabilirsin.`
                  : `<strong style="color: #f8fafc;">${businessName}</strong> has added you to their Naponi digital tipping system! You can now receive card and mobile wallet tips directly from guests.`}
              </p>

              <!-- Feature 1 -->
              <div style="margin-bottom: 14px; background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 24px; font-size: 18px; vertical-align: top;">📱</td>
                    <td style="padding-left: 12px;">
                      <div style="font-size: 13.5px; font-weight: 600; color: #f8fafc; margin-bottom: 2px;">
                        ${isTr ? 'Sana Özel Kişisel QR Kod' : 'Personal Dedicated QR Code'}
                      </div>
                      <div style="font-size: 12.5px; color: #94a3b8; line-height: 1.4;">
                        ${isTr
                          ? 'Misafirler telefon kameralarıyla QR kodunu okutarak saniyeler içinde sana teşekkür bahşişi gönderebilir.'
                          : 'Guests can scan your dedicated QR code with their phone camera to tip you in seconds without downloading an app.'}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Feature 2 -->
              <div style="margin-bottom: 14px; background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 24px; font-size: 18px; vertical-align: top;">📊</td>
                    <td style="padding-left: 12px;">
                      <div style="font-size: 13.5px; font-weight: 600; color: #f8fafc; margin-bottom: 2px;">
                        ${isTr ? 'Anlık & Şeffaf Kazanç Takibi' : 'Real-time & Transparent Earnings'}
                      </div>
                      <div style="font-size: 12.5px; color: #94a3b8; line-height: 1.4;">
                        ${isTr
                          ? 'Topladığın bahşişleri ve performansını personel panelinden dilediğin an şeffaf şekilde izleyebilirsin.'
                          : 'Track received tips, customer reviews, and your payouts transparently anytime from your staff portal.'}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Account Info Pill -->
              <div style="margin-top: 24px; margin-bottom: 28px; background-color: #0b1120; border: 1px dashed #334155; border-radius: 10px; padding: 12px 16px; text-align: center;">
                <span style="font-size: 12px; color: #94a3b8;">${isTr ? 'Kayıtlı E-posta Adresiniz:' : 'Registered Email:'}</span>
                <span style="font-size: 13px; color: #38bdf8; font-weight: 600; margin-left: 6px;">${to}</span>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5); letter-spacing: 0.2px;">
                  ${isTr ? 'Personel Paneline Giriş Yap &rarr;' : 'Log In to Staff Portal &rarr;'}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                ${isTr ? '© 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri' : '© 2026 Naponi Technology • Digital Tipping & Payment Solutions'}
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                ${isTr
                  ? `Bu e-posta ${businessName} işletmesi tarafından personel kaydınız yapıldığı için iletilmiştir.`
                  : `This email was sent because ${businessName} registered you as a staff member on Naponi.`}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = isTr
      ? `
Merhaba ${employeeName}, Hoş Geldin!

${businessName} işletmesi seni Naponi dijital bahşiş sistemine ekledi. Artık misafirlerinden kredi kartı ile doğrudan sana özel dijital bahşiş toplayabilirsin!

Giriş E-postası: ${to}
Personel Paneli: ${loginUrl}
      `.trim()
      : `
Welcome ${employeeName}!

${businessName} has added you to the Naponi digital tipping system. You can now receive card tips directly from guests!

Login Email: ${to}
Staff Portal: ${loginUrl}
      `.trim();

    return this.sendEmail(to, subject, htmlContent, textContent);
  }

  /**
   * Send Support Ticket Confirmation to User
   */
  async sendSupportTicketConfirmationEmail(params: {
    to: string;
    name: string;
    ticketId: string;
    subject: string;
    category?: string;
    message: string;
    businessName?: string;
  }): Promise<boolean> {
    const { to, name, ticketId, subject: ticketSubject, category, message, businessName } = params;
    const shortId = ticketId.slice(0, 8).toUpperCase();
    const emailSubject = `⚡ Destek Talebiniz Alındı [#${shortId}] - ${ticketSubject}`;

    const categoryLabels: Record<string, string> = {
      POS_INTEGRATION: 'POS & Entegrasyon',
      TECHNICAL_SUPPORT: 'Teknik Destek',
      ACCOUNT_BILLING: 'Hesap & Ödemeler',
      GENERAL_INQUIRY: 'Genel Bilgi Talebi',
      FEEDBACK_SUGGESTION: 'Geri Bildirim & Öneri',
    };
    const categoryLabel = (category && categoryLabels[category]) || category || 'Genel Destek';

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(ticketSubject);
    const safeCategory = escapeHtml(categoryLabel);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
    const safeBusiness = businessName ? escapeHtml(businessName) : null;

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Destek Talebiniz Alındı</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout: fixed; background-color: #0b0f19; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Header with Logo & Ticket Badge -->
          <tr>
            <td style="padding: 32px 40px 24px 40px; text-align: center; background: linear-gradient(180deg, #131d35 0%, #0f172a 100%);">
              <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi Digital Tipping" width="145" style="display: inline-block; max-width: 145px; height: auto; border: 0; outline: none; text-decoration: none;" />
              <div style="margin-top: 14px;">
                <span style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); color: #818cf8; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px;">
                  TALEP NO: #${shortId}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #1e293b;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 40px 28px 40px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                Destek Talebiniz Alındı 📨
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Merhaba <strong style="color: #f8fafc;">${safeName}</strong>, iletmiş olduğunuz destek talebi başarıyla sistemimize ulaştı. Destek ekibimiz mesajınızı incelemekte olup, en kısa sürede bu e-posta adresi üzerinden sizinle iletişime geçecektir.
              </p>

              <!-- Ticket Details Card -->
              <div style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                  Talep Detayları
                </div>
                
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; width: 110px; vertical-align: top;">Kategori:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #38bdf8; font-weight: 600;">${safeCategory}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; vertical-align: top;">Konu:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc; font-weight: 600;">${safeSubject}</td>
                  </tr>
                  ${
                    safeBusiness
                      ? `<tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; vertical-align: top;">İşletme:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc;">${safeBusiness}</td>
                  </tr>`
                      : ''
                  }
                  <tr>
                    <td style="padding: 10px 0 4px 0; font-size: 13px; color: #94a3b8; vertical-align: top;" colspan="2">
                      <div style="margin-bottom: 6px; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700;">İlettiğiniz Mesaj:</div>
                      <div style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 12px 14px; color: #e2e8f0; font-size: 13.5px; line-height: 1.5;">
                        ${safeMessage}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Information Callout -->
              <div style="background-color: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 22px; font-size: 16px; vertical-align: top;">⏱</td>
                    <td style="padding-left: 10px; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                      <strong style="color: #38bdf8;">Ortalama Yanıt Süresi:</strong> Mesai saatleri içerisinde ortalama <strong>2 saat</strong> içerisinde geri dönüş sağlanmaktadır. Acil durumlar için <a href="mailto:info@naponi.com" style="color: #38bdf8; text-decoration: none;">info@naponi.com</a> üzerinden ek bilgi iletebilirsiniz.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Link to Homepage/Dashboard -->
              <div style="text-align: center; margin: 16px 0 8px 0;">
                <a href="https://www.naponi.com" style="display: inline-block; background-color: #1e293b; color: #cbd5e1 !important; font-size: 13.5px; font-weight: 600; text-decoration: none; padding: 11px 26px; border-radius: 10px; border: 1px solid #334155;">
                  Naponi Web Sitesine Dön &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                © 2026 Naponi Teknoloji • info@naponi.com • www.naponi.com
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                Bu e-posta naponi.com üzerinden iletilen destek başvurunuza istinaden otomatik olarak oluşturulmuştur.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
Destek Talebiniz Alındı [#${shortId}]

Merhaba ${name},
İletmiş olduğunuz destek talebi başarıyla sistemimize ulaştı. Destek uzmanlarımız talebinizi incelemekte olup, en kısa sürede bu e-posta adresi üzerinden sizinle iletişime geçecektir.

Talep No: #${shortId}
Kategori: ${categoryLabel}
Konu: ${ticketSubject}
${businessName ? `İşletme: ${businessName}\n` : ''}
Mesajınız:
${message}

Ortalama yanıt süremiz mesai saatleri içinde 2 saattir.
Naponi Destek Ekibi - info@naponi.com
    `.trim();

    return this.sendEmail(to, emailSubject, htmlContent, textContent);
  }

  /**
   * Send Support Ticket Notification to Admin (info@naponi.com)
   */
  async sendSupportTicketAdminNotificationEmail(params: {
    name: string;
    email: string;
    phone?: string;
    businessName?: string;
    ticketId: string;
    subject: string;
    category?: string;
    message: string;
  }): Promise<boolean> {
    const { name, email, phone, businessName, ticketId, subject: ticketSubject, category, message } = params;
    const shortId = ticketId.slice(0, 8).toUpperCase();
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || 'info@naponi.com';

    const categoryLabels: Record<string, string> = {
      POS_INTEGRATION: 'POS & Entegrasyon',
      TECHNICAL_SUPPORT: 'Teknik Destek',
      ACCOUNT_BILLING: 'Hesap & Ödemeler',
      GENERAL_INQUIRY: 'Genel Bilgi Talebi',
      FEEDBACK_SUGGESTION: 'Geri Bildirim & Öneri',
    };
    const categoryLabel = (category && categoryLabels[category]) || category || 'Genel';
    const emailSubject = `🚨 Yeni Destek Talebi [#${shortId}]: ${categoryLabel} - ${name}`;

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : 'Belirtilmedi';
    const safeBusiness = businessName ? escapeHtml(businessName) : 'Bireysel / Belirtilmedi';
    const safeSubject = escapeHtml(ticketSubject);
    const safeCategory = escapeHtml(categoryLabel);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    const adminPanelUrl = 'https://www.naponi.com/admin/support-tickets';

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Destek Talebi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout: fixed; background-color: #0b0f19; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 40px 20px 40px; text-align: center; background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);">
              <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="130" style="display: inline-block; max-width: 130px; height: auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.6px;">
                  YENİ DESTEK TALEBİ • #${shortId}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #1e293b;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                Siteden Yeni Talep İletildi 📥
              </h2>

              <!-- Details Table -->
              <div style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; width: 100px;">Ad Soyad:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc; font-weight: 600;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">E-posta:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #38bdf8; font-weight: 600;">
                      <a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: none;">${safeEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Telefon:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc;">${safePhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">İşletme:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc;">${safeBusiness}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Kategori:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #c084fc; font-weight: 600;">${safeCategory}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Konu:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc; font-weight: 600;">${safeSubject}</td>
                  </tr>
                </table>
              </div>

              <!-- Message box -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">
                  Talep Mesajı:
                </div>
                <div style="background-color: #0b1120; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px; color: #f1f5f9; font-size: 14px; line-height: 1.6;">
                  ${safeMessage}
                </div>
              </div>

              <!-- CTA Button to Admin -->
              <div style="text-align: center; margin: 24px 0 10px 0;">
                <a href="${adminPanelUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; font-size: 14.5px; font-weight: 600; text-decoration: none; padding: 13px 32px; border-radius: 11px; box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.5);">
                  Admin Panelinde Talebi Yönet &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11.5px; color: #475569;">
                Naponi Sistem Bildirimi • Otomatik Gönderim
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
YENİ DESTEK TALEBİ [#${shortId}]

Ad Soyad: ${name}
E-posta: ${email}
Telefon: ${phone || 'Belirtilmedi'}
İşletme: ${businessName || 'Belirtilmedi'}
Kategori: ${categoryLabel}
Konu: ${ticketSubject}

Mesaj:
${message}

Admin Paneli: ${adminPanelUrl}
    `.trim();

    return this.sendEmail(adminTo, emailSubject, htmlContent, textContent);
  }

  /**
   * Send Partner Application Notification to Admin (info@naponi.com)
   */
  async sendPartnerApplicationAdminNotificationEmail(params: {
    applicationId: string;
    companyName: string;
    contactName: string;
    email: string;
    phone?: string | null;
    website?: string | null;
    companyType: string;
    customerCount?: string | null;
    countries?: string | null;
    integrationIdea?: string | null;
    message?: string | null;
  }): Promise<boolean> {
    const {
      applicationId,
      companyName,
      contactName,
      email,
      phone,
      website,
      companyType,
      customerCount,
      countries,
      integrationIdea,
      message,
    } = params;

    const shortId = applicationId.slice(0, 8).toUpperCase();
    const adminTo = process.env.ADMIN_NOTIFY_EMAIL || 'info@naponi.com';
    const emailSubject = `🤝 Yeni Teknoloji Partner Başvurusu [#${shortId}]: ${companyName} (${companyType})`;

    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeCompany = escapeHtml(companyName);
    const safeContact = escapeHtml(contactName);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : 'Belirtilmedi';
    const safeWebsite = website ? escapeHtml(website) : null;
    const safeType = escapeHtml(companyType);
    const safeCustomerCount = customerCount ? escapeHtml(customerCount) : 'Belirtilmedi';
    const safeCountries = countries ? escapeHtml(countries) : 'Belirtilmedi';
    const safeIdea = integrationIdea ? escapeHtml(integrationIdea).replace(/\n/g, '<br/>') : null;
    const safeMessage = message ? escapeHtml(message).replace(/\n/g, '<br/>') : null;

    const adminPanelUrl = `${env.APP_URL}/admin/partner-applications`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Teknoloji Partner Başvurusu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout: fixed; background-color: #070a13; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #38bdf8, #818cf8, #34d399);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 40px 20px 40px; text-align: center; background: linear-gradient(180deg, #0c2340 0%, #0f172a 100%);">
              <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="135" style="display: inline-block; max-width: 135px; height: auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; letter-spacing: 0.6px;">
                  🤝 TEKNOLOJİ PARTNERLİĞİ TALEBİ • #${shortId}
                </span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #1e293b;"></div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 40px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                Yeni B2B Partnerlik Başvurusu 🚀
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                Naponi Teknoloji Partnerleri kanalı üzerinden yeni bir entegrasyon ve iş ortaklığı talebi iletildi. Detaylar aşağıdadır:
              </p>

              <!-- Details Table -->
              <div style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 130px;">Firma Adı:</td>
                    <td style="padding: 6px 0; font-size: 14px; color: #ffffff; font-weight: 700;">${safeCompany}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Firma Türü:</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #38bdf8; font-weight: 600;">
                      <span style="background: rgba(56, 189, 248, 0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.25);">
                        ${safeType}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Yetkili Kişi:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc; font-weight: 600;">${safeContact}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">E-posta:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #38bdf8; font-weight: 600;">
                      <a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: none;">${safeEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Telefon:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #f8fafc;">
                      ${phone ? `<a href="tel:${safePhone}" style="color: #38bdf8; text-decoration: none;">${safePhone}</a>` : 'Belirtilmedi'}
                    </td>
                  </tr>
                  ${
                    safeWebsite
                      ? `<tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Web Sitesi:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #38bdf8;">
                      <a href="${safeWebsite.startsWith('http') ? safeWebsite : `https://${safeWebsite}`}" target="_blank" style="color: #38bdf8; text-decoration: none;">
                        ${safeWebsite} &rarr;
                      </a>
                    </td>
                  </tr>`
                      : ''
                  }
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Müşteri Sayısı:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #34d399; font-weight: 700;">${safeCustomerCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Faaliyet Ülkeleri:</td>
                    <td style="padding: 6px 0; font-size: 13.5px; color: #cbd5e1;">${safeCountries}</td>
                  </tr>
                </table>
              </div>

              <!-- Integration Idea Box -->
              ${
                safeIdea
                  ? `<div style="margin-bottom: 20px;">
                <div style="font-size: 11.5px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
                  Entegrasyon Vizyonu & Fikri:
                </div>
                <div style="background-color: #0b1120; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 14px 16px; color: #f1f5f9; font-size: 13.5px; line-height: 1.6;">
                  ${safeIdea}
                </div>
              </div>`
                  : ''
              }

              <!-- Additional Message Box -->
              ${
                safeMessage
                  ? `<div style="margin-bottom: 24px;">
                <div style="font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
                  Başvuru Mesajı:
                </div>
                <div style="background-color: #0b1120; border: 1px solid #334155; border-radius: 10px; padding: 14px 16px; color: #cbd5e1; font-size: 13px; line-height: 1.5;">
                  ${safeMessage}
                </div>
              </div>`
                  : ''
              }

              <!-- CTA Button to Admin -->
              <div style="text-align: center; margin: 28px 0 12px 0;">
                <a href="${adminPanelUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff !important; font-size: 14.5px; font-weight: 700; text-decoration: none; padding: 13px 34px; border-radius: 10px; box-shadow: 0 8px 24px -4px rgba(2, 132, 199, 0.5);">
                  Admin Panelinde Başvuruyu Yönet &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11.5px; color: #475569;">
                Naponi B2B Teknoloji Partnerleri • Otomatik Sistem Bildirimi • info@naponi.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
YENİ TEKNOLOJİ PARTNER BAŞVURUSU [#${shortId}]

Firma Adı: ${companyName}
Firma Türü: ${companyType}
Yetkili Kişi: ${contactName}
E-posta: ${email}
Telefon: ${phone || 'Belirtilmedi'}
Web Sitesi: ${website || 'Belirtilmedi'}
Müşteri Sayısı: ${customerCount || 'Belirtilmedi'}
Faaliyet Ülkeleri: ${countries || 'Belirtilmedi'}

Entegrasyon Fikri:
${integrationIdea || 'Belirtilmedi'}

Mesaj:
${message || 'Belirtilmedi'}

Admin Paneli: ${adminPanelUrl}
    `.trim();

    return this.sendEmail(adminTo, emailSubject, htmlContent, textContent);
  }

  /**
   * Send Partner Application Confirmation to Applicant
   */
  async sendPartnerApplicationConfirmationEmail(params: {
    to: string;
    companyName: string;
    contactName: string;
    applicationId: string;
  }): Promise<boolean> {
    const { to, companyName, contactName, applicationId } = params;
    const shortId = applicationId.slice(0, 8).toUpperCase();
    const emailSubject = `⚡ Naponi Teknoloji Partnerliği Başvurunuz Alındı [#${shortId}]`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout: fixed; background-color: #070a13; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #38bdf8, #818cf8, #34d399);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 40px 20px 40px; text-align: center; background: linear-gradient(180deg, #0c2340 0%, #0f172a 100%);">
              <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="135" style="display: inline-block; max-width: 135px; height: auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; letter-spacing: 0.6px;">
                  BAŞVURU NO: #${shortId}
                </span>
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 40px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                Başvurunuz Başarıyla Alındı 🤝
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14.5px; color: #cbd5e1; line-height: 1.6;">
                Merhaba Sayın <strong>${contactName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                <strong>${companyName}</strong> adına iletmiş olduğunuz Naponi Teknoloji Partnerliği başvurunuz sistemimize ulaştı. POS, QR Menü, ödeme ve restoran yönetim yazılımlarıyla entegre olarak işletmelere sunduğumuz dijital bahşiş çözümlerine gösterdiğiniz ilgi için teşekkür ederiz.
              </p>

              <!-- Process Steps Box -->
              <div style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
                <div style="font-size: 11.5px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
                  Süreç Nasıl İlerliyor?
                </div>
                <div style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  <strong>1. Ön İnceleme:</strong> İş geliştirme ekibimiz teknoloji ve ürün modelinizi değerlendirir.<br/>
                  <strong>2. B2B Görüşme:</strong> Karşılıklı demo ve entegrasyon modelini belirlemek için sizinle temasa geçeriz.<br/>
                  <strong>3. Sandbox & Canlı:</strong> Ortak testlerin ardından partner olarak restoran ve kafelere birlikte değer üretmeye başlarız.
                </div>
              </div>

              <!-- Information Callout -->
              <div style="background-color: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                  Ek sorularınız veya doğrudan sunum göndermek isterseniz bu e-postayı yanıtlayabilir ya da doğrudan <a href="mailto:info@naponi.com" style="color: #38bdf8; text-decoration: none; font-weight: 600;">info@naponi.com</a> üzerinden ekibimize yazabilirsiniz.
                </p>
              </div>

              <!-- Website Link -->
              <div style="text-align: center; margin: 20px 0 8px 0;">
                <a href="https://www.naponi.com/technology-partners" style="display: inline-block; background-color: #1e293b; color: #cbd5e1 !important; font-size: 13.5px; font-weight: 600; text-decoration: none; padding: 10px 24px; border-radius: 8px; border: 1px solid #334155;">
                  Teknoloji Partnerleri Programı Detayları &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569; font-weight: 500;">
                © 2026 Naponi Teknoloji • info@naponi.com • www.naponi.com
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                Bu e-posta naponi.com üzerinden yapılan partnerlik başvurusuna istinaden iletilmiştir.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
Naponi Teknoloji Partnerliği Başvurunuz Alındı [#${shortId}]

Merhaba Sayın ${contactName},

${companyName} adına iletmiş olduğunuz Naponi Teknoloji Partnerliği başvurunuz sistemimize ulaştı. 
B2B iş geliştirme ve entegrasyon ekibimiz başvurunuzu incelemekte olup en kısa sürede sizinle iletişime geçecektir.

Her türlü soru ve talebiniz için: info@naponi.com
    `.trim();

    return this.sendEmail(to, emailSubject, htmlContent, textContent);
  }

  /**
   * Send Loyalty Card Welcome Email to Customer
   */
  async sendLoyaltyCardWelcomeEmail(params: {
    to: string;
    businessName: string;
    programName: string;
    cardUrl: string;
    cardCode: string;
    targetStamps: number;
    rewardDescription: string;
    lang?: string;
  }): Promise<boolean> {
    const { to, businessName, programName, cardUrl, cardCode, targetStamps, rewardDescription, lang = 'tr' } = params;
    const isTr = lang.toLowerCase().startsWith('tr');
    const emailSubject = isTr
      ? `🎁 ${businessName} Sadakat Kartınız Hazır!`
      : `🎁 Your ${businessName} Loyalty Card is Ready!`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout: fixed; background-color: #070a13; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 540px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Line (Gold / Amber / Emerald Gradient) -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f59e0b, #10b981, #06b6d4);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 40px 20px 40px; text-align: center; background: linear-gradient(180deg, #1c1917 0%, #0f172a 100%);">
              <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="135" style="display: inline-block; max-width: 135px; height: auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; letter-spacing: 0.6px;">
                  ${isTr ? '🎁 DİJİTAL SADAKAT KARTI' : '🎁 DIGITAL LOYALTY CARD'}
                </span>
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 40px;">
              <h2 style="margin: 0 0 10px 0; font-size: 21px; font-weight: 800; color: #ffffff;">
                ${businessName}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14.5px; color: #cbd5e1; line-height: 1.6;">
                ${isTr
                  ? `<strong>${programName}</strong> sadakat kartınız başarıyla oluşturuldu! Her siparişinizde kartınızı personele göstererek damga toplayabilir ve ödülünüzü kazanabilirsiniz.`
                  : `Your <strong>${programName}</strong> digital loyalty card has been created! Present your card on every visit to collect stamps and claim rewards.`}
              </p>

              <!-- Card Overview Box -->
              <div style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 11.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">
                  ${isTr ? 'Kart Kodunuz' : 'Your Card Code'}
                </div>
                <div style="font-size: 26px; font-weight: 900; color: #38bdf8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 2px; margin-bottom: 12px;">
                  ${cardCode}
                </div>
                <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                  ${isTr
                    ? `Hedef: <strong style="color: #f8fafc;">${targetStamps} Damga</strong> &bull; Ödül: <strong style="color: #34d399;">${rewardDescription}</strong>`
                    : `Goal: <strong style="color: #f8fafc;">${targetStamps} Stamps</strong> &bull; Reward: <strong style="color: #34d399;">${rewardDescription}</strong>`}
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${cardUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000 !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4); letter-spacing: 0.3px;">
                  ${isTr ? 'Sadakat Kartımı Aç &rarr;' : 'Open My Loyalty Card &rarr;'}
                </a>
              </div>

              <!-- Tip / Note -->
              <div style="background-color: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12.5px; line-height: 1.5; color: #94a3b8;">
                  <strong style="color: #cbd5e1;">${isTr ? 'İpucu:' : 'Tip:'}</strong> ${isTr
                    ? 'Bu bağlantıyı tarayıcınızda açtıktan sonra "Ana Ekrana Ekle" (Add to Home Screen) yaparak kartınıza tek tıkla uygulama gibi ulaşabilirsiniz.'
                    : 'Open this link in your mobile browser and tap "Add to Home Screen" to use your card instantly like a native mobile app.'}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569; font-weight: 500;">
                © 2026 Naponi Teknoloji &bull; www.naponi.com
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                ${isTr
                  ? `Bu e-posta ${businessName} sadakat programına kaydolduğunuz için gönderilmiştir.`
                  : `This email was sent because you enrolled in ${businessName}'s loyalty program.`}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = isTr
      ? `
${businessName} Sadakat Kartınız Hazır!

${programName}
Kart Kodunuz: ${cardCode}
Hedef: ${targetStamps} Damga
Ödül: ${rewardDescription}

Kartınızı açmak için:
${cardUrl}
      `.trim()
      : `
Your ${businessName} Loyalty Card is Ready!

${programName}
Card Code: ${cardCode}
Goal: ${targetStamps} Stamps
Reward: ${rewardDescription}

Open your loyalty card:
${cardUrl}
      `.trim();

    return this.sendEmail(to, emailSubject, htmlContent, textContent);
  }

  /**
   * Send Loyalty Cards Recovery Email to Customer
   */
  async sendLoyaltyCardRecoveryEmail(params: {
    to: string;
    lang?: string;
    cards: Array<{
      businessName: string;
      programName: string;
      cardUrl: string;
      cardCode: string;
      currentStamps: number;
      targetStamps: number;
    }>;
  }): Promise<boolean> {
    const { to, cards, lang = 'tr' } = params;
    const isTr = lang.toLowerCase().startsWith('tr');
    const emailSubject = isTr
      ? `⚡ Naponi - Sadakat Kartı Erişim Bağlantınız`
      : `⚡ Naponi - Your Digital Loyalty Cards`;

    const cardsHtml = cards
      .map(
        (c) => `
        <div style="background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${c.businessName}</div>
          <div style="font-size: 12.5px; color: #94a3b8; margin-bottom: 10px;">${c.programName} &bull; ${c.currentStamps} / ${c.targetStamps} ${isTr ? 'Damga' : 'Stamps'}</div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #38bdf8;">${c.cardCode}</span>
            <a href="${c.cardUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 600;">${isTr ? 'Kartı Aç &rarr;' : 'Open Card &rarr;'}</a>
          </div>
        </div>
      `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout: fixed; background-color: #070a13; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellspacing="0" cellpadding="0" width="100%" style="max-width: 540px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
          <tr>
            <td style="padding: 28px 40px 20px 40px; text-align: center; background: #0f172a;">
              <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="135" />
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">${isTr ? 'Kayıtlı Sadakat Kartlarınız 💳' : 'Your Digital Loyalty Cards 💳'}</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                ${isTr
                  ? 'E-posta adresinize bağlı aktif sadakat kartlarınız aşağıda listelenmiştir. Dilediğiniz kartı açarak kaldığınız yerden damga biriktirmeye devam edebilirsiniz.'
                  : 'Your active loyalty cards linked to this email address are listed below. Click on any card to continue collecting stamps.'}
              </p>
              ${cardsHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: #0b1120; padding: 18px 40px; text-align: center;">
              <p style="margin: 0; font-size: 11.5px; color: #475569;">© 2026 Naponi Teknoloji</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = isTr
      ? `Kayıtlı Sadakat Kartlarınız:\n${cards.map((c) => `${c.businessName} (${c.programName}) - ${c.currentStamps}/${c.targetStamps} Damga: ${c.cardUrl}`).join('\n')}`.trim()
      : `Your Loyalty Cards:\n${cards.map((c) => `${c.businessName} (${c.programName}) - ${c.currentStamps}/${c.targetStamps} Stamps: ${c.cardUrl}`).join('\n')}`.trim();

    return this.sendEmail(to, emailSubject, htmlContent, textContent);
  }
}

export const emailService = new EmailService();
