import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }: { locals: any }) => {
  if (locals.user) {
    throw redirect(303, '/watchlist');
  }

  throw redirect(303, '/login');
};
