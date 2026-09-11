/**
 * NAPONİ İŞLETME HİZMET VE KULLANIM SÖZLEŞMESİ (MERCHANT SERVICE AGREEMENT)
 * Master Legal Agreement Template with 20 Clauses and Dynamic Placeholders.
 */

export interface AgreementInterpolationData {
  naponiLegalName?: string;
  naponiAddress?: string;
  naponiTaxId?: string;
  naponiEmail?: string;
  businessName: string;
  businessAddress?: string;
  businessTaxId?: string;
  authorizedPerson?: string;
  businessEmail?: string;
  businessPhone?: string;
  commissionRate?: string;
  effectiveDate?: string;
}

export const DEFAULT_NAPONI_META = {
  legalName: 'Naponi İnternet Alışveriş ve Mağazacılık İthalat İhracat Limited Şirketi',
  address: 'Bakırköy Dünya Ticaret Merkezi, Bakırköy / İstanbul, Türkiye',
  taxId: '6291105866',
  email: 'info@naponi.com',
  defaultCommissionRate: '%0 (Tanıtım ve Lansman Sürecinde Naponi İşlem Komisyonu Sıfırdır)',
};

export const MERCHANT_SERVICE_AGREEMENT_CODE = 'MERCHANT_SERVICE_AGREEMENT';
export const MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION = '1.0.0';
export const MANDATORY_ACCEPTANCE_STATEMENT = "Okudum ve Naponi İşletme Hizmet ve Kullanım Sözleşmesi'ni kabul ediyorum.";

export const MERCHANT_AGREEMENT_RAW_TEMPLATE = `# NAPONİ İŞLETME HİZMET VE KULLANIM SÖZLEŞMESİ

**Sözleşme Kodu:** MSA-TR-{{VERSION}}  
**Yürürlük Tarihi:** {{EFFECTIVE_DATE}}  
**Versiyon:** {{VERSION}}

---

### 1. TARAFLAR VE TANIMLAR

#### 1.1. Taraflar
İşbu Naponi İşletme Hizmet ve Kullanım Sözleşmesi ("**Sözleşme**"), aşağıdaki taraflar arasında akdedilmiştir:

1. **Hizmet Sağlayıcı:** {{NAPONI_LEGAL_NAME}} (Adres: {{NAPONI_ADDRESS}}, Vergi No: {{NAPONI_TAX_ID}}, E-posta: {{NAPONI_EMAIL}}) (Bundan böyle "**Naponi**" olarak anılacaktır).
2. **İşletme:** İşbu Sözleşme'yi dijital onay mekanizması vasıtasıyla onaylayan;  
   - **Ticari Unvan:** {{BUSINESS_NAME}}  
   - **Tebligat Adresi:** {{BUSINESS_ADDRESS}}  
   - **Vergi Kimlik No / TCKN:** {{BUSINESS_TAX_ID}}  
   - **Yetkili Temsilci:** {{AUTHORIZED_PERSON}}  
   - **E-posta:** {{BUSINESS_EMAIL}}  
   - **Telefon:** {{BUSINESS_PHONE}}  
   (Bundan böyle "**İşletme**" veya "**Üye İşyeri**" olarak anılacaktır).

Naponi ve İşletme münferiden "**Taraf**", müştereken "**Taraflar**" olarak anılacaktır.

#### 1.2. Tanımlar
İşbu Sözleşme'de geçen aşağıdaki terimler yanlarında belirtilen anlamları ifade eder:
* **Platform / Sistem:** Naponi tarafından geliştirilen, web, mobil veya API tabanlı çalışan dijital bahşiş, ödeme yönlendirme ve menü/etkileşim yazılım altyapısını.
* **Müşteri / Kullanıcı:** İşletme'nin fiziksel veya dijital hizmet alanında bulunan ve Platform üzerinden bahşiş veya ödeme işlemi gerçekleştiren nihai tüketiciyi.
* **Bahşiş (Tip):** Müşteri tarafından sunulan hizmetten duyulan memnuniyet doğrultusunda, tamamen kendi serbest iradesiyle çalışanlara veya İşletme havuzuna aktarılmak üzere verilen gönüllü ödemeyi.
* **Ödeme Hizmet Sağlayıcısı (ÖHS) / POS Provider:** Türkiye Cumhuriyeti 6493 sayılı Kanun veya ilgili ülke mevzuatı uyarınca yetkilendirilmiş; sanal POS, kart saklama, tahsilat ve fon transferi altyapısını sağlayan lisanslı bankalar veya ödeme/elektronik para kuruluşlarını.
* **QR Kod:** İşletme'ye, İşletme şubelerine veya belirli masalara tahsis edilen, okutulduğunda Platform üzerindeki ilgili ödeme sayfasına yönlendiren dinamik veya statik iki boyutlu barkodu.
* **Dijital Onay:** İşletme yetkilisinin Platform arayüzünde sözleşmeyi okuyarak elektronik imza, log ve zaman damgasıyla irade beyanında bulunmasını.

---

### 2. NAPONİ'NİN HİZMETİNİN KAPSAMI VE HUKUKİ NİTELİĞİ

2.1. Naponi, İşletme'ye Müşterilerin mobil cihazları üzerinden pratik, temassız ve güvenli bir şekilde bahşiş iletebilmelerini veya ödeme yapabilmelerini sağlayan **yazılım, arayüz ve teknoloji yönlendirme altyapısı** sunmaktadır.  
2.2. **Lisans Uyarısı ve Yetki Sınırı:** Naponi, 6493 sayılı Kanun kapsamında bir banka, ödeme kuruluşu veya elektronik para kuruluşu **değildir**. Naponi, Müşterilere veya İşletmelere doğrudan fon tutma, mevduat kabul etme, ödeme hesabı açma veya elektronik para ihraç etme hizmeti vermemektedir.  
2.3. Finansal takas, karttan tahsilat, fonların saklanması ve transferi yalnızca anlaşmalı ve lisanslı Ödeme Hizmet Sağlayıcıları veya bankalar aracılığıyla gerçekleştirilir.  
2.4. Naponi, teknik altyapının kesintisiz ve güvenli çalışması için azami özeni gösterir; ancak telekomünikasyon sağlayıcıları, bulut sunucu arızaları, banka/ÖHS kesintileri ve siber saldırı gibi harici teknik sebeplerden doğan aksamalardan doğrudan sorumlu tutulamaz.

---

### 3. İŞLETMENİN YÜKÜMLÜLÜKLERİ

3.1. **Bilgi Doğruluğu:** İşletme, kayıt olurken ve Sözleşme süresince sunduğu unvan, vergi dairesi, VKN/TCKN, adres, IBAN ve yetkili kişi bilgilerinin tam, doğru ve güncel olduğunu taahhüt eder.  
3.2. **QR Kod Kullanımı:** İşletme, Naponi tarafından kendisine tahsis edilen QR kodları yalnızca onaylanan işyerinde, masalarda veya yetkili personelde sergilemekle yükümlüdür; QR kodların fiziken manipüle edilmesini önlemek adına gerekli güvenlik tedbirlerini alır.  
3.3. **Personel İzni ve Bilgilendirmesi:** İşletme, bahşiş alacak personeline ilişkin Platform'a yüklenen isim, profil ve hesap bilgilerinin ilgili personelin bilgisi ve rızası dahilinde olduğunu; personelin bahşiş dağıtımına ilişkin iç düzenlemelerin İş Kanunu ve ilgili mevzuata uygun yürütüldüğünü taahhüt eder.  
3.4. **Tüketiciyi Yanıltmama:** İşletme, müşterilerini bahşiş vermeye zorlayamaz; bahşişi zorunlu adisyon bedeli veya servis ücreti gibi göstererek tüketiciyi yanıltıcı uygulamalarda bulunamaz.  
3.5. **Vergi ve Muhasebe Sorumluluğu:** Toplanan bahşişlerin veya ödemelerin gelir vergisi, KDV, stopaj ve sair mali yükümlülükleri ile çalışanlara aktarımı veya işletme kayıtlarına intikali tamamen İşletme'nin hukuki ve mali sorumluluğundadır. Naponi, vergi danışmanlığı veya muhasebe sorumluluğu üstlenmez.  
3.6. **Ruhsat ve İzinler:** İşletme, faaliyeti için gerekli olan tüm ticari ruhsat, izin ve belgelere sahip olduğunu ve bu durumun Sözleşme boyunca süreceğini beyan eder.

---

### 4. BAHŞİŞ VE ÖDEME İŞLEMLERİ

4.1. **Gönüllülük Esası:** Platform üzerinden yapılan her türlü bahşiş ödemesi, Müşterinin hür iradesiyle belirlenir. Platform üzerinde sunulan tutar butonları veya serbest tutar giriş alanı yalnızca kullanıcı deneyimini kolaylaştırmak amacıyla tasarlanmıştır.  
4.2. **Ödeme Altyapısı ve Mutabakat:** Müşteri ödemeyi onayladığında, tutar doğrudan Ödeme Hizmet Sağlayıcısı altyapısı üzerinden işlenir ve mutabakat kurallarına göre İşletme'nin veya personelin tanımlı hesabına aktarılır.  
4.3. **İtiraz, Ters İbraz (Chargeback) ve İptal:**  
   - Müşteri veya kart hamili tarafından yapılan harcama itirazlarında (chargeback/ters ibraz), ÖHS kuralları geçerli olur.  
   - Sahte işlem, çalıntı kart veya hileli işlem iddiasıyla iptal edilen ya da bloke edilen tutarlardan ve ÖHS tarafından yansıtılan ceza/komisyon bedellerinden doğrudan İşletme sorumludur.  
   - Naponi, ters ibraz durumunda ÖHS'den gelen resmi bildirimleri İşletme'ye iletir ve gerekli inceleme tamamlanana kadar ilgili bakiyeyi veya hesabı risk yönetimi kapsamında askıya alma hakkına sahiptir.  
4.4. **Kayıtların Saklanması:** Naponi, işlem güvenliğini sağlamak, uyuşmazlıkları çözmek ve yasal mercilere bilgi sunabilmek amacıyla tüm işlem ve yönlendirme kayıtlarını güvenli veri tabanında loglar.

---

### 5. ÜCRETLER VE ÖDEMELER

5.1. **Naponi Hizmet Bedeli:** Naponi'nin Platform üzerinden sunulan teknoloji hizmeti karşılığında uygulayacağı komisyon veya abonelik bedeli: **{{COMMISSION_RATE}}** olarak belirlenmiştir.  
5.2. **Ödeme Kuruluşu ve POS Kesintileri:** Ödeme Hizmet Sağlayıcılarının kartlı ödeme işlemleri için uyguladığı banka komisyonları, takas masrafları ve işlem başı maliyetler Naponi hizmet bedelinden bağımsız olup; ilgili ÖHS sözleşmesi ve tarife şartlarına tabidir.  
5.3. **Fiyat Değişiklikleri:** Naponi, hizmet komisyonu ve ücret modellerinde yapacağı değişiklikleri İşletme'ye en az otuz (30) takvim günü önceden e-posta veya Platform bildirim paneli aracılığıyla bildirir. İşletme, bildirilen süre içinde sözleşmeyi tazminatsız feshetme hakkına sahiptir.  
5.4. **Faturalandırma:** Naponi tarafından tahsil edilen hizmet bedelleri için yasal mevzuata uygun e-Arşiv/e-Fatura düzenlenerek İşletme'nin kayıtlı e-posta adresine iletilir.

---

### 6. POS VE ÖDEME SAĞLAYICILARI ENTEGRASYONU

6.1. Platform; İşletme'nin kendi anlaşmalı sanal POS altyapısını bağlamasına veya Naponi'nin sisteminde hazır entegrasyonu bulunan lisanslı Ödeme Sağlayıcılarından birini tercih etmesine imkan verecek esneklikte tasarlanmıştır.  
6.2. **Hassas Bilgilerin Korunması:** İşletme, POS sağlayıcısına ait API Key, Secret Key, Merchant ID ve Terminal ID gibi hassas kimlik doğrulama anahtarlarının gizliliğini korumakla yükümlüdür.  
6.3. **Naponi Güvenlik Standartları:** Naponi; PCI-DSS standartları uyarınca, kart sahiplerinin CVV ve kart numarası gibi tam hassas kart verilerini kendi sunucularında tutmaz ve personelinin bu verilere erişimini imkansız kılacak şifreleme mekanizmaları uygular.

---

### 7. QR KOD SİSTEMİ VE FİZİKİ MATERYALLER

7.1. Naponi, İşletme'ye dijital veya fiziki formda üretilebilen özel QR kod tasarımları sağlar.  
7.2. Her bir QR kod; İşletme geneline, belirli bir şubeye, salona veya masaya tekil olarak ilişkilendirilebilir.  
7.3. **Yetkisiz Değişiklik ve Güvenlik:** İşletme alanında bulunan QR kodların üçüncü şahıslar tarafından sahtesiyle değiştirilmesi (QR swapping/phishing) riskine karşı İşletme düzenli fiziki kontrol yapmakla yükümlüdür. Naponi, herhangi bir QR kod üzerinden anormal, şüpheli veya coğrafi uyumsuzluk içeren işlemler tespit ettiğinde ilgili QR kodu derhal sistemden pasifleştirme yetkisine sahiptir.

---

### 8. HESAP GÜVENLİĞİ VE YETKİLENDİRME

8.1. İşletme yönetim paneline erişim sağlayan kullanıcı adı, şifre ve tek kullanımlık doğrulama kodlarının gizliliği ve güvenliği münhasıran İşletme'nin sorumluluğundadır.  
8.2. İşletme, hesabı altında gerçekleştirilen tüm işlemlerin yetkili temsilcileri veya çalışanları tarafından yapıldığını kabul eder. Şifre sızıntısı veya yetkisiz erişim şüphesi durumunda derhal Naponi'ye yazılı bildirimde bulunulmalıdır.  
8.3. Naponi, şüpheli oturum açma girişimlerinde veya hesap ele geçirme emarelerinde hesabı koruma amacıyla geçici olarak dondurabilir.

---

### 9. YASAKLI VE HUKUKA AYKIRI KULLANIM

İşletme, Platform'u hiçbir koşulda aşağıdaki amaçlar için kullanamaz veya kullandıramaz:
a) Dolandırıcılık, hileli eylemler veya üçüncü kişilerin zararına haksız kazanç sağlama,  
b) 5549 sayılı Kanun ve ilgili mevzuat uyarınca Suç Gelirlerinin Aklanması veya Terörizmin Finansmanı,  
c) Yasa dışı bahis, kumar veya şans oyunlarına aracılık etme,  
d) Sahte, hayali veya gerçekte bir hizmet sunulmaksızın kart nakit çekimi (tefecilik/finansman sağlama) amaçlı işlem üretme,  
e) Başka bir tüzel veya gerçek kişinin kimliğini, unvanını veya ticari itibarını taklit etme,  
f) Çalıntı veya yetkisiz ödeme araçlarıyla işlem gerçekleştirme,  
g) Platform'un yazılım kodlarına müdahale etme, tersine mühendislik yapma, güvenlik açıklarını suistimal etme veya aşırı yükleme (DDoS) oluşturma.

Yasaklı kullanım tespiti halinde Naponi, tek taraflı olarak derhal Sözleşme'yi feshetme, adli makamlara ihbarda bulunma ve uğradığı her türlü maddi-manevi zararı rücu etme hakkını saklı tutar.

---

### 10. HİZMETİN ASKIYA ALINMASI VE FESİH

10.1. **Olağan Fesih:** Taraflar, herhangi bir gerekçe göstermeksizin en az otuz (30) gün önceden yazılı bildirimde bulunmak kaydıyla işbu Sözleşme'yi diledikleri zaman feshedebilirler.  
10.2. **Haklı Nedenle Derhal Fesih ve Askıya Alma:** Naponi, aşağıdaki hallerin varlığı halinde İşletme'nin hesabını derhal askıya alabilir veya Sözleşme'yi tek taraflı ve tazminatsız olarak feshedebilir:  
  a) İşletme'nin Sözleşme hükümlerini veya eklerini esaslı şekilde ihlal etmesi,  
  b) İlgili Ödeme Hizmet Sağlayıcısı veya BDDK/TCMB/MASAK gibi yetkili otoritelerin bildirimde bulunması veya erişim engeli talep etmesi,  
  c) İşletme hakkında iflas, konkordato veya tasfiye sürecinin başlaması,  
  d) Şüpheli işlem, yoğun chargeback veya sahtecilik riskinin teknik algoritmalarca doğrulanması.  
10.3. Sözleşmenin sona ermesi, sona erme tarihine kadar doğmuş olan karşılıklı hak, alacak ve borçları ortadan kaldırmaz.

---

### 11. FİKRİ MÜLKİYET HAKLARI

11.1. Naponi markası, ticari unvanı, Platform kaynak kodları, veri tabanı mimarisi, tasarımlar, arayüzler, algoritmalar, logolar ve alan adları üzerindeki tüm fikri ve sınai mülkiyet hakları münhasıran Naponi'ye aittir.  
11.2. İşletme'ye, işbu Sözleşme'nin geçerlilik süresi boyunca Platform'dan faydalanabilmesi amacıyla münhasır olmayan, devredilemez ve alt lisans verilemez sınırlı bir kullanım lisansı tanınmıştır.  
11.3. İşletme, Naponi materyallerini kopyalayamaz, çoğaltamaz, değiştiremez veya üçüncü kişilerin ticari yararına sunamaz.

---

### 12. GİZLİLİK VE TİCARİ SIRLAR

12.1. Taraflar, işbu Sözleşme kapsamında birbirleri hakkında edindikleri ticari, mali, teknik ve operasyonel her türlü bilgiyi ("**Gizli Bilgi**") kesin bir gizlilik içinde korumayı taahhüt ederler.  
12.2. Gizli Bilgiler, yasal zorunluluklar veya yetkili mahkeme/idari merci kararları haricinde hiçbir üçüncü şahısla paylaşılamaz. Bu gizlilik yükümlülüğü, Sözleşme sona erse dahi üç (3) yıl süreyle yürürlükte kalır.

---

### 13. KİŞİSEL VERİLERİN KORUNMASI (KVKK MEVZUATI)

13.1. **Hukuki Dayanak ve Açık Rıza Ayrımı:** Taraflar, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("**KVKK**") başta olmak üzere uygulanabilir veri koruma mevzuatına riayet ederler. İşbu Sözleşme'nin onaylanması, genel ve hukuken geçersiz bir "açık rıza" olarak yorumlanamaz.  
13.2. **Veri Sorumlusu Sıfatı:** Naponi; İşletme yetkilisinin ve çalışanlarının sistemde tanımlanan kişisel verilerini, Sözleşme'nin kurulması ve ifası (KVKK m. 5/2-c), hukuki yükümlülüklerin yerine getirilmesi (m. 5/2-ç) ve meşru menfaat (m. 5/2-f) hukuki sebeplerine dayanarak işler.  
13.3. **KVKK Aydınlatma Metni:** İşletme yetkilisi ve çalışanları, kişisel verilerinin işlenme amaçları, aktarım kanalları ve KVKK m. 11 kapsamındaki hakları konusunda ayrıca sunulan ve bağımsız bir hukuki metin olan **Naponi KVKK Aydınlatma Metni** ile eksiksiz bilgilendirilmiştir.  
13.4. **Açık Rıza:** Pazarlama iletişimleri veya mevzuat gereği açık rıza zorunluluğu bulunan hallerde (örneğin yurt dışı bulut aktarımı istisnası), açık rıza Sözleşme şartı yapılmaksızın ayrı kutucuk/onay mekanizmalarıyla temin edilir.

---

### 14. VERİ GÜVENLİĞİ VE BİLGİ GÜVENLİĞİ ÖNLEMLERİ

14.1. Naponi, Platform üzerinde işlenen verilerin hukuka aykırı olarak işlenmesini, erişilmesini önlemek ve muhafazasını sağlamak amacıyla Kişisel Verileri Koruma Kurulu rehberlerine uygun teknik ve idari tedbirleri alır (SSL/TLS şifreleme, güvenlik duvarı, erişim loglaması, parola tuzlama).  
14.2. Olası bir siber saldırı veya veri ihlali durumunda Naponi, KVKK m. 12/5 uyarınca kanuni süreler içerisinde Kişisel Verileri Koruma Kurumu'na ve etkilenen ilgili kişilere bildirimde bulunur.

---

### 15. KAYITLAR VE ELEKTRONİK DELİL SÖZLEŞMESİ

15.1. 6100 sayılı Hukuk Muhakemeleri Kanunu'nun ("**HMK**") 193. maddesi uyarınca; işbu Sözleşme'nin kurulması, dijital onayı, feshi veya ifası ile ilgili olarak doğabilecek her türlü uyuşmazlıkta Naponi'nin:  
  a) Sunucu log kayıtları, sistem kayıtları ve veri tabanı yedekleri,  
  b) Sözleşme kabulü sırasında kaydedilen IP adresi, port, User-Agent ve zaman damgası verileri,  
  c) Onaylanan sözleşme metnine ait tekil SHA-256 kriptografik hash değeri ve elektronik snapshot görüntüleri,  
bağlayıcı, kesin ve öncelikli delil niteliğindedir. İşletme bu kayıtlara karşı itiraz hakkından peşinen feragat ettiğini kabul ve beyan eder.

---

### 16. SÖZLEŞME DEĞİŞİKLİKLERİ VE VERSİYONLAMA SİSTEMİ

16.1. Naponi; yasal düzenlemeler, teknolojik yenilikler veya operasyonel zorunluluklar doğrultusunda işbu Sözleşme şartlarında değişiklik yapma hakkını saklı tutar.  
16.2. Platform'da yayınlanan her sözleşme metni; tekil bir versiyon numarası (örn. 1.0.0), yürürlük tarihi ve kriptografik hash değeri ile kayıt altına alınır. Eski versiyonlar sistemden silinmez; geriye dönük ispat amacıyla değişmez olarak arşivlenir.  
16.3. Esaslı sözleşme değişikliklerinde İşletme'den Platform'a ilk girişinde yeni versiyonu incelemesi ve yeniden dijital onay vermesi talep edilebilir. Yeni versiyonu onaylamayan İşletme, Sözleşme'yi tazminatsız feshetme ve hesabını kapatma hakkına sahiptir.

---

### 17. MÜCBİR SEBEPLER

17.1. Doğal afetler (deprem, sel, yangın), savaş, seferberlik, iç karışıklık, terör olayları, genel grev, salgın hastalıklar, yetkili idari makamların faaliyet durdurma kararları, ulusal elektrik veya internet omurga kesintileri gibi Tarafların makul kontrolü dışında gelişen ve basiretli bir tacir gibi davranılmasına rağmen engellenemeyen haller mücbir sebep sayılır.  
17.2. Mücbir sebep süresince Tarafların yükümlülükleri askıya alınır. Mücbir sebebin kesintisiz otuz (30) günden fazla sürmesi halinde, Taraflardan her biri Sözleşme'yi tazminatsız olarak feshedebilir.

---

### 18. SORUMLULUĞUN SINIRLANDIRILMASI

18.1. Naponi, Türk Borçlar Kanunu'nun 115. maddesi uyarınca ağır kusur veya kast halleri haricinde, doğrudan kontrolü altında olmayan sebeplerden (üçüncü taraf telekomünikasyon kesintileri, POS sağlayıcısı kaynaklı hatalar, kullanıcıların hatalı işlem yapması) kaynaklanan dolaylı zararlardan, kar kayıplarından veya veri kayıplarından sorumlu değildir.  
18.2. Naponi'nin işbu Sözleşme kapsamındaki toplam mali sorumluluğu; İşletme tarafından uyuşmazlığın doğduğu tarihten önceki son üç (3) ayda Naponi'ye fiilen ödenmiş olan toplam net hizmet komisyonu tutarı ile sınırlıdır.

---

### 19. UYGULANACAK HUKUK VE YETKİLİ YARGI MERCİİ

19.1. İşbu Sözleşme'nin yorumlanmasında, uygulanmasında ve Sözleşme'den doğacak her türlü ihtilafın çözümünde **Türkiye Cumhuriyeti Hukuku** uygulanır.  
19.2. Sözleşme'den doğan veya Sözleşme ile bağlantılı tüm uyuşmazlıkların çözümünde **İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri** münhasıran yetkilidir.

---

### 20. GENEL HÜKÜMLER

20.1. **Bütünlük:** İşbu Sözleşme, Taraflar arasındaki mutabakatın tamamını oluşturur ve konuyla ilgili önceki tüm sözlü veya yazılı beyanların yerine geçer.  
20.2. **Bölünebilirlik:** Sözleşme hükümlerinden herhangi birinin geçersiz, yasa dışı veya uygulanamaz hale gelmesi, diğer hükümlerin geçerliliğini ve yürürlüğünü etkilemez.  
20.3. **Devir Yasağı:** İşletme, Naponi'nin yazılı onayı olmaksızın işbu Sözleşme'den doğan hak ve yükümlülüklerini üçüncü kişilere devredemez. Naponi, şirket birleşmesi, devralınması veya grup şirketleri nezdinde sözleşmeyi devretme hakkını saklı tutar.  
20.4. **Bildirimler:** Taraflar arasındaki bildirimler, Sözleşme'nin 1. maddesinde belirtilen kayıtlı e-posta adresleri veya Platform bildirim paneli üzerinden usulüne uygun şekilde tebliğ edilir.  
20.5. **Yürürlüğe Girme:** İşbu Sözleşme; İşletme yetkilisinin Platform arayüzünde Sözleşme metnini inceleyerek **"{{MANDATORY_STATEMENT}}"** ibaresini seçmesi ve onay butonuna basması anında yürürlüğe girer.
`;

/**
 * Replace dynamic placeholders in raw markdown agreement template
 */
export function interpolateAgreementText(
  template: string,
  data: AgreementInterpolationData,
  version: string = MERCHANT_SERVICE_AGREEMENT_INITIAL_VERSION
): string {
  let content = template;

  const naponiLegalName = data.naponiLegalName || DEFAULT_NAPONI_META.legalName;
  const naponiAddress = data.naponiAddress || DEFAULT_NAPONI_META.address;
  const naponiTaxId = data.naponiTaxId || DEFAULT_NAPONI_META.taxId;
  const naponiEmail = data.naponiEmail || DEFAULT_NAPONI_META.email;
  const commissionRate = data.commissionRate || DEFAULT_NAPONI_META.defaultCommissionRate;
  const effectiveDate = data.effectiveDate || new Date().toISOString().split('T')[0];

  const replacements: Record<string, string> = {
    '{{VERSION}}': version,
    '{{EFFECTIVE_DATE}}': effectiveDate,
    '{{NAPONI_LEGAL_NAME}}': naponiLegalName,
    '{{NAPONI_ADDRESS}}': naponiAddress,
    '{{NAPONI_TAX_ID}}': naponiTaxId,
    '{{NAPONI_EMAIL}}': naponiEmail,
    '{{BUSINESS_NAME}}': data.businessName || 'Belirtilmedi',
    '{{BUSINESS_ADDRESS}}': data.businessAddress || 'Belirtilmedi',
    '{{BUSINESS_TAX_ID}}': data.businessTaxId || 'Belirtilmedi',
    '{{AUTHORIZED_PERSON}}': data.authorizedPerson || 'Yetkili Temsilci',
    '{{BUSINESS_EMAIL}}': data.businessEmail || 'Belirtilmedi',
    '{{BUSINESS_PHONE}}': data.businessPhone || 'Belirtilmedi',
    '{{COMMISSION_RATE}}': commissionRate,
    '{{MANDATORY_STATEMENT}}': MANDATORY_ACCEPTANCE_STATEMENT,
  };

  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }

  return content;
}
