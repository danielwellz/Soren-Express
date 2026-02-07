import { TFunction } from 'i18next';

const ERROR_MAP: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /invalid credentials/i, key: 'errors.unauthorized' },
  { pattern: /unauthorized|token/i, key: 'errors.unauthorized' },
  { pattern: /forbidden|permission/i, key: 'errors.forbidden' },
  { pattern: /cart is empty/i, key: 'errors.emptyCart' },
  { pattern: /invalid coupon/i, key: 'errors.invalidCoupon' },
  { pattern: /coupon expired/i, key: 'errors.couponExpired' },
  { pattern: /insufficient inventory/i, key: 'errors.insufficientInventory' },
  { pattern: /payment intent is missing/i, key: 'errors.paymentRequired' },
  { pattern: /merge your guest cart/i, key: 'errors.mergeFailed' },
  { pattern: /network error|failed to fetch|fetch failed/i, key: 'errors.network' },
];

export function mapErrorMessage(message: string, t: TFunction): string {
  const normalized = message.trim();
  const mapped = ERROR_MAP.find((item) => item.pattern.test(normalized));

  if (mapped) {
    return t(mapped.key);
  }

  return t('errors.default');
}
