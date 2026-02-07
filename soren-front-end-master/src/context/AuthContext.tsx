import {
  ApolloClient,
  ApolloError,
  useApolloClient,
} from '@apollo/client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  FORGOT_PASSWORD_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
  MERGE_GUEST_CART_MUTATION,
  REGISTER_MUTATION,
} from '../graphql/documents';
import i18n from '../i18n';
import { authStorage } from '../lib/authStorage';
import { getApolloErrorMessage } from '../lib/apolloErrors';
import { mapErrorMessage } from '../lib/localizedErrors';
import { getSessionId } from '../lib/session';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  address?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  refetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchMe(client: ApolloClient<any>): Promise<AuthUser | null> {
  try {
    const { data } = await client.query({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    return data?.me || null;
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!authStorage.getAccessToken()) {
        setLoading(false);
        return;
      }

      const me = await fetchMe(client);
      if (!me) {
        authStorage.clear();
      }
      setUser(me);
      setLoading(false);
    };

    void init();
  }, [client]);

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          ...input,
          sessionId: getSessionId(),
        },
      },
    });

    const payload = data?.login;
    if (!payload?.tokens) {
      throw new ApolloError({ errorMessage: i18n.t('auth.errors.login') });
    }

    authStorage.setTokens(payload.tokens);
    setUser(payload.user);
    await client.resetStore();
  }, [client]);

  const register = useCallback(async (input: RegisterInput) => {
    const sessionId = getSessionId();
    const { data } = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: { input },
    });

    const payload = data?.register;
    if (!payload?.tokens) {
      throw new ApolloError({ errorMessage: i18n.t('auth.errors.register') });
    }

    authStorage.setTokens(payload.tokens);

    const mergeResult = await client.mutate({
      mutation: MERGE_GUEST_CART_MUTATION,
      variables: {
        input: {
          sessionId,
        },
      },
    }).catch((error: unknown) => {
      authStorage.clear();
      setUser(null);
      throw new ApolloError({
        errorMessage: mapErrorMessage(
          getApolloErrorMessage(
          error,
          i18n.t('errors.mergeFailed'),
        ),
          i18n.t.bind(i18n),
        ),
      });
    });

    if (!mergeResult?.data?.mergeGuestCart?.id) {
      authStorage.clear();
      setUser(null);
      throw new ApolloError({
        errorMessage: i18n.t('errors.mergeFailed'),
      });
    }

    setUser(payload.user);
    await client.resetStore();
  }, [client]);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    void client.clearStore();
  }, [client]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    const { data } = await client.mutate({
      mutation: FORGOT_PASSWORD_MUTATION,
      variables: { email },
    });

    return Boolean(data?.forgotPassword);
  }, [client]);

  const refetchMe = useCallback(async () => {
    const me = await fetchMe(client);
    if (!me) {
      authStorage.clear();
      setUser(null);
      return;
    }
    setUser(me);
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      loading,
      login,
      register,
      logout,
      forgotPassword,
      refetchMe,
    }),
    [loading, user, login, register, logout, forgotPassword, refetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
