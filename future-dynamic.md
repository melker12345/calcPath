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
- Move content out of `.ts` files into JSON, YAML, or MDX.
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

### Phase 1: Stabilize & Unify the Practice Layer (Current Focus)
- Finish migrating all subjects onto the shared `usePracticeSession` + components.
- Make the hook powerful enough that new subjects need almost no custom practice code.
- Clean up remaining duplication in the three practice pages.

**Status**: In progress. Linear Algebra is furthest along.

### Phase 2: Define a Content Schema + Loader
- Create formal TypeScript + Zod schemas for the entire content model.
- Decide on a content format (JSON + Markdown/MDX is a good starting point).
- Build a `loadContent()` system that can read from a `content/` directory.
- Validate all content at build time.

### Phase 3: Make Routes Generic
- Convert the current per-subject folder structure into dynamic routes (`[subject]`).
- Update navigation components to be driven by the content loader.
- Remove the need to manually create `app/[new-subject]/...` folders.

### Phase 4: Migrate Existing Content
- Gradually move explanations and questions from TypeScript into the new data format.
- Keep the old system working during the transition (or do it subject-by-subject).

### Phase 5: Advanced Features
- Support richer content (MDX components, images, custom exercises).
- Add tooling for content validation and preview.
- Explore admin interfaces or external CMS options.

## Risks & Trade-offs

- **Complexity**: A full content system adds abstraction. We must keep the authoring experience pleasant.
- **Type Safety**: Moving away from TypeScript for content means losing some compile-time safety (mitigated by Zod).
- **Performance**: Dynamic content loading must not regress build times or runtime performance.
- **Migration Cost**: We have existing content in three subjects. A full migration will take real effort.

## Immediate Next Steps (Recommended)

1. Finish cleaning up the current shared practice architecture (especially completing the Statistics migration and removing remaining duplication).
2. Define the initial content schema (start with `Subject > Chapter > Topic > Section + Questions`).
3. Create a small proof-of-concept loader for one subject (Linear Algebra is a good candidate because it is smaller).
4. Document the schema clearly so future content authors understand the format.

---

*Document created during the architecture evolution of the math learning platform (refactor/content-scalability branch).*