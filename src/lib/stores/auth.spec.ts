import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { authStore } from './auth';
import type { AuthState } from './auth';

describe('Auth Store', () => {
  beforeEach(() => {
    authStore.reset();
  });

  it('should initialize with unauthenticated state', () => {
    const state = get(authStore) as AuthState;

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.tokenExpiry).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set loading state during authentication', () => {
    authStore.setLoading(true);

    const state = get(authStore) as AuthState;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set authenticated state with OAuth2 tokens', () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockTokens = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      tokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    };

    authStore.setAuthenticated(mockUser, mockTokens);

    const state = get(authStore) as AuthState;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockTokens.accessToken);
    expect(state.refreshToken).toBe(mockTokens.refreshToken);
    expect(state.tokenExpiry).toEqual(mockTokens.tokenExpiry);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should clear state on logout', () => {
    // First authenticate
    authStore.setAuthenticated(
      { id: '123', email: 'test@example.com' },
      { accessToken: 'token', refreshToken: 'refresh', tokenExpiry: new Date() }
    );

    // Then logout
    authStore.logout();

    const state = get(authStore) as AuthState;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.tokenExpiry).toBeNull();
  });

  it('should set error state', () => {
    const errorMessage = 'Authentication failed';

    authStore.setError(errorMessage);

    const state = get(authStore) as AuthState;
    expect(state.error).toBe(errorMessage);
    expect(state.isLoading).toBe(false);
  });

  it('should check if token is expired', () => {
    const expiredTime = new Date(Date.now() - 1000); // 1 second ago
    const validTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    expect(authStore.isTokenExpired(expiredTime)).toBe(true);
    expect(authStore.isTokenExpired(validTime)).toBe(false);
    expect(authStore.isTokenExpired(null)).toBe(true);
  });

  it('should check if token needs refresh', () => {
    const needsRefresh = new Date(Date.now() + 60 * 1000); // 1 minute from now
    const noRefreshNeeded = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    expect(authStore.needsRefresh(needsRefresh)).toBe(true);
    expect(authStore.needsRefresh(noRefreshNeeded)).toBe(false);
    expect(authStore.needsRefresh(null)).toBe(true);
  });
});
