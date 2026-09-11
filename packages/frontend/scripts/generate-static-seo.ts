/**
 * Static SEO Pre-rendering Generator
 * D-TIPBOX / Naponi Digital Tipping Platform
 *
 * Runs post-build to generate crawlable, static HTML files for:
 * - /index.html (Root homepage with semantic content & structured data)
 * - /blog/index.html
 * - /blog/:slug/index.html (TR + EN with reciprocal hreflang links)
 * - /solutions/:sector/index.html (Bilingual & hreflang enabled)
 * - /tools/:tool/index.html (Bilingual & hreflang enabled)
 *
 * Ensures Googlebot and global search engines receive full static semantic HTML,
 * title, meta description, canonical, alternate hreflang, and Schema.org JSON-LD without executing JavaScript.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BLOG_POSTS } from '../src/content/blog/posts';
import { SECTOR_SOLUTIONS } from '../src/content/solutions/sectors';
import { SECTOR_SOLUTIONS_EN } from '../src/content/solutions/sectors-en';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../src/content/tools/tools';

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
  const targetDir = routePath ? path.join(DIST_DIR, routePath) : DIST_DIR;
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
  console.log(`[SEO-GEN] Generated: ${routePath ? routePath + '/index.html' : 'index.html (Homepage Root)'}`);
}

// =============================================================================
// 0. PRE-RENDER ROOT HOMEPAGE (dist/index.html)
// =============================================================================
const homepageSemanticContent = `
  <main class="home-wrapper">
    <header class="home-nav-wrapper">
      <nav class="home-nav" aria-label="Main Navigation">
        <a href="/" class="home-nav-brand">
          <img src="/naponi-brand.svg" alt="Naponi Digital Tipping" style="height: 40px; width: auto;" />
        </a>
        <div class="home-nav-links">
          <a href="/solutions/restaurants" class="home-nav-link">Restaurants</a>
          <a href="/solutions/hotels" class="home-nav-link">Hotels</a>
          <a href="/solutions/cafes" class="home-nav-link">Cafes</a>
          <a href="/tools/tip-calculator" class="home-nav-link">Tip Calculator</a>
          <a href="/blog" class="home-nav-link">Blog</a>
          <a href="/login" class="home-btn-ghost">Login</a>
          <a href="/register" class="home-btn-primary">Get Started</a>
        </div>
      </nav>
    </header>

    <section class="home-hero-section" style="padding-top: 6rem; padding-bottom: 4rem; text-align: center;">
      <div class="home-container">
        <span class="home-section-tag">Direct QR Digital Tipping Platform</span>
        <h1 class="home-hero-title" style="font-size: 3rem; max-width: 900px; margin: 1rem auto;">
          Direct QR Code Digital Tipping for Global Hospitality Teams
        </h1>
        <p class="home-hero-desc" style="font-size: 1.2rem; max-width: 760px; margin: 1rem auto 2rem; color: #94a3b8;">
          Empower waitstaff, baristas, hotel housekeepers, and service professionals with frictionless tableside QR code tipping. No app downloads, no sign-ups, instant direct settlement.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="/register" class="home-btn-primary home-btn-hero-large">Create Free Merchant Account &rarr;</a>
          <a href="/tools/tip-calculator" class="home-btn-secondary">Free Tip Calculator</a>
        </div>
      </div>
    </section>

    <!-- Industry Solutions Overview -->
    <section class="home-section">
      <div class="home-container">
        <div class="home-section-header">
          <span class="home-section-tag">Tailored Solutions</span>
          <h2 class="home-section-title">Built for Every Service & Hospitality Vertical</h2>
          <p class="home-section-desc">From fine dining tables to valet podiums, discover purpose-built QR tipping workflows.</p>
        </div>
        <div class="home-features-grid">
          <article class="home-feature-card">
            <h3 class="home-feature-title"><a href="/solutions/restaurants">Restaurants & Fine Dining</a></h3>
            <p class="home-feature-desc">Tableside QR stands enabling diners to tip waitstaff in 6 seconds via Apple Pay, Google Pay, or card.</p>
          </article>
          <article class="home-feature-card">
            <h3 class="home-feature-title"><a href="/solutions/cafes">Cafes & Specialty Coffee</a></h3>
            <p class="home-feature-desc">Digital counter tip jar for baristas. Fast queue-friendly micro-tipping while waiting for drinks.</p>
          </article>
          <article class="home-feature-card">
            <h3 class="home-feature-title"><a href="/solutions/hotels">Hotels & Luxury Resorts</a></h3>
            <p class="home-feature-desc">In-room housekeeping plaques and bellhop cards with multi-currency support for international travelers.</p>
          </article>
          <article class="home-feature-card">
            <h3 class="home-feature-title"><a href="/solutions/bars">Bars, Pubs & Nightclubs</a></h3>
            <p class="home-feature-desc">High-speed bar-mat QR codes designed for dim lighting and crowded nightlife counters.</p>
          </article>
          <article class="home-feature-card">
            <h3 class="home-feature-title"><a href="/solutions/barbers">Barbers, Salons & Spas</a></h3>
            <p class="home-feature-desc">Personal mirror decals for stylists and therapists. Private, discreet gratitude directly to chair renters.</p>
          </article>
          <article class="home-feature-card">
            <h3 class="home-feature-title"><a href="/solutions/valet">Valet Parking & Concierge</a></h3>
            <p class="home-feature-desc">QR printed directly on claim tickets and podium plaques. Zero vehicle line delays when retrieving cars.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Free Interactive Tools -->
    <section class="home-section" style="background: rgba(17, 24, 39, 0.3);">
      <div class="home-container">
        <div class="home-section-header">
          <span class="home-section-tag">Free Hospitality Tools</span>
          <h2 class="home-section-title">Interactive Calculators for Diners & Operators</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; max-width: 800px; margin: 0 auto;">
          <div class="solution-usecase-card">
            <h3><a href="/tools/tip-calculator">Online Tip & Bill Split Calculator</a></h3>
            <p>Calculate gratuity percentages and divide restaurant bills equally among dining companions.</p>
          </div>
          <div class="solution-usecase-card">
            <h3><a href="/tools/tip-split-calculator">Restaurant Tip Pool & Split Calculator</a></h3>
            <p>Fairly distribute end-of-shift tip pools among servers, kitchen chefs, bussers, and bartenders.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Footer -->
    <footer class="home-footer">
      <div class="home-container">
        <p>© ${new Date().getFullYear()} NAPONI Technologies. Global QR Code Digital Tipping Platform.</p>
        <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;">
          <a href="/solutions/restaurants">Restaurants</a>
          <a href="/solutions/cafes">Cafes</a>
          <a href="/solutions/hotels">Hotels</a>
          <a href="/solutions/bars">Bars</a>
          <a href="/solutions/barbers">Barbers</a>
          <a href="/solutions/valet">Valet</a>
          <a href="/tools/tip-calculator">Tip Calculator</a>
          <a href="/tools/tip-split-calculator">Tip Pool Splitter</a>
          <a href="/blog">Blog & Guides</a>
        </div>
      </div>
    </footer>
  </main>
`;

writeStaticRoute('', {
  title: 'Naponi — Direct QR Digital Tipping Platform for Global Businesses',
  description: 'Empower your hospitality and service team with direct QR code digital tipping. No app downloads, no customer accounts. Instant, direct-to-bank settlement.',
  canonicalUrl: 'https://www.naponi.com/',
  alternateLanguages: [
    { lang: 'x-default', url: 'https://www.naponi.com/' },
    { lang: 'en', url: 'https://www.naponi.com/?lang=en' },
    { lang: 'tr', url: 'https://www.naponi.com/?lang=tr' },
    { lang: 'es', url: 'https://www.naponi.com/?lang=es' },
    { lang: 'zh', url: 'https://www.naponi.com/?lang=zh' },
    { lang: 'ar', url: 'https://www.naponi.com/?lang=ar' },
    { lang: 'de', url: 'https://www.naponi.com/?lang=de' },
    { lang: 'fr', url: 'https://www.naponi.com/?lang=fr' },
    { lang: 'pt', url: 'https://www.naponi.com/?lang=pt' },
    { lang: 'id', url: 'https://www.naponi.com/?lang=id' },
    { lang: 'ja', url: 'https://www.naponi.com/?lang=ja' },
  ],
  contentHtml: homepageSemanticContent,
});

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
        <a href="/blog/${p.slug}" class="blog-card-readmore">${p.language === 'en' ? 'Read Article &rarr;' : 'Devamını Oku &rarr;'}</a>
      </div>
    </article>
  `
).join('\n');

writeStaticRoute('blog', {
  title: 'Naponi Blog — Digital Tipping, Hospitality & Operational Guides',
  description: 'Actionable strategies for restaurants, cafes, and hotels on contactless tipping, tip pool fairness, and frontline team retention.',
  canonicalUrl: 'https://www.naponi.com/blog',
  alternateLanguages: [
    { lang: 'x-default', url: 'https://www.naponi.com/blog' },
    { lang: 'tr', url: 'https://www.naponi.com/blog' },
    { lang: 'en', url: 'https://www.naponi.com/blog' },
  ],
  contentHtml: `
    <main class="blog-container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <header class="blog-hero">
        <h1 class="home-section-title">Digital Tipping & Hospitality Operational Guides</h1>
        <p class="home-section-desc">Expert strategies on contactless gratuities, tip pool fairness, and frontline staff retention for modern hospitality venues.</p>
      </header>
      <section class="blog-posts-grid">
        ${blogPostsListHtml}
      </section>
      <div style="margin-top: 3rem; text-align: center;">
        <a href="/register" class="home-btn-primary">Start Accepting Digital Tips Today</a>
      </div>
    </main>
  `,
  jsonLd: [
    {
      '@type': 'WebPage',
      name: 'Naponi Blog',
      url: 'https://www.naponi.com/blog',
      description: 'Expert strategies on contactless gratuities, tip pool fairness, and frontline staff retention for modern hospitality venues.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.naponi.com/' },
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
// 3. GENERATE /solutions/:sector/index.html (Bilingual & Hreflang Enabled)
// =============================================================================
Object.values(SECTOR_SOLUTIONS_EN).forEach((sectorEn) => {
  const sectorTr = SECTOR_SOLUTIONS[sectorEn.slug] || sectorEn;

  const alternateLanguages = [
    { lang: 'x-default', url: sectorEn.canonicalUrl },
    { lang: 'en', url: sectorEn.canonicalUrl },
    { lang: 'tr', url: sectorEn.canonicalUrl },
  ];

  const jsonLd: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.naponi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Sectors', item: 'https://www.naponi.com/#industries' },
        { '@type': 'ListItem', position: 3, name: sectorEn.sectorName, item: sectorEn.canonicalUrl },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: sectorEn.faqs.map((f) => ({
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
        <a href="/">Home</a> &gt; <a href="/#industries">Sectors</a> &gt; <span>${sectorEn.sectorName}</span>
      </nav>
      <header style="text-align: center; margin: 2rem 0 3rem;">
        <span class="home-section-tag">${sectorEn.badge}</span>
        <h1 class="home-hero-title">${sectorEn.heroTitle}</h1>
        <p class="home-hero-desc">${sectorEn.heroSubtitle}</p>
        <div style="margin-top: 1.5rem;">
          <a href="/register" class="home-btn-primary home-btn-hero-large">Get QR Stand in 2 Minutes &rarr;</a>
        </div>
      </header>

      <section>
        <h2>${sectorEn.problemTitle}</h2>
        <p>${sectorEn.problemDescription}</p>
        <ul>
          ${sectorEn.problems.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-top: 3rem;">
        <h2>${sectorEn.solutionTitle}</h2>
        <p>${sectorEn.solutionDescription}</p>
        <div class="home-features-grid">
          ${sectorEn.features
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
        <h2>Frequently Asked Questions</h2>
        ${sectorEn.faqs
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
        <a href="/register" class="home-btn-primary">Register Your Business Now &rarr;</a>
      </div>
    </main>
  `;

  writeStaticRoute(`solutions/${sectorEn.slug}`, {
    title: sectorEn.metaTitle,
    description: sectorEn.metaDescription,
    canonicalUrl: sectorEn.canonicalUrl,
    alternateLanguages,
    jsonLd,
    contentHtml,
  });
});

// =============================================================================
// 4. GENERATE /tools/:tool/index.html (Bilingual & Hreflang Enabled)
// =============================================================================
Object.values(SEO_TOOLS_EN).forEach((toolEn) => {
  const alternateLanguages = [
    { lang: 'x-default', url: toolEn.canonicalUrl },
    { lang: 'en', url: toolEn.canonicalUrl },
    { lang: 'tr', url: toolEn.canonicalUrl },
  ];

  const jsonLd: any[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.naponi.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.naponi.com/tools/tip-calculator' },
        { '@type': 'ListItem', position: 3, name: toolEn.name, item: toolEn.canonicalUrl },
      ],
    },
    {
      '@type': 'WebApplication',
      name: toolEn.name,
      url: toolEn.canonicalUrl,
      description: toolEn.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
    },
  ];

  const contentHtml = `
    <main class="blog-container" style="padding-top: 5rem; padding-bottom: 5rem;">
      <nav aria-label="Breadcrumb">
        <a href="/">Home</a> &gt; <a href="/tools/tip-calculator">Tools</a> &gt; <span>${toolEn.name}</span>
      </nav>
      <header style="text-align: center; margin: 2rem 0 3rem;">
        <span class="home-section-tag">${toolEn.badge}</span>
        <h1 class="home-section-title">${toolEn.title}</h1>
        <p class="home-section-desc">${toolEn.description}</p>
      </header>
      <div style="text-align: center; margin: 3rem 0;">
        <p>Interactive tool loading... Please enable JavaScript in your browser for live calculations.</p>
        <a href="/register" class="home-btn-primary">Get QR Tip Box for Your Business &rarr;</a>
      </div>
    </main>
  `;

  writeStaticRoute(`tools/${toolEn.slug}`, {
    title: toolEn.metaTitle,
    description: toolEn.metaDescription,
    canonicalUrl: toolEn.canonicalUrl,
    alternateLanguages,
    jsonLd,
    contentHtml,
  });
});

// =============================================================================
// 5. DYNAMIC SITEMAP GENERATION WITH COMPLETE GLOBAL HREFLANG
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
    <priority>${isPillar ? '0.95' : '0.85'}</priority>${xhtmlLinks}
  </url>`;
  }).join('\n');

  const sectorUrls = Object.values(SECTOR_SOLUTIONS_EN).map(
    (sector) => `  <url>
    <loc>${sector.canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${sector.canonicalUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${sector.canonicalUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${sector.canonicalUrl}" />
  </url>`
  ).join('\n');

  const toolUrls = Object.values(SEO_TOOLS_EN).map(
    (tool) => `  <url>
    <loc>${tool.canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="x-default" href="${tool.canonicalUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${tool.canonicalUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${tool.canonicalUrl}" />
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
    <xhtml:link rel="alternate" hreflang="en" href="https://www.naponi.com/blog" />
    <xhtml:link rel="alternate" hreflang="tr" href="https://www.naponi.com/blog" />
  </url>

  <!-- 3. Dynamic Blog Articles (${BLOG_POSTS.length} posts) -->
${blogUrls}

  <!-- 4. Global Sector Solutions (${Object.keys(SECTOR_SOLUTIONS_EN).length} sectors) -->
${sectorUrls}

  <!-- 5. Free Interactive SEO Tools (${Object.keys(SEO_TOOLS_EN).length} tools) -->
${toolUrls}

  <!-- 6. Business Registration & Authentication -->
  <url>
    <loc>https://www.naponi.com/register</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
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
  console.log(`[SEO-GEN] Generated dynamic sitemap with ${BLOG_POSTS.length} blog posts, ${Object.keys(SECTOR_SOLUTIONS_EN).length} sectors, and ${Object.keys(SEO_TOOLS_EN).length} tools in dist/ and public/`);
}

generateDynamicSitemap();

console.log('[SEO-GEN] ✅ Complete multilingual pre-rendering and dynamic sitemap generation completed successfully!');
