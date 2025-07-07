import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { OAuth2Client } from '$lib/api/clients/oauth';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return fail(400, {
        error: 'Username and password are required',
        username: username,
      });
    }

    const requestId = 'srv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] Server: Starting authentication for user:`, username);

    try {
      const oauthClient = new OAuth2Client();
      const sessionResponse = await oauthClient.authenticate({
        username,
        password,
      });
      const userData = oauthClient.getUserFromSessionResponse(sessionResponse);

      cookies.set('session-token', sessionResponse.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      cookies.set('user-data', JSON.stringify(userData.data.user), {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        secure: true,
        sameSite: 'strict',
      });

      const intendedDestination = cookies.get('intended-destination');

      let redirectTarget = '/watchlist';
      if (intendedDestination) {
        cookies.delete('intended-destination', { path: '/' });

        const isSystemUrl =
          intendedDestination.includes('.well-known') ||
          intendedDestination.includes('favicon') ||
          intendedDestination.includes('devtools') ||
          intendedDestination.includes('__data.json') ||
          intendedDestination.startsWith('/_');

        if (!isSystemUrl) {
          redirectTarget = intendedDestination;
        }
      }

      return {
        success: true,
        redirectTo: redirectTarget,
        user: userData.data.user,
      };
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('invalid_credentials')) {
          errorMessage =
            'Invalid username or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('account_locked')) {
          errorMessage = 'Account is locked. Please contact Tastytrade support.';
        } else if (errorMessage.includes('two_factor')) {
          errorMessage = 'Two-factor authentication required. Please check your device.';
        }
      }

      const errorResponse = {
        error: errorMessage,
        username: username,
      };

      return fail(400, errorResponse);
    }
  },
};
