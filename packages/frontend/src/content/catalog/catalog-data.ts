export interface CatalogSlide1 {
  coverBadge: string;
  title1: string;
  titleHighlight: string;
  desc: string;
  pills: {
    nonCustodial: string;
    zeroHardware: string;
    instantPayment: string;
    globalTourism: string;
  };
  confidential: string;
  pageLabel: string;
}

export interface CatalogSlide2 {
  tag: string;
  title: string;
  subtitle: string;
  painPointsHeader: string;
  painPoints: string[];
  statsHeader: string;
  stat1Val: string;
  stat1Desc: string;
  stat2Val: string;
  stat2Desc: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide3 {
  tag: string;
  title: string;
  subtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  resultBanner: string;
  resultTime: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide4 {
  tag: string;
  title: string;
  subtitle: string;
  card1Tag: string;
  card1Title: string;
  card1Desc: string;
  card2Tag: string;
  card2Title: string;
  card2Desc: string;
  card3Tag: string;
  card3Title: string;
  card3Desc: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide5 {
  tag: string;
  title: string;
  subtitle: string;
  mockupUrl: string;
  kpi1Val: string;
  kpi1Label: string;
  kpi2Val: string;
  kpi2Label: string;
  kpi3Val: string;
  kpi3Label: string;
  kpi4Val: string;
  kpi4Label: string;
  box1Title: string;
  box1Desc: string;
  box2Title: string;
  box2Desc: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide6 {
  tag: string;
  title: string;
  subtitle: string;
  sec1Title: string;
  sec1Desc: string;
  sec2Title: string;
  sec2Desc: string;
  sec3Title: string;
  sec3Desc: string;
  sec4Title: string;
  sec4Desc: string;
  extraTitle: string;
  extraDesc: string;
  extraBadge: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide7 {
  tag: string;
  title: string;
  subtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  calloutTitle: string;
  calloutDesc: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide8 {
  tag: string;
  title: string;
  subtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  sub1Title: string;
  sub1Desc: string;
  sub2Title: string;
  sub2Desc: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide9 {
  tag: string;
  title: string;
  subtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  badge1Val: string;
  badge1Desc: string;
  badge2Val: string;
  badge2Desc: string;
  badge3Val: string;
  badge3Desc: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogSlide10 {
  tag: string;
  title: string;
  titleHighlight: string;
  desc: string;
  qrBadgeTitle: string;
  qrBadgeSub: string;
  qrBottomLabel: string;
  qrLoading: string;
  webLabel: string;
  emailLabel: string;
  footer: string;
  pageLabel: string;
}

export interface CatalogToolbar {
  homeBtn: string;
  catalogTitle: string;
  catalogBadge: string;
  shareBtn: string;
  copiedBtn: string;
  printBtn: string;
}

export interface CatalogContent {
  toolbar: CatalogToolbar;
  slide1: CatalogSlide1;
  slide2: CatalogSlide2;
  slide3: CatalogSlide3;
  slide4: CatalogSlide4;
  slide5: CatalogSlide5;
  slide6: CatalogSlide6;
  slide7: CatalogSlide7;
  slide8: CatalogSlide8;
  slide9: CatalogSlide9;
  slide10: CatalogSlide10;
}

const catalogTR: CatalogContent = {
  toolbar: {
    homeBtn: 'Ana Sayfa',
    catalogTitle: 'NAPONI B2B Kurumsal Ürün Kataloğu',
    catalogBadge: '2026 Sürümü • 10 Sayfa',
    shareBtn: 'Linki Kopyala',
    copiedBtn: 'Kopyalandı!',
    printBtn: '📄 PDF Olarak Kaydet / Yazdır',
  },
  slide1: {
    coverBadge: '2026 B2B Kurumsal Ürün Kataloğu',
    title1: 'Yeme-İçme ve Konaklama Sektörü İçin',
    titleHighlight: 'Yeni Nesil Temassız Bahşiş Altyapısı',
    desc: 'Müşterilerin uygulama indirmeden 6 saniyede bahşiş bıraktığı; işletmelerin canlı vardiya havuzunu ve personel dökümlerini sıfır hata ile yönettiği akıllı finansal ekosistem.',
    pills: {
      nonCustodial: 'Emanet Para Tutulmaz (Non-Custodial)',
      zeroHardware: 'Sıfır Donanım & POS Masrafı',
      instantPayment: '6 Saniyede Kamera ile Ödeme',
      globalTourism: '11 Dilde Turist Uyumluluğu',
    },
    confidential: 'NAPONI TEKNOLOJİ • GİZLİ VE TİCARİDİR',
    pageLabel: 'www.naponi.com • Sayfa 01 / 10',
  },
  slide2: {
    tag: 'Sektörel Gerçekler',
    title: 'Geleneksel Bahşiş Modeli Neden Çöktü?',
    subtitle: 'Nakit paranın kaybolması, servis personelinin motivasyonunu düşürürken işletmecilere operasyonel kaos yaşatıyor.',
    painPointsHeader: 'Eski Dünyanın 4 Büyük Çıkmazı',
    painPoints: [
      '1. Nakit Para Neredeyse Bitti: Müşterilerin %82\'si artık yanında bozuk veya nakit para taşımıyor. Bahşiş bırakmak isteseler dahi vazgeçiyorlar.',
      '2. POS Cihazı Baskısı ve Utancı: Masada veya kasada POS cihazından bahşiş istemek garson için utandırıcı, müşteri için baskı hissi yaratan kaba bir deneyim.',
      '3. Hantal Mobil Uygulamalar: Bir restoran için kimse 85MB boyutunda yabancı bir uygulama indirip üyelik ve kart formu doldurmaz (%95 terk oranı).',
      '4. Gece Yarısı Excel Muhasebesi: Kapanışta bahşiş havuzunu bölüştürmek saatler alıyor; adaletsizlik şüpheleri personel kaybına ve huzursuzluğa yol açıyor.',
    ],
    statsHeader: 'İşletmenizin Kaybettiği Rakamlar',
    stat1Val: '-%42',
    stat1Desc: 'Müşteride nakit olmaması nedeniyle personelin her ay kaçırdığı net bahşiş geliri.',
    stat2Val: '35 Dk / Gün',
    stat2Desc: 'Vardiya müdürünün her gün kapanışta bahşiş hesaplamaya ve dağıtmaya harcadığı gereksiz mesai.',
    footer: 'NAPONI B2B ÇÖZÜMLERİ • PROBLEM VE PAZAR ANALİZİ',
    pageLabel: 'Sayfa 02 / 10',
  },
  slide3: {
    tag: 'Sıfır Sürtünme Çözümü',
    title: '6 Saniyede Bahşiş: Uygulama Yok, Şifre Yok',
    subtitle: 'Kullanıcı alışkanlıklarını zorlamayan, doğrudan telefon kamerasından çalışan dünyanın en hızlı bahşiş akışı.',
    step1Title: '1. Kamerayı Aç & Tara',
    step1Desc: 'Müşteri masadaki şık QR kodu veya garson rozetini telefonunun kamerasıyla okutur. Web arayüzü 0.8 saniyede anında açılır.',
    step2Title: '2. Personeli & Tutarı Seç',
    step2Desc: 'Masaya bakan garsonun adını/fotoğrafını veya ortak havuzu seçer. Tek dokunuşla hazır tutarlardan birine tıklar.',
    step3Title: '3. 1 Tıkla Öde & Bitir',
    step3Desc: 'Apple Pay, Google Pay veya kredi kartıyla parmak izi/yüz tanıma ile saniyeler içinde öder. Doğrudan hesaba geçer.',
    resultBanner: 'Sonuç: Müşterilerin %96\'sı akışı terk etmeden bahşiş işlemini başarıyla tamamlar.',
    resultTime: 'Ortalama Süre: 6.2 Saniye',
    footer: 'NAPONI MÜŞTERİ DENEYİMİ MİMARİSİ',
    pageLabel: 'Sayfa 03 / 10',
  },
  slide4: {
    tag: 'Mekan Estetiği & Baskı Stüdyosu',
    title: 'Mekânınızın Prestijine Yakışan Dokunuşlar',
    subtitle: 'Sıradan kağıt çıktılar değil; panelden anında indirilebilen, 300 DPI yüksek çözünürlüklü vektörel baskı ve stant şablonları.',
    card1Tag: 'Akrilik & Ahşap Şablonu',
    card1Title: 'Akrilik Pleksi & Ahşap Standlar',
    card1Desc: 'Masa numaralarınıza özel panelden üretilen, yerel reklamcı veya matbaanızda kolayca bastırabileceğiniz 300 DPI hazır baskı kalıpları.',
    card2Tag: 'Personel Yaka Rozeti',
    card2Title: 'Garson & Vale QR Rozetleri',
    card2Desc: 'Barmen, vale ve hareket halindeki servis ekibinin yaka kartlığına veya rozetine tam oturan şık ve okunaklı personel QR tasarımları.',
    card3Tag: 'Adisyon İçi Kart',
    card3Title: 'Adisyon ve Sümen Kartları',
    card3Desc: 'Hesap sümeninin veya adisyon fişinin içine yerleştirilen, müşterinin hesabı incelerken konforlu ve özel bir şekilde bahşiş bırakmasını sağlayan şablonlar.',
    footer: 'NAPONI BASKI STÜDYOSU • 300 DPI VEKTÖREL BASKI UYUMLU',
    pageLabel: 'Sayfa 04 / 10',
  },
  slide5: {
    tag: 'Yönetici Paneli',
    title: 'Tam Görünürlük. Sıfır Gece Yarısı Hesabı.',
    subtitle: 'Vardiya sonlarında yaşanan gerginlikleri tarihe gömen şeffaf, otomatik ve gerçek zamanlı yönetim merkezi.',
    mockupUrl: 'naponi.com/portal/dashboard • The Grand Bistro & Lounge',
    kpi1Val: '₺14.850,00',
    kpi1Label: 'Bugünkü Toplam Bahşiş',
    kpi2Val: '%16.4',
    kpi2Label: 'Ortalama Bahşiş Oranı',
    kpi3Val: '12 Personel',
    kpi3Label: 'Aktif Vardiya Ekibi',
    kpi4Val: '4.9 / 5.0',
    kpi4Label: 'Misafir Memnuniyet Puanı',
    box1Title: 'Canlı Bahşiş Akışı (Gerçek Zamanlı)',
    box1Desc: 'Masa 14 (Ahmet K.) ➔ ₺150 Apple Pay (2 dk önce)\nMasa 08 (Selin M.) ➔ ₺250 Kredi Kartı (5 dk önce)\nBar Alanı (Ortak Havuz) ➔ ₺100 Google Pay (8 dk önce)',
    box2Title: 'Otomatik Vardiya Havuzu & Dağıtım',
    box2Desc: 'Personelin sisteme girdiği çalışma saatlerine ve pozisyon puanına (Garson: 1.0, Mutfak: 0.5) göre bahşişler gece otomatik dağıtılır.',
    footer: 'NAPONI YÖNETİCİ VE MUHASEBE PANELİ (WEB TABANLI)',
    pageLabel: 'Sayfa 05 / 10',
  },
  slide6: {
    tag: 'Çok Yönlü Uyumluluk',
    title: 'Hizmet Sektörünün Her Alanına Uygun',
    subtitle: 'Tek bir kafeden çok şubeli lüks otel zincirlerine kadar esnek operasyonel yapı.',
    sec1Title: 'Restoranlar',
    sec1Desc: 'Masa bazlı QR kodlar, garsona özel bahşiş atama veya mutfak-salon ortak havuzlama.',
    sec2Title: 'Kafeler & Fırınlar',
    sec2Desc: 'Kasa önü hızlı tarama; barista kahveyi hazırlarken müşteri saniyeler içinde teşekkür eder.',
    sec3Title: 'Oteller & Tatil Köyü',
    sec3Desc: 'Kat hizmetleri, bellboy, oda servisi ve resepsiyon için oda anahtarlığı veya oda içi QR.',
    sec4Title: 'Bar & Gece Hayatı',
    sec4Desc: 'Karanlık ve kalabalık ortamlarda bile anında okunan yüksek kontrastlı QR bardak altlıkları.',
    extraTitle: 'Kuaförler, Spa, Vale & Özel Taşımacılık:',
    extraDesc: 'Bireysel hizmet veren tüm uzmanlar için kişisel QR kartvizit desteği.',
    extraBadge: 'Tüm Sektörler',
    footer: 'NAPONI ENDÜSTRİYEL KULLANIM ALANLARI',
    pageLabel: 'Sayfa 06 / 10',
  },
  slide7: {
    tag: 'Güvenlik ve Uyum',
    title: 'Sıfır Emanet. Doğrudan Banka Takası.',
    subtitle: 'İşletmenizin ve müşterilerinizin finansal güvenliğini garanti altına alan non-custodial fintech altyapısı.',
    feat1Title: 'Emanet Para Tutulmaz (Non-Custodial)',
    feat1Desc: 'Naponi bir aracı cüzdan değildir; paranızı kendi hesaplarında tutmaz veya bloke koymaz. Fonlar doğrudan işletmenizin anlaşmalı banka hesabına aktarılır.',
    feat2Title: 'PCI-DSS Seviye 1 Güvenlik',
    feat2Desc: 'Müşterinin kart bilgileri asla Naponi sunucularına temas etmez. Tüm işlemler uluslararası lisanslı ödeme geçitleri üzerinden 256-bit SSL ile tokenize edilir.',
    feat3Title: 'Şeffaf Muhasebe & Vergi Uyumu',
    feat3Desc: 'Yasal mevzuata uygun gelir dökümleri, stopaj/vergi hesaplamaları ve muhasebe programlarına entegre edilebilir Excel/PDF dışa aktarım desteği.',
    calloutTitle: 'İşletme Patronları İçin Güvence:',
    calloutDesc: 'Nakit bahşişlerde yaşanan kasa açıkları, eksik para veya elden ele geçerken kaybolma riskleri dijital dekontlama sayesinde tamamen sıfırlanır.',
    footer: 'NAPONI FİNANSAL GÜVENLİK PROTOKOLÜ',
    pageLabel: 'Sayfa 07 / 10',
  },
  slide8: {
    tag: 'Uluslararası Misafirler',
    title: 'Yabancı Turistlerden Maksimum Bahşiş Geliri',
    subtitle: 'Kendi ülkesinde bahşiş vermeye alışkın turistlerin dil ve kur bariyerini tamamen ortadan kaldırıyoruz.',
    feat1Title: '11 Dilde Otomatik Arayüz',
    feat1Desc: 'Turist telefonunun kamerasını açtığında, tarayıcısının dili neyse sayfa o dilde karşılar:',
    feat2Title: 'Kendi Para Birimiyle Rahat Ödeme',
    feat2Desc: 'Turistler Türk Lirası hesabına girmeden kendi bildikleri para birimlerinde rahatça bahşiş bırakırlar. İşletme kendi para birimiyle tahsil eder.',
    sub1Title: 'Apple / Google Pay',
    sub1Desc: 'Yabancı kartlarda %100 uyum',
    sub2Title: 'USD, EUR, GBP',
    sub2Desc: 'Uluslararası kart kabulü',
    footer: 'NAPONI GLOBAL TOURISM INFRASTRUCTURE',
    pageLabel: 'Sayfa 08 / 10',
  },
  slide9: {
    tag: 'Hızlı Kurulum',
    title: '2 Dakikada Başlayın. Sıfır Risk, Sıfır Cihaz.',
    subtitle: 'Haftalarca süren bürokrasi veya POS cihaz kiralama masrafları yok. Bugün kaydolun, bu akşam bahşiş almaya başlayın.',
    step1Title: '1. Ücretsiz Kayıt Olun',
    step1Desc: 'İşletme bilgilerinizi ve ödemelerin yatacağı banka hesabınızı (IBAN) 2 dakikada sisteme girin.',
    step2Title: '2. Masaları & Ekibi Ekleyin',
    step2Desc: 'Panelden salon masalarınızı ve garsonlarınızı kaydedin. Renk temanıza uygun yüksek çözünürlüklü QR kodlarınızı anında indirin.',
    step3Title: '3. Masalara Koyun & Başlayın',
    step3Desc: 'İndirdiğiniz masa standlarını veya adisyon kartlarını masalarınıza yerleştirin. İlk günden bahşiş gelirlerinizin artışını canlı panelden izleyin.',
    badge1Val: '₺0 Başlangıç Ücreti',
    badge1Desc: 'Gizli masraf veya kurulum bedeli yok',
    badge2Val: 'Sıfır Taahhüt',
    badge2Desc: 'İstediğiniz an sistemi durdurabilirsiniz',
    badge3Val: 'Kesintisiz Destek',
    badge3Desc: 'Kurumsal destek masası ve hızlı teknik yardım',
    footer: 'NAPONI ENTEGRASYON VE ONBOARDING AKIŞI',
    pageLabel: 'Sayfa 09 / 10',
  },
  slide10: {
    tag: 'Deneyimi Test Edin',
    title: 'Müşterilerinizin Yaşayacağı Deneyimi',
    titleHighlight: 'Hemen Şimdi Yaşayın.',
    desc: 'Telefonunuzun kamerasını açın ve yandaki canlı demo QR kodunu okutun. Naponi\'nin hızını ve şıklığını doğrudan kendi telefonunuzda test edin.',
    qrBadgeTitle: 'CANLI DEMO QR',
    qrBadgeSub: 'Telefon kameranızla okutun',
    qrBottomLabel: '6 SANİYEDE TEMASSIZ BAHŞİŞ',
    qrLoading: 'Yükleniyor...',
    webLabel: 'Web',
    emailLabel: 'Kurumsal E-Posta',
    footer: '© 2026 NAPONI • HER HAKKI SAKLIDIR.',
    pageLabel: 'Sayfa 10 / 10 • Son',
  },
};

const catalogEN: CatalogContent = {
  toolbar: {
    homeBtn: 'Home',
    catalogTitle: 'NAPONI B2B Corporate Product Catalog',
    catalogBadge: '2026 Edition • 10 Slides',
    shareBtn: 'Copy Link',
    copiedBtn: 'Copied!',
    printBtn: '📄 Save as PDF / Print',
  },
  slide1: {
    coverBadge: '2026 B2B Corporate Product Catalog',
    title1: 'For Hospitality & Food & Beverage',
    titleHighlight: 'Next-Generation Contactless Tipping Infrastructure',
    desc: 'The intelligent financial ecosystem where guests tip in 6 seconds with no app required, and venues manage live shift pools and payouts with zero errors.',
    pills: {
      nonCustodial: '100% Non-Custodial (Zero Escrow)',
      zeroHardware: 'Zero POS & Hardware Costs',
      instantPayment: 'Camera Tipping in 6 Seconds',
      globalTourism: '11-Language Global Tourist Ready',
    },
    confidential: 'NAPONI TECHNOLOGIES • CONFIDENTIAL & PROPRIETARY',
    pageLabel: 'www.naponi.com • Page 01 / 10',
  },
  slide2: {
    tag: 'Industry Reality',
    title: 'Why Has Traditional Tipping Failed?',
    subtitle: 'The rapid demise of cash lowers staff motivation while inflicting operational chaos on business managers.',
    painPointsHeader: '4 Critical Deadlocks of Legacy Tipping',
    painPoints: [
      '1. Cash Is Nearly Extinct: 82% of diners no longer carry cash or small bills. Even when they want to tip, they are forced to walk away without tipping.',
      '2. POS Terminal Friction & Awkwardness: Asking for tips on a POS card reader creates social pressure and discomfort for guests and embarrassment for servers.',
      '3. Bulky Mobile Apps: No guest will ever download an 85MB app, create an account, and fill card forms just for one meal (95% drop-off rate).',
      '4. Midnight Excel Accounting: Calculating shift pools at closing takes hours; suspicion of unfairness triggers high staff turnover and team friction.',
    ],
    statsHeader: 'Direct Losses For Your Business',
    stat1Val: '-42%',
    stat1Desc: 'Net tipping income missed by service staff every month due to customers carrying zero cash.',
    stat2Val: '35 Min / Day',
    stat2Desc: 'Wasted manager time spent manual calculating, counting, and dividing tip pools at nightly closing.',
    footer: 'NAPONI B2B SOLUTIONS • PROBLEM & MARKET ANALYSIS',
    pageLabel: 'Page 02 / 10',
  },
  slide3: {
    tag: 'Zero-Friction Solution',
    title: 'Tipping in 6 Seconds: No App, No Sign-Up',
    subtitle: 'The world\'s fastest tipping flow running right in mobile browsers without disrupting natural guest habits.',
    step1Title: '1. Scan With Camera',
    step1Desc: 'Guests point their native camera at the elegant table QR or waiter badge. Web portal loads instantly in 0.8 seconds.',
    step2Title: '2. Select Staff & Amount',
    step2Desc: 'Choose the assigned server or the unified tip pool. Tap one of the smart pre-calculated tip amount buttons.',
    step3Title: '3. 1-Tap Pay & Complete',
    step3Desc: 'Authenticate via Apple Pay, Google Pay, or Credit Card using biometric face/fingerprint. Funds settle directly.',
    resultBanner: 'Result: 96% of guests successfully complete their tip without dropping out of the flow.',
    resultTime: 'Average Flow Time: 6.2 Seconds',
    footer: 'NAPONI GUEST EXPERIENCE ARCHITECTURE',
    pageLabel: 'Page 03 / 10',
  },
  slide4: {
    tag: 'Venue Aesthetics & Print Studio',
    title: 'Touches Worthy of Your Venue\'s Prestige',
    subtitle: 'Not generic printouts: 300 DPI high-resolution vector print templates and table stand layouts generated right from your dashboard.',
    card1Tag: 'Acrylic & Wood Template',
    card1Title: 'Acrylic Glass & Wood Stands',
    card1Desc: 'Table-specific 300 DPI ready-to-print layouts for luxury acrylic desktop blocks or wooden stands, easily produced by any local print partner.',
    card2Tag: 'Staff Badge Layout',
    card2Title: 'Smart Server & Valet Badges',
    card2Desc: 'Compact, high-contrast QR badge templates fitting standard staff lapel holders or uniform clip badges for servers and valets.',
    card3Tag: 'Check Folder Insert',
    card3Title: 'Leather Bill Folder Cards',
    card3Desc: 'Print-ready inserts designed to sit discreetly inside leather check presentation folders for private, seamless guest tipping.',
    footer: 'NAPONI PRINT STUDIO • 300 DPI VECTOR READY',
    pageLabel: 'Page 04 / 10',
  },
  slide5: {
    tag: 'Management Suite',
    title: 'Total Visibility. Zero Midnight Mathematics.',
    subtitle: 'A transparent, automated, real-time command center putting an end to end-of-shift team disputes.',
    mockupUrl: 'naponi.com/portal/dashboard • The Grand Bistro & Lounge',
    kpi1Val: '$1,485.00',
    kpi1Label: 'Today\'s Total Tips',
    kpi2Val: '16.4%',
    kpi2Label: 'Average Tip Ratio',
    kpi3Val: '12 Staff',
    kpi3Label: 'Active Shift Team',
    kpi4Val: '4.9 / 5.0',
    kpi4Label: 'Guest Satisfaction Rating',
    box1Title: 'Live Real-Time Tip Stream',
    box1Desc: 'Table 14 (David K.) ➔ $15.00 Apple Pay (2 min ago)\nTable 08 (Sarah M.) ➔ $25.00 Credit Card (5 min ago)\nBar Counter (Shared Pool) ➔ $10.00 Google Pay (8 min ago)',
    box2Title: 'Automated Tip Pooling & Allocation',
    box2Desc: 'Tips are distributed automatically at midnight based on logged clock-in hours and position weights (Server: 1.0, Kitchen: 0.5).',
    footer: 'NAPONI EXECUTIVE & ACCOUNTING SUITE (CLOUD BASED)',
    pageLabel: 'Page 05 / 10',
  },
  slide6: {
    tag: 'Universal Versatility',
    title: 'Tailored for Every Hospitality Segment',
    subtitle: 'Flexible architecture serving single boutique cafes to multi-property luxury resort chains.',
    sec1Title: 'Restaurants & Fine Dining',
    sec1Desc: 'Table-specific QRs, dedicated waiter tip routing, or combined front-of-house/back-of-house pools.',
    sec2Title: 'Cafes & Bakeries',
    sec2Desc: 'Countertop high-speed scanning; guests express gratitude in seconds while the barista crafts their coffee.',
    sec3Title: 'Hotels & Luxury Resorts',
    sec3Desc: 'In-room QR keycards and directories for housekeeping, bellhops, concierge, and room service.',
    sec4Title: 'Bars & Nightlife',
    sec4Desc: 'High-contrast QR coasters easily readable even in dark, fast-paced nightclub environments.',
    extraTitle: 'Spas, Salons, Valets & Chauffeurs:',
    extraDesc: 'Individual QR digital business cards supporting single-practitioner personal tipping.',
    extraBadge: 'All Verticals',
    footer: 'NAPONI ENTERPRISE VERTICAL ADAPTABILITY',
    pageLabel: 'Page 06 / 10',
  },
  slide7: {
    tag: 'Security & Compliance',
    title: 'Zero Escrow. Direct Bank Settlement.',
    subtitle: 'Non-custodial fintech architecture guaranteeing absolute financial security for venues and staff.',
    feat1Title: 'Non-Custodial Architecture (Zero Escrow)',
    feat1Desc: 'Naponi is not an escrow wallet. We never hold, pool, or freeze your funds in proprietary intermediary accounts. Payouts transfer directly to your designated bank accounts.',
    feat2Title: 'PCI-DSS Level 1 Encryption',
    feat2Desc: 'Guest card credentials never touch Naponi servers. All transactions are securely tokenized with 256-bit SSL encryption via globally certified payment gateways.',
    feat3Title: 'Transparent Auditing & Tax Compliance',
    feat3Desc: 'Legally compliant earning breakdowns, automated withholding calculations, and 1-click Excel/PDF exports ready for accounting software integration.',
    calloutTitle: 'Peace of Mind for Operators:',
    calloutDesc: 'Cash drawer discrepancies, undercounted tips, or pilferage during hand-to-hand distribution are permanently eliminated through end-to-end digital receipts.',
    footer: 'NAPONI FINANCIAL SECURITY & COMPLIANCE PROTOCOL',
    pageLabel: 'Page 07 / 10',
  },
  slide8: {
    tag: 'International Guests',
    title: 'Maximize Revenue From International Tourists',
    subtitle: 'Eliminate all language and currency friction for global travelers already accustomed to tipping.',
    feat1Title: 'Automatic 11-Language Interface',
    feat1Desc: 'When travelers open their smartphone camera, the page automatically greets them in their native system language:',
    feat2Title: 'Comfortable Payment in Familiar Currencies',
    feat2Desc: 'Tourists tip seamlessly in their domestic currency without having to calculate local exchange rates. The business settles directly.',
    sub1Title: 'Apple / Google Pay',
    sub1Desc: '100% acceptance for foreign cards',
    sub2Title: 'USD, EUR, GBP, JPY',
    sub2Desc: 'Seamless international clearing',
    footer: 'NAPONI GLOBAL TOURISM INFRASTRUCTURE',
    pageLabel: 'Page 08 / 10',
  },
  slide9: {
    tag: 'Rapid Onboarding',
    title: 'Live in 2 Minutes. Zero Risk, Zero Hardware.',
    subtitle: 'No weeks of administrative paperwork or POS hardware rental contracts. Register today, collect tips tonight.',
    step1Title: '1. Register Free in 2 Minutes',
    step1Desc: 'Fill in your basic business info and the settlement bank account (IBAN) where payouts will be transferred.',
    step2Title: '2. Add Tables & Team',
    step2Desc: 'Add your floor tables and staff members. Instantly download high-resolution QR codes styled to your brand colors.',
    step3Title: '3. Place on Tables & Launch',
    step3Desc: 'Place your printed stands or bill folder cards on tables and monitor real-time tip growth from day one on your executive dashboard.',
    badge1Val: '$0 Upfront Cost',
    badge1Desc: 'No setup charges or hidden fees',
    badge2Val: 'Zero Contract Lock-In',
    badge2Desc: 'Pause or cancel anytime with no penalties',
    badge3Val: 'Responsive Support',
    badge3Desc: 'Dedicated support desk & technical assistance',
    footer: 'NAPONI INTEGRATION & ONBOARDING LIFECYCLE',
    pageLabel: 'Page 09 / 10',
  },
  slide10: {
    tag: 'Experience It Live',
    title: 'Experience What Your Guests Will Feel',
    titleHighlight: 'Right Here, Right Now.',
    desc: 'Open your smartphone camera and scan the interactive demo QR code. Test Naponi\'s lightning speed and elegance directly on your own device.',
    qrBadgeTitle: 'LIVE DEMO QR',
    qrBadgeSub: 'Scan with your camera',
    qrBottomLabel: 'CONTACTLESS TIP IN 6 SECONDS',
    qrLoading: 'Loading...',
    webLabel: 'Web',
    emailLabel: 'Corporate Email',
    footer: '© 2026 NAPONI • ALL RIGHTS RESERVED.',
    pageLabel: 'Page 10 / 10 • End',
  },
};

export const catalogDataByLang: Record<string, CatalogContent> = {
  tr: catalogTR,
  en: catalogEN,
};

export function getCatalogContent(lang: string): CatalogContent {
  const normalized = (lang || 'en').toLowerCase().slice(0, 2);
  if (catalogDataByLang[normalized]) {
    return catalogDataByLang[normalized];
  }
  // Default to English for international travelers/partners, Turkish if starts with tr
  return normalized === 'tr' ? catalogTR : catalogEN;
}
