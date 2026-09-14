import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { useToast } from '../../../components/Toast';
import { Award, Sparkles, ShieldCheck, Mail, User, ArrowRight, Gift, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgramInfo {
  business: {
    id: string;
    name: string;
    logo_url?: string;
  };
  program: {
    id: string;
    name: string;
    target_stamps: number;
    reward_description: string;
    is_active: boolean;
  };
}

export const CustomerEnrollPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<ProgramInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    api
      .get(`/loyalty/program/${businessId}`)
      .then((res) => setData(res.data.data))
      .catch((err) => {
        console.error('Program not found:', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Lütfen geçerli bir e-posta adresi girin', 'warning');
      return;
    }
    if (!kvkkAccepted) {
      showToast('Lütfen KVKK ve kullanım koşullarını onaylayın', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/loyalty/enroll', {
        business_id: businessId,
        email: email.trim(),
        name: name.trim() || undefined,
      });

      const { publicCardId } = res.data.data;
      showToast('Sadakat kartınız başarıyla oluşturuldu!', 'success');
      navigate(`/loyalty/card/${publicCardId}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Kayıt sırasında bir hata oluştu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loyalty-public-layout">
        <div className="spinner" style={{ margin: '3rem auto' }} />
      </div>
    );
  }

  if (!data || !data.program || !data.program.is_active) {
    return (
      <div className="loyalty-public-layout">
        <div className="loyalty-enroll-card" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Program Bulunamadı</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Bu işletmenin sadakat programı şu anda aktif değil veya geçici olarak durdurulmuş olabilir.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              color: '#818cf8',
              fontSize: '0.9rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Naponi Ana Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  const { business, program } = data;

  return (
    <div className="loyalty-public-layout">
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              objectFit: 'cover',
              margin: '0 auto 0.75rem',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          />
        ) : (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.5rem',
              margin: '0 auto 0.75rem',
              boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
            }}
          >
            {business.name ? business.name[0].toUpperCase() : 'N'}
          </div>
        )}
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem', fontWeight: 800 }}>{business.name}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          Dijital Sadakat & Damga Kartı
        </p>
      </div>

      {/* Punch Card Preview Mockup */}
      <div className="loyalty-punch-card-preview" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              {program.name}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              0 / {program.target_stamps} Damga
            </div>
          </div>
          <div
            style={{
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.4)',
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#a5b4fc',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Gift size={14} />
            {program.target_stamps} Damga = Ödül
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.25)',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Sparkles size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span>Kazanılacak Ödül: <strong style={{ color: '#fff' }}>{program.reward_description}</strong></span>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="loyalty-enroll-card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Kartınızı Ücretsiz Alın
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
          Uygulama indirmenize gerek yoktur. E-posta adresinizi girerek anında dijital damga kartınızı kullanmaya başlayın.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="loyalty-input-label">
              <Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              E-posta Adresi <span style={{ color: '#f87171' }}>*</span>
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
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              Kartınıza daha sonra ulaşabilmeniz için bağlantınız bu adrese iletilecektir.
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="loyalty-input-label">
              <User size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Adınız & Soyadınız (İsteğe bağlı)
            </label>
            <input
              type="text"
              className="loyalty-text-input"
              placeholder="Adınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                style={{ marginTop: '2px' }}
                required
              />
              <span>
                Sadakat kartı oluşturmak ve damga bildirimlerimi almak için e-posta adresimin işlenmesini, KVKK ve Gizlilik Politikası koşullarını kabul ediyorum.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="loyalty-primary-btn"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {submitting ? 'Kartınız Hazırlanıyor...' : (
              <>
                Dijital Kartımı Oluştur
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Existing card link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
            Zaten bu işletmede kayıtlı bir kartınız var mı?
          </p>
          <Link
            to={`/loyalty/recover?businessId=${business.id}`}
            style={{
              color: '#818cf8',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Mevcut Kartımı Bul / E-posta Gönder →
          </Link>
        </div>
      </div>

      {/* Micro footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Güvenli ve Temassız Sadakat Altyapısı • <strong>Naponi Loyalty</strong>
      </div>
    </div>
  );
};
