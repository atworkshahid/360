import React, { createContext, useContext, useState, useEffect } from 'react';
import { enMessages } from './messages/en';
import { arMessages } from './messages/ar';
import { urMessages } from './messages/ur';
import { frMessages } from './messages/fr';
import { esMessages } from './messages/es';
import { deMessages } from './messages/de';
import { CourseLanguage, SUPPORTED_LANGUAGES } from '../types';

export const ALL_MESSAGES: Record<string, any> = {
  en: enMessages,
  ar: arMessages,
  ur: urMessages,
  fr: frMessages,
  es: esMessages,
  de: deMessages,
};

export function getLocaleFromLanguage(language: CourseLanguage | string): string {
  if (!language) return 'en';
  const norm = language.trim().toLowerCase();
  if (norm.includes('arabic') || norm === 'ar' || norm === 'العربية') return 'ar';
  if (norm.includes('urdu') || norm === 'ur' || norm === 'اردو') return 'ur';
  if (norm.includes('french') || norm === 'fr' || norm.includes('français')) return 'fr';
  if (norm.includes('spanish') || norm === 'es' || norm.includes('español')) return 'es';
  if (norm.includes('german') || norm === 'de' || norm.includes('deutsch')) return 'de';
  return 'en';
}

export function getLanguageFromLocale(locale: string): CourseLanguage {
  switch (locale) {
    case 'ar':
      return 'Arabic';
    case 'ur':
      return 'Urdu';
    case 'fr':
      return 'French';
    case 'es':
      return 'Spanish';
    case 'de':
      return 'German';
    default:
      return 'English';
  }
}

interface I18nContextValue {
  locale: string;
  language: CourseLanguage;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: CourseLanguage, dir?: 'ltr' | 'rtl') => void;
  formatNumber: (num: number) => string;
  formatPercent: (val: number) => string;
  formatDate: (date: string | Date) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  language: 'English',
  direction: 'ltr',
  setLanguage: () => {},
  formatNumber: (n) => String(n),
  formatPercent: (v) => `${v}%`,
  formatDate: (d) => new Date(d).toLocaleDateString(),
});

export const useI18n = () => useContext(I18nContext);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: CourseLanguage;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLanguage = 'English' }) => {
  const [language, setLanguageState] = useState<CourseLanguage>(() => {
    const saved = localStorage.getItem('mentisera_active_language');
    if (saved && ['English', 'Arabic', 'Urdu', 'French', 'Spanish', 'German'].includes(saved)) {
      return saved as CourseLanguage;
    }
    return initialLanguage;
  });

  const locale = getLocaleFromLanguage(language);
  const direction: 'ltr' | 'rtl' = language === 'Arabic' || language === 'Urdu' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('mentisera_active_language', language);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', direction);
    if (direction === 'rtl') {
      document.documentElement.classList.add('rtl-mode');
    } else {
      document.documentElement.classList.remove('rtl-mode');
    }
  }, [language, locale, direction]);

  useEffect(() => {
    const handleLanguageChanged = (e: Event) => {
      const customEv = e as CustomEvent<{ language: CourseLanguage; dir?: 'ltr' | 'rtl' }>;
      if (customEv.detail?.language) {
        setLanguage(customEv.detail.language, customEv.detail.dir);
      }
    };
    window.addEventListener('language_changed', handleLanguageChanged);
    return () => window.removeEventListener('language_changed', handleLanguageChanged);
  }, []);

  const setLanguage = (newLang: CourseLanguage, dir?: 'ltr' | 'rtl') => {
    setLanguageState(newLang);
    const targetDir = dir || (newLang === 'Arabic' || newLang === 'Urdu' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('dir', targetDir);
  };

  const messages = ALL_MESSAGES[locale] || enMessages;

  const formatNumber = (num: number): string => {
    try {
      return new Intl.NumberFormat(locale).format(num);
    } catch {
      return String(num);
    }
  };

  const formatPercent = (val: number): string => {
    try {
      return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(val / 100);
    } catch {
      return `${val}%`;
    }
  };

  const formatDate = (date: string | Date): string => {
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
    } catch {
      return new Date(date).toLocaleDateString();
    }
  };

  const contextValue: I18nContextValue = {
    locale,
    language,
    direction,
    setLanguage,
    formatNumber,
    formatPercent,
    formatDate,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export function useTranslations(namespace?: string) {
  const { locale } = useI18n();
  const messages = ALL_MESSAGES[locale] || ALL_MESSAGES.en || enMessages;

  return (key: string, values?: Record<string, string | number>): string => {
    let text: any = namespace && messages[namespace] ? messages[namespace][key] : messages[key];
    if (text === undefined && messages[key] !== undefined) {
      text = messages[key];
    }
    if (typeof text !== 'string') {
      return key;
    }
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };
}
