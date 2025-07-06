import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { OAuth2Client } from '$lib/api/clients/oauth';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Basic validation
    if (!username || !password) {
      return fail(400, {
        error: 'Username and password are required',
        username: username,
      });
    }

    try {
      const oauthClient = new OAuth2Client();

      // Authenticate with Tastytrade API
      const sessionResponse = await oauthClient.authenticate({
        username,
        password,
      });

      // Extract user data from session response
      const userData = oauthClient.getUserFromSessionResponse(sessionResponse);

      // Set secure httpOnly cookie for session token
      cookies.set('session-token', sessionResponse.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      // Set user data cookie (not httpOnly so client can read it)
      cookies.set('user-data', JSON.stringify(userData.data.user), {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        secure: true,
        sameSite: 'strict',
      });

      // Check for intended destination from server cookies
      const intendedDestination = cookies.get('intended-destination');

      if (intendedDestination) {
        // Clear the intended destination cookie
        cookies.delete('intended-destination', { path: '/' });

        // Redirect to intended destination
        throw redirect(303, intendedDestination);
      }

      // Default redirect to home
      throw redirect(303, '/');
    } catch (error) {
      console.error('Login failed:', error);

      // Return error with form data preserved
      return fail(400, {
        error: error instanceof Error ? error.message : 'Login failed',
        username: username,
      });
    }
  },
};
