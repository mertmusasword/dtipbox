import React, { useEffect, useState, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import { api } from '../../api/client';
import { useToast } from '../../components/Toast';
import { useLanguage } from '../../i18n';
import {
  Award,
  QrCode as QrIcon,
  Copy,
  Download,
  Printer,
  CheckCircle2,
  Gift,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface LoyaltyProgramData {
  id: string;
  name: string;
  target_stamps: number;
  reward_description: string;
  stamp_cooldown_min: number;
  is_active: boolean;
}

interface LoyaltyStats {
  totalCards: number;
  activeCards30d: number;
  totalStampsGiven: number;
  totalRewardsRedeemed: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    cardCode: string;
    customerEmail: string;
    employeeName: string;
    stampsDelta: number;
    createdAt: string;
  }>;
}

export const BusinessLoyaltyPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatDate } = useLanguage();

  const [program, setProgram] = useState<LoyaltyProgramData | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [targetStamps, setTargetStamps] = useState(10);
  const [rewardDesc, setRewardDesc] = useState('');
  const [cooldownMin, setCooldownMin] = useState(15);
  const [isActive, setIsActive] = useState(true);

  // QR canvas
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const enrollUrl = businessId ? `${window.location.origin}/loyalty/enroll/${businessId}` : '';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bizRes, progRes, statsRes] = await Promise.all([
        api.get('/business'),
        api.get('/loyalty/business/program').catch(() => ({ data: { data: null } })),
        api.get('/loyalty/business/stats').catch(() => ({ data: { data: null } })),
      ]);

      const biz = bizRes.data.data;
      setBusinessId(biz.id);
      setBusinessName(biz.name);

      const prog = progRes.data?.data;
      if (prog) {
        setProgram(prog);
        setName(prog.name);
        setTargetStamps(prog.target_stamps);
        setRewardDesc(prog.reward_description);
        setCooldownMin(prog.stamp_cooldown_min);
        setIsActive(prog.is_active);
      } else {
        setName(`${biz.name} Sadakat Kartı`);
        setRewardDesc('1 Adet İkram Ürün');
      }

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate QR for Customer Registration
  useEffect(() => {
    if (!enrollUrl) return;
    QRCode.toDataURL(
      enrollUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#090d16',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [enrollUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rewardDesc.trim()) {
      showToast('Lütfen program adı ve ödül açıklamasını doldurun', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/loyalty/business/program', {
        name,
        target_stamps: Number(targetStamps),
        reward_description: rewardDesc,
        stamp_cooldown_min: Number(cooldownMin),
        is_active: isActive,
      });

      setProgram(res.data.data);
      showToast('Sadakat programı başarıyla güncellendi', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyEnrollLink = () => {
    if (!enrollUrl) return;
    navigator.clipboard.writeText(enrollUrl);
    showToast(t('common.copied') || 'Kayıt linki kopyalandı!', 'success');
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `naponi-loyalty-kayit-qr-${businessName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const printQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${businessName} - Sadakat Kartı Kayıt QR Kodu</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              padding: 20px;
              color: #111827;
              text-align: center;
            }
            .card {
              border: 2px solid #e5e7eb;
              border-radius: 24px;
              padding: 40px 32px;
              max-width: 380px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }
            .logo {
              font-size: 20px;
              font-weight: 800;
              letter-spacing: 0.1em;
              color: #6366f1;
              margin-bottom: 8px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 8px 0;
              color: #090d16;
            }
            p.sub {
              font-size: 14px;
              color: #4b5563;
              margin: 0 0 24px 0;
              line-height: 1.5;
            }
            .qr-wrapper {
              background: #fff;
              padding: 16px;
              border-radius: 16px;
              display: inline-block;
              border: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            .qr-wrapper img {
              display: block;
              width: 240px;
              height: 240px;
            }
            .badge {
              display: inline-block;
              background: #eef2ff;
              color: #4f46e5;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 700;
              margin-bottom: 16px;
            }
            .footer-note {
              font-size: 11px;
              color: #9ca3af;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">NAPONI LOYALTY</div>
            <h1>${businessName}</h1>
            <div class="badge">${targetStamps} Damga = ${rewardDesc}</div>
            <p class="sub">Dijital sadakat kartınızı oluşturmak için QR kodu telefonunuzun kamerasıyla tarayın.</p>
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="Kayıt QR Kodu" />
            </div>
            <p class="sub" style="font-size: 12px; margin-bottom: 0;">
              Uygulama yükleme gerekmez. Kartınız tarayıcınızda açılır.
            </p>
            <div class="footer-note">Powered by Naponi Loyalty</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper loyalty-page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Award size={22} />
            </div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.75rem' }}>Sadakat Programı (Loyalty)</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Müşterilerinize her ziyarette damga kazandırın, sadakatlerini ödüllendirin.
          </p>
        </div>

        {program && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: program.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: program.is_active ? '#34d399' : '#f87171',
              border: `1px solid ${program.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: program.is_active ? '#34d399' : '#f87171' }} />
              {program.is_active ? 'Program Aktif' : 'Program Pasif'}
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">Toplam Sadakat Kartı</div>
          <div className="loyalty-metric-val">{stats?.totalCards || 0}</div>
          <div className="loyalty-metric-sub">Kayıtlı müşteri kartı</div>
        </div>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">Aktif Müşteri (30 Gün)</div>
          <div className="loyalty-metric-val" style={{ color: '#818cf8' }}>{stats?.activeCards30d || 0}</div>
          <div className="loyalty-metric-sub">Son 30 günde damga alan</div>
        </div>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">Verilen Damga</div>
          <div className="loyalty-metric-val" style={{ color: '#34d399' }}>{stats?.totalStampsGiven || 0}</div>
          <div className="loyalty-metric-sub">Toplam kazanılan damga</div>
        </div>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">Kullanılan Ödül</div>
          <div className="loyalty-metric-val" style={{ color: '#fbbf24' }}>{stats?.totalRewardsRedeemed || 0}</div>
          <div className="loyalty-metric-sub">Teslim edilen ikramlar</div>
        </div>
      </div>

      {/* Main Grid: Settings & Registration QR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Settings Form Card */}
        <div className="loyalty-card-wrapper" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Program Ayarları</h2>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="loyalty-input-label">Program / Kart Adı</label>
              <input
                type="text"
                className="loyalty-text-input"
                placeholder="Örn: Kahve Sadakat Kulübü"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="loyalty-input-label">Hedef Damga Sayısı</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  className="loyalty-text-input"
                  value={targetStamps}
                  onChange={(e) => setTargetStamps(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>Örn: 10 damga</span>
              </div>
              <div>
                <label className="loyalty-input-label">Damga Arası Bekleme (Dk)</label>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  className="loyalty-text-input"
                  value={cooldownMin}
                  onChange={(e) => setCooldownMin(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>Çift basmayı önler (dk)</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="loyalty-input-label">Kazanılacak Ödül Açıklaması</label>
              <input
                type="text"
                className="loyalty-text-input"
                placeholder="Örn: 1 Adet Ücretsiz Filtre Kahve"
                value={rewardDesc}
                onChange={(e) => setRewardDesc(e.target.value)}
                required
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Program Durumu</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Program aktif olduğunda müşteriler kart oluşturabilir ve damga toplayabilir.
                </div>
              </div>
              <label className="loyalty-toggle-switch">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="loyalty-toggle-slider" />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="loyalty-primary-btn"
              style={{ width: '100%', padding: '0.85rem 1.5rem', fontWeight: 600 }}
            >
              {saving ? t('common.saving') : 'Programı Kaydet'}
            </button>
          </form>
        </div>

        {/* Business Registration QR Card */}
        <div className="loyalty-card-wrapper" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <QrIcon size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>İşletme Kayıt QR Kodu</h2>
          </div>

          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '0.75rem 1rem',
            borderRadius: '10px'
          }}>
            <strong style={{ color: '#a5b4fc' }}>Önemli Kural:</strong> Müşterileriniz bu QR kodu <u>yalnızca ilk kez kart oluştururken</u> tarar. Sonraki ziyaretlerde damga almak için kendi dijital kartlarını personele gösterirler.
          </div>

          <div style={{ textAlign: 'center', margin: 'auto 0', padding: '1rem 0' }}>
            <div style={{
              display: 'inline-block',
              background: '#ffffff',
              padding: '1rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Sadakat Kayıt QR Kodu"
                  style={{ width: '200px', height: '200px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  {t('common.loading')}
                </div>
              )}
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Kayıt Bağlantısı:
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.25rem'
            }}>
              <code style={{
                fontSize: '0.78rem',
                color: '#a5b4fc',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 8px',
                borderRadius: '6px',
                maxWidth: '260px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {enrollUrl}
              </code>
              <button
                type="button"
                onClick={copyEnrollLink}
                title="Kopyala"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={downloadQr}
              disabled={!qrDataUrl}
              className="loyalty-secondary-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Download size={16} />
              QR İndir (PNG)
            </button>
            <button
              type="button"
              onClick={printQr}
              disabled={!qrDataUrl}
              className="loyalty-secondary-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Printer size={16} />
              Masaüstü Yazdır
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="loyalty-card-wrapper" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Son Sadakat İşlemleri</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Personelleriniz tarafından verilen damgalar ve onaylanan ödüller.
            </p>
          </div>
        </div>

        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="loyalty-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Tarih / Saat</th>
                  <th style={{ padding: '0.75rem 1rem' }}>İşlem</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Müşteri</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Kart Kodu</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Personel</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {new Date(tx.createdAt).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {tx.type === 'STAMP' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#34d399',
                          fontWeight: 600
                        }}>
                          <CheckCircle2 size={14} />
                          +{tx.stampsDelta} Damga
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#fbbf24',
                          fontWeight: 600
                        }}>
                          <Gift size={14} />
                          Ödül Teslimi
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                      {tx.customerEmail}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <code style={{
                        background: 'rgba(255,255,255,0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: '#a5b4fc',
                        fontFamily: 'monospace',
                        fontWeight: 700
                      }}>
                        {tx.cardCode}
                      </code>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {tx.employeeName || 'İşletme Yöneticisi'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Award size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div>Henüz bir sadakat işlemi gerçekleşmedi.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              İşletme kayıt QR kodunuzu masalara veya kasaya yerleştirerek başlayın.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
