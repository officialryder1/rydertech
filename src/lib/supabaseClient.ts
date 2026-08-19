import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

// Browser-safe: uses the PUBLIC (anon) key only. Replaces the old createClient
// wiring so cookie-based auth sessions work with @supabase/ssr.
export const supabase: SupabaseClient = createBrowserClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);
