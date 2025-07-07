import type { PageServerLoad } from './$types';
import { WatchlistsClient } from '$lib/api/clients/watchlists';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('session-token');

    if (!sessionToken) {
      return {
        watchlists: [],
        sessionToken: '',
        error: 'Authentication required',
      };
    }

    const watchlistClient = new WatchlistsClient({
      authToken: sessionToken,
    });

    const watchlistsResponse = await watchlistClient.getWatchlists();

    return {
      watchlists: (watchlistsResponse as any).data?.items || [],
      sessionToken,
    };
  } catch (error) {
    return {
      watchlists: [],
      sessionToken: cookies.get('session-token') || '',
      error: `Failed to load watchlists from Tastytrade API: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
