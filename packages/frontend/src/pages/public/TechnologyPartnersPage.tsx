import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, LanguageSelector } from '../../i18n';
import {
  Handshake,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Layers,
  ShieldCheck,
  ChevronRight,
  Globe,
  Coins,
  UserCheck,
  HeartHandshake,
  Network,
  Workflow,
  Wrench,
  Laptop,
  QrCode,
  CreditCard,
  LayoutGrid,
  Monitor,
  Users,
  Cpu,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  Check,
  Headphones,
  FileText,
  Lock,
  ExternalLink
} from 'lucide-react';
import { LegalModal, LegalTab } from '../../components/LegalModal';
import { api } from '../../api/client';
import {
  PARTNER_COMPANY_TYPES,
  PARTNER_CUSTOMER_COUNTS,
  PARTNER_VERTICALS,
  PARTNER_ADVANTAGES,
  PARTNER_STEPS,
  PARTNER_MODELS
} from '../../content/partners/technology-partners-data';
import '../../styles/partners.css';

export const TechnologyPartnersPage: React.FC = () => {
  const { language } = useLanguage();
  const lang = (language || 'tr').toLowerCase();
  const isTr = lang.startsWith('tr');

  // Legal Modal
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('kvkk');

  const openLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    contactName: '',
    email: '',
    phone: '',
    companyType: '',
    customerCount: '',
    countries: '',
    integrationIdea: '',
    message: '',
    kvkkConsent: false,
    website_url_hp: '', // honeypot
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      setSubmitError(isTr ? 'Firma adı zorunludur.' : 'Company name is required.');
      return;
    }
    if (!formData.contactName.trim()) {
      setSubmitError(isTr ? 'Yetkili kişi adı zorunludur.' : 'Contact name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setSubmitError(isTr ? 'Geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.');
      return;
    }
    if (!formData.companyType) {
      setSubmitError(isTr ? 'Lütfen firma türünü seçiniz.' : 'Please select a company type.');
      return;
    }
    if (!formData.kvkkConsent) {
      setSubmitError(
        isTr
          ? 'Lütfen KVKK ve iletişim iznini onaylayınız.'
          : 'Please confirm the Privacy & Contact consent.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await api.post('/partner-applications', {
        companyName: formData.companyName.trim(),
        website: formData.website.trim() || undefined,
        contactName: formData.contactName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        companyType: formData.companyType,
        customerCount: formData.customerCount || undefined,
        countries: formData.countries.trim() || undefined,
        integrationIdea: formData.integrationIdea.trim() || undefined,
        message: formData.message.trim() || undefined,
        website_url_hp: formData.website_url_hp || undefined,
      });

      if (res.data?.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.data?.message || (isTr ? 'Bir hata oluştu.' : 'An error occurred.'));
      }
    } catch (err: any) {
      console.error('Partner application error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setSubmitError(serverMsg || (isTr ? 'Başvuru gönderilirken bir hata oluştu.' : 'Failed to submit application.'));
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Icon Helpers
  const renderVerticalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop size={22} style={{ color: '#38bdf8' }} />;
      case 'QrCode': return <QrCode size={22} style={{ color: '#34d399' }} />;
      case 'CreditCard': return <CreditCard size={22} style={{ color: '#a78bfa' }} />;
      case 'LayoutGrid': return <LayoutGrid size={22} style={{ color: '#fbbf24' }} />;
      case 'Building2': return <Building2 size={22} style={{ color: '#60a5fa' }} />;
      case 'Monitor': return <Monitor size={22} style={{ color: '#2dd4bf' }} />;
      case 'Users': return <Users size={22} style={{ color: '#f43f5e' }} />;
      case 'Cpu': return <Cpu size={22} style={{ color: '#818cf8' }} />;
      default: return <Cpu size={22} style={{ color: '#38bdf8' }} />;
    }
  };

  const renderAdvantageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coins': return <Coins size={24} style={{ color: '#38bdf8' }} />;
      case 'UserCheck': return <UserCheck size={24} style={{ color: '#34d399' }} />;
      case 'HeartHandshake': return <HeartHandshake size={24} style={{ color: '#fb7185' }} />;
      case 'Network': return <Network size={24} style={{ color: '#a78bfa' }} />;
      case 'Globe': return <Globe size={24} style={{ color: '#38bdf8' }} />;
      case 'Workflow': return <Workflow size={24} style={{ color: '#fbbf24' }} />;
      default: return <Sparkles size={24} style={{ color: '#34d399' }} />;
    }
  };

  const renderModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers size={24} style={{ color: '#38bdf8' }} />;
      case 'Handshake': return <Handshake size={24} style={{ color: '#34d399' }} />;
      case 'Wrench': return <Wrench size={24} style={{ color: '#fbbf24' }} />;
      case 'Sparkles': return <Sparkles size={24} style={{ color: '#c084fc' }} />;
      default: return <Workflow size={24} style={{ color: '#38bdf8' }} />;
    }
  };

  return (
    <div className="partners-page-wrapper">
      {/* Background Ambient Glows */}
      <div className="partners-glow-top" />
      <div className="partners-glow-middle" />

      {/* ====================================================================
          1. HEADER / NAVIGATION
          ==================================================================== */}
      <header className="partners-navbar">
        <div className="partners-nav-container">
          <div className="partners-nav-left">
            <Link to="/" className="partners-nav-brand" title="Naponi">
              <img src="/naponi-brand.svg" alt="Naponi" className="partners-brand-logo" />
            </Link>

            <span className="partners-nav-badge">
              <Handshake size={13} />
              <span>{isTr ? 'B2B Teknoloji Partnerliği' : 'B2B Tech Partnership'}</span>
            </span>
          </div>

          <div className="partners-nav-actions">
            <Link to="/" className="partners-back-link" title={isTr ? 'İşletmeler İçin Naponi' : 'Naponi for Venues'}>
              <span className="partners-back-link-desktop">{isTr ? '← İşletmeler İçin Naponi' : '← Naponi for Venues'}</span>
              <span className="partners-back-link-mobile">{isTr ? '← İşletmeler' : '← Venues'}</span>
            </Link>
            <div className="partners-nav-lang">
              <LanguageSelector variant="navbar" />
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('partner-form')}
              className="partners-btn-primary partners-nav-cta"
            >
              <Send size={13} />
              <span className="partners-nav-cta-desktop">{isTr ? 'Partnerlik Başvurusu' : 'Apply Now'}</span>
              <span className="partners-nav-cta-mobile">{isTr ? 'Başvur' : 'Apply'}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ====================================================================
            2. HERO SECTION
            ==================================================================== */}
        <section className="partners-hero">
          <div className="partners-hero-tag">
            <Sparkles size={14} />
            <span>{isTr ? 'POS, QR Menü ve B2B Teknoloji Entegrasyon Ortaklığı' : 'POS, QR Menu & B2B Technology Integration Partnership'}</span>
          </div>

          <h1 className="partners-hero-h1">
            {isTr ? (
              <>
                Naponi'yi <span className="partners-gradient-text">platformunuza</span> ekleyin.
              </>
            ) : (
              <>
                Integrate Naponi into <span className="partners-gradient-text">your platform</span>.
              </>
            )}
          </h1>

          <p className="partners-hero-subtitle">
            {isTr
              ? 'POS, QR Menü, ödeme ve restoran teknolojileri geliştiriyorsanız, Naponi\'nin dijital bahşiş, çalışan yönetimi ve sadakat çözümlerini kendi müşterilerinize sunabilirsiniz.'
              : 'If you develop POS, QR Menu, payment, or restaurant technology platforms, offer Naponi\'s digital tipping, employee tip management, and customer loyalty solutions directly to your merchants.'}
          </p>

          <div className="partners-hero-ctas">
            <button
              type="button"
              onClick={() => scrollToSection('partner-form')}
              className="partners-btn-primary"
            >
              <span>{isTr ? 'Partnerlik Başvurusu' : 'Become a Partner'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="partners-btn-secondary"
            >
              <HelpCircle size={18} style={{ color: '#94a3b8' }} />
              <span>{isTr ? 'Nasıl Çalışır?' : 'How It Works?'}</span>
            </button>
          </div>

          <div className="partners-trust-strip">
            <div className="partners-trust-item">
              <CheckCircle2 size={16} />
              <span>{isTr ? 'Sıfır Geliştirme Maliyeti' : 'Zero R&D Overhead'}</span>
            </div>
            <div className="partners-trust-item">
              <CheckCircle2 size={16} />
              <span>{isTr ? 'Mevcut Portföye Değer Katın' : 'Empower Merchant Base'}</span>
            </div>
            <div className="partners-trust-item">
              <CheckCircle2 size={16} />
              <span>{isTr ? 'Esnek Entegrasyon Modeli' : 'Flexible Integration'}</span>
            </div>
            <div className="partners-trust-item">
              <CheckCircle2 size={16} />
              <span>{isTr ? 'Global Fintek Uyumluluğu' : 'Global Fintech Ready'}</span>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. TWO SALES CHANNELS SECTION (ÇOK ÖNEMLİ)
            ==================================================================== */}
        <section className="partners-section partners-section-alt">
          <div className="partners-container">
            <div className="partners-section-header">
              <span className="partners-section-tag emerald">
                {isTr ? 'Stratejik Satış Mimarisi' : 'Strategic Sales Architecture'}
              </span>
              <h2 className="partners-section-h2">
                {isTr ? 'Naponi\'yi iki şekilde kullanabilirsiniz.' : 'Two ways to use Naponi.'}
              </h2>
              <p className="partners-section-p">
                {isTr
                  ? 'Naponi hem doğrudan işletmelerin kullanımına hem de teknoloji şirketlerinin kendi müşterilerine sunabileceği iş ortaklığı modeline uygundur.'
                  : 'Naponi is designed both for direct venue adoption and for technology vendors seeking to empower their existing business customer base.'}
              </p>
            </div>

            <div className="partners-channels-grid">
              {/* KART 1: Doğrudan Naponi */}
              <div className="partners-channel-card direct">
                <div>
                  <div className="partners-channel-top">
                    <div className="partners-channel-icon-box emerald">
                      <Building2 size={26} />
                    </div>
                    <span className="partners-channel-pill emerald">
                      {isTr ? 'Kanal 1 • Doğrudan Satış' : 'Channel 1 • Direct Sales'}
                    </span>
                  </div>

                  <h3 className="partners-channel-title">
                    {isTr ? 'Doğrudan Naponi' : 'Direct Naponi'}
                  </h3>
                  <div className="partners-channel-tagline emerald">
                    {isTr ? 'İşletmeler Naponi\'yi doğrudan kullanmaya başlayabilir.' : 'Merchants can use Naponi directly out of the box.'}
                  </div>
                  <p className="partners-channel-desc">
                    {isTr
                      ? 'Kafe, restoran, otel ve hizmet işletmeleri Naponi\'ye doğrudan kayıt olarak dijital bahşiş, havuz dağıtımı ve diğer Naponi çözümlerinden anında yararlanabilir.'
                      : 'Cafes, restaurants, hotels, and hospitality venues can sign up directly on Naponi to unlock contactless tips, shift pooling, and merchant features immediately.'}
                  </p>
                </div>

                <div className="partners-channel-footer">
                  <Link to="/register" className="partners-channel-btn-ghost">
                    <span>{isTr ? 'Naponi\'yi Keşfedin (İşletmeler İçin)' : 'Explore Naponi (For Venues)'}</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* KART 2: Teknoloji Partneri */}
              <div className="partners-channel-card partner">
                <div>
                  <div className="partners-channel-top">
                    <div className="partners-channel-icon-box cyan">
                      <Handshake size={26} />
                    </div>
                    <span className="partners-channel-pill cyan">
                      {isTr ? 'Kanal 2 • Partner Satışı' : 'Channel 2 • Partner Sales'}
                    </span>
                  </div>

                  <h3 className="partners-channel-title">
                    {isTr ? 'Teknoloji Partneri' : 'Technology Partner'}
                  </h3>
                  <div className="partners-channel-tagline cyan">
                    {isTr ? 'Teknoloji şirketleri Naponi\'yi kendi müşterilerine sunabilir.' : 'Technology companies can offer Naponi to their own clients.'}
                  </div>
                  <p className="partners-channel-desc">
                    {isTr
                      ? 'POS, QR Menü, restoran yönetimi, ödeme veya benzeri teknoloji platformları Naponi çözümlerini kendi ürünlerinin bir parçası veya katma değerli modülü olarak müşterilerine sunabilir.'
                      : 'POS systems, QR ordering, restaurant ERP, and payment platforms can distribute Naponi solutions as a complementary module or integrated extension for their merchants.'}
                  </p>
                </div>

                <div className="partners-channel-footer">
                  <button
                    type="button"
                    onClick={() => scrollToSection('partner-form')}
                    className="partners-channel-btn-cyan"
                  >
                    <span>{isTr ? 'Partner Olun (Başvuru Formu)' : 'Become a Partner (Apply)'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. KİMLER PARTNER OLABİLİR? (8 VERTICAL CARDS)
            ==================================================================== */}
        <section className="partners-section">
          <div className="partners-container">
            <div className="partners-section-header">
              <span className="partners-section-tag">
                {isTr ? 'Hedef Sektörel Dikeyler' : 'Target Industry Verticals'}
              </span>
              <h2 className="partners-section-h2">
                {isTr ? 'Kimler Naponi ile partner olabilir?' : 'Who can partner with Naponi?'}
              </h2>
              <p className="partners-section-p">
                {isTr
                  ? 'Hizmet ve yeme-içme sektörüne yazılım, donanım veya altyapı sağlayan tüm teknoloji şirketleri Naponi partnerlik ağına katılabilir.'
                  : 'Any technology provider delivering software, hardware, or financial infrastructure to dining and hospitality can partner with Naponi.'}
              </p>
            </div>

            <div className="partners-verticals-grid">
              {PARTNER_VERTICALS.map((vertical) => (
                <div key={vertical.id} className="partners-vertical-card">
                  <div>
                    <div className="partners-vertical-top">
                      <div className="partners-vertical-icon">
                        {renderVerticalIcon(vertical.iconName)}
                      </div>
                      <span className="partners-vertical-badge">
                        {isTr ? vertical.badgeTr : vertical.badgeEn}
                      </span>
                    </div>

                    <h3 className="partners-vertical-title">
                      {isTr ? vertical.titleTr : vertical.titleEn}
                    </h3>

                    <p className="partners-vertical-desc">
                      {isTr ? vertical.descTr : vertical.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. PARTNER FİRMAYA NE KAZANDIRIYORUZ? (ADVANTAGES)
            ==================================================================== */}
        <section className="partners-section partners-section-alt">
          <div className="partners-container">
            <div className="partners-section-header">
              <span className="partners-section-tag emerald">
                {isTr ? 'Ekosistem Değeri' : 'Ecosystem Value'}
              </span>
              <h2 className="partners-section-h2">
                {isTr ? 'Müşterilerinize yeni bir çözüm ekleyin.' : 'Add a new solution for your customers.'}
              </h2>
              <p className="partners-section-p">
                {isTr
                  ? 'Kendi ürün portföyünüzü sıfırdan yeni yazılım geliştirmeden genişletin; müşterilerinizin memnuniyetini ve bağlılığını artırın.'
                  : 'Expand your platform offerings without reinventing the wheel; increase merchant satisfaction, retention, and ecosystem stickiness.'}
              </p>
            </div>

            <div className="partners-advantages-grid">
              {PARTNER_ADVANTAGES.map((adv) => (
                <div key={adv.id} className="partners-advantage-card">
                  <div className="partners-advantage-icon">
                    {renderAdvantageIcon(adv.iconName)}
                  </div>
                  <h3 className="partners-advantage-title">
                    {isTr ? adv.titleTr : adv.titleEn}
                  </h3>
                  <p className="partners-advantage-desc">
                    {isTr ? adv.descTr : adv.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. NASIL ÇALIŞIR? (4-STEP VISUAL ROADMAP)
            ==================================================================== */}
        <section id="how-it-works" className="partners-section">
          <div className="partners-container">
            <div className="partners-section-header">
              <span className="partners-section-tag">
                {isTr ? 'Şeffaf Süreç' : 'Transparent Process'}
              </span>
              <h2 className="partners-section-h2">
                {isTr ? 'Nasıl Çalışır?' : 'How It Works?'}
              </h2>
              <p className="partners-section-p">
                {isTr
                  ? 'İlk temastan müşterilerinize ulaşıma kadar adım adım iş ortaklığı süreci.'
                  : 'A seamless 4-step collaboration journey from initial connection to merchant delivery.'}
              </p>
            </div>

            <div className="partners-steps-grid">
              {PARTNER_STEPS.map((s, idx) => (
                <div key={s.step} className="partners-step-card">
                  <div className="partners-step-header">
                    <span className="partners-step-num">{s.step}</span>
                    {idx < 3 && (
                      <div className="partners-step-arrow">
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>

                  <h3 className="partners-step-title">
                    {isTr ? s.titleTr : s.titleEn}
                  </h3>

                  <p className="partners-step-desc">
                    {isTr ? s.descTr : s.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            7. PARTNERLİK MODELLERİ
            ==================================================================== */}
        <section className="partners-section partners-section-alt">
          <div className="partners-container">
            <div className="partners-section-header">
              <span className="partners-section-tag amber">
                {isTr ? 'İş Modeli Çeşitliliği' : 'Partnership Architecture'}
              </span>
              <h2 className="partners-section-h2">
                {isTr ? 'Size uygun partnerlik modelini birlikte oluşturalım.' : 'Let\'s build the right partnership model together.'}
              </h2>
              <p className="partners-section-p">
                {isTr
                  ? 'Farklı yazılım yapıları ve ticari hedefler için esnek entegrasyon ve iş ortaklığı kurguları.'
                  : 'Flexible integration and commercial models tailored to your product maturity and growth targets.'}
              </p>
            </div>

            <div className="partners-models-grid">
              {PARTNER_MODELS.map((m) => (
                <div key={m.id} className="partners-model-card">
                  <div>
                    <div className="partners-model-top">
                      <div className="partners-model-icon">
                        {renderModelIcon(m.iconName)}
                      </div>
                      {m.tagTr && (
                        <span className="partners-model-tag">
                          {isTr ? m.tagTr : m.tagEn}
                        </span>
                      )}
                    </div>

                    <h3 className="partners-model-title">
                      {isTr ? m.titleTr : m.titleEn}
                    </h3>

                    <p className="partners-model-desc">
                      {isTr ? m.descTr : m.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            8. GÜÇLÜ MESAJ (CALLOUT)
            ==================================================================== */}
        <section className="partners-section">
          <div className="partners-callout-wrapper">
            <div className="partners-callout-box">
              <div className="partners-callout-badge">
                <ShieldCheck size={14} />
                <span>{isTr ? 'Stratejik Avantaj' : 'Strategic Advantage'}</span>
              </div>

              <h2 className="partners-callout-h2">
                {isTr ? 'Yeni bir çözüm geliştirmek zorunda değilsiniz.' : 'You don\'t have to build another solution from scratch.'}
              </h2>

              <p className="partners-callout-p">
                {isTr
                  ? 'Bahşiş, çalışan bahşiş yönetimi ve sadakat gibi çözümleri sıfırdan geliştirmek yerine Naponi altyapısından yararlanabilirsiniz.'
                  : 'Instead of spending months developing and maintaining tipping, staff distribution algorithms, and loyalty mechanisms, leverage Naponi\'s proven infrastructure.'}
              </p>

              <div className="partners-callout-pill">
                {isTr
                  ? 'Mevcut platformunuzun değerini artırın. Müşterilerinize daha fazla çözüm sunun.'
                  : 'Enhance your platform\'s core value. Deliver more solutions to your merchant network.'}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            9. PARTNERLİK BAŞVURU FORMU (INTERACTIVE B2B LEAD FORM)
            ==================================================================== */}
        <section id="partner-form" className="partners-form-section">
          <div className="partners-section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="partners-section-tag">
              {isTr ? 'Birlikte Büyüyelim' : 'Let\'s Connect'}
            </span>
            <h2 className="partners-section-h2">
              {isTr ? 'Teknoloji Partneri Olun' : 'Become a Technology Partner'}
            </h2>
            <p className="partners-section-p">
              {isTr
                ? 'Platformunuzu ve ihtiyaçlarınızı bize anlatın. Size uygun entegrasyon ve partnerlik modelini birlikte değerlendirelim.'
                : 'Tell us about your platform and goals. Let\'s evaluate the ideal technical and commercial partnership model together.'}
            </p>
          </div>

          <div className="partners-form-card">
            {submitSuccess ? (
              <div className="partners-success-box">
                <div className="partners-success-icon">
                  <Check size={32} />
                </div>
                <h3 className="partners-success-title">
                  {isTr ? 'Başvurunuz Alındı.' : 'Application Received.'}
                </h3>
                <p className="partners-success-desc">
                  {isTr
                    ? 'Ekibimiz verdiğiniz bilgiler üzerinden sizinle en kısa sürede iletişime geçecektir. Naponi partner ekosistemine ilginiz için teşekkür ederiz.'
                    : 'Our partnership team will review your platform profile and reach out shortly. Thank you for your interest in joining the Naponi ecosystem.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormData({
                      companyName: '',
                      website: '',
                      contactName: '',
                      email: '',
                      phone: '',
                      companyType: '',
                      customerCount: '',
                      countries: '',
                      integrationIdea: '',
                      message: '',
                      kvkkConsent: false,
                      website_url_hp: '',
                    });
                  }}
                  className="partners-success-reset"
                >
                  {isTr ? 'Yeni Başvuru Gönder' : 'Submit Another Application'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Bot Honeypot (Hidden) */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={formData.website_url_hp}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {submitError && (
                  <div className="partners-form-error">
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="partners-form-grid">
                  {/* Firma Adı */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Firma Adı *' : 'Company Name *'}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder={isTr ? 'Örn: RestoPOS Bilişim A.Ş.' : 'e.g. Apex POS Systems Ltd.'}
                      className="partners-form-input"
                      required
                    />
                  </div>

                  {/* Web Sitesi */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Web Sitesi' : 'Website'}
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder={isTr ? 'https://firmaniz.com' : 'https://yourcompany.com'}
                      className="partners-form-input"
                    />
                  </div>

                  {/* Yetkili Kişi */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Yetkili Kişi *' : 'Contact Person *'}
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder={isTr ? 'Örn: Ahmet Yılmaz' : 'e.g. Alex Morgan'}
                      className="partners-form-input"
                      required
                    />
                  </div>

                  {/* E-posta */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Kurumsal E-posta *' : 'Business Email *'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isTr ? 'ahmet@firmaniz.com' : 'alex@yourcompany.com'}
                      className="partners-form-input"
                      required
                    />
                  </div>

                  {/* Telefon */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Telefon' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={isTr ? '+90 5XX XXX XX XX' : '+1 (555) 000-0000'}
                      className="partners-form-input"
                    />
                  </div>

                  {/* Firma Türü */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Firma Türü *' : 'Company Type *'}
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="partners-form-select"
                      required
                    >
                      <option value="">{isTr ? 'Seçiniz...' : 'Select company type...'}</option>
                      {PARTNER_COMPANY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {isTr ? t.labelTr : t.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mevcut Müşteri Sayısı */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Mevcut Müşteri / İşletme Sayısı' : 'Active Merchant Count'}
                    </label>
                    <select
                      name="customerCount"
                      value={formData.customerCount}
                      onChange={handleChange}
                      className="partners-form-select"
                    >
                      <option value="">{isTr ? 'Belirtilmedi' : 'Unspecified'}</option>
                      {PARTNER_CUSTOMER_COUNTS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isTr ? c.labelTr : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Faaliyet Gösterilen Ülkeler */}
                  <div className="partners-form-group">
                    <label className="partners-form-label">
                      {isTr ? 'Faaliyet Gösterilen Ülkeler' : 'Operating Countries'}
                    </label>
                    <input
                      type="text"
                      name="countries"
                      value={formData.countries}
                      onChange={handleChange}
                      placeholder={isTr ? 'Örn: Türkiye, Almanya, BAE' : 'e.g. Turkey, Germany, UAE'}
                      className="partners-form-input"
                    />
                  </div>

                  {/* Nasıl bir entegrasyon düşünüyorsunuz */}
                  <div className="partners-form-group full-width">
                    <label className="partners-form-label">
                      {isTr ? 'Naponi ile nasıl bir entegrasyon düşünüyorsunuz?' : 'What kind of integration do you envision?'}
                    </label>
                    <textarea
                      rows={3}
                      name="integrationIdea"
                      value={formData.integrationIdea}
                      onChange={handleChange}
                      placeholder={
                        isTr
                          ? 'Örn: POS yazılımımızın hesap kapatma ekranında QR bahşiş seçeneği sunmak istiyoruz...'
                          : 'e.g. We want to embed QR digital tipping at the checkout screen of our restaurant POS...'
                      }
                      className="partners-form-textarea"
                    />
                  </div>

                  {/* Ek Mesaj */}
                  <div className="partners-form-group full-width">
                    <label className="partners-form-label">
                      {isTr ? 'Mesajınız / Ek Notlar' : 'Message / Additional Notes'}
                    </label>
                    <textarea
                      rows={3}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={isTr ? 'Eklemek istediğiniz diğer detaylar...' : 'Any other details or questions...'}
                      className="partners-form-textarea"
                    />
                  </div>
                </div>

                {/* KVKK Onay Kutusu */}
                <div className="partners-form-consent">
                  <label>
                    <input
                      type="checkbox"
                      name="kvkkConsent"
                      checked={formData.kvkkConsent}
                      onChange={handleChange}
                    />
                    <span>
                      {isTr ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openLegal('kvkk')}
                            className="partners-legal-btn"
                          >
                            KVKK Aydınlatma Metni
                          </button>
                          {' ve '}
                          <button
                            type="button"
                            onClick={() => openLegal('privacy')}
                            className="partners-legal-btn"
                          >
                            Gizlilik Politikası
                          </button>
                          'nı okudum. Teknoloji partnerliği kapsamında benimle iletişim kurulmasını kabul ediyorum. *
                        </>
                      ) : (
                        <>
                          I have read the{' '}
                          <button
                            type="button"
                            onClick={() => openLegal('kvkk')}
                            className="partners-legal-btn"
                          >
                            Data Protection Notice
                          </button>
                          {' and '}
                          <button
                            type="button"
                            onClick={() => openLegal('privacy')}
                            className="partners-legal-btn"
                          >
                            Privacy Policy
                          </button>
                          . I consent to being contacted for technology partnership evaluation. *
                        </>
                      )}
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="partners-form-submit"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{isTr ? 'Gönderiliyor...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{isTr ? 'Partnerlik Başvurusu Gönder' : 'Submit Partner Application'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ====================================================================
          10. FOOTER
          ==================================================================== */}
      <footer className="partners-footer">
        <div className="partners-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/">
              <img src="/naponi-brand.svg" alt="Naponi" style={{ height: '32px', width: 'auto' }} />
            </Link>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              © {new Date().getFullYear()} NAPONI. {isTr ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
            </span>
          </div>

          <div className="partners-footer-links">
            <Link to="/">{isTr ? 'Anasayfa' : 'Home'}</Link>
            <Link to="/catalog" style={{ color: '#34d399', fontWeight: 600 }}>
              {isTr ? 'B2B Katalog' : 'Corporate Deck'}
            </Link>
            <button type="button" onClick={() => openLegal('kvkk')}>
              {isTr ? 'KVKK Metni' : 'GDPR Notice'}
            </button>
            <button type="button" onClick={() => openLegal('privacy')}>
              {isTr ? 'Gizlilik Politikası' : 'Privacy'}
            </button>
            <button type="button" onClick={() => openLegal('terms')}>
              {isTr ? 'Kullanım Koşulları' : 'Terms'}
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
};

export default TechnologyPartnersPage;
