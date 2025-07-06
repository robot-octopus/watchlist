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
    const requestId = 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] Attempting authentication for:`, credentials.username);
    console.log(`🌍 [${requestId}] Using API URL:`, this.apiBaseUrl);

    // Demo mode for testing - check for environment variables
    const demoUsername = process.env.DEMO_USERNAME;
    const demoPassword = process.env.DEMO_PASSWORD;

    if (
      demoUsername &&
      demoPassword &&
      credentials.username === demoUsername &&
      credentials.password === demoPassword
    ) {
      // Simulate successful authentication for demo purposes
      const demoResponse: OAuthTokenResponse = {
        access_token: 'demo-session-token-' + Date.now(),
        refresh_token: 'demo-remember-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 900,
        scope: 'read write',
      };

      console.log(
        `✅ [${requestId}] Demo authentication successful for user:`,
        credentials.username
      );
      return demoResponse;
    }

    // Try real API authentication for other credentials
    const url = `${this.apiBaseUrl}/sessions`;
    console.log(`📡 [${requestId}] Making API request to:`, url);

    const body = JSON.stringify({
      login: credentials.username,
      password: credentials.password,
      'remember-me': false,
    });

    console.log('📤 Request body:', { login: credentials.username, 'remember-me': false });

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

      console.log(`📥 [${requestId}] Response status:`, response.status, response.statusText);
      console.log(
        `📥 [${requestId}] Response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        let responseText = '';

        try {
          responseText = await response.text();
          console.log('❌ Full error response body:', responseText);
          console.log('❌ Response body type:', typeof responseText);
          console.log('❌ Response body length:', responseText.length);

          // Try to parse as JSON
          const errorData = JSON.parse(responseText);
          console.log('❌ Parsed error data:', errorData);

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
        } catch (parseError) {
          console.log('❌ Could not parse error response as JSON:', parseError);
          console.log('❌ Raw response text:', responseText);
          errorMessage =
            responseText || `Authentication failed: ${response.status} ${response.statusText}`;
        }

        console.log('❌ Final error message:', errorMessage);
        throw new Error(errorMessage);
      }

      const sessionResponse = await response.json();
      console.log('✅ Session response received:', {
        hasData: !!sessionResponse.data,
        hasSessionToken: !!sessionResponse.data?.['session-token'],
        hasUser: !!sessionResponse.data?.user,
      });

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

      console.log(`✅ [${requestId}] Authentication successful for user:`, credentials.username);
      return oauthResponse;
    } catch (error) {
      console.error(`❌ [${requestId}] Authentication error:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during authentication');
    }
  }

  /**
   * Refresh access token using refresh token
   * Note: Tastytrade uses remember tokens for session renewal
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    console.log('🔄 Attempting token refresh');

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

      console.log('✅ Demo token refresh successful');
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

      console.log('📥 Refresh response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Token refresh failed';

        try {
          const errorText = await response.text();
          console.log('❌ Refresh error response:', errorText);
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

      console.log('✅ Token refresh successful');
      return oauthResponse;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
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
    console.log('👤 Extracting user info from session response');

    // Demo mode for testing - check for demo tokens
    if (sessionResponse?.access_token?.startsWith('demo-session-token-')) {
      // Return mock user data for demo purposes
      const demoUserData = {
        data: {
          user: {
            email: 'demo@example.com',
            username: process.env.DEMO_USERNAME || 'DemoUser',
            name: 'Demo User',
            nickname: 'Demo',
            'external-id': 'demo-ext-id',
            'is-confirmed': true,
            'is-two-factor-sessions-enforced': false,
          },
        },
      };

      console.log('✅ Demo user info returned');
      return demoUserData;
    }

    // For real API calls, user info is included in the session response
    if (sessionResponse?.sessionResponse?.data?.user) {
      console.log('✅ Real user info extracted from session');
      return {
        data: {
          user: sessionResponse.sessionResponse.data.user,
        },
      };
    }

    // Fallback error if no user data available
    console.error('❌ No user data found in session response');
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
