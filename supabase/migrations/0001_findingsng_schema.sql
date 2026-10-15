-- FindingsNg — Multi-vendor marketplace schema
-- Migration 0001: Core tables for vendor products, pricing tiers, and benchmark data

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- Vendors: Products listed on the FindingsNg marketplace
-- ============================================================
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  website_url text not null,
  description text,
  category text not null,           -- "price-tracking", "marketplace-tool", etc.
  founded_year int,
  employee_range text,              -- "1-10", "11-50", "51-200", etc.
  nigerian_focus boolean default false,
  status text default 'researching' check (status in ('researching', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Pricing Tiers: Per-vendor pricing plans
-- ============================================================
create table if not exists pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  plan_name text not null,
  price_monthly numeric(12,2),
  price_yearly numeric(12,2),
  currency text not null default 'USD',
  billing_unit text not null,       -- "product_count", "sku_count", "url_count", "seat", "flat"
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'per-seat', 'flat')),
  unit_limit int,                   -- e.g., 100 products, 2000 SKUs, 5000 URLs
  is_popular boolean default false,
  sort_order int default 0,
  is_verified boolean default false, -- pattern-lock: only verified figures in shareable surfaces
  verified_date date,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Features: Comparison matrix features
-- ============================================================
create table if not exists features (
  id uuid primary key default gen_random_uuid(),
  category text not null,            -- "core", "integrations", "support", "automation"
  name text not null,
  description text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Vendor Features: Many-to-many join
-- ============================================================
create table if not exists vendor_features (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  feature_id uuid not null references features(id) on delete cascade,
  has_feature boolean default false,
  notes text,
  unique(vendor_id, feature_id)
);

-- ============================================================
-- Benchmarks: Category-level metrics for market framing
-- ============================================================
create table if not exists benchmarks (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,         -- "starting_price", "free_tier", "mid_market_range"
  metric_unit text not null,         -- "USD/mo", "boolean", "text"
  category text not null,            -- "price-tracking", etc.
  source_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Vendor Benchmarks: Per-vendor benchmark values
-- ============================================================
create table if not exists vendor_benchmarks (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  benchmark_id uuid not null references benchmarks(id) on delete cascade,
  value text not null,               -- text to handle "₦15,000/mo" or "Yes" or "14 days"
  is_verified boolean default false,
  verified_date date,
  unique(vendor_id, benchmark_id)
);

-- ============================================================
-- Indexes for common queries
-- ============================================================
create index if not exists idx_pricing_tiers_vendor on pricing_tiers(vendor_id);
create index if not exists idx_pricing_tiers_verified on pricing_tiers(is_verified);
create index if not exists idx_vendor_features_vendor on vendor_features(vendor_id);
create index if not exists idx_vendor_benchmarks_vendor on vendor_benchmarks(vendor_id);
create index if not exists idx_vendors_status on vendors(status);
create index if not exists idx_vendors_category on vendors(category);

-- ============================================================
-- Natural keys for the seed data.
-- `on conflict do nothing` with NO conflict target does nothing at all unless
-- some constraint is violated -- so re-running this file duplicated the whole
-- seed (6 tiers became 12). These unique indexes give the seed inserts a real
-- conflict target, which is what makes the file actually idempotent.
-- ============================================================
create unique index if not exists ux_pricing_tiers_vendor_plan on pricing_tiers(vendor_id, plan_name);
create unique index if not exists ux_benchmarks_metric_category on benchmarks(metric_name, category);

-- ============================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- drop-then-create: `create trigger` has no `if not exists`, so a re-run of this
-- file would abort with 42710 and silently skip everything below it (the seed).
drop trigger if exists update_vendors_updated_at on vendors;
create trigger update_vendors_updated_at
  before update on vendors
  for each row execute function update_updated_at_column();

drop trigger if exists update_pricing_tiers_updated_at on pricing_tiers;
create trigger update_pricing_tiers_updated_at
  before update on pricing_tiers
  for each row execute function update_updated_at_column();

-- ============================================================
-- Row Level Security
-- Public read of the published marketplace, no client writes.
-- Seeding/admin happens through the service role, which bypasses RLS.
-- ============================================================
alter table vendors           enable row level security;
alter table pricing_tiers     enable row level security;
alter table features          enable row level security;
alter table vendor_features   enable row level security;
alter table benchmarks        enable row level security;
alter table vendor_benchmarks enable row level security;

-- No `create policy if not exists` in Postgres -> drop first.
drop policy if exists "public reads published vendors" on vendors;
create policy "public reads published vendors" on vendors
  for select using (status = 'published');

drop policy if exists "public reads pricing tiers" on pricing_tiers;
create policy "public reads pricing tiers" on pricing_tiers
  for select using (true);

drop policy if exists "public reads features" on features;
create policy "public reads features" on features
  for select using (true);

drop policy if exists "public reads vendor features" on vendor_features;
create policy "public reads vendor features" on vendor_features
  for select using (true);

drop policy if exists "public reads benchmarks" on benchmarks;
create policy "public reads benchmarks" on benchmarks
  for select using (true);

drop policy if exists "public reads vendor benchmarks" on vendor_benchmarks;
create policy "public reads vendor benchmarks" on vendor_benchmarks
  for select using (true);

-- Deliberately NO insert/update/delete policies on any of the six tables:
-- with RLS enabled, that denies every write to anon and authenticated. The
-- anon key is public (it ships in the browser bundle), so without this a
-- visitor could rewrite the comparison data the pattern-lock depends on.

-- ============================================================
-- Seed data: Researcher's confirmed benchmarks (2026-10-15)
-- ============================================================

-- Insert the three comparable vendors
insert into vendors (name, slug, website_url, description, category, status)
values
  ('Prisync', 'prisync', 'https://prisync.com', 'Price tracking and competitor monitoring SaaS', 'price-tracking', 'published'),
  ('Pricefy', 'pricefy', 'https://pricefy.com', 'SKU-based price tracking with forever-free tier', 'price-tracking', 'published'),
  ('Price2Spy', 'price2spy', 'https://price2spy.com', 'URL-based price tracking, now quote-led', 'price-tracking', 'published')
on conflict (slug) do nothing;

-- Insert Prisync pricing tiers (vendor-published, verified)
insert into pricing_tiers (vendor_id, plan_name, price_monthly, currency, billing_unit, unit_limit, is_verified, verified_date, source_url)
select
  v.id,
  t.plan_name,
  t.price_monthly,
  'USD',
  'product_count',
  t.unit_limit,
  true,
  '2026-10-15',
  'https://prisync.com/pricing'
from vendors v
cross join (values
  ('Starter', 99.00, 100),
  ('Pro', 199.00, 1000),
  ('Premium', 399.00, 5000)
) as t(plan_name, price_monthly, unit_limit)
where v.slug = 'prisync'
on conflict do nothing;

-- Insert Pricefy pricing tiers (vendor-published, verified)
insert into pricing_tiers (vendor_id, plan_name, price_monthly, currency, billing_unit, unit_limit, is_verified, verified_date, source_url)
select
  v.id,
  t.plan_name,
  t.price_monthly,
  'USD',
  'sku_count',
  t.unit_limit,
  true,
  '2026-10-15',
  'https://pricefy.com/pricing'
from vendors v
cross join (values
  ('Free', 0.00, 50),
  ('Pro', 99.00, 2000),
  ('Business', 499.00, 25000)
) as t(plan_name, price_monthly, unit_limit)
where v.slug = 'pricefy'
on conflict do nothing;

-- Insert Price2Spy benchmarks (Shopify listing figures — likely but not vendor-page-confirmed)
insert into benchmarks (metric_name, metric_unit, category, source_url, notes)
values
  ('starting_price', 'USD/mo', 'price-tracking', 'https://apps.shopify.com/price2spy', 'Shopify listing: $157.95/mo for 2K URLs'),
  ('mid_market_price', 'USD/mo', 'price-tracking', 'https://apps.shopify.com/price2spy', 'Shopify listing: $788.95/mo for 10K URLs'),
  ('free_tier_available', 'boolean', 'price-tracking', null, 'Category floor: Pricefy is the only forever-free tier (50 SKUs)')
on conflict do nothing;

-- Link Price2Spy benchmarks
insert into vendor_benchmarks (vendor_id, benchmark_id, value, is_verified, verified_date)
select
  v.id,
  b.id,
  b.notes,
  false,  -- Shopify listing, not vendor-page-confirmed
  null
from vendors v
cross join benchmarks b
where v.slug = 'price2spy'
  and b.category = 'price-tracking'
on conflict do nothing;
