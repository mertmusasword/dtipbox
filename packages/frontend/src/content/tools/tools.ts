export interface ToolMeta {
  slug: string;
  name: string;
  badge: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
}

export const SEO_TOOLS: Record<string, ToolMeta> = {
  'tip-calculator': {
    slug: 'tip-calculator',
    name: 'Bahşiş Hesaplama Aracı',
    badge: 'Ücretsiz Online Araç',
    title: 'Bahşiş Hesaplayıcı: Hesap Tutarı ve Bahşiş Yüzdesi Hesaplama',
    description: 'Restoran ve kafelerde hesap tutarınıza göre standart veya özel bahşiş tutarını hesaplayın, kişi sayısına göre eşit paylaştırın.',
    metaTitle: 'Bahşiş Hesaplama Aracı (Online & Ücretsiz) — Naponi',
    metaDescription: 'Hesap tutarına göre ne kadar bahşiş bırakılacağını anında hesaplayın. %5, %10, %15, %20 seçenekleri ve kişi başı bölüşüm hesaplayıcı.',
    targetKeyword: 'bahşiş hesaplama',
    secondaryKeywords: ['tip hesaplama', 'bahşiş hesaplayıcı', 'restoranda ne kadar bahşiş verilir', 'bahşiş yüzdesi hesaplama'],
    canonicalUrl: 'https://www.naponi.com/tools/tip-calculator',
  },
  'tip-split-calculator': {
    slug: 'tip-split-calculator',
    name: 'Bahşiş Bölüştürme Aracı',
    badge: 'Personel & Havuz Aracı',
    title: 'Bahşiş Bölüştürme & Havuz Dağıtım Hesaplayıcısı',
    description: 'Vardiya sonunda veya gün bitiminde toplanan toplam bahşişi garson, barmen, komi ve mutfak personeli arasında adilce paylaştırın.',
    metaTitle: 'Bahşiş Bölüştürme & Havuz Hesaplama Aracı — Naponi',
    metaDescription: 'Restoran ve kafeler için bahşiş havuzu (tip pool) hesaplayıcı: Toplam bahşişi personel rollerine, saatlik çalışmaya veya kişi sayısına göre bölüştürün.',
    targetKeyword: 'bahşiş bölüştürme',
    secondaryKeywords: ['tip havuzu hesaplama', 'bahşiş dağıtma formülü', 'garson bahşiş bölüşümü', 'tip pool calculator'],
    canonicalUrl: 'https://www.naponi.com/tools/tip-split-calculator',
  },
  'restaurant-tip-pool-calculator': {
    slug: 'restaurant-tip-pool-calculator',
    name: 'Restoran Vardiya Bahşiş Havuzu & Bölüştürme Aracı',
    badge: 'F&B İşletme & Vardiya Aracı',
    title: 'Restoran Bahşiş Havuzu & Personel Vardiya Dağıtım Hesaplayıcısı',
    description: 'Vardiya saatleri, rol katsayıları (garson, mutfak, barmen, komi), nakit ve POS bahşişleri dahil adil dağıtım tablosu oluşturun, yazdırın veya Excel çıktısı alın.',
    metaTitle: 'Restoran Bahşiş Havuzu & Vardiya Dağıtım Hesaplayıcı (Excel/PDF) — Naponi',
    metaDescription: 'Restoran ve kafeler için vardiya bahşiş havuzu hesaplayıcı: Saatlik çalışma, rol puanları ve adil dağıtım formülüyle personel bahşişlerini hesaplayın, PDF/CSV raporu indirin.',
    targetKeyword: 'restoran bahşiş havuzu hesaplama',
    secondaryKeywords: ['vardiya bahşiş bölüşümü', 'bahşiş puan sistemi', 'garson mutfak bahşiş dağılımı', 'restaurant tip pool calculator'],
    canonicalUrl: 'https://www.naponi.com/tools/restaurant-tip-pool-calculator',
  },
  'free-hospitality-qr-generator': {
    slug: 'free-hospitality-qr-generator',
    name: 'Restoran & Kafe İçin Ücretsiz QR Kod Oluşturucu',
    badge: 'Ücretsiz Tasarım Aracı',
    title: 'Masa, Menü & Bahşiş İçin Ücretsiz Hospitality QR Kod Üretici',
    description: 'Restoran, kafe ve barlar için yüksek çözünürlüklü, logolu, masa numaralı ve baskıya hazır (PNG/SVG) QR kodlar tasarlayın ve ücretsiz indirin.',
    metaTitle: 'Restoran & Masa İçin Ücretsiz QR Kod Oluşturucu (Logolu & Baskıya Hazır) — Naponi',
    metaDescription: 'Restoranlar ve oteller için özel QR kod üretici: Masa numarası, logo ekleme, renk seçimi ve yüksek çözünürlüklü SVG/PNG indirme imkanıyla tamamen ücretsiz.',
    targetKeyword: 'restoran qr kod oluşturucu',
    secondaryKeywords: ['masa qr kod üretici', 'ücretsiz qr oluşturma', 'menü qr kod hazırlama', 'hospitality qr generator'],
    canonicalUrl: 'https://www.naponi.com/tools/free-hospitality-qr-generator',
  },
};

export const SEO_TOOLS_EN: Record<string, ToolMeta> = {
  'tip-calculator': {
    slug: 'tip-calculator',
    name: 'Online Tip Calculator',
    badge: 'Free Digital Tool',
    title: 'Free Online Tip & Bill Split Calculator',
    description: 'Calculate restaurant tips, bill percentages, and split totals equally among dining guests in seconds.',
    metaTitle: 'Free Online Tip Calculator & Bill Splitter — Naponi',
    metaDescription: 'Instantly calculate tip amounts and split restaurant bills among guests. Choose 10%, 15%, 18%, 20% or custom tip presets with multi-currency support.',
    targetKeyword: 'free online tip calculator',
    secondaryKeywords: ['bill split calculator', 'restaurant tip calculator', 'how much to tip', 'tip percentage calculator'],
    canonicalUrl: 'https://www.naponi.com/tools/tip-calculator',
  },
  'tip-split-calculator': {
    slug: 'tip-split-calculator',
    name: 'Restaurant Tip Pool & Split Calculator',
    badge: 'Hospitality Staff Tool',
    title: 'Restaurant Tip Pooling & Staff Split Calculator',
    description: 'Fairly distribute end-of-shift tip pools among servers, kitchen chefs, bussers, and bar mixologists by role or hours worked.',
    metaTitle: 'Restaurant Tip Pool & Staff Split Calculator — Naponi',
    metaDescription: 'Calculate fair hospitality tip pool distributions for restaurants, bars, and cafes. Split gratuities by server, kitchen, and bar role percentages.',
    targetKeyword: 'tip pool calculator',
    secondaryKeywords: ['restaurant tip split calculator', 'shift tip pool formula', 'server tip distribution', 'hospitality tip share tool'],
    canonicalUrl: 'https://www.naponi.com/tools/tip-split-calculator',
  },
  'restaurant-tip-pool-calculator': {
    slug: 'restaurant-tip-pool-calculator',
    name: 'Shift Tip Pool & Fair Staff Split Calculator',
    badge: 'F&B Operations Tool',
    title: 'Restaurant Shift Tip Pool & Fair Gratuity Distribution Calculator',
    description: 'Calculate fair tip pool splits by shift hours, role point weights (servers, kitchen, runners, bar), export clean CSV reports, and generate printable shift audit sheets.',
    metaTitle: 'Restaurant Shift Tip Pool Calculator (Printable & CSV) — Naponi',
    metaDescription: 'Free shift tip pool calculator for restaurants, cafes, and bars. Weight tip shares by role points and hours worked. Export shift sheets and audit reports.',
    targetKeyword: 'restaurant tip pool calculator',
    secondaryKeywords: ['shift tip pool calculator', 'server tip split excel', 'point based tip pool formula', 'hospitality tip distribution sheet'],
    canonicalUrl: 'https://www.naponi.com/tools/restaurant-tip-pool-calculator',
  },
  'free-hospitality-qr-generator': {
    slug: 'free-hospitality-qr-generator',
    name: 'Free Hospitality QR Code Generator',
    badge: 'Free Design Tool',
    title: 'Free Table, Menu & Tipping QR Code Generator for Hospitality',
    description: 'Create print-ready high-resolution QR codes with custom branding, table numbers, and logo integration for restaurants, cafes, bars, and hotels.',
    metaTitle: 'Free Hospitality QR Code Generator for Restaurants & Bars — Naponi',
    metaDescription: 'Design print-ready QR codes for restaurant tables, menus, and staff tipping. Add logos, table numbers, frame text, and download in vector SVG or high-res PNG.',
    targetKeyword: 'hospitality qr code generator',
    secondaryKeywords: ['restaurant table qr generator', 'free menu qr code creator', 'table tipping qr maker', 'vector qr generator'],
    canonicalUrl: 'https://www.naponi.com/tools/free-hospitality-qr-generator',
  },
};
