import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SupportedLanguage, LanguageMeta, SUPPORTED_LANGUAGES, TranslationDictionary } from './types';
import { translations } from './locales';

const STORAGE_KEY = 'naponi_user_language';

interface LanguageContextType {
  language: SupportedLanguage;
  currentMeta: LanguageMeta;
  setLanguage: (lang: SupportedLanguage) => void;
  dir: 'ltr' | 'rtl';
  t: (path: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currencyCode?: string, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  supportedLanguages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch (e) {
    // ignore storage error
  }

  try {
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    const primaryCode = browserLang.split('-')[0];
    const match = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === primaryCode || browserLang.startsWith(l.code.toLowerCase())
    );
    if (match) {
      return match.code;
    }
  } catch (e) {
    // ignore navigator error
  }

  return 'en';
}

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null || typeof curr !== 'object') return undefined;
    curr = curr[part];
  }
  return typeof curr === 'string' ? curr : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(detectInitialLanguage);

  const currentMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const dir = currentMeta.dir;

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save language preference to localStorage:', e);
    }
  }, []);

  // Synchronize HTML attributes (lang, dir) with active language and direction
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;

    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl-active');
      document.body.classList.add('rtl-active');
    } else {
      document.documentElement.classList.remove('rtl-active');
      document.body.classList.remove('rtl-active');
    }
  }, [language, dir]);

  // Translation function with fallback: Selected -> English -> Key
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const activeDict = translations[language];
      let value = getNestedValue(activeDict, path);

      // Fallback to English
      if (!value && language !== 'en') {
        value = getNestedValue(translations.en, path);
      }

      // Final fallback to key itself
      if (!value) {
        return path;
      }

      // Variable interpolation: {name}
      if (params) {
        return Object.entries(params).reduce((acc, [k, v]) => {
          return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }, value);
      }

      return value;
    },
    [language]
  );

  // Locale-aware number formatting
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(language, options).format(num);
      } catch (e) {
        return num.toLocaleString();
      }
    },
    [language]
  );

  // Locale-aware currency formatting: Currency code is completely decoupled from UI language!
  const formatCurrency = useCallback(
    (amount: number, currencyCode: string = 'USD', options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(language, {
          style: 'currency',
          currency: currencyCode.toUpperCase(),
          ...options,
        }).format(amount);
      } catch (e) {
        return `${amount.toFixed(2)} ${currencyCode}`;
      }
    },
    [language]
  );

  // Locale-aware date formatting
  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          ...options,
        }).format(d);
      } catch (e) {
        return String(date);
      }
    },
    [language]
  );

  // Locale-aware time formatting
  const formatTime = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(language, {
          hour: '2-digit',
          minute: '2-digit',
          ...options,
        }).format(d);
      } catch (e) {
        return String(date);
      }
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      currentMeta,
      setLanguage,
      dir,
      t,
      formatNumber,
      formatCurrency,
      formatDate,
      formatTime,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, currentMeta, setLanguage, dir, t, formatNumber, formatCurrency, formatDate, formatTime]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
