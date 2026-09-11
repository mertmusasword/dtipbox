import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Users,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  Globe,
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

export const TipCalculatorPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'tr';
  const meta = isEn ? SEO_TOOLS_EN['tip-calculator'] : SEO_TOOLS['tip-calculator'];

  // Currency State
  const defaultCurrency = language === 'tr' ? '₺' : language === 'ja' ? '¥' : ['de', 'es', 'fr', 'pt'].includes(language) ? '€' : '$';
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  // Calculator State
  const [billAmount, setBillAmount] = useState<number>(language === 'tr' ? 500 : 50);
  const [tipPercent, setTipPercent] = useState<number>(language === 'tr' ? 10 : 18);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [roundUp, setRoundUp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations
  const results = useMemo(() => {
    const rawTip = (billAmount * tipPercent) / 100;
    let totalBill = billAmount + rawTip;
    let finalTip = rawTip;

    if (roundUp) {
      const roundedTotal = Math.ceil(totalBill);
      finalTip = roundedTotal - billAmount;
      totalBill = roundedTotal;
    }

    const tipPerPerson = guestCount > 0 ? finalTip / guestCount : finalTip;
    const totalPerPerson = guestCount > 0 ? totalBill / guestCount : totalBill;

    return {
      tipAmount: finalTip,
      totalAmount: totalBill,
      tipPerPerson,
      totalPerPerson,
    };
  }, [billAmount, tipPercent, guestCount, roundUp]);

  const handlePercentageClick = (pct: number) => {
    setTipPercent(pct);
    trackToolUsed('tip-calculator', { action: 'change_percentage', percent: pct });
  };

  const handleCopySummary = () => {
    const text = isEn
      ? `Bill: ${billAmount.toLocaleString()} ${currency} | Tip (${tipPercent}%): ${results.tipAmount.toFixed(2)} ${currency} | Total: ${results.totalAmount.toFixed(2)} ${currency} (${guestCount} guests, per person: ${results.totalPerPerson.toFixed(2)} ${currency}) — Naponi Tip Calculator`
      : `Hesap: ${billAmount.toLocaleString('tr-TR')} ₺ | Bahşiş (%${tipPercent}): ${results.tipAmount.toLocaleString('tr-TR')} ₺ | Toplam: ${results.totalAmount.toLocaleString('tr-TR')} ₺ (${guestCount} Kişi başı: ${results.totalPerPerson.toLocaleString('tr-TR')} ₺) — Naponi Bahşiş Hesaplayıcı`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = isEn
    ? [
        {
          question: 'How much should you typically tip at a restaurant?',
          answer: 'In the United States and Canada, the standard gratuity ranges from 15% to 20% for good dining service, with 18% being common. In European destinations, tipping is discretionary, often 5% to 10% for attentive service, as wages are higher.',
        },
        {
          question: 'How is the per-person bill split calculated?',
          answer: 'The total bill amount plus the calculated tip percentage is summed, then divided equally by the number of dining guests. This calculator instantly displays both each guest’s individual tip portion and their total payment amount.',
        },
        {
          question: 'Should I tip if a service charge or auto-gratuity is already included?',
          answer: 'If the check clearly lists an automatic gratuity or service charge (common for parties of 6 or more), additional tipping is optional and reserved for extraordinary service. To ensure gratuity reaches staff directly without corporate deductions, guests often prefer scanning tableside QR codes.',
        },
      ]
    : [
        {
          question: 'Türkiye’de restoranlarda ne kadar bahşiş bırakılır?',
          answer: 'Türkiye’de restoran ve kafelerde genel kabul gören standart bahşiş oranı hesap tutarının %10’udur. Çok memnun kalınan servislerde bu oran %15-%20 seviyelerine çıkabilir. Hızlı self-servis veya kahve siparişlerinde ise bozukluk veya 20-50 ₺ gibi sabit tutarlar yaygındır.',
        },
        {
          question: 'Kişi başı bahşiş bölüşümü nasıl hesaplanır?',
          answer: 'Toplam hesap tutarına seçilen bahşiş yüzdesi eklenir ve elde edilen nihai tutar masadaki kişi sayısına bölünür. Aracımız sayesinde hem kişi başı düşen bahşişi hem de toplam kişi başı ödenecek tutarı anında görebilirsiniz.',
        },
        {
          question: 'Restoran hesabında kuver veya servis ücreti varsa bahşiş verilmeli mi?',
          answer: 'Adisyonda "%10 Servis Ücreti" yer alıyorsa bu tutar genellikle doğrudan garsona kalmayabilir veya işletme maliyetine gidebilir. Servis elemanına doğrudan jest yapmak için masadaki QR kod üzerinden doğrudan garsonun hesabına bahşiş bırakılması en şeffaf yöntemdir.',
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
          { lang: 'tr', url: 'https://www.naponi.com/tools/tip-calculator' },
          { lang: 'en', url: 'https://www.naponi.com/tools/tip-calculator' },
          { lang: 'x-default', url: 'https://www.naponi.com/tools/tip-calculator' },
        ]}
        faqSchema={faqs}
      />

      {/* Nav */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Tool Navigation">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <LanguageSelector variant="navbar" />
            <Link to="/blog" className="home-btn-ghost">Blog</Link>
            <Link to="/tools/tip-split-calculator" className="home-btn-ghost">
              {isEn ? 'Tip Pool Splitter' : 'Bahşiş Bölüştürücü'}
            </Link>
            <Link to="/register" className="home-btn-primary">
              {isEn ? 'Get QR for Business' : 'İşletmenize QR Alın'}
            </Link>
          </div>
        </nav>
      </header>

      <main className="blog-container" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        {/* Breadcrumbs */}
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span>{isEn ? 'Tools' : 'Araçlar'}</span>
          <span>/</span>
          <span className="current">{meta.name}</span>
        </nav>

        {/* Header */}
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

        {/* Calculator Widget Grid */}
        <div className="tool-calculator-grid">
          {/* Left Inputs */}
          <div className="tool-card tool-input-card">
            <h2 className="tool-card-title">
              <Calculator size={20} className="tool-icon" /> {isEn ? 'Bill & Tip Settings' : 'Hesap Bilgileri'}
            </h2>

            {/* Bill Amount */}
            <div className="tool-field">
              <label htmlFor="bill-amount">{isEn ? `Bill Amount (${currency})` : `Hesap Tutarı (${currency})`}</label>
              <div className="tool-input-wrap">
                <span className="tool-input-prefix">{currency}</span>
                <input
                  id="bill-amount"
                  type="number"
                  min="0"
                  step="5"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder={language === 'tr' ? '500' : '50'}
                  className="tool-input"
                />
              </div>
            </div>

            {/* Tip Percentage Presets */}
            <div className="tool-field">
              <label>{isEn ? `Tip Percentage: ${tipPercent}%` : `Bahşiş Oranı: %${tipPercent}`}</label>
              <div className="tool-preset-grid">
                {[5, 10, 15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={`tool-preset-btn ${tipPercent === pct ? 'active' : ''}`}
                    onClick={() => handlePercentageClick(pct)}
                  >
                    {isEn ? `${pct}%` : `%${pct}`}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={tipPercent}
                onChange={(e) => setTipPercent(parseInt(e.target.value, 10))}
                className="tool-slider"
              />
            </div>

            {/* Number of Guests */}
            <div className="tool-field">
              <label htmlFor="guest-count">
                <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {isEn ? `Dining Guests: ${guestCount}` : `Kişi Sayısı: ${guestCount} Kişi`}
              </label>
              <div className="tool-stepper">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="tool-stepper-btn"
                >
                  -
                </button>
                <span className="tool-stepper-value">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="tool-stepper-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Round Up Checkbox */}
            <div className="tool-field-checkbox">
              <label className="tool-checkbox-label">
                <input
                  type="checkbox"
                  checked={roundUp}
                  onChange={(e) => setRoundUp(e.target.checked)}
                />
                <span>{isEn ? 'Round total up to nearest whole number' : 'Toplam tutarı tam sayıya yuvarla'}</span>
              </label>
            </div>
          </div>

          {/* Right Results */}
          <div className="tool-card tool-result-card">
            <h2 className="tool-card-title">{isEn ? 'Summary & Split' : 'Hesap Özeti'}</h2>

            <div className="tool-result-box">
              <div className="tool-result-row">
                <span>{isEn ? 'Bill Amount:' : 'Hesap Tutarı:'}</span>
                <strong>{billAmount.toLocaleString()} {currency}</strong>
              </div>
              <div className="tool-result-row highlight">
                <span>{isEn ? `Tip Amount (${tipPercent}%):` : `Bahşiş Tutarı (%${tipPercent}):`}</span>
                <strong className="text-gradient">{results.tipAmount.toFixed(2)} {currency}</strong>
              </div>
              <div className="tool-result-divider" />
              <div className="tool-result-row total">
                <span>{isEn ? 'Total Bill:' : 'Genel Toplam:'}</span>
                <strong className="text-white">{results.totalAmount.toFixed(2)} {currency}</strong>
              </div>
            </div>

            {guestCount > 1 && (
              <div className="tool-split-box">
                <div className="tool-split-title">
                  {isEn ? `Split Among ${guestCount} Guests:` : `Kişi Başına Düşen Pay (${guestCount} Kişi):`}
                </div>
                <div className="tool-split-grid">
                  <div className="tool-split-item">
                    <span>{isEn ? 'Tip Per Person' : 'Kişi Başı Bahşiş'}</span>
                    <strong>{results.tipPerPerson.toFixed(2)} {currency}</strong>
                  </div>
                  <div className="tool-split-item">
                    <span>{isEn ? 'Total Per Person' : 'Kişi Başı Toplam'}</span>
                    <strong>{results.totalPerPerson.toFixed(2)} {currency}</strong>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              className="tool-copy-btn"
              onClick={handleCopySummary}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>
                {copied
                  ? (isEn ? 'Summary Copied!' : 'Sonuç Kopyalandı!')
                  : (isEn ? 'Copy Breakdown' : 'Özeti Kopyala')}
              </span>
            </button>

            {/* Business Pitch */}
            <div className="tool-promo-box">
              <h4>{isEn ? 'Are you a Restaurant or Cafe Operator?' : 'Restoran ya da Kafe İşletmecisi misiniz?'}</h4>
              <p>
                {isEn
                  ? 'Empower diners to tip waitstaff in 6 seconds via direct QR codes without app downloads or cash.'
                  : 'Misafirleriniz nakit taşımak zorunda kalmadan masadaki QR kod ile ekibinize doğrudan bahşiş bıraksın.'}
              </p>
              <Link
                to="/register"
                className="home-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => trackBlogCtaClick('tip_calc_promo', '/register')}
              >
                {isEn ? 'Get Your QR Stand in 2 Minutes →' : '2 Dakikada Ücretsiz QR Alın →'}
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{isEn ? 'FAQ' : 'Sıkça Sorulan Sorular'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem' }}>
              {isEn ? 'Common Tipping Questions & Guidelines' : 'Bahşiş Hesaplama Hakkında Merak Edilenler'}
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
          <h3>{isEn ? 'Related Guides & Hospitality Solutions' : 'İlgili İçerikler ve Çözümler'}</h3>
          <div className="tool-links-grid">
            <Link to="/blog/what-is-digital-tipping-complete-guide" className="tool-link-card">
              <strong>{isEn ? 'Digital Tipping Complete Guide' : 'Restoranlarda Dijital Bahşiş Rehberi'}</strong>
              <p>{isEn ? 'How modern QR tipping transforms hospitality staff compensation' : 'Masanıza QR bahşiş sistemi kurmanın tüm detayları'}</p>
            </Link>
            <Link to="/tools/tip-split-calculator" className="tool-link-card">
              <strong>{isEn ? 'Tip Pool Split Calculator' : 'Bahşiş Bölüştürme & Havuz Hesaplayıcı'}</strong>
              <p>{isEn ? 'Split end-of-day gratuities among servers, kitchen, and bar teams' : 'Toplanan bahşişi personel rollerine göre paylaştırın'}</p>
            </Link>
            <Link to="/solutions/restaurants" className="tool-link-card">
              <strong>{isEn ? 'Solutions for Restaurants' : 'Restoranlar İçin Çözümler'}</strong>
              <p>{isEn ? 'Tableside QR digital tipping infrastructure for dining venues' : 'Restoran ve fine dining için temassız QR bahşiş altyapısı'}</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. {isEn ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Restaurants' : 'Restoranlar'}</Link>
              <Link to="/solutions/hotels" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Hotels' : 'Oteller'}</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Tip Calculator' : 'Bahşiş Hesaplayıcı'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
