import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { useLanguage, LanguageSelector } from '../../i18n';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.countryLabel')}</label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="form-select"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.currencyLabel')}</label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                placeholder="USD, EUR, TRY..."
                className="form-input"
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
