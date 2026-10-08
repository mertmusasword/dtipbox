import { RenderedEmail } from './passwordReset.template';

export interface SupportTicketConfirmationParams {
  to: string;
  name: string;
  ticketId: string;
  subject: string;
  category?: string;
  message: string;
  businessName?: string;
}

export interface SupportTicketAdminParams {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  ticketId: string;
  subject: string;
  category?: string;
  message: string;
}

const categoryLabels: Record<string, string> = {
  POS_INTEGRATION: 'POS & Entegrasyon',
  TECHNICAL_SUPPORT: 'Teknik Destek',
  ACCOUNT_BILLING: 'Hesap & Ödemeler',
  GENERAL_INQUIRY: 'Genel Bilgi Talebi',
  FEEDBACK_SUGGESTION: 'Geri Bildirim & Öneri',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderSupportTicketConfirmationEmail(params: SupportTicketConfirmationParams): RenderedEmail {
  const { name, ticketId, subject: ticketSubject, category, message, businessName } = params;
  const shortId = ticketId.slice(0, 8).toUpperCase();
  const emailSubject = `⚡ Destek Talebiniz Alındı [#${shortId}] - ${ticketSubject}`;

  const categoryLabel = (category && categoryLabels[category]) || category || 'Genel Destek';
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(ticketSubject);
  const safeCategory = escapeHtml(categoryLabel);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const safeBusiness = businessName ? escapeHtml(businessName) : null;

  const html = `
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

  const text = `
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

  return { subject: emailSubject, html, text };
}

export function renderSupportTicketAdminNotificationEmail(params: SupportTicketAdminParams): RenderedEmail {
  const { name, email, phone, businessName, ticketId, subject: ticketSubject, category, message } = params;
  const shortId = ticketId.slice(0, 8).toUpperCase();
  const categoryLabel = (category && categoryLabels[category]) || category || 'Genel';
  const emailSubject = `🚨 Yeni Destek Talebi [#${shortId}]: ${categoryLabel} - ${name}`;

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : 'Belirtilmedi';
  const safeBusiness = businessName ? escapeHtml(businessName) : 'Bireysel / Belirtilmedi';
  const safeSubject = escapeHtml(ticketSubject);
  const safeCategory = escapeHtml(categoryLabel);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const adminPanelUrl = 'https://www.naponi.com/admin/support-tickets';

  const html = `
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

  const text = `
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

  return { subject: emailSubject, html, text };
}
