import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../../../content/tools/tools';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';
import '../../../styles/blog.css';
import '../../../styles/seo-features.css';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  weight: number;
  hours: number;
}

const PRESET_ROLES = [
  { id: 'server', name: { tr: 'Garson / Servis Personeli', en: 'Server / Waiter' }, defaultWeight: 1.0 },
  { id: 'bartender', name: { tr: 'Barmen / Miksolojist', en: 'Bartender / Mixologist' }, defaultWeight: 1.0 },
  { id: 'kitchen', name: { tr: 'Mutfak / Aşçı', en: 'Kitchen Chef / Cook' }, defaultWeight: 0.6 },
  { id: 'runner', name: { tr: 'Komi / Runner', en: 'Busser / Runner' }, defaultWeight: 0.5 },
  { id: 'barista', name: { tr: 'Barista / Kasiyer', en: 'Barista / Cashier' }, defaultWeight: 0.7 },
  { id: 'custom', name: { tr: 'Özel Katsayı', en: 'Custom Weight' }, defaultWeight: 1.0 },
];

export const ShiftTipPoolCalculatorPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isEn = language !== 'tr';
  const meta = isEn ? SEO_TOOLS_EN['restaurant-tip-pool-calculator'] : SEO_TOOLS['restaurant-tip-pool-calculator'];

  // Currency selection
  const [currency, setCurrency] = useState<string>(language === 'tr' ? '₺' : '$');

  // Pool inputs
  const [cashTips, setCashTips] = useState<number>(1200);
  const [posTips, setPosTips] = useState<number>(3400);
  const [digitalTips, setDigitalTips] = useState<number>(1800);

  // Staff roster state
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: isEn ? 'Alex (Head Server)' : 'Ahmet (Kaptan Garson)', role: 'server', weight: 1.0, hours: 8 },
    { id: '2', name: isEn ? 'Elena (Server)' : 'Merve (Garson)', role: 'server', weight: 1.0, hours: 8 },
    { id: '3', name: isEn ? 'Marcus (Bartender)' : 'Can (Barmen)', role: 'bartender', weight: 1.0, hours: 7 },
    { id: '4', name: isEn ? 'David (Line Cook)' : 'Mehmet Şef (Mutfak)', role: 'kitchen', weight: 0.6, hours: 8 },
    { id: '5', name: isEn ? 'Sarah (Busser)' : 'Ali (Komi)', role: 'runner', weight: 0.5, hours: 6 },
  ]);

  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations
  const totalPool = useMemo(() => {
    return Math.max(0, cashTips) + Math.max(0, posTips) + Math.max(0, digitalTips);
  }, [cashTips, posTips, digitalTips]);

  const calculations = useMemo(() => {
    const totalPoints = staff.reduce((acc, s) => acc + (s.hours * s.weight), 0);
    const totalHours = staff.reduce((acc, s) => acc + s.hours, 0);
    const pointValue = totalPoints > 0 ? totalPool / totalPoints : 0;

    const distributions = staff.map((s) => {
      const points = s.hours * s.weight;
      const amount = points * pointValue;
      const hourlyRate = s.hours > 0 ? amount / s.hours : 0;
      return {
        ...s,
        points,
        amount,
        hourlyRate,
        percentOfPool: totalPool > 0 ? (amount / totalPool) * 100 : 0,
      };
    });

    return {
      totalPoints,
      totalHours,
      pointValue,
      distributions,
    };
  }, [staff, totalPool]);

  // Actions
  const handleAddStaff = () => {
    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: isEn ? `Staff Member ${staff.length + 1}` : `Personel ${staff.length + 1}`,
      role: 'server',
      weight: 1.0,
      hours: 8,
    };
    setStaff([...staff, newMember]);
  };

  const handleRemoveStaff = (id: string) => {
    if (staff.length <= 1) return;
    setStaff(staff.filter((s) => s.id !== id));
  };

  const handleUpdateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff(
      staff.map((s) => {
        if (s.id !== id) return s;
        return { ...s, ...updates };
      })
    );
  };

  const handleExportCsv = () => {
    const headers = isEn
      ? ['Staff Name', 'Role', 'Role Weight', 'Hours Worked', 'Points', 'Payout Amount', 'Effective Tip/Hour']
      : ['Personel Adı', 'Rol', 'Puan Katsayısı', 'Çalışma Saati', 'Toplam Puan', 'Ödenecek Bahşiş', 'Saatlik Bahşiş'];

    const rows = calculations.distributions.map((d) => [
      `"${d.name}"`,
      `"${d.role}"`,
      d.weight.toFixed(2),
      d.hours.toString(),
      d.points.toFixed(2),
      `${currency}${d.amount.toFixed(2)}`,
      `${currency}${d.hourlyRate.toFixed(2)}/hr`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shift_tip_pool_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const summaryText = calculations.distributions
      .map((d) => `${d.name} (${d.role}): ${currency}${d.amount.toFixed(2)} (${d.hours}h)`)
      .join('\n');
    const fullText = `=== SHIFT TIP POOL DISTRIBUTION ===\nTotal Tips: ${currency}${totalPool.toFixed(2)}\n\n${summaryText}\n\nGenerated by Naponi Hospitality Suite`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: {
        tr: 'Puan katsayılı (weighted point) bahşiş havuzu nasıl hesaplanır?',
        en: 'How does a point-weighted tip pool formula work?'
      },
      a: {
        tr: 'Her personelin çalıştığı saat, rolünün puan katsayısıyla (Örn: Garson 1.0x, Mutfak 0.6x, Komi 0.5x) çarpılarak "Kişisel Puan" bulunur. Vardiyadaki tüm puanlar toplanır ve toplam bahşişe bölünerek "1 Puanın Değeri" hesaplanır. Bu formül vardiyada az veya çok çalışan herkesin adil pay almasını sağlar.',
        en: 'Each team member’s hours are multiplied by their role factor (e.g. Server 1.0x, Kitchen 0.6x, Busser 0.5x) to calculate "Total Points". Dividing the total shift tip pool by aggregate points yields the exact cash value of a single point.'
      }
    },
    {
      q: {
        tr: 'Mutfak personeli bahşiş havuzuna dahil edilebilir mi?',
        en: 'Can back-of-house kitchen staff be included in tip pools?'
      },
      a: {
        tr: 'Evet. Modern restoranlarda aşçı, bulaşıkçı ve hazırlık personeli müşteri deneyiminin ayrılmaz bir parçasıdır. Çoğu işletme mutfak için 0.4x - 0.7x arası dengeli bir katsayı kullanır. (Yerel iş yasalarınızı kontrol etmeniz önerilir).',
        en: 'In many countries (including the UK Tips Act 2024 and amended US FLSA regulations when full minimum wage is paid), back-of-house staff can legally share in tip pools, commonly weighted at 0.5x to 0.7x.'
      }
    },
    {
      q: {
        tr: 'İşletme sahibi veya müdür bahşiş havuzundan pay alabilir mi?',
        en: 'Can restaurant owners or managers participate in the tip pool?'
      },
      a: {
        tr: 'Hayır. Hem uluslararası regülasyonlar (US FLSA, UK Tips Act) hem de Türkiye iş hukuku içtihatlarına göre işletme sahipleri ve işe alma/çıkarma yetkisi olan müdürler bahşiş havuzundan pay alamaz. Bahşiş doğrudan servis emekçilerine aittir.',
        en: 'Strictly no. In virtually all jurisdictions (including US federal law and UK regulations), managers, supervisors, and owners are prohibited from taking any portion of employee tip pools.'
      }
    }
  ];

  return (
    <div className="home-wrapper">
      <SeoHead
        title={meta.metaTitle}
        description={meta.metaDescription}
        canonicalUrl={meta.canonicalUrl}
        keywords={meta.secondaryKeywords}
      />

      {/* Header */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Tool Navigation">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>

          <ul className="home-nav-links-seo">
            <li><Link to="/guides">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link></li>
            <li><Link to="/tools/restaurant-tip-pool-calculator" className="active">{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link></li>
            <li><Link to="/tools/free-hospitality-qr-generator">{isEn ? 'QR Generator' : 'QR Üretici'}</Link></li>
            <li><Link to="/compare/card-machine-vs-qr-tipping">{isEn ? 'Comparisons' : 'Karşılaştırma'}</Link></li>
          </ul>

          <div className="home-nav-actions">
            <LanguageSelector variant="navbar" />
            <Link to="/login" className="home-btn-ghost">
              {isEn ? 'Login' : 'Giriş'}
            </Link>
            <Link to="/register" className="home-btn-primary">
              {isEn ? 'Get Started' : 'Hemen Başla'} <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main className="seo-page-wrapper">
        <div className="home-container">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
            <span>/</span>
            <span style={{ color: '#94a3b8' }}>{isEn ? 'Tools' : 'Araçlar'}</span>
            <span>/</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{isEn ? 'Shift Tip Pool' : 'Vardiya Havuzu'}</span>
          </nav>

          {/* Hero */}
          <div className="seo-hero-card" style={{ textAlign: 'center' }}>
            <div className="seo-hero-glow" />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
              <div className="seo-badge-row" style={{ justifyContent: 'center' }}>
                <span className="seo-pill seo-pill-emerald">
                  <Calculator size={14} />
                  <span>{meta.badge}</span>
                </span>
              </div>
              <h1 className="seo-page-title">{meta.title}</h1>
              <p className="seo-page-desc" style={{ margin: '0 auto' }}>{meta.description}</p>
            </div>
          </div>

          {/* Workspace Card */}
          <div className="seo-workspace-card">
            {/* Top Inputs: Currency & Pool Sources */}
            <div className="seo-workspace-topbar">
              <div>
                <label className="seo-calc-input-label">{isEn ? 'Currency' : 'Para Birimi'}</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['₺', '$', '€', '£', '¥'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`seo-pct-btn ${currency === curr ? 'active' : ''}`}
                      style={{ padding: '0.5rem 0.75rem' }}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="seo-calc-input-label">{isEn ? 'Cash Tip Box' : 'Nakit Tip Kutusu'}</label>
                <div className="seo-calc-input-wrapper" style={{ margin: 0 }}>
                  <span className="seo-calc-input-symbol">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    value={cashTips}
                    onChange={(e) => setCashTips(parseFloat(e.target.value) || 0)}
                    className="seo-calc-input"
                    style={{ fontSize: '1.1rem', padding: '0.65rem 0.75rem 0.65rem 2.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="seo-calc-input-label">{isEn ? 'Bank POS Slips' : 'Banka POS Slip'}</label>
                <div className="seo-calc-input-wrapper" style={{ margin: 0 }}>
                  <span className="seo-calc-input-symbol">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    value={posTips}
                    onChange={(e) => setPosTips(parseFloat(e.target.value) || 0)}
                    className="seo-calc-input"
                    style={{ fontSize: '1.1rem', padding: '0.65rem 0.75rem 0.65rem 2.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="seo-calc-input-label">{isEn ? 'Digital QR Tips' : 'Dijital QR Bahşiş'}</label>
                <div className="seo-calc-input-wrapper" style={{ margin: 0 }}>
                  <span className="seo-calc-input-symbol">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    value={digitalTips}
                    onChange={(e) => setDigitalTips(parseFloat(e.target.value) || 0)}
                    className="seo-calc-input"
                    style={{ fontSize: '1.1rem', padding: '0.65rem 0.75rem 0.65rem 2.25rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <div className="seo-metric-card highlight">
                <span className="seo-stat-label" style={{ color: '#34d399' }}>{isEn ? 'Total Shift Pool' : 'Toplam Vardiya Havuzu'}</span>
                <div className="seo-metric-val">{currency}{totalPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="seo-metric-card">
                <span className="seo-stat-label">{isEn ? 'Total Shift Hours' : 'Toplam Vardiya Saati'}</span>
                <div className="seo-metric-val">{calculations.totalHours} hrs</div>
              </div>
              <div className="seo-metric-card">
                <span className="seo-stat-label">{isEn ? 'Total Weight Points' : 'Toplam Havuz Puanı'}</span>
                <div className="seo-metric-val">{calculations.totalPoints.toFixed(1)} pts</div>
              </div>
              <div className="seo-metric-card">
                <span className="seo-stat-label">{isEn ? '1 Point-Hour Value' : '1 Puan-Saat Değeri'}</span>
                <div className="seo-metric-val" style={{ color: '#38bdf8' }}>{currency}{calculations.pointValue.toFixed(2)}</div>
              </div>
            </div>

            {/* Roster Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table className="seo-roster-table">
                <thead>
                  <tr>
                    <th>{isEn ? 'Staff Member' : 'Personel Adı'}</th>
                    <th>{isEn ? 'Role' : 'Görevi'}</th>
                    <th>{isEn ? 'Weight' : 'Katsayı'}</th>
                    <th>{isEn ? 'Hours' : 'Saat'}</th>
                    <th style={{ textAlign: 'right' }}>{isEn ? 'Payout Share' : 'Hakediş'}</th>
                    <th style={{ textAlign: 'right' }}>{isEn ? 'Hourly' : 'Saatlik'}</th>
                    <th style={{ textAlign: 'center' }}>{isEn ? 'Action' : 'Sil'}</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.distributions.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateStaff(member.id, { name: e.target.value })}
                          className="seo-roster-input"
                          style={{ width: '100%' }}
                        />
                      </td>
                      <td>
                        <select
                          value={member.role}
                          onChange={(e) => {
                            const found = PRESET_ROLES.find((r) => r.id === e.target.value);
                            handleUpdateStaff(member.id, {
                              role: e.target.value,
                              weight: found ? found.defaultWeight : 1.0,
                            });
                          }}
                          className="seo-roster-input"
                          style={{ background: '#1e293b' }}
                        >
                          {PRESET_ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {isEn ? r.name.en : r.name.tr} ({r.defaultWeight}x)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={member.weight}
                          onChange={(e) => handleUpdateStaff(member.id, { weight: parseFloat(e.target.value) || 1.0 })}
                          className="seo-roster-input"
                          style={{ width: 65 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={member.hours}
                          onChange={(e) => handleUpdateStaff(member.id, { hours: parseFloat(e.target.value) || 0 })}
                          className="seo-roster-input"
                          style={{ width: 65 }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>
                        {currency}{member.amount.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {currency}{member.hourlyRate.toFixed(2)}/h
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(member.id)}
                          disabled={staff.length <= 1}
                          style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={handleAddStaff}
                className="home-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
              >
                <Plus size={16} color="#10b981" />
                <span>{isEn ? 'Add Staff Member' : 'Personel Ekle'}</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="home-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem' }}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  <span>{copied ? (isEn ? 'Copied!' : 'Kopyalandı!') : (isEn ? 'Copy' : 'Kopyala')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="home-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem' }}
                >
                  <Download size={16} />
                  <span>{isEn ? 'Download CSV' : 'CSV İndir'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="home-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                >
                  <Printer size={16} />
                  <span>{isEn ? 'Print Sheet' : 'Rapor Yazdır'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upgrade Pitch */}
          <div className="seo-verdict-card" style={{ flexDirection: 'column', marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Sparkles size={24} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                {isEn ? 'Automate Your Restaurant Tip Pool with Naponi' : 'Restoranınızın Bahşiş Dağıtımını Naponi ile Otomatikleştirin'}
              </h3>
            </div>
            <p style={{ marginBottom: '1.5rem' }}>
              {isEn
                ? 'Naponi connects physical cash tip boxes, external card terminals, and table QR tips into a single live dashboard. Staff see their exact shift earnings instantly on their phones, with automated payouts directly to their bank accounts.'
                : 'Naponi hem masadaki nakit tip kutularını hem banka POS fişlerini hem de QR kodlu bahşişleri tek bir dijital havuzda birleştirir. Personel kazancını kendi mobil panelinden anında görür, tartışmalar ve hesaplama hataları son bulur.'}
            </p>
            <Link to="/register" className="home-btn-primary">
              {isEn ? 'Create Free Business Account' : 'Ücretsiz İşletme Hesabı Aç'} <ArrowRight size={16} />
            </Link>
          </div>

          {/* FAQs */}
          <div className="seo-faq-wrap">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                {isEn ? 'Frequently Asked Questions About Tip Pooling' : 'Bahşiş Havuzu ve Dağıtımı Hakkında Sık Sorulan Sorular'}
              </h2>
            </div>

            {faqs.map((faq, idx) => (
              <div key={idx} className="seo-faq-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="seo-faq-btn"
                >
                  <span className="seo-faq-question">
                    {isEn ? faq.q.en : faq.q.tr}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp size={18} color="#10b981" />
                  ) : (
                    <ChevronDown size={18} color="#94a3b8" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="seo-faq-body">
                    {isEn ? faq.a.en : faq.a.tr}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div>© {new Date().getFullYear()} NAPONI. {t('home.footerRights')}</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/guides" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link>
              <Link to="/tools/restaurant-tip-pool-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link>
              <Link to="/tools/free-hospitality-qr-generator" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'QR Generator' : 'QR Üretici'}</Link>
              <Link to="/compare/card-machine-vs-qr-tipping" style={{ color: '#64748b', textDecoration: 'none' }}>POS vs QR</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
