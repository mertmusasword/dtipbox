import React, { useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Tag,
  Filter,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { BLOG_POSTS, BLOG_CATEGORIES, BlogPost } from '../../../content/blog/posts';
import { trackBlogSearch, trackBlogCategoryClick, trackBlogCtaClick } from '../../../analytics';
import '../../../styles/home.css';

export const BlogIndexPage: React.FC = () => {
  const { category: paramCategory } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const querySearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory || 'Tümü');

  // Sync category param
  React.useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(decodeURIComponent(paramCategory));
    }
  }, [paramCategory]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      if (post.status !== 'published') return false;

      const matchesCategory =
        selectedCategory === 'Tümü' ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Featured post
  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.isFeatured && p.status === 'published') || BLOG_POSTS[0];
  }, []);

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

  const isFilteredOrSearched = selectedCategory !== 'Tümü' || !!searchTerm;

  return (
    <div className="home-wrapper">
      <SeoHead
        title={
          selectedCategory !== 'Tümü'
            ? `${selectedCategory} Rehberleri & Makaleleri — Naponi Blog`
            : 'Naponi Blog — Dijital Bahşiş, Restoran ve Konaklama Rehberi'
        }
        description="Restoranlar, kafeler ve oteller için dijital bahşiş sistemleri, temassız ödeme teknolojileri ve personel yönetim rehberleri."
        canonicalUrl={
          selectedCategory !== 'Tümü'
            ? `https://www.naponi.com/blog/category/${encodeURIComponent(selectedCategory)}`
            : 'https://www.naponi.com/blog'
        }
        keywords={['dijital bahşiş blog', 'restoran bahşiş rehberi', 'qr bahşiş makaleleri', 'otel bahşiş çözümleri']}
        breadcrumbs={[
          { name: 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: 'Blog', url: 'https://www.naponi.com/blog' },
          ...(selectedCategory !== 'Tümü' ? [{ name: selectedCategory, url: `https://www.naponi.com/blog/category/${encodeURIComponent(selectedCategory)}` }] : []),
        ]}
        noindex={!!searchTerm} // Avoid indexing search query result pages
      />

      {/* Nav */}
      <header className="home-nav-wrapper">
        <nav className="home-nav">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>
          <div className="home-nav-actions">
            <Link to="/tools/tip-calculator" className="home-btn-ghost">Hesaplayıcı</Link>
            <Link to="/solutions/restaurants" className="home-btn-ghost">Restoranlar</Link>
            <Link to="/login" className="home-btn-ghost">Giriş Yap</Link>
            <Link
              to="/register"
              className="home-btn-primary"
              onClick={() => trackBlogCtaClick('blog_index_nav', '/register')}
            >
              Hemen Başlayın <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      <main className="blog-container" style={{ paddingTop: '7.5rem', paddingBottom: '5rem' }}>
        {/* Breadcrumb */}
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>/</span>
          <span className="current">Blog</span>
          {selectedCategory !== 'Tümü' && (
            <>
              <span>/</span>
              <span className="current">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Hero Header */}
        <div className="blog-hero">
          <span className="home-section-tag">İçerik & Rehber Merkezi</span>
          <h1 className="home-section-title" style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>
            Hizmet Sektöründe Dijitalleşme ve Bahşiş Rehberleri
          </h1>
          <p className="home-section-desc" style={{ maxWidth: 700, margin: '0 auto 2rem' }}>
            Restoranlar, kafeler ve oteller için temassız ödemeler, bahşiş havuzu modelleri ve personel verimliliğini artıran pratik stratejiler.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="blog-search-form">
            <Search size={18} className="blog-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Makale, konu veya anahtar kelime arayın..."
              className="blog-search-input"
            />
            <button type="submit" className="blog-search-btn">
              Ara
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="blog-categories-wrapper">
          <button
            type="button"
            className={`blog-category-pill ${selectedCategory === 'Tümü' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('Tümü')}
          >
            Tüm Yazılar
          </button>
          {BLOG_CATEGORIES.map((cat) => (
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
                <span>Öne Çıkan Rehber</span>
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
                  Rehberi Oku <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Article Grid */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>
              {selectedCategory === 'Tümü' ? 'Son Yazılar' : `${selectedCategory} Yazıları`} ({filteredPosts.length})
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
              <BookOpen size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aramanızla eşleşen makale bulunamadı</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Farklı bir anahtar kelime deneyebilir veya tüm kategorilere göz atabilirsiniz.</p>
              <button
                type="button"
                className="home-btn-secondary"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Tümü');
                }}
              >
                Tüm Makaleleri Göster
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
                      Devamını Oku &rarr;
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
              <span className="home-section-tag">Ücretsiz Araçlar</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                Bahşiş Hesaplama ve Bölüştürme Araçlarımızı Keşfedin
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 600 }}>
                Hesap tutarınıza göre kişi başı bahşiş tutarını hesaplayabilir veya restoranınızdaki havuz dağıtımını saniyeler içinde simüle edebilirsiniz.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/tools/tip-calculator" className="home-btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                Bahşiş Hesaplayıcı
              </Link>
              <Link to="/tools/tip-split-calculator" className="home-btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
                Bahşiş Bölüştürücü
              </Link>
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
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>Araçlar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
