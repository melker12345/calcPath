# Content Architecture Decision (2026-06-01)

## Goal
Move from "content as TypeScript code" to "content as data" so that adding or updating educational material requires almost no code changes.

## Final Formats Chosen

| Content Type              | Format     | Reason |
|---------------------------|------------|--------|
| Structured data (subjects, topics, questions, metadata) | **JSON** | Strict typing, easy validation with Zod, machine-friendly |
| Rich explanations (body text, ELI5, examples, common mistakes, etc.) | **MDX** | Excellent authoring experience, supports LaTeX, future custom components, images, etc. |

**YAML was explicitly rejected** in favor of JSON.

## Recommended Folder Structure

```
content/
  {subject-slug}/
    index.json                 # Subject metadata + topic list
    topics/
      {topic-id}/
        index.json             # Topic metadata (title, description, order, estimatedMinutes)
        questions.json         # Array of all practice questions for this topic
        module.mdx             # Rich explanation content (sections, ELI5, examples, etc.)
```

### Example

```
content/
  linear-algebra/
    index.json
    topics/
      vectors/
        index.json
        questions.json
        module.mdx
      matrices/
        ...
```

## Why This Split?

- **JSON** for everything that needs to be queried, validated, or used for routing/progress.
- **MDX** for human-authored rich content. This gives us the best of both worlds:
  - Strong structure where we need it
  - Pleasant writing experience where it matters most (explanations)

## Official Declaration (2026-06)

The `content/` + `FileSystemContentBundle` + generic components architecture is now the **primary development direction** for the entire application (see `src/lib/content/NOTES.md` for the formal declaration and git history for the phased roadmap details).

Legacy per-subject TypeScript content was archived in `backup-content/legacy/` and has been **fully deleted** (2026-06-03) after migration complete (sign-off + two.md + verification waves). All history preserved in git. All new content, features, and pages target the data-driven model.

## Migration Philosophy (Historical Context)

The initial rollout followed a deliberate sequence that has now been completed:
1. Thin vertical slice on Linear Algebra to validate the approach.
2. Schema + loader foundation.
3. Full ports of all three subjects (LA, Statistics, Calculus) with question parity.
4. Generic UI + `/x/` dynamic routes proving the complete flows.
5. Formal declaration as primary path.

Phases (decoupling, promotion of generic paths, retirement of legacy + final backup deletion) are complete (see git history for MIGRATION-PLAN.md / two.md details and src/lib/content/NOTES.md).

## Current Status & Next Steps

- **Done**: Full `content/` structure for all subjects, stable Zod schemas + `src/lib/content/loader.ts`, generic components, working `/x/` experience.
- **Done**: Full ports + decouple + generic promotion + retirement of legacy + /x/.
- **Final**: Lightweight auto subject discovery (`loader.getAvailableSubjectConfigs()`) enables true "just drop content/{new-subject}/" with zero subjects.ts / code changes. (See NOTES.md + git history for prior plan docs.)

This document + `content/NOTES.md` (historical) are the sources of truth. Detailed prior plan docs (MIGRATION-PLAN.md, one.md, two.md, etc.) are preserved in git history. New work aligns here. Migration complete.

## Authoring Rules & Validation
- Run `npm run content:validate` (uses tsx) before committing content changes. It enforces Zod schemas, folder<->index parity, **and the critical invariant**: every `question.section` must exactly equal a section slug derived from the topic's `module.mdx` (from `## Title` + optional `{#slug}` or immediate following `<!-- section: slug -->` comment).
- Sections power per-section mastery, deep links (?section=), dashboard, and progress. Mismatches silently break UX for that topic.
- Use `<!-- section: the-exact-string-from-questions -->` right after the relevant `##` when the natural heading slug would not match the qs you need (or use `{#slug}` in the heading itself).
- `per-topic/index.json` is optional (subject-level list wins for metadata); folder must still exist if questions/mdx are present.
- All three core markers (`**ELI5**`, `**Worked Example:**`, `## Common Mistakes` / `## Pitfalls`) are recommended for best authoring consistency and full ELI5/worked/pitfalls UI cards.
- However, the rich content parser (in adapters.ts + mdx utils) is resilient: it auto-detects example blocks (via h3 containing "example", "Step 1:", etc.), ELI5 variants, and common-mistakes headings (pitfalls/errors) even if the exact bold markers are absent or worded differently. Thus "recommended" markers improve UX polish but missing ones no longer silently degrade the cards. Run validate to see authoring warnings.
