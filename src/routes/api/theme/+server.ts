import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { theme } = await request.json();

    // Validate theme value
    if (theme !== 'dark' && theme !== 'light') {
      return json({ success: false, error: 'Invalid theme value' }, { status: 400 });
    }

    // Set theme preference cookie
    cookies.set('theme-preference', theme, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access for theme switching
      secure: true,
      sameSite: 'strict',
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to save theme preference:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
