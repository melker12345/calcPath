-- ============================================================================
-- CalcPath — in-house analytics (privacy-friendly: no PII, no IP addresses)
-- ============================================================================
-- Run once in the Supabase SQL Editor. Idempotent. The app writes rows via the
-- service-role key (server-side) and reads aggregates through the RPCs below,
-- also service-role. RLS is on with no policies, so anon/public get nothing.
-- ============================================================================

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  event       text        not null,      -- 'pageview' | 'page_time' | custom event
  visitor_id  text,                       -- anonymous, localStorage-scoped
  session_id  text,                       -- anonymous, sessionStorage-scoped
  path        text,
  referrer    text,
  duration_ms integer,                    -- set on 'page_time' events
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_event_idx   on public.analytics_events (event);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;

-- ----------------------------------------------------------------------------
-- Aggregation RPCs (called with the service-role key from /api/metrics)
-- ----------------------------------------------------------------------------

-- Totals for a period: unique visitors, sessions, page views, avg session time.
create or replace function public.analytics_summary(since timestamptz)
returns table (
  visitors bigint,
  sessions bigint,
  pageviews bigint,
  avg_session_ms double precision
)
language sql stable as $$
  with per_session as (
    select session_id, sum(coalesce(duration_ms, 0)) as session_ms
    from public.analytics_events
    where created_at >= since and session_id is not null
    group by session_id
  )
  select
    (select count(distinct visitor_id) from public.analytics_events where created_at >= since),
    (select count(distinct session_id) from public.analytics_events where created_at >= since),
    (select count(*) from public.analytics_events where created_at >= since and event = 'pageview'),
    (select avg(session_ms) from per_session);
$$;

-- Daily time series for charts.
create or replace function public.analytics_daily(since timestamptz)
returns table (
  day date,
  visitors bigint,
  sessions bigint,
  pageviews bigint,
  avg_session_ms double precision
)
language sql stable as $$
  with per_session as (
    select session_id, visitor_id, min(created_at)::date as day,
           sum(coalesce(duration_ms, 0)) as session_ms
    from public.analytics_events
    where created_at >= since and session_id is not null
    group by session_id, visitor_id
  ),
  daily_sessions as (
    select day,
           count(distinct visitor_id) as visitors,
           count(distinct session_id) as sessions,
           avg(session_ms) as avg_session_ms
    from per_session
    group by day
  ),
  daily_pageviews as (
    select created_at::date as day, count(*) as pageviews
    from public.analytics_events
    where created_at >= since and event = 'pageview'
    group by created_at::date
  )
  select
    coalesce(s.day, p.day) as day,
    coalesce(s.visitors, 0),
    coalesce(s.sessions, 0),
    coalesce(p.pageviews, 0),
    coalesce(s.avg_session_ms, 0)
  from daily_sessions s
  full outer join daily_pageviews p on s.day = p.day
  order by 1;
$$;

-- Most-visited paths for a period.
create or replace function public.analytics_top_paths(since timestamptz, max_rows int default 12)
returns table (path text, views bigint)
language sql stable as $$
  select path, count(*) as views
  from public.analytics_events
  where created_at >= since and event = 'pageview' and path is not null
  group by path
  order by views desc
  limit max_rows;
$$;

-- Lock the RPCs down to the service role only.
revoke execute on function public.analytics_summary(timestamptz)          from public;
revoke execute on function public.analytics_daily(timestamptz)            from public;
revoke execute on function public.analytics_top_paths(timestamptz, int)   from public;
grant  execute on function public.analytics_summary(timestamptz)          to service_role;
grant  execute on function public.analytics_daily(timestamptz)            to service_role;
grant  execute on function public.analytics_top_paths(timestamptz, int)   to service_role;
