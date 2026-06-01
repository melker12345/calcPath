# Future: Fully Dynamic Content Architecture

## Vision

The long-term goal is to reach a state where **adding or expanding educational content requires almost no code changes**.

Ideally, the process for adding new material should look like this:

1. Write explanations (text + math).
2. Write practice questions.
3. (Optional) Write module sections.
4. The site automatically handles:
   - Routing
   - Navigation
   - Practice UI
   - Progress tracking
   - Sitemaps, SEO, etc.

At the extreme end-state, adding an entire new subject should be as simple as dropping a well-structured folder of content (JSON + MDX/Markdown) into the project.

## Current State (as of this document)

We have made good progress on the **UI layer** of the practice experience:

- Extracted a shared `usePracticeSession` hook
- Created reusable `ProgressDots` and `PracticeFeedback` components
- Centralized navigation, question status, and manual navigation tracking
- Migrated Linear Algebra quite far onto the shared system
- Partially migrated Calculus and Statistics

However, the overall system is still far from truly dynamic:

- Content is still written as TypeScript code (`*-content.ts`, arrays of question objects, module files in `src/lib/modules/`).
- Each subject still requires its own folder structure under `app/`.
- Adding a new subject still involves creating multiple files and some manual wiring.
- Routes are file-system based (Next.js app router).
- There is no central content schema or loader yet.

We are roughly at the "better shared components" stage, not yet at the "content as data" stage.

## Key Architectural Shifts Required

To move toward the vision, we need several coordinated changes:

### 1. Content as Data (Not Code)
- Define a clear, versioned schema for subjects, chapters, topics, sections, explanations, and questions.
- Move content out of `.ts` files into **JSON** (for structured data) + **MDX** (for rich explanations). YAML was rejected in favor of JSON.
- Use a content loader (at build time or runtime) that validates and serves this data.

### 2. Generic, Data-Driven Pages
- Replace per-subject routes with generic routes:
  - `/[subject]`
  - `/[subject]/modules/[topicId]`
  - `/[subject]/practice/[topicId]`
  - `/[subject]/test/[topicId]`
- These pages should read from the content loader and render generically.

### 3. Strong Separation of Concerns
- UI components should only know about abstract shapes (`Topic`, `Question`, `ModuleSection`, etc.).
- All subject-specific behavior and data should come from the content layer.

### 4. Navigation & Metadata as Derived Data
- Breadcrumbs, subject lists, topic navigation, and sitemaps should be generated from the content structure.

### 5. (Future) Authoring Experience
- Eventually, this could support a simple admin UI or even external CMS integration for non-developers to add content.

## Recommended Phased Roadmap

### Phase 1: Stabilize the Practice Layer (Minimal)
- Ensure the shared `usePracticeSession` hook + components are stable and powerful enough that **new subjects require almost zero custom practice page code**.
- Do **not** do large-scale migration of the remaining duplication in the three existing practice pages yet.
- Goal: Unblock future generic pages without sinking more time into the old per-subject implementations.

**Rationale**: Further polishing the current pages increases the amount of code we will later need to make generic or delete.

### Phase 2: Define a Content Schema + Loader (Primary Focus)
- Create formal TypeScript + Zod schemas for the entire content model (`Subject`, `Topic`, `Problem`, `ModuleContent`, `ModuleSection`, etc.).
- Explicitly model question types, answer validation rules, rich explanation formats, and stable identifiers.
- Content format decision: **JSON for structured data + MDX for rich explanations** (see `content/ARCHITECTURE.md` for the full decision and folder structure).
- Build a `loadContent()` system (build-time preferred) that reads from a `content/` directory following the decided structure.
- Strong validation at build time + good error messages.

**Critical**: This phase must include a serious design effort around **stable IDs for progress tracking** and **how answer checking will be configured**.

### Phase 3: Thin Vertical Slice on One Subject
- Pick one subject (Linear Algebra is the best candidate — smallest and cleanest).
- Get it **fully working** end-to-end using the new schema + generic routes + generic practice page.
- This includes progress tracking, sitemaps, navigation, and deep linking.
- Treat this as a proof-of-concept that validates the entire stack before touching the other two subjects.

### Phase 4: Make Routes & Navigation Generic
- Convert per-subject folders into dynamic routes (`[subject]`, `[subject]/modules/[topicId]`, etc.).
- Drive navigation, breadcrumbs, and subject lists from the content loader.
- Remove the need to manually create `app/[new-subject]/` folders.

### Phase 5: Migrate Existing Content
- Gradually move explanations and questions from TypeScript into the new data format (subject by subject).
- Keep the old system working during the transition using feature flags or parallel code paths.
- Delete old per-subject code only after a subject has been successfully migrated and battle-tested.

### Phase 6: Advanced Features
- Richer content (MDX components, images, diagrams).
- Tooling for content validation, preview, and diffing.
- Authoring experience improvements (admin UI, external CMS, etc.).

## Risks & Trade-offs

- **Complexity**: A full content system adds abstraction. We must keep the authoring experience pleasant.
- **Type Safety**: Moving away from TypeScript for content means losing some compile-time safety (mitigated by Zod).
- **Performance**: Dynamic content loading must not regress build times or runtime performance.
- **Migration Cost**: We have existing content in three subjects. A full migration will take real effort. **This is higher than it first appears** because progress tracking, answer checking, and some UI behaviors are tightly coupled to the current TypeScript shapes.
- **Authoring Experience Regression**: The current TypeScript-based content gives excellent IDE support, refactoring, and type safety. JSON/MDX will feel like a significant downgrade unless we invest in good tooling early.
- **Progress Tracking Compatibility**: `completedProblemIds` and user progress are stored using the current `Problem.id` values. Changing identifiers during migration can silently break streaks and mastery data for real users.
- **Hidden Domain Logic**: Answer validation (`isAnswerCorrectAsync`), MathInput context detection, and some per-subject page logic are more coupled than they appear. These will need to be made configurable from data.

## Immediate Next Steps (Recommended)

1. **Update this plan** based on architectural review (done in this commit).
2. **Deeply analyze current data shapes** — inventory every field and behavior in `Problem`, `Topic`, `ModuleContent`, `ModuleSection`, `SubjectConfig`, progress tracking, and answer checking.
3. **Design the initial content schema** in `src/lib/content/schema.ts` (using Zod). Start with a versioned schema and pay special attention to:
   - Stable identifiers for progress tracking
   - How different question types and their validation rules are expressed
   - Rich explanation formats (body, eli5, examples, commonMistakes)
4. Create a **thin proof-of-concept loader** + generic page for **one subject only** (recommend Linear Algebra first).
5. Document the schema decisions and trade-offs clearly.

Do **not** do large-scale cleanup of the existing three practice pages until after the schema + thin slice is validated.

---

*Document created and revised during the shift to a fully dynamic, data-driven content architecture (feat/fully-dynamic-data-driven-architecture branch). Revised after initial architectural review.*