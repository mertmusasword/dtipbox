import React, { useState, useMemo, useEffect } from 'react';
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
  BarChart3,
  Sliders,
  Download,
  Award,
  CheckCheck,
  LayoutDashboard,
  Coins,
  Printer,
  BadgeCheck,
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

  // Business Suite Mockup active tab ('analytics' | 'pooling' | 'qr')
  const [suiteTab, setSuiteTab] = useState<'analytics' | 'pooling' | 'qr'>('analytics');

  // Adaptive phone simulator configs based on active language
  const simConfig = useMemo(() => {
    switch (language) {
      case 'tr':
        return {
          currency: '₺',
          defaultAmount: 50,
          amounts: [20, 50, 100, 200],
          venueName: 'The Grand Bistro & Lounge',
          tableText: 'Masa 14 • Hızlı Bahşiş',
          assignedLabel: 'Hizmet Veren Personel',
          staffOptions: [
            { id: 'Emre K. (Garson)', label: 'Emre K. (Garson)' },
            { id: 'Selin B. (Barmen)', label: 'Selin B. (Barmen)' },
            { id: 'Ortak Havuz (Tüm Ekip)', label: 'Ortak Havuz (Tüm Ekip)' },
          ],
          defaultStaff: 'Emre K. (Garson)',
        };
      case 'de':
        return {
          currency: '€',
          defaultAmount: 5,
          amounts: [3, 5, 10, 20],
          venueName: 'The Grand Bistro & Lounge',
          tableText: 'Tisch 14 • Trinkgeld',
          assignedLabel: 'Servicekraft',
          staffOptions: [
            { id: 'Lukas M. (Service)', label: 'Lukas M. (Service)' },
            { id: 'Sophie B. (Bar)', label: 'Sophie B. (Bar)' },
            { id: 'Team Pool (Alle)', label: 'Team Pool (Alle)' },
          ],
          defaultStaff: 'Lukas M. (Service)',
        };
      case 'fr':
        return {
          currency: '€',
          defaultAmount: 5,
          amounts: [3, 5, 10, 20],
          venueName: 'The Grand Bistro & Lounge',
          tableText: 'Table 14 • Pourboire rapide',
          assignedLabel: 'Membre de l\'équipe',
          staffOptions: [
            { id: 'Julien D. (Serveur)', label: 'Julien D. (Serveur)' },
            { id: 'Camille V. (Bar)', label: 'Camille V. (Bar)' },
            { id: 'Cagnotte d\'équipe', label: 'Cagnotte d\'équipe' },
          ],
          defaultStaff: 'Julien D. (Serveur)',
        };
      case 'es':
        return {
          currency: '€',
          defaultAmount: 5,
          amounts: [3, 5, 10, 20],
          venueName: 'The Grand Bistro & Lounge',
          tableText: 'Mesa 14 • Propina rápida',
          assignedLabel: 'Personal de sala',
          staffOptions: [
            { id: 'Mateo R. (Camarero)', label: 'Mateo R. (Camarero)' },
            { id: 'Lucía S. (Bar)', label: 'Lucía S. (Bar)' },
            { id: 'Bote del equipo', label: 'Bote del equipo' },
          ],
          defaultStaff: 'Mateo R. (Camarero)',
        };
      default: // 'en' and others
        return {
          currency: '$',
          defaultAmount: 5,
          amounts: [3, 5, 10, 20],
          venueName: 'The Grand Bistro & Lounge',
          tableText: 'Table 14 • Quick Tip',
          assignedLabel: 'Assigned Staff Member',
          staffOptions: [
            { id: 'Alex R. (Server)', label: 'Alex R. (Server)' },
            { id: 'Elena M. (Bartender)', label: 'Elena M. (Bartender)' },
            { id: 'Team Pool (All Staff)', label: 'Team Pool (All Staff)' },
          ],
          defaultStaff: 'Alex R. (Server)',
        };
    }
  }, [language]);

  // Hero Simulator Interactive State
  const [simAmount, setSimAmount] = useState<number>(simConfig.defaultAmount);
  const [simStaff, setSimStaff] = useState<string>(simConfig.defaultStaff);
  const [simPayment, setSimPayment] = useState<'apple' | 'card' | 'wire'>('apple');
  const [simSuccess, setSimSuccess] = useState<boolean>(false);

  // Sync simulator defaults whenever language changes
  useEffect(() => {
    setSimAmount(simConfig.defaultAmount);
    setSimStaff(simConfig.defaultStaff);
  }, [simConfig]);

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
                      <Building2 size={12} /> {simConfig.venueName}
                    </div>
                    <div className="home-phone-venue-title">{simConfig.tableText}</div>
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
                            <div className="home-phone-staff-role">{simConfig.assignedLabel}</div>
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
                          {simConfig.staffOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Amount Selection */}
                      <div className="home-phone-amounts-label">{t('tip.selectAmountTitle')}</div>
                      <div className="home-phone-amounts-grid">
                        {simConfig.amounts.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            className={`home-amount-chip ${simAmount === amt ? 'active' : ''}`}
                            onClick={() => setSimAmount(amt)}
                          >
                            {simConfig.currency}{amt}
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
                        <Zap size={16} /> {t('tip.payBtn')} {simConfig.currency}{simAmount}.00
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
          3B. BUSINESS & MANAGER SUITE SHOWCASE (OPERATIONAL DASHBOARD)
          ==================================================================== */}
      <section className="home-section" id="suite" style={{ paddingTop: 30, paddingBottom: 70 }}>
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.suiteBadge')}</span>
            <h2 className="home-section-title">{t('home.suiteTitle')}</h2>
            <p className="home-section-desc">
              {t('home.suiteSubtitle')}
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="home-suite-tabs">
            <button
              type="button"
              className={`home-suite-tab-btn ${suiteTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setSuiteTab('analytics')}
            >
              <BarChart3 size={16} />
              <span>{t('home.suiteTab1')}</span>
            </button>
            <button
              type="button"
              className={`home-suite-tab-btn ${suiteTab === 'pooling' ? 'active' : ''}`}
              onClick={() => setSuiteTab('pooling')}
            >
              <Coins size={16} />
              <span>{t('home.suiteTab2')}</span>
            </button>
            <button
              type="button"
              className={`home-suite-tab-btn ${suiteTab === 'qr' ? 'active' : ''}`}
              onClick={() => setSuiteTab('qr')}
            >
              <QrCode size={16} />
              <span>{t('home.suiteTab3')}</span>
            </button>
          </div>

          {/* macOS Style Glassmorphic Dashboard Window */}
          <div className="home-dashboard-frame">
            {/* Title Bar */}
            <div className="home-dash-titlebar">
              <div className="home-dash-dots">
                <span className="home-dash-dot red" />
                <span className="home-dash-dot yellow" />
                <span className="home-dash-dot green" />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <LayoutDashboard size={14} style={{ color: '#818cf8' }} />
                <span>naponi.app/portal/dashboard • {simConfig.venueName}</span>
              </div>
              <div className="home-dash-pill">
                <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                <span>Live Operations</span>
              </div>
            </div>

            {/* Dashboard Content per Tab */}
            <div className="home-dash-body">
              {suiteTab === 'analytics' && (
                <div>
                  {/* KPI Row */}
                  <div className="home-dash-kpis">
                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{language === 'tr' ? 'Bugünkü Toplam Bahşiş' : 'Today\'s Total Tips'}</span>
                        <TrendingUp size={14} style={{ color: '#10b981' }} />
                      </div>
                      <div className="home-dash-kpi-val">
                        {simConfig.currency}{language === 'tr' ? '14.850' : '1,485'}.00
                      </div>
                      <div className="home-dash-kpi-sub">
                        <span>↑ 24.8%</span>
                        <span style={{ color: '#94a3b8' }}>{language === 'tr' ? 'geçen haftaya göre' : 'vs last week'}</span>
                      </div>
                    </div>

                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{language === 'tr' ? 'Ortalama Bahşiş Oranı' : 'Average Tip Rate'}</span>
                        <Percent size={14} style={{ color: '#6366f1' }} />
                      </div>
                      <div className="home-dash-kpi-val">16.4%</div>
                      <div className="home-dash-kpi-sub" style={{ color: '#6366f1' }}>
                        <span>★ 48 {language === 'tr' ? 'işlem' : 'transactions'}</span>
                      </div>
                    </div>

                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{language === 'tr' ? 'Vardiyadaki Personel' : 'Active Staff on Shift'}</span>
                        <Users size={14} style={{ color: '#38bdf8' }} />
                      </div>
                      <div className="home-dash-kpi-val">8 {language === 'tr' ? 'Kişi' : 'Staff'}</div>
                      <div className="home-dash-kpi-sub" style={{ color: '#38bdf8' }}>
                        <span>✓ {language === 'tr' ? 'Tümü aktif' : 'All active'}</span>
                      </div>
                    </div>

                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{language === 'tr' ? 'Misafir Memnuniyeti' : 'Guest Rating'}</span>
                        <Award size={14} style={{ color: '#fbbf24' }} />
                      </div>
                      <div className="home-dash-kpi-val">4.9 / 5.0</div>
                      <div className="home-dash-kpi-sub" style={{ color: '#fbbf24' }}>
                        <span>98% {language === 'tr' ? 'olumlu geri bildirim' : 'positive review'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Transaction Feed Preview */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={15} style={{ color: '#818cf8' }} />
                        <span>{language === 'tr' ? 'Canlı Bahşiş Akışı' : 'Real-Time Tipping Feed'}</span>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {language === 'tr' ? 'Son 10 Dakika' : 'Last 10 mins'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {[
                        { table: language === 'tr' ? 'Masa 14' : 'Table 14', staff: simConfig.staffOptions[0].label, amount: `${simConfig.currency}${language === 'tr' ? '150.00' : '15.00'}`, time: language === 'tr' ? '2 dk önce' : '2m ago', method: ' Apple Pay' },
                        { table: language === 'tr' ? 'Masa 08' : 'Table 08', staff: simConfig.staffOptions[1]?.label || 'Elena M.', amount: `${simConfig.currency}${language === 'tr' ? '100.00' : '10.00'}`, time: language === 'tr' ? '5 dk önce' : '5m ago', method: 'Credit Card' },
                        { table: language === 'tr' ? 'Bar Stand 02' : 'Bar Counter 02', staff: language === 'tr' ? 'Ortak Havuz' : 'Team Pool', amount: `${simConfig.currency}${language === 'tr' ? '250.00' : '25.00'}`, time: language === 'tr' ? '9 dk önce' : '9m ago', method: 'Google Pay' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            fontSize: '0.82rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            <div>
                              <strong style={{ color: '#ffffff' }}>{item.table}</strong>
                              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>• {item.staff}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.method}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.time}</span>
                            <strong style={{ color: '#4ade80', fontSize: '0.95rem' }}>+{item.amount}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {suiteTab === 'pooling' && (
                <div>
                  {/* Hybrid Pool Breakdown Banner */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#a5b4fc', marginBottom: '0.2rem' }}>
                        💳 {language === 'tr' ? 'Dijital QR Bahşişleri' : 'Digital QR Tips'}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                        {simConfig.currency}{language === 'tr' ? '9.200' : '920'}.00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Naponi {language === 'tr' ? 'otomatik tahsilat' : 'instant settlement'}</div>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#86efac', marginBottom: '0.2rem' }}>
                        💵 {language === 'tr' ? 'Fiziksel Tip Box (Nakit)' : 'Cash Tip Box'}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>
                        {simConfig.currency}{language === 'tr' ? '3.800' : '380'}.00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#86efac' }}>%0 {language === 'tr' ? 'komisyonsuz elden dağıtım' : 'fee cash payout'}</div>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#fde047', marginBottom: '0.2rem' }}>
                        🏧 {language === 'tr' ? 'İşletme Kendi POS\'u' : 'Venue POS Tips'}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#facc15' }}>
                        {simConfig.currency}{language === 'tr' ? '1.800' : '180'}.00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Z-Raporu {language === 'tr' ? 'entegrasyonu' : 'reconciliation'}</div>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, marginBottom: '0.2rem' }}>
                        ✨ {language === 'tr' ? 'Dağıtılacak Net Havuz' : 'Net Shift Pool'}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4ade80' }}>
                        {simConfig.currency}{language === 'tr' ? '14.524' : '1,452'}.40
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>4 {language === 'tr' ? 'personel paylaştırıldı' : 'staff allocated'}</div>
                    </div>
                  </div>

                  {/* Staff Distribution Table Mockup */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{language === 'tr' ? 'Vardiya Hak Ediş Simülasyonu' : 'Shift Payout Breakdown'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCheck size={14} /> {language === 'tr' ? 'Eşit ve Puan Bazlı Dağıtım' : 'Automated Point-Weighted Split'}
                      </span>
                    </div>
                    <div style={{ padding: '0.5rem 1rem' }}>
                      {[
                        { name: simConfig.staffOptions[0].label, role: language === 'tr' ? 'Salon Garsonu' : 'Senior Server', weight: '1.0x', net: `${simConfig.currency}${language === 'tr' ? '4.150' : '415'}.00`, cash: `${simConfig.currency}${language === 'tr' ? '1.085' : '108'}.50`, bank: `${simConfig.currency}${language === 'tr' ? '3.065' : '306'}.50` },
                        { name: simConfig.staffOptions[1]?.label || 'Elena M.', role: language === 'tr' ? 'Barmen / Mixologist' : 'Head Bartender', weight: '1.0x', net: `${simConfig.currency}${language === 'tr' ? '4.150' : '415'}.00`, cash: `${simConfig.currency}${language === 'tr' ? '1.085' : '108'}.50`, bank: `${simConfig.currency}${language === 'tr' ? '3.065' : '306'}.50` },
                        { name: language === 'tr' ? 'Cemil A.' : 'David K.', role: language === 'tr' ? 'Mutfak Destek' : 'Barback / Support', weight: '0.75x', net: `${simConfig.currency}${language === 'tr' ? '3.112' : '311'}.25`, cash: `${simConfig.currency}${language === 'tr' ? '813' : '81'}.38`, bank: `${simConfig.currency}${language === 'tr' ? '2.298' : '229'}.87` },
                        { name: language === 'tr' ? 'Merve S.' : 'Sarah T.', role: language === 'tr' ? 'Hostes / Karşılama' : 'Host / Greeter', weight: '0.75x', net: `${simConfig.currency}${language === 'tr' ? '3.112' : '311'}.25`, cash: `${simConfig.currency}${language === 'tr' ? '813' : '81'}.38`, bank: `${simConfig.currency}${language === 'tr' ? '2.298' : '229'}.87` },
                      ].map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: idx !== 3 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none', fontSize: '0.82rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{s.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.role} • <span style={{ color: '#818cf8' }}>{s.weight}</span></div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#4ade80' }}>{s.net}</div>
                            <div style={{ fontSize: '0.68rem', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.1rem' }}>
                              <span style={{ color: '#86efac' }}>💵 {s.cash}</span>
                              <span style={{ color: '#93c5fd' }}>💳 {s.bank}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {suiteTab === 'qr' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {/* Table QR Generator Card */}
                    <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                          <QrCode size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{language === 'tr' ? 'Masa Standı QR Kodları' : 'Table Tent QR Studio'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{language === 'tr' ? '1-48 arası tüm masalar hazır' : 'Tables 1–48 generated'}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                        {language === 'tr'
                          ? 'Masa numaranıza ve mekan logonuzla özelleştirilmiş, yüksek çözünürlüklü vektörel PDF ve SVG çıktıları anında alın.'
                          : 'Download high-res vector PDF and SVG print templates with your logo, table numbers, and custom tip prompts.'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Printer size={12} /> {language === 'tr' ? 'Baskıya Hazır PDF' : 'Print-Ready PDF'}
                        </span>
                        <span className="badge badge-primary" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Download size={12} /> SVG
                        </span>
                      </div>
                    </div>

                    {/* Staff Badge Generator Card */}
                    <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                          <BadgeCheck size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{language === 'tr' ? 'Personel Yaka Kartı & NFC' : 'Server Badges & NFC Pins'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{language === 'tr' ? 'Garson & Barmen özel kodlar' : 'Individual staff badges'}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                        {language === 'tr'
                          ? 'Garson ve barmenlerinize özel QR yaka kartları oluşturun. Müşteriler doğrudan sevdikleri garsona özel teşekkür edip bahşiş iletsin.'
                          : 'Equip servers and valets with stylish wearable badges. Guests scan to directly reward exceptional personal hospitality.'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCheck size={12} /> {language === 'tr' ? 'Yaka Kartı Şablonu' : 'Badge Template'}
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                          NFC Tag Support
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
          4B. PHYSICAL TOUCHPOINTS & HARDWARE-FREE SETUP
          ==================================================================== */}
      <section className="home-section" id="touchpoints" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">{t('home.touchBadge')}</span>
            <h2 className="home-section-title">{t('home.touchTitle')}</h2>
            <p className="home-section-desc">
              {t('home.touchSubtitle')}
            </p>
          </div>

          <div className="home-touch-grid">
            {/* 1. Acrylic Table Tents */}
            <div className="home-touch-card">
              <div className="home-touch-preview-wrap">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ width: 72, height: 96, margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#6366f1' }} />
                    <QrCode size={34} style={{ color: '#ffffff' }} />
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#a5b4fc' }}>TABLE 14</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.65rem', display: 'block' }}>
                    Acrylic & Wood Table Tent
                  </span>
                </div>
              </div>
              <h3 className="home-touch-title">{t('home.touchCard1Title')}</h3>
              <p className="home-touch-desc">{t('home.touchCard1Desc')}</p>
            </div>

            {/* 2. Wearable Server Badges */}
            <div className="home-touch-card">
              <div className="home-touch-preview-wrap">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ width: 120, height: 72, margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(99, 102, 241, 0.35)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.85rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>Alex R.</div>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>Server</div>
                      <div style={{ fontSize: '0.5rem', color: '#10b981', marginTop: '0.2rem' }}>★ 4.9 Rating</div>
                    </div>
                    <QrCode size={36} style={{ color: '#818cf8' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.65rem', display: 'block' }}>
                    Magnetic Wearable Badge / Lanyard
                  </span>
                </div>
              </div>
              <h3 className="home-touch-title">{t('home.touchCard2Title')}</h3>
              <p className="home-touch-desc">{t('home.touchCard2Desc')}</p>
            </div>

            {/* 3. Bill Folders & Receipts */}
            <div className="home-touch-card">
              <div className="home-touch-preview-wrap">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ width: 92, height: 96, margin: '0 auto', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '0.52rem', color: '#94a3b8', letterSpacing: '0.05em' }}>GUEST CHECK</div>
                    <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <QrCode size={32} style={{ color: '#ffffff' }} />
                    <div style={{ fontSize: '0.52rem', color: '#10b981', fontWeight: 600 }}>SCAN TO TIP</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.65rem', display: 'block' }}>
                    Leather Check Presenter & Thermal Print
                  </span>
                </div>
              </div>
              <h3 className="home-touch-title">{t('home.touchCard3Title')}</h3>
              <p className="home-touch-desc">{t('home.touchCard3Desc')}</p>
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
