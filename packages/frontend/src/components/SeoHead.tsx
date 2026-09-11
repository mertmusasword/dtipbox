import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  keywords?: string[];
  breadcrumbs?: BreadcrumbItem[];
  faqSchema?: { question: string; answer: string }[];
  alternateLanguages?: { lang: string; url: string }[];
  noindex?: boolean;
}

function updateOrCreateMeta(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateOrCreateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://www.naponi.com/logo.png',
  publishedTime,
  modifiedTime,
  authorName,
  keywords,
  breadcrumbs,
  faqSchema,
  alternateLanguages,
  noindex = false,
}) => {
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // 2. Meta Description & Keywords
    updateOrCreateMeta('description', description);
    if (keywords && keywords.length > 0) {
      updateOrCreateMeta('keywords', keywords.join(', '));
    }

    // 3. Robots
    updateOrCreateMeta('robots', noindex ? 'noindex, follow' : 'index, follow');

    // 4. Canonical URL
    updateOrCreateCanonical(canonicalUrl);

    // 4B. Alternate Hreflang Tags
    if (alternateLanguages && alternateLanguages.length > 0) {
      alternateLanguages.forEach(({ lang, url }) => {
        let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`) as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'alternate');
          link.setAttribute('hreflang', lang);
          document.head.appendChild(link);
        }
        link.setAttribute('href', url);
      });
    }

    // 5. Open Graph Meta Tags
    updateOrCreateMeta('og:title', title, true);
    updateOrCreateMeta('og:description', description, true);
    updateOrCreateMeta('og:url', canonicalUrl, true);
    updateOrCreateMeta('og:type', ogType, true);
    updateOrCreateMeta('og:image', ogImage, true);
    updateOrCreateMeta('og:site_name', 'Naponi', true);

    if (publishedTime) {
      updateOrCreateMeta('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      updateOrCreateMeta('article:modified_time', modifiedTime, true);
    }
    if (authorName) {
      updateOrCreateMeta('article:author', authorName, true);
    }

    // 6. Twitter Cards
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', title);
    updateOrCreateMeta('twitter:description', description);
    updateOrCreateMeta('twitter:image', ogImage);

    // 7. Structured Data (JSON-LD)
    const jsonLdGraph: any[] = [];

    // Breadcrumbs Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      jsonLdGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.url,
        })),
      });
    }

    // Article / BlogPosting Schema
    if (ogType === 'article') {
      jsonLdGraph.push({
        '@type': 'BlogPosting',
        headline: title,
        description: description,
        image: ogImage,
        url: canonicalUrl,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        author: {
          '@type': 'Organization',
          name: authorName || 'Naponi Editorial Team',
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
          '@id': canonicalUrl,
        },
      });
    }

    // FAQPage Schema (only if visible FAQs exist)
    if (faqSchema && faqSchema.length > 0) {
      jsonLdGraph.push({
        '@type': 'FAQPage',
        mainEntity: faqSchema.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    // Inject Script Element
    let scriptTag = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
    if (jsonLdGraph.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-seo-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': jsonLdGraph,
      });
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      const tag = document.getElementById('dynamic-seo-jsonld');
      if (tag) tag.remove();
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogType,
    ogImage,
    publishedTime,
    modifiedTime,
    authorName,
    keywords,
    breadcrumbs,
    faqSchema,
    alternateLanguages,
    noindex,
  ]);

  return null;
};
