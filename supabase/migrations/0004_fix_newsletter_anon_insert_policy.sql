-- FIX: newsletter_subscriptions has RLS ON but NO insert policy on prod (ddwwwqxhqdzbaeswenny)
--
-- Measured 2026-10-17 with the PUBLIC anon key that ships in the browser bundle:
--   ANON  INSERT -> HTTP 401  code 42501 "new row violates row-level security policy"
--   AUTH  INSERT -> HTTP 403  code 42501 (same, signed in as a real confirmed user)
--   ANON  SELECT -> HTTP 200, 0 rows  (7 real subscriber rows hidden -> RLS IS enabled)
--   CONTROL: anon + authenticated INSERT into contact_submissions -> HTTP 201 both
-- => the key, both roles, the table, the columns and PostgREST are all fine.
--    This table has NO INSERT policy for EITHER role. Not "anon-only blocked".
--
-- Impact: every browser lead from /labs/ops-drain, /labs/website-rater, /labs/revleak
-- and /labs/cost-estimator is silently dropped. supabase-js returns {error} instead of
-- throwing, so the route's UI still shows success. EmailJS may deliver the email; no row
-- is written, so any segment keyed on lead_tags (e.g. @> ['findingsng']) stays empty.
--
-- Idempotent. Paste the WHOLE file into the Supabase SQL editor and run it.

-- ============================================================
-- STEP 0 - PRE-FLIGHT: what is actually there right now?
-- Expect: the policies query returns 0 rows. That is the bug.
-- ============================================================
select
  'PRE-FLIGHT policies' as check_name,
  policyname,
  cmd,
  roles::text,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename  = 'newsletter_subscriptions';

select
  'PRE-FLIGHT rls' as check_name,
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
from pg_tables
where schemaname = 'public'
  and tablename  = 'newsletter_subscriptions';
-- rowsecurity must be TRUE. If it is FALSE, RLS was never enabled and the lead list
-- is currently world-readable AND world-writable - treat that as an incident.

-- ============================================================
-- STEP 1 - THE FIX
-- ============================================================
alter table public.newsletter_subscriptions enable row level security;

drop policy if exists "anon may subscribe" on public.newsletter_subscriptions;
create policy "anon may subscribe" on public.newsletter_subscriptions
  for insert to anon, authenticated
  with check (true);

-- Deliberately NO select/update/delete policy: leads stay unreadable and immutable
-- from the client. The admin dashboard reads via the service-role client, which
-- bypasses RLS. Do NOT add a read policy to "fix" a client-side read - move that
-- read to a server route (see src/routes/(app)/findings-ng/+page.server.ts).

-- ============================================================
-- STEP 2 - VERIFY
-- Must return exactly ONE row: cmd = INSERT, roles = {anon,authenticated}.
-- If it returns 0 rows, STEP 1 did not commit - re-run it and check for an error.
-- ============================================================
select
  'VERIFY policies' as check_name,
  policyname,
  cmd,
  roles::text,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename  = 'newsletter_subscriptions';

-- ============================================================
-- STEP 3 - PROVE IT FROM THE CLIENT (do NOT skip this)
-- The SQL above proves the policy exists; it does not prove PostgREST accepts the
-- insert. From the repo root:
--     node scripts/verify-newsletter-insert-policy.mjs
-- It performs a real anon INSERT with lead_tags ['findingsng'], confirms the row via
-- the service-role client, runs the segment query, asserts anon SELECT is still denied,
-- and deletes its own test row. Exit 0 = policy live. Exit 2 = still blocked.
-- ============================================================
