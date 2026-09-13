import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Scale,
  Award,
  Sparkles
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { COMPARISONS } from '../../../content/comparisons/comparisons';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';
import '../../../styles/blog.css';
import '../../../styles/seo-features.css';

export const ComparisonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const isEn = language !== 'tr';

  const item = COMPARISONS.find((c) => c.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!item) {
    return <Navigate to="/compare/card-machine-vs-qr-tipping" replace />;
  }

  const badge = isEn ? item.badge.en : item.badge.tr;
  const title = isEn ? item.title.en : item.title.tr;
  const subtitle = isEn ? item.subtitle.en : item.subtitle.tr;
  const audience = isEn ? item.targetAudience.en : item.targetAudience.tr;
  const quickVerdict = isEn ? item.quickVerdict.en : item.quickVerdict.tr;

  const otherComparisons = COMPARISONS.filter((c) => c.slug !== item.slug);

  return (
    <div className="home-wrapper">
      <SeoHead
        title={isEn ? item.meta.title.en : item.meta.title.tr}
        description={isEn ? item.meta.description.en : item.meta.description.tr}
        canonicalUrl={`https://www.naponi.com/compare/${item.slug}`}
        keywords={item.meta.keywords}
        faqSchema={item.faqs.map((f) => ({
          question: isEn ? f.question.en : f.question.tr,
          answer: isEn ? f.answer.en : f.answer.tr,
        }))}
      />

      {/* Header Navigation */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Comparison Navigation">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>

          <ul className="home-nav-links-seo">
            <li><Link to="/guides">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link></li>
            <li><Link to="/tools/restaurant-tip-pool-calculator">{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link></li>
            <li><Link to="/tools/free-hospitality-qr-generator">{isEn ? 'QR Generator' : 'QR Üretici'}</Link></li>
            <li><Link to="/compare/card-machine-vs-qr-tipping" className="active">{isEn ? 'Comparisons' : 'Karşılaştırma'}</Link></li>
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
          {/* Breadcrumbs */}
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
            <span>/</span>
            <span style={{ color: '#94a3b8' }}>{isEn ? 'Comparisons' : 'Karşılaştırmalar'}</span>
            <span>/</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{item.slug}</span>
          </nav>

          {/* Hero Section */}
          <div className="seo-hero-card">
            <div className="seo-hero-glow" />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
              <div className="seo-badge-row" style={{ justifyContent: 'center' }}>
                <span className="seo-pill seo-pill-emerald">
                  <Scale size={14} />
                  <span>{badge}</span>
                </span>
              </div>

              <h1 className="seo-page-title">{title}</h1>
              <p className="seo-page-desc" style={{ margin: '0 auto 1.5rem' }}>{subtitle}</p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1.25rem', borderRadius: 9999, fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{isEn ? 'Target Audience:' : 'Hedef Kitle:'}</span>
                <span>{audience}</span>
              </div>
            </div>
          </div>

          {/* Quick Verdict Box */}
          <div className="seo-verdict-card">
            <div className="seo-verdict-icon">
              <Award size={26} />
            </div>
            <div className="seo-verdict-text">
              <h3>{isEn ? 'Executive Summary & Verdict' : 'Yönetici Özeti & Sonuç Değerlendirmesi'}</h3>
              <p>{quickVerdict}</p>
            </div>
          </div>

          {/* Detailed Feature Table */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="seo-pill seo-pill-slate" style={{ marginBottom: '0.75rem' }}>
              <Sparkles size={13} /> {isEn ? 'Direct Evaluation' : 'Detaylı Karşılaştırma'}
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              {isEn ? 'Feature-by-Feature Comparison' : 'Özellik Özellik Detaylı Karşılaştırma'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              {isEn ? 'Operational differences, cost breakdown, and bottom-line impact.' : 'Operasyonel farklar, maliyetler ve işletme etkileri.'}
            </p>
          </div>

          <div className="seo-table-wrapper">
            <table className="seo-comparison-table">
              <thead>
                <tr>
                  <th className="col-feature">
                    {isEn ? item.comparisonTable.headers.feature.en : item.comparisonTable.headers.feature.tr}
                  </th>
                  <th className="col-option-a">
                    {isEn ? item.comparisonTable.headers.optionA.en : item.comparisonTable.headers.optionA.tr}
                  </th>
                  <th className="col-option-b">
                    {isEn ? item.comparisonTable.headers.optionB.en : item.comparisonTable.headers.optionB.tr}
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.comparisonTable.rows.map((row, idx) => {
                  const feat = isEn ? row.feature.en : row.feature.tr;
                  const optA = isEn ? row.optionA.en : row.optionA.tr;
                  const optB = isEn ? row.optionB.en : row.optionB.tr;
                  const verdict = isEn ? row.verdict.en : row.verdict.tr;

                  return (
                    <tr key={idx}>
                      <td className="col-feature">
                        <span className="seo-feat-title">{feat}</span>
                        <span className="seo-feat-sub">{verdict}</span>
                      </td>
                      <td className="col-option-a">
                        <div className="seo-item-row">
                          {row.optionA.highlight === 'bad' && <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: 2 }} />}
                          <span style={{ color: '#94a3b8' }}>{optA}</span>
                        </div>
                      </td>
                      <td className="col-option-b">
                        <div className="seo-item-row">
                          {row.optionB.highlight === 'good' && <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />}
                          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{optB}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Deep Dive Sections */}
          <div style={{ maxWidth: 900, margin: '0 auto 4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                {isEn ? 'In-Depth Analysis & Case Study Findings' : 'Derinlemesine İnceleme & Vaka Analizleri'}
              </h2>
            </div>

            {item.deepDiveSections.map((sec, idx) => {
              const secTitle = isEn ? sec.title.en : sec.title.tr;
              const secContent = isEn ? sec.content.en : sec.content.tr;
              const secTakeaway = sec.takeaway ? (isEn ? sec.takeaway.en : sec.takeaway.tr) : null;

              return (
                <div key={idx} className="seo-section-card">
                  <h2>{secTitle}</h2>
                  <p>{secContent}</p>
                  {secTakeaway && (
                    <div className="seo-takeaway-pill">
                      💡 {secTakeaway}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQs */}
          <div className="seo-faq-wrap">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                {isEn ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}
              </h2>
            </div>

            {item.faqs.map((faq, idx) => (
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

          {/* Read Next Comparison */}
          {otherComparisons.length > 0 && (
            <div style={{ maxWidth: 860, margin: '0 auto 4rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                {isEn ? 'Read Next Comparison' : 'Sıradaki Karşılaştırma Raporu'}
              </h3>
              {otherComparisons.map((other) => (
                <Link
                  key={other.slug}
                  to={`/compare/${other.slug}`}
                  className="seo-section-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', transition: 'border-color 0.2s', padding: '1.5rem' }}
                >
                  <div>
                    <span className="seo-pill seo-pill-emerald" style={{ marginBottom: '0.5rem' }}>
                      {isEn ? other.badge.en : other.badge.tr}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.4rem' }}>
                      {isEn ? other.title.en : other.title.tr}
                    </h4>
                  </div>
                  <ArrowRight size={20} color="#10b981" />
                </Link>
              ))}
            </div>
          )}

          {/* Conversion CTA */}
          <div className="seo-cta-banner">
            <h2>{isEn ? 'Modernize Your Hospitality Tipping with Naponi' : 'Mekanınızın Bahşiş Altyapısını Naponi ile Güçlendirin'}</h2>
            <p>
              {isEn
                ? 'Join thousands of forward-thinking restaurants, bars, and hotels. Set up your zero-hardware QR tipping system in under 2 minutes.'
                : 'POS karmaşasını ve personel kayıplarını geride bırakın. 2 dakikada ücretsiz işletme hesabınızı açın.'}
            </p>
            <Link to="/register" className="home-btn-primary home-btn-hero-large">
              {isEn ? 'Start Free Now' : 'Ücretsiz Başlayın'} <ArrowRight size={18} />
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
