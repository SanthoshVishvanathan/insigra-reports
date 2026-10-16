
-- 1. CLEANUP (OPTIONAL / RESET)
drop table if exists public.campaign_data cascade;
drop table if exists public.profiles cascade;

-- 2. CREATE PROFILES TABLE
-- Stores the tenant/company association for each authenticated user.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  company_name text not null,
  created_at timestamptz default now()
);

comment on table public.profiles is 'Stores user profile and tenant/company mapping.';

-- 3. CREATE CAMPAIGN DATA TABLE
-- Stores marketing performance metrics across all companies.
create table public.campaign_data (
  id bigint generated always as identity primary key,
  company_name text not null,
  channel text not null,
  leads integer not null default 0,
  created_at timestamptz default now()
);

comment on table public.campaign_data is 'Multi-tenant campaign performance metrics.';

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- Mandatory tenant isolation enforced at the PostgreSQL engine level.
alter table public.profiles enable row level security;
alter table public.campaign_data enable row level security;

-- 5. RLS POLICIES FOR PROFILES
-- Authenticated users can only read their own profile row.
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);

-- 6. RLS POLICIES FOR CAMPAIGN DATA
-- A logged-in user can ONLY read campaign data where the company_name matches
-- the company_name in their own profile record.
-- Crucial: Zero frontend filtering; PostgreSQL rejects unowned rows automatically.
create policy "Users can only view their own company campaign data"
on public.campaign_data
for select
to authenticated
using (
  company_name = (
    select p.company_name
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

-- 7. SEED INITIAL CAMPAIGN DATA (5 rows for Alpha Ltd, 5 rows for Beta Ltd)
insert into public.campaign_data (company_name, channel, leads) values
  ('Alpha Ltd', 'Google Ads', 145),
  ('Alpha Ltd', 'Meta / Facebook', 98),
  ('Alpha Ltd', 'LinkedIn Ads', 64),
  ('Alpha Ltd', 'YouTube Video', 42),
  ('Alpha Ltd', 'Email Marketing', 110),
  ('Beta Ltd', 'Google Ads', 85),
  ('Beta Ltd', 'Meta / Facebook', 120),
  ('Beta Ltd', 'LinkedIn Ads', 45),
  ('Beta Ltd', 'TikTok Ads', 160),
  ('Beta Ltd', 'Organic Search', 95);

-- STEP 3 NOTE:
-- After creating alpha@test.com and beta@test.com in Supabase Auth > Users,
-- run the companion seed_users.sql script to link them into public.profiles.
-- ==============================================================================
