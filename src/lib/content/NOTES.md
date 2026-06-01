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
- Do not touch any legacy .ts content files, practice routes, or pages.
- Frequent small commits + regular NOTES updates.
- Validation via schema + existing test harness.

## Next Experiments (current focus) — Practice Page Generalization Agent (2026-06-01)

### Progress (Practice Generalization)
- [x] Extended FS loader (`getFileSystemContentBundle` + `loadCalculusFromContent()`) to support **all three subjects** (la, stats, calculus) now that full content/ ports exist. Small isolated commit. (Previously only la+stats.)
- [x] Enhanced shared practice primitives: extracted `extractSteps` / `extractFinalAnswer` / `getDefaultHint` from PracticeFeedback into public exports. Used by generic; eliminates future duplication. Commit.
- [x] Created `src/components/generic-practice/GenericPracticeExperience.tsx` (production-quality, ~200 LOC focused impl) + index.
  - **Primary input**: `FileSystemContentBundle` (cleanly) + `topicId`.
  - Full support: numeric + mcq (all types), hints/solutions (via shared parsers), progress/resume/shuffle/dots/skip, topic switching (built-in selector + onTopicSwitch prop for adapters), module review links (default uses #section from MDX anchors), MathInput subject mapping.
  - Built 100% on `usePracticeSession` + `ProgressDots` + `PracticeFeedback` (no local duplication of overlays/steps).
  - Self-contained submit/useHint logic + error states.
  - Supports both controlled topicId (for page wrappers) and internal switching (for demos).
- [x] Clear documented migration/adapter path **inside the component JSDoc** + this NOTES: existing pages can adopt gradually via experimental flag / wrapper without any edits to the 3 main `app/*/practice/[topicId]/page.tsx`.
- Frequent small clean commits made throughout (loader, primitives, component, docs).
- Type-checked cleanly (`tsc --noEmit`); loader tests would pass (env constrained).
- Does not modify any of the three subject practice pages, legacy *-content.ts, or module pages.

### Blockers / Remaining for Full Generic Production + Switchover
- **No thin vertical slice demo page yet** (intentionally avoided creating new app/ routes or temp files per "never create unless absolutely necessary" + "do not modify main pages"). Can be added later behind /dev or feature flag in a follow-up.
- **Loader still has duplicated load*FromContent bodies** (la/stats/calc ~identical); a future small refactor to private `loadSubjectFromContent(slug)` would be ideal for maintainability (not blocking).
- **MathInput subject theming** still limited to 3 hardcoded keys (we provide best-effort map; future: make MathInput accept more generic config or slug).
- **Analytics / tracking**: Generic does not yet fire the subject-specific `trackEvent` calls present in some pages (calc especially). Can be added as optional `onEvent` callback prop.
- **Dynamic routes**: Still open design question (see below). Generic component is route-agnostic, ready for when `[subject]/practice/[topicId]` arrives.
- **Stable IDs**: Already compatible (JSON problems use same ids as legacy).
- **Per-section filter** (used by calc): Not yet exposed as prop on Generic (easy future addition via usePracticeSession sectionFilter).
- **Rich MDX in practice?** Currently questions still carry legacy "explanation" strings (even in new content/); module.mdx is separate (for reading view). Future could compile hints/solutions from MDX per-question, but convention works today.
- Adding a new subject: now only needs content/ folder + one-line in getFileSystem... (once we expose a single `loadFromContent(slug)`).

### Updated Open Items
- [x] Prototype generic data-only practice component consuming FileSystemContentBundle (done; higher quality than initial request).
- [ ] Thin vertical slice demo (postpone to avoid new files; use storybook/dev or import in existing test pages if needed).
- [ ] Design for generic dynamic routes (`[subject]`) — still needed; component is ready.
- [ ] Decide/automate stable ID + migration (progress OK for now).
- [ ] Expand/refactor loader for unified subject loading + full calculus legacy adapter removal (future).
