import { env } from '../../config/env';
import { renderBaseEmailLayout } from './base.layout';
import { RenderedEmail } from './passwordReset.template';

export interface EmployeeWelcomeEmailParams {
  to?: string;
  employeeName: string;
  businessName: string;
  lang?: string;
}

export function renderEmployeeWelcomeEmail(params: EmployeeWelcomeEmailParams): RenderedEmail {
  const { to, employeeName, businessName, lang = 'tr' } = params;
  const isTr = lang.toLowerCase().startsWith('tr');
  const subject = isTr
    ? `⚡ ${businessName} Ekibine Hoş Geldiniz! Dijital Bahşiş Profiliniz Hazır`
    : `⚡ Welcome to ${businessName}! Your Digital Tip Profile is Ready`;
  const appUrl = env.APP_URL || 'https://www.naponi.com';
  const loginUrl = `${appUrl}/login`;

  const contentHtml = `
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
  `;

  const html = renderBaseEmailLayout({
    title: subject,
    isTr,
    accentGradient: 'linear-gradient(90deg, #a855f7, #6366f1, #38bdf8)',
    badge: {
      text: isTr ? '👤 Personel Hesabı' : '👤 Staff Account',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.3)',
      color: '#c084fc',
    },
    contentHtml,
    footerDisclaimer: isTr
      ? `Bu e-posta ${businessName} işletmesi tarafından personel kaydınız yapıldığı için iletilmiştir.`
      : `This email was sent because ${businessName} registered you as a staff member on Naponi.`,
  });

  const text = isTr
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

  return { subject, html, text };
}
