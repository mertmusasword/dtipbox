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
};
