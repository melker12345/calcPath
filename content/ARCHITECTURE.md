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

## Migration Philosophy

1. Start with a **thin vertical slice** on **Linear Algebra** (smallest + cleanest subject).
2. Build schema + loader first.
3. Prove that a generic practice experience can consume data from this structure.
4. Only later expand to other subjects and full generic routes.

## Next Steps After This Decision

- Define Zod schemas that match this folder structure.
- Build a content loader that can read `content/linear-algebra/...`
- Create a minimal demo of a generic practice page using the new data format.

This document serves as the source of truth for all future work on the dynamic architecture.
