import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Search,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { TIPPING_GUIDES } from '../../../content/guides/tipping-guides';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';
import '../../../styles/blog.css';
import '../../../styles/seo-features.css';

export const TippingGuidesHubPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isEn = language !== 'tr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');

  const continents = useMemo(() => {
    const set = new Set(TIPPING_GUIDES.map((g) => g.continent));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredGuides = useMemo(() => {
    return TIPPING_GUIDES.filter((guide) => {
      const name = isEn ? guide.country.en.toLowerCase() : guide.country.tr.toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || guide.currency.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === 'all' || guide.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [searchQuery, selectedContinent, isEn]);

  const pageTitle = isEn
    ? 'Global Tipping Guides 2026: Worldwide Etiquette, Rates & Customs — Naponi'
    : 'Dünya Bahşiş Rehberleri 2026: Ülke Ülke Bahşiş Kuralları ve Oranları — Naponi';

  const pageDesc = isEn
    ? 'Explore comprehensive tipping etiquette, standard restaurant rates, taxi gratuity, and cashless customs across 10+ major tourist destinations including USA, Japan, France, Italy, Turkey, and New Zealand.'
    : 'ABD, Japonya, Fransa, İtalya, İngiltere, Türkiye ve Yeni Zelanda dahil 10+ ülkede ne kadar bahşiş verileceğini, restoran ve taksi kurallarını, dijital bahşiş adetlerini keşfedin.';

  return (
    <div className="home-wrapper">
      <SeoHead
        title={pageTitle}
        description={pageDesc}
        canonicalUrl="https://www.naponi.com/guides"
        keywords={['dünya bahşiş rehberi', 'global tipping guides', 'tipping in japan', 'tipping in usa', 'tipping in france', 'ne kadar bahşiş verilir']}
      />

      {/* Header */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Guides Navigation">
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
          {/* Breadcrumbs */}
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
            <span>/</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</span>
          </nav>

          {/* Hero */}
          <div className="seo-hero-card" style={{ textAlign: 'center' }}>
            <div className="seo-hero-glow" />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
              <div className="seo-badge-row" style={{ justifyContent: 'center' }}>
                <span className="seo-pill seo-pill-emerald">
                  <Globe size={14} />
                  <span>{isEn ? 'Worldwide Hospitality Etiquette' : 'Küresel Bahşiş Kültürü'}</span>
                </span>
              </div>
              <h1 className="seo-page-title">{isEn ? 'International Tipping Guides' : 'Dünya Bahşiş Rehberleri'}</h1>
              <p className="seo-page-desc" style={{ margin: '0 auto 2rem' }}>
                {isEn
                  ? 'Avoid cultural misunderstandings abroad. Explore exact tipping expectations, currency rates, taxi & restaurant customs, and digital gratuity adoption across destinations.'
                  : 'Yurt dışı seyahatlerinizde veya uluslararası misafir ağırlarken kültürel hatalardan kaçının. Ülke ülke standart bahşiş oranları ve kuralları.'}
              </p>

              {/* Search & Filters */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ position: 'relative', minWidth: 280 }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder={isEn ? 'Search country or currency...' : 'Ülke veya para birimi ara...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {continents.map((continent) => (
                    <button
                      key={continent}
                      type="button"
                      onClick={() => setSelectedContinent(continent)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: selectedContinent === continent ? '#10b981' : 'rgba(255,255,255,0.1)',
                        background: selectedContinent === continent ? '#10b981' : 'rgba(255,255,255,0.04)',
                        color: selectedContinent === continent ? '#090d16' : '#cbd5e1',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {continent === 'all' ? (isEn ? 'All' : 'Tümü') : continent}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guides Grid */}
          <div className="seo-guides-grid">
            {filteredGuides.map((guide) => {
              const countryName = isEn ? guide.country.en : guide.country.tr;
              const overview = isEn ? guide.shortOverview.en : guide.shortOverview.tr;
              const etiquetteBadge = isEn ? guide.etiquetteBadge.en : guide.etiquetteBadge.tr;

              return (
                <Link
                  key={guide.slug}
                  to={`/guides/tipping-in-${guide.slug}`}
                  className="seo-guide-card"
                >
                  <div>
                    <div className="seo-guide-header">
                      <div className="seo-guide-flag-name">
                        <span className="seo-guide-flag">{guide.flag}</span>
                        <div>
                          <div className="seo-guide-name">{countryName}</div>
                          <span className="seo-guide-currency">{guide.currency} ({guide.currencySymbol})</span>
                        </div>
                      </div>
                      <span className="seo-guide-rate-tag">{guide.standardRate}</span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <span className="seo-pill seo-pill-emerald" style={{ fontSize: '0.72rem' }}>
                        {etiquetteBadge}
                      </span>
                    </div>

                    <p className="seo-guide-desc">{overview}</p>
                  </div>

                  <div className="seo-guide-footer">
                    <span>{isEn ? 'Read Complete Guide' : 'Detaylı Rehberi Oku'}</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Conversion CTA */}
          <div className="seo-cta-banner">
            <h2>{isEn ? 'Host Global Guests with Naponi' : 'Global Misafirlerinizi Naponi ile Ağırlayın'}</h2>
            <p>
              {isEn
                ? 'Welcome travelers from Japan, America, Europe, and beyond. Naponi automatically shows tipping menus in their native language and accepts Apple Pay & Google Pay with zero app friction.'
                : 'Japonya’dan, Amerika’dan veya Avrupa’dan gelen konuklarınız kendi dillerinde ve Apple Pay / Google Pay ile saniyeler içinde bahşiş bıraksın.'}
            </p>
            <Link to="/register" className="home-btn-primary home-btn-hero-large">
              {isEn ? 'Start Your Free Account' : 'Ücretsiz İşletme Hesabı Aç'} <ArrowRight size={18} />
            </Link>
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
