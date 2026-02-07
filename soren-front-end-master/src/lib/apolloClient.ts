import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { authStorage, isTokenExpired } from './authStorage';

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:3000/graphql';

async function refreshAccessTokenIfNeeded(): Promise<string | null> {
  const accessToken = authStorage.getAccessToken();
  const refreshToken = authStorage.getRefreshToken();

  if (!accessToken) {
    return null;
  }

  if (!isTokenExpired(accessToken)) {
    return accessToken;
  }

  if (!refreshToken) {
    authStorage.clear();
    return null;
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `mutation Refresh($input: RefreshInput!) { refresh(input: $input) { tokens { accessToken refreshToken } } }`,
      variables: { input: { refreshToken } },
    }),
  });

  const json = await response.json();
  const tokens = json?.data?.refresh?.tokens;
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    authStorage.clear();
    return null;
  }

  authStorage.setTokens(tokens);
  return tokens.accessToken;
}

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (_, previousContext) => {
  const token = await refreshAccessTokenIfNeeded();

  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: {
              keyArgs: ['filter', 'sort'],
              merge(_existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    connectToDevTools: true,
  });
}
