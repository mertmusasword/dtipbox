import React, { useState, useMemo } from 'react';
import { PublicNavbar } from '../../../components/PublicNavbar';
import { Link } from 'react-router-dom';
import {
  Users,
  PieChart,
  Calculator,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../../../content/tools/tools';
import { trackToolUsed, trackBlogCtaClick } from '../../../analytics';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

const CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '₺', label: 'TRY (₺)' },
  { symbol: '¥', label: 'JPY (¥)' },
];

export const TipSplitCalculatorPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'tr';
  const meta = isEn ? SEO_TOOLS_EN['tip-split-calculator'] : SEO_TOOLS['tip-split-calculator'];

  // Currency State
  const defaultCurrency = language === 'tr' ? '₺' : language === 'ru' ? '₽' : language === 'ja' ? '¥' : ['de', 'es', 'fr', 'pt'].includes(language) ? '€' : '$';
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  // State
  const [totalTip, setTotalTip] = useState<number>(language === 'tr' ? 3000 : language === 'ru' ? 10000 : language === 'ja' ? 30000 : 300);
  const [mode, setMode] = useState<'roles' | 'equal'>('roles');
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Equal Mode State
  const [personCount, setPersonCount] = useState<number>(6);

  // Role Mode State
  const [serverCount, setServerCount] = useState<number>(4);
  const [serverPct, setServerPct] = useState<number>(60);

  const [kitchenCount, setKitchenCount] = useState<number>(2);
  const [kitchenPct, setKitchenPct] = useState<number>(25);

  const [barCount, setBarCount] = useState<number>(1);
  const [barPct, setBarPct] = useState<number>(15);

  // Calculations
  const results = useMemo(() => {
    if (mode === 'equal') {
      const perPerson = personCount > 0 ? totalTip / personCount : 0;
      return {
        equalPerPerson: perPerson,
        groups: [],
      };
    }

    // Role-based calculation
    const serverTotal = (totalTip * serverPct) / 100;
    const serverPerPerson = serverCount > 0 ? serverTotal / serverCount : 0;

    const kitchenTotal = (totalTip * kitchenPct) / 100;
    const kitchenPerPerson = kitchenCount > 0 ? kitchenTotal / kitchenCount : 0;

    const barTotal = (totalTip * barPct) / 100;
    const barPerPerson = barCount > 0 ? barTotal / barCount : 0;

    return {
      equalPerPerson: 0,
      groups: [
        {
          name: isEn ? 'Service / Waiters' : 'Servis / Garson',
          count: serverCount,
          pct: serverPct,
          total: serverTotal,
          perPerson: serverPerPerson,
        },
        {
          name: isEn ? 'Kitchen / Chefs' : 'Mutfak / Şef',
          count: kitchenCount,
          pct: kitchenPct,
          total: kitchenTotal,
          perPerson: kitchenPerPerson,
        },
        {
          name: isEn ? 'Bar / Mixologists' : 'Bar / Barmen',
          count: barCount,
          pct: barPct,
          total: barTotal,
          perPerson: barPerPerson,
        },
      ],
    };
  }, [totalTip, mode, personCount, serverCount, serverPct, kitchenCount, kitchenPct, barCount, barPct, isEn]);

  const handleCopy = () => {
    let text = isEn
      ? `Total Tip Pool: ${totalTip.toLocaleString()} ${currency}\n`
      : `Toplam Bahşiş Havuzu: ${totalTip.toLocaleString('tr-TR')} ₺\n`;

    if (mode === 'equal') {
      text += isEn
        ? `Equal Split among ${personCount} staff: Per person ${results.equalPerPerson.toFixed(2)} ${currency}\n`
        : `${personCount} Kişi Arasında Eşit Bölüşüm: Kişi başı ${results.equalPerPerson.toLocaleString('tr-TR')} ₺\n`;
    } else {
      results.groups.forEach((g) => {
        text += isEn
          ? `${g.name} (${g.count} staff, ${g.pct}%): Group total ${g.total.toFixed(2)} ${currency} | Per person ${g.perPerson.toFixed(2)} ${currency}\n`
          : `${g.name} (${g.count} kişi, %${g.pct}): Grup toplamı ${g.total.toLocaleString('tr-TR')} ₺ | Kişi başı ${g.perPerson.toLocaleString('tr-TR')} ₺\n`;
      });
    }
    text += isEn
      ? `— Naponi Tip Pool Calculator (https://www.naponi.com/tools/tip-split-calculator)`
      : `— Naponi Bahşiş Bölüştürücü (https://www.naponi.com/tools/tip-split-calculator)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    trackToolUsed('tip-split-calculator', { action: 'copy_summary', mode });
  };

  const faqs = isEn
    ? [
        {
          question: 'What is the most standard restaurant tip pooling breakdown?',
          answer: 'The industry-standard hospitality formula allocates 60%–70% to front-of-house service staff (waiters and head servers) who directly interact with guests, 20%–25% to back-of-house culinary teams (cooks, kitchen prep, and dishwashers), and 10%–15% to bar mixologists and runners.',
        },
        {
          question: 'Can restaurant owners or salaried managers participate in the tip pool?',
          answer: 'No. Under international labor standards (including the US FLSA and UK Employment Tips Act) and common fair-employment legal precedents, restaurant owners, general managers, and supervisors who possess hiring/firing authority are strictly prohibited from keeping or participating in employee tip pools.',
        },
        {
          question: 'How should support staff like bussers, runners, and barbacks be weighted?',
          answer: 'In professional point-based systems, support roles receive partial point weighting. For instance, if lead servers are weighted at 1.0 point, bussers and runners commonly receive 0.5 to 0.7 points, reflecting their vital support role in table turnarounds while acknowledging direct service accountability.',
        },
        {
          question: 'What is the formula for calculating tips by hours worked?',
          answer: 'Employee Share = (Shift Hours × Role Weight) × [Total Tip Pool / Total Weighted Points of All Staff]. This mathematically guarantees that employees who work longer or more demanding shifts are rewarded proportionally and transparently.',
        },
        {
          question: 'Is an equal split or a role-weighted percentage better for restaurant morale?',
          answer: 'For small cafes or fast-casual counters with 2 to 4 staff where everyone rotates tasks, an equal split is optimal. For full-service dining venues with distinct kitchen, service, and bar teams, a role-weighted or point-based model is universally preferred to prevent resentment.',
        },
        {
          question: 'Can Naponi automate tip pool distribution digitally without spreadsheets?',
          answer: 'Yes. Naponi allows restaurant managers to configure automated pooling rules directly on the dashboard. Digital QR tips collected throughout shifts are automatically calculated, split by hours or role weights, and exported as clean CSV payroll audit sheets with one click.',
        },
      ]
    : [
        {
          question: 'Bahşiş havuzunda (tip pool) sektör standardı yüzdeler nasıldır?',
          answer: 'Sektörde en sık uygulanan adil model; doğrudan misafirle ilgilenen salon ve servis ekibine %60-%70, lezzet ve sunum kalitesini sağlayan mutfak personeline %20-%25, bar ve komi ekibine ise %10-%15 pay ayrılmasıdır.',
        },
        {
          question: 'İşletme sahibi, müdür veya salon şefleri bahşiş havuzundan pay alabilir mi?',
          answer: 'Kesinlikle hayır. Hem Yargıtay içtihatlarına hem de uluslararası çalışma standartlarına göre bahşiş, müşterinin doğrudan hizmet veren çalışana yaptığı bir bağıştır. İşveren, restoran sahibi veya işe alma/çıkarma yetkisi olan müdürlerin havuzdan pay alması veya bahşişe el koyması hukuka aykırıdır.',
        },
        {
          question: 'Komi, runner ve bulaşık personeli havuza nasıl dahil edilir?',
          answer: 'Modern işletmelerde puan katsayısı modeli uygulanır. Örneğin garson 1.0 tam puan alırken, komi ve runner personeli 0.5 veya 0.6 puan katsayısı ile değerlendirilir. Böylece masanın hızlı toplanması ödüllendirilirken garsonun sorumluluğu korunur.',
        },
        {
          question: 'Vardiya saatlerine göre bahşiş bölüştürme formülü nedir?',
          answer: 'Personel Payı = (Çalışılan Saat × Rol Katsayısı) × [Toplam Bahşiş / Tüm Ekibin Toplam Puanı]. Bu formül sayesinde 4 saat çalışan yarı zamanlı personel ile 8 saat tam vardiya çalışan personel arasında kuruşu kuruşuna adil bölüşüm sağlanır.',
        },
        {
          question: 'Eşit paylaşım mı yoksa rol ağırlıklı paylaşım mı daha adildir?',
          answer: '3-4 kişinin çalıştığı küçük butik kafelerde ve kahvecilerde herkes her işi yaptığı için eşit bölüşüm idealdir. Ancak geniş kadrolu alakart ve lüks restoranlarda rol ağırlıklı veya puanlı sistem ekip motivasyonunu ve personel bağlılığını en üst düzeyde tutar.',
        },
        {
          question: 'Naponi dijital bahşiş havuzunu Excel kullanmadan nasıl otomatikleştirir?',
          answer: 'Naponi işletme yönetim panelinde işletmenizin rol oranlarını veya puanlarını bir kez tanımlarsınız. Gün boyu masalardaki QR kodlardan toplanan bahşişler vardiya sonunda tek tıkla personele paylaştırılır, PDF/CSV dökümü alınır ve muhasebeye hazır hale getirilir.',
        },
      ];

  return (
    <div className="home-wrapper">
      <SeoHead
        title={meta.metaTitle}
        description={meta.metaDescription}
        canonicalUrl={meta.canonicalUrl}
        keywords={[meta.targetKeyword, ...meta.secondaryKeywords]}
        breadcrumbs={[
          { name: isEn ? 'Home' : 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: isEn ? 'Tools' : 'Araçlar', url: 'https://www.naponi.com/tools/tip-calculator' },
          { name: meta.name, url: meta.canonicalUrl },
        ]}
        alternateLanguages={[
          { lang: 'tr', url: 'https://www.naponi.com/tools/tip-split-calculator' },
          { lang: 'en', url: 'https://www.naponi.com/tools/tip-split-calculator' },
          { lang: 'x-default', url: 'https://www.naponi.com/tools/tip-split-calculator' },
        ]}
        faqSchema={faqs}
      />

      <PublicNavbar />

      <main className="blog-container" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span>{isEn ? 'Tools' : 'Araçlar'}</span>
          <span>/</span>
          <span className="current">{meta.name}</span>
        </nav>

        <div style={{ textAlign: 'center', maxWidth: 760, margin: '1.5rem auto 3rem' }}>
          <span className="home-section-tag">{meta.badge}</span>
          <h1 className="home-section-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {meta.title}
          </h1>
          <p className="home-section-desc" style={{ margin: '0 auto' }}>
            {meta.description}
          </p>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {CURRENCIES.map((c) => (
            <button
              key={c.symbol}
              type="button"
              className={`tool-preset-btn ${currency === c.symbol ? 'active' : ''}`}
              onClick={() => setCurrency(c.symbol)}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Mode Selector */}
        <div className="tool-mode-tabs">
          <button
            type="button"
            className={`tool-mode-tab ${mode === 'roles' ? 'active' : ''}`}
            onClick={() => setMode('roles')}
          >
            <PieChart size={18} /> {isEn ? 'Role / Department Percentages' : 'Role / Departmana Göre Yüzdesel Dağıtım'}
          </button>
          <button
            type="button"
            className={`tool-mode-tab ${mode === 'equal' ? 'active' : ''}`}
            onClick={() => setMode('equal')}
          >
            <Users size={18} /> {isEn ? 'Equal Split Across All Staff' : 'Tüm Ekip Arasında Eşit Dağıtım'}
          </button>
        </div>

        <div className="tool-calculator-grid">
          {/* Inputs */}
          <div className="tool-card tool-input-card">
            <h2 className="tool-card-title">
              <Calculator size={20} className="tool-icon" /> {isEn ? 'Pool Parameters' : 'Havuz Bilgileri'}
            </h2>

            <div className="tool-field">
              <label htmlFor="total-tip">
                {isEn ? `Total Collected Tip Pool (${currency})` : `Toplam Toplanan Bahşiş Tutarı (${currency})`}
              </label>
              <div className="tool-input-wrap">
                <span className="tool-input-prefix">{currency}</span>
                <input
                  id="total-tip"
                  type="number"
                  min="0"
                  step="50"
                  value={totalTip || ''}
                  onChange={(e) => setTotalTip(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder={language === 'tr' ? '3000' : language === 'ru' ? '10000' : language === 'ja' ? '30000' : '300'}
                  className="tool-input"
                />
              </div>
            </div>

            {mode === 'equal' ? (
              <div className="tool-field">
                <label htmlFor="person-count">
                  {isEn ? `Total Staff Count: ${personCount} Staff` : `Toplam Çalışan Sayısı: ${personCount} Kişi`}
                </label>
                <div className="tool-stepper">
                  <button type="button" onClick={() => setPersonCount(Math.max(1, personCount - 1))} className="tool-stepper-btn">-</button>
                  <span className="tool-stepper-value">{personCount}</span>
                  <button type="button" onClick={() => setPersonCount(personCount + 1)} className="tool-stepper-btn">+</button>
                </div>
              </div>
            ) : (
              <div>
                {/* Server */}
                <div className="tool-role-row">
                  <div>
                    <strong>{isEn ? 'Service Team (Servers)' : 'Servis Ekibi (Garsonlar)'}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {isEn ? `Staff Count: ${serverCount}` : `Kişi Sayısı: ${serverCount}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={serverCount}
                      onChange={(e) => setServerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ width: 60, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={serverPct}
                      onChange={(e) => setServerPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      style={{ width: 65, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, textAlign: 'center' }}
                    />
                  </div>
                </div>

                {/* Kitchen */}
                <div className="tool-role-row">
                  <div>
                    <strong>{isEn ? 'Kitchen Team (Chefs/Cooks)' : 'Mutfak Ekibi (Aşçılar)'}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {isEn ? `Staff Count: ${kitchenCount}` : `Kişi Sayısı: ${kitchenCount}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={kitchenCount}
                      onChange={(e) => setKitchenCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ width: 60, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kitchenPct}
                      onChange={(e) => setKitchenPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      style={{ width: 65, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, textAlign: 'center' }}
                    />
                  </div>
                </div>

                {/* Bar */}
                <div className="tool-role-row">
                  <div>
                    <strong>{isEn ? 'Bar Team (Mixologists/Barbacks)' : 'Bar Ekibi (Barmenler)'}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {isEn ? `Staff Count: ${barCount}` : `Kişi Sayısı: ${barCount}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={barCount}
                      onChange={(e) => setBarCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ width: 60, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={barPct}
                      onChange={(e) => setBarPct(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      style={{ width: 65, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, textAlign: 'center' }}
                    />
                  </div>
                </div>

                {serverPct + kitchenPct + barPct !== 100 && (
                  <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                    {isEn
                      ? `* Note: Percentages sum to ${serverPct + kitchenPct + barPct}%. 100% total recommended.`
                      : `* Not: Yüzdeler toplamı %${serverPct + kitchenPct + barPct}. Tam dağıtım için %100 olması tavsiye edilir.`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="tool-card tool-result-card">
            <h2 className="tool-card-title">{isEn ? 'Split Breakdown' : 'Dağıtım Sonuçları'}</h2>

            {mode === 'equal' ? (
              <div className="tool-result-box">
                <div className="tool-result-row">
                  <span>{isEn ? 'Total Tip Pool:' : 'Toplam Bahşiş Havuzu:'}</span>
                  <strong>{totalTip.toLocaleString()} {currency}</strong>
                </div>
                <div className="tool-result-divider" />
                <div className="tool-result-row total">
                  <span>{isEn ? 'Net Share Per Staff:' : 'Kişi Başı Net Pay:'}</span>
                  <strong className="text-gradient">
                    {results.equalPerPerson.toFixed(2)} {currency}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="tool-result-box">
                <div className="tool-result-row">
                  <span>{isEn ? 'Total Pool:' : 'Toplam Havuz:'}</span>
                  <strong>{totalTip.toLocaleString()} {currency}</strong>
                </div>
                <div className="tool-result-divider" />
                {results.groups.map((g, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.92rem' }}>
                      <span>{g.name} ({g.pct}%):</span>
                      <strong>{g.total.toFixed(2)} {currency}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', marginTop: 3 }}>
                      <span>{isEn ? `Per Person (${g.count} staff):` : `Kişi Başı (${g.count} kişi):`}</span>
                      <span>{g.perPerson.toFixed(2)} {currency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="tool-copy-btn" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>
                {copied
                  ? (isEn ? 'Report Copied!' : 'Rapor Kopyalandı!')
                  : (isEn ? 'Copy Breakdown Report' : 'Dağıtım Raporunu Kopyala')}
              </span>
            </button>

            <div className="tool-promo-box">
              <h4>{isEn ? 'Automate Your Tip Pool Digitally' : 'Havuz Dağıtımını Otomatikleştirin'}</h4>
              <p>
                {isEn
                  ? 'Deploy Naponi QR stands on your tables. The platform automatically tracks, pools, and distributes gratuities fairly.'
                  : 'Masanıza Naponi QR kodlarını yerleştirin, toplanan bahşişleri sistem ekibinize otomatik ve adilce dağıtsın.'}
              </p>
              <Link
                to="/register"
                className="home-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => trackBlogCtaClick('tip_split_promo', '/register')}
              >
                {isEn ? 'Open Free Business Account →' : 'Ücretsiz İşletme Hesabı Açın →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Rich Editorial Guide Section */}
        <div className="tool-guide-wrapper">
          {/* Section 1: Tip Pooling Models Comparison */}
          <article className="tool-guide-section">
            <h2>{isEn ? 'Restaurant Tip Pooling Models: Which System is Right for Your Team?' : 'Restoran Bahşiş Havuzu (Tip Pool) Modelleri: Hangi Sistem İşletmeniz İçin Uygun?'}</h2>
            <p>
              {isEn
                ? 'Tip pooling is a collaborative gratuity management practice where tips collected across a dining service are combined into a central fund and redistributed among qualifying front-of-house and back-of-house employees. Selecting the right distribution model is essential for staff retention and transparent teamwork.'
                : 'Bahşiş havuzu (tip pool), bir restoranda veya kafede toplanan tüm bahşişlerin tek bir fonda birleştirilerek çalışanlar arasında önceden belirlenmiş şeffaf kurallara göre paylaştırılmasıdır. Doğru modeli seçmek, personel sirkülasyonunu (turnover) azaltır ve mutfak ile servis arasındaki iş birliğini güçlendirir.'}
            </p>

            <div className="tool-table-responsive">
              <table className="tool-guide-table">
                <thead>
                  <tr>
                    <th>{isEn ? 'Pooling Model' : 'Havuz Modeli'}</th>
                    <th>{isEn ? 'Best Suited For' : 'Hangi İşletmeler İçin Uygun?'}</th>
                    <th>{isEn ? 'Key Advantages' : 'En Büyük Avantajı'}</th>
                    <th>{isEn ? 'Potential Drawbacks' : 'Olası Dezavantajı'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{isEn ? '1. Equal Split (Per Capita)' : '1. Eşit Dağıtım (Kişi Başı)'}</strong></td>
                    <td>{isEn ? 'Small cafes, coffee shops, food trucks (2–6 staff)' : 'Küçük kafeler, 3. nesil kahveciler ve büfeler (2-5 kişi)'}</td>
                    <td>{isEn ? 'Extremely simple to calculate without software' : 'Hesaplaması çok basittir, anında paylaşılır'}</td>
                    <td>{isEn ? 'Ignores seniority and shift hour differences' : 'Farklı saat çalışanlar arasında adaletsizlik yaratabilir'}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? '2. Role-Weighted Percentage' : '2. Rol Bazlı Yüzdesel Dağıtım'}</strong></td>
                    <td>{isEn ? 'Bistros, bars, and casual dining restaurants' : 'Alakart restoranlar, bistrolar ve kokteyl barları'}</td>
                    <td>{isEn ? 'Rewards service staff (60%) while compensating kitchen (25%)' : 'Mutfak ve barı motive ederken garsonun payını korur'}</td>
                    <td>{isEn ? 'Requires daily calculation when headcounts shift' : 'Vardiya kadrosu değiştikçe hesaplama gerektirir'}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? '3. Point & Hours System' : '3. Puan ve Çalışılan Saat Sistemi'}</strong></td>
                    <td>{isEn ? 'High-volume dining, hotel restaurants, and fine dining' : 'Yoğun restoranlar, otel F&B ve fine dining'}</td>
                    <td>{isEn ? '100% mathematically fair across part-time & full-time' : 'Tam zamanlı ve yarı zamanlı için kuruşu kuruşuna adil'}</td>
                    <td>{isEn ? 'Cumbersome with paper; best automated with Naponi' : 'Kağıt-kalemle zordur; dijital altyapı gerektirir'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* Section 2: Mathematical Hours & Points Formula */}
          <article className="tool-guide-section">
            <h2>{isEn ? 'The Mathematical Formula for Fair Shift Tip Pool Distribution' : 'Vardiya Bahşiş Havuzunun Adil Dağıtım Formülü'}</h2>
            <p>
              {isEn
                ? 'To fairly compensate staff working different shift lengths (e.g. lunch rush vs. full 8-hour dinner closing), modern hospitality managers use the Weighted Point-Hour formula:'
                : 'Farklı saatlerde çalışan personeli (örneğin 4 saat öğle servisine gelen komi ile 8 saat akşam servisini kapatan kaptan garson) adil ödüllendirmek için sektör standardı Ağırlıklı Puan Formülü kullanılır:'}
            </p>

            <div className="tool-formula-box">
              {isEn ? 'Staff Points = Hours Worked × Role Point Weight' : 'Personel Puanı = Çalışılan Saat × Rol Katsayısı'}<br />
              {isEn ? 'Total Shift Points = Sum of (Hours Worked × Role Point Weight) for all staff' : 'Toplam Vardiya Puanı = Tüm Personelin Puanlarının Toplamı'}<br />
              {isEn ? 'Point Value ($/pt) = Total Tip Pool / Total Shift Points' : '1 Puanın Parasal Değeri = Toplam Toplanan Bahşiş / Toplam Vardiya Puanı'}<br />
              {isEn ? 'Individual Payout = Staff Points × Point Value' : 'Personele Ödenecek Bahşiş = Personel Puanı × 1 Puanın Değeri'}
            </div>

            <h3>{isEn ? 'Example Scenario: A Busy Saturday Dinner Shift' : 'Örnek Uygulama: Yoğun Bir Cumartesi Akşamı'}</h3>
            <p>
              {isEn
                ? 'A restaurant collects $1,800 in digital and cash tips across 5 team members. With lead servers weighted at 1.0, kitchen at 0.6, and bussers at 0.5:'
                : 'Bir restoranda cumartesi akşamı QR ve nakit toplam 12.000 ₺ bahşiş toplanmıştır. Ekipte 2 garson (1.0 katsayı), 1 aşçı (0.6 katsayı) ve 1 komi (0.5 katsayı) bulunmaktadır:'}
            </p>
            <ul>
              <li><strong>{isEn ? 'Server 1 (8 hours @ 1.0):' : 'Garson 1 (8 saat × 1.0):'}</strong> {isEn ? '8.0 points' : '8.0 puan'}</li>
              <li><strong>{isEn ? 'Server 2 (8 hours @ 1.0):' : 'Garson 2 (8 saat × 1.0):'}</strong> {isEn ? '8.0 points' : '8.0 puan'}</li>
              <li><strong>{isEn ? 'Cook (8 hours @ 0.6):' : 'Aşçı (8 saat × 0.6):'}</strong> {isEn ? '4.8 points' : '4.8 puan'}</li>
              <li><strong>{isEn ? 'Busser (6 hours @ 0.5):' : 'Komi (6 saat × 0.5):'}</strong> {isEn ? '3.0 points' : '3.0 puan'}</li>
              <li><strong>{isEn ? 'Total Shift Points:' : 'Tüm Ekibin Toplam Puanı:'}</strong> {isEn ? '23.8 points' : '23.8 puan'}</li>
            </ul>
          </article>

          {/* Section 3: Legal Compliance & Manager Prohibition */}
          <article className="tool-guide-section">
            <h2>{isEn ? 'Legal Compliance: Who May and May NOT Participate in a Tip Pool?' : 'Hukuki Mevzuat: Kimler Bahşiş Havuzundan Pay Alabilir, Kimler Alamaz?'}</h2>
            <p>
              {isEn
                ? 'Labor authorities worldwide enforce strict regulations to protect hospitality workers from tip theft. Operating a compliant tip pool requires understanding these mandatory boundaries:'
                : 'Hem Türk İş Hukuku Yargıtay kararlarında hem de küresel gastronomi standartlarında (ABD FLSA ve İngiltere Tips Act), bahşiş havuzunun çalışan haklarını koruması için kesin kırmızı çizgiler çizilmiştir:'}
            </p>
            <ul>
              <li>
                <strong>{isEn ? 'Managers and Employers are STRICTLY Excluded:' : 'İşverenler ve Şirket Müdürleri Kesinlikle Pay Alamaz:'}</strong>{' '}
                {isEn
                  ? 'Owners, general managers, floor directors, and supervisors with scheduling or disciplinary authority may never take a share of employee tips, even if they assisted on the floor.'
                  : 'Restoran sahipleri, işletme ortakları, genel müdürler ve işe alma/çıkarma yetkisi olan yöneticiler bahşiş havuzundan 1 kuruş dahi alamaz. Bahşiş doğrudan hizmeti üreten işçinin anayasal ve yasal hakkıdır.'}
              </li>
              <li>
                <strong>{isEn ? 'Back-of-House (Kitchen & Dishwashing) Inclusion:' : 'Mutfak ve Bulaşık Personelinin Havuza Dahil Edilmesi:'}</strong>{' '}
                {isEn
                  ? 'Modern regulations allow back-of-house staff to participate in valid employer-mandated tip pools as long as all staff receive at least full minimum base wages without tip credit deductions.'
                  : 'Yargıtay ve sektör teamüllerine göre mutfak personeli, garsonların topladığı bahşiş havuzundan işletme içi mutabakatla belirlenen oranda pay alabilir. Bu durum salon ile mutfak arasındaki bağı güçlendirir.'}
              </li>
              <li>
                <strong>{isEn ? 'Deductions for Breakage & Till Shortages are Prohibited:' : 'Kırılan Tabak veya Kasa Açığı Bahşişten Kesilemez:'}</strong>{' '}
                {isEn
                  ? 'Employers may not deduct cash register shortages, walkouts, or broken dishware from staff tips.'
                  : 'İşletmeler kırılan bardak/tabak veya masadan ödeme yapmadan kalkan müşterilerin zararını çalışanların bahşiş havuzundan kesinlikle kesemez.'}
              </li>
            </ul>
          </article>
        </div>

        {/* FAQs */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{isEn ? 'FAQ' : 'Sıkça Sorulan Sorular'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem' }}>
              {isEn ? 'Tip Pooling Rules & FAQ' : 'Bahşiş Havuzu ve Paylaşımı Hakkında'}
            </h2>
          </div>

          <div className="home-faq-accordion" style={{ maxWidth: 840, margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className={`home-faq-item ${openFaq === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="home-faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === idx && <div className="home-faq-answer">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className="tool-related-links">
          <h3>{isEn ? 'Related Guides' : 'İlgili Rehberler'}</h3>
          <div className="tool-links-grid">
            <Link to={isEn ? "/blog/how-to-manage-staff-tips-individual-qr-vs-tip-pooling" : "/blog/calisan-bahsislerini-yonetmenin-yollari"} className="tool-link-card">
              <strong>{isEn ? 'Staff Tip Management & Pooling Guide' : 'Çalışan Bahşişlerini Yönetme & Havuz Rehberi'}</strong>
              <p>{isEn ? 'Models, percentages, and fair shift distribution formulas' : 'Restoranlarda adil bahşiş dağıtım modelleri ve formüller'}</p>
            </Link>
            <Link to="/tools/tip-calculator" className="tool-link-card">
              <strong>{isEn ? 'Bill & Tip Calculator' : 'Bahşiş Hesaplama Aracı'}</strong>
              <p>{isEn ? 'Instant bill tip percentage and split calculator for diners' : 'Müşteriler için hesap tutarına göre bahşiş hesaplayıcı'}</p>
            </Link>
            <Link to="/solutions/restaurants" className="tool-link-card">
              <strong>{isEn ? 'Digital Tipping for Restaurants' : 'Restoranlar İçin Dijital Bahşiş'}</strong>
              <p>{isEn ? 'Tableside contactless QR code tipping system setup' : 'Masada temassız QR bahşiş sistemi kurulumu'}</p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. {isEn ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Restaurants' : 'Restoranlar'}</Link>
              <Link to="/tools/tip-split-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Tip Pool Splitter' : 'Bahşiş Bölüştürücü'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
