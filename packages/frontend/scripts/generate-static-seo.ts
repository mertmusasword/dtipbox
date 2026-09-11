/**
 * Static SEO Pre-rendering Generator
 * D-TIPBOX / Naponi Digital Tipping Platform
 *
 * Runs post-build to generate crawlable, static HTML files for:
 * - /blog/index.html
 * - /blog/:slug/index.html
 * - /solutions/:sector/index.html
 * - /tools/:tool/index.html
 *
 * Ensures Googlebot and all search engines receive full static semantic HTML,
 * title, meta description, canonical, and Schema.org JSON-LD without executing JavaScript.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../src/content/blog/posts';
import { SECTOR_SOLUTIONS } from '../src/content/solutions/sectors';
import { SEO_TOOLS } from '../src/content/tools/tools';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`[SEO-GEN] Error: dist/index.html not found at ${TEMPLATE_PATH}. Run vite build first.`);
  process.exit(1);
}

const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

function writeStaticRoute(routePath: string, options: {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string[];
  ogType?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  jsonLd?: any[];
  alternateLanguages?: { lang: string; url: string }[];
  contentHtml: string;
}) {
  const targetDir = path.join(DIST_DIR, routePath);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.html');

  let html = templateHtml;

  // 1. Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${options.title}</title>`);

  // 2. Replace or inject <meta name="description">
  if (html.includes('name="description"')) {
    html = html.replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="description" content="${options.description}" />`);
  } else {
    html = html.replace('</head>', `<meta name="description" content="${options.description}" />\n</head>`);
  }

  // 3. Replace <link rel="canonical">
  if (html.includes('rel="canonical"')) {
    html = html.replace(/<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${options.canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `<link rel="canonical" href="${options.canonicalUrl}" />\n</head>`);
  }

  // 3B. Alternate Hreflang Tags
  let alternateHreflangs = '';
  if (options.alternateLanguages && options.alternateLanguages.length > 0) {
    alternateHreflangs = options.alternateLanguages
      .map(({ lang, url }) => `<link rel="alternate" hreflang="${lang}" href="${url}" />`)
      .join('\n    ');
  }

  // 4. Open Graph & Twitter
  const extraMetas = `
    <!-- Dynamic Pre-rendered Open Graph & Alternate Links -->
    ${alternateHreflangs}
    <meta property="og:title" content="${options.title}" />
    <meta property="og:description" content="${options.description}" />
    <meta property="og:url" content="${options.canonicalUrl}" />
    <meta property="og:type" content="${options.ogType || 'website'}" />
    <meta property="og:site_name" content="Naponi" />
    <meta property="og:image" content="https://www.naponi.com/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${options.title}" />
    <meta name="twitter:description" content="${options.description}" />
    <meta name="twitter:image" content="https://www.naponi.com/logo.png" />
  `;

  // 5. JSON-LD Structured Data
  let jsonLdScript = '';
  if (options.jsonLd && options.jsonLd.length > 0) {
    jsonLdScript = `
    <script type="application/ld+json">
    ${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': options.jsonLd,
    }, null, 2)}
    </script>
    `;
  }

  html = html.replace('</head>', `${extraMetas}\n${jsonLdScript}\n</head>`);

  // 6. Pre-rendered HTML inside #root
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${options.contentHtml}</div>`
  );

  fs.writeFileSync(targetFile, html, 'utf-8');
  console.log(`[SEO-GEN] Generated: ${routePath}/index.html`);
}

// =============================================================================
// 1. GENERATE /blog/index.html
// =============================================================================
const blogPostsListHtml = BLOG_POSTS.map(
  (p) => `
    <article class="blog-card" style="margin-bottom: 2rem;">
      <div class="blog-card-category">${p.category}</div>
      <h2 class="blog-card-title"><a href="/blog/${p.slug}">${p.title}</a></h2>
      <p class="blog-card-excerpt">${p.excerpt}</p>
      <div class="blog-card-footer">
        <span>${p.readingTime} • ${p.datePublished}</span>
        <a href="/blog/${p.slug}" class="blog-card-readmore">Devamını Oku &rarr;</a>
      </div>
    </article>
  `
).join('\n');

writeStaticRoute('blog', {
  title: 'Naponi Blog — Dijital Bahşiş, Restoran ve Konaklama Rehberleri',
  description: 'Restoranlar, kafeler ve oteller için dijital bahşiş sistemleri, temassız ödeme teknolojileri ve personel yönetim rehberleri.',
  canonicalUrl: 'https://www.naponi.com/blog',
  contentHtml: `
    <main class="blog-container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <header class="blog-hero">
        <h1 class="home-section-title">Hizmet Sektöründe Dijitalleşme ve Bahşiş Rehberleri</h1>
        <p class="home-section-desc">Restoranlar, kafeler ve oteller için temassız ödemeler, bahşiş havuzu modelleri ve personel verimliliğini artıran pratik stratejiler.</p>
      </header>
      <section class="blog-posts-grid">
        ${blogPostsListHtml}
      </section>
      <div style="margin-top: 3rem; text-align: center;">
        <a href="/register" class="home-btn-primary">İşletmenizde QR Bahşişi Başlatın</a>
      </div>
    </main>
  `,
  jsonLd: [
    {
      '@type': 'WebPage',
      name: 'Naponi Blog',
      url: 'https://www.naponi.com/blog',
      description: 'Restoranlar, kafeler ve oteller için dijital bahşiş sistemleri ve temassız ödeme rehberleri.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.naponi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.naponi.com/blog' },
      ],
    },
  ],
});

// =============================================================================
// 2. GENERATE /blog/:slug/index.html
// =============================================================================
BLOG_POSTS.forEach((post) => {
  const isEn = post.language === 'en';
  const alternateLanguages: { lang: string; url: string }[] = [];
  if (post.alternateSlugs) {
    if (post.alternateSlugs.tr) {
      alternateLanguages.push({
        lang: 'tr',
        url: `https://www.naponi.com/blog/${post.alternateSlugs.tr}`,
      });
    }
    if (post.alternateSlugs.en) {
      alternateLanguages.push({
        lang: 'en',
        url: `https://www.naponi.com/blog/${post.alternateSlugs.en}`,
      });
      alternateLanguages.push({
        lang: 'x-default',
        url: `https://www.naponi.com/blog/${post.alternateSlugs.en}`,
      });
    }
  }

  const jsonLd: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Ana Sayfa', item: 'https://www.naponi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.naponi.com/blog' },
        { '@type': 'ListItem', position: 3, name: post.category, item: `https://www.naponi.com/blog/category/${encodeURIComponent(post.category)}` },
        { '@type': 'ListItem', position: 4, name: post.title, item: post.canonicalUrl },
      ],
    },
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription,
      image: 'https://www.naponi.com/logo.png',
      url: post.canonicalUrl,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      inLanguage: post.language,
      author: {
        '@type': 'Organization',
        name: post.author.name,
        url: 'https://www.naponi.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Naponi',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.naponi.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': post.canonicalUrl,
      },
    },
  ];

  if (post.faq && post.faq.length > 0) {
    jsonLd.push({
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  const faqHtml = post.faq
    ? `
      <section style="margin-top: 3rem;">
        <h2>${isEn ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}</h2>
        ${post.faq
          .map(
            (f) => `
          <div style="margin-bottom: 1.5rem;">
            <h3>${f.question}</h3>
            <p>${f.answer}</p>
          </div>
        `
          )
          .join('')}
      </section>
    `
    : '';

  const contentHtml = `
    <main class="blog-container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <nav aria-label="Breadcrumb">
        <a href="/">${isEn ? 'Home' : 'Ana Sayfa'}</a> &gt; <a href="/blog">Blog</a> &gt; <a href="/blog/category/${encodeURIComponent(post.category)}">${post.category}</a> &gt; <span>${post.title}</span>
      </nav>
      <header class="article-header" style="margin-top: 2rem;">
        <span class="blog-card-category">${post.category}</span>
        <h1 class="article-title">${post.title}</h1>
        <p class="article-lead">${post.excerpt}</p>
        <div style="color: #94a3b8; font-size: 0.9rem;">
          ${isEn ? `Author: ${post.author.name} • Published: ${post.datePublished} • ${post.readingTime}` : `Yazar: ${post.author.name} • Yayın Tarihi: ${post.datePublished} • ${post.readingTime}`}
        </div>
      </header>
      <article class="article-body">
        ${post.content}
        ${faqHtml}
        <div style="margin-top: 3rem; text-align: center;">
          <a href="/register" class="home-btn-primary">${isEn ? 'Start Accepting Digital Tips Today &rarr;' : 'İşletmenizde Dijital Bahşişe Başlayın &rarr;'}</a>
        </div>
      </article>
    </main>
  `;

  writeStaticRoute(`blog/${post.slug}`, {
    title: post.metaTitle,
    description: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    ogType: 'article',
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified,
    authorName: post.author.name,
    jsonLd,
    alternateLanguages,
    contentHtml,
  });
});

// =============================================================================
// 3. GENERATE /solutions/:sector/index.html
// =============================================================================
Object.values(SECTOR_SOLUTIONS).forEach((sector) => {
  const jsonLd: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.naponi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Sektörel Çözümler', item: 'https://www.naponi.com/#industries' },
        { '@type': 'ListItem', position: 3, name: sector.sectorName, item: sector.canonicalUrl },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: sector.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    },
  ];

  const contentHtml = `
    <main class="home-container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <nav aria-label="Breadcrumb">
        <a href="/">Ana Sayfa</a> &gt; <a href="/#industries">Sektörler</a> &gt; <span>${sector.sectorName}</span>
      </nav>
      <header style="text-align: center; margin: 2rem 0 3rem;">
        <span class="home-section-tag">${sector.badge}</span>
        <h1 class="home-hero-title">${sector.heroTitle}</h1>
        <p class="home-hero-desc">${sector.heroSubtitle}</p>
        <div style="margin-top: 1.5rem;">
          <a href="/register" class="home-btn-primary home-btn-hero-large">2 Dakikada QR Alın &rarr;</a>
        </div>
      </header>

      <section>
        <h2>${sector.problemTitle}</h2>
        <p>${sector.problemDescription}</p>
        <ul>
          ${sector.problems.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-top: 3rem;">
        <h2>${sector.solutionTitle}</h2>
        <p>${sector.solutionDescription}</p>
        <div class="home-features-grid">
          ${sector.features
            .map(
              (f) => `
            <div class="home-feature-card">
              <h3 class="home-feature-title">${f.title}</h3>
              <p class="home-feature-desc">${f.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section style="margin-top: 3rem;">
        <h2>Sıkça Sorulan Sorular</h2>
        ${sector.faqs
          .map(
            (f) => `
          <div style="margin-bottom: 1.5rem;">
            <h3>${f.question}</h3>
            <p>${f.answer}</p>
          </div>
        `
          )
          .join('')}
      </section>

      <div style="margin-top: 4rem; text-align: center;">
        <a href="/register" class="home-btn-primary">İşletmenizi Hemen Kaydedin &rarr;</a>
      </div>
    </main>
  `;

  writeStaticRoute(`solutions/${sector.slug}`, {
    title: sector.metaTitle,
    description: sector.metaDescription,
    canonicalUrl: sector.canonicalUrl,
    jsonLd,
    contentHtml,
  });
});

// =============================================================================
// 4. GENERATE /tools/:tool/index.html
// =============================================================================
Object.values(SEO_TOOLS).forEach((tool) => {
  const jsonLd: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.naponi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Araçlar', item: 'https://www.naponi.com/tools/tip-calculator' },
        { '@type': 'ListItem', position: 3, name: tool.name, item: tool.canonicalUrl },
      ],
    },
    {
      '@type': 'WebApplication',
      name: tool.name,
      url: tool.canonicalUrl,
      description: tool.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
    },
  ];

  const contentHtml = `
    <main class="blog-container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <nav aria-label="Breadcrumb">
        <a href="/">Ana Sayfa</a> &gt; <a href="/tools/tip-calculator">Araçlar</a> &gt; <span>${tool.name}</span>
      </nav>
      <header style="text-align: center; margin: 2rem 0 3rem;">
        <span class="home-section-tag">${tool.badge}</span>
        <h1 class="home-section-title">${tool.title}</h1>
        <p class="home-section-desc">${tool.description}</p>
      </header>
      <div style="text-align: center; margin: 3rem 0;">
        <p>İnteraktif hesaplayıcı yükleniyor... Eğer yüklenmezse JavaScript'i etkinleştiriniz.</p>
        <a href="/register" class="home-btn-primary">İşletmenize QR Bahşiş Kutusu Alın &rarr;</a>
      </div>
    </main>
  `;

  writeStaticRoute(`tools/${tool.slug}`, {
    title: tool.metaTitle,
    description: tool.metaDescription,
    canonicalUrl: tool.canonicalUrl,
    jsonLd,
    contentHtml,
  });
});

// =============================================================================
// 5. DYNAMIC SITEMAP GENERATION
// =============================================================================
function generateDynamicSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const blogUrls = BLOG_POSTS.map((post) => {
    let xhtmlLinks = '';
    if (post.alternateSlugs) {
      if (post.alternateSlugs.tr) {
        xhtmlLinks += `\n    <xhtml:link rel="alternate" hreflang="tr" href="https://www.naponi.com/blog/${post.alternateSlugs.tr}" />`;
      }
      if (post.alternateSlugs.en) {
        xhtmlLinks += `\n    <xhtml:link rel="alternate" hreflang="en" href="https://www.naponi.com/blog/${post.alternateSlugs.en}" />`;
        xhtmlLinks += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.naponi.com/blog/${post.alternateSlugs.en}" />`;
      }
    } else {
      xhtmlLinks += `\n    <xhtml:link rel="alternate" hreflang="${post.language}" href="${post.canonicalUrl}" />`;
    }

    const isPillar = post.slug.includes('what-is-digital-tipping') || post.slug.includes('dijital-bahsis-nedir');

    return `  <url>
    <loc>${post.canonicalUrl}</loc>
    <lastmod>${post.dateModified || post.datePublished || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isPillar ? '0.9' : '0.85'}</priority>${xhtmlLinks}
  </url>`;
  }).join('\n');

  const sectorUrls = Object.values(SECTOR_SOLUTIONS).map(
    (sector) => `  <url>
    <loc>${sector.canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
  ).join('\n');

  const toolUrls = Object.values(SEO_TOOLS).map(
    (tool) => `  <url>
    <loc>${tool.canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
  ).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- 1. Homepage -->
  <url>
    <loc>https://www.naponi.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.naponi.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://www.naponi.com/?lang=en" />
    <xhtml:link rel="alternate" hreflang="tr" href="https://www.naponi.com/?lang=tr" />
    <xhtml:link rel="alternate" hreflang="es" href="https://www.naponi.com/?lang=es" />
    <xhtml:link rel="alternate" hreflang="zh" href="https://www.naponi.com/?lang=zh" />
    <xhtml:link rel="alternate" hreflang="ar" href="https://www.naponi.com/?lang=ar" />
    <xhtml:link rel="alternate" hreflang="de" href="https://www.naponi.com/?lang=de" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://www.naponi.com/?lang=fr" />
    <xhtml:link rel="alternate" hreflang="pt" href="https://www.naponi.com/?lang=pt" />
    <xhtml:link rel="alternate" hreflang="id" href="https://www.naponi.com/?lang=id" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://www.naponi.com/?lang=ja" />
  </url>

  <!-- 2. Blog Hub -->
  <url>
    <loc>https://www.naponi.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.naponi.com/blog" />
    <xhtml:link rel="alternate" hreflang="tr" href="https://www.naponi.com/blog" />
  </url>

  <!-- 3. Dynamic Blog Articles (${BLOG_POSTS.length} posts) -->
${blogUrls}

  <!-- 4. Sektörel Çözüm Sayfaları -->
${sectorUrls}

  <!-- 5. Ücretsiz İnteraktif SEO Araçları -->
${toolUrls}

  <!-- 6. İşletme Kayıt & Giriş -->
  <url>
    <loc>https://www.naponi.com/register</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.naponi.com/register" />
  </url>
  <url>
    <loc>https://www.naponi.com/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.naponi.com/login" />
  </url>
</urlset>
`;

  // Write to dist/sitemap.xml and public/sitemap.xml
  const distSitemap = path.join(DIST_DIR, 'sitemap.xml');
  const publicSitemap = path.resolve(__dirname, '../public/sitemap.xml');

  fs.writeFileSync(distSitemap, sitemapXml, 'utf-8');
  fs.writeFileSync(publicSitemap, sitemapXml, 'utf-8');
  console.log(`[SEO-GEN] Generated dynamic sitemap with ${BLOG_POSTS.length} blog posts in dist/ and public/`);
}

generateDynamicSitemap();

console.log('[SEO-GEN] ✅ Pre-rendering and dynamic sitemap generation completed successfully!');
