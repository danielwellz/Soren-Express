import { useCallback, useEffect, useState } from 'react';
import { readRecentlyViewed, RecentlyViewedProduct } from '../lib/recentlyViewed';

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedProduct[]>(() => readRecentlyViewed());

  const refresh = useCallback(() => {
    setItems(readRecentlyViewed());
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'soren_recently_viewed') {
        refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return { items, refresh };
}
