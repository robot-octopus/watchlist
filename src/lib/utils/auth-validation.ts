/**
 * Authentication Validation Utilities
 * Server-side authentication validation for route protection
 */

interface AuthRequest {
  cookies: {
    get: (string) => string | undefined;
  };
  headers: {
    get: (string) => string | null;
  };
}

/**
 * Validate if a token is present and properly formatted
 * TODO: Add actual token validation (JWT verification, expiry check, etc.)
 */
export function isValidToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  // Basic format validation
  if (typeof token !== 'string' || token.trim().length === 0) {
    return false;
  }

  // TODO: Add more sophisticated validation:
  // - JWT signature verification
  // - Token expiry validation
  // - Token blacklist check
  // - API validation against Tastytrade

  // For now, just check if token looks like a valid format
  // OAuth2 access tokens are typically 40+ characters
  return token.length >= 20;
}

/**
 * Extract authentication token from various sources
 */
export function extractAuthToken(request: AuthRequest): string | undefined {
  // Try cookie first (most secure for SPA)
  const cookieToken = request.cookies.get('auth-token');
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove "Bearer " prefix
  }

  return undefined;
}

/**
 * Check if user is authenticated based on request
 */
export function isUserAuthenticated(request: AuthRequest): boolean {
  const token = extractAuthToken(request);
  return isValidToken(token);
}
