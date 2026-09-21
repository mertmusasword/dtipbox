import { translations } from '../src/i18n/locales';

function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj || {})) {
    const full = prefix ? prefix + '.' + k : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(translations.en));
const trKeys = new Set(getKeys(translations.tr));

console.log('Total keys in EN:', enKeys.size);
console.log('Total keys in TR:', trKeys.size);

const langs: (keyof typeof translations)[] = ['tr', 'es', 'zh', 'ar', 'de', 'fr', 'pt', 'id', 'ja', 'ru'];
for (const lang of langs) {
  const current = translations[lang];
  const currentKeys = new Set(getKeys(current));
  const missingFromEn = [...enKeys].filter((k) => !currentKeys.has(k));
  const extraVsEn = [...currentKeys].filter((k) => !enKeys.has(k));
  console.log(`=== ${lang.toUpperCase()} === Total: ${currentKeys.size} | Missing vs EN: ${missingFromEn.length} | Extra vs EN: ${extraVsEn.length}`);
  if (missingFromEn.length > 0) {
    console.log('  Missing keys (first 15):', missingFromEn.slice(0, 15));
  }
}
