import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { isPublicRoute, DEFAULT_PROTECTED_REDIRECT } from '$lib/config/routes';
import { isUserAuthenticated } from '$lib/utils/auth-validation';

/**
 * Server-side authentication and route protection
 */
export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  // Allow access to public routes without authentication
  if (isPublicRoute(pathname)) {
    return await resolve(event);
  }

  // For protected routes, check authentication
  if (
    !isUserAuthenticated({
      cookies: event.cookies,
      headers: event.request.headers,
    })
  ) {
    // Redirect unauthenticated users to login
    throw redirect(302, DEFAULT_PROTECTED_REDIRECT);
  }

  // User is authenticated, proceed with the request
  return await resolve(event);
};
