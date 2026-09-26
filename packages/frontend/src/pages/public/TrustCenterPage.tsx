import React from 'react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Server,
  KeyRound,
  EyeOff,
  Scale,
  Award,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SeoHead } from '../../components/SeoHead';
import { useLanguage, LanguageSelector } from '../../i18n';
import '../../styles/home.css';

export const TrustCenterPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language !== 'tr';

  return (
    <div className="home-wrapper">
      <SeoHead
        title={
          isEn
            ? 'Trust & Security Center — Architecture, Compliance & Data Protection | Naponi'
            : 'Güvenlik ve Uyumluluk Merkezi — Mimari, KVKK ve Veri Koruması | Naponi'
        }
        description={
          isEn
            ? 'Explore Naponi’s non-custodial architecture, PCI-DSS Level 1 tokenized card processing, GDPR compliance, and SHA-256 cryptographic audit trails.'
            : 'Naponi emanetsiz (non-custodial) mimarisi, PCI-DSS Level 1 uyumlu tokenizasyon, KVKK/GDPR uyumu ve SHA-256 kriptografik denetim izleri hakkında detaylı bilgi edinin.'
        }
        canonicalUrl="https://www.naponi.com/trust"
        keywords={[
          'naponi trust center',
          'non-custodial tipping security',
          'pci dss level 1 digital tipping',
          'gdpr compliant qr tipping',
          'naponi security architecture',
        ]}
      />

      {/* Header Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="home-hero-section" style={{ paddingTop: '7rem', paddingBottom: '4.5rem' }}>
        <div className="home-container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '1.25rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
              {isEn ? 'Enterprise Trust & Security Architecture' : 'Kurumsal Güvenlik ve Uyumluluk Mimarisi'}
            </span>
          </div>

          <h1 className="home-hero-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', maxWidth: '900px', margin: '0.5rem auto 1.5rem', lineHeight: 1.15 }}>
            {isEn
              ? 'Engineered for Zero-Custody Security and Global Compliance'
              : 'Emanetsiz Güvenlik ve Küresel Standartlara Tam Uyum'}
          </h1>

          <p className="home-hero-desc" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', maxWidth: '800px', margin: '0 auto 2.5rem', color: '#94a3b8', lineHeight: 1.6 }}>
            {isEn
              ? 'Naponi separates guest engagement from fund custody. Tips settle directly into verified staff and merchant bank accounts, protected by bank-grade encryption and cryptographic audit trails.'
              : 'Naponi, misafir deneyimini fon emanetinden (custody) kesin olarak ayırır. Bahşişler doğrudan personele veya işletmeye aktarılır; banka düzeyinde şifreleme ve kriptografik denetim izleriyle korunur.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="home-btn-primary home-btn-hero-large">
              {isEn ? 'Create Verified Business Account' : 'Doğrulanmış İşletme Hesabı Aç'} <ArrowRight size={18} />
            </Link>
            <a href="mailto:security@naponi.com" className="home-btn-secondary">
              {isEn ? 'Contact Security Team' : 'Güvenlik Ekibine Ulaşın'}
            </a>
          </div>
        </div>
      </section>

      {/* Security Pillars Grid */}
      <section className="home-section" style={{ background: 'rgba(255, 255, 255, 0.015)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container">
          <div className="home-section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="home-section-tag">{isEn ? 'Security Tenets' : 'Temel İlkelerimiz'}</span>
            <h2 className="home-section-title" style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>
              {isEn ? 'The 6 Pillars of the Naponi Trust Model' : 'Naponi Güvenlik Modelinin 6 Temel Taşı'}
            </h2>
          </div>

          <div className="home-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {/* Pillar 1 */}
            <div className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <KeyRound size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                {isEn ? '1. Non-Custodial Architecture' : '1. Emanetsiz (Non-Custodial) Mimari'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {isEn
                  ? 'Naponi never holds customer or merchant balances in proprietary digital wallets. Funds settle directly into verified bank accounts or your selected payment provider, eliminating bankruptcy or insolvency escrow risks.'
                  : 'Naponi müşteri veya işletme bakiyelerini kendi havuzunda tutmaz. Fonlar doğrudan doğrulanmış banka hesaplarına aktarılır; iflas veya emanet riski sıfırdır.'}
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Lock size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                {isEn ? '2. PCI-DSS Level 1 Data Isolation' : '2. PCI-DSS Seviye 1 Veri İzolasyonu'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {isEn
                  ? 'Credit card PAN and CVV data never touches Naponi servers. All transactions utilize client-side tokenization routed directly to licensed payment gateways (Stripe, PayTR, Iyzico, Adyen).'
                  : 'Hassas kart numaraları ve CVV kodları asla Naponi sunucularından geçmez. Tüm ödemeler lisanslı ödeme kuruluşları üzerinden istemci tarafında şifreli tokenlar ile işlenir.'}
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Scale size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                {isEn ? '3. GDPR & KVKK Regulatory Compliance' : '3. GDPR, UK GDPR ve KVKK Uyumu'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {isEn
                  ? 'Built from day one to respect European GDPR (Regulation (EU) 2016/679) and Turkish KVKK Law No. 6698. Privacy by design, zero invasive trackers, and explicit granular consent.'
                  : 'Avrupa Genel Veri Koruma Tüzüğü (GDPR) ve 6698 sayılı KVKK ilkelerine tam uyumlu olarak tasarlanmıştır. Veri minimizasyonu esastır, gizli takipçi kullanılmaz.'}
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FileCheck2 size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                {isEn ? '4. SHA-256 Cryptographic Audit Trails' : '4. SHA-256 Kriptografik Denetim İzi'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {isEn
                  ? 'Merchant agreements and operational consents are locked using immutable SHA-256 cryptographic hashes, client IP stamps, and user agent timestamps serving as indisputable electronic evidence.'
                  : 'İşletme sözleşmeleri ve onaylar; SHA-256 kriptografik özeti, zaman damgası, IP adresi ve User-Agent bilgileriyle değiştirilemez elektronik delil olarak mühürlenir.'}
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Server size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                {isEn ? '5. 99.99% Global Cloud Infrastructure' : '5. %99.99 Kesintisiz Bulut Altyapısı'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {isEn
                  ? 'Redundant microservices, automated healthchecks, automated daily PostgreSQL backups, and Edge CDN caching ensure uninterrupted hospitality service round the clock.'
                  : 'Yedekli mikroservisler, otomatik sistem sağlığı denetimleri, günlük veritabanı yedekleri ve global CDN önbelleklemesi ile 7/24 kesintisiz operasyon sağlanır.'}
              </p>
            </div>

            {/* Pillar 6 */}
            <div className="home-feature-card" style={{ padding: '2rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <EyeOff size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
                {isEn ? '6. Anonymous & Private Guest Tipping' : '6. Anonim ve Gizli Misafir Deneyimi'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {isEn
                  ? 'Diners are never forced to register accounts or expose phone numbers to leave a tip. Apple Pay and Google Pay provide instant anonymous verification.'
                  : 'Misafirlerin bahşiş vermek için üye olması veya telefon numarası girmesi gerekmez. Apple Pay ve Google Pay ile tam gizlilik içinde temassız ödeme yapılır.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Legal Entity Credentials */}
      <section className="home-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="home-container" style={{ maxWidth: '850px' }}>
          <div style={{ padding: '2.5rem', borderRadius: '1.25rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEn ? 'Official Corporation & Legal Registry' : 'Resmi Şirket ve Hukuki Sicil Bilgileri'}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0.75rem 0 1.25rem' }}>
              Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', fontSize: '0.85rem' }}>{isEn ? 'Tax ID / VKN:' : 'Vergi Kimlik No:'}</strong>
                6291105866
              </div>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', fontSize: '0.85rem' }}>{isEn ? 'Registered Headquarters:' : 'Kayıtlı Merkez:'}</strong>
                Bakırköy Dünya Ticaret Merkezi, İstanbul / Türkiye
              </div>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', fontSize: '0.85rem' }}>{isEn ? 'Official Inquiries:' : 'Resmi İletişim:'}</strong>
                info@naponi.com
              </div>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', fontSize: '0.85rem' }}>{isEn ? 'Dispute Jurisdiction:' : 'Yetkili Yargı Mercii:'}</strong>
                {isEn ? 'Istanbul Courts & Enforcement Offices' : 'İstanbul (Çağlayan) Mahkemeleri'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="home-section" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="home-container" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            {isEn ? 'Experience Friction-Free, Non-Custodial Tipping' : 'Güvenli ve Emanetsiz Bahşiş Deneyimini Başlatın'}
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            {isEn
              ? 'Join premier hotels, restaurants, and hospitality groups choosing secure contactless guest engagement.'
              : 'Güvenli ve temassız misafir etkileşimini seçen seçkin restoran ve otellere katılın.'}
          </p>
          <Link to="/register" className="home-btn-primary home-btn-hero-large">
            {isEn ? 'Get Started Today' : 'Hemen Başlayın'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
