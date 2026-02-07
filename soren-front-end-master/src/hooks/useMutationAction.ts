import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { getApolloErrorMessage } from '../lib/apolloErrors';
import { mapErrorMessage } from '../lib/localizedErrors';

type MutationActionOptions = {
  successMessage?: string;
  errorMessage?: string;
};

export function useMutationAction() {
  const { showToast } = useToast();
  const { t } = useTranslation();

  return useCallback(
    async <T>(run: () => Promise<T>, options: MutationActionOptions = {}): Promise<T | null> => {
      try {
        const result = await run();
        if (options.successMessage) {
          showToast(options.successMessage, 'success');
        }
        return result;
      } catch (error) {
        const fallbackMessage = options.errorMessage || t('errors.default');
        const parsed = getApolloErrorMessage(error, fallbackMessage);
        const localized =
          options.errorMessage && parsed === options.errorMessage
            ? options.errorMessage
            : mapErrorMessage(parsed, t);
        showToast(localized, 'error');
        return null;
      }
    },
    [showToast, t],
  );
}
