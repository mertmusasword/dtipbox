import { env } from '../../config/env';
import { RenderedEmail } from './passwordReset.template';

export interface PartnerAdminNotificationParams {
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
}

export interface PartnerConfirmationParams {
  to: string;
  companyName: string;
  contactName: string;
  applicationId: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderPartnerApplicationAdminNotificationEmail(params: PartnerAdminNotificationParams): RenderedEmail {
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
  const emailSubject = `🤝 Yeni Teknoloji Partner Başvurusu [#${shortId}]: ${companyName} (${companyType})`;

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

  const appUrl = env.APP_URL || 'https://www.naponi.com';
  const adminPanelUrl = `${appUrl}/admin/partner-applications`;

  const html = `
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

  const text = `
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

  return { subject: emailSubject, html, text };
}

export function renderPartnerApplicationConfirmationEmail(params: PartnerConfirmationParams): RenderedEmail {
  const { companyName, contactName, applicationId } = params;
  const shortId = applicationId.slice(0, 8).toUpperCase();
  const emailSubject = `⚡ Naponi Teknoloji Partnerliği Başvurunuz Alındı [#${shortId}]`;

  const html = `
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

  const text = `
Naponi Teknoloji Partnerliği Başvurunuz Alındı [#${shortId}]

Merhaba Sayın ${contactName},

${companyName} adına iletmiş olduğunuz Naponi Teknoloji Partnerliği başvurunuz sistemimize ulaştı. 
B2B iş geliştirme ve entegrasyon ekibimiz başvurunuzu incelemekte olup en kısa sürede sizinle iletişime geçecektir.

Her türlü soru ve talebiniz için: info@naponi.com
  `.trim();

  return { subject: emailSubject, html, text };
}
