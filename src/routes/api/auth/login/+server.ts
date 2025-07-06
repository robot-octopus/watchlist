import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OAuth2Client } from '$lib/api/clients/oauth';

export const GET: RequestHandler = async () => {
  return json({
    message: 'Login API endpoint. Use POST with username/password to authenticate.',
    methods: ['POST'],
    usage: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username: 'string', password: 'string' },
    },
  });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const username = body.username as string;
    const password = body.password as string;

    // Basic validation
    if (!username || !password) {
      return json(
        {
          success: false,
          error: 'Username and password are required',
        },
        { status: 400 }
      );
    }

    // Demo mode bypass for testing
    if (username === 'demo' && password === 'demo') {
      // Set demo cookies
      cookies.set('session-token', 'demo-session-token-' + Date.now(), {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      cookies.set(
        'user-data',
        JSON.stringify({
          email: 'demo@example.com',
          username: 'demo',
          'external-id': 'demo-user-123',
          'is-confirmed': true,
          'is-two-factor-sessions-enforced': false,
        }),
        {
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
          secure: true,
          sameSite: 'strict',
        }
      );

      return json({
        success: true,
        redirectTo: '/watchlist',
        user: {
          email: 'demo@example.com',
          username: 'demo',
          'external-id': 'demo-user-123',
          'is-confirmed': true,
          'is-two-factor-sessions-enforced': false,
        },
      });
    }

    const requestId = 'api-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] API: Starting authentication for user:`, username);
    console.log(`🔍 [${requestId}] API: Password length:`, password?.length || 0);
    console.log(`🔍 [${requestId}] API: Password starts with:`, password?.substring(0, 3) + '...');

    try {
      const oauthClient = new OAuth2Client();

      // Authenticate with Tastytrade API
      console.log(`🔐 [${requestId}] API: Calling OAuth client authenticate...`);
      const sessionResponse = await oauthClient.authenticate({
        username,
        password,
      });

      console.log(`✅ [${requestId}] API: Authentication successful!`);

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
        `🔄 [${requestId}] API: Authentication completed, returning success with redirect target:`,
        redirectTarget
      );

      // Return success data as proper JSON
      return json({
        success: true,
        redirectTo: redirectTarget,
        user: userData.data.user,
      });
    } catch (error) {
      console.error(`❌ [${requestId}] API: Login failed:`, error);

      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message;
        console.error(`❌ [${requestId}] API: Error message:`, errorMessage);

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

      // Return error as JSON
      return json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
};
