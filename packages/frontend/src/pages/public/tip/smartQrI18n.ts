import { SupportedLanguage } from '../../../i18n/types';

export interface SmartQrTranslations {
  wifiTitle: string;
  wifiSubtitle: string;
  networkName: string;
  wifiPassword: string;
  copyPassword: string;
  copied: string;
  quickConnectInstructions: string;
  quickConnectStep1: string;
  quickConnectStep2: (ssid: string) => string;

  googleReviewTitle: string;
  googleReviewSubtitle: (businessName: string) => string;
  copyReviewAndPost: string;
  post5Stars: string;
  reviewCopiedNotice: string;

  promoCode: string;
  copyCode: string;
  codeCopied: string;
  validUntil: string;

  feedbackReceivedTitle: string;
  feedbackReceivedDesc: string;
  howWasExperience: string;
  feedbackSubtitle: string;
  feedbackPlaceholder: string;
  submitting: string;
  submitFeedback: string;

  welcomeToClub: string;
  welcomeToClubDesc: (businessName: string) => string;
  vipClubDefaultTitle: string;
  vipPerk: string;
  vipPerkDefault: string;
  fullName: string;
  fullNamePlaceholder: string;
  emailAddress: string;
  emailPlaceholder: string;
  phoneOptional: string;
  phonePlaceholder: string;
  kvkkConsent: string;
  enrolling: string;
  joinVipClub: string;
  close: string;
  offersChip: string;
  feedbackChip: string;
  menuChip: string;
}

export const SMART_QR_TRANSLATIONS: Record<SupportedLanguage, SmartQrTranslations> = {
  tr: {
    wifiTitle: 'Misafir Wi-Fi Ağı',
    wifiSubtitle: 'İşletmemize özel yüksek hızlı kablosuz internete bağlanın.',
    networkName: 'AĞ ADI (SSID)',
    wifiPassword: 'Wİ-Fİ ŞİFRESİ',
    copyPassword: 'Şifreyi Kopyala',
    copied: 'Kopyalandı',
    quickConnectInstructions: 'Hızlı Bağlantı Adımları',
    quickConnectStep1: '1. "Şifreyi Kopyala" butonuna dokunun.',
    quickConnectStep2: (ssid) => `2. Ayarlar > Wi-Fi bölümünden "${ssid}" ağını seçip yapıştırın.`,

    googleReviewTitle: 'Bizi Çok Mutlu Ettiniz! 🎉',
    googleReviewSubtitle: (name) => `${name} ekibine destek olmak için 5 yıldızlı değerlendirmenizi Google Haritalar'da da paylaşmak ister misiniz?`,
    copyReviewAndPost: 'Yorumu Kopyala & Google\'da Paylaş',
    post5Stars: 'Google\'da 5 Yıldız Ver',
    reviewCopiedNotice: '✓ Yorumunuz panoya kopyalandı! Google sayfasına yapıştırabilirsiniz.',

    promoCode: 'KAMPANYA KODU',
    copyCode: 'Kodu Al',
    codeCopied: 'Kopyalandı',
    validUntil: 'Son geçerlilik:',

    feedbackReceivedTitle: 'Geri Bildiriminiz Alındı!',
    feedbackReceivedDesc: 'Değerli görüşleriniz için teşekkür ederiz. Hizmet kalitemizi artırmak için geri bildiriminiz ekibimizle paylaşıldı.',
    howWasExperience: 'Deneyiminizi Nasıl Buldunuz?',
    feedbackSubtitle: 'Görüşleriniz hizmet kalitemizi sürekli artırmamıza yardımcı olur.',
    feedbackPlaceholder: 'Görüş veya önerinizi yazabilirsiniz (isteğe bağlı)...',
    submitting: 'Gönderiliyor...',
    submitFeedback: 'Geri Bildirimi Gönder',

    welcomeToClub: 'Aramıza Hoş Geldiniz!',
    welcomeToClubDesc: (name) => `${name} ayrıcalıklar kulübüne başarıyla kaydoldunuz. Özel fırsatlar kayıtlı adresinize iletilecektir.`,
    vipClubDefaultTitle: 'VIP Ayrıcalık Kulübü',
    vipPerk: 'Üyelik Avantajı',
    vipPerkDefault: 'Özel indirimler, doğum günü ikramları ve davetiyeler',
    fullName: 'Adınız Soyadınız',
    fullNamePlaceholder: 'Örn: Ahmet Yılmaz',
    emailAddress: 'E-posta Adresiniz',
    emailPlaceholder: 'ahmet@example.com',
    phoneOptional: 'Telefon Numaranız (İsteğe Bağlı)',
    phonePlaceholder: '+90 (5XX) XXX XX XX',
    kvkkConsent: 'Kampanya, indirim ve özel davetiyeler hakkında elektronik ileti almayı kabul ediyorum.',
    enrolling: 'Kaydediliyor...',
    joinVipClub: 'VIP Kulübe Katıl',
    close: 'Kapat',
    offersChip: 'Fırsatlar',
    feedbackChip: 'Görüş Bildir',
    menuChip: 'Menü',
  },

  en: {
    wifiTitle: 'Guest Wi-Fi Network',
    wifiSubtitle: 'Connect to our high-speed guest wireless internet.',
    networkName: 'NETWORK NAME (SSID)',
    wifiPassword: 'WI-FI PASSWORD',
    copyPassword: 'Copy Password',
    copied: 'Copied',
    quickConnectInstructions: 'Quick Connect Instructions',
    quickConnectStep1: '1. Tap "Copy Password" above.',
    quickConnectStep2: (ssid) => `2. Go to Settings > Wi-Fi, select "${ssid}" and paste.`,

    googleReviewTitle: 'You Made Our Day! 🎉',
    googleReviewSubtitle: (name) => `Would you like to support ${name} by posting your 5-star review on Google Maps?`,
    copyReviewAndPost: 'Copy Review & Post on Google',
    post5Stars: 'Post 5 Stars on Google',
    reviewCopiedNotice: '✓ Review copied to clipboard! Paste it on Google.',

    promoCode: 'PROMO CODE',
    copyCode: 'Copy',
    codeCopied: 'Copied',
    validUntil: 'Valid until:',

    feedbackReceivedTitle: 'Feedback Received!',
    feedbackReceivedDesc: 'Thank you for your valuable feedback. It has been shared with our management to elevate our service.',
    howWasExperience: 'How was your experience?',
    feedbackSubtitle: 'Your feedback helps us continuously improve our service.',
    feedbackPlaceholder: 'Write your comment or suggestion (optional)...',
    submitting: 'Submitting...',
    submitFeedback: 'Submit Feedback',

    welcomeToClub: 'Welcome to the Club!',
    welcomeToClubDesc: (name) => `You are now enrolled in the ${name} privilege club. Exclusive offers will be sent to you.`,
    vipClubDefaultTitle: 'VIP Member Club',
    vipPerk: 'Membership Perk',
    vipPerkDefault: 'Exclusive discounts, birthday treats and private invites',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. John Doe',
    emailAddress: 'Email Address',
    emailPlaceholder: 'john@example.com',
    phoneOptional: 'Phone Number (Optional)',
    phonePlaceholder: '+1 (555) 000-0000',
    kvkkConsent: 'I agree to receive promotional messages, discounts and special event invitations.',
    enrolling: 'Enrolling...',
    joinVipClub: 'Join VIP Club',
    close: 'Close',
    offersChip: 'Offers',
    feedbackChip: 'Feedback',
    menuChip: 'Menu',
  },

  ru: {
    wifiTitle: 'Гостевой Wi-Fi',
    wifiSubtitle: 'Подключитесь к высокоскоростному интернету заведения.',
    networkName: 'ИМЯ СЕТИ (SSID)',
    wifiPassword: 'ПАРОЛЬ WI-FI',
    copyPassword: 'Скопировать пароль',
    copied: 'Скопировано',
    quickConnectInstructions: 'Как подключиться',
    quickConnectStep1: '1. Нажмите «Скопировать пароль» выше.',
    quickConnectStep2: (ssid) => `2. Откройте Настройки > Wi-Fi, выберите сеть «${ssid}» и вставьте пароль.`,

    googleReviewTitle: 'Спасибо за теплый отзыв! 🎉',
    googleReviewSubtitle: (name) => `Хотите поддержать команду ${name}, оставив 5-звездочный отзыв в Google Maps?`,
    copyReviewAndPost: 'Скопировать и открыть Google Карты',
    post5Stars: 'Поставить 5 звезд в Google',
    reviewCopiedNotice: '✓ Текст скопирован! Вставьте его на странице Google.',

    promoCode: 'ПРОМОКОД',
    copyCode: 'Скопировать',
    codeCopied: 'Скопировано',
    validUntil: 'Действует до:',

    feedbackReceivedTitle: 'Отзыв отправлен!',
    feedbackReceivedDesc: 'Благодарим за ваше мнение. Мы передали отзыв управляющему для улучшения сервиса.',
    howWasExperience: 'Как прошло ваше посещение?',
    feedbackSubtitle: 'Ваше мнение помогает нам становиться лучше каждый день.',
    feedbackPlaceholder: 'Напишите комментарий или пожелание (необязательно)...',
    submitting: 'Отправка...',
    submitFeedback: 'Отправить отзыв',

    welcomeToClub: 'Добро пожаловать в клуб!',
    welcomeToClubDesc: (name) => `Вы успешно вступили в клуб привилегий ${name}. Спецпредложения будут приходить на вашу почту.`,
    vipClubDefaultTitle: 'VIP-клуб гостей',
    vipPerk: 'Привилегия участника',
    vipPerkDefault: 'Персональные скидки, подарки на день рождения и приглашения на закрытые вечера',
    fullName: 'Имя и фамилия',
    fullNamePlaceholder: 'например, Дмитрий Смирнов',
    emailAddress: 'Электронная почта',
    emailPlaceholder: 'dmitry@example.com',
    phoneOptional: 'Номер телефона (необязательно)',
    phonePlaceholder: '+7 (999) 000-00-00',
    kvkkConsent: 'Я согласен получать информацию об акциях, скидках и специальных предложениях.',
    enrolling: 'Регистрация...',
    joinVipClub: 'Вступить в VIP-клуб',
    close: 'Закрыть',
    offersChip: 'Акции',
    feedbackChip: 'Отзыв',
    menuChip: 'Меню',
  },

  de: {
    wifiTitle: 'Gäste-WLAN',
    wifiSubtitle: 'Verbinden Sie sich mit unserem schnellen Gäste-WLAN.',
    networkName: 'NETZWERKNAME (SSID)',
    wifiPassword: 'WLAN-PASSWORT',
    copyPassword: 'Passwort kopieren',
    copied: 'Kopiert',
    quickConnectInstructions: 'Schnellverbindung',
    quickConnectStep1: '1. Tippen Sie oben auf "Passwort kopieren".',
    quickConnectStep2: (ssid) => `2. Öffnen Sie Einstellungen > WLAN, wählen Sie "${ssid}" und fügen Sie das Passwort ein.`,

    googleReviewTitle: 'Sie haben unseren Tag verschönert! 🎉',
    googleReviewSubtitle: (name) => `Möchten Sie das Team von ${name} mit einer 5-Sterne-Bewertung auf Google Maps unterstützen?`,
    copyReviewAndPost: 'Bewertung kopieren & auf Google teilen',
    post5Stars: '5 Sterne auf Google vergeben',
    reviewCopiedNotice: '✓ Bewertung kopiert! Fügen Sie sie auf Google ein.',

    promoCode: 'GUTSCHEINCODE',
    copyCode: 'Kopieren',
    codeCopied: 'Kopiert',
    validUntil: 'Gültig bis:',

    feedbackReceivedTitle: 'Feedback erhalten!',
    feedbackReceivedDesc: 'Vielen Dank für Ihre Rückmeldung. Sie hilft unserem Team, den Service weiter zu verbessern.',
    howWasExperience: 'Wie war Ihr Erlebnis?',
    feedbackSubtitle: 'Ihre Meinung hilft uns, unseren Service stetig zu optimieren.',
    feedbackPlaceholder: 'Ihr Kommentar oder Vorschlag (optional)...',
    submitting: 'Wird gesendet...',
    submitFeedback: 'Feedback senden',

    welcomeToClub: 'Willkommen im Club!',
    welcomeToClubDesc: (name) => `Sie sind nun Mitglied im Vorteilsclub von ${name}. Exklusive Angebote senden wir Ihnen per E-Mail.`,
    vipClubDefaultTitle: 'VIP-Club',
    vipPerk: 'Mitgliedervorteil',
    vipPerkDefault: 'Exklusive Rabatte, Geburtstagsüberraschungen und Einladungen',
    fullName: 'Vollständiger Name',
    fullNamePlaceholder: 'z. B. Max Mustermann',
    emailAddress: 'E-Mail-Adresse',
    emailPlaceholder: 'max@example.com',
    phoneOptional: 'Telefonnummer (optional)',
    phonePlaceholder: '+49 151 0000000',
    kvkkConsent: 'Ich stimme dem Erhalt von Angeboten, Gutscheinen und Event-Einladungen zu.',
    enrolling: 'Wird registriert...',
    joinVipClub: 'Dem VIP-Club beitreten',
    close: 'Schließen',
    offersChip: 'Angebote',
    feedbackChip: 'Feedback',
    menuChip: 'Speisekarte',
  },

  fr: {
    wifiTitle: 'Réseau Wi-Fi Invité',
    wifiSubtitle: 'Connectez-vous au réseau Wi-Fi haut débit de notre établissement.',
    networkName: 'NOM DU RÉSEAU (SSID)',
    wifiPassword: 'MOT DE PASSE WI-FI',
    copyPassword: 'Copier le mot de passe',
    copied: 'Copié',
    quickConnectInstructions: 'Instructions de connexion',
    quickConnectStep1: '1. Appuyez sur "Copier le mot de passe" ci-dessus.',
    quickConnectStep2: (ssid) => `2. Allez dans Réglages > Wi-Fi, sélectionnez "${ssid}" et collez le mot de passe.`,

    googleReviewTitle: 'Vous nous avez fait chaud au cœur ! 🎉',
    googleReviewSubtitle: (name) => `Souhaitez-vous soutenir l'équipe de ${name} en publiant votre avis 5 étoiles sur Google Maps ?`,
    copyReviewAndPost: 'Copier l\'avis & Publier sur Google',
    post5Stars: 'Mettre 5 étoiles sur Google',
    reviewCopiedNotice: '✓ Avis copié ! Collez-le sur Google Maps.',

    promoCode: 'CODE PROMO',
    copyCode: 'Copier',
    codeCopied: 'Copié',
    validUntil: 'Valable jusqu\'au :',

    feedbackReceivedTitle: 'Avis bien reçu !',
    feedbackReceivedDesc: 'Merci pour votre retour. Il a été transmis à la direction pour parfaire notre service.',
    howWasExperience: 'Comment s\'est passée votre visite ?',
    feedbackSubtitle: 'Votre avis nous aide à vous offrir le meilleur service possible.',
    feedbackPlaceholder: 'Votre commentaire ou suggestion (facultatif)...',
    submitting: 'Envoi en cours...',
    submitFeedback: 'Envoyer l\'avis',

    welcomeToClub: 'Bienvenue au Club !',
    welcomeToClubDesc: (name) => `Vous faites désormais partie du club privilégié de ${name}. Nos offres exclusives vous parviendront par e-mail.`,
    vipClubDefaultTitle: 'Club VIP Privilège',
    vipPerk: 'Avantage Membre',
    vipPerkDefault: 'Réductions exclusives, surprises d\'anniversaire et invitations privées',
    fullName: 'Nom et prénom',
    fullNamePlaceholder: 'ex. Jean Dupont',
    emailAddress: 'Adresse e-mail',
    emailPlaceholder: 'jean@example.com',
    phoneOptional: 'Numéro de téléphone (facultatif)',
    phonePlaceholder: '+33 6 00 00 00 00',
    kvkkConsent: 'J\'accepte de recevoir des offres exclusives, réductions et invitations.',
    enrolling: 'Inscription en cours...',
    joinVipClub: 'Rejoindre le Club VIP',
    close: 'Fermer',
    offersChip: 'Offres',
    feedbackChip: 'Donner un avis',
    menuChip: 'Menu',
  },

  es: {
    wifiTitle: 'Red Wi-Fi para Clientes',
    wifiSubtitle: 'Conéctese a nuestra red Wi-Fi de alta velocidad.',
    networkName: 'NOMBRE DE RED (SSID)',
    wifiPassword: 'CONTRASEÑA WI-FI',
    copyPassword: 'Copiar contraseña',
    copied: 'Copiado',
    quickConnectInstructions: 'Instrucciones de conexión',
    quickConnectStep1: '1. Toque "Copiar contraseña" arriba.',
    quickConnectStep2: (ssid) => `2. Vaya a Ajustes > Wi-Fi, seleccione "${ssid}" y pegue la contraseña.`,

    googleReviewTitle: '¡Nos ha alegrado el día! 🎉',
    googleReviewSubtitle: (name) => `¿Le gustaría apoyar al equipo de ${name} dejando su valoración de 5 estrellas en Google Maps?`,
    copyReviewAndPost: 'Copiar reseña y publicar en Google',
    post5Stars: 'Dar 5 estrellas en Google',
    reviewCopiedNotice: '✓ ¡Reseña copiada! Péguela en la página de Google.',

    promoCode: 'CÓDIGO PROMOCIONAL',
    copyCode: 'Copiar',
    codeCopied: 'Copiado',
    validUntil: 'Válido hasta:',

    feedbackReceivedTitle: '¡Comentario recibido!',
    feedbackReceivedDesc: 'Muchas gracias por su opinión. Ha sido compartida con nuestro equipo para mejorar el servicio.',
    howWasExperience: '¿Cómo fue su experiencia?',
    feedbackSubtitle: 'Sus comentarios nos ayudan a mejorar continuamente.',
    feedbackPlaceholder: 'Escriba su comentario o sugerencia (opcional)...',
    submitting: 'Enviando...',
    submitFeedback: 'Enviar comentario',

    welcomeToClub: '¡Bienvenido al Club!',
    welcomeToClubDesc: (name) => `Ya es miembro del club de fidelidad de ${name}. Le enviaremos promociones exclusivas.`,
    vipClubDefaultTitle: 'Club de Socios VIP',
    vipPerk: 'Ventaja de Socio',
    vipPerkDefault: 'Descuentos exclusivos, regalos de cumpleaños e invitaciones',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'ej. Carlos García',
    emailAddress: 'Correo electrónico',
    emailPlaceholder: 'carlos@example.com',
    phoneOptional: 'Teléfono (opcional)',
    phonePlaceholder: '+34 600 000 000',
    kvkkConsent: 'Acepto recibir comunicaciones sobre promociones, descuentos y eventos especiales.',
    enrolling: 'Registrando...',
    joinVipClub: 'Unirme al Club VIP',
    close: 'Cerrar',
    offersChip: 'Ofertas',
    feedbackChip: 'Opinión',
    menuChip: 'Menú',
  },

  ar: {
    wifiTitle: 'شبكة واي فاي للضيوف',
    wifiSubtitle: 'اتصل بشبكة الإنترنت اللاسلكية فائقة السرعة الخاصة بنا.',
    networkName: 'اسم الشبكة (SSID)',
    wifiPassword: 'كلمة مرور واي فاي',
    copyPassword: 'نسخ كلمة المرور',
    copied: 'تم النسخ',
    quickConnectInstructions: 'خطوات الاتصال السريع',
    quickConnectStep1: '1. انقر فوق "نسخ كلمة المرور" أعلاه.',
    quickConnectStep2: (ssid) => `2. انتقل إلى الإعدادات > Wi-Fi، واختر "${ssid}" ثم الصق كلمة المرور.`,

    googleReviewTitle: 'أسعدتنا زيارتكم الكريمة! 🎉',
    googleReviewSubtitle: (name) => `هل ترغب في دعم فريق ${name} بمشاركة تقييمك بـ 5 نجوم على خرائط Google؟`,
    copyReviewAndPost: 'نسخ التقييم والمشاركة على Google',
    post5Stars: 'إعطاء 5 نجوم على Google',
    reviewCopiedNotice: '✓ تم نسخ التقييم إلى الحافظة! يمكنك لصقه في صفحة Google.',

    promoCode: 'رمز الخصم',
    copyCode: 'نسخ الرمز',
    codeCopied: 'تم النسخ',
    validUntil: 'صالح حتى:',

    feedbackReceivedTitle: 'تم استلام ملاحظاتكم!',
    feedbackReceivedDesc: 'شكراً جزيلاً لرأيك القيم. تمت مشاركة ملاحظاتك مع الإدارة لتحسين جودة خدماتنا.',
    howWasExperience: 'كيف كانت تجربتكم اليوم؟',
    feedbackSubtitle: 'آراؤكم تساعدنا على الارتقاء بمستوى الخدمة دائماً.',
    feedbackPlaceholder: 'اكتب ملاحظتك أو اقتراحك (اختياري)...',
    submitting: 'جاري الإرسال...',
    submitFeedback: 'إرسال الملاحظات',

    welcomeToClub: 'أهلاً بكم في نادي التميز!',
    welcomeToClubDesc: (name) => `تم تسجيلكم بنجاح في نادي امتيازات ${name}. ستصلكم أحدث العروض الحصرية.`,
    vipClubDefaultTitle: 'نادي كبار الشخصيات VIP',
    vipPerk: 'ميزة العضوية',
    vipPerkDefault: 'خصومات حصرية، هدايا أعياد الميلاد ودعوات خاصة',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'مثال: محمد عبدالله',
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'mohamed@example.com',
    phoneOptional: 'رقم الهاتف (اختياري)',
    phonePlaceholder: '+966 50 000 0000',
    kvkkConsent: 'أوافق على استلام الرسائل الترويجية والخصومات والدعوات الخاصة.',
    enrolling: 'جاري التسجيل...',
    joinVipClub: 'الانضمام إلى نادي VIP',
    close: 'إغلاق',
    offersChip: 'العروض',
    feedbackChip: 'إبداء الرأي',
    menuChip: 'قائمة الطعام',
  },

  zh: {
    wifiTitle: '贵宾无线网络',
    wifiSubtitle: '连接至本店高速无线Wi-Fi。',
    networkName: '网络名称 (SSID)',
    wifiPassword: 'WI-FI 密码',
    copyPassword: '复制密码',
    copied: '已复制',
    quickConnectInstructions: '快速连接指南',
    quickConnectStep1: '1. 点击上方的“复制密码”。',
    quickConnectStep2: (ssid) => `2. 打开手机“设置 > Wi-Fi”，选择“${ssid}”并粘贴密码。`,

    googleReviewTitle: '非常感谢您的光临与好评！🎉',
    googleReviewSubtitle: (name) => `您愿意在谷歌地图上为 ${name} 留下五星好评以支持我们吗？`,
    copyReviewAndPost: '复制好评并在谷歌发布',
    post5Stars: '在谷歌地图评5星',
    reviewCopiedNotice: '✓ 评语已复制至剪贴板！请前往谷歌页面粘贴。',

    promoCode: '优惠码',
    copyCode: '复制',
    codeCopied: '已复制',
    validUntil: '有效期至：',

    feedbackReceivedTitle: '已收到您的反馈！',
    feedbackReceivedDesc: '衷心感谢您的宝贵建议。我们已将意见同步给管理团队以提升服务水准。',
    howWasExperience: '您对本次体验满意吗？',
    feedbackSubtitle: '您的宝贵意见有助于我们不断改进。',
    feedbackPlaceholder: '请输入您的建议或点评（选填）...',
    submitting: '提交中...',
    submitFeedback: '发送反馈',

    welcomeToClub: '欢迎加入贵宾俱乐部！',
    welcomeToClubDesc: (name) => `您已成功加入 ${name} 专属贵宾俱乐部，专属特惠将直接发送给您。`,
    vipClubDefaultTitle: 'VIP贵宾俱乐部',
    vipPerk: '会员专属礼遇',
    vipPerkDefault: '专属折扣、生日惊喜款待及尊贵活动邀请',
    fullName: '姓名',
    fullNamePlaceholder: '例如：李明',
    emailAddress: '电子邮箱',
    emailPlaceholder: 'liming@example.com',
    phoneOptional: '手机号码（选填）',
    phonePlaceholder: '+86 138 0000 0000',
    kvkkConsent: '我同意接收有关专属优惠、折扣及特别活动的信息。',
    enrolling: '注册中...',
    joinVipClub: '加入VIP俱乐部',
    close: '关闭',
    offersChip: '优惠活动',
    feedbackChip: '评价反馈',
    menuChip: '电子菜单',
  },

  pt: {
    wifiTitle: 'Wi-Fi para Clientes',
    wifiSubtitle: 'Conecte-se à nossa internet sem fio de alta velocidade.',
    networkName: 'NOME DA REDE (SSID)',
    wifiPassword: 'SENHA DO WI-FI',
    copyPassword: 'Copiar Senha',
    copied: 'Copiado',
    quickConnectInstructions: 'Passos para Conexão Rápida',
    quickConnectStep1: '1. Toque em "Copiar Senha" acima.',
    quickConnectStep2: (ssid) => `2. Acesse Ajustes > Wi-Fi, selecione "${ssid}" e cole a senha.`,

    googleReviewTitle: 'Ficamos muito felizes com a sua visita! 🎉',
    googleReviewSubtitle: (name) => `Gostaria de apoiar a equipe de ${name} publicando sua avaliação 5 estrelas no Google Maps?`,
    copyReviewAndPost: 'Copiar Avaliação & Abrir Google',
    post5Stars: 'Dar 5 Estrelas no Google',
    reviewCopiedNotice: '✓ Avaliação copiada! Cole na página do Google.',

    promoCode: 'CÓDIGO PROMOCIONAL',
    copyCode: 'Copiar',
    codeCopied: 'Copiado',
    validUntil: 'Válido até:',

    feedbackReceivedTitle: 'Opinião Recebida!',
    feedbackReceivedDesc: 'Muito obrigado pelo seu feedback. Compartilhamos com a nossa equipe para aprimorar o atendimento.',
    howWasExperience: 'Como foi sua experiência?',
    feedbackSubtitle: 'Sua opinião nos ajuda a melhorar constantemente.',
    feedbackPlaceholder: 'Escreva seu comentário ou sugestão (opcional)...',
    submitting: 'Enviando...',
    submitFeedback: 'Enviar Avaliação',

    welcomeToClub: 'Bem-vindo ao Clube!',
    welcomeToClubDesc: (name) => `Você agora é membro do clube de vantagens de ${name}. Enviaremos ofertas exclusivas para você.`,
    vipClubDefaultTitle: 'Clube VIP de Vantagens',
    vipPerk: 'Benefício de Membro',
    vipPerkDefault: 'Descontos exclusivos, mimos de aniversário e convites especiais',
    fullName: 'Nome Completo',
    fullNamePlaceholder: 'ex. João Silva',
    emailAddress: 'E-mail',
    emailPlaceholder: 'joao@example.com',
    phoneOptional: 'Telefone (Opcional)',
    phonePlaceholder: '+55 (11) 90000-0000',
    kvkkConsent: 'Concordo em receber mensagens sobre promoções, descontos e eventos especiais.',
    enrolling: 'Cadastrando...',
    joinVipClub: 'Participar do Clube VIP',
    close: 'Fechar',
    offersChip: 'Ofertas',
    feedbackChip: 'Avaliação',
    menuChip: 'Cardápio',
  },

  id: {
    wifiTitle: 'Jaringan Wi-Fi Tamu',
    wifiSubtitle: 'Terhubung ke internet nirkabel berkecepatan tinggi kami.',
    networkName: 'NAMA JARINGAN (SSID)',
    wifiPassword: 'KATA SANDI WI-FI',
    copyPassword: 'Salin Kata Sandi',
    copied: 'Tersalin',
    quickConnectInstructions: 'Panduan Sambungan Cepat',
    quickConnectStep1: '1. Ketuk "Salin Kata Sandi" di atas.',
    quickConnectStep2: (ssid) => `2. Buka Pengaturan > Wi-Fi, pilih "${ssid}" dan tempel kata sandi.`,

    googleReviewTitle: 'Terima Kasih Banyak! 🎉',
    googleReviewSubtitle: (name) => `Apakah Anda bersedia mendukung tim ${name} dengan memberikan ulasan bintang 5 di Google Maps?`,
    copyReviewAndPost: 'Salin Ulasan & Buka Google',
    post5Stars: 'Beri Bintang 5 di Google',
    reviewCopiedNotice: '✓ Ulasan disalin! Tempel di halaman Google Maps.',

    promoCode: 'KODE PROMO',
    copyCode: 'Salin',
    codeCopied: 'Tersalin',
    validUntil: 'Berlaku hingga:',

    feedbackReceivedTitle: 'Masukan Diterima!',
    feedbackReceivedDesc: 'Terima kasih banyak atas ulasan Anda. Masukan ini dibagikan ke manajemen untuk meningkatkan layanan.',
    howWasExperience: 'Bagaimana pengalaman Anda?',
    feedbackSubtitle: 'Masukan Anda membantu kami terus meningkatkan kualitas pelayanan.',
    feedbackPlaceholder: 'Tulis komentar atau saran Anda (opsional)...',
    submitting: 'Mengirim...',
    submitFeedback: 'Kirim Masukan',

    welcomeToClub: 'Selamat Bergabung!',
    welcomeToClubDesc: (name) => `Anda kini terdaftar dalam klub keistimewaan ${name}. Penawaran eksklusif akan dikirimkan kepada Anda.`,
    vipClubDefaultTitle: 'Klub Anggota VIP',
    vipPerk: 'Keuntungan Anggota',
    vipPerkDefault: 'Diskon eksklusif, suguhan ulang tahun, dan undangan khusus',
    fullName: 'Nama Lengkap',
    fullNamePlaceholder: 'cth. Budi Santoso',
    emailAddress: 'Alamat Email',
    emailPlaceholder: 'budi@example.com',
    phoneOptional: 'Nomor Telepon (Opsional)',
    phonePlaceholder: '+62 812-0000-0000',
    kvkkConsent: 'Saya setuju menerima promosi, diskon, dan informasi acara spesial.',
    enrolling: 'Mendaftar...',
    joinVipClub: 'Gabung Klub VIP',
    close: 'Tutup',
    offersChip: 'Penawaran',
    feedbackChip: 'Ulasan',
    menuChip: 'Menu',
  },

  ja: {
    wifiTitle: 'ゲスト用Wi-Fi',
    wifiSubtitle: '高速ワイヤレスインターネットをご利用いただけます。',
    networkName: 'ネットワーク名 (SSID)',
    wifiPassword: 'WI-FI パスワード',
    copyPassword: 'パスワードをコピー',
    copied: 'コピー完了',
    quickConnectInstructions: '接続方法のご案内',
    quickConnectStep1: '1. 上記の「パスワードをコピー」をタップします。',
    quickConnectStep2: (ssid) => `2. 設定 > Wi-Fi から「${ssid}」を選択して貼り付けます。`,

    googleReviewTitle: '温かいご感想をありがとうございます！🎉',
    googleReviewSubtitle: (name) => `${name}のスタッフへの応援として、Googleマップで星5つの口コミを投稿していただけますか？`,
    copyReviewAndPost: '口コミをコピーしてGoogleで投稿',
    post5Stars: 'Googleで星5つをつける',
    reviewCopiedNotice: '✓ 口コミをコピーしました！Googleの投稿画面に貼り付けてください。',

    promoCode: 'クーポンコード',
    copyCode: 'コピー',
    codeCopied: 'コピー完了',
    validUntil: '有効期限:',

    feedbackReceivedTitle: 'ご意見を送信しました！',
    feedbackReceivedDesc: '貴重なご意見をいただきありがとうございます。今後のサービス向上のため役立ててまいります。',
    howWasExperience: '本日の体験はいかがでしたか？',
    feedbackSubtitle: 'お客様のご意見をもとに、より良いおもてなしを提供いたします。',
    feedbackPlaceholder: 'ご感想やご要望をお聞かせください（任意）...',
    submitting: '送信中...',
    submitFeedback: 'ご意見を送信',

    welcomeToClub: 'VIPクラブへようこそ！',
    welcomeToClubDesc: (name) => `${name}の会員クラブへのご登録が完了しました。限定の優待情報をメールでお届けします。`,
    vipClubDefaultTitle: 'VIPメンバーズクラブ',
    vipPerk: '会員特典',
    vipPerkDefault: '限定割引、お誕生日特典、プライベートイベントへのご招待',
    fullName: 'お名前',
    fullNamePlaceholder: '例: 山田 太郎',
    emailAddress: 'メールアドレス',
    emailPlaceholder: 'taro@example.com',
    phoneOptional: 'お電話番号（任意）',
    phonePlaceholder: '090-0000-0000',
    kvkkConsent: '限定特典、割引情報、イベントのご案内を受信することに同意します。',
    enrolling: '登録中...',
    joinVipClub: 'VIPクラブに入会する',
    close: '閉じる',
    offersChip: '特典・割引',
    feedbackChip: 'ご意見・評価',
    menuChip: 'メニュー',
  },
};

export function getSmartQrText(lang: SupportedLanguage): SmartQrTranslations {
  return SMART_QR_TRANSLATIONS[lang] || SMART_QR_TRANSLATIONS.en;
}
