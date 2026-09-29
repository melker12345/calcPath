-- ============================================================================
-- CalcPath — FULL DB RESET (DESTRUCTIVE)
-- ============================================================================
-- Drops every table any version of the site has used and recreates the one
-- table the current site needs (public.reports, see schema.sql). Run once in
-- the Supabase SQL editor. All data in these tables is lost.
--
-- Admin sign-in for /admin/feedback uses Supabase Auth: create the admin user
-- with `npx tsx scripts/create-admin.ts '<password>'` (reads ADMIN_EMAIL from
-- .env). Step 3 below removes every other auth user.
-- ============================================================================

-- 1. Drop everything, current and legacy.
drop table if exists public.reports          cascade;
drop table if exists public.feedback         cascade;  -- old votes + reports
drop table if exists public.progress_backups cascade;  -- old PIN cloud backup
drop table if exists public.analytics_events cascade;  -- old in-house tracker
drop table if exists public.profiles         cascade;  -- old accounts
drop table if exists public.user_progress    cascade;  -- old sync

-- 2. Recreate the schema (mirrors supabase/schema.sql).
create table public.reports (
  id          uuid         primary key default gen_random_uuid(),
  created_at  timestamptz  not null default now(),
  status      text         not null default 'open'
                           check (status in ('open', 'fixed', 'dismissed')),
  kind        text         not null check (kind in ('question', 'chapter', 'site')),
  subject     text,
  topic_id    text,
  section     text,
  question_id text,
  reason      text         not null,
  message     text,
  page_url    text,
  snapshot    jsonb,
  learner     jsonb,
  resolved_at timestamptz
);

create index reports_created_at_idx on public.reports (created_at desc);
create index reports_status_idx     on public.reports (status);
create index reports_target_idx     on public.reports (subject, topic_id, question_id);

alter table public.reports enable row level security;

-- 3. Keep only the admin auth user. Replace <admin email> with the ADMIN_EMAIL
--    from .env before running this statement.
delete from auth.users
where lower(email) <> '<admin email>';
