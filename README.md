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
src/app/                     routes (Next.js app router)
src/components/              UI
src/lib/content/             loader, schema, MDX section extraction, figures
src/lib/answer-check.ts      grading
scripts/                     content gates and audits
docs/CONTENT-BACKLOG.md      known content problems, measured
```

Dropping a new `content/<subject>/` folder adds the subject everywhere: routes,
navigation, sitemap, search.

## Commands

```
npm run dev                  # never assume port 3000 is free
npm run build                # passes with no environment variables set
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

## Services

Supabase holds feedback reports (`supabase/schema.sql`) and the single admin
login for reading them. Both are optional: without the environment variables
the site builds and runs, and the report form simply cannot post.

See `CLAUDE.md` for the project rules.
