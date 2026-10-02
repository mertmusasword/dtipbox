import React from 'react';

interface BadgeProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Apple Pay Official-styled Vector Badge
 */
export const ApplePayBadge: React.FC<BadgeProps> = ({ height = 24, className = '', style }) => {
  // Proportions: 50 x 30
  const width = Math.round(height * (50 / 30));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '5px', overflow: 'hidden', flexShrink: 0, ...style }}
      aria-label="Apple Pay"
      role="img"
    >
      <rect width="50" height="30" rx="5" fill="#000000" />
      {/* Apple Logo */}
      <path
        d="M15.45 15.22c-.02-2.15 1.76-3.19 1.84-3.25-1.01-1.46-2.57-1.66-3.12-1.68-1.33-.14-2.6.79-3.28.79-.68 0-1.72-.77-2.83-.75-1.45.02-2.79.85-3.54 2.15-1.52 2.63-.39 6.51 1.08 8.63.72 1.03 1.57 2.18 2.69 2.14 1.08-.05 1.49-.7 2.81-.7 1.3 0 1.69.7 2.82.68 1.15-.02 1.89-1.05 2.59-2.08.83-1.19 1.15-2.35 1.18-2.41-.02-.01-2.26-.87-2.24-3.52z M13.58 8.99c.59-.72 1-1.72.88-2.73-.85.03-1.9.58-2.5 1.29-.53.62-1.01 1.64-.88 2.63.95.08 1.91-.47 2.5-1.19z"
        fill="#FFFFFF"
      />
      {/* P */}
      <path
        d="M21.2 10.3h3.6c2 0 3.4 1.1 3.4 2.9 0 1.8-1.4 2.9-3.4 2.9h-2v4.8h-1.6V10.3zm1.6 4.4h1.9c1.1 0 1.8-.6 1.8-1.5s-.7-1.5-1.8-1.5h-1.9v3z"
        fill="#FFFFFF"
      />
      {/* a */}
      <path
        d="M32.5 13.4c1.6 0 2.5.9 2.5 2.6v4.9h-1.5v-1.1c-.4.8-1.3 1.3-2.4 1.3-1.5 0-2.5-1-2.5-2.4 0-1.5 1.1-2.3 3.1-2.4l1.6-.1v-.5c0-.9-.6-1.4-1.6-1.4-.8 0-1.5.3-1.8.8l-.9-.9c.6-.8 1.8-1.3 3.5-1.3zm.9 3.8l-1.4.1c-1.2.1-1.8.5-1.8 1.2 0 .8.6 1.2 1.5 1.2 1 0 1.7-.7 1.7-1.6v-.9z"
        fill="#FFFFFF"
      />
      {/* y */}
      <path
        d="M36.4 13.6h1.6l2 5.3 2-5.3h1.6l-2.9 7.3c-.7 1.7-1.6 2.4-2.9 2.4-.5 0-.9-.1-1.1-.2l.3-1.2c.2.1.5.1.8.1.8 0 1.4-.5 1.7-1.5l.2-.6-2.4-6.3z"
        fill="#FFFFFF"
      />
    </svg>
  );
};

/**
 * Google Pay Official-styled Vector Badge
 */
export const GooglePayBadge: React.FC<BadgeProps> = ({ height = 24, className = '', style }) => {
  const width = Math.round(height * (50 / 30));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '5px', overflow: 'hidden', flexShrink: 0, ...style }}
      aria-label="Google Pay"
      role="img"
    >
      <rect width="50" height="30" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
      {/* Google G multi-color icon */}
      <g transform="translate(6, 6) scale(0.72)">
        <path
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.5-5.2 3.5-9z"
          fill="#4285F4"
        />
        <path
          d="M12 24c3.2 0 6-1.1 8-3l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5H1.1v3.2C3.1 21.3 7.2 24 12 24z"
          fill="#34A853"
        />
        <path
          d="M5.2 14.1c-.3-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V6.7H1.1C.4 8.1 0 9.7 0 11.5s.4 3.4 1.1 4.8l4.1-3.2z"
          fill="#FBBC05"
        />
        <path
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.2 0 3.1 2.7 1.1 6.7l4.1 3.2c1-2.9 3.7-5.1 6.8-5.1z"
          fill="#EA4335"
        />
      </g>
      {/* Pay text in Google Sans dark grey */}
      <path
        d="M24.8 10.5h2.9c1.6 0 2.7.9 2.7 2.3 0 1.4-1.1 2.3-2.7 2.3h-1.6v3.9h-1.3v-8.5zm1.3 3.6h1.5c.9 0 1.5-.5 1.5-1.2 0-.8-.6-1.2-1.5-1.2h-1.5v2.4z"
        fill="#5F6368"
      />
      <path
        d="M33.9 13c1.3 0 2 .7 2 2.1v3.9h-1.2v-.9c-.3.6-1 1-1.9 1-1.2 0-2-.8-2-1.9 0-1.2.9-1.8 2.5-1.9l1.3-.1v-.4c0-.7-.5-1.1-1.3-1.1-.7 0-1.2.3-1.5.6l-.7-.7c.5-.7 1.4-1 2.8-1zm.7 3l-1.1.1c-1 .1-1.4.4-1.4 1 0 .6.5 1 1.2 1 .8 0 1.3-.5 1.3-1.3v-.8z"
        fill="#5F6368"
      />
      <path
        d="M37 13.2h1.3l1.6 4.2 1.6-4.2h1.3l-2.3 5.8c-.6 1.4-1.3 1.9-2.3 1.9-.4 0-.7-.1-.9-.2l.3-1c.2.1.4.1.6.1.6 0 1.1-.4 1.4-1.2l.2-.5-1.9-5.1z"
        fill="#5F6368"
      />
    </svg>
  );
};

/**
 * Visa Official-styled Vector Badge
 */
export const VisaBadge: React.FC<BadgeProps> = ({ height = 24, className = '', style }) => {
  const width = Math.round(height * (50 / 30));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '5px', overflow: 'hidden', flexShrink: 0, ...style }}
      aria-label="Visa"
      role="img"
    >
      <rect width="50" height="30" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
      <g transform="translate(8, 8) scale(0.68)">
        {/* V with gold beak */}
        <path
          d="M13.8 0L9.1 20H4.2L0.3 3.6C0.1 2.9 0 2.6 0 2.2c0-1.1.9-1.7 2.3-1.7h7.2c1.3 0 2.4.9 2.7 2.3l1.6 12.2L17.5 0h-3.7z"
          fill="#1A1F71"
        />
        {/* Visa gold accent */}
        <path
          d="M3.1 0H0.1L0 0.5c3.7.9 6.2 3.1 7.2 5.9L6 0.9C5.7.3 4.8 0 3.1 0z"
          fill="#F7B600"
        />
        {/* I */}
        <path d="M22.4 0.5L19.3 20h-4.6L17.8.5h4.6z" fill="#1A1F71" />
        {/* S */}
        <path
          d="M33.8 5.7c-.1-2.2-2.1-3.7-4.8-3.7-3.1 0-5.1 1.7-5.1 3.8 0 1.8 1.6 2.7 2.8 3.3 1.3.6 1.7 1 1.7 1.6 0 .9-1.1 1.3-2.1 1.3-1.7 0-2.7-.3-4.1-1l-.6-.3-.6 3.8c1 .5 2.9.9 4.8.9 4.6 0 7.5-2.2 7.5-5.6 0-3.3-4.5-3.5-4.5-5 0-.5.6-.9 1.8-.9 1.4 0 2.5.3 3.2.7l.4.2.7-3.8z"
          fill="#1A1F71"
        />
        {/* A */}
        <path
          d="M44.4 20h4.2L45 0.5h-3.9c-1.2 0-2.2.7-2.6 1.7L31.2 20h4.8l1-2.7h5.8l1.6 2.7zm-5.8-6.6l2.4-6.6 1.4 6.6h-3.8z"
          fill="#1A1F71"
        />
      </g>
    </svg>
  );
};

/**
 * Mastercard Official-styled Vector Badge
 */
export const MastercardBadge: React.FC<BadgeProps> = ({ height = 24, className = '', style }) => {
  const width = Math.round(height * (50 / 30));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '5px', overflow: 'hidden', flexShrink: 0, ...style }}
      aria-label="Mastercard"
      role="img"
    >
      <rect width="50" height="30" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
      <g transform="translate(10.5, 5.5)">
        {/* Red circle */}
        <circle cx="9.5" cy="9.5" r="9.5" fill="#EB001B" />
        {/* Yellow circle */}
        <circle cx="19.5" cy="9.5" r="9.5" fill="#F79E1B" />
        {/* Intersecting area */}
        <path
          d="M14.5 2.1c1.9 1.8 3 4.4 3 7.4s-1.1 5.6-3 7.4c-1.9-1.8-3-4.4-3-7.4s1.1-5.6 3-7.4z"
          fill="#FF5F00"
        />
      </g>
    </svg>
  );
};

/**
 * Troy (Türkiye'nin Ödeme Yöntemi) Official-styled Vector Badge
 */
export const TroyBadge: React.FC<BadgeProps> = ({ height = 24, className = '', style }) => {
  const width = Math.round(height * (50 / 30));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '5px', overflow: 'hidden', flexShrink: 0, ...style }}
      aria-label="Troy"
      role="img"
    >
      <rect width="50" height="30" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
      <g transform="translate(6.5, 7)">
        {/* TROY text & graphic */}
        <text
          x="1"
          y="12"
          fill="#002D72"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="900"
          letterSpacing="0.8px"
        >
          TR
        </text>
        {/* Stylized Cyan O */}
        <circle cx="21" cy="8" r="4.2" stroke="#00A3E0" strokeWidth="2.4" fill="none" />
        {/* Cyan accent flare on O */}
        <path d="M21 2.5 A5.5 5.5 0 0 1 26 8" stroke="#00A3E0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <text
          x="27"
          y="12"
          fill="#002D72"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="900"
          letterSpacing="0.8px"
        >
          Y
        </text>
      </g>
    </svg>
  );
};

/**
 * American Express Official-styled Vector Badge
 */
export const AmexBadge: React.FC<BadgeProps> = ({ height = 24, className = '', style }) => {
  const width = Math.round(height * (50 / 30));
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: '5px', overflow: 'hidden', flexShrink: 0, ...style }}
      aria-label="American Express"
      role="img"
    >
      <rect width="50" height="30" rx="5" fill="#006FCF" />
      <text
        x="25"
        y="17"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8.5"
        fontWeight="900"
        letterSpacing="0.6px"
      >
        AMEX
      </text>
    </svg>
  );
};

/**
 * Horizontal row of accepted payment badges
 */
export const PaymentMethodsRow: React.FC<{
  height?: number;
  gap?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ height = 22, gap = '6px', className = '', style }) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap,
        ...style,
      }}
    >
      <ApplePayBadge height={height} />
      <GooglePayBadge height={height} />
      <VisaBadge height={height} />
      <MastercardBadge height={height} />
      <TroyBadge height={height} />
      <AmexBadge height={height} />
    </div>
  );
};

const SECURITY_NOTICES: Record<string, { title: string; subtitle: string }> = {
  tr: {
    title: '256-Bit SSL Şifreli Güvenli Ödeme',
    subtitle: 'Apple Pay, Google Pay ve tüm banka / kredi kartları desteklenir. Kart verileriniz Naponi tarafından asla saklanmaz.',
  },
  en: {
    title: '256-Bit SSL Encrypted Secure Checkout',
    subtitle: 'Apple Pay, Google Pay & all major credit/debit cards supported. Card details are never stored by Naponi.',
  },
  de: {
    title: '256-Bit SSL Verschlüsselte Zahlung',
    subtitle: 'Apple Pay, Google Pay und alle gängigen Kreditkarten werden unterstützt. Keine Kartendaten-Speicherung.',
  },
  fr: {
    title: 'Paiement Sécurisé SSL 256-Bit',
    subtitle: 'Apple Pay, Google Pay et toutes les cartes bancaires acceptées. Aucune donnée bancaire conservée par Naponi.',
  },
  es: {
    title: 'Pago Seguro Cifrado SSL de 256 Bits',
    subtitle: 'Compatible con Apple Pay, Google Pay y todas las tarjetas. Naponi nunca almacena sus datos bancarios.',
  },
  pt: {
    title: 'Pagamento Seguro Criptografado SSL 256-Bit',
    subtitle: 'Compatível com Apple Pay, Google Pay e todos os cartões. Dados de cartão nunca são salvos pela Naponi.',
  },
  ru: {
    title: 'Безопасная оплата с 256-битным SSL шифрованием',
    subtitle: 'Поддержка Apple Pay, Google Pay и всех международных банковских карт. Данные карт не сохраняются.',
  },
  ja: {
    title: '256ビットSSL暗号化による安全な決済',
    subtitle: 'Apple Pay、Google Pay、主要クレジットカードに対応。カード情報はNaponiに保存されません。',
  },
  zh: {
    title: '256位SSL银行级加密安全支付',
    subtitle: '全面支持 Apple Pay、Google Pay 及各类银联/主流信用卡。Naponi 绝不存储任何银行卡数据。',
  },
  ar: {
    title: 'دفع آمن ومشفّر بتقنية 256-Bit SSL',
    subtitle: 'يدعم Apple Pay و Google Pay وجميع البطاقات المصرفية. لا يتم حفظ بيانات بطاقتك مطلقاً.',
  },
  id: {
    title: 'Pembayaran Aman Terenkripsi SSL 256-Bit',
    subtitle: 'Mendukung Apple Pay, Google Pay & semua kartu bank. Data kartu Anda tidak pernah disimpan oleh Naponi.',
  },
};

/**
 * Trust & Security guarantee card shown below payment options or the Pay button
 */
export const PaymentTrustGuarantee: React.FC<{
  language?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}> = ({ language = 'tr', compact = false, style }) => {
  const notice = SECURITY_NOTICES[language] || SECURITY_NOTICES.en;

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(245, 245, 244, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(231, 229, 228, 0.7)',
          textAlign: 'center',
          ...style,
        }}
      >
        <PaymentMethodsRow height={20} gap="5px" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#57534E', fontSize: '0.74rem', fontWeight: 600 }}>
          <span>🔒</span>
          <span>{notice.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '0.85rem',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        background: '#FAFAF9',
        border: '1px solid #E7E5E4',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem' }}>🔒</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1C1917' }}>
            {notice.title}
          </span>
        </div>
        <PaymentMethodsRow height={19} gap="4px" />
      </div>
      <div style={{ fontSize: '0.72rem', color: '#78716C', lineHeight: 1.45 }}>
        {notice.subtitle}
      </div>
    </div>
  );
};
