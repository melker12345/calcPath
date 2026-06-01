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

## MDX Rendering Agent Work (2026-06-01)

**Investigation summary (before implementation):**
- No MDX rendering existed anywhere: `mdxSource` (raw string incl. frontmatter) was only loaded/validated/stored in `MdxModule` + `FileSystemContentBundle` (see schema.ts:331, loader.ts:163). `grep` for MDXRemote / serialize / compile returned only schema/loader comments.
- Existing explanation rendering lives only in legacy path:
  - `src/components/subject-module-page.tsx` (used by all 3 subject `/modules/[topicId]` pages): consumes structured `ModuleContent` (intro[], sections[].{body,eli5,examples}, commonMistakes). Renders with `<MathText>` (for mixed text+$math$) + manual `BlockMath` detection for standalone `$...$` paras + `.prose` wrappers. Duplicated `splitMath` logic also appears in `linear-algebra/practice/[topicId]/page.tsx` (RichMathText) and `math-text.tsx`.
  - No generic/experimental components consumed `FileSystemContentBundle` or `mdxSource` yet (only tests + loader + docs reference it; `course-contents-page.tsx` etc. are metadata-only).
- MDX content shape (samples from `content/*/topics/*/module.mdx`): frontmatter + markdown (#/##/###, paras, **bold**, -/1. lists, **ELI5**/**Worked Examples**/**Common Mistakes** as bold paras or subheads), inline `$...$` LaTeX (no `$$`/block in current ports), custom `{#slug}` in some LA headings or `<!-- section: slug -->` comments (for question.section matching + anchors). Inconsistent heading vs comment style across ports.
- Deps: only katex + react-katex + custom MathText (no remark/rehype/marked/next-mdx-remote/@mdx-js before this).

**Decisions made:**
- Added single small runtime dep `marked` (lightweight, no sub-deps, token-based) rather than full `next-mdx-remote` + remark-math + rehype-katex (would bypass MathText, add plugin complexity, larger bundle). This lets us:
  - Strip frontmatter + lex once.
  - Recursively map tokens → React elements (h*, p, ul/ol/li, strong/em, code, a).
  - Delegate *every* leaf text run (incl. inside strong/lists) to existing `<MathText text={...}>` → guarantees identical math rendering, spacing fixes, and future updates in one place.
- Created isolated `src/components/mdx-content.tsx` (no changes to legacy pages, no pollution of subject-module-page or loader). Exports:
  - `MdxContent({ mdxSource, className? })` — drop-in for any generic explanation view.
  - `extractMdxSections(mdxSource)` — pure util returning `{id, title, level}[]` (respects explicit `{#id}`, falls back to slugify; useful for nav/progress like legacy `toSlug` + sections).
- Frontmatter stripped inside renderer (dupe of loader's parser is tiny; keeps renderer self-contained).
- HTML comments (section markers) + space tokens skipped (visual only).
- Styling: minimal classes matching legacy prose + theme vars; no auto ELI5 boxes (see limitations).
- Future evolution path documented in component JSDoc: swap impl to full MDX compiler + provide `components` prop for `<ELI5>`, `<ExampleCard>`, custom math blocks etc. without API change.
- Kept all changes minimal + frequent small commits (dep; new renderer file; fixes; NOTES; no unrelated).

**Current status / working rendering:**
- `MdxContent` + extract successfully render and parse *all* current mdxSource (LA full, stats full).
- Verified via: node lexer inspection + real FS reads + vitest execution importing the component (extract path exercised against `load*FromContent()` bundles containing the mdxSource). Headings with `{#vectors}` etc. produce clean ids + titles; math $...$ flows to MathText; lists/emphasis preserved.
- Typecheck + lint clean. (Pre-existing test expectations in schema-validation.test.ts are stale but unrelated.)

**Limitations (documented for future work):**
- Only basic CommonMark subset (no tables, footnotes, task lists, raw JSX/MDX components yet — current MDX ports don't use any). Adding full MDX support later requires `next-mdx-remote` etc.
- No automatic special UI for `**ELI5**`, `### Worked Examples`, `## Common Mistakes` (rendered as normal bold/heading + content). Legacy had dedicated rounded boxes + "Example s" headers. Consumers of `MdxContent` can post-process tokens or wrap, or we can enhance renderer with heuristic detection in v2.
- Top-level `# Title` in MDX often duplicates the `<h1>` already rendered by page shell (from Topic.title). Generic pages should either hide first h1 (CSS or slice tokens) or omit from authored MDX.
- No block math support beyond what MathText does on single-$ (no `$$` or `\[ \]` detection/auto BlockMath yet; none authored today).
- Renderer is client-only ("use client") because MathText is; fine for now (bundles come from server loader anyway). If server-only RSC MDX wanted, would need different compile path.
- No error boundary / graceful bad MDX handling yet.
- Section extraction + renderer do not yet parse/emit the `<!-- section: xxx -->` into data structures (still rely on questions.json matching heading slugs manually).
- Performance: lex + recursive React on every render (for long modules ~few KB). Fine; can memoize later.
- No support for images, custom directives, or MDX imports (per future-dynamic.md vision).

**Next steps enabled by this:**
- Generic module explanation page can now do: `const bundle = await getFileSystemContentBundle(slug); const mdx = bundle.mdxModules.find(...)?.mdxSource; <MdxContent mdxSource={mdx} />` + `const nav = extractMdxSections(mdx).filter(s=>s.level===2)`
- Can replace/parallel subject-module-page for stats+LA without touching legacy content TS.
- Update NOTES + ARCHITECTURE when first consumer page lands.

All per task: investigated, set up generic reusable using existing MathText, works for mdxSource, isolated, small commits, NOTES updated.
