export interface SectorTippingAdvice {
  id: string;
  name: { tr: string; en: string };
  icon: string;
  rate: { tr: string; en: string };
  advice: { tr: string; en: string };
}

export interface CountryTippingGuide {
  slug: string;
  country: { tr: string; en: string };
  countryCode: string;
  flag: string;
  continent: string;
  currency: string;
  currencySymbol: string;
  etiquetteBadge: { tr: string; en: string };
  etiquetteType: 'expected' | 'customary' | 'included' | 'optional' | 'discouraged';
  standardRate: string;
  shortOverview: { tr: string; en: string };
  culturalContext: { tr: string; en: string };
  sectors: SectorTippingAdvice[];
  cashVsDigitalTips: { tr: string; en: string };
  businessInsight: { tr: string; en: string };
  faqs: Array<{
    question: { tr: string; en: string };
    answer: { tr: string; en: string };
  }>;
  meta: {
    title: { tr: string; en: string };
    description: { tr: string; en: string };
    keywords: string[];
  };
}

export const TIPPING_GUIDES: CountryTippingGuide[] = [
  {
    slug: 'japan',
    country: { tr: 'Japonya', en: 'Japan' },
    countryCode: 'JP',
    flag: '🇯🇵',
    continent: 'Asia',
    currency: 'JPY',
    currencySymbol: '¥',
    etiquetteBadge: { tr: 'Bahşiş Verilmez (Kaba Bulunur)', en: 'No Tipping (Often Refused)' },
    etiquetteType: 'discouraged',
    standardRate: '0%',
    shortOverview: {
      tr: 'Japonya’da geleneksel olarak bahşiş kültürü yoktur. Kusursuz hizmet ("Omotenashi") zaten fiyata dahildir ve bahşiş bırakmak kaba veya aşağılayıcı algılanabilir.',
      en: 'Tipping is not part of Japanese culture. Exceptional service ("Omotenashi") is considered the standard standard included in the bill, and leaving cash may be seen as confusing or impolite.'
    },
    culturalContext: {
      tr: 'Geleneksel Japon restoranlarında (Ryokan veya Izakaya) bahşiş bırakırsanız, garson paranızı masada unuttuğunuzu düşünüp arkanızdan sokağa kadar koşabilir. Ancak modern otellerde ve uluslararası barlarda dijital bahşiş sistemleri giderek tanınmaktadır.',
      en: 'In traditional Japanese venues, servers will often chase after customers who leave cash, believing it was accidentally forgotten. However, international luxury hotels and tour guides are beginning to accept digital tips.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar & Suşi Barları', en: 'Restaurants & Sushi Bars' },
        icon: 'Utensils',
        rate: { tr: '0% (Bahşiş verilmez)', en: '0% (No tip)' },
        advice: { tr: 'Masaya veya adisyona kesinlikle nakit para bırakmayın. "Gochisosama deshita" (Yemek için teşekkürler) demek en büyük iltifattır.', en: 'Do not leave cash on the table. Saying "Gochisosama deshita" (Thank you for the meal) to the chef is the customary way to express gratitude.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Çay Evleri', en: 'Cafes & Tea Houses' },
        icon: 'Coffee',
        rate: { tr: '0%', en: '0%' },
        advice: { tr: 'Bahşiş kutusu bulunmaz. Ödemeler kasada yapılır.', en: 'No tip jars exist. Payments are made at the register before leaving.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Izakaya', en: 'Bars & Izakayas' },
        icon: 'Wine',
        rate: { tr: 'Otoshidai (Masa ücreti)', en: 'Otoshi (Cover charge)' },
        advice: { tr: 'Bahşiş yerine kişi başı 300-500 ¥ küçük meze ücreti (Otoshi) hesaba eklenir.', en: 'Instead of tipping, a small appetizer fee (Otoshi, ¥300-500) serves as an automatic seating fee.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Ryokan & Lüks Oteller', en: 'Ryokans & Hotels' },
        icon: 'Hotel',
        rate: { tr: '1.000 - 3.000 ¥ (Zarf içinde)', en: '¥1,000 - ¥3,000 (In envelope)' },
        advice: { tr: 'Sadece geleneksel Ryokan’larda özel oda görevlisine girişte şık bir zarf içinde (Kokorozuke) verilebilir.', en: 'Only at high-end Ryokans may a small tip (Kokorozuke) be discreetly presented to your room attendant in a decorative envelope.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: '0% (Kuruşu kuruşuna)', en: '0% (Exact fare)' },
        advice: { tr: 'Taksiciler para üstünü kuruşu kuruşuna geri verir.', en: 'Drivers will meticulously return every single yen of your change.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Japonya hızla nakitsiz topluma (Suica, Pasmo, PayPay, Apple Pay) geçmektedir. Bahşişi elden nakit vermek yerine dijital sistemler veya teşekkür rozetleri daha kabul edilebilirdir.',
      en: 'Japan is moving towards a cashless society. QR and mobile contactless solutions are modernizing the appreciation experience without the awkwardness of cash.'
    },
    businessInsight: {
      tr: 'Japonya’da yabancı turist ağırlayan işletmeler, dijital QR bahşiş altyapısı kurarak yabancı misafirlerin teşekkürlerini garsonlara mahcubiyetsiz aktarmasını sağlar.',
      en: 'Venues in Tokyo, Kyoto, and Osaka catering to international visitors use QR tipping to let tourists tip without cultural discomfort.'
    },
    faqs: [
      {
        question: { tr: 'Japonya’da restoranda bahşiş bırakırsam ne olur?', en: 'What happens if you tip at a restaurant in Japan?' },
        answer: { tr: 'Garson paranızı unuttuğunuzu sanarak arkanızdan koşup paranızı iade edecektir. Bu nedenle masaya nakit bırakmayın.', en: 'The server will most likely run after you to return the forgotten cash. To avoid embarrassment, do not leave cash.' }
      },
      {
        question: { tr: 'Hizmet bedeli (Service charge) hesaba dahil mi?', en: 'Is service charge included in Japanese restaurants?' },
        answer: { tr: 'Lüks restoranlarda ve otellerde %10-15 servis bedeli faturaya otomatik eklenir.', en: 'High-end restaurants and hotel dining rooms often add a 10-15% service charge automatically.' }
      }
    ],
    meta: {
      title: { tr: 'Japonya Bahşiş Rehberi: Ne Kadar ve Nasıl Bahşiş Verilir? — Naponi', en: 'Tipping in Japan: Rules, Etiquette & Cultural Guide 2026 — Naponi' },
      description: { tr: 'Japonya’da bahşiş verilir mi? Tokyo ve Kyoto restoranlarında, taksilerde ve otellerde bahşiş kültürü ve kuralları hakkında eksiksiz rehber.', en: 'Complete guide to tipping in Japan. Why tipping is traditionally refused, how service charges work in Tokyo, and digital tipping etiquette.' },
      keywords: ['tipping in japan', 'japonya bahşiş rehberi', 'japan tipping etiquette', 'tokyo restaurant tip', 'do you tip in japan']
    }
  },
  {
    slug: 'united-states',
    country: { tr: 'Amerika Birleşik Devletleri', en: 'United States' },
    countryCode: 'US',
    flag: '🇺🇸',
    continent: 'North America',
    currency: 'USD',
    currencySymbol: '$',
    etiquetteBadge: { tr: 'Zorunlu / Beklenen (%18-%22)', en: 'Expected & Standard (18%–22%)' },
    etiquetteType: 'expected',
    standardRate: '18% - 22%',
    shortOverview: {
      tr: 'ABD’de bahşiş (tipping) hizmet sektörünün temel geçim kaynağıdır. Garsonlar federal asgari ücretin çok altında saatlik ücret aldığından, bahşiş neredeyse zorunludur.',
      en: 'In the US, tipping is a fundamental part of the service economy. Frontline servers rely on tips for the majority of their income, making 18–22% standard etiquette.'
    },
    culturalContext: {
      tr: 'Amerika’da bahşiş bırakmamak garson için çok büyük bir hakaret ve haksızlık olarak görülür. Servis çok kötü olsa dahi en az %15 bırakılması, sorun varsa yöneticiyle konuşulması beklenir.',
      en: 'Failing to tip in America is considered a severe social faux pas. Even for mediocre service, 15% is expected, while 20%+ is standard for good service.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Masaya Servis Restoranlar', en: 'Sit-Down Restaurants' },
        icon: 'Utensils',
        rate: { tr: '%18 - %22', en: '18% - 22%' },
        advice: { tr: 'İyi servis için %20 standarttır. Üst düzey gastronomi mekanlarında %22-25 yaygındır.', en: '20% is the baseline for attentive service; 22–25% for fine dining.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kahve & Hızlı Sipariş', en: 'Cafes & Fast Casual' },
        icon: 'Coffee',
        rate: { tr: '1$ - 2$ veya %10-15', en: '$1 - $2 or 10-15%' },
        advice: { tr: 'Tezgahtan alınan kahvelerde ekran üzerinde 1$ veya %15 seçmek adettendir.', en: 'Selecting $1-$2 or 15% on the counter screen is standard.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Publar', en: 'Bars & Nightclubs' },
        icon: 'Wine',
        rate: { tr: 'İçecek başına 1$ - 2$', en: '$1 - $2 per drink' },
        advice: { tr: 'Bira/şarap için içecek başına 1$, kokteyller için 2$ veya toplam hesabın %20’si.', en: '$1 per beer/wine, $2 per craft cocktail, or 20% of the bar tab.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Otel Bellboy & Temizlik', en: 'Hotel Porters & Housekeeping' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 2$ - 5$', en: '$2 - $5 per bag' },
        advice: { tr: 'Valizleri odaya taşıyan görevliye bavul başına 2-5$, oda temizliği için günlük 3-5$.', en: '$2-$5 per bag for bellhops, $3-$5 per night left on the desk for housekeeping.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksi, Uber & Lyft', en: 'Taxis & Rideshare' },
        icon: 'Car',
        rate: { tr: '%15 - %20', en: '15% - 20%' },
        advice: { tr: 'Uber/Lyft uygulamasından veya sarı taksi posundan %15-20 seçilir.', en: '15–20% selected via the rideshare app or taxi payment screen.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Amerikalıların %80’inden fazlası nakitsiz yaşamaktadır. Masalarda QR kodla bahşiş vermek veya Apple Pay kullanmak en popüler ve hızlı yöntemdir.',
      en: 'Over 85% of transactions are cashless. QR code checkout and mobile wallets (Apple Pay, Google Pay) dominate modern US dining.'
    },
    businessInsight: {
      tr: 'ABD’deki restoranlar masadaki QR kod sistemleriyle personel başına bahşiş gelirlerini %30 artırmakta ve masa devir hızını 15 dakika kısaltmaktadır.',
      en: 'US venues using QR digital tipping experience 30% higher gratuity volume and turn tables 15 minutes faster by removing terminal waits.'
    },
    faqs: [
      {
        question: { tr: 'Vergi öncesi mi vergi sonrası mı bahşiş hesaplanır?', en: 'Should you tip on pre-tax or post-tax amount?' },
        answer: { tr: 'Geleneksel olarak bahşiş vergi öncesi (subtotal) tutar üzerinden hesaplanır, ancak çoğu POS cihazı toplam üzerinden önerir.', en: 'Etiquette dictates tipping on the pre-tax subtotal, although many terminal screens calculate suggestions on the grand total.' }
      },
      {
        question: { tr: 'Büyük gruplarda bahşiş faturaya eklenir mi?', en: 'Is auto-gratuity included for large parties?' },
        answer: { tr: 'Genellikle 6 kişi ve üzeri gruplarda faturaya %18-20 "Gratuity Included" otomatik eklenir. Fişi mutlaka kontrol edin.', en: 'Most US venues automatically add an 18-20% auto-gratuity for parties of 6 or more. Always check your itemized receipt.' }
      }
    ],
    meta: {
      title: { tr: 'Amerika Bahşiş Rehberi: ABD Restoranlarında Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in the US: 2026 Complete Guide & Percentage Rules — Naponi' },
      description: { tr: 'Amerika’da bahşiş kuralları: Restoran, bar, Uber ve otellerde ne kadar bahşiş bırakılır? Bahşiş vermezseniz ne olur? Kapsamlı ABD rehberi.', en: 'Learn US tipping etiquette: how much to tip in American restaurants, bars, taxis, and hotels. Pre-tax vs post-tax calculation and auto-gratuity rules.' },
      keywords: ['tipping in usa', 'amerika bahşiş rehberi', 'us tipping rules', 'how much to tip in us', 'restaurant tip percentage usa']
    }
  },
  {
    slug: 'france',
    country: { tr: 'Fransa', en: 'France' },
    countryCode: 'FR',
    flag: '🇫🇷',
    continent: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    etiquetteBadge: { tr: 'Hizmet Dahil (%5-%10 Jest Olarak)', en: 'Service Compris (5%–10% Customary)' },
    etiquetteType: 'included',
    standardRate: '5% - 10% (veya küsuratı yuvarlama)',
    shortOverview: {
      tr: 'Fransa yasalarına göre tüm restoran faturalarına %15 servis bedeli ("Service Compris") dahildir. Ancak memnun kalındığında masaya küçük bir "Pourboire" (5%-10%) bırakmak gelenektir.',
      en: 'Under French law, a 15% service charge ("Service Compris") is legally included in every restaurant bill. However, leaving a small "Pourboire" (5%–10% or round-up) is standard for good hospitality.'
    },
    culturalContext: {
      tr: 'Paris ve Cote d\'Azur gibi turistik bölgelerde garsonlar bahşişe daha alışıktır. Masada bozuk para bırakmak ("Pourboire") garsona şahsi bir teşekkür niteliği taşır.',
      en: 'In Paris bistros and French cafes, tipping is not compulsory but deeply appreciated. Leaving 1-2 € for a casual meal or 5-10% in high-end dining reflects appreciation.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Bistro & Restoranlar', en: 'Bistros & Restaurants' },
        icon: 'Utensils',
        rate: { tr: '%5 - %10 veya 2€ - 5€', en: '5% - 10% or €2 - €5' },
        advice: { tr: 'Hesap zaten servis dahil gelse de iyi garsona 2-5 € masada bırakmak çok yaygındır.', en: 'Leaving €2–€5 in cash or via QR on the table is customary for attentive service.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Paris Kafeleri & Kruvasan', en: 'Parisian Cafes & Terraces' },
        icon: 'Coffee',
        rate: { tr: 'Bozuk parayı yuvarlama (0.50€ - 1€)', en: 'Round up change (€0.50 - €1)' },
        advice: { tr: 'Kahve veya şarap içerken para üstündeki 50 sent veya 1 euroyu masada bırakabilirsiniz.', en: 'Leaving the loose change from your espresso or croissant on the counter is polite.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Şarap Evleri', en: 'Wine Bars & Pubs' },
        icon: 'Wine',
        rate: { tr: 'İçecek başı 0.50€ - 1€', en: '€0.50 - €1 per round' },
        advice: { tr: 'Kokteyl barlarında hesabı yukarı yuvarlamak tercih edilir.', en: 'Rounding up the total bill on your card or phone is appreciated.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller & Valeler', en: 'Hotels & Concierge' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 1€ - 2€', en: '€1 - €2 per bag' },
        advice: { tr: 'Kapı görevlisine taksi çağırdığında 1-2 €, oda temizliğine gecelik 2 €.', en: '€1–€2 for porters and doormen; €2–€4 per day for housekeeping.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: 'Hesabı en yakın euroya yuvarlama', en: 'Round up to nearest €' },
        advice: { tr: '18.40 € tutan ücret için 20 € vermek standarttır.', en: 'Rounding up an €18.20 fare to €20 is standard practice.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Fransa’da geleneksel kredi kartı POS cihazlarında bahşiş seçeneği genellikle bulunmaz. Bu yüzden masadaki bağımsız Naponi QR kodları garsonlara doğrudan bahşiş iletmek için devrimsel bir kolaylık sağlar.',
      en: 'Most traditional French card terminals lack a tipping prompt. Direct table QR codes bridge this gap, letting diners tip digitally in seconds.'
    },
    businessInsight: {
      tr: 'Fransız restoran sahipleri, personelin net kazancını artırmak ve vergi karmaşasını önlemek için masalara bağımsız QR bahşiş standları yerleştirmektedir.',
      en: 'French venue owners adopt QR tipping to boost server earnings without complicating payroll taxes or terminal workflows.'
    },
    faqs: [
      {
        question: { tr: 'Adisyonda "Service Compris" ne anlama gelir?', en: 'What does "Service Compris" mean on a French bill?' },
        answer: { tr: 'Servis bedelinin faturaya dahil olduğunu gösterir. Yine de memnuniyetinizi göstermek için %5 civarı bahşiş bırakabilirsiniz.', en: 'It indicates that service is legally included in the total price. Additional tips are voluntary gratuities for exceptional care.' }
      }
    ],
    meta: {
      title: { tr: 'Fransa ve Paris Bahşiş Rehberi: Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in France & Paris: 2026 Rules & Etiquette — Naponi' },
      description: { tr: 'Fransa’da bahşiş zorunlu mu? Paris kafelerinde ve restoranlarında "Service Compris" nedir? Eksiksiz Fransız bahşiş rehberi.', en: 'Do you tip in Paris and France? What "Service Compris" means, how much to tip waiters in bistros, taxis, and French hotels.' },
      keywords: ['tipping in france', 'tipping in paris', 'fransa bahşiş rehberi', 'service compris meaning', 'pourboire france']
    }
  },
  {
    slug: 'italy',
    country: { tr: 'İtalya', en: 'Italy' },
    countryCode: 'IT',
    flag: '🇮🇹',
    continent: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    etiquetteBadge: { tr: 'İsteğe Bağlı & Jest (Coperto Var)', en: 'Optional (Coperto Included)' },
    etiquetteType: 'optional',
    standardRate: '1€ - 2€ (Kişi başı) veya %5-10',
    shortOverview: {
      tr: 'İtalya’da bahşiş zorunlu değildir. Çoğu restoranda hesapta "Coperto" (ekmek ve masa örtüsü ücreti) yer alır. Yine de iyi servis için 1-2 € veya %5-10 bahşiş ("Mancia") bırakmak çok nazik bir davranıştır.',
      en: 'Tipping is not obligatory in Italy. Most trattorias charge a small "Coperto" (cover charge for bread and seating). A small tip ("Mancia") of 5-10% or rounding up is welcomed for warm hospitality.'
    },
    culturalContext: {
      tr: 'Roma, Floransa ve Venedik gibi turistik şehirlerde bahşiş daha yaygın hale gelmiştir. Yerel İtalyanlar genellikle masada madeni para bırakır ("Lasciare la mancia").',
      en: 'In Rome, Florence, and Milan, tipping is becoming more common due to international travelers. Italians often leave loose coins on the bill saucer.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Trattoria & Ristorante', en: 'Trattorias & Restaurants' },
        icon: 'Utensils',
        rate: { tr: '%5 - %10 veya 2€ - 5€', en: '5% - 10% or €2 - €5' },
        advice: { tr: 'Coperto ödemiş olsanız bile garson güler yüzlü ve ilgiliyse 2-5 € masada bırakmak çok hoş karşılanır.', en: 'Even with a coperto charge, leaving €2–€5 in cash or QR is a gracious way to thank your waiter.' }
      },
      {
        id: 'cafes',
        name: { tr: 'İtalyan Espresso Barları', en: 'Espresso Bars' },
        icon: 'Coffee',
        rate: { tr: '0.10€ - 0.50€ bozuk para', en: '€0.10 - €0.50 small change' },
        advice: { tr: 'Tezgahta ayakta espresso içerken bozuk parayı tezgahtaki tabağa bırakabilirsiniz.', en: 'Leaving small coins on the zinc counter when ordering espresso al banco is traditional.' }
      },
      {
        id: 'bars',
        name: { tr: 'Aperitivo & Barlar', en: 'Aperitivo & Wine Bars' },
        icon: 'Wine',
        rate: { tr: '1€ - 2€', en: '€1 - €2 round up' },
        advice: { tr: 'Aperitivo büfesi ve içecek için hesabı yukarı yuvarlayın.', en: 'Round up your aperitivo bill by a couple of euros.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller', en: 'Hotels' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 1€ - 2€', en: '€1 - €2 per bag' },
        advice: { tr: 'Oda temizliği ve bellboy için küçük miktarlar.', en: '€1–€2 for porters; €2–€3 per morning for cleaning staff.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: 'En yakın 1-2 euroya yuvarlama', en: 'Round up to nearest euro' },
        advice: { tr: 'Zorunlu değildir, para üstü bırakılabilir.', en: 'Keep the change or round up to the next euro.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'İtalyan kart terminalleri genellikle bahşiş ekleme adımına sahip değildir. Misafirler dijital ödeme yaparken masadaki QR kodları tarayarak garsonlarına anında teşekkür edebilmektedir.',
      en: 'Italian POS terminals rarely offer a tip entry line. Dedicated QR tabletop stands allow tourists to tip directly using Apple Pay or Google Pay.'
    },
    businessInsight: {
      tr: 'İtalya’daki popüler pizzacı ve trattorialar, yabancı misafirlerin bahşiş bırakma isteğini Naponi masa QR’ları ile değerlendirerek personel gelirlerini ciddi oranda artırmaktadır.',
      en: 'Italian venues in tourist hubs use Naponi QR stands to capture gratuities from international diners who carry no euro cash.'
    },
    faqs: [
      {
        question: { tr: 'İtalya’da "Coperto" nedir?', en: 'What is "Coperto" in Italy?' },
        answer: { tr: 'Coperto (genelde kişi başı 2-4 €), ekmek, zeytinyağı ve masa düzeni için yasal bir kuver ücretidir; garsona bahşiş olarak gitmez.', en: 'Coperto (typically €2–€4 per person) is a legal cover charge for bread and tableware that goes to the house, not as a tip to the waiter.' }
      }
    ],
    meta: {
      title: { tr: 'İtalya Bahşiş Rehberi: Restoranlarda Coperto ve Bahşiş Kuralları — Naponi', en: 'Tipping in Italy: 2026 Guide to Coperto & Mancia Etiquette — Naponi' },
      description: { tr: 'İtalya’da bahşiş verilir mi? Roma, Floransa ve Venedik restoranlarında Coperto ücreti nedir? İtalyan bahşiş kültürü rehberi.', en: 'Everything you need to know about tipping in Italy. How Coperto works, how much to tip in Rome and Florence trattorias, and Italian dining etiquette.' },
      keywords: ['tipping in italy', 'italya bahşiş rehberi', 'coperto meaning italy', 'do you tip in italy', 'mancia italy']
    }
  },
  {
    slug: 'united-kingdom',
    country: { tr: 'Birleşik Krallık (İngiltere)', en: 'United Kingdom' },
    countryCode: 'GB',
    flag: '🇬🇧',
    continent: 'Europe',
    currency: 'GBP',
    currencySymbol: '£',
    etiquetteBadge: { tr: 'Standart %10-%12.5 (Servis Eklenir)', en: 'Standard 10%–12.5% (Service Charge)' },
    etiquetteType: 'expected',
    standardRate: '10% - 12.5%',
    shortOverview: {
      tr: 'İngiltere’de özellikle Londra’da restoran faturalarına %12.5 "Discretionary Service Charge" otomatik eklenir. Faturada yoksa %10-12.5 bırakmak genel kuraldır.',
      en: 'In the UK, particularly in London, a 12.5% discretionary service charge is commonly added to the bill. If omitted, tipping 10–12.5% is customary for table service.'
    },
    culturalContext: {
      tr: 'İngiliz pub kültüründe masaya servis yoksa barmene bahşiş verilmez; bunun yerine "And have one for yourself" (Kendine de bir içki al) denilerek içki parası bırakılabilir.',
      en: 'In traditional British pubs, you do not tip when ordering drinks at the bar. Saying "and have one yourself" adds the cost of a half-pint to the total for the bartender.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar', en: 'Restaurants' },
        icon: 'Utensils',
        rate: { tr: '%10 - %12.5', en: '10% - 12.5%' },
        advice: { tr: 'Adisyonda "Service charge" yazıyorsa ekstra vermenize gerek yoktur. Yazmıyorsa %10-12.5 ekleyin.', en: 'If the receipt displays "Service Charge Included", no extra tip is required. If not, add 10–12.5%.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Fırınlar', en: 'Cafes & Bakeries' },
        icon: 'Coffee',
        rate: { tr: 'Bozuk para veya %10', en: 'Loose change or 10%' },
        advice: { tr: 'Tezgahtaki bahşiş kutusuna bozukluk atmak yaygındır.', en: 'Dropping spare coins into the tip jar by the till is common.' }
      },
      {
        id: 'bars',
        name: { tr: 'Geleneksel Publar', en: 'British Pubs' },
        icon: 'Wine',
        rate: { tr: '"One for yourself" (1£ - 2£)', en: '"One for yourself" (£1 - £2)' },
        advice: { tr: 'Barmene jest yapmak için "And have one for yourself" diyebilirsiniz.', en: 'Offer the bartender a drink by offering "one for yourself".' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller', en: 'Hotels' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 1£ - 2£', en: '£1 - £2 per bag' },
        advice: { tr: 'Lüks Londra otellerinde bellboy için bavul başı 2 £.', en: '£1–£2 per bag for porters in London hotels.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Black Cab Taksiler', en: 'Black Cabs & Taxis' },
        icon: 'Car',
        rate: { tr: '%10 veya en yakın 1-2£ yukarı', en: '10% or round up £1-2' },
        advice: { tr: 'Siyah Londra taksilerinde ücreti yuvarlamak adettendir.', en: 'Rounding up the metered fare to the nearest pound is standard.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'İngiltere dünyanın en nakitsiz ülkelerinden biridir (Temassız ödeme oranı %90+). Nakit taşıyan turist sayısı yok denecek kadar azdır; QR ve Apple Pay standarttır.',
      en: 'The UK is largely a cashless society. Over 90% of in-person payments are contactless via card or phone.'
    },
    businessInsight: {
      tr: '2024 UK Tipping Act (Bahşiş Yasası) uyarınca tüm bahşişlerin şeffafça personele dağıtılması zorunludur. Naponi’nin şeffaf havuz sistemi İngiltere yasalarına tam uyumludur.',
      en: 'The UK Employment Allocation of Tips Act legally mandates 100% transparent distribution of gratuities to staff. Naponi provides built-in compliance for UK operators.'
    },
    faqs: [
      {
        question: { tr: 'İngiltere’de "Discretionary Service Charge" zorunlu mu?', en: 'Is discretionary service charge mandatory in the UK?' },
        answer: { tr: 'Hayır, "Discretionary" (isteğe bağlı) anlamına gelir. Servisten memnun kalmazsanız faturadan çıkarılmasını talep edebilirsiniz.', en: 'No, "discretionary" means optional. You have the legal right to ask for it to be removed if service was poor.' }
      }
    ],
    meta: {
      title: { tr: 'İngiltere ve Londra Bahşiş Rehberi: Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in the UK & London: 2026 Rules & Pub Etiquette — Naponi' },
      description: { tr: 'Londra restoranlarında ve publarında ne kadar bahşiş verilir? Discretionary service charge nedir? Eksiksiz İngiltere bahşiş rehberi.', en: 'Complete guide to tipping in the UK. Service charges in London restaurants, pub tipping etiquette, and the UK 2024 Tipping Act explained.' },
      keywords: ['tipping in uk', 'tipping in london', 'ingiltere bahşiş rehberi', 'discretionary service charge london', 'pub tipping etiquette']
    }
  },
  {
    slug: 'germany',
    country: { tr: 'Almanya', en: 'Germany' },
    countryCode: 'DE',
    flag: '🇩🇪',
    continent: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    etiquetteBadge: { tr: 'Yaygın & Beklenen (%5-%10 Trinkgeld)', en: 'Customary & Expected (5%–10%)' },
    etiquetteType: 'customary',
    standardRate: '5% - 10%',
    shortOverview: {
      tr: 'Almanya’da bahşişe "Trinkgeld" (içki parası) denir. Zorunlu değildir ancak iyi hizmet için %5-%10 bırakmak sosyal bir normdur. Bahşiş masaya bırakılmaz, ödeme anında garsona söylenir.',
      en: 'In Germany, tipping is called "Trinkgeld". While not legally mandatory, 5–10% is customary for good table service. Crucially, tips are stated verbally to the server at payment time rather than left on the table.'
    },
    culturalContext: {
      tr: 'Almanya’da garson hesabı getirdiğinde (örneğin 27.50 €) parayı verirken "Stimmt so" (Üstü kalsın) veya "Machen Sie 30" (30 yapın) demek en doğru kuraldır.',
      en: 'In German restaurants, servers bring a leather wallet to the table. You tell them the total you want to pay (e.g. if the bill is €27, you hand €30 and say "Stimmt so" or "30, bitte").'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar & Biergarten', en: 'Restaurants & Biergartens' },
        icon: 'Utensils',
        rate: { tr: '%5 - %10', en: '5% - 10%' },
        advice: { tr: 'Ödeme anında toplam tutarı yuvarlayarak garsona söyleyin.', en: 'State the rounded-up total verbally when the server presents the card machine or bill.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Pastaneler', en: 'Cafes & Bakeries' },
        icon: 'Coffee',
        rate: { tr: '0.50€ - 2€', en: '€0.50 - €2' },
        advice: { tr: 'Kahve ve pasta hesabını en yakın euroya yuvarlayın.', en: 'Round up to the nearest whole euro.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Kneipe', en: 'Bars & Kneipes' },
        icon: 'Wine',
        rate: { tr: '%5 - %10', en: '5% - 10%' },
        advice: { tr: 'İçki başına 0.50-1 € veya hesabı yukarı yuvarlama.', en: 'Round up the tab by €1–€2 per round.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller', en: 'Hotels' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 1€ - 2€', en: '€1 - €2 per bag' },
        advice: { tr: 'Oda temizliği için gecelik 1-2 € masanın üstüne bırakılabilir.', en: '€1–€2 per bag for porters; €2 per day for housekeeping.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: '%10 civarı', en: '~10%' },
        advice: { tr: 'En yakın tam euroya veya 1-2 euro üstüne yuvarlayın.', en: 'Round up the fare by 5–10%.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Almanya eskiden nakit odaklıyken, artık kart ve telefonla ödeme hızla standartlaşmaktadır. Ancak eski POS terminallerinde garsona bahşiş eklemek hala zordur; masadaki QR kodlar büyük bir rahatlık sağlar.',
      en: 'Germany has rapidly embraced contactless card and mobile payments. Independent QR tip stands make digital Trinkgeld effortless.'
    },
    businessInsight: {
      tr: 'Alman vergi mevzuatında personelin doğrudan aldığı bahşişler gelir vergisinden muaftır. Naponi’nin doğrudan personel hesabına aktarım modeli bu muafiyetle tam örtüşür.',
      en: 'Under German tax law (§ 3 Nr. 51 EStG), voluntary tips paid directly to employees are tax-free. Naponi direct attribution aligns seamlessly with German tax rules.'
    },
    faqs: [
      {
        question: { tr: 'Almanya’da bahşiş masaya bırakılır mı?', en: 'Do you leave tips on the table in Germany?' },
        answer: { tr: 'Hayır, masaya bozuk para bırakmak kabalık sayılabilir. Bahşişi ödeme anında garsona toplam tutarı söyleyerek verin.', en: 'No, leaving coins on the table after walking away is frowned upon. Always tell the server the total amount directly during settlement.' }
      }
    ],
    meta: {
      title: { tr: 'Almanya Bahşiş Rehberi: Berlin ve Münih’te Ne Kadar Trinkgeld Verilir? — Naponi', en: 'Tipping in Germany: Trinkgeld Rules, Phrases & Etiquette — Naponi' },
      description: { tr: 'Almanya’da bahşiş kuralları: Trinkgeld nedir, masaya bırakılır mı? Restoran, kafe ve taksilerde ne kadar bahşiş verilir? Tam rehber.', en: 'Complete guide to tipping in Germany. What "Stimmt so" means, how to tip with cards, and how much Trinkgeld is expected in restaurants.' },
      keywords: ['tipping in germany', 'almanya bahşiş rehberi', 'trinkgeld etiquette', 'how to tip in germany', 'stimmt so meaning']
    }
  },
  {
    slug: 'turkey',
    country: { tr: 'Türkiye', en: 'Turkey' },
    countryCode: 'TR',
    flag: '🇹🇷',
    continent: 'Europe/Asia',
    currency: 'TRY',
    currencySymbol: '₺',
    etiquetteBadge: { tr: 'Geleneksel & Beklenen (%10-%15)', en: 'Customary & Expected (10%–15%)' },
    etiquetteType: 'customary',
    standardRate: '10% - 15%',
    shortOverview: {
      tr: 'Türkiye’de bahşiş misafirperverliğin ve takdirin en önemli göstergesidir. Restoran ve kafelerde hesaba servis bedeli eklenmemişse %10-15 bahşiş bırakılması beklenir.',
      en: 'In Turkey, tipping ("Bahşiş") is a deep-rooted cultural tradition reflecting appreciation for hospitality. In restaurants, 10–15% is standard when service charge is not included.'
    },
    culturalContext: {
      tr: 'Müşteriler genellikle nakit taşımadıklarında kredi kartına bahşiş ekletmekte zorlanırlar veya pos cihazında bu seçenek bulunmaz. Masadaki QR kodlar nakitsiz müşterilerin rahatça bahşiş bırakmasını sağlar.',
      en: 'Turkish diners frequently face awkward moments when paying by card, as legacy POS machines lack a tip prompt. Contactless QR codes are rapidly modernizing tipping in Istanbul, Bodrum, and Antalya.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar & Balıkçılar', en: 'Restaurants & Meyhanes' },
        icon: 'Utensils',
        rate: { tr: '%10 - %15', en: '10% - 15%' },
        advice: { tr: 'Kuver ücreti hesaba yazılmış olsa bile garson için %10 bahşiş bırakmak standarttır.', en: 'Even if a kuver (cover charge) is listed, 10% is customary for the waitstaff.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Çay Bahçeleri', en: 'Cafes & Tea Gardens' },
        icon: 'Coffee',
        rate: { tr: '20₺ - 50₺ veya %10', en: '₺20 - ₺50 or 10%' },
        advice: { tr: 'Masaya veya kasadaki kutuya bırakılır.', en: 'Left on the table or placed in the counter tip box.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Kulüpler', en: 'Bars & Nightlife' },
        icon: 'Wine',
        rate: { tr: '%10 - %15', en: '10% - 15%' },
        advice: { tr: 'Hesap sümenine nakit veya QR ile eklenir.', en: 'Left in the leather bill folder via cash or digital QR.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller & Valeler', en: 'Hotels & Valets' },
        icon: 'Hotel',
        rate: { tr: 'Bavul/Vale başı 50₺ - 100₺', en: '₺50 - ₺100 per service' },
        advice: { tr: 'Aracı getiren valeye veya bavul taşıyan bellboya elden verilir.', en: 'Handed directly to the valet or bellboy.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: 'Para üstünü yuvarlama', en: 'Round up fare' },
        advice: { tr: '265 ₺ tutan taksimetre için 300 ₺ vermek yaygındır.', en: 'Rounding up by ₺20–₺50 is standard.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Türkiye kart kullanım oranında Avrupa’nın en büyük pazarlarından biridir. Masalardaki doğrudan QR bahşiş sistemleri, nakitsiz dünyada personelin gelir kaybını sıfırlar.',
      en: 'Turkey is one of Europe’s largest card-payment markets. Table QR codes ensure waitstaff receive gratuities in a largely cashless society.'
    },
    businessInsight: {
      tr: 'Türkiye’deki işletmeler, gün sonu kasa kapatma ve fiziksel tipbox nakitlerini birleştiren Naponi hibrit havuz sistemiyle adil dağıtım yapmaktadır.',
      en: 'Turkish hospitality venues use Naponi to merge table QR tips with end-of-day cash box tips into a unified, fair staff distribution.'
    },
    faqs: [
      {
        question: { tr: 'Türkiye’de kuver bahşiş sayılır mı?', en: 'Does "Kuver" count as a tip in Turkey?' },
        answer: { tr: 'Hayır, kuver işletmenin ekmek, meze ve servis malzemesi bedelidir; garsona bahşiş olarak yansımaz.', en: 'No, kuver is a cover charge for bread and tableware that goes to the establishment, not to the server.' }
      }
    ],
    meta: {
      title: { tr: 'Türkiye Bahşiş Rehberi: Restoran, Kafe ve Otellerde Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in Turkey: Istanbul, Antalya & Dining Etiquette 2026 — Naponi' },
      description: { tr: 'Türkiye’de bahşiş oranları: Restoranlarda kuver nedir, garsona ne kadar bahşiş verilir? Taksi ve otel bahşiş rehberi.', en: 'Complete guide to tipping in Turkey and Istanbul. How kuver works, restaurant tipping percentages, valet and hotel gratuity norms.' },
      keywords: ['tipping in turkey', 'türkiye bahşiş rehberi', 'istanbul tipping guide', 'kuver nedir', 'do you tip in turkey']
    }
  },
  {
    slug: 'united-arab-emirates',
    country: { tr: 'Birleşik Arap Emirlikleri (Dubai)', en: 'United Arab Emirates (Dubai)' },
    countryCode: 'AE',
    flag: '🇦🇪',
    continent: 'Middle East',
    currency: 'AED',
    currencySymbol: 'AED',
    etiquetteBadge: { tr: 'Standart %10-%15 (Lüks Hizmet)', en: 'Customary 10%–15% (Luxury Service)' },
    etiquetteType: 'customary',
    standardRate: '10% - 15%',
    shortOverview: {
      tr: 'Dubai ve Abu Dabi’de hizmet kültürü çok gelişmiştir. Restoran faturalarında genellikle %10 servis veya belediye vergisi yer alır ancak garsonlara elden veya QR ile %10-15 bahşiş bırakmak standarttır.',
      en: 'In Dubai and Abu Dhabi, tipping is an established part of luxury dining. While taxes are often included, leaving 10–15% for attentive servers is customary.'
    },
    culturalContext: {
      tr: 'BAE’deki hizmet sektörünün %90’ından fazlası gurbetçi çalışanlardan oluşur. Bahşişler personelin en temel gelir kalemi olduğundan cömertçe bahşiş verilmesi beklenir.',
      en: 'The hospitality workforce in the UAE is predominantly expatriate. Tips constitute a vital portion of staff earnings, making tipping customary and appreciated.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Lüks Restoranlar & Lounge', en: 'Dining & Lounges' },
        icon: 'Utensils',
        rate: { tr: '%10 - %15', en: '10% - 15%' },
        advice: { tr: 'Faturada servis bedeli olsa dahi iyi garsona %10-15 eklemek beklenir.', en: '10–15% is standard even when taxes are listed.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Brunch', en: 'Cafes & Weekend Brunch' },
        icon: 'Coffee',
        rate: { tr: '5 - 15 AED', en: 'AED 5 - 15' },
        advice: { tr: 'Kahve veya hafif atıştırmalıklar için küçük miktar bırakın.', en: 'Small bills of AED 5–15 left on the tray.' }
      },
      {
        id: 'bars',
        name: { tr: 'Beach Club & Çatı Barları', en: 'Beach Clubs & Rooftops' },
        icon: 'Wine',
        rate: { tr: '%10 - %15', en: '10% - 15%' },
        advice: { tr: 'Hesap kapama sırasında eklenir.', en: 'Added upon closing the table or cabana tab.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller & Valeler', en: 'Hotels & Valets' },
        icon: 'Hotel',
        rate: { tr: '10 - 20 AED', en: 'AED 10 - 20' },
        advice: { tr: 'Valeye araba tesliminde ve bellboy bavul yardımında.', en: 'AED 10–20 per valet retrieval or luggage assistance.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler & Careem', en: 'Taxis & Careem' },
        icon: 'Car',
        rate: { tr: '5 - 10 AED yuvarlama', en: 'AED 5 - 10 round up' },
        advice: { tr: 'Taksi ücretini en yakın 5-10 dirheme yuvarlayın.', en: 'Round up the fare to the nearest AED 5 or 10.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Dubai dünyanın en dijital şehirlerinden biridir. Nakit kullanımı neredeyse sıfırlanmıştır; masada Apple Pay veya QR ile bahşiş en doğal akıştır.',
      en: 'Dubai is near-fully cashless. Apple Pay, Google Pay, and contactless QR tipping are standard practice.'
    },
    businessInsight: {
      tr: 'Dubai’deki uluslararası mekanlar, turistlerin kendi para birimleriyle kolayca bahşiş bırakabilmesi için Naponi QR altyapısını tercih etmektedir.',
      en: 'Venues across Dubai Marina and Downtown utilize multi-currency QR tipping to capture tips from global high-net-worth tourists.'
    },
    faqs: [
      {
        question: { tr: 'Dubai restoranlarında servis ücreti personele gider mi?', en: 'Does the 10% service charge in Dubai go to servers?' },
        answer: { tr: 'Her zaman değil. Faturadaki belediye veya servis ücretleri genellikle işletmeye aittir; bu yüzden doğrudan personele bahşiş vermek önemlidir.', en: 'Not always. Government and venue fees frequently stay with management; direct tips via QR ensure funds reach the staff.' }
      }
    ],
    meta: {
      title: { tr: 'Dubai ve BAE Bahşiş Rehberi: Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in Dubai & UAE: 2026 Etiquette & Restaurant Rules — Naponi' },
      description: { tr: 'Dubai’de bahşiş oranları: Restoranlarda, otel valelerinde ve taksilerde ne kadar bahşiş bırakılır? Eksiksiz BAE rehberi.', en: 'Learn Dubai tipping etiquette: how much to tip servers in restaurants, beach clubs, valets, and taxis across the UAE.' },
      keywords: ['tipping in dubai', 'tipping in uae', 'dubai bahşiş rehberi', 'how much to tip in dubai', 'dubai restaurant tipping']
    }
  },
  {
    slug: 'spain',
    country: { tr: 'İspanya', en: 'Spain' },
    countryCode: 'ES',
    flag: '🇪🇸',
    continent: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    etiquetteBadge: { tr: 'İsteğe Bağlı & Küçük Jest (%5-%10)', en: 'Optional & Modest (5%–10%)' },
    etiquetteType: 'optional',
    standardRate: '5% - 10% (veya bozuk paralar)',
    shortOverview: {
      tr: 'İspanya’da bahşiş ("Propina") zorunlu değildir ve garsonlar sabit maaş alır. Ancak tapas barlarında veya akşam yemeğinde servis iyi ise %5-10 veya para üstünü bırakmak çok yaygındır.',
      en: 'Tipping ("Propina") is completely voluntary in Spain. Servers receive fixed wages. However, leaving 5–10% or loose change is common appreciation for great tapas and table service.'
    },
    culturalContext: {
      tr: 'Geleneksel İspanyol barlarında insanlar tezgaha küçük bozukluklar (Bote) bırakır. Barcelona ve Madrid gibi büyük şehirlerde turistlerin %10 bahşiş bırakması olağandır.',
      en: 'In traditional Spanish taverns, people drop small coins into the "Bote" jar. In Barcelona, Madrid, and Mallorca, 10% tips are appreciated in quality restaurants.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar & Tapas', en: 'Restaurants & Tapas Bars' },
        icon: 'Utensils',
        rate: { tr: '%5 - %10 veya 1€ - 3€', en: '5% - 10% or €1 - €3' },
        advice: { tr: 'Hesap tabağındaki bozuk paraları masada bırakın.', en: 'Leave the coins on the small bill plate after paying.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Churrerías', en: 'Cafes & Churros' },
        icon: 'Coffee',
        rate: { tr: '0.20€ - 0.50€', en: '€0.20 - €0.50' },
        advice: { tr: 'Para üstünün küsuratını bırakmak yeterlidir.', en: 'Leaving small cent change is traditional.' }
      },
      {
        id: 'bars',
        name: { tr: 'Cervecerías & Barlar', en: 'Bars & Taverns' },
        icon: 'Wine',
        rate: { tr: '1€ civarı', en: '~€1' },
        advice: { tr: 'Bote kutusuna veya masaya bırakılır.', en: 'Drop into the communal tip jar ("El bote").' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller', en: 'Hotels' },
        icon: 'Hotel',
        rate: { tr: '1€ - 2€', en: '€1 - €2 per bag' },
        advice: { tr: 'Bavul taşıma için bavul başı 1 €.', en: '€1 per bag for porters.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: 'En yakın euroya yuvarlama', en: 'Round up to next euro' },
        advice: { tr: 'Para üstünün küsuratı bırakılabilir.', en: 'Rounding up the fare is customary.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'İspanya’da temassız kart ödemeleri çok yaygındır ancak çoğu terminal bahşiş girmeye izin vermez. Masadaki QR kodlar bahşişi garsona ulaştırmanın en pratik yoludur.',
      en: 'Contactless card use is ubiquitous, but POS machines rarely prompt for tips. Table QR stands offer a direct digital channel.'
    },
    businessInsight: {
      tr: 'İspanya’daki tapas restoranları ve sahil kulüpleri, Naponi ile bahşişleri toplayıp haftalık personel havuzuna aktarmaktadır.',
      en: 'Venues across Ibiza, Costa del Sol, and Barcelona use Naponi to manage pooled summer staff tips transparently.'
    },
    faqs: [
      {
        question: { tr: 'İspanya’da faturada "IVA" bahşiş midir?', en: 'Is "IVA" a tip on Spanish restaurant receipts?' },
        answer: { tr: 'Hayır, IVA İspanya’nın KDV (katma değer vergisi) oranıdır (%10); bahşişle hiçbir ilgisi yoktur.', en: 'No, IVA is Value Added Tax (usually 10% on food and drink); it is not a gratuity for the staff.' }
      }
    ],
    meta: {
      title: { tr: 'İspanya Bahşiş Rehberi: Barcelona ve Madrid’de Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in Spain: 2026 Etiquette in Barcelona, Madrid & Tapas Bars — Naponi' },
      description: { tr: 'İspanya’da bahşiş kuralları: Tapas barlarında propina nedir, ne kadar verilir? Faturadaki IVA bahşiş midir? Kapsamlı İspanya rehberi.', en: 'Complete guide to tipping in Spain. How Propina works, tipping in Barcelona and Madrid restaurants, and why IVA is not a tip.' },
      keywords: ['tipping in spain', 'ispanya bahşiş rehberi', 'propina spain', 'tipping in barcelona', 'iva meaning spain']
    }
  },
  {
    slug: 'new-zealand',
    country: { tr: 'Yeni Zelanda', en: 'New Zealand' },
    countryCode: 'NZ',
    flag: '🇳🇿',
    continent: 'Oceania',
    currency: 'NZD',
    currencySymbol: 'NZ$',
    etiquetteBadge: { tr: 'Zorunlu Değil (%10 Olağanüstü Hizmet)', en: 'Not Expected (10% for Great Service)' },
    etiquetteType: 'optional',
    standardRate: '0% - 10%',
    shortOverview: {
      tr: 'Yeni Zelanda’da çalışanlar iyi bir saatlik asgari ücrete sahiptir ve bahşiş beklenmez. Ancak kafe ve restoranlarda olağanüstü samimi bir hizmet alındığında %10 bırakmak memnuniyetle karşılanır.',
      en: 'Tipping is not customary or expected in New Zealand, as hospitality workers earn a fair minimum wage. However, 10% for genuinely exceptional dining is warmly appreciated.'
    },
    culturalContext: {
      tr: 'Kiwiler mütevazı ve dürüst bir hizmet anlayışına sahiptir. Kimse bahşiş talep etmez veya beklediğini hissettirmez.',
      en: 'Kiwi hospitality is egalitarian and relaxed. Tipping is never pressured, but tourists frequently reward memorable dining experiences.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar & Bistrolar', en: 'Restaurants & Dining' },
        icon: 'Utensils',
        rate: { tr: '%5 - %10 (İsteğe bağlı)', en: '5% - 10% (Optional)' },
        advice: { tr: 'Özel bir akşam yemeğinde servis çok iyiyse %10 eklenebilir.', en: '10% for attentive, standout table service.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Kahveciler', en: 'Cafes & Brunch' },
        icon: 'Coffee',
        rate: { tr: 'Bozuk para kavanozu', en: 'Tip jar spare coins' },
        advice: { tr: 'Kasadaki kavanoza 1-2 NZ$ bırakabilirsiniz.', en: 'Dropping $1-$2 into the counter jar is common.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Publar', en: 'Bars & Wineries' },
        icon: 'Wine',
        rate: { tr: '0% (Bahşiş verilmez)', en: '0% (No tip)' },
        advice: { tr: 'Barda içki alırken bahşiş beklenmez.', en: 'Not customary when ordering drinks at the bar.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller', en: 'Hotels' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 2 - 5 NZ$', en: 'NZ$ 2 - 5 per bag' },
        advice: { tr: 'Lüks otellerde yardım için küçük bir jest.', en: 'Appreciated in 5-star Auckland and Queenstown lodges.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler', en: 'Taxis' },
        icon: 'Car',
        rate: { tr: 'En yakın dolara yuvarlama', en: 'Round up to nearest dollar' },
        advice: { tr: 'Zorunlu değildir.', en: 'Round up to the nearest dollar.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Yeni Zelanda dünyanın en nakitsiz ülkelerinden biridir (EFTPOS altyapısı). Turistlerin masadaki QR kodla bahşiş bırakması işletmeler için en pratik yöntemdir.',
      en: 'New Zealand is driven by EFTPOS and contactless cards. Contactless QR tipping lets international visitors express gratitude effortlessly.'
    },
    businessInsight: {
      tr: 'Auckland ve Queenstown’daki sahil kafeleri ve şarap evleri, yabancı turistlerin bahşiş bırakma isteğini Naponi ile yakalayarak ekibini ödüllendirmektedir.',
      en: 'Cafes and winery estates across Queenstown and Wellington use Naponi to cater to international tourists who want to tip.'
    },
    faqs: [
      {
        question: { tr: 'Yeni Zelanda’da bahşiş vermezsem kaba olur mu?', en: 'Is it rude not to tip in New Zealand?' },
        answer: { tr: 'Kesinlikle hayır. Bahşiş vermemek tamamen normaldir ve hiçbir personel tarafından olumsuz algılanmaz.', en: 'Not at all. Leaving zero tip is entirely acceptable and normal across all New Zealand hospitality.' }
      }
    ],
    meta: {
      title: { tr: 'Yeni Zelanda Bahşiş Rehberi: Ne Kadar Bahşiş Verilir? — Naponi', en: 'Tipping in New Zealand: 2026 Etiquette & Dining Rules — Naponi' },
      description: { tr: 'Yeni Zelanda’da bahşiş kültürü: Auckland ve Queenstown restoranlarında ne kadar bahşiş bırakılır? Eksiksiz NZ rehberi.', en: 'Everything you need to know about tipping in New Zealand. EFTPOS culture, cafe tip jars, and Queenstown dining etiquette.' },
      keywords: ['tipping in new zealand', 'yeni zelanda bahşiş rehberi', 'do you tip in new zealand', 'auckland tipping', 'eftpos tipping nz']
    }
  },
  {
    slug: 'australia',
    country: { tr: 'Avustralya', en: 'Australia' },
    countryCode: 'AU',
    flag: '🇦🇺',
    continent: 'Oceania',
    currency: 'AUD',
    currencySymbol: 'A$',
    etiquetteBadge: { tr: 'Zorunlu Değil (%10 Üst Düzey Hizmet)', en: 'Optional (10% for Exceptional Care)' },
    etiquetteType: 'optional',
    standardRate: '0% - 10%',
    shortOverview: {
      tr: 'Avustralya’da çalışanların yüksek asgari ücreti olduğundan bahşiş beklenmez. Ancak kaliteli restoranlarda ve özel hizmetlerde %10 bırakmak nazik bir jesttir.',
      en: 'Tipping is not expected in Australia due to robust minimum wage legislation. A 10% tip for attentive fine dining or standout hospitality is welcomed.'
    },
    culturalContext: {
      tr: 'Avustralya’da hesaba gizli bahşiş eklenmez. Ancak hafta sonları ve resmi tatillerde %10-15 tatil ek ücreti (Public Holiday Surcharge) yasal olarak eklenebilir.',
      en: 'Tipping is not part of everyday dining. Be aware that many Australian venues apply a legal 10–15% public holiday or Sunday surcharge.'
    },
    sectors: [
      {
        id: 'restaurants',
        name: { tr: 'Restoranlar', en: 'Restaurants' },
        icon: 'Utensils',
        rate: { tr: '%5 - %10 (İsteğe bağlı)', en: '5% - 10% (Optional)' },
        advice: { tr: 'Yalnızca masaya servis ve harika bir deneyim için.', en: 'For quality sit-down dinner service.' }
      },
      {
        id: 'cafes',
        name: { tr: 'Kafeler & Brunch', en: 'Cafes & Brunch' },
        icon: 'Coffee',
        rate: { tr: 'Bozuk para', en: 'Spare coins' },
        advice: { tr: 'Kasadaki bahşiş kutusuna bozuk para bırakılabilir.', en: 'Drop coins into the counter jar.' }
      },
      {
        id: 'bars',
        name: { tr: 'Barlar & Publar', en: 'Bars & Pubs' },
        icon: 'Wine',
        rate: { tr: '0%', en: '0%' },
        advice: { tr: 'Barda içki alırken bahşiş verilmez.', en: 'Not customary at the bar.' }
      },
      {
        id: 'hotels',
        name: { tr: 'Oteller', en: 'Hotels' },
        icon: 'Hotel',
        rate: { tr: 'Bavul başı 2 - 5 A$', en: 'A$ 2 - 5 per bag' },
        advice: { tr: 'Lüks otellerde bagaj taşıma jesti.', en: 'For bellhops in 5-star hotels.' }
      },
      {
        id: 'taxis',
        name: { tr: 'Taksiler & Rideshare', en: 'Taxis & Uber' },
        icon: 'Car',
        rate: { tr: 'En yakın dolara yuvarlama', en: 'Round up to nearest dollar' },
        advice: { tr: 'Taksiciye para üstünü bırakabilirsiniz.', en: 'Round up the fare.' }
      }
    ],
    cashVsDigitalTips: {
      tr: 'Avustralya’da neredeyse tüm işlemler temassız kart veya telefonla yapılır. Dijital QR bahşiş sistemleri nakit taşımayan misafirlerin kolayca teşekkür etmesini sağlar.',
      en: 'Australia has one of the highest contactless payment adoption rates in the world. Table QR stands enable frictionless digital gratuities.'
    },
    businessInsight: {
      tr: 'Sidney ve Melbourne’deki restoranlar, hafta sonu vardiyalarında personelin motivasyonunu yükseltmek için Naponi havuz dağıtım sistemini kullanmaktadır.',
      en: 'Venues across Sydney and Melbourne leverage Naponi to automate team tip sharing during high-volume shifts.'
    },
    faqs: [
      {
        question: { tr: 'Avustralya’da pazar günleri hesaba eklenen ücret bahşiş midir?', en: 'Is the Sunday surcharge in Australia a tip?' },
        answer: { tr: 'Hayır, "Sunday Surcharge" hafta sonu artan personel mesai maliyetini karşılamak için işletmeye ödenir; garsona bahşiş değildir.', en: 'No, Sunday and public holiday surcharges cover mandatory penalty wage rates for weekend shifts and are retained by the business.' }
      }
    ],
    meta: {
      title: { tr: 'Avustralya Bahşiş Rehberi: Sidney ve Melbourne’de Bahşiş Kuralları — Naponi', en: 'Tipping in Australia: 2026 Rules for Sydney & Melbourne — Naponi' },
      description: { tr: 'Avustralya’da bahşiş verilir mi? Pazar günü ek ücreti nedir, restoranlarda ne kadar bahşiş bırakılır? Kapsamlı Avustralya rehberi.', en: 'Learn Australian tipping customs. Why tipping is optional, how Sunday surcharges work, and tipping in Melbourne and Sydney cafes.' },
      keywords: ['tipping in australia', 'avustralya bahşiş rehberi', 'do you tip in australia', 'sydney tipping etiquette', 'sunday surcharge australia']
    }
  }
];
