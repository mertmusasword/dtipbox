/**
 * Email validation and anti-spam / disposable email detection utility.
 */

// Popular disposable and temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  // Mailinator & derivatives
  'mailinator.com',
  'mailinator2.com',
  'mailin8r.com',
  'suremail.info',
  'spamherelots.com',
  'binkmail.com',
  'safetymail.info',
  
  // 10MinuteMail
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  '10minutemail.be',
  '10minutemail.co.uk',
  '10minutemail.co.za',
  '20minutemail.it',

  // TempMail & Temp-Mail.org
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmailo.com',
  'tempmailgen.com',
  'tempail.com',
  'tmailor.com',
  'tmail.ws',

  // Guerrilla Mail
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'spam4.me',
  'pokemail.net',

  // YOPmail & forks
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',

  // Throwaway & TrashMail
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashymail.com',
  'mytrashmail.com',
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
  'discard.email',
  'spambog.com',
  'mintemail.com',
  'burnermail.io',
  '0147.org',
  '10mail.org',
  '33mail.com',
  'mailnull.com',
  'spamgourmet.com',
  'spamfree24.org',
  'maildrop.cc',
  'harakirimail.com',
  'mailcatch.com',
  'byom.de',
  'dayrep.com',
  'teleworm.us',
  'armyspy.com',
  'cuvox.de',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
]);

// Obvious spam / dummy email patterns
const OBVIOUS_DUMMY_EMAILS = new Set([
  'test@test.com',
  'test@test.net',
  'test@test.org',
  'admin@admin.com',
  'sample@sample.com',
  'fake@fake.com',
  'asd@asd.com',
  'asdasd@gmail.com',
  'asdasd@hotmail.com',
  'asdasd@asdasd.com',
  'qwe@qwe.com',
  'qwerty@qwerty.com',
  'user@user.com',
  'mail@mail.com',
  'info@info.com',
  'deneme@deneme.com',
  'deneme@gmail.com',
  'deneme@hotmail.com',
  'pappipappi@gmail.com',
  'pappipappi@hotmail.com',
  'pappi@pappi.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Checks if a domain is a known disposable/temporary email provider.
 */
export function isDisposableEmailDomain(domain: string): boolean {
  const cleanDomain = domain.toLowerCase().trim();
  if (DISPOSABLE_DOMAINS.has(cleanDomain)) {
    return true;
  }
  // Check subdomain of disposable (e.g. sub.mailinator.com)
  for (const disp of DISPOSABLE_DOMAINS) {
    if (cleanDomain.endsWith('.' + disp)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates an email address against disposable providers and obvious dummy patterns.
 */
export function validateEmailQuality(email: string): EmailValidationResult {
  const clean = email.toLowerCase().trim();
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'Geçersiz e-posta adresi formatı' };
  }

  const [localPart, domain] = parts;

  // 1. Check disposable domain
  if (isDisposableEmailDomain(domain)) {
    return {
      isValid: false,
      error: 'Geçici (temp-mail) e-posta adresleri kabul edilmemektedir. Lütfen kalıcı ve geçerli bir kurumsal e-posta adresi giriniz.',
    };
  }

  // 2. Check exact known dummy email matches
  if (OBVIOUS_DUMMY_EMAILS.has(clean)) {
    return {
      isValid: false,
      error: 'Lütfen geçerli ve aktif bir kurumsal e-posta adresi giriniz.',
    };
  }

  // 3. Check for 5+ repeating consecutive characters (e.g. aaaaa@, 11111@, xxxxxx@)
  if (/(.)\1{4,}/.test(localPart)) {
    return {
      isValid: false,
      error: 'Lütfen geçerli ve aktif bir kurumsal e-posta adresi giriniz.',
    };
  }

  // 4. Check for repeating dummy syllables (e.g. pappipappi, asdasd, qweqwe)
  const dummyTokens = ['pappipappi', 'asdasd', 'qweqwe', '123123', 'testtest', 'zxcvzxcv'];
  if (dummyTokens.some((tok) => localPart.includes(tok))) {
    return {
      isValid: false,
      error: 'Lütfen geçerli ve aktif bir kurumsal e-posta adresi giriniz.',
    };
  }

  return { isValid: true };
}
