-- ============================================================================
-- CalcPath — database schema (idempotent)
-- ============================================================================
-- The site stores exactly one thing server-side: reports filed from the
-- "Report a problem" form on chapters and questions, and from /feedback.
-- Progress lives in the learner's browser; there are no accounts, no
-- analytics, no backups.
--
-- Apply: paste this file into the Supabase SQL editor and run it. It is safe
-- to run again. To wipe the old tables from earlier versions of the site, run
-- supabase/reset.sql instead (destructive).
--
-- Access: only the server (service role) reads and writes this table. RLS is
-- on and no policies are defined, so the anon key can do nothing with it.
-- ============================================================================

create table if not exists public.reports (
  id          uuid         primary key default gen_random_uuid(),
  created_at  timestamptz  not null default now(),
  status      text         not null default 'open'
                           check (status in ('open', 'fixed', 'dismissed')),
  kind        text         not null check (kind in ('question', 'chapter', 'site')),
  -- Where the report points. All null for kind = 'site'.
  subject     text,        -- content/<subject>
  topic_id    text,        -- content/<subject>/topics/<topic_id>
  section     text,        -- a ## section slug of module.mdx
  question_id text,        -- an id in questions.json (kind = 'question' only)
  -- What the learner said.
  reason      text         not null,
  message     text,
  page_url    text,
  -- Captured by the server at report time so the report stays actionable
  -- after the content changes: the stored question, or the section source.
  snapshot    jsonb,
  -- What the learner did on a practice question before reporting (their
  -- submissions and how each was graded, hint use, solution shown).
  learner     jsonb,
  resolved_at timestamptz
);

-- Inbox lists newest first, usually filtered to open reports.
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx     on public.reports (status);
create index if not exists reports_target_idx     on public.reports (subject, topic_id, question_id);

alter table public.reports enable row level security;
