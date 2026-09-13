import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Download, 
  Printer, 
  Share2, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Coins, 
  BarChart3, 
  Building2, 
  Users, 
  Globe, 
  ArrowRight, 
  Coffee, 
  Utensils, 
  Hotel, 
  Wine, 
  CreditCard, 
  Clock, 
  Lock, 
  QrCode as QrIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../styles/catalog.css';

export const NaponiCatalogPage: React.FC = () => {
  const [demoQrUrl, setDemoQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Generate live interactive demo QR for Slide 10
    const liveDemoUrl = `${window.location.origin}/tools/free-hospitality-qr-generator`;
    QRCode.toDataURL(liveDemoUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setDemoQrUrl(url))
      .catch((err) => console.error('Catalog demo QR error:', err));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="catalog-wrapper">
      {/* Floating Action Toolbar */}
      <nav className="catalog-toolbar">
        <div className="catalog-toolbar-left">
          <Link to="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} />
            <span>Ana Sayfa</span>
          </Link>
          <div className="catalog-toolbar-title">
            <span>NAPONI B2B Kurumsal Ürün Kataloğu</span>
            <span className="catalog-toolbar-badge">2026 Sürümü • 10 Sayfa</span>
          </div>
        </div>

        <div className="catalog-toolbar-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleShare}>
            {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            <span>{copied ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>📄 PDF Olarak Kaydet / Yazdır</span>
          </button>
        </div>
      </nav>

      <main className="catalog-container">

        {/* ==================================================================
            SAYFA 1: KAPAK (COVER)
            ================================================================== */}
        <section className="catalog-slide cat-cover-slide" id="slide-1">
          <div className="cat-glow-top-right"></div>
          <div className="cat-glow-bottom-left"></div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <img src="/naponi-brand.svg" alt="NAPONI" style={{ height: '48px', width: 'auto' }} />
              <div className="cat-cover-badge">
                <Sparkles size={14} />
                <span>2026 B2B Kurumsal Ürün Kataloğu</span>
              </div>
            </div>

            <div style={{ maxWidth: '850px' }}>
              <h1 className="cat-cover-title">
                Yeme-İçme ve Konaklama Sektörü İçin <br />
                <span className="cat-gradient-text">Yeni Nesil Temassız Bahşiş Altyapısı</span>
              </h1>
              <p className="cat-cover-desc">
                Müşterilerin uygulama indirmeden 6 saniyede bahşiş bıraktığı; işletmelerin canlı vardiya havuzunu ve personel dökümlerini sıfır hata ile yönettiği akıllı finansal ekosistem.
              </p>
            </div>
          </div>

          <div>
            <div className="cat-cover-pills">
              <div className="cat-pill">
                <ShieldCheck size={16} color="#34d399" />
                <span>Emanet Para Tutulmaz (Non-Custodial)</span>
              </div>
              <div className="cat-pill">
                <Zap size={16} color="#38bdf8" />
                <span>Sıfır Donanım & POS Masrafı</span>
              </div>
              <div className="cat-pill">
                <Smartphone size={16} color="#f59e0b" />
                <span>6 Saniyede Kamera ile Ödeme</span>
              </div>
              <div className="cat-pill">
                <Globe size={16} color="#a78bfa" />
                <span>11 Dilde Turist Uyumluluğu</span>
              </div>
            </div>

            <div className="cat-slide-footer" style={{ marginTop: '2rem', borderTopColor: 'rgba(255,255,255,0.08)' }}>
              <span>NAPONI TECHNOLOGIES INC. • GİZLİ VE TİCARİDİR</span>
              <span>www.naponi.com • Sayfa 01 / 10</span>
            </div>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 2: SEKTÖRDEKİ SESSİZ KRİZ (PROBLEM)
            ================================================================== */}
        <section className="catalog-slide" id="slide-2">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Sektörel Gerçekler</span>
              <h2 className="cat-slide-title">Geleneksel Bahşiş Modeli Neden Çöktü?</h2>
              <p className="cat-slide-subtitle">Nakit paranın kaybolması, servis personelinin motivasyonunu düşürürken işletmecilere operasyonel kaos yaşatıyor.</p>
            </div>
            <span className="cat-slide-number">02 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-2">
              <div className="cat-compare-box bad">
                <div className="cat-compare-header" style={{ color: '#f43f5e' }}>
                  <span>Eski Dünyanın 4 Büyük Çıkmazı</span>
                  <span>⚠️</span>
                </div>
                <ul className="cat-compare-list">
                  <li className="cat-compare-item">
                    <strong style={{ color: '#ffffff' }}>1. Nakit Para Neredeyse Bitti:</strong> Müşterilerin %82'si artık yanında bozuk veya nakit para taşımıyor. Bahşiş bırakmak isteseler dahi vazgeçiyorlar.
                  </li>
                  <li className="cat-compare-item">
                    <strong style={{ color: '#ffffff' }}>2. POS Cihazı Baskısı ve Utancı:</strong> Masada veya kasada POS cihazından bahşiş istemek garson için utandırıcı, müşteri için baskı hissi yaratan kaba bir deneyim.
                  </li>
                  <li className="cat-compare-item">
                    <strong style={{ color: '#ffffff' }}>3. Hantal Mobil Uygulamalar:</strong> Bir restoran için kimse 85MB boyutunda yabancı bir uygulama indirip üyelik ve kart formu doldurmaz (%95 terk oranı).
                  </li>
                  <li className="cat-compare-item">
                    <strong style={{ color: '#ffffff' }}>4. Gece Yarısı Excel Muhasebesi:</strong> Kapanışta bahşiş havuzunu bölüştürmek saatler alıyor; adaletsizlik şüpheleri personel kaybına ve huzursuzluğa yol açıyor.
                  </li>
                </ul>
              </div>

              <div className="cat-compare-box good">
                <div className="cat-compare-header" style={{ color: '#34d399' }}>
                  <span>İşletmenizin Kaybettiği Rakamlar</span>
                  <span>📉</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f43f5e' }}>-%42</div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Müşteride nakit olmaması nedeniyle personelin her ay kaçırdığı net bahşiş geliri.</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>35 Dk / Gün</div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Vardiya müdürünün her gün kapanışta bahşiş hesaplamaya ve dağıtmaya harcadığı gereksiz mesai.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI B2B ÇÖZÜMLERİ • PROBLEM VE PAZAR ANALİZİ</span>
            <span>Sayfa 02 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 3: NAPONI DENEYİMİ (ÇÖZÜM)
            ================================================================== */}
        <section className="catalog-slide" id="slide-3">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Sıfır Sürtünme Çözümü</span>
              <h2 className="cat-slide-title">6 Saniyede Bahşiş: Uygulama Yok, Şifre Yok</h2>
              <p className="cat-slide-subtitle">Kullanıcı alışkanlıklarını zorlamayan, doğrudan telefon kamerasından çalışan dünyanın en hızlı bahşiş akışı.</p>
            </div>
            <span className="cat-slide-number">03 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-step-row">
              <div className="cat-step-card">
                <div className="cat-step-number">01</div>
                <div className="cat-card-icon">
                  <Smartphone size={22} />
                </div>
                <div className="cat-card-title">1. Kamerayı Aç & Tara</div>
                <div className="cat-card-desc">
                  Müşteri masadaki şık QR kodu veya garson rozetini telefonunun kamerasıyla okutur. Web arayüzü 0.8 saniyede anında açılır.
                </div>
              </div>

              <div className="cat-step-card">
                <div className="cat-step-number">02</div>
                <div className="cat-card-icon blue">
                  <Users size={22} />
                </div>
                <div className="cat-card-title">2. Personeli & Tutarı Seç</div>
                <div className="cat-card-desc">
                  Masaya bakan garsonun adını/fotoğrafını veya ortak havuzu seçer. Tek dokunuşla hazır tutarlardan birine tıklar.
                </div>
              </div>

              <div className="cat-step-card">
                <div className="cat-step-number">03</div>
                <div className="cat-card-icon amber">
                  <Zap size={22} />
                </div>
                <div className="cat-card-title">3. 1 Tıkla Öde & Bitir</div>
                <div className="cat-card-desc">
                  Apple Pay, Google Pay veya kredi kartıyla parmak izi/yüz tanıma ile saniyeler içinde öder. Doğrudan hesaba geçer.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Check size={20} color="#34d399" />
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>
                  Sonuç: Müşterilerin %96'sı akışı terk etmeden bahşiş işlemini başarıyla tamamlar.
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 800 }}>Ortalama Süre: 6.2 Saniye</span>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI MÜŞTERİ DENEYİMİ MİMARİSİ</span>
            <span>Sayfa 03 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 4: FİZİKSEL DOKUNUŞLAR & MASA STANDLARI
            ================================================================== */}
        <section className="catalog-slide" id="slide-4">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Mekan Estetiği</span>
              <h2 className="cat-slide-title">Mekânınızın Prestijine Yakışan Dokunuşlar</h2>
              <p className="cat-slide-subtitle">Sıradan kağıt çıktılar değil; restoran ve otelinizin mimarisine özel yüksek kaliteli fiziksel temas noktaları.</p>
            </div>
            <span className="cat-slide-number">04 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-3">
              <div className="cat-feature-card">
                <div style={{ background: '#0b111e', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '48px', height: '64px', margin: '0 auto 0.5rem', background: 'rgba(255,255,255,0.06)', border: '2px solid #34d399', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrIcon size={28} color="#34d399" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Akrilik Masa Standı</span>
                </div>
                <div className="cat-card-title">Akrilik Pleksi & Ahşap Standlar</div>
                <div className="cat-card-desc">
                  Masa numaralarına özel üretilen, suya ve güneş ışığına dayanıklı, çizilmez lüks masaüstü blokları.
                </div>
              </div>

              <div className="cat-feature-card">
                <div style={{ background: '#0b111e', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '80px', height: '48px', margin: '0 auto 0.5rem', background: 'rgba(255,255,255,0.06)', border: '2px solid #38bdf8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrIcon size={24} color="#38bdf8" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Manyetik Yaka Rozeti</span>
                </div>
                <div className="cat-card-title">Akıllı Garson & Vale Rozetleri</div>
                <div className="cat-card-desc">
                  Barmen, vale ve hareket halindeki servis ekibi için kıyafete zarar vermeyen manyetik ve şık QR rozetler.
                </div>
              </div>

              <div className="cat-feature-card">
                <div style={{ background: '#0b111e', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '56px', height: '64px', margin: '0 auto 0.5rem', background: 'rgba(255,255,255,0.06)', border: '2px solid #f59e0b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrIcon size={28} color="#f59e0b" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Adisyon İçi Kart</span>
                </div>
                <div className="cat-card-title">Adisyon Deri Folyo Kartları</div>
                <div className="cat-card-desc">
                  Hesap sümeninin içine yerleştirilen kartlar sayesinde müşteri hesabı incelerken konforlu ve özel bir şekilde bahşiş bırakır.
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI TOUCHPOINT EKİPMANLARI • 300 DPI VEKTÖREL BASKI UYUMLU</span>
            <span>Sayfa 04 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 5: İŞLETME & YÖNETİCİ PANELİ (OPERASYONEL GÜÇ)
            ================================================================== */}
        <section className="catalog-slide" id="slide-5">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Yönetici Paneli</span>
              <h2 className="cat-slide-title">Tam Görünürlük. Sıfır Gece Yarısı Hesabı.</h2>
              <p className="cat-slide-subtitle">Vardiya sonlarında yaşanan gerginlikleri tarihe gömen şeffaf, otomatik ve gerçek zamanlı yönetim merkezi.</p>
            </div>
            <span className="cat-slide-number">05 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-mockup-window">
              <div className="cat-mockup-topbar">
                <span className="cat-dot r"></span>
                <span className="cat-dot y"></span>
                <span className="cat-dot g"></span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 600 }}>
                  naponi.com/portal/dashboard • The Grand Bistro & Lounge
                </span>
              </div>

              <div className="cat-mockup-body">
                <div className="cat-kpi-row">
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#34d399' }}>₺14.850,00</div>
                    <div className="cat-kpi-label">Bugünkü Toplam Bahşiş</div>
                  </div>
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#38bdf8' }}>%16.4</div>
                    <div className="cat-kpi-label">Ortalama Bahşiş Oranı</div>
                  </div>
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#f59e0b' }}>12 Personel</div>
                    <div className="cat-kpi-label">Aktif Vardiya Ekibi</div>
                  </div>
                  <div className="cat-kpi-cell">
                    <div className="cat-kpi-val" style={{ color: '#a78bfa' }}>4.9 / 5.0</div>
                    <div className="cat-kpi-label">Misafir Memnuniyet Puanı</div>
                  </div>
                </div>

                <div className="cat-grid-2" style={{ gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <Clock size={13} color="#38bdf8" /> Canlı Bahşiş Akışı (Gerçek Zamanlı)
                    </strong>
                    <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
                      Masa 14 (Ahmet K.) ➔ ₺150 Apple Pay (2 dk önce)<br />
                      Masa 08 (Selin M.) ➔ ₺250 Kredi Kartı (5 dk önce)<br />
                      Bar Alanı (Ortak Havuz) ➔ ₺100 Google Pay (8 dk önce)
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                    <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <Coins size={13} color="#34d399" /> Otomatik Vardiya Havuzu & Dağıtım
                    </strong>
                    <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
                      Personelin sisteme girdiği çalışma saatlerine ve pozisyon puanına (Garson: 1.0, Mutfak: 0.5) göre bahşişler gece otomatik dağıtılır.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI YÖNETİCİ VE MUHASEBE PANELİ (WEB TABANLI)</span>
            <span>Sayfa 05 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 6: SEKTOREL ÇÖZÜMLER
            ================================================================== */}
        <section className="catalog-slide" id="slide-6">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Çok Yönlü Uyumluluk</span>
              <h2 className="cat-slide-title">Hizmet Sektörünün Her Alanına Uygun</h2>
              <p className="cat-slide-subtitle">Tek bir kafeden çok şubeli lüks otel zincirlerine kadar esnek operasyonel yapı.</p>
            </div>
            <span className="cat-slide-number">06 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-4">
              <div className="cat-feature-card">
                <div className="cat-card-icon">
                  <Utensils size={20} />
                </div>
                <div className="cat-card-title">Restoranlar</div>
                <div className="cat-card-desc">
                  Masa bazlı QR kodlar, garsona özel bahşiş atama veya mutfak-salon ortak havuzlama.
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon blue">
                  <Coffee size={20} />
                </div>
                <div className="cat-card-title">Kafeler & Fırınlar</div>
                <div className="cat-card-desc">
                  Kasa önü hızlı tarama; barista kahveyi hazırlarken müşteri saniyeler içinde teşekkür eder.
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon amber">
                  <Hotel size={20} />
                </div>
                <div className="cat-card-title">Oteller & Tatil Köyü</div>
                <div className="cat-card-desc">
                  Kat hizmetleri, bellboy, oda servisi ve resepsiyon için oda anahtarlığı veya oda içi QR.
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon red">
                  <Wine size={20} />
                </div>
                <div className="cat-card-title">Bar & Gece Hayatı</div>
                <div className="cat-card-desc">
                  Karanlık ve kalabalık ortamlarda bile anında okunan yüksek kontrastlı QR bardak altlıkları.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Kuaförler, Spa, Vale & Özel Taşımacılık:</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Bireysel hizmet veren tüm uzmanlar için kişisel QR kartvizit desteği.</span>
              </div>
              <span className="catalog-toolbar-badge">Tüm Sektörler</span>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI ENDÜSTRİYEL KULLANIM ALANLARI</span>
            <span>Sayfa 06 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 7: FİNANSAL MİMARİ & GÜVENLİK
            ================================================================== */}
        <section className="catalog-slide" id="slide-7">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Güvenlik ve Uyum</span>
              <h2 className="cat-slide-title">Sıfır Emanet. Doğrudan Banka Takası.</h2>
              <p className="cat-slide-subtitle">İşletmenizin ve müşterilerinizin finansal güvenliğini garanti altına alan non-custodial fintech altyapısı.</p>
            </div>
            <span className="cat-slide-number">07 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-3">
              <div className="cat-feature-card">
                <div className="cat-card-icon">
                  <ShieldCheck size={22} />
                </div>
                <div className="cat-card-title">Emanet Para Tutulmaz (Non-Custodial)</div>
                <div className="cat-card-desc">
                  Naponi bir aracı cüzdan değildir; paranızı kendi hesaplarında tutmaz veya bloke koymaz. Fonlar doğrudan işletmenizin anlaşmalı banka hesabına aktarılır.
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon blue">
                  <Lock size={22} />
                </div>
                <div className="cat-card-title">PCI-DSS Seviye 1 Güvenlik</div>
                <div className="cat-card-desc">
                  Müşterinin kart bilgileri asla Naponi sunucularına temas etmez. Tüm işlemler uluslararası lisanslı ödeme geçitleri üzerinden 256-bit SSL ile tokenize edilir.
                </div>
              </div>

              <div className="cat-feature-card">
                <div className="cat-card-icon amber">
                  <CreditCard size={22} />
                </div>
                <div className="cat-card-title">Şeffaf Muhasebe & Vergi Uyumu</div>
                <div className="cat-card-desc">
                  Yasal mevzuata uygun gelir dökümleri, stopaj/vergi hesaplamaları ve muhasebe programlarına entegre edilebilir Excel/PDF dışa aktarım desteği.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={20} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                <strong>İşletme Patronları İçin Güvence:</strong> Nakit bahşişlerde yaşanan kasa açıkları, eksik para veya elden ele geçerken kaybolma riskleri dijital dekontlama sayesinde tamamen sıfırlanır.
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI FİNANSAL GÜVENLİK PROTOKOLÜ</span>
            <span>Sayfa 07 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 8: KÜRESEL UYUM & YABANCI TURİST TRAFİĞİ
            ================================================================== */}
        <section className="catalog-slide" id="slide-8">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Uluslararası Misafirler</span>
              <h2 className="cat-slide-title">Yabancı Turistlerden Maksimum Bahşiş Geliri</h2>
              <p className="cat-slide-subtitle">Kendi ülkesinde bahşiş vermeye alışkın turistlerin dil ve kur bariyerini tamamen ortadan kaldırıyoruz.</p>
            </div>
            <span className="cat-slide-number">08 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-grid-2">
              <div className="cat-feature-card" style={{ height: '100%', justifyContent: 'center' }}>
                <div className="cat-card-icon">
                  <Globe size={22} />
                </div>
                <div className="cat-card-title">11 Dilde Otomatik Arayüz</div>
                <div className="cat-card-desc" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Turist telefonunun kamerasını açtığında, tarayıcısının dili neyse sayfa o dilde karşılar:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['🇹🇷 Türkçe', '🇺🇸 English', '🇩🇪 Deutsch', '🇷🇺 Русский', '🇫🇷 Français', '🇪🇸 Español', '🇸🇦 العربية', '🇨🇳 中文', '🇯🇵 日本語'].map((lang, idx) => (
                    <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cat-feature-card" style={{ height: '100%', justifyContent: 'center' }}>
                <div className="cat-card-icon blue">
                  <Coins size={22} />
                </div>
                <div className="cat-card-title">Kendi Para Birimiyle Rahat Ödeme</div>
                <div className="cat-card-desc" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Turistler Türk Lirası hesabına girmeden kendi bildikleri para birimlerinde rahatça bahşiş bırakırlar. İşletme kendi para birimiyle tahsil eder.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>Apple / Google Pay</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Yabancı kartlarda %100 uyum</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>USD, EUR, GBP</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Uluslararası kart kabulü</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI GLOBAL TOURISM INFRASTRUCTURE</span>
            <span>Sayfa 08 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 9: 3 ADIMDA CANLIYA GEÇİŞ (ONBOARDING)
            ================================================================== */}
        <section className="catalog-slide" id="slide-9">
          <div className="cat-slide-header">
            <div>
              <span className="cat-slide-tag">Hızlı Kurulum</span>
              <h2 className="cat-slide-title">2 Dakikada Başlayın. Sıfır Risk, Sıfır Cihaz.</h2>
              <p className="cat-slide-subtitle">Haftalarca süren bürokrasi veya POS cihaz kiralama masrafları yok. Bugün kaydolun, bu akşam bahşiş almaya başlayın.</p>
            </div>
            <span className="cat-slide-number">09 / 10</span>
          </div>

          <div className="cat-slide-content">
            <div className="cat-step-row">
              <div className="cat-step-card" style={{ borderTop: '3px solid #34d399' }}>
                <div className="cat-step-number" style={{ color: '#34d399' }}>1</div>
                <div className="cat-card-title">Ücretsiz Kayıt Olun</div>
                <div className="cat-card-desc">
                  İşletme bilgilerinizi ve ödemelerin yatacağı banka hesabınızı (IBAN) 2 dakikada sisteme girin.
                </div>
              </div>

              <div className="cat-step-card" style={{ borderTop: '3px solid #38bdf8' }}>
                <div className="cat-step-number" style={{ color: '#38bdf8' }}>2</div>
                <div className="cat-card-title">Masaları & Ekibi Ekleyin</div>
                <div className="cat-card-desc">
                  Panelden salon masalarınızı ve garsonlarınızı kaydedin. Renk temanıza uygun yüksek çözünürlüklü QR kodlarınızı anında indirin.
                </div>
              </div>

              <div className="cat-step-card" style={{ borderTop: '3px solid #f59e0b' }}>
                <div className="cat-step-number" style={{ color: '#f59e0b' }}>3</div>
                <div className="cat-card-title">Masalara Koyun & Başlayın</div>
                <div className="cat-card-desc">
                  Akrilik standlarınızı veya adisyon kartlarınızı masalara yerleştirin. İlk günden bahşiş gelirlerinizin artışını canlı panelden izleyin.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem' }}>₺0 Başlangıç Ücreti</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gizli masraf veya kurulum bedeli yok</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>Sıfır Taahhüt</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İstediğiniz an sistemi durdurabilirsiniz</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>7/24 Teknik Destek</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İşletmenize özel kurumsal müşteri temsilcisi</div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer">
            <span>NAPONI ENTEGRASYON VE ONBOARDING AKIŞI</span>
            <span>Sayfa 09 / 10</span>
          </div>
        </section>


        {/* ==================================================================
            SAYFA 10: ARKA KAPAK & CANLI İNTERAKTİF DEMO
            ================================================================== */}
        <section className="catalog-slide cat-cover-slide" id="slide-10" style={{ background: '#090d16' }}>
          <div className="cat-slide-header" style={{ marginBottom: 0 }}>
            <img src="/naponi-brand.svg" alt="NAPONI" style={{ height: '40px', width: 'auto' }} />
            <span className="cat-slide-number">10 / 10</span>
          </div>

          <div className="cat-backcover">
            <div>
              <span className="cat-slide-tag" style={{ color: '#38bdf8' }}>Deneyimi Test Edin</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.5rem 0 1rem' }}>
                Müşterilerinizin Yaşayacağı Deneyimi <br />
                <span className="cat-gradient-text">Hemen Şimdi Yaşayın.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '520px', marginBottom: '1.75rem' }}>
                Telefonunuzun kamerasını açın ve yandaki canlı demo QR kodunu okutun. Naponi'nin hızını ve şıklığını doğrudan kendi telefonunuzda test edin.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#94a3b8' }}>
                <div>🌐 <strong>Web:</strong> <span style={{ color: '#ffffff' }}>www.naponi.com</span></div>
                <div>✉️ <strong>Kurumsal E-Posta:</strong> <span style={{ color: '#ffffff' }}>info@naponi.com</span></div>
                <div>💬 <strong>WhatsApp İşletme Hattı:</strong> <span style={{ color: '#ffffff' }}>+90 (555) 000 00 00</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="cat-qr-badge-card">
                <div className="cat-qr-badge-title">CANLI DEMO QR</div>
                <div className="cat-qr-badge-sub">Telefon kameranızla okutun</div>
                {demoQrUrl ? (
                  <img 
                    src={demoQrUrl} 
                    alt="Canlı Demo QR Kodu" 
                    style={{ width: '210px', height: '210px', display: 'block', margin: '0 auto' }} 
                  />
                ) : (
                  <div style={{ width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Yükleniyor...
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', marginTop: '0.75rem' }}>
                  6 SANİYEDE TEMASSIZ BAHŞİŞ
                </div>
              </div>
            </div>
          </div>

          <div className="cat-slide-footer" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>
            <span>© 2026 NAPONI TECHNOLOGIES INC. • HER HAKKI SAKLIDIR.</span>
            <span>Sayfa 10 / 10 • Son</span>
          </div>
        </section>

      </main>
    </div>
  );
};
