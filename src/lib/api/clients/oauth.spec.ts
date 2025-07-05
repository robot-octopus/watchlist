import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuth2Client } from './oauth';
import type { OAuthTokenResponse, LoginCredentials } from '../types/oauth';

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
    const mockResponse: OAuthTokenResponse = {
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-456',
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
      scope: 'read write',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const credentials: LoginCredentials = {
      username: 'test@example.com',
      password: 'password123',
    };

    const result = await client.authenticate(credentials);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tastytrade.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: expect.stringContaining('grant_type=password'),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('should refresh token with valid refresh token', async () => {
    const mockResponse: OAuthTokenResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 900,
      scope: 'read write',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await client.refreshToken('refresh-token-456');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tastytrade.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: expect.stringContaining('grant_type=refresh_token'),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('should throw error on authentication failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const credentials: LoginCredentials = {
      username: 'invalid@example.com',
      password: 'wrongpassword',
    };

    await expect(client.authenticate(credentials)).rejects.toThrow('Authentication failed');
  });

  it('should throw error on refresh token failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(client.refreshToken('invalid-refresh-token')).rejects.toThrow(
      'Token refresh failed'
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
});
