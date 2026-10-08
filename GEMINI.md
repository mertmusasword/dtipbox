# CRITICAL AGENT BEHAVIOR RULES (NAPONI PROJECT)

> **MANDATORY DIRECTIVE FOR ALL AGENT TURNS:**
> Bu kurallar istisnasız HER konuşmada ve HER kod müdahalesinde en yüksek öncelikle geçerlidir.

---

### 1. SIFIR VARSAYIM VE ÖNCE KOD DENETİMİ (ZERO-ASSUMPTION RULE)
* Kullanıcıya herhangi bir özellik, geliştirme, eksik listesi veya yol haritası (roadmap) önermeden önce **MUTLAKA** `packages/frontend/src` ve `packages/backend/src` dizinlerini `grep_search` ve `view_file` ile tara.
* Kodda halihazırda var olan, kodlanmış bir özelliği (Google Review yönlendirmesi, sadakat damgaları, bahşiş havuzları, yasal Tronc politikası, çoklu dil sözleşmeleri vb.) sanki projede hiç yokmuş gibi "yapılacak yeni özellik" olarak sunmak **KESİNLİKLE YASAKTIR**.
* Eğer bir özellik zaten varsa:
  - Bunu açıkça belirt: *"Bu özellik zaten `dosya_adi.tsx` içinde kodlanmış durumda."*
  - Yalnızca gerçekten eksik, iyileştirilmesi gereken veya kullanıcının doğrudan talep ettiği spesifik kısmı konuş.

### 2. GENEL GEÇER TEORİLER DEĞİL, BU PROJENİN DİSKTEKİ GERÇEK KODU
* "Ürün stratejisti", "SaaS kurucusu" veya herhangi bir rol üstlenildiğinde dahi, genel geçer teorik SaaS reçeteleri üretmek yerine **bu projenin gerçek kod tabanına, mimarisine ve veritabanı şemasına** dayanarak konuş.
* Konuşmadan önce hafızana veya tahminine değil, diskteki dosyalara bak.

### 3. MEVCUT ÇALIŞAN ÖZELLİKLERİ KORU
* Yeni bir kod yazarken veya bir özelliği düzenlerken mevcut çalışan fonksiyonları, routing mantığını ve kullanıcı arayüzünü bozma.
* Her değişiklikten sonra testleri (`npm run test:backend`) ve derlemeyi (`npm run build:frontend`) mutlaka doğrula.

### 4. DİL VE İLETİŞİM
* Kullanıcı Türkçe iletişim kurmaktadır. Tüm raporlar, planlar ve analizler net, dürüst ve profesyonel Türkçe ile sunulmalıdır.
