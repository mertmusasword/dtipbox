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
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS } from '../../../content/tools/tools';
import { trackToolUsed, trackBlogCtaClick } from '../../../analytics';
import '../../../styles/home.css';

export const TipCalculatorPage: React.FC = () => {
  const meta = SEO_TOOLS['tip-calculator'];

  // Calculator State
  const [billAmount, setBillAmount] = useState<number>(500);
  const [tipPercent, setTipPercent] = useState<number>(10);
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
    const text = `Hesap: ${billAmount.toLocaleString('tr-TR')} ₺ | Bahşiş (%${tipPercent}): ${results.tipAmount.toLocaleString('tr-TR')} ₺ | Toplam: ${results.totalAmount.toLocaleString('tr-TR')} ₺ (${guestCount} Kişi başı: ${results.totalPerPerson.toLocaleString('tr-TR')} ₺) — Naponi Bahşiş Hesaplayıcı`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = [
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
          { name: 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: 'Araçlar', url: 'https://www.naponi.com/tools/tip-calculator' },
          { name: meta.name, url: meta.canonicalUrl },
        ]}
        faqSchema={faqs}
      />

      {/* Nav */}
      <header className="home-nav-wrapper">
        <nav className="home-nav">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <Link to="/blog" className="home-btn-ghost">Blog</Link>
            <Link to="/tools/tip-split-calculator" className="home-btn-ghost">Bahşiş Bölüştürücü</Link>
            <Link to="/register" className="home-btn-primary">İşletmenize QR Alın</Link>
          </div>
        </nav>
      </header>

      <main className="blog-container" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        {/* Breadcrumbs */}
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>/</span>
          <span>Araçlar</span>
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

        {/* Calculator Widget Grid */}
        <div className="tool-calculator-grid">
          {/* Left Inputs */}
          <div className="tool-card tool-input-card">
            <h2 className="tool-card-title">
              <Calculator size={20} className="tool-icon" /> Hesap Bilgileri
            </h2>

            {/* Bill Amount */}
            <div className="tool-field">
              <label htmlFor="bill-amount">Hesap Tutarı (₺)</label>
              <div className="tool-input-wrap">
                <span className="tool-input-prefix">₺</span>
                <input
                  id="bill-amount"
                  type="number"
                  min="0"
                  step="10"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="500"
                  className="tool-input"
                />
              </div>
            </div>

            {/* Tip Percentage Presets */}
            <div className="tool-field">
              <label>Bahşiş Oranı: %{tipPercent}</label>
              <div className="tool-preset-grid">
                {[5, 10, 12, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={`tool-preset-btn ${tipPercent === pct ? 'active' : ''}`}
                    onClick={() => handlePercentageClick(pct)}
                  >
                    %{pct}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="30"
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
                Kişi Sayısı: {guestCount} Kişi
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
                <span>Toplam tutarı tam sayıya yuvarla</span>
              </label>
            </div>
          </div>

          {/* Right Results */}
          <div className="tool-card tool-result-card">
            <h2 className="tool-card-title">Hesap Özeti</h2>

            <div className="tool-result-box">
              <div className="tool-result-row">
                <span>Hesap Tutarı:</span>
                <strong>{billAmount.toLocaleString('tr-TR')} ₺</strong>
              </div>
              <div className="tool-result-row highlight">
                <span>Bahşiş Tutarı (%{tipPercent}):</span>
                <strong className="text-gradient">{results.tipAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</strong>
              </div>
              <div className="tool-result-divider" />
              <div className="tool-result-row total">
                <span>Genel Toplam:</span>
                <strong className="text-white">{results.totalAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</strong>
              </div>
            </div>

            {guestCount > 1 && (
              <div className="tool-split-box">
                <div className="tool-split-title">Kişi Başına Düşen Pay ({guestCount} Kişi):</div>
                <div className="tool-split-grid">
                  <div className="tool-split-item">
                    <span>Kişi Başı Bahşiş</span>
                    <strong>{results.tipPerPerson.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</strong>
                  </div>
                  <div className="tool-split-item">
                    <span>Kişi Başı Toplam</span>
                    <strong>{results.totalPerPerson.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺</strong>
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
              <span>{copied ? 'Sonuç Kopyalandı!' : 'Özeti Kopyala'}</span>
            </button>

            {/* Business Pitch */}
            <div className="tool-promo-box">
              <h4>Restoran ya da Kafe İşletmecisi misiniz?</h4>
              <p>Misafirleriniz nakit taşımak zorunda kalmadan masadaki QR kod ile ekibinize doğrudan bahşiş bıraksın.</p>
              <Link
                to="/register"
                className="home-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => trackBlogCtaClick('tip_calc_promo', '/register')}
              >
                2 Dakikada Ücretsiz QR Alın &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">Sıkça Sorulan Sorular</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem' }}>Bahşiş Hesaplama Hakkında Merak Edilenler</h2>
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
          <h3>İlgili İçerikler ve Çözümler</h3>
          <div className="tool-links-grid">
            <Link to="/blog/restoranlarda-dijital-bahsis-rehberi" className="tool-link-card">
              <strong>Restoranlarda Dijital Bahşiş Rehberi</strong>
              <p>Masanıza QR bahşiş sistemi kurmanın tüm detayları</p>
            </Link>
            <Link to="/tools/tip-split-calculator" className="tool-link-card">
              <strong>Bahşiş Bölüştürme & Havuz Hesaplayıcı</strong>
              <p>Toplanan bahşişi personel rollerine göre paylaştırın</p>
            </Link>
            <Link to="/solutions/restaurants" className="tool-link-card">
              <strong>Restoranlar İçin Çözümler</strong>
              <p>Restoran ve fine dining için temassız QR bahşiş altyapısı</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. Tüm hakları saklıdır.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>Restoranlar</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>Bahşiş Hesaplayıcı</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
