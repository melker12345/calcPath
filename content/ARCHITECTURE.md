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

The `content/` + `FileSystemContentBundle` + generic components architecture is now the **primary development direction** for the entire application (see `src/lib/content/NOTES.md` for the formal declaration and `MIGRATION-PLAN.md` for the phased roadmap).

Legacy per-subject TypeScript content is archived in `backup-content/legacy/`. All new content, features, and pages target the data-driven model.

## Migration Philosophy (Historical Context)

The initial rollout followed a deliberate sequence that has now been completed:
1. Thin vertical slice on Linear Algebra to validate the approach.
2. Schema + loader foundation.
3. Full ports of all three subjects (LA, Statistics, Calculus) with question parity.
4. Generic UI + `/x/` dynamic routes proving the complete flows.
5. Formal declaration as primary path.

Future work follows the phases in [MIGRATION-PLAN.md](../MIGRATION-PLAN.md): decoupling, promotion of generic paths, and retirement of legacy.

## Current Status & Next Steps

- **Done**: Full `content/` structure for all subjects, stable Zod schemas + `src/lib/content/loader.ts`, generic components, working `/x/` experience.
- **Active**: Decouple core systems (progress, answer checking, main routes) from legacy shapes so the new architecture powers the primary app.
- **Ongoing**: Improve generic components to full parity (or better) with legacy pages; expand MDX richness.

This document + `content/NOTES.md` + root `MIGRATION-PLAN.md` are the sources of truth. New work aligns here.
