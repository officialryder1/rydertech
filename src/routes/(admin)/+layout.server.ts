import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Pull admin emails from env (comma-separated), fall back to defaults
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'kennethvic07@gmail.com,rydertech.ng@gmail.com,victorkenneth9@gmail.com')
  .split(',')
  .map(e => e.trim());

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = locals.user;

  // Not logged in -> redirect to login
  if (!user) {
    throw redirect(302, `/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  // Logged in but not admin -> redirect to home
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    throw redirect(302, '/');
  }

  return {
    user
  };
};
