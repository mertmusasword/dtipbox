import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone } from 'lucide-react';
import { useLanguage } from '../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user recently dismissed (within 7 days)
    const dismissedAt = localStorage.getItem('naponi_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Handler for native beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 3 seconds after page load before showing prompt
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show prompt after 4 seconds
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('naponi_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(9, 13, 22, 0.98) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.15)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              flexShrink: 0,
            }}
          >
            <Smartphone size={22} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.01em' }}>
              {isTr ? 'Naponi’yi Uygulama Olarak Yükleyin' : 'Install Naponi as an App'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              {isTr
                ? 'Tarayıcı olmadan ana ekranınızdan tek tıkla açın'
                : '1-tap instant access directly from your home screen'}
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Kapat"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {showIosGuide ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            lineHeight: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {isTr ? (
            <div>
              1. Safari alt çubuğundaki <Share2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              <strong>Paylaş</strong> butonuna dokunun.
              <br />
              2. Aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.
            </div>
          ) : (
            <div>
              1. Tap the <Share2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              <strong>Share</strong> icon in the Safari bottom bar.
              <br />
              2. Scroll down and tap <strong>"Add to Home Screen"</strong>.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
          <button
            onClick={handleInstallClick}
            type="button"
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Download size={15} />
            {isTr ? 'Uygulamayı Ekle' : 'Add to Home Screen'}
          </button>
          <button
            onClick={handleDismiss}
            type="button"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              fontSize: '0.85rem',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
            }}
          >
            {isTr ? 'Daha Sonra' : 'Not Now'}
          </button>
        </div>
      )}
    </div>
  );
};
