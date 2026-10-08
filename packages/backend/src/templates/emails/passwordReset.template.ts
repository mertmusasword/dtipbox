import { renderBaseEmailLayout } from './base.layout';

export interface PasswordResetEmailParams {
  resetUrl: string;
  lang?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderPasswordResetEmail(params: PasswordResetEmailParams): RenderedEmail {
  const { resetUrl, lang = 'tr' } = params;
  const isTr = lang.toLowerCase().startsWith('tr');
  const subject = isTr ? '⚡ Naponi - Şifre Sıfırlama Talebi' : '⚡ Naponi - Password Reset Request';

  const contentHtml = `
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
  `;

  const html = renderBaseEmailLayout({
    title: subject,
    isTr,
    accentGradient: 'linear-gradient(90deg, #38bdf8, #3b82f6, #818cf8)',
    badge: {
      text: isTr ? '🔒 Güvenlik Talebi' : '🔒 Security Request',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.25)',
      color: '#38bdf8',
    },
    contentHtml,
  });

  const text = isTr
    ? `Naponi - Şifre Sıfırlama Talebi\n\nHesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi yenilemek için aşağıdaki bağlantıyı ziyaret edebilirsiniz (1 saat geçerlidir):\n${resetUrl}\n\nEğer bu talebi siz yapmadıysanız bu mesajı dikkate almayınız.`.trim()
    : `Naponi - Password Reset Request\n\nA password reset was requested for your Naponi account. Visit the following link to reset your password (valid for 1 hour):\n${resetUrl}\n\nIf you did not make this request, please ignore this email.`.trim();

  return { subject, html, text };
}
