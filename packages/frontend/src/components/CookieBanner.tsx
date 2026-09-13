import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n';
import { LegalTab } from './LegalModal';

const STORAGE_KEY = 'naponi_cookie_consent';

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

  const isTr = language === 'tr';

  return (
    <aside 
      aria-label={isTr ? 'Çerez Bilgilendirme ve Onay Bildirimi' : 'Cookie Consent Banner'}
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
                {isTr ? 'Çerez Tercihleri ve Gizlilik Bildirimi' : 'Cookie Preferences & Privacy Notice'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                KVKK & GDPR
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {isTr ? (
                <>
                  Sitemizde temel fonksiyonlar, güvenli oturum yönetimi ve anonim trafik analitiği için çerezler kullanılmaktadır. 
                  Haklarınız ve tercihleriniz için{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal('cookies')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
                  >
                    Çerez Politikası
                  </button>
                  {' '}ve{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal('kvkk')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
                  >
                    KVKK Metnini
                  </button>
                  {' '}inceleyebilirsiniz.
                </>
              ) : (
                <>
                  We deploy essential cookies for platform security, session handling, and anonymized performance analytics. 
                  Review our{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal('cookies')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
                  >
                    Cookie Policy
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal('kvkk')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
                  >
                    Data Notice
                  </button>
                  {' '}for details.
                </>
              )}
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
            {isTr ? 'Sadece Zorunlu Olanlar' : 'Essential Only'}
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
            <span>{isTr ? 'Tümünü Kabul Et' : 'Accept All'}</span>
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
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
