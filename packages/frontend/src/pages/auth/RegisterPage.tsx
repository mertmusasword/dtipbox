import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, FileText, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage, LanguageSelector } from '../../i18n';
import { trackBusinessRegisterStarted, trackBusinessRegistered } from '../../analytics';
import { AgreementModal } from '../../components/AgreementModal';
import { CorporateApplicationModal } from '../../components/CorporateApplicationModal';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, dir } = useLanguage();

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    country: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showCorporateModal, setShowCorporateModal] = useState(false);

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedAgreement) {
      setError("Devam etmek için lütfen Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni okuyup kabul ediniz.");
      return;
    }

    setLoading(true);

    try {
      await register({ ...formData, acceptedAgreement: true } as any);
      trackBusinessRegistered(formData.country, formData.currency, 'form');
      navigate('/dashboard');
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.details && Array.isArray(responseData.details) && responseData.details.length > 0) {
        const detailMsg = responseData.details.map((d: any) => d.message).join(' • ');
        setError(detailMsg);
      } else if (responseData?.error === 'Email already registered' || err.response?.status === 409) {
        setError('Bu e-posta adresi ile kayıtlı bir işletme hesabı zaten mevcut. Lütfen giriş yapınız veya farklı bir e-posta deneyiniz.');
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: dir === 'rtl' ? 'auto' : '1.5rem', left: dir === 'rtl' ? '1.5rem' : 'auto' }}>
        <LanguageSelector variant="compact" />
      </div>

      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem' }}>
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

        {/* Multi-Branch / Enterprise Callout Banner */}
        <div style={{
          marginBottom: '1.75rem',
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.32)',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
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
              }}>
                <Building2 size={18} />
              </div>
              <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.3 }}>
                  {t('auth.multiBranchPrompt')}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.15rem', lineHeight: 1.3 }}>
                  {t('auth.multiBranchSub')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCorporateModal(true)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('auth.passwordPlaceholder')}
              className="form-input"
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              En az 6 karakter olmalıdır.
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
                lineHeight: '1.45',
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
                }}
              />
              <span>
                Okudum ve{' '}
                <button
                  type="button"
                  onClick={() => setShowAgreementModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#3b82f6',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'inline',
                  }}
                >
                  Naponi İşletme Hizmet ve Kullanım Sözleşmesi
                </button>
                'ni kabul ediyorum.
              </span>
            </label>

            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.06))', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                HMK m. 193 Elektronik İspat & Onay
              </span>
              <button
                type="button"
                onClick={() => setShowAgreementModal(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FileText size={13} /> Sözleşmeyi İncele (20 Madde)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {loading ? t('auth.creatingAccount') : (
              <>
                {t('auth.createAccountBtn')} <ArrowRight size={18} />
              </>
            )}
          </button>
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
