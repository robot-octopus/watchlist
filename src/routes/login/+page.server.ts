import { fail } from '@sveltejs/kit';
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

    const requestId = 'srv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] Server: Starting authentication for user:`, username);

    try {
      const oauthClient = new OAuth2Client();

      // Authenticate with Tastytrade API
      console.log(`🔐 [${requestId}] Server: Calling OAuth client authenticate...`);
      const sessionResponse = await oauthClient.authenticate({
        username,
        password,
      });

      console.log(`✅ [${requestId}] Server: Authentication successful!`);

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

      let redirectTarget = '/watchlist';
      if (intendedDestination) {
        // Clear the intended destination cookie
        cookies.delete('intended-destination', { path: '/' });

        // Filter out system/devtools URLs from redirects
        const isSystemUrl =
          intendedDestination.includes('.well-known') ||
          intendedDestination.includes('favicon') ||
          intendedDestination.includes('devtools') ||
          intendedDestination.includes('__data.json') ||
          intendedDestination.startsWith('/_');

        if (!isSystemUrl) {
          redirectTarget = intendedDestination;
        }

        console.log(
          `🎯 [${requestId}] Intended destination:`,
          intendedDestination,
          isSystemUrl ? '(filtered)' : '(using)'
        );
      }

      console.log(
        `🔄 [${requestId}] Server: Authentication completed, returning success with redirect target:`,
        redirectTarget
      );

      // Return success data instead of server redirect to avoid Chrome DevTools interference
      return {
        success: true,
        redirectTo: redirectTarget,
        user: userData.data.user,
      };
    } catch (error) {
      console.error(`❌ [${requestId}] Server: Login failed:`, error);

      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error(`❌ [${requestId}] Server: Error message:`, errorMessage);

        // Check for specific Tastytrade error patterns
        if (errorMessage.includes('invalid_credentials')) {
          errorMessage =
            'Invalid username or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('account_locked')) {
          errorMessage = 'Account is locked. Please contact Tastytrade support.';
        } else if (errorMessage.includes('two_factor')) {
          errorMessage = 'Two-factor authentication required. Please check your device.';
        }
      }

      // Return error with form data preserved
      const errorResponse = {
        error: errorMessage,
        username: username,
      };

      console.log(
        `📤 [${requestId}] Server: Returning error response:`,
        JSON.stringify(errorResponse)
      );
      return fail(400, errorResponse);
    }
  },
};
