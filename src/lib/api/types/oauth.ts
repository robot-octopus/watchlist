// OAuth2 token response from Tastytrade API
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds (typically 900 for 15 minutes)
  scope: string;
}

// Login credentials for OAuth2 password grant
export interface LoginCredentials {
  username: string;
  password: string;
}

// User information from authenticated session
export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  nickname?: string;
}

// Stored token data with computed expiry
export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

// OAuth2 error response
export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
}
