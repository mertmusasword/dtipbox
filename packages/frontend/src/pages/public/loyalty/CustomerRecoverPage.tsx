import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { useToast } from '../../../components/Toast';
import { Mail, CheckCircle2, ArrowRight, Award, ShieldCheck, ArrowLeft } from 'lucide-react';

export const CustomerRecoverPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('businessId') || undefined;
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Lütfen geçerli bir e-posta adresi girin', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/loyalty/recover', {
        email: email.trim(),
        business_id: businessId,
      });
      setSubmitted(true);
      showToast('Kart erişim bağlantınız e-posta adresinize gönderildi', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'İşlem sırasında bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="loyalty-public-layout">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 0.75rem',
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
          }}
        >
          <Award size={28} />
        </div>
        <h1 style={{ fontSize: '1.45rem', margin: '0 0 0.25rem', fontWeight: 800 }}>
          Sadakat Kartımı Bul
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          Mevcut dijital kartınıza tekrar erişmek için e-posta adresinizi girin.
        </p>
      </div>

      <div className="loyalty-enroll-card">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              E-posta Gönderildi!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              <strong style={{ color: '#fff' }}>{email}</strong> adresine kayıtlı kartınızın güvenli erişim bağlantısı gönderildi. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin.
            </p>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="loyalty-secondary-btn"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Farklı Bir E-posta Dene
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="loyalty-input-label">
                <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                Kayıtlı E-posta Adresiniz
              </label>
              <input
                type="email"
                className="loyalty-text-input"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Daha önce kart oluştururken kullandığınız e-posta adresi.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="loyalty-primary-btn"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {submitting ? 'Gönderiliyor...' : (
                <>
                  Kart Bağlantımı Gönder
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {businessId && (
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <Link
                  to={`/loyalty/enroll/${businessId}`}
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'none',
                  }}
                >
                  <ArrowLeft size={14} />
                  Yeni Kart Oluşturma Sayfasına Dön
                </Link>
              </div>
            )}
          </form>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Naponi Loyalty • Temassız Sadakat Sistemi
      </div>
    </div>
  );
};
