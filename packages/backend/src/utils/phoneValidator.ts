/**
 * Global phone number validator adhering to ITU-T E.164 and Turkish mobile standards.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

export function validateGlobalPhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Telefon numarası zorunludur.' };
  }

  const raw = phone.trim();

  // Allowed characters: digits, spaces, hyphens, plus (+), parentheses, dots
  if (!/^[+]?[0-9\s\-().]{7,30}$/.test(raw)) {
    return {
      isValid: false,
      error: 'Telefon numarası yalnızca rakam ve uluslararası ülke kodu (+) içerebilir.',
    };
  }

  // Extract only digits
  const digits = raw.replace(/\D/g, '');

  // E.164 standard: minimum 7, maximum 15 digits
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      error: 'Telefon numarası en az 7, en fazla 15 haneli olmalıdır.',
    };
  }

  // Check for dummy repeating numbers (e.g. 0000000000, 1111111111, 05555555555)
  if (/^(.)\1+$/.test(digits) || /^0?([0-9])\1{7,}$/.test(digits)) {
    return {
      isValid: false,
      error: 'Lütfen geçerli ve aktif bir telefon numarası giriniz.',
    };
  }

  // Check for sequential patterns (e.g. 123456789, 9876543210)
  const sequentialPatterns = [
    '12345678',
    '23456789',
    '34567890',
    '98765432',
    '87654321',
    '76543210',
    '01234567',
  ];
  if (sequentialPatterns.some((p) => digits.includes(p))) {
    return {
      isValid: false,
      error: 'Lütfen geçerli ve aktif bir telefon numarası giriniz.',
    };
  }

  // If starts with +, it's explicitly international (E.164)
  if (raw.startsWith('+')) {
    if (digits.startsWith('0')) {
      return {
        isValid: false,
        error: 'Uluslararası telefon numarası 0 ile başlayamaz (Örn: +90 5XX XXX XX XX veya +1 415...)',
      };
    }
    return { isValid: true, normalized: '+' + digits };
  }

  // If starts with 00 (international dial prefix)
  if (raw.startsWith('00')) {
    const without00 = digits.slice(2);
    if (without00.length >= 7 && without00.length <= 15) {
      return { isValid: true, normalized: '+' + without00 };
    }
  }

  // Local Turkish format: 11 digits starting with 05 (e.g. 05321234567)
  if (digits.length === 11 && digits.startsWith('05')) {
    return { isValid: true, normalized: '+90' + digits.slice(1) };
  }

  // Local Turkish format: 10 digits starting with 5 (e.g. 5321234567)
  if (digits.length === 10 && digits.startsWith('5')) {
    return { isValid: true, normalized: '+90' + digits };
  }

  // Turkish format with 90 prefix without +: 12 digits starting with 905 (e.g. 905321234567)
  if (digits.length === 12 && digits.startsWith('905')) {
    return { isValid: true, normalized: '+' + digits };
  }

  // If not matching Turkish standard and no leading '+',
  // numbers with fewer than 10 digits (e.g. 15072016) lack a valid country code.
  if (digits.length < 10) {
    return {
      isValid: false,
      error: 'Geçersiz telefon formatı. Uluslararası numaralar için lütfen ülke kodu (+90, +1, +44 vb.) ekleyiniz.',
    };
  }

  return { isValid: true, normalized: '+' + digits };
}
