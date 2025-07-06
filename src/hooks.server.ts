import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { isProtectedRoute, isPublicRoute } from '$lib/config/routes';

/**
 * Server-side authentication and route protection
 */
export const handle: Handle = async ({ event, resolve }) => {
  // Get session token from httpOnly cookie
  const sessionToken = event.cookies.get('session-token');
  const userData = event.cookies.get('user-data');

  // Initialize user in locals
  event.locals.user = null;
  event.locals.session = null;

  // Validate session if token exists
  if (sessionToken && userData) {
    try {
      // Parse user data from cookie
      const user = JSON.parse(userData);

      // For demo tokens, skip API validation to avoid unnecessary calls
      if (sessionToken.startsWith('demo-session-token-')) {
        // Demo mode - use cookie data directly
        event.locals.user = user;
        event.locals.session = {
          token: sessionToken,
          isDemo: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };
      } else {
        // For real tokens, we could validate with Tastytrade API here
        // For now, trust the httpOnly cookie since it's server-side controlled
        event.locals.user = user;
        event.locals.session = {
          token: sessionToken,
          isDemo: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };
      }
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
      // Clear invalid cookies
      event.cookies.delete('session-token', { path: '/' });
      event.cookies.delete('user-data', { path: '/' });
    }
  }

  // Route protection logic
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    if (!event.locals.user) {
      // Store intended destination for post-login redirect
      event.cookies.set('intended-destination', pathname, {
        path: '/',
        maxAge: 60 * 60, // 1 hour
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      // Redirect to login
      throw redirect(303, '/login');
    }
  }

  // Redirect authenticated users away from login page
  if (isPublicRoute(pathname) && pathname === '/login' && event.locals.user) {
    throw redirect(303, '/');
  }

  // Add security headers
  const response = await resolve(event);

  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add CSP header to prevent XSS attacks
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.tastyworks.com https://api.cert.tastyworks.com;"
  );

  return response;
};
