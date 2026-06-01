/**
 * Content Loader
 *
 * Provides validated content data.
 *
 * Primary implementation (data-driven architecture):
 * - Legacy bridge: adapters from *-content.ts / *-modules.ts for SubjectBundle (kept only for compat during transition).
 * - Primary data-driven loader: reads JSON + MDX from `content/` dir per content/ARCHITECTURE.md and the official 2026-06 declaration.
 *
 * Schema-first: all output validated with Zod from src/lib/content/schema.ts.
 *
 * Supports all three subjects (linear-algebra, statistics, calculus) from their full content/ structures.
 * Legacy TS content files are archived in backup-content/legacy/ and no longer the focus.
 *
 * Per MIGRATION-PLAN.md: this is the main path. New code must use the FileSystemContentBundle variants.
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
  QuestionFileSchema,
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
 * Returns the fully validated Linear Algebra content bundle (legacy adapter path).
 * Prefer getFileSystemContentBundle("linear-algebra") for new code.
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
// Primary: Data-driven loader from content/ directory (JSON + MDX)
// Per content/ARCHITECTURE.md (official primary architecture).
// Supports full structures for all subjects.
// ============================================

const CONTENT_DIR = "content";

/**
 * Simple frontmatter parser for MDX (no extra deps).
 * Supports basic key: value (single line) under --- delimiters.
 * Returns { title?, ...other }
 */
function parseMdxFrontmatter(mdxSource: string): Record<string, string> {
  const frontmatterMatch = mdxSource.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!frontmatterMatch) return {};
  const yamlBlock = frontmatterMatch[1];
  const data: Record<string, string> = {};
  yamlBlock.split(/\r?\n/).forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      // strip simple quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key) data[key] = value;
    }
  });
  return data;
}

/**
 * Internal: read a JSON file + validate with provided schema.
 * Uses dynamic import so 'fs' never enters client bundles.
 */
async function readJsonFile<T>(relativePath: string, schema: import("zod").ZodType<T>): Promise<T> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), CONTENT_DIR, relativePath);
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw);
  return schema.parse(parsed);
}

/**
 * Internal: read an MDX (or any text) file as raw string.
 */
async function readMdxFile(relativePath: string): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), CONTENT_DIR, relativePath);
  return fs.readFile(fullPath, "utf-8");
}

/**
 * Load a single topic's data from its folder under content/{subject}/topics/{topicId}/
 * - topic index.json (optional fallback)
 * - questions.json (injects topicId if missing)
 * - module.mdx (the rich explanation source)
 *
 * Resilient loading for partial ports or future subjects.
 */
async function loadTopicContent(subjectSlug: string, topicId: string): Promise<{
  topic: import("./schema").Topic;
  questions: import("./schema").Problem[];
  mdxModule?: import("./schema").MdxModule;
}> {
  const topicDir = `${subjectSlug}/topics/${topicId}`;

  // Topic metadata: prefer topic/index.json, fallback not present yet in skeleton for all
  let topic: import("./schema").Topic;
  try {
    topic = await readJsonFile(`${topicDir}/index.json`, TopicIndexSchema);
  } catch {
    // For skeleton, some topics only listed at subject level; we'll handle upstream
    throw new Error(`Missing required topic index for ${topicId} at ${topicDir}/index.json`);
  }

  // Questions (may be empty in skeleton)
  // Resilient loading: prefer the whole file validating, but if it fails we still try to
  // load the good individual questions. This way one bad MCQ/LaTeX item does not nuke
  // the entire topic for practice (user preference: "better to load broken questions than none").
  let questionsFile: import("./schema").QuestionsFile = [];
  try {
    questionsFile = await readJsonFile(`${topicDir}/questions.json`, QuestionsFileSchema);
  } catch (err) {
    // Whole file failed validation (common during content porting). Be tolerant.
    console.warn(`[content-loader] Whole questions.json failed validation for ${subjectSlug}/${topicId}. Attempting per-question recovery...`);
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fullPath = path.join(process.cwd(), CONTENT_DIR, `${subjectSlug}/topics/${topicId}/questions.json`);
      const raw = JSON.parse(await fs.readFile(fullPath, "utf-8"));

      if (Array.isArray(raw)) {
        const valid: any[] = [];
        const invalid: any[] = [];
        for (const item of raw) {
          const result = QuestionFileSchema.safeParse(item);
          if (result.success) {
            valid.push(result.data);
          } else {
            invalid.push({ id: item?.id, issues: result.error.issues.map((i: any) => i.message) });
          }
        }
        questionsFile = valid;
        if (invalid.length > 0) {
          console.warn(`[content-loader] Skipped ${invalid.length} invalid question(s) in ${subjectSlug}/${topicId}:`, invalid);
        }
      }
    } catch (recoverErr) {
      console.error(`[content-loader] Could not recover any questions for ${subjectSlug}/${topicId}:`, (recoverErr as Error).message);
      questionsFile = [];
    }
  }

  // Inject topicId for any that omit it (per our schema design)
  const questions = questionsFile.map((q) => ({
    ...q,
    topicId: q.topicId ?? topicId,
  })) as import("./schema").Problem[];

  // MDX rich content
  let mdxModule: import("./schema").MdxModule | undefined;
  try {
    const mdxSource = await readMdxFile(`${topicDir}/module.mdx`);
    const fm = parseMdxFrontmatter(mdxSource);
    const title = fm.title || topic.title;
    mdxModule = MdxModuleSchema.parse({
      topicId,
      title,
      mdxSource,
    });
  } catch {
    // Some topics may ship without module.mdx initially (or for subjects still ramping); caller handles absence.
    mdxModule = undefined;
  }

  return { topic, questions, mdxModule };
}

/**
 * Loads Linear Algebra purely from the content/ filesystem (data-driven).
 * Full support: subject index + all topics with their questions.json + module.mdx.
 *
 * Returns FileSystemContentBundle (validated). This is the canonical loader for the primary architecture.
 */
export async function loadLinearAlgebraFromContent(): Promise<FileSystemContentBundle> {
  // 1. Load subject index (config + topic list) via the generic helper (data-driven nav friendly)
  const subjectIndex = await loadSubjectIndex("linear-algebra");

  const config: SubjectConfig = {
    slug: subjectIndex.slug,
    label: subjectIndex.label,
    shortDescription: subjectIndex.shortDescription,
    modulesDescription: subjectIndex.modulesDescription,
    icon: subjectIndex.icon,
    order: subjectIndex.order,
    hasTests: subjectIndex.hasTests,
  };

  // 2. Start with topics from index (metadata only for now)
  const topicsFromIndex = subjectIndex.topics;

  // 3. Load detailed data for topics that have folders on disk (all do for LA; the discovery is robust for any subject)
  const loadedTopics: import("./schema").Topic[] = [];
  const allProblems: import("./schema").Problem[] = [];
  const mdxModules: import("./schema").MdxModule[] = [];

  // Use readdir to discover what topic folders actually exist (robust for partial skeleton)
  let existingTopicIds: string[] = [];
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const topicsDir = path.join(process.cwd(), CONTENT_DIR, "linear-algebra/topics");
    const entries = await fs.readdir(topicsDir, { withFileTypes: true });
    existingTopicIds = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    existingTopicIds = [];
  }

  for (const topicMeta of topicsFromIndex) {
    loadedTopics.push(topicMeta); // always include metadata

    if (existingTopicIds.includes(topicMeta.id)) {
      try {
        const { topic: _t, questions, mdxModule } = await loadTopicContent("linear-algebra", topicMeta.id);
        // topic from index already has the meta; questions + mdx if present
        allProblems.push(...questions);
        if (mdxModule) {
          mdxModules.push(mdxModule);
        }
      } catch (err) {
        // Log but don't fail whole load (resilient for any subject during rollout)
        console.warn(`[content-loader] Partial load for topic ${topicMeta.id}:`, (err as Error).message);
      }
    }
  }

  const rawBundle = {
    config,
    topics: loadedTopics,
    problems: allProblems,
    mdxModules,
  };

  return FileSystemContentBundleSchema.parse(rawBundle);
}

/**
 * Load just the SubjectIndex (subject metadata + topics list) from content/{slug}/index.json.
 * This is lightweight and ideal for driving subject-level navigation, breadcrumbs,
 * topic lists, subject chrome, etc. from the new data-driven content (no need for full bundle with problems/mdx).
 * Works for any subject that has an index.json (currently all three in content/).
 */
export async function loadSubjectIndex(slug: string): Promise<SubjectIndex> {
  return readJsonFile<SubjectIndex>(`${slug}/index.json`, SubjectIndexSchema);
}

/**
 * Primary entry point for the data-driven architecture.
 * Supports all three subjects (la, stats, calculus) — full content/ ports complete.
 */
export async function getFileSystemContentBundle(slug: string): Promise<FileSystemContentBundle> {
  if (slug === "linear-algebra") {
    return loadLinearAlgebraFromContent();
  }
  if (slug === "statistics") {
    return loadStatisticsFromContent();
  }
  if (slug === "calculus") {
    return loadCalculusFromContent();
  }
  throw new Error(`FS content loader supports "linear-algebra", "statistics", and "calculus" (got: ${slug}).`);
}

/**
 * Loads Statistics purely from the content/ filesystem (data-driven).
 * Full support added for the Statistics Completion Agent port: all 14 topics with
 * index.json + questions.json + module.mdx where present.
 */
export async function loadStatisticsFromContent(): Promise<FileSystemContentBundle> {
  // Use generic index loader (supports driving nav/chrome from subject index data)
  const subjectIndex = await loadSubjectIndex("statistics");

  const config: SubjectConfig = {
    slug: subjectIndex.slug,
    label: subjectIndex.label,
    shortDescription: subjectIndex.shortDescription,
    modulesDescription: subjectIndex.modulesDescription,
    icon: subjectIndex.icon,
    order: subjectIndex.order,
    hasTests: subjectIndex.hasTests,
  };

  const topicsFromIndex = subjectIndex.topics;

  const loadedTopics: import("./schema").Topic[] = [];
  const allProblems: import("./schema").Problem[] = [];
  const mdxModules: import("./schema").MdxModule[] = [];

  let existingTopicIds: string[] = [];
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const topicsDir = path.join(process.cwd(), CONTENT_DIR, "statistics/topics");
    const entries = await fs.readdir(topicsDir, { withFileTypes: true });
    existingTopicIds = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    existingTopicIds = [];
  }

  for (const topicMeta of topicsFromIndex) {
    loadedTopics.push(topicMeta);

    if (existingTopicIds.includes(topicMeta.id)) {
      try {
        const { topic: _t, questions, mdxModule } = await loadTopicContent("statistics", topicMeta.id);
        allProblems.push(...questions);
        if (mdxModule) {
          mdxModules.push(mdxModule);
        }
      } catch (err) {
        console.warn(`[content-loader] Partial load for topic ${topicMeta.id}:`, (err as Error).message);
      }
    }
  }

  const rawBundle = {
    config,
    topics: loadedTopics,
    problems: allProblems,
    mdxModules,
  };

  return FileSystemContentBundleSchema.parse(rawBundle);
}

/**
 * Loads Calculus purely from the content/ filesystem (data-driven).
 * All 9 topics ported with full questions.json + rich module.mdx.
 */
export async function loadCalculusFromContent(): Promise<FileSystemContentBundle> {
  return loadSubjectFromContent("calculus");
}

/**
 * Generic loader for any subject that has a full content/{slug}/ structure
 * (index.json + topics/<topicId>/index.json + questions.json + module.mdx).
 * Used by statistics (via dedicated wrapper for history) and calculus.
 * This is the "add subject = just write the data files" path.
 */
export async function loadSubjectFromContent(slug: string): Promise<FileSystemContentBundle> {
  const subjectIndex = await loadSubjectIndex(slug);

  const config: SubjectConfig = {
    slug: subjectIndex.slug,
    label: subjectIndex.label,
    shortDescription: subjectIndex.shortDescription,
    modulesDescription: subjectIndex.modulesDescription,
    icon: subjectIndex.icon,
    order: subjectIndex.order,
    hasTests: subjectIndex.hasTests,
  };

  const topicsFromIndex = subjectIndex.topics;

  const loadedTopics: import("./schema").Topic[] = [];
  const allProblems: import("./schema").Problem[] = [];
  const mdxModules: import("./schema").MdxModule[] = [];

  let existingTopicIds: string[] = [];
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const topicsDir = path.join(process.cwd(), CONTENT_DIR, `${slug}/topics`);
    const entries = await fs.readdir(topicsDir, { withFileTypes: true });
    existingTopicIds = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    existingTopicIds = [];
  }

  for (const topicMeta of topicsFromIndex) {
    loadedTopics.push(topicMeta);

    if (existingTopicIds.includes(topicMeta.id)) {
      try {
        const { topic: _t, questions, mdxModule } = await loadTopicContent(slug, topicMeta.id);
        allProblems.push(...questions);
        if (mdxModule) {
          mdxModules.push(mdxModule);
        }
      } catch (err) {
        console.warn(`[content-loader] Partial load for topic ${topicMeta.id}:`, (err as Error).message);
      }
    }
  }

  const rawBundle = {
    config,
    topics: loadedTopics,
    problems: allProblems,
    mdxModules,
  };

  return FileSystemContentBundleSchema.parse(rawBundle);
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
// Legacy general loader (for transition compat only)
// ============================================

/**
 * Loads known subject bundles using legacy TS adapters — kept only for any remaining
 * code not yet migrated to the primary data-driven path.
 *
 * For the official architecture (per 2026-06 declaration) use:
 *   - getFileSystemContentBundle(slug)  → returns FileSystemContentBundle from content/
 */
export async function loadAllContent(): Promise<Record<string, SubjectBundle>> {
  // For now synchronous under the hood; async for future FS or remote loads.
  const bundles: Record<string, SubjectBundle> = {
    "linear-algebra": getLinearAlgebraBundle(),
    // NOTE: calculus + statistics are fully available via the FS path (getFileSystemContentBundle);
    // legacy adapters here are intentionally minimal during migration.
  };
  return bundles;
}

/**
 * Convenience: fetch a single validated bundle by slug (legacy SubjectBundle shape).
 * Throws if unknown (in current impl).
 *
 * New / primary code must use getFileSystemContentBundle(slug) for subjects that have content/ data.
 */
export async function getSubjectBundle(slug: string): Promise<SubjectBundle> {
  const all = await loadAllContent();
  const bundle = all[slug];
  if (!bundle) {
    throw new Error(`Unknown subject slug in content loader: ${slug}`);
  }
  return bundle;
}
