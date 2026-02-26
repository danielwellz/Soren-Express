import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { RecentlyViewedProduct } from '../lib/recentlyViewed';
import {
  clearCompareProducts,
  readCompareProducts,
  toggleCompareProduct,
} from '../lib/compareStorage';

type CompareContextValue = {
  items: RecentlyViewedProduct[];
  toggleCompare: (product: RecentlyViewedProduct) => void;
  hasInCompare: (productId: number) => boolean;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedProduct[]>(() => readCompareProducts());

  const toggleCompare = useCallback((product: RecentlyViewedProduct) => {
    const next = toggleCompareProduct(product);
    setItems(next);
  }, []);

  const hasInCompare = useCallback(
    (productId: number) => items.some((item) => item.id === productId),
    [items],
  );

  const clearCompare = useCallback(() => {
    clearCompareProducts();
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      toggleCompare,
      hasInCompare,
      clearCompare,
    }),
    [clearCompare, hasInCompare, items, toggleCompare],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}
