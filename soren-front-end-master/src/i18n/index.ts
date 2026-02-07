import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import fa from '../locales/fa.json';

export type AppLanguage = 'en' | 'fa';

export const LANGUAGE_STORAGE_KEY = 'soren_language';

export function sanitizeLanguage(value: string | null | undefined): AppLanguage {
  return value === 'fa' ? 'fa' : 'en';
}

export function getStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored) {
    return sanitizeLanguage(stored);
  }

  const browser = window.navigator.language?.toLowerCase() || '';
  if (browser.startsWith('fa')) {
    return 'fa';
  }

  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
  returnNull: false,
  supportedLngs: ['en', 'fa'],
});

export default i18n;
