import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenStorage } from './token-storage';
import type { StoredTokens } from './token-storage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
});

describe('TokenStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should store tokens securely', () => {
    const tokens: StoredTokens = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      tokenExpiry: new Date('2024-01-01T15:00:00Z'),
    };

    TokenStorage.store(tokens);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'tastytrade_tokens',
      expect.stringContaining('access-token-123')
    );
  });

  it('should retrieve stored tokens', () => {
    const storedData = JSON.stringify({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      tokenExpiry: '2024-01-01T15:00:00.000Z',
    });

    mockLocalStorage.getItem.mockReturnValue(storedData);

    const tokens = TokenStorage.retrieve();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tastytrade_tokens');
    expect(tokens).toEqual({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      tokenExpiry: new Date('2024-01-01T15:00:00Z'),
    });
  });

  it('should return null when no tokens stored', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const tokens = TokenStorage.retrieve();

    expect(tokens).toBeNull();
  });

  it('should clear stored tokens', () => {
    TokenStorage.clear();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tastytrade_tokens');
  });

  it('should handle corrupted storage data', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    const tokens = TokenStorage.retrieve();

    expect(tokens).toBeNull();
  });

  it('should validate token expiry dates', () => {
    const validTokens: StoredTokens = {
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    };

    const expiredTokens: StoredTokens = {
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiry: new Date(Date.now() - 1000), // 1 second ago
    };

    expect(TokenStorage.isExpired(validTokens)).toBe(false);
    expect(TokenStorage.isExpired(expiredTokens)).toBe(true);
  });

  it('should check if tokens need refresh', () => {
    const needsRefresh: StoredTokens = {
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiry: new Date(Date.now() + 60 * 1000), // 1 minute from now
    };

    const noRefreshNeeded: StoredTokens = {
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    };

    expect(TokenStorage.needsRefresh(needsRefresh)).toBe(true);
    expect(TokenStorage.needsRefresh(noRefreshNeeded)).toBe(false);
  });
});
