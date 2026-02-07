const ACCESS_TOKEN_KEY = 'soren_access_token';
const REFRESH_TOKEN_KEY = 'soren_refresh_token';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getTokens(): TokenPair | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!accessToken || !refreshToken) {
      return null;
    }
    return { accessToken, refreshToken };
  },
  setTokens(tokens: TokenPair): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) {
      return false;
    }
    return Date.now() >= exp * 1000 - 30_000;
  } catch (_error) {
    return true;
  }
}
