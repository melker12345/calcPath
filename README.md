# CalcPath

Free university mathematics, written to transfer information well: textbook
chapters, practice questions graded in the browser, and printable problem
sets. No accounts, no analytics, no advertising. Progress is kept in the
reader's browser.

## Layout

```
content/<subject>/
  index.json                 subject metadata + ordered chapter list
  topics/<chapter>/
    index.json               chapter title, description, order, estimatedMinutes
    module.mdx               the chapter, in the house style (content/STYLE.md)
    questions.json           auto-graded practice questions (content/questions.md)
    problemset.json          optional printable chapter test (content/ARCHITECTURE.md)
  legacy-topic-redirects.json   optional: old chapter id → new chapter (+ section)
  legacy-section-redirects.json optional: old chapter + section → the chapter it moved to
src/app/                     routes (Next.js app router); every content route is
                             prerendered at build (generateStaticParams)
src/components/              UI
src/lib/content/             loader + schema, MDX section extraction, the server
                             renderers (render-math, render-prose, render-chapter,
                             chapter.ts), figures, problem sets
src/lib/answer-check.ts      grading (client side, in the practice page)
src/lib/progress*.ts         progress v2: localStorage store + model; use-progress.ts hook
src/lib/reports.ts, report-markdown.ts, server/report-snapshot.ts
                             reports: types, the LLM-ready brief, the content snapshot
worker/                      the Cloudflare worker: /api/feedback, ?section= redirects
scripts/                     content gates and audits
tests/stubs/server-only.ts   lets vitest import server-only modules
docs/CONTENT-BACKLOG.md      known content problems, measured
```

Dropping a new `content/<subject>/` folder adds the subject everywhere: routes,
navigation, sitemap, search, dashboard. Old chapter ids keep working through
the two optional redirect files, turned into permanent redirects at build
time by `scripts/cloudflare-assets.ts`.

## How pages are made

- **Chapters** — `module.mdx` is parsed once on the server and typeset with
  KaTeX at build time; the page ships rendered HTML and no KaTeX or markdown
  JavaScript.
- **Practice** — one client component per topic; questions are graded in the
  browser (`answer-check.ts`), multiple-choice options are shown in a fixed
  per-question order.
- **Problem sets** — server-rendered sheets with print CSS; a separate
  solutions page.
- **Progress** — chapters read, questions solved and sheets done, kept in the
  browser (`calc_progress_v2` in localStorage) with JSON export and import on
  `/dashboard`.
- **Reports** — "Report a problem" on every chapter and question posts to
  `/api/feedback` (the worker, `worker/feedback.ts`). It snapshots the item
  from `/report-data/<subject>/<chapter>.json`, built from `content/` at deploy
  time and not public, and stores it in the Supabase `reports` table. `/admin/feedback` renders each report as a
  markdown brief an LLM can act on.

## Commands

```
npm run dev                  # never assume port 3000 is free
npm run build                # static export to out/; passes with no environment variables set
npm run preview              # serve out/ + the worker locally (wrangler dev)
npm run deploy               # build + deploy to Cloudflare
npm run lint && npx tsc --noEmit
npm test                     # unit tests (grading, section slugs, parsers)

npm run content:validate     # schemas; every question.section ↔ a module.mdx section
npm run content:latex        # every LaTeX fragment renders under KaTeX
npm run content:answers      # every stored answer grades itself correct, respelled
npm run content:problemsets  # problem-set schema, corpus-wide ids, LaTeX
npm run content:audit        # book-style coverage; fails if prose is lost

npm run content:figures      # every :::figure spec parses and draws
npm run content:contrast     # theme tokens against WCAG AA
npx tsx scripts/audit-explanations.ts   # duplicated prose, prose inside $…$
```

The five `content:*` gates plus lint, typecheck, tests and build are green
before a commit on `dev`.

## Hosting

Cloudflare Workers (`wrangler.jsonc`). The site is a static export: every
page is a file in `out/`, served by Cloudflare without running any code.
`out/_redirects` and `out/_headers` are written after `next build` by
`scripts/cloudflare-assets.ts`. Only `/api/*`, `/report-data/*` and paths
with no file reach the worker (`worker/index.ts`).

The `NEXT_PUBLIC_*` variables are read by `next build` (from `.env` locally)
and baked into the admin page; the worker reads the same names as Cloudflare
variables and secrets (`npx wrangler secret put …`), and from `.env` under
`npm run preview`.

## Services

Supabase holds the `reports` table (`supabase/schema.sql`) and the single
admin login for reading it. Both are optional: without the variables listed in
`.env.example` the site builds and runs, and the report form answers 503.

See `CLAUDE.md` for the project rules.
