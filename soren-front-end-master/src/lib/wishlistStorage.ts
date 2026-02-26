import { RecentlyViewedProduct } from './recentlyViewed';

const STORAGE_KEY = 'soren_wishlist_products';

export function readWishlistProducts(): RecentlyViewedProduct[] {
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

export function toggleWishlistProduct(product: RecentlyViewedProduct): RecentlyViewedProduct[] {
  const current = readWishlistProducts();
  const exists = current.some((item) => item.id === product.id);
  const next = exists ? current.filter((item) => item.id !== product.id) : [product, ...current].slice(0, 24);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}
