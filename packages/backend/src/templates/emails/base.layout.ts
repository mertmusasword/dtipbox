import { env } from '../../config/env';

export interface BaseEmailLayoutOptions {
  title: string;
  isTr: boolean;
  accentGradient?: string;
  badge?: {
    text: string;
    bg?: string;
    border?: string;
    color?: string;
  };
  contentHtml: string;
  footerDisclaimer?: string;
}

/**
 * Standard Naponi Dark Premium Email Layout Wrapper
 * Used across customer, partner, and administrative transactional emails.
 */
export function renderBaseEmailLayout(options: BaseEmailLayoutOptions): string {
  const {
    title,
    isTr,
    accentGradient = 'linear-gradient(90deg, #38bdf8, #3b82f6, #818cf8)',
    badge,
    contentHtml,
    footerDisclaimer,
  } = options;

  const appUrl = env.APP_URL || 'https://www.naponi.com';
  const defaultDisclaimer = isTr
    ? 'Bu otomatik bir güvenlik ve bilgilendirme iletisidir. Lütfen bu e-postayı doğrudan yanıtlamayınız.'
    : 'This is an automated security and notification email. Please do not reply directly to this message.';

  const badgeHtml = badge
    ? `
      <td align="right" style="vertical-align: middle;">
        <span style="display: inline-block; background-color: ${badge.bg || 'rgba(56, 189, 248, 0.1)'}; border: 1px solid ${badge.border || 'rgba(56, 189, 248, 0.25)'}; color: ${badge.color || '#38bdf8'}; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.3px;">
          ${badge.text}
        </span>
      </td>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a13; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Top Accent Gradient Line -->
          <tr>
            <td height="4" style="background: ${accentGradient};"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="${appUrl}" style="text-decoration: none; display: inline-block;">
                      <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="145" height="43" style="display: block; width: 145px; height: auto; border: 0; outline: none; text-decoration: none; color: #ffffff;" />
                    </a>
                  </td>
                  ${badgeHtml}
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
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #0b1120; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; font-weight: 500;">
                ${isTr ? '© 2026 Naponi Teknoloji • Dijital Bahşiş ve Ödeme Çözümleri' : '© 2026 Naponi Technology • Digital Tipping & Payment Solutions'}
              </p>
              <p style="margin: 0; font-size: 11px; color: #334155;">
                ${footerDisclaimer || defaultDisclaimer}
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
}
