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
  UtensilsCrossed,
  Coffee,
  Wine,
  Hotel,
  Calculator,
  Wifi,
  BookOpen,
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
  Handshake,
  FileText,
  Cpu,
  Tag,
  Star,
  Mail,
  Radio,
  Play,
  Youtube,
  Instagram,
  LogIn,
  Truck,
  Tent,
} from 'lucide-react';
import '../../styles/home.css';
import { useLanguage, LanguageSelector } from '../../i18n';
import { getHomeText } from '../../i18n/homeLocales';
import { trackBusinessRegisterStarted, trackFounderCtaClicked } from '../../analytics';
import { CorporateApplicationModal } from '../../components/CorporateApplicationModal';
import { SupportTicketModal } from '../../components/SupportTicketModal';
import { LegalModal, LegalTab } from '../../components/LegalModal';
import { CookieBanner } from '../../components/CookieBanner';
import { SeoHead } from '../../components/SeoHead';
import { UserNavbarAction } from '../../components/UserNavbarAction';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const ht = (key: any, params?: any) => getHomeText(key, language, params);

  // Mobile Nav Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Corporate Application Modal State
  const [corporateModalOpen, setCorporateModalOpen] = useState(false);

  // Support Ticket Modal State
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Video Showcase Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Legal Modal State (KVKK, Privacy, Terms, Cookies)
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('kvkk');
  const openLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

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
  const [simTab, setSimTab] = useState<'tip' | 'menu' | 'wifi' | 'review'>('tip');
  const [simAmount, setSimAmount] = useState<number>(simConfig.defaultAmount);
  const [simStaff, setSimStaff] = useState<string>(simConfig.defaultStaff);
  const [simPayment, setSimPayment] = useState<'apple' | 'card' | 'wire'>('apple');
  const [simSuccess, setSimSuccess] = useState<boolean>(false);
  const [simWifiConnected, setSimWifiConnected] = useState<boolean>(false);
  const [simReviewGiven, setSimReviewGiven] = useState<boolean>(false);

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

  const isTr = language === 'tr';

  // 14-Point Comparative Matrix for "Naponi Farkı" section
  const diffItems = useMemo(() => {
    return [
      {
        topic: isTr ? 'QR Kullanımı' : 'QR Scope',
        ordinary: isTr ? 'Sadece bahşiş için QR.' : 'QR code only for tips.',
        naponi: isTr ? 'Tek QR: Bahşiş + Menü + Wi-Fi + Fırsatlar.' : 'One QR: Tipping + Menu + Wi-Fi + Specials.',
      },
      {
        topic: isTr ? 'Google Puanı' : 'Google Rating',
        ordinary: isTr ? 'Bahşiş sisteminden bağımsız.' : 'Isolated from reviews & rating.',
        naponi: isTr
          ? 'Google İtibar Kalkanı: Olumlu deneyimi Google\'a yönlendirir, olumsuz geri bildirimi işletme içinde karşılar.'
          : 'Google Reputation Shield: 5-star guests route to Google Maps; critical feedback stays private in-house.',
      },
      {
        topic: isTr ? 'Bahşiş Kaynakları' : 'Tip Sources',
        ordinary: isTr ? 'Genellikle yalnızca QR üzerinden gelen bahşiş.' : 'Typically QR tips only.',
        naponi: isTr
          ? 'Kendi Ödeme Sağlayıcınız / Linkiniz + FAST / IBAN + Nakit kayıtları tek sistemde.'
          : 'Unified management for Hosted Payment Links + Direct Bank/IBAN + Cash records.',
      },
      {
        topic: isTr ? 'Bahşiş Dağıtımı' : 'Tip Pooling & Distribution',
        ordinary: isTr ? 'Gün sonunda manuel hesaplama ve dağıtım.' : 'Manual calculation and cash sorting at closing.',
        naponi: isTr
          ? 'Hibrit Bahşiş Havuzu: Vardiya, çalışan ve belirlenen puanlara göre adil dağıtım.'
          : 'Hybrid Tip Pool: Fair automated distribution by shifts, staff roles, and custom point weights.',
      },
      {
        topic: isTr ? 'Çalışan Yönetimi' : 'Staff Management',
        ordinary: isTr ? 'Sınırlı çalışan yönetimi.' : 'Limited staff oversight.',
        naponi: isTr
          ? 'Çalışan bazlı şeffaf bahşiş takibi ve dağıtımı.'
          : 'Transparent staff-level tip tracking, shift logs, and individual analytics.',
      },
      {
        topic: isTr ? 'Turistler' : 'Foreign Guests & Tourists',
        ordinary: isTr ? 'Sınırlı dil ve müşteri deneyimi.' : 'Limited language support and confusing checkout.',
        naponi: isTr
          ? '11 dilde otomatik algılama ve telefon diline göre akıcı deneyim.'
          : '11 languages auto-detected instantly based on guest phone language.',
      },
      {
        topic: isTr ? 'Ödeme ve Tahsilat' : 'Payment & Settlements',
        ordinary: isTr ? 'Aracı platform parayı günlerce bloke eder veya yüksek komisyon keser.' : 'Platform holds merchant funds for days or takes heavy commission.',
        naponi: isTr
          ? 'Sıfır Bloke, Sıfır Aracı: Ödemeler doğrudan kendi ödeme sağlayıcınıza veya banka hesabınıza geçer.'
          : 'Zero Held Funds, Zero Intermediary: Payments settle directly into your own merchant account or bank.',
      },
      {
        topic: isTr ? 'Dijital Menü' : 'Digital Menu',
        ordinary: isTr ? 'Menü için ayrı QR gerekir.' : 'Requires a separate physical menu QR sticker.',
        naponi: isTr ? 'Aynı QR üzerinden dijital menü.' : 'Integrated digital menu directly accessible on the same QR.',
      },
      {
        topic: isTr ? 'Wi-Fi' : 'Guest Wi-Fi',
        ordinary: isTr ? 'Ayrı QR, kart veya şifre.' : 'Separate tent cards, printed slips, or verbal passwords.',
        naponi: isTr ? 'Aynı QR üzerinden Wi-Fi erişimi.' : 'Instant 1-tap Wi-Fi connection right from the table QR.',
      },
      {
        topic: isTr ? 'Fırsatlar' : 'Specials & Offers',
        ordinary: isTr ? 'Ayrı kampanya sistemleri.' : 'Fragmented marketing or separate campaign tools.',
        naponi: isTr
          ? 'Aynı müşteri deneyimi içinde fırsatlar ve kampanyalar.'
          : 'Promos, happy hour deals, and daily specials inside the same guest flow.',
      },
      {
        topic: isTr ? 'Sadakat' : 'Loyalty Program',
        ordinary: isTr ? 'Ayrı bir sadakat sistemi gerekir.' : 'Requires separate loyalty software, apps, or stamp cards.',
        naponi: isTr
          ? 'QR deneyimine bağlı dijital sadakat altyapısı.'
          : 'Built-in digital loyalty tied directly to table QR scans.',
      },
      {
        topic: isTr ? 'İşletme Yönetimi' : 'Operations Management',
        ordinary: isTr ? 'Birden fazla araç ve sistem.' : 'Multiple disconnected tools, tabs, and paper logs.',
        naponi: isTr ? 'Tek merkezi panelden yönetim.' : 'Single centralized manager portal for complete control.',
      },
      {
        topic: isTr ? 'Marka Deneyimi' : 'Brand Identity',
        ordinary: isTr ? 'Üçüncü taraf sistem hissi.' : 'Feels like a generic third-party payment utility.',
        naponi: isTr
          ? 'İşletmenin kendi markasıyla bütünleşen müşteri deneyimi.'
          : 'White-glove guest experience unified with your venue’s brand and logo.',
      },
      {
        topic: isTr ? 'Genel Yaklaşım' : 'Core Philosophy',
        ordinary: isTr ? 'Bahşiş toplamak.' : 'Just collecting tips.',
        naponi: isTr
          ? 'Bahşiş + müşteri deneyimi + dijital hizmetleri tek ekosistemde birleştirmek.'
          : 'Unifying tips + guest delight + digital hospitality into a single ecosystem.',
      },
    ];
  }, [isTr]);

  const handleSimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimSuccess(true);
  };

  const handleSimReset = () => {
    setSimSuccess(false);
  };

  return (
    <div className="home-wrapper">
      <SeoHead
        title={t('home.metaTitle')}
        description={t('home.metaDesc')}
        canonicalUrl={language === 'tr' ? 'https://www.naponi.com/tr' : 'https://www.naponi.com/'}
        keywords={[
          'digital tipping',
          'QR code tipping',
          'restaurant tips',
          'cashless tipping',
          'hospitality payments',
          'dijital bahşiş',
          'qr bahşiş sistemi',
        ]}
        alternateLanguages={[
          { lang: 'x-default', url: 'https://www.naponi.com/' },
          { lang: 'en', url: 'https://www.naponi.com/' },
          { lang: 'tr', url: 'https://www.naponi.com/tr' },
        ]}
      />
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
            <li><a href="#pos-integrations" className="home-nav-link">{isTr ? 'POS Katmanı' : 'POS Layer'}</a></li>
            <li><a href="#naponi-farki" className="home-nav-link" style={{ color: '#a5b4fc', fontWeight: 600 }}>{ht('whyNaponi')}</a></li>
            <li><a href="#industries" className="home-nav-link">{t('nav.solutions')}</a></li>
            <li><Link to="/technology-partners" className="home-nav-link" style={{ color: '#38bdf8' }}>{ht('techPartners')}</Link></li>
            <li><Link to="/guides" className="home-nav-link">{ht('guides')}</Link></li>
            <li><a href="#faq" className="home-nav-link">{t('nav.faq')}</a></li>
          </ul>

          <div className="home-nav-actions">
            <LanguageSelector variant="navbar" />
            <button
              type="button"
              className="home-nav-support-btn"
              onClick={() => setSupportModalOpen(true)}
              aria-label={t('support.widgetBtn')}
              title={t('support.widgetBtn')}
            >
              <Headphones size={17} />
            </button>
            <UserNavbarAction
              variant="desktop"
              onRegisterClick={() => trackBusinessRegisterStarted('navbar_desktop_cta')}
            />
          </div>

          <div className="home-mobile-controls">
            <LanguageSelector variant="flagOnly" />
            <UserNavbarAction
              variant="mobile-bar"
              onRegisterClick={() => trackBusinessRegisterStarted('navbar_mobile_cta')}
            />
            <button
              className="home-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.toggleMenu')}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Dropdown Menu (Mounted outside header to guarantee full viewport height without backdrop-filter clipping) */}
      {mobileMenuOpen && (
        <div className="home-mobile-menu">
          {/* 1. TOP QUICK ACTIONS: Instant 1-tap access to Login & Register OR Logged-in User Profile */}
          <UserNavbarAction
            variant="mobile-drawer"
            onRegisterClick={() => trackBusinessRegisterStarted('mobile_drawer_cta')}
            onItemClick={() => setMobileMenuOpen(false)}
          />

          {/* 2. MAIN NAVIGATION */}
          <div className="home-mobile-menu-links">
            <a href="#how-it-works" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{t('nav.features')}</span>
            </a>
            <a href="#pos-integrations" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>⚡ {isTr ? 'POS Katmanı' : 'POS Layer'}</span>
            </a>
            <a href="#naponi-farki" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#a5b4fc', fontWeight: 600 }}>
              <span>✨ {ht('whyNaponi')}</span>
            </a>
            <a href="#industries" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{t('nav.solutions')}</span>
            </a>
            <Link to="/technology-partners" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38bdf8', fontWeight: 600 }}>
              <span>{ht('techPartnersNav')}</span>
            </Link>
            <a href="#faq" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{t('nav.faq')}</span>
            </a>
          </div>

          {/* 3. FREE TOOLS & GUIDES (COMPACT 2x2 GRID) */}
          <div>
            <div className="home-mobile-menu-section-label">
              {ht('freeToolsGuides')}
            </div>
            <div className="home-mobile-tools-grid">
              <Link to="/tools/free-hospitality-qr-generator" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>📱 {ht('qrMaker')}</span>
              </Link>
              <Link to="/tools/restaurant-tip-pool-calculator" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>📊 {ht('shiftPool')}</span>
              </Link>
              <Link to="/compare/card-machine-vs-qr-tipping" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>⚖️ {ht('posVsQr')}</span>
              </Link>
              <Link to="/guides" className="home-mobile-tool-card" onClick={() => setMobileMenuOpen(false)}>
                <span>🌍 {ht('guides')}</span>
              </Link>
            </div>
          </div>

          {/* 4. LIVE SUPPORT */}
          <button
            type="button"
            className="home-btn-ghost"
            onClick={() => {
              setMobileMenuOpen(false);
              setSupportModalOpen(true);
            }}
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1rem', fontSize: '0.88rem', marginTop: '0.2rem' }}
          >
            <Headphones size={15} />
            <span>{t('support.widgetBtn')}</span>
          </button>
        </div>
      )}

      {/* ====================================================================
          2. HERO SECTION WITH INTERACTIVE SMARTPHONE SIMULATOR
          ==================================================================== */}
      <section className="home-hero-section">
        <div className="home-container">
          <div className="home-hero-grid">
            {/* Left Hero Column */}
            <div className="home-hero-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                <div className="home-hero-badge" style={{ margin: 0, background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}>
                  <Sparkles size={13} />
                  <span>NAPONI • Smart QR for Hospitality</span>
                </div>
                <div className="home-hero-badge" style={{ margin: 0, background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.35)', color: '#facc15' }}>
                  <Award size={14} className="sparkle" />
                  <span>{t('founder.heroBadge')}</span>
                </div>
              </div>

              <h1 className="home-hero-title">
                {t('home.heroTitle')} <br />
                <span className="home-gradient-text">{t('home.heroHighlight')}</span>
              </h1>

              <p className="home-hero-desc">
                {t('home.heroSubtitle')}
              </p>

              <div className="home-hero-cta-group">
                <Link
                  to="/register"
                  className="home-btn-primary home-btn-hero-large"
                  onClick={() => {
                    trackFounderCtaClicked('hero_cta');
                    trackBusinessRegisterStarted('hero_cta');
                  }}
                >
                  {t('founder.ctaButton')} <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="home-btn-secondary">
                  {isTr ? 'Nasıl Çalışır?' : 'How It Works'}
                </a>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="home-btn-hero-video"
                  title={ht('watchDemoTitle')}
                >
                  <span className="home-btn-video-icon">
                    <Play size={12} fill="currentColor" style={{ marginLeft: 2 }} />
                  </span>
                  <span>{ht('watchDemo')}</span>
                </button>
              </div>

              {/* Friction-Eliminating Micro-Proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 600 }}>
                  <ShieldCheck size={14} /> {t('home.microProofCard')}
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 600 }}>
                  <Zap size={14} /> {t('home.microProofSetup')}
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 600 }}>
                  <Coins size={14} /> {t('home.microProofSettlement')}
                </span>
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

              {/* POS Compatibility Ribbon */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Cpu size={14} />
                    <span>{isTr ? 'Sıfır Ek Donanım — Kasa Altyapınızla Kusursuz Birlikte:' : 'Zero Hardware — Works Alongside Any Setup:'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {['Toast', 'Square', 'Clover', 'Lightspeed', 'Simpra', isTr ? '+ Yerel POS' : '+ Local POS'].map((posName, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.73rem',
                          fontWeight: 600,
                          color: '#e2e8f0',
                        }}
                      >
                        {posName}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {isTr
                    ? "POS cihazınızı değiştirmeyin. Kasanız operasyonu yönetsin, Naponi misafirinizle bağ kursun."
                    : 'Keep your POS. Add NAPONI. Your POS runs the business, NAPONI connects you with your guests.'}
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

                  {/* One QR Multi-Feature Hub Bar */}
                  <div className="home-phone-hub-bar">
                    <button
                      type="button"
                      className={`home-phone-hub-tab ${simTab === 'tip' ? 'active' : ''}`}
                      onClick={() => setSimTab('tip')}
                    >
                      <CreditCard size={12} />
                      <span>{isTr ? 'Bahşiş' : 'Tip'}</span>
                    </button>
                    <button
                      type="button"
                      className={`home-phone-hub-tab ${simTab === 'menu' ? 'active' : ''}`}
                      onClick={() => setSimTab('menu')}
                    >
                      <BookOpen size={12} />
                      <span>{isTr ? 'Menü' : 'Menu'}</span>
                    </button>
                    <button
                      type="button"
                      className={`home-phone-hub-tab ${simTab === 'wifi' ? 'active' : ''}`}
                      onClick={() => setSimTab('wifi')}
                    >
                      <Wifi size={12} />
                      <span>Wi-Fi</span>
                    </button>
                    <button
                      type="button"
                      className={`home-phone-hub-tab ${simTab === 'review' ? 'active' : ''}`}
                      onClick={() => setSimTab('review')}
                    >
                      <Star size={12} />
                      <span>{isTr ? 'Puan' : 'Review'}</span>
                    </button>
                  </div>

                  {simTab === 'tip' && (
                    !simSuccess ? (
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
                    )
                  )}

                  {simTab === 'menu' && (
                    <div className="home-phone-subscreen">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                            {isTr ? '📖 Masaya Özel Dijital Menü' : '📖 Digital Table Menu'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {isTr ? 'Canlı Fiyat' : 'Live'}
                          </span>
                        </div>

                        <div className="home-phone-menu-item">
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Single Origin Flat White</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Oat milk, double shot</div>
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>{simConfig.currency}85</span>
                        </div>

                        <div className="home-phone-menu-item">
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Truffle Parmesan Fries</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>House truffle aioli</div>
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>{simConfig.currency}190</span>
                        </div>

                        <div className="home-phone-menu-item">
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Dry Aged Bistro Burger</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Caramelized onion, brioche</div>
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>{simConfig.currency}360</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="home-phone-tip-submit"
                        onClick={() => setSimTab('tip')}
                        style={{ marginTop: '0.5rem' }}
                      >
                        <CreditCard size={15} />
                        <span>{isTr ? 'Garsona Bahşiş Ekle' : 'Add Gratuity for Staff'}</span>
                      </button>
                    </div>
                  )}

                  {simTab === 'wifi' && (
                    <div className="home-phone-subscreen">
                      <div className="home-phone-wifi-box">
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '0.65rem' }}>
                          <Wifi size={22} />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>
                          Grand_Bistro_Guest_5G
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '1rem' }}>
                          {isTr ? 'Garsona şifre sormadan tek tıkla bağlanın' : 'Connect instantly with zero password hassle'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSimWifiConnected(true)}
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: '10px',
                            background: simWifiConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                            border: `1px solid ${simWifiConnected ? '#10b981' : '#38bdf8'}`,
                            color: simWifiConnected ? '#34d399' : '#38bdf8',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Check size={14} />
                          <span>{simWifiConnected ? (isTr ? 'Wi-Fi Bağlandı ✓' : 'Connected to Wi-Fi ✓') : (isTr ? '1-Tıkla Bağlan' : 'Connect 1-Tap')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="home-phone-tip-submit"
                        onClick={() => setSimTab('tip')}
                      >
                        <CreditCard size={15} />
                        <span>{isTr ? 'Garsona Bahşiş Bırak' : 'Leave Server a Tip'}</span>
                      </button>
                    </div>
                  )}

                  {simTab === 'review' && (
                    <div className="home-phone-subscreen">
                      <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>
                          {isTr ? 'Deneyiminizi Puanlayın' : 'Rate Your Experience'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {isTr ? '5 yıldızlı puanlar doğrudan Google Haritalar’a yönlenir' : '5-star reviews sync directly to Google Maps'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', margin: '1rem 0' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSimReviewGiven(true)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              aria-label={`Star ${star}`}
                            >
                              <Star size={24} fill="#facc15" color="#facc15" />
                            </button>
                          ))}
                        </div>
                        {simReviewGiven && (
                          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginBottom: '0.75rem' }}>
                            {isTr ? '✓ Teşekkürler! Değerlendirmeniz kaydedildi.' : '✓ Thank you! Rating saved.'}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="home-phone-tip-submit"
                        onClick={() => setSimTab('tip')}
                      >
                        <CreditCard size={15} />
                        <span>{isTr ? 'Garsona Bahşiş Ekle' : 'Tip Your Server'}</span>
                      </button>
                    </div>
                  )}

                  {/* Simulator footer caption */}
                  <div className="home-phone-footer-caption">
                    <Sparkles size={11} color="#818cf8" />
                    <span>{isTr ? 'Tek QR: Bahşiş • Menü • Hızlı Wi-Fi • Puan' : 'One QR: Tipping • Menu • Guest Wi-Fi • Reviews'}</span>
                  </div>
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
          EXISTING POS & PAYMENT ARCHITECTURE: KEEP YOUR POS. ADD NAPONI.
          ==================================================================== */}
      <section className="home-section" id="pos-integrations" style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header">
            <span
              className="home-section-tag"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '9999px',
                padding: '0.35rem 1.1rem',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                maxWidth: '100%',
                boxShadow: '0 2px 12px rgba(99, 102, 241, 0.15)',
              }}
            >
              <Cpu size={14} style={{ flexShrink: 0 }} />
              <span>{language === 'tr' ? 'Mevcut POS & Ödeme Tamamlayıcı Katmanı' : 'Existing POS & Payment Companion Layer'}</span>
            </span>
            <h2 className="home-section-title">
              {language === 'tr'
                ? 'Kasanız İşletmeyi Yönetir. Naponi Misafirinizle Bağ Kurar.'
                : 'Your POS Runs the Business. NAPONI Connects You With Your Guests.'}
            </h2>
            <p className="home-section-desc">
              {language === 'tr'
                ? "POS cihazınızı değiştirmeyin. Naponi'yi ekleyin. Toast, Square, Clover, Lightspeed veya yerel POS sisteminizi değiştirmenize gerek yok. Kasanız adisyon, mutfak ve stok operasyonlarını yönetirken; Naponi masadaki bağımsız Smart QR misafir katmanınız olur. Paranızı emanette tutmaz, doğrudan kendi lisanslı sağlayıcınızla tahsilat yaparsınız."
                : "Keep your POS. Add NAPONI. You don't need to replace Toast, Square, Clover, Lightspeed, or your local POS. Your existing POS handles orders, kitchen routing, and inventory—while NAPONI delivers the Smart QR guest experience layer. Zero held funds, 100% direct settlement."}
            </p>
          </div>

          {/* Dual-Layer Target Architecture Visualization */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem' }}>
                <Layers size={18} />
                <span>{language === 'tr' ? 'Hedef Mimari: Bağımsız Çift Katman' : 'Target Architecture: Independent Dual Layer'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#38bdf8' }}>POS</strong> = {language === 'tr' ? 'Restoran Operasyon Katmanı' : 'Restaurant Operations Layer'} &nbsp;|&nbsp; <strong style={{ color: '#ec4899' }}>NAPONI</strong> = {language === 'tr' ? 'Misafir Deneyimi Katmanı' : 'Guest Experience Layer'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              {/* Box 1: Operations */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                  {language === 'tr' ? 'Mevcut Operasyonunuz' : 'Existing Systems'}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.35rem' }}>
                  POS • Ödeme • Kasa
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Toast • Square • Clover • Lightspeed • Yerel POS
                </div>
              </div>

              {/* Plus Sign */}
              <div style={{ textAlign: 'center', color: '#818cf8', fontWeight: 900, fontSize: '1.4rem' }}>
                +
              </div>

              {/* Box 2: NAPONI Hub */}
              <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.45)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#f472b6', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                  {language === 'tr' ? 'Masada Akıllı Katman' : 'Table Experience'}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
                  NAPONI Smart QR Hub
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  {language === 'tr' ? 'One QR • Tek QR Masa Giriş Noktası' : 'One QR • Everything Your Guests Need'}
                </div>
              </div>

              {/* Arrow Sign */}
              <div style={{ textAlign: 'center', color: '#34d399', fontWeight: 900, fontSize: '1.4rem' }}>
                ↓
              </div>

              {/* Box 3: 6 Modules */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#34d399', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                  {language === 'tr' ? 'Tüm Misafir İhtiyaçları' : 'Guest Touchpoints'}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>
                  Bahşiş • Menü • Wi-Fi
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Sadakat • Fırsat • Yorum
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Compatibility Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              {
                region: language === 'tr' ? 'Türkiye & MENA' : 'Turkey & MENA',
                systems: ['PayTR Link', 'iyzico Link', 'FAST / Kolay Adres', 'Banka IBAN'],
                badge: 'TR & Körfez',
                desc: language === 'tr' ? 'Türkiye ve Körfez bölgesinde işletmenizin sahip olduğu lisanslı ödeme linkleri ve anında banka transferleri.' : 'Licensed local checkout links and instant bank transfers across Turkey and the Gulf.',
              },
              {
                region: language === 'tr' ? 'Kuzey Amerika' : 'North America',
                systems: ['Stripe Payment Links', 'Square Online Checkout', 'PayPal.me', 'ACH Wire'],
                badge: 'US & CA',
                desc: language === 'tr' ? 'ABD ve Kanada genelinde işletmelerin kendi Stripe, Square veya PayPal hesapları üzerinden doğrudan tahsilat.' : 'Direct settlement into your own US/Canadian merchant accounts via Stripe, Square, or PayPal links.',
              },
              {
                region: language === 'tr' ? 'Avrupa & Birleşik Krallık' : 'Europe & UK',
                systems: ['Adyen Hosted Checkout', 'SumUp Payment Links', 'SEPA Instant Wire', 'Revolut Pay'],
                badge: 'UK & EU',
                desc: language === 'tr' ? 'İngiltere ve AB genelinde PSD2 uyumlu doğrudan banka veya barındırılan ödeme linkleri.' : 'PSD2-compliant hosted checkout links and instant SEPA/Faster Payments directly to your venue.',
              },
              {
                region: language === 'tr' ? 'Global Zincirler & Asya' : 'Global Enterprise & Asia',
                systems: ['Stripe Global', 'Checkout.com', 'PIX (Brezilya)', 'PromptPay / Local QR'],
                badge: 'Global 🌐',
                desc: language === 'tr' ? 'Dünya çapında yerel ödeme ağları ve uluslararası ödeme ağ geçitleri ile tam uyum.' : 'Seamless compatibility with global payment gateways and regional instant settlement rails.',
              },
            ].map((col, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{col.region}</span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{col.badge}</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem' }}>{col.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {col.systems.map((sys, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          background: 'rgba(15, 23, 42, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          color: '#f1f5f9',
                          fontWeight: 600,
                        }}
                      >
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Value comparison bar */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={18} />
                {language === 'tr' ? 'Paranız Asla Naponi\'de Beklemez: %100 Doğrudan Sizin Hesabınıza' : 'Zero Held Funds: 100% Direct Settlement to Your Business'}
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', maxWidth: '680px' }}>
                {language === 'tr'
                  ? 'Müşteri masadaki QR kodu okutup bahşiş bırakmak istediğinde, doğrudan işletmenizin belirlediği lisanslı ödeme sayfasına veya güvenli banka/FAST transferine yönlendirilir. Naponi finansal aracı değildir; takas komisyonu kesmez, fon bloke etmez.'
                  : 'When guests scan the table QR code, they are directed straight to your venue\'s verified checkout page or secure bank transfer. Naponi never holds merchant funds, collects card numbers, or charges payout delays.'}
              </p>
            </div>

            <Link
              to="/technology-partners"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              {language === 'tr' ? 'Altyapı Detaylarını İncele' : 'Explore Architecture'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          NAPONI FARKI (WHY NAPONI — 14-POINT COMPARISON SECTION)
          ==================================================================== */}
      <section className="home-section home-diff-section" id="naponi-farki">
        <div className="home-container">
          {/* Section Header */}
          <div className="home-section-header">
            <span className="home-section-tag home-diff-tag">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
              {isTr ? 'Naponi Farkı' : 'The Naponi Edge'}
            </span>
            <h2 className="home-section-title">
              {isTr ? (
                <>
                  Sadece bahşiş toplamayın. <br />
                  <span className="home-gradient-text">Müşteri deneyiminizi tek QR’da toplayın.</span>
                </>
              ) : (
                <>
                  Don’t Just Collect Tips. <br />
                  <span className="home-gradient-text">Unify Your Guest Experience in One QR.</span>
                </>
              )}
            </h2>
            <p className="home-section-desc">
              {isTr
                ? 'Naponi; dijital bahşiş, menü, Wi-Fi, fırsatlar, sadakat ve müşteri deneyimini işletmeniz için tek bir akıllı yapıda birleştirir.'
                : 'Naponi combines digital tipping, digital menu, Wi-Fi, specials, loyalty, and guest satisfaction into a single intelligent platform.'}
            </p>
          </div>

          {/* Comparison Container */}
          <div className="home-diff-container">
            {/* Column Headers */}
            <div className="home-diff-headers">
              <div className="home-diff-header-col ordinary">
                <div className="home-diff-header-title-wrap">
                  <span className="home-diff-header-icon negative">✕</span>
                  <div>
                    <h3 className="home-diff-header-title">
                      {isTr ? 'Sıradan Bahşiş Sistemleri' : 'Ordinary Tipping Systems'}
                    </h3>
                    <p className="home-diff-header-sub">
                      {isTr ? 'Tek yönlü geleneksel çözümler' : 'Single-purpose legacy tools'}
                    </p>
                  </div>
                </div>
                <span className="home-diff-header-badge negative">
                  {isTr ? 'Sınırlı Kapsam' : 'Limited Scope'}
                </span>
              </div>

              <div className="home-diff-header-col naponi">
                <div className="home-diff-header-title-wrap">
                  <span className="home-diff-header-icon positive">✨</span>
                  <div>
                    <h3 className="home-diff-header-title">
                      {isTr ? 'Naponi' : 'Naponi'}
                    </h3>
                    <p className="home-diff-header-sub">
                      {isTr ? 'Bütünleşik dijital misafir ekosistemi' : 'Unified digital hospitality ecosystem'}
                    </p>
                  </div>
                </div>
                <span className="home-diff-header-badge positive">
                  {isTr ? 'Hepsi Bir Arada' : 'All-in-One'}
                </span>
              </div>
            </div>

            {/* 14 Comparison Rows */}
            <div className="home-diff-body">
              {diffItems.map((item, idx) => (
                <div key={idx} className="home-diff-row">
                  <div className="home-diff-topic-bar">
                    <span className="home-diff-topic-num">{idx + 1}</span>
                    <span className="home-diff-topic-name">{item.topic}</span>
                  </div>

                  <div className="home-diff-cells">
                    {/* Ordinary side */}
                    <div className="home-diff-cell ordinary">
                      <div className="home-diff-mobile-label">
                        <span className="home-diff-mobile-icon negative">✕</span>
                        <span>{isTr ? 'Sıradan Sistemler' : 'Ordinary Systems'}</span>
                      </div>
                      <div className="home-diff-cell-content">
                        <XCircle size={18} className="home-diff-check-icon negative" />
                        <p className="home-diff-cell-desc">{item.ordinary}</p>
                      </div>
                    </div>

                    {/* Naponi side */}
                    <div className="home-diff-cell naponi">
                      <div className="home-diff-mobile-label">
                        <span className="home-diff-mobile-icon positive">✨</span>
                        <span>Naponi</span>
                      </div>
                      <div className="home-diff-cell-content">
                        <CheckCircle2 size={18} className="home-diff-check-icon positive" />
                        <p className="home-diff-cell-desc">{item.naponi}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Bottom CTA */}
          <div className="home-diff-cta-card">
            <div className="home-diff-cta-glow" />
            <div className="home-diff-cta-content">
              <div className="home-diff-cta-text">
                <h3 className="home-diff-cta-title">
                  {isTr ? 'Tek QR. Bahşişten çok daha fazlası.' : 'One QR. So much more than tips.'}
                </h3>
                <p className="home-diff-cta-desc">
                  {isTr
                    ? 'İşletmenizin sektörüne özel akıllı QR çözümlerini keşfedin.'
                    : 'Discover smart QR hospitality solutions tailored to your venue.'}
                </p>
              </div>
              <a
                href="#industries"
                className="home-btn-primary home-diff-cta-btn"
              >
                <span>{isTr ? 'Sektörel Çözümleri Gör' : 'Explore Industry Solutions'}</span>
                <ArrowRight size={18} />
              </a>
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
            <Link to="/solutions/restaurants" className="home-industry-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="home-industry-icon">
                <Utensils size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indRestaurantsTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indRestaurantsDesc')}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{isTr ? 'Çözümü İncele' : 'Explore Solution'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/solutions/cafes" className="home-industry-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="home-industry-icon">
                <Coffee size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indCafesTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indCafesDesc')}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{isTr ? 'Çözümü İncele' : 'Explore Solution'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/solutions/hotels" className="home-industry-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="home-industry-icon">
                <Hotel size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indHotelsTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indHotelsDesc')}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{isTr ? 'Çözümü İncele' : 'Explore Solution'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/solutions/bars" className="home-industry-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="home-industry-icon">
                <Wine size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indBarsTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indBarsDesc')}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{isTr ? 'Çözümü İncele' : 'Explore Solution'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/solutions/barbers" className="home-industry-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="home-industry-icon">
                <Scissors size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indBarbersTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indBarbersDesc')}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{isTr ? 'Çözümü İncele' : 'Explore Solution'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link to="/solutions/valet" className="home-industry-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="home-industry-icon">
                <Car size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indValetTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indValetDesc')}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{isTr ? 'Çözümü İncele' : 'Explore Solution'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>
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
              },
              {
                q: t('home.faqQ5'),
                a: t('home.faqA5')
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
              <button
                type="button"
                onClick={() => setSupportModalOpen(true)}
                className="home-btn-secondary"
                style={{ padding: '0.9rem 1.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Headphones size={17} />
                <span>{t('support.widgetBtn')}</span>
              </button>
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
              
              <div className="home-footer-socials">
                <a
                  href="https://www.youtube.com/@Naponicom"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Naponi YouTube"
                  className="home-social-btn youtube"
                  title="Naponi YouTube Channel"
                >
                  <Youtube size={19} />
                </a>
                <a
                  href="https://www.instagram.com/naponicom/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Naponi Instagram"
                  className="home-social-btn instagram"
                  title="Naponi Instagram"
                >
                  <Instagram size={19} />
                </a>
                <a
                  href="https://x.com/naponicom"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Naponi X"
                  className="home-social-btn x-twitter"
                  title="Naponi X (@naponicom)"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@naponicom"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Naponi TikTok"
                  className="home-social-btn tiktok"
                  title="Naponi TikTok (@naponicom)"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="home-footer-col-title">{t('home.footerProduct')}</h4>
              <ul className="home-footer-links">
                <li><a href="#how-it-works">{t('nav.features')}</a></li>
                <li><a href="#industries">{t('nav.solutions')}</a></li>
                <li><Link to="/solutions/restaurants">{t('nav.restaurants')}</Link></li>
                <li><Link to="/solutions/hotels">{t('nav.hotels')}</Link></li>
                <li><Link to="/integrations/toast-pos-smart-qr">{language === 'tr' ? 'Toast POS Uyumu' : 'Toast POS Companion'}</Link></li>
                <li><Link to="/integrations/square-pos-digital-tipping">{language === 'tr' ? 'Square POS Uyumu' : 'Square POS Companion'}</Link></li>
                <li><Link to="/tools/restaurant-tip-pool-calculator">{ht('shiftTipPool')}</Link></li>
                <li><Link to="/tools/free-hospitality-qr-generator">{ht('hospitalityQrMaker')}</Link></li>
                <li><Link to="/tools/tip-calculator">{t('nav.tipCalculator')}</Link></li>
                <li><Link to="/compare/card-machine-vs-qr-tipping">{ht('posVsQrTipping')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">{ht('guidesAndPlatform')}</h4>
              <ul className="home-footer-links">
                <li><Link to="/trust" style={{ color: '#10b981', fontWeight: 700 }}>{language === 'tr' ? 'Güvenlik & Trust Center' : 'Trust & Security Center'}</Link></li>
                <li><Link to="/catalog" style={{ color: '#34d399', fontWeight: 700 }}>{ht('b2bCorporateDeck')}</Link></li>
                <li><Link to="/technology-partners" style={{ color: '#38bdf8', fontWeight: 700 }}>{ht('techPartnersNav')}</Link></li>
                <li><Link to="/guides">{ht('globalTippingGuides')}</Link></li>
                <li><Link to="/compare/naponi-vs-sunday-app">{language === 'tr' ? 'Naponi vs Sunday' : 'Naponi vs Sunday App'}</Link></li>
                <li><Link to="/compare/best-cashless-tipping-systems">{ht('cashlessReview')}</Link></li>
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
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">{t('home.footerLanguage')}</h4>
              <div style={{ marginTop: '0.5rem' }}>
                <LanguageSelector variant="compact" direction="up" />
              </div>
            </div>
          </div>

          {/* Global Regulatory & Legal Disclosure Banner */}
          <div
            style={{
              marginTop: '2.5rem',
              marginBottom: '1.75rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <ShieldCheck size={22} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
              <strong style={{ color: '#f1f5f9', display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                {ht('regulatoryDisclosure')}
              </strong>
              {ht('regulatoryText')}
            </div>
          </div>

          <div className="home-footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              © {new Date().getFullYear()} NAPONI. {t('home.footerRights')}
            </div>
            
            {/* Legal & Compliance Links */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
              <button
                type="button"
                onClick={() => openLegal('kvkk')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, textDecoration: 'none', fontSize: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {ht('kvkkNotice')}
              </button>

              <button
                type="button"
                onClick={() => openLegal('privacy')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, textDecoration: 'none', fontSize: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {ht('privacyPolicy')}
              </button>

              <button
                type="button"
                onClick={() => openLegal('terms')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, textDecoration: 'none', fontSize: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {ht('termsOfService')}
              </button>

              <button
                type="button"
                onClick={() => openLegal('cookies')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, textDecoration: 'none', fontSize: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {ht('cookiePolicy')}
              </button>
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

      {/* Legal & Compliance Modal (KVKK, Privacy, Terms, Cookies) */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* Video Showcase Modal */}
      {videoModalOpen && (
        <div
          className="home-video-modal-overlay"
          onClick={() => setVideoModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Naponi Tanıtım Videosu"
        >
          <div
            className="home-video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="home-video-modal-header">
              <div className="home-video-modal-title">
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #c084fc, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#090d16',
                  flexShrink: 0,
                }}>
                  <Play size={12} fill="currentColor" style={{ marginLeft: 1 }} />
                </div>
                <span>From Tip Box to Digital Tipping 💳 | Naponi</span>
              </div>
              <button
                type="button"
                className="home-video-modal-close"
                onClick={() => setVideoModalOpen(false)}
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="home-video-modal-iframe-wrap">
              <iframe
                src="https://www.youtube.com/embed/E2nAATFf0zg?autoplay=1&rel=0"
                title="From Tip Box to Digital Tipping 💳 | Naponi"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="home-video-modal-footer">
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                {ht('youtubeChannel')}
              </div>
              <a
                href="https://www.youtube.com/@Naponicom"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Youtube size={15} />
                <span>@Naponicom</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Non-intrusive Cookie Consent Banner */}
      <CookieBanner onOpenLegalModal={openLegal} />
    </div>
  );
};
