import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event);
  const {
    data: { user }
  } = await event.locals.supabase.auth.getUser();
  event.locals.user = user;

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name.startsWith('sb-');
    }
  });
};
