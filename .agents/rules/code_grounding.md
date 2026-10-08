# STRICT CODE GROUNDING & VERIFICATION RULES FOR ANTIGRAVITY AGENT

> **CRITICAL BEHAVIORAL CONSTRAINT (SIFIR VARSAYIM KURALI):**
> Bu kural istisnasız HER konuşmada, HER kullanıcı isteğinde ve HER analizde geçerlidir.

---

### 1. KODU GREP İLE ARAMADAN ASLA "YAPILACAK / EKSİK / YOL HARİTASI" ÇIKARMA
* Kullanıcıya herhangi bir özellik, eksik, hata, öneri veya ürün yol haritası (roadmap) sunmadan önce **MUTLAKA** diskteki ilgili frontend (`packages/frontend/src`) ve backend (`packages/backend/src`) kodlarını `grep_search` ve `view_file` ile tara.
* Kodda halihazırda var olan, kodlanmış veya kısmen tamamlanmış bir özelliği (örneğin: Google Review yönlendirmesi, bahşiş havuzları, sadakat damgaları, çoklu dil, e-posta şablonları vb.) sanki projede hiç yokmuş gibi "yapılacak yeni özellik" olarak önermek **KESİNLİKLE YASAKTIR**.
* Eğer bir özellik zaten varsa:
  - Bunu açıkça belirt: *"Bu özellik zaten `path/to/file` içinde kodlanmış durumda."*
  - Yalnızca gerçekten eksik, iyileştirilmesi gereken veya kullanıcının doğrudan talep ettiği spesifik kısmı konuş.

### 2. GENEL GEÇER TEORİKLER DEĞİL, BU PROJENİN GERÇEK KODU
* "Dünya çapında ürün stratejisti", "SaaS kurucusu" veya herhangi bir rol üstlenildiğinde dahi, genel geçer teorik SaaS reçeteleri üretmek yerine **bu projenin gerçek kod tabanına, mimarisine ve veritabanı şemasına** dayanarak konuş.
* Konuşmadan önce hafızana veya tahminine değil, diskteki dosyalara bak.

### 3. MEVCUT ÇALIŞAN ÖZELLİKLERİ KORU
* Yeni bir kod yazarken veya bir özelliği düzenlerken mevcut çalışan fonksiyonları, routing mantığını ve kullanıcı arayüzünü bozma.
* Her değişiklikten sonra testleri (`npm run test:backend`) ve derlemeyi (`npm run build:frontend`) mutlaka doğrula.

### 4. DİL VE İLETİŞİM
* Kullanıcı Türkçe iletişim kurmaktadır. Tüm raporlar, planlar ve analizler net, dürüst ve profesyonel Türkçe ile sunulmalıdır.
