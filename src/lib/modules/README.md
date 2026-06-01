# Modules Content Structure (Work in Progress)

This folder is being refactored as part of the content scalability effort (`refactor/content-scalability` branch).

## Current Goal (Phase 2)

Move away from giant monolithic files:
- `modules.ts` (~2400 lines — all calculus)
- `linalg-modules.ts`
- `statistics-modules.ts`

## Target Structure

```
src/lib/modules/
├── types.ts                 # Shared types (ModuleContent, ModuleSection, etc.)
├── index.ts                 # Public entry point (re-exports everything)
├── README.md
├── calculus/
│   ├── index.ts
│   ├── limits.ts
│   ├── derivatives.ts
│   ├── integrals.ts
│   ├── ...
├── linear-algebra/
│   └── ...
└── statistics/
    └── ...
```

## Status

- [x] Central `types.ts` created
- [x] `linalg-modules.ts` and `statistics-modules.ts` now import types from central location
- [ ] Actual content split (per-topic files) — in progress
- [ ] Update main `modules.ts` to become a thin aggregator

## Why This Matters

- Makes it realistic to add many more topics without the file becoming unmaintainable.
- Better for collaboration and code review.
- Prepares the ground for eventually supporting many more subjects.

## Notes

- Backward compatibility is being maintained for now (existing imports should continue to work).
- Full content migration will happen incrementally on this branch.
