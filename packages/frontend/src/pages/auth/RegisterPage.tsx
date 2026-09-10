import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, Building2, Globe2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

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
      setError(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo.png"
            alt="Naponi"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              margin: '0 auto 1rem',
              display: 'block',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              objectFit: 'cover'
            }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Naponi İşletme Hesabı</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            İşletmenizi kaydedin ve saniyeler içinde dijital bahşiş toplamaya başlayın
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
            <label className="form-label">Business Name</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Grand Gourmet Bistro"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Country</label>
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
              <label className="form-label">Currency</label>
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
            <label className="form-label">Account Owner Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="owner@business.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (min 8 characters)</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account...' : (
              <>
                Register Business <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
