export type RecentlyViewedProduct = {
  id: number;
  name: string;
  basePrice: number;
  thumbnail?: string;
  averageRating?: number;
  brand?: { name: string };
  category?: { name: string };
  variants?: Array<{ id: number; inventory?: { quantity: number; reserved: number } }>;
};

const STORAGE_KEY = 'soren_recently_viewed';

export function readRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item?.id === 'number');
  } catch (_error) {
    return [];
  }
}

export function pushRecentlyViewed(product: RecentlyViewedProduct): void {
  if (typeof window === 'undefined') {
    return;
  }

  const existing = readRecentlyViewed().filter((item) => item.id !== product.id);
  const next = [product, ...existing].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
