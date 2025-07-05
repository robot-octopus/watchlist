/**
 * Token Storage Utilities
 * Provides secure token storage and retrieval for authentication
 */

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

const STORAGE_KEY = 'tastytrade_tokens';

/**
 * Check if localStorage is available (works in both browser and test environments)
 */
function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export class TokenStorage {
  /**
   * Store authentication tokens securely
   */
  static store(tokens: StoredTokens): void {
    if (!isStorageAvailable()) {
      console.warn('Cannot store tokens: localStorage not available');
      return;
    }

    try {
      const serializedTokens = JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.tokenExpiry.toISOString(),
      });

      localStorage.setItem(STORAGE_KEY, serializedTokens);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      // Fail silently to prevent app crashes
    }
  }

  /**
   * Retrieve stored authentication tokens
   */
  static retrieve(): StoredTokens | null {
    if (!isStorageAvailable()) return null;

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) {
        return null;
      }

      const parsed = JSON.parse(storedData);

      // Validate required fields
      if (!parsed.accessToken || !parsed.refreshToken || !parsed.tokenExpiry) {
        return null;
      }

      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        tokenExpiry: new Date(parsed.tokenExpiry),
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  /**
   * Clear stored tokens
   */
  static clear(): void {
    if (!isStorageAvailable()) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Check if stored tokens are expired
   */
  static isExpired(tokens: StoredTokens): boolean {
    return new Date() >= tokens.tokenExpiry;
  }

  /**
   * Check if tokens need refresh (within 2 minutes of expiry)
   */
  static needsRefresh(tokens: StoredTokens): boolean {
    const refreshThreshold = 2 * 60 * 1000; // 2 minutes in milliseconds
    return new Date().getTime() + refreshThreshold >= tokens.tokenExpiry.getTime();
  }

  /**
   * Get access token if valid, null if expired or missing
   */
  static getValidAccessToken(): string | null {
    const tokens = this.retrieve();

    if (!tokens || this.isExpired(tokens)) {
      return null;
    }

    return tokens.accessToken;
  }

  /**
   * Get refresh token if available
   */
  static getRefreshToken(): string | null {
    const tokens = this.retrieve();
    return tokens?.refreshToken || null;
  }
}
