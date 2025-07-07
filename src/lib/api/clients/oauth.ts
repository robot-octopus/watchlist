import { BaseApiClient } from '../base-client';
import type { OAuthTokenResponse, LoginCredentials } from '../types/oauth';

export class OAuth2Client extends BaseApiClient {
  private readonly apiBaseUrl = 'https://api.tastyworks.com';

  constructor() {
    super();
  }

  /**
   * Authenticate user with username and password
   * Note: Tastytrade uses session-based authentication, not OAuth2
   */
  async authenticate(credentials: LoginCredentials): Promise<OAuthTokenResponse> {
    // Demo mode for testing - check for environment variables OR common demo credentials
    const demoUsername = process.env.DEMO_USERNAME || 'demo';
    const demoPassword = process.env.DEMO_PASSWORD || 'demo';

    if (credentials.username === demoUsername && credentials.password === demoPassword) {
      // Simulate successful authentication for demo purposes
      const demoResponse: OAuthTokenResponse = {
        access_token: 'demo-session-token-' + Date.now(),
        refresh_token: 'demo-remember-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 900,
        scope: 'read write',
      };

      return demoResponse;
    }

    // Try real API authentication for other credentials
    const url = `${this.apiBaseUrl}/sessions`;

    const body = JSON.stringify({
      login: credentials.username,
      password: credentials.password,
      'remember-me': false,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'TastytradeWatchlistApp/1.0',
        },
        body,
      });

      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        let responseText = '';

        try {
          responseText = await response.text();
          const errorData = JSON.parse(responseText);

          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error?.code) {
            errorMessage = `Error ${errorData.error.code}: ${errorData.error.message || 'Authentication failed'}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map((e: any) => e.message || e).join(', ');
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch {
          errorMessage =
            responseText || `Authentication failed: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const sessionResponse = await response.json();

      // Convert Tastytrade session response to OAuth2-like format for compatibility
      const oauthResponse: OAuthTokenResponse = {
        access_token: sessionResponse.data['session-token'],
        refresh_token: sessionResponse.data['remember-token'] || '',
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes - typical session length
        scope: 'read write',
      };

      // Store session response for user info extraction
      (oauthResponse as any).sessionResponse = sessionResponse;

      return oauthResponse;
    } catch (error) {
      if (error instanceof Error) {
        // If it's a network error (fetch failed), provide a helpful message
        if (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('connect')
        ) {
          throw new Error(
            'Unable to connect to Tastytrade API. Please check your internet connection or try using demo credentials (username: demo, password: demo).'
          );
        }
        throw error;
      }
      throw new Error(
        'Network error during authentication. Try using demo credentials (username: demo, password: demo).'
      );
    }
  }

  /**
   * Refresh access token using refresh token
   * Note: Tastytrade uses remember tokens for session renewal
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    // Demo mode for testing - check for demo tokens
    if (refreshToken.startsWith('demo-remember-token-')) {
      // Simulate successful token refresh for demo purposes
      const demoResponse: OAuthTokenResponse = {
        access_token: 'demo-session-token-' + Date.now(),
        refresh_token: 'demo-remember-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 900,
        scope: 'read write',
      };

      return demoResponse;
    }

    // Try real API refresh for other tokens
    const url = `${this.apiBaseUrl}/sessions`;

    const body = JSON.stringify({
      'remember-token': refreshToken,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'TastytradeWatchlistApp/1.0',
        },
        body,
      });

      if (!response.ok) {
        let errorMessage = 'Token refresh failed';

        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Use generic error message if parsing fails or text() is not available
          errorMessage = `Token refresh failed: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const sessionResponse = await response.json();

      // Convert Tastytrade session response to OAuth2-like format for compatibility
      const oauthResponse: OAuthTokenResponse = {
        access_token: sessionResponse.data['session-token'],
        refresh_token: sessionResponse.data['remember-token'] || refreshToken,
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes - typical session length
        scope: 'read write',
      };

      return oauthResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Format login credentials for OAuth2 request
   */
  formatCredentials(credentials: LoginCredentials): string {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
    });

    return params.toString();
  }

  /**
   * Get current user information from session response
   * Note: User info is included in the session response, no separate API call needed
   */
  getUserFromSessionResponse(sessionResponse: any): any {
    // Demo mode for testing - check for demo tokens
    if (sessionResponse?.access_token?.startsWith('demo-session-token-')) {
      // Return mock user data for demo purposes
      const demoUserData = {
        data: {
          user: {
            email: 'demo@example.com',
            username: 'demo',
            name: 'Demo User',
            nickname: 'Demo',
            'external-id': 'demo-ext-id',
            'is-confirmed': true,
            'is-two-factor-sessions-enforced': false,
          },
        },
      };

      return demoUserData;
    }

    // For real API calls, user info is included in the session response
    if (sessionResponse?.sessionResponse?.data?.user) {
      return {
        data: {
          user: sessionResponse.sessionResponse.data.user,
        },
      };
    }

    // Fallback error if no user data available
    throw new Error('User information not available - please re-authenticate');
  }

  /**
   * @deprecated Use getUserFromSessionResponse instead
   * Get current user information (requires authenticated session)
   */
  async getCurrentUser(_accessToken: string): Promise<any> {
    throw new Error(
      'getCurrentUser is deprecated. User info is now extracted from session response.'
    );
  }
}
