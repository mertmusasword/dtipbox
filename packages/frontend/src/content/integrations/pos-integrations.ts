export interface PosIntegrationItem {
  slug: string;
  posName: string;
  logoBadge: string;
  tagline: { tr: string; en: string };
  metaTitle: { tr: string; en: string };
  metaDescription: { tr: string; en: string };
  keywords: string[];
  heroHeadline: { tr: string; en: string };
  heroSubheadline: { tr: string; en: string };
  compatibilityStatus: { tr: string; en: string };
  whyCombineTitle: { tr: string; en: string };
  whyCombineDescription: { tr: string; en: string };
  keyBenefits: Array<{
    title: { tr: string; en: string };
    description: { tr: string; en: string };
    icon: string;
  }>;
  howItWorksSteps: Array<{
    stepNumber: string;
    title: { tr: string; en: string };
    description: { tr: string; en: string };
  }>;
  comparisonWithNativePos: {
    title: { tr: string; en: string };
    nativePosLabel: string;
    naponiCompanionLabel: string;
    points: Array<{
      feature: { tr: string; en: string };
      nativePos: { tr: string; en: string };
      withNaponi: { tr: string; en: string };
    }>;
  };
  faqs: Array<{
    question: { tr: string; en: string };
    answer: { tr: string; en: string };
  }>;
}

export const POS_INTEGRATIONS: PosIntegrationItem[] = [
  {
    slug: 'toast-pos-smart-qr',
    posName: 'Toast POS',
    logoBadge: 'Toast POS Companion',
    tagline: {
      tr: 'Toast POS Sisteminizi Değiştirmeyin. Naponi Akıllı QR Katmanını Ekleyin.',
      en: 'Keep Your Toast POS. Add Naponi Smart QR Guest Experience Layer.',
    },
    metaTitle: {
      tr: 'Toast POS Uyumlu Akıllı QR Bahşiş & Misafir Katmanı — Naponi',
      en: 'Toast POS Smart QR Companion: Tableside Tipping, Loyalty & Reviews — Naponi',
    },
    metaDescription: {
      tr: 'Toast POS kullanan restoranlar için temassız masabaşı QR bahşiş, dijital menü ve anında Google yorumu toplama katmanı. Donanım maliyeti yok, doğrudan garson hesabına transfer.',
      en: 'The tableside QR code companion for Toast POS restaurants. Collect contactless tips via Apple Pay, boost Google reviews, and manage tip pools without replacing your Toast terminals.',
    },
    keywords: [
      'toast pos smart qr',
      'toast pos digital tipping',
      'toast pos tip pooling companion',
      'toast restaurant qr code',
      'cashless tipping for toast pos',
      'toast pos contactless tips',
    ],
    heroHeadline: {
      tr: 'Toast POS Restoranları İçin Yeni Nesil Akıllı Masabaşı QR Katmanı',
      en: 'The Ultimate Smart QR Tableside Companion for Toast POS Restaurants',
    },
    heroSubheadline: {
      tr: 'Toast POS adisyon ve masa yönetiminizin kalbidir. Naponi ise misafirlerinizin telefonundan 6 saniyede garsona doğrudan bahşiş bırakmasını, Wi-Fi’a bağlanmasını ve 5 yıldızlı yorum yazmasını sağlayan zarif masabaşı arayüzüdür.',
      en: 'Toast POS runs your kitchen, checks, and orders. Naponi provides the friction-free guest experience layer on dining tables: instant Apple Pay tips directly to staff, digital menu, Wi-Fi access, and 5-star Google review capture.',
    },
    compatibilityStatus: {
      tr: 'Tüm Toast Flex, Toast Go 2 ve Toast El Terminalleri ile Tam Uyumlu',
      en: '100% Compatible Alongside Toast Flex, Toast Go 2, and Mobile Handhelds',
    },
    whyCombineTitle: {
      tr: 'Neden Toast POS Yanına Naponi Eklemelisiniz?',
      en: 'Why Restaurants Add Naponi Alongside Toast POS',
    },
    whyCombineDescription: {
      tr: 'Toast el terminalleri harikadır ancak hesap ödeme anında garson terminali uzattığında misafirler üzerinde sosyal baskı oluşur ve cihazlar yoğun saatlerde masalar arasında sıra bekletir. Naponi akıllı masa QR plaketleri masada kalıcıdır; misafir dilediği an garsonu beklemeden hesabını tamamlar ve bahşişini bırakır.',
      en: 'Toast handhelds are powerful, but handing customers a bulky terminal creates social tipping awkwardness and limits throughput during rush hours. Naponi table QR plaques stay on tables permanently, letting diners reward waitstaff in 6 seconds via Apple Pay or Google Pay without touching hardware.',
    },
    keyBenefits: [
      {
        title: {
          tr: 'Sıfır Donanım ve POS Lisans Masrafı',
          en: 'Zero Added Hardware or POS License Fees',
        },
        description: {
          tr: 'Ekstra Toast terminali satın almanıza veya pahalı API eklentilerine abone olmanıza gerek yok. Pleksi masa stantları ile 2 dakikada canlıya alın.',
          en: 'No need to purchase expensive additional handheld terminals or complex proprietary licenses. Deploy in 2 minutes with tabletop QR acrylics.',
        },
        icon: 'Zap',
      },
      {
        title: {
          tr: 'Garson Bahşişlerinde %38 Artış',
          en: '38% Average Increase in Staff Tip Earnings',
        },
        description: {
          tr: 'Apple Pay ve Google Pay tek tıkla ödeme sayesinde nakit taşımayan turistler ve yerel misafirler yüksek oranlı bahşiş bırakır.',
          en: 'One-click Apple Pay and Google Pay presets dramatically increase tip frequency among cashless diners and international tourists.',
        },
        icon: 'TrendingUp',
      },
      {
        title: {
          tr: 'Doğrudan Banka Transferi (Non-Custodial)',
          en: 'Non-Custodial Direct Staff Settlement',
        },
        description: {
          tr: 'Bahşişler restoranın genel ciro havuzuna karışmaz; muhasebe yükü ve kart komisyonu karmaşası yaratmadan personele ulaşır.',
          en: 'Gratuities bypass restaurant gross turnover, eliminating corporate accounting reconciliation headaches and payroll tip disputes.',
        },
        icon: 'ShieldCheck',
      },
      {
        title: {
          tr: 'Otomatik 5 Yıldızlı Google Yorumları',
          en: 'Automatic 5-Star Google Review Filtering',
        },
        description: {
          tr: 'Memnun misafirler bahşiş sonrası doğrudan Google Maps profilinize yönlendirilir; olası şikayetler ise işletme müdürüne özel bildirim olarak düşer.',
          en: 'Delighted diners are prompted to leave 5-star Google reviews right after tipping, while feedback below 4 stars alerts managers privately.',
        },
        icon: 'Star',
      },
    ],
    howItWorksSteps: [
      {
        stepNumber: '01',
        title: {
          tr: 'Masanıza Şık Naponi QR Plaketini Yerleştirin',
          en: 'Place Elegant Naponi QR Plaques on Tables',
        },
        description: {
          tr: 'Toast masa numaralarınızla eşleşen şık pleksi stantları veya hesap sümenlerini masalara yerleştirin.',
          en: 'Position premium acrylic stands or check presenter stickers matching your Toast table layout.',
        },
      },
      {
        stepNumber: '02',
        title: {
          tr: 'Misafir Kamerasıyla Saniyeler İçinde Tarar',
          en: 'Guest Scans with Phone Camera (No App Needed)',
        },
        description: {
          tr: 'Misafir uygulama indirmeden ve kayıt olmadan anında masa menüsünü, Wi-Fi şifresini ve garson bahşiş ekranını görür.',
          en: 'Zero app downloads or guest sign-ups. Diners instantly view menus, connect to guest Wi-Fi, or tip waitstaff.',
        },
      },
      {
        stepNumber: '03',
        title: {
          tr: 'Toast Hesabınızı Normal Şekilde Kapatın',
          en: 'Close Your Toast POS Order Normally',
        },
        description: {
          tr: 'Toast kasanız mutfak ve adisyon operasyonuna aynen devam ederken, misafir bahşişi ve yorumu bağımsız ve pürüzsüz tamamlanır.',
          en: 'Your kitchen tickets and Toast check closures proceed uninterrupted, while tips settle frictionlessly in real time.',
        },
      },
    ],
    comparisonWithNativePos: {
      title: {
        tr: 'Yalnızca Toast Terminali vs Toast + Naponi Akıllı QR',
        en: 'Toast Terminal Alone vs Toast + Naponi Smart QR Layer',
      },
      nativePosLabel: 'Toast POS Yalnız Başına',
      naponiCompanionLabel: 'Toast POS + Naponi Smart QR',
      points: [
        {
          feature: { tr: 'Masa Başı Ödeme Süresi', en: 'Table Turnover & Checkout Speed' },
          nativePos: { tr: 'Garsonun cihaz getirmesi beklenir (4-8 dk)', en: 'Waiting for server to bring handheld (4–8 mins)' },
          withNaponi: { tr: 'Misafir masada 6 saniyede tamamlar', en: 'Diner self-settles in 6 seconds via Apple Pay' },
        },
        {
          feature: { tr: 'Bahşişte Sosyal Baskı Hissi', en: 'Guest Awkwardness at Tip Screen' },
          nativePos: { tr: 'Garson ekrana bakarken misafir gerilir', en: 'High awkwardness (server hovering over terminal)' },
          withNaponi: { tr: 'Misafirin kendi telefonunda gizli & rahat', en: 'Private & relaxed on guest’s own smartphone' },
        },
        {
          feature: { tr: 'Donanım Maliyeti', en: 'Hardware Hardware Cost' },
          nativePos: { tr: 'Her terminal için $500–$1,000+ yatırım', en: '$500–$1,000+ per additional handheld unit' },
          withNaponi: { tr: '$0 Donanım (Mevcut akıllı telefonlar & QR)', en: '$0 Hardware (Utilizes guest smartphones & QR)' },
        },
        {
          feature: { tr: 'Google Yorum Toplama', en: 'Google Maps Review Conversion' },
          nativePos: { tr: 'Kağıt fiş altında kaybolur (%1 altı)', en: 'Printed receipt link (<1% conversion rate)' },
          withNaponi: { tr: 'Bahşiş anında interaktif yönlendirme (%18+)', en: 'Instant post-tip interactive prompt (18%+ conversion)' },
        },
      ],
    },
    faqs: [
      {
        question: {
          tr: 'Toast POS kurulu olan restoranımda Naponi kullanmak için Toast sözleşmemi değiştirmem gerekir mi?',
          en: 'Do I need to modify or cancel my Toast POS contract to use Naponi?',
        },
        answer: {
          tr: 'Hayır. Naponi bir POS alternatifi değil, misafir deneyim katmanıdır. Toast POS sisteminizi, mutfak ekranlarınızı ve donanımlarınızı aynen korursunuz. Naponi masalarda bağımsız bir akıllı QR katmanı olarak eşlik eder.',
          en: 'No. Naponi is not a POS replacement; it is a complementary guest experience layer. You keep your Toast terminals, kitchen display systems, and processing agreements unchanged.',
        },
      },
      {
        question: {
          tr: 'Toast POS adisyonundaki bahşişlerle Naponi bahşişleri nasıl ayrışır?',
          en: 'How are Naponi tips separated from Toast POS check payments?',
        },
        answer: {
          tr: 'Toast üzerindeki ana hesap kredi kartıyla veya nakitle kapatılabilirken, servis bahşişi doğrudan Naponi üzerinden garsonun şahsi veya şeffaf havuz hesabına aktarılır. Bu sayede restoranın kredi kartı komisyonu bahşişi eritmez.',
          en: 'The dining check can be closed normally on Toast, while the gratuity is processed seamlessly through Naponi directly to staff, avoiding mingled accounting and credit card surcharge deductions.',
        },
      },
      {
        question: {
          tr: 'Çok şubeli Toast restoran zincirlerini destekliyor musunuz?',
          en: 'Do you support multi-location Toast restaurant groups?',
        },
        answer: {
          tr: 'Evet. Naponi Kurumsal Yönetim Paneli ile 100’lerce şubenin masa QR’larını, personel listelerini ve performans raporlarını tek ekrandan merkezi olarak yönetebilirsiniz.',
          en: 'Yes. Naponi Enterprise Dashboard allows hospitality groups to manage hundreds of branches, localized tables, and staff rosters from a unified console.',
        },
      },
    ],
  },
  {
    slug: 'square-pos-digital-tipping',
    posName: 'Square POS',
    logoBadge: 'Square POS Companion',
    tagline: {
      tr: 'Square POS Altyapınıza Dokunmayın. Masalarınıza Naponi Akıllı QR Gücünü Ekleyin.',
      en: 'Keep Your Square POS. Add Naponi Smart QR Tipping & Loyalty.',
    },
    metaTitle: {
      tr: 'Square POS Uyumlu QR Kod Bahşiş ve Misafir Katmanı — Naponi',
      en: 'Square POS Companion: Tableside QR Tipping, Loyalty & Reviews — Naponi',
    },
    metaDescription: {
      tr: 'Square POS kullanan kafe ve restoranlar için tezgah sırasını eriten, temassız QR bahşiş ve Google yorum katmanı. Sıfır ek donanım, dakikalar içinde kurulum.',
      en: 'Supercharge your Square POS setup. Enable tableside QR code digital tipping, instant Google reviews, and guest loyalty without purchasing additional Square hardware.',
    },
    keywords: [
      'square pos digital tipping',
      'square pos qr tipping',
      'square restaurant tip pooling',
      'contactless tips square pos',
      'square pos companion app',
    ],
    heroHeadline: {
      tr: 'Square POS Restoran ve Kafeleri İçin Temassız Akıllı QR Çözümü',
      en: 'Frictionless QR Tipping & Guest Experience for Square POS Venues',
    },
    heroSubheadline: {
      tr: 'Square kasanızda siparişleri yönetirken, masalarınızdaki Naponi QR kodları misafirlerinizin 6 saniyede Apple Pay ile garsonlara bahşiş bırakmasını, dijital menüyü incelemesini ve işletmenize sadakat puanı toplamasını sağlar.',
      en: 'While Square manages your sales and inventory, Naponi table QR plaques let guests tip waitstaff, view menus, and collect loyalty rewards directly from their smartphones in 6 seconds.',
    },
    compatibilityStatus: {
      tr: 'Square Register, Square Stand ve Square Terminal ile %100 Uyumlu',
      en: '100% Compatible Alongside Square Register, Square Stand & Square Terminal',
    },
    whyCombineTitle: {
      tr: 'Neden Square POS Yanında Naponi Kullanmalısınız?',
      en: 'Why Hospitality Teams Pair Naponi with Square POS',
    },
    whyCombineDescription: {
      tr: 'Square kasalarında ekrana bahşiş seçeneği koymak tezgahta müşteri kuyruğu yaratır; masa servisinde ise garsonun her masaya Square Terminal taşıması zaman kaybıdır. Naponi QR stantları masada 7/24 hazırdır, sıfır bekleme süresi sunar.',
      en: 'Rotating a Square screen at the counter can feel transactional, and walking handhelds to dining tables slows table turnover. Naponi tabletop QR codes empower guests to tip and review at their own pace without tying up staff or terminals.',
    },
    keyBenefits: [
      {
        title: {
          tr: 'Tezgah Kuyruklarını Ortadan Kaldırın',
          en: 'Eliminate Counter & Register Bottlenecks',
        },
        description: {
          tr: 'Özellikle yoğun saatlerde kahve dükkanları ve bistrolarda sipariş anında ödeme süresini yarıya indirir.',
          en: 'Dramatically reduces checkout friction and queue times at busy cafe counters and fast-casual dining spots.',
        },
        icon: 'Zap',
      },
      {
        title: {
          tr: 'Şeffaf Havuz ve Bireysel Bahşiş Dağıtımı',
          en: 'Flexible Tip Pools or Direct Server Payouts',
        },
        description: {
          tr: 'Mutfak, bar ve servis personeli arasında adil vardiya havuzu oluşturabilir veya garson bazlı bireysel QR tahsis edebilirsiniz.',
          en: 'Easily allocate tips to individual servers or automatically pool gratuities across kitchen, bar, and floor staff.',
        },
        icon: 'Users',
      },
      {
        title: {
          tr: 'Square Donanımına Para Harcamayın',
          en: 'Save on Additional Square Hardware',
        },
        description: {
          tr: 'Her garsona Square Terminal ($299/adet) satın almak yerine masalara şık, su geçirmez pleksi QR plaketler yerleştirin.',
          en: 'Avoid paying $299+ per extra Square Terminal unit. Turn every table into an interactive touchpoint for zero hardware expense.',
        },
        icon: 'TrendingUp',
      },
      {
        title: {
          tr: 'Müşteri Sadakati & Tekrar Ziyaret',
          en: 'Built-in Guest Loyalty & Retention',
        },
        description: {
          tr: 'Misafirler tek tıkla dijital damga kartına dahil olur; cüzdanlarında kart taşımadan tekrar ziyaretlerinde ödül kazanır.',
          en: 'Guests enroll in your digital stamp loyalty card with one tap, driving repeat visits without physical punch cards.',
        },
        icon: 'Sparkles',
      },
    ],
    howItWorksSteps: [
      {
        stepNumber: '01',
        title: {
          tr: 'Masalarınıza veya Kasanıza Naponi QR Ekleyin',
          en: 'Place Naponi QR on Tables or Countertop',
        },
        description: {
          tr: 'Square POS kurulu mekanınızda masalara pleksi stantlar veya kasanın yanına barista bahşiş QR’ı yerleştirin.',
          en: 'Add elegant QR stands on tables or at pickup counters alongside your Square Register.',
        },
      },
      {
        stepNumber: '02',
        title: {
          tr: 'Misafir Apple Pay veya Google Pay ile Öder',
          en: 'Guests Tip Seamlessly via Mobile Wallet',
        },
        description: {
          tr: 'Telefon kamerasını tutar, önceden belirlenmiş bahşiş oranını seçer ve yüz tanıma (FaceID) ile saniyeler içinde tamamlar.',
          en: 'Diners scan with native camera, select tip preset (15%, 20%, 25%), and authorize via FaceID.',
        },
      },
      {
        stepNumber: '03',
        title: {
          tr: 'Square Satış Raporlarınız Temiz Kalır',
          en: 'Square Sales Reports Remain Pristine',
        },
        description: {
          tr: 'Bahşişler doğrudan personele aktarıldığı için Square muhasebenizde karmaşık komisyon ve vergi düzeltmeleriyle uğraşmazsınız.',
          en: 'Gratuities route non-custodially to staff bank accounts, keeping your Square financial reporting clean and straightforward.',
        },
      },
    ],
    comparisonWithNativePos: {
      title: {
        tr: 'Square POS Yalnız Başına vs Square + Naponi',
        en: 'Square POS Alone vs Square + Naponi Companion',
      },
      nativePosLabel: 'Square POS Tek Başına',
      naponiCompanionLabel: 'Square POS + Naponi Smart QR',
      points: [
        {
          feature: { tr: 'Masa Başı Bahşiş Deneyimi', en: 'Tableside Tip Experience' },
          nativePos: { tr: 'Terminal masaya taşınmalı veya kasaya gelinmeli', en: 'Requires carrying terminal or guest walking to counter' },
          withNaponi: { tr: 'Masada 7/24 hazır QR kod ile anında', en: 'Always-accessible tabletop QR scanned in 6 seconds' },
        },
        {
          feature: { tr: 'Bahşiş Komisyon Kaybı', en: 'Tip Surcharge Loss' },
          nativePos: { tr: 'Kart işlem komisyonları bahşişten kesilebilir', en: 'Payment processing fees often deducted from staff tips' },
          withNaponi: { tr: '%0 Komisyon (MVP) doğrudan personele aktarım', en: 'Direct pass-through directly to staff bank accounts' },
        },
        {
          feature: { tr: 'Wi-Fi & Menü Entegrasyonu', en: 'Guest Wi-Fi & Menu Access' },
          nativePos: { tr: 'Ayrı kağıt şifre veya harici menü gerekir', en: 'Requires separate paper signs or Wi-Fi printouts' },
          withNaponi: { tr: 'Tek QR içinde Bahşiş + Menü + Wi-Fi + Yorum', en: 'All-in-one: Tips + Digital Menu + Wi-Fi + Review Filter' },
        },
        {
          feature: { tr: 'Kurulum Hızı', en: 'Deployment Speed' },
          nativePos: { tr: 'Donanım kargosu ve şarj yönetimi', en: 'Hardware delivery, setup, and nightly charging' },
          withNaponi: { tr: '2 dakikada PDF indir ve bas', en: 'Instant PDF print & stick in under 2 minutes' },
        },
      ],
    },
    faqs: [
      {
        question: {
          tr: 'Square POS kullanırken Naponi için ayrı bir banka hesabı mı açmalıyım?',
          en: 'Do I need a separate bank account to use Naponi with Square POS?',
        },
        answer: {
          tr: 'Hayır. Naponi non-custodial mimaridedir. Mevcut işletme IBAN’ınızı veya çalışanlarınızın şahsi banka hesaplarını sisteme tanımlayabilirsiniz; para doğrudan oraya yatar.',
          en: 'No. Naponi is non-custodial. You can link your existing commercial bank account or staff IBANs/routing numbers directly.',
        },
      },
      {
        question: {
          tr: 'Square Online menüm varken Naponi menüsünü kullanmak zorunda mıyım?',
          en: 'Do I have to use Naponi’s menu if I already use Square Online?',
        },
        answer: {
          tr: 'Hayır. Naponi QR kodunu dilerseniz sadece dijital bahşiş, Google yorumları ve Wi-Fi için kullanabilir; menü butonunu doğrudan Square Online bağlantınıza yönlendirebilirsiniz.',
          en: 'No. You can use Naponi purely for tableside tipping, reviews, and Wi-Fi, while linking the menu button directly to your existing Square Online URL.',
        },
      },
    ],
  },
  {
    slug: 'clover-pos-qr-hospitality',
    posName: 'Clover POS',
    logoBadge: 'Clover POS Companion',
    tagline: {
      tr: 'Clover POS Donanımınızı Koruyun. Masalara Temassız Naponi QR Katmanı Ekleyin.',
      en: 'Keep Your Clover Station & Flex. Add Naponi Smart QR Guest Experience.',
    },
    metaTitle: {
      tr: 'Clover POS Uyumlu Masabaşı QR Bahşiş & Yorum Sistemi — Naponi',
      en: 'Clover POS Companion: QR Tipping & Guest Loyalty Layer — Naponi',
    },
    metaDescription: {
      tr: 'Clover Station ve Clover Flex kullanan restoran ve oteller için masabaşı QR bahşiş katmanı. Adisyona dokunmadan doğrudan garsona temassız bahşiş imkanı.',
      en: 'Complement your Clover POS setup with tableside QR digital tipping, multi-currency gratuities, and automated 5-star Google review generation.',
    },
    keywords: [
      'clover pos qr tipping',
      'clover pos digital tip companion',
      'clover restaurant tableside tips',
      'clover flex qr tips',
    ],
    heroHeadline: {
      tr: 'Clover POS Restoranları İçin Akıllı Masabaşı QR Katmanı',
      en: 'The Smart Tableside QR Companion for Clover POS Venues',
    },
    heroSubheadline: {
      tr: 'Clover Flex terminallerinizi yoğun hesap kapatmalarında masalar arasında koşturmak yerine, masalardaki kalıcı Naponi QR plaketleriyle misafirlerinize kendi telefonlarından 6 saniyede bahşiş verme özgürlüğü tanıyın.',
      en: 'Instead of running Clover Flex devices back and forth between tables, empower guests to tip servers, access menus, and review your venue in 6 seconds via durable tabletop QR codes.',
    },
    compatibilityStatus: {
      tr: 'Clover Station Solo/Duo, Clover Flex ve Clover Mini ile Tam Uyumlu',
      en: '100% Compatible Alongside Clover Station Solo/Duo, Clover Flex & Clover Mini',
    },
    whyCombineTitle: {
      tr: 'Clover POS ve Naponi Birlikteliğinin Gücü',
      en: 'The Synergy of Clover POS and Naponi',
    },
    whyCombineDescription: {
      tr: 'Clover güvenilir ve sağlam bir ödeme altyapısıdır. Naponi ise servis personelinizin motivasyonunu artıran, bahşişleri kayıt dışılıktan veya muhasebe karmaşasından kurtaran temassız misafir etkileşim köprüsüdür.',
      en: 'Clover delivers reliable core checkout processing. Naponi adds the modern mobile web guest layer that maximizes staff tip earnings and shields restaurants from credit card interchange fee bleed.',
    },
    keyBenefits: [
      {
        title: {
          tr: 'Clover Flex Terminal Aşınmasını Azaltın',
          en: 'Reduce Clover Flex Wear & Battery Strain',
        },
        description: {
          tr: 'Her bahşiş için el terminali taşımak cihazların düşme ve pil bitme riskini artırır. QR kod masada 7/24 sorunsuz çalışır.',
          en: 'Less back-and-forth terminal running prevents accidental hardware drops and preserves battery life during peak shifts.',
        },
        icon: 'ShieldCheck',
      },
      {
        title: {
          tr: 'Uluslararası Turist Bahşişlerini Yakalayın',
          en: 'Capture High-Value Tourist Gratuities',
        },
        description: {
          tr: 'Yabancı misafirler kendi para birimlerinde ve dillerinde Apple Pay/Google Pay ile cömertçe bahşiş bırakır.',
          en: 'International guests enjoy 10 localized languages and multi-currency displays, unlocking generous tipping from overseas travelers.',
        },
        icon: 'Globe',
      },
      {
        title: {
          tr: 'Mutfak & Garson Arasında Şeffaf Havuz',
          en: 'Equitable Tip Pooling Between Front & Back of House',
        },
        description: {
          tr: 'Toplanan bahşişlerin vardiya sonunda mutfak, bulaşık ve salon ekibine adil paylaştırılmasını otomatize edin.',
          en: 'Automate transparent shift tip distribution across front-of-house servers and back-of-house kitchen artisans.',
        },
        icon: 'Users',
      },
      {
        title: {
          tr: 'Google Maps Yıldız Puanını Yükseltin',
          en: 'Accelerate Google Maps Ranking Growth',
        },
        description: {
          tr: 'Naponi akıllı yönlendirmesiyle ayda yüzlerce organik 5 yıldızlı pozitif yorum toplayarak yerel aramalarda zirveye çıkın.',
          en: 'Turn happy tableside experiences into dozens of verified 5-star Google reviews every week, boosting local SEO ranking.',
        },
        icon: 'Star',
      },
    ],
    howItWorksSteps: [
      {
        stepNumber: '01',
        title: { tr: 'Clover Masalarınızı Tanımlayın', en: 'Map Your Clover Dining Areas' },
        description: { tr: 'Naponi panelinde salon, teras ve bar masalarınızı saniyeler içinde oluşturun.', en: 'Generate dedicated QR codes for dining rooms, patio tables, and bar stools.' },
      },
      {
        stepNumber: '02',
        title: { tr: 'QR Plaketleri Masalara Dağıtın', en: 'Display Aesthetic QR Stands' },
        description: { tr: 'Şık ahşap veya pleksi QR stantları masaların merkezine yerleştirin.', en: 'Deploy scratch-resistant acrylic stands or check presenter stickers.' },
      },
      {
        stepNumber: '03',
        title: { tr: 'Clover ile Normal Hesabı Alın', en: 'Settle Clover Bill Smoothly' },
        description: { tr: 'Yemek ücreti Clover ile alınırken, garson bahşişi misafir tarafından temassız ödenmiş olur.', en: 'Diners pay their meal via Clover, while tips and reviews flow frictionless via Naponi.' },
      },
    ],
    comparisonWithNativePos: {
      title: { tr: 'Clover POS Tek Başına vs Clover + Naponi', en: 'Clover Alone vs Clover + Naponi Companion' },
      nativePosLabel: 'Clover POS Tek Başına',
      naponiCompanionLabel: 'Clover POS + Naponi Smart QR',
      points: [
        {
          feature: { tr: 'Masabaşı Bahşiş Özgürlüğü', en: 'Tableside Tip Independence' },
          nativePos: { tr: 'Sadece personelin el terminali getirdiği anlarda', en: 'Only when server brings physical Clover Flex device' },
          withNaponi: { tr: 'Masa başında misafirin kontrolünde 7/24 aktif', en: 'Always available on table via camera QR scan' },
        },
        {
          feature: { tr: 'Yorum Filtresi', en: 'Review Shielding' },
          nativePos: { tr: 'Yorum toplama ve filtreleme özelliği yoktur', en: 'No native automated Google review filtering' },
          withNaponi: { tr: '4-5 yıldızı Google’a, şikayetleri yöneticiye yönlendirir', en: 'Routes 5-star reviews to Google, alerts managers on feedback' },
        },
      ],
    },
    faqs: [
      {
        question: {
          tr: 'Clover App Market üzerinden bir eklenti indirmem gerekir mi?',
          en: 'Do I have to install an app from the Clover App Market?',
        },
        answer: {
          tr: 'Hayır. Naponi web tabanlı akıllı QR katmanı olarak çalıştığı için Clover cihazınıza uygulama yüklemenize veya aylık App Market lisans ücreti ödemenize gerek yoktur.',
          en: 'No. Naponi operates as a friction-free web-based guest QR layer. No proprietary Clover App Market downloads or recurring app subscription fees are required.',
        },
      },
    ],
  },
  {
    slug: 'lightspeed-pos-smart-qr',
    posName: 'Lightspeed Restaurant POS',
    logoBadge: 'Lightspeed POS Companion',
    tagline: {
      tr: 'Lightspeed POS Düzeninizi Değiştirmeyin. Masalarınıza Naponi Akıllı QR Katmanı Ekleyin.',
      en: 'Keep Your Lightspeed POS. Add Naponi Smart QR Tableside Tipping.',
    },
    metaTitle: {
      tr: 'Lightspeed POS Uyumlu QR Kod Bahşiş ve Misafir Katmanı — Naponi',
      en: 'Lightspeed POS Companion: Tableside QR Tipping & Staff Retention — Naponi',
    },
    metaDescription: {
      tr: 'Lightspeed Restaurant POS kullanan fine dining ve otel restoranları için temassız masabaşı QR bahşiş katmanı. Donanım maliyetsiz, anında personele transfer.',
      en: 'The premium tableside QR companion for Lightspeed Restaurant POS. Enable Apple Pay gratuities, reduce checkout latency, and keep frontline hospitality talent motivated.',
    },
    keywords: [
      'lightspeed pos smart qr',
      'lightspeed restaurant digital tipping',
      'lightspeed qr tipping',
      'lightspeed pos companion',
    ],
    heroHeadline: {
      tr: 'Lightspeed Restaurant POS İçin Lüks Masabaşı QR Bahşiş Çözümü',
      en: 'Elevate Lightspeed POS Venues with Seamless QR Tableside Tipping',
    },
    heroSubheadline: {
      tr: 'Lightspeed fine dining ve butik restoranların operasyonel belkemiğidir. Naponi ise masada estetik bir dokunuşla servis ekibinizin bahşiş gelirlerini artıran, misafirleri sıkmadan yorum toplayan temassız misafir deneyim katmanıdır.',
      en: 'Lightspeed orchestrates high-end culinary workflows. Naponi provides the unobtrusive tableside guest experience layer that maximizes staff gratuity earnings and builds Google reputation.',
    },
    compatibilityStatus: {
      tr: 'Lightspeed Restaurant (K-Series ve L-Series) ile Tam Uyumlu',
      en: '100% Compatible Alongside Lightspeed Restaurant (K-Series & L-Series)',
    },
    whyCombineTitle: {
      tr: 'Lightspeed POS Yanında Neden Naponi Tercih Ediliyor?',
      en: 'Why Premier Restaurants Pair Naponi with Lightspeed',
    },
    whyCombineDescription: {
      tr: 'Prestijli mekanlarda hesap sümeninde adisyon bekletmek veya garsonun pos cihazıyla masanın başında dikilmesi servis kalitesini zedeler. Naponi masa QR plaketleri şık, zarif ve sessiz bir bahşiş akışı sunar.',
      en: 'In upscale hospitality, lingering bill delivery and awkward terminal-holding detract from fine dining ambiance. Naponi tableside QR codes offer a discreet, luxurious gratuity channel that guests adore.',
    },
    keyBenefits: [
      {
        title: { tr: 'Fine Dining İçin Zarif & Sessiz Deneyim', en: 'Discreet Ambiance for Fine Dining' },
        description: { tr: 'Garson adisyonu masaya bıraktığında misafir telefonundan saniyeler içinde sessizce bahşişini iletir.', en: 'Guests tip with dignity and privacy using Apple Pay without waitstaff hovering over tables.' },
        icon: 'Sparkles',
      },
      {
        title: { tr: 'Personel Bağlılığını ve Sadakatini Artırın', en: 'Boost Staff Retention & Morale' },
        description: { tr: 'Servis ekibinin kazancı ortalama %35+ artar; kaliteli servis elemanlarınızı elde tutarsınız.', en: 'Frontline servers take home substantially higher gratuities, drastically cutting hospitality staff turnover.' },
        icon: 'TrendingUp',
      },
    ],
    howItWorksSteps: [
      {
        stepNumber: '01',
        title: { tr: 'Lightspeed Masalarınızla Eşleştirin', en: 'Align with Lightspeed Tables' },
        description: { tr: 'Masa numaralarınızı Naponi sisteminde tanımlayın.', en: 'Set up tables corresponding to your Lightspeed floor plan.' },
      },
      {
        stepNumber: '02',
        title: { tr: 'Masalara Şık Akrilik Stantları Koyun', en: 'Place Architectural Acrylic Stands' },
        description: { tr: 'Restoranınızın ambiyansına uyumlu tasarım stantlar yerleştirin.', en: 'Integrate custom-branded tabletop stands into your venue aesthetic.' },
      },
      {
        stepNumber: '03',
        title: { tr: 'Doğrudan ve Şeffaf Kazanç', en: 'Instant Direct Earnings' },
        description: { tr: 'Misafirler teşekkürünü iletirken siz Lightspeed kasanızdan adisyonunuzu kapatın.', en: 'Close checks on Lightspeed while gratuities flow directly to frontline staff.' },
      },
    ],
    comparisonWithNativePos: {
      title: { tr: 'Lightspeed Yalnız Başına vs Lightspeed + Naponi', en: 'Lightspeed Alone vs Lightspeed + Naponi' },
      nativePosLabel: 'Lightspeed POS Tek Başına',
      naponiCompanionLabel: 'Lightspeed + Naponi Smart QR',
      points: [
        {
          feature: { tr: 'Bahşiş Şeffaflığı', en: 'Tip Transparency' },
          nativePos: { tr: 'Adisyon toplamına eklenir, muhasebede ayrıştırılır', en: 'Blended into check total and card settlement' },
          withNaponi: { tr: 'Doğrudan personele veya şeffaf havuza gider', en: 'Non-custodial direct transfer with zero fee erosion' },
        },
      ],
    },
    faqs: [
      {
        question: {
          tr: 'Lightspeed POS entegrasyonu için teknik yazılımcıya ihtiyacım var mı?',
          en: 'Do I need a software engineer to set up Naponi with Lightspeed?',
        },
        answer: {
          tr: 'Hayır! Sıfır kodlama. Masalarınıza Naponi QR kodlarını yerleştirmeniz yeterlidir; sistem bağımsız bir misafir katmanı olarak ilk andan itibaren çalışır.',
          en: 'No software engineers required. Simply place your Naponi QR stands on tables; the platform functions immediately as a zero-touch guest layer.',
        },
      },
    ],
  },
];
