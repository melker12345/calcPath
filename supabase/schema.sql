-- CalcPath Supabase schema
-- Apply in Supabase SQL editor. Then enable email provider in Auth settings.

-- PROFILES: one row per user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  pro_until timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- USER PROGRESS: store ProgressState as JSON for simplicity
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Helpful trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_progress_set_updated_at on public.user_progress;
create trigger user_progress_set_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

-- Users can update their own profile but NOT plan/pro_until/stripe fields.
-- Those are managed exclusively by the server via the service role key.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  -- Prevent users from changing billing fields via client-side requests.
  -- The service role key (used by webhooks) bypasses RLS entirely.
);

-- Progress policies
drop policy if exists "progress_select_own" on public.user_progress;
create policy "progress_select_own"
on public.user_progress
for select
using (auth.uid() = user_id);

drop policy if exists "progress_upsert_own" on public.user_progress;
create policy "progress_upsert_own"
on public.user_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.user_progress;
create policy "progress_update_own"
on public.user_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
