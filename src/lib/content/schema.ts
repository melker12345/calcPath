/**
 * Zod schemas for every file under content/ (see content/ARCHITECTURE.md):
 * the subject and chapter index.json files, questions.json, module.mdx as a
 * raw source, and problemset.json. The loader validates with these at build
 * time; the scripts in scripts/ validate with them as gates.
 *
 * Invariants the schemas cannot express on their own, checked by the gates:
 *   - a question's `section` equals a `##` section slug of its module.mdx;
 *   - question and problem-set ids are unique across the whole corpus and
 *     never change once live (progress and reports are keyed by them).
 */

import type { Problem, Topic } from "@/lib/shared-types";

import { z } from "zod";

// ============================================
// Core Primitives
// ============================================

const ProblemTypeSchema = z.enum(["numeric", "mcq"]);

const DifficultySchema = z.enum(["easy", "medium", "hard"]);

// Shared shape for practice problems and test questions (avoids Zod v4 restrictions on .extend/.omit for refined schemas)
const problemFields = {
  /**
   * Stable, unique identifier across all time.
   * NEVER change this after content is live for real users.
   * Used in completedProblemIds, attempts, and reports.
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

type McqRefineInput = {
  type: string;
  choices?: string[];
  answer: string;
};

const mcqRefine = {
  refine: (p: McqRefineInput) => {
    if (p.type === "mcq") {
      return Array.isArray(p.choices) && p.choices.length > 0 && p.choices.includes(p.answer);
    }
    return true;
  },
  message: "MCQ problems must have choices and answer must be one of them",
  path: ["answer"],
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
const ProblemSchema = z
  .object(problemFields)
  .refine(mcqRefine.refine, { message: mcqRefine.message, path: mcqRefine.path });

export type { Problem, Topic };

// ============================================
// Topic
// ============================================

const TopicSchema = z.object({
  /** Stable topic id, e.g. "vectors", "limits" — used in URLs and progress keys. */
  id: z.string().min(1),

  title: z.string().min(1),
  description: z.string().min(1),

  /** Sort order within the subject (1-based recommended). */
  order: z.number().int().positive(),

  /** Rough time estimate in minutes for the topic (used in UI). */
  estimatedMinutes: z.number().int().positive(),
});


// The validators must produce exactly the hand-written client types.
type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _problemShapeMatches: Equal<z.infer<typeof ProblemSchema>, Problem> = true;
const _topicShapeMatches: Equal<z.infer<typeof TopicSchema>, Topic> = true;
void _problemShapeMatches;
void _topicShapeMatches;

// ============================================
// Subject Level
// ============================================

const SubjectSlugSchema = z.string().min(1);

const SubjectConfigSchema = z.object({
  slug: SubjectSlugSchema,
  label: z.string().min(1),
  shortDescription: z.string().min(1),
  modulesDescription: z.string().min(1),
  icon: z.string().min(1), // emoji or short symbol
  order: z.number().int().positive(),
  /** Optional topic count for /subjects overview, populated from the index topics array by loader */
  topicCount: z.number().int().nonnegative().optional(),
  /** Category for color-coding cards (foundations | calculus | linear | stats | discrete | algebra | logic | analysis) */
  category: z.string().optional(),
});

export type SubjectConfig = z.infer<typeof SubjectConfigSchema>;

// ============================================
// New: Filesystem-based Content (JSON + MDX per ARCHITECTURE.md)
// ============================================

/**
 * Schema for the subject-level index.json (content/{slug}/index.json).
 * Contains subject metadata + the list of topics (for navigation/overview).
 * This is the entry point for a data-driven subject.
 *

 */
export const SubjectIndexSchema = z.object({
  slug: SubjectSlugSchema,
  label: z.string().min(1),
  shortDescription: z.string().min(1),
  modulesDescription: z.string().min(1),
  icon: z.string().min(1),
  order: z.number().int().positive(),
  category: z.string().optional(),
  topics: z.array(TopicSchema),

  // Rich metadata (optional) — makes SEO/OG/JSON-LD data-driven from content/{slug}/index.json
  // New subjects can include these keys for rich metadata without any code changes in layout/page.
  // Falls back gracefully to basic defaults derived from label/shortDescription.
  keywords: z.array(z.string().min(1)).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  courseDescription: z.string().optional(),
}).passthrough();

export type SubjectIndex = z.infer<typeof SubjectIndexSchema>;

/**
 * Schema for per-topic index.json (content/{slug}/topics/{topicId}/index.json).
 * Provides topic metadata. (May duplicate info from subject index for self-contained topics.)
 */
export const TopicIndexSchema = TopicSchema;

/**
 * Base problem fields for questions stored in JSON files.
 * `topicId` is optional here because it can be derived from the containing topic folder;
 * the loader will inject it to produce a full Problem.
 */
const problemFieldsForFile = {
  ...problemFields,
  topicId: z.string().min(1).optional(),
};

/**
 * Schema for a single question entry inside questions.json.
 * Uses relaxed topicId for file loading.
 */
export const QuestionFileSchema = z
  .object(problemFieldsForFile)
  .refine(mcqRefine.refine, { message: mcqRefine.message, path: mcqRefine.path });

export type QuestionFile = z.infer<typeof QuestionFileSchema>;

/**
 * Schema for questions.json (array of questions for one topic).
 */
export const QuestionsFileSchema = z.array(QuestionFileSchema);
export type QuestionsFile = z.infer<typeof QuestionsFileSchema>;

/**
 * Schema for the rich explanation content loaded from module.mdx.
 * We store the *raw* MDX source (including frontmatter) so that:
 * - Loader stays simple (just file read + basic frontmatter extract)
 * - Rendering / MDX compilation happens downstream (e.g. in generic module page)
 * - No need to force structured body/sections in JSON for explanations.
 *
 * Any `section` slug used in the topic's questions.json MUST correspond to a
 * `##` heading of this MDX (for deep links + per-section progress).
 */
export const MdxModuleSchema = z.object({
  topicId: z.string().min(1),
  /** Title preferably from MDX frontmatter or topic metadata */
  title: z.string().min(1),
  /** Full raw file contents of module.mdx */
  mdxSource: z.string().min(1),
});

export type MdxModule = z.infer<typeof MdxModuleSchema>;

/**
 * The complete bundle loaded purely from the content/ filesystem structure
 * (JSON metadata + questions + MDX explanations).
 *
 */
export const FileSystemContentBundleSchema = z.object({
  config: SubjectConfigSchema,
  topics: z.array(TopicSchema),
  problems: z.array(ProblemSchema),
  mdxModules: z.array(MdxModuleSchema),
});

export type FileSystemContentBundle = z.infer<typeof FileSystemContentBundleSchema>;

// ============================================
// Problem Sets (content/{slug}/topics/{topicId}/problemset.json)
// ============================================

/**
 * What a problem asks the learner to *do*.
 *
 * This is the reason the format exists. The online question bank is ~60% multiple
 * choice because every answer had to survive string comparison; a printed sheet
 * has no grader, so it can finally ask for the three kinds of work that matter
 * most and cannot be auto-marked:
 *
 * - "computation" — evaluate/solve, the only kind the online bank could carry.
 * - "proof"       — establish a statement from definitions or named theorems.
 * - "sketch"      — draw a graph/region and justify the features drawn.
 * - "critique"    — find the error in a given argument and repair it.
 *
 * Authoring rule: a sheet made only of "computation" wastes the format.
 */
const ProblemKindSchema = z.enum(["computation", "proof", "sketch", "critique"]);

/**
 * One numbered problem on a printable sheet.
 *
 * Invariants (enforced by scripts/validate-problemsets.ts):
 * - `id` is stable and unique across the whole corpus. It is *not* a practice
 *   question id and never enters progress tracking — paper is not graded here.
 * - `section` must exactly match a section slug derived from the topic's
 *   module.mdx (same hard requirement questions.json carries), so a sheet can
 *   never drift away from the chapter it claims to test.
 * - `solution` is a full worked method, not a final answer. The learner checks
 *   their *route*, which is the whole point of doing it on paper.
 */
const ProblemSetProblemSchema = z.object({
  /** Stable, unique id. Convention: "ps-{subject}-{topic}-{nn}". */
  id: z.string().min(1),

  /** Section slug within the topic's module.mdx that this problem draws on. */
  section: z.string().min(1),

  kind: ProblemKindSchema,

  difficulty: DifficultySchema,

  /**
   * Expected working time in minutes. Drives the sheet's total time estimate and
   * how much blank space is printed under the question.
   */
  minutes: z.number().int().positive().max(60),

  /** The question, as it is printed. LaTeX in $...$ / $$...$$ as elsewhere in the corpus. */
  prompt: z.string().min(1),

  /**
   * Optional lettered parts, printed (a), (b), (c) … under the prompt, each with
   * its own working space. Use when one setup carries several asks.
   */
  parts: z.array(z.string().min(1)).min(2).optional(),

  /** Full worked solution — the method, step by step, not just the answer. */
  solution: z.string().min(1),
});

export type ProblemSetProblem = z.infer<typeof ProblemSetProblemSchema>;

/**
 * Schema for content/{slug}/topics/{topicId}/problemset.json.
 *
 * The presence of this file is the single source of truth for whether a topic
 * has a chapter test — there is no per-subject flag. (The retired `hasTests` on
 * the subject index was the wrong granularity: tests are per chapter.)
 */
export const ProblemSetFileSchema = z.object({
  /** Must match the containing topic folder. */
  topicId: z.string().min(1),

  /** Printed at the head of the sheet, e.g. "Limits & Continuity". */
  title: z.string().min(1),

  /** One or two sentences of rubric printed under the title. */
  instructions: z.string().min(1),

  problems: z.array(ProblemSetProblemSchema).min(1),
});

export type ProblemSetFile = z.infer<typeof ProblemSetFileSchema>;
