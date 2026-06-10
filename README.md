# CalcPath

Free, self-contained university mathematics courses. Step-by-step explanations (via content-driven MDX), interactive practice with instant feedback + MathInput, and local progress tracking.

New subjects are added by simply dropping a folder into `content/<slug>/` (index.json + topics/... with questions.json + module.mdx). Zero code changes required. Full auto-discovery powers routes, navbar (via dynamic dropdown), /subjects listing, dashboard, sitemap, search, etc.

Run `npm run content:validate` after edits — it enforces schemas + the hard requirement that every question.section matches a heading in the topic's module.mdx.

## Current Subjects (dynamic)

- Calculus
- Statistics
- Linear Algebra



## Features

- **Dynamic subjects** — Add more by dropping content/ folders (JSON + MDX); everything auto-wires (home, modules, practice, etc.)
- **Rich explanations** — Parsed from MDX with ELI5, worked examples, common pitfalls, section anchors for deep links + progress
- **Practice** — Numeric/MCQ questions with MathInput (keypad + suggestions), hints, solutions, mastery tracking
- **Topic tests** (Calculus) — Dedicated per-topic tests via the app's /<subject>/test/ feature
- **Local progress + sync** — Everything stored locally (no account required). Use the ephemeral /sync page (or Profile page) for cross-device transfer via short codes (no PII, self-destructing snapshots)
- **Donations** — Optional one-time support via Stripe

## Tech Stack

- Next.js 16 + React 19 + Tailwind
- Content-driven data (content/ + loader + generics; no per-subject JS)
- KaTeX + react-mathquill for math
- Supabase (for feedback + ephemeral sync snapshots only)
- Stripe

See `content/ARCHITECTURE.md` for how to author new subjects.

