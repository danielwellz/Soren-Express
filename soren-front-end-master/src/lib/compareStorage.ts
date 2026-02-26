import { RecentlyViewedProduct } from './recentlyViewed';

const STORAGE_KEY = 'soren_compare_products';

export function readCompareProducts(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => typeof item?.id === 'number');
  } catch (_error) {
    return [];
  }
}

export function toggleCompareProduct(product: RecentlyViewedProduct): RecentlyViewedProduct[] {
  const current = readCompareProducts();
  const exists = current.some((item) => item.id === product.id);
  const next = exists ? current.filter((item) => item.id !== product.id) : [...current, product].slice(-4);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function clearCompareProducts(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
