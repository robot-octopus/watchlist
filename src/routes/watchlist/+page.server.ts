import type { PageServerLoad } from './$types';
import { WatchlistsClient } from '$lib/api/clients/watchlists';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // Get the session token from cookies
    const sessionToken = cookies.get('session-token');

    if (!sessionToken) {
      return {
        watchlists: [],
        sessionToken: '',
        error: 'Authentication required',
      };
    }

    // Create watchlist client pointing to real Tastytrade API
    const watchlistClient = new WatchlistsClient({
      authToken: sessionToken,
    });

    // Fetch all watchlists
    const watchlistsResponse = await watchlistClient.getWatchlists();

    return {
      watchlists: (watchlistsResponse as any).data?.items || [],
      sessionToken,
    };
  } catch (error) {
    // Return empty arrays on error so page still renders
    return {
      watchlists: [],
      sessionToken: cookies.get('session-token') || '',
      error: `Failed to load watchlists from Tastytrade API: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
