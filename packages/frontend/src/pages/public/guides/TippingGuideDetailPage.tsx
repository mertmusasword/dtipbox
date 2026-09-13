import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Globe,
  Utensils,
  Coffee,
  Car,
  Hotel,
  Package,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Calculator,
  Compass,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { TIPPING_GUIDES, CountryTippingGuide } from '../../../content/guides/tipping-guides';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';
import '../../../styles/blog.css';
import '../../../styles/seo-features.css';

const SECTOR_ICONS: Record<string, any> = {
  Utensils,
  Coffee,
  Car,
  Hotel,
  Package,
};

export const TippingGuideDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const { language, t } = useLanguage();
  const isEn = language !== 'tr';

  const guide = TIPPING_GUIDES.find(
    (g) => g.slug.toLowerCase() === country?.toLowerCase() || g.slug === country?.replace(/^tipping-in-/, '')
  );

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Local interactive tip calculator state
  const defaultRateNumber = guide ? parseFloat(guide.standardRate.replace(/[^0-9.]/g, '')) || 10 : 10;
  const [billAmount, setBillAmount] = useState<number>(100);
  const [selectedRate, setSelectedRate] = useState<number>(defaultRateNumber);

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const countryName = isEn ? guide.country.en : guide.country.tr;
  const overview = isEn ? guide.shortOverview.en : guide.shortOverview.tr;
  const cultural = isEn ? guide.culturalContext.en : guide.culturalContext.tr;
  const cashVsDigital = isEn ? guide.cashVsDigitalTips.en : guide.cashVsDigitalTips.tr;
  const businessInsight = isEn ? guide.businessInsight.en : guide.businessInsight.tr;
  const etiquetteBadge = isEn ? guide.etiquetteBadge.en : guide.etiquetteBadge.tr;

  const calculatedTip = (billAmount * selectedRate) / 100;
  const calculatedTotal = billAmount + calculatedTip;

  const otherGuides = TIPPING_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const getPillClass = (type: CountryTippingGuide['etiquetteType']) => {
    switch (type) {
      case 'expected': return 'seo-pill-amber';
      case 'discouraged': return 'seo-pill-rose';
      case 'included': return 'seo-pill-blue';
      case 'customary': return 'seo-pill-emerald';
      default: return 'seo-pill-purple';
    }
  };

  return (
    <div className="home-wrapper">
      <SeoHead
        title={isEn ? guide.meta.title.en : guide.meta.title.tr}
        description={isEn ? guide.meta.description.en : guide.meta.description.tr}
        canonicalUrl={`https://www.naponi.com/guides/tipping-in-${guide.slug}`}
        keywords={guide.meta.keywords}
        faqSchema={guide.faqs.map((faq) => ({
          question: isEn ? faq.question.en : faq.question.tr,
          answer: isEn ? faq.answer.en : faq.answer.tr,
        }))}
      />

      {/* Header */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Tipping Guide Navigation">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>

          <ul className="home-nav-links-seo">
            <li><Link to="/guides" className="active">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link></li>
            <li><Link to="/tools/restaurant-tip-pool-calculator">{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link></li>
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

      {/* Main Content */}
      <main className="seo-page-wrapper">
        <div className="home-container">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
            <span>/</span>
            <Link to="/guides">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link>
            <span>/</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{countryName}</span>
          </nav>

          {/* Hero Card */}
          <div className="seo-hero-card">
            <div className="seo-hero-glow" />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
              <div className="seo-badge-row">
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{guide.flag}</span>
                <span className="seo-pill seo-pill-slate">
                  {guide.continent} • {guide.currency} ({guide.currencySymbol})
                </span>
                <span className={`seo-pill ${getPillClass(guide.etiquetteType)}`}>
                  {etiquetteBadge}
                </span>
              </div>

              <h1 className="seo-page-title">
                {isEn ? `Tipping in ${countryName}: 2026 Etiquette & Rates` : `${countryName}’de Bahşiş Ne Kadar Verilir? 2026 Rehberi`}
              </h1>

              <p className="seo-page-desc">
                {overview}
              </p>

              {/* Quick Stat Bar */}
              <div className="seo-stats-grid">
                <div className="seo-stat-box">
                  <span className="seo-stat-label">{isEn ? 'Standard Restaurant Rate' : 'Genel Restoran Oranı'}</span>
                  <span className="seo-stat-value">{guide.standardRate}</span>
                </div>
                <div className="seo-stat-box">
                  <span className="seo-stat-label">{isEn ? 'Local Currency' : 'Yerel Para Birimi'}</span>
                  <span className="seo-stat-value" style={{ color: '#fff' }}>{guide.currency} ({guide.currencySymbol})</span>
                </div>
                <div className="seo-stat-box">
                  <span className="seo-stat-label">{isEn ? 'Digital Tipping Status' : 'Dijital Bahşiş'}</span>
                  <span className="seo-stat-value" style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                    {guide.etiquetteType === 'discouraged'
                      ? (isEn ? 'Rare / Cash Only' : 'Kısıtlı')
                      : (isEn ? 'Widely Accepted' : 'Yaygın')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Layout: Left In-Depth / Right Sticky Calculator */}
          <div className="seo-2col-layout">
            {/* Left Column */}
            <div>
              {/* Cultural Context */}
              <section className="seo-section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Compass size={24} color="#10b981" />
                  <h2 style={{ margin: 0 }}>{isEn ? `Cultural Etiquette & Social Norms in ${countryName}` : `${countryName} Bahşiş Kültürü ve Sosyal Kurallar`}</h2>
                </div>
                <p>{cultural}</p>
              </section>

              {/* Sector Breakdown Cards */}
              <section style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <Utensils size={24} color="#10b981" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {isEn ? 'How Much to Tip by Sector' : 'Sektörlere Göre Ne Kadar Bahşiş Verilir?'}
                  </h2>
                </div>

                {guide.sectors.map((sector) => {
                  const SectorIcon = SECTOR_ICONS[sector.icon] || Utensils;
                  return (
                    <div key={sector.id} className="seo-sector-card">
                      <div className="seo-sector-top">
                        <div className="seo-sector-title-group">
                          <div className="seo-sector-icon">
                            <SectorIcon size={18} />
                          </div>
                          <span className="seo-sector-name">{isEn ? sector.name.en : sector.name.tr}</span>
                        </div>
                        <span className="seo-sector-rate">{isEn ? sector.rate.en : sector.rate.tr}</span>
                      </div>
                      <p className="seo-sector-advice">{isEn ? sector.advice.en : sector.advice.tr}</p>
                    </div>
                  );
                })}
              </section>

              {/* Cash vs Digital */}
              <section className="seo-section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <CreditCard size={24} color="#38bdf8" />
                  <h2 style={{ margin: 0 }}>{isEn ? 'Cash vs. Digital Tipping' : 'Nakit mi, Kredi Kartı & QR mı?'}</h2>
                </div>
                <p>{cashVsDigital}</p>
              </section>

              {/* Business Insight Callout */}
              <section className="seo-verdict-card" style={{ flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Building2 size={24} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                    {isEn ? `Operating a Restaurant in ${countryName}?` : `${countryName}’de Restoran veya Kafe İşletiyorsanız`}
                  </h3>
                </div>
                <p style={{ marginBottom: '1.5rem' }}>{businessInsight}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/register" className="home-btn-primary">
                    {isEn ? 'Setup QR Tipping Free' : 'Ücretsiz QR Bahşiş Kur'} <ArrowRight size={16} />
                  </Link>
                  <Link to="/tools/restaurant-tip-pool-calculator" className="home-btn-secondary">
                    {isEn ? 'Try Shift Tip Pool Calculator' : 'Vardiya Havuz Hesaplayıcı'}
                  </Link>
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Tip Calculator */}
            <div className="seo-sticky-box">
              <div className="seo-calc-card">
                <div className="seo-calc-header">
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {isEn ? `${countryName} Tip Calculator` : `${countryName} Bahşiş Hesaplayıcı`}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {isEn ? `Calculations in ${guide.currency}` : `${guide.currency} para birimiyle anlık hesap`}
                    </span>
                  </div>
                  <span style={{ fontSize: '2rem' }}>{guide.flag}</span>
                </div>

                <label className="seo-calc-input-label">
                  {isEn ? 'Bill Amount' : 'Hesap Tutarı'} ({guide.currencySymbol})
                </label>
                <div className="seo-calc-input-wrapper">
                  <span className="seo-calc-input-symbol">{guide.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={billAmount}
                    onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="seo-calc-input"
                  />
                </div>

                <label className="seo-calc-input-label">
                  {isEn ? 'Tip Percentage' : 'Bahşiş Oranı'} (%)
                </label>
                <div className="seo-pct-grid">
                  {[0, 5, 10, 15, 18, 20].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSelectedRate(rate)}
                      className={`seo-pct-btn ${selectedRate === rate ? 'active' : ''}`}
                    >
                      %{rate}
                    </button>
                  ))}
                </div>

                <div className="seo-calc-summary-box">
                  <div className="seo-summary-row">
                    <span>{isEn ? 'Tip Amount' : 'Bahşiş Tutarı'}:</span>
                    <span className="seo-summary-val">{guide.currencySymbol}{calculatedTip.toFixed(2)}</span>
                  </div>
                  <div className="seo-summary-row total">
                    <span>{isEn ? 'Total Bill' : 'Toplam Ödeme'}:</span>
                    <span className="seo-summary-val total">{guide.currencySymbol}{calculatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#a7f3d0', marginBottom: '0.75rem' }}>
                    {isEn ? 'Accept tips anywhere worldwide with zero hardware.' : 'Sıfır cihaz maliyetiyle masalardan dijital bahşiş toplayın.'}
                  </p>
                  <Link to="/register" className="home-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {isEn ? 'Get Started with Naponi' : 'Naponi ile Ücretsiz Başlayın'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="seo-faq-wrap">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                {isEn ? `Frequently Asked Questions: ${countryName}` : `${countryName} Bahşiş Rehberi Hakkında Sık Sorulan Sorular`}
              </h2>
            </div>

            {guide.faqs.map((faq, idx) => (
              <div key={idx} className="seo-faq-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="seo-faq-btn"
                >
                  <span className="seo-faq-question">
                    {isEn ? faq.question.en : faq.question.tr}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp size={18} color="#10b981" />
                  ) : (
                    <ChevronDown size={18} color="#94a3b8" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="seo-faq-body">
                    {isEn ? faq.answer.en : faq.answer.tr}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Other Guides Row */}
          <div style={{ maxWidth: 1100, margin: '0 auto 4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                {isEn ? 'Explore More Tipping Guides' : 'Diğer Ülkelerin Bahşiş Rehberleri'}
              </h3>
              <Link to="/guides" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
                {isEn ? 'View All 10+ Guides &rarr;' : 'Tüm Rehberleri Gör &rarr;'}
              </Link>
            </div>

            <div className="seo-guides-grid">
              {otherGuides.map((other) => (
                <Link key={other.slug} to={`/guides/tipping-in-${other.slug}`} className="seo-guide-card">
                  <div>
                    <div className="seo-guide-header">
                      <div className="seo-guide-flag-name">
                        <span className="seo-guide-flag">{other.flag}</span>
                        <div>
                          <div className="seo-guide-name">{isEn ? other.country.en : other.country.tr}</div>
                          <span className="seo-guide-currency">{other.currency} ({other.currencySymbol})</span>
                        </div>
                      </div>
                      <span className="seo-guide-rate-tag">{other.standardRate}</span>
                    </div>
                    <p className="seo-guide-desc">{isEn ? other.shortOverview.en : other.shortOverview.tr}</p>
                  </div>
                  <div className="seo-guide-footer">
                    <span>{isEn ? 'Read Guide' : 'Rehberi Oku'}</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
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
