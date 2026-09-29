# CalcPath

Free university mathematics: textbook chapters, practice questions with
auto-grading, printable problem sets. The goal of the site is **transfer of
high quality information**. Everything else is secondary.

## What the site is

- **Chapters** — `content/<subject>/topics/<topic>/module.mdx`, rendered as a
  book (numbered definitions, theorems, examples, figures). Read
  `content/STYLE.md` before writing one.
- **Practice** — `questions.json` next to the chapter, graded in the browser.
  Read `content/questions.md` before writing questions.
- **Problem sets** — `problemset.json`, printed and worked on paper, with a
  separate solutions page.
- **Progress** — stored in the browser only (localStorage), shown on the
  dashboard. No accounts.
- **Feedback** — a report form on every chapter and question. Reports are
  written so that an LLM can fix the content from the report alone.

There is no analytics, no donations, no cloud sync, no gamification. Do not
add them back.

## Rules

- **Content first.** Correctness of the mathematics and legibility of the
  rendered LaTeX are never traded for anything.
- **Server-render content.** Chapters and problem sets are static HTML built
  at deploy time. Client components exist only where there is interaction
  (practice input, progress controls, the report form, theme toggle, nav).
- **Plain UI.** No shadows, no rounded corners, no transitions or animations,
  no hover background tints, no backdrop blur, no scale-on-press. Links
  underline on hover; buttons are bordered boxes. Use the tokens in
  `src/app/globals.css` (`--bg`, `--surface`, `--text-*`, `--border`,
  `--accent`) via the `theme-*` classes, never raw Tailwind palette colours.
  Light and dark themes both matter; check both.
- **System fonts.** No web font downloads. KaTeX ships its own fonts.
- **Per-subject identity** is the nav bar tint only (`src/lib/themes.ts`).
- **No new dependencies** without a strong reason.
- **Small, stable ids.** Question ids and section slugs are stable forever;
  progress and reports are keyed by them.

## Commands

```
npm run dev                  # never assume port 3000 is free
npm run build                # must pass with NO environment variables set
npm run lint && npx tsc --noEmit
npm run content:validate     # schemas + question.section ↔ module.mdx
npm run content:latex        # every LaTeX fragment renders under KaTeX
npm run content:answers      # every stored answer grades itself correct
npm run content:problemsets  # problem-set schema + ids + LaTeX
npm run content:audit        # book-style coverage; fails if prose is lost
```

All five content gates plus lint, typecheck and build must be green before a
commit on `dev`.

## Git

Work happens on `dev` (or a branch merged into `dev`). `master` stays clean.
Nothing is ever pushed.
