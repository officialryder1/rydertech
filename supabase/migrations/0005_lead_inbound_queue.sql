-- Inbound Lead Queue — receives leads from Gmail/Apps Script, consumed by local nurture cron
-- Run in Supabase SQL Editor (project: ddwwwqxhqdzbaeswenny)

-- ============================================================
-- TABLE
-- ============================================================
create table if not exists public.lead_inbound_queue (
  id uuid primary key default gen_random_uuid(),
  -- source identification
  source_tool text not null,           -- 'website_rater', 'ops_drain', 'revleak', 'event_risk', 'aeo_readiness', etc.
  source_email text not null,          -- the prospect's email (from EmailJS)
  source_company text,                 -- optional company name
  source_url text,                     -- the URL that was analyzed (for website-rater)
  source_score integer,                -- lead score if available
  source_tier text,                    -- 'hot'/'warm'/'cold' if available
  source_data jsonb default '{}',      -- full payload for debugging/extensibility
  -- processing state
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  -- timestamps
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  -- idempotency: prevent duplicate processing from Gmail re-polls
  gmail_message_id text unique,        -- Gmail message ID of the EmailJS notification
  gmail_thread_id text
);

-- Indexes
create index if not exists idx_lead_inbound_status on public.lead_inbound_queue(status);
create index if not exists idx_lead_inbound_created on public.lead_inbound_queue(created_at desc);
create index if not exists idx_lead_inbound_tool on public.lead_inbound_queue(source_tool);

-- ============================================================
-- RLS: only service-role can read/write (bypasses RLS anyway)
-- But enable it so anon key can't touch this table
-- ============================================================
alter table public.lead_inbound_queue enable row level security;

-- No policies = no access via anon/authenticated keys
-- Service-role client (admin dashboard, local scripts) bypasses RLS entirely

-- ============================================================
-- HELPER FUNCTION: claim next pending batch (for local consumer)
-- ============================================================
create or replace function public.claim_inbound_leads(batch_size int default 10)
returns setof public.lead_inbound_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.lead_inbound_queue[];
begin
  -- Atomically claim up to batch_size pending rows
  update public.lead_inbound_queue
  set status = 'processing'
  where id in (
    select id from public.lead_inbound_queue
    where status = 'pending'
    order by created_at asc
    limit batch_size
    for update skip locked
  )
  returning * into claimed;

  return query select * from unnest(claimed);
end;
$$;

-- ============================================================
-- HELPER: mark completed / failed
-- ============================================================
create or replace function public.mark_inbound_lead(lead_id uuid, new_status text, err_msg text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.lead_inbound_queue
  set status = new_status,
      processed_at = now(),
      error_message = err_msg
  where id = lead_id;
end;
$$;