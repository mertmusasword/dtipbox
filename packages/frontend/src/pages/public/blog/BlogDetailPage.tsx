import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Sparkles,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { BLOG_POSTS, BlogPost } from '../../../content/blog/posts';
import { trackBlogView, trackBlogCtaClick, trackBlogRelatedArticleClick } from '../../../analytics';
import '../../../styles/home.css';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const post = BLOG_POSTS.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) {
      trackBlogView(post.slug, post.title, post.category);
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = BLOG_POSTS.filter(
    (p) => post.relatedSlugs.includes(p.slug) && p.slug !== post.slug
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isEn = post.language === 'en';
  const alternateLangs = post.alternateSlugs
    ? Object.entries(post.alternateSlugs).map(([lang, s]) => ({
        lang,
        url: `https://www.naponi.com/blog/${s}`,
      }))
    : [];

  const alternatePostSlug = isEn ? post.alternateSlugs?.tr : post.alternateSlugs?.en;

  return (
    <div className="home-wrapper">
      <SeoHead
        title={post.metaTitle}
        description={post.metaDescription}
        canonicalUrl={post.canonicalUrl}
        ogType="article"
        publishedTime={post.datePublished}
        modifiedTime={post.dateModified}
        authorName={post.author.name}
        keywords={[post.targetKeyword, ...post.secondaryKeywords]}
        breadcrumbs={[
          { name: isEn ? 'Home' : 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: 'Blog', url: 'https://www.naponi.com/blog' },
          { name: post.category, url: `https://www.naponi.com/blog/category/${encodeURIComponent(post.category)}` },
          { name: post.title, url: post.canonicalUrl },
        ]}
        alternateLanguages={alternateLangs}
        faqSchema={post.faq}
      />

      {/* Nav */}
      <header className="home-nav-wrapper">
        <nav className="home-nav">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <Link to="/blog" className="home-btn-ghost">{isEn ? 'All Articles' : 'Tüm Yazılar'}</Link>
            <Link to="/tools/tip-calculator" className="home-btn-ghost">{isEn ? 'Tip Calculator' : 'Bahşiş Hesaplayıcı'}</Link>
            <Link to="/login" className="home-btn-ghost">{isEn ? 'Log in' : 'Giriş'}</Link>
            <Link
              to="/register"
              className="home-btn-primary"
              onClick={() => trackBlogCtaClick(`blog_detail_nav_${post.slug}`, '/register')}
            >
              {isEn ? 'Get Started' : 'Hemen Başlayın'} <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      <main className="blog-container" style={{ paddingTop: '7.5rem', paddingBottom: '5rem' }}>
        {/* Breadcrumb Navigation */}
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <Link to="/blog">Blog</Link>
          <span>/</span>
          <Link to={`/blog/category/${encodeURIComponent(post.category)}`}>{post.category}</Link>
          <span>/</span>
          <span className="current">{post.title}</span>
        </nav>

        {/* Back Link & Language Alternate Pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/blog" style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> {isEn ? 'Back to Blog Index' : 'Blog Ana Sayfasına Dön'}
          </Link>
          {alternatePostSlug && (
            <Link
              to={`/blog/${alternatePostSlug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                textDecoration: 'none',
              }}
            >
              {isEn ? '🇹🇷 Bu makaleyi Türkçe oku' : '🇬🇧 Read this guide in English'} &rarr;
            </Link>
          )}
        </div>

        {/* Article Header */}
        <header className="article-header">
          <div className="blog-card-category" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            {post.category}
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-lead">{post.excerpt}</p>

          {/* Author & Meta Row */}
          <div className="article-meta-row">
            <div className="article-author-info">
              <div className="article-author-avatar">
                <img src="/naponi-brand.svg" alt={post.author.name} style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{post.author.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{post.author.role}</div>
              </div>
            </div>

            <div className="article-meta-details">
              <span title="Date">
                <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {post.datePublished}
              </span>
              <span>•</span>
              <span title="Reading Time">
                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {post.readingTime}
              </span>
              <button
                type="button"
                className="article-share-btn"
                onClick={handleShare}
                title="Share"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{isEn ? (copied ? 'Copied!' : 'Share') : (copied ? 'Kopyalandı!' : 'Paylaş')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="article-tags-wrapper">
          <span style={{ fontSize: '0.88rem', color: '#94a3b8', marginRight: '0.5rem' }}>
            {isEn ? 'Tags:' : 'Etiketler:'}
          </span>
          {post.tags.map((tag) => (
            <span key={tag} className="article-tag-item">
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Bio Box */}
        <div className="article-author-card">
          <div className="article-author-avatar-large">
            <img src="/naponi-brand.svg" alt={post.author.name} style={{ width: 36, height: 36 }} />
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{post.author.name}</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{post.author.role}</div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{post.author.bio}</p>
          </div>
        </div>

        {/* FAQ Accordion Section (if present) */}
        {post.faq && post.faq.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <span className="home-section-tag">{isEn ? 'FAQ' : 'Sıkça Sorulan Sorular'}</span>
              <h2 style={{ fontSize: '1.75rem', color: '#fff', marginTop: '0.5rem' }}>
                {isEn ? 'Frequently Asked Questions' : 'Bu Konu Hakkında Merak Edilenler'}
              </h2>
            </div>

            <div className="home-faq-accordion">
              {post.faq.map((faq, idx) => (
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
        )}

        {/* In-Article Conversion Banner */}
        <div className="blog-cta-box" style={{ marginTop: '4.5rem' }}>
          <h3>{isEn ? 'Empower Your Venue with Digital Tipping' : 'İşletmenizde Dijital Bahşişe Geçin'}</h3>
          <p>
            {isEn
              ? 'Ensure your team never misses out on gratuities when guests carry no cash. Zero hardware costs, 2-minute setup.'
              : 'Müşterileriniz nakitsiz kalsa dahi ekibiniz hak ettiği bahşişi eksiksiz alsın. Donanım maliyeti olmadan 2 dakikada ücretsiz kaydolun.'}
          </p>
          <Link
            to="/register"
            className="blog-btn-cta"
            onClick={() => trackBlogCtaClick(`blog_article_cta_${post.slug}`, '/register')}
          >
            {isEn ? 'Get Started Free →' : 'Hemen Ücretsiz Başlayın →'}
          </Link>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section style={{ marginTop: '5rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>
              {isEn ? 'Related Guides & Insights' : 'İlgili Diğer Rehberler'}
            </h3>
            <div className="blog-posts-grid">
              {relatedPosts.map((rp) => (
                <article key={rp.slug} className="blog-card">
                  <div className="blog-card-category">{rp.category}</div>
                  <h4 className="blog-card-title">
                    <Link
                      to={`/blog/${rp.slug}`}
                      onClick={() => trackBlogRelatedArticleClick(post.slug, rp.slug)}
                    >
                      {rp.title}
                    </Link>
                  </h4>
                  <p className="blog-card-excerpt">{rp.excerpt}</p>
                  <div className="blog-card-footer">
                    <span>{rp.readingTime}</span>
                    <Link
                      to={`/blog/${rp.slug}`}
                      className="blog-card-readmore"
                      onClick={() => trackBlogRelatedArticleClick(post.slug, rp.slug)}
                    >
                      {isEn ? 'Read Article →' : 'Devamını Oku →'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. Tüm hakları saklıdır.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>Restoranlar</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>Araçlar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
