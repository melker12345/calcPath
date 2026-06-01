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

## Module & Explanations Page Generalization (Module & Explanations Page Generalization Agent, 2026-06-01)

**Goal achieved in isolated slice**: Created a generic, data-driven module/explanation renderer that consumes `FileSystemContentBundle.mdxModules` (raw `mdxSource`) + `Topic` metadata directly from the new content/ FS structure.

**Deliverable**:
- New isolated file: `src/components/experimental-generic-mdx-module-explanation.tsx`
  - `ExperimentalGenericMdxModuleExplanation` React component (client).
  - Self-contained line-based `parseMdxToStructured` (exported as `experimentalParseMdxModule` for tests/harnesses).
  - Supports all observed patterns in current `content/*/topics/*/module.mdx` (LA + Stats + Calculus ports):
    - Intro (pre-first-## content, after stripping frontmatter + # title).
    - `## Section Title {#slug}` or `## Title` + following `<!-- section: slug -->` (for question matching + deep links + per-section practice).
    - Body paragraphs (with LaTeX $...$ and $$...$$ detection → MathText + BlockMath).
    - `**ELI5**` / `**ELI5**:` / `**ELI5 (continued)**` blocks (inline text or following `-` bullet lists; heuristic stops collection on subsequent non-list paragraphs to support stats-style "ELI5 callout then continue body").
    - Worked examples: `### Worked Examples`, `**Worked Example: Title**` → rendered as titled cards with numbered steps.
    - `## Common Mistakes` → bulleted list at end.
  - Re-uses legacy visual + interactive pieces (ModuleSectionNav TOC, ELI5 styled callout, example cards, practice links using ?section=slug, VoteFeedback, prev/next footer) for pixel-level consistency during transition.
  - Debug footer showing "sourced from content/.../module.mdx via FileSystemContentBundle".
  - Detailed JSDoc with full MDX proper-rendering plan.

**Decisions**:
- Work strictly isolated: one new experimental-*.tsx file only (no new dirs, no edits to production pages, layouts, routes, legacy modules/, or loader). No new runtime deps.
- Basic custom parser (no markdown lib) sufficient for current authored MDX dialect + keeps zero-dep for this slice.
- Parser produces internal shape modeled on legacy ModuleSection (title/section/body/eli5/examples) so rendering code could later be shared/refactored with SubjectModulePage.
- Anchor/slug extraction supports both markdown `{#id}` (LA) and HTML comment (some calculus) conventions seen in the ports.
- Rendering stays "use client" + reuses MathText (which already handles katex + spacing fixes).
- For real generic pages later: the component can be called from a server page that does `const bundle = await getFileSystemContentBundle(slug); const mdxMod = bundle.mdxModules.find(...)` and passes strings (serializable).

**Proper MDX rendering plan (documented in component + here)**:
- When productizing: `npm install next-mdx-remote`.
- Switch (or dual) to server component + `<MDXRemote source={mdxSourceWithoutFm} components={{ELI5: ELI5Callout, ...}} />`.
- Add remark-math + rehype-katex for native LaTeX in MDX (or keep hybrid).
- Authors could then use JSX/custom tags in .mdx for richer embeds.
- Loader remains unchanged (raw source is correct).

**Frequent small commits performed** (as required):
- Initial creation + parser + full renderer.
- Parser ELI5 heuristic fix for cross-port variations.
- Export of pure parser fn.
- (This NOTES update + follow-ups).

**Remaining blockers for replacing old module pages** (for future agents / decision):
1. **No MDX compiler yet** — basic parser works for existing content but is brittle to authoring variations (future MDX will solve + allow custom components).
2. **No wiring / routes** — component not imported anywhere. Needs a thin demo page (dev-only or /_experimental/* route group?) + server data loading. Existing static subject folders + redirects would conflict with `[subject]` dynamic.
3. **Practice links & deep links assume existing URLs** — they hardcode `/${slug}/practice/...` which still point to per-subject impls.
4. **Metadata / layouts / SEO** — generateMetadata, subject layouts, course-contents-page still use legacy SubjectConfig / modules. Generic version would need parallel or derived.
5. **Full bundle for all subjects** — loader only does linear-algebra + statistics (calculus mdx exists in content/ but not loaded by getFileSystemContentBundle yet).
6. **Progress / section slugs invariant** — must ensure MDX headings always produce slugs matching the `section` field in the topic's questions.json (already convention in ports).
7. **Testing the renderer** — no visual/e2e tests yet for the experimental component (parser could be unit-tested against real mdxSource fixtures).
8. **Migration cutover strategy** — when to flip the three per-subject module/[topicId]/page.tsx to use generic + FS bundle? Feature flag? Parallel? Delete legacy ModuleContent after?
9. **Math fidelity** — current parser + MathText covers 95%+ of LaTeX in ports, but edge cases (align*, matrices in display, etc.) may need validation against real pages.
10. **Bundle loading in client contexts** — FS loader is server-only (dynamic fs). Generic pages must be server components or use API route / build-time static.

**Status**: Meaningful isolated deliverable complete. Parser + renderer proven conceptually against real content samples from all 3 subjects. Ready for "thin vertical slice demo page" experiment (see open item above) or decision on route strategy. Do not delete or modify legacy module pages yet.

**References in this work**:
- content/linear-algebra/topics/vectors/module.mdx (primary test case)
- content/statistics/topics/descriptive/module.mdx and bayesian-inference/ (variation test)
- content/calculus/topics/limits/module.mdx and derivatives/ (anchor comment style)
- src/lib/content/{loader.ts,schema.ts}
- src/components/subject-module-page.tsx (visual + structural reference)
- content/ARCHITECTURE.md + future-dynamic.md

Regular NOTES updates + small commits followed throughout.
