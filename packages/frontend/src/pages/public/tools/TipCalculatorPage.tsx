import React, { useState, useMemo } from 'react';
import { PublicNavbar } from '../../../components/PublicNavbar';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Users,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { SeoHead } from '../../../components/SeoHead';
import { SEO_TOOLS, SEO_TOOLS_EN } from '../../../content/tools/tools';
import { trackToolUsed, trackBlogCtaClick } from '../../../analytics';
import { useLanguage, LanguageSelector } from '../../../i18n';
import '../../../styles/home.css';

const CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '₺', label: 'TRY (₺)' },
  { symbol: '¥', label: 'JPY (¥)' },
];

export const TipCalculatorPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'tr';
  const meta = isEn ? SEO_TOOLS_EN['tip-calculator'] : SEO_TOOLS['tip-calculator'];

  // Currency State
  const defaultCurrency = language === 'tr' ? '₺' : language === 'ru' ? '₽' : language === 'ja' ? '¥' : ['de', 'es', 'fr', 'pt'].includes(language) ? '€' : '$';
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  // Calculator State
  const [billAmount, setBillAmount] = useState<number>(language === 'tr' ? 500 : language === 'ru' ? 1500 : language === 'ja' ? 5000 : 50);
  const [tipPercent, setTipPercent] = useState<number>(language === 'tr' ? 10 : language === 'ru' ? 10 : 18);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [roundUp, setRoundUp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations
  const results = useMemo(() => {
    const rawTip = (billAmount * tipPercent) / 100;
    let totalBill = billAmount + rawTip;
    let finalTip = rawTip;

    if (roundUp) {
      const roundedTotal = Math.ceil(totalBill);
      finalTip = roundedTotal - billAmount;
      totalBill = roundedTotal;
    }

    const tipPerPerson = guestCount > 0 ? finalTip / guestCount : finalTip;
    const totalPerPerson = guestCount > 0 ? totalBill / guestCount : totalBill;

    return {
      tipAmount: finalTip,
      totalAmount: totalBill,
      tipPerPerson,
      totalPerPerson,
    };
  }, [billAmount, tipPercent, guestCount, roundUp]);

  const handlePercentageClick = (pct: number) => {
    setTipPercent(pct);
    trackToolUsed('tip-calculator', { action: 'change_percentage', percent: pct });
  };

  const handleCopySummary = () => {
    const text = isEn
      ? `Bill: ${billAmount.toLocaleString()} ${currency} | Tip (${tipPercent}%): ${results.tipAmount.toFixed(2)} ${currency} | Total: ${results.totalAmount.toFixed(2)} ${currency} (${guestCount} guests, per person: ${results.totalPerPerson.toFixed(2)} ${currency}) — Naponi Tip Calculator`
      : `Hesap: ${billAmount.toLocaleString('tr-TR')} ₺ | Bahşiş (%${tipPercent}): ${results.tipAmount.toLocaleString('tr-TR')} ₺ | Toplam: ${results.totalAmount.toLocaleString('tr-TR')} ₺ (${guestCount} Kişi başı: ${results.totalPerPerson.toLocaleString('tr-TR')} ₺) — Naponi Bahşiş Hesaplayıcı`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = isEn
    ? [
        {
          question: 'How much should you typically tip at a restaurant?',
          answer: 'In the United States and Canada, the standard gratuity ranges from 15% to 20% for attentive dining service, with 18% being common. In European destinations (UK, Germany, France, Spain), tipping is discretionary, typically 5% to 10% for quality service, as base wages are structured differently.',
        },
        {
          question: 'How is the per-person bill split calculated?',
          answer: 'The total bill amount plus the calculated tip percentage is summed, then divided equally by the number of dining guests: Total Per Person = (Bill Amount + Tip Amount) / Guest Count. Our calculator displays both each guest’s tip portion and their total payment amount.',
        },
        {
          question: 'Should I tip if a service charge or auto-gratuity is already included?',
          answer: 'If the check clearly lists an automatic gratuity or service charge (often 10% to 18% for parties of 6 or more), additional tipping is optional and reserved for extraordinary service. Note that in many venues, corporate service charges do not go 100% directly to waitstaff. To ensure gratuity reaches staff directly without corporate deductions, guests often prefer scanning tableside QR codes.',
        },
        {
          question: 'Is tipping calculated before or after sales tax?',
          answer: 'Etiquette experts universally agree that tipping should be calculated on the pre-tax subtotal of food and beverage charges. However, most POS terminals and credit card slips calculate tip presets on the final total after tax, adding an extra 1-2% unintentionally.',
        },
        {
          question: 'Why do cashless diners prefer tableside QR tipping?',
          answer: 'With fewer guests carrying physical banknotes, asking servers to manually add tips to credit card terminals often feels awkward or delays table departure. Tableside QR stands allow guests to scan with Apple Pay or Google Pay, select a preset in 6 seconds, and leave a direct tip that bypasses POS delays.',
        },
        {
          question: 'How much should you tip for coffee, bars, and hotel services?',
          answer: 'For counter coffee and baristas, rounding up the change or leaving $1 to $2 (10-20 ₺) per handcrafted beverage is customary. At bars, $1 to $2 per drink or 15-20% on a running tab is standard. For hotel bellboys and valets, $2 to $5 (50-100 ₺) per bag or vehicle delivery is standard practice.',
        },
        {
          question: 'Can restaurants set up standalone digital tipping without changing their POS?',
          answer: 'Yes. Naponi provides zero-integration QR stands that sit directly on dining tables. Guests tip directly from their smartphones, funds are distributed transparently, and the restaurant incurs zero setup or hardware replacement fees.',
        },
      ]
    : [
        {
          question: 'Türkiye’de restoranlarda ne kadar bahşiş bırakılır?',
          answer: 'Türkiye’de restoran ve kafelerde genel kabul gören standart bahşiş oranı hesap tutarının %10’udur. Kusursuz ve özenli servislerde bu oran %15-%20 seviyelerine çıkabilir. Hızlı self-servis, üçüncü nesil kahveciler veya paket servislerde ise bozukluk veya 20-50 ₺ gibi sabit tutarlar yaygındır.',
        },
        {
          question: 'Kişi başı bahşiş bölüşümü nasıl hesaplanır?',
          answer: 'Toplam hesap tutarına seçilen bahşiş yüzdesi eklenir ve elde edilen nihai tutar masadaki kişi sayısına bölünür: Kişi Başı Tutar = (Hesap Tutarı + Bahşiş) / Kişi Sayısı. Aracımız sayesinde hem kişi başı düşen bahşişi hem de toplam kişi başı ödenecek tutarı anında görebilirsiniz.',
        },
        {
          question: 'Restoran hesabında kuver veya servis ücreti varsa bahşiş verilmeli mi?',
          answer: 'Adisyonda "%10 Servis Ücreti" veya "Kuver" yer alıyorsa bu tutar genellikle doğrudan garsona kalmaz; işletmenin ekmek, su, örtü ve operasyon maliyetlerine gider. Servis elemanına doğrudan jest yapmak için masadaki QR kod üzerinden doğrudan garsonun veya ekibin hesabına bahşiş bırakılması en şeffaf yöntemdir.',
        },
        {
          question: 'Bahşiş KDV dahil tutardan mı yoksa KDV hariç tutardan mı hesaplanmalı?',
          answer: 'Gastronomi ve görgü kurallarına göre bahşiş, yiyecek ve içeceklerin KDV hariç net bedeli üzerinden hesaplanmalıdır. Ancak pratik olması açısından tüketicilerin büyük kısmı adisyonun altındaki genel toplam üzerinden %10 hesaplar.',
        },
        {
          question: 'Kredi kartı sliplerine yazılan bahşiş neden personeli mağdur edebilir?',
          answer: 'Kredi kartı pos cihazına bahşiş eklendiğinde bu para önce işletmenin ticari banka hesabına yatar. Banka komisyonları, geciken blokaj süreleri ve işletmenin muhasebe süreçleri nedeniyle bu para garsona haftalar sonra veya kesintili ulaşabilir. Doğrudan QR bahşiş ise parayı anında personelin hesabına aktarır.',
        },
        {
          question: 'Otel, vale ve taksilerde bahşiş teamülü nasıldır?',
          answer: 'Vale hizmetlerinde araç tesliminde 50 - 100 ₺, otellerde valiz taşıyan bellboy personeline valiz başı 30 - 50 ₺, günlük oda temizliği görevlisine ise 50 - 100 ₺ bırakılması yaygın nezaket kuralıdır. Taksilerde ise genellikle taksimetre ücreti en yakın 10 veya 20 ₺ tutarına yuvarlanır.',
        },
        {
          question: 'İşletmeler kendi masalarına QR bahşiş sistemini nasıl kurabilir?',
          answer: 'Naponi üzerinden 2 dakikada ücretsiz işletme hesabı açarak masalarınıza özel yüksek çözünürlüklü QR kodları oluşturabilirsiniz. POS cihazı değiştirmeye veya pahalı donanım almaya gerek kalmadan misafirleriniz Apple Pay veya kredi kartıyla 6 saniyede bahşiş bırakabilir.',
        },
      ];

  return (
    <div className="home-wrapper">
      <SeoHead
        title={meta.metaTitle}
        description={meta.metaDescription}
        canonicalUrl={meta.canonicalUrl}
        keywords={[meta.targetKeyword, ...meta.secondaryKeywords]}
        breadcrumbs={[
          { name: isEn ? 'Home' : 'Ana Sayfa', url: 'https://www.naponi.com/' },
          { name: isEn ? 'Tools' : 'Araçlar', url: 'https://www.naponi.com/tools/tip-calculator' },
          { name: meta.name, url: meta.canonicalUrl },
        ]}
        alternateLanguages={[
          { lang: 'tr', url: 'https://www.naponi.com/tools/tip-calculator' },
          { lang: 'en', url: 'https://www.naponi.com/tools/tip-calculator' },
          { lang: 'x-default', url: 'https://www.naponi.com/tools/tip-calculator' },
        ]}
        faqSchema={faqs}
      />

      {/* Nav */}
      <PublicNavbar />

      <main className="blog-container" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        {/* Breadcrumbs */}
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{isEn ? 'Home' : 'Ana Sayfa'}</Link>
          <span>/</span>
          <span>{isEn ? 'Tools' : 'Araçlar'}</span>
          <span>/</span>
          <span className="current">{meta.name}</span>
        </nav>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '1.5rem auto 3rem' }}>
          <span className="home-section-tag">{meta.badge}</span>
          <h1 className="home-section-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {meta.title}
          </h1>
          <p className="home-section-desc" style={{ margin: '0 auto' }}>
            {meta.description}
          </p>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {CURRENCIES.map((c) => (
            <button
              key={c.symbol}
              type="button"
              className={`tool-preset-btn ${currency === c.symbol ? 'active' : ''}`}
              onClick={() => setCurrency(c.symbol)}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Calculator Widget Grid */}
        <div className="tool-calculator-grid">
          {/* Left Inputs */}
          <div className="tool-card tool-input-card">
            <h2 className="tool-card-title">
              <Calculator size={20} className="tool-icon" /> {isEn ? 'Bill & Tip Settings' : 'Hesap Bilgileri'}
            </h2>

            {/* Bill Amount */}
            <div className="tool-field">
              <label htmlFor="bill-amount">{isEn ? `Bill Amount (${currency})` : `Hesap Tutarı (${currency})`}</label>
              <div className="tool-input-wrap">
                <span className="tool-input-prefix">{currency}</span>
                <input
                  id="bill-amount"
                  type="number"
                  min="0"
                  step="5"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder={language === 'tr' ? '500' : language === 'ru' ? '1500' : language === 'ja' ? '5000' : '50'}
                  className="tool-input"
                />
              </div>
            </div>

            {/* Tip Percentage Presets */}
            <div className="tool-field">
              <label>{isEn ? `Tip Percentage: ${tipPercent}%` : `Bahşiş Oranı: %${tipPercent}`}</label>
              <div className="tool-preset-grid">
                {[5, 10, 15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={`tool-preset-btn ${tipPercent === pct ? 'active' : ''}`}
                    onClick={() => handlePercentageClick(pct)}
                  >
                    {isEn ? `${pct}%` : `%${pct}`}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={tipPercent}
                onChange={(e) => setTipPercent(parseInt(e.target.value, 10))}
                className="tool-slider"
              />
            </div>

            {/* Number of Guests */}
            <div className="tool-field">
              <label htmlFor="guest-count">
                <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {isEn ? `Dining Guests: ${guestCount}` : `Kişi Sayısı: ${guestCount} Kişi`}
              </label>
              <div className="tool-stepper">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="tool-stepper-btn"
                >
                  -
                </button>
                <span className="tool-stepper-value">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="tool-stepper-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Round Up Checkbox */}
            <div className="tool-field-checkbox">
              <label className="tool-checkbox-label">
                <input
                  type="checkbox"
                  checked={roundUp}
                  onChange={(e) => setRoundUp(e.target.checked)}
                />
                <span>{isEn ? 'Round total up to nearest whole number' : 'Toplam tutarı tam sayıya yuvarla'}</span>
              </label>
            </div>
          </div>

          {/* Right Results */}
          <div className="tool-card tool-result-card">
            <h2 className="tool-card-title">{isEn ? 'Summary & Split' : 'Hesap Özeti'}</h2>

            <div className="tool-result-box">
              <div className="tool-result-row">
                <span>{isEn ? 'Bill Amount:' : 'Hesap Tutarı:'}</span>
                <strong>{billAmount.toLocaleString()} {currency}</strong>
              </div>
              <div className="tool-result-row highlight">
                <span>{isEn ? `Tip Amount (${tipPercent}%):` : `Bahşiş Tutarı (%${tipPercent}):`}</span>
                <strong className="text-gradient">{results.tipAmount.toFixed(2)} {currency}</strong>
              </div>
              <div className="tool-result-divider" />
              <div className="tool-result-row total">
                <span>{isEn ? 'Total Bill:' : 'Genel Toplam:'}</span>
                <strong className="text-white">{results.totalAmount.toFixed(2)} {currency}</strong>
              </div>
            </div>

            {guestCount > 1 && (
              <div className="tool-split-box">
                <div className="tool-split-title">
                  {isEn ? `Split Among ${guestCount} Guests:` : `Kişi Başına Düşen Pay (${guestCount} Kişi):`}
                </div>
                <div className="tool-split-grid">
                  <div className="tool-split-item">
                    <span>{isEn ? 'Tip Per Person' : 'Kişi Başı Bahşiş'}</span>
                    <strong>{results.tipPerPerson.toFixed(2)} {currency}</strong>
                  </div>
                  <div className="tool-split-item">
                    <span>{isEn ? 'Total Per Person' : 'Kişi Başı Toplam'}</span>
                    <strong>{results.totalPerPerson.toFixed(2)} {currency}</strong>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              className="tool-copy-btn"
              onClick={handleCopySummary}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>
                {copied
                  ? (isEn ? 'Summary Copied!' : 'Sonuç Kopyalandı!')
                  : (isEn ? 'Copy Breakdown' : 'Özeti Kopyala')}
              </span>
            </button>

            {/* Business Pitch */}
            <div className="tool-promo-box">
              <h4>{isEn ? 'Are you a Restaurant or Cafe Operator?' : 'Restoran ya da Kafe İşletmecisi misiniz?'}</h4>
              <p>
                {isEn
                  ? 'Empower diners to tip waitstaff in 6 seconds via direct QR codes without app downloads or cash.'
                  : 'Misafirleriniz nakit taşımak zorunda kalmadan masadaki QR kod ile ekibinize doğrudan bahşiş bıraksın.'}
              </p>
              <Link
                to="/register"
                className="home-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => trackBlogCtaClick('tip_calc_promo', '/register')}
              >
                {isEn ? 'Get Your QR Stand in 2 Minutes →' : '2 Dakikada Ücretsiz QR Alın →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Rich Editorial Guide Section */}
        <div className="tool-guide-wrapper">
          {/* Section 1: Tipping Etiquette & Standards Table */}
          <article className="tool-guide-section">
            <h2>{isEn ? 'Global Restaurant Tipping Etiquette & Sector Guidelines' : 'Restoran Bahşiş Rehberi & Sektörel Bahşiş Oranları'}</h2>
            <p>
              {isEn
                ? 'Tipping etiquette varies significantly across service industries and geographical locations. Whether dining at a casual bistro, enjoying fine dining, or ordering specialty coffee, here is a definitive reference table for standard gratuity percentages.'
                : 'Yemek ve hizmet sektöründe ne kadar bahşiş bırakılacağı; mekanın türüne, aldığınız servisin niteliğine ve ülkeye göre değişiklik gösterir. İşte restoranlardan otellere, kafelerden valeye kadar kabul gören standart bahşiş oranları:'}
            </p>

            <div className="tool-table-responsive">
              <table className="tool-guide-table">
                <thead>
                  <tr>
                    <th>{isEn ? 'Venue / Service Type' : 'Hizmet / Mekan Türü'}</th>
                    <th>{isEn ? 'Standard Gratuity' : 'Standart Bahşiş Oranı'}</th>
                    <th>{isEn ? 'Typical Payment Method' : 'Yaygın Ödeme Şekli'}</th>
                    <th>{isEn ? 'Service Etiquette' : 'Görgü Kuralı & Not'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{isEn ? 'Casual Dining & Bistros' : 'Restoranlar & Lokantalar'}</strong></td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>%10 – %15</span></td>
                    <td>{isEn ? 'Tableside QR / Credit Card' : 'Masada QR Kod / Nakit / Kart'}</td>
                    <td>{isEn ? 'Standard polite acknowledgment for food & table service.' : 'Kusursuz servis ve masada karşılama için standart oran.'}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Fine Dining & Chef Venues' : 'Lüks Restoran & Fine Dining'}</strong></td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>%15 – %20</span></td>
                    <td>{isEn ? 'Standalone Digital Tip / Card' : 'Doğrudan QR Bahşiş / Kredi Kartı'}</td>
                    <td>{isEn ? 'Reserved for sommelier, multi-course dining, and dedicated table care.' : 'Sommelier, tadım menüsü ve üst düzey masa ilgisi için.'}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Cafes & Specialty Coffee' : 'Kafeler & Baristalar'}</strong></td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>%5 – %10 / {isEn ? '$1–$2' : '20–50 ₺'}</span></td>
                    <td>{isEn ? 'Counter QR / Tip Jar' : 'Kasa QR Kodu / Bahşiş Kutusu'}</td>
                    <td>{isEn ? 'Optional per-handcrafted drink appreciation.' : 'Özel el yapımı kahveler ve hızlı güler yüzlü servis için.'}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Bars & Nightclubs' : 'Barlar & Kokteyl Salonları'}</strong></td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>%10 – %15 / {isEn ? '$1–$3 per drink' : '30–60 ₺'}</span></td>
                    <td>{isEn ? 'Direct QR / Cash' : 'Bar QR Kodu / Nakit'}</td>
                    <td>{isEn ? 'Given per drink round or closed tab at departure.' : 'Her içki siparişinde veya ayrılırken hesap kapatırken.'}</td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Valet & Bellboy Service' : 'Vale & Otel Bellboy Hizmeti'}</strong></td>
                    <td><span style={{ color: '#10b981', fontWeight: 600 }}>{isEn ? '$2–$5 per bag/car' : '50–100 ₺ / Valiz'}</span></td>
                    <td>{isEn ? 'Cash or Staff QR Badge' : 'Nakit veya Yaka Kartı QR'}</td>
                    <td>{isEn ? 'Direct appreciation upon vehicle delivery or luggage placement.' : 'Araç tesliminde veya valizler odaya yerleştirildiğinde.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* Section 2: Mathematical Formula & Steps */}
          <article className="tool-guide-section">
            <h2>{isEn ? 'How to Calculate Tips: The Exact Formula & Step-by-Step Examples' : 'Bahşiş Nasıl Hesaplanır? Matematiksel Formül ve Adım Adım Örnekler'}</h2>
            <p>
              {isEn
                ? 'Calculating restaurant gratuity involves two simple mathematical steps. Below is the standard formula used by professional hospitality software and our online calculator:'
                : 'Restoranda veya kafede bahşiş hesaplamak temel iki matematiksel işleme dayanır. Profesyonel adisyon ve finansal yazılımların kullandığı standart formül şu şekildedir:'}
            </p>

            <div className="tool-formula-box">
              {isEn ? 'Tip Amount = Bill Subtotal × (Tip Percentage / 100)' : 'Bahşiş Tutarı = Hesap Tutarı × (Bahşiş Yüzdesi / 100)'}<br />
              {isEn ? 'Total Payment = Bill Subtotal + Tip Amount' : 'Toplam Ödeme = Hesap Tutarı + Bahşiş Tutarı'}<br />
              {isEn ? 'Per Person Share = Total Payment / Number of Dining Guests' : 'Kişi Başı Tutar = Toplam Ödeme / Masadaki Kişi Sayısı'}
            </div>

            <h3>{isEn ? 'Practical Calculation Example' : 'Pratik Hesaplama Örneği (Senaryo)'}</h3>
            <p>
              {isEn
                ? 'Suppose four colleagues dine out, and the bill arrives at $160.00. The party agrees on an 18% tip for attentive service:'
                : 'Dört kişilik bir arkadaş grubunun yemek yediğini ve adisyonun 1.200 ₺ geldiğini varsayalım. Ekip iyi servis için %10 bahşiş bırakmak istiyor:'}
            </p>
            <ul>
              <li><strong>{isEn ? '1. Bill Amount:' : '1. Hesap Tutarı:'}</strong> {isEn ? '$160.00' : '1.200 ₺'}</li>
              <li><strong>{isEn ? '2. Tip (18% / %10):' : '2. Bahşiş Hesabı:'}</strong> {isEn ? '$160.00 × 0.18 = $28.80' : '1.200 ₺ × 0.10 = 120 ₺'}</li>
              <li><strong>{isEn ? '3. Total Bill:' : '3. Genel Toplam:'}</strong> {isEn ? '$160.00 + $28.80 = $188.80' : '1.200 ₺ + 120 ₺ = 1.320 ₺'}</li>
              <li><strong>{isEn ? '4. Split Per Person (4 diners):' : '4. Kişi Başı Bölüşüm (4 Kişi):'}</strong> {isEn ? '$188.80 / 4 = $47.20 per guest' : '1.320 ₺ / 4 = 330 ₺ / kişi başı'}</li>
            </ul>
          </article>

          {/* Section 3: Cash vs POS vs Digital QR Comparison */}
          <article className="tool-guide-section">
            <h2>{isEn ? 'Cash Tips vs POS Terminal Slips vs Standalone QR Codes' : 'Nakit Bahşiş vs POS Slipi vs Bağımsız Masada QR Kod Karşılaştırması'}</h2>
            <p>
              {isEn
                ? 'As cashless consumer habits dominate, hospitality operators must understand how different tipping channels impact staff morale, cash flow, and guest convenience.'
                : 'Nakit kullanımının neredeyse tamamen kalktığı günümüzde, işletmelerin bahşiş toplama yöntemleri garson motivasyonunu ve misafir sadakatini doğrudan etkiler.'}
            </p>

            <div className="tool-table-responsive">
              <table className="tool-guide-table">
                <thead>
                  <tr>
                    <th>{isEn ? 'Comparison Factor' : 'Karşılaştırma Kriteri'}</th>
                    <th>{isEn ? 'Physical Cash Tip' : 'Fiziksel Nakit Bahşiş'}</th>
                    <th>{isEn ? 'POS Terminal Addition' : 'Kredi Kartı / POS Slipi'}</th>
                    <th><span style={{ color: '#fbbf24' }}>Naponi Masa QR Kodu</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{isEn ? 'Speed & Friction' : 'Ödeme Hızı & Pratiklik'}</strong></td>
                    <td>{isEn ? 'High friction (rarely carry cash)' : 'Düşük (Misafirlerin yanında nakit yok)'}</td>
                    <td>{isEn ? 'Medium (awkward terminal prompts)' : 'Orta (Garsona pos cihazında tutar söyletme mahcubiyeti)'}</td>
                    <td><strong style={{ color: '#10b981' }}>{isEn ? 'Instant (6s Apple/Google Pay)' : 'Kusursuz (6 saniyede Apple/Google Pay)'}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Time to Staff Payout' : 'Personele Ulaşma Hızı'}</strong></td>
                    <td>{isEn ? 'Same day (manual count)' : 'Aynı gün (elden)'}</td>
                    <td>{isEn ? 'Delayed (15–30 days via payroll)' : 'Gecikmeli (Banka blokajı ve ay sonu bordro)'}</td>
                    <td><strong style={{ color: '#10b981' }}>{isEn ? 'Real-time direct transfer' : 'Anında personelin kendi IBAN hesabına'}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Deductions & Overhead' : 'Maliyet & Kesintiler'}</strong></td>
                    <td>{isEn ? 'Theft risk & counting errors' : 'Kayıp, hırsızlık ve sayım hataları'}</td>
                    <td>{isEn ? 'Bank POS interchange cuts (2–4%)' : 'Banka POS komisyon kesintisi (%2-%4)'}</td>
                    <td><strong style={{ color: '#10b981' }}>{isEn ? 'Zero POS lock-in, 100% transparent' : 'POS cihazından bağımsız, şeffaf dağıtım'}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>{isEn ? 'Tip Yield Increase' : 'Toplam Bahşiş Artışı'}</strong></td>
                    <td>{isEn ? 'Declining year over year' : 'Sürekli düşüyor (nakitsizlikten)'}</td>
                    <td>{isEn ? 'Flat (+5% to +10%)' : 'Yatay (%5 - %10)'}</td>
                    <td><strong style={{ color: '#10b981' }}>{isEn ? '+35% to +50% Average Increase' : '+%35 ile +%50 Ortalama Artış'}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>

        {/* FAQ Section */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="home-section-tag">{isEn ? 'FAQ' : 'Sıkça Sorulan Sorular'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2rem' }}>
              {isEn ? 'Common Tipping Questions & Guidelines' : 'Bahşiş Hesaplama Hakkında Merak Edilenler'}
            </h2>
          </div>

          <div className="home-faq-accordion" style={{ maxWidth: 840, margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className={`home-faq-item ${openFaq === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="home-faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === idx && <div className="home-faq-answer">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className="tool-related-links">
          <h3>{isEn ? 'Related Guides & Hospitality Solutions' : 'İlgili İçerikler ve Çözümler'}</h3>
          <div className="tool-links-grid">
            <Link to={isEn ? "/blog/what-is-digital-tipping-guide-for-businesses" : "/blog/dijital-bahsis-nedir-isletmeler-icin-rehber"} className="tool-link-card">
              <strong>{isEn ? 'Digital Tipping Complete Guide' : 'İşletmeler İçin Dijital Bahşiş Rehberi'}</strong>
              <p>{isEn ? 'How modern QR tipping transforms hospitality staff compensation' : 'Masanıza QR bahşiş sistemi kurmanın tüm detayları'}</p>
            </Link>
            <Link to="/tools/tip-split-calculator" className="tool-link-card">
              <strong>{isEn ? 'Tip Pool Split Calculator' : 'Bahşiş Bölüştürme & Havuz Hesaplayıcı'}</strong>
              <p>{isEn ? 'Split end-of-day gratuities among servers, kitchen, and bar teams' : 'Toplanan bahşişi personel rollerine göre paylaştırın'}</p>
            </Link>
            <Link to="/solutions/restaurants" className="tool-link-card">
              <strong>{isEn ? 'Solutions for Restaurants' : 'Restoranlar İçin Çözümler'}</strong>
              <p>{isEn ? 'Tableside QR digital tipping infrastructure for dining venues' : 'Restoran ve fine dining için temassız QR bahşiş altyapısı'}</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-bottom">
            <div>© {new Date().getFullYear()} NAPONI. {isEn ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
              <Link to="/solutions/restaurants" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Restaurants' : 'Restoranlar'}</Link>
              <Link to="/solutions/hotels" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Hotels' : 'Oteller'}</Link>
              <Link to="/tools/tip-calculator" style={{ color: '#64748b', textDecoration: 'none' }}>{isEn ? 'Tip Calculator' : 'Bahşiş Hesaplayıcı'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
