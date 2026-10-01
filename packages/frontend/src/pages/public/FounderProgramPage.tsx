import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Percent,
  Users,
  QrCode,
  Layers,
  BookOpen,
  Wifi,
  Star,
  Globe,
  Coins,
  CreditCard,
  BarChart3,
  Headphones,
  ChevronDown,
  ChevronUp,
  Award,
  Check,
  XCircle,
} from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { SeoHead } from '../../components/SeoHead';
import { useLanguage } from '../../i18n';
import { getFounderText } from '../../i18n/founderLocales';
import { trackBusinessRegisterStarted, trackFounderCtaClicked } from '../../analytics';
import '../../styles/home.css';

export const FounderProgramPage: React.FC = () => {
  const { language } = useLanguage();
  const ft = getFounderText(language);

  // Live countdown to Dec 31, 2026 23:59:59 GMT+3
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-12-31T23:59:59+03:00').getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const perksList = [
    { icon: Percent, title: ft.perk1Title, desc: ft.perk1Desc, highlight: true },
    { icon: Crown, title: ft.perk2Title, desc: ft.perk2Desc, highlight: true },
    { icon: Users, title: ft.perk3Title, desc: ft.perk3Desc },
    { icon: QrCode, title: ft.perk4Title, desc: ft.perk4Desc },
    { icon: Layers, title: ft.perk5Title, desc: ft.perk5Desc },
    { icon: BookOpen, title: ft.perk6Title, desc: ft.perk6Desc },
    { icon: Wifi, title: ft.perk7Title, desc: ft.perk7Desc },
    { icon: Star, title: ft.perk8Title, desc: ft.perk8Desc },
    { icon: Globe, title: ft.perk9Title, desc: ft.perk9Desc },
    { icon: Coins, title: ft.perk10Title, desc: ft.perk10Desc },
    { icon: CreditCard, title: ft.perk11Title, desc: ft.perk11Desc },
    { icon: BarChart3, title: ft.perk12Title, desc: ft.perk12Desc },
    { icon: Headphones, title: ft.perk13Title, desc: ft.perk13Desc },
    { icon: Sparkles, title: ft.perk14Title, desc: ft.perk14Desc, highlight: true },
  ];

  const comparisonRows = [
    { feature: ft.row1Feature, founder: ft.row1Founder, normal: ft.row1Normal, win: true },
    { feature: ft.row2Feature, founder: ft.row2Founder, normal: ft.row2Normal, win: true },
    { feature: ft.row3Feature, founder: ft.row3Founder, normal: ft.row3Normal, win: true },
    { feature: ft.row4Feature, founder: ft.row4Founder, normal: ft.row4Normal, win: true },
    { feature: ft.row5Feature, founder: ft.row5Founder, normal: ft.row5Normal, win: true },
    { feature: ft.row6Feature, founder: ft.row6Founder, normal: ft.row6Normal, win: true },
    { feature: ft.row7Feature, founder: ft.row7Founder, normal: ft.row7Normal, win: false },
  ];

  const faqItems = [
    { q: ft.faq1Q, a: ft.faq1A },
    { q: ft.faq2Q, a: ft.faq2A },
    { q: ft.faq3Q, a: ft.faq3A },
    { q: ft.faq4Q, a: ft.faq4A },
    { q: ft.faq5Q, a: ft.faq5A },
  ];

  return (
    <div className="home-wrapper">
      <SeoHead
        title={ft.metaTitle}
        description={ft.metaDesc}
        canonicalUrl="https://www.naponi.com/founder"
        keywords={[
          'naponi founder program',
          'naponi kurucu üyelik',
          'lifetime free digital tipping',
          'hospitality smart qr founder',
          'ömür boyu ücretsiz restoran yazılımı',
          'dijital bahşiş kurucu üye',
        ]}
        alternateLanguages={[
          { lang: 'x-default', url: 'https://www.naponi.com/founder' },
          { lang: 'tr', url: 'https://www.naponi.com/kurucu-uye' },
          { lang: 'en', url: 'https://www.naponi.com/founder' },
        ]}
      />

      {/* Atmospheric Glowing Gradients */}
      <div className="home-bg-glow-top" />
      <div className="home-bg-glow-middle" />
      <div className="home-bg-glow-bottom" />

      {/* Navigation */}
      <PublicNavbar />

      {/* ====================================================================
          1. HERO SECTION WITH REAL-TIME COUNTDOWN
          ==================================================================== */}
      <section className="home-hero-section" style={{ paddingTop: '7.5rem', paddingBottom: '3.5rem' }}>
        <div className="home-container" style={{ textAlign: 'center' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(234, 179, 8, 0.14)',
              border: '1px solid rgba(234, 179, 8, 0.45)',
              padding: '0.45rem 1.25rem',
              borderRadius: '9999px',
              color: '#fde047',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 18px rgba(234, 179, 8, 0.2)',
            }}
          >
            <Crown size={17} />
            <span>{ft.heroBadge}</span>
          </div>

          {/* Headline */}
          <h1
            className="home-hero-title"
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.8rem)',
              maxWidth: '960px',
              margin: '0.5rem auto 1.25rem',
              lineHeight: 1.15,
            }}
          >
            {ft.heroTitle}
          </h1>

          {/* Subtitle */}
          <p
            className="home-hero-desc"
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              maxWidth: '820px',
              margin: '0 auto 2rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
            }}
          >
            {ft.heroSubtitle}
          </p>

          {/* Real-time Countdown Box */}
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              background: 'linear-gradient(135deg, rgba(24, 20, 48, 0.95) 0%, rgba(45, 23, 72, 0.85) 50%, rgba(18, 14, 38, 0.95) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '20px',
              padding: '1.4rem 2.2rem',
              boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(234, 179, 8, 0.2)',
              marginBottom: '2rem',
              maxWidth: '650px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fde047', fontWeight: 800, fontSize: '0.9rem' }}>
              <Clock size={16} />
              <span>{ft.countdownLabel}</span>
            </div>

            <div className="home-countdown-grid" style={{ justifyContent: 'center' }}>
              <div className="home-countdown-tile" style={{ minWidth: '65px', padding: '0.6rem 0.8rem' }}>
                <span className="home-countdown-value" style={{ fontSize: '1.6rem' }}>{timeLeft.days}</span>
                <span className="home-countdown-unit" style={{ fontSize: '0.7rem' }}>{language === 'tr' ? 'GÜN' : 'DAYS'}</span>
              </div>
              <span className="home-countdown-separator" style={{ fontSize: '1.4rem' }}>:</span>
              <div className="home-countdown-tile" style={{ minWidth: '65px', padding: '0.6rem 0.8rem' }}>
                <span className="home-countdown-value" style={{ fontSize: '1.6rem' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="home-countdown-unit" style={{ fontSize: '0.7rem' }}>{language === 'tr' ? 'SAAT' : 'HOURS'}</span>
              </div>
              <span className="home-countdown-separator" style={{ fontSize: '1.4rem' }}>:</span>
              <div className="home-countdown-tile" style={{ minWidth: '65px', padding: '0.6rem 0.8rem' }}>
                <span className="home-countdown-value" style={{ fontSize: '1.6rem' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="home-countdown-unit" style={{ fontSize: '0.7rem' }}>{language === 'tr' ? 'DAKİKA' : 'MINS'}</span>
              </div>
              <span className="home-countdown-separator" style={{ fontSize: '1.4rem' }}>:</span>
              <div className="home-countdown-tile" style={{ minWidth: '65px', padding: '0.6rem 0.8rem' }}>
                <span className="home-countdown-value" style={{ fontSize: '1.6rem' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="home-countdown-unit" style={{ fontSize: '0.7rem' }}>{language === 'tr' ? 'SANİYE' : 'SECS'}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {ft.deadlineText}
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Link
              to="/register"
              className="home-btn-primary home-btn-hero-large"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                color: '#0f172a',
                border: '1px solid rgba(254, 240, 138, 0.6)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
                fontWeight: 800,
              }}
              onClick={() => {
                trackFounderCtaClicked('founder_page_hero_cta');
                trackBusinessRegisterStarted('founder_page_hero_cta');
              }}
            >
              <span>{ft.ctaRegister}</span>
              <ArrowRight size={18} />
            </Link>
            <a
              href="#comparison"
              className="home-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>{ft.ctaCompare}</span>
              <ChevronDown size={17} />
            </a>
          </div>

          {/* Micro-Proof Trust Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
              fontSize: '0.88rem',
              color: '#94a3b8',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 600 }}>
              <ShieldCheck size={16} /> {ft.trustPill1}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600 }}>
              <Award size={16} /> {ft.trustPill2}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> {ft.trustPill3}
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. COMPARISON TABLE (2026 FOUNDER vs 2027 REGULAR)
          ==================================================================== */}
      <section className="home-section" id="comparison" style={{ background: 'rgba(255, 255, 255, 0.015)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{ft.compareTag}</span>
            <h2 className="home-section-title" style={{ maxWidth: '850px', margin: '0.5rem auto' }}>
              {ft.compareTitle}
            </h2>
            <p className="home-section-desc" style={{ maxWidth: '780px', margin: '0 auto' }}>
              {ft.compareSubtitle}
            </p>
          </div>

          <div
            style={{
              maxWidth: '920px',
              margin: '0 auto',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.6fr 1.6fr',
                padding: '1.25rem 1.75rem',
                background: 'rgba(30, 27, 75, 0.85)',
                borderBottom: '1px solid rgba(234, 179, 8, 0.25)',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              <div style={{ color: '#94a3b8' }}>{ft.colFeature}</div>
              <div style={{ color: '#fde047', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Crown size={16} />
                <span>{ft.colFounder}</span>
              </div>
              <div style={{ color: '#94a3b8' }}>{ft.colNormal}</div>
            </div>

            {/* Table Body Rows */}
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.6fr 1.6fr',
                  padding: '1.15rem 1.75rem',
                  borderBottom: idx === comparisonRows.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  fontSize: '0.9rem',
                  alignItems: 'center',
                }}
              >
                <div style={{ color: '#f8fafc', fontWeight: 600 }}>{row.feature}</div>
                <div style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {row.win && <CheckCircle2 size={16} color="#34d399" />}
                  <span>{row.founder}</span>
                </div>
                <div style={{ color: '#94a3b8' }}>{row.normal}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. 14 CORE PRIVILEGES OF FOUNDER MEMBERSHIP
          ==================================================================== */}
      <section className="home-section" id="perks">
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              className="home-section-tag"
              style={{
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#fde047',
                border: '1px solid rgba(234, 179, 8, 0.4)',
              }}
            >
              {ft.perksTag}
            </span>
            <h2 className="home-section-title" style={{ maxWidth: '850px', margin: '0.5rem auto' }}>
              {ft.perksTitle}
            </h2>
            <p className="home-section-desc" style={{ maxWidth: '780px', margin: '0 auto' }}>
              {ft.perksSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {perksList.map((perk, idx) => {
              const IconComp = perk.icon;
              return (
                <div
                  key={idx}
                  className="home-founder-perk-card"
                  style={{
                    borderColor: perk.highlight ? 'rgba(234, 179, 8, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                    background: perk.highlight
                      ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(20, 15, 38, 0.95) 100%)'
                      : 'rgba(15, 23, 42, 0.75)',
                  }}
                >
                  <div
                    className="home-founder-perk-icon-wrap"
                    style={{
                      background: perk.highlight ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)',
                    }}
                  >
                    <IconComp size={22} color="#fbbf24" />
                  </div>
                  <h3 className="home-founder-perk-title">{perk.title}</h3>
                  <p className="home-founder-perk-desc">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. OFFICIAL GUARANTEE & TRANSPARENT COMMITMENT
          ==================================================================== */}
      <section className="home-section" style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="home-container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(45, 23, 72, 0.85) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={24} color="#fde047" />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#fde047', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {ft.guaranteeTag}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {ft.guaranteeTitle}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '0.98rem', color: '#e2e8f0', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {ft.guaranteeText}
            </p>

            <div
              style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                lineHeight: 1.6,
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '0.9rem 1.25rem',
                borderRadius: '12px',
                borderLeft: '3px solid rgba(234, 179, 8, 0.5)',
              }}
            >
              {ft.disclaimer}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. FOUNDER PROGRAM FAQ ACCORDION
          ==================================================================== */}
      <section className="home-section" id="faq">
        <div className="home-container" style={{ maxWidth: '880px' }}>
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{ft.faqTag}</span>
            <h2 className="home-section-title">{ft.faqTitle}</h2>
            <p className="home-section-desc">{ft.faqSubtitle}</p>
          </div>

          <div className="home-faq-accordion">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className={`home-faq-item ${openFaq === idx ? 'open' : ''}`}
                style={{
                  border: openFaq === idx ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  type="button"
                  className="home-faq-question"
                  onClick={() => toggleFaq(idx)}
                >
                  <span style={{ fontWeight: 700 }}>{item.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} color="#fbbf24" /> : <ChevronDown size={18} />}
                </button>
                {openFaq === idx && (
                  <div className="home-faq-answer" style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. FINAL CTA BANNER
          ==================================================================== */}
      <section className="home-section" style={{ paddingTop: 0 }}>
        <div className="home-container">
          <div
            className="home-cta-banner"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(45, 23, 72, 0.9) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(234, 179, 8, 0.15)',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#fde047', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <Crown size={18} />
              <span>{ft.heroBadge}</span>
            </div>
            <h2 className="home-cta-title" style={{ maxWidth: '800px', margin: '0 auto 0.75rem' }}>
              {ft.ctaBottomTitle}
            </h2>
            <p className="home-cta-sub" style={{ maxWidth: '720px', margin: '0 auto 2rem' }}>
              {ft.ctaBottomSubtitle}
            </p>
            <div className="home-cta-btn-wrap">
              <Link
                to="/register"
                className="home-btn-primary home-btn-hero-large"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                  color: '#0f172a',
                  border: '1px solid rgba(254, 240, 138, 0.6)',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
                  fontWeight: 800,
                }}
                onClick={() => {
                  trackFounderCtaClicked('founder_page_bottom_cta');
                  trackBusinessRegisterStarted('founder_page_bottom_cta');
                }}
              >
                <span>{ft.ctaBottomBtn}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global SaaS Footer */}
      <footer className="home-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="home-container" style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b', fontSize: '0.85rem' }}>
          <div>© 2026 Naponi Teknoloji A.Ş. • {ft.heroBadge}</div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Naponi Home</Link>
            <Link to="/trust" style={{ color: '#94a3b8', textDecoration: 'none' }}>Trust & Security</Link>
            <Link to="/catalog" style={{ color: '#94a3b8', textDecoration: 'none' }}>B2B Catalog</Link>
            <Link to="/register" style={{ color: '#fde047', textDecoration: 'none', fontWeight: 600 }}>{ft.ctaRegister}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
