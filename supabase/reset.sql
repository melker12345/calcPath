-- ============================================================================
-- CalcPath — FULL DB RESET (DESTRUCTIVE)
-- ============================================================================
-- Wipes every table this app has ever used (current + legacy) and recreates a
-- clean schema matching the dev branch. Run once in the Supabase SQL Editor.
--
-- This DELETES ALL DATA in these tables. It also wipes every auth user EXCEPT
-- the admin (step 3), so you launch with a single clean admin account.
-- ============================================================================

-- 1. Drop everything (current + legacy from the old accounts/subscription era)
drop table if exists public.feedback         cascade;
drop table if exists public.progress_backups cascade;
drop table if exists public.analytics_events cascade;
drop table if exists public.profiles         cascade;  -- legacy (old auth)
drop table if exists public.user_progress    cascade;  -- legacy (old sync)

-- 2. Recreate the clean schema (mirrors supabase/schema.sql)

-- progress_backups — PIN + password cloud backup (no accounts, no emails)
create table public.progress_backups (
  pin           text         primary key,
  password_hash text         not null,
  blob          jsonb        not null,
  is_template   boolean      not null default false,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  last_accessed timestamptz  default now()
);

create index progress_backups_template_idx
  on public.progress_backups (is_template)
  where is_template = true;

alter table public.progress_backups enable row level security;

-- feedback — bug/feature/general messages and per-target up/down votes
create table public.feedback (
  id          uuid         primary key default gen_random_uuid(),
  kind        text         not null check (kind in ('bug', 'feature', 'general', 'vote')),
  user_id     uuid,
  page_url    text,
  message     text,
  vote        smallint     check (vote in (-1, 0, 1)),
  target_type text,
  target_id   text,
  status      text         not null default 'open' check (status in ('open', 'fixed', 'trash')),
  created_at  timestamptz  not null default now()
);

create index feedback_created_at_idx on public.feedback (created_at desc);
create index feedback_kind_idx       on public.feedback (kind);
create index feedback_vote_lookup_idx
  on public.feedback (user_id, target_type, target_id)
  where kind = 'vote';

alter table public.feedback enable row level security;

-- analytics_events — privacy-friendly in-house usage tracking (no PII, no IP).
-- Aggregation RPCs live in supabase/analytics.sql — run that file too.
create table public.analytics_events (
  id          bigint generated always as identity primary key,
  event       text        not null,
  visitor_id  text,
  session_id  text,
  path        text,
  referrer    text,
  duration_ms integer,
  meta        jsonb,
  created_at  timestamptz not null default now()
);
create index analytics_events_created_idx on public.analytics_events (created_at);
create index analytics_events_event_idx   on public.analytics_events (event);
create index analytics_events_session_idx on public.analytics_events (session_id);
alter table public.analytics_events enable row level security;

-- 3. Wipe every auth user except the admin (the new version has no signup UI;
--    only the admin account is needed). Cascades to auth.identities/sessions.
delete from auth.users
where lower(email) <> 'melkeroberg03@gmail.com';
