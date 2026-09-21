import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  activeCards30d?: number;
  activeCustomers?: number;
  totalStampsGiven: number;
  totalRewardsRedeemed?: number;
  redeemedRewards?: number;
  recentTransactions?: Array<{
    id: string;
    type?: string;
    action_type?: string;
    cardCode?: string;
    card_code?: string;
    customerEmail?: string;
    customer_name?: string;
    customer_masked_email?: string;
    employeeName?: string;
    staff_name?: string;
    stampsDelta?: number;
    createdAt?: string;
    created_at?: string;
  }>;
}

export const BusinessLoyaltyPage: React.FC = () => {
  const { showToast } = useToast();
  const { t, formatDate, language } = useLanguage();
  const isTr = language === 'tr';

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
      const [bizRes, progRes, statsRes, txRes] = await Promise.all([
        api.get('/business'),
        api.get('/loyalty/business/program').catch(() => ({ data: { data: null } })),
        api.get('/loyalty/business/stats').catch(() => ({ data: { data: null } })),
        api.get('/loyalty/business/transactions?limit=15').catch(() => ({ data: { data: null } })),
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
        const statsData = statsRes.data.data;
        let recent = statsData.recentTransactions;
        if ((!recent || recent.length === 0) && txRes.data?.data?.items) {
          recent = txRes.data.data.items.map((item: any) => ({
            id: item.id,
            type: item.action_type === 'STAMP_ADDED' ? 'STAMP' : 'REDEEM',
            cardCode: item.card_code,
            customerEmail: item.customer_name || item.customer_masked_email || 'Misafir',
            employeeName: item.staff_name,
            stampsDelta: Math.max(1, Math.abs((item.new_stamps || 0) - (item.previous_stamps || 0))),
            createdAt: item.created_at,
          }));
        }
        setStats({
          ...statsData,
          recentTransactions: recent,
        });
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
        targetStamps: Number(targetStamps),
        target_stamps: Number(targetStamps),
        rewardDescription: rewardDesc,
        reward_description: rewardDesc,
        isActive: isActive,
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
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);
  };

  const printQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const printTitle = `${businessName} - ${isTr ? 'Sadakat Kartı Kayıt QR Kodu' : 'Loyalty Card Registration QR Code'}`;
    const badgeText = `${targetStamps} ${isTr ? 'Damga' : 'Stamps'} = ${rewardDesc}`;
    const subText = isTr ? 'Dijital sadakat kartınızı oluşturmak için QR kodu telefonunuzun kamerasıyla tarayın.' : 'Scan the QR code with your phone camera to create your digital loyalty card.';
    const noteText = isTr ? 'Uygulama yükleme gerekmez. Kartınız tarayıcınızda açılır.' : 'No app download required. Your card opens in your browser.';
    const qrAlt = isTr ? 'Kayıt QR Kodu' : 'Registration QR Code';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${printTitle}</title>
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
            <div class="badge">${badgeText}</div>
            <p class="sub">${subText}</p>
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="${qrAlt}" />
            </div>
            <p class="sub" style="font-size: 12px; margin-bottom: 0;">
              ${noteText}
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
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.75rem' }}>{isTr ? 'Sadakat Programı (Loyalty)' : 'Loyalty Program'}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {isTr ? 'Müşterilerinize her ziyarette damga kazandırın, sadakatlerini ödüllendirin.' : 'Reward your customers with digital stamps on every visit.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {program && (
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
              {program.is_active ? (isTr ? 'Program Aktif' : 'Program Active') : (isTr ? 'Program Pasif' : 'Program Inactive')}
            </span>
          )}
          <Link
            to="/business/loyalty-scan"
            className="loyalty-primary-btn"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <QrIcon size={16} />
            {isTr ? 'Damga Okut / Kamera Aç' : 'Scan Stamp / Open Camera'}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">{isTr ? 'Toplam Sadakat Kartı' : 'Total Loyalty Cards'}</div>
          <div className="loyalty-metric-val">{stats?.totalCards || 0}</div>
          <div className="loyalty-metric-sub">{isTr ? 'Kayıtlı müşteri kartı' : 'Registered customer cards'}</div>
        </div>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">{isTr ? 'Aktif Müşteri (30 Gün)' : 'Active Customers (30 Days)'}</div>
          <div className="loyalty-metric-val" style={{ color: '#818cf8' }}>
            {stats?.activeCards30d ?? stats?.activeCustomers ?? 0}
          </div>
          <div className="loyalty-metric-sub">{isTr ? 'Son 30 günde damga alan' : 'Stamped in the last 30 days'}</div>
        </div>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">{isTr ? 'Verilen Damga' : 'Total Stamps Given'}</div>
          <div className="loyalty-metric-val" style={{ color: '#34d399' }}>{stats?.totalStampsGiven || 0}</div>
          <div className="loyalty-metric-sub">{isTr ? 'Toplam kazanılan damga' : 'Total earned stamps'}</div>
        </div>
        <div className="loyalty-metric-card">
          <div className="loyalty-metric-label">{isTr ? 'Kullanılan Ödül' : 'Rewards Redeemed'}</div>
          <div className="loyalty-metric-val" style={{ color: '#fbbf24' }}>
            {stats?.totalRewardsRedeemed ?? stats?.redeemedRewards ?? 0}
          </div>
          <div className="loyalty-metric-sub">{isTr ? 'Teslim edilen ikramlar' : 'Claimed rewards'}</div>
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
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{isTr ? 'Program Ayarları' : 'Program Settings'}</h2>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="loyalty-input-label">{isTr ? 'Program / Kart Adı' : 'Program / Card Name'}</label>
              <input
                type="text"
                className="loyalty-text-input"
                placeholder={isTr ? 'Örn: Kahve Sadakat Kulübü' : 'e.g. Coffee Loyalty Club'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="loyalty-input-label">{isTr ? 'Hedef Damga Sayısı' : 'Target Stamp Count'}</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  className="loyalty-text-input"
                  value={targetStamps}
                  onChange={(e) => setTargetStamps(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                  {isTr ? 'Örn: 10 damga' : 'e.g. 10 stamps'}
                </span>
              </div>
              <div>
                <label className="loyalty-input-label">{isTr ? 'Damga Arası Bekleme (Dk)' : 'Stamp Cooldown (Min)'}</label>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  className="loyalty-text-input"
                  value={cooldownMin}
                  onChange={(e) => setCooldownMin(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                  {isTr ? 'Çift basmayı önler (dk)' : 'Prevents duplicate stamps (min)'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="loyalty-input-label">{isTr ? 'Kazanılacak Ödül Açıklaması' : 'Reward Description'}</label>
              <input
                type="text"
                className="loyalty-text-input"
                placeholder={isTr ? 'Örn: 1 Adet Ücretsiz Filtre Kahve' : 'e.g. 1 Free Specialty Coffee'}
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
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isTr ? 'Program Durumu' : 'Program Status'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {isTr
                    ? 'Program aktif olduğunda müşteriler kart oluşturabilir ve damga toplayabilir.'
                    : 'When active, customers can create loyalty cards and collect stamps.'}
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
              {saving ? t('common.saving') : (isTr ? 'Programı Kaydet' : 'Save Program')}
            </button>
          </form>
        </div>

        {/* Business Registration QR Card */}
        <div className="loyalty-card-wrapper" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <QrIcon size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{isTr ? 'İşletme Kayıt QR Kodu' : 'Enrollment QR Code'}</h2>
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
            <strong style={{ color: '#a5b4fc' }}>{isTr ? 'Önemli Kural:' : 'Important Notice:'}</strong>{' '}
            {isTr
              ? 'Müşterileriniz bu QR kodu yalnızca ilk kez kart oluştururken tarar. Sonraki ziyaretlerde damga almak için kendi dijital kartlarını personele gösterirler.'
              : 'Customers scan this QR code only once to create their card. On return visits, they present their own digital card to staff for stamps.'}
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
                  alt={isTr ? 'Sadakat Kayıt QR Kodu' : 'Loyalty Registration QR Code'}
                  style={{ width: '200px', height: '200px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  {t('common.loading')}
                </div>
              )}
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isTr ? 'Kayıt Bağlantısı:' : 'Enrollment Link:'}
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
                title={t('common.copied') || 'Copy'}
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
              {isTr ? 'QR İndir (PNG)' : 'Download QR (PNG)'}
            </button>
            <button
              type="button"
              onClick={printQr}
              disabled={!qrDataUrl}
              className="loyalty-secondary-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Printer size={16} />
              {isTr ? 'Masaüstü Yazdır' : 'Print QR'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="loyalty-card-wrapper" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{isTr ? 'Son Sadakat İşlemleri' : 'Recent Loyalty Activity'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              {isTr ? 'Personelleriniz tarafından verilen damgalar ve onaylanan ödüller.' : 'Stamps awarded and rewards claimed by your staff.'}
            </p>
          </div>
        </div>

        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="loyalty-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{isTr ? 'Tarih / Saat' : 'Date / Time'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{isTr ? 'İşlem' : 'Action'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{isTr ? 'Müşteri' : 'Customer'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{isTr ? 'Kart Kodu' : 'Card Code'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{isTr ? 'Personel' : 'Staff'}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {new Date(tx.createdAt || tx.created_at || '').toLocaleString(isTr ? 'tr-TR' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {tx.type === 'STAMP' || tx.action_type === 'STAMP_ADDED' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#34d399',
                          fontWeight: 600
                        }}>
                          <CheckCircle2 size={14} />
                          +{tx.stampsDelta || 1} {isTr ? 'Damga' : 'Stamps'}
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
                          {isTr ? 'Ödül Teslimi' : 'Reward Redeemed'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                      {tx.customerEmail || tx.customer_name || tx.customer_masked_email || (isTr ? 'Misafir' : 'Guest')}
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
                        {tx.cardCode || tx.card_code || '------'}
                      </code>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {tx.employeeName || tx.staff_name || (isTr ? 'Yönetici / Kasa' : 'Admin / POS')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Award size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div>{isTr ? 'Henüz bir sadakat işlemi gerçekleşmedi.' : 'No loyalty transactions yet.'}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {isTr
                ? 'İşletme kayıt QR kodunuzu masalara veya kasaya yerleştirerek başlayın.'
                : 'Get started by displaying your registration QR code on tables or checkout counter.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
