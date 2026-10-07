import { SupportedLanguage } from './types';
import { StoreProduct } from '../types';

export interface LocalizedProductContent {
  name: string;
  description: string;
  badge?: string;
  features: string[];
}

export const PRODUCT_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, LocalizedProductContent>>> = {
  // 1. OPAQUE QR STICKER
  'opaque-qr-sticker': {
    tr: {
      name: 'Opak QR Etiket Sticker',
      description: 'Suya, neme, sıvı dökülmelerine ve çizilmelere karşı ultra koruyucu laminasyonlu parlak beyaz opak zeminli QR etiket. Masa, bar ve menülere kusursuz yapışır.',
      features: [
        'İstediğiniz Adette Esnek Sipariş İmkanı',
        'Parlak Beyaz Opak Lüks Zemin',
        'Suya, Yağa ve Çizilmeye Dayanıklı UV Koruma',
        'Masaya / Menüye Özel Dinamik QR Entegrasyonu',
        'Kolay Sökülür, Masada Leke ve İz Bırakmaz',
      ],
    },
    en: {
      name: 'Opaque QR Code Sticker',
      description: 'Ultra-protective laminated glossy white opaque QR sticker resistant to water, moisture, liquids, and scratches. Sticks seamlessly to tables, bars, and menus.',
      features: [
        'Flexible Order Quantities as Needed',
        'Glossy White Opaque Premium Background',
        'Water, Oil & Scratch Resistant UV Lamination',
        'Dynamic QR Integration Per Table / Menu',
        'Clean Removal — Leaves No Residue on Surfaces',
      ],
    },
    de: {
      name: 'Opaker QR-Code Sticker',
      description: 'Hochgradig schützender, laminierter, glänzend weißer opaker QR-Aufkleber, beständig gegen Wasser, Feuchtigkeit, Flüssigkeiten und Kratzer. Haftet perfekt auf Tischen, Theken und Speisekarten.',
      features: [
        'Flexible Bestellmengen nach Wunsch',
        'Glänzend weißer, opaker Premium-Hintergrund',
        'Wasser-, öl- und kratzfeste UV-Schutzlaminierung',
        'Dynamische QR-Integration pro Tisch oder Menü',
        'Rückstandslos ablösbar – hinterlässt keine Klebereste',
      ],
    },
    fr: {
      name: 'Sticker QR Code Opaque',
      description: "Autocollant QR opaque blanc brillant avec pelliculage ultra-protecteur, résistant à l'eau, à l'humidité, aux liquides et aux rayures. Adhère parfaitement aux tables, comptoirs et menus.",
      features: [
        'Quantités de commande flexibles selon vos besoins',
        'Fond blanc opaque brillant haut de gamme',
        "Pelliculage UV résistant à l'eau, aux graisses et aux rayures",
        'Intégration QR dynamique par table ou par menu',
        'Retrait propre — ne laisse aucune trace de colle',
      ],
    },
    es: {
      name: 'Adhesivo QR Opaco',
      description: 'Pegatina QR con acabado blanco opaco brillante y laminado ultra protector resistente al agua, humedad, líquidos y arañazos. Se adhiere perfectamente a mesas, barras y menús.',
      features: [
        'Cantidades de pedido flexibles a su medida',
        'Fondo blanco opaco brillante premium',
        'Protección UV resistente al agua, grasas y arañazos',
        'Integración de QR dinámico por mesa o menú',
        'Fácil retirada sin dejar residuos en las superficies',
      ],
    },
    pt: {
      name: 'Adesivo QR Code Opaco',
      description: 'Adesivo QR em vinil branco opaco brilhante com laminação ultra protetora contra água, humidade, gorduras e riscos. Fixação perfeita em mesas, balcões e ementas.',
      features: [
        'Quantidades de pedido flexíveis sob medida',
        'Fondo branco opaco brilhante premium',
        'Proteção UV resistente a água, óleo e arranhões',
        'Integração de QR dinâmico individual por mesa ou menu',
        'Remoção limpa sem deixar resíduos de cola',
      ],
    },
    ru: {
      name: 'Непрозрачная QR-наклейка',
      description: 'Глянцевая белая непрозрачная QR-наклейка с ультразащитной ламинацией, устойчивой к воде, влаге, жидкостям и царапинам. Идеально крепится на столы, барные стойки и меню.',
      features: [
        'Гибкий выбор любого количества при заказе',
        'Премиальный глянцевый белый непрозрачный фон',
        'УФ-защита от воды, жира и механических повреждений',
        'Индивидуальный динамический QR для каждого стола или меню',
        'Легко снимается, не оставляя следов клея на поверхности',
      ],
    },
    ar: {
      name: 'ملصق رمز الاستجابة السريعة (QR) غير الشفاف',
      description: 'ملصق QR بخلفية بيضاء معتمة لامعة مع طبقة حماية قصوى مقاومة للماء والرطوبة والخدوش. يلتصق بسلاسة على الطاولات والبار وقوائم الطعام.',
      features: [
        'إمكانية طلب مرنة بأي كمية ترغب بها',
        'خلفية بيضاء معتمة فاخرة ذات لمعان فائق',
        'حماية UV مقاومة للماء والزيوت والخدوش',
        'ربط QR ديناميكي مخصص لكل طاولة أو قائمة',
        'إزالة نظيفة دون ترك أي آثار لاصقة على الأسطح',
      ],
    },
    zh: {
      name: '不透明二维码台贴',
      description: '采用亮白不透明底色与高防护覆膜工艺，防水、防潮、防液体泼溅与耐刮擦。完美贴合于餐桌、吧台与纸质菜单。',
      features: [
        '支持按需自由选择订购数量',
        '高档亮白不透明底膜',
        'UV 防护涂层，防油防污耐刮擦',
        '支持一桌一码 / 专属动态二维码定制',
        '撕除不留胶，不损伤桌面涂层',
      ],
    },
    id: {
      name: 'Stiker QR Code Buram (Opaque)',
      description: 'Stiker QR latar putih mengkilap dengan laminasi ekstra tahan air, cairan, minyak, dan goresan. Menempel kuat di meja, bar, dan buku menu.',
      features: [
        'Jumlah pesanan fleksibel sesuai kebutuhan Anda',
        'Latar belakang putih buram elegan dan jernih',
        'Laminasi UV tahan minyak, tumpahan minuman & goresan',
        'Integrasi QR dinamis terpisah untuk setiap meja atau menu',
        'Dapat dilepas bersih tanpa meninggalkan bekas lem di meja',
      ],
    },
    ja: {
      name: '不透明光沢QRコードステッカー',
      description: '水濡れ、湿気、油汚れ、摩擦に強い高耐久ラミネート加工を施した光沢ホワイトのQRステッカー。テーブル、カウンター、メニューに美しく密着します。',
      features: [
        '用途に合わせて自由な数量でご注文可能',
        '高級感のある光沢ホワイト不透明ベース',
        '耐水・耐油・耐傷UVラミネート保護加工',
        'テーブル別・メニュー別の動的QRコード対応',
        '剥がしても糊残りしない特殊粘着仕様',
      ],
    },
  },

  // 2. TRANSPARENT QR STICKER
  'transparent-qr-sticker': {
    tr: {
      name: 'Şeffaf QR Sticker',
      description: 'Cam, akrilik, metal ve açık renkli ahşap yüzeylerde kusursuz eriyip bütünleşen %100 kristal şeffaf transparan UV baskılı akıllı QR etiket.',
      features: [
        'İstediğiniz Adette Esnek Sipariş İmkanı',
        '%100 Kristal Şeffaf Transparan Görünüm',
        'Beyaz & Altın Yaldız Premium UV Kalıcı Baskı',
        'Cam ve Masalarda Eriyip Bütünleşen Tasarım',
        'Yırtılmaz, Çizilmez ve Sıvı Geçirmez',
      ],
    },
    en: {
      name: 'Transparent Crystal QR Sticker',
      description: 'Smart 100% crystal-clear transparent UV printed QR sticker that seamlessly blends into glass, acrylic, metal, and light-toned wooden surfaces.',
      features: [
        'Flexible Order Quantities as Needed',
        '100% Crystal-Clear Ultra Transparent Look',
        'Premium Permanent White & Gold UV Print',
        "Seamless 'No-Label' Embedded Design on Tables & Glass",
        'Tear-proof, Scratch-proof & Waterproof',
      ],
    },
    de: {
      name: 'Transparenter Kristall-QR-Sticker',
      description: 'Smarter, zu 100 % kristallklarer transparenter UV-gedruckter QR-Aufkleber, der sich nahtlos in Glas-, Acryl-, Metall- und helle Holzoberflächen einfügt.',
      features: [
        'Flexible Bestellmengen nach Wunsch',
        '100 % kristallklare transparente Optik',
        'Hochwertiger permanenter weißer & goldener UV-Druck',
        'Verschmilzt unsichtbar mit Glastischen und Theken',
        'Reißfest, kratzfest und absolut wasserdicht',
      ],
    },
    fr: {
      name: 'Sticker QR Transparent Cristal',
      description: 'Autocollant QR intelligent imprimé aux UV sur film 100% transparent et cristallin, se fondant parfaitement sur le verre, le plexiglas, le métal et les bois clairs.',
      features: [
        'Quantités de commande flexibles selon vos besoins',
        'Aspect cristal 100 % transparent et invisible',
        'Impression UV permanente blanc & doré haut de gamme',
        'Effet sérigraphie directe sans fond visible sur table',
        'Indéchirable, anti-rayures et étanche',
      ],
    },
    es: {
      name: 'Adhesivo QR Transparente Cristal',
      description: 'Pegatina QR inteligente con impresión UV 100% transparente cristalina que se integra sin bordes visibles en superficies de cristal, metacrilato, metal y madera clara.',
      features: [
        'Cantidades de pedido flexibles a su medida',
        'Acabado 100% cristalino y totalmente transparente',
        'Impresión UV permanente en blanco y dorado premium',
        "Efecto integrado 'sin etiqueta' en mesas y cristal",
        'Indestructible: no se rasga, raya ni filtra líquidos',
      ],
    },
    pt: {
      name: 'Adesivo QR Code Transparente Cristal',
      description: 'Adesivo QR inteligente com impressão UV 100% transparente cristalina, integrando-se perfeitamente em vidro, acrílico, metal e madeiras claras.',
      features: [
        'Quantidades de pedido flexíveis sob medida',
        'Aparência 100% transparente efeito cristal',
        'Impressão UV permanente branco e dourado premium',
        'Efeito de impressão direta nas mesas sem borda visível',
        'À prova de água, não rasga e resistente a riscos',
      ],
    },
    ru: {
      name: 'Прозрачная кристальная QR-наклейка',
      description: 'Умная наклейка со 100% кристально прозрачной пленкой и стойкой УФ-печатью, гармонично сливающаяся со стеклом, акрилом, металлом и светлым деревом.',
      features: [
        'Гибкий выбор любого количества при заказе',
        '100% кристально прозрачный эффект без видимого фона',
        'Стойкая премиальная белая и золотая УФ-печать',
        'Эффект прямой печати на столах и стекле',
        'Водонепроницаемая, устойчивая к разрывам и царапинам',
      ],
    },
    ar: {
      name: 'ملصق رمز الاستجابة السريعة (QR) الشفاف الكريستالي',
      description: 'ملصق ذكي شفاف بنسبة 100% بطباعة UV فاخرة، يندمج بانسيابية تامة مع الأسطح الزجاجية والأكريليك والمعدن والخشب الفاتح.',
      features: [
        'إمكانية طلب مرنة بأي كمية ترغب بها',
        'مظهر شفاف كريستالي 100% بدون أي حواف بارزة',
        'طباعة UV دائمة فائقة الجودة باللونين الأبيض والذهبي',
        'مظهر طباعة مباشرة مدمجة على الطاولات والزجاج',
        'غير قابل للتمزق، مقاوم للخدش ومضاد تام للماء',
      ],
    },
    zh: {
      name: '全透明水晶二维码台贴',
      description: '100% 高透水晶透明 UV 印刷智能二维码台贴，与玻璃、亚克力、金属和浅色木纹桌面浑然一体。',
      features: [
        '支持按需自由选择订购数量',
        '100% 水晶全透明无边质感',
        '高档白墨与金箔质感 UV 固化印刷',
        '呈现如同直接印刷在桌面上的隐形高级质感',
        '撕不烂、耐刮擦、完全防水防油',
      ],
    },
    id: {
      name: 'Stiker QR Transparan Kristal',
      description: 'Stiker QR pintar cetak UV 100% transparan sebening kristal yang menyatu elegan pada permukaan kaca, akrilik, logam, dan kayu warna cerah.',
      features: [
        'Jumlah pesanan fleksibel sesuai kebutuhan Anda',
        'Tampilan 100% transparan kristal tanpa batas terlihat',
        'Cetak UV permanen tinta putih & aksen emas premium',
        'Menyatu sempurna seolah tercetak langsung di atas meja',
        'Tahan air, tidak mudah sobek, dan anti gores',
      ],
    },
    ja: {
      name: '高透明クリスタルQRステッカー',
      description: 'ガラス、アクリル、金属、明るい木製テーブルに美しく溶け込む、100%クリアな透明素材にUV硬化印刷を施した高品位スマートQRステッカー。',
      features: [
        '用途に合わせて自由な数量でご注文可能',
        '境界線を感じさせない100%クリスタル透明フィルム',
        '高精細なホワイト＆ゴールド調の高級UV印刷',
        'テーブルに直接印字されたようなシームレスな仕上がり',
        '破れにくく、耐水・耐摩擦性に優れた設計',
      ],
    },
  },

  // 3. TABLE STAND
  'l-type-acrylic-table-stand': {
    tr: {
      name: 'L-Tipi Akrilik QR & NFC Masa Standı',
      description: 'Masalarınız için lüks pleksi akrilik stant. Temassız NFC ve masaya özel dinamik QR kod entegreli. Suya ve darbelere dayanıklı UV baskı.',
      badge: 'En Çok Satan',
      features: [
        'Lüks Şeffaf Pleksi / Mat Siyah Seçeneği',
        'Entegre NTAG213/215 Temassız NFC Çip',
        'Yüksek Çözünürlüklü Kalıcı UV Baskı',
        'Masaya Özel QR Kod Eşleştirme',
        'Kolay Temizlenebilir Yüzey',
      ],
    },
    en: {
      name: 'L-Type Acrylic QR & NFC Table Stand',
      description: 'Luxury plexiglass acrylic table stand with contactless NFC and dynamic table QR code integration. Water and shock resistant UV print.',
      badge: 'Best Seller',
      features: [
        'Luxury Clear Acrylic or Matte Black Options',
        'Integrated Contactless NTAG213/215 NFC Chip',
        'High-Resolution Permanent UV Print',
        'Per-Table Dynamic QR Code Pairing',
        'Easy-to-Clean Durable Surface',
      ],
    },
  },

  // 4. DUAL SIDED STAND
  't-type-dual-sided-stand': {
    tr: {
      name: 'T-Tipi Çift Yönlü QR Menü & Bahşiş Standı',
      description: 'Bir yüzünde QR Menü, diğer yüzünde Bahşiş ve Müşteri Değerlendirmesi sunan devrilmez ağır tabanlı çift yönlü masa standı.',
      badge: 'Popüler',
      features: [
        'Çift Taraflı Sunum (Ön: Menü, Arka: Bahşiş)',
        'NFC Hızlı Temassız Dokunma Noktası',
        'Ağırlaştırılmış Taban (Devrilmez)',
        'Değiştirilebilir İç Kartvizit Alanı',
      ],
    },
    en: {
      name: 'T-Type Dual-Sided QR Menu & Tip Stand',
      description: 'Double-sided heavy-base table stand presenting digital menu on one side, and tipping & reviews on the other.',
      badge: 'Popular',
      features: [
        'Dual-Sided Display (Front: Menu, Back: Tip)',
        'Fast Contactless NFC Touchpoint',
        'Weighted Non-Tip Sturdy Base',
        'Replaceable Inner Insert Card Slot',
      ],
    },
  },

  // 5. STAFF BADGE
  'smart-staff-nfc-badge': {
    tr: {
      name: 'Akıllı Personel Yaka Kartı (NFC + QR)',
      description: 'Garson ve servis ekibi için kıyafetlere zarar vermeyen güçlü manyetik klipsli, personele özel QR ve NFC donanımlı akıllı rozet.',
      badge: 'Ekip Tercihi',
      features: [
        'Kıyafetlere Zarar Vermeyen Güçlü Manyetik Klips',
        'Garsona Özel Kişisel QR Kod',
        'NFC Çip ile Telefona Dokundurarak Bahşiş',
        'İsim & Unvan Baskısı',
        'Hafif ve Ergonomik Tasarım',
      ],
    },
    en: {
      name: 'Smart Staff Name Badge (NFC + QR)',
      description: 'Smart staff badge equipped with personal QR & NFC, featuring clothes-safe strong magnetic clip for service teams.',
      badge: "Team's Choice",
      features: [
        'Strong Clothes-Safe Magnetic Clip',
        'Individual Server Dynamic QR Code',
        'Tap Phone to Tip with Embedded NFC Chip',
        'Staff Name & Title Custom Print',
        'Lightweight Ergonomic Design',
      ],
    },
  },

  // 6. METAL QR MENU STAND
  'metal-qr-menu-stand': {
    tr: {
      name: 'Metal QR Karekod Menü Standı',
      description: 'Gümüş eloksallı alüminyumdan üretilen, 10x5 cm ebadında kırımlı QR menü standı. Dış etkenlere dayanıklı süblimasyon baskı ile QR kodunuz veya masa numaranız ön ve arka yüze basılır. Düz kargolanır, elle bükülerek kurulur.',
      badge: 'Yeni',
      features: [
        'Eloksallı alüminyum, 0,45 mm kalınlık, gümüş zemin',
        '10x5 cm kompakt ebat, masada yer kaplamaz',
        'Dış etkenlere dayanıklı süblimasyon baskı',
        'Her stand için farklı masa numarası / QR basılabilir',
        'Ön ve arka yüzde 4x4 cm baskı alanı',
        'Düz kargolanır, kırım hattından elle bükülerek kurulur',
      ],
    },
    en: {
      name: 'Metal QR Code Menu Stand',
      description: 'Silver anodized aluminium folded QR menu stand, 10x5 cm. Weather-resistant sublimation print puts your QR code or table number on front and back. Shipped flat, bend by hand to set up.',
      badge: 'New',
      features: [
        'Anodized aluminium, 0.45 mm thick, silver finish',
        'Compact 10x5 cm size, saves table space',
        'Durable sublimation print',
        'Different table number / QR per stand',
        '4x4 cm print area on front and back',
        'Ships flat, bend by hand along the fold line',
      ],
    },
    de: {
      name: 'Metall-QR-Code-Menüaufsteller',
      description: 'Gefalteter QR-Menüaufsteller aus silberfarben eloxiertem Aluminium, 10x5 cm. Robuster Sublimationsdruck für QR-Code oder Tischnummer auf Vorder- und Rückseite. Flach geliefert, von Hand zu biegen.',
      badge: 'Neu',
      features: [
        'Eloxiertes Aluminium, 0,45 mm, Silber',
        'Kompakt: 10x5 cm',
        'Widerstandsfähiger Sublimationsdruck',
        'Pro Aufsteller andere Tischnummer / anderer QR',
        '4x4 cm Druckfläche auf Vorder- und Rückseite',
        'Flach geliefert, an der Falzlinie von Hand biegen',
      ],
    },
    fr: {
      name: 'Support de menu QR en métal',
      description: 'Support de menu QR plié en aluminium anodisé argenté, 10x5 cm. Impression par sublimation résistante pour votre QR code ou numéro de table, recto et verso. Livré à plat, à plier à la main.',
      badge: 'Nouveau',
      features: [
        'Aluminium anodisé, 0,45 mm, argent',
        'Format compact 10x5 cm',
        'Impression par sublimation résistante',
        'Numéro de table / QR différent par support',
        'Zone d’impression 4x4 cm recto et verso',
        'Livré à plat, à plier à la main',
      ],
    },
    es: {
      name: 'Soporte de menú QR de metal',
      description: 'Soporte de menú QR plegado de aluminio anodizado plateado, 10x5 cm. Impresión por sublimación resistente para tu QR o número de mesa en ambas caras. Se envía plano y se dobla a mano.',
      badge: 'Nuevo',
      features: [
        'Aluminio anodizado, 0,45 mm, plata',
        'Tamaño compacto 10x5 cm',
        'Impresión por sublimación resistente',
        'Número de mesa / QR distinto por soporte',
        'Área de impresión 4x4 cm en anverso y reverso',
        'Se envía plano, se dobla a mano',
      ],
    },
    pt: {
      name: 'Suporte de menu QR em metal',
      description: 'Suporte de menu QR dobrado em alumínio anodizado prateado, 10x5 cm. Impressão por sublimação resistente para seu QR ou número da mesa na frente e no verso. Enviado plano, dobre à mão.',
      badge: 'Novo',
      features: [
        'Alumínio anodizado, 0,45 mm, prata',
        'Tamanho compacto 10x5 cm',
        'Impressão por sublimação resistente',
        'Número da mesa / QR diferente por suporte',
        'Área de impressão 4x4 cm na frente e no verso',
        'Enviado plano, dobre à mão',
      ],
    },
    ru: {
      name: 'Металлическая подставка для QR-меню',
      description: 'Складная подставка для QR-меню из серебристого анодированного алюминия, 10x5 см. Стойкая сублимационная печать QR-кода или номера стола с двух сторон. Доставляется плоской, сгибается вручную.',
      badge: 'Новинка',
      features: [
        'Анодированный алюминий, 0,45 мм, серебро',
        'Компактный размер 10x5 см',
        'Стойкая сублимационная печать',
        'Разный номер стола / QR на каждой подставке',
        'Область печати 4x4 см с обеих сторон',
        'Доставка в плоском виде, сгибается вручную',
      ],
    },
    ar: {
      name: 'حامل قائمة QR معدني',
      description: 'حامل قائمة QR مطوي من الألومنيوم المؤكسد الفضي بمقاس 10×5 سم. طباعة تسامي مقاومة لعوامل الطقس لرمز QR أو رقم الطاولة على الوجهين. يُشحن مسطحًا ويُثنى يدويًا.',
      badge: 'جديد',
      features: [
        'ألومنيوم مؤكسد بسماكة 0.45 مم، فضي',
        'مقاس مدمج 10×5 سم',
        'طباعة تسامي متينة',
        'رقم طاولة / QR مختلف لكل حامل',
        'مساحة طباعة 4×4 سم على الوجهين',
        'يُشحن مسطحًا ويُثنى يدويًا',
      ],
    },
    zh: {
      name: '金属二维码菜单立牌',
      description: '银色阳极氧化铝折叠式二维码菜单立牌，10x5 厘米。耐用热升华印刷，正反面均可印二维码或桌号。平整发货，手动折弯即可使用。',
      badge: '新品',
      features: [
        '阳极氧化铝，厚 0.45 毫米，银色',
        '10x5 厘米小巧尺寸',
        '耐用热升华印刷',
        '每个立牌可印不同桌号 / 二维码',
        '正反面各 4x4 厘米印刷区',
        '平整发货，沿折线手动折弯',
      ],
    },
    id: {
      name: 'Standing Menu QR Logam',
      description: 'Standing menu QR lipat dari aluminium anodized perak, 10x5 cm. Cetak sublimasi tahan lama untuk QR atau nomor meja di kedua sisi. Dikirim datar, lipat sendiri dengan tangan.',
      badge: 'Baru',
      features: [
        'Aluminium anodized 0,45 mm, perak',
        'Ukuran ringkas 10x5 cm',
        'Cetak sublimasi tahan lama',
        'Nomor meja / QR berbeda tiap stand',
        'Area cetak 4x4 cm di depan dan belakang',
        'Dikirim datar, dilipat dengan tangan',
      ],
    },
    ja: {
      name: 'メタルQRメニュースタンド',
      description: 'シルバーのアルマイトアルミ製、10x5cmの折り曲げ式QRメニュースタンド。耐久性のある昇華印刷で、表裏にQRコードやテーブル番号を印刷。平らな状態で届き、手で折り曲げて使用します。',
      badge: '新登場',
      features: [
        'アルマイトアルミ、厚さ0.45mm、シルバー',
        'コンパクトな10x5cm',
        '耐久性のある昇華印刷',
        'スタンドごとに異なるテーブル番号/QR',
        '表裏に4x4cmの印刷エリア',
        '平らで発送、折り線で手で曲げて設置',
      ],
    },
  },
};

/**
 * Returns a localized copy of the store product based on active language.
 * Falls back to English if target language not found, or original product if neither exists.
 */
export function getLocalizedProduct(product: StoreProduct, language: SupportedLanguage): StoreProduct {
  const translationsMap = PRODUCT_TRANSLATIONS[product.slug];
  if (!translationsMap) return product;

  const content = translationsMap[language] || translationsMap.en || translationsMap.tr;
  if (!content) return product;

  return {
    ...product,
    name: content.name || product.name,
    description: content.description || product.description,
    badge: content.badge !== undefined ? content.badge : product.badge,
    features: content.features && content.features.length > 0 ? content.features : product.features,
  };
}

export interface QrTypeOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

export const QR_TYPE_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, { label: string; desc: string }>>> = {
  table: {
    tr: { label: 'Masaya Özel QR', desc: 'Masa 1, 2, 3... her masaya ayrı dinamik kod' },
    en: { label: 'Per-Table Dynamic QR', desc: 'Individual QR code for tables 1, 2, 3...' },
    de: { label: 'Tischspezifischer QR', desc: 'Tisch 1, 2, 3... individuell für jeden Tisch' },
    fr: { label: 'QR Spécifique par Table', desc: 'Table 1, 2, 3... individuel par table' },
    es: { label: 'QR Específico por Mesa', desc: 'Mesa 1, 2, 3... individual para cada mesa' },
    pt: { label: 'QR Específico por Mesa', desc: 'Mesa 1, 2, 3... individual para cada mesa' },
    ru: { label: 'QR для каждого стола', desc: 'Стол 1, 2, 3... отдельный код для каждого стола' },
    ar: { label: 'رمز QR مخصص للطاولة', desc: 'طاولة 1، 2، 3... رمز مستقل لكل طاولة' },
    zh: { label: '一桌一码专属QR', desc: '1号桌、2号桌、3号桌... 每桌独立动态码' },
    id: { label: 'QR Khusus Per Meja', desc: 'Meja 1, 2, 3... QR terpisah untuk setiap meja' },
    ja: { label: 'テーブル専用QR', desc: 'テーブル1、2、3... 卓ごとの個別QRコード' },
  },
  staff: {
    tr: { label: 'Personele Özel QR', desc: 'Garson ve servis ekibine özel rozet/baskı' },
    en: { label: 'Staff Member QR', desc: 'Dedicated to servers and service team' },
    de: { label: 'Mitarbeiter-QR', desc: 'Speziell für Kellner und Serviceteam' },
    fr: { label: 'QR Personnel / Serveur', desc: "Dédié aux serveurs et à l'équipe" },
    es: { label: 'QR Personal / Camarero', desc: 'Dedicado a camareros y equipo de sala' },
    pt: { label: 'QR de Funcionário', desc: 'Dedicado a empregados de mesa e staff' },
    ru: { label: 'QR для сотрудника', desc: 'Индивидуально для официантов и персонала' },
    ar: { label: 'رمز QR خاص بالموظف', desc: 'مخصص للنادل وفريق الخدمة' },
    zh: { label: '员工专属QR', desc: '服务员与服务团队个人二维码' },
    id: { label: 'QR Khusus Staf', desc: 'Khusus untuk pelayan dan kru servis' },
    ja: { label: 'スタッフ専用QR', desc: 'ウェイターや接客スタッフ専用' },
  },
  pool: {
    tr: { label: 'Kasa / Havuz QR', desc: 'Tüm ekip için ortak bahşiş kutusu' },
    en: { label: 'Checkout / Common Pool QR', desc: 'Shared tip box for the entire team' },
    de: { label: 'Kassen- / Trinkgeldpool-QR', desc: 'Gemeinsame Trinkgeldkasse für das gesamte Team' },
    fr: { label: "QR Caisse / Cagnotte d'équipe", desc: 'Boîte à pourboires partagée pour toute l’équipe' },
    es: { label: 'QR Caja / Bote Común', desc: 'Bote de propinas compartido para todo el equipo' },
    pt: { label: 'QR Caixa / Caixinha Comum', desc: 'Caixa de gorjetas partilhada para toda a equipa' },
    ru: { label: 'QR кассы / Общий пул', desc: 'Общая копилка чаевых для всей команды' },
    ar: { label: 'رمز QR الكاشير / الصندوق المشترك', desc: 'صندوق إكراميات مشترك لكامل الفريق' },
    zh: { label: '收银台 / 共享小费池QR', desc: '全团队公共小费池与收银前台专属码' },
    id: { label: 'QR Kasir / Tip Bersama', desc: 'Kotak tip bersama untuk seluruh tim' },
    ja: { label: 'レジ・共通プールQR', desc: 'チーム全員で共有するチップボックス' },
  },
  menu: {
    tr: { label: 'Dijital Menü QR', desc: 'Doğrudan fotoğraflı dijital menüye yönlendirir' },
    en: { label: 'Digital Menu QR', desc: 'Direct link to photographic digital menu' },
    de: { label: 'Digitales Menü QR', desc: 'Führt direkt zur bebilderten Speisekarte' },
    fr: { label: 'QR Menu Digital', desc: 'Redirige vers le menu digital avec photos' },
    es: { label: 'QR Carta Digital', desc: 'Enlace directo al menú digital con fotos' },
    pt: { label: 'QR Ementa Digital', desc: 'Redireciona para o menu digital interativo' },
    ru: { label: 'QR цифрового меню', desc: 'Прямой переход к иллюстрированному меню' },
    ar: { label: 'رمز QR القائمة الرقمية', desc: 'توجيه مباشر لقائمة الطعام المصورة' },
    zh: { label: '电子菜单QR', desc: '直接跳转至图文并茂的电子扫码菜单' },
    id: { label: 'QR Menu Digital', desc: 'Langsung menuju menu digital lengkap berfoto' },
    ja: { label: 'デジタルメニューQR', desc: '写真付きのデジタルメニューへ直接誘導' },
  },
  smart_hub: {
    tr: { label: 'Smart Hub QR', desc: 'Wi-Fi + Menü + Bahşiş hepsi bir arada' },
    en: { label: 'Smart Hub All-in-One QR', desc: 'Wi-Fi + Menu + Tips all in one place' },
    de: { label: 'Smart Hub All-in-One QR', desc: 'WLAN + Menü + Trinkgeld alles in einem' },
    fr: { label: 'Smart Hub Tout-en-Un', desc: 'Wi-Fi + Menu + Pourboires réunis en un seul QR' },
    es: { label: 'Smart Hub Todo en Uno', desc: 'Wi-Fi + Menú + Propinas todo en uno' },
    pt: { label: 'Smart Hub Tudo-em-Um', desc: 'Wi-Fi + Menu + Gorjetas tudo num só lugar' },
    ru: { label: 'Smart Hub Всё-в-одном', desc: 'Wi-Fi + Меню + Чаевые всё в одном QR' },
    ar: { label: 'المركز الذكي الشامل (Smart Hub)', desc: 'واي فاي + قائمة الطعام + الإكرامية في مكان واحد' },
    zh: { label: 'Smart Hub 多合一综合码', desc: 'Wi-Fi + 扫码菜单 + 小费聚合页' },
    id: { label: 'Smart Hub Serbaguna', desc: 'Wi-Fi + Menu + Tip semua dalam satu QR' },
    ja: { label: 'スマートハブ統合QR', desc: 'Wi-Fi・メニュー・チップをひとつのQRに集約' },
  },
  review: {
    tr: { label: 'Google Yorum QR', desc: 'Google Haritalar 5 yıldızlı değerlendirme' },
    en: { label: 'Google Reviews QR', desc: 'Direct link to Google Maps 5-star reviews' },
    de: { label: 'Google Bewertungen QR', desc: 'Direktlink zu 5-Sterne-Bewertungen auf Google Maps' },
    fr: { label: 'QR Avis Google', desc: 'Lien direct vers les avis 5 étoiles Google Maps' },
    es: { label: 'QR Reseñas Google', desc: 'Enlace directo a valoraciones 5 estrellas en Google Maps' },
    pt: { label: 'QR Avaliações Google', desc: 'Acesso direto às avaliações 5 estrelas no Google Maps' },
    ru: { label: 'QR отзывов Google', desc: 'Прямой переход к оценкам на картах Google' },
    ar: { label: 'رمز QR تقييمات جوجل', desc: 'رابط مباشر لتقييم 5 نجوم على خرائط جوجل' },
    zh: { label: 'Google 评价与打分QR', desc: '直接引导顾客在 Google 地图留下五星好评' },
    id: { label: 'QR Ulasan Google', desc: 'Tautan langsung ke ulasan bintang 5 di Google Maps' },
    ja: { label: 'GoogleクチコミQR', desc: 'Googleマップの5つ星レビュー画面へ直接誘導' },
  },
  custom: {
    tr: { label: 'Kendi Görselim', desc: 'Kendi hazırladığınız özel QR kod veya grafik' },
    en: { label: 'Custom Artwork / Own QR', desc: 'Upload your own custom QR code or graphic file' },
    de: { label: 'Eigenes Design / Eigener QR', desc: 'Eigener benutzerdefinierter QR-Code oder Grafik' },
    fr: { label: 'Design Personnalisé / Mon QR', desc: 'Téléversez votre propre QR code ou fichier graphique' },
    es: { label: 'Diseño Propio / Mi QR', desc: 'Sube tu propio código QR o diseño gráfico' },
    pt: { label: 'Design Próprio / O Meu QR', desc: 'Carregue o seu próprio código QR ou ficheiro gráfico' },
    ru: { label: 'Свой макет / Свой QR', desc: 'Загрузите свой готовый QR-код или файл с дизайном' },
    ar: { label: 'تصميمي الخاص / كود QR خاص بي', desc: 'ارفع رمز QR الخاص بك أو ملف التصميم الجاهز' },
    zh: { label: '自主上传设计 / 自有二维码', desc: '上传您自己设计好的二维码或专属图样' },
    id: { label: 'Desain Sendiri / QR Kustom', desc: 'Unggah kode QR atau file desain kustom Anda sendiri' },
    ja: { label: 'オリジナル画像 / 自作QR', desc: '作成済みの独自QRコードやグラフィックを入稿' },
  },
};

const ICONS_MAP: Record<string, string> = {
  table: '🍽️',
  staff: '👔',
  pool: '💼',
  menu: '📖',
  smart_hub: '⚡',
  review: '⭐',
  custom: '🎨',
};

export function getLocalizedQrTypeOptions(language: SupportedLanguage): QrTypeOption[] {
  return Object.keys(QR_TYPE_TRANSLATIONS).map((id) => {
    const map = QR_TYPE_TRANSLATIONS[id];
    const trans = map?.[language] || map?.en || map?.tr || { label: id, desc: '' };
    return {
      id,
      label: trans.label,
      desc: trans.desc,
      icon: ICONS_MAP[id] || '⚡',
    };
  });
}

