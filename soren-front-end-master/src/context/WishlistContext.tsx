import { useMutation, useQuery } from '@apollo/client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ADD_TO_WISHLIST_MUTATION,
  MY_WISHLIST_QUERY,
  REMOVE_FROM_WISHLIST_MUTATION,
} from '../graphql/documents';
import { useMutationAction } from '../hooks/useMutationAction';
import { RecentlyViewedProduct } from '../lib/recentlyViewed';
import { readWishlistProducts, toggleWishlistProduct } from '../lib/wishlistStorage';
import { useAuth } from './AuthContext';

type WishlistContextValue = {
  items: RecentlyViewedProduct[];
  toggleWishlist: (product: RecentlyViewedProduct) => void;
  hasInWishlist: (productId: number) => boolean;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function normalizeWishlistProduct(product: any): RecentlyViewedProduct {
  return {
    id: Number(product.id),
    name: String(product.name || ''),
    basePrice: Number(product.basePrice || 0),
    thumbnail: product.thumbnail,
    averageRating: Number(product.averageRating || 0),
    brand: product.brand,
    category: product.category,
    variants: product.variants,
  };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const runMutation = useMutationAction();
  const { isAuthenticated } = useAuth();
  const [guestItems, setGuestItems] = useState<RecentlyViewedProduct[]>(() => readWishlistProducts());

  const { data, loading, refetch } = useQuery(MY_WISHLIST_QUERY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const [addToWishlist] = useMutation(ADD_TO_WISHLIST_MUTATION);
  const [removeFromWishlist] = useMutation(REMOVE_FROM_WISHLIST_MUTATION);

  const serverItems = useMemo<RecentlyViewedProduct[]>(
    () => (data?.myWishlist || []).map((product: any) => normalizeWishlistProduct(product)),
    [data?.myWishlist],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setGuestItems(readWishlistProducts());
    }
  }, [isAuthenticated]);

  const items = isAuthenticated ? serverItems : guestItems;

  const hasInWishlist = useCallback(
    (productId: number) => items.some((item) => item.id === productId),
    [items],
  );

  const toggleWishlist = useCallback(
    (product: RecentlyViewedProduct) => {
      if (!isAuthenticated) {
        const next = toggleWishlistProduct(product);
        setGuestItems(next);
        return;
      }

      const exists = serverItems.some((item) => item.id === product.id);

      void runMutation(
        () =>
          exists
            ? removeFromWishlist({
                variables: {
                  input: {
                    productId: Number(product.id),
                  },
                },
              })
            : addToWishlist({
                variables: {
                  input: {
                    productId: Number(product.id),
                  },
                },
              }),
        {
          successMessage: exists ? t('wishlist.removedMessage') : t('wishlist.addedMessage'),
        },
      ).then((result) => {
        if (!result) {
          return;
        }

        void refetch();
      });
    },
    [addToWishlist, isAuthenticated, refetch, removeFromWishlist, runMutation, serverItems, t],
  );

  const value = useMemo(
    () => ({
      items,
      toggleWishlist,
      hasInWishlist,
      loading: isAuthenticated ? loading : false,
    }),
    [hasInWishlist, isAuthenticated, items, loading, toggleWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
