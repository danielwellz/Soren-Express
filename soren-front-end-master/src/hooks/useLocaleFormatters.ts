import { useMemo } from 'react';
import { useLocale } from '../context/LocaleContext';

function localeTag(language: 'en' | 'fa'): string {
  return language === 'fa' ? 'fa-IR' : 'en-US';
}

export function useLocaleFormatters() {
  const { language } = useLocale();

  return useMemo(() => {
    const locale = localeTag(language);
    const currency = 'USD';

    const numberFormatter = new Intl.NumberFormat(locale);
    const currencyFormatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    });

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return {
      formatNumber: (value: number) => numberFormatter.format(value),
      formatCurrency: (value: number) => currencyFormatter.format(value),
      formatDateTime: (value: Date | string | number) => dateFormatter.format(new Date(value)),
    };
  }, [language]);
}
