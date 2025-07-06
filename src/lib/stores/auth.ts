/**
 * Authentication Store - Server-Side Enhanced
 * Now uses server-provided user data instead of localStorage for security
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export interface User {
  email: string;
  username: string;
  name: string;
  nickname: string;
  'external-id': string;
  'is-confirmed': boolean;
  'is-two-factor-sessions-enforced': boolean;
}

export interface SessionInfo {
  isDemo: boolean;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  session: SessionInfo | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  intendedDestination: string | null;
}

// Create the auth store with server-provided initial data
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isCheckingAuth: false,
    intendedDestination: null,
  });

  return {
    subscribe,

    /**
     * Initialize auth state with server-provided data
     * Called from +layout.svelte with data from +layout.server.ts
     */
    initialize: (userData: User | null, sessionData: SessionInfo | null) => {
      update((state) => ({
        ...state,
        user: userData,
        session: sessionData,
        isAuthenticated: !!userData,
        isCheckingAuth: false,
      }));
    },

    /**
     * Update auth state when server data changes
     */
    updateFromServer: (userData: User | null, sessionData: SessionInfo | null) => {
      update((state) => ({
        ...state,
        user: userData,
        session: sessionData,
        isAuthenticated: !!userData,
      }));
    },

    /**
     * Set intended destination for post-login redirect
     */
    setIntendedDestination: (path: string) => {
      update((state) => ({
        ...state,
        intendedDestination: path,
      }));
    },

    /**
     * Clear intended destination
     */
    clearIntendedDestination: () => {
      update((state) => ({
        ...state,
        intendedDestination: null,
      }));
    },

    /**
     * Set loading state during auth operations
     */
    setLoading: (loading: boolean) => {
      update((state) => ({
        ...state,
        isCheckingAuth: loading,
      }));
    },

    /**
     * Server-side logout - calls logout API and redirects
     */
    logout: async () => {
      if (!browser) return;

      try {
        // Call server-side logout endpoint
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Clear client state
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            intendedDestination: null,
          });

          // Redirect to login
          await goto('/login', { replaceState: true });
        } else {
          console.error('Logout failed:', response.statusText);
          // Still redirect to login even if API call fails
          await goto('/login', { replaceState: true });
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Fallback: clear state and redirect anyway
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isCheckingAuth: false,
          intendedDestination: null,
        });
        await goto('/login', { replaceState: true });
      }
    },

    /**
     * Clear all auth state (for cleanup)
     */
    clear: () => {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        intendedDestination: null,
      });
    },
  };
}

export const auth = createAuthStore();

// Derived stores for common auth checks
export const isAuthenticated = derived(auth, ($auth) => $auth.isAuthenticated);
export const currentUser = derived(auth, ($auth) => $auth.user);
export const isDemo = derived(auth, ($auth) => $auth.session?.isDemo ?? false);
