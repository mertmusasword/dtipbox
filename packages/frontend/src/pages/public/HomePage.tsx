import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Zap,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  Users,
  CreditCard,
  Globe,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Lock,
  Wallet,
  Utensils,
  Coffee,
  Wine,
  Hotel,
  Scissors,
  Car,
  Check,
  XCircle,
  Clock,
  Layers,
  Percent,
  Send,
  Briefcase,
  Headphones,
} from 'lucide-react';
import '../../styles/home.css';
import { useLanguage, LanguageSelector } from '../../i18n';
import { trackBusinessRegisterStarted } from '../../analytics';
import { CorporateApplicationModal } from '../../components/CorporateApplicationModal';
import { SupportTicketModal } from '../../components/SupportTicketModal';
import { BLOG_POSTS } from '../../content/blog/posts';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();

  // Mobile Nav Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Corporate Application Modal State
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);

  // Support Ticket Modal State
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Hero Simulator Interactive State
  const [simAmount, setSimAmount] = useState<number>(10);
  const [simStaff, setSimStaff] = useState<string>('Alex R. (Server)');
  const [simPayment, setSimPayment] = useState<'apple' | 'card' | 'wire'>('apple');
  const [simSuccess, setSimSuccess] = useState<boolean>(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimSuccess(true);
  };

  const handleSimReset = () => {
    setSimSuccess(false);
  };

  return (
    <div className="home-wrapper">
      {/* Background Ambience Gradients */}
      <div className="home-bg-glow-top" />
      <div className="home-bg-glow-middle" />
      <div className="home-bg-glow-bottom" />

      {/* ====================================================================
          1. NAVIGATION BAR
          ==================================================================== */}
      <header className="home-nav-wrapper">
        <nav className="home-nav" aria-label="Main Navigation">
          <Link to="/" className="home-nav-brand">
            <img
              src="/naponi-brand.svg"
              alt="NAPONI Digital Tipping"
              className="home-brand-logo-img"
            />
          </Link>

          <ul className="home-nav-links">
            <li><a href="#how-it-works" className="home-nav-link">{t('nav.features')}</a></li>
            <li><a href="#experience" className="home-nav-link">{t('nav.solutions')}</a></li>
            <li><a href="#benefits" className="home-nav-link">{t('nav.businesses')}</a></li>
            <li><Link to="/tools/tip-calculator" className="home-nav-link">{t('nav.tipCalculator')}</Link></li>
            <li><Link to="/blog" className="home-nav-link">{t('nav.blogGuides')}</Link></li>
            <li><a href="#faq" className="home-nav-link">{t('nav.faq')}</a></li>
          </ul>

          <div className="home-nav-actions">
            <LanguageSelector variant="navbar" />
            <button
              type="button"
              className="home-btn-ghost"
              onClick={() => setSupportModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', padding: '0.55rem 0.95rem' }}
            >
              <Headphones size={15} />
              <span>{t('support.widgetBtn')}</span>
            </button>
            <Link to="/login" className="home-btn-ghost">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="home-btn-primary" onClick={() => trackBusinessRegisterStarted('navbar_desktop_cta')}>
              {t('nav.getStarted')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-mobile-controls">
            <LanguageSelector variant="flagOnly" />
            <Link to="/register" className="home-btn-primary home-btn-mobile-cta" onClick={() => trackBusinessRegisterStarted('navbar_mobile_cta')}>
              {t('nav.getStarted')}
            </Link>
            <button
              className="home-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.toggleMenu')}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="home-mobile-menu">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>{t('nav.features')}</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)}>{t('nav.solutions')}</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)}>{t('nav.businesses')}</a>
            <Link to="/tools/tip-calculator" onClick={() => setMobileMenuOpen(false)}>{t('nav.tipCalculator')}</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>{t('nav.blogGuides')}</Link>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>{t('nav.faq')}</a>
            <button
              type="button"
              className="home-btn-ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                setSupportModalOpen(true);
              }}
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}
            >
              <Headphones size={16} />
              <span>{t('support.widgetBtn')}</span>
            </button>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="home-btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="home-btn-primary"
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => {
                  trackBusinessRegisterStarted('mobile_drawer_cta');
                  setMobileMenuOpen(false);
                }}
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          2. HERO SECTION WITH INTERACTIVE SMARTPHONE SIMULATOR
          ==================================================================== */}
      <section className="home-hero-section">
        <div className="home-container">
          <div className="home-hero-grid">
            {/* Left Hero Column */}
            <div className="home-hero-content">
              <div className="home-hero-badge">
                <Sparkles size={14} className="sparkle" />
                <span>{t('home.heroBadge')}</span>
              </div>

              <h1 className="home-hero-title">
                {t('home.heroTitle')} <br />
                <span className="home-gradient-text">{t('home.heroHighlight')}</span>
              </h1>

              <p className="home-hero-desc">
                {t('home.heroSubtitle')}
              </p>

              <div className="home-hero-cta-group">
                <Link to="/register" className="home-btn-primary home-btn-hero-large" onClick={() => trackBusinessRegisterStarted('hero_cta')}>
                  {t('home.ctaGetStarted')} <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="home-btn-secondary" style={{ padding: '0.9rem 1.8rem' }}>
                  {t('home.ctaLogin')}
                </Link>
              </div>

              <div className="home-hero-trust-row">
                <div className="home-trust-item">
                  <CheckCircle2 size={16} />
                  <span>{t('home.feat1Title')}</span>
                </div>
                <div className="home-trust-item">
                  <CheckCircle2 size={16} />
                  <span>{t('home.feat2Title')}</span>
                </div>
                <div className="home-trust-item">
                  <CheckCircle2 size={16} />
                  <span>{t('home.statTipLatency')}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Smartphone Mockup */}
            <div className="home-hero-visual" id="simulator">
              <div className="home-phone-glow" />
              <div className="home-phone-mockup">
                <div className="home-phone-inner">
                  {/* Dynamic Island */}
                  <div className="home-phone-notch" />

                  {/* Merchant Branding in Simulator */}
                  <div className="home-phone-header">
                    <div className="home-phone-venue-badge">
                      <Building2 size={12} /> The Grand Bistro & Lounge
                    </div>
                    <div className="home-phone-venue-title">Table 14 • Quick Tip</div>
                  </div>

                  {!simSuccess ? (
                    <form onSubmit={handleSimSubmit}>
                      {/* Staff Selector */}
                      <div className="home-phone-staff-box">
                        <div className="home-phone-staff-info">
                          <div className="home-phone-staff-avatar">
                            {simStaff.charAt(0)}
                          </div>
                          <div>
                            <div className="home-phone-staff-name">{simStaff}</div>
                            <div className="home-phone-staff-role">Assigned Staff Member</div>
                          </div>
                        </div>
                        <select
                          value={simStaff}
                          onChange={(e) => setSimStaff(e.target.value)}
                          style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: 'none',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="Alex R. (Server)">Alex R.</option>
                          <option value="Elena M. (Bartender)">Elena M.</option>
                          <option value="Team Pool (All Staff)">Team Pool</option>
                        </select>
                      </div>

                      {/* Amount Selection */}
                      <div className="home-phone-amounts-label">{t('tip.selectAmountTitle')}</div>
                      <div className="home-phone-amounts-grid">
                        {[3, 5, 10, 20].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            className={`home-amount-chip ${simAmount === amt ? 'active' : ''}`}
                            onClick={() => setSimAmount(amt)}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>

                      {/* Payment Method Selector */}
                      <div className="home-phone-amounts-label">{t('tip.paymentMethodTitle')}</div>
                      <div className="home-phone-pay-methods">
                        <button
                          type="button"
                          className={`home-phone-pay-btn ${simPayment === 'apple' ? 'selected' : ''}`}
                          onClick={() => setSimPayment('apple')}
                        >
                          <span> Apple Pay / Google Pay</span>
                          {simPayment === 'apple' && <Check size={14} color="#6366f1" />}
                        </button>
                        <button
                          type="button"
                          className={`home-phone-pay-btn ${simPayment === 'card' ? 'selected' : ''}`}
                          onClick={() => setSimPayment('card')}
                        >
                          <span>{t('tip.creditCard')}</span>
                          {simPayment === 'card' && <Check size={14} color="#6366f1" />}
                        </button>
                      </div>

                      {/* Submit Tip Button */}
                      <button type="submit" className="home-phone-tip-submit">
                        <Zap size={16} /> {t('tip.payBtn')} ${simAmount}.00
                      </button>
                    </form>
                  ) : (
                    /* Instant Confirmation View */
                    <div className="home-phone-success">
                      <div className="home-phone-success-icon">
                        <Check size={24} />
                      </div>
                      <div className="home-phone-success-title">{t('tip.successTitle')}</div>
                      <div className="home-phone-success-sub">
                        {t('tip.successSubtitle')}
                      </div>
                      <button
                        type="button"
                        className="home-phone-reset-btn"
                        onClick={handleSimReset}
                      >
                        {t('common.retry')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. HOW IT WORKS (THE 3-STEP VELOCITY FLOW)
          ==================================================================== */}
      <section className="home-section" id="how-it-works">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.stepsTag')}</span>
            <h2 className="home-section-title">{t('home.stepsTitle')}</h2>
            <p className="home-section-desc">
              {t('home.stepsSubtitle')}
            </p>
          </div>

          <div className="home-steps-grid">
            <div className="home-step-card">
              <span className="home-step-num">01</span>
              <div className="home-step-icon-wrap">
                <Building2 size={26} />
              </div>
              <h3 className="home-step-title">{t('home.step1Title')}</h3>
              <p className="home-step-text">
                {t('home.step1Desc')}
              </p>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">02</span>
              <div className="home-step-icon-wrap">
                <QrCode size={26} />
              </div>
              <h3 className="home-step-title">{t('home.step2Title')}</h3>
              <p className="home-step-text">
                {t('home.step2Desc')}
              </p>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">03</span>
              <div className="home-step-icon-wrap">
                <Sparkles size={26} />
              </div>
              <h3 className="home-step-title">{t('home.step3Title')}</h3>
              <p className="home-step-text">
                {t('home.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. CUSTOMER EXPERIENCE: ZERO APP. ZERO ACCOUNT.
          ==================================================================== */}
      <section className="home-section" id="experience" style={{ background: 'rgba(17, 24, 39, 0.3)' }}>
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.frictionTag')}</span>
            <h2 className="home-section-title">{t('home.frictionTitle')}</h2>
            <p className="home-section-desc">
              {t('home.frictionSubtitle')}
            </p>
          </div>

          <div className="home-friction-comparison">
            {/* Outdated App-Based Model */}
            <div className="home-compare-card traditional">
              <div className="home-compare-header">
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                    {t('home.legacyAppTitle')}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t('home.legacyAppSub')}</span>
                </div>
                <span className="home-compare-tag negative">{t('home.legacyAppBadge')}</span>
              </div>

              <ul className="home-compare-list">
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>{t('home.legacyAppItem1')}</span>
                </li>
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>{t('home.legacyAppItem2')}</span>
                </li>
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>{t('home.legacyAppItem3')}</span>
                </li>
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>{t('home.legacyAppItem4')}</span>
                </li>
              </ul>
            </div>

            {/* NAPONI Instant Flow */}
            <div className="home-compare-card naponi">
              <div className="home-compare-header">
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                    {t('home.naponiExpTitle')}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t('home.naponiExpSub')}</span>
                </div>
                <span className="home-compare-tag positive">{t('home.naponiExpBadge')}</span>
              </div>

              <ul className="home-compare-list">
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>{t('home.naponiExpItem1')}</span>
                </li>
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>{t('home.naponiExpItem2')}</span>
                </li>
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>{t('home.naponiExpItem3')}</span>
                </li>
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>{t('home.naponiExpItem4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. BUSINESS BENEFITS (ENTERPRISE & SME GRADE)
          ==================================================================== */}
      <section className="home-section" id="benefits">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.benefitsTag')}</span>
            <h2 className="home-section-title">{t('home.benefitsTitle')}</h2>
            <p className="home-section-desc">
              {t('home.benefitsSubtitle')}
            </p>
          </div>

          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <Wallet size={24} />
              </div>
              <h3 className="home-feature-title">{t('home.benefit1Title')}</h3>
              <p className="home-feature-desc">
                {t('home.benefit1Desc')}
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <Users size={24} />
              </div>
              <h3 className="home-feature-title">{t('home.benefit2Title')}</h3>
              <p className="home-feature-desc">
                {t('home.benefit2Desc')}
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <QrCode size={24} />
              </div>
              <h3 className="home-feature-title">{t('home.benefit3Title')}</h3>
              <p className="home-feature-desc">
                {t('home.benefit3Desc')}
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="home-feature-title">{t('home.benefit4Title')}</h3>
              <p className="home-feature-desc">
                {t('home.benefit4Desc')}
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <CreditCard size={24} />
              </div>
              <h3 className="home-feature-title">{t('home.benefit5Title')}</h3>
              <p className="home-feature-desc">
                {t('home.benefit5Desc')}
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="home-feature-title">{t('home.benefit6Title')}</h3>
              <p className="home-feature-desc">
                {t('home.benefit6Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. STAFF & TEAM EMPOWERMENT METRICS
          ==================================================================== */}
      <section className="home-section" style={{ paddingTop: 0 }}>
        <div className="home-container">
          <div className="home-stats-banner">
            <div>
              <div className="home-stat-num">{t('home.stat1Num')}</div>
              <div className="home-stat-label">{t('home.stat1Label')}</div>
            </div>
            <div>
              <div className="home-stat-num">{t('home.stat2Num')}</div>
              <div className="home-stat-label">{t('home.stat2Label')}</div>
            </div>
            <div>
              <div className="home-stat-num">{t('home.stat3Num')}</div>
              <div className="home-stat-label">{t('home.stat3Label')}</div>
            </div>
            <div>
              <div className="home-stat-num">{t('home.stat4Num')}</div>
              <div className="home-stat-label">{t('home.stat4Label')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. PAYMENT METHODS
          ==================================================================== */}
      <section className="home-section" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="home-container" style={{ textAlign: 'center' }}>
          <span className="home-section-tag">{t('home.payTag')}</span>
          <h2 className="home-section-title" style={{ fontSize: '2rem' }}>
            {t('home.payTitle')}
          </h2>
          <p className="home-section-desc" style={{ maxWidth: 620, margin: '0 auto 2rem' }}>
            {t('home.paySubtitle')}
          </p>

          <div className="home-pay-badges-row">
            <div className="home-pay-badge-item">
              <Smartphone size={18} />
              <span>Apple Pay</span>
            </div>
            <div className="home-pay-badge-item">
              <Smartphone size={18} />
              <span>Google Pay</span>
            </div>
            <div className="home-pay-badge-item">
              <CreditCard size={18} />
              <span>Visa & Mastercard</span>
            </div>
            <div className="home-pay-badge-item">
              <CreditCard size={18} />
              <span>American Express</span>
            </div>
            <div className="home-pay-badge-item">
              <Zap size={18} />
              <span>{t('home.payDirectBank')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. WHO IS NAPONI FOR? (INDUSTRIES)
          ==================================================================== */}
      <section className="home-section" id="industries" style={{ background: 'rgba(17, 24, 39, 0.3)' }}>
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.industriesTag')}</span>
            <h2 className="home-section-title">{t('home.industriesTitle')}</h2>
            <p className="home-section-desc">
              {t('home.industriesSubtitle')}
            </p>
          </div>

          <div className="home-industries-grid">
            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Utensils size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indRestaurantsTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indRestaurantsDesc')}
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Coffee size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indCafesTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indCafesDesc')}
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Hotel size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indHotelsTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indHotelsDesc')}
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Wine size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indBarsTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indBarsDesc')}
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Scissors size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indBarbersTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indBarbersDesc')}
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Car size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indValetTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indValetDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8B. ENTERPRISE & CORPORATE SOLUTIONS
          ==================================================================== */}
      <section className="home-corporate-section" id="corporate">
        <div className="home-container">
          <div className="home-corporate-card">
            <div className="home-corporate-glow" />
            <div className="home-corporate-content">
              <div className="home-corporate-tag">
                <Building2 size={16} />
                <span>{t('home.corporateBadge')}</span>
              </div>
              <h2 className="home-corporate-title">
                {t('home.corporateTitle')}
              </h2>
              <p className="home-corporate-subtitle">
                {t('home.corporateSubtitle')}
              </p>
              <p className="home-corporate-desc">
                {t('home.corporateDesc')}
              </p>
              <button
                type="button"
                className="home-corporate-cta-btn"
                onClick={() => setCorporateModalOpen(true)}
              >
                <Briefcase size={18} />
                <span>{t('home.corporateCta')}</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="home-corporate-highlights">
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <Layers size={18} />
                </div>
                <div>
                  <strong>{t('home.corpPill1Title')}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('home.corpPill1Desc')}</div>
                </div>
              </div>
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <Users size={18} />
                </div>
                <div>
                  <strong>{t('home.corpPill2Title')}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('home.corpPill2Desc')}</div>
                </div>
              </div>
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <CreditCard size={18} />
                </div>
                <div>
                  <strong>{t('home.corpPill3Title')}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('home.corpPill3Desc')}</div>
                </div>
              </div>
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>{t('home.corpPill4Title')}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('home.corpPill4Desc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. GLOBAL BY ARCHITECTURE
          ==================================================================== */}
      <section className="home-section" id="global">
        <div className="home-container">
          <div className="home-global-box">
            <span className="home-section-tag">{t('home.globalTag')}</span>
            <h2 className="home-section-title" style={{ maxWidth: 700, margin: '0 auto 1rem' }}>
              {t('home.globalTitle')}
            </h2>
            <p className="home-section-desc" style={{ maxWidth: 640, margin: '0 auto' }}>
              {t('home.globalSubtitle')}
            </p>

            <div className="home-currency-tags">
              <span className="home-currency-pill">🇺🇸 USD ($)</span>
              <span className="home-currency-pill">🇪🇺 EUR (€)</span>
              <span className="home-currency-pill">🇬🇧 GBP (£)</span>
              <span className="home-currency-pill">🇹🇷 TRY (₺)</span>
              <span className="home-currency-pill">🇦🇺 AUD ($)</span>
              <span className="home-currency-pill">🇨🇦 CAD ($)</span>
              <span className="home-currency-pill">🇨🇭 CHF (Fr)</span>
              <span className="home-currency-pill">🇯🇵 JPY (¥)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. BANK-GRADE SECURITY & TRUST
          ==================================================================== */}
      <section className="home-section" style={{ background: 'rgba(17, 24, 39, 0.25)' }}>
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.securityTag')}</span>
            <h2 className="home-section-title">{t('home.securityTitle')}</h2>
            <p className="home-section-desc">
              {t('home.securitySubtitle')}
            </p>
          </div>

          <div className="home-trust-grid">
            <div className="home-trust-card">
              <div className="home-trust-icon-large">
                <Lock size={26} />
              </div>
              <h3 className="home-trust-title">{t('home.sec1Title')}</h3>
              <p className="home-trust-desc">
                {t('home.sec1Desc')}
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-icon-large">
                <ShieldCheck size={26} />
              </div>
              <h3 className="home-trust-title">{t('home.sec2Title')}</h3>
              <p className="home-trust-desc">
                {t('home.sec2Desc')}
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-icon-large">
                <CreditCard size={26} />
              </div>
              <h3 className="home-trust-title">{t('home.sec3Title')}</h3>
              <p className="home-trust-desc">
                {t('home.sec3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10B. LATEST BLOG ARTICLES (SON YAZILAR & REHBERLER)
          ==================================================================== */}
      <section className="home-section" id="articles">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">
              {t('home.blogTag')}
            </span>
            <h2 className="home-section-title">
              {t('home.blogTitle')}
            </h2>
            <p className="home-section-desc">
              {t('home.blogSubtitle')}
            </p>
          </div>

          <div className="blog-posts-grid" style={{ marginBottom: '2.5rem' }}>
            {BLOG_POSTS.filter((p) => p.language === (language === 'tr' ? 'tr' : 'en'))
              .slice(0, 3)
              .map((post) => (
                <article key={post.slug} className="blog-card">
                  <div className="blog-card-category">{post.category}</div>
                  <h3 className="blog-card-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <span>{post.readingTime}</span>
                    <Link to={`/blog/${post.slug}`} className="blog-card-readmore">
                      {t('home.blogReadMore')}
                    </Link>
                  </div>
                </article>
              ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/blog" className="home-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
              <span>{t('home.blogExploreAll')}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FREQUENTLY ASKED QUESTIONS (FAQ)
          ==================================================================== */}
      <section className="home-section" id="faq">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('nav.faq')}</span>
            <h2 className="home-section-title">{t('home.faqTitle')}</h2>
            <p className="home-section-desc">
              {t('home.faqSubtitle')}
            </p>
          </div>

          <div className="home-faq-accordion">
            {[
              {
                q: t('home.faqQ1'),
                a: t('home.faqA1')
              },
              {
                q: t('home.faqQ2'),
                a: t('home.faqA2')
              },
              {
                q: t('home.faqQ3'),
                a: t('home.faqA3')
              },
              {
                q: t('home.faqQ4'),
                a: t('home.faqA4')
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className={`home-faq-item ${openFaq === idx ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="home-faq-question"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === idx && (
                  <div className="home-faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. STRONG FINAL CTA BANNER
          ==================================================================== */}
      <section className="home-section" style={{ paddingTop: 0 }}>
        <div className="home-container">
          <div className="home-cta-banner">
            <h2 className="home-cta-title">
              {t('home.heroTitle')} {t('home.heroHighlight')}
            </h2>
            <p className="home-cta-sub">
              {t('home.heroSubtitle')}
            </p>
            <div className="home-cta-btn-wrap">
              <Link to="/register" className="home-btn-primary home-btn-hero-large">
                {t('home.ctaGetStarted')} <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="home-btn-secondary" style={{ padding: '0.9rem 1.8rem' }}>
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          13. GLOBAL SAAS FOOTER
          ==================================================================== */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-grid">
            <div className="home-footer-brand-col">
              <Link to="/" style={{ display: 'inline-block' }}>
                <img
                  src="/naponi-brand.svg"
                  alt="NAPONI Digital Tipping"
                  style={{ height: 42, width: 'auto' }}
                />
              </Link>
              <p>
                {t('home.footerTagline')}
              </p>
              <div className="home-footer-status-pill">
                <span className="pulse-dot" />
                <span>{t('home.footerStatus')}</span>
              </div>
            </div>

            <div>
              <h4 className="home-footer-col-title">{t('home.footerProduct')}</h4>
              <ul className="home-footer-links">
                <li><a href="#how-it-works">{t('nav.features')}</a></li>
                <li><a href="#experience">{t('nav.solutions')}</a></li>
                <li><Link to="/solutions/restaurants">{t('nav.restaurants')}</Link></li>
                <li><Link to="/solutions/hotels">{t('nav.hotels')}</Link></li>
                <li><Link to="/solutions/cafes">{t('nav.cafes')}</Link></li>
                <li><Link to="/tools/tip-calculator">{t('nav.tipCalculator')}</Link></li>
                <li><Link to="/tools/tip-split-calculator">{t('nav.tipSplitter')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">{t('home.footerPlatform')}</h4>
              <ul className="home-footer-links">
                <li><Link to="/blog">{t('nav.blogGuides')}</Link></li>
                <li><Link to="/register">{t('nav.getStarted')}</Link></li>
                <li><Link to="/login">{t('nav.login')}</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSupportModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Headphones size={13} />
                    <span>{t('support.widgetBtn')}</span>
                  </button>
                </li>
                <li><a href="#faq">{t('nav.faq')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">{t('home.footerLanguage')}</h4>
              <div style={{ marginTop: '0.5rem' }}>
                <LanguageSelector variant="compact" direction="up" />
              </div>
            </div>
          </div>

          <div className="home-footer-bottom">
            <div>
              © {new Date().getFullYear()} NAPONI. {t('home.footerRights')}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>{t('nav.blogGuides')}</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>{t('nav.sectors')}</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>{t('nav.calculator')}</Link>
              <a href="#faq" style={{ color: '#64748b', textDecoration: 'none' }}>{t('nav.faq')}</a>
              <a href="#how-it-works" style={{ color: '#64748b', textDecoration: 'none' }}>{t('nav.features')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Corporate Application Modal */}
      <CorporateApplicationModal
        isOpen={corporateModalOpen}
        onClose={() => setCorporateModalOpen(false)}
      />

      {/* Support Ticket Modal */}
      <SupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </div>
  );
};
