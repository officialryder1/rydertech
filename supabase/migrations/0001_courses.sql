-- RyderTech Courses — schema (phase 1)
-- Apply via Supabase Dashboard SQL Editor, or the Management API with a PAT.

-- 1. Profiles (mirrors auth.users, created by trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- 2. Purchases (decides course access). course_slug matches src/lib/courses.ts.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  amount_ngn integer not null,
  provider text not null default 'paystack',
  reference text,
  status text not null default 'pending', -- pending | paid
  paid_at timestamptz,
  created_at timestamptz default now()
);
-- UNIQUE on reference is REQUIRED: enrollment paths use upsert(onConflict:'reference').
-- Without it the upsert throws "no unique or exclusion constraint matching the ON
-- CONFLICT specification" and the purchase row is never written -> user stuck "not enrolled".
alter table public.purchases add constraint purchases_reference_unique unique (reference);
create index if not exists purchases_user_idx on public.purchases(user_id);
alter table public.purchases enable row level security;
-- Users read only their own purchases.
create policy "own purchases select" on public.purchases for select using (auth.uid() = user_id);
-- Allow the authenticated user to insert their OWN purchase row (idempotent upsert
-- keyed on reference). Previously inserts were service-role only; this guards against
-- any future session-client enrollment path silently failing under RLS.
create policy "own purchases insert" on public.purchases for insert with check (auth.uid() = user_id);

-- 3. Course videos (YouTube unlisted IDs). Gated to purchasers.
create table if not exists public.course_videos (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  youtube_id text not null,
  title text,
  position integer not null default 0
);
alter table public.course_videos enable row level security;
create policy "purchasers see videos" on public.course_videos for select using (
  exists (
    select 1 from public.purchases p
    where p.user_id = auth.uid()
      and p.course_slug = course_videos.course_slug
      and p.status = 'paid'
  )
);

-- 4. Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
