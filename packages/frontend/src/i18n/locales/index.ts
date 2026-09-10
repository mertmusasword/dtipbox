import en from './en';
import tr from './tr';
import es from './es';
import zh from './zh';
import ar from './ar';
import de from './de';
import fr from './fr';
import pt from './pt';
import id from './id';
import ja from './ja';
import { SupportedLanguage, TranslationDictionary } from '../types';

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  tr,
  es,
  zh,
  ar,
  de,
  fr,
  pt,
  id,
  ja,
};

export const locales = translations;

export { en, tr, es, zh, ar, de, fr, pt, id, ja };
