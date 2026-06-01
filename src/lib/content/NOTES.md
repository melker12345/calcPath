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

## Next Experiments (current focus)

- [ ] Prototype a generic (data-only) practice page / component that consumes Problem[] + Topic from a loaded bundle (avoiding large changes to the 3 existing subject practice pages)
- [ ] Introduce thin vertical slice demo (e.g. dev-only page or parallel structure) to prove end-to-end from `getSubjectBundle("linear-algebra")` → generic UI
- [ ] Design decision needed: how/when to introduce generic dynamic routes (`[subject]`) without conflicting with existing static subject folders or requiring big refactors
- [ ] Decide on stable ID policy + migration strategy for when we move content to JSON/MDX (progress compatibility critical)
- [ ] Expand loader adapters for Calculus + Statistics (after LA slice validated)

## Subject Layout & Navigation Generalization Agent (2026-06-01)

**Goal achieved in this slice**: Made high-level subject "chrome" (layouts, nav, subject/topic lists, breadcrumbs) more data-driven from new content, via reusable generic components/patterns. Focus strictly on chrome/navigation layer (not practice deep logic, not full module rendering, not route restructuring).

**Decisions**:
- Created `SubjectBreadcrumbs` as first reusable generic chrome component. API designed to be driven by:
  - `SubjectIndex` (lightweight, from `loadSubjectIndex(slug)` reading content/{slug}/index.json -- perfect for nav/topic lists/breadcrumbs)
  - `FileSystemContentBundle` (via .config + helpers)
  - Legacy `SubjectConfig` (compat)
- Helpers `getSubjectHomeBreadcrumbs`, `getBreadcrumbsFromBundle` establish patterns for consuming the new data shapes in generic nav.
- Kept changes *isolated*: only edited loader (for enabling), two existing chrome components (CourseContentsPage for topic lists, SubjectModulePage), added 1 new component file. No changes to subject app/ folders, no new public routes, no breakage to existing 3 subject experiences.
- Used private/experimental-friendly approach: the new component + `loadSubjectIndex` is the "experimental area" ready for future thin vertical slice demos or generic pages (e.g. in `_experimental/` private folders which Next ignores for routing).
- Did *not* yet generalize full subject lists (header/footer etc still use central `subjects.ts`/`subjectList` -- that's a solid abstraction; future can derive or merge from index data via manifest).
- Topic lists: CourseContentsPage already acts as generic renderer (accepts topics + slug); now its own breadcrumb layer is fully generic. The subject index's `topics` array is the canonical data source for such lists going forward.
- Breadcrumbs: unified the previously ad-hoc inline implementations. Supports simple "Contents / Subject" or "Contents / Subject / Topic".
- Small commits only. Type-safe via existing schemas. No new docs files created (edited NOTES only as required).
- Calculus support: `loadSubjectIndex("calculus")` works immediately (index.json present); full bundle load still needs adapter (future).

**Progress**:
- [x] Reviewed all 3 subjects' layouts (near-identical wrappers around CourseLayout), pages (dupe metadata/JSON-LD), chrome components, nav (header/footer use subjectList; ad-hoc crumbs in contents+module pages), hardcoded paths/links.
- [x] Reviewed new content: SubjectIndex (ideal for nav), FileSystemContentBundle, loader (now has loadSubjectIndex).
- [x] Added `loadSubjectIndex` + refactored existing loaders (DRY + nav enabler). Commit 1.
- [x] Implemented generic SubjectBreadcrumbs + helpers. Adopted in 2 chrome components for topic/module nav. Commit 2.
- [x] Updated this NOTES with decisions/progress.
- Total: 2 small commits, focused on nav layer only.
- Ready for: using `await loadSubjectIndex(slug)` in future server components for fully data-driven subject chrome; thin vertical demo page; eventual generic [subject] routes.

**Files touched (absolute paths)**:
- /home/melker/.grok/worktrees/work-saas/subagent-019e83b0-206f-7cb2-8395-f4a61529fdbb/src/lib/content/loader.ts
- /home/melker/.grok/worktrees/work-saas/subagent-019e83b0-206f-7cb2-8395-f4a61529fdbb/src/components/subject-breadcrumbs.tsx (new, required for reusable)
- /home/melker/.grok/worktrees/work-saas/subagent-019e83b0-206f-7cb2-8395-f4a61529fdbb/src/components/course-contents-page.tsx
- /home/melker/.grok/worktrees/work-saas/subagent-019e83b0-206f-7cb2-8395-f4a61529fdbb/src/components/subject-module-page.tsx
- This file (NOTES.md)

Next for nav generalization could include: generic SubjectTopicList (extract from CourseContentsPage), SubjectList component for header/footer (data-backed), experimental demo page in private folder using bundle/index for full subject preview.
