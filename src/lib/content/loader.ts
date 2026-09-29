/**
 * Content loader: reads content/<subject>/ (index.json, topics/<id>/index.json,
 * questions.json, module.mdx), validates with src/lib/content/schema.ts and
 * caches per process. Subjects are discovered by scanning content/ for
 * folders with an index.json, so a new subject is a new folder. Callers that
 * only need counts or section lists use the light paths, never the full
 * bundle.
 */

import "server-only";

import {
  type SubjectConfig,
  SubjectIndexSchema,
  type SubjectIndex,
  TopicIndexSchema,
  QuestionsFileSchema,
  type QuestionsFile,
  QuestionFileSchema,
  type QuestionFile,
  MdxModuleSchema,
  type MdxModule,
  FileSystemContentBundleSchema,
  type FileSystemContentBundle,
} from "./schema";

import { extractMdxSections, toSlug } from "./mdx";
import type { Problem, Topic } from "@/lib/shared-types";

/** Subject list entry: index.json metadata + empty content slots filled at call sites. */
export type ListedSubjectConfig = SubjectConfig & {
  topics: Topic[];
  problems: Problem[];
  modules: Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }>;
};

function subjectConfigFromIndex(idx: SubjectIndex): ListedSubjectConfig {
  return {
    slug: idx.slug,
    label: idx.label,
    shortDescription: idx.shortDescription,
    modulesDescription: idx.modulesDescription,
    icon: idx.icon,
    order: idx.order,
    category: idx.category,
    topicCount: idx.topics.length,
    topics: [],
    problems: [],
    modules: [],
  };
}

/** Loads subject metadata from content/{slug}/index.json. Throws if missing/invalid. */
export async function requireSubjectConfig(slug: string): Promise<ListedSubjectConfig> {
  const idx = await loadSubjectIndex(slug);
  return subjectConfigFromIndex(idx);
}


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
 * One topic folder: index.json (required), questions.json (topicId injected
 * when omitted) and module.mdx, the last two skippable for light paths.
 */
async function loadTopicContent(
  subjectSlug: string,
  topicId: string,
  options: { loadQuestions?: boolean; loadMdx?: boolean } = {}
): Promise<{
  topic: Topic;
  questions: Problem[];
  mdxModule?: MdxModule;
}> {
  const { loadQuestions = true, loadMdx = true } = options;
  const topicDir = `${subjectSlug}/topics/${topicId}`;

  // Topic metadata: prefer topic/index.json, fallback not present yet in skeleton for all
  let topic: Topic;
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
  let questions: Problem[] = [];
  if (loadQuestions) {
    let questionsFile: QuestionsFile = [];
    try {
      questionsFile = await readJsonFile(`${topicDir}/questions.json`, QuestionsFileSchema);
    } catch {
      // Whole file failed validation (common during content porting). Be tolerant.
      console.warn(`[content-loader] Whole questions.json failed validation for ${subjectSlug}/${topicId}. Attempting per-question recovery...`);
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const fullPath = path.join(process.cwd(), CONTENT_DIR, `${subjectSlug}/topics/${topicId}/questions.json`);
        const raw: unknown = JSON.parse(await fs.readFile(fullPath, "utf-8"));

        if (Array.isArray(raw)) {
          const valid: QuestionFile[] = [];
          const invalid: Array<{ id?: string; issues: string[] }> = [];
          for (const item of raw) {
            const result = QuestionFileSchema.safeParse(item);
            if (result.success) {
              valid.push(result.data);
            } else {
              invalid.push({
                id: typeof item === "object" && item !== null && "id" in item
                  ? String((item as { id?: unknown }).id)
                  : undefined,
                issues: result.error.issues.map((i) => i.message),
              });
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
    questions = questionsFile.map((q) => ({
      ...q,
      topicId: q.topicId ?? topicId,
    })) as Problem[];
  }

  // MDX rich content (skippable for perf paths that only need problems or only sections)
  let mdxModule: MdxModule | undefined;
  if (loadMdx) {
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
  }

  return { topic, questions, mdxModule };
}

/** The subject index (metadata + topic list) from content/{slug}/index.json. */
export async function loadSubjectIndex(slug: string): Promise<SubjectIndex> {
  return readJsonFile<SubjectIndex>(`${slug}/index.json`, SubjectIndexSchema);
}

/**
 * Subject discovery: every folder under content/ with a valid index.json, in
 * `order`. Returns configs with empty topics/problems/modules; the bundle
 * loaders fill those at the call sites that need them.
 */
export async function getAvailableSubjectConfigs(): Promise<ListedSubjectConfig[]> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const contentRoot = path.join(process.cwd(), CONTENT_DIR);

  const results: ListedSubjectConfig[] = [];
  let dirents;
  try {
    dirents = await fs.readdir(contentRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    try {
      const idx = await loadSubjectIndex(d.name);
      results.push(subjectConfigFromIndex(idx));
    } catch {
      // skip dirs without a valid index.json
    }
  }

  results.sort((a, b) => a.order - b.order);
  return results;
}

/** Convenience: just the slugs from discovery (for search etc). */
export async function getDiscoveredSubjectSlugs(): Promise<string[]> {
  const configs = await getAvailableSubjectConfigs();
  return configs.map((c) => c.slug);
}

// ============================================
// Server-side caches (process lifetime) for perf
// ============================================

/**
 * Process-lifetime caches. Content is static for the life of a build, so a
 * subject's bundle and its section structure are read once.
 */
const fileSystemBundleCache = new Map<string, FileSystemContentBundle>();
const moduleStructureCache = new Map<string, Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }>>();

/**
 * The full bundle of one subject: config, topics, every question, and the
 * raw module.mdx sources. Cached for the process lifetime.
 */
export async function getFileSystemContentBundle(slug: string): Promise<FileSystemContentBundle> {
  return loadSubjectFromContent(slug, { includeMdxModules: true });
}

/**
 * Reads content/{slug}/ into a bundle. `includeMdxModules: false` skips the
 * module.mdx files for callers that only need topics and questions; if the
 * full bundle is already cached the light view is served from it.
 */
async function loadSubjectFromContent(
  slug: string,
  options: { includeMdxModules?: boolean } = {}
): Promise<FileSystemContentBundle> {
  const { includeMdxModules = true } = options;

  // Cache hit: full bundle cached means we can serve full or stripped-light instantly (no FS).
  if (fileSystemBundleCache.has(slug)) {
    const cached = fileSystemBundleCache.get(slug)!;
    if (includeMdxModules) {
      return cached;
    }
    // Light view: same data minus mdxSources (saves memory for pure problems+counts use)
    return {
      config: cached.config,
      topics: cached.topics,
      problems: cached.problems,
      mdxModules: [],
    };
  }

  const subjectIndex = await loadSubjectIndex(slug);

  const config: SubjectConfig = {
    slug: subjectIndex.slug,
    label: subjectIndex.label,
    shortDescription: subjectIndex.shortDescription,
    modulesDescription: subjectIndex.modulesDescription,
    icon: subjectIndex.icon,
    order: subjectIndex.order,
  };

  const topicsFromIndex = subjectIndex.topics;

  const loadedTopics: Topic[] = [];
  const allProblems: Problem[] = [];
  const mdxModules: MdxModule[] = [];

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
        const { questions, mdxModule } = await loadTopicContent(slug, topicMeta.id, {
          loadQuestions: true,
          loadMdx: includeMdxModules,
        });
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

  const parsed = FileSystemContentBundleSchema.parse(rawBundle);

  if (includeMdxModules) {
    fileSystemBundleCache.set(slug, parsed);
  }
  return parsed;
}

// =============================================================================
// Section structure derivation
// =============================================================================

/**
 * Internal: lightweight loader for just the slim module structure (sections from MDX).
 * Loads subject index (topics list) + per-topic module.mdx only.
 * NEVER loads questions.json -- this is the key to avoiding heavy I/O in derive calls.
 * Used exclusively by (cached) deriveModuleStructureFromBundle.
 * Duplicates minimal dir-scan logic (topics may be partial); small cost vs. questions files.
 */
async function loadSlimModuleStructure(slug: string): Promise<Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }>> {
  const subjectIndex = await loadSubjectIndex(slug);
  const topicsFromIndex = subjectIndex.topics;

  const mdxModules: MdxModule[] = [];

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
    if (existingTopicIds.includes(topicMeta.id)) {
      try {
        // mdx-only: still loads small topic/index.json (for title fallback in mdx parse) but skips questions entirely.
        const { mdxModule } = await loadTopicContent(slug, topicMeta.id, {
          loadQuestions: false,
          loadMdx: true,
        });
        if (mdxModule) {
          mdxModules.push(mdxModule);
        }
      } catch (err) {
        console.warn(`[content-loader] Partial load (mdx-only) for topic ${topicMeta.id} in ${slug}:`, (err as Error).message);
      }
    }
  }

  const out: Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }> = [];
  for (const topic of topicsFromIndex) {
    const mdxMod = mdxModules.find((m) => m.topicId === topic.id);
    const secs = extractMdxSections(mdxMod?.mdxSource);
    out.push({ topicId: topic.id, sections: secs });
  }
  for (const t of topicsFromIndex) {
    if (!out.some((o) => o.topicId === t.id)) out.push({ topicId: t.id, sections: [] });
  }
  return out;
}

/**
 * The slim {topicId, sections[]} structure of a subject, from the `##`
 * headings of each module.mdx (never questions.json). Section slugs come from
 * the same extractor the validator uses. Cached for the process lifetime.
 */
export async function deriveModuleStructureFromBundle(
  slug: string
): Promise<Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }>> {
  if (moduleStructureCache.has(slug)) {
    return moduleStructureCache.get(slug)!;
  }
  try {
    const structure = await loadSlimModuleStructure(slug);
    moduleStructureCache.set(slug, structure);
    return structure;
  } catch (e) {
    console.warn(`[content-loader] deriveModuleStructureFromBundle failed for ${slug}:`, (e as Error)?.message);
    const empty: Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }> = [];
    moduleStructureCache.set(slug, empty);
    return empty;
  }
}

/** One section of a chapter, with how many practice questions it carries. */
export type DashboardSection = { slug: string; title: string; total: number };

/** One chapter as the progress pages see it: titles and counts, never questions. */
export type DashboardTopic = {
  id: string;
  title: string;
  order: number;
  questionTotal: number;
  sections: DashboardSection[];
};

export type DashboardSubjectData = {
  topics: DashboardTopic[];
  /**
   * topicId → section slug → practice question ids. Exact per-chapter and
   * per-section counts need ids; only the per-subject progress page ships
   * this (one subject at a time), the overview ships the counts alone.
   */
  sectionIds: Record<string, Record<string, string[]>>;
};

/**
 * Data for the progress pages. Loads questions once (no module.mdx) and the
 * cached section structure, then reduces to titles, counts and id lists —
 * the old version handed the client every question of every subject.
 */
export async function getDashboardDataForSubject(slug: string): Promise<DashboardSubjectData> {
  const [bundleLight, mods] = await Promise.all([
    loadSubjectFromContent(slug, { includeMdxModules: false }),
    deriveModuleStructureFromBundle(slug),
  ]);
  const sectionsByTopic = new Map(mods.map((m) => [m.topicId, m.sections]));

  const sectionIds: Record<string, Record<string, string[]>> = {};
  for (const p of bundleLight.problems) {
    const byTopic = (sectionIds[p.topicId] ??= {});
    (byTopic[p.section] ??= []).push(p.id);
  }

  const topics: DashboardTopic[] = [...bundleLight.topics]
    .sort((a, b) => a.order - b.order)
    .map((t) => {
      const ids = sectionIds[t.id] ?? {};
      const sections = (sectionsByTopic.get(t.id) ?? []).map((s) => {
        const sectionSlug = s.section || toSlug(s.title);
        return { slug: sectionSlug, title: s.title, total: ids[sectionSlug]?.length ?? 0 };
      });
      const questionTotal = Object.values(ids).reduce((n, list) => n + list.length, 0);
      return { id: t.id, title: t.title, order: t.order, questionTotal, sections };
    });

  return { topics, sectionIds };
}
