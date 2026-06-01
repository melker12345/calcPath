/**
 * Content Schema for the Dynamic Architecture
 *
 * This is the source of truth for what "content" looks like in the new system.
 * All future loaders, editors, and generic pages will be built against these types.
 *
 * Design goals:
 * - Versioned (we will evolve this)
 * - Strongly validated (Zod)
 * - Captures current real-world usage (not just an ideal)
 * - Explicit about stable identifiers (critical for user progress)
 */

import { z } from "zod";

// ============================================
// Core Primitives
// ============================================

export const ProblemTypeSchema = z.enum(["numeric", "mcq"]);

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);

/**
 * A single practice question.
 * This is the most critical type for progress tracking.
 */
export const ProblemSchema = z.object({
  /**
   * Stable, unique identifier across all time.
   * NEVER change this after content is live for real users.
   * Used in completedProblemIds, streaks, etc.
   */
  id: z.string(),

  /**
   * Which topic this belongs to (e.g. "multiple-regression", "limits")
   */
  topicId: z.string(),

  /**
   * Stable section slug within the topic.
   * Must match `ModuleSection.section` for deep linking and per-section progress.
   */
  section: z.string(),

  prompt: z.string(),

  type: ProblemTypeSchema,

  /**
   * The canonical correct answer (string for flexibility).
   * For MCQ this should match one of the choices exactly.
   */
  answer: z.string(),

  choices: z.array(z.string()).optional(),

  /**
   * Full step-by-step explanation. This is what gets shown in feedback.
   * Format: "Step 1: ...\nStep 2: ... Final answer: ..."
   */
  explanation: z.string(),

  difficulty: DifficultySchema,
});

export type Problem = z.infer<typeof ProblemSchema>;

// ============================================
// Topic
// ============================================

export const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  estimatedMinutes: z.number(),
});

export type Topic = z.infer<typeof TopicSchema>;

// ============================================
// Module Content (Explanations)
// ============================================

export const WorkedExampleSchema = z.object({
  title: z.string(),
  steps: z.array(z.string()),
});

export const ModuleSectionSchema = z.object({
  title: z.string(),

  /**
   * Stable slug. Must exactly match the `section` on associated Problems.
   */
  section: z.string().optional(),

  body: z.array(z.string()),
  eli5: z.array(z.string()).optional(),
  examples: z.array(WorkedExampleSchema).optional(),
});

export const ModuleContentSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  intro: z.array(z.string()),
  sections: z.array(ModuleSectionSchema),
  examples: z.array(WorkedExampleSchema),
  commonMistakes: z.array(z.string()),
});

export type ModuleContent = z.infer<typeof ModuleContentSchema>;

// ============================================
// Subject Level
// ============================================

export const SubjectSlugSchema = z.string().min(1);

export const SubjectConfigSchema = z.object({
  slug: SubjectSlugSchema,
  label: z.string(),
  shortDescription: z.string(),
  modulesDescription: z.string(),
  icon: z.string(),
  order: z.number(),
  hasTests: z.boolean().default(false),
});

export type SubjectConfig = z.infer<typeof SubjectConfigSchema>;

// ============================================
// Full Subject Bundle (what a content folder will eventually export)
// ============================================

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