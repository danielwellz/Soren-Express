import { CacheProvider } from '@emotion/react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { AppLanguage, getStoredLanguage, LANGUAGE_STORAGE_KEY } from '../i18n';
import { ltrCache, rtlCache } from '../lib/emotionCache';

type TextDirection = 'ltr' | 'rtl';

type LocaleContextValue = {
  language: AppLanguage;
  direction: TextDirection;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function resolveDirection(language: AppLanguage): TextDirection {
  return language === 'fa' ? 'rtl' : 'ltr';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getStoredLanguage);

  useTranslation();

  useEffect(() => {
    void i18n.changeLanguage(language);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }

    const direction = resolveDirection(language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', direction);
    document.body.setAttribute('dir', direction);
  }, [language]);

  const value = useMemo<LocaleContextValue>(() => {
    return {
      language,
      direction: resolveDirection(language),
      setLanguage: (nextLanguage: AppLanguage) => {
        setLanguageState(nextLanguage);
      },
      toggleLanguage: () => {
        setLanguageState((old) => (old === 'en' ? 'fa' : 'en'));
      },
    };
  }, [language]);

  const activeCache = value.direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <LocaleContext.Provider value={value}>
      <CacheProvider value={activeCache}>{children}</CacheProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
}
