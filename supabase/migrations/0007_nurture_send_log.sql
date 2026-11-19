-- Nurture Send Log Table — tracks all sent nurture emails
-- Run in Supabase SQL Editor (project: ddwwwqxhqdzbaeswenny)

-- ============================================================
-- TABLE
-- ============================================================
create table if not exists public.nurture_send_log (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tool text not null,
  touch int not null check (touch in (1, 2, 3)),
  subject text not null,
  body text,                    -- truncated for storage
  message_id text,              -- Gmail message ID or manual ID
  sent_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_nurture_log_email on public.nurture_send_log(email);
create index if not exists idx_nurture_log_sent_at on public.nurture_send_log(sent_at desc);
create index if not exists idx_nurture_log_tool on public.nurture_send_log(tool);

-- ============================================================
-- RLS: only service-role can access
-- ============================================================
alter table public.nurture_send_log enable row level security;

-- No policies = no access via anon/authenticated keys
-- Service-role client (admin dashboard, local scripts) bypasses RLS entirely