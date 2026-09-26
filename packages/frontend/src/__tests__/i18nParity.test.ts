import { describe, it, expect } from 'vitest';
import { translations, SupportedLanguage } from '../i18n';

function getAllKeyPaths(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getAllKeyPaths(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

function getValueByPath(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

describe('11-Language i18n Parity & Integrity Automated Test Suite', () => {
  const baseLang = 'en';
  const baseDict = translations[baseLang];
  const baseKeys = getAllKeyPaths(baseDict).sort();
  const allLanguages = Object.keys(translations) as SupportedLanguage[];

  it('all 11 languages are registered in translations dictionary', () => {
    const expectedLangs: SupportedLanguage[] = ['en', 'tr', 'es', 'zh', 'ar', 'de', 'fr', 'pt', 'id', 'ja', 'ru'];
    expect(allLanguages.sort()).toEqual(expectedLangs.sort());
  });

  allLanguages.forEach((lang) => {
    if (lang === baseLang) return;

    describe(`Language parity check: [${lang.toUpperCase()}] vs [EN]`, () => {
      const targetDict = translations[lang];
      const targetKeys = getAllKeyPaths(targetDict).sort();

      it(`has all keys that exist in base language [en]`, () => {
        const missingKeys = baseKeys.filter((key) => getValueByPath(targetDict, key) === undefined);
        expect(
          missingKeys,
          `Language "${lang}" is missing ${missingKeys.length} keys that exist in EN:\n${missingKeys.join('\n')}`
        ).toEqual([]);
      });

      it(`has no extra or orphaned keys that do not exist in [en]`, () => {
        const extraKeys = targetKeys.filter((key) => getValueByPath(baseDict, key) === undefined);
        expect(
          extraKeys,
          `Language "${lang}" has ${extraKeys.length} extraneous keys not found in EN:\n${extraKeys.join('\n')}`
        ).toEqual([]);
      });

      it(`contains no empty string or null values`, () => {
        const emptyKeys = targetKeys.filter((key) => {
          const val = getValueByPath(targetDict, key);
          return val === '' || val === null || val === undefined;
        });
        expect(
          emptyKeys,
          `Language "${lang}" has empty string or null values for:\n${emptyKeys.join('\n')}`
        ).toEqual([]);
      });
    });
  });

  it('preserves essential smartQr keys across all languages', () => {
    allLanguages.forEach((lang) => {
      const dict = translations[lang] as any;
      expect(dict.smartQr, `smartQr should exist in ${lang}`).toBeDefined();
      expect(dict.smartQr.tabs.qrcodes, `smartQr.tabs.qrcodes in ${lang}`).toBeTruthy();
      expect(dict.smartQr.tabs.modules, `smartQr.tabs.modules in ${lang}`).toBeTruthy();
      expect(dict.smartQr.table.type, `smartQr.table.type in ${lang}`).toBeTruthy();
      expect(dict.smartQr.config.digitalTipping, `smartQr.config.digitalTipping in ${lang}`).toBeTruthy();
      expect(dict.smartQr.config.saveSettings, `smartQr.config.saveSettings in ${lang}`).toBeTruthy();
    });
  });
});
