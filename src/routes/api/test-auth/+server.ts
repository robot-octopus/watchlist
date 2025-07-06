import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OAuth2Client } from '$lib/api/clients/oauth';

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const { username, password } = await request.json();

    console.log('🧪 Test Auth: Testing credentials for:', username);

    if (!username || !password) {
      return json(
        {
          success: false,
          error: 'Username and password required',
        },
        { status: 400 }
      );
    }

    const oauthClient = new OAuth2Client({ fetch });

    const sessionResponse = await oauthClient.authenticate({
      username,
      password,
    });

    console.log('✅ Test Auth: Success!');

    return json({
      success: true,
      message: 'Authentication successful',
      tokenExists: !!sessionResponse.access_token,
      tokenType: sessionResponse.token_type,
    });
  } catch (error) {
    console.error('❌ Test Auth: Failed:', error);

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3), // First 3 lines only
              }
            : null,
      },
      { status: 401 }
    );
  }
};
