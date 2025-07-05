import { writable } from 'svelte/store';

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

  // Set intended destination for post-login redirect
  setIntendedDestination: (path: string) => {
    update((state) => ({ ...state, intendedDestination: path }));
  },

  // Clear intended destination
  clearIntendedDestination: () => {
    update((state) => ({ ...state, intendedDestination: null }));
  },

  // Login method (placeholder for now)
  login: async (/* credentials: LoginCredentials */) => {
    authStore.setLoading(true);

    try {
      // TODO: Implement actual OAuth2 authentication
      // For now, just simulate an error
      throw new Error('Authentication not implemented yet');
    } catch (error) {
      authStore.setError(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    }
  },

  // Check auth status and handle redirects
  checkAuthAndRedirect: async () => {
    authStore.setCheckingAuth(true);

    try {
      // TODO: Implement token validation and refresh logic
      // For now, just check if we have tokens in storage

      // This would typically:
      // 1. Check for stored tokens
      // 2. Validate token expiry
      // 3. Refresh tokens if needed
      // 4. Set authenticated state

      authStore.setCheckingAuth(false);
    } catch (error) {
      console.error('Auth check failed:', error);
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
