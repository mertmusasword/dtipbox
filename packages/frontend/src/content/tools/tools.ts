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
