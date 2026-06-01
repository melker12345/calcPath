/**
 * Content Loader
 *
 * Provides validated content data.
 *
 * Current implementation:
 * - Legacy bridge: adapters from *-content.ts / *-modules.ts for SubjectBundle (kept for compat).
 * - NEW (this slice): pure data-driven loader reading JSON + MDX from `content/` dir per ARCHITECTURE.md
 *
 * Schema-first: all output validated with Zod from src/lib/content/schema.ts
 *
 * Thin vertical slice: focus on Linear Algebra from content/linear-algebra/ (metadata + topics that have folders).
 * Do NOT touch the three practice page impls or legacy content TS files.
 *
 * Future (per future-dynamic.md + ARCHITECTURE.md):
 * - Zero per-subject TS logic.
 * - Full generic pages consume FileSystemContentBundle.
 */

import {
  SubjectBundleSchema,
  type SubjectBundle,
  type SubjectConfig,
  ModuleSectionSummarySchema,
  // New FS content schemas (JSON + MDX)
  SubjectIndexSchema,
  type SubjectIndex,
  TopicIndexSchema,
  QuestionsFileSchema,
  MdxModuleSchema,
  FileSystemContentBundleSchema,
  type FileSystemContentBundle,
} from "./schema";

// ============================================
// Linear Algebra (first for thin vertical slice)
// ============================================

import { topics as linalgTopics, problems as linalgProblems } from "@/lib/linalg-content";
import { modules as linalgModules } from "@/lib/linalg-modules";

const linalgConfig: SubjectConfig = {
  slug: "linear-algebra",
  label: "Linear Algebra",
  shortDescription:
    "A free linear algebra course covering systems, vectors, matrices, determinants, vector spaces, orthogonality, eigenvalues, and symmetric matrices.",
  modulesDescription:
    "Read the linear algebra chapters in order, or jump directly to the topic you need.",
  icon: "λ",
  order: 2,
  hasTests: false,
};

/**
 * Returns the fully validated Linear Algebra content bundle.
 * This is the entry point for any generic LA-aware code in the thin slice.
 */
export function getLinearAlgebraBundle(): SubjectBundle {
  const raw = {
    config: linalgConfig,
    topics: linalgTopics,
    problems: linalgProblems,
    modules: linalgModules,
  };
  return SubjectBundleSchema.parse(raw);
}

// ============================================
// Adapter / Validation helpers (for migration & other subjects)
// ============================================

/**
 * Validates arbitrary raw data against the SubjectBundle schema.
 * Throws with Zod errors on failure (good messages for authoring).
 * Use this in future JSON loaders.
 */
export function validateSubjectBundle(raw: unknown): SubjectBundle {
  return SubjectBundleSchema.parse(raw);
}

/**
 * Derive slim module section summaries (for dashboard/search compat)
 * from a full validated bundle. This replaces the hand-maintained slim lists.
 */
export function deriveModuleSectionSummaries(bundle: SubjectBundle) {
  return bundle.modules.map((mod) => ({
    topicId: mod.topicId,
    sections: mod.sections.map((s) => ModuleSectionSummarySchema.parse({
      title: s.title,
      section: s.section,
    })),
  }));
}

// ============================================
// General loader (currently LA only for focused slice; expand later)
// ============================================

/**
 * Loads all known subject bundles (validated).
 * In the thin slice we focus on Linear Algebra to prove the data-driven path.
 * Other subjects remain on legacy paths until migrated.
 */
export async function loadAllContent(): Promise<Record<string, SubjectBundle>> {
  // For now synchronous under the hood; async for future FS or remote loads.
  const bundles: Record<string, SubjectBundle> = {
    "linear-algebra": getLinearAlgebraBundle(),
    // TODO: add calculus + statistics adapters after LA slice is proven
  };
  return bundles;
}

/**
 * Convenience: fetch a single validated bundle by slug.
 * Throws if unknown (in current impl).
 */
export async function getSubjectBundle(slug: string): Promise<SubjectBundle> {
  const all = await loadAllContent();
  const bundle = all[slug];
  if (!bundle) {
    throw new Error(`Unknown subject slug in content loader: ${slug}`);
  }
  return bundle;
}
