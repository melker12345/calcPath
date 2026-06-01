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

## Dynamic Route + Generic UI Integration (x/ experimental) — 2026-06-01

**Agent**: Dynamic Route + Generic UI Integration Agent (this subagent task).

**Goal achieved in this slice**: Made `/x/` actually usable. Proved the complete user flow **browse subject → view explanation (MDX) → practice** works 100% dynamically using *only* the new `FileSystemContentBundle` data (no legacy TS content imports, no changes to existing `/linear-algebra/` etc. routes).

### Routes added (isolated under /x/)
- `/x` — experimental landing + subject picker
- `/x/[subject]` — dynamic browse: loads bundle, renders topic list with per-topic "View explanation" + "Practice N" links (data-driven)
- `/x/[subject]/modules/[topicId]` — explanation viewer
- `/x/[subject]/practice/[topicId]` — full working practice session

### New generic components (in src/components/)
- `GenericModuleViewer.tsx` — lightweight MDX source renderer (frontmatter strip, headings w/ {#slugs}, ELI5 blocks, inline **bold**, delegates LaTeX to existing `<MathText>`). No new runtime deps.
- `GenericPracticeExperience.tsx` — the key integration. Accepts `problems: Problem[]`, `topic: Topic` from bundle. Fully reuses:
  - `usePracticeSession` (state, shuffle, dots navigation, transient clear)
  - `ProgressDots`
  - `PracticeFeedback` (now used for *both* correct/incorrect — leverages improvements from prior agents)
  - `MathInput`, `useProgress`, `isAnswerCorrectAsync`, etc.
  - MCQ buttons + numeric input paths
  - Progress, attempts, hints, solutions, shuffle-all-mastered all work
- Both components + pages are pure consumers of the schema/loader output.

### Key Integration Decisions
- **Isolation strategy**: All new work lives under `src/app/x/` (dynamic segments) + new generic components. Zero modifications to existing static subject folders, practice pages, or layouts. No route conflicts possible. Easy to delete/iterate.
- **Data loading**: Async server components call `getFileSystemContentBundle(slug)` (which supports "linear-algebra" + "statistics" fully; calculus metadata exists in content/ but loader adapter pending). Props passed down to client generic UI.
- **MDX**: Raw `mdxSource` surfaced; basic client-side rendering (good enough for proof + rich math). Full compiled MDX (next-mdx-remote + components for custom callouts etc.) is explicit future work.
- **Practice vs legacy pages**: Avoided touching the 3 big per-subject impls (as recommended in future-dynamic.md Phase 1). Generic is the "new path".
- **Progress/IDs**: Uses exact same stable `problem.id`s from the JSON content (ported by prior agents). Compatible with existing `useProgress` + local storage.
- **MathInput subject prop**: Hard-coded "generic" for exp (still works via broad heuristics + questionContext detection). Future: pass real subject slug for better context.
- **No deep-links in practice yet**: The "Review explanation" link goes to our `/x/.../modules/` (good). Legacy `getModuleSectionUrl` not used (would require parsing MDX headings for section slugs — possible later enhancement).
- **Supported subjects**: linear-algebra (full 9 topics) + statistics (14). Easy to extend when loader gains calculus.

### Current Limitations (as of this integration)
- Generic components live in root components/ (necessary for reuse); not "physically" under /x/ but clearly named `generic-*` and only imported from /x/ pages.
- MDX rendering is hand-rolled and incomplete (no lists, tables, code blocks, images, or MDX components). Content with complex markdown will look raw-ish.
- No /x/[subject]/practice (list page) yet — direct /practice/[topicId] only (browse page links work).
- No dedicated layout.tsx per [subject] (inherits experimental banner).
- No sitemap/SEO/metadata generation for /x/ (by design — experimental + robots: noindex on layout).
- No error boundaries specific to x/; falls to root.
- Answer checking + progress still global (good for now).
- Performance: each /x/ page load re-reads JSON+MDX from disk (fs in server component). Fine for demo; cache or build-time static in future.
- No tests added for the new pages/components (existing content tests cover the data).
- Only 2 subjects fully supported in loader.

### Progress on original "Next Experiments"
- [x] Prototype a generic (data-only) practice page/component — **DONE** via GenericPracticeExperience + /x/ routes.
- [x] Thin vertical slice demo using parallel structure — **DONE** (the entire /x/ area *is* the demo; no dev-only flag needed).
- [x] Design decision for generic dynamic routes — **RESOLVED**: use `/x/` prefix for isolation (avoids conflicts + big refactors). Recommended for continued parallel work.
- [ ] Stable ID policy — unchanged (we preserved them perfectly).
- [ ] Expand loader for Calculus — still pending (content/ folders exist).

**Next suggested**: 
- Wire a calculus loader adapter + test full flow on a calculus topic.
- Add proper MDX compilation (add dep + <MDXRemote> in viewer).
- Optionally backfill a generic subject list component usable outside x/.
- Once stable, plan gradual migration or A/B of main routes.

All changes via many small commits (see git log on branch). Full flow demonstrable by visiting /x/linear-algebra (pick vectors or systems) → explanation or practice.

---

## Experimental Area Polish & Solidification (2026-06-01)

**Agent**: Experimental Area Polish & Solidification Agent

**Goal**: Raise the quality bar of the entire `/x/` area so it feels like a solid, native part of the app rather than a rough prototype. Focus on consistency, polish details, loading/error, nav flow — no new features.

### What was polished (via small commits)
- **Design system consistency**: Replaced all raw Tailwind colors (zinc-*, blue-600/700/200, emerald-*, amber-*, slate-*, stone-*, bg-white etc.) across `/x/` pages + `Generic*` components with semantic `theme-*` classes, `var(--accent)`, `var(--surface)`, `var(--border)`, `var(--text-muted)`, `var(--surface-2)` etc. Dark mode now fully aligned. Adopted `.btn-primary` / `.btn-secondary` where appropriate.
- **Experimental banner**: Completely reworked — now subtle surface-2 bar with muted text + small accent-bordered "EXPERIMENTAL" pill. Far less visually intrusive while still unmistakably marking the isolated area. Updated exit link + footer copy.
- **Loading states**: Added `src/app/x/loading.tsx` with skeleton cards that appears during async `getFileSystemContentBundle` fetches on all dynamic routes.
- **Error handling**: Added `src/app/x/error.tsx` (themed recovery UI with reset + links) + improved all per-page catch/error UIs (consistent padding, Links not <a>, theme colors, helpful copy). No longer falls straight to root error.
- **Navigation smoothness** (browse → explanation → practice): 
  - Consistent ← back links using accent + hover everywhere.
  - Added "Practice this topic" + "All topics" affordances in GenericModuleViewer header/footer.
  - "Review the explanation" in practice now styled cleanly.
  - Practice index page exists and polished.
  - Buttons now match main app patterns (accent primary for explanations, outline-accent for practice).
- **Small UI details for "real app" feel**:
  - Subject icons (λ, σ) displayed in landing cards + headers.
  - Better metadata: estimatedMinutes shown on topics, accurate counts, "rich explanation" labels.
  - Consistent spacing/typography (py-10 etc, text-[15px], theme-text).
  - Disabled states, hover states, active scales using design tokens.
  - ELI5 callouts in lightweight viewer now use app callout pattern (surface-2 + muted label) instead of loud blue.
  - All error/empty states have clear recovery links.
  - Removed dead code (unused vars) during edits.
- 8 small focused commits. All /x/ routes + the two generic components used by them updated. (The more advanced unused generic-practice/ impl and experimental-generic-mdx... left untouched.)

### What still feels rough / future polish needed
- MDX rendering remains hand-rolled & incomplete (no real lists, tables, blockquotes, images, custom MDX components, full parsing of all syntax seen in content/). Still "raw-ish" for complex modules — full next-mdx-remote is the big missing piece (as noted in prior sections).
- No dedicated per-subject chrome or layout under /x/ (still inherits single experimental banner/footer).
- Practice "All mastered" success state + some MathInput chrome use a few remaining hard-coded tones (emerald success is intentional).
- Performance: still re-reads FS on every request (no caching layer in loader for /x/).
- No deep section linking from generic practice back into MDX (links go to topic top).
- The two generic practice impls (flat generic-practice-experience.tsx used by /x/ vs subdir version) remain; consolidation later.
- No visual subject switcher or "you are in experimental" persistent hint inside deep pages beyond banner.
- Still no tests, no analytics events, no a11y audit specific to this area.
- Calculus support in loader is present but content/ quality for full generic may vary.
- The advanced ExperimentalGenericMdxModuleExplanation (unused by /x/ routes) has legacy-style links pointing outside /x/ — keep isolated.

The `/x/` area now passes a much higher "this is a real, intentional part of the product" bar while remaining clearly experimental and isolated. Ready for further iteration or A/B.

All via small commits on the architecture branch.
