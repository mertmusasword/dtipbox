import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  ChevronDown,
  ChevronUp,
  Percent,
  Coins,
  Check,
  Zap,
} from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { SeoHead } from '../../components/SeoHead';
import { useLanguage } from '../../i18n';
import { getPricingText } from '../../i18n/pricingLocales';
import { trackBusinessRegisterStarted, trackFounderCtaClicked } from '../../analytics';
import '../../styles/home.css';

export const PricingPage: React.FC = () => {
  const { language } = useLanguage();
  const pt = getPricingText(language);

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

  // Pricing FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const founderFeatures = [
    pt.founderFeature1,
    pt.founderFeature2,
    pt.founderFeature3,
    pt.founderFeature4,
    pt.founderFeature5,
    pt.founderFeature6,
  ];

  const faqItems = [
    { q: pt.faq1Q, a: pt.faq1A },
    { q: pt.faq2Q, a: pt.faq2A },
    { q: pt.faq3Q, a: pt.faq3A },
    { q: pt.faq4Q, a: pt.faq4A },
  ];

  return (
    <div className="home-wrapper">
      <SeoHead
        title={pt.metaTitle}
        description={pt.metaDesc}
        canonicalUrl="https://www.naponi.com/pricing"
        keywords={[
          'naponi pricing',
          'naponi fiyatlandırma',
          'dijital bahşiş fiyatları',
          'restoran qr bahşiş komisyon',
          'hospitality tipping saas pricing',
          'kurucu üyelik 0₺',
        ]}
        alternateLanguages={[
          { lang: 'x-default', url: 'https://www.naponi.com/pricing' },
          { lang: 'tr', url: 'https://www.naponi.com/fiyatlandirma' },
          { lang: 'en', url: 'https://www.naponi.com/pricing' },
        ]}
      />

      {/* Atmospheric Glowing Gradients */}
      <div className="home-bg-glow-top" />
      <div className="home-bg-glow-middle" />
      <div className="home-bg-glow-bottom" />

      {/* Navigation */}
      <PublicNavbar />

      {/* ====================================================================
          1. HERO SECTION WITH COUNTDOWN
          ==================================================================== */}
      <section className="home-hero-section" style={{ paddingTop: '7.5rem', paddingBottom: '2.5rem' }}>
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
            <Crown size={16} />
            <span>{pt.heroBadge}</span>
          </div>

          <h1
            className="home-hero-title"
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.8rem)',
              maxWidth: '920px',
              margin: '0.5rem auto 1.25rem',
              lineHeight: 1.15,
            }}
          >
            {pt.heroTitle}
          </h1>

          <p
            className="home-hero-desc"
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              maxWidth: '800px',
              margin: '0 auto 2rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
            }}
          >
            {pt.heroSubtitle}
          </p>

          {/* Countdown Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '9999px',
              padding: '0.6rem 1.4rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fde047', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} />
              <span>{pt.countdownNotice}</span>
            </span>
            <div className="home-countdown-grid" style={{ gap: '0.35rem' }}>
              <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. THE SPOTLIGHT: 2026 FOUNDER MEMBER VIP OFFER (0₺ LIFETIME)
          ==================================================================== */}
      <section className="home-section" style={{ paddingTop: '1.5rem', paddingBottom: '3.5rem' }}>
        <div className="home-container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(28, 22, 58, 0.95) 0%, rgba(45, 23, 72, 0.9) 50%, rgba(18, 14, 38, 0.98) 100%)',
              border: '2px solid rgba(234, 179, 8, 0.5)',
              borderRadius: '24px',
              padding: '2.75rem 2.5rem',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(234, 179, 8, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Tag & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  color: '#fde047',
                  padding: '0.4rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                <Crown size={15} />
                <span>{pt.founderCardTag}</span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '0.35rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={15} />
                <span>{pt.founderBadge}</span>
              </span>
            </div>

            {/* Price Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
                  {pt.founderCardTitle}
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0, maxWidth: '540px', lineHeight: 1.5 }}>
                  {pt.founderCardSubtitle}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                    {pt.founderPrice}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>
                    {pt.founderPeriod}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, marginTop: '0.35rem' }}>
                  {pt.founderExemptBadge}
                </div>
              </div>
            </div>

            {/* Feature Checkmarks Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                margin: '2rem 0',
                padding: '1.75rem',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
              }}
            >
              {founderFeatures.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.92rem', color: '#f1f5f9', lineHeight: 1.45 }}>{feat}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {pt.microProofText}
              </div>
              <Link
                to="/register"
                className="home-founder-cta-btn"
                style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1.05rem',
                  boxShadow: '0 8px 30px rgba(245, 158, 11, 0.5)',
                }}
                onClick={() => {
                  trackFounderCtaClicked('pricing_founder_spotlight_cta');
                  trackBusinessRegisterStarted('pricing_founder_spotlight_cta');
                }}
              >
                <span>{pt.founderCta}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. UPCOMING 2027 SAAS TIERS (STARTER, GROWTH, PRO)
          ==================================================================== */}
      <section className="home-section" id="future-plans" style={{ background: 'rgba(255, 255, 255, 0.015)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="home-section-tag">{pt.upcomingTag}</span>
            <h2 className="home-section-title" style={{ maxWidth: '850px', margin: '0.5rem auto' }}>
              {pt.upcomingTitle}
            </h2>
            <p className="home-section-desc" style={{ maxWidth: '780px', margin: '0 auto' }}>
              {pt.upcomingSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
              maxWidth: '1100px',
              margin: '0 auto 2.5rem auto',
            }}
          >
            {/* Starter Plan */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {pt.planStarterTitle}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', minHeight: '40px', lineHeight: 1.4 }}>
                  {pt.planStarterDesc}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '1.25rem 0 1.75rem 0' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc' }}>{pt.planStarterPrice}</span>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{pt.planStarterPeriod}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planStarterF1}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planStarterF2}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planStarterF3}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                {pt.liveIn2027}
              </div>
            </div>

            {/* Growth Plan (Popular) */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(20, 15, 38, 0.95) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 15px 40px -10px rgba(99, 102, 241, 0.3)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '3px 14px',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                }}
              >
                {pt.planGrowthBadge}
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {pt.planGrowthTitle}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', minHeight: '40px', lineHeight: 1.4 }}>
                  {pt.planGrowthDesc}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '1.25rem 0 1.75rem 0' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#a5b4fc' }}>{pt.planGrowthPrice}</span>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{pt.planGrowthPeriod}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={16} color="#a855f7" />
                    <span>{pt.planGrowthF1}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={16} color="#a855f7" />
                    <span>{pt.planGrowthF2}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={16} color="#a855f7" />
                    <span>{pt.planGrowthF3}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={16} color="#a855f7" />
                    <span>{pt.planGrowthF4}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.78rem', color: '#a5b4fc' }}>
                {pt.liveIn2027}
              </div>
            </div>

            {/* Enterprise Pro */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {pt.planProTitle}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', minHeight: '40px', lineHeight: 1.4 }}>
                  {pt.planProDesc}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '1.25rem 0 1.75rem 0' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc' }}>{pt.planProPrice}</span>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{pt.planProPeriod}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planProF1}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planProF2}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planProF3}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <CheckCircle2 size={16} color="#818cf8" />
                    <span>{pt.planProF4}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                {pt.liveIn2027}
              </div>
            </div>
          </div>

          {/* Exemption Callout Banner */}
          <div
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              padding: '1.15rem 1.75rem',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '16px',
              textAlign: 'center',
              color: '#fde047',
              fontSize: '0.92rem',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {pt.founderExemptNotice}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. COMMISSION TRANSPARENCY: SADECE %0.5
          ==================================================================== */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="home-section-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
              {pt.commissionTag}
            </span>
            <h2 className="home-section-title" style={{ maxWidth: '850px', margin: '0.5rem auto' }}>
              {pt.commissionTitle}
            </h2>
            <p className="home-section-desc" style={{ maxWidth: '780px', margin: '0 auto' }}>
              {pt.commissionSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >
            {/* Card Commission */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <CreditCard size={22} />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#818cf8' }}>{pt.commCard1Rate}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                {pt.commCard1Title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                {pt.commCard1Desc}
              </p>
            </div>

            {/* Wire Transfer Commission */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <Building2 size={22} />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>{pt.commCard2Rate}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                {pt.commCard2Title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                {pt.commCard2Desc}
              </p>
            </div>

            {/* Cash Free */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <Coins size={22} />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>{pt.commCard3Rate}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                {pt.commCard3Title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                {pt.commCard3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. PRICING FAQ ACCORDION
          ==================================================================== */}
      <section className="home-section" id="faq" style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="home-container" style={{ maxWidth: '850px' }}>
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{pt.faqTag}</span>
            <h2 className="home-section-title">{pt.faqTitle}</h2>
            <p className="home-section-desc">{pt.faqSubtitle}</p>
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
              <span>{pt.heroBadge}</span>
            </div>
            <h2 className="home-cta-title" style={{ maxWidth: '800px', margin: '0 auto 0.75rem' }}>
              {pt.ctaTitle}
            </h2>
            <p className="home-cta-sub" style={{ maxWidth: '720px', margin: '0 auto 2rem' }}>
              {pt.ctaSubtitle}
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
                  trackFounderCtaClicked('pricing_bottom_cta');
                  trackBusinessRegisterStarted('pricing_bottom_cta');
                }}
              >
                <span>{pt.ctaBtn}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="home-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="home-container" style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b', fontSize: '0.85rem' }}>
          <div>{pt.pricingCopyright}</div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Naponi Home</Link>
            <Link to="/founder" style={{ color: '#fde047', textDecoration: 'none', fontWeight: 600 }}>2026 Founder Program</Link>
            <Link to="/trust" style={{ color: '#94a3b8', textDecoration: 'none' }}>Trust & Security</Link>
            <Link to="/catalog" style={{ color: '#94a3b8', textDecoration: 'none' }}>B2B Catalog</Link>
            <Link to="/register" style={{ color: '#fde047', textDecoration: 'none', fontWeight: 600 }}>{pt.ctaBtn}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
