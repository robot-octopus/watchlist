import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  // Get intended destination from cookie
  const intendedDestination = cookies.get('intended-destination');

  // Get theme preference from cookie, default to dark
  const themePreference = cookies.get('theme-preference') || 'dark';

  // Make user data from server hooks available to all pages
  return {
    user: locals.user,
    session: locals.session
      ? {
          isDemo: locals.session.isDemo,
          expiresAt: locals.session.expiresAt.toISOString(), // Convert Date to string for serialization
        }
      : null,
    intendedDestination, // Pass intended destination to client
    themePreference, // Pass theme preference to client
  };
};
