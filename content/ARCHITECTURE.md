# Content architecture

Everything a reader sees comes from `content/`. Structured data is JSON,
validated with Zod at load time; prose is MDX in the house style. There is no
per-subject code: a new subject is a new folder.

## Layout

```
content/
  STYLE.md                       how to write a chapter
  questions.md                   how to write practice questions
  <subject>/
    index.json                   subject metadata + ordered chapter list
    legacy-topic-redirects.json  optional: old chapter id → new chapter (+ section)
    legacy-section-redirects.json optional: old chapter/section → the chapter it moved to
    topics/
      <chapter>/
        index.json               chapter metadata
        module.mdx               the chapter
        questions.json           practice questions
        problemset.json          optional printable chapter test
```

### `index.json` (subject)

```jsonc
{
  "slug": "calculus",             // must equal the folder name
  "label": "Calculus",
  "shortDescription": "…",        // one sentence, used on cards and in metadata
  "modulesDescription": "…",
  "icon": "∫",
  "order": 5,                     // position among subjects
  "category": "calculus",         // groups subjects on the home page
  "keywords": ["…"],              // optional, page metadata
  "ogTitle": "…", "ogDescription": "…", "courseDescription": "…",   // optional
  "topics": [
    { "id": "limits", "title": "Limits & Continuity", "description": "…",
      "order": 1, "estimatedMinutes": 120 }
  ]
}
```

The loader reads the subject list from this file. Every listed topic must have
a folder; a folder that is not listed is ignored with a warning.

### `index.json` (chapter)

The same `{ id, title, description, order, estimatedMinutes }` object as the
subject's `topics` entry. It must exist and agree with the subject index.

### `module.mdx`

YAML frontmatter with `title:`, one `#` title (stripped at render), then one
`##` per section. Each section has a stable slug: `{#slug}` on the heading, or
a `<!-- section: slug -->` comment within the next four lines, or the slugified
heading. **Every `section` in `questions.json` and `problemset.json` must equal
one of these slugs**; the validator refuses anything else, because progress,
deep links and the dashboard all key on them. A final `## Common Mistakes`
section is not a practice section.

Statements go in `:::` environments (`definition`, `theorem`, `lemma`,
`proposition`, `corollary`, `example`, `recipe`, `proof`, `solution`,
`intuition`, `remark`, `note`, `notation`, `pitfall`, `summary`, `figure`).
They never nest. The vocabulary lives in `src/lib/content/math-blocks.ts`;
`STYLE.md` says when to use which. Figures are JSON specs inside
`:::figure` (see `STYLE.md` §1a and `src/lib/content/figure-spec.ts`).

Mathematics is `$…$` and `$$…$$`; a literal dollar sign is `\$`.

### `questions.json`

An array of questions. `content/questions.md` is the authoring guide. Ids are
unique across the whole corpus and never change once live.

### `problemset.json` — the printable chapter test

A chapter has a chapter test **if and only if** this file exists; the route
`/{subject}/test/{chapter}` (and its `/answers` sibling) is auto-discovered.

The format exists because paper removes the grading constraint. A sheet worked
by hand can ask for the things that matter and cannot be auto-marked, so every
problem carries a `kind`:

| `kind` | asks the learner to |
|---|---|
| `computation` | evaluate or solve |
| `proof` | establish a statement from definitions or named theorems |
| `sketch` | draw a graph/region and justify the features drawn |
| `critique` | find the error in a given argument and repair it |

A sheet of nothing but `computation` wastes the format, and the validator
warns about it.

```jsonc
{
  "topicId": "limits",                    // must match the folder
  "title": "Limits & Continuity",
  "instructions": "Work this sheet on paper, showing every step — …",
  "problems": [
    {
      "id": "ps-calculus-limits-01",      // stable, unique across the WHOLE corpus
      "section": "indeterminate",         // must match a module.mdx section slug
      "kind": "computation",              // computation | proof | sketch | critique
      "difficulty": "easy",               // easy | medium | hard; sheets run easy → hard
      "minutes": 6,                       // expected working time; also sizes the
                                          // blank space printed under the question
      "prompt": "Evaluate each limit. …", // LaTeX in $…$ / $$…$$ as everywhere else
      "parts": ["$…$", "$…$", "$…$"],     // optional; printed (a), (b), (c), each
                                          // with its own working space
      "solution": "**(a) Factor and cancel.** …"   // the full METHOD, not an answer key
    }
  ]
}
```

`solution` is a worked method, not a final value: the learner is checking
their route, which is the only thing paper is good for. Blank lines separate
paragraphs; `**bold**` is supported.

### Redirect maps

When chapters are split, merged or moved between subjects, old URLs keep
working through two optional per-subject files, both hand-maintained:

- `legacy-topic-redirects.json` — `{ "<old-chapter-id>": { "chapterId", "section", "subject"? } }`
- `legacy-section-redirects.json` — `{ "<old-chapter-id>": { "<section-slug>": "<new-chapter-id>" } }`

## Code

- `src/lib/content/schema.ts` — Zod schemas for every file above; re-exports
  the client-side `Problem`/`Topic` types from `src/lib/shared-types.ts`.
- `src/lib/content/loader.ts` — reads and validates `content/`, auto-discovers
  subjects, caches per process; light paths for counts and section lists.
- `src/lib/content/mdx.ts` — section slug extraction and the intro / section /
  mistakes split; the single implementation the validator and the pages share.
- `src/lib/content/chapter.ts`, `render-chapter.ts`, `render-prose.ts`,
  `render-math.ts` — a chapter page: one module.mdx to HTML on the server
  (marked for prose, KaTeX for mathematics, environments numbered in document
  order, figures from `figure-spec.ts`). `render-math.ts` is the only KaTeX
  renderer; the problem sheets use it too.
- `src/lib/content/problemset-loader.ts` — problem sets and their static params.
- `src/lib/content/figure-spec.ts` — figure spec parsing and expression evaluation.
- `src/lib/server/report-snapshot.ts` — what a report captures from `content/`
  (the stored question, or the section source) at report time.
- `next.config.ts` — turns the two redirect files into permanent redirects at
  build time, so old URLs survive even though every content page is static.

## Gates

```
npm run content:validate     schemas, folder ↔ index parity, environment fences,
                             question.section ↔ module.mdx slug
npm run content:latex        every LaTeX fragment renders under KaTeX
npm run content:answers      every stored answer grades itself correct, respelled the
                             ways learners type it; distractors grade wrong
npm run content:problemsets  problem-set schema, corpus-wide unique ids, LaTeX
npm run content:audit        book-style coverage per subject; fails if a module lost
                             prose or a section slug moved (--base=<rev>, --verbose)
npm run content:figures      every figure spec parses and draws
npm run content:contrast     theme tokens against WCAG AA, light and dark
npx tsx scripts/audit-explanations.ts   duplicated prose, prose inside $…$,
                             raw LaTeX outside math — review, not a gate
```

Run all five gates after any content change. `docs/CONTENT-BACKLOG.md` lists
the measured content problems still open.
