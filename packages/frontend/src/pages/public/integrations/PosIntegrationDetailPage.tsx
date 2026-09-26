import React, { useState } from 'react';
import { PublicNavbar } from '../../../components/PublicNavbar';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  Star,
  TrendingUp,
  Globe,
  Sparkles,
  Layers,
  Smartphone,
  CreditCard,
  Building2,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { POS_INTEGRATIONS } from '../../../content/integrations/pos-integrations';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';
import '../../../styles/blog.css';
import '../../../styles/seo-features.css';

const ICON_MAP: Record<string, any> = {
  Zap,
  ShieldCheck,
  Star,
  TrendingUp,
  Globe,
  Sparkles,
  Layers,
  Smartphone,
  CreditCard,
};

export const PosIntegrationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const isEn = language !== 'tr';

  const item = POS_INTEGRATIONS.find((p) => p.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!item) {
    return <Navigate to="/integrations/toast-pos-smart-qr" replace />;
  }

  const otherIntegrations = POS_INTEGRATIONS.filter((p) => p.slug !== item.slug);

  return (
    <div className="home-wrapper">
      <SeoHead
        title={isEn ? item.metaTitle.en : item.metaTitle.tr}
        description={isEn ? item.metaDescription.en : item.metaDescription.tr}
        canonicalUrl={`https://www.naponi.com/integrations/${item.slug}`}
        keywords={item.keywords}
        faqSchema={item.faqs.map((f) => ({
          question: isEn ? f.question.en : f.question.tr,
          answer: isEn ? f.answer.en : f.answer.tr,
        }))}
      />

      {/* Header Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="home-hero-section" style={{ paddingTop: '7rem', paddingBottom: '4.5rem' }}>
        <div className="home-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '1.25rem' }}>
            <Sparkles size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>{item.logoBadge}</span>
          </div>

          <h1 className="home-hero-title" style={{ fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', maxWidth: '960px', margin: '0.5rem auto 1.5rem', lineHeight: 1.15 }}>
            {isEn ? item.heroHeadline.en : item.heroHeadline.tr}
          </h1>

          <p className="home-hero-desc" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', maxWidth: '820px', margin: '0 auto 2rem', color: '#94a3b8', lineHeight: 1.6 }}>
            {isEn ? item.heroSubheadline.en : item.heroSubheadline.tr}
          </p>

          <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem', padding: '0.6rem 1.2rem', marginBottom: '2.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />
            {isEn ? item.compatibilityStatus.en : item.compatibilityStatus.tr}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="home-btn-primary home-btn-hero-large">
              {isEn ? 'Set Up Free for Your Venue' : 'İşletmeniz İçin Ücretsiz Kurun'} <ArrowRight size={18} />
            </Link>
            <Link to="/catalog" className="home-btn-secondary">
              {isEn ? 'View Product Catalog' : 'Kurumsal Kataloğu İncele'}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Combine Section */}
      <section className="home-section" style={{ background: 'rgba(255, 255, 255, 0.015)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header" style={{ maxWidth: '850px', margin: '0 auto 3rem', textAlign: 'center' }}>
            <span className="home-section-tag">{item.posName} + Naponi</span>
            <h2 className="home-section-title" style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>
              {isEn ? item.whyCombineTitle.en : item.whyCombineTitle.tr}
            </h2>
            <p className="home-section-desc" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#94a3b8' }}>
              {isEn ? item.whyCombineDescription.en : item.whyCombineDescription.tr}
            </p>
          </div>

          <div className="home-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {item.keyBenefits.map((benefit, idx) => {
              const IconComp = ICON_MAP[benefit.icon] || Zap;
              return (
                <div key={idx} className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <IconComp size={24} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                    {isEn ? benefit.title.en : benefit.title.tr}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {isEn ? benefit.description.en : benefit.description.tr}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table: Native POS Alone vs POS + Naponi */}
      <section className="home-section">
        <div className="home-container" style={{ maxWidth: '960px' }}>
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{isEn ? 'Architectural Advantage' : 'Mimari Farklılık'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
              {isEn ? item.comparisonWithNativePos.title.en : item.comparisonWithNativePos.title.tr}
            </h2>
          </div>

          <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', width: '30%' }}>
                    {isEn ? 'Operational Dimension' : 'Operasyonel Boyut'}
                  </th>
                  <th style={{ padding: '1.2rem', color: '#f87171', fontWeight: 700, fontSize: '0.95rem', width: '35%' }}>
                    {item.comparisonWithNativePos.nativePosLabel}
                  </th>
                  <th style={{ padding: '1.2rem', color: '#34d399', fontWeight: 700, fontSize: '0.95rem', width: '35%' }}>
                    {item.comparisonWithNativePos.naponiCompanionLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.comparisonWithNativePos.points.map((pt, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1.2rem', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' }}>
                      {isEn ? pt.feature.en : pt.feature.tr}
                    </td>
                    <td style={{ padding: '1.2rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      <XCircle size={16} color="#ef4444" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.4rem' }} />
                      {isEn ? pt.nativePos.en : pt.nativePos.tr}
                    </td>
                    <td style={{ padding: '1.2rem', color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5, background: 'rgba(16, 185, 129, 0.04)' }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.4rem' }} />
                      {isEn ? pt.withNaponi.en : pt.withNaponi.tr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section className="home-section" style={{ background: 'rgba(255, 255, 255, 0.015)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="home-section-tag">{isEn ? 'Frictionless Flow' : 'Nasıl Çalışır?'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
              {isEn ? `How Naponi Works Alongside ${item.posName}` : `Naponi, ${item.posName} ile Nasıl Çalışır?`}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {item.howItWorksSteps.map((step, idx) => (
              <div key={idx} style={{ position: 'relative', padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(16, 185, 129, 0.3)', display: 'block', lineHeight: 1, marginBottom: '1rem' }}>
                  {step.stepNumber}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                  {isEn ? step.title.en : step.title.tr}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {isEn ? step.description.en : step.description.tr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other POS Companions */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{isEn ? 'Ecosystem' : 'Diğer Entegrasyonlar'}</span>
            <h2 className="home-section-title" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
              {isEn ? 'Explore Other POS Companion Guides' : 'Diğer POS Sistemleri İçin Rehberlerimiz'}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
            {otherIntegrations.map((other) => (
              <Link key={other.slug} to={`/integrations/${other.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', transition: 'transform 0.2s ease, border-color 0.2s ease' }}>
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>{other.logoBadge}</span>
                  <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>{other.posName}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {isEn ? other.tagline.en : other.tagline.tr}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.875rem', fontWeight: 600, marginTop: '1rem' }}>
                    {isEn ? 'Learn More' : 'İncele'} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="home-section" style={{ background: 'rgba(255, 255, 255, 0.015)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container" style={{ maxWidth: '800px' }}>
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{isEn ? 'Clarifications' : 'Sıkça Sorulan Sorular'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
              {isEn ? `Frequently Asked Questions About ${item.posName} & Naponi` : `${item.posName} & Naponi Hakkında Sorular`}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {item.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{isEn ? faq.question.en : faq.question.tr}</span>
                    {isOpen ? <ChevronUp size={20} color="#10b981" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.25rem', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {isEn ? faq.answer.en : faq.answer.tr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="home-section" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="home-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            {isEn ? `Ready to Add Naponi to Your ${item.posName}?` : `${item.posName} Sisteminize Naponi Eklemeye Hazır mısınız?`}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            {isEn
              ? 'Empower your restaurant and hospitality team: boost staff tip earnings and guest satisfaction with zero hardware.'
              : 'Restoran ve konaklama ekibinizi güçlendirin; donanım maliyeti olmadan personel bahşişlerini ve misafir memnuniyetini artırın.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="home-btn-primary home-btn-hero-large">
              {isEn ? 'Start 100% Free' : 'Hemen Ücretsiz Başla'} <ArrowRight size={18} />
            </Link>
            <Link to="/tools/free-hospitality-qr-generator" className="home-btn-secondary">
              {isEn ? 'Try Free QR Generator' : 'Ücretsiz QR Oluştur'}
            </Link>
          </div>

          {/* Trademark & Interoperability Disclaimer */}
          <div style={{ marginTop: '3.5rem', padding: '1rem 1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '0.75rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
              {isEn
                ? `Legal Disclaimer: ${item.posName} is a trademark and/or registered trademark of its respective owner. Naponi is an independent software platform and is not affiliated with, sponsored by, or endorsed by ${item.posName} or its parent entities. Compatibility refers to operational coexistence as an independent tableside QR layer.`
                : `Yasal Uyarı: ${item.posName}, ilgili hak sahibinin tescilli ticari markasıdır. Naponi bağımsız bir yazılım platformudur ve ${item.posName} veya ana kuruluşu ile doğrudan bir ortaklığı, sponsorluğu veya resmi bağı bulunmamaktadır. Uyumluluk, bağımsız bir masabaşı QR katmanı olarak yan yana operasyonel kullanımı ifade eder.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
