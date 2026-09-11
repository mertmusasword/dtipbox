import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Utensils,
  Coffee,
  Hotel,
  Wine,
  Scissors,
  Car,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  Smartphone,
  Wallet,
  Globe,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SECTOR_SOLUTIONS } from '../../../content/solutions/sectors';
import { BLOG_POSTS } from '../../../content/blog/posts';
import { trackBlogCtaClick } from '../../../analytics';
import '../../../styles/home.css';

const ICON_MAP: Record<string, any> = {
  Utensils,
  Coffee,
  Hotel,
  Wine,
  Scissors,
  Car,
  Users,
  Sparkles,
  Smartphone,
  Wallet,
  Zap,
  ShieldCheck,
  Globe,
  CheckCircle2,
};

export const SolutionPage: React.FC = () => {
  const { sector } = useParams<{ sector: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!sector || !SECTOR_SOLUTIONS[sector]) {
    return <Navigate to="/" replace />;
  }

  const data = SECTOR_SOLUTIONS[sector];
  const relatedPosts = BLOG_POSTS.filter((p) => data.relatedBlogSlugs.includes(p.slug));

  return (
    <div className="home-wrapper">
      <SeoHead
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalUrl={data.canonicalUrl}
        keywords={[data.targetKeyword, ...data.secondaryKeywords]}
        breadcrumbs={[
          { name: 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: 'Sektörel Çözümler', url: 'https://www.naponi.com/#industries' },
          { name: data.sectorName, url: data.canonicalUrl },
        ]}
        faqSchema={data.faqs}
      />

      {/* Navigation */}
      <header className="home-nav-wrapper">
        <nav className="home-nav">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <Link to="/blog" className="home-btn-ghost">Blog</Link>
            <Link to="/tools/tip-calculator" className="home-btn-ghost">Hesaplayıcı</Link>
            <Link to="/login" className="home-btn-ghost">Giriş Yap</Link>
            <Link
              to="/register"
              className="home-btn-primary"
              onClick={() => trackBlogCtaClick(`solution_nav_${data.slug}`, '/register')}
            >
              Hemen Başlayın <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      <main style={{ paddingTop: '7rem' }}>
        {/* Breadcrumb Bar */}
        <div className="home-container">
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Ana Sayfa</Link>
            <span>/</span>
            <a href="/#industries">Sektörler</a>
            <span>/</span>
            <span className="current">{data.sectorName}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="solution-hero-section">
          <div className="home-container" style={{ textAlign: 'center', maxWidth: 860 }}>
            <div className="home-hero-badge" style={{ margin: '0 auto 1.25rem' }}>
              <Sparkles size={14} className="sparkle" />
              <span>{data.badge}</span>
            </div>
            <h1 className="home-hero-title" style={{ fontSize: '2.85rem', marginBottom: '1.25rem' }}>
              {data.heroTitle}
            </h1>
            <p className="home-hero-desc" style={{ fontSize: '1.15rem', margin: '0 auto 2rem', maxWidth: 720 }}>
              {data.heroSubtitle}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                className="home-btn-primary home-btn-hero-large"
                onClick={() => trackBlogCtaClick(`solution_hero_${data.slug}`, '/register')}
              >
                2 Dakikada QR Alın <ArrowRight size={18} />
              </Link>
              <Link to="/tools/tip-calculator" className="home-btn-secondary" style={{ padding: '0.9rem 1.8rem' }}>
                Bahşiş Hesaplayıcı
              </Link>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="home-section" style={{ background: 'rgba(239, 68, 68, 0.03)', borderTop: '1px solid rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
          <div className="home-container">
            <div className="home-section-header">
              <span className="home-section-tag" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                Sektörel Zorluk
              </span>
              <h2 className="home-section-title">{data.problemTitle}</h2>
              <p className="home-section-desc">{data.problemDescription}</p>
            </div>

            <div className="solution-problems-grid">
              {data.problems.map((prob, i) => (
                <div key={i} className="solution-problem-card">
                  <div className="solution-problem-icon">
                    <AlertCircle size={22} color="#ef4444" />
                  </div>
                  <p>{prob}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Solution & Features */}
        <section className="home-section">
          <div className="home-container">
            <div className="home-section-header">
              <span className="home-section-tag">Naponi Çözümü</span>
              <h2 className="home-section-title">{data.solutionTitle}</h2>
              <p className="home-section-desc">{data.solutionDescription}</p>
            </div>

            <div className="home-features-grid">
              {data.features.map((feat, i) => {
                const IconComponent = ICON_MAP[feat.icon] || Sparkles;
                return (
                  <div key={i} className="home-feature-card">
                    <div className="home-feature-icon">
                      <IconComponent size={24} />
                    </div>
                    <h3 className="home-feature-title">{feat.title}</h3>
                    <p className="home-feature-desc">{feat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section className="home-section" style={{ background: 'rgba(17, 24, 39, 0.3)' }}>
          <div className="home-container">
            <div className="home-section-header">
              <span className="home-section-tag">Kolay Kurulum</span>
              <h2 className="home-section-title">Nasıl Çalışır?</h2>
              <p className="home-section-desc">Donanım yatırımı yapmadan 3 adımda canlıya geçin.</p>
            </div>

            <div className="home-steps-grid">
              {data.workflowSteps.map((ws, i) => (
                <div key={i} className="home-step-card">
                  <span className="home-step-num">{ws.step}</span>
                  <h3 className="home-step-title">{ws.title}</h3>
                  <p className="home-step-text">{ws.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="home-section">
          <div className="home-container">
            <div className="home-section-header">
              <span className="home-section-tag">Kullanım Senaryoları</span>
              <h2 className="home-section-title">{data.sectorName} İçin Özel Alanlar</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
              {data.useCases.map((uc, i) => (
                <div key={i} className="solution-usecase-card">
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} color="var(--primary)" /> {uc.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>{uc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="home-section" style={{ background: 'rgba(17, 24, 39, 0.25)' }}>
          <div className="home-container">
            <div className="home-section-header">
              <span className="home-section-tag">SSS</span>
              <h2 className="home-section-title">Sıkça Sorulan Sorular</h2>
            </div>

            <div className="home-faq-accordion" style={{ maxWidth: 840, margin: '0 auto' }}>
              {data.faqs.map((faq, idx) => (
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
          </div>
        </section>

        {/* Related Blog Posts */}
        {relatedPosts.length > 0 && (
          <section className="home-section">
            <div className="home-container">
              <div className="home-section-header">
                <span className="home-section-tag">Rehberler</span>
                <h2 className="home-section-title">İlgili Blog Makaleleri</h2>
              </div>

              <div className="blog-posts-grid" style={{ maxWidth: 1040, margin: '0 auto' }}>
                {relatedPosts.map((post) => (
                  <article key={post.slug} className="blog-card">
                    <div className="blog-card-category">{post.category}</div>
                    <h3 className="blog-card-title">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-footer">
                      <span>{post.readingTime}</span>
                      <Link to={`/blog/${post.slug}`} className="blog-card-readmore">
                        Devamını Oku &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Strong Final CTA */}
        <section className="home-section" style={{ paddingTop: 0 }}>
          <div className="home-container">
            <div className="home-cta-banner">
              <h2 className="home-cta-title">
                {data.sectorName} İçin Dijital Bahşişi Başlatın
              </h2>
              <p className="home-cta-sub">
                Nakit bahşiş kaybına son verin. 2 dakikada ücretsiz işletme hesabınızı açın ve QR kodlarınızı hemen indirin.
              </p>
              <div className="home-cta-btn-wrap">
                <Link
                  to="/register"
                  className="home-btn-primary home-btn-hero-large"
                  onClick={() => trackBlogCtaClick(`solution_bottom_${data.slug}`, '/register')}
                >
                  Ücretsiz Kaydolun <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="home-btn-secondary" style={{ padding: '0.9rem 1.8rem' }}>
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. Tüm hakları saklıdır.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>Restoranlar</Link>
              <Link to="/solutions/cafes" style={{ color: '#64748b', textDecoration: 'none' }}>Kafeler</Link>
              <Link to="/solutions/hotels" style={{ color: '#64748b', textDecoration: 'none' }}>Oteller</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>Hesaplayıcı</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
