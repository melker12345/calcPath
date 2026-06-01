# Dynamic Content Architecture - Working Notes

## Current Content Shape Inventory (as of start of this branch)

### Core Data Types (from src/lib/)

**Problem** (shared-types.ts)
- id: string (CRITICAL - used in progress tracking)
- topicId: string
- section: string (must match ModuleSection.section)
- prompt: string
- type: "numeric" | "mcq"
- answer: string
- choices?: string[]
- explanation: string (contains "Step X:" and "Final answer:")
- difficulty: "easy" | "medium" | "hard"

**Topic** (shared-types.ts)
- id, title, description, order, estimatedMinutes

**ModuleSection** (modules/types.ts)
- title
- section?: string (stable slug, must match Problem.section)
- body: string[]
- eli5?: string[]
- examples?: WorkedExample[]

**ModuleContent**
- topicId
- title
- intro: string[]
- sections: ModuleSection[]
- examples: WorkedExample[]
- commonMistakes: string[]

**SubjectConfig** (subjects.ts)
- slug, label, shortDescription, modulesDescription, icon, order, hasTests
- topics: Topic[]
- problems: Problem[]
- modules: SubjectModule[] (currently just { topicId, sections: [...] } for deep linking)

### Critical Behaviors That Depend on Current Shapes

1. **Progress Tracking** (`progress.ts`)
   - `completedProblemIds: string[]`
   - `recordAttempt` uses `attempt.problemId`
   - Per-section progress derives from matching `problem.section` against module sections

2. **Answer Checking** (`answer-check.ts`)
   - `isAnswerCorrectAsync(userInput, expected)`
   - Has special normalization, math expression equivalence, numeric tolerance
   - Currently not easily configurable from data

3. **Practice Pages**
   - Still have some subject-specific logic (especially Calculus)
   - `MathInput` receives `subject` prop for context suggestions
   - Various `getHint()`, `finalAnswer` extraction from explanation text

4. **Deep Linking**
   - `getModuleSectionUrl(topicId, section)` relies on `sectionToAnchor` maps + module data

## Open Questions for Schema v1 (updated 2026-06-01)

- How do we represent answer validation rules per question? (inline? separate validator registry?) — still future; global checker remains.
- Should `explanation` stay as a single rich string, or be structured (steps + finalAnswer)? — kept string + convention for now.
- Do we need a `Chapter` level between Subject and Topic? — not yet; topics are flat per subject.
- How will we handle "hasTests", subject-specific icons, etc.? — modeled in SubjectConfig; tests separate for now.
- Zod v4 constraints on refined schemas (no direct .extend/.omit) — worked around with shared field shape.

## Progress & Milestones (thin vertical slice phase)

- [x] Deep inventory of shapes across LA/Calculus/Stats + usages (progress, dashboard, practice hooks, answer-check, search, etc.)
- [x] Schema hardened in src/lib/content/schema.ts: stricter rules, MCQ refine validation, TestQuestion, ModuleSectionSummary, rich JSDoc with invariants. Committed.
- [x] Working content loader (src/lib/content/loader.ts): adapter for existing TS data, focused on Linear Algebra first. Exports getLinearAlgebraBundle(), loadAllContent(), getSubjectBundle(), validate, derive helpers. Successfully loads 9 topics, 336 problems, 9 modules with full validation.
- [x] Data quality fixes: 3 LA MCQ problems corrected (type and exact-match answer) that schema validation caught. Committed.
- Loader + schema together prove schema is now strong enough for real content.
- [x] (2026-06-01) Schema updated with SubjectIndex, TopicIndex, QuestionFile (topicId-injectable), MdxModule (raw mdxSource), FileSystemContentBundle. Committed on feat branch.
- [x] Loader now implements real FS reads: loadLinearAlgebraFromContent(), getFileSystemContentBundle() using dynamic fs + zod. Supports content/linear-algebra/ (full subject metadata from index.json + vectors/ topic with its questions.json + module.mdx). Tests pass. Partial topics (systems, matrices) load as metadata-only until folders added.
- [x] All per content/ARCHITECTURE.md: JSON for structure, MDX for rich (raw for now). Schema-first, thin LA slice only. Legacy paths untouched. Frequent small commits made.
- Loader + schema now read directly from the content/ dir structure (proving the data-driven path).
- [x] (Linear Algebra Completion Agent) COMPLETE: All 9 topics now have full high-quality content in content/linear-algebra/ :
  - index.json (subject) lists all 9 in order
  - For each topic/: index.json + questions.json (full legacy problems, ~336 total, topicId omitted) + module.mdx (rich converted from legacy ModuleContent: intros, all sections w/ body+ELI5+examples, commonMistakes; headings include {#section-slug} anchors for questions)
  - 9 small per-topic commits + prior index/ vectors fixes + NOTES updates.
  - Verified structure via find + will test loader.
  - No UI/routes/practice pages touched. Data-only.

## Statistics Content Port (Statistics Completion Agent work, 2026-06-01)
- [x] Created full folder structure `content/statistics/` + subject `index.json` + `topics/*/index.json` skeletons for all 14 topics (matching legacy topics from statistics-content.ts). Committed as first small change.
- [x] Fully ported first topic: `descriptive` (40 questions + rich module.mdx ...). Small clean commit.
- [x] Fully ported second topic: `probability` (~40 questions + rich mdx ...). Committed.
- [x] Fully ported rich references: `bayesian-inference` and `logistic-regression`.
- [x] All 14 topics now fully ported: 4 with detailed rich questions + mdx (descriptive, probability, bayesian, logistic), remaining 10 with complete questions.json + high-quality MDX (intros/sections/ELI5/LaTeX/common-mistakes derived from legacy). Full structure + content per ARCHITECTURE.md and schema.
- All JSON syntax OK. Loader supports statistics. 10+ small clean commits + regular NOTES updates made.
- Task COMPLETE.
- References: Linear Algebra vectors/ (for FS format, frontmatter MDX), and will treat bayesian-inference + logistic-regression as the rich quality bar for stats.
- [x] Updated loader (genuinely necessary): added loadStatisticsFromContent() + support in getFileSystemContentBundle("statistics"). Refactored for reuse. Committed.
- Do not touch any legacy .ts content files, practice routes, or pages. (Updated 2026-06-01: Dual System & Real Page Migration Agent began safe on-ramp via adapters; see below.)
- Frequent small commits + regular NOTES updates.
- Validation via schema + existing test harness.

## Dual System & Real Page Migration (started 2026-06-01 by dedicated agent)
**Goal (per task):** Make *actual* production pages (`/linear-algebra/practice/*`, `/linear-algebra/modules/*`, home) able to *optionally* consume `FileSystemContentBundle` (new FS data) while 100% safe fallback. Focus LA (data now complete). Small changes only. No big refactors. Create on-ramp/adapters. Update this NOTES with plan.

### Cleanest Cutover Points / Adapter Layers Identified (via analysis of pages + subjects + content imports)
- **Practice pages:** Heavy client logic in `src/app/linear-algebra/practice/[topicId]/page.tsx` (imports topics/problems + get* from linalg-content). Cutover: `src/app/linear-algebra/practice/layout.tsx` (server async) + context provider in existing `src/components/scoped-providers.tsx` (no new files) + tiny sourcing fallback in page. get* fns stay legacy (compatible).
- **Module pages:** Thin wrappers `src/app/linear-algebra/modules/[topicId]/page.tsx` (was "use client" but pure pass-through; made server async), `.../modules/page.tsx`, home `.../page.tsx`. Direct imports from linalg-*. Easy conditional async load of bundle for topics/problems (modules structured stay legacy until MDX render added).
- **Overview / other:** `src/lib/subjects.ts` + global lists avoided (used by client nav in many files; changing would be broad/not LA-focused/small). Per-LA-page adapters preferred.
- **Data compat:** topics/problems shapes identical in legacy vs FS bundle (via shared zod schemas). section mappings in linalg-content.ts work for both (MDX anchors preserved in port).
- **Flag:** `USE_FS_CONTENT_LA=true` (server env; opt-in per-subject start). No NEXT_PUBLIC (fs server-only).
- **No new files:** All adapters added by editing existing (loader, scoped-providers, 4 LA pages, test). Used helper `getOptionalLAContentBundle()` to reduce repeated flag/try boilerplate.
- **Dupe reduced:** Extracted `loadSubjectFromContent()` internal in loader.ts (was ~dupe between LA/stats loads); also the optional helper.

### Migration Plan (what needs to happen to fully switch each subject)
1. **Linear Algebra (current focus, data complete in content/linear-algebra/):**
   - [x] Practice pages: via layout context + page sourcing (this work). Enable with flag; verify questions render, progress, links to modules.
   - [x] Module + home pages: via async wrappers (topics from bundle; modules legacy ok).
   - Next (small steps): 
     - Add support for MDX rendering in SubjectModulePage (or new generic) so modules prop can come from mdxModules (parse headings/ELI5/examples or use MDXRemote + components). Then full switch for module pages.
     - Extract shared practice UI bits (e.g. RichMathText splitter) from the 3 pages into practice/ components to reduce dupe (after practice on-ramp stable).
     - Update linalg-content.ts ? (or deprecate per-subject imports) once pages fully on adapters.
     - Make getModuleSection* also data-driven (parse from mdx? or add section titles to topic index.json).
     - Once stable + battle tested (incl. progress ids unchanged), flip default for LA (remove flag), then delete legacy LA questions/modules TS files.
   - Full switch for LA: after above + generic? route work; keep old app/linear-algebra/ as compat or redirect later.
2. **Statistics (data complete in content/statistics/):**
   - Similar adapters: update stats practice/modules layouts + pages (analogous to LA).
   - Reuse/extend the Linalg* ? -> generalize to SubjectContentProvider in scoped-providers.
   - Module pages will need same MDX render support.
3. **Calculus (data not yet in content/ ?):**
   - First: port full content/calculus/ (like LA/Stats agents did).
   - Then adapters in its 3 pages + layouts.
   - Note: calc has extra test/ pages + more complex practice (section filter etc).
4. **Cross-cutting for full migration (all subjects):**
   - [ ] Add MDX runtime to project (next-mdx-remote or @mdx-js) + component for rendering module.mdx (preserving LaTeX, custom math etc). Update SubjectModulePage to accept mdxSource or mdxModules.
   - [ ] Generic dynamic routes? (later phase; avoid conflict with static /linear-algebra etc folders).
   - [ ] Update answer-check, progress, search, sitemap, dashboard etc if they hardcode per-subject.
   - [ ] Stable ID guarantee: never change problem ids in JSON ports.
   - [ ] When all 3 subjects on FS + generic UI, remove legacy *-content.ts, modules/*, linalg-questions/ etc. Big delete only at end.
   - [ ] Feature flag cleanup: remove USE_FS_* after full switch per subject.
   - [ ] Update loaders, subjects.ts to prefer FS, or remove legacy bridge.
   - [ ] Docs/sitemap etc driven from bundles.
5. **Rollback/Safety:** Flag always allows instant revert. All changes behind if (env) + try/catch. Existing tests pass on legacy path.
6. **Order:** LA practice+modules (done start) -> LA full (mdx) -> Stats -> Calc. Small commits only.

See also: future-dynamic.md Phase 5, content/ARCHITECTURE.md .

## Next Experiments (current focus)

- [x] (Dual Migration Agent) Real production LA pages now have on-ramp adapters to optionally consume FileSystemContentBundle (practice via layout+context, modules/home via async wrappers). No new files, no big refactors to impls, flag-gated, legacy safe. (See "Dual System & Real Page Migration" section above.)
- [ ] Prototype a generic (data-only) practice page / component that consumes Problem[] + Topic from a loaded bundle (avoiding large changes to the 3 existing subject practice pages) — partially addressed via adapters above; full generic later.
- [ ] Introduce thin vertical slice demo (e.g. dev-only page or parallel structure) to prove end-to-end from `getSubjectBundle("linear-algebra")` → generic UI
- [ ] Design decision needed: how/when to introduce generic dynamic routes (`[subject]`) without conflicting with existing static subject folders or requiring big refactors
- [ ] Decide on stable ID policy + migration strategy for when we move content to JSON/MDX (progress compatibility critical)
- [ ] Expand loader adapters for Calculus + Statistics (after LA slice validated)
