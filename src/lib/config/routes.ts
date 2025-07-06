/**
 * Route Configuration
 * Defines public and protected routes for authentication-based access control
 */

// Routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  // Add other public routes here (e.g., '/signup', '/forgot-password')
];

// Routes that require authentication
export const PROTECTED_ROUTES = [
  '/',
  '/watchlist',
  '/settings',
  // Add other protected routes here
];

// Default redirect paths
export const DEFAULT_PROTECTED_REDIRECT = '/login';
export const DEFAULT_LOGIN_REDIRECT = '/watchlist';

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.includes(pathname) || !isPublicRoute(pathname);
}

/**
 * Get the appropriate redirect path based on authentication status
 */
export function getRedirectPath(isAuthenticated: boolean, currentPath: string): string {
  if (!isAuthenticated && isProtectedRoute(currentPath)) {
    return DEFAULT_PROTECTED_REDIRECT;
  }

  if (isAuthenticated && currentPath === '/login') {
    return DEFAULT_LOGIN_REDIRECT;
  }

  return currentPath;
}
