import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Globe,
  Utensils,
  Coffee,
  Car,
  Hotel,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calculator,
  Compass,
  CreditCard,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { TIPPING_GUIDES, CountryTippingGuide } from '../../../content/guides/tipping-guides';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

const SECTOR_ICONS: Record<string, any> = {
  Utensils,
  Coffee,
  Car,
  Hotel,
  Package,
};

export const TippingGuideDetailPage: React.FC = () => {
  const { country } = useParams<{ country: string }>();
  const { language } = useLanguage();
  const isEn = language !== 'tr';

  const guide = TIPPING_GUIDES.find(
    (g) => g.slug.toLowerCase() === country?.toLowerCase() || g.slug === country?.replace(/^tipping-in-/, '')
  );

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Local interactive tip calculator state
  const defaultRateNumber = guide ? parseFloat(guide.standardRate.replace(/[^0-9.]/g, '')) || 10 : 10;
  const [billAmount, setBillAmount] = useState<number>(100);
  const [selectedRate, setSelectedRate] = useState<number>(defaultRateNumber);

  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const countryName = isEn ? guide.country.en : guide.country.tr;
  const overview = isEn ? guide.shortOverview.en : guide.shortOverview.tr;
  const cultural = isEn ? guide.culturalContext.en : guide.culturalContext.tr;
  const cashVsDigital = isEn ? guide.cashVsDigitalTips.en : guide.cashVsDigitalTips.tr;
  const businessInsight = isEn ? guide.businessInsight.en : guide.businessInsight.tr;
  const etiquetteBadge = isEn ? guide.etiquetteBadge.en : guide.etiquetteBadge.tr;

  const calculatedTip = (billAmount * selectedRate) / 100;
  const calculatedTotal = billAmount + calculatedTip;

  const otherGuides = TIPPING_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  // Structured Data (Schema.org)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.naponi.com/guides/tipping-in-${guide.slug}`,
    },
    headline: isEn ? guide.meta.title.en : guide.meta.title.tr,
    description: isEn ? guide.meta.description.en : guide.meta.description.tr,
    author: {
      '@type': 'Organization',
      name: 'Naponi International Hospitality Research',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Naponi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.naponi.com/logo.png',
      },
    },
    about: {
      '@type': 'Place',
      name: countryName,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: isEn ? faq.question.en : faq.question.tr,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEn ? faq.answer.en : faq.answer.tr,
      },
    })),
  };

  const getBadgeStyle = (type: CountryTippingGuide['etiquetteType']) => {
    switch (type) {
      case 'expected':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'discouraged':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'included':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'customary':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      <SeoHead
        title={isEn ? guide.meta.title.en : guide.meta.title.tr}
        description={isEn ? guide.meta.description.en : guide.meta.description.tr}
        canonicalUrl={`https://www.naponi.com/guides/tipping-in-${guide.slug}`}
        keywords={guide.meta.keywords}
        faqSchema={guide.faqs.map((faq) => ({
          question: isEn ? faq.question.en : faq.question.tr,
          answer: isEn ? faq.answer.en : faq.answer.tr,
        }))}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0D14]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Naponi
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link to="/guides" className="text-emerald-400 font-semibold transition-colors">
              {isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}
            </Link>
            <Link to="/tools/restaurant-tip-pool-calculator" className="hover:text-white transition-colors">
              {isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}
            </Link>
            <Link to="/tools/free-hospitality-qr-generator" className="hover:text-white transition-colors">
              {isEn ? 'QR Generator' : 'QR Üretici'}
            </Link>
            <Link to="/compare/card-machine-vs-qr-tipping" className="hover:text-white transition-colors">
              {isEn ? 'Compare' : 'Karşılaştırma'}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>{isEn ? 'Get Started' : 'Hemen Başla'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-slate-300 transition-colors">
            {isEn ? 'Home' : 'Ana Sayfa'}
          </Link>
          <span>/</span>
          <Link to="/guides" className="hover:text-slate-300 transition-colors">
            {isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}
          </Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">
            {countryName}
          </span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10 bg-gradient-to-br from-slate-900/90 via-[#0E131F]/90 to-slate-950 overflow-hidden mb-16 shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-4xl sm:text-5xl">{guide.flag}</span>
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {guide.continent} • {guide.currency} ({guide.currencySymbol})
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getBadgeStyle(guide.etiquetteType)}`}>
                {etiquetteBadge}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              {isEn ? `Tipping in ${countryName}: Complete 2026 Etiquette & Rates` : `${countryName}’de Bahşiş Ne Kadar Verilir? 2026 Rehberi`}
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
              {overview}
            </p>

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-slate-400 block mb-1">
                  {isEn ? 'Standard Restaurant Rate' : 'Genel Restoran Oranı'}
                </span>
                <span className="text-2xl font-bold text-emerald-400">{guide.standardRate}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-slate-400 block mb-1">
                  {isEn ? 'Local Currency' : 'Yerel Para Birimi'}
                </span>
                <span className="text-2xl font-bold text-white">{guide.currency} ({guide.currencySymbol})</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-slate-400 block mb-1">
                  {isEn ? 'Digital Tipping' : 'Dijital Bahşiş'}
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {guide.etiquetteType === 'discouraged'
                    ? (isEn ? 'Limited' : 'Kısıtlı')
                    : (isEn ? 'Rapidly Growing' : 'Yaygınlaşıyor')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left Content / Right Interactive Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left Column: In-depth Culture & Sectors */}
          <div className="lg:col-span-7 space-y-12">
            {/* Cultural Context */}
            <section className="bg-slate-900/50 rounded-3xl p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {isEn ? `Cultural Etiquette & Social Norms in ${countryName}` : `${countryName} Bahşiş Kültürü ve Sosyal Kurallar`}
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed text-base">
                {cultural}
              </p>
            </section>

            {/* Sector Breakdown Cards */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {isEn ? 'How Much to Tip by Sector' : 'Sektörlere Göre Ne Kadar Bahşiş Verilir?'}
                </h2>
              </div>

              <div className="space-y-4">
                {guide.sectors.map((sector) => {
                  const SectorIcon = SECTOR_ICONS[sector.icon] || Utensils;
                  return (
                    <div
                      key={sector.id}
                      className="bg-slate-900/40 hover:bg-slate-900/70 transition-colors rounded-2xl p-6 border border-white/5 hover:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                            <SectorIcon className="w-4 h-4" />
                          </div>
                          <h3 className="font-semibold text-lg text-white">
                            {isEn ? sector.name.en : sector.name.tr}
                          </h3>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          {isEn ? sector.rate.en : sector.rate.tr}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {isEn ? sector.advice.en : sector.advice.tr}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Cash vs Digital */}
            <section className="bg-slate-900/50 rounded-3xl p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {isEn ? 'Cash vs. Digital Tipping' : 'Nakit mi, Kredi Kartı & QR mı?'}
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed text-base">
                {cashVsDigital}
              </p>
            </section>

            {/* Business Insight Callout */}
            <section className="bg-gradient-to-r from-emerald-950/30 to-teal-950/30 rounded-3xl p-8 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {isEn ? `Operating a Restaurant in ${countryName}?` : `${countryName}’de Restoran veya Kafe İşletiyorsanız`}
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed text-base mb-6">
                {businessInsight}
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all"
                >
                  <span>{isEn ? 'Setup QR Tipping Free' : 'Ücretsiz QR Bahşiş Kur'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/tools/restaurant-tip-pool-calculator"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-all border border-white/10"
                >
                  <span>{isEn ? 'Try Shift Tip Pool Calculator' : 'Vardiya Havuz Hesaplayıcıyı Dene'}</span>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Localized Sticky Tip Calculator */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {isEn ? `${countryName} Tip Calculator` : `${countryName} Bahşiş Hesaplayıcı`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isEn ? `Instant rates in ${guide.currency}` : `${guide.currency} cinsinden anlık hesap`}
                    </p>
                  </div>
                </div>
                <span className="text-2xl">{guide.flag}</span>
              </div>

              {/* Bill Amount Input */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  {isEn ? 'Bill Amount' : 'Hesap Tutarı'} ({guide.currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                    {guide.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={billAmount}
                    onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Tip Percentage Buttons */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  {isEn ? 'Tip Percentage' : 'Bahşiş Oranı'} (%)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 10, 15, 18, 20].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSelectedRate(rate)}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                        selectedRate === rate
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      %{rate}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Summary Box */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{isEn ? 'Tip Amount' : 'Bahşiş Tutarı'}:</span>
                  <span className="font-bold text-emerald-400 text-lg">
                    {guide.currencySymbol}{calculatedTip.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center text-base">
                  <span className="text-slate-200 font-semibold">{isEn ? 'Total Bill' : 'Toplam Ödeme'}:</span>
                  <span className="font-extrabold text-white text-2xl">
                    {guide.currencySymbol}{calculatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* CTA Inside Widget */}
              <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs text-emerald-300 font-medium mb-3">
                  {isEn
                    ? 'Accept digital tips anywhere in the world with zero hardware.'
                    : 'Dünyanın her yerinde sıfır cihaz maliyetiyle dijital bahşiş toplayın.'}
                </p>
                <Link
                  to="/register"
                  className="block w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  {isEn ? 'Start Free with Naponi' : 'Naponi ile Ücretsiz Başlayın'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              {isEn ? `Frequently Asked Questions About Tipping in ${countryName}` : `${countryName} Bahşiş Rehberi Hakkında Sık Sorulan Sorular`}
            </h2>
            <p className="text-slate-400">
              {isEn ? 'Key answers for travelers, diners, and restaurant operators.' : 'Gezginler, müşteriler ve işletmeler için en çok merak edilen sorular.'}
            </p>
          </div>

          <div className="space-y-4">
            {guide.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-lg text-white">
                    {isEn ? faq.question.en : faq.question.tr}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {isEn ? faq.answer.en : faq.answer.tr}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Other Guides Carousel / Grid */}
        <section className="border-t border-white/5 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEn ? 'Explore Other Country Tipping Guides' : 'Diğer Ülkelerin Bahşiş Rehberleri'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isEn ? 'Global norms, etiquette, and rates across 10+ popular destinations.' : 'Dünya genelinde 10+ popüler destinasyonda bahşiş kuralları.'}
              </p>
            </div>
            <Link
              to="/guides"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>{isEn ? 'View All Guides' : 'Tüm Rehberleri Gör'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherGuides.map((other) => (
              <Link
                key={other.slug}
                to={`/guides/tipping-in-${other.slug}`}
                className="group bg-slate-900/40 hover:bg-slate-900/80 rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{other.flag}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
                    {other.currency}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors mb-2">
                  {isEn ? other.country.en : other.country.tr}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {isEn ? other.shortOverview.en : other.shortOverview.tr}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p className="mb-2">© 2026 Naponi. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-slate-400">
            <Link to="/guides" className="hover:text-white transition-colors">{isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}</Link>
            <Link to="/tools/restaurant-tip-pool-calculator" className="hover:text-white transition-colors">{isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}</Link>
            <Link to="/tools/free-hospitality-qr-generator" className="hover:text-white transition-colors">{isEn ? 'QR Generator' : 'QR Üretici'}</Link>
            <Link to="/compare/card-machine-vs-qr-tipping" className="hover:text-white transition-colors">{isEn ? 'POS vs QR' : 'POS vs QR'}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
