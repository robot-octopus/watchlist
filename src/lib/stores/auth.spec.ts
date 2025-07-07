import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { auth } from './auth';
import type { AuthState, User, SessionInfo } from './auth';

describe('Auth Store', () => {
  beforeEach(() => {
    auth.clear();
  });

  it('should initialize with unauthenticated state', () => {
    const state = get(auth) as AuthState;

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isCheckingAuth).toBe(false);
    expect(state.intendedDestination).toBeNull();
  });

  it('should set loading state during authentication', () => {
    auth.setLoading(true);

    const state = get(auth) as AuthState;
    expect(state.isCheckingAuth).toBe(true);
  });

  it('should set authenticated state with user and session data', () => {
    const mockUser: User = {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Test',
      'external-id': '123',
      'is-confirmed': true,
      'is-two-factor-sessions-enforced': false,
    };
    const mockSession: SessionInfo = {
      isDemo: false,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    auth.initialize(mockUser, mockSession);

    const state = get(auth) as AuthState;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.session).toEqual(mockSession);
    expect(state.isCheckingAuth).toBe(false);
  });

  it('should clear state on logout', async () => {
    // First authenticate
    const mockUser: User = {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Test',
      'external-id': '123',
      'is-confirmed': true,
      'is-two-factor-sessions-enforced': false,
    };
    const mockSession: SessionInfo = {
      isDemo: false,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    auth.initialize(mockUser, mockSession);

    // Then clear
    auth.clear();

    const state = get(auth) as AuthState;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
  });

  it('should update from server data', () => {
    const mockUser: User = {
      email: 'updated@example.com',
      username: 'updateduser',
      name: 'Updated User',
      nickname: 'Updated',
      'external-id': '456',
      'is-confirmed': true,
      'is-two-factor-sessions-enforced': true,
    };
    const mockSession: SessionInfo = {
      isDemo: true,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    auth.updateFromServer(mockUser, mockSession);

    const state = get(auth) as AuthState;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.session).toEqual(mockSession);
  });

  it('should handle intended destination', () => {
    const destination = '/dashboard';

    auth.setIntendedDestination(destination);

    let state = get(auth) as AuthState;
    expect(state.intendedDestination).toBe(destination);

    auth.clearIntendedDestination();

    state = get(auth) as AuthState;
    expect(state.intendedDestination).toBeNull();
  });

  it('should handle unauthenticated state when user is null', () => {
    auth.initialize(null, null);

    const state = get(auth) as AuthState;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
  });
});
