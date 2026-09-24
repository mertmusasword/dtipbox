import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n';
import { LegalTab } from './LegalModal';

const STORAGE_KEY = 'naponi_cookie_consent';

interface CookieTranslations {
  ariaLabel: string;
  title: string;
  complianceBadge: string;
  descBefore: string;
  cookiePolicy: string;
  descMiddle: string;
  dataNotice: string;
  descAfter: string;
  essentialOnly: string;
  acceptAll: string;
  close: string;
}

const cookieLocales: Record<string, CookieTranslations> = {
  tr: {
    ariaLabel: 'Çerez Bilgilendirme ve Onay Bildirimi',
    title: 'Çerez Tercihleri ve Gizlilik Bildirimi',
    complianceBadge: 'KVKK & GDPR',
    descBefore: 'Sitemizde temel fonksiyonlar, güvenli oturum yönetimi ve anonim trafik analitiği için çerezler kullanılmaktadır. Haklarınız ve tercihleriniz için ',
    cookiePolicy: 'Çerez Politikası',
    descMiddle: ' ve ',
    dataNotice: 'KVKK Metnini',
    descAfter: ' inceleyebilirsiniz.',
    essentialOnly: 'Sadece Zorunlu Olanlar',
    acceptAll: 'Tümünü Kabul Et',
    close: 'Kapat',
  },
  en: {
    ariaLabel: 'Cookie Consent Banner',
    title: 'Cookie Preferences & Privacy Notice',
    complianceBadge: 'KVKK & GDPR',
    descBefore: 'We deploy essential cookies for platform security, session handling, and anonymized performance analytics. Review our ',
    cookiePolicy: 'Cookie Policy',
    descMiddle: ' and ',
    dataNotice: 'Data Notice',
    descAfter: ' for details.',
    essentialOnly: 'Essential Only',
    acceptAll: 'Accept All',
    close: 'Close',
  },
  de: {
    ariaLabel: 'Cookie-Einwilligungsbanner',
    title: 'Cookie-Einstellungen & Datenschutzerklärung',
    complianceBadge: 'DSGVO & ePrivacy',
    descBefore: 'Wir verwenden essenzielle Cookies für Plattform-Sicherheit, Sitzungsverwaltung und anonymisierte Leistungsanalysen. Lesen Sie unsere ',
    cookiePolicy: 'Cookie-Richtlinie',
    descMiddle: ' und den ',
    dataNotice: 'Datenschutzhinweis',
    descAfter: ' für weitere Informationen.',
    essentialOnly: 'Nur Notwendige',
    acceptAll: 'Alle Akzeptieren',
    close: 'Schließen',
  },
  fr: {
    ariaLabel: 'Bannière de consentement aux cookies',
    title: 'Préférences de cookies et confidentialité',
    complianceBadge: 'RGPD & ePrivacy',
    descBefore: 'Nous utilisons des cookies essentiels pour la sécurité, la gestion des sessions et l\'analyse anonyme des performances. Consultez notre ',
    cookiePolicy: 'Politique de Cookies',
    descMiddle: ' et nos ',
    dataNotice: 'Mentions Légales',
    descAfter: ' pour plus de détails.',
    essentialOnly: 'Essentiels Uniquement',
    acceptAll: 'Tout Accepter',
    close: 'Fermer',
  },
  es: {
    ariaLabel: 'Banner de consentimiento de cookies',
    title: 'Preferencias de cookies y privacidad',
    complianceBadge: 'RGPD & ePrivacy',
    descBefore: 'Utilizamos cookies esenciales para la seguridad de la plataforma, la gestión de sesiones y el análisis de rendimiento anónimo. Consulte nuestra ',
    cookiePolicy: 'Política de Cookies',
    descMiddle: ' y el ',
    dataNotice: 'Aviso de Privacidad',
    descAfter: ' para más detalles.',
    essentialOnly: 'Solo Esenciales',
    acceptAll: 'Aceptar Todo',
    close: 'Cerrar',
  },
  ja: {
    ariaLabel: 'Cookie同意バナー',
    title: 'Cookie設定およびプライバシー通知',
    complianceBadge: 'GDPR & APPI',
    descBefore: '当サイトでは、セキュリティ確保、セッション管理、匿名のアクセス解析のために必要不可欠なCookieを使用しています。詳細は',
    cookiePolicy: 'クッキーポリシー',
    descMiddle: 'および',
    dataNotice: 'プライバシー通知',
    descAfter: 'をご確認ください。',
    essentialOnly: '必須のみ',
    acceptAll: 'すべて同意',
    close: '閉じる',
  },
  zh: {
    ariaLabel: 'Cookie 同意横幅',
    title: 'Cookie 偏好与隐私声明',
    complianceBadge: 'PIPL & GDPR',
    descBefore: '我们使用必要的 Cookie 来保障平台安全、维持安全会话以及进行匿名性能分析。详情请查阅我们的',
    cookiePolicy: 'Cookie 政策',
    descMiddle: '与',
    dataNotice: '数据合规说明',
    descAfter: '。',
    essentialOnly: '仅必要',
    acceptAll: '全部接受',
    close: '关闭',
  },
  ru: {
    ariaLabel: 'Баннер согласия на использование файлов cookie',
    title: 'Настройки cookie и конфиденциальность',
    complianceBadge: 'GDPR & 152-ФЗ',
    descBefore: 'Мы используем обязательные файлы cookie для безопасности платформы, управления сессиями и анонимной аналитики. Ознакомьтесь с нашей ',
    cookiePolicy: 'Политикой cookie',
    descMiddle: ' и ',
    dataNotice: 'Уведомлением о конфиденциальности',
    descAfter: ' для подробностей.',
    essentialOnly: 'Только обязательные',
    acceptAll: 'Принять все',
    close: 'Закрыть',
  },
  ar: {
    ariaLabel: 'إشعار الموافقة على ملفات تعريف الارتباط',
    title: 'تفضيلات ملفات تعريف الارتباط وإشعار الخصوصية',
    complianceBadge: 'GDPR & حماية البيانات',
    descBefore: 'نستخدم ملفات تعريف الارتباط الأساسية لأمان المنصة وإدارة الجلسات والتحليلات مجهولة المصدر. يُرجى مراجعة ',
    cookiePolicy: 'سياسة ملفات تعريف الارتباط',
    descMiddle: ' و ',
    dataNotice: 'إشعار حماية البيانات',
    descAfter: ' للاطلاع على التفاصيل.',
    essentialOnly: 'الأساسية فقط',
    acceptAll: 'قبول الكل',
    close: 'إغلاق',
  },
  pt: {
    ariaLabel: 'Aviso de consentimento de cookies',
    title: 'Preferências de cookies e privacidade',
    complianceBadge: 'RGPD & LGPD',
    descBefore: 'Utilizamos cookies essenciais para segurança da plataforma, gestão de sessões e análise anónima de desempenho. Consulte a nossa ',
    cookiePolicy: 'Política de Cookies',
    descMiddle: ' e o ',
    dataNotice: 'Aviso de Privacidade',
    descAfter: ' para mais informações.',
    essentialOnly: 'Apenas Essenciais',
    acceptAll: 'Aceitar Tudo',
    close: 'Fechar',
  },
  id: {
    ariaLabel: 'Banner persetujuan cookie',
    title: 'Preferensi Cookie & Privasi',
    complianceBadge: 'UU PDP & GDPR',
    descBefore: 'Kami menggunakan cookie esensial untuk keamanan platform, pengelolaan sesi, dan analisis performa anonim. Pelajari ',
    cookiePolicy: 'Kebijakan Cookie',
    descMiddle: ' dan ',
    dataNotice: 'Pemberitahuan Data',
    descAfter: ' kami untuk detail selengkapnya.',
    essentialOnly: 'Hanya Esensial',
    acceptAll: 'Terima Semua',
    close: 'Tutup',
  },
};

interface CookieBannerProps {
  onOpenLegalModal: (tab: LegalTab) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegalModal }) => {
  const { language } = useLanguage();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Show after brief natural delay so it doesn't jarringly block initial render
        const timer = setTimeout(() => {
          setVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access blocked or restricted
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted_all');
    } catch {}
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'essential_only');
    } catch {}
    setVisible(false);
  };

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  const loc = cookieLocales[language] || cookieLocales.en;
  const isRtl = language === 'ar';

  return (
    <aside 
      aria-label={loc.ariaLabel}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '1rem',
        right: '1rem',
        zIndex: 9990,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div 
        style={{
          pointerEvents: 'auto',
          maxWidth: '1080px',
          width: '100%',
          background: 'rgba(13, 19, 34, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '1.15rem 1.5rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
          animation: 'fadeInSlideUp 0.3s ease-out forwards',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            <Cookie size={20} color="#34d399" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                {loc.title}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                {loc.complianceBadge}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {loc.descBefore}
              <button
                type="button"
                onClick={() => onOpenLegalModal('cookies')}
                style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
              >
                {loc.cookiePolicy}
              </button>
              {loc.descMiddle}
              <button
                type="button"
                onClick={() => onOpenLegalModal('kvkk')}
                style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
              >
                {loc.dataNotice}
              </button>
              {loc.descAfter}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleAcceptEssential}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '0.5rem 0.9rem',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loc.essentialOnly}
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem 1.15rem',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <ShieldCheck size={15} />
            <span>{loc.acceptAll}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={loc.close}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
