import { env } from '../../config/env';
import { renderBaseEmailLayout } from './base.layout';
import { RenderedEmail } from './passwordReset.template';

export interface BusinessWelcomeEmailParams {
  businessName: string;
  lang?: string;
}

export function renderBusinessWelcomeEmail(params: BusinessWelcomeEmailParams): RenderedEmail {
  const { businessName, lang = 'tr' } = params;
  const isTr = lang.toLowerCase().startsWith('tr');
  const subject = isTr
    ? `⚡ Naponi'ye Hoş Geldiniz! İşletmenizi 3 Adımda Hazırlayın`
    : `⚡ Welcome to Naponi! Set Up Your Business in 3 Steps`;
  const appUrl = env.APP_URL || 'https://www.naponi.com';
  const loginUrl = `${appUrl}/login`;

  const contentHtml = `
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
  `;

  const html = renderBaseEmailLayout({
    title: subject,
    isTr,
    accentGradient: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)',
    badge: {
      text: isTr ? '🏢 İşletme Hesabı' : '🏢 Business Account',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      color: '#34d399',
    },
    contentHtml,
    footerDisclaimer: isTr
      ? 'Bu e-posta Naponi platformuna kayıt olan işletmelere bilgilendirme amacıyla gönderilmiştir.'
      : 'This email was sent to notify registered businesses on the Naponi platform.',
  });

  const text = isTr
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

  return { subject, html, text };
}
