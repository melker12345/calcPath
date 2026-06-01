# Migration Plan: Data-Driven Architecture as Primary

**Date**: 2026-06-01 (updated live)  
**Branch**: `feat/fully-dynamic-data-driven-architecture` (treated as main dev branch until stable)  
**Goal**: Make `content/` (JSON + MDX) + generic components the single source of truth for the entire application.

**Live Status**: Backup Phase complete (39 legacy files safely moved via git mv). Multiple specialized subagents actively working on MathInput, practice resilience, docs declaration, X-area promotion, and progress adaptation in parallel. Direct work on de-experimentalizing /x/ also in progress. Light-speed mode activated.

## Guiding Principle
"Add a subject = write explanations and questions in `content/`. The site handles routing, navigation, practice, progress, and everything else."

The old per-subject TypeScript files (`src/lib/*-content.ts`, `*-questions/`, `*-modules.ts`) are now legacy.

## Current Status (as of start of this phase)

- **New system**:
  - Full `content/linear-algebra/`, `content/statistics/`, `content/calculus/` with index + per-topic questions.json + module.mdx
  - `src/lib/content/loader.ts` + schema
  - Generic components: `GenericPracticeExperience`, `GenericModuleViewer`, `MdxContent`, etc.
  - Working (with some rough edges) at `/x/`

- **Legacy system**:
  - Old TS files still power the "real" `/linear-algebra`, `/statistics`, `/calculus` pages.
  - Progress, auth, and rich practice features are tightly coupled to the old shapes.

## High-Level Phases

### Phase 0: Foundation (Largely Complete)
- [x] Declare new architecture as primary direction (2026-06)
- [x] Backup all legacy content TS files → `backup-content/legacy/` (39 files)
- [x] Stabilize the new system in the `/x/` development area (MathInput, practice resilience, de-experimentalization, progress compatibility)
- [x] Create compatibility shims so the main app continues to build

**Key Strategic Clarification (user confirmed)**: `/x/` is the **development lab and primary innovation surface**, not the final user-facing destination. The goal is to **evolve the existing high-quality real pages** (`/calculus/`, `/statistics/`, module pages, practice, dashboard, etc.) to support the new data model with minimal changes to their UI/logic, rather than replacing them with generic /x/ versions.

### Phase 1: Evolutionary Integration (Current Focus)
Make the real application routes able to consume `content/` data with the smallest possible diffs to existing components. Use adapters where needed to keep battle-tested components (`SubjectModulePage`, `CourseContentsPage`, etc.) working.

### Phase 1: Decouple Core Layers
- Progress tracking → work cleanly against `FileSystemContentBundle` problems (stable IDs already help)
- Auth / user context → make progress usable in dynamic area without friction
- Answer checking & hints → reduce or remove per-subject special cases
- Deep linking & section progress → derive from MDX + questions.json

### Phase 2: Promote the Dynamic UI
- Make generic components the default for new features
- Start routing main subject traffic through the new system (or dual-run with feature flags)
- Improve visual + functional parity so `/x/` is no longer "worse" than the old pages

### Phase 3: Retire Legacy
- One subject at a time: move old page + old content import to use new loader + generic components
- Delete old TS content files after verification
- Remove old per-subject practice implementations

### Phase 4: Cleanup
- Delete backup (after long stabilization period)
- Update all docs, tests, etc.

## Immediate Next Work (June 2026)

See active subagents and `src/lib/content/NOTES.md` for the current sprint focus.

## Key Risks & Mitigations
- Risk: Breaking the "real" app while migrating → Mitigation: Keep legacy files intact and working until each subject is fully ported. Work on feature branch first.
- Risk: Progress data incompatibility → Mitigation: Stable `id`s were preserved during porting. Progress layer must be adapted carefully.
- Risk: MathInput / rich practice features regress → Mitigation: Heavy focus on making the generic path at least as good as (preferably better than) the old one.

## Success Criteria
- Adding a new subject requires **only** adding files under `content/new-subject/`
- All practice, progress, and navigation works through generic components + the loader
- Old TS content files are in backup and no longer imported in the main app
- The experience at the dynamic routes is the best one in the app

---

This document will be updated as the migration progresses. The current branch is the main development line for this effort.