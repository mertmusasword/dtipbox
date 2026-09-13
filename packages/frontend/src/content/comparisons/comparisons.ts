export interface ComparisonItem {
  slug: string;
  badge: { tr: string; en: string };
  title: { tr: string; en: string };
  subtitle: { tr: string; en: string };
  heroSummary: { tr: string; en: string };
  targetAudience: { tr: string; en: string };
  quickVerdict: { tr: string; en: string };
  comparisonTable: {
    headers: { feature: { tr: string; en: string }; optionA: { tr: string; en: string }; optionB: { tr: string; en: string }; naponiAdvantage: { tr: string; en: string } };
    rows: Array<{
      feature: { tr: string; en: string };
      optionA: { tr: string; en: string; highlight?: 'bad' | 'good' | 'neutral' };
      optionB: { tr: string; en: string; highlight?: 'bad' | 'good' | 'neutral' };
      verdict: { tr: string; en: string };
    }>;
  };
  deepDiveSections: Array<{
    title: { tr: string; en: string };
    content: { tr: string; en: string };
    takeaway?: { tr: string; en: string };
  }>;
  faqs: Array<{
    question: { tr: string; en: string };
    answer: { tr: string; en: string };
  }>;
  meta: {
    title: { tr: string; en: string };
    description: { tr: string; en: string };
    keywords: string[];
  };
}

export const COMPARISONS: ComparisonItem[] = [
  {
    slug: 'card-machine-vs-qr-tipping',
    badge: { tr: 'Sektör Karşılaştırma Raporu', en: 'Industry Comparison Report' },
    title: {
      tr: 'POS Cihazından Bahşiş vs QR Kod ile Dijital Bahşiş: Hangisi Daha Avantajlı?',
      en: 'POS Card Machine vs QR Code Tipping: Which is Best for Hospitality?'
    },
    subtitle: {
      tr: 'Banka komisyonları, garson motivasyonu, hesap kapatma süresi ve vergi şeffaflığı açısından kapsamlı analiz.',
      en: 'A comprehensive operational comparison covering bank interchange fees, table turnover speed, waiter morale, and tax compliance.'
    },
    heroSummary: {
      tr: 'Geleneksel banka POS cihazlarında adisyona bahşiş eklemek hem hesap ödeme süresini uzatır hem de işletmenin ciro havuzuna karışarak muhasebe karmaşasına yol açar. QR kodlu bahşiş sistemleri ise müşterinin telefonundan 10 saniyede doğrudan personele veya şeffaf havuza bahşiş bırakmasını sağlar.',
      en: 'Adding tips directly on traditional card machine terminals slows down checkout times and mingles gratuity with restaurant gross turnover. In contrast, modern QR code tipping lets diners tip staff directly via Apple Pay or Google Pay in 10 seconds without touching POS hardware.'
    },
    targetAudience: {
      tr: 'Restoran ve kafe işletmecileri, F&B operasyon müdürleri, şef garsonlar.',
      en: 'Restaurant owners, F&B hospitality directors, bar managers, and head servers.'
    },
    quickVerdict: {
      tr: 'Hız, personel şeffaflığı ve sıfır donanım maliyeti arayan modern işletmeler için QR kodlu sistemler tartışmasız galip gelmektedir. POS bahşişi sadece internet erişiminin hiç olmadığı izole alanlarda geçici bir alternatif olabilir.',
      en: 'QR code systems are the clear winner for modern restaurants seeking fast table turnover, transparent staff tip payouts, and zero hardware maintenance costs.'
    },
    comparisonTable: {
      headers: {
        feature: { tr: 'Kriter / Özellik', en: 'Evaluation Criteria' },
        optionA: { tr: 'Geleneksel Banka POS Cihazı', en: 'Traditional Bank Card Terminal' },
        optionB: { tr: 'Naponi QR Kodlu Bahşiş Sistemi', en: 'Naponi QR Code Cashless Tipping' },
        naponiAdvantage: { tr: 'İşletme & Personel Etkisi', en: 'Business Impact' }
      },
      rows: [
        {
          feature: { tr: 'Donanım & Kurulum Maliyeti', en: 'Hardware & Setup Cost' },
          optionA: { tr: 'Aylık POS kira bedeli, rulo kağıt ve cihaz bakım ücretleri.', highlight: 'bad', en: 'Monthly terminal rental fees, thermal paper rolls, maintenance.' },
          optionB: { tr: '0 TL donanım maliyeti. QR stant ve etiketleri hemen üretilir.', highlight: 'good', en: '$0 hardware investment. Instant table QR badges & NFC stickers.' },
          verdict: { tr: 'QR sistemlerde ekstra donanım arızası veya POS kira masrafı yoktur.', en: 'Eliminates hardware breakdowns, charging docks, and terminal rental bills.' }
        },
        {
          feature: { tr: 'Masa Hesap Kapatma Süresi', en: 'Checkout & Table Turn Speed' },
          optionA: { tr: 'Garson cihazı getirir, tutar girer, slip basar (ortalama 3-5 dakika).', highlight: 'bad', en: 'Waiter walks terminal over, inputs tip, waits for slip (3-5 minutes).' },
          optionB: { tr: 'Müşteri masadaki QR kodu okutur, Apple Pay/Google Pay ile 10 sn.', highlight: 'good', en: 'Guest scans table QR and tips in 10s via Apple/Google Pay independently.' },
          verdict: { tr: 'Masa devir hızı (table turnover) %20-30 oranında hızlanır.', en: 'Reduces server footwork and boosts peak-hour table turnover by up to 25%.' }
        },
        {
          feature: { tr: 'Bahşiş Bırakma Oranı', en: 'Tip Frequency & Size' },
          optionA: { tr: 'Garson müşterinin başında beklediği için müşteri baskı hisseder, çoğu zaman "0" girilir.', highlight: 'neutral', en: 'Awkward eye contact creates friction; many customers decline or press skip.' },
          optionB: { tr: 'Müşteri yalnızken ve rahatça puanlama/yorum yaparak %15-20 daha cömert bahşiş bırakır.', highlight: 'good', en: 'Diners tip comfortably without pressure, increasing tip volume by 30-45%.' },
          verdict: { tr: 'Psikolojik baskı kalktığında ortalama bahşiş hacmi belirgin şekilde artar.', en: 'Private, smooth digital prompts consistently generate higher tip percentages.' }
        },
        {
          feature: { tr: 'Maliye & Vergi Şeffaflığı', en: 'Tax & Accounting Complexity' },
          optionA: { tr: 'Bahşiş şirket hesabına yatar. KDV, stopaj ve bordro muhasebesi karmaşası yaratır.', highlight: 'bad', en: 'Tips enter company merchant account, requiring complex VAT and payroll withholdings.' },
          optionB: { tr: 'Bahşiş doğrudan personelin IBAN\'ına veya şeffaf havuz bakiyesine aktarılır.', highlight: 'good', en: 'Pure gratuity cleanly separated from sales revenue, simplifying accounting audits.' },
          verdict: { tr: 'İşletme sahibini maliye denetiminde adisyon/ciro karışıklığından kurtarır.', en: 'Clean separation protects restaurants from co-mingling tips with food revenue.' }
        },
        {
          feature: { tr: 'Google Yorum & Müşteri Geri Bildirimi', en: 'Guest Reviews & Ratings' },
          optionA: { tr: 'Yok. POS fişi sadece ödeme kanıtıdır.', highlight: 'bad', en: 'None. Receipts only provide transaction numbers.' },
          optionB: { tr: 'Memnun müşteriler anında Google Haritalar 5 yıldız yorumuna yönlendirilir.', highlight: 'good', en: 'Satisfied tippers are automatically prompted to leave a 5-star Google Review.' },
          verdict: { tr: 'Bahşiş akışı aynı zamanda işletmenin Google puanını organik olarak yükseltir.', en: 'Turns every positive dining experience into a verified Google local review.' }
        }
      ]
    },
    deepDiveSections: [
      {
        title: { tr: '1. POS Slip Bahşişlerinin Muhasebe ve Hukuki Riskleri', en: '1. Accounting & Legal Risks of Terminal-Based Tips' },
        content: {
          tr: 'Birçok ülkede ve Türkiye’de POS cihazı üzerinden çekilen bahşişler, gün sonu Z raporunda işletmenin brüt cirosuna dahil görünür. Vergi müfettişleri bu tutarları satış geliri gibi değerlendirip KDV ve kurumlar vergisi tarhiyatı uygulayabilir. Personelin bahşişini ayırıp dağıtmak muhasebeciniz için her ay saatler süren manuel hesaplama demektir. Naponi gibi bağımsız QR bahşiş altyapıları, bahşiş akışını şirket gelirlerinden tamamen yalıtır.',
          en: 'When customers tip through standard merchant card machines, the gratuity is bundled into gross card receivables. In many jurisdictions, this triggers payroll withholding complications or inadvertent VAT taxation. Dedicated QR tipping platforms keep gratuity completely isolated from food & beverage revenue, providing staff with auditable earnings statements.'
        },
        takeaway: {
          tr: 'Temiz muhasebe: Şirket cirosu ile garson bahşişi asla birbirine karışmamalıdır.',
          en: 'Key rule: Never co-mingle employee gratuities with business operating revenue.'
        }
      },
      {
        title: { tr: '2. Sosyal Rahatlık ve Müşteri Memnuniyeti Psikolojisi', en: '2. The Psychology of Frictionless Tipping' },
        content: {
          tr: 'Garson POS cihazını müşterinin gözünün önüne uzatıp ekrandan bahşiş yüzdesi seçmesini beklediğinde iki olumsuz durum doğar: Ya müşteri kendini baskı altında hissedip memnuniyetsiz kalır, ya da aceleyle "Pas Geç" diyerek bahşiş bırakmaz. Masada yer alan şık bir akrilik QR standı ise hesabı ödedikten sonra misafire dilediği tutarı seçme, garsona özel teşekkür notu yazma ve hizmeti puanlama özgürlüğü tanır.',
          en: 'Forcing customers to select tip percentages while a waiter watches creates uncomfortable social tension. In contrast, an elegant table QR stand gives dining guests the dignity to choose their tip, rate their specific server, and write a private compliment in their own time.'
        }
      },
      {
        title: { tr: '3. Personel Bağlılığı ve Şeffaf Havuz Dağıtımı', en: '3. Staff Retention and Transparent Pool Distribution' },
        content: {
          tr: 'Garsonlar ve mutfak personeli, gün sonunda POS slip\'lerinden yöneticinin ne kadar bahşiş kestiğini her zaman merak eder. Güvensizlik, sektördeki personel sirkülasyonunun 1 numaralı nedenidir. QR sistemlerde her personel kendi panelinde toplanan bahşişi şeffafça görür.',
          en: 'Hospitality turnover is driven largely by tip dispute and lack of transparency. With automated QR tip pooling, every bartender, chef, and busser can verify shift earnings directly from their mobile portal.'
        }
      }
    ],
    faqs: [
      {
        question: { tr: 'Müşterinin uygulama indirmesi gerekir mi?', en: 'Does the customer need to download an app?' },
        answer: {
          tr: 'Hayır. Müşteri telefonunun kamerasını QR koda tuttuğu anda mobil web sayfası açılır. Apple Pay, Google Pay veya kredi kartı ile 10 saniyede öder.',
          en: 'No app download is required. The guest simply scans the QR code with their camera and completes the tip in seconds using Apple Pay, Google Pay, or card.'
        }
      },
      {
        question: { tr: 'İşletme kendi POS cihazını kullanmaya devam edebilir mi?', en: 'Can we still use our card terminals for food bills?' },
        answer: {
          tr: 'Evet! Ana yemek ve içecek adisyonunu mevcut POS cihazınızdan tahsil etmeye devam edersiniz; bahşiş ise bağımsız olarak QR stant üzerinden akar.',
          en: 'Yes! You keep using your current POS for food & drinks. The QR code operates seamlessly alongside your existing payment workflow solely for gratuity and reviews.'
        }
      }
    ],
    meta: {
      title: {
        tr: 'POS Cihazından Bahşiş vs QR Kod Bahşiş: Restoranlar İçin Hangisi Daha İyi? — Naponi',
        en: 'Card Terminal vs QR Code Tipping for Restaurants: The 2026 Guide — Naponi'
      },
      description: {
        tr: 'Banka POS cihazından bahşiş alma ile QR kodlu temassız bahşiş sistemlerini karşılaştırdık. Maliyetler, komisyonlar, vergi avantajı ve garson motivasyonu analizi.',
        en: 'Detailed comparison of traditional card terminal tips vs contactless QR code tipping. Explore costs, checkout speed, staff morale, and tax compliance.'
      },
      keywords: ['pos cihazı bahşiş', 'qr kod bahşiş', 'restoran bahşiş sistemi', 'card machine vs qr tipping', 'cashless tipping comparison']
    }
  },
  {
    slug: 'best-cashless-tipping-systems',
    badge: { tr: '2026 Sektör İncelemesi', en: '2026 Industry Review' },
    title: {
      tr: 'En İyi Dijital ve Temassız Bahşiş Sistemleri: 2026 Restoran ve Otel Karşılaştırması',
      en: 'Best Cashless & QR Tipping Platforms for Hospitality (2026 Comparison)'
    },
    subtitle: {
      tr: 'Oteller, restoranlar, barlar ve güzellik salonları için lider nakitsiz bahşiş çözümlerinin özellikleri, komisyonları ve şeffaflık kriterleri.',
      en: 'In-depth review of leading digital tipping solutions for hotels, restaurants, bars, and salons evaluated on fees, payouts, and guest experience.'
    },
    heroSummary: {
      tr: 'Nakit kullanımının küresel çapta düşmesiyle birlikte restoran ve oteller çalışanlarını elde tutmak için dijital bahşiş sistemlerine geçiyor. Doğru platformu seçerken komisyon oranları, havuz şeffaflığı, Google yorum entegrasyonu ve çok dilli turist desteği belirleyici faktörlerdir.',
      en: 'With cash vanishing from pockets worldwide, hospitality brands are deploying digital tipping to protect staff earnings. This benchmark evaluates the top platforms on payout automation, fee transparency, multilingual capabilities, and local review boost features.'
    },
    targetAudience: {
      tr: 'Otel genel müdürleri, restoran zinciri sahipleri, insan kaynakları yöneticileri.',
      en: 'Hotel general managers, restaurant franchise operators, and hospitality HR directors.'
    },
    quickVerdict: {
      tr: 'Naponi, 35+ dili destekleyen turist dostu arayüzü, hibrit havuz (nakit + POS + QR) desteği ve dahili Google Harita yorum motoruyla hem Türkiye hem de global pazarda en bütüncül çözümü sunmaktadır.',
      en: 'Naponi stands out with built-in support for 35+ tourist languages, hybrid pooling (combining cash tipboxes + POS + QR), and automated Google Reviews acceleration.'
    },
    comparisonTable: {
      headers: {
        feature: { tr: 'Platform Özelliği', en: 'Key Capability' },
        optionA: { tr: 'Genel QR Ödeme Araçları', en: 'Generic QR Payment / P2P Apps' },
        optionB: { tr: 'Naponi Hospitality Tip Suite', en: 'Naponi Hospitality Tip Suite' },
        naponiAdvantage: { tr: 'Fark Yaratan Nitelik', en: 'Why It Matters' }
      },
      rows: [
        {
          feature: { tr: 'Turist & Çok Dilli Destek', en: 'Multilingual Tourist Support' },
          optionA: { tr: 'Genellikle tek dil (yerel dil) veya sınırlı İngilizce.', highlight: 'bad', en: 'Single local language or basic English only.' },
          optionB: { tr: '35+ dilde otomatik algılama ve uluslararası kartlar (Apple/Google Pay).', highlight: 'good', en: 'Auto-detects 35+ languages and accepts international payment methods.' },
          verdict: { tr: 'Yabancı turistler kendi ana dillerinde güvenle bahşiş bırakır.', en: 'Eliminates language barriers for international travelers in tourist hotspots.' }
        },
        {
          feature: { tr: 'Hibrit Bahşiş Havuzu (Nakit + POS + QR)', en: 'Hybrid Pool (Cash + POS + QR)' },
          optionA: { tr: 'Sadece kendi uygulamasından geçen dijital ödemeyi sayar.', highlight: 'bad', en: 'Only tracks digital tips sent inside their proprietary gateway.' },
          optionB: { tr: 'Masa nakitleri, banka POS bahşişleri ve QR gelirlerini tek ekranda toplar.', highlight: 'good', en: 'Combines physical cash box, POS slips, and QR tips into one auditable pool.' },
          verdict: { tr: 'Tüm bahşiş kaynakları tek adil formülle personelin hakkı olarak dağıtılır.', en: 'Ensures total fairness across both cash and digital shift proceeds.' }
        },
        {
          feature: { tr: 'Google Yorum Entegrasyonu', en: 'Integrated Google Reviews' },
          optionA: { tr: 'Mevcut değil.', highlight: 'bad', en: 'Not available.' },
          optionB: { tr: 'Bahşiş veren mutlu müşteriyi doğrudan Google Haritalar 5 yıldıza yönlendirir.', highlight: 'good', en: 'Automatically prompts delighted guests to post a 5-star Google review.' },
          verdict: { tr: 'İşletmenin yerel SEO sıralamasını ve organik müşteri trafiğini artırır.', en: 'Turns high-tipping dining tables into verified Google ranking power.' }
        },
        {
          feature: { tr: 'Fiziksel Dokunma Noktaları', en: 'Physical Hardware & Touchpoints' },
          optionA: { tr: 'Sadece yazdırılabilir kağıt PDF çıktısı.', highlight: 'neutral', en: 'Generic black-and-white printable paper sheets.' },
          optionB: { tr: 'Özel tasarım ahşap/akrilik NFC stantlar, metal rozetler ve masa aparatları.', highlight: 'good', en: 'Custom branded wooden/acrylic stands, NFC tap disks, and server lapel pins.' },
          verdict: { tr: 'Mekanınıza prestij katar, silinmez ve aşınmaz.', en: 'Luxury table presence that matches high-end dining ambiance.' }
        }
      ]
    },
    deepDiveSections: [
      {
        title: { tr: 'Neden Genel Ödeme Uygulamaları Bahşiş İçin Yetersiz Kalır?', en: 'Why Generic Payment Apps Fail at Tipping' },
        content: {
          tr: 'Müşteriyi bir IBAN numarasına para göndermeye veya genel bir fintech uygulaması indirmeye zorlamak %90 oranında müşteri kaybına yol açar. Bir bahşiş akışının başarılı olabilmesi için sıfır uygulama zorunluluğu, tek tıkla Apple Pay / Google Pay ödemesi ve garsonu bireysel olarak seçebilme konforu şarttır.',
          en: 'Asking a foreign tourist or casual diner to register for a local bank app or copy an IBAN number creates immense friction. Cashless tipping requires instant, browser-based Apple Pay and Google Pay checkout with zero app install requirements.'
        }
      },
      {
        title: { tr: 'İşletmeler İçin ROI (Yatırım Getirisi) Analizi', en: 'Return on Investment (ROI) for Hospitality Operators' },
        content: {
          tr: 'Bir restoran Naponi sistemine geçtiğinde üç kritik kazanım elde eder: 1) Personel bahşiş gelirleri ortalama %35 artar, bu da personel kaybını azaltır. 2) Masa hesap kapatma süresi kısalır, yoğun saatlerde daha çok müşteri ağırlanır. 3) Google Haritalar puanı artarak işletmeye yeni yerli ve yabancı misafirler kazandırır.',
          en: 'Adopting a tailored tipping suite yields triple returns: 1) Up to 35% higher server earnings drastically cuts hospitality recruitment costs. 2) Quicker checkouts free up tables during peak dinner rushes. 3) Surging positive Google Reviews attract new diners every week.'
        }
      }
    ],
    faqs: [
      {
        question: { tr: 'Sistemi kurmak ne kadar sürer?', en: 'How long does onboarding take?' },
        answer: {
          tr: 'Naponi işletme hesabınızı açmak 2 dakika sürer. QR kodlarınız anında dijital olarak hazırdır ve masalarınıza koyabilirsiniz.',
          en: 'Account setup takes less than 2 minutes. Digital QR assets are generated immediately and ready to display on tables or receipts.'
        }
      },
      {
        question: { tr: 'Personel bahşişlerini ne zaman çeker?', en: 'When do team members receive their payouts?' },
        answer: {
          tr: 'Personel kazandığı bahşişi kendi mobil panelinden anlık olarak takip eder ve dilediği zaman banka hesabına aktarabilir.',
          en: 'Staff track their accrued gratuity in real-time from their personal dashboard and can transfer funds directly to their bank account.'
        }
      }
    ],
    meta: {
      title: {
        tr: 'En İyi Dijital Bahşiş Sistemleri (2026 İnceleme & Karşılaştırma) — Naponi',
        en: 'Best Cashless Tipping Systems for Restaurants (2026 Review) — Naponi'
      },
      description: {
        tr: 'Restoran ve oteller için en popüler temassız ve dijital bahşiş platformlarını karşılaştırdık. Özellikler, komisyonlar, personel havuzu ve Google yorum özellikleri.',
        en: 'Compare the leading digital and QR tipping solutions for restaurants, bars, and hotels. Evaluate fees, staff pooling, tourist language support, and ROI.'
      },
      keywords: ['dijital bahşiş sistemleri', 'temassız bahşiş', 'en iyi bahşiş uygulaması', 'best cashless tipping systems', 'qr tipping comparison']
    }
  }
];
