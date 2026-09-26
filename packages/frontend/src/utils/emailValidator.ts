// Popular disposable / temp-mail email domains
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'mailinator2.com',
  'mailin8r.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmailo.com',
  'tempmailgen.com',
  'tempail.com',
  'tmailor.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'spam4.me',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'dropmail.me',
  'getairmail.com',
  'mohmal.com',
  'emailondeck.com',
  'crazymailing.com',
  'generator.email',
  'getnada.com',
  'nada.ltd',
  'inboxkitten.com',
  'mailnesia.com',
  'burnermail.io',
  '33mail.com',
  'byom.de',
]);

const DUMMY_EMAILS = new Set([
  'test@test.com',
  'admin@admin.com',
  'fake@fake.com',
  'asdasd@gmail.com',
  'asdasd@hotmail.com',
  'pappipappi@gmail.com',
  'pappipappi@hotmail.com',
  'pappi@pappi.com',
  'deneme@deneme.com',
  'deneme@gmail.com',
]);

export function validateEmailClient(email: string): { isValid: boolean; error?: string } {
  const clean = email.toLowerCase().trim();
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'Lütfen geçerli bir e-posta adresi giriniz.' };
  }

  const [localPart, domain] = parts;

  // Disposable domain check
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Geçici (temp-mail) e-posta adresleri kabul edilmemektedir. Lütfen kalıcı bir kurumsal e-posta adresi giriniz.',
    };
  }

  // Known dummy emails
  if (DUMMY_EMAILS.has(clean)) {
    return {
      isValid: false,
      error: 'Lütfen geçerli ve aktif bir kurumsal e-posta adresi giriniz.',
    };
  }

  // Repeating characters (e.g. aaaaa@, 11111@)
  if (/(.)\1{4,}/.test(localPart)) {
    return {
      isValid: false,
      error: 'Lütfen geçerli bir kurumsal e-posta adresi giriniz.',
    };
  }

  // Obvious keyboard mashing / repeated troll syllables
  const dummyTokens = ['pappipappi', 'asdasd', 'qweqwe', '123123', 'testtest', 'zxcvzxcv'];
  if (dummyTokens.some((tok) => localPart.includes(tok))) {
    return {
      isValid: false,
      error: 'Lütfen geçerli bir kurumsal e-posta adresi giriniz.',
    };
  }

  return { isValid: true };
}
