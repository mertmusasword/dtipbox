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
  Percent
} from 'lucide-react';
import '../../styles/home.css';

export const HomePage: React.FC = () => {
  // Mobile Nav Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <li><a href="#how-it-works" className="home-nav-link">How It Works</a></li>
            <li><a href="#experience" className="home-nav-link">Customer Experience</a></li>
            <li><a href="#benefits" className="home-nav-link">For Businesses</a></li>
            <li><a href="#industries" className="home-nav-link">Industries</a></li>
            <li><a href="#global" className="home-nav-link">Global</a></li>
            <li><a href="#faq" className="home-nav-link">FAQ</a></li>
          </ul>

          <div className="home-nav-actions">
            <Link to="/login" className="home-btn-ghost">
              Sign In
            </Link>
            <Link to="/register" className="home-btn-primary">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>

          <button
            className="home-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="home-mobile-menu">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)}>Customer Experience</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)}>For Businesses</a>
            <a href="#industries" onClick={() => setMobileMenuOpen(false)}>Industries</a>
            <a href="#global" onClick={() => setMobileMenuOpen(false)}>Global Architecture</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/login" className="home-btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
                Sign In
              </Link>
              <Link to="/register" className="home-btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                Get Started
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
                <span>Next-Gen Cashless Tipping Platform</span>
              </div>

              <h1 className="home-hero-title">
                Digital Tipping, <br />
                <span className="home-gradient-text">Reimagined for the Modern World.</span>
              </h1>

              <p className="home-hero-desc">
                Empower your guests to tip in under 6 seconds right from their camera.
                <strong> Zero app downloads, zero sign-ups</strong>, and direct settlements straight to your configured business bank account.
              </p>

              <div className="home-hero-cta-group">
                <Link to="/register" className="home-btn-primary home-btn-hero-large">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <a href="#simulator" className="home-btn-secondary">
                  <Smartphone size={18} /> Try Interactive Demo
                </a>
              </div>

              <div className="home-hero-trust-row">
                <div className="home-trust-item">
                  <CheckCircle2 size={16} />
                  <span>No App Required</span>
                </div>
                <div className="home-trust-item">
                  <CheckCircle2 size={16} />
                  <span>Direct Bank Payouts</span>
                </div>
                <div className="home-trust-item">
                  <CheckCircle2 size={16} />
                  <span>2-Minute Onboarding</span>
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
                      <div className="home-phone-amounts-label">Choose Tip Amount</div>
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
                      <div className="home-phone-amounts-label">Payment Method</div>
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
                          <span>Credit or Debit Card</span>
                          {simPayment === 'card' && <Check size={14} color="#6366f1" />}
                        </button>
                      </div>

                      {/* Submit Tip Button */}
                      <button type="submit" className="home-phone-tip-submit">
                        <Zap size={16} /> Send ${simAmount}.00 Tip Now
                      </button>
                    </form>
                  ) : (
                    /* Instant Confirmation View */
                    <div className="home-phone-success">
                      <div className="home-phone-success-icon">
                        <Check size={24} />
                      </div>
                      <div className="home-phone-success-title">Tip Completed!</div>
                      <div className="home-phone-success-sub">
                        ${simAmount}.00 was transferred directly to {simStaff}. A receipt has been issued instantly.
                      </div>
                      <button
                        type="button"
                        className="home-phone-reset-btn"
                        onClick={handleSimReset}
                      >
                        Reset Simulator
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
          11. FREQUENTLY ASKED QUESTIONS (FAQ)
          ==================================================================== */}
      <section className="home-section" id="faq">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">Got Questions?</span>
            <h2 className="home-section-title">Frequently Asked Questions</h2>
            <p className="home-section-desc">
              Everything you need to know about setting up and running digital tipping with NAPONI.
            </p>
          </div>

          <div className="home-faq-accordion">
            {[
              {
                q: 'What is NAPONI and how does it work?',
                a: 'NAPONI is a modern digital tipping platform for hospitality and service venues. Businesses register, configure their payment account, and generate QR codes. Customers simply point their smartphone camera at the QR code, select an amount, and tip using Apple Pay, Google Pay, or card in seconds. No apps or customer accounts are needed.'
              },
              {
                q: 'Do customers need to download an application to tip?',
                a: 'No! One of NAPONI’s strongest advantages is zero app downloads. Guests open the tipping screen instantly in their native mobile browser directly from their camera or QR reader. This results in a 96% completion rate.'
              },
              {
                q: 'How does the business receive the tipped money?',
                a: 'NAPONI operates on a non-custodial model. We do not hold your money in an intermediary wallet. Funds are deposited directly into the merchant’s configured bank account or payment provider according to your setup.'
              },
              {
                q: 'Can tips be attributed to individual employees?',
                a: 'Yes. You can add your team members in the Business Dashboard and generate QR codes for individual staff (e.g. servers, stylists) or enable pooled tipping across entire shifts or venues.'
              },
              {
                q: 'How long does it take to get started?',
                a: 'Less than 2 minutes. Sign up for a business account, enter your venue details and payout information, and you can immediately generate and print QR codes.'
              },
              {
                q: 'Is NAPONI secure for both businesses and customers?',
                a: 'Absolutely. NAPONI does not store sensitive cardholder data. All checkout flows utilize 256-bit SSL encryption and tokenized payment processing adhering to strict PCI-DSS standards.'
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
              Ready to Eliminate Cashless Tipping Friction?
            </h2>
            <p className="home-cta-sub">
              Join forward-thinking restaurants, boutique hotels, and service businesses worldwide. Set up your venue in 2 minutes.
            </p>
            <div className="home-cta-btn-wrap">
              <Link to="/register" className="home-btn-primary home-btn-hero-large">
                Create Your Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="home-btn-secondary" style={{ padding: '0.9rem 1.8rem' }}>
                Sign In to Dashboard
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
                The next-generation digital tipping infrastructure empowering hospitality businesses, service staff, and international travelers.
              </p>
              <div className="home-footer-status-pill">
                <span className="pulse-dot" />
                <span>All Systems Operational</span>
              </div>
            </div>

            <div>
              <h4 className="home-footer-col-title">Product</h4>
              <ul className="home-footer-links">
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#experience">Customer Journey</a></li>
                <li><a href="#benefits">Business Benefits</a></li>
                <li><a href="#industries">Industries</a></li>
                <li><a href="#global">Multi-Currency</a></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">Platform</h4>
              <ul className="home-footer-links">
                <li><Link to="/register">Create Business Account</Link></li>
                <li><Link to="/login">Merchant Sign In</Link></li>
                <li><a href="#faq">Support & FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">Security & Compliance</h4>
              <ul className="home-footer-links">
                <li><a href="#benefits">Non-Custodial Payouts</a></li>
                <li><a href="#experience">256-bit SSL Protection</a></li>
                <li><a href="#global">PCI-DSS Tokenized Rails</a></li>
              </ul>
            </div>
          </div>

          <div className="home-footer-bottom">
            <div>
              © {new Date().getFullYear()} NAPONI Digital Tipping Platform. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
