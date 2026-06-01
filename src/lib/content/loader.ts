/**
 * Content Loader
 *
 * Provides validated content data.
 *
 * Current implementation:
 * - Legacy bridge: adapters from *-content.ts / *-modules.ts for SubjectBundle (kept for compat).
 * - NEW: pure data-driven loader reading JSON + MDX from `content/` dir per ARCHITECTURE.md
 *
 * Schema-first: all output validated with Zod from src/lib/content/schema.ts
 *
 * Dual system support (2026-06-01 migration start): real production pages for linear-algebra
 * can optionally consume FileSystemContentBundle via env flag USE_FS_CONTENT_LA=true
 * (see adapters in subject layouts/pages + scoped-providers context). Safe fallback always works.
 * Focus: LA practice + module pages first.
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
// NEW: Data-driven loader from content/ directory (JSON + MDX)
// Per content/ARCHITECTURE.md and schema updates.
// Thin vertical slice: Linear Algebra, metadata + topics with folders (e.g. vectors)
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
 * - module.mdx (required for now in thin slice)
 *
 * Graceful for missing files in early skeleton: questions default [], mdx optional? but for vectors present.
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
  let questionsFile: import("./schema").QuestionsFile = [];
  try {
    questionsFile = await readJsonFile(`${topicDir}/questions.json`, QuestionsFileSchema);
  } catch {
    // ok for partial content
    questionsFile = [];
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
    // For thin slice, only vectors has it; others may not yet
    mdxModule = undefined;
  }

  return { topic, questions, mdxModule };
}

/**
 * Internal shared loader for any subject from content/ FS (data-driven).
 * Discovers topic folders on disk, loads metadata from index, questions + mdx where present.
 * Reduces duplication between per-subject load fns.
 */
async function loadSubjectFromContent(subjectSlug: string): Promise<FileSystemContentBundle> {
  const subjectIndex = await readJsonFile<SubjectIndex>(`${subjectSlug}/index.json`, SubjectIndexSchema);

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

  // Use readdir to discover what topic folders actually exist (robust for partial/ full)
  let existingTopicIds: string[] = [];
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const topicsDir = path.join(process.cwd(), CONTENT_DIR, `${subjectSlug}/topics`);
    const entries = await fs.readdir(topicsDir, { withFileTypes: true });
    existingTopicIds = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    existingTopicIds = [];
  }

  for (const topicMeta of topicsFromIndex) {
    loadedTopics.push(topicMeta);

    if (existingTopicIds.includes(topicMeta.id)) {
      try {
        const { topic: _t, questions, mdxModule } = await loadTopicContent(subjectSlug, topicMeta.id);
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
 * Loads Linear Algebra purely from the content/ filesystem (data-driven).
 * Now full: all 9 topics with questions + mdx per content/linear-algebra/.
 */
export async function loadLinearAlgebraFromContent(): Promise<FileSystemContentBundle> {
  return loadSubjectFromContent("linear-algebra");
}

/**
 * Convenience for the new FS path.
 * Supports linear-algebra (full) and statistics.
 */
export async function getFileSystemContentBundle(slug: string): Promise<FileSystemContentBundle> {
  if (slug === "linear-algebra" || slug === "statistics") {
    return loadSubjectFromContent(slug);
  }
  throw new Error(`FS content loader currently supports only "linear-algebra" and "statistics" (got: ${slug}). Other subjects still use legacy adapters.`);
}

/**
 * Small helper for dual-system migration: returns the FS bundle for LA only if the
 * USE_FS_CONTENT_LA flag is set (and load succeeds); null otherwise. Keeps call sites in
 * real pages tiny and reduces repeated try/catch/env checks.
 */
export async function getOptionalLAContentBundle(): Promise<FileSystemContentBundle | null> {
  if (process.env.USE_FS_CONTENT_LA !== "true") return null;
  try {
    return await getFileSystemContentBundle("linear-algebra");
  } catch (err) {
    console.warn("[content-loader] Optional LA FS load failed (will use legacy):", (err as Error).message);
    return null;
  }
}

/**
 * Loads Statistics purely from the content/ filesystem (data-driven).
 */
export async function loadStatisticsFromContent(): Promise<FileSystemContentBundle> {
  return loadSubjectFromContent("statistics");
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
 * Loads all known subject bundles (validated) — LEGACY path using TS adapters.
 * In the thin slice we focus on Linear Algebra to prove the data-driven path.
 * Other subjects remain on legacy paths until migrated.
 *
 * For the new JSON+MDX architecture use:
 *   - loadLinearAlgebraFromContent() or getFileSystemContentBundle("linear-algebra")
 *   - These return FileSystemContentBundle (with mdxModules)
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
 * Convenience: fetch a single validated bundle by slug. (Legacy shape)
 * Throws if unknown (in current impl).
 *
 * New code for dynamic architecture should prefer the FS variants for subjects that have content/ data.
 */
export async function getSubjectBundle(slug: string): Promise<SubjectBundle> {
  const all = await loadAllContent();
  const bundle = all[slug];
  if (!bundle) {
    throw new Error(`Unknown subject slug in content loader: ${slug}`);
  }
  return bundle;
}
