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

## Next Experiments (current focus)

- [ ] Prototype a generic (data-only) practice page / component that consumes Problem[] + Topic from a loaded bundle (avoiding large changes to the 3 existing subject practice pages)
- [ ] Introduce thin vertical slice demo (e.g. dev-only page or parallel structure) to prove end-to-end from `getSubjectBundle("linear-algebra")` → generic UI
- [ ] Design decision needed: how/when to introduce generic dynamic routes (`[subject]`) without conflicting with existing static subject folders or requiring big refactors
- [ ] Decide on stable ID policy + migration strategy for when we move content to JSON/MDX (progress compatibility critical)
- [ ] Expand loader adapters for Calculus + Statistics (after LA slice validated)
