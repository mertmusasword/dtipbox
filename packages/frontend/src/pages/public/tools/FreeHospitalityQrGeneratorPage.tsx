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
  Palette,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../../../content/tools/tools';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

const COLOR_PRESETS = [
  { name: 'Dark Slate (Default)', fg: '#0A0D14', bg: '#FFFFFF' },
  { name: 'Emerald Luxe', fg: '#059669', bg: '#F0FDF4' },
  { name: 'Gold & Black', fg: '#D97706', bg: '#FFFBEB' },
  { name: 'Midnight Blue', fg: '#1E3A8A', bg: '#EFF6FF' },
  { name: 'Pure Monochrome', fg: '#000000', bg: '#FFFFFF' },
];

export const FreeHospitalityQrGeneratorPage: React.FC = () => {
  const { language } = useLanguage();
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
    canvas.height = size + 240; // extra space for table number and frame text
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render QR Code onto an offscreen canvas first
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

            // Draw white background circle behind logo
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.arc(size / 2, 100 + (size - 120) / 2, logoSize / 2 + 10, 0, Math.PI * 2);
            ctx.fill();

            // Draw logo image
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

            // Draw Bottom CTA banner
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
      ctx.beginPath();
      // Rounded pill or text banner
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
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `table_qr_${tableLabel.replace(/\s+/g, '_').toLowerCase() || 'stand'}.png`;
    link.href = url;
    link.click();
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
        tr: 'Bu araçla ürettiğiniz statik QR tek bir adrese yönlendirir. Naponi’nin işletme paketindeki Dinamik QR kodlar ise masaya ve vardiyadaki personele göre otomatik değişir, 35+ dilde çeviri yapar ve bahşiş veren misafirleri Google Haritalar 5 yıldız yorumuna yönlendirir.',
        en: 'Static QR codes point to a single fixed URL. Naponi Dynamic QR codes automatically detect tourist languages (35+), route gratuities to the exact server on shift, and trigger verified Google Reviews after payment.'
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
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      <SeoHead
        title={meta.metaTitle}
        description={meta.metaDescription}
        canonicalUrl={meta.canonicalUrl}
        keywords={meta.secondaryKeywords}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0D14]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Naponi
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link to="/guides" className="hover:text-white transition-colors">
              {isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}
            </Link>
            <Link to="/tools/restaurant-tip-pool-calculator" className="hover:text-white transition-colors">
              {isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}
            </Link>
            <Link to="/tools/free-hospitality-qr-generator" className="text-emerald-400 font-semibold transition-colors">
              {isEn ? 'QR Generator' : 'QR Üretici'}
            </Link>
            <Link to="/compare/card-machine-vs-qr-tipping" className="hover:text-white transition-colors">
              {isEn ? 'Compare' : 'Karşılaştırma'}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>{isEn ? 'Get Started' : 'Hemen Başla'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-slate-300 transition-colors">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span className="hover:text-slate-300">{isEn ? 'Tools' : 'Araçlar'}</span>
          <span>/</span>
          <span className="text-emerald-400 font-medium">{isEn ? 'Hospitality QR Generator' : 'QR Kod Oluşturucu'}</span>
        </nav>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <QrIcon className="w-3.5 h-3.5" />
            <span>{meta.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            {meta.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {meta.description}
          </p>
        </div>

        {/* Workspace: 2 Columns (Controls vs Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          {/* Controls Form */}
          <div className="lg:col-span-7 bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {isEn ? 'Destination URL or Menu Link' : 'Yönlendirilecek Web Adresi / Menü Linki'}
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourrestaurant.com/menu"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {isEn ? 'Top Table Label' : 'Üst Masa Başlığı'}
                </label>
                <input
                  type="text"
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  placeholder={isEn ? 'TABLE 12' : 'MASA 12'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {isEn ? 'Bottom Frame Call-to-Action' : 'Alt Çerçeve Çağrı Metni'}
                </label>
                <input
                  type="text"
                  value={frameText}
                  onChange={(e) => setFrameText(e.target.value)}
                  placeholder={isEn ? 'SCAN TO TIP' : 'BAHŞİŞ İÇİN OKUTUN'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Color Scheme Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {isEn ? 'Color Theme Presets' : 'Renk Teması'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      fgColor === preset.fg && bgColor === preset.bg
                        ? 'border-emerald-500 bg-white/10 text-white'
                        : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.fg }} />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Logo Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {isEn ? 'Center Logo (Optional)' : 'Ortaya Logo Ekle (İsteğe Bağlı)'}
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Upload PNG / JPG Logo' : 'Logo Dosyası Yükle'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    {isEn ? 'Remove Logo' : 'Logoyu Kaldır'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live High-Res Canvas & Download */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/20 max-w-[340px] w-full text-center">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-xl shadow-sm"
              />
            </div>

            {/* Download & Print Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-[340px]">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>{isEn ? 'Download Print PNG' : 'Baskı PNG İndir'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-sm font-semibold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{isEn ? 'Print' : 'Yazdır'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              {isEn ? 'High-resolution (1000px, 300 DPI) print ready.' : 'Yüksek çözünürlüklü (1000px, 300 DPI) baskıya hazır.'}
            </p>
          </div>
        </div>

        {/* Pitch for Dynamic Naponi Touchpoints */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 rounded-3xl p-8 sm:p-12 border border-emerald-500/20 mb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'Need physical acrylic stands or lapel pins?' : 'Fiziksel akrilik stant veya yaka rozeti mi arıyorsunuz?'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
              {isEn ? 'Upgrade to Naponi Smart NFC & Dynamic QR Suite' : 'Naponi Akıllı NFC & Dinamik QR Paketine Geçin'}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              {isEn
                ? 'Free QR codes are great for menus, but Naponi gives you smart dynamic QR stands that boost server earnings by 35%, translate into 35+ tourist languages automatically, and direct happy tippers straight to 5-star Google Reviews.'
                : 'Ücretsiz QR kodlar statik menüler için harikadır; ancak Naponi’nin akıllı masa stantları yabancı turistleri 35+ dilde karşılar, garson bahşişini %35 artırır ve müşterileri Google Harita yorumuna yönlendirerek mekanınızı öne çıkarır.'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>{isEn ? 'Discover Naponi Touchpoints' : 'Naponi Stantlarını İnceleyin'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isEn ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-base text-white">
                    {isEn ? faq.q.en : faq.q.tr}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {isEn ? faq.a.en : faq.a.tr}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p className="mb-2">© 2026 Naponi. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-slate-400">
            <Link to="/guides" className="hover:text-white transition-colors">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link>
            <Link to="/tools/restaurant-tip-pool-calculator" className="hover:text-white transition-colors">{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link>
            <Link to="/tools/free-hospitality-qr-generator" className="hover:text-white transition-colors">{isEn ? 'QR Generator' : 'QR Üretici'}</Link>
            <Link to="/compare/card-machine-vs-qr-tipping" className="hover:text-white transition-colors">{isEn ? 'POS vs QR' : 'POS vs QR'}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
