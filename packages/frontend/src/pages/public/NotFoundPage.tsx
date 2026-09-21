import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { SeoHead } from '../../components/SeoHead';

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
      color: '#f8fafc',
      padding: '2rem 1.5rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <SeoHead
        title={isTr ? '404 - Sayfa Bulunamadı | Naponi' : '404 - Page Not Found | Naponi'}
        description={isTr ? 'Aradığınız sayfa bulunamadı. Naponi dijital bahşiş ve akıllı QR platformu.' : 'The requested page could not be found. Naponi digital tipping & smart QR platform.'}
        canonicalUrl="https://www.naponi.com/404"
        noindex={true}
      />

      {/* Subtle background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />

      <div style={{
        maxWidth: '560px',
        width: '100%',
        zIndex: 1,
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Brand pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '9999px',
          color: '#818cf8',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          <Sparkles size={16} />
          <span>NAPONI</span>
        </div>

        {/* 404 Heading */}
        <h1 style={{
          fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
          fontWeight: 900,
          lineHeight: 1,
          margin: '0 0 1rem 0',
          background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#f1f5f9',
          margin: '0 0 1rem 0',
        }}>
          {isTr ? 'Sayfa Bulunamadı' : 'Page Not Found'}
        </h2>

        <p style={{
          fontSize: '1rem',
          lineHeight: 1.6,
          color: '#94a3b8',
          margin: '0 0 2rem 0',
        }}>
          {isTr
            ? 'Aradığınız sayfa taşınmış, silinmiş veya geçici olarak kullanım dışı olabilir. Aşağıdaki bağlantıları kullanarak devam edebilirsiniz.'
            : 'The page you are looking for might have been moved, deleted, or is temporarily unavailable. You can use the links below to continue.'}
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            <Home size={18} />
            {isTr ? 'Ana Sayfaya Dön' : 'Back to Home'}
          </Link>

          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={18} />
            {isTr ? 'Giriş Yap' : 'Sign In'}
          </Link>
        </div>

        {/* Helpful navigation links */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          fontSize: '0.875rem',
          color: '#64748b',
        }}>
          <Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none' }}>
            {isTr ? 'Blog' : 'Blog'}
          </Link>
          <span>•</span>
          <Link to="/guides" style={{ color: '#94a3b8', textDecoration: 'none' }}>
            {isTr ? 'Rehberler' : 'Guides'}
          </Link>
          <span>•</span>
          <Link to="/catalog" style={{ color: '#94a3b8', textDecoration: 'none' }}>
            {isTr ? 'Katalog' : 'Catalog'}
          </Link>
        </div>
      </div>
    </div>
  );
};
