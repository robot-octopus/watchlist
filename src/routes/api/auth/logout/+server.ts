import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
  // Get current session token for API logout (if needed)
  const sessionToken = cookies.get('session-token');

  // Clear authentication cookies
  cookies.delete('session-token', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  cookies.delete('user-data', {
    path: '/',
    secure: true,
    sameSite: 'strict',
  });

  // Clear intended destination cookie if it exists
  cookies.delete('intended-destination', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  // For real tokens (not demo), we could call Tastytrade API to invalidate session
  if (sessionToken && !sessionToken.startsWith('demo-session-token-')) {
    try {
      // Optional: Call Tastytrade logout API
      // await fetch('https://api.tastyworks.com/sessions', {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${sessionToken}`
      //   }
      // });
      console.log('Real session logout - could call Tastytrade API here');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    }
  }

  // Check if this is a JSON request (from fetch) or form request
  const contentType = request.headers.get('content-type');
  const acceptHeader = request.headers.get('accept');

  if (contentType?.includes('application/json') || acceptHeader?.includes('application/json')) {
    // Return JSON response for API calls
    return json({ success: true, message: 'Logged out successfully' });
  } else {
    // Redirect for form submissions
    throw redirect(303, '/login');
  }
};
