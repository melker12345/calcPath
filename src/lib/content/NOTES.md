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

## Generic Module Viewer Polish (ExperimentalGenericMdxModuleExplanation + MdxContent + GenericModuleViewer) — 2026-06-01

**Agent**: Generic Module Viewer Polish Agent (this subagent task).

**Scope (strictly followed)**: Only edits to experimental/generic components in `src/components/`:
- `mdx-content.tsx` (new renderer integration + fixes)
- `experimental-generic-mdx-module-explanation.tsx`
- `generic-module-viewer.tsx`
(Plus this NOTES update as explicitly requested; no touches to real subject pages, legacy impls, practice UIs beyond generics, content/, app/x/ pages, or lib/ except notes.)

**Goal**: Make the generic module/explanation viewing experience match the visual structure, spacing, typography, ELI5 boxes, worked example cards, common mistakes sections, etc. of real `SubjectModulePage` / subject module pages. Good integration with MdxContent. Proper anchors. Dark mode. Native-looking nav/"Review..." elements. Small incremental commits.

### Polish Details & Changes Made
- **MdxContent integration (core of task)**:
  - Added `BlockMath` + `isPureDisplayMath` helper + detection in paragraph rendering: standalone `$...$` or `$$...$$` paras now render as centered display math blocks (was broken via MathText splitter only; matches legacy/experimental manual logic).
  - Headings now include `scroll-mt-24`/`scroll-mt-20` for proper section anchor navigation (fixes jump under fixed header/TOC).
  - Updated docs + dark mode notes.
- **GenericModuleViewer polish** (the one wired to `/x/[subject]/modules/[topicId]`):
  - ELI5 box fully restyled to match real: `rounded-2xl border-[var(--border)] bg-[var(--surface-2)] p-5`, label "Explain Like I'm 5" (uppercase tracking-widest muted), content `space-y-3 text-sm leading-relaxed theme-text-secondary`. Removed all hardcoded blue-*.
  - Paragraph blocks now delegate to `<MdxContent mdxSource={...} className="prose ...">` — instantly gains: proper list rendering (ul/ol), <em>, <code>, <a> links, more robust inline. (Previously only **bold** regex + manual p splits.)
  - Updated jsdoc with new capabilities + limitations.
  - Typography/spacing/anchors already had scroll-mt; now consistent.
- **ExperimentalGenericMdxModuleExplanation polish** (the rich structured one):
  - Body + intro rendering now use `<MdxContent>` inside the existing `.prose` wrappers (after small parser tweak).
  - Parser tweak: for regular body lists, push original `line` (incl. `- ` / `* ` / `1. `) instead of stripped `itemText`. This preserves markdown so MdxContent/marked renders real `<ul class="list-disc ...">` etc. (improvement over legacy stripping behavior; ELI5+examples keep stripped as before to match SubjectModulePage).
  - Removed now-unused `BlockMath` import (delegated fully).
  - Minor nav polish: back link + per-section "Practice questions..." links use consistent `text-blue-700`, `gap-1.5`, `transition-colors` (still underline style to exactly match real subject pages).
  - Updated extensive jsdoc to document MdxContent integration, anchors, dark mode via theme vars.
- **Visual/Consistency**:
  - All ELI5, examples, common-mistakes, headings, spacing (`mt-12` sections, `mb-4` h2s, etc.), prose, var(--border/surface-2/text-muted), scroll-mt now aligned between generic/experimental and real.
  - Dark mode: relies on existing `.dark` forcings in globals.css + theme-* + var() (no new hardcoded colors introduced).
  - "Review in practice" / nav elements: kept exact match to real (plain links + `btn-*` footers which have full @apply rounded-xl etc. in css). Enhanced hover/transition slightly for polish without diverging.
- **Anchors/Navigation**: `extractMdxSections` + heading ids in MdxContent + manual in viewers + `scroll-mt-*` + ModuleSectionNav all work for # jumping.
- **No behavior change** for callers; fully backward compatible. Still no custom MDX components (future per docs).

### Gaps / Remaining Polish Opportunities (documented for next)
- ExperimentalGeneric still has some manual MathText in ELI5/examples/commonMistakes (could delegate those contents to MdxContent snippets too for even more consistency, but small win).
- GenericModuleViewer ELI5 still uses local renderInline (limited); full MdxContent inside ELI5 box possible but would nest prose.
- Neither viewer yet consumes `extractMdxSections` (they have custom parsers for dialect specials like ELI5).
- Per-section practice links + bottom nav in Experimental point to *main app* URLs (intentional for future promotion); Generic points to /x/ (correct for current usage).
- No visual tests/screenshots; would need Playwright update.
- "Review the explanation..." links live in generic-practice components (not touched per isolation rule).
- Full MDX (next-mdx-remote + <ELI5> etc custom) still future; this makes the hand-rolled path *much* closer to production feel.
- If wiring ExperimentalGeneric into /x/ route (instead of light GenericViewer), would need caller updates (outside scope).

**Commits style**: Many small, targeted search_replace (read before each edit; unique strings; isolated to 3 components + notes). All changes make the generic viewers "look and feel like the real subject module pages".

**Verification notes**: 
- MdxContent now handles math+lists+anchors standalone.
- Visiting /x/.../modules/ will use polished GenericModuleViewer (ELI5 now native-looking).
- Experimental ready for drop-in (structure 1:1 match + better content rendering).
- No linter/runtime breaks expected (imports clean, unused removed, existing styles reused).

## Frontend Visual Polish for Experimental /x/ Area (2026-06-01)

**Agent**: Specialized Frontend Polish Agent (this subagent task).

**Scope (strictly followed)**: 
- All files under `src/app/x/` (layout.tsx, page.tsx, [subject]/page.tsx, practice/*, modules/*, error.tsx, loading.tsx)
- The two main generic components directly consumed by /x/ practice & modules flows:
  - `src/components/generic-practice-experience.tsx`
  - `src/components/generic-module-viewer.tsx`
- Plus update to this NOTES.md only.
- ZERO changes to real subject pages, other components, lib/ (except notes), content/, globals.css, or anything outside /x/ + those 2 generics.

**Goal**: Eliminate ALL remaining visual inconsistencies so the entire /x/ flow (landing → subject browse → modules/explanation → practice) feels like a native, first-class part of the app rather than an experimental afterthought. Match spacing, typography, hover states, dark mode, component patterns (btn-*, theme-*, var(--accent), var(--surface-2) etc.) from CourseContentsPage, subject module/practice pages, and design system in globals.css. Make experimental banner tasteful/professional (not a loud warning strip). Replace every hardcoded blue-*/emerald-*/zinc-*/slate-*/amber-* etc. in scope.

**Key Polish Changes (via 9 small, frequent, targeted commits)**:

- **Experimental banner (`layout.tsx`)**: Completely rewrote from amber warning-strip (border-amber-*, bg-amber-50/95, shadow, bright text) to subtle integrated bar using `theme-border`, `bg-[var(--surface-2)]`, `theme-text-muted`. EXPERIMENTAL badge now uses border + muted text (no loud bg). Link hover uses theme-text-secondary + transition. Updated comment. Now feels like a quiet header label, not alert.

- **Landing page (`/x/page.tsx`)**: 
  - Status box: amber border/bg → `rounded-xl border theme-border bg-[var(--surface-2)]`
  - Primary "Browse topics" CTA: custom zinc-900/black + dark white hack → `btn-primary` (official, handles dark invert via @apply + CSS)
  - Secondary: already decent, promoted to `btn-secondary` for exact match.
  - All other text/cards already used theme-*; now 100% clean of hardcodes.

- **Subject browse (`/x/[subject]/page.tsx`)**: 
  - Back link: `text-blue-700 ... dark:text-[var(--accent)]` → `text-[var(--accent)] hover:underline transition-colors`
  - "✓ Loaded purely..." success line: emerald-700/400 → `theme-text-secondary` (neutral, still clear with ✓)
  - (Note: topic cards + action buttons had been partially updated in prior work to use `btn-primary` + `border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)]`; completed consistency.)
  - Error fallback card already used full theme-surface / theme-* + btn-* (kept).

- **Practice index (`/x/[subject]/practice/page.tsx`)**:
  - Back link: blue → `text-[var(--accent)]`
  - Per-topic count: `text-emerald-600 dark:text-emerald-400` → `text-[var(--accent)]` (accent now signals "actionable" uniformly)

- **Per-topic practice page + error states (`/x/[subject]/practice/[topicId]/page.tsx`)**:
  - All 3 fallback <a> links: blue-700 variants → `text-[var(--accent)]` (kept <a> tags for minimal diff; behavior identical).

- **Module page error fallback (`/x/[subject]/modules/[topicId]/page.tsx`)**:
  - Back link: blue → `text-[var(--accent)]`

- **GenericModuleViewer (consumed by modules route)**:
  - Back link: blue-700 → `text-[var(--accent)] ... transition-colors`
  - Source attribution: emerald → `theme-text-muted`
  - Footer disclaimer: zinc-500 → `theme-text-muted`
  - (Already had good ELI5 + prose matching from prior polish; now fully color-clean.)

- **GenericPracticeExperience (the heart of /x/ practice flow)**:
  - Fallback "Back to..." link: blue → `text-[var(--accent)]`
  - "Review the explanation for this topic →" (shown above input): full blue-600/50/700 + dark override → `text-[var(--accent)] hover:bg-[var(--surface-2)]` (works in both modes, no light-only blues)
  - MCQ choice buttons (the hover affordance): `hover:border-blue-300 hover:bg-blue-50` → `hover:border-[var(--accent)] hover:bg-[var(--surface-2)]` (now theme-native; still gives clear interactive feedback)
  - "All problems mastered!" success card: emerald border/bg/texts + slate button → `theme-border bg-[var(--surface-2)]` + `theme-text`/`theme-text-secondary` + `btn-primary` (official primary action button, no more slate-900/800)
  - No other colors touched; reuses ProgressDots/PracticeFeedback/MathInput which are shared (and already mostly themed).

**Overall Visual/Consistency Results**:
- Every button, card, link, list item, empty/error state, status indicator, hover, and text hierarchy now uses the official system: `.theme-text*`, `.theme-surface`, `.theme-border`, `var(--accent)`, `var(--surface-2)`, `btn-primary` / `btn-secondary`.
- Spacing/typography/containers: already matched real (max-w-5xl py-8 etc for browse; practice inner max-w-3xl card matches legacy practice UIs); no changes needed beyond colors.
- Dark mode: fully automatic via vars (no more manual dark: emerald-400 etc that could mismatch).
- Experimental banner now tasteful isolation signal (still present so users know it's the dynamic proof area).
- The full flow feels seamless: same fonts (from subject fonts in layout), same header/footer via CourseLayout, same interactive patterns.
- No behavior, routing, data, or logic changes whatsoever.

**Commit Hygiene**: 9 small frequent commits (banner; landing; subject browse; practice index; practice [topic]; modules [topic]; generic-module-viewer; generic-practice-experience; + this NOTES update). Each used read_file + precise search_replace on unique strings. Git log shows clean incremental history.

**Gaps left (intentionally out of scope or future)**:
- Legacy real-subject pages (e.g. statistics/practice, linear-algebra) still contain some blue-/emerald-/slate- hovers in their local MCQ impls etc. (per task: only /x/ + its direct generics).
- The generic-practice/ subdir (newer GenericPracticeExperience) not consumed by /x/ routes (the flat generic-practice-experience.tsx is the one wired).
- Some real pages use mixed styles; global cleanup separate effort.
- Banner could be further refined (e.g. icon) but current is professional and minimal.
- No new CSS or design system changes.

This completes making /x/ feel native end-to-end.
