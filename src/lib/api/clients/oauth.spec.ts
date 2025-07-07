import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuth2Client } from './oauth';
import type { LoginCredentials } from '../types/oauth';

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe('OAuth2Client', () => {
  let client: OAuth2Client;

  beforeEach(() => {
    client = new OAuth2Client();
    mockFetch.mockClear();
  });

  it('should authenticate with valid credentials', async () => {
    const mockSessionResponse = {
      data: {
        'session-token': 'session-token-123',
        'remember-token': 'remember-token-456',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSessionResponse,
    });

    const credentials: LoginCredentials = {
      username: 'test@example.com',
      password: 'password123',
    };

    const result = await client.authenticate(credentials);

    expect(mockFetch).toHaveBeenCalledWith('https://api.tastyworks.com/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'TastytradeWatchlistApp/1.0',
      },
      body: '{"login":"test@example.com","password":"password123","remember-me":false}',
    });

    expect(result).toEqual({
      access_token: 'session-token-123',
      refresh_token: 'remember-token-456',
      token_type: 'Bearer',
      expires_in: 900,
      scope: 'read write',
      sessionResponse: {
        data: {
          'session-token': 'session-token-123',
          'remember-token': 'remember-token-456',
        },
      },
    });
  });

  it('should refresh token with valid refresh token', async () => {
    const mockSessionResponse = {
      data: {
        'session-token': 'new-session-token',
        'remember-token': 'new-remember-token',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSessionResponse,
    });

    const result = await client.refreshToken('refresh-token-456');

    expect(mockFetch).toHaveBeenCalledWith('https://api.tastyworks.com/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'TastytradeWatchlistApp/1.0',
      },
      body: '{"remember-token":"refresh-token-456"}',
    });

    expect(result).toEqual({
      access_token: 'new-session-token',
      refresh_token: 'new-remember-token',
      token_type: 'Bearer',
      expires_in: 900,
      scope: 'read write',
    });
  });

  it('should throw error on authentication failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '{"error":{"message":"Invalid credentials"}}',
    });

    const credentials: LoginCredentials = {
      username: 'invalid@example.com',
      password: 'wrongpassword',
    };

    await expect(client.authenticate(credentials)).rejects.toThrow('Invalid credentials');
  });

  it('should throw error on refresh token failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '{"error":{"message":"Invalid refresh token"}}',
    });

    await expect(client.refreshToken('invalid-refresh-token')).rejects.toThrow(
      'Invalid refresh token'
    );
  });

  it('should format credentials correctly for OAuth2 request', () => {
    const credentials: LoginCredentials = {
      username: 'test@example.com',
      password: 'password123',
    };

    const formData = client.formatCredentials(credentials);

    expect(formData).toContain('grant_type=password');
    expect(formData).toContain('username=test%40example.com');
    expect(formData).toContain('password=password123');
  });

  it('should extract user info from session response', () => {
    const mockSessionResponse = {
      sessionResponse: {
        data: {
          user: {
            email: 'test@example.com',
            username: 'testuser',
            name: 'Test User',
            'external-id': 'ext123',
          },
        },
      },
    };

    const result = client.getUserFromSessionResponse(mockSessionResponse);

    expect(result).toEqual({
      data: {
        user: {
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
          'external-id': 'ext123',
        },
      },
    });
  });

  it('should handle demo mode in getUserFromSessionResponse', () => {
    const mockDemoResponse = {
      access_token: 'demo-session-token-123',
    };

    const result = client.getUserFromSessionResponse(mockDemoResponse);

    expect(result.data.user.email).toBe('demo@example.com');
    expect(result.data.user.username).toBe('demo');
    expect(result.data.user.name).toBe('Demo User');
  });

  it('should handle demo credentials', async () => {
    const credentials: LoginCredentials = {
      username: 'demo',
      password: 'demo',
    };

    const result = await client.authenticate(credentials);

    expect(result.access_token).toMatch(/^demo-session-token-/);
    expect(result.refresh_token).toMatch(/^demo-remember-token-/);
    expect(result.token_type).toBe('Bearer');
    expect(result.expires_in).toBe(900);
    expect(result.scope).toBe('read write');
  });
});
