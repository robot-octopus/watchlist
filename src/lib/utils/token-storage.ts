/**
 * Token storage utilities
 *
 * ⚠️ SECURITY WARNING: This implementation uses localStorage which is vulnerable to XSS attacks.
 * For production applications, consider using httpOnly cookies or in-memory storage instead.
 *
 * Better alternatives:
 * 1. httpOnly cookies for refresh tokens
 * 2. In-memory storage for access tokens
 * 3. Hybrid approach with both
 */

// Type declaration for browser APIs that might not be available in all environments
declare global {
  function atob(data: string): string;
}

/**
 * Secure token manager that uses in-memory storage
 * This is more secure than localStorage but tokens are lost on page refresh
 */
export class SecureTokenManager {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;

  /**
   * Store access token in memory (more secure)
   */
  static setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get access token from memory
   */
  static getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Clear access token from memory
   */
  static clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Check if we have a valid access token
   */
  static hasValidAccessToken(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Store refresh token (in production, this should be an httpOnly cookie)
   */
  static setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Clear all tokens
   */
  static clearAllTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

/**
 * ⚠️ DEPRECATED: localStorage-based token storage (vulnerable to XSS)
 * This is kept for backward compatibility but should not be used in production
 */
export class LocalStorageTokenManager {
  private static readonly TOKEN_KEY = 'session-token';
  private static readonly USER_KEY = 'user-data';

  /**
   * ⚠️ SECURITY WARNING: This stores tokens in localStorage which is vulnerable to XSS attacks
   */
  static setToken(token: string): void {
    console.warn(
      '⚠️ SECURITY WARNING: Storing token in localStorage is not secure. Consider using httpOnly cookies or in-memory storage.'
    );

    if (typeof window === 'undefined') {
      console.warn('Cannot access localStorage in server environment');
      return;
    }

    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token in localStorage:', error);
    }
  }

  /**
   * Get token from localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove token from localStorage
   */
  static removeToken(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error);
    }
  }

  /**
   * Check if token exists and is valid format
   */
  static hasToken(): boolean {
    const token = this.getToken();
    return token !== null && token.trim().length > 0;
  }

  /**
   * Validate token format (basic JWT structure check)
   */
  static isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Try to decode the payload to check expiration
      const payloadPart = parts[1];
      if (!payloadPart) return false;

      // Check if atob is available (browser environment)
      if (typeof atob === 'undefined') {
        console.warn('atob not available, skipping token expiration check');
        return true; // Assume valid if we can't check
      }

      const payload = JSON.parse(atob(payloadPart));

      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.warn('Token is expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Invalid JWT format:', error);
      return false;
    }
  }

  /**
   * Store user data
   */
  static setUserData(userData: any): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get user data
   */
  static getUserData(): any | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

// Export both for backward compatibility, but recommend SecureTokenManager
export const TokenStorage = LocalStorageTokenManager; // Deprecated
export const SecureTokenStorage = SecureTokenManager; // Recommended

/**
 * Utility functions for token validation
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payloadPart = parts[1];
    if (!payloadPart) return true;

    // Check if atob is available (browser environment)
    if (typeof atob === 'undefined') {
      console.warn('atob not available, cannot check token expiration');
      return false; // Assume not expired if we can't check
    }

    const payload = JSON.parse(atob(payloadPart));
    return payload.exp && payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

export function getTokenExpirationTime(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadPart = parts[1];
    if (!payloadPart) return null;

    // Check if atob is available (browser environment)
    if (typeof atob === 'undefined') {
      console.warn('atob not available, cannot get token expiration');
      return null;
    }

    const payload = JSON.parse(atob(payloadPart));
    return payload.exp || null;
  } catch {
    return null;
  }
}
