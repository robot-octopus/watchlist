import { writable, get } from 'svelte/store';
import { OAuth2Client } from '$lib/api/clients/oauth';
import { TokenStorage } from '$lib/utils/token-storage';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  isLoading: boolean;
  error: string | null;
  intendedDestination: string | null;
  isCheckingAuth: boolean;
}

export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  isLoading: false,
  error: null,
  intendedDestination: null,
  isCheckingAuth: false,
};

// Create the writable store
const { subscribe, set, update } = writable<AuthState>(initialState);

export const authStore = {
  subscribe,

  // Reset store to initial state
  reset: () => {
    set(initialState);
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    update((state) => ({
      ...state,
      isLoading: loading,
      error: loading ? null : state.error,
    }));
  },

  // Set auth checking state
  setCheckingAuth: (checking: boolean) => {
    update((state) => ({
      ...state,
      isCheckingAuth: checking,
    }));
  },

  // Set error state
  setError: (error: string) => {
    update((state) => ({
      ...state,
      error,
      isLoading: false,
    }));
  },

  // Set authenticated state
  setAuthenticated: (user: User, tokens: TokenData) => {
    update((state) => ({
      ...state,
      isAuthenticated: true,
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.tokenExpiry,
      isLoading: false,
      error: null,
    }));
  },

  // Logout
  logout: () => {
    // Clear stored tokens
    TokenStorage.clear();

    update((state) => ({
      ...state,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      error: null,
    }));
  },

  // Secure logout with server-side session invalidation
  secureLogout: async () => {
    try {
      // Get current auth state
      const currentState = get({ subscribe });

      // If we have an access token, we could invalidate it on the server
      // For now, we'll just do local logout but this is where server-side
      // session invalidation would happen in a production environment
      if (currentState.accessToken) {
        console.log('Performing secure logout with token cleanup');
      }
    } catch (error) {
      console.warn('Error during secure logout:', error);
    } finally {
      // Always perform local logout regardless of server response
      authStore.logout();
    }
  },

  // Set intended destination for post-login redirect
  setIntendedDestination: (path: string) => {
    update((state) => ({ ...state, intendedDestination: path }));
  },

  // Clear intended destination
  clearIntendedDestination: () => {
    update((state) => ({ ...state, intendedDestination: null }));
  },

  // Login method
  login: async (credentials: LoginCredentials) => {
    authStore.setLoading(true);

    try {
      const oauthClient = new OAuth2Client();

      // Authenticate with the API
      const tokenResponse = await oauthClient.authenticate(credentials);

      // Calculate token expiry
      const tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000);

      // Store tokens securely
      TokenStorage.store({
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry,
      });

      // Get user information from session response
      let user: User;
      try {
        const userResponse = oauthClient.getUserFromSessionResponse(tokenResponse);
        user = {
          id: userResponse.data?.user?.['external-id'] || 'unknown',
          email: userResponse.data?.user?.email || credentials.username,
          username: userResponse.data?.user?.username || credentials.username,
        };
      } catch (userError) {
        // If we can't get user info, create a minimal user object
        console.warn('Failed to get user info:', userError);
        user = {
          id: 'unknown',
          email: credentials.username,
          username: credentials.username,
        };
      }

      // Set authenticated state
      authStore.setAuthenticated(user, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry,
      });
    } catch (error) {
      authStore.setError(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    }
  },

  // Check auth status and handle redirects
  checkAuthAndRedirect: async () => {
    authStore.setCheckingAuth(true);

    try {
      // Check for stored tokens
      const storedTokens = TokenStorage.retrieve();

      if (!storedTokens) {
        // No tokens found, user is not authenticated
        authStore.setCheckingAuth(false);
        return;
      }

      // Check if tokens are expired
      if (TokenStorage.isExpired(storedTokens)) {
        // Try to refresh tokens
        const refreshToken = TokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const oauthClient = new OAuth2Client();
            const tokenResponse = await oauthClient.refreshToken(refreshToken);

            // Calculate new token expiry
            const tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000);

            // Store new tokens
            TokenStorage.store({
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
              tokenExpiry,
            });

            // Set authenticated state with existing user or create minimal user
            const user: User = {
              id: 'unknown',
              email: 'unknown',
              username: 'unknown',
            };

            authStore.setAuthenticated(user, {
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
              tokenExpiry,
            });
          } catch (refreshError) {
            console.warn('Token refresh failed:', refreshError);
            // Clear invalid tokens
            TokenStorage.clear();
            authStore.logout();
          }
        } else {
          // No refresh token, clear expired tokens
          TokenStorage.clear();
          authStore.logout();
        }
      } else {
        // Valid tokens found, set authenticated state
        const user: User = {
          id: 'unknown',
          email: 'unknown',
          username: 'unknown',
        };

        authStore.setAuthenticated(user, {
          accessToken: storedTokens.accessToken,
          refreshToken: storedTokens.refreshToken,
          tokenExpiry: storedTokens.tokenExpiry,
        });
      }

      authStore.setCheckingAuth(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear potentially corrupted tokens
      TokenStorage.clear();
      authStore.logout();
      authStore.setCheckingAuth(false);
    }
  },

  // Utility methods for token management
  isTokenExpired: (expiry: Date | null): boolean => {
    if (!expiry) return true;
    return new Date() >= expiry;
  },

  needsRefresh: (expiry: Date | null): boolean => {
    if (!expiry) return true;
    // Refresh if less than 2 minutes remaining
    const refreshThreshold = 2 * 60 * 1000; // 2 minutes in milliseconds
    return new Date().getTime() + refreshThreshold >= expiry.getTime();
  },
};
