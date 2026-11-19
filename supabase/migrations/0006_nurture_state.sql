-- Nurture State Table — tracks inbound lead nurture sequence progress
-- Run in Supabase SQL Editor (project: ddwwwqxhqdzbaeswenny)

-- ============================================================
-- TABLE
-- ============================================================
create table if not exists public.nurture_state (
  email text primary key,
  tool text not null,                    -- 'ops_drain', 'revleak', 'website_rater', etc.
  name text not null default 'there',
  captured_at timestamptz not null,
  touches_sent int[] not null default '{}', -- which touches have been sent [1,2,3]
  lead_score int,
  lead_tier text,                        -- 'hot'/'warm'/'cold'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_nurture_captured on public.nurture_state(captured_at desc);
create index if not exists idx_nurture_tool on public.nurture_state(tool);

-- ============================================================
-- RLS: only service-role can access
-- ============================================================
alter table public.nurture_state enable row level security;

-- No policies = no access via anon/authenticated keys
-- Service-role client (admin dashboard, local scripts) bypasses RLS entirely

-- ============================================================
-- HELPER: Get leads due for a touch
-- ============================================================
create or replace function public.get_due_nurture_leads()
returns table (
  email text,
  tool text,
  name text,
  captured_at timestamptz,
  next_touch int,
  days_since_capture int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  lead record;
begin
  for lead in
    select
      email,
      tool,
      name,
      captured_at,
      touches_sent,
      case
        when not (1 = any(touches_sent)) then 1
        when not (2 = any(touches_sent)) then 2
        when not (3 = any(touches_sent)) then 3
        else null
      end as next_touch,
      extract(day from now() - captured_at)::int as days_since_capture
    from public.nurture_state
    where cardinality(touches_sent) < 3
  loop
    -- Check if enough days have passed for the next touch
    if lead.next_touch is not null then
      if (lead.next_touch = 1 and lead.days_since_capture >= 0)
         or (lead.next_touch = 2 and lead.days_since_capture >= 2)
         or (lead.next_touch = 3 and lead.days_since_capture >= 5)
      then
        return next lead;
      end if;
    end if;
  end loop;
  return;
end;
$$;

-- ============================================================
-- HELPER: Mark touch as sent
-- ============================================================
create or replace function public.mark_nurture_touch_sent(p_email text, p_touch int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.nurture_state
  set touches_sent = array_append(touches_sent, p_touch),
      updated_at = now()
  where email = p_email;
end;
$$;

-- ============================================================
-- HELPER: Enroll lead (idempotent)
-- ============================================================
create or replace function public.enroll_nurture_lead(
  p_email text,
  p_tool text,
  p_name text default 'there',
  p_captured_at timestamptz default now(),
  p_lead_score int default null,
  p_lead_tier text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.nurture_state (email, tool, name, captured_at, touches_sent, lead_score, lead_tier)
  values (p_email, p_tool, p_name, p_captured_at, '{}', p_lead_score, p_lead_tier)
  on conflict (email) do update set
    tool = excluded.tool,
    name = excluded.name,
    captured_at = excluded.captured_at,
    lead_score = excluded.lead_score,
    lead_tier = excluded.lead_tier,
    updated_at = now();
end;
$$;