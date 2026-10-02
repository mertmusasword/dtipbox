import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, ArrowLeft, FileText, ShieldCheck, Building2, CheckCircle2, Crown, Sparkles, Clock, X, ChevronRight, Award } from 'lucide-react';
import { useLanguage, LanguageSelector } from '../../i18n';
import { trackBusinessRegisterStarted, trackBusinessRegistered, trackFounderSignupStarted, trackFounderSignupCompleted } from '../../analytics';
import { AgreementModal } from '../../components/AgreementModal';
import { CorporateApplicationModal } from '../../components/CorporateApplicationModal';
import { SeoHead } from '../../components/SeoHead';

const LANGUAGE_COUNTRY_DEFAULTS: Record<string, { country: string; currency: string; timezone: string }> = {
  tr: { country: 'TR', currency: 'TRY', timezone: 'Europe/Istanbul' },
  de: { country: 'DE', currency: 'EUR', timezone: 'Europe/Berlin' },
  fr: { country: 'FR', currency: 'EUR', timezone: 'Europe/Paris' },
  es: { country: 'ES', currency: 'EUR', timezone: 'Europe/Madrid' },
  ja: { country: 'JP', currency: 'JPY', timezone: 'Asia/Tokyo' },
  ar: { country: 'SA', currency: 'SAR', timezone: 'Asia/Riyadh' },
  id: { country: 'ID', currency: 'IDR', timezone: 'Asia/Jakarta' },
  pt: { country: 'BR', currency: 'BRL', timezone: 'America/Sao_Paulo' },
  en: { country: 'US', currency: 'USD', timezone: 'America/New_York' },
  ru: { country: 'US', currency: 'USD', timezone: 'America/New_York' },
  zh: { country: 'US', currency: 'USD', timezone: 'America/New_York' },
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, dir, language } = useLanguage();

  const daysLeft = Math.max(1, Math.ceil((new Date('2026-12-31T23:59:59.999Z').getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const defaultRegion = LANGUAGE_COUNTRY_DEFAULTS[language] || {
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
  };

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    country: defaultRegion.country,
    currency: defaultRegion.currency,
    timezone: defaultRegion.timezone,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showCorporateModal, setShowCorporateModal] = useState(false);
  const [showFounderModal, setShowFounderModal] = useState(false);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD', timezone: 'America/New_York' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London' },
    { code: 'DE', name: 'Germany (Eurozone)', currency: 'EUR', timezone: 'Europe/Berlin' },
    { code: 'FR', name: 'France (Eurozone)', currency: 'EUR', timezone: 'Europe/Paris' },
    { code: 'TR', name: 'Turkey', currency: 'TRY', timezone: 'Europe/Istanbul' },
    { code: 'ES', name: 'Spain (Eurozone)', currency: 'EUR', timezone: 'Europe/Madrid' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', timezone: 'Asia/Riyadh' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', timezone: 'Asia/Dubai' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', timezone: 'Asia/Jakarta' },
    { code: 'JP', name: 'Japan', currency: 'JPY', timezone: 'Asia/Tokyo' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', timezone: 'America/Sao_Paulo' },
    { code: 'CA', name: 'Canada', currency: 'CAD', timezone: 'America/Toronto' },
    { code: 'AU', name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney' },
  ];

  const handleCountryChange = (code: string) => {
    const selected = countries.find((c) => c.code === code);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        country: selected.code,
        currency: selected.currency,
        timezone: selected.timezone,
      }));
    }
  };

  React.useEffect(() => {
    trackBusinessRegisterStarted('register_page');
    trackFounderSignupStarted('register_page');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedAgreement) {
      setError(t('auth.agreementRequired'));
      return;
    }

    setLoading(true);

    try {
      await register({ ...formData, acceptedAgreement: true } as any);
      trackBusinessRegistered(formData.country, formData.currency, 'form');
      trackFounderSignupCompleted(formData.country);
      navigate('/dashboard');
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.details && Array.isArray(responseData.details) && responseData.details.length > 0) {
        const detailMsg = responseData.details.map((d: any) => d.message).join(' • ');
        setError(detailMsg);
      } else if (responseData?.error === 'Email already registered' || err.response?.status === 409) {
        setError(t('auth.emailAlreadyRegistered'));
      } else if (responseData?.error) {
        setError(responseData.error);
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4.5rem 1.5rem 2.5rem',
      position: 'relative'
    }}>
      <SeoHead
        title={`${t('auth.registerTitle')} | Naponi`}
        description={t('auth.registerSubtitle')}
        canonicalUrl="https://www.naponi.com/register"
        noindex={true}
      />
      {/* Back to Home Button */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '1.25rem',
          left: dir === 'rtl' ? 'auto' : '1.5rem',
          right: dir === 'rtl' ? '1.5rem' : 'auto',
          zIndex: 99999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.9rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '10px',
          color: '#cbd5e1',
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.background = 'rgba(30, 41, 59, 0.85)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#cbd5e1';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)';
        }}
      >
        <ArrowLeft size={15} style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
        <span>{t('common.backToHome')}</span>
      </Link>

      <div style={{
        position: 'fixed',
        top: '1.25rem',
        right: dir === 'rtl' ? 'auto' : '1.5rem',
        left: dir === 'rtl' ? '1.5rem' : 'auto',
        zIndex: 99999
      }}>
        <LanguageSelector variant="compact" />
      </div>

      <div className="glass-card auth-card" style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link to="/">
              <img
                src="/naponi-brand.svg"
                alt="Naponi"
                style={{
                  height: '84px',
                  width: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 10px 28px rgba(99, 102, 241, 0.4))',
                }}
              />
            </Link>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{t('auth.registerTitle')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {/* 2026 Founder Membership Callout */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(99, 102, 241, 0.14) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          borderRadius: '14px',
          padding: '1.15rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(245, 158, 11, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top highlight glow */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              flexShrink: 0,
              marginTop: '1px',
            }}>
              <Crown size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#fef08a', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  {t('auth.founderJoiningAs')}
                </span>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.25)',
                  color: '#fbbf24',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 9px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <Clock size={12} />
                  {t('auth.founderDaysLeft', { days: String(daysLeft) })}
                </span>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.82rem', marginTop: '0.35rem', lineHeight: 1.45, marginBottom: '0.65rem' }}>
                {t('auth.founderSubtitle')}
              </p>

              {/* 3 Perks Checkmarks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <span>{t('auth.founderPill1')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <span>{t('auth.founderPill2')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <span>{t('auth.founderPill3')}</span>
                </div>
              </div>

              {/* View Perks Trigger */}
              <button
                type="button"
                onClick={() => setShowFounderModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: '#fbbf24',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                <Sparkles size={13} />
                <span>{t('auth.founderViewPerks')}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Branch / Enterprise Callout Banner */}
        <div className="enterprise-banner">
          <div className="enterprise-banner-header">
            <div className="enterprise-banner-info">
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <Building2 size={18} />
              </div>
              <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left', flex: 1, minWidth: 0 }}>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.35 }}>
                  {t('auth.multiBranchPrompt')}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {t('auth.multiBranchSub')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCorporateModal(true)}
              className="enterprise-banner-btn"
            >
              <span>{t('auth.corporateCta')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Single-branch explicit guidance line */}
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.09)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.55rem',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            lineHeight: 1.45,
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}>
            <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
            <span>{t('auth.singleBranchPrompt')}</span>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">{t('auth.businessNameLabel')}</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder={t('auth.businessNamePlaceholder')}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t('auth.countryLabel')}
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="form-select"
                style={{ width: '100%', height: '44px' }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t('auth.currencyLabel')}
              </label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                placeholder="USD, EUR, TRY..."
                className="form-input"
                style={{ width: '100%', height: '44px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.emailLabel')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('auth.emailPlaceholder')}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.passwordLabel')}</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('auth.passwordPlaceholder')}
              className="form-input"
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {t('auth.passwordTooShort')}
            </div>
          </div>

          {/* Legal Agreement Acceptance Checkbox */}
          <div
            style={{
              margin: '1.25rem 0',
              padding: '1rem',
              background: 'var(--bg-input, rgba(255,255,255,0.03))',
              borderRadius: '12px',
              border: `1px solid ${!acceptedAgreement && error ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color, rgba(255,255,255,0.1))'}`,
              transition: 'border-color 0.2s',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                color: 'var(--text-primary)',
              }}
            >
              <input
                type="checkbox"
                id="register-agreement-checkbox"
                checked={acceptedAgreement}
                onChange={(e) => setAcceptedAgreement(e.target.checked)}
                style={{
                  marginTop: '0.2rem',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary, #6366f1)',
                  flexShrink: 0,
                }}
              />
              <span style={{ display: 'inline', wordBreak: 'break-word', lineHeight: '1.5' }}>
                {t('auth.agreementPrefix')}{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAgreementModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#60a5fa',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'inline',
                    fontFamily: 'inherit',
                  }}
                >
                  {t('auth.agreementLink')}
                </button>
              </span>
            </label>

            <div style={{
              marginTop: '0.85rem',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              paddingTop: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  🛡️ {t('auth.agreementBadge')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(true)}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    borderRadius: '8px',
                    width: '100%',
                  }}
                >
                  <FileText size={13} /> {t('auth.agreementBtn')}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '0.98rem',
              fontWeight: 700,
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #6366f1 100%)',
              border: 'none',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.3)',
            }}
          >
            {loading ? t('auth.creatingAccount') : (
              <>
                <span>🏆 {t('auth.founderCta')}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Legal / Founder Terms Disclaimer */}
          <p style={{
            fontSize: '0.72rem',
            color: '#94a3b8',
            textAlign: 'center',
            marginTop: '0.75rem',
            lineHeight: 1.45,
            marginBottom: 0,
          }}>
            {t('auth.founderDisclaimer')}
          </p>
        </form>

        <AgreementModal
          isOpen={showAgreementModal}
          isRegistrationFlow={true}
          onClose={() => setShowAgreementModal(false)}
          onAccepted={() => {
            setAcceptedAgreement(true);
            setShowAgreementModal(false);
          }}
        />

        <CorporateApplicationModal
          isOpen={showCorporateModal}
          onClose={() => setShowCorporateModal(false)}
          defaultCompanyName={formData.businessName}
          defaultEmail={formData.email}
        />

        {/* Founder Member Perks Modal */}
        {showFounderModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
            onClick={() => setShowFounderModal(false)}
          >
            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '20px',
                maxWidth: '560px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                position: 'relative',
                textAlign: dir === 'rtl' ? 'right' : 'left',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowFounderModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: dir === 'rtl' ? 'auto' : '1.25rem',
                  left: dir === 'rtl' ? '1.25rem' : 'auto',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                }}>
                  <Crown size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fef08a' }}>
                    {t('founder.sectionTitle')}
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    {t('founder.deadlineNotice')}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {t('founder.sectionSubtitle')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.86rem', marginBottom: '0.2rem' }}>
                    ✓ {t('founder.card1Title')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {t('founder.card1Desc')}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.86rem', marginBottom: '0.2rem' }}>
                    ✓ {t('founder.card2Title')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {t('founder.card2Desc')}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.86rem', marginBottom: '0.2rem' }}>
                    ✓ {t('founder.card3Title')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {t('founder.card3Desc')}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.86rem', marginBottom: '0.2rem' }}>
                    ✓ {t('founder.card4Title')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {t('founder.card4Desc')}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4, marginBottom: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                ℹ️ {t('founder.disclaimer')}
              </div>

              <button
                type="button"
                onClick={() => setShowFounderModal(false)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {t('auth.haveAccountPrompt')}{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            {t('auth.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
};
