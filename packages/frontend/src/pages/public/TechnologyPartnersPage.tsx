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

  // Icon Helper
  const renderVerticalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop size={22} className="text-sky-400" />;
      case 'QrCode': return <QrCode size={22} className="text-emerald-400" />;
      case 'CreditCard': return <CreditCard size={22} className="text-purple-400" />;
      case 'LayoutGrid': return <LayoutGrid size={22} className="text-amber-400" />;
      case 'Building2': return <Building2 size={22} className="text-blue-400" />;
      case 'Monitor': return <Monitor size={22} className="text-teal-400" />;
      case 'Users': return <Users size={22} className="text-rose-400" />;
      case 'Cpu': return <Cpu size={22} className="text-indigo-400" />;
      default: return <Cpu size={22} className="text-sky-400" />;
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
    <div className="home-root min-h-screen text-slate-100 flex flex-col" style={{ background: '#090d16' }}>
      {/* Dynamic Background Glows */}
      <div className="home-bg-glow-top" />
      <div className="home-bg-glow-middle" />

      {/* ====================================================================
          1. HEADER / NAVIGATION
          ==================================================================== */}
      <header className="home-nav-wrapper sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(9, 13, 22, 0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <nav className="home-nav max-w-7xl mx-auto px-4 py-3 flex items-center justify-between" aria-label="Partner Navigation">
          <div className="flex items-center gap-6">
            <Link to="/" className="home-nav-brand flex items-center gap-2" title="Naponi">
              <img src="/naponi-brand.svg" alt="Naponi" className="h-9 w-auto" />
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <Handshake size={13} />
              {isTr ? 'B2B Partner Kanalı' : 'B2B Partner Channel'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors mr-2"
            >
              {isTr ? '← İşletmeler İçin Naponi' : '← Naponi for Venues'}
            </Link>
            <LanguageSelector variant="navbar" />
            <button
              type="button"
              onClick={() => scrollToSection('partner-form')}
              className="home-btn-primary text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff' }}
            >
              <Send size={15} />
              <span>{isTr ? 'Partnerlik Başvurusu' : 'Partner Application'}</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ====================================================================
            2. HERO SECTION
            ==================================================================== */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8' }}>
              <Sparkles size={14} className="animate-pulse" />
              <span>{isTr ? 'POS, QR Menü ve B2B Teknoloji Entegrasyon Ortaklığı' : 'POS, QR Menu & B2B Technology Integration Partnership'}</span>
            </div>

            {/* Main H1 Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              {isTr ? (
                <>
                  Naponi'yi <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>platformunuza</span> ekleyin.
                </>
              ) : (
                <>
                  Integrate Naponi into <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>your platform</span>.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed font-normal">
              {isTr
                ? 'POS, QR Menü, ödeme ve restoran teknolojileri geliştiriyorsanız, Naponi\'nin dijital bahşiş, çalışan yönetimi ve sadakat çözümlerini kendi müşterilerinize sunabilirsiniz.'
                : 'If you build POS, QR Menu, payment, or restaurant technology platforms, offer Naponi\'s digital tipping, employee tip management, and customer loyalty solutions directly to your merchants.'}
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                type="button"
                onClick={() => scrollToSection('partner-form')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#090d16' }}
              >
                <span>{isTr ? 'Partnerlik Başvurusu' : 'Become a Partner'}</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-base text-slate-200 hover:text-white transition-all border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <HelpCircle size={18} className="text-slate-400" />
                <span>{isTr ? 'Nasıl Çalışır?' : 'How It Works?'}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{isTr ? 'Sıfır Geliştirme Maliyeti' : 'Zero R&D Overhead'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{isTr ? 'Mevcut Portföye Değer Katın' : 'Empower Merchant Base'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{isTr ? 'Esnek Entegrasyon Modeli' : 'Flexible Integration'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{isTr ? 'Global Fintek Uyumluluğu' : 'Global Fintech Ready'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. TWO SALES CHANNELS SECTION (ÇOK ÖNEMLİ)
            ==================================================================== */}
        <section className="py-16 relative" style={{ background: 'rgba(15, 23, 42, 0.65)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
                {isTr ? 'Stratejik Satış Mimarisi' : 'Strategic Sales Architecture'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {isTr ? 'Naponi\'yi iki şekilde kullanabilirsiniz.' : 'Two ways to use Naponi.'}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                {isTr
                  ? 'Naponi hem doğrudan işletmelerin kullanımına hem de teknoloji şirketlerinin kendi müşterilerine sunabileceği iş ortaklığı modeline uygundur.'
                  : 'Naponi is designed both for direct merchant adoption and for technology vendors seeking to empower their existing business customer base.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CARD 1: Doğrudan Naponi */}
              <div className="relative rounded-2xl p-8 transition-all border border-slate-700/60 bg-slate-900/80 hover:border-slate-600 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                      <Building2 size={24} style={{ color: '#34d399' }} />
                    </div>
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {isTr ? 'Kanal 1 • Doğrudan Satış' : 'Channel 1 • Direct Sales'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isTr ? 'Doğrudan Naponi' : 'Direct Naponi'}
                  </h3>
                  <p className="text-emerald-400 font-medium text-sm mb-4">
                    {isTr ? 'İşletmeler Naponi\'yi doğrudan kullanmaya başlayabilir.' : 'Merchants can use Naponi directly out of the box.'}
                  </p>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {isTr
                      ? 'Kafe, restoran, otel ve hizmet işletmeleri Naponi\'ye doğrudan kayıt olarak dijital bahşiş, havuz dağıtımı ve diğer Naponi çözümlerinden anında yararlanabilir.'
                      : 'Cafes, restaurants, hotels, and hospitality venues can sign up directly on Naponi to unlock contactless tips, shift pooling, and merchant features immediately.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <span>{isTr ? 'Naponi\'yi Keşfedin (İşletmeler İçin)' : 'Explore Naponi (For Venues)'}</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* CARD 2: Teknoloji Partneri */}
              <div className="relative rounded-2xl p-8 transition-all border border-sky-500/40 bg-gradient-to-b from-sky-950/40 via-slate-900/90 to-slate-900 flex flex-col justify-between shadow-xl group">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-sky-500 text-slate-950 shadow-md">
                    <Sparkles size={11} /> {isTr ? 'B2B Ortaklık' : 'B2B Partnership'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                      <Handshake size={24} style={{ color: '#38bdf8' }} />
                    </div>
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full text-sky-400 bg-sky-500/10 border border-sky-500/20">
                      {isTr ? 'Kanal 2 • Partner Satışı' : 'Channel 2 • Partner Sales'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isTr ? 'Teknoloji Partneri' : 'Technology Partner'}
                  </h3>
                  <p className="text-sky-400 font-medium text-sm mb-4">
                    {isTr ? 'Teknoloji şirketleri Naponi\'yi kendi müşterilerine sunabilir.' : 'Technology companies can offer Naponi to their own clients.'}
                  </p>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {isTr
                      ? 'POS, QR Menü, restoran yönetimi, ödeme veya benzeri teknoloji platformları Naponi çözümlerini kendi ürünlerinin bir parçası veya katma değerli modülü olarak müşterilerine sunabilir.'
                      : 'POS systems, QR ordering, restaurant ERP, and payment platforms can distribute Naponi solutions as a complementary module or integrated extension for their merchants.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => scrollToSection('partner-form')}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' }}
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
        <section className="py-20 max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 block">
              {isTr ? 'Hedef Sektörel Dikeyler' : 'Target Industry Verticals'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              {isTr ? 'Kimler Naponi ile partner olabilir?' : 'Who can partner with Naponi?'}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base">
              {isTr
                ? 'Hizmet ve yeme-içme sektörüne yazılım, donanım veya altyapı sağlayan tüm teknoloji şirketleri Naponi partnerlik ağına katılabilir.'
                : 'Any technology provider delivering software, hardware, or financial infrastructure to dining and hospitality can partner with Naponi.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PARTNER_VERTICALS.map((vertical) => (
              <div
                key={vertical.id}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-750 transition-colors">
                      {renderVerticalIcon(vertical.iconName)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                      {isTr ? vertical.badgeTr : vertical.badgeEn}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {isTr ? vertical.titleTr : vertical.titleEn}
                  </h3>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    {isTr ? vertical.descTr : vertical.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            5. PARTNER FİRMAYA NE KAZANDIRIYORUZ? (ADVANTAGES)
            ==================================================================== */}
        <section className="py-20 relative" style={{ background: 'rgba(15, 23, 42, 0.45)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 block">
                {isTr ? 'Ekosistem Değeri' : 'Ecosystem Value'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {isTr ? 'Müşterilerinize yeni bir çözüm ekleyin.' : 'Add a new solution for your customers.'}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                {isTr
                  ? 'Kendi ürün portföyünüzü sıfırdan yeni yazılım geliştirmeden genişletin; müşterilerinizin memnuniyetini ve bağlılığını artırın.'
                  : 'Expand your platform offerings without reinventing the wheel; increase merchant satisfaction, retention, and ecosystem stickiness.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PARTNER_ADVANTAGES.map((adv) => (
                <div
                  key={adv.id}
                  className="p-7 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-start"
                >
                  <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center bg-slate-800/80 border border-slate-700/50">
                    {renderAdvantageIcon(adv.iconName)}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wider mb-2 uppercase text-slate-100">
                    {isTr ? adv.titleTr : adv.titleEn}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
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
        <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 block">
              {isTr ? 'Şeffaf Süreç' : 'Transparent Process'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              {isTr ? 'Nasıl Çalışır?' : 'How It Works?'}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base">
              {isTr
                ? 'İlk temastan müşterilerinize ulaşıma kadar adım adım iş ortaklığı süreci.'
                : 'A seamless 4-step collaboration journey from initial connection to merchant delivery.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {PARTNER_STEPS.map((s, idx) => (
              <div
                key={s.step}
                className="relative rounded-2xl p-6 bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-extrabold font-mono text-sky-400">
                      {s.step}
                    </span>
                    {idx < 3 && (
                      <div className="hidden md:block text-slate-600">
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {isTr ? s.titleTr : s.titleEn}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {isTr ? s.descTr : s.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            7. PARTNERLİK MODELLERİ
            ==================================================================== */}
        <section className="py-20 relative" style={{ background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 block">
                {isTr ? 'İş Modeli Çeşitliliği' : 'Partnership Architecture'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {isTr ? 'Size uygun partnerlik modelini birlikte oluşturalım.' : 'Let\'s build the right partnership model together.'}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base">
                {isTr
                  ? 'Farklı yazılım yapıları ve ticari hedefler için esnek entegrasyon ve iş ortaklığı kurguları.'
                  : 'Flexible integration and commercial models tailored to your product maturity and growth targets.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PARTNER_MODELS.map((m) => (
                <div
                  key={m.id}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                        {renderModelIcon(m.iconName)}
                      </div>
                      {m.tagTr && (
                        <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                          {isTr ? m.tagTr : m.tagEn}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {isTr ? m.titleTr : m.titleEn}
                    </h3>

                    <p className="text-slate-300 text-xs leading-relaxed">
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
        <section className="py-16 max-w-5xl mx-auto px-4">
          <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-sky-500/30 bg-gradient-to-r from-sky-950/70 via-slate-900/90 to-emerald-950/70 shadow-2xl text-center">
            <div className="max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ShieldCheck size={14} />
                {isTr ? 'Stratejik Avantaj' : 'Strategic Advantage'}
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                {isTr ? 'Yeni bir çözüm geliştirmek zorunda değilsiniz.' : 'You don\'t have to build another solution from scratch.'}
              </h2>

              <p className="text-slate-200 text-base sm:text-lg mb-6 leading-relaxed">
                {isTr
                  ? 'Bahşiş, çalışan bahşiş yönetimi ve sadakat gibi çözümleri sıfırdan geliştirmek yerine Naponi altyapısından yararlanabilirsiniz.'
                  : 'Instead of spending months developing and maintaining tipping, staff distribution algorithms, and loyalty mechanisms, leverage Naponi\'s proven infrastructure.'}
              </p>

              <div className="inline-block px-5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm font-semibold text-emerald-400">
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
        <section id="partner-form" className="py-20 relative max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 block">
              {isTr ? 'Birlikte Büyüyelim' : 'Let\'s Connect'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              {isTr ? 'Teknoloji Partneri Olun' : 'Become a Technology Partner'}
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
              {isTr
                ? 'Platformunuzu ve ihtiyaçlarınızı bize anlatın. Size uygun entegrasyon ve partnerlik modelini birlikte değerlendirelim.'
                : 'Tell us about your platform and goals. Let\'s evaluate the ideal technical and commercial partnership model together.'}
            </p>
          </div>

          <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
            {submitSuccess ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isTr ? 'Başvurunuz Alındı.' : 'Application Received.'}
                </h3>
                <p className="text-slate-300 max-w-md mx-auto text-sm sm:text-base mb-8">
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
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
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
                  <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  {/* Firma Adı */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Firma Adı *' : 'Company Name *'}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder={isTr ? 'Örn: RestoPOS Bilişim A.Ş.' : 'e.g. Apex POS Systems Ltd.'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Web Sitesi */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Web Sitesi' : 'Website'}
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder={isTr ? 'https://firmaniz.com' : 'https://yourcompany.com'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  {/* Yetkili Kişi */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Yetkili Kişi *' : 'Contact Person *'}
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder={isTr ? 'Örn: Ahmet Yılmaz' : 'e.g. Alex Morgan'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                      required
                    />
                  </div>

                  {/* E-posta */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Kurumsal E-posta *' : 'Business Email *'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isTr ? 'ahmet@firmaniz.com' : 'alex@yourcompany.com'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Telefon' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={isTr ? '+90 5XX XXX XX XX' : '+1 (555) 000-0000'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  {/* Firma Türü */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Firma Türü *' : 'Company Type *'}
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
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

                  {/* Mevcut Müşteri / İşletme Sayısı */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Mevcut Müşteri / İşletme Sayısı' : 'Current Active Merchant Count'}
                    </label>
                    <select
                      name="customerCount"
                      value={formData.customerCount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isTr ? 'Faaliyet Gösterilen Ülkeler' : 'Operating Countries'}
                    </label>
                    <input
                      type="text"
                      name="countries"
                      value={formData.countries}
                      onChange={handleChange}
                      placeholder={isTr ? 'Örn: Türkiye, Almanya, BAE' : 'e.g. Turkey, Germany, UAE'}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Nasıl bir entegrasyon düşünüyorsunuz */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    {isTr ? 'Naponi ile nasıl bir entegrasyon düşünüyorsunuz?' : 'What kind of integration or partnership do you envision?'}
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                {/* Ek Mesaj */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    {isTr ? 'Mesajınız / Ek Notlar' : 'Message / Additional Notes'}
                  </label>
                  <textarea
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={isTr ? 'Eklemek istediğiniz diğer detaylar...' : 'Any other details or questions...'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                {/* KVKK Onay Kutusu */}
                <div className="mb-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700/70">
                  <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-slate-300 leading-normal">
                    <input
                      type="checkbox"
                      name="kvkkConsent"
                      checked={formData.kvkkConsent}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 rounded text-sky-500 bg-slate-750 border-slate-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>
                      {isTr ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openLegal('kvkk')}
                            className="text-sky-400 hover:underline font-medium inline-block"
                          >
                            KVKK Aydınlatma Metni
                          </button>
                          {' ve '}
                          <button
                            type="button"
                            onClick={() => openLegal('privacy')}
                            className="text-sky-400 hover:underline font-medium inline-block"
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
                            className="text-sky-400 hover:underline font-medium inline-block"
                          >
                            Data Protection Notice
                          </button>
                          {' and '}
                          <button
                            type="button"
                            onClick={() => openLegal('privacy')}
                            className="text-sky-400 hover:underline font-medium inline-block"
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
                  className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#090d16' }}
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
      <footer className="home-footer border-t border-slate-800/80 pt-12 pb-8" style={{ background: '#070a12' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800 text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src="/naponi-brand.svg" alt="Naponi" className="h-8 w-auto" />
              </Link>
              <span className="text-xs text-slate-500">
                © {new Date().getFullYear()} NAPONI. {isTr ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs sm:text-sm flex-wrap justify-center">
              <Link to="/" className="hover:text-white transition-colors">
                {isTr ? 'Anasayfa' : 'Home'}
              </Link>
              <Link to="/catalog" className="hover:text-emerald-400 transition-colors">
                {isTr ? 'B2B Katalog' : 'Corporate Deck'}
              </Link>
              <button
                type="button"
                onClick={() => openLegal('kvkk')}
                className="hover:text-sky-400 transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer"
              >
                {isTr ? 'KVKK Metni' : 'GDPR Notice'}
              </button>
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="hover:text-sky-400 transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer"
              >
                {isTr ? 'Gizlilik Politikası' : 'Privacy'}
              </button>
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="hover:text-sky-400 transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer"
              >
                {isTr ? 'Kullanım Koşulları' : 'Terms'}
              </button>
            </div>
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
