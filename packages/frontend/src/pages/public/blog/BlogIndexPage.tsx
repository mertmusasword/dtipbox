import React, { useState, useMemo, useEffect } from 'react';
import { PublicNavbar } from '../../../components/PublicNavbar';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  BLOG_CATEGORIES_EN,
  BLOG_CATEGORIES_DE,
  BLOG_CATEGORIES_ES,
} from '../../../content/blog/posts';
import { trackBlogSearch, trackBlogCategoryClick, trackBlogCtaClick } from '../../../analytics';
import { useLanguage } from '../../../i18n';
import '../../../styles/home.css';

type SupportedBlogLang = 'tr' | 'en' | 'de' | 'es';

export const BlogIndexPage: React.FC = () => {
  const { category: paramCategory } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  // Blog active language ('tr', 'en', 'de', 'es')
  const initialLang: SupportedBlogLang =
    language === 'tr' ? 'tr' : language === 'de' ? 'de' : language === 'es' ? 'es' : 'en';
  const [blogLang, setBlogLang] = useState<SupportedBlogLang>(initialLang);

  useEffect(() => {
    if (language === 'tr') setBlogLang('tr');
    else if (language === 'de') setBlogLang('de');
    else if (language === 'es') setBlogLang('es');
    else setBlogLang('en');
  }, [language]);

  const querySearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const isEn = blogLang === 'en';
  const defaultCategory = blogLang === 'de' ? 'Alle' : blogLang === 'es' ? 'Todos' : isEn ? 'All' : 'Tümü';
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory || defaultCategory);

  // Sync category param
  useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(decodeURIComponent(paramCategory));
    }
  }, [paramCategory]);

  const categories =
    blogLang === 'de'
      ? ['Alle', ...BLOG_CATEGORIES_DE]
      : blogLang === 'es'
      ? ['Todos', ...BLOG_CATEGORIES_ES]
      : isEn
      ? BLOG_CATEGORIES_EN
      : BLOG_CATEGORIES;

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      if (post.status !== 'published') return false;
      if (post.language !== blogLang) return false;

      const matchesCategory =
        selectedCategory === 'Tümü' ||
        selectedCategory === 'All' ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, blogLang]);

  // Featured post
  const featuredPost = useMemo(() => {
    return (
      BLOG_POSTS.find((p) => p.language === blogLang && p.isFeatured && p.status === 'published') ||
      BLOG_POSTS.find((p) => p.language === blogLang && p.status === 'published')
    );
  }, [blogLang]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
      trackBlogSearch(searchTerm, filteredPosts.length);
    } else {
      setSearchParams({});
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    trackBlogCategoryClick(cat);
  };

  const handleLanguageSwitch = (lang: SupportedBlogLang) => {
    setBlogLang(lang);
    const newDefault = lang === 'de' ? 'Alle' : lang === 'es' ? 'Todos' : lang === 'en' ? 'All' : 'Tümü';
    setSelectedCategory(newDefault);
    setSearchTerm('');
    setSearchParams({});
  };

  const postCounts = useMemo(() => {
    return {
      tr: BLOG_POSTS.filter((p) => p.language === 'tr' && p.status === 'published').length,
      en: BLOG_POSTS.filter((p) => p.language === 'en' && p.status === 'published').length,
      de: BLOG_POSTS.filter((p) => p.language === 'de' && p.status === 'published').length,
      es: BLOG_POSTS.filter((p) => p.language === 'es' && p.status === 'published').length,
    };
  }, []);

  const isFilteredOrSearched =
    (selectedCategory !== 'Tümü' &&
      selectedCategory !== 'All' &&
      selectedCategory !== 'Alle' &&
      selectedCategory !== 'Todos') ||
    !!searchTerm;

  return (
    <div className="home-wrapper">
      <SeoHead
        title={
          selectedCategory !== 'Tümü' &&
          selectedCategory !== 'All' &&
          selectedCategory !== 'Alle' &&
          selectedCategory !== 'Todos'
            ? `${selectedCategory} ${isEn ? 'Guides & Articles — Naponi Blog' : 'Rehberleri & Makaleleri — Naponi Blog'}`
            : blogLang === 'de'
            ? 'Naponi Blog — Digitales Trinkgeld, Gastronomie & Knigge-Leitfäden'
            : blogLang === 'es'
            ? 'Naponi Blog — Propina Digital, Hostelería y Gestión de Bote Común'
            : isEn
            ? 'Naponi Blog — Digital Tipping, Restaurant & Hospitality Guides'
            : 'Naponi Blog — Dijital Bahşiş, Restoran ve Konaklama Rehberi'
        }
        description={
          blogLang === 'de'
            ? 'Praxisnahe Leitfäden für Gastronomen, Hoteliers und Servicekräfte zu steuerfreiem QR-Trinkgeld nach § 3 Nr. 51 EStG und Schichtaufteilung.'
            : blogLang === 'es'
            ? 'Guías para restaurantes y hostelería sobre propinas con código QR, reparto justo de botes y motivación de camareros.'
            : isEn
            ? 'Actionable guides on QR digital tipping, cashless hospitality payments, tip pooling, and service staff retention for restaurants and hotels.'
            : 'Restoranlar, kafeler ve oteller için dijital bahşiş sistemleri, temassız ödeme teknolojileri ve personel yönetim rehberleri.'
        }
        canonicalUrl={
          selectedCategory !== 'Tümü' &&
          selectedCategory !== 'All' &&
          selectedCategory !== 'Alle' &&
          selectedCategory !== 'Todos'
            ? `https://www.naponi.com/blog/category/${encodeURIComponent(selectedCategory)}`
            : 'https://www.naponi.com/blog'
        }
        keywords={
          blogLang === 'de'
            ? ['digitales trinkgeld blog', 'gastronomie leitfaden', 'trinkgeld pool restaurant', 'kellner trinkgeld']
            : blogLang === 'es'
            ? ['propina digital blog', 'guias hosteleria restaurantes', 'reparto propinas camareros', 'codigo qr propinas']
            : isEn
            ? ['digital tipping blog', 'restaurant tipping guide', 'qr tipping articles', 'hotel tipping solutions']
            : ['dijital bahşiş blog', 'restoran bahşiş rehberi', 'qr bahşiş makaleleri', 'otel bahşiş çözümleri']
        }
        breadcrumbs={[
          { name: isEn ? 'Home' : 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: 'Blog', url: 'https://www.naponi.com/blog' },
          ...(selectedCategory !== 'Tümü' &&
          selectedCategory !== 'All' &&
          selectedCategory !== 'Alle' &&
          selectedCategory !== 'Todos'
            ? [{ name: selectedCategory, url: `https://www.naponi.com/blog/category/${encodeURIComponent(selectedCategory)}` }]
            : []),
        ]}
        noindex={!!searchTerm}
      />

      {/* Nav */}
      <PublicNavbar />

      <main className="blog-container" style={{ paddingTop: '7.5rem', paddingBottom: '5rem' }}>
        {/* Breadcrumb */}
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span className="current">Blog</span>
          {selectedCategory !== 'Tümü' &&
            selectedCategory !== 'All' &&
            selectedCategory !== 'Alle' &&
            selectedCategory !== 'Todos' && (
              <>
                <span>/</span>
                <span className="current">{selectedCategory}</span>
              </>
            )}
        </nav>

        {/* Hero Header */}
        <div className="blog-hero">
          {/* Language Switch Pills */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.4rem',
              marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.05)',
              padding: '4px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.1)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => handleLanguageSwitch('tr')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: blogLang === 'tr' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '0.84rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              🇹🇷 Türkçe ({postCounts.tr})
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: blogLang === 'en' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '0.84rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              🇬🇧 English ({postCounts.en})
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('de')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: blogLang === 'de' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '0.84rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              🇩🇪 Deutsch ({postCounts.de})
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('es')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: blogLang === 'es' ? 'var(--primary)' : 'transparent',
                color: '#fff',
                fontSize: '0.84rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              🇪🇸 Español ({postCounts.es})
            </button>
          </div>

          <br />
          <span className="home-section-tag">
            {blogLang === 'de'
              ? 'Wissen & Leitfäden Hub'
              : blogLang === 'es'
              ? 'Centro de Conocimiento y Guías'
              : isEn
              ? 'Knowledge & Guides Hub'
              : 'İçerik & Rehber Merkezi'}
          </span>
          <h1 className="home-section-title" style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>
            {blogLang === 'de'
              ? 'Gastronomie-Technologie & Digitales Trinkgeld Leitfäden'
              : blogLang === 'es'
              ? 'Tecnología en Hostelería y Guías de Propina Digital'
              : isEn
              ? 'Hospitality Technology & Digital Tipping Guides'
              : 'Hizmet Sektöründe Dijitalleşme ve Bahşiş Rehberleri'}
          </h1>
          <p className="home-section-desc" style={{ maxWidth: 700, margin: '0 auto 2rem' }}>
            {blogLang === 'de'
              ? 'Praxisnahe, datengestützte Leitfäden für Restaurants, Hotels und Cafés zu kontaktlosem Trinkgeld, Schicht-Pools und Mitarbeiterbindung.'
              : blogLang === 'es'
              ? 'Guías operativas y prácticas para restaurantes, hoteles y bares sobre pagos contactless, reparto de botes y fidelización del equipo.'
              : isEn
              ? 'Practical, data-backed operational guides for restaurants, hotels, and cafes on contactless payments, tip pool distribution, and frontline staff motivation.'
              : 'Restoranlar, oteller ve kafeler için temassız ödemeler, bahşiş havuzu dağıtımı ve personel motivasyonu üzerine pratik rehberler.'}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="blog-search-form">
            <Search size={18} className="blog-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search articles, topics, or keywords...' : 'Makale, konu veya anahtar kelime arayın...'}
              className="blog-search-input"
            />
            <button type="submit" className="blog-search-btn">
              {isEn ? 'Search' : 'Ara'}
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="blog-categories-wrapper">
          <button
            type="button"
            className={`blog-category-pill ${selectedCategory === defaultCategory ? 'active' : ''}`}
            onClick={() => handleCategorySelect(defaultCategory)}
          >
            {isEn ? 'All Articles' : 'Tüm Yazılar'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`blog-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Highlight (Shown only if not searching) */}
        {!isFilteredOrSearched && featuredPost && (
          <section style={{ marginBottom: '3.5rem' }}>
            <div className="blog-featured-card">
              <div className="blog-featured-badge">
                <Sparkles size={14} className="sparkle" />
                <span>{isEn ? 'Featured Guide' : 'Öne Çıkan Rehber'}</span>
              </div>
              <div className="blog-card-category" style={{ marginTop: '0.75rem' }}>
                {featuredPost.category}
              </div>
              <h2 className="blog-featured-title">
                <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>
              <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
              <div className="blog-card-footer" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{featuredPost.readingTime}</span>
                  <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{featuredPost.datePublished}</span>
                </div>
                <Link to={`/blog/${featuredPost.slug}`} className="home-btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>
                  {isEn ? 'Read Guide' : 'Rehberi Oku'} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Article Grid */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>
              {selectedCategory === defaultCategory
                ? isEn ? 'Latest Guides' : 'Son Yazılar'
                : `${selectedCategory} (${filteredPosts.length})`}
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
              <BookOpen size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {isEn ? 'No articles found matching your query' : 'Aramanızla eşleşen makale bulunamadı'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                {isEn ? 'Try different keywords or browse all categories.' : 'Farklı bir anahtar kelime deneyebilir veya tüm kategorilere göz atabilirsiniz.'}
              </p>
              <button
                type="button"
                className="home-btn-secondary"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(defaultCategory);
                }}
              >
                {isEn ? 'View All Articles' : 'Tüm Makaleleri Göster'}
              </button>
            </div>
          ) : (
            <div className="blog-posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.slug} className="blog-card">
                  <div className="blog-card-category">{post.category}</div>
                  <h3 className="blog-card-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>{post.readingTime}</span>
                      <span>•</span>
                      <span>{post.datePublished}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="blog-card-readmore">
                      {isEn ? 'Read Article →' : 'Devamını Oku →'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Free Tools Banner */}
        <section style={{ marginTop: '4.5rem' }}>
          <div className="blog-tools-banner">
            <div>
              <span className="home-section-tag">{isEn ? 'Free Interactive Tools' : 'Ücretsiz Araçlar'}</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                {isEn
                  ? 'Explore Our Free Tipping & Tip Pooling Calculators'
                  : 'Bahşiş Hesaplama ve Bölüştürme Araçlarımızı Keşfedin'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 600 }}>
                {isEn
                  ? 'Calculate tip percentages per person based on check amount or simulate shift-based tip pool sharing in seconds.'
                  : 'Hesap tutarınıza göre kişi başı bahşiş tutarını hesaplayabilir veya restoranınızdaki havuz dağıtımını saniyeler içinde simüle edebilirsiniz.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/tools/tip-calculator" className="home-btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                {isEn ? 'Tip Calculator' : 'Bahşiş Hesaplayıcı'}
              </Link>
              <Link to="/tools/tip-split-calculator" className="home-btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                {isEn ? 'Tip Split Calculator' : 'Bahşiş Bölüştürücü'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. {isEn ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Restaurants' : 'Restoranlar'}</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Tools' : 'Araçlar'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
