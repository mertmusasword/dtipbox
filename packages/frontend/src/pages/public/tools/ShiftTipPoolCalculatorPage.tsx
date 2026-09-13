import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Users,
  Clock,
  Coins,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../../../content/tools/tools';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  weight: number;
  hours: number;
}

const PRESET_ROLES = [
  { id: 'server', name: { tr: 'Garson / Servis Personeli', en: 'Server / Waiter' }, defaultWeight: 1.0 },
  { id: 'bartender', name: { tr: 'Barmen / Miksolojist', en: 'Bartender / Mixologist' }, defaultWeight: 1.0 },
  { id: 'kitchen', name: { tr: 'Mutfak / Aşçı', en: 'Kitchen Chef / Cook' }, defaultWeight: 0.6 },
  { id: 'runner', name: { tr: 'Komi / Runner', en: 'Busser / Runner' }, defaultWeight: 0.5 },
  { id: 'barista', name: { tr: 'Barista / Kasiyer', en: 'Barista / Cashier' }, defaultWeight: 0.7 },
  { id: 'custom', name: { tr: 'Özel Katsayı', en: 'Custom Weight' }, defaultWeight: 1.0 },
];

export const ShiftTipPoolCalculatorPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'tr';
  const meta = isEn ? SEO_TOOLS_EN['restaurant-tip-pool-calculator'] : SEO_TOOLS['restaurant-tip-pool-calculator'];

  // Currency selection
  const [currency, setCurrency] = useState<string>(language === 'tr' ? '₺' : '$');

  // Pool inputs
  const [cashTips, setCashTips] = useState<number>(1200);
  const [posTips, setPosTips] = useState<number>(3400);
  const [digitalTips, setDigitalTips] = useState<number>(1800);

  // Staff roster state
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: isEn ? 'Alex (Head Server)' : 'Ahmet (Kaptan Garson)', role: 'server', weight: 1.0, hours: 8 },
    { id: '2', name: isEn ? 'Elena (Server)' : 'Merve (Garson)', role: 'server', weight: 1.0, hours: 8 },
    { id: '3', name: isEn ? 'Marcus (Bartender)' : 'Can (Barmen)', role: 'bartender', weight: 1.0, hours: 7 },
    { id: '4', name: isEn ? 'David (Line Cook)' : 'Mehmet Şef (Mutfak)', role: 'kitchen', weight: 0.6, hours: 8 },
    { id: '5', name: isEn ? 'Sarah (Busser)' : 'Ali (Komi)', role: 'runner', weight: 0.5, hours: 6 },
  ]);

  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations
  const totalPool = useMemo(() => {
    return Math.max(0, cashTips) + Math.max(0, posTips) + Math.max(0, digitalTips);
  }, [cashTips, posTips, digitalTips]);

  const calculations = useMemo(() => {
    const totalPoints = staff.reduce((acc, s) => acc + (s.hours * s.weight), 0);
    const totalHours = staff.reduce((acc, s) => acc + s.hours, 0);
    const pointValue = totalPoints > 0 ? totalPool / totalPoints : 0;

    const distributions = staff.map((s) => {
      const points = s.hours * s.weight;
      const amount = points * pointValue;
      const hourlyRate = s.hours > 0 ? amount / s.hours : 0;
      return {
        ...s,
        points,
        amount,
        hourlyRate,
        percentOfPool: totalPool > 0 ? (amount / totalPool) * 100 : 0,
      };
    });

    return {
      totalPoints,
      totalHours,
      pointValue,
      distributions,
    };
  }, [staff, totalPool]);

  // Actions
  const handleAddStaff = () => {
    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: isEn ? `Staff Member ${staff.length + 1}` : `Personel ${staff.length + 1}`,
      role: 'server',
      weight: 1.0,
      hours: 8,
    };
    setStaff([...staff, newMember]);
  };

  const handleRemoveStaff = (id: string) => {
    if (staff.length <= 1) return;
    setStaff(staff.filter((s) => s.id !== id));
  };

  const handleUpdateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff(
      staff.map((s) => {
        if (s.id !== id) return s;
        return { ...s, ...updates };
      })
    );
  };

  const handleExportCsv = () => {
    const headers = isEn
      ? ['Staff Name', 'Role', 'Role Weight', 'Hours Worked', 'Points', 'Payout Amount', 'Effective Tip/Hour']
      : ['Personel Adı', 'Rol', 'Puan Katsayısı', 'Çalışma Saati', 'Toplam Puan', 'Ödenecek Bahşiş', 'Saatlik Bahşiş'];

    const rows = calculations.distributions.map((d) => [
      `"${d.name}"`,
      `"${d.role}"`,
      d.weight.toFixed(2),
      d.hours.toString(),
      d.points.toFixed(2),
      `${currency}${d.amount.toFixed(2)}`,
      `${currency}${d.hourlyRate.toFixed(2)}/hr`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shift_tip_pool_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const summaryText = calculations.distributions
      .map((d) => `${d.name} (${d.role}): ${currency}${d.amount.toFixed(2)} (${d.hours}h)`)
      .join('\n');
    const fullText = `=== SHIFT TIP POOL DISTRIBUTION ===\nTotal Tips: ${currency}${totalPool.toFixed(2)}\n\n${summaryText}\n\nGenerated by Naponi Hospitality Suite`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: {
        tr: 'Puan katsayılı (weighted point) bahşiş havuzu nasıl hesaplanır?',
        en: 'How does a point-weighted tip pool formula work?'
      },
      a: {
        tr: 'Her personelin çalıştığı saat, rolünün puan katsayısıyla (Örn: Garson 1.0x, Mutfak 0.6x, Komi 0.5x) çarpılarak "Kişisel Puan" bulunur. Vardiyadaki tüm puanlar toplanır ve toplam bahşişe bölünerek "1 Puanın Değeri" hesaplanır. Bu formül vardiyada az veya çok çalışan herkesin adil pay almasını sağlar.',
        en: 'Each team member’s hours are multiplied by their role factor (e.g. Server 1.0x, Kitchen 0.6x, Busser 0.5x) to calculate "Total Points". Dividing the total shift tip pool by aggregate points yields the exact cash value of a single point.'
      }
    },
    {
      q: {
        tr: 'Mutfak personeli bahşiş havuzuna dahil edilebilir mi?',
        en: 'Can back-of-house kitchen staff be included in tip pools?'
      },
      a: {
        tr: 'Evet. Modern restoranlarda aşçı, bulaşıkçı ve hazırlık personeli müşteri deneyiminin ayrılmaz bir parçasıdır. Çoğu işletme mutfak için 0.4x - 0.7x arası dengeli bir katsayı kullanır. (Yerel iş yasalarınızı kontrol etmeniz önerilir).',
        en: 'In many countries (including the UK Tips Act 2024 and amended US FLSA regulations when full minimum wage is paid), back-of-house staff can legally share in tip pools, commonly weighted at 0.5x to 0.7x.'
      }
    },
    {
      q: {
        tr: 'İşletme sahibi veya müdür bahşiş havuzundan pay alabilir mi?',
        en: 'Can restaurant owners or managers participate in the tip pool?'
      },
      a: {
        tr: 'Hayır. Hem uluslararası regülasyonlar (US FLSA, UK Tips Act) hem de Türkiye iş hukuku içtihatlarına göre işletme sahipleri ve işe alma/çıkarma yetkisi olan müdürler bahşiş havuzundan pay alamaz. Bahşiş doğrudan servis emekçilerine aittir.',
        en: 'Strictly no. In virtually all jurisdictions (including US federal law and UK regulations), managers, supervisors, and owners are prohibited from taking any portion of employee tip pools.'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      <SeoHead
        title={meta.metaTitle}
        description={meta.metaDescription}
        canonicalUrl={meta.canonicalUrl}
        keywords={meta.secondaryKeywords}
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
            <Link to="/tools/restaurant-tip-pool-calculator" className="text-emerald-400 font-semibold transition-colors">
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-slate-300 transition-colors">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span className="hover:text-slate-300">{isEn ? 'Tools' : 'Araçlar'}</span>
          <span>/</span>
          <span className="text-emerald-400 font-medium">{isEn ? 'Shift Tip Pool Calculator' : 'Vardiya Bahşiş Havuzu'}</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>{meta.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            {meta.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {meta.description}
          </p>
        </div>

        {/* Tool Workspace Card */}
        <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl mb-16">
          {/* Top Bar: Currency & Shift Totals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-white/5">
            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isEn ? 'Currency' : 'Para Birimi'}
              </label>
              <div className="flex gap-2">
                {['₺', '$', '€', '£', '¥'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      currency === curr
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Box Tips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isEn ? 'Physical Cash Tip Box' : 'Fiziksel Tip Box (Nakit)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={cashTips}
                  onChange={(e) => setCashTips(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Bank POS Tips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isEn ? 'Bank POS Slip Tips' : 'Banka POS Slip Bahşişleri'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={posTips}
                  onChange={(e) => setPosTips(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Digital QR Tips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isEn ? 'Digital QR / App Tips' : 'Dijital QR / Naponi Bahşişi'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={digitalTips}
                  onChange={(e) => setDigitalTips(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
              <span className="text-xs text-emerald-400 font-semibold block mb-1">
                {isEn ? 'Total Shift Pool' : 'Toplam Vardiya Havuzu'}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {currency}{totalPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {isEn ? 'Total Shift Hours' : 'Toplam Vardiya Saati'}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {calculations.totalHours} hrs
              </span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {isEn ? 'Total Weight Points' : 'Toplam Havuz Puanı'}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {calculations.totalPoints.toFixed(1)} pts
              </span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                {isEn ? '1 Point-Hour Value' : '1 Puan-Saat Değeri'}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                {currency}{calculations.pointValue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Staff Roster Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">{isEn ? 'Staff Member' : 'Personel Adı'}</th>
                  <th className="py-3 px-3">{isEn ? 'Role' : 'Görevi'}</th>
                  <th className="py-3 px-3">{isEn ? 'Role Weight' : 'Katsayı'}</th>
                  <th className="py-3 px-3">{isEn ? 'Shift Hours' : 'Saat'}</th>
                  <th className="py-3 px-3 text-right">{isEn ? 'Payout Share' : 'Hakediş'}</th>
                  <th className="py-3 px-3 text-right">{isEn ? 'Effective / Hr' : 'Saatlik'}</th>
                  <th className="py-3 px-2 text-center">{isEn ? 'Action' : 'İşlem'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {calculations.distributions.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateStaff(member.id, { name: e.target.value })}
                        className="bg-transparent border border-transparent hover:border-white/20 focus:border-emerald-500 rounded-lg px-2 py-1 text-white font-medium focus:outline-none w-full"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={member.role}
                        onChange={(e) => {
                          const found = PRESET_ROLES.find((r) => r.id === e.target.value);
                          handleUpdateStaff(member.id, {
                            role: e.target.value,
                            weight: found ? found.defaultWeight : 1.0,
                          });
                        }}
                        className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {PRESET_ROLES.map((r) => (
                          <option key={r.id} value={r.id}>
                            {isEn ? r.name.en : r.name.tr} ({r.defaultWeight}x)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={member.weight}
                        onChange={(e) => handleUpdateStaff(member.id, { weight: parseFloat(e.target.value) || 1.0 })}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={member.hours}
                        onChange={(e) => handleUpdateStaff(member.id, { hours: parseFloat(e.target.value) || 0 })}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400 text-base">
                      {currency}{member.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-slate-400">
                      {currency}{member.hourlyRate.toFixed(2)}/h
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(member.id)}
                        disabled={staff.length <= 1}
                        className="text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleAddStaff}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Add Staff Member' : 'Personel Ekle'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isEn ? 'Copied!' : 'Kopyalandı!') : (isEn ? 'Copy Summary' : 'Özeti Kopyala')}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{isEn ? 'Download CSV' : 'CSV İndir'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>{isEn ? 'Print Shift Sheet' : 'Vardiya Raporu Yazdır'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature / Upgrade Pitch */}
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 rounded-3xl p-8 sm:p-12 border border-emerald-500/20 mb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'Tired of manual Excel spreadsheets?' : 'Manuel Excel hesaplarından sıkıldınız mı?'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
              {isEn ? 'Automate Your Restaurant Tip Pool with Naponi' : 'Restoranınızın Bahşiş Dağıtımını Naponi ile Otomatikleştirin'}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              {isEn
                ? 'Naponi connects physical cash tip boxes, external card terminals, and table QR tips into a single live dashboard. Staff see their exact shift earnings instantly on their phones, with automated payouts directly to their bank accounts.'
                : 'Naponi hem masadaki nakit tip kutularını hem banka POS fişlerini hem de QR kodlu bahşişleri tek bir dijital havuzda birleştirir. Personel kazancını kendi mobil panelinden anında görür, tartışmalar ve hesaplama hataları son bulur.'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <span>{isEn ? 'Create Free Business Account' : 'Ücretsiz İşletme Hesabı Aç'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isEn ? 'Frequently Asked Questions About Tip Pooling' : 'Bahşiş Havuzu ve Dağıtımı Hakkında Sık Sorulan Sorular'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isEn ? 'Legal compliance, role weighting, and best practices.' : 'Hukuki kurallar, puan sistemleri ve en iyi sektör uygulamaları.'}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-base text-white">
                    {isEn ? faq.q.en : faq.q.tr}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {isEn ? faq.a.en : faq.a.tr}
                  </div>
                )}
              </div>
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
