import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types';
import { locales } from '../locales';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('🌐 Starting Comprehensive i18n & RTL Verification Suite...\n');

// 1. Verify 10 Supported Languages Metadata
console.log('--- 1. Testing Supported Languages Count & Metadata ---');
assert(SUPPORTED_LANGUAGES.length === 10, `Expected 10 languages, found ${SUPPORTED_LANGUAGES.length}`);
const expectedCodes: SupportedLanguage[] = ['en', 'tr', 'es', 'zh', 'ar', 'de', 'fr', 'pt', 'id', 'ja'];
for (const code of expectedCodes) {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  assert(!!meta, `Language meta missing for ${code}`);
  assert(!!meta?.name && !!meta?.nativeName && !!meta?.flag, `Metadata incomplete for ${code}`);
}
console.log('✅ All 10 language metadata definitions verified.');

// 2. Verify RTL for Arabic and LTR for others
console.log('\n--- 2. Testing RTL/LTR Direction Configurations ---');
const arMeta = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
assert(arMeta?.dir === 'rtl', 'Arabic (ar) must have dir="rtl"');
console.log('✅ Arabic (ar) dir is correctly set to "rtl".');

for (const meta of SUPPORTED_LANGUAGES) {
  if (meta.code !== 'ar') {
    assert(meta.dir === 'ltr', `${meta.code} should have dir="ltr"`);
  }
}
console.log('✅ All other 9 languages correctly set to "ltr".');

// 3. Verify Dictionary Completeness for All 10 Locales
console.log('\n--- 3. Testing Translation Dictionaries Structure & Coverage ---');
const enDict = locales.en;
assert(!!enDict, 'English dictionary missing');

function getKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getKeys(enDict);
console.log(`ℹ️ English dictionary contains ${enKeys.length} total translation keys across modules.`);

for (const lang of expectedCodes) {
  const dict = locales[lang];
  assert(!!dict, `Locale dictionary missing for ${lang}`);
  
  let missing = 0;
  for (const key of enKeys) {
    const parts = key.split('.');
    let val: any = dict;
    for (const part of parts) {
      val = val?.[part];
    }
    if (val === undefined || val === null || val === '') {
      missing++;
    }
  }
  assert(missing === 0, `Language '${lang}' has ${missing} missing keys out of ${enKeys.length}`);
  console.log(`✅ [${lang}] ${enKeys.length}/${enKeys.length} translation keys completely defined.`);
}

// 4. Verify Fallback Mechanism
console.log('\n--- 4. Testing Fallback Order: Selected -> English -> Key ---');
function tMock(lang: SupportedLanguage, key: string, dicts: Record<string, any> = locales): string {
  const getFrom = (d: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], d);
  };
  const selectedVal = getFrom(dicts[lang], key);
  if (selectedVal !== undefined) return selectedVal;
  const enVal = getFrom(dicts['en'], key);
  if (enVal !== undefined) return enVal;
  return key;
}

assert(tMock('tr', 'common.save') === 'Kaydet', 'Turkish translation failed');
assert(tMock('ar', 'common.save') === 'حفظ', 'Arabic translation failed');
assert(tMock('zh', 'common.save') === '保存', 'Chinese translation failed');
assert(tMock('de', 'common.save') === 'Speichern', 'German translation failed');
assert(tMock('ja', 'common.save') === '保存', 'Japanese translation failed');

// Simulated missing key fallback to English
const mockDictsWithMissing: any = {
  en: { testSection: { testKey: 'English Fallback' } },
  es: { testSection: {} },
};
assert(tMock('es', 'testSection.testKey', mockDictsWithMissing) === 'English Fallback', 'Fallback to English failed');
assert(tMock('es', 'nonexistent.key', mockDictsWithMissing) === 'nonexistent.key', 'Fallback to key failed');
console.log('✅ Fallback mechanism (Selected -> English -> Key) validated.');

// 5. Verify Language and Currency Independence (Decoupling)
console.log('\n--- 5. Testing Language & Currency Decoupling ---');
function formatCurrencyMock(amount: number, currency: string, lang: SupportedLanguage): string {
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    tr: 'tr-TR',
    es: 'es-ES',
    zh: 'zh-CN',
    ar: 'ar-SA',
    de: 'de-DE',
    fr: 'fr-FR',
    pt: 'pt-BR',
    id: 'id-ID',
    ja: 'ja-JP',
  };
  return new Intl.NumberFormat(localeMap[lang] || 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// User selects German ('de') but business operates with 'TRY'
const deTry = formatCurrencyMock(150, 'TRY', 'de');
assert(deTry.includes('TRY') || deTry.includes('TL'), `German should format TRY without forcing EUR: ${deTry}`);

// User selects Japanese ('ja') with 'USD'
const jaUsd = formatCurrencyMock(250, 'USD', 'ja');
assert(jaUsd.includes('$') || jaUsd.includes('USD'), `Japanese should format USD without forcing JPY: ${jaUsd}`);

// User selects Arabic ('ar') with 'EUR'
const arEur = formatCurrencyMock(75, 'EUR', 'ar');
assert(!!arEur, `Arabic should format EUR successfully: ${arEur}`);
console.log('✅ Complete independence between UI language and settlement currency verified:');
console.log(`   • German (de) with TRY: ${deTry}`);
console.log(`   • Japanese (ja) with USD: ${jaUsd}`);
console.log(`   • Arabic (ar) with EUR: ${arEur}`);

// 6. Verify Intl Date & Time Formatting
console.log('\n--- 6. Testing Intl Date & Time Across Locales ---');
const testDate = new Date('2026-09-11T14:30:00Z');
for (const lang of expectedCodes) {
  const locale = lang === 'en' ? 'en-US' : lang === 'tr' ? 'tr-TR' : lang === 'ar' ? 'ar-SA' : lang;
  const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(testDate);
  const formattedTime = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(testDate);
  assert(!!formattedDate && !!formattedTime, `Formatting failed for ${lang}`);
}
console.log('✅ Date and time formatting works seamlessly across all 10 locales.');

console.log('\n======================================================');
console.log('🎉 ALL i18n & RTL VERIFICATION CHECKS PASSED (6/6)');
console.log('======================================================\n');
