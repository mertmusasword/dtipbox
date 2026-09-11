# Walkthrough: Naponi İşletme Hizmet ve Kullanım Sözleşmesi & Dijital Onay Sistemi

Naponi platformu için işletmeler ile Naponi arasındaki çerçeve hukuki ilişkiyi düzenleyen, 20 maddelik profesyonel **"Naponi İşletme Hizmet ve Kullanım Sözleşmesi"** ve kriptografik (SHA-256) ispat zincirine sahip **Dijital Onay ve Denetim Sistemi** uçtan uca tamamlanmış, test edilmiş ve production'a aktarılmıştır.

---

## 1. Hukuki Mimari ve Sözleşme İçeriği (20 Madde)

Dosya: [merchantAgreementText.ts](file:///c:/Users/Mert%20K%C4%B1l%C4%B1%C3%A7/Desktop/PROJELER/d-tipbox/packages/backend/src/templates/merchantAgreementText.ts)

Sözleşme metni, Türkiye'deki emredici mevzuata (6098 s. TBK, 6100 s. HMK, 6493 s. Kanun ve 6698 s. KVKK) tam uyumlu olarak 20 ana başlık altında kaleme alınmıştır:

1. **Taraflar ve Tanımlar:** Dinamik alanlar (`{{NAPONI_LEGAL_NAME}}`, `{{BUSINESS_NAME}}`, `{{BUSINESS_ADDRESS}}`, `{{BUSINESS_TAX_ID}}`, `{{AUTHORIZED_PERSON}}`). Tanımlar: Naponi, İşletme, Müşteri, ÖHS/POS Provider, Bahşiş, Platform, QR Kod.
2. **Hizmetin Kapsamı ve Hukuki Niteliği:** Naponi'nin bir teknoloji altyapısı ve yazılım aracısı olduğu; 6493 sayılı Kanun kapsamında doğrudan lisanslı bir ödeme kuruluşu veya banka **olmadığı**, fon tutmadığı açıkça belirlenmiştir.
3. **İşletmenin Yükümlülükleri:** Bilgi doğruluğu, QR güvenliği, personel rızaları, bahşişlerin vergisel ve muhasebesel sorumluluğunun işletmeye ait olduğu, müşterileri yanıltıcı zorlamalardan kaçınma.
4. **Bahşiş ve Ödeme İşlemleri:** Bahşişin gönüllülük esası, mutabakat süreçleri, chargeback (ters ibraz) ve itiraz prosedürleri.
5. **Ücretler ve Ödemeler:** Şeffaf ücretlendirme modeli (`{{COMMISSION_RATE}}` - MVP için %0), banka ve ÖHS komisyonlarının Naponi ücretinden bağımsızlığı, 30 gün önceden bildirim kuralı.
6. **POS ve Ödeme Sağlayıcıları Entegrasyonu:** İşletmenin kendi POS'unu veya Naponi katalog sağlayıcılarını kullanabilmesi, PCI-DSS veri izolasyonu (Naponi personelinin hassas kart verilerine erişememesi).
7. **QR Kod Sistemi:** Dinamik ve statik QR kod tahsisi, suistimal ve sahte QR şüphesinde güvenlik amaçlı pasifleştirme hakkı.
8. **Hesap Güvenliği:** Hesap bilgileri ve şifrelerin işletme sorumluluğunda olması, şüpheli işlemlerde geçici güvenlik dondurması.
9. **Yasaklı Kullanım:** Dolandırıcılık, kara para aklama (5549 s. Kanun), yasa dışı bahis, sahte bahşiş döngüleri, sisteme yetkisiz müdahale.
10. **Askıya Alma ve Fesih:** Ölçülü, gerekçeli ve hukuka uygun derhal fesih/askıya alma koşulları.
11. **Fikri Mülkiyet:** Marka, yazılım, veritabanı, tasarım ve logoların Naponi'ye ait olduğu; işletmeye sınırlı kullanım lisansı verildiği.
12. **Gizlilik ve Ticari Sır:** Karşılıklı gizli bilgilerin korunması ve 3 yıllık devamlılık hükmü.
13. **Kişisel Verilerin Korunması (KVKK):** **Önemli Ayrım:** Genel sözleşme içine gereksiz ve hukuken sakat bir açık rıza gömülmemiştir. Veri işlemenin hukuki dayanakları (KVKK m. 5/2-c, 5/2-ç, 5/2-f) belirtilmiş, **KVKK Aydınlatma Metni**'nin ayrı bir hukuki belge olduğu ve açık rızanın gerektiğinde ayrıca temin edileceği düzenlenmiştir.
14. **Veri Güvenliği:** KVKK ve Kurul rehberlerine uygun teknik ve idari güvenlik tedbirleri, ihlal bildirim prosedürü.
15. **Kayıtlar ve Elektronik Delil Sözleşmesi:** 6100 sayılı HMK m. 193 uyarınca; sunucu logları, zaman damgası, IP adresi, User-Agent ve sözleşme metninin SHA-256 kriptografik hash'i kesin ve bağlayıcı delil olarak kabul edilmiştir.
16. **Sözleşme Değişiklikleri ve Versiyonlama:** Versiyon numaralandırması, yürürlük tarihi, eski versiyonların silinmeden arşivlenmesi, esaslı değişikliklerde yeniden onay talep mekanizması.
17. **Mücbir Sebepler:** Tarafların makul kontrolü dışındaki durumlar, askıya alma ve 30 gün sonrası fesih hakkı.
18. **Sorumluluğun Sınırlandırılması:** TBK m. 115'e uygun, ağır kusur ve kast harici makul sorumluluk sınırları.
19. **Uygulanacak Hukuk ve Yetki:** Türkiye Cumhuriyeti Hukuku, İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkisi.
20. **Genel Hükümler:** Bütünlük, bölünebilirlik, devir yasağı, bildirimler ve dijital onay anında yürürlüğe girme.

---

## 2. Veritabanı Değişiklikleri (Prisma)

Dosya: [schema.prisma](file:///c:/Users/Mert%20K%C4%B1l%C4%B1%C3%A7/Desktop/PROJELER/d-tipbox/packages/backend/prisma/schema.prisma)

Üç yeni model ve iki enum eklenmiş, `User` ve `Business` modelleriyle ilişkilendirilmiştir:

* `Agreement`: Ana sözleşme türü kaydı (`code: 'MERCHANT_SERVICE_AGREEMENT'`).
* `AgreementVersion`: Her bir sözleşme revizyonu (`version: '1.0.0'`, `status: PUBLISHED | DRAFT | ARCHIVED`, `content_markdown`, `content_hash: SHA-256`, `requires_reacceptance`, `published_at`).
* `AgreementAcceptance`: İşletme tarafından verilen dijital onayın **değiştirilemez (immutable)** audit kaydı (`business_id`, `user_id`, `accepted_at`, `ip_address`, `user_agent`, `content_hash`, `snapshot_html`, `statement: "Okudum ve Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni kabul ediyorum."`).

---

## 3. Dijital Onay Akışı ve Güvenlik Mekanizması

1. **Önceden Seçili Olmayan Checkbox:** Checkbox varsayılan olarak `false` gelir.
2. **Zorunlu İrade Beyanı:** Onay metni: `"Okudum ve Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni kabul ediyorum."` harfiyen eşleşmeden backend onayı kabul etmez.
3. **Metin İnceleme ve Kaydırma Takibi:** Arayüzde sözleşme metnini sonuna kadar incelemeyen veya onay kutusunu işaretlemeyen kullanıcılarda onay butonu kilitlidir.
4. **Elektronik İspat Makbuzu (Verification Receipt):** Onay verildikten hemen sonra kullanıcıya onay zamanı, IP adresi, User-Agent ve hesaplanan SHA-256 belge özeti ekranda doğrulanabilir makbuz olarak sunulur.
5. **Onboarding Koruma Middleware'i:** [agreement.middleware.ts](file:///c:/Users/Mert%20K%C4%B1l%C4%B1%C3%A7/Desktop/PROJELER/d-tipbox/packages/backend/src/middleware/agreement.middleware.ts) ile sözleşmeyi onaylamayan işletmelerin canlı QR üretmesi veya ödeme hesabı tanımlaması HTTP 403 `AGREEMENT_REQUIRED` hatasıyla engellenir.

---

## 4. Admin Yönetim Paneli

Dosya: [AdminAgreementsPage.tsx](file:///c:/Users/Mert%20K%C4%B1l%C4%B1%C3%A7/Desktop/PROJELER/d-tipbox/packages/frontend/src/pages/admin/AdminAgreementsPage.tsx)

* **Sözleşme Versiyonları:** Tüm versiyonların durumu (Taslak / Yayında / Arşiv), yürürlük tarihleri, SHA-256 hash'leri ve kaç işletmenin kabul ettiği görüntülenir. Yeni taslak versiyon oluşturulabilir ve tek tıkla yayına alınabilir (yayına alınan versiyon değiştirilemez hale gelir).
* **Dijital Kabul ve Denetim Kayıtları:** Sistemdeki tüm kabul kayıtları işletme, kullanıcı, tarih, IP, User-Agent ve hash bilgileriyle listelenir; her bir kabul için HMK m. 193 delil makbuzu görüntülenebilir.
* **Onay Bekleyen İşletmeler:** Aktif yayındaki sözleşmeyi henüz onaylamamış işletmeler liste halinde izlenebilir.

---

## 5. Test Sonuçları (10 / 10 Başarılı)

Dosya: [test-agreement-system.ts](file:///c:/Users/Mert%20K%C4%B1l%C4%B1%C3%A7/Desktop/PROJELER/d-tipbox/packages/backend/src/scripts/test-agreement-system.ts)

Test komutu: `npx tsx packages/backend/src/scripts/test-agreement-system.ts`

```text
================================================================
🏛️  NAPONİ İŞLETME SÖZLEŞMESİ & DİJİTAL ONAY TEST SUITE
================================================================

✅ [TEST 1 BAŞARILI] Yeni işletme sözleşmeyi kabul etmeden devam edemez: is_accepted = false
✅ [TEST 2 BAŞARILI] Acceptance kaydı oluşturuldu.
✅ [TEST 3 BAŞARILI] IP ve User-Agent eksiksiz kaydedildi (IP: 195.175.254.2).
✅ [TEST 4 BAŞARILI] Versiyon ve Değişmez Snapshot oluşturuldu (SHA-256).
✅ [TEST 5 BAŞARILI] Değiştirilemezlik (İmmutability) doğrulandı: Yayındaki sözleşme sessizce değiştirilemez.
✅ [TEST 6 BAŞARILI] Yeni versiyon yayınlandığında eski kabul kayıtları eksiksiz korunur.
✅ [TEST 7 BAŞARILI] Yeniden onay gerekiyorsa işletmeden yeni onay talep edilir (Pending listesinde).
✅ [TEST 8 BAŞARILI] Yetkisiz kullanıcının sözleşmeyi başka işletme adına kabul etmesi 403 ile engellendi.
✅ [TEST 9 BAŞARILI] Admin paneli eski sözleşme versiyonlarını ve denetim kayıtlarını görüntüledi.
✅ [TEST 10 BAŞARILI] Yeni sözleşme onaylandıktan sonra onboarding ve canlı operasyon yetkisi verildi.

================================================================
🎉 TÜM TESTLER BAŞARIYLA GEÇTİ: 10 / 10
================================================================
```

---

## 6. Şirket Bilgileri & Hatırlatma Notları

1. **Resmi Şirket Bilgileri (Sözleşmeye İşlendi):**
   * **Ticari Unvan:** `Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi`
   * **Vergi Kimlik No:** `6291105866`
   * **Kayıtlı Merkez / Adres:** `Bakırköy Dünya Ticaret Merkezi, Bakırköy / İstanbul, Türkiye`
   * **İletişim:** `info@naponi.com`
2. **Kambiyo ve Sınır Ötesi Tahsilat:** İleride yurt dışından kartlı bahşiş alınması durumunda MASAK ve TCMB genelgeleri uyarınca kimlik teyidi (KYC) eşikleri incelenmelidir.
3. **KVKK Yurtdışı Veri Aktarımı:** AWS/Vercel/Railway gibi yurt dışı bulut altyapıları kullanıldığında, KVKK m. 9 uyarınca taahhütname veya standart sözleşme bildirimi gerekebilmektedir.

> [!NOTE]
> **Kullanıcı Hatırlatma Kuralı:** 2. ve 3. maddeler (sınır ötesi tahsilat/kambiyo ve KVKK m. 9 yurt dışı veri aktarım bildirimleri), platformdaki yurt dışı kayıtlı işletme sayısı **50'ye ulaştığında** otomatik olarak hatırlatılmak üzere kayıt altına alınmıştır.
