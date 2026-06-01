# Legacy Content Backup

This directory contains the original TypeScript-based content files that powered the math practice app prior to the migration to a pure data-driven architecture.

## Why These Files Were Backed Up

We are committing fully to the **new data-driven architecture**:

- **Canonical content source**: `content/` (JSON for structure/questions + MDX for rich explanations/modules)
- **Generic UI components**: `src/components/generic-*` + dynamic routes under `src/app/x/` consume only the `FileSystemContentBundle` from `src/lib/content/loader.ts` + schema in `schema.ts`
- **Legacy monolithic TS files** (`*-content.ts`, `*-modules.ts`, `*-questions/*.ts`) are no longer the source of truth. They aggregated questions, topics, modules, and rich text in code.

**Rationale for backup (not deletion)**:
- Preserve complete git history for every question, module section, ELI5, example, common mistake, etc.
- Allow gradual, safe removal of references in subjects.ts, practice pages, tests, loader adapter, etc.
- Provide an easy audit trail / diff source during the parallel content porting (all questions + MDX were derived 1:1 from these legacy files).
- Enable quick restoration if any edge case or progress-tracking ID issue is discovered post-migration.
- The migration followed many small, vertical slices with exact parity verification (461 stats + 336 LA + 435 calc questions).

See:
- `content/ARCHITECTURE.md` for the target shape
- `src/lib/content/NOTES.md` for the full migration timeline and agent work
- `docs/content-scalability-audit.md` and `future-dynamic.md` for background

## Directory Structure

```
backup-content/legacy/
├── linear-algebra/
│   ├── linalg-content.ts
│   ├── linalg-modules.ts
│   └── linalg-questions/
│       ├── vectors.ts
│       ├── matrices.ts
│       ├── ... (9 topic modules total)
├── statistics/
│   ├── statistics-content.ts
│   ├── statistics-modules.ts
│   └── statistics-questions/
│       ├── descriptive.ts
│       ├── ... (16 files: 14 topics + 2 cross files distributions.ts + inference.ts)
└── calculus/
    ├── calculus-content.ts
    └── calculus-questions/
        ├── limits.ts
        ├── ... (9 topic modules)
```

**Total backed up**: 39 TypeScript files (5 entrypoints + 34 question modules) via `git mv` (100% renames, zero content changes).

## How to Restore If Needed

**Preferred (history-preserving)**:
1. `git checkout <commit-before-backup> -- src/lib/linalg-content.ts src/lib/linalg-questions/ ...` (or specific paths)
2. Or use `git show <pre-backup-sha>:src/lib/linalg-content.ts > src/lib/linalg-content.ts` and repeat for others.

**Quick fs copy (for emergency only)**:
```bash
cp -r backup-content/legacy/linear-algebra/linalg-questions src/lib/
cp backup-content/legacy/linear-algebra/linalg-content.ts src/lib/
# ... repeat for modules + other subjects
```

**After restore**:
- You will also need to revert any partial import cleanups (search for the old import paths).
- Re-run `npm run build` / typecheck / tests.
- Update `src/lib/content/loader.ts` adapter if it was switched to pure FS mode.
- **Strongly prefer** fixing in the new `content/` + generic path instead of restoring.

The backup commits are on the feature branch (`feat/fully-dynamic-data-driven-architecture`) under messages starting with `backup(legacy): ...`. Use `git log --follow -- src/lib/linalg-content.ts` (pre-move path) or the new backup paths to browse history.

## Current Migration Status (as of 2026-06-01)

- [x] All legacy TS content for Linear Algebra, Statistics, and Calculus fully ported to `content/{linear-algebra,statistics,calculus}/` (subject index.json + per-topic index.json + questions.json + module.mdx).
- [x] Question parity achieved exactly (verified against legacy counts, all original `id`s, LaTeX, wording, explanations, choices preserved).
- [x] Generic components (`GenericPracticeExperience`, `GenericModuleViewer`, `MdxContent`) + experimental `/x/[subject]/...` routes fully functional and polished against the new data only.
- [x] **This backup phase completed**: 3 small clean commits moving 39 files with full rename history. No importing code was modified.
- [ ] Gradual reference removal + deletion of legacy TS files (future work, once /x/ or new routes promoted and legacy subject pages deprecated).
- [ ] Full MDX compilation (next-mdx-remote + custom components for ELI5/callouts) still pending for production polish.
- [ ] Calculus loader adapter in `getFileSystemContentBundle` + full `/x/calculus` support pending (folders exist in content/).
- Loader, schema, progress, answer-check, and local storage remain fully compatible because stable `problem.id`s were never changed.

**New canonical source of truth**:
- `content/linear-algebra/`, `content/statistics/`, `content/calculus/`
- Loaded via `src/lib/content/loader.ts:getFileSystemContentBundle(subjectSlug)`
- Validated by Zod schemas in `src/lib/content/schema.ts`
- Rendered by generic components + MDX pipeline

Legacy files in `backup-content/legacy/` are now **read-only archival copies**.

## Next Steps (Post-Backup)

- Continue any remaining calculus loader work.
- Promote `/x/` patterns or perform A/B.
- One-by-one, update/delete imports in:
  - `src/lib/subjects.ts`
  - `src/lib/feedback-metadata.ts`
  - `src/lib/content-spacing.test.ts`
  - `src/lib/section-coverage.test.ts`
  - `src/lib/local-tests/...`
  - All `src/app/{linear-algebra,statistics,calculus}/**/*.tsx`
  - `src/app/sitemap.ts`
  - `src/lib/content.ts` (re-exports)
  - `src/lib/content/loader.ts` (the old adapter imports)
- Once all references gone, `git rm` the backup dirs (or leave for long-term archive).
- Update this README and `src/lib/content/NOTES.md` with final deletion commit.

**Migration agents followed strict rules**: small commits, read-before-edit, no scope creep, frequent NOTES updates, zero modification of still-importing code during backup.

---

*Backup performed by Legacy Backup Agent on 2026-06-01. All operations used `git mv` in the feature branch worktree context for maximum history safety.*
