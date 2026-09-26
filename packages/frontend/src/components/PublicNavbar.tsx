import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Headphones } from 'lucide-react';
import { useLanguage, LanguageSelector } from '../i18n';
import { getHomeText } from '../i18n/homeLocales';
import { UserNavbarAction } from './UserNavbarAction';
import { trackBusinessRegisterStarted } from '../analytics';
import '../styles/home.css';

interface PublicNavbarProps {
  badge?: React.ReactNode;
  onRegisterClick?: () => void;
  onSupportClick?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  badge,
  onRegisterClick,
  onSupportClick,
}) => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const isTr = language === 'tr';
  const isHome = location.pathname === '/' || location.pathname === '/tr';
  const ht = (key: any, params?: any) => getHomeText(key, language, params);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Links: on home page, use hash links; on other pages, prefix with '/'
  const howItWorksHref = isHome ? '#how-it-works' : '/#how-it-works';
  const posHref = isHome ? '#pos-integrations' : '/#pos-integrations';
  const diffHref = isHome ? '#naponi-farki' : '/#naponi-farki';
  const indHref = isHome ? '#industries' : '/#industries';
  const faqHref = isHome ? '#faq' : '/#faq';

  const handleRegisterClick = () => {
    trackBusinessRegisterStarted('navbar_cta');
    if (onRegisterClick) onRegisterClick();
  };

  return (
    <>
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Main Navigation">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/" className="home-nav-brand">
              <img
                src="/naponi-brand.svg"
                alt="NAPONI Digital Tipping"
                className="home-brand-logo-img"
              />
            </Link>
            {badge && <div style={{ display: 'inline-flex', alignItems: 'center' }}>{badge}</div>}
          </div>

          <ul className="home-nav-links">
            <li><a href={howItWorksHref} className="home-nav-link">{isTr ? 'Nasıl Çalışır?' : 'How It Works'}</a></li>
            <li><a href={posHref} className="home-nav-link">{isTr ? 'POS Katmanı' : 'POS Layer'}</a></li>
            <li><a href={diffHref} className="home-nav-link">{ht('whyNaponi')}</a></li>
            <li><a href={indHref} className="home-nav-link">{isTr ? 'Sektörler' : 'Industries'}</a></li>
          </ul>

          <div className="home-nav-actions">
            <LanguageSelector variant="minimal" />
            <UserNavbarAction
              variant="desktop"
              onRegisterClick={handleRegisterClick}
            />
          </div>

          <div className="home-mobile-controls">
            <LanguageSelector variant="flagOnly" />
            <UserNavbarAction
              variant="mobile-bar"
              onRegisterClick={handleRegisterClick}
            />
            <button
              className="home-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.toggleMenu')}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="home-mobile-menu">
          <UserNavbarAction
            variant="mobile-drawer"
            onRegisterClick={handleRegisterClick}
            onItemClick={() => setMobileMenuOpen(false)}
          />

          <div className="home-mobile-menu-links">
            <a href={howItWorksHref} className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{isTr ? 'Nasıl Çalışır?' : 'How It Works'}</span>
            </a>
            <a href={posHref} className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>⚡ {isTr ? 'POS Katmanı' : 'POS Layer'}</span>
            </a>
            <a href={diffHref} className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#a5b4fc', fontWeight: 600 }}>
              <span>✨ {ht('whyNaponi')}</span>
            </a>
            <a href={indHref} className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{isTr ? 'Sektörler' : 'Industries'}</span>
            </a>
            <Link to="/technology-partners" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38bdf8', fontWeight: 600 }}>
              <span>{ht('techPartnersNav')}</span>
            </Link>
            <Link to="/guides" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>🌍 {ht('guides')}</span>
            </Link>
            <a href={faqHref} className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{t('nav.faq')}</span>
            </a>
          </div>

          <div>
            <div className="home-mobile-menu-section-label">
              {ht('freeToolsGuides')}
            </div>
            <div className="home-mobile-tools-grid">
              <Link to="/tools/free-hospitality-qr-generator" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>📱 {ht('qrMaker')}</span>
              </Link>
              <Link to="/tools/restaurant-tip-pool-calculator" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>📊 {ht('shiftPool')}</span>
              </Link>
              <Link to="/compare/card-machine-vs-qr-tipping" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>⚖️ {ht('posVsQr')}</span>
              </Link>
              <Link to="/guides" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>🌍 {ht('guides')}</span>
              </Link>
            </div>
          </div>

          {onSupportClick && (
            <button
              type="button"
              className="home-btn-ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                onSupportClick();
              }}
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', fontSize: '0.88rem', marginTop: '0.2rem' }}
            >
              <Headphones size={15} />
              <span>{t('support.widgetBtn')}</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};
