import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Share2, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Users, 
  Globe, 
  Coffee, 
  Utensils, 
  Hotel, 
  Wine, 
  CreditCard, 
  Clock, 
  Lock, 
  QrCode as QrIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage, LanguageSelector } from '../../i18n';
import { getCatalogContent } from '../../content/catalog/catalog-data';
import '../../styles/catalog.css';

export const NaponiCatalogPage: React.FC = () => {
  const { language } = useLanguage();
  const c = getCatalogContent(language);
  const [demoQrUrl, setDemoQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Dynamically adjust page title for default PDF filename on print
    const isTr = language === 'tr';
    const originalTitle = document.title;
    document.title = isTr 
      ? 'Naponi-Kurumsal-Urun-Katalogu-2026-TR' 
      : 'Naponi-Corporate-Product-Catalog-2026-EN';

    return () => {
      document.title = originalTitle;
    };
  }, [language]);

  useEffect(() => {
    // Generate live interactive demo QR for Slide 10
    const liveDemoUrl = `${window.location.origin}/tools/free-hospitality-qr-generator`;
    QRCode.toDataURL(liveDemoUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setDemoQrUrl(url))
      .catch((err) => console.error('Catalog demo QR error:', err));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="catalog-wrapper">
      {/* Floating Action Toolbar */}
      <nav className="catalog-toolbar">
        <div className="catalog-toolbar-left">
          <Link to="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} />
            <span>{c.toolbar.homeBtn}</span>
          </Link>
          <div className="catalog-toolbar-title">
            <span>{c.toolbar.catalogTitle}</span>
            <span className="catalog-toolbar-badge">{c.toolbar.catalogBadge}</span>
          </div>
        </div>

        <div className="catalog-toolbar-actions">
          {/* In-catalog Language Selector */}
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <LanguageSelector variant="compact" direction="down" />
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={handleShare}>
            {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            <span>{copied ? c.toolbar.copiedBtn : c.toolbar.shareBtn}</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>{c.toolbar.printBtn}</span>
          </button>
        </div>
      </nav>

      <main className="catalog-container">

        {/* ==================================================================
            SLIDE 1: KAPAK (COVER)
            ================================================================== */}
        <section className="catalog-slide cat-cover-slide" id="slide-1">
          <div className="cat-glow-top-right"></div>
          <div className="cat-glow-bottom-left"></div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <img src="/naponi-brand.svg" alt="NAPONI" style={{ height: '48px', width: 'auto' }} />
              <div className="cat-cover-badge">
                <Sparkles size={14} />
                <span>{c.slide1.coverBadge}</span>
              </div>
            </div>

            <div style={{ maxWidth: '850px' }}>
              <h1 className="cat-cover-title">
                {c.slide1.title1} <br />
                <span className="cat-gradient-text">{c.slide1.titleHighlight}</span>
              </h1>
              <p className="cat-cover-desc">
                {c.slide1.desc}
              </p>
            </div>
          </div>

          <div>
            <div className="cat-cover-pills">
              <div className="cat-pill">
                <ShieldCheck size={16} color="#34d399" />
                <span>{c.slide1.pills.nonCustodial}</span>
              </div>
              <div className="cat-pill">
                <Zap size={16} color="#38bdf8" />
                <span>{c.slide1.pills.zeroHardware}</span>
              </div>
              <div className="cat-pill">
                <Smartphone size={16} color="#f59e0b" />
                <span>{c.slide1.pills.instantPayment}</span>
              </div>
              <div className="cat-pill">
                <Globe size={16} color="#a78bfa" />
                <span>{c.slide1.pills.globalTourism}</span>
              </div>
            </div>

            <div className="cat-slide-footer" style={{ marginTop: '2rem', borderTopColor: 'rgba(255,255,255,0.08)' }}>
              <span>{c.slide1.confidential}</span>
              <span>{c.slide1.pageLabel}</span>
            </div>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 2: SEKTÖRDEKİ SESSİZ KRİZ (PROBLEM)
            ================================================================== */}
        <section className="catalog-slide" id="slide-2">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide2.tag}</span>
              <h2 className="cat-slide-title">{c.slide2.title}</h2>
              <p className="cat-slide-subtitle">{c.slide2.subtitle}</p>
            </div>
            <span className="cat-slide-number">02 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-2">
              <div className="cat-compare-box bad">
                <div className="cat-compare-header" style={{ color: '#f43f5e' }}>
                  <span>{c.slide2.painPointsHeader}</span>
                  <span>⚠️</span>
                </div>
                <ul className="cat-compare-list">
                  {c.slide2.painPoints.map((point, idx) => (
                    <li key={idx} className="cat-compare-item">
                      <span style={{ color: '#e2e8f0', lineHeight: 1.5 }}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cat-compare-box good">
                <div className="cat-compare-header" style={{ color: '#34d399' }}>
                  <span>{c.slide2.statsHeader}</span>
                  <span>📉</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f43f5e' }}>{c.slide2.stat1Val}</div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{c.slide2.stat1Desc}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{c.slide2.stat2Val}</div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{c.slide2.stat2Desc}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide2.footer}</span>
            <span>{c.slide2.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 3: NAPONI DENEYİMİ (ÇÖZÜM)
            ================================================================== */}
        <section className="catalog-slide" id="slide-3">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide3.tag}</span>
              <h2 className="cat-slide-title">{c.slide3.title}</h2>
              <p className="cat-slide-subtitle">{c.slide3.subtitle}</p>
            </div>
            <span className="cat-slide-number">03 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-step-row">
              <div className="cat-step-card">
                <div className="cat-step-number">01</div>
                <div className="cat-card-icon">
                  <Smartphone size={22} />
                </div>
                <div className="cat-card-title">{c.slide3.step1Title}</div>
                <div className="cat-card-desc">
                  {c.slide3.step1Desc}
                </div>
              </div>

              <div className="cat-step-card">
                <div className="cat-step-number">02</div>
                <div className="cat-card-icon blue">
                  <Users size={22} />
                </div>
                <div className="cat-card-title">{c.slide3.step2Title}</div>
                <div className="cat-card-desc">
                  {c.slide3.step2Desc}
                </div>
              </div>

              <div className="cat-step-card">
                <div className="cat-step-number">03</div>
                <div className="cat-card-icon amber">
                  <Zap size={22} />
                </div>
                <div className="cat-card-title">{c.slide3.step3Title}</div>
                <div className="cat-card-desc">
                  {c.slide3.step3Desc}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Check size={20} color="#34d399" />
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>
                  {c.slide3.resultBanner}
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 800 }}>{c.slide3.resultTime}</span>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide3.footer}</span>
            <span>{c.slide3.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 4: FİZİKSEL DOKUNUŞLAR & MASA STANDLARI
            ================================================================== */}
        <section className="catalog-slide" id="slide-4">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide4.tag}</span>
              <h2 className="cat-slide-title">{c.slide4.title}</h2>
              <p className="cat-slide-subtitle">{c.slide4.subtitle}</p>
            </div>
            <span className="cat-slide-number">04 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-3">
              <div className="cat-feature-card">
                <div style={{ background: '#0b111e', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '48px', height: '64px', margin: '0 auto 0.5rem', background: 'rgba(255,255,255,0.06)', border: '2px solid #34d399', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrIcon size={28} color="#34d399" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{c.slide4.card1Tag}</span>
                </div>
                <div className="cat-card-title">{c.slide4.card1Title}</div>
                <div className="cat-card-desc">
                  {c.slide4.card1Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div style={{ background: '#0b111e', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '80px', height: '48px', margin: '0 auto 0.5rem', background: 'rgba(255,255,255,0.06)', border: '2px solid #38bdf8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrIcon size={24} color="#38bdf8" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{c.slide4.card2Tag}</span>
                </div>
                <div className="cat-card-title">{c.slide4.card2Title}</div>
                <div className="cat-card-desc">
                  {c.slide4.card2Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div style={{ background: '#0b111e', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '56px', height: '64px', margin: '0 auto 0.5rem', background: 'rgba(255,255,255,0.06)', border: '2px solid #f59e0b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrIcon size={28} color="#f59e0b" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{c.slide4.card3Tag}</span>
                </div>
                <div className="cat-card-title">{c.slide4.card3Title}</div>
                <div className="cat-card-desc">
                  {c.slide4.card3Desc}
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide4.footer}</span>
            <span>{c.slide4.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 5: İŞLETME & YÖNETİCİ PANELİ (OPERASYONEL GÜÇ)
            ================================================================== */}
        <section className="catalog-slide" id="slide-5">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide5.tag}</span>
              <h2 className="cat-slide-title">{c.slide5.title}</h2>
              <p className="cat-slide-subtitle">{c.slide5.subtitle}</p>
            </div>
            <span className="cat-slide-number">05 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-mockup-window">
              <div className="cat-mockup-topbar">
                <span className="cat-dot r"></span>
                <span className="cat-dot y"></span>
                <span className="cat-dot g"></span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 600 }}>
                  {c.slide5.mockupUrl}
                </span>
              </div>

              <div className="cat-mockup-body">
                <div className="cat-kpi-row">
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#34d399' }}>{c.slide5.kpi1Val}</div>
                    <div className="cat-kpi-label">{c.slide5.kpi1Label}</div>
                  </div>
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#38bdf8' }}>{c.slide5.kpi2Val}</div>
                    <div className="cat-kpi-label">{c.slide5.kpi2Label}</div>
                  </div>
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#f59e0b' }}>{c.slide5.kpi3Val}</div>
                    <div className="cat-kpi-label">{c.slide5.kpi3Label}</div>
                  </div>
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#a78bfa' }}>{c.slide5.kpi4Val}</div>
                    <div className="cat-kpi-label">{c.slide5.kpi4Label}</div>
                  </div>
                </div>

                <div className="cat-grid-2" style={{ gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <Clock size={13} color="#38bdf8" /> {c.slide5.box1Title}
                    </strong>
                    <div style={{ color: '#94a3b8', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {c.slide5.box1Desc}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <Coins size={13} color="#34d399" /> {c.slide5.box2Title}
                    </strong>
                    <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
                      {c.slide5.box2Desc}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide5.footer}</span>
            <span>{c.slide5.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 6: SEKTOREL ÇÖZÜMLER
            ================================================================== */}
        <section className="catalog-slide" id="slide-6">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide6.tag}</span>
              <h2 className="cat-slide-title">{c.slide6.title}</h2>
              <p className="cat-slide-subtitle">{c.slide6.subtitle}</p>
            </div>
            <span className="cat-slide-number">06 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-4">
              <div className="cat-feature-card">
                <div className="cat-card-icon">
                  <Utensils size={20} />
                </div>
                <div className="cat-card-title">{c.slide6.sec1Title}</div>
                <div className="cat-card-desc">
                  {c.slide6.sec1Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon blue">
                  <Coffee size={20} />
                </div>
                <div className="cat-card-title">{c.slide6.sec2Title}</div>
                <div className="cat-card-desc">
                  {c.slide6.sec2Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon amber">
                  <Hotel size={20} />
                </div>
                <div className="cat-card-title">{c.slide6.sec3Title}</div>
                <div className="cat-card-desc">
                  {c.slide6.sec3Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon red">
                  <Wine size={20} />
                </div>
                <div className="cat-card-title">{c.slide6.sec4Title}</div>
                <div className="cat-card-desc">
                  {c.slide6.sec4Desc}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{c.slide6.extraTitle}</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{c.slide6.extraDesc}</span>
              </div>
              <span className="catalog-toolbar-badge">{c.slide6.extraBadge}</span>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide6.footer}</span>
            <span>{c.slide6.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 7: FİNANSAL MİMARİ & GÜVENLİK
            ================================================================== */}
        <section className="catalog-slide" id="slide-7">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide7.tag}</span>
              <h2 className="cat-slide-title">{c.slide7.title}</h2>
              <p className="cat-slide-subtitle">{c.slide7.subtitle}</p>
            </div>
            <span className="cat-slide-number">07 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-3">
              <div className="cat-feature-card">
                <div className="cat-card-icon">
                  <ShieldCheck size={22} />
                </div>
                <div className="cat-card-title">{c.slide7.feat1Title}</div>
                <div className="cat-card-desc">
                  {c.slide7.feat1Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon blue">
                  <Lock size={22} />
                </div>
                <div className="cat-card-title">{c.slide7.feat2Title}</div>
                <div className="cat-card-desc">
                  {c.slide7.feat2Desc}
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon amber">
                  <CreditCard size={22} />
                </div>
                <div className="cat-card-title">{c.slide7.feat3Title}</div>
                <div className="cat-card-desc">
                  {c.slide7.feat3Desc}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={20} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                <strong>{c.slide7.calloutTitle}</strong> {c.slide7.calloutDesc}
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide7.footer}</span>
            <span>{c.slide7.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 8: KÜRESEL UYUM & YABANCI TURİST TRAFİĞİ
            ================================================================== */}
        <section className="catalog-slide" id="slide-8">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide8.tag}</span>
              <h2 className="cat-slide-title">{c.slide8.title}</h2>
              <p className="cat-slide-subtitle">{c.slide8.subtitle}</p>
            </div>
            <span className="cat-slide-number">08 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-2">
              <div className="cat-feature-card" style={{ height: '100%', justifyContent: 'center' }}>
                <div className="cat-card-icon">
                  <Globe size={22} />
                </div>
                <div className="cat-card-title">{c.slide8.feat1Title}</div>
                <div className="cat-card-desc" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {c.slide8.feat1Desc}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['🇹🇷 Türkçe', '🇺🇸 English', '🇩🇪 Deutsch', '🇷🇺 Русский', '🇫🇷 Français', '🇪🇸 Español', '🇸🇦 العربية', '🇨🇳 中文', '🇯🇵 日本語'].map((lang, idx) => (
                    <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cat-feature-card" style={{ height: '100%', justifyContent: 'center' }}>
                <div className="cat-card-icon blue">
                  <Coins size={22} />
                </div>
                <div className="cat-card-title">{c.slide8.feat2Title}</div>
                <div className="cat-card-desc" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {c.slide8.feat2Desc}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{c.slide8.sub1Title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.slide8.sub1Desc}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{c.slide8.sub2Title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.slide8.sub2Desc}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide8.footer}</span>
            <span>{c.slide8.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 9: 3 ADIMDA CANLIYA GEÇİŞ (ONBOARDING)
            ================================================================== */}
        <section className="catalog-slide" id="slide-9">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">{c.slide9.tag}</span>
              <h2 className="cat-slide-title">{c.slide9.title}</h2>
              <p className="cat-slide-subtitle">{c.slide9.subtitle}</p>
            </div>
            <span className="cat-slide-number">09 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-step-row">
              <div className="cat-step-card" style={{ borderTop: '3px solid #34d399' }}>
                <div className="cat-step-number" style={{ color: '#34d399' }}>1</div>
                <div className="cat-card-title">{c.slide9.step1Title}</div>
                <div className="cat-card-desc">
                  {c.slide9.step1Desc}
                </div>
              </div>

              <div className="cat-step-card" style={{ borderTop: '3px solid #38bdf8' }}>
                <div className="cat-step-number" style={{ color: '#38bdf8' }}>2</div>
                <div className="cat-card-title">{c.slide9.step2Title}</div>
                <div className="cat-card-desc">
                  {c.slide9.step2Desc}
                </div>
              </div>

              <div className="cat-step-card" style={{ borderTop: '3px solid #f59e0b' }}>
                <div className="cat-step-number" style={{ color: '#f59e0b' }}>3</div>
                <div className="cat-card-title">{c.slide9.step3Title}</div>
                <div className="cat-card-desc">
                  {c.slide9.step3Desc}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>{c.slide9.badge1Val}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.slide9.badge1Desc}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>{c.slide9.badge2Val}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.slide9.badge2Desc}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>{c.slide9.badge3Val}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.slide9.badge3Desc}</div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>{c.slide9.footer}</span>
            <span>{c.slide9.pageLabel}</span>
          </div>
        </section>


        {/* ==================================================================
            SLIDE 10: ARKA KAPAK & CANLI İNTERAKTİF DEMO
            ================================================================== */}
        <section className="catalog-slide cat-cover-slide" id="slide-10" style={{ background: '#090d16' }}>
          <div className="cat-slide-header" style={{ marginBottom: 0 }}>
            <img src="/naponi-brand.svg" alt="NAPONI" style={{ height: '40px', width: 'auto' }} />
            <span className="cat-slide-number">10 / 10</span>
          </div>

          <div className="cat-backcover">
            <div>
              <span className="cat-slide-tag" style={{ color: '#38bdf8' }}>{c.slide10.tag}</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.5rem 0 1rem' }}>
                {c.slide10.title} <br />
                <span className="cat-gradient-text">{c.slide10.titleHighlight}</span>
              </h2>
              <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '520px', marginBottom: '1.75rem' }}>
                {c.slide10.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                <div>🌐 <strong>{c.slide10.webLabel}:</strong> <span style={{ color: '#ffffff' }}>www.naponi.com</span></div>
                <div>✉️ <strong>{c.slide10.emailLabel}:</strong> <span style={{ color: '#ffffff' }}>info@naponi.com</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="cat-qr-badge-card">
                <div className="cat-qr-badge-title">{c.slide10.qrBadgeTitle}</div>
                <div className="cat-qr-badge-sub">{c.slide10.qrBadgeSub}</div>
                {demoQrUrl ? (
                  <img 
                    src={demoQrUrl} 
                    alt="Canlı Demo QR Kodu" 
                    style={{ width: '210px', height: '210px', display: 'block', margin: '0 auto' }} 
                  />
                ) : (
                  <div style={{ width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.slide10.qrLoading}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', marginTop: '0.75rem' }}>
                  {c.slide10.qrBottomLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
            <span>{c.slide10.footer}</span>
            <span>{c.slide10.pageLabel}</span>
          </div>
        </section>

      </main>
    </div>
  );
};
export default NaponiCatalogPage;
