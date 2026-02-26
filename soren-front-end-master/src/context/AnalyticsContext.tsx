import { useMutation } from '@apollo/client';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TRACK_ANALYTICS_EVENT_MUTATION } from '../graphql/documents';
import { getSessionId } from '../lib/session';

type AnalyticsEventType = 'add_to_cart' | 'begin_checkout' | 'purchase';

type AnalyticsContextValue = {
  trackEvent: (eventType: AnalyticsEventType, metadata?: Record<string, unknown>) => Promise<void>;
};

const noopAnalytics: AnalyticsContextValue = {
  trackEvent: async () => undefined,
};

const AnalyticsContext = createContext<AnalyticsContextValue>(noopAnalytics);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [trackMutation] = useMutation(TRACK_ANALYTICS_EVENT_MUTATION);

  const trackEvent = useCallback<AnalyticsContextValue['trackEvent']>(
    async (eventType, metadata = {}) => {
      const localizedLabel = t(`analytics.events.${eventType}`);
      const payload = {
        ...metadata,
        locale: i18n.language,
        label: localizedLabel,
      };

      if (typeof window !== 'undefined') {
        const existing = (window as any).dataLayer || [];
        existing.push({ event: eventType, ...payload });
        (window as any).dataLayer = existing;
      }

      try {
        await trackMutation({
          variables: {
            input: {
              eventType,
              sessionId: getSessionId(),
              metadata: payload,
            },
          },
        });
      } catch (_error) {
        // Non-blocking analytics path.
      }
    },
    [i18n.language, t, trackMutation],
  );

  const value = useMemo(() => ({ trackEvent }), [trackEvent]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}
