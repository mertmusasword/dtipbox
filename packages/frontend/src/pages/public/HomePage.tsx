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
import { BLOG_POSTS } from '../../content/blog/posts';

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

  // ROI / Tip Recovery Calculator State
  const [calcSector, setCalcSector] = useState<'cafe' | 'restaurant' | 'bar' | 'hotel'>('restaurant');
  const [calcDailyTables, setCalcDailyTables] = useState<number>(50);
  const [calcAverageCheck, setCalcAverageCheck] = useState<number>(isTr ? 650 : 45);

  const calcCurrencySymbol = useMemo(() => {
    switch (language) {
      case 'tr': return '₺';
      case 'de':
      case 'fr':
      case 'es':
      case 'pt': return '€';
      case 'ja': return '¥';
      default: return '$';
    }
  }, [language]);

  const handleSelectSector = (sector: 'cafe' | 'restaurant' | 'bar' | 'hotel') => {
    setCalcSector(sector);
    if (calcCurrencySymbol === '₺') {
      switch (sector) {
        case 'cafe':
          setCalcDailyTables(70);
          setCalcAverageCheck(220);
          break;
        case 'restaurant':
          setCalcDailyTables(50);
          setCalcAverageCheck(650);
          break;
        case 'bar':
          setCalcDailyTables(45);
          setCalcAverageCheck(950);
          break;
        case 'hotel':
          setCalcDailyTables(30);
          setCalcAverageCheck(1400);
          break;
      }
    } else if (calcCurrencySymbol === '¥') {
      switch (sector) {
        case 'cafe':
          setCalcDailyTables(70);
          setCalcAverageCheck(1500);
          break;
        case 'restaurant':
          setCalcDailyTables(50);
          setCalcAverageCheck(5000);
          break;
        case 'bar':
          setCalcDailyTables(45);
          setCalcAverageCheck(8000);
          break;
        case 'hotel':
          setCalcDailyTables(30);
          setCalcAverageCheck(12000);
          break;
      }
    } else {
      switch (sector) {
        case 'cafe':
          setCalcDailyTables(70);
          setCalcAverageCheck(15);
          break;
        case 'restaurant':
          setCalcDailyTables(50);
          setCalcAverageCheck(45);
          break;
        case 'bar':
          setCalcDailyTables(45);
          setCalcAverageCheck(65);
          break;
        case 'hotel':
          setCalcDailyTables(30);
          setCalcAverageCheck(95);
          break;
      }
    }
  };

  const formatCalcCurrency = (amount: number) => {
    const formatted = Math.round(amount).toLocaleString(isTr ? 'tr-TR' : 'en-US');
    return isTr ? `${formatted} ₺` : `${calcCurrencySymbol}${formatted}`;
  };

  const calcMonthlyTurnover = calcDailyTables * 30 * calcAverageCheck;
  // Estimated tip potential ~ 8.5%
  // Tips lost due to lack of cash ~ 45%
  const calcMonthlyRecoveredTips = Math.round(calcMonthlyTurnover * 0.085 * 0.45);
  const calcStaffCount = calcSector === 'cafe' ? 4 : calcSector === 'restaurant' ? 7 : calcSector === 'bar' ? 5 : 8;
  const calcPerStaffGain = Math.round(calcMonthlyRecoveredTips / calcStaffCount);

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
            <li><a href="#naponi-farki" className="home-nav-link" style={{ color: '#a5b4fc', fontWeight: 600 }}>{ht('whyNaponi')}</a></li>
            <li><a href="#experience" className="home-nav-link">{t('nav.solutions')}</a></li>
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
      </header>

      {/* Mobile Dropdown Menu (Mounted outside header to guarantee full viewport height without backdrop-filter clipping) */}
      {mobileMenuOpen && (
        <div className="home-mobile-menu">
          {/* 1. TOP QUICK ACTIONS: Instant 1-tap access to Login & Register */}
          <div className="home-mobile-menu-top-actions">
            <Link
              to="/login"
              className="home-btn-ghost home-mobile-action-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn size={15} />
              <span>{t('nav.login')}</span>
            </Link>
            <Link
              to="/register"
              className="home-btn-primary home-mobile-action-btn"
              onClick={() => {
                trackBusinessRegisterStarted('mobile_drawer_cta');
                setMobileMenuOpen(false);
              }}
            >
              <span>{t('nav.getStarted')}</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* 2. MAIN NAVIGATION */}
          <div className="home-mobile-menu-links">
            <a href="#how-it-works" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>{t('nav.features')}</span>
            </a>
            <a href="#naponi-farki" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#a5b4fc', fontWeight: 600 }}>
              <span>✨ {ht('whyNaponi')}</span>
            </a>
            <a href="#experience" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
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
                <Link to="/login" className="home-btn-secondary">
                  {t('home.ctaLogin')}
                </Link>
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
              <div className="home-dash-url-bar">
                <LayoutDashboard size={13} className="home-dash-url-icon" />
                <span className="home-dash-url-path">naponi.app/portal/dashboard</span>
                <span className="home-dash-url-separator">•</span>
                <span className="home-dash-url-venue">{simConfig.venueName}</span>
              </div>
              <div className="home-dash-pill">
                <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                <span className="home-dash-pill-full">{ht('liveOperations')}</span>
                <span className="home-dash-pill-short">{ht('livePill')}</span>
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
                        <span>{ht('todayTotalTips')}</span>
                        <TrendingUp size={14} style={{ color: '#10b981' }} />
                      </div>
                      <div className="home-dash-kpi-val">
                        {simConfig.currency}{language === 'tr' ? '14.850' : '1,485'}.00
                      </div>
                      <div className="home-dash-kpi-sub">
                        <span>↑ 24.8%</span>
                        <span style={{ color: '#94a3b8' }}>{ht('vsLastWeek')}</span>
                      </div>
                    </div>

                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{ht('avgTipRate')}</span>
                        <Percent size={14} style={{ color: '#6366f1' }} />
                      </div>
                      <div className="home-dash-kpi-val">16.4%</div>
                      <div className="home-dash-kpi-sub" style={{ color: '#6366f1' }}>
                        <span>★ 48 {ht('transactions')}</span>
                      </div>
                    </div>

                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{ht('activeStaff')}</span>
                        <Users size={14} style={{ color: '#38bdf8' }} />
                      </div>
                      <div className="home-dash-kpi-val">8 {ht('staffUnit')}</div>
                      <div className="home-dash-kpi-sub" style={{ color: '#38bdf8' }}>
                        <span>✓ {ht('allActive')}</span>
                      </div>
                    </div>

                    <div className="home-dash-kpi-card">
                      <div className="home-dash-kpi-label">
                        <span>{ht('guestSatisfaction')}</span>
                        <Award size={14} style={{ color: '#fbbf24' }} />
                      </div>
                      <div className="home-dash-kpi-val">4.9 / 5.0</div>
                      <div className="home-dash-kpi-sub" style={{ color: '#fbbf24' }}>
                        <span>98% {ht('positiveReview')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Transaction Feed Preview */}
                  <div className="home-dash-feed-box">
                    <div className="home-dash-feed-header">
                      <div className="home-dash-feed-title">
                        <Clock size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                        <span>{ht('realtimeFeed')}</span>
                      </div>
                      <span className="badge badge-primary home-dash-feed-badge">
                        {ht('last10Mins')}
                      </span>
                    </div>

                    <div className="home-dash-feed-list">
                      {[
                        { table: language === 'tr' ? 'Masa 14' : 'Table 14', staff: simConfig.staffOptions[0].label, amount: `${simConfig.currency}${language === 'tr' ? '150.00' : '15.00'}`, time: language === 'tr' ? '2 dk önce' : '2m ago', method: ' Apple Pay' },
                        { table: language === 'tr' ? 'Masa 08' : 'Table 08', staff: simConfig.staffOptions[1]?.label || 'Elena M.', amount: `${simConfig.currency}${language === 'tr' ? '100.00' : '10.00'}`, time: language === 'tr' ? '5 dk önce' : '5m ago', method: 'Credit Card' },
                        { table: language === 'tr' ? 'Bar Stand 02' : 'Bar Counter 02', staff: ht('teamPool'), amount: `${simConfig.currency}${language === 'tr' ? '250.00' : '25.00'}`, time: language === 'tr' ? '9 dk önce' : '9m ago', method: 'Google Pay' },
                      ].map((item, idx) => (
                        <div key={idx} className="home-dash-feed-item">
                          <div className="home-dash-feed-left">
                            <div className="home-dash-feed-dot" />
                            <div className="home-dash-feed-details">
                              <div className="home-dash-feed-main">
                                <strong className="home-dash-feed-table">{item.table}</strong>
                                <span className="home-dash-feed-staff">• {item.staff}</span>
                              </div>
                              <div className="home-dash-feed-meta">
                                <span>{item.method}</span>
                                <span className="home-dash-feed-bullet">•</span>
                                <span>{item.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="home-dash-feed-right">
                            <span className="home-dash-feed-amount">+{item.amount}</span>
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
                        💳 {ht('digitalQrTips')}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                        {simConfig.currency}{language === 'tr' ? '9.200' : '920'}.00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Naponi {ht('instantSettlement')}</div>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#86efac', marginBottom: '0.2rem' }}>
                        💵 {ht('cashTipBox')}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>
                        {simConfig.currency}{language === 'tr' ? '3.800' : '380'}.00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#86efac' }}>%0 {ht('feeCashPayout')}</div>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#fde047', marginBottom: '0.2rem' }}>
                        🏧 {ht('directBankWire')}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#facc15' }}>
                        {simConfig.currency}{language === 'tr' ? '1.800' : '180'}.00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{ht('directAccountReconciliation')}</div>
                    </div>

                    <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, marginBottom: '0.2rem' }}>
                        ✨ {ht('netShiftPool')}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4ade80' }}>
                        {simConfig.currency}{language === 'tr' ? '14.524' : '1,452'}.40
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>4 {ht('staffAllocated')}</div>
                    </div>
                  </div>

                  {/* Staff Distribution Table Mockup */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ht('shiftPayoutBreakdown')}</span>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCheck size={14} /> {ht('pointWeightedSplit')}
                      </span>
                    </div>
                    <div style={{ padding: '0.5rem 1rem' }}>
                      {[
                        { name: simConfig.staffOptions[0].label, role: ht('seniorServer'), weight: '1.0x', net: `${simConfig.currency}${language === 'tr' ? '4.150' : '415'}.00`, cash: `${simConfig.currency}${language === 'tr' ? '1.085' : '108'}.50`, bank: `${simConfig.currency}${language === 'tr' ? '3.065' : '306'}.50` },
                        { name: simConfig.staffOptions[1]?.label || 'Elena M.', role: ht('headBartender'), weight: '1.0x', net: `${simConfig.currency}${language === 'tr' ? '4.150' : '415'}.00`, cash: `${simConfig.currency}${language === 'tr' ? '1.085' : '108'}.50`, bank: `${simConfig.currency}${language === 'tr' ? '3.065' : '306'}.50` },
                        { name: language === 'tr' ? 'Cemil A.' : 'David K.', role: ht('barbackSupport'), weight: '0.75x', net: `${simConfig.currency}${language === 'tr' ? '3.112' : '311'}.25`, cash: `${simConfig.currency}${language === 'tr' ? '813' : '81'}.38`, bank: `${simConfig.currency}${language === 'tr' ? '2.298' : '229'}.87` },
                        { name: language === 'tr' ? 'Merve S.' : 'Sarah T.', role: language === 'tr' ? 'Hostes / Karşılama' : 'Host / Greeter', weight: '0.75x', net: `${simConfig.currency}${language === 'tr' ? '3.112' : '311'}.25`, cash: `${simConfig.currency}${language === 'tr' ? '813' : '81'}.38`, bank: `${simConfig.currency}${language === 'tr' ? '2.298' : '229'}.87` },
                      ].map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: idx !== 3 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none', fontSize: '0.82rem', gap: '0.5rem' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.role} • <span style={{ color: '#818cf8' }}>{s.weight}</span></div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{s.net}</div>
                            <div style={{ fontSize: '0.68rem', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                              <span style={{ color: '#86efac', whiteSpace: 'nowrap' }}>💵 {s.cash}</span>
                              <span style={{ color: '#93c5fd', whiteSpace: 'nowrap' }}>💳 {s.bank}</span>
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Printer size={12} /> {language === 'tr' ? 'Baskıya Hazır PDF' : 'Print-Ready PDF'}
                        </span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
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
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{language === 'tr' ? 'Personel Yaka Kartı & QR Rozet' : 'Server Badges & QR Cards'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{language === 'tr' ? 'Garson & Barmen özel kodlar' : 'Individual staff badges'}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                        {language === 'tr'
                          ? 'Garson ve barmenlerinize özel QR yaka kartları oluşturun. Müşteriler doğrudan sevdikleri garsona özel teşekkür edip bahşiş iletsin.'
                          : 'Equip servers and valets with stylish wearable badges. Guests scan to directly reward exceptional personal hospitality.'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCheck size={12} /> {language === 'tr' ? 'Yaka Kartı Şablonu' : 'Badge Template'}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Download size={12} /> {language === 'tr' ? 'Baskıya Hazır PDF/PNG' : 'Print-Ready PDF/PNG'}
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
          NAPONI SMART QR: ONE QR. ENDLESS POSSIBILITIES.
          ==================================================================== */}
      <section className="home-section" id="smart-qr" style={{ background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.7) 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header">
            <span
              className="home-section-tag"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                background: 'rgba(236, 72, 153, 0.12)',
                color: '#f472b6',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '9999px',
                padding: '0.35rem 1.1rem',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                maxWidth: '100%',
                boxShadow: '0 2px 12px rgba(236, 72, 153, 0.15)',
              }}
            >
              <Sparkles size={14} style={{ flexShrink: 0 }} />
              <span>{language === 'tr' ? 'Ağırlama Sektörü İçin Akıllı QR' : 'Smart QR for Hospitality'}</span>
            </span>
            <h2 className="home-section-title">
              {language === 'tr' ? 'Tek QR. Misafirinizin İhtiyaç Duyduğu Her Şey.' : 'One QR. Everything Your Guests Need.'}
            </h2>
            <p className="home-section-desc">
              {language === 'tr'
                ? "Bahşiş • Menü • Wi-Fi • Sadakat • Kampanyalar • Yorumlar. Masadaki tek bir Smart QR giriş noktası ile misafirleriniz ihtiyaç duyduğu her şeye anında erişir; sıfır ek donanım maliyetiyle mevcut kasa düzeninizi değiştirmeden doğrudan misafirlerinizle bağ kurar."
                : 'Tips • Menu • Wi-Fi • Loyalty • Campaigns • Reviews. One single QR entry point at the table connects your guests with everything they need, with zero hardware cost and without changing your existing operational setup.'}
            </p>
          </div>

          {/* 6-Pillars Grid: Tips • Menu • Wi-Fi • Loyalty • Campaigns • Reviews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {/* 1. Tips */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                    marginBottom: '1rem',
                  }}
                >
                  <CreditCard size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? '1. Dijital Bahşiş' : '1. Digital Tips'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {language === 'tr'
                    ? "Uygulama indirmeden, üyelik olmadan işletmenizin lisanslı ödeme bağlantısı veya doğrudan banka/FAST transferi ile 10 saniyede emanetsiz aktarım."
                    : "Direct gratuity to staff or team pool in 10 seconds via your venue's secure checkout link or direct bank transfer. Non-custodial."}
                </p>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>0 Saniye Kayıp • 0 Sürtünme</span>
              </div>
            </div>

            {/* 2. Menu */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    marginBottom: '1rem',
                  }}
                >
                  <UtensilsCrossed size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? '2. Native QR Menü' : '2. Digital Menu'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {language === 'tr'
                    ? "Masalara ayrı menü QR'ı basmaya son. 14 standart alerjen etiketli, kategorili ve anlık stok kontrollü native dijital menünüz tek Smart QR'da."
                    : 'No separate menu QR stands needed. Mobile menu with 14 standardized allergen filters and instant stock toggles inside your unified Smart QR.'}
                </p>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>14 Standart Alerjen • Tek QR</span>
              </div>
            </div>

            {/* 3. Wi-Fi */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    marginBottom: '1rem',
                  }}
                >
                  <Zap size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? '3. 1-Tıkla Misafir Wi-Fi' : '3. Guest Wi-Fi'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {language === 'tr'
                    ? 'Garsona şifre sorma devri bitti. Misafir tek tıkla şifreyi panoya kopyalar veya yerleşik Wi-Fi profiliyle masadan anında bağlanır.'
                    : 'No more asking waitstaff for passwords. Guests copy the network password with one tap and connect instantly.'}
                </p>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>Personel Zamanından Tasarruf</span>
              </div>
            </div>

            {/* 4. Loyalty */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ec4899',
                    marginBottom: '1rem',
                  }}
                >
                  <Mail size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? '4. VIP Sadakat & Kulüp' : '4. Loyalty & VIP'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {language === 'tr'
                    ? 'Özel ikram veya duyurular karşılığında KVKK/GDPR uyumlu misafir e-posta ve telefon rehberi oluşturun.'
                    : 'Build a compliant first-party marketing database of guest emails and phone numbers for SMS & newsletters.'}
                </p>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>%100 KVKK & GDPR Uyumlu</span>
              </div>
            </div>

            {/* 5. Campaigns */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b',
                    marginBottom: '1rem',
                  }}
                >
                  <Tag size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? '5. Dinamik Kampanyalar' : '5. Campaigns & Specials'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {language === 'tr'
                    ? 'Günün tatlısı, mutlu saatler (happy hour) indirimleri veya özel promosyon kuponlarını anlık olarak masadaki ekrana yansıtın.'
                    : 'Highlight daily desserts, happy hour discounts, or exclusive promo codes right on table mobile screens.'}
                </p>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Adisyon Ortalamasını Artırın</span>
              </div>
            </div>

            {/* 6. Reviews */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    marginBottom: '1rem',
                  }}
                >
                  <Star size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? '6. Müşteri Yorumları' : '6. Direct Reviews'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {language === 'tr'
                    ? 'Müşteriler işletmeden ayrılmadan anlık 1-5 yıldız puanı verir. Google / TripAdvisor itibarınızı doğrudan masadan yükseltin.'
                    : 'Collect in-venue 1-5 star ratings and reviews before guests leave, boosting your local review rankings.'}
                </p>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>Google & TripAdvisor Uyumlu</span>
              </div>
            </div>
          </div>

          {/* Compatibility Promise Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={18} />
                {language === 'tr' ? 'Mevcut Basılı QR Kodlarınızı Yeniden Bastırmanıza Gerek Yok' : 'Zero Re-printing Needed. 100% Backward Compatible.'}
              </div>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {language === 'tr'
                  ? 'Daha önce masalara bastırdığınız tüm Naponi QR kodları geriye dönük tam uyumludur. İşletme panelinizden Wi-Fi veya Kampanyaları aktif ettiğiniz an, mevcut QR kodlarınız otomatik olarak Smart QR Hub haline gelir.'
                  : 'All previously printed Naponi QR stickers immediately upgrade over-the-air. Turn on Wi-Fi or campaigns in your dashboard and your existing table codes gain smart powers instantly.'}
              </p>
            </div>

            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
            >
              {language === 'tr' ? 'Hemen Ücretsiz Başlayın' : 'Start Free Today'}
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
                    ? 'Naponi ile işletmenizin dijital müşteri deneyimini tek noktadan yönetin.'
                    : 'Unify and elevate your hospitality guest experience from a single intelligent platform.'}
                </p>
              </div>
              <Link
                to="/register"
                className="home-btn-primary home-diff-cta-btn"
                onClick={() => trackBusinessRegisterStarted('difference_section_cta')}
              >
                <span>{isTr ? 'Naponi’yi Keşfet' : 'Discover Naponi'}</span>
                <ArrowRight size={18} />
              </Link>
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

            {/* 4. Waterproof Stickers & Phone Display */}
            <div className="home-touch-card">
              <div className="home-touch-preview-wrap">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ width: 100, height: 96, margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(56, 189, 248, 0.4)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>STICKER / MOBILE</div>
                    <QrCode size={34} style={{ color: '#38bdf8' }} />
                    <div style={{ fontSize: '0.5rem', color: '#94a3b8' }}>SCAN & TIP</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.65rem', display: 'block' }}>
                    Waterproof Vinyl Sticker & Phone Screen
                  </span>
                </div>
              </div>
              <h3 className="home-touch-title">{t('home.touchCard4Title')}</h3>
              <p className="home-touch-desc">{t('home.touchCard4Desc')}</p>
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
          6B. INTERACTIVE TIP RECOVERY & ROI CALCULATOR
          ==================================================================== */}
      <section className="home-section" id="calculator" style={{ paddingTop: 20, paddingBottom: 60 }}>
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag" style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}>
              <Calculator size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
              {isTr ? 'İnteraktif Gelir & Bahşiş Simülatörü' : 'Interactive Tip Recovery Simulator'}
            </span>
            <h2 className="home-section-title">
              {isTr ? (
                <>
                  Masada Nakitsiz Kaçan Bahşişi & <br />
                  <span className="home-gradient-text">Ekibinizin Potansiyel Kazancını Hesaplayın</span>
                </>
              ) : (
                <>
                  Calculate Tips Missed at the Table & <br />
                  <span className="home-gradient-text">Your Team’s Extra Earnings</span>
                </>
              )}
            </h2>
            <p className="home-section-desc">
              {isTr
                ? "Misafirlerin %70'inden fazlası artık nakit taşımıyor. Masada QR kod olmadığında bahşişler buharlaşıyor. İşletme profilinizi seçin, ekibinizin her ay kurtaracağı bahşişi canlı görün."
                : "Over 70% of guests no longer carry cash. When there is no QR code on the table, tips simply disappear. Pick your venue type and see how much gratuity your team can recover."}
            </p>
          </div>

          <div className="home-roi-card">
            <div className="home-roi-grid">
              {/* Controls Column */}
              <div className="home-roi-controls">
                <div>
                  <label className="home-roi-slider-label" style={{ display: 'block', marginBottom: '0.65rem' }}>
                    {ht('selectVenueType')}
                  </label>
                  <div className="home-roi-sector-pills">
                    <button
                      type="button"
                      className={`home-roi-sector-btn ${calcSector === 'cafe' ? 'active' : ''}`}
                      onClick={() => handleSelectSector('cafe')}
                    >
                      <Coffee size={20} />
                      <span>{ht('cafe')}</span>
                    </button>
                    <button
                      type="button"
                      className={`home-roi-sector-btn ${calcSector === 'restaurant' ? 'active' : ''}`}
                      onClick={() => handleSelectSector('restaurant')}
                    >
                      <Utensils size={20} />
                      <span>{ht('restaurant')}</span>
                    </button>
                    <button
                      type="button"
                      className={`home-roi-sector-btn ${calcSector === 'bar' ? 'active' : ''}`}
                      onClick={() => handleSelectSector('bar')}
                    >
                      <Wine size={20} />
                      <span>{ht('barPub')}</span>
                    </button>
                    <button
                      type="button"
                      className={`home-roi-sector-btn ${calcSector === 'hotel' ? 'active' : ''}`}
                      onClick={() => handleSelectSector('hotel')}
                    >
                      <Hotel size={20} />
                      <span>{ht('hotel')}</span>
                    </button>
                  </div>
                </div>

                {/* Slider 1: Daily Tables */}
                <div className="home-roi-slider-group">
                  <div className="home-roi-slider-header">
                    <span className="home-roi-slider-label">
                      {ht('dailyTablesGroups')}
                    </span>
                    <span className="home-roi-slider-val">{calcDailyTables} {ht('tablesUnit')}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={300}
                    step={5}
                    value={calcDailyTables}
                    onChange={(e) => setCalcDailyTables(Number(e.target.value))}
                    className="home-roi-range-input"
                    aria-label="Daily Tables"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>10 {ht('tablesUnit')}</span>
                    <span>150</span>
                    <span>300+ {ht('tablesUnit')}</span>
                  </div>
                </div>

                {/* Slider 2: Average Check */}
                <div className="home-roi-slider-group">
                  <div className="home-roi-slider-header">
                    <span className="home-roi-slider-label">
                      {ht('averageBillSpend')}
                    </span>
                    <span className="home-roi-slider-val">{formatCalcCurrency(calcAverageCheck)}</span>
                  </div>
                  <input
                    type="range"
                    min={calcCurrencySymbol === '₺' ? 50 : calcCurrencySymbol === '¥' ? 500 : 5}
                    max={calcCurrencySymbol === '₺' ? 3000 : calcCurrencySymbol === '¥' ? 30000 : 200}
                    step={calcCurrencySymbol === '₺' ? 25 : calcCurrencySymbol === '¥' ? 250 : 5}
                    value={calcAverageCheck}
                    onChange={(e) => setCalcAverageCheck(Number(e.target.value))}
                    className="home-roi-range-input"
                    aria-label="Average Check"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>{formatCalcCurrency(calcCurrencySymbol === '₺' ? 50 : calcCurrencySymbol === '¥' ? 500 : 5)}</span>
                    <span>{formatCalcCurrency(calcCurrencySymbol === '₺' ? 1500 : calcCurrencySymbol === '¥' ? 15000 : 100)}</span>
                    <span>{formatCalcCurrency(calcCurrencySymbol === '₺' ? 3000 : calcCurrencySymbol === '¥' ? 30000 : 200)}+</span>
                  </div>
                </div>

                {/* Trust info note */}
                <div className="home-roi-info-banner">
                  <Sparkles size={18} style={{ flexShrink: 0, color: '#38bdf8' }} />
                  <span>
                    {ht('roiInfoBanner')}
                  </span>
                </div>
              </div>

              {/* Results Column */}
              <div className="home-roi-results">
                <div>
                  <div className="home-roi-main-stat">
                    <div className="home-roi-main-label">
                      {ht('monthlyTipsRecovered')}
                    </div>
                    <div className="home-roi-main-num">
                      +{formatCalcCurrency(calcMonthlyRecoveredTips)}
                    </div>
                    <div className="home-roi-main-desc">
                      {ht('roiMainDesc')}
                    </div>
                  </div>

                  <div className="home-roi-sub-stats">
                    <div className="home-roi-sub-item">
                      <span className="home-roi-sub-label">
                        {ht('perStaffMonthlyBoost', { count: calcStaffCount })}
                      </span>
                      <span className="home-roi-sub-val">
                        +{formatCalcCurrency(calcPerStaffGain)}
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{ht('perMonth')}</span>
                      </span>
                    </div>
                    <div className="home-roi-sub-item">
                      <span className="home-roi-sub-label">
                        {ht('costToVenue')}
                      </span>
                      <span className="home-roi-sub-val free">
                        {ht('freeForever')}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="home-roi-cta-btn"
                  onClick={() => {
                    trackFounderCtaClicked('roi_calculator');
                    trackBusinessRegisterStarted('roi_calculator');
                  }}
                >
                  <span>{ht('startRecoveringCta')}</span>
                  <ArrowRight size={17} />
                </Link>
              </div>
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
          7B. 2026 KURUCU ÜYELİK / FOUNDER MEMBERSHIP (LIFETIME FREE)
          ==================================================================== */}
      <section className="home-section" id="founder-program" style={{ paddingTop: 30, paddingBottom: 60 }}>
        <div className="home-container">
          <div
            className="home-founder-card"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(15, 23, 42, 0.96) 50%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Top Tag & Deadline */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1.2rem',
                  borderRadius: '999px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  color: '#facc15',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                }}
              >
                <Award size={16} />
                <span>{t('founder.sectionTag')}</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '1rem',
                  lineHeight: 1.25,
                }}
              >
                {t('founder.sectionTitle')}
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#cbd5e1',
                  maxWidth: '780px',
                  margin: '0 auto 1rem',
                  lineHeight: 1.6,
                }}
              >
                {t('founder.sectionSubtitle')}
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#facc15', fontSize: '0.85rem', fontWeight: 600 }}>
                <Clock size={15} />
                <span>{t('founder.deadlineNotice')}</span>
              </div>
            </div>

            {/* 4 Core Pillars Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                  }}
                >
                  <Percent size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {t('founder.card1Title')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {t('founder.card1Desc')}
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#facc15',
                  }}
                >
                  <Award size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {t('founder.card2Title')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {t('founder.card2Desc')}
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a5b4fc',
                  }}
                >
                  <QrCode size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {t('founder.card3Title')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {t('founder.card3Desc')}
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  {t('founder.card4Title')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {t('founder.card4Desc')}
                </p>
              </div>
            </div>

            {/* CTA & Legal Disclaimer */}
            <div
              className="home-founder-cta-box"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="home-founder-cta-text" style={{ maxWidth: '750px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <Sparkles size={16} />
                  <span>{t('auth.founderTitle')}</span>
                </div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.6 }}>
                  {t('founder.disclaimer')}
                </p>
              </div>

              <Link
                to="/register"
                className="home-founder-cta-btn"
                onClick={() => {
                  trackFounderCtaClicked('home_founder_section');
                  trackBusinessRegisterStarted('founder_section_cta');
                }}
              >
                <span>{t('founder.ctaBottom')}</span>
                <ArrowRight size={17} />
              </Link>
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

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Truck size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indFoodTruckTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indFoodTruckDesc')}
              </p>
            </div>

            <div className="home-industry-card">
              <div className="home-industry-icon">
                <Tent size={22} />
              </div>
              <h3 className="home-industry-title">{t('home.indPopupTitle')}</h3>
              <p className="home-industry-desc">
                {t('home.indPopupDesc')}
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
          8B. B2B TECHNOLOGY PARTNERS SECTION
          ==================================================================== */}
      <section className="home-section" id="partners" style={{ paddingTop: 30, paddingBottom: 60 }}>
        <div className="home-container">
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 1rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                }}
              >
                <Handshake size={14} />
                <span>{ht('b2bPartnership')}</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '1rem',
                  lineHeight: 1.25,
                }}
              >
                {ht('integrateNaponi')}
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#cbd5e1',
                  marginBottom: '2rem',
                  lineHeight: 1.6,
                  maxWidth: '650px',
                  margin: '0 auto 2rem',
                }}
              >
                {ht('b2bDescription')}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/technology-partners"
                  className="home-btn-primary"
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                    color: '#090d16',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    borderRadius: '12px',
                  }}
                >
                  <span>{ht('becomePartner')}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/catalog"
                  className="home-btn-ghost"
                  style={{
                    padding: '0.9rem 1.75rem',
                    fontSize: '0.95rem',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FileText size={15} className="text-emerald-400" />
                  <span>{ht('viewB2bCatalog')}</span>
                </Link>
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
                <li><a href="#experience">{t('nav.solutions')}</a></li>
                <li><Link to="/solutions/restaurants">{t('nav.restaurants')}</Link></li>
                <li><Link to="/solutions/hotels">{t('nav.hotels')}</Link></li>
                <li><Link to="/tools/restaurant-tip-pool-calculator">{ht('shiftTipPool')}</Link></li>
                <li><Link to="/tools/free-hospitality-qr-generator">{ht('hospitalityQrMaker')}</Link></li>
                <li><Link to="/tools/tip-calculator">{t('nav.tipCalculator')}</Link></li>
                <li><Link to="/compare/card-machine-vs-qr-tipping">{ht('posVsQrTipping')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="home-footer-col-title">{ht('guidesAndPlatform')}</h4>
              <ul className="home-footer-links">
                <li><Link to="/catalog" style={{ color: '#34d399', fontWeight: 700 }}>{ht('b2bCorporateDeck')}</Link></li>
                <li><Link to="/technology-partners" style={{ color: '#38bdf8', fontWeight: 700 }}>{ht('techPartnersNav')}</Link></li>
                <li><Link to="/guides">{ht('globalTippingGuides')}</Link></li>
                <li><Link to="/guides/tipping-in-japan">{ht('tippingInJapan')}</Link></li>
                <li><Link to="/guides/tipping-in-united-states">{ht('tippingInUsa')}</Link></li>
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
