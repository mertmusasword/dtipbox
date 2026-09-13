import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Search,
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { TIPPING_GUIDES } from '../../../content/guides/tipping-guides';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

export const TippingGuidesHubPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'tr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');

  const continents = useMemo(() => {
    const set = new Set(TIPPING_GUIDES.map((g) => g.continent));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredGuides = useMemo(() => {
    return TIPPING_GUIDES.filter((guide) => {
      const name = isEn ? guide.country.en.toLowerCase() : guide.country.tr.toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || guide.currency.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === 'all' || guide.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [searchQuery, selectedContinent, isEn]);

  const pageTitle = isEn
    ? 'Global Tipping Guides 2026: Worldwide Etiquette, Rates & Customs — Naponi'
    : 'Dünya Bahşiş Rehberleri 2026: Ülke Ülke Bahşiş Kuralları ve Oranları — Naponi';

  const pageDesc = isEn
    ? 'Explore comprehensive tipping etiquette, standard restaurant rates, taxi gratuity, and cashless customs across 10+ major tourist destinations including USA, Japan, France, Italy, Turkey, and New Zealand.'
    : 'ABD, Japonya, Fransa, İtalya, İngiltere, Türkiye ve Yeni Zelanda dahil 10+ ülkede ne kadar bahşiş verileceğini, restoran ve taksi kurallarını, dijital bahşiş adetlerini keşfedin.';

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      <SeoHead
        title={pageTitle}
        description={pageDesc}
        canonicalUrl="https://www.naponi.com/guides"
        keywords={['dünya bahşiş rehberi', 'global tipping guides', 'tipping in japan', 'tipping in usa', 'tipping in france', 'ne kadar bahşiş verilir']}
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
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Globe className="w-3.5 h-3.5" />
            <span>{isEn ? 'Worldwide Hospitality Etiquette' : 'Küresel Bahşiş ve Hizmet Kültürü'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            {isEn ? 'International Tipping Guides' : 'Dünya Bahşiş Rehberleri'}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            {isEn
              ? 'Avoid cultural misunderstandings abroad. Explore exact tipping expectations, currency rates, taxi & restaurant customs, and digital gratuity adoption across destinations.'
              : 'Yurt dışı seyahatlerinizde veya uluslararası misafir ağırlarken kültürel hatalardan kaçının. Ülke ülke standart bahşiş oranları ve kuralları.'}
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search destination or currency...' : 'Ülke veya para birimi ara...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Continent Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {continents.map((continent) => (
              <button
                key={continent}
                type="button"
                onClick={() => setSelectedContinent(continent)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedContinent === continent
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {continent === 'all' ? (isEn ? 'All Destinations' : 'Tüm Ülkeler') : continent}
              </button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredGuides.map((guide) => {
            const countryName = isEn ? guide.country.en : guide.country.tr;
            const overview = isEn ? guide.shortOverview.en : guide.shortOverview.tr;
            const etiquetteBadge = isEn ? guide.etiquetteBadge.en : guide.etiquetteBadge.tr;

            return (
              <Link
                key={guide.slug}
                to={`/guides/tipping-in-${guide.slug}`}
                className="group bg-slate-900/40 hover:bg-slate-900/90 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1.5 flex flex-col justify-between shadow-lg hover:shadow-emerald-500/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{guide.flag}</span>
                      <div>
                        <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {countryName}
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">
                          {guide.currency} ({guide.currencySymbol})
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {guide.standardRate}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {etiquetteBadge}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-6">
                    {overview}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>{isEn ? 'Read Complete Guide' : 'Detaylı Rehberi Oku'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Global CTA */}
        <section className="rounded-3xl p-8 sm:p-12 lg:p-16 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              {isEn ? 'Host Global Guests with Naponi' : 'Global Misafirlerinizi Naponi ile Ağırlayın'}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              {isEn
                ? 'Welcome travelers from Japan, America, Europe, and beyond. Naponi automatically shows tipping menus in their native language and accepts Apple Pay & Google Pay with zero app friction.'
                : 'Japonya’dan, Amerika’dan veya Avrupa’dan gelen konuklarınız kendi dillerinde ve Apple Pay / Google Pay ile saniyeler içinde bahşiş bıraksın.'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>{isEn ? 'Start Your Free Account' : 'Ücretsiz İşletme Hesabı Aç'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
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
