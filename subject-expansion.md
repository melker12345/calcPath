# Subject Expansion Plan

**Goal:** Expand the current three subjects (Calculus, Linear Algebra, Statistics) to cover more of the rich topic structure defined in the math-roadmap dataset, while maintaining high-quality explanations and practice questions.

## Current State

- **3 subjects** fully implemented with modular content:
  - Calculus (8 topics)
  - Linear Algebra (8 topics)
  - Statistics (10 topics)
- All module content lives in per-topic files under `src/lib/modules/`.
- Shared components exist for module viewing and practice.
- Strong regression test coverage for content quality (e.g. spacing validation).

## Reference Data

The authoritative source is located at:
`/home/melker/Desktop/code/websites/math-roadmap/data/subjects/`

- 46 subjects total across 5 groups:
  - Foundations (6 subjects)
  - Algebra & Logic (13)
  - Analysis (11)
  - Geometry (9)
  - Applied Mathematics (7)
- Each subject JSON defines chapters + individual lessons with titles.

## Recommended Phased Approach

### Phase 1: Strengthen Foundations (Highest Priority)
Add the missing foundational subjects before going deeper:

1. **Precalculus**
2. **Algebra** (or "College Algebra")
3. **Geometry**
4. **Discrete Mathematics**

**Rationale**: These directly feed into the existing subjects and close the gap between high-school and university math.

### Phase 2: Core Analysis Expansion
Add subjects that naturally extend current offerings:

- Real Analysis
- Differential Equations (deeper than current calculus level)
- Complex Analysis (introductory)

### Phase 3: Broader Expansion
- Probability (standalone, if not fully covered in Statistics)
- Topology (introductory)
- Abstract Algebra
- Number Theory

## Technical & Process Recommendations

1. **Content Authoring Improvements**
   - Continue using the per-topic file structure (`src/lib/modules/<subject>/<topic>.ts`).
   - Create a content template / scaffolding script for new topics.
   - Consider adding a simple content authoring format (e.g. Markdown + frontmatter) that compiles to the current TS structure.

2. **Shared Infrastructure**
   - Make subject creation more declarative (reduce boilerplate in routes, navigation, sitemap, etc.).
   - Build a generic subject configuration system so adding a new subject is mostly "add content + register in one place".

3. **Question Generation Strategy**
   - Define clear tiers (Easy / Medium / Hard) per topic.
   - Aim for ~30–50 practice questions per major topic initially.
   - Prioritize high-leverage sections that have weak coverage today.

4. **Quality Gates**
   - Keep and extend the `content-spacing.test.ts` style validation.
   - Add automated checks for:
     - Consistent section slugs
     - Presence of intro + common mistakes
     - Minimum number of practice questions per topic

5. **Prioritization Framework**
   When choosing the next subject, evaluate:
   - User demand / learning path coherence
   - Synergy with existing subjects
   - Size (number of chapters/topics)
   - Availability of high-quality reference material

## Success Metrics (Suggested)

- At least 2 new subjects fully implemented per major release cycle.
- Average of ≥ 25 practice questions per topic across the platform.
- All new content passes the automated quality tests on first merge.
- Clear learning paths visible in the UI (e.g. "Recommended next subject after Calculus").

## Open Questions

- Should we aim for breadth (many subjects) or depth (very rich content per subject)?
- Do we want to support "tracks" or "specializations" (e.g. Pure Math track vs Applied)?
- How will we source or generate the large volume of high-quality explanations and questions?

---

**Next Immediate Action Recommendation**

Perform a detailed gap analysis between the current implementation and the math-roadmap JSON for one candidate subject (e.g. Precalculus or Discrete Mathematics), then create a concrete implementation ticket for the first new subject.

---

*Document created during the content scalability refactoring effort on the `refactor/content-scalability` branch.*