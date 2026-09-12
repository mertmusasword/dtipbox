import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage, LanguageSelector } from '../../i18n';

export const ForgotPasswordPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.');
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
      position: 'relative',
    }}>
      <div style={{
        position: 'fixed',
        top: '1.25rem',
        right: dir === 'rtl' ? 'auto' : '1.5rem',
        left: dir === 'rtl' ? '1.5rem' : 'auto',
        zIndex: 99999,
      }}>
        <LanguageSelector variant="compact" />
      </div>

      <div className="glass-card auth-card" style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Şifremi Unuttum
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#22c55e',
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bağlantı Gönderildi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
              <strong>{email}</strong> adresine şifre sıfırlama yönergelerini ilettik. Lütfen gelen kutunuzu ve spam klasörünüzü kontrol ediniz.
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={18} /> Giriş Ekranına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">{t('auth.emailLabel')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="form-input"
                  style={{ paddingLeft: dir === 'rtl' ? '1rem' : '2.5rem', paddingRight: dir === 'rtl' ? '2.5rem' : '1rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', [dir === 'rtl' ? 'right' : 'left']: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Gönderiliyor...' : (
                <>
                  Sıfırlama Bağlantısı Gönder <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Hatırladınız mı?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            {t('auth.signInBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
