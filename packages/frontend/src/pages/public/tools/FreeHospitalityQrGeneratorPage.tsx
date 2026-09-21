import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  QrCode as QrIcon,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../../../content/tools/tools';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';
import '../../../styles/blog.css';
import '../../../styles/seo-features.css';

const COLOR_PRESETS = [
  { name: 'Dark Slate', fg: '#0A0D14', bg: '#FFFFFF' },
  { name: 'Emerald Luxe', fg: '#059669', bg: '#F0FDF4' },
  { name: 'Amber Gold', fg: '#D97706', bg: '#FFFBEB' },
  { name: 'Midnight Blue', fg: '#1E3A8A', bg: '#EFF6FF' },
  { name: 'Monochrome', fg: '#000000', bg: '#FFFFFF' },
];

export const FreeHospitalityQrGeneratorPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isEn = language !== 'tr';
  const meta = isEn ? SEO_TOOLS_EN['free-hospitality-qr-generator'] : SEO_TOOLS['free-hospitality-qr-generator'];

  // Generator inputs
  const [targetUrl, setTargetUrl] = useState<string>('https://naponi.com/demo');
  const [tableLabel, setTableLabel] = useState<string>(isEn ? 'TABLE 04' : 'MASA 04');
  const [frameText, setFrameText] = useState<string>(isEn ? 'SCAN TO TIP & REVIEW' : 'BAHŞİŞ & YORUM İÇİN OKUTUN');
  const [fgColor, setFgColor] = useState<string>('#0A0D14');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw QR code on canvas whenever inputs change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 1000;
    canvas.width = size;
    canvas.height = size + 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render QR Code onto an offscreen canvas
    const offscreen = document.createElement('canvas');
    QRCode.toCanvas(
      offscreen,
      targetUrl || 'https://naponi.com',
      {
        width: size - 120,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      },
      (err) => {
        if (err) console.error(err);

        // Draw top frame / table badge
        ctx.fillStyle = fgColor;
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        if (tableLabel) {
          ctx.fillText(tableLabel.toUpperCase(), size / 2, 70);
        }

        // Draw QR
        ctx.drawImage(offscreen, 60, 100);

        // Draw optional Logo in center
        if (logoDataUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const logoSize = 160;
            const logoX = (size - logoSize) / 2;
            const logoY = 100 + (size - 120 - logoSize) / 2;

            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(size / 2, 100 + (size - 120) / 2, logoSize / 2 + 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

            drawBottomBanner(ctx, size);
          };
          img.onerror = () => {
            drawBottomBanner(ctx, size);
          };
          img.src = logoDataUrl;
        } else {
          drawBottomBanner(ctx, size);
        }
      }
    );
  }, [targetUrl, tableLabel, frameText, fgColor, bgColor, logoDataUrl]);

  const drawBottomBanner = (ctx: CanvasRenderingContext2D, size: number) => {
    if (frameText) {
      ctx.fillStyle = fgColor;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frameText.toUpperCase(), size / 2, size + 140);

      ctx.font = '500 24px sans-serif';
      ctx.fillStyle = fgColor + '99';
      ctx.fillText('POWERED BY NAPONI', size / 2, size + 190);
    }
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const safeName = (tableLabel || 'stand')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const fileName = `table_qr_${safeName || 'stand'}.png`;

    const triggerDownload = (uri: string, isBlob = false) => {
      const link = document.createElement('a');
      link.download = fileName;
      link.href = uri;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        if (isBlob) {
          URL.revokeObjectURL(uri);
        }
      }, 1000);
    };

    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            triggerDownload(blobUrl, true);
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            triggerDownload(dataUrl, false);
          }
        }, 'image/png');
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, false);
      }
    } catch (err) {
      console.error('Blob download failed, trying dataUrl fallback', err);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, false);
      } catch (fallbackErr) {
        console.error('Download fallback failed:', fallbackErr);
      }
    }
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const title = `${tableLabel ? tableLabel.toUpperCase() : 'Naponi QR Stand'}`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 15mm;
                }
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  background: #f8fafc;
                  padding: 20px;
                }
                .stand-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  background: #fff;
                  padding: 20px;
                  border-radius: 16px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                  max-width: 440px;
                  width: 100%;
                  border: 1px solid #e2e8f0;
                }
                img.qr-image {
                  width: 100%;
                  height: auto;
                  display: block;
                  border-radius: 10px;
                }
                .cut-line {
                  margin-top: 16px;
                  padding-top: 10px;
                  border-top: 2px dashed #94a3b8;
                  font-size: 11px;
                  font-weight: 700;
                  color: #64748b;
                  letter-spacing: 0.5px;
                  text-align: center;
                  width: 100%;
                  text-transform: uppercase;
                }
                @media print {
                  body {
                    background: #fff;
                    padding: 0;
                    min-height: auto;
                  }
                  .stand-container {
                    box-shadow: none;
                    border: none;
                    padding: 0;
                    max-width: 90mm;
                    margin: 0 auto;
                  }
                  img.qr-image {
                    max-height: 85vh;
                    width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="stand-container">
                <img class="qr-image" src="${dataUrl}" alt="${title}" />
                <div class="cut-line">✂ ${isEn ? 'Cut along line for acrylic stand or table tent' : 'Masa standı veya akrilik pleksi için kesim çizgisi'}</div>
              </div>
              <script>
                window.onload = function() {
                  window.focus();
                  window.print();
                  setTimeout(function() { window.close(); }, 800);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // If popup was blocked by browser, trigger in-page print targeting only the card
        window.print();
      }
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const faqs = [
    {
      q: {
        tr: 'Bu QR kodlar kalıcı ve sınırsız mıdır?',
        en: 'Are these QR codes permanent and unlimited?'
      },
      a: {
        tr: 'Evet! Bu araçla ürettiğiniz QR kodlar statik ve tamamen ücretsizdir. İstediğiniz kadar çıktı alabilir, menü ve masalarınızda ömür boyu kullanabilirsiniz.',
        en: 'Yes! Static QR codes created here never expire and can be printed on restaurant menus, table cards, or bar coasters permanently.'
      }
    },
    {
      q: {
        tr: 'Statik QR ile Naponi Dinamik QR kodu arasındaki fark nedir?',
        en: 'What is the difference between this static QR and Naponi Dynamic QR?'
      },
      a: {
        tr: 'Bu araçla ürettiğiniz statik QR tek bir adrese yönlendirir. Naponi’nin işletme paketindeki Dinamik QR kodlar ise masaya ve vardiyadaki personele göre otomatik değişir, 11 dilde otomatik çeviri yapar ve bahşiş veren misafirleri Google Haritalar 5 yıldız yorumuna yönlendirir.',
        en: 'Static QR codes point to a single fixed URL. Naponi Dynamic QR codes automatically detect tourist languages (11 languages), route gratuities to the exact server on shift, and trigger verified Google Reviews after payment.'
      }
    },
    {
      q: {
        tr: 'En iyi baskı kalitesi için nasıl çıktı almalıyım?',
        en: 'What is the recommended print resolution for restaurant tables?'
      },
      a: {
        tr: 'İndirilen PNG dosyası 1000x1240 piksel yüksek çözünürlüktedir. Akrilik masa stantları veya PVC etiketler için 300 DPI kalitede net ve pürüzsüz basılır.',
        en: 'The generated file exports at 1000x1240px high-resolution. It renders crisply at 300 DPI for acrylic table stands, wooden blocks, and bar stickers.'
      }
    }
  ];

  return (
    <div className="home-wrapper">
      <SeoHead
        title={meta.metaTitle}
        description={meta.metaDescription}
        canonicalUrl={meta.canonicalUrl}
        keywords={meta.secondaryKeywords}
      />

      {/* Header */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Tool Navigation">
          <Link to="/" className="home-nav-brand">
            <img src="/naponi-brand.svg" alt="Naponi" className="home-brand-logo-img" />
          </Link>

          <ul className="home-nav-links-seo">
            <li><Link to="/guides">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link></li>
            <li><Link to="/tools/restaurant-tip-pool-calculator">{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link></li>
            <li><Link to="/tools/free-hospitality-qr-generator" className="active">{isEn ? 'QR Generator' : 'QR Üretici'}</Link></li>
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

      {/* Main Container */}
      <main className="seo-page-wrapper">
        <div className="home-container">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
            <span>/</span>
            <span style={{ color: '#94a3b8' }}>{isEn ? 'Tools' : 'Araçlar'}</span>
            <span>/</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{isEn ? 'QR Generator' : 'QR Üretici'}</span>
          </nav>

          {/* Hero */}
          <div className="seo-hero-card" style={{ textAlign: 'center' }}>
            <div className="seo-hero-glow" />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
              <div className="seo-badge-row" style={{ justifyContent: 'center' }}>
                <span className="seo-pill seo-pill-emerald">
                  <QrIcon size={14} />
                  <span>{meta.badge}</span>
                </span>
              </div>
              <h1 className="seo-page-title">{meta.title}</h1>
              <p className="seo-page-desc" style={{ margin: '0 auto' }}>{meta.description}</p>
            </div>
          </div>

          {/* Workspace: 2 Column Grid */}
          <div className="seo-2col-layout">
            {/* Left Column: Form Controls */}
            <div className="seo-workspace-card" style={{ margin: 0 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="seo-calc-input-label">{isEn ? 'Destination URL or Menu Link' : 'Yönlendirilecek Web Adresi / Menü Linki'}</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://yourrestaurant.com/menu"
                  className="seo-calc-input"
                  style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="seo-calc-input-label">{isEn ? 'Top Table Label' : 'Üst Masa Başlığı'}</label>
                  <input
                    type="text"
                    value={tableLabel}
                    onChange={(e) => setTableLabel(e.target.value)}
                    placeholder={isEn ? 'TABLE 12' : 'MASA 12'}
                    className="seo-calc-input"
                    style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
                  />
                </div>
                <div>
                  <label className="seo-calc-input-label">{isEn ? 'Bottom Frame Text' : 'Alt Çerçeve Çağrı Metni'}</label>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(e) => setFrameText(e.target.value)}
                    placeholder={isEn ? 'SCAN TO TIP' : 'BAHŞİŞ İÇİN OKUTUN'}
                    className="seo-calc-input"
                    style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="seo-calc-input-label">{isEn ? 'Color Theme Presets' : 'Renk Teması'}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setFgColor(preset.fg);
                        setBgColor(preset.bg);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: fgColor === preset.fg && bgColor === preset.bg ? '#10b981' : 'rgba(255,255,255,0.08)',
                        background: fgColor === preset.fg && bgColor === preset.bg ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                        color: '#cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: preset.fg, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="seo-calc-input-label">{isEn ? 'Center Logo (Optional)' : 'Ortaya Logo Ekle (İsteğe Bağlı)'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="home-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.65rem 1.25rem' }}>
                    <Upload size={16} color="#10b981" />
                    <span>{isEn ? 'Upload PNG Logo' : 'Logo Seç'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoDataUrl(null)}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {isEn ? 'Remove Logo' : 'Logoyu Kaldır'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live High-Res Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <style>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-qr-stand, #printable-qr-stand * {
                    visibility: visible !important;
                  }
                  #printable-qr-stand {
                    position: fixed !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    box-shadow: none !important;
                    border: 1px dashed #94a3b8 !important;
                    max-width: 90mm !important;
                    width: 100% !important;
                    padding: 12px !important;
                    background: #fff !important;
                  }
                }
              `}</style>
              <div id="printable-qr-stand" style={{ background: '#fff', padding: '1.25rem', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxWidth: 360, width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
                />
              </div>

              {/* Download & Print Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', width: '100%', maxWidth: 360 }}>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="home-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} />
                  <span>{isEn ? 'Download PNG' : 'PNG İndir'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="home-btn-secondary"
                  style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                >
                  <Printer size={16} />
                  <span>{isEn ? 'Print Stand' : 'Stant Yazdır'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem', textAlign: 'center' }}>
                {isEn ? 'High-resolution 1000px 300 DPI print ready.' : 'Yüksek çözünürlüklü 1000px 300 DPI baskıya hazır.'}
              </p>
            </div>
          </div>

          {/* Upsell to Smart Touchpoints */}
          <div className="seo-verdict-card" style={{ flexDirection: 'column', marginTop: '2rem', marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Sparkles size={24} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                {isEn ? 'Upgrade to Naponi Smart & Dynamic QR Suite' : 'Naponi Akıllı & Dinamik QR Sistemine Geçin'}
              </h3>
            </div>
            <p style={{ marginBottom: '1.5rem' }}>
              {isEn
                ? 'Free static QR codes are great for basic links, but Naponi gives you smart dynamic QR codes that translate into 11 tourist languages automatically, boost direct server tips, and route happy guests straight to 5-star Google Reviews.'
                : 'Ücretsiz statik QR kodlar basit yönlendirmeler için uygundur; ancak Naponi’nin dinamik QR sistemi yabancı turistleri 11 dilde otomatik karşılar, personelinize doğrudan dijital bahşiş kazandırır ve memnun misafirleri anında Google Haritalar 5 yıldızlı yorumuna yönlendirir.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="home-btn-primary">
                {isEn ? 'Get Started Free' : 'Hemen Ücretsiz Başlayın'} <ArrowRight size={16} />
              </Link>
              <Link to="/catalog" className="home-btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
                {isEn ? 'Browse Product Catalog' : 'Ürün Kataloğunu İnceleyin'}
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <div className="seo-faq-wrap">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                {isEn ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}
              </h2>
            </div>

            {faqs.map((faq, idx) => (
              <div key={idx} className="seo-faq-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="seo-faq-btn"
                >
                  <span className="seo-faq-question">
                    {isEn ? faq.q.en : faq.q.tr}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp size={18} color="#10b981" />
                  ) : (
                    <ChevronDown size={18} color="#94a3b8" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="seo-faq-body">
                    {isEn ? faq.a.en : faq.a.tr}
                  </div>
                )}
              </div>
            ))}
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
