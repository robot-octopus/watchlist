import type { PageServerLoad } from './$types';
import { WatchlistsClient } from '$lib/api/clients/watchlists';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    // Get the session token from cookies
    const sessionToken = cookies.get('session-token');

    if (!sessionToken) {
      return {
        watchlists: [],
        publicWatchlists: [],
        error: 'Authentication required',
      };
    }

    // Create watchlist client pointing to real Tastytrade API
    const watchlistClient = new WatchlistsClient({
      authToken: sessionToken,
    });

    // Fetch all watchlists
    const watchlistsResponse = await watchlistClient.getWatchlists();

    // Also fetch public watchlists
    const publicWatchlistsResponse = await watchlistClient.getPublicWatchlists();

    return {
      watchlists: (watchlistsResponse as any).data?.items || [],
      publicWatchlists: (publicWatchlistsResponse as any).data?.items || [],
    };
  } catch (error) {
    // Return empty arrays on error so page still renders
    return {
      watchlists: [],
      publicWatchlists: [],
      error: `Failed to load watchlists from Tastytrade API: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
