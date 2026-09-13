import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Scale,
  Award,
  Zap,
  Building2
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { COMPARISONS, ComparisonItem } from '../../../content/comparisons/comparisons';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

export const ComparisonDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const isEn = language !== 'tr';

  const item = COMPARISONS.find((c) => c.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!item) {
    return <Navigate to="/compare/card-machine-vs-qr-tipping" replace />;
  }

  const badge = isEn ? item.badge.en : item.badge.tr;
  const title = isEn ? item.title.en : item.title.tr;
  const subtitle = isEn ? item.subtitle.en : item.subtitle.tr;
  const heroSummary = isEn ? item.heroSummary.en : item.heroSummary.tr;
  const audience = isEn ? item.targetAudience.en : item.targetAudience.tr;
  const quickVerdict = isEn ? item.quickVerdict.en : item.quickVerdict.tr;

  const otherComparisons = COMPARISONS.filter((c) => c.slug !== item.slug);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.naponi.com/compare/${item.slug}`,
    },
    headline: isEn ? item.meta.title.en : item.meta.title.tr,
    description: isEn ? item.meta.description.en : item.meta.description.tr,
    author: {
      '@type': 'Organization',
      name: 'Naponi Hospitality Research Lab',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: item.faqs.map((faq) => ({
      '@type': 'Question',
      name: isEn ? faq.question.en : faq.question.tr,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isEn ? faq.answer.en : faq.answer.tr,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      <SeoHead
        title={isEn ? item.meta.title.en : item.meta.title.tr}
        description={isEn ? item.meta.description.en : item.meta.description.tr}
        canonicalUrl={`https://www.naponi.com/compare/${item.slug}`}
        keywords={item.meta.keywords}
        faqSchema={item.faqs.map((f) => ({
          question: isEn ? f.question.en : f.question.tr,
          answer: isEn ? f.answer.en : f.answer.tr,
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
            <Link to="/guides" className="hover:text-white transition-colors">
              {isEn ? 'Tipping Guides' : 'Bahşiş Rehberleri'}
            </Link>
            <Link to="/tools/restaurant-tip-pool-calculator" className="hover:text-white transition-colors">
              {isEn ? 'Tip Pool Calculator' : 'Havuz Hesaplayıcı'}
            </Link>
            <Link to="/tools/free-hospitality-qr-generator" className="hover:text-white transition-colors">
              {isEn ? 'QR Generator' : 'QR Üretici'}
            </Link>
            <Link to="/compare/card-machine-vs-qr-tipping" className="text-emerald-400 font-semibold transition-colors">
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
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-slate-300 transition-colors">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span className="hover:text-slate-300">{isEn ? 'Comparisons' : 'Karşılaştırmalar'}</span>
          <span>/</span>
          <span className="text-emerald-400 font-medium">{item.slug}</span>
        </nav>

        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Scale className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            {title}
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            {subtitle}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{isEn ? 'Target Audience:' : 'Hedef Kitle:'}</span>
            <span>{audience}</span>
          </div>
        </div>

        {/* Quick Verdict Callout */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 rounded-3xl p-8 sm:p-10 border border-emerald-500/20 mb-16 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">
                {isEn ? 'Executive Summary & Verdict' : 'Yönetici Özeti & Sonuç Değerlendirmesi'}
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                {quickVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isEn ? 'Feature-by-Feature Comparison' : 'Özellik Özellik Detaylı Karşılaştırma'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isEn ? 'Direct evaluation of operational differences and business impact.' : 'Operasyonel farklar, maliyetler ve işletme etkileri.'}
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-5 px-6 font-bold text-slate-300 w-1/4">
                      {isEn ? item.comparisonTable.headers.feature.en : item.comparisonTable.headers.feature.tr}
                    </th>
                    <th className="py-5 px-6 font-bold text-slate-400 w-1/3">
                      {isEn ? item.comparisonTable.headers.optionA.en : item.comparisonTable.headers.optionA.tr}
                    </th>
                    <th className="py-5 px-6 font-extrabold text-emerald-400 w-1/3 bg-emerald-500/5">
                      {isEn ? item.comparisonTable.headers.optionB.en : item.comparisonTable.headers.optionB.tr}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {item.comparisonTable.rows.map((row, idx) => {
                    const feat = isEn ? row.feature.en : row.feature.tr;
                    const optA = isEn ? row.optionA.en : row.optionA.tr;
                    const optB = isEn ? row.optionB.en : row.optionB.tr;
                    const verdict = isEn ? row.verdict.en : row.verdict.tr;

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 px-6 align-top">
                          <span className="font-semibold text-white block mb-1">{feat}</span>
                          <span className="text-xs text-slate-500 leading-snug">{verdict}</span>
                        </td>
                        <td className="py-5 px-6 align-top text-slate-400 text-sm leading-relaxed">
                          <div className="flex items-start gap-2">
                            {row.optionA.highlight === 'bad' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                            <span>{optA}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6 align-top text-slate-200 text-sm leading-relaxed bg-emerald-500/[0.02]">
                          <div className="flex items-start gap-2 font-medium">
                            {row.optionB.highlight === 'good' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                            <span>{optB}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Deep Dive Analysis Sections */}
        <section className="max-w-4xl mx-auto space-y-12 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isEn ? 'In-Depth Analysis & Case Study Findings' : 'Derinlemesine İnceleme & Vaka Analizleri'}
            </h2>
          </div>

          {item.deepDiveSections.map((sec, idx) => {
            const secTitle = isEn ? sec.title.en : sec.title.tr;
            const secContent = isEn ? sec.content.en : sec.content.tr;
            const secTakeaway = sec.takeaway ? (isEn ? sec.takeaway.en : sec.takeaway.tr) : null;

            return (
              <div key={idx} className="bg-slate-900/50 rounded-3xl p-8 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">{secTitle}</h3>
                <p className="text-slate-300 leading-relaxed text-base mb-4">
                  {secContent}
                </p>
                {secTakeaway && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
                    💡 {secTakeaway}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isEn ? 'Frequently Asked Questions' : 'Sıkça Sorulan Sorular'}
            </h2>
          </div>

          <div className="space-y-4">
            {item.faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-base text-white">
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

        {/* Switch to Other Comparison */}
        {otherComparisons.length > 0 && (
          <section className="max-w-4xl mx-auto mb-20">
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-4">
              {isEn ? 'Read Next Comparison' : 'Sıradaki Karşılaştırma Raporu'}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {otherComparisons.map((other) => (
                <Link
                  key={other.slug}
                  to={`/compare/${other.slug}`}
                  className="group bg-slate-900/40 hover:bg-slate-900/80 rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 inline-block">
                      {isEn ? other.badge.en : other.badge.tr}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {isEn ? other.title.en : other.title.tr}
                    </h4>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-3xl p-8 sm:p-12 lg:p-16 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              {isEn ? 'Modernize Your Hospitality Tipping with Naponi' : 'Mekanınızın Bahşiş Altyapısını Naponi ile Güçlendirin'}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              {isEn
                ? 'Join thousands of forward-thinking restaurants, bars, and hotels. Set up your zero-hardware QR tipping system in under 2 minutes.'
                : 'POS karmaşasını ve personel kayıplarını geride bırakın. 2 dakikada ücretsiz işletme hesabınızı açın.'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>{isEn ? 'Start Free Now' : 'Ücretsiz Başlayın'}</span>
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
