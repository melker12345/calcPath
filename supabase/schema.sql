-- ============================================================================
-- CalcPath — clean database schema (dev branch)
-- ============================================================================
-- This is the COMPLETE set of tables/columns this version of the app actually
-- uses. Run it once against a fresh (or freshly wiped) Supabase project to get
-- a clean database with no leftover columns/tables from older versions.
--
-- Safe to run on an empty DB. It is idempotent (IF NOT EXISTS everywhere), so
-- re-running it will not error or clobber existing data.
--
-- The app talks to these tables ONLY via the service-role key (server-side),
-- which bypasses Row Level Security. We enable RLS with no policies so the
-- public/anon key has zero access.
--
-- After running this, seed the public recovery templates with:
--   npx tsx scripts/seed-progress-templates.ts
-- ============================================================================


-- ----------------------------------------------------------------------------
-- OPTIONAL: full reset (DESTRUCTIVE)
-- ----------------------------------------------------------------------------
-- Uncomment this block ONLY when you intentionally want to wipe these tables
-- before recreating them. This drops ALL backup + feedback data.
--
-- If your old live DB has legacy tables from previous versions that this app no
-- longer uses (e.g. user_progress, sync_codes, snapshots, ...), drop those
-- manually too — they are intentionally NOT recreated below.
--
-- drop table if exists public.feedback cascade;
-- drop table if exists public.progress_backups cascade;


-- ----------------------------------------------------------------------------
-- progress_backups — PIN + password cloud backup (no accounts, no emails)
-- ----------------------------------------------------------------------------
-- One row per backup. The PIN is the 6-digit primary key. `blob` holds the
-- compact CloudProgressBlob (2-bit-per-question bitset + test/diagnostic
-- summaries). Templates (is_template = true) are public, read-only milestones.
create table if not exists public.progress_backups (
  pin           text         primary key,
  password_hash text         not null,
  blob          jsonb        not null,
  is_template   boolean      not null default false,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  last_accessed timestamptz  default now()
);

-- Fast lookup of the handful of recovery templates.
create index if not exists progress_backups_template_idx
  on public.progress_backups (is_template)
  where is_template = true;

alter table public.progress_backups enable row level security;


-- ----------------------------------------------------------------------------
-- feedback — bug/feature/general messages and per-target up/down votes
-- ----------------------------------------------------------------------------
-- kind = 'vote'  -> uses vote (+1/-1/0) + target_type + target_id, message optional (note)
-- kind = other   -> uses message (the report text), target_type/target_id when the
--                   report was filed on a specific question, and context (jsonb)
--                   with what the user actually did (submitted answers, hint use…)
-- user_id is nullable: on this branch auth is stripped, so it is effectively
-- always null. It is kept so the same schema works if auth is reintroduced.
create table if not exists public.feedback (
  id          uuid         primary key default gen_random_uuid(),
  kind        text         not null check (kind in ('bug', 'feature', 'general', 'vote')),
  user_id     uuid,
  page_url    text,
  message     text,
  vote        smallint     check (vote in (-1, 0, 1)),
  target_type text,
  target_id   text,
  context     jsonb,
  status      text         not null default 'open' check (status in ('open', 'fixed', 'trash')),
  created_at  timestamptz  not null default now()
);

-- Existing databases predating the report-context column: add it in place.
alter table public.feedback add column if not exists context jsonb;

-- Admin inbox lists newest first.
create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

-- Filtering the inbox by kind.
create index if not exists feedback_kind_idx
  on public.feedback (kind);

-- One-vote-per-(user, target) lookup used when a signed-in user toggles a vote.
create index if not exists feedback_vote_lookup_idx
  on public.feedback (user_id, target_type, target_id)
  where kind = 'vote';

alter table public.feedback enable row level security;


-- ----------------------------------------------------------------------------
-- analytics_events — privacy-friendly in-house usage tracking (no PII, no IP)
-- ----------------------------------------------------------------------------
-- Full table + aggregation RPCs live in supabase/analytics.sql. Run that file
-- too (it is idempotent) to enable the /admin/metrics dashboard.
create table if not exists public.analytics_events (
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

create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_event_idx   on public.analytics_events (event);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;


-- ----------------------------------------------------------------------------
-- OPTIONAL: profiles — only needed if/when auth is reintroduced
-- ----------------------------------------------------------------------------
-- On this dev branch auth is stripped, so feedback.user_id is always null and
-- the admin feedback view never reads this table. It is left commented out to
-- keep the clean DB minimal. Uncomment if you bring back Supabase Auth and want
-- to map feedback.user_id -> email in the admin inbox.
--
-- create table if not exists public.profiles (
--   id    uuid primary key references auth.users (id) on delete cascade,
--   email text
-- );
-- alter table public.profiles enable row level security;
