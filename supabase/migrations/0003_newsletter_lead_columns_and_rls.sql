-- Fix live schema drift on public.newsletter_subscriptions (RyderTech prod).
-- Verified 2026-10-15 against project ddwwwqxhqdzbaeswenny:
--   the /labs lead-capture routes send lead_source + lead_type and every insert
--   is rejected with PGRST204 ("Could not find the 'lead_source' column"), which
--   supabase-js returns as {error} rather than throwing -- so the route's catch
--   never fires and the lead is lost with no alert. 0 ops-drain rows exist.
--
-- Idempotent: safe to run repeatedly.

alter table if exists public.newsletter_subscriptions
  add column if not exists lead_source text;
alter table if exists public.newsletter_subscriptions
  add column if not exists lead_type text;
alter table if exists public.newsletter_subscriptions
  add column if not exists course text;

-- Tag opt-in for the FindingsNg sequence (Path A: warm ops-drain leads who
-- explicitly asked for pricing intel). Kept as its own column rather than
-- overloading `source`, so the admin Lead Magnets tab (which filters on
-- source like 'lead_magnet_%') keeps working unchanged.
alter table if exists public.newsletter_subscriptions
  add column if not exists lead_tags text[] default '{}';

create index if not exists idx_newsletter_lead_source
  on public.newsletter_subscriptions(lead_source);
create index if not exists idx_newsletter_lead_tags
  on public.newsletter_subscriptions using gin(lead_tags);

-- ============================================================
-- SECURITY: this table currently has NO row level security at all.
-- Verified live with the PUBLIC anon key (which ships in the browser bundle):
--   * SELECT returned every subscriber's email address
--   * PATCH on an existing row returned 200 with the mutated row
--   * DELETE on an existing row returned 204
-- An anonymous visitor can dump, edit and wipe the whole lead list today.
-- The app only ever inserts here from the browser, so enable RLS and grant
-- nothing but INSERT. The admin dashboard reads via the service-role client,
-- which bypasses RLS, so it is unaffected.
-- ============================================================
alter table public.newsletter_subscriptions enable row level security;

drop policy if exists "anon may subscribe" on public.newsletter_subscriptions;
create policy "anon may subscribe" on public.newsletter_subscriptions
  for insert to anon, authenticated
  with check (true);

-- Deliberately no select/update/delete policy: leads stay unreadable and
-- immutable from the client. Do NOT add one to "fix" a client-side read --
-- move that read to a server route using the service-role client instead.
