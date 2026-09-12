import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { LanguageSelector } from '../../i18n';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Geçersiz veya eksik sıfırlama bağlantısı. Lütfen e-postanızdaki linke tekrar tıklayın.');
      return;
    }

    if (password.length < 8) {
      setError('Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Şifre sıfırlanırken bir hata oluştu. Bağlantı süresi dolmuş olabilir.');
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
        right: '1.5rem',
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
            Yeni Şifre Belirle
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Lütfen hesabınız için güçlü ve yeni bir şifre oluşturun.
          </p>
        </div>

        {!token && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            color: '#facc15',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              Sıfırlama kodu bulunamadı. Lütfen e-postanıza gönderilen bağlantıyı eksiksiz açtığınızdan emin olun.
            </div>
          </div>
        )}

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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Şifreniz Güncellendi!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
              Yeni şifreniz başarıyla kaydedildi. Giriş ekranına yönlendiriliyorsunuz...
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Şimdi Giriş Yap
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Yeni Şifre</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Yeni Şifre (Tekrar)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Güncelleniyor...' : (
                <>
                  Şifremi Güncelle <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
