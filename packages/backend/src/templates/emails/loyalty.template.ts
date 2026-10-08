import { RenderedEmail } from './passwordReset.template';

export interface LoyaltyCardWelcomeParams {
  businessName: string;
  programName: string;
  cardUrl: string;
  cardCode: string;
  targetStamps: number;
  rewardDescription: string;
  lang?: string;
}

export interface LoyaltyCardRecoveryItem {
  businessName: string;
  programName: string;
  cardUrl: string;
  cardCode: string;
  currentStamps: number;
  targetStamps: number;
}

export interface LoyaltyCardRecoveryParams {
  cards: LoyaltyCardRecoveryItem[];
  lang?: string;
}

export function renderLoyaltyCardWelcomeEmail(params: LoyaltyCardWelcomeParams): RenderedEmail {
  const { businessName, programName, cardUrl, cardCode, targetStamps, rewardDescription, lang = 'tr' } = params;
  const isTr = lang.toLowerCase().startsWith('tr');
  const subject = isTr
    ? `🎁 ${businessName} Sadakat Kartınız Hazır!`
    : `🎁 Your ${businessName} Loyalty Card is Ready!`;

  const html = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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

  const text = isTr
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

  return { subject, html, text };
}

export function renderLoyaltyCardRecoveryEmail(params: LoyaltyCardRecoveryParams): RenderedEmail {
  const { cards, lang = 'tr' } = params;
  const isTr = lang.toLowerCase().startsWith('tr');
  const subject = isTr
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

  const html = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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

  const text = isTr
    ? `Kayıtlı Sadakat Kartlarınız:\n${cards.map((c) => `${c.businessName} (${c.programName}) - ${c.currentStamps}/${c.targetStamps} Damga: ${c.cardUrl}`).join('\n')}`.trim()
    : `Your Loyalty Cards:\n${cards.map((c) => `${c.businessName} (${c.programName}) - ${c.currentStamps}/${c.targetStamps} Stamps: ${c.cardUrl}`).join('\n')}`.trim();

  return { subject, html, text };
}
