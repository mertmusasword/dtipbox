export interface SectorFaq {
  question: string;
  answer: string;
}

export interface SectorSolution {
  slug: string;
  sectorName: string;
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Commercial' | 'Transactional';
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  problemTitle: string;
  problemDescription: string;
  problems: string[];
  solutionTitle: string;
  solutionDescription: string;
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  workflowSteps: {
    step: string;
    title: string;
    description: string;
  }[];
  useCases: {
    title: string;
    description: string;
  }[];
  faqs: SectorFaq[];
  relatedBlogSlugs: string[];
}

export const SECTOR_SOLUTIONS: Record<string, SectorSolution> = {
  restaurants: {
    slug: 'restaurants',
    sectorName: 'Restoranlar & Fine Dining',
    badge: 'Restoranlar İçin Dijital Bahşiş',
    heroTitle: 'Restoranınız İçin Masada Temassız QR Bahşiş Sistemi',
    heroSubtitle: 'Misafirleriniz nakitsiz kalsa bile garsonlarınıza hak ettikleri bahşişi 6 saniyede bıraksın. Uygulama indirme yok, donanım maliyeti yok.',
    targetKeyword: 'restoran bahşiş sistemi',
    secondaryKeywords: ['restoran qr bahşiş', 'garson bahşiş sistemi', 'masada bahşiş ödeme', 'restoran tip havuzu'],
    searchIntent: 'Commercial',
    metaTitle: 'Restoranlar İçin QR Kodlu Dijital Bahşiş Sistemi — Naponi',
    metaDescription: 'Restoranlar ve fine dining mekanlar için masada temassız QR bahşiş sistemi. Nakit ihtiyacını bitirin, garson ve mutfak bahşiş havuzunu kolayca yönetin.',
    canonicalUrl: 'https://www.naponi.com/solutions/restaurants',
    problemTitle: 'Restoranlarda Nakit Kaybı ve Bahşiş Sorunları',
    problemDescription: 'Misafirlerin %80’inden fazlası kredi kartıyla ödeme yapıyor ve cüzdanında nakit taşımıyor. Bu durum restoranınızda:',
    problems: [
      'Garson ve servis personelinin hak ettiği bahşiş gelirlerini kaybetmesine yol açar.',
      'Adisyona elle bahşiş ekletme süreçleri muhasebe ve POS komisyon yükünü artırır.',
      'Personel devir hızını (turnover) yükseltir ve kaliteli servis elemanı bulmayı zorlaştırır.',
      'Günün sonunda bahşiş kutusundaki paranın şeffaf paylaştırılmasında anlaşmazlıklar doğurur.',
    ],
    solutionTitle: 'Naponi ile Masada Sürtünmesiz Bahşiş Deneyimi',
    solutionDescription: 'Masalara yerleştirilen şık QR kodlar sayesinde misafirleriniz hesap sümeni geldiğinde doğrudan telefon kamerasıyla bahşiş bırakır:',
    features: [
      {
        title: 'Masa ve Garson Bazlı Tanıma',
        description: 'Her masaya veya vardiyadaki garsona özel QR tanımlayın. Müşteri kime teşekkür ettiğini bilsin.',
        icon: 'Utensils',
      },
      {
        title: 'Bireysel veya Havuz Dağıtımı',
        description: 'Bahşişleri doğrudan servis personeline veya gün sonu mutfak-bar ortak havuzuna otomatik yönlendirin.',
        icon: 'Users',
      },
      {
        title: 'Doğrudan Banka Mutabakatı',
        description: 'Emanetçi havuz yok; ödemeler doğrudan tanımladığınız banka hesabına veya sanal POSunuza akar.',
        icon: 'Wallet',
      },
      {
        title: 'Sıfır Donanım Maliyeti',
        description: 'Aylık kira ödenen pos terminallerine gerek kalmadan, sadece yüksek kaliteli QR stantlarla çalışır.',
        icon: 'Smartphone',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Masa QR Kodlarınızı Alın',
        description: 'Naponi panelinizden salonunuzdaki masalar için yüksek çözünürlüklü QR kodları üretip masalara yerleştirin.',
      },
      {
        step: '02',
        title: 'Misafir Masada Tarasın',
        description: 'Yemek sonrası misafir kamera ile kodu okutur. Uygulama indirmeden ödeme ekranı 1 saniyede açılır.',
      },
      {
        step: '03',
        title: 'Bahşiş Anında Aktarılsın',
        description: 'Apple Pay, Google Pay, Kart veya FAST ile ödeme tamamlanır; ekibin motivasyonu tavan yapar.',
      },
    ],
    useCases: [
      {
        title: 'Fine Dining & Rezervasyonlu Mekanlar',
        description: 'Seçkin misafirlerinize nakit arama zahmeti yaşatmadan, premium servisin hakkını dijital olarak vermelerini sağlayın.',
      },
      {
        title: 'Bistro, Brasserie & Casual Dining',
        description: 'Hızlı masa devir hızına sahip mekanlarda hesap ve bahşiş süreçlerini hızlandırın.',
      },
    ],
    faqs: [
      {
        question: 'Masa QR kodları menüye veya hesaba nasıl eklenir?',
        answer: 'QR kodlar hem pleksi masa stantları olarak masaya konulabilir hem de hesap sümeninin içerisine veya fişin altına basılabilir.',
      },
      {
        question: 'Mutfak personeli için pay ayrılabilir mi?',
        answer: 'Evet. Panel üzerinden bahşiş havuzu dağıtım kurallarını belirleyerek mutfak, komi ve servis ekibine adil paylar tanımlayabilirsiniz.',
      },
    ],
    relatedBlogSlugs: [
      'restoranlarda-dijital-bahsis-rehberi',
      'garsonlar-icin-qr-kodlu-bahsis-rehberi',
      'bahsis-havuzu-tip-pool-nedir-nasil-dagitilir',
    ],
  },

  cafes: {
    slug: 'cafes',
    sectorName: 'Kafeler & 3. Nesil Kahveciler',
    badge: 'Kafeler ve Baristalar İçin',
    heroTitle: 'Kasanızda Kuyruk Oluşturmadan Baristanıza Dijital Bahşiş',
    heroSubtitle: 'Kahve tezgahında, take-away teslim noktasında ya da masalarda saniyeler içinde QR ile barista bahşişi toplayın.',
    targetKeyword: 'kafe bahşiş sistemi',
    secondaryKeywords: ['barista bahşiş sistemi', 'kahveci qr bahşiş', 'kafe dijital tip kutusu'],
    searchIntent: 'Commercial',
    metaTitle: 'Kafeler ve Kahveciler İçin QR Bahşiş Sistemi — Naponi',
    metaDescription: '3. nesil kahveciler ve butik kafeler için QR kodlu barista bahşiş sistemi. Kasa kuyruklarını önleyin, baristalarınızın gelirini artırın.',
    canonicalUrl: 'https://www.naponi.com/solutions/cafes',
    problemTitle: 'Kafelerde Kasa Önü Bahşiş Çıkmazı',
    problemDescription: 'Yoğun sabah ve öğle saatlerinde kasa önünde bahşiş sormak ve pos cihazında ek işlem yapmak servisi kilitler:',
    problems: [
      'Kasiyerin müşteriye bahşiş sorması çekingenlik yaratır ve kuyruğu uzatır.',
      'Geleneksel cam kavanozdaki bahşiş kutusu (tip box) nakitsiz müşterilerden gelir toplayamaz.',
      'Nitelikli baristalar hak ettikleri ek geliri bulamadıklarında işten ayrılır.',
    ],
    solutionTitle: 'Tezgah Üstü ve Kasa Yanı QR Bahşiş',
    solutionDescription: 'Müşteri kahvesinin demlenmesini beklerken tezgahtaki QR kodu taratarak baristaya 5 saniyede bahşişini gönderir:',
    features: [
      {
        title: 'Kasa Hızını Yavaşlatmaz',
        description: 'Ödeme kuyruğundan bağımsız çalışır; müşteri kahvesini teslim alırken veya yudumlarken bahşişini iletir.',
        icon: 'Coffee',
      },
      {
        title: 'Barista Sadakatini Artırır',
        description: 'V60 ve espresso hazırlayan nitelikli baristalarınızın motivasyonunu ve gelirini katlar.',
        icon: 'Sparkles',
      },
      {
        title: 'Take-Away & Paket Uyumlu',
        description: 'Kahve bardağı kılıfına veya paket teslim standına yerleştirilen QR ile al-götür siparişlerde de bahşiş toplayın.',
        icon: 'Smartphone',
      },
      {
        title: 'Apple Pay & Google Pay Kolaylığı',
        description: 'Kart numarası girmeden tek dokunuşla biyometrik onay.',
        icon: 'Zap',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Tezgaha QR Standı Koyun',
        description: 'Kahve teslim noktasının veya kasanın yanına Naponi şık ahşap/pleksi QR standını yerleştirin.',
      },
      {
        step: '02',
        title: 'Müşteri Beklerken Okutsun',
        description: 'Flat white veya filtresini beklerken kamerasıyla QR kodu taratıp tutarı seçsin.',
      },
      {
        step: '03',
        title: 'Barista Havuzuna Eklensin',
        description: 'Bahşiş anında barista vardiya havuzuna yansısın.',
      },
    ],
    useCases: [
      {
        title: '3. Nesil Nitelikli Kahveciler',
        description: 'Baristaların zanaatını ödüllendiren şeffaf dijital bahşiş kutusu.',
      },
      {
        title: 'Pastane ve Fırın Kafeler',
        description: 'Tezgahtan taze kruvasan ve kahve alan müşteriler için hızlı temassız bahşiş.',
      },
    ],
    faqs: [
      {
        question: 'Kafede bahşişler vardiya sonunda nasıl paylaşılır?',
        answer: 'Sistem otomatik saatlik dağıtım veya eşit paylaşım modellerini destekler; her baristanın payı panelde net olarak hesaplanır.',
      },
      {
        question: 'Birden fazla şubeli kahve zincirleri kullanabilir mi?',
        answer: 'Evet. Tüm şubelerinizi tek bir kurumsal Naponi hesabından yönetebilir, şube bazlı bahşiş performansını kıyaslayabilirsiniz.',
      },
    ],
    relatedBlogSlugs: [
      'kafeler-icin-hizli-qr-bahsis-entegrasyonu',
      'qr-bahsis-nedir-nasil-calisir',
      'bahsis-havuzu-tip-pool-nedir-nasil-dagitilir',
    ],
  },

  hotels: {
    slug: 'hotels',
    sectorName: 'Oteller & Konaklama',
    badge: 'Otel ve Housekeeping İçin',
    heroTitle: 'Otel Kat Hizmetleri ve Bellboylar İçin Temassız Bahşiş',
    heroSubtitle: 'Yabancı turistler yerel nakit para taşımak zorunda kalmadan odadaki QR kodla kat görevlisine ve lobi ekibine bahşiş bıraksın.',
    targetKeyword: 'otel bahşiş sistemi',
    secondaryKeywords: ['housekeeping bahşiş qr', 'otel personeli bahşiş', 'bellboy dijital bahşiş'],
    searchIntent: 'Commercial',
    metaTitle: 'Oteller ve Kat Hizmetleri İçin QR Bahşiş Sistemi — Naponi',
    metaDescription: 'Oteller, tatil köyleri ve butik oteller için temassız QR bahşiş sistemi. Housekeeping, bellboy ve resepsiyon personeline yabancı turistlerden kolay bahşiş akışı.',
    canonicalUrl: 'https://www.naponi.com/solutions/hotels',
    problemTitle: 'Otellerde Bahşiş Bırakamayan Turistler',
    problemDescription: 'Uluslararası otel misafirleri odayı temizleyen görevliye teşekkür etmek istese de nakit döviz bozduramadığı için bahşiş bırakamaz:',
    problems: [
      'Kat hizmetleri (housekeeping) ekibi yüz yüze temas az olduğu için hak ettiği bahşişlerden mahrum kalır.',
      'Yabancı misafirlerin üzerindeki döviz bozuklukları otel çalışanları tarafından kolayca bozdurulamaz.',
      'Düşük bahşiş memnuniyeti otellerde temizlik personeli turnover oranını artırır.',
    ],
    solutionTitle: 'Oda İçi ve Lobi QR Bahşiş Altyapısı',
    solutionDescription: 'Otel odasındaki komodine veya oda kartı kılıfına yerleştirilen QR kod ile uluslararası standartta bahşiş imkanı:',
    features: [
      {
        title: 'Çoklu Para Birimi (USD, EUR, GBP)',
        description: 'Turistler kendi para birimlerinde Apple Pay ve uluslararası kartlarıyla ödeme yapabilir.',
        icon: 'Globe',
      },
      {
        title: 'Kat Görevlisi İsim Tanıma',
        description: 'Odayı temizleyen personelin adı ekranda belirir; misafir kişisel teşekkür mesajı yazabilir.',
        icon: 'Hotel',
      },
      {
        title: 'Bellboy & Vale Desteği',
        description: 'Bavul taşıyan bellboy veya arabayı getiren vale için yaka kartı QR kodu.',
        icon: 'Users',
      },
      {
        title: 'Otel İtibarını ve Puanını Yükseltir',
        description: 'Motive temizlik personeli daha yüksek oda hijyeni sağlar; Booking ve TripAdvisor puanları yükselir.',
        icon: 'ShieldCheck',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Odalara QR Kartı Yerleştirin',
        description: 'Yatak başı komodinine veya ayna önündeki bilgilendirme kartına özel QR kodu ekleyin.',
      },
      {
        step: '02',
        title: 'Misafir Ayrılırken Okutsun',
        description: 'Check-out öncesi odadan memnun kalan misafir kamerayla taratıp dilediği tutarı onaylasın.',
      },
      {
        step: '03',
        title: 'Doğrudan Personel Hesabına',
        description: 'Bahşiş doğrudan personelin IBAN hesabına veya departman havuzuna güvenle aktarılır.',
      },
    ],
    useCases: [
      {
        title: '5 Yıldızlı Şehir & İş Otelleri',
        description: 'Yabancı iş insanları ve expat misafirler için modern ve kurumsal bahşiş standardı.',
      },
      {
        title: 'Tatil Köyleri ve Resortlar',
        description: 'All-inclusive tesislerde nakit taşımayan tatilcilerden ekibe kolay bahşiş imkanı.',
      },
    ],
    faqs: [
      {
        question: 'Turistlerin Türkçe bilmesi gerekir mi?',
        answer: 'Hayır. Naponi 10 farklı dili (İngilizce, Almanca, Rusça, Arapça, Fransızca vb.) otomatik olarak misafirin tarayıcı diline göre açar.',
      },
      {
        question: 'Otel muhasebesine ek iş yükü getirir mi?',
        answer: 'Hayır. Tüm işlemler doğrudan banka transferleri üzerinden şeffaf raporlarla gerçekleşir.',
      },
    ],
    relatedBlogSlugs: [
      'otel-kat-hizmetlerinde-nakitsiz-bahsis-cozumleri',
      'restoranlarda-dijital-bahsis-rehberi',
      'qr-bahsis-nedir-nasil-calisir',
    ],
  },

  bars: {
    slug: 'bars',
    sectorName: 'Barlar, Publar & Gece Kulüpleri',
    badge: 'Gece Hayatı ve Barlar İçin',
    heroTitle: 'Kalabalık Barlarda Hızlı ve Temassız Barmen Bahşişi',
    heroSubtitle: 'Loş ışıkta para üstü saymaya son. Tezgahtaki QR kodu okutan misafir içkisini alırken barmene anında bahşişini bıraksın.',
    targetKeyword: 'bar bahşiş sistemi',
    secondaryKeywords: ['barmen bahşiş sistemi', 'gece kulübü qr bahşiş', 'pub bahşiş kutusu'],
    searchIntent: 'Commercial',
    metaTitle: 'Barlar ve Gece Kulüpleri İçin QR Bahşiş Sistemi — Naponi',
    metaDescription: 'Barlar, publar ve gece kulüpleri için hızlı temassız QR bahşiş sistemi. Kalabalık barda içki siparişini yavaşlatmadan barmen bahşişini toplayın.',
    canonicalUrl: 'https://www.naponi.com/solutions/bars',
    problemTitle: 'Gece Hayatında Hızlı Servis ve Bahşiş Zorluğu',
    problemDescription: 'Gürültülü ve kalabalık bar ortamında nakit para üstü vermek servis hızını düşürür ve hatalara yol açar:',
    problems: [
      'Barmen para üstü ararken yeni siparişleri geciktirir.',
      'Kartla ödeme yapan müşterilerin barmene kokteyl bahşişi bırakması pratik değildir.',
      'Gece sonunda fiziki bahşiş kutusundaki paraların sayılması ve paylaştırılması risklidir.',
    ],
    solutionTitle: 'Bar Tezgahı İçin Yüksek Hızlı QR Tipping',
    solutionDescription: 'Bar bankosuna yerleştirilen ışıklı veya pleksi QR standlar ile müşteriler anında bahşiş bırakır:',
    features: [
      {
        title: '3 Saniyede Biyometrik Onay',
        description: 'Apple Pay veya Google Pay ile yüz tanıma / parmak izi ile beklemeden ödeme.',
        icon: 'Zap',
      },
      {
        title: 'Barmen & Barback Ortak Havuzu',
        description: 'Barmen ve arka plandaki barback ekibi arasında adil yüzdesel dağıtım.',
        icon: 'Users',
      },
      {
        title: 'Yüksek Hacimli İşlem Kapasitesi',
        description: 'Cuma ve Cumartesi gece yoğunluklarında kesintisiz çalışan bulut altyapı.',
        icon: 'Sparkles',
      },
      {
        title: 'Gece Sonu Dijital Mutabakat',
        description: 'Kasa sayımıyla uğraşmadan panelden anında net kazanç raporu.',
        icon: 'Wallet',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Bar Bankosuna QR Ekleyin',
        description: 'Kokteyl hazırlanan alanın veya bar taburelerinin önüne QR stantları yerleştirin.',
      },
      {
        step: '02',
        title: 'Kokteyl Hazırlanırken Okutsun',
        description: 'Barmen miksoloji yaparken müşteri tek dokunuşla bahşişini göndersin.',
      },
      {
        step: '03',
        title: 'Ekip Arasında Paylaşılsın',
        description: 'Vardiya bitiminde sistem tüm ekibin payını otomatik hesaplasın.',
      },
    ],
    useCases: [
      {
        title: 'Kokteyl Barları & Speakeasy',
        description: 'Özel kokteyl yapan yetenekli miksolojistlerin emeğini takdir eden şık arayüz.',
      },
      {
        title: 'Gastropub ve Bira Evleri',
        description: 'Yüksek masa sirkülasyonunda hızlı masa ve bar bahşişi.',
      },
    ],
    faqs: [
      {
        question: 'Loş ışıkta telefon kamerası QR kodu okur mu?',
        answer: 'Evet. Yüksek kontrastlı özel tasarım QR kodlarımız düşük ışıklı bar ortamlarında dahi anında taranır.',
      },
    ],
    relatedBlogSlugs: [
      'bahsis-havuzu-tip-pool-nedir-nasil-dagitilir',
      'restoranlarda-dijital-bahsis-rehberi',
      'qr-bahsis-nedir-nasil-calisir',
    ],
  },

  barbers: {
    slug: 'barbers',
    sectorName: 'Kuaför, Berber & Güzellik Merkezleri',
    badge: 'Kuaför ve Güzellik Merkezleri İçin',
    heroTitle: 'Stilist ve Kuaförleriniz İçin Koltuğa Özel QR Bahşiş',
    heroSubtitle: 'Müşterileriniz saç kesimi veya bakım sonrasında kasaya gitmeden, doğrudan kuaför koltuğundaki QR kodla stilistine bahşiş bıraksın.',
    targetKeyword: 'kuaför bahşiş sistemi',
    secondaryKeywords: ['berber bahşiş sistemi', 'kuaför qr bahşiş', 'stilist bahşiş ödemesi'],
    searchIntent: 'Commercial',
    metaTitle: 'Kuaförler ve Berberler İçin QR Bahşiş Sistemi — Naponi',
    metaDescription: 'Kuaförler, berberler ve güzellik salonları için koltuğa özel QR bahşiş sistemi. Stilist ve kalfaların bahşiş gelirlerini dijitalleştirin.',
    canonicalUrl: 'https://www.naponi.com/solutions/barbers',
    problemTitle: 'Kuaför Salonlarında Bahşişin Çekingenliği',
    problemDescription: 'Güzellik salonlarında saçını boyatan veya kestiren müşteriler, kalfaya ya da çırağa nakit vermek istediklerinde bozuk para bulamaz:',
    problems: [
      'Müşteri kasada toplam tutarı kartla çekerken estiliste nakit verememenin mahcubiyetini yaşar.',
      'Kalfalar ve çıraklar emeklerinin karşılığı olan bahşişi toplayamaz.',
      'Salon sahipleri bahşiş dağıtımını yönetmekte zorlanır.',
    ],
    solutionTitle: 'Ayna ve Koltuk Yanı QR Çözümü',
    solutionDescription: 'Her berber veya kuaför aynasının kenarına yerleştirilen özel QR kod ile stiliste doğrudan bahşiş:',
    features: [
      {
        title: 'Kişisel Stilist Profili',
        description: 'Kodu okutan müşteri stilistin adını görür; kesim veya renklendirme için teşekkür eder.',
        icon: 'Scissors',
      },
      {
        title: 'Çırak ve Kalfa Desteği',
        description: 'Müşteri isterse saç yıkayan kalfaya da ayrı bahşiş seçebilir.',
        icon: 'Users',
      },
      {
        title: 'Kasada Sıkışıklık Yaratmaz',
        description: 'Bahşiş koltukta verilir; kasada sadece ana hizmet faturası tahsil edilir.',
        icon: 'CheckCircle2',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Aynaya QR Yapıştırın',
        description: 'Her koltuğun aynasına stilistin adına özel üretilmiş QR etiketi yerleştirin.',
      },
      {
        step: '02',
        title: 'Müşteri Fön Çekilirken Okutsun',
        description: 'Hizmet tamamlanırken müşteri telefonundan kodu taratıp bahşişini göndersin.',
      },
      {
        step: '03',
        title: 'Doğrudan Stiliste Ulaşsın',
        description: 'Tutar stilistin kendi hesabına şeffaf şekilde geçsin.',
      },
    ],
    useCases: [
      {
        title: 'Erkek Berberleri ve Saç Tasarım Merkezleri',
        description: 'Usta ve çırak dengesini koruyan şeffaf bahşiş modeli.',
      },
      {
        title: 'Kadın Kuaförleri ve Tırnak/Spa Stüdyoları',
        description: 'Manikürist ve saç stilistlerine doğrudan dijital teşekkür.',
      },
    ],
    faqs: [
      {
        question: 'Stilist kendi kazandığı bahşişi nereden takip eder?',
        answer: 'Kendisine verilen personel giriş şifresiyle kendi mobil panelinden anlık olarak tüm bahşişlerini izleyebilir.',
      },
    ],
    relatedBlogSlugs: [
      'garsonlar-icin-qr-kodlu-bahsis-rehberi',
      'qr-bahsis-nedir-nasil-calisir',
      'restoranlarda-dijital-bahsis-rehberi',
    ],
  },

  valet: {
    slug: 'valet',
    sectorName: 'Vale & VIP Taşımacılık',
    badge: 'Vale Hizmetleri İçin',
    heroTitle: 'Nakit Taşımayan Sürücüler İçin Temassız Vale Bahşişi',
    heroSubtitle: 'Aracı teslim ederken para arama telaşına son. Araç anahtarlık kartındaki veya vale kulübesindeki QR ile 5 saniyede bahşiş.',
    targetKeyword: 'vale bahşiş sistemi',
    secondaryKeywords: ['vale qr bahşiş', 'otopark bahşiş sistemi', 'vale görevlisi dijital bahşiş'],
    searchIntent: 'Commercial',
    metaTitle: 'Vale Hizmetleri İçin QR Kodlu Bahşiş Sistemi — Naponi',
    metaDescription: 'Vale şirketleri, AVM ve restoran valeleri için temassız QR bahşiş sistemi. Araç tesliminde nakit beklemeden anında temassız bahşiş toplayın.',
    canonicalUrl: 'https://www.naponi.com/solutions/valet',
    problemTitle: 'Araç Tesliminde Nakit Olmaması Sorunu',
    problemDescription: 'Araç sahipleri restoran veya AVM kapısında araçlarını teslim alırken üzerlerinde bozuk nakit bulamadıkları için vale görevlisine bahşiş bırakamaz:',
    problems: [
      'Sürücü aracı çalışır vaziyette bekletirken cüzdanında nakit aramak zorunda kalır ve kapıda trafik oluşur.',
      'Vale görevlileri yoğun yağmur ve soğukta sundukları hizmetin karşılığını nakitsizlik yüzünden alamaz.',
      'Vale firmaları personelinin bahşiş memnuniyetsizliği nedeniyle sık personel değişimi yaşar.',
    ],
    solutionTitle: 'Anahtarlık Fişi ve Vale Noktası QR Çözümü',
    solutionDescription: 'Müşteriye verilen vale teslim fişinin veya anahtarlığın üzerine basılan QR kod ile sürtünmesiz bahşiş:',
    features: [
      {
        title: 'Araç Beklerken Ödeme',
        description: 'Müşteri aracı kapıya gelene kadar elindeki vale fişindeki QR kodu okutup bahşişini hazırlar.',
        icon: 'Car',
      },
      {
        title: 'Kapı Trafiğini Engeller',
        description: 'Araca binerken para alışverişiyle vakit kaybedilmez; anında hareket edilir.',
        icon: 'Zap',
      },
      {
        title: 'Vardiya Vale Havuzu',
        description: 'O vardiyadaki tüm vale şoförleri arasında toplanan bahşişler adilce paylaştırılır.',
        icon: 'Users',
      },
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Vale Fişine QR Basın',
        description: 'Müşteriye verilen araç teslim fişine veya vale gişesine Naponi QR kodunu ekleyin.',
      },
      {
        step: '02',
        title: 'Sürücü Beklerken Tarasın',
        description: 'Arabası parktan getirilirken sürücü telefon kamerasıyla kodu okutup tutarı seçsin.',
      },
      {
        step: '03',
        title: 'Aracı Alıp Yola Çıksın',
        description: 'Nakit bozukluk aramadan, teşekkür ederek aracına binip ayrılsın.',
      },
    ],
    useCases: [
      {
        title: 'Restoran ve Otel Valeleri',
        description: 'Lüks mekan kapısında misafirlere kusursuz ve modern bir karşılama-uğurlama deneyimi.',
      },
      {
        title: 'Özel Vale ve Otopark İşletmeleri',
        description: 'Geniş personel kadrosuna sahip vale şirketleri için şeffaf gelir modeli.',
      },
    ],
    faqs: [
      {
        question: 'Vale fişleri tek kullanımlık mıdır?',
        answer: 'İşletme tek bir sabit QR kod basabileceği gibi, her araç teslim fişine dinamik kod da atayabilir.',
      },
    ],
    relatedBlogSlugs: [
      'qr-bahsis-nedir-nasil-calisir',
      'restoranlarda-dijital-bahsis-rehberi',
      'bahsis-havuzu-tip-pool-nedir-nasil-dagitilir',
    ],
  },
};
