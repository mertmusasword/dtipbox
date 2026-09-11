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
import { SEO_TOOLS } from '../../../content/tools/tools';
import { trackToolUsed, trackBlogCtaClick } from '../../../analytics';
import '../../../styles/home.css';

export const TipSplitCalculatorPage: React.FC = () => {
  const meta = SEO_TOOLS['tip-split-calculator'];

  // State
  const [totalTip, setTotalTip] = useState<number>(3000);
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
        { name: 'Servis / Garson', count: serverCount, pct: serverPct, total: serverTotal, perPerson: serverPerPerson },
        { name: 'Mutfak / Şef', count: kitchenCount, pct: kitchenPct, total: kitchenTotal, perPerson: kitchenPerPerson },
        { name: 'Bar / Barmen', count: barCount, pct: barPct, total: barTotal, perPerson: barPerPerson },
      ],
    };
  }, [totalTip, mode, personCount, serverCount, serverPct, kitchenCount, kitchenPct, barCount, barPct]);

  const handleCopy = () => {
    let text = `Toplam Bahşiş Havuzu: ${totalTip.toLocaleString('tr-TR')} ₺\n`;
    if (mode === 'equal') {
      text += `${personCount} Kişi Arasında Eşit Bölüşüm: Kişi başı ${results.equalPerPerson.toLocaleString('tr-TR')} ₺\n`;
    } else {
      results.groups.forEach((g) => {
        text += `${g.name} (${g.count} kişi, %${g.pct}): Grup toplamı ${g.total.toLocaleString('tr-TR')} ₺ | Kişi başı ${g.perPerson.toLocaleString('tr-TR')} ₺\n`;
      });
    }
    text += `— Naponi Bahşiş Bölüştürücü (https://www.naponi.com/tools/tip-split-calculator)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    trackToolUsed('tip-split-calculator', { action: 'copy_summary', mode });
  };

  const faqs = [
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
          { name: 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: 'Araçlar', url: 'https://www.naponi.com/tools/tip-calculator' },
          { name: meta.name, url: meta.canonicalUrl },
        ]}
        faqSchema={faqs}
      />

      <header className="home-nav-wrapper">
        <nav className="home-nav">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <Link to="/blog" className="home-btn-ghost">Blog</Link>
            <Link to="/tools/tip-calculator" className="home-btn-ghost">Bahşiş Hesaplayıcı</Link>
            <Link to="/register" className="home-btn-primary">İşletmenize QR Alın</Link>
          </div>
        </nav>
      </header>

      <main className="blog-container" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>/</span>
          <span>Araçlar</span>
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

        {/* Mode Selector */}
        <div className="tool-mode-tabs">
          <button
            type="button"
            className={`tool-mode-tab ${mode === 'roles' ? 'active' : ''}`}
            onClick={() => setMode('roles')}
          >
            <PieChart size={18} /> Role / Departmana Göre Yüzdesel Dağıtım
          </button>
          <button
            type="button"
            className={`tool-mode-tab ${mode === 'equal' ? 'active' : ''}`}
            onClick={() => setMode('equal')}
          >
            <Users size={18} /> Tüm Ekip Arasında Eşit Dağıtım
          </button>
        </div>

        <div className="tool-calculator-grid">
          {/* Inputs */}
          <div className="tool-card tool-input-card">
            <h2 className="tool-card-title">
              <Calculator size={20} className="tool-icon" /> Havuz Bilgileri
            </h2>

            <div className="tool-field">
              <label htmlFor="total-tip">Toplam Toplanan Bahşiş Tutarı (₺)</label>
              <div className="tool-input-wrap">
                <span className="tool-input-prefix">₺</span>
                <input
                  id="total-tip"
                  type="number"
                  min="0"
                  step="50"
                  value={totalTip || ''}
                  onChange={(e) => setTotalTip(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="3000"
                  className="tool-input"
                />
              </div>
            </div>

            {mode === 'equal' ? (
              <div className="tool-field">
                <label htmlFor="person-count">Toplam Çalışan Sayısı: {personCount} Kişi</label>
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
                    <strong>Servis Ekibi (Garsonlar)</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kişi Sayısı: {serverCount}</div>
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
                    <strong>Mutfak Ekibi (Aşçılar)</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kişi Sayısı: {kitchenCount}</div>
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
                    <strong>Bar Ekibi (Barmenler)</strong>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kişi Sayısı: {barCount}</div>
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
                    * Not: Yüzdeler toplamı %{serverPct + kitchenPct + barPct}. Tam dağıtım için %100 olması tavsiye edilir.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="tool-card tool-result-card">
            <h2 className="tool-card-title">Dağıtım Sonuçları</h2>

            {mode === 'equal' ? (
              <div className="tool-result-box">
                <div className="tool-result-row">
                  <span>Toplam Bahşiş Havuzu:</span>
                  <strong>{totalTip.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div className="tool-result-divider" />
                <div className="tool-result-row total">
                  <span>Kişi Başı Net Pay:</span>
                  <strong className="text-gradient">
                    {results.equalPerPerson.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                  </strong>
                </div>
              </div>
            ) : (
              <div className="tool-result-box">
                <div className="tool-result-row">
                  <span>Toplam Havuz:</span>
                  <strong>{totalTip.toLocaleString('tr-TR')} ₺</strong>
                </div>
                <div className="tool-result-divider" />
                {results.groups.map((g, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.92rem' }}>
                      <span>{g.name} (%{g.pct}):</span>
                      <strong>{g.total.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', marginTop: 3 }}>
                      <span>Kişi Başı ({g.count} kişi):</span>
                      <span>{g.perPerson.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="tool-copy-btn" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Rapor Kopyalandı!' : 'Dağıtım Raporunu Kopyala'}</span>
            </button>

            <div className="tool-promo-box">
              <h4>Havuz Dağıtımını Otomatikleştirin</h4>
              <p>Masanıza Naponi QR kodlarını yerleştirin, toplanan bahşişleri sistem ekibinize otomatik ve adilce dağıtsın.</p>
              <Link
                to="/register"
                className="home-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => trackBlogCtaClick('tip_split_promo', '/register')}
              >
                Ücretsiz İşletme Hesabı Açın &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">Sıkça Sorulan Sorular</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem' }}>Bahşiş Havuzu ve Paylaşımı Hakkında</h2>
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
          <h3>İlgili Rehberler</h3>
          <div className="tool-links-grid">
            <Link to="/blog/bahsis-havuzu-tip-pool-nedir-nasil-dagitilir" className="tool-link-card">
              <strong>Bahşiş Havuzu (Tip Pool) Nedir?</strong>
              <p>Restoranlarda adil bahşiş dağıtım modelleri ve formüller</p>
            </Link>
            <Link to="/tools/tip-calculator" className="tool-link-card">
              <strong>Bahşiş Hesaplama Aracı</strong>
              <p>Müşteriler için hesap tutarına göre bahşiş hesaplayıcı</p>
            </Link>
            <Link to="/solutions/restaurants" className="tool-link-card">
              <strong>Restoranlar İçin Dijital Bahşiş</strong>
              <p>Masada temassız QR bahşiş sistemi kurulumu</p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. Tüm hakları saklıdır.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>Restoranlar</Link>
              <Link to="/tools/tip-split-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>Bahşiş Bölüştürücü</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
