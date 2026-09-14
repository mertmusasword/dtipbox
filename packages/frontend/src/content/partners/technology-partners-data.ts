export interface PartnerVertical {
  id: string;
  iconName: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  badgeTr: string;
  badgeEn: string;
}

export interface PartnerAdvantage {
  id: string;
  iconName: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
}

export interface PartnerStep {
  step: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
}

export interface PartnerModel {
  id: string;
  iconName: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  tagTr?: string;
  tagEn?: string;
}

export const PARTNER_COMPANY_TYPES = [
  { value: 'POS', labelTr: 'POS Yazılımları', labelEn: 'POS Systems' },
  { value: 'QR_MENU', labelTr: 'QR Menü & Sipariş', labelEn: 'QR Menu & Ordering' },
  { value: 'PAYMENT', labelTr: 'Ödeme Teknolojileri', labelEn: 'Payment Technologies' },
  { value: 'RESTAURANT_MGMT', labelTr: 'Restoran Yönetimi', labelEn: 'Restaurant Management' },
  { value: 'HOTEL_TECH', labelTr: 'Otel Teknolojileri', labelEn: 'Hotel Technologies' },
  { value: 'KIOSK', labelTr: 'Kiosk / Self-Service', labelEn: 'Kiosk / Self-Service' },
  { value: 'CRM_LOYALTY', labelTr: 'CRM / Sadakat Platformu', labelEn: 'CRM / Loyalty Platform' },
  { value: 'OTHER', labelTr: 'Diğer B2B Teknoloji', labelEn: 'Other B2B Technology' },
];

export const PARTNER_CUSTOMER_COUNTS = [
  { value: '1-50', labelTr: '1 - 50 işletme', labelEn: '1 - 50 venues' },
  { value: '51-200', labelTr: '51 - 200 işletme', labelEn: '51 - 200 venues' },
  { value: '201-500', labelTr: '201 - 500 işletme', labelEn: '201 - 500 venues' },
  { value: '501-2000', labelTr: '501 - 2,000 işletme', labelEn: '501 - 2,000 venues' },
  { value: '2000+', labelTr: '2,000+ kurumsal işletme', labelEn: '2,000+ enterprise venues' },
];

export const PARTNER_VERTICALS: PartnerVertical[] = [
  {
    id: 'pos',
    iconName: 'Laptop',
    titleTr: 'POS Yazılımları',
    titleEn: 'POS Software',
    descTr: 'Restoran, kafe ve otel POS sistemleri.',
    descEn: 'Restaurant, cafe, and hospitality POS systems.',
    badgeTr: 'Yazarkasa & Masa',
    badgeEn: 'Cashier & Table',
  },
  {
    id: 'qr-menu',
    iconName: 'QrCode',
    titleTr: 'QR Menü ve Sipariş Platformları',
    titleEn: 'QR Menu & Ordering Platforms',
    descTr: 'QR menü, masadan sipariş ve dijital sipariş çözümleri.',
    descEn: 'QR menu, table ordering, and digital dining platforms.',
    badgeTr: 'Mobil Menü',
    badgeEn: 'Mobile Menu',
  },
  {
    id: 'payments',
    iconName: 'CreditCard',
    titleTr: 'Ödeme Teknolojileri',
    titleEn: 'Payment Technologies',
    descTr: 'Ödeme altyapıları, QR ödeme ve ödeme teknolojileri.',
    descEn: 'Payment gateways, QR payments, and fintech infrastructure.',
    badgeTr: 'Fintek & Ağ',
    badgeEn: 'Fintech & Gateway',
  },
  {
    id: 'restaurant-mgmt',
    iconName: 'LayoutGrid',
    titleTr: 'Restoran Yönetim Yazılımları',
    titleEn: 'Restaurant Management Software',
    descTr: 'Masa, personel, şube ve işletme yönetim platformları.',
    descEn: 'Floor, staff scheduling, branch, and venue operations.',
    badgeTr: 'Operasyon',
    badgeEn: 'Operations',
  },
  {
    id: 'hotel-tech',
    iconName: 'Building2',
    titleTr: 'Otel Teknolojileri',
    titleEn: 'Hotel Technologies',
    descTr: 'Otel, restoran ve room-service çözümleri.',
    descEn: 'PMS, hotel dining, concierge, and room-service systems.',
    badgeTr: 'Konaklama',
    badgeEn: 'Hospitality',
  },
  {
    id: 'kiosk',
    iconName: 'Monitor',
    titleTr: 'Kiosk / Self-Service',
    titleEn: 'Kiosk / Self-Service',
    descTr: 'Self-ordering kiosk, tablet ve benzeri sistemler.',
    descEn: 'Self-ordering kiosks, service tablets, and interactive screens.',
    badgeTr: 'Self Servis',
    badgeEn: 'Self Service',
  },
  {
    id: 'crm',
    iconName: 'Users',
    titleTr: 'CRM / Sadakat Platformları',
    titleEn: 'CRM / Loyalty Platforms',
    descTr: 'Müşteri sadakati, kampanya ve CRM çözümleri.',
    descEn: 'Customer retention, dining rewards, and CRM tools.',
    badgeTr: 'Sadakat & Bağlılık',
    badgeEn: 'Loyalty & Retention',
  },
  {
    id: 'b2b-tech',
    iconName: 'Cpu',
    titleTr: 'B2B Teknoloji Firmaları',
    titleEn: 'B2B Tech Companies',
    descTr: 'Restoran ve hizmet sektörüne teknoloji sağlayan diğer çözüm ortakları.',
    descEn: 'Other technology partners serving the food, beverage, and service sectors.',
    badgeTr: 'Ekosistem',
    badgeEn: 'Ecosystem',
  },
];

export const PARTNER_ADVANTAGES: PartnerAdvantage[] = [
  {
    id: 'digital-tipping',
    iconName: 'Coins',
    titleTr: 'DİJİTAL BAHŞİŞ',
    titleEn: 'DIGITAL TIPPING',
    descTr: 'Müşterilerinizin işletmelerinde kolay dijital bahşiş deneyimi sağlayın.',
    descEn: 'Deliver a seamless, contactless cashless tipping experience for your clients\' venues.',
  },
  {
    id: 'staff-management',
    iconName: 'UserCheck',
    titleTr: 'ÇALIŞAN BAHŞİŞ YÖNETİMİ',
    titleEn: 'STAFF TIP MANAGEMENT',
    descTr: 'Bahşişlerin çalışanlar ve ekipler arasında takip edilmesini sağlayın.',
    descEn: 'Enable fair, transparent tip pooling and individual staff tracking across shifts.',
  },
  {
    id: 'loyalty',
    iconName: 'HeartHandshake',
    titleTr: 'DİJİTAL SADAKAT',
    titleEn: 'DIGITAL LOYALTY',
    descTr: 'Müşterilerinizin kendi işletmelerinde QR tabanlı sadakat programları sunabilmesini sağlayın.',
    descEn: 'Empower your merchants to run QR-based loyalty and repeat-visit incentive programs.',
  },
  {
    id: 'multi-branch',
    iconName: 'Network',
    titleTr: 'ÇOKLU ŞUBE',
    titleEn: 'MULTI-BRANCH & FRANCHISE',
    descTr: 'Zincir işletmeler ve franchise yapıları için merkezi yapı.',
    descEn: 'Centralized reporting, branch oversight, and franchise role management.',
  },
  {
    id: 'global',
    iconName: 'Globe',
    titleTr: 'GLOBAL ALTYAPI',
    titleEn: 'GLOBAL INFRASTRUCTURE',
    descTr: 'Farklı ülke ve para birimlerine uygun global altyapı.',
    descEn: 'Multi-currency, international payment support ready for cross-border expansion.',
  },
  {
    id: 'integration',
    iconName: 'Workflow',
    titleTr: 'UYGUN ENTEGRASYON',
    titleEn: 'CUSTOM FIT INTEGRATION',
    descTr: 'Mevcut platformunuza uygun entegrasyon modeli birlikte oluşturulabilir.',
    descEn: 'Co-create the ideal integration workflow tailored to your platform architecture.',
  },
];

export const PARTNER_STEPS: PartnerStep[] = [
  {
    step: '01',
    titleTr: 'Partner başvurusu',
    titleEn: 'Partner application',
    descTr: 'Firma Naponi ile iletişime geçer.',
    descEn: 'Your team contacts Naponi with your platform scope.',
  },
  {
    step: '02',
    titleTr: 'İhtiyaç analizi',
    titleEn: 'Needs analysis',
    descTr: 'Mevcut platform, müşteri yapısı ve entegrasyon ihtiyacı değerlendirilir.',
    descEn: 'We analyze your current product stack, merchant base, and collaboration goals.',
  },
  {
    step: '03',
    titleTr: 'Entegrasyon',
    titleEn: 'Integration model',
    descTr: 'Uygun teknik ve ticari model birlikte belirlenir.',
    descEn: 'The technical connection and commercial partnership model are agreed upon.',
  },
  {
    step: '04',
    titleTr: 'Müşterilerinize sunun',
    titleEn: 'Deliver to your merchants',
    descTr: 'Naponi çözümleri partner firmanın müşterilerine sunulabilir.',
    descEn: 'Offer modern digital tipping and loyalty directly to your merchant portfolio.',
  },
];

export const PARTNER_MODELS: PartnerModel[] = [
  {
    id: 'integration-partner',
    iconName: 'Layers',
    titleTr: 'Entegrasyon Partneri',
    titleEn: 'Integration Partner',
    descTr: 'Naponi\'yi mevcut yazılımınızla entegre edin.',
    descEn: 'Connect Naponi directly with your existing POS or ordering system.',
    tagTr: 'Yazılım Ortaklığı',
    tagEn: 'Software Connect',
  },
  {
    id: 'solution-partner',
    iconName: 'Handshake',
    titleTr: 'Çözüm Ortağı',
    titleEn: 'Solution Partner',
    descTr: 'Naponi çözümlerini kendi müşterilerinize sunun.',
    descEn: 'Offer Naponi\'s standalone suite as a trusted value-add solution to your customer base.',
    tagTr: 'B2B Dağıtım',
    tagEn: 'B2B Distribution',
  },
  {
    id: 'custom-integration',
    iconName: 'Wrench',
    titleTr: 'Özel Entegrasyon',
    titleEn: 'Custom Integration',
    descTr: 'İhtiyacınıza göre özel teknik entegrasyon modeli geliştirelim.',
    descEn: 'Collaborative development for proprietary enterprise platforms and customized flows.',
    tagTr: 'Kurumsal Özel',
    tagEn: 'Enterprise Bespoke',
  },
  {
    id: 'white-label',
    iconName: 'Sparkles',
    titleTr: 'White-label',
    titleEn: 'White-label Option',
    descTr: 'Uygun projelerde Naponi altyapısının white-label olarak değerlendirilmesi.',
    descEn: 'White-label deployment of Naponi engine can be evaluated for qualifying projects.',
    tagTr: 'Uygun Projelerde',
    tagEn: 'For Selected Projects',
  },
];
