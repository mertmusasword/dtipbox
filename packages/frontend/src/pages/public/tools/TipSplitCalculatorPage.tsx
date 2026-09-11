import React, { useState, useMemo } from 'react';
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
  const defaultCurrency = language === 'tr' ? '₺' : language === 'ja' ? '¥' : ['de', 'es', 'fr', 'pt'].includes(language) ? '€' : '$';
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  // State
  const [totalTip, setTotalTip] = useState<number>(language === 'tr' ? 3000 : 300);
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
          answer: 'The most popular hospitality formula allocates 60%–70% to front-of-house service staff who interact directly with guests, 20%–25% to back-of-house kitchen/culinary team members, and 10%–15% to bar mixologists and bussers.',
        },
        {
          question: 'Should bussers, barbacks, and runners receive a share of the tip pool?',
          answer: 'Yes. In high-performing restaurants, support staff are typically included with partial point weighting (e.g., 0.5 points compared to 1.0 full point for lead servers) to ensure seamless floor coordination.',
        },
        {
          question: 'Can Naponi automate tip pool distribution digitally?',
          answer: 'Yes. Naponi allows restaurant managers to set automated pooling rules on the dashboard. Digital QR tips collected throughout the shift are automatically categorized and reported per staff member without manual spreadsheet work.',
        },
      ]
    : [
        {
          question: 'Bahşiş havuzunda yüzdeler nasıl belirlenmelidir?',
          answer: 'Sektörde en sık uygulanan model; doğrudan müşteriyle temas kuran servis ekibine %60-%70, lezzet kalitesini sağlayan mutfak personeline %20-%30, bar ve komi ekibine %10-%15 ayrılmasıdır.',
        },
        {
          question: 'Bahşiş dağıtımında komi veya stajyerlere pay verilir mi?',
          answer: 'Evet. Birçok restoranda komiler genellikle garson puanının yarısı oranında (%50 ağırlık) değerlendirilerek havuza dahil edilir.',
        },
        {
          question: 'Naponi dijital bahşiş havuzunu otomatik bölebilir mi?',
          answer: 'Evet. Naponi işletme panelinde tanımlayacağınız kurallarla gün boyu QR ile toplanan tüm bahşişler otomatik olarak personel bazında hesaplanır ve raporlanır.',
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

      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Tool Navigation">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <LanguageSelector variant="navbar" />
            <Link to="/blog" className="home-btn-ghost">Blog</Link>
            <Link to="/tools/tip-calculator" className="home-btn-ghost">
              {isEn ? 'Tip Calculator' : 'Bahşiş Hesaplayıcı'}
            </Link>
            <Link to="/register" className="home-btn-primary">
              {isEn ? 'Get QR for Business' : 'İşletmenize QR Alın'}
            </Link>
          </div>
        </nav>
      </header>

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
                  placeholder={language === 'tr' ? '3000' : '300'}
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
