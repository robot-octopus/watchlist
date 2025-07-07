import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenStorage, isTokenExpired, getTokenExpirationTime } from './token-storage';

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

// Mock atob for JWT token parsing
Object.defineProperty(globalThis, 'atob', {
  value: vi.fn((str: string) => {
    // Simple mock for base64 decode
    if (str === 'eyJleHAiOjk5OTk5OTk5OTl9') {
      return '{"exp":9999999999}'; // Valid future expiration
    }
    if (str === 'eyJleHAiOjEwMDB9') {
      return '{"exp":1000}'; // Expired token
    }
    return '{}';
  }),
});

describe('TokenStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should store token securely', () => {
    const token = 'test-session-token-123';

    TokenStorage.setToken(token);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('session-token', token);
  });

  it('should retrieve stored token', () => {
    const token = 'test-session-token-123';
    mockLocalStorage.getItem.mockReturnValue(token);

    const retrievedToken = TokenStorage.getToken();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('session-token');
    expect(retrievedToken).toBe(token);
  });

  it('should return null when no token stored', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const token = TokenStorage.getToken();

    expect(token).toBeNull();
  });

  it('should clear stored token', () => {
    TokenStorage.removeToken();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('session-token');
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const token = TokenStorage.getToken();

    expect(token).toBeNull();
  });

  it('should check if token exists', () => {
    mockLocalStorage.getItem.mockReturnValue('valid-token');
    expect(TokenStorage.hasToken()).toBe(true);

    mockLocalStorage.getItem.mockReturnValue(null);
    expect(TokenStorage.hasToken()).toBe(false);

    mockLocalStorage.getItem.mockReturnValue('');
    expect(TokenStorage.hasToken()).toBe(false);
  });

  it('should validate JWT format', () => {
    // Valid JWT structure with future expiration
    const validJWT = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
    expect(TokenStorage.isValidJWT(validJWT)).toBe(true);

    // Expired JWT
    const expiredJWT = 'header.eyJleHAiOjEwMDB9.signature';
    expect(TokenStorage.isValidJWT(expiredJWT)).toBe(false);

    // Invalid JWT structure
    expect(TokenStorage.isValidJWT('invalid-jwt')).toBe(false);
    expect(TokenStorage.isValidJWT('header.payload')).toBe(false);
  });

  it('should store and retrieve user data', () => {
    const userData = { id: '123', email: 'test@example.com' };

    TokenStorage.setUserData(userData);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user-data', JSON.stringify(userData));

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

    const retrievedData = TokenStorage.getUserData();
    expect(retrievedData).toEqual(userData);
  });

  it('should clear all stored data', () => {
    TokenStorage.clearAll();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('session-token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user-data');
  });
});

describe('Token utility functions', () => {
  it('should check if token is expired', () => {
    const validJWT = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
    const expiredJWT = 'header.eyJleHAiOjEwMDB9.signature';

    expect(isTokenExpired(validJWT)).toBe(false);
    expect(isTokenExpired(expiredJWT)).toBe(true);
    expect(isTokenExpired('invalid-token')).toBe(true);
  });

  it('should get token expiration time', () => {
    const validJWT = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
    const expiredJWT = 'header.eyJleHAiOjEwMDB9.signature';

    expect(getTokenExpirationTime(validJWT)).toBe(9999999999);
    expect(getTokenExpirationTime(expiredJWT)).toBe(1000);
    expect(getTokenExpirationTime('invalid-token')).toBeNull();
  });
});
