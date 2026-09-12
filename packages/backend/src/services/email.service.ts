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
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    const subject = '⚡ Naponi - Şifre Sıfırlama Talebi';

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
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
            <td style="padding: 36px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <a href="${env.APP_URL}" style="text-decoration: none; display: inline-block;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <img src="${env.APP_URL}/logo.png" alt="Naponi" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);" />
                          </td>
                          <td style="padding-left: 12px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">
                            Naponi
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); color: #38bdf8; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
                      🔒 Güvenlik Talebi
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
                Şifre Sıfırlama Talebi
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Naponi hesabınız için bir şifre yenileme talebinde bulunuldu. Hesabınıza güvenle erişebilmeniz ve yeni şifrenizi oluşturmak için aşağıdaki butona tıklayabilirsiniz.
              </p>

              <!-- Expiry Alert Pill -->
              <div style="margin-bottom: 28px; background-color: #131d35; border: 1px solid #1e3a8a; border-radius: 10px; padding: 12px 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 20px; font-size: 14px; vertical-align: middle;">⏱️</td>
                    <td style="font-size: 13px; color: #93c5fd; font-weight: 500; padding-left: 8px;">
                      Bu bağlantı güvenlik sebebiyle <strong>60 dakika</strong> boyunca geçerlidir.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Action Button CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5); letter-spacing: 0.2px;">
                  Şifremi Sıfırla &rarr;
                </a>
              </div>

              <!-- Security Notice Box -->
              <div style="background-color: rgba(15, 23, 42, 0.6); border-left: 3px solid #38bdf8; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-top: 32px;">
                <p style="margin: 0; font-size: 12.5px; line-height: 1.6; color: #64748b;">
                  <strong style="color: #cbd5e1;">Bu işlemi siz başlatmadıysanız:</strong> Bu e-postayı güvenle dikkate almayabilirsiniz. Mevcut şifreniz değişmeden kalacaktır.
                </p>
              </div>

              <!-- Fallback Link Section -->
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #1e293b;">
                <p style="margin: 0 0 8px 0; font-size: 11.5px; color: #64748b;">
                  Buton çalışmıyorsa aşağıdaki güvenli bağlantıyı tarayıcınıza kopyalayabilirsiniz:
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
                © 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                Bu otomatik bir güvenlik bildirimidir. Lütfen bu e-postayı doğrudan yanıtlamayınız.
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
Naponi - Şifre Sıfırlama Talebi

Hesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi yenilemek için aşağıdaki bağlantıyı ziyaret edebilirsiniz (1 saat geçerlidir):
${resetUrl}

Eğer bu talebi siz yapmadıysanız bu mesajı dikkate almayınız.
    `.trim();

    return this.sendEmail(to, subject, htmlContent, textContent);
  }

  /**
   * Send Business Welcome & Onboarding Guide Email
   */
  async sendBusinessWelcomeEmail(to: string, businessName: string): Promise<boolean> {
    const subject = `⚡ Naponi'ye Hoş Geldiniz! İşletmenizi 3 Adımda Hazırlayın`;
    const loginUrl = `${env.APP_URL}/login`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
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
            <td style="padding: 36px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <a href="${env.APP_URL}" style="text-decoration: none; display: inline-block;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <img src="${env.APP_URL}/logo.png" alt="Naponi" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);" />
                          </td>
                          <td style="padding-left: 12px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">
                            Naponi
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
                      🏢 İşletme Hesabı
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
                Aramıza Hoş Geldiniz, <span style="color: #38bdf8;">${businessName}</span>! 🎉
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Müşterilerinizden kredi kartı ile doğrudan masada veya kasada temassız bahşiş toplamanızı sağlayan yeni nesil dijital bahşiş sistemine hoş geldiniz. İşletmenizi hemen faaliyete geçirmek için aşağıdaki 3 kolay adımı takip edebilirsiniz:
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
                        Personellerinizi Ekleyin
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        Ekip üyelerinizi tanımlayın; her çalışanınız için kişisel bahşiş profili ve performansı otomatik oluşsun.
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
                        Masa & Personel QR Kodlarınızı İndirin
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        Masalarınız veya personelleriniz için dinamik QR kodları panelinizden tek tıkla indirin ve yazdırın.
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
                        Ödeme Bilgilerinizi Bağlayın
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        Bahşişlerin kesintisiz aktarılması için ödeme/banka hesabınızı tanımlayın ve hemen kazanmaya başlayın.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5); letter-spacing: 0.2px;">
                  Yönetim Paneline Git &rarr;
                </a>
              </div>

              <!-- Support Contact Box -->
              <div style="background-color: rgba(15, 23, 42, 0.6); border-left: 3px solid #10b981; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-top: 32px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                  <strong>Yardıma mı ihtiyacınız var?</strong> Kurulum, QR kartlıklar veya ödeme entegrasyonuyla ilgili her konuda <a href="mailto:info@naponi.com" style="color: #38bdf8; text-decoration: none; font-weight: 600;">info@naponi.com</a> adresinden bize dilediğiniz an ulaşabilirsiniz.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                © 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                Bu e-posta Naponi platformuna kayıt olan işletmelere bilgilendirme amacıyla gönderilmiştir.
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
Naponi'ye Hoş Geldiniz, ${businessName}!

Müşterilerinizden kredi kartı ile doğrudan masada veya kasada dijital bahşiş toplamanızı sağlayan yeni nesil sisteme hoş geldiniz.

İşletmenizi hemen faaliyete geçirmek için:
1. Personellerinizi Ekleyin: Ekip üyelerinizi tanımlayın.
2. Masa & Personel QR Kodlarınızı İndirin: Panelinizden QR kodları indirin ve bastırın.
3. Ödeme Bilgilerinizi Bağlayın: Bahşiş aktarımı için bilgilerinizi tamamlayın.

Yönetim Paneli: ${loginUrl}
Sorularınız için: info@naponi.com
    `.trim();

    return this.sendEmail(to, subject, htmlContent, textContent);
  }

  /**
   * Send Employee Welcome & Orientation Email
   */
  async sendEmployeeWelcomeEmail(to: string, employeeName: string, businessName: string): Promise<boolean> {
    const subject = `⚡ ${businessName} Ekibine Hoş Geldiniz! Dijital Bahşiş Profiliniz Hazır`;
    const loginUrl = `${env.APP_URL}/login`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
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
            <td style="padding: 36px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <a href="${env.APP_URL}" style="text-decoration: none; display: inline-block;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <img src="${env.APP_URL}/logo.png" alt="Naponi" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);" />
                          </td>
                          <td style="padding-left: 12px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">
                            Naponi
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
                      👤 Personel Hesabı
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
                Merhaba ${employeeName}, Hoş Geldin! 👋
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                <strong style="color: #f8fafc;">${businessName}</strong> işletmesi seni Naponi dijital bahşiş sistemine ekledi! Artık misafirlerinden kredi kartı ile doğrudan sana özel dijital bahşiş toplayabilirsin.
              </p>

              <!-- Feature 1 -->
              <div style="margin-bottom: 14px; background-color: #131d35; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 16px;">
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="width: 24px; font-size: 18px; vertical-align: top;">📱</td>
                    <td style="padding-left: 12px;">
                      <div style="font-size: 13.5px; font-weight: 600; color: #f8fafc; margin-bottom: 2px;">
                        Sana Özel Kişisel QR Kod
                      </div>
                      <div style="font-size: 12.5px; color: #94a3b8; line-height: 1.4;">
                        Misafirler telefon kameralarıyla QR kodunu okutarak saniyeler içinde sana teşekkür bahşişi gönderebilir.
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
                        Anlık & Şeffaf Kazanç Takibi
                      </div>
                      <div style="font-size: 12.5px; color: #94a3b8; line-height: 1.4;">
                        Topladığın bahşişleri ve performansını personel panelinden dilediğin an şeffaf şekilde izleyebilirsin.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Account Info Pill -->
              <div style="margin-top: 24px; margin-bottom: 28px; background-color: #0b1120; border: 1px dashed #334155; border-radius: 10px; padding: 12px 16px; text-align: center;">
                <span style="font-size: 12px; color: #94a3b8;">Kayıtlı E-posta Adresiniz:</span>
                <span style="font-size: 13px; color: #38bdf8; font-weight: 600; margin-left: 6px;">${to}</span>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5); letter-spacing: 0.2px;">
                  Personel Paneline Giriş Yap &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                © 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                Bu e-posta ${businessName} işletmesi tarafından personel kaydınız yapıldığı için iletilmiştir.
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
Merhaba ${employeeName}, Hoş Geldin!

${businessName} işletmesi seni Naponi dijital bahşiş sistemine ekledi. Artık misafirlerinden kredi kartı ile doğrudan sana özel dijital bahşiş toplayabilirsin!

Giriş E-postası: ${to}
Personel Paneli: ${loginUrl}
    `.trim();

    return this.sendEmail(to, subject, htmlContent, textContent);
  }
}

export const emailService = new EmailService();
