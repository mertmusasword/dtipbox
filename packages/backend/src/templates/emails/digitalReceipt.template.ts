import { RenderedEmail } from './passwordReset.template';

export interface DigitalReceiptParams {
  businessName: string;
  referenceNo: string;
  amount: number | string;
  currency: string;
  paymentMethod: string;
  dateStr?: string;
  tableName?: string | null;
  staffName?: string | null;
  lang?: string;
}

export function renderDigitalReceiptEmail(payload: DigitalReceiptParams): RenderedEmail {
  const isTr = (payload.lang || 'tr').toLowerCase().startsWith('tr');
  const subject = isTr
    ? `🧾 ${payload.businessName} - Dijital Bahşiş Makbuzunuz [${payload.referenceNo}]`
    : `🧾 ${payload.businessName} - Your Digital Tip Receipt [${payload.referenceNo}]`;

  const formattedAmount = `${Number(payload.amount).toFixed(2)} ${payload.currency || 'TRY'}`;
  const dateFormatted = payload.dateStr || new Date().toLocaleString(isTr ? 'tr-TR' : 'en-US');

  const html = `
<!DOCTYPE html>
<html lang="${isTr ? 'tr' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Line -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #059669, #10b981, #34d399);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; text-align: center; border-bottom: 1px solid #f5f5f4;">
              <a href="https://www.naponi.com" style="text-decoration: none; display: inline-block;">
                <img src="https://www.naponi.com/naponi-brand.png" alt="Naponi" width="130" style="display: block; width: 130px; height: auto; margin: 0 auto 12px auto; border: 0;" />
              </a>
              <div style="display: inline-block; background-color: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.25); color: #059669; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.4px;">
                ✓ ${isTr ? 'DOĞRULANMIŞ DİJİTAL FİŞ' : 'VERIFIED DIGITAL RECEIPT'}
              </div>
            </td>
          </tr>

          <!-- Business Details & Amount -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #1c1917;">${payload.businessName}</h2>
              <p style="margin: 4px 0 20px 0; font-size: 13px; color: #78716c;">
                ${isTr ? 'Bahşiş Ödemeniz Başarıyla Kaydedildi' : 'Your Tip Payment Has Been Recorded'}
              </p>

              <!-- Total Amount Callout -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf9f6; border: 1.5px dashed #d6d3d1; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <div style="font-size: 13px; font-weight: 600; color: #78716c; margin-bottom: 4px;">
                      ${isTr ? 'Bahşiş Tutarı' : 'Tip Amount'}
                    </div>
                    <div style="font-size: 32px; font-weight: 800; color: #059669; letter-spacing: -0.02em;">
                      ${formattedAmount}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Detailed Key-Value Rows -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13.5px; line-height: 1.6;">
                <tr>
                  <td style="padding: 7px 0; color: #78716c; text-align: left;">${isTr ? 'Referans No:' : 'Reference No:'}</td>
                  <td style="padding: 7px 0; font-family: monospace; font-weight: 700; color: #059669; text-align: right;">${payload.referenceNo}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #78716c; text-align: left; border-top: 1px solid #f5f5f4;">${isTr ? 'Tarih & Saat:' : 'Date & Time:'}</td>
                  <td style="padding: 7px 0; font-weight: 600; color: #1c1917; text-align: right; border-top: 1px solid #f5f5f4;">${dateFormatted}</td>
                </tr>
                ${payload.tableName ? `
                <tr>
                  <td style="padding: 7px 0; color: #78716c; text-align: left; border-top: 1px solid #f5f5f4;">${isTr ? 'Masa:' : 'Table:'}</td>
                  <td style="padding: 7px 0; font-weight: 600; color: #1c1917; text-align: right; border-top: 1px solid #f5f5f4;">${payload.tableName}</td>
                </tr>` : ''}
                ${payload.staffName ? `
                <tr>
                  <td style="padding: 7px 0; color: #78716c; text-align: left; border-top: 1px solid #f5f5f4;">${isTr ? 'Personel:' : 'Staff:'}</td>
                  <td style="padding: 7px 0; font-weight: 600; color: #1c1917; text-align: right; border-top: 1px solid #f5f5f4;">${payload.staffName}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 7px 0; color: #78716c; text-align: left; border-top: 1px solid #f5f5f4;">${isTr ? 'Ödeme Türü:' : 'Payment Type:'}</td>
                  <td style="padding: 7px 0; font-weight: 600; color: #1c1917; text-align: right; border-top: 1px solid #f5f5f4;">${payload.paymentMethod}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #faf9f6; padding: 20px 32px; text-align: center; border-top: 1px solid #e7e5e4;">
              <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; color: #57534e; text-align: left; line-height: 1.4;">
                <strong style="color: #059669;">🛡️ ${isTr ? 'Güvenlik & Nakit İade Yasağı (AML):' : 'Security & AML Refund Policy:'}</strong>
                ${isTr
                  ? 'Dijital bahşişler mevzuat gereğince işletme veya personel tarafından elden nakit olarak iade edilemez. İadeler münhasıran orijinal ödeme kanalına (kart veya banka hesabına) yapılabilir.'
                  : 'Under financial compliance & AML regulations, digital gratuities cannot be refunded in physical cash. Approved refunds are issued strictly to the original funding source.'}
              </div>
              <p style="margin: 0 0 6px 0; font-size: 11.5px; color: #78716c;">
                ${isTr
                  ? 'Bu dijital makbuz, Naponi Smart QR Platformu üzerinden otomatik olarak iletilmiştir.'
                  : 'This digital receipt was automatically generated via the Naponi Smart QR Platform.'}
              </p>
              <p style="margin: 0; font-size: 11px; color: #a8a29e;">
                Naponi Teknoloji A.Ş. • <a href="mailto:info@naponi.com" style="color: #059669; text-decoration: none;">info@naponi.com</a> • <a href="https://www.naponi.com" style="color: #059669; text-decoration: none;">www.naponi.com</a>
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
    ? `NAPONI DİJİTAL BAHŞİŞ MAKBUZU\n\nİşletme: ${payload.businessName}\nReferans No: ${payload.referenceNo}\nTarih: ${dateFormatted}\n${payload.tableName ? `Masa: ${payload.tableName}\n` : ''}${payload.staffName ? `Personel: ${payload.staffName}\n` : ''}Ödeme Türü: ${payload.paymentMethod}\nBahşiş Tutarı: ${formattedAmount}\n\nNaponi Smart QR Platformu tarafından doğrulanmıştır.\nDestek: info@naponi.com | https://www.naponi.com`
    : `NAPONI DIGITAL TIP RECEIPT\n\nBusiness: ${payload.businessName}\nReference No: ${payload.referenceNo}\nDate: ${dateFormatted}\n${payload.tableName ? `Table: ${payload.tableName}\n` : ''}${payload.staffName ? `Staff: ${payload.staffName}\n` : ''}Payment Type: ${payload.paymentMethod}\nTip Amount: ${formattedAmount}\n\nVerified by Naponi Smart QR Platform.\nSupport: info@naponi.com | https://www.naponi.com`;

  return { subject, html, text };
}
