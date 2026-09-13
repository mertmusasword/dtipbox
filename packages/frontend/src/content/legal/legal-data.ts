export interface LegalDoc {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: {
    heading: string;
    content: string | string[];
  }[];
}

export interface LegalBundle {
  tabs: {
    kvkk: string;
    privacy: string;
    terms: string;
    cookies: string;
  };
  closeBtn: string;
  printBtn: string;
  companyInfo: {
    title: string;
    vkn: string;
    address: string;
    email: string;
  };
  kvkk: LegalDoc;
  privacy: LegalDoc;
  terms: LegalDoc;
  cookies: LegalDoc;
}

const legalTR: LegalBundle = {
  tabs: {
    kvkk: 'KVKK Aydınlatma Metni',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Koşulları',
    cookies: 'Çerez Politikası',
  },
  closeBtn: 'Kapat',
  printBtn: 'Yazdır / İndir',
  companyInfo: {
    title: 'Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi',
    vkn: '6291105866',
    address: 'Bakırköy Dünya Ticaret Merkezi, Bakırköy / İstanbul, Türkiye',
    email: 'info@naponi.com',
  },
  kvkk: {
    title: '6698 Sayılı KVKK Uyarınca Aydınlatma Metni',
    subtitle: 'Kişisel Verilerinizin Güvenliği ve İşlenme İlkeleri Hakkında Bilgilendirme',
    lastUpdated: 'Son Güncelleme: 13 Eylül 2026',
    sections: [
      {
        heading: '1. Veri Sorumlusunun Kimliği',
        content: '6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi ("Naponi" veya "Şirket") tarafından aşağıda açıklanan kapsam ve şartlarda işlenmektedir.',
      },
      {
        heading: '2. İşlenen Kişisel Verileriniz ve Toplanma Yöntemleri',
        content: [
          'İşletme Yetkilileri ve Çalışanlar İçin: Ad, soyad, e-posta adresi, telefon numarası, IBAN numarası, işletme unvanı, şube bilgisi ve çalışma vardiyası verileri.',
          'Bahşiş Veren Müşteriler İçin: İşlem tutarı, bahşiş bırakılan personel/masa bilgisi, isteğe bağlı bırakılan yıldızlı puanlama ve metin yorumları, IP adresi ve tarayıcı bilgisi. (Not: Kredi kartı bilgileri asla sunucularımızda tutulmaz).',
          'Web Sitesi Ziyaretçileri İçin: IP adresi, çerezler, oturum süreleri, yönlendiren URL ve Google Analytics işlem kayıtları.',
        ],
      },
      {
        heading: '3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri',
        content: [
          'KVKK m. 5/2-c uyarınca bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (Bahşiş transferlerinin hesaplanması ve IBAN\'a aktarımı).',
          'KVKK m. 5/2-ç uyarınca veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (Vergi mevzuatı, muhasebe kayıtları ve 5651 sayılı kanun kapsamındaki log kayıtları).',
          'KVKK m. 5/2-f uyarınca ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri (Platform güvenliği, sahtekarlık/dolandırıcılık önleme ve hizmet kalitesini ölçümleme).',
        ],
      },
      {
        heading: '4. Kişisel Verilerin Aktarımı',
        content: 'Toplanan kişisel veriler; yasal yükümlülüklerimizin ifası amacıyla adli/idari mercilere, ödeme altyapısının işletilmesi amacıyla lisanslı ödeme kuruluşlarına (Iyzico, PayTR, Stripe vb.) ve bankalara aktarılabilmektedir. Şirketimiz verilerinizi asla reklam veya pazarlama amacıyla üçüncü şahıslara satmaz.',
      },
      {
        heading: '5. İlgili Kişinin KVKK Madde 11 Kapsamındaki Hakları',
        content: 'KVKK\'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı 3. kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme ve silinmesini/yok edilmesini talep etme haklarına sahipsiniz. Taleplerinizi info@naponi.com adresine iletebilirsiniz.',
      },
    ],
  },
  privacy: {
    title: 'Naponi Gizlilik Politikası',
    subtitle: 'Finansal Güvenlik, Veri Koruması ve Sıfır Emanet Protokolü',
    lastUpdated: 'Son Güncelleme: 13 Eylül 2026',
    sections: [
      {
        heading: '1. Gizlilik Taahhüdümüz',
        content: 'Naponi, kullanıcılarının ve ziyaretçilerinin gizliliğini en üst düzeyde korumayı ilke edinmiştir. Bu Gizlilik Politikası, platformumuzu (web sitesi, QR arayüzleri ve yönetim panelleri) kullanırken toplanan bilgilerin nasıl korunduğunu açıklar.',
      },
      {
        heading: '2. Finansal Kart Güvenliği (PCI-DSS Seviye 1)',
        content: 'Naponi, emanetsiz (non-custodial) bir arayüzdür. Kredi kartı veya banka kartı numaralarınız, son kullanma tarihleri ve CVV güvenlik kodları ASLA Naponi sunucularında saklanmaz veya işlenmez. Tüm ödeme işlemleri uluslararası PCI-DSS Seviye 1 sertifikalı lisanslı ödeme geçitleri üzerinden doğrudan bankalara 256-bit uçtan uca SSL şifreleme ile iletilir.',
      },
      {
        heading: '3. Veri Güvenliği ve Kriptografik Önlemler',
        content: 'Kullanıcı şifreleri tek yönlü bcrypt/Argon2 algoritmalarıyla özetlenerek saklanır. Veritabanı bağlantıları şifreli tüneller (TLS) üzerinden sağlanır. İşletmelerin kabul ettiği sözleşmeler SHA-256 değişmez kriptografik zaman damgalarıyla denetim altında tutulur.',
      },
      {
        heading: '4. Üçüncü Taraf Bağlantıları',
        content: 'Sitemizde Google Analytics gibi güvenilir analiz araçları kullanılmaktadır. Bu araçlar yalnızca anonimleştirilmiş kullanım istatistiklerini derler ve hiçbir hassas finansal veri bu sağlayıcılarla paylaşılmaz.',
      },
    ],
  },
  terms: {
    title: 'Kullanıcı ve Hizmet Koşulları',
    subtitle: 'Naponi Platformu Kullanım Kuralları ve Yasal Çerçeve',
    lastUpdated: 'Son Güncelleme: 13 Eylül 2026',
    sections: [
      {
        heading: '1. Taraflar ve Sözleşmenin Konusu',
        content: 'Bu Kullanım Koşulları, Naponi İnternet Alışveriş ve Mağazacılık İth. İhr. Ltd. Şti. ile platformu ziyaret eden veya kullanan kullanıcılar (İşletme, Çalışan, Müşteri ve Ziyaretçi) arasındaki hak ve yükümlülükleri düzenler.',
      },
      {
        heading: '2. Hizmetin Niteliği (Emanetsiz Bahşiş Arayüzü)',
        content: 'Naponi, yeme-içme ve konaklama sektöründe misafirlerin servis personeline gönüllü olarak bahşiş bırakmasını sağlayan bir teknoloji arayüzüdür. Naponi bir banka veya kredi kuruluşu değildir; kullanıcı fonlarını kendi hesaplarında mevduat olarak tutmaz. Bahşişler doğrudan anlaşmalı ödeme geçidi üzerinden ilgililere aktarılır.',
      },
      {
        heading: '3. Bahşişlerin Gönüllülüğü ve İade Şartları',
        content: 'Bahşiş ödemeleri tamamen müşterinin serbest iradesine dayalı, verilen hizmete teşekkür niteliğinde gönüllü ödemelerdir. Hatalı tutar çekimleri veya mükerrer işlemler durumunda, müşteriler 24 saat içinde info@naponi.com üzerinden başvuru yaparak inceleme talep edebilir.',
      },
      {
        heading: '4. Fikri Mülkiyet Hakları',
        content: 'Naponi markası, logosu, web sitesi tasarımı, katalogları, yazılım kodları ve QR şablonları Naponi İnternet Alışveriş ve Mağazacılık İth. İhr. Ltd. Şti.\'nin mülkiyetindedir. İzinsiz kopyalanamaz veya çoğaltılamaz.',
      },
      {
        heading: '5. Yetkili Mahkeme',
        content: 'Bu sözleşmeden doğabilecek her türlü uyuşmazlığın çözümünde Türk Hukuku uygulanacak olup İstanbul (Bakırköy) Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.',
      },
    ],
  },
  cookies: {
    title: 'Çerez (Cookie) Politikası',
    subtitle: 'Sitemizde Kullanılan Çerez Türleri ve Yönetimi',
    lastUpdated: 'Son Güncelleme: 13 Eylül 2026',
    sections: [
      {
        heading: '1. Çerez Nedir?',
        content: 'Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler sitenin verimli çalışmasını sağlar ve tercihlerinizi hatırlar.',
      },
      {
        heading: '2. Sitemizde Kullanılan Çerez Türleri',
        content: [
          'Zorunlu Çerezler: Web sitesinin temel fonksiyonlarının (dil tercihi, oturum yönetimi, güvenlik) çalışması için zorunlu olan çerezlerdir. Devre dışı bırakılamazlar.',
          'İşlevsel Çerezler: Seçtiğiniz dili (örn. Türkçe, English) ve karanlık mod tercihlerini hatırlamak için kullanılır.',
          'Analitik Çerezler: Google Analytics 4 (GA4) tarafından sayfa görüntüleme sayısı, oturum süresi ve ziyaretçi akışını anonim olarak ölçmek için kullanılır. IP adresiniz anonimleştirilerek işlenir.',
        ],
      },
      {
        heading: '3. Çerez Tercihlerinizi Nasıl Yönetebilirsiniz?',
        content: 'Tarayıcınızın ayarlarından (Chrome, Safari, Firefox vb.) çerezleri dilediğiniz an silebilir veya engelleyebilirsiniz. Ancak zorunlu çerezlerin engellenmesi durumunda sitenin bazı fonksiyonları düzgün çalışmayabilir.',
      },
    ],
  },
};

const legalEN: LegalBundle = {
  tabs: {
    kvkk: 'GDPR & Data Notice',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
  },
  closeBtn: 'Close',
  printBtn: 'Print / Save',
  companyInfo: {
    title: 'Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi',
    vkn: 'Tax ID: 6291105866',
    address: 'World Trade Center Bakirkoy, Istanbul, Turkiye',
    email: 'info@naponi.com',
  },
  kvkk: {
    title: 'Data Protection & GDPR / KVKK Notice',
    subtitle: 'Transparency and Governance of Personal Information',
    lastUpdated: 'Last Updated: September 13, 2026',
    sections: [
      {
        heading: '1. Data Controller Information',
        content: 'Under applicable data protection legislation (including GDPR and Turkish Law No. 6698 - KVKK), your personal data is processed by Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi ("Naponi") acting as the Data Controller under the terms outlined herein.',
      },
      {
        heading: '2. Data Collected & Collection Methods',
        content: [
          'For Venue Managers & Staff: Full name, corporate email address, phone number, designated IBAN/account number for payouts, venue location, and shift attendance data.',
          'For Tipping Guests: Transaction amount, designated server or table zone, optional rating/review text, IP address, and browser user-agent. (Note: Credit card details never touch or reside on Naponi servers).',
          'For Website Visitors: Anonymized IP addresses, cookie preferences, session duration, and analytical flow.',
        ],
      },
      {
        heading: '3. Legal Grounds and Processing Purposes',
        content: [
          'Performance of a contract (facilitating non-custodial tipping payouts and direct settlement).',
          'Compliance with statutory legal obligations (financial recording, accounting documentation, cyber security logging).',
          'Legitimate interests of the controller (fraud detection, preventing unauthorized charges, and system stability).',
        ],
      },
      {
        heading: '4. Third-Party Transfers & Data Safety',
        content: 'Data is strictly shared with certified payment infrastructure providers (Stripe, Iyzico, PayTR) and financial settlement institutions solely to execute transactions. Naponi does NOT sell, rent, or trade your personal data to advertisers.',
      },
      {
        heading: '5. Your Rights as a Data Subject',
        content: 'You retain the right to access, rectify, port, or erase your personal information, as well as restrict or object to certain processing activities. Requests may be lodged directly with our Data Protection Officer at info@naponi.com.',
      },
    ],
  },
  privacy: {
    title: 'Naponi Global Privacy Policy',
    subtitle: 'Zero-Escrow Architecture, Tokenization & Financial Privacy',
    lastUpdated: 'Last Updated: September 13, 2026',
    sections: [
      {
        heading: '1. Privacy Commitment',
        content: 'Naponi is committed to upholding international standards of data privacy and cryptographic security across all touchpoints, including our public landing pages, QR client portals, and administrative suites.',
      },
      {
        heading: '2. Cardholder Data Security (PCI-DSS Level 1)',
        content: 'Naponi implements a non-custodial architecture. We do not store, process, or transmit credit card numbers, expiration dates, or CVV codes on our own infrastructure. Payment sessions are encrypted via 256-bit SSL and tokenized directly by PCI-DSS Level 1 certified gateways.',
      },
      {
        heading: '3. Data Retention & Cryptographic Audit Trails',
        content: 'Administrative passwords are encrypted using one-way cryptographic hashes. All business agreements and statutory acceptances are sealed with immutable SHA-256 digital timestamps ensuring tamper-evident accountability.',
      },
      {
        heading: '4. Third-Party Analytics',
        content: 'We utilize Google Analytics 4 with mandatory IP anonymization enabled. No personally identifiable financial data is ever transmitted to analytics services.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service & Platform Rules',
    subtitle: 'Legal Agreement Governing the Use of Naponi Services',
    lastUpdated: 'Last Updated: September 13, 2026',
    sections: [
      {
        heading: '1. Parties and Scope',
        content: 'These Terms of Service constitute a legally binding agreement between Naponi and users (Venues, Staff, Guests, and Visitors) interacting with the platform.',
      },
      {
        heading: '2. Nature of Service (Non-Custodial)',
        content: 'Naponi provides a software interface facilitating direct, voluntary digital tipping from hospitality guests to frontline service staff. Naponi is not a bank, depository, or money transmitter. Customer funds bypass proprietary custody and transfer directly to authorized merchant or employee accounts.',
      },
      {
        heading: '3. Voluntary Gratuities & Refund Policies',
        content: 'Tips are discretionary expressions of guest appreciation. In cases of demonstrated technical duplication or unauthorized card use, refund inquiries must be submitted within 24 hours to info@naponi.com for gateway clearing review.',
      },
      {
        heading: '4. Intellectual Property',
        content: 'All trademarks, logos, visual assets, software code, QR layouts, and product catalogs belong exclusively to Naponi İnternet Alışveriş ve Mağazacılık İth. İhr. Ltd. Şti. and are protected under international copyright treaties.',
      },
      {
        heading: '5. Governing Law & Jurisdiction',
        content: 'These terms are governed by the laws of the Republic of Turkiye. The Courts and Execution Offices of Istanbul (Bakirkoy) shall have exclusive jurisdiction over any disputes.',
      },
    ],
  },
  cookies: {
    title: 'Global Cookie Policy',
    subtitle: 'Transparent Guidance on Tracking and Local Storage',
    lastUpdated: 'Last Updated: September 13, 2026',
    sections: [
      {
        heading: '1. What Are Cookies?',
        content: 'Cookies are small text files placed on your device to record preferences, maintain secure sessions, and optimize web performance.',
      },
      {
        heading: '2. Categories of Cookies Deployed',
        content: [
          'Essential Cookies: Necessary for fundamental operations such as active session persistence, language routing, and anti-tamper security tokens. Cannot be disabled.',
          'Functional Cookies: Remember your localized preferences such as preferred currency and language.',
          'Analytics Cookies: Anonymized Google Analytics 4 cookies measuring aggregated traffic patterns without identifying individual visitors.',
        ],
      },
      {
        heading: '3. Managing Cookie Preferences',
        content: 'You can modify or revoke cookie permissions anytime through your browser settings or via our in-app cookie preference tools. Disabling essential cookies may impact platform functionality.',
      },
    ],
  },
};

export function getLegalBundle(lang: string): LegalBundle {
  const normalized = (lang || 'en').toLowerCase().slice(0, 2);
  return normalized === 'tr' ? legalTR : legalEN;
}
