/**
 * Content Schema for the Dynamic Architecture
 *
 * This is the source of truth for what "content" looks like in the new system.
 * All future loaders, editors, and generic pages will be built against these types.
 *
 * Design goals (per revised future-dynamic.md):
 * - Versioned (we will evolve this)
 * - Strongly validated (Zod) at load time with good errors
 * - Captures current real-world usage from the 3 existing subjects (inventory in NOTES.md + analysis)
 * - Explicit about stable identifiers (critical for user progress, streaks, completedProblemIds)
 * - Schema-first: loader + generic UI derive from this, not the other way around
 * - Thin vertical slice first (start with Linear Algebra)
 *
 * Key invariants from code analysis:
 * - Problem.section <-> ModuleSection.section exact match required for dashboard sections + deep links.
 * - Progress/attempts keyed ONLY by stable problem.id (topicId is auxiliary).
 * - Explanation strings are parseable for steps/hints (shared UI).
 * - Subject slugs are kebab-case (e.g. "linear-algebra").
 * - Answer checking logic lives outside content for now (global normalizer + math equiv).
 *
 * Future work (do not over-engineer in v1):
 * - Per-problem answer validation config (tolerance, equivalence mode, etc.)
 * - Structured explanations (vs rich string)
 * - Test questions as first-class (currently separate for calculus only)
 * - MDX / richer body content
 */

import { z } from "zod";

// ============================================
// Core Primitives
// ============================================

export const ProblemTypeSchema = z.enum(["numeric", "mcq"]);

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);

// Shared shape for practice problems and test questions (avoids Zod v4 restrictions on .extend/.omit for refined schemas)
const problemFields = {
  /**
   * Stable, unique identifier across all time.
   * NEVER change this after content is live for real users.
   * Used in completedProblemIds, streaks, attempts, etc.
   * Recommended format: kebab-case with topic prefix, e.g. "vectors-operations-1"
   */
  id: z.string().min(1),

  /**
   * Which topic this belongs to (e.g. "vectors", "limits", "multiple-regression")
   */
  topicId: z.string().min(1),

  /**
   * Stable section slug within the topic.
   * Must match `ModuleSection.section` (or be omitted only for unsectioned) for deep linking and per-section progress.
   */
  section: z.string().min(1),

  prompt: z.string().min(1),

  type: ProblemTypeSchema,

  /**
   * The canonical correct answer (string for flexibility).
   * For MCQ this should match one of the choices exactly (case sensitive match used in UI).
   */
  answer: z.string().min(1),

  choices: z.array(z.string().min(1)).optional(),

  /**
   * Full step-by-step explanation. This is what gets shown in feedback.
   * Current convention: "Step 1: ...\nStep 2: ... Final answer: ..."
   * Parsed by PracticeFeedback and per-page getHint logic.
   */
  explanation: z.string().min(1),

  difficulty: DifficultySchema,
};

const mcqRefine = {
  refine: (p: any) => {
    if (p.type === "mcq") {
      return Array.isArray(p.choices) && p.choices.length > 0 && p.choices.includes(p.answer);
    }
    return true;
  },
  message: "MCQ problems must have choices and answer must be one of them",
  path: ["answer"] as const,
};

/**
 * A single practice question.
 * This is the most critical type for progress tracking.
 *
 * Design notes from analysis:
 * - `id` must be globally stable forever (affects real user data in progress DB).
 * - `section` must exactly match a ModuleSection.section within the same topic for per-section progress and deep links.
 * - `explanation` currently uses a conventional string format for step parsing in UI ("Step N: ... Final answer: ...").
 * - Answer validation is currently global (see answer-check.ts); per-question rules are a future extension.
 */
export const ProblemSchema = z
  .object(problemFields)
  .refine(mcqRefine.refine, { message: mcqRefine.message, path: mcqRefine.path });

export type Problem = z.infer<typeof ProblemSchema>;

/**
 * Test questions (separate pool, only for "hasTests" subjects like Calculus).
 * Similar shape to Problem but never mixed into practice progress.
 * Ids conventionally prefixed "test-".
 */
export const TestQuestionSchema = z
  .object({
    ...problemFields,
    /** Tests do not use per-section filtering (optional in test pool). */
    section: z.string().min(1).optional(),
  })
  .refine(mcqRefine.refine, { message: mcqRefine.message, path: mcqRefine.path });
export type TestQuestion = z.infer<typeof TestQuestionSchema>;

// ============================================
// Topic
// ============================================

export const TopicSchema = z.object({
  /** Stable topic id, e.g. "vectors", "limits" — used in URLs and progress keys. */
  id: z.string().min(1),

  title: z.string().min(1),
  description: z.string().min(1),

  /** Sort order within the subject (1-based recommended). */
  order: z.number().int().positive(),

  /** Rough time estimate in minutes for the topic (used in UI). */
  estimatedMinutes: z.number().int().positive(),
});

export type Topic = z.infer<typeof TopicSchema>;

// ============================================
// Module Content (Explanations)
// ============================================

export const WorkedExampleSchema = z.object({
  title: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
});

export const ModuleSectionSchema = z.object({
  title: z.string().min(1),

  /**
   * Stable slug. Must exactly match the `section` on associated Problems.
   * This is critical for deep linking and per-section progress tracking.
   * (See getSectionPracticeProgress, dashboard, search-command, module nav.)
   */
  section: z.string().min(1).optional(),

  /** Main explanatory content (array of paragraphs / steps) */
  body: z.array(z.string().min(1)).min(1),

  /** Simpler, intuition-first explanations (ELI5) */
  eli5: z.array(z.string().min(1)).optional(),

  /** Inline worked examples for this specific section */
  examples: z.array(WorkedExampleSchema).optional(),
});

export const ModuleContentSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1),

  /** High-level introduction to the entire topic (shown at the top of the module page) */
  intro: z.array(z.string().min(1)).min(1),

  sections: z.array(ModuleSectionSchema).min(1),

  /** Top-level worked examples for the whole topic (less common than per-section examples) */
  examples: z.array(WorkedExampleSchema),

  /** Common mistakes / misconceptions for this topic */
  commonMistakes: z.array(z.string().min(1)),
});

export type ModuleContent = z.infer<typeof ModuleContentSchema>;

// ============================================
// Subject Level
// ============================================

export const SubjectSlugSchema = z.string().min(1);

export const SubjectConfigSchema = z.object({
  slug: SubjectSlugSchema,
  label: z.string().min(1),
  shortDescription: z.string().min(1),
  modulesDescription: z.string().min(1),
  icon: z.string().min(1), // emoji or short symbol
  order: z.number().int().positive(),
  hasTests: z.boolean().default(false),
});

export type SubjectConfig = z.infer<typeof SubjectConfigSchema>;

/**
 * Slim section summary used by legacy dashboard / search / subjects.ts for per-chapter sections.
 * Can be derived from full ModuleContent.sections at load time.
 * Kept here for adapter compatibility during migration.
 */
export const ModuleSectionSummarySchema = z.object({
  title: z.string().min(1),
  section: z.string().min(1).optional(),
});
export type ModuleSectionSummary = z.infer<typeof ModuleSectionSummarySchema>;

// ============================================
// Full Subject Bundle (what a content folder will eventually export)
// ============================================

/**
 * A complete, validated, self-contained bundle for one subject.
 * This is what the content loader will return for a given slug.
 *
 * In the thin vertical slice + future:
 * - One folder or file per subject produces one of these.
 * - Generic pages consume bundles without subject-specific imports.
 *
 * Note: The legacy SubjectConfig in subjects.ts also carries topics/problems/modules
 * for the transition period. New code should prefer SubjectBundle.
 */
export const SubjectBundleSchema = z.object({
  config: SubjectConfigSchema,
  topics: z.array(TopicSchema),
  problems: z.array(ProblemSchema),
  modules: z.array(ModuleContentSchema),
});

export type SubjectBundle = z.infer<typeof SubjectBundleSchema>;

// ============================================
// Schema Versioning
// ============================================

export const CONTENT_SCHEMA_VERSION = "1.0.0" as const;

export const ContentManifestSchema = z.object({
  version: z.literal(CONTENT_SCHEMA_VERSION),
  subjects: z.array(SubjectSlugSchema),
});

export type ContentManifest = z.infer<typeof ContentManifestSchema>;