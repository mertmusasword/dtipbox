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
            <li><a href="#simulator" className="home-nav-link">{t('nav.simulator')}</a></li>
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
            <a href="#simulator" onClick={() => setMobileMenuOpen(false)}>{t('nav.simulator')}</a>
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
            <span className="home-section-tag">Frictionless Workflow</span>
            <h2 className="home-section-title">How NAPONI Works</h2>
            <p className="home-section-desc">
              Designed from the ground up to eliminate hardware costs and customer friction.
              Go live in 2 minutes with no technical expertise required.
            </p>
          </div>

          <div className="home-steps-grid">
            <div className="home-step-card">
              <span className="home-step-num">01</span>
              <div className="home-step-icon-wrap">
                <Building2 size={26} />
              </div>
              <h3 className="home-step-title">1. Create & Deploy</h3>
              <p className="home-step-text">
                Register your business, add your team members, configure your payout IBAN or payment gateway, and instantly download high-resolution QR codes for tables, counters, or room keys.
              </p>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">02</span>
              <div className="home-step-icon-wrap">
                <QrCode size={26} />
              </div>
              <h3 className="home-step-title">2. Scan With Camera</h3>
              <p className="home-step-text">
                Guests simply point their iOS or Android camera at the QR code. Your custom-branded, lightning-fast web checkout opens in under 0.8 seconds.
              </p>
            </div>

            <div className="home-step-card">
              <span className="home-step-num">03</span>
              <div className="home-step-icon-wrap">
                <Sparkles size={26} />
              </div>
              <h3 className="home-step-title">3. Tip & Celebrate</h3>
              <p className="home-step-text">
                The guest chooses an individual staff member or team pool, selects an amount, and taps Apple Pay, Google Pay, or card. Funds route directly to your account.
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
            <span className="home-section-tag">Zero Friction</span>
            <h2 className="home-section-title">No App. No Account. Just Scan & Tip.</h2>
            <p className="home-section-desc">
              Every extra screen is a lost tip. Compare the old friction-heavy app model with NAPONI’s instant browser experience.
            </p>
          </div>

          <div className="home-friction-comparison">
            {/* Outdated App-Based Model */}
            <div className="home-compare-card traditional">
              <div className="home-compare-header">
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                    Legacy App Tipping
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Old clunky customer experience</span>
                </div>
                <span className="home-compare-tag negative">6+ Minutes</span>
              </div>

              <ul className="home-compare-list">
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>Customer forced to search App Store & download 85MB app</span>
                </li>
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>Account registration, password creation & SMS verification</span>
                </li>
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>Manually typing 16-digit credit card number & billing address</span>
                </li>
                <li className="home-compare-item">
                  <XCircle size={18} className="icon-x" />
                  <span>75% of customers abandon the tip before finishing</span>
                </li>
              </ul>
            </div>

            {/* NAPONI Instant Flow */}
            <div className="home-compare-card naponi">
              <div className="home-compare-header">
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                    The NAPONI Experience
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Pure contactless simplicity</span>
                </div>
                <span className="home-compare-tag positive">6 Seconds</span>
              </div>

              <ul className="home-compare-list">
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>Zero app downloads — works natively in camera & browser</span>
                </li>
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>No login, no password, no spam emails or marketing cookies</span>
                </li>
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>1-tap Apple Pay, Google Pay, or localized bank checkout</span>
                </li>
                <li className="home-compare-item">
                  <CheckCircle2 size={18} className="icon-check" />
                  <span>96% completion rate with immediate staff tip recognition</span>
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
            <span className="home-section-tag">Business Architecture</span>
            <h2 className="home-section-title">Engineered for Transparency & Growth</h2>
            <p className="home-section-desc">
              Everything your venue needs to manage cashless tips across multiple branches, shifts, and team structures.
            </p>
          </div>

          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <Wallet size={24} />
              </div>
              <h3 className="home-feature-title">Direct Bank Settlement</h3>
              <p className="home-feature-desc">
                NAPONI is not a middleman custodial wallet holding your money. Tips settle directly into your configured business account or payment rail.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <Users size={24} />
              </div>
              <h3 className="home-feature-title">Employee-Level Tip Tracking</h3>
              <p className="home-feature-desc">
                Empower your servers, bartenders, and housekeeping staff. Distribute tips to specific team members or pool them automatically per shift.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <QrCode size={24} />
              </div>
              <h3 className="home-feature-title">Dynamic QR Management</h3>
              <p className="home-feature-desc">
                Assign unique QR codes per table, room, or counter. Regenerate or deactivate codes instantly from your dashboard with one click.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="home-feature-title">Real-Time Analytics</h3>
              <p className="home-feature-desc">
                Track tip velocity, peak tipping hours, average tip percentages, and employee leaderboards through an executive-grade dashboard.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <CreditCard size={24} />
              </div>
              <h3 className="home-feature-title">Multi-Payment Flexibility</h3>
              <p className="home-feature-desc">
                Accept major credit cards, Apple Pay, Google Pay, and localized bank transfer rails without managing multiple POS terminals.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="home-feature-title">Zero Hardware Investment</h3>
              <p className="home-feature-desc">
                Forget expensive card terminals with monthly rental fees and paper rolls. NAPONI operates entirely via digital QR infrastructure.
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
              <div className="home-stat-num">+38%</div>
              <div className="home-stat-label">Higher Average Tips</div>
            </div>
            <div>
              <div className="home-stat-num">0 Sec</div>
              <div className="home-stat-label">Customer Sign-Up Time</div>
            </div>
            <div>
              <div className="home-stat-num">100%</div>
              <div className="home-stat-label">Direct Settlement</div>
            </div>
            <div>
              <div className="home-stat-num">10+</div>
              <div className="home-stat-label">Supported Currencies</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. PAYMENT METHODS
          ==================================================================== */}
      <section className="home-section" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <div className="home-container" style={{ textAlign: 'center' }}>
          <span className="home-section-tag">Universal Compatibility</span>
          <h2 className="home-section-title" style={{ fontSize: '2rem' }}>
            Accept Any Payment Method In Seconds
          </h2>
          <p className="home-section-desc" style={{ maxWidth: 620, margin: '0 auto 2rem' }}>
            Customers can pay instantly using their preferred payment methods, with no barriers to completing their tip.
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
              <span>Direct Bank Transfer</span>
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
            <span className="home-section-tag">Versatile Solutions</span>
            <h2 className="home-section-title">Built for High-Touch Service Venues</h2>
            <p className="home-section-desc">
              Whether you manage a single neighborhood bistro or an international hotel brand, NAPONI elevates guest appreciation across every sector.
            </p>
          </div>

          <div className="home-industries-grid">
            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Utensils size={22} />
              </div>
              <h3 className="home-industry-title">Restaurants & Fine Dining</h3>
              <p className="home-industry-desc">
                Place branded QR stands on tables or bill folders. Enable individual server tips or shift-based pooling with zero bill confusion.
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Coffee size={22} />
              </div>
              <h3 className="home-industry-title">Specialty Cafes & Bakeries</h3>
              <p className="home-industry-desc">
                Speed up counter queues. Customers scan the counter QR and tip while their barista crafts their specialty flat white.
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Hotel size={22} />
              </div>
              <h3 className="home-industry-title">Hotels & Hospitality</h3>
              <p className="home-industry-desc">
                Empower bellhops, housekeeping, room service, and concierge staff to receive cashless tips via keycard slips or room displays.
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Wine size={22} />
              </div>
              <h3 className="home-industry-title">Bars, Pubs & Nightlife</h3>
              <p className="home-industry-desc">
                High-volume bar tipping without holding up drink orders. Quick contactless payments even in dim, crowded environments.
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Scissors size={22} />
              </div>
              <h3 className="home-industry-title">Salons, Barbers & Spas</h3>
              <p className="home-industry-desc">
                Clients easily show appreciation to their personal stylists, therapists, and estheticians directly at the styling station or reception.
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Car size={22} />
              </div>
              <h3 className="home-industry-title">Valet, Drivers & Delivery</h3>
              <p className="home-industry-desc">
                Mobile-ready tipping for valet attendants, tour guides, and private transport when guests rarely carry physical cash.
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
                  <strong>Çoklu Şube & Departman Yönetimi</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Tüm şubelerinizi ve lokasyonlarınızı tek merkezden izleyin</div>
                </div>
              </div>
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <Users size={18} />
                </div>
                <div>
                  <strong>Personel & Bahşiş Dağıtımı</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Bireysel, vardiya veya ortak havuz modelleri</div>
                </div>
              </div>
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <CreditCard size={18} />
                </div>
                <div>
                  <strong>Özel POS & ERP Entegrasyonu</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Mevcut kasa ve adisyon sistemlerinize tam uyum</div>
                </div>
              </div>
              <div className="home-corporate-pill">
                <div className="home-corporate-pill-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>Kurumsal SLA & Özel Temsilci</strong>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Öncelikli destek ve 7/24 teknik altyapı güvencesi</div>
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
            <span className="home-section-tag">Global Readiness</span>
            <h2 className="home-section-title" style={{ maxWidth: 700, margin: '0 auto 1rem' }}>
              Built for Businesses and Travelers Worldwide
            </h2>
            <p className="home-section-desc" style={{ maxWidth: 640, margin: '0 auto' }}>
              International tourism demands seamless cross-border tipping. NAPONI is architected to handle multiple currencies, global tourist cards, and international payment rails effortlessly.
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
            <span className="home-section-tag">Enterprise Security</span>
            <h2 className="home-section-title">Zero Custody. Bank-Grade Protection.</h2>
            <p className="home-section-desc">
              Your security and regulatory peace of mind are built into every level of the NAPONI platform.
            </p>
          </div>

          <div className="home-trust-grid">
            <div className="home-trust-card">
              <div className="home-trust-icon-large">
                <Lock size={26} />
              </div>
              <h3 className="home-trust-title">Non-Custodial Architecture</h3>
              <p className="home-trust-desc">
                NAPONI never stores customer deposits or holds merchant funds. All payments route directly to your verified destination account.
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-icon-large">
                <ShieldCheck size={26} />
              </div>
              <h3 className="home-trust-title">End-to-End Encryption</h3>
              <p className="home-trust-desc">
                All communications and QR checkout interactions are guarded by 256-bit TLS/SSL encryption and cryptographically salted tokens.
              </p>
            </div>

            <div className="home-trust-card">
              <div className="home-trust-icon-large">
                <CreditCard size={26} />
              </div>
              <h3 className="home-trust-title">PCI-DSS Compliant Rails</h3>
              <p className="home-trust-desc">
                Card information never touches our servers. Tipping transactions are tokenized via certified Level 1 PCI-DSS compliant providers.
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
              {language === 'tr' ? 'Sektör Rehberleri & Bilgi Merkezi' : 'Industry Guides & Insights'}
            </span>
            <h2 className="home-section-title">
              {language === 'tr'
                ? 'Dijital Bahşiş ve Hizmet Sektörü Rehberleri'
                : 'Digital Tipping & Hospitality Operational Guides'}
            </h2>
            <p className="home-section-desc">
              {language === 'tr'
                ? 'Restoran, kafe ve otellerde temassız bahşiş yönetimi, personel motivasyonu ve yeni nesil ödeme teknolojileri hakkında en güncel yazılarımız.'
                : 'Actionable strategies for restaurants, cafes, and hotels on contactless tipping, tip pool fairness, and frontline team retention.'}
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
                      {language === 'tr' ? 'Devamını Oku →' : 'Read Article →'}
                    </Link>
                  </div>
                </article>
              ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/blog" className="home-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
              <span>{language === 'tr' ? 'Tüm Rehberleri ve Makaleleri İnceleyin' : 'Explore All Guides & Articles'}</span>
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
                <span>All Systems Operational</span>
              </div>
            </div>

            <div>
              <h4 className="home-footer-col-title">Product</h4>
              <ul className="home-footer-links">
                <li><a href="#how-it-works">{t('nav.features')}</a></li>
                <li><a href="#experience">{t('nav.solutions')}</a></li>
                <li><Link to="/solutions/restaurants">Restoranlar</Link></li>
                <li><Link to="/solutions/hotels">Oteller</Link></li>
                <li><Link to="/solutions/cafes">Kafeler</Link></li>
                <li><Link to="/tools/tip-calculator">Bahşiş Hesaplayıcı</Link></li>
                <li><Link to="/tools/tip-split-calculator">Bahşiş Bölüştürücü</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">Platform & Resources</h4>
              <ul className="home-footer-links">
                <li><Link to="/blog">Blog & Rehberler</Link></li>
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
              <h4 className="home-footer-col-title">Language & Region</h4>
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
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>Sektörler</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>Hesaplayıcı</Link>
              <a href="#faq" style={{ color: '#64748b', textDecoration: 'none' }}>FAQ</a>
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
