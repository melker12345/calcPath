/**
 * Content Loader
 *
 * Provides validated content data.
 *
 * Primary implementation (data-driven architecture):
 * - Primary data-driven loader: reads JSON + MDX from `content/` dir per content/ARCHITECTURE.md and the official 2026-06 declaration.
 * - Includes lightweight auto-discovery via getAvailableSubjectConfigs() (scan content/ subdirs with index.json).
 * - All per-subject load*FromContent duplication removed; single generic loadSubjectFromContent path.
 *
 * Schema-first: all output validated with Zod from src/lib/content/schema.ts.
 *
 * Supports all subjects from content/ (including newly dropped ones with zero subjects.ts entry).
 * Previous TS content files were archived in backup-content/legacy/ and have been fully deleted after successful migration sign-off.
 * History remains fully preserved in git (original git mv commits on the migration branch; inspect via `git show <backup-commit>:backup-content/legacy/...`).
 *
 * Primary dynamic routes at /[subject] are fully data-driven via content/ + loader + generics + adapters.
 * See content/ARCHITECTURE.md (detailed history lives in src/lib/content/NOTES.md and git log).
 *
 * Perf: getFileSystemContentBundle + deriveModuleStructureFromBundle + new getDashboardDataForSubject are cached
 * (process-lifetime Maps) and derive uses mdx-only light path (no questions.json). This eliminates the
 * dashboard's previous N*2 full loads for 14+ auto-discovered subjects.
 */

import "server-only";

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

import { extractMdxSections } from "./mdx";

// ============================================
// Linear Algebra (first for thin vertical slice)
// ============================================

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
 * Returns the fully validated Linear Algebra content bundle (compat adapter path).
 * Prefer getFileSystemContentBundle("linear-algebra") for new code.
 * Dummies for linalg* (previously related to retired subject-topics shim lists) removed;
 * this is now a minimal compat bridge (only LA is wired here; others via FS). Shims fully retired.
 * get*Bundle kept only for a couple of compat paths (most call sites now use getFileSystemContentBundle directly).
 */
export function getLinearAlgebraBundle(): SubjectBundle {
  const raw = {
    config: linalgConfig,
    topics: [],
    problems: [],
    modules: [],
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
 * - topic index.json (required for topic metadata)
 * - questions.json (injects topicId if missing) -- can be skipped via options for lightweight paths
 * - module.mdx (the rich explanation source) -- can be skipped via options
 *
 * Resilient loading for partial ports or future subjects.
 * Supports options to skip heavy files: used by dashboard lightweight path (skip mdx when only problems needed)
 * and derive (skip questions entirely, since only sections from MDX headings are required).
 */
async function loadTopicContent(
  subjectSlug: string,
  topicId: string,
  options: { loadQuestions?: boolean; loadMdx?: boolean } = {}
): Promise<{
  topic: import("./schema").Topic;
  questions: import("./schema").Problem[];
  mdxModule?: import("./schema").MdxModule;
}> {
  const { loadQuestions = true, loadMdx = true } = options;
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
  let questions: import("./schema").Problem[] = [];
  if (loadQuestions) {
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
    questions = questionsFile.map((q) => ({
      ...q,
      topicId: q.topicId ?? topicId,
    })) as import("./schema").Problem[];
  }

  // MDX rich content (skippable for perf paths that only need problems or only sections)
  let mdxModule: import("./schema").MdxModule | undefined;
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

/**
 * Load just the SubjectIndex (subject metadata + topics list) from content/{slug}/index.json.
 * This is lightweight and ideal for driving subject-level navigation, breadcrumbs,
 * topic lists, subject chrome, etc. from the new data-driven content (no need for full bundle with problems/mdx).
 * Works for any subject that has an index.json.
 */
export async function loadSubjectIndex(slug: string): Promise<SubjectIndex> {
  return readJsonFile<SubjectIndex>(`${slug}/index.json`, SubjectIndexSchema);
}

/**
 * Lightweight auto subject discovery to enable true "just drop content/" for new subjects.
 * Scans the content/ directory (server-only via fs) for subdirectories containing index.json.
 * For each, loads the SubjectIndex for label/desc/icon/order/hasTests.
 * Merges with (optional) metadata entry from subjects.ts record for overrides/fallbacks
 * (e.g. different icon or order without touching the content index.json).
 * New subjects with only content/{new-slug}/index.json + topics/... require *zero* code
 * or entry in subjects.ts to appear in lists, sitemap, search, dashboard, navs, etc.
 * Subjects only in the record (no content dir) still appear via fallback.
 * Returns shapes compatible with the SubjectConfig (retained for compat) used by subjectList consumers
 * (topics/problems/modules are empty arrays; real data comes from bundles at call sites).
 */
export async function getAvailableSubjectConfigs(): Promise<SubjectConfig[]> {
  const metaMod = await import("@/lib/subjects");
  const metaRecord = (metaMod as any).subjects as Record<string, any>;

  const fs = await import("fs/promises");
  const path = await import("path");
  const contentRoot = path.join(process.cwd(), CONTENT_DIR);

  const allSlugs = new Set<string>(Object.keys(metaRecord));
  try {
    const dirents = await fs.readdir(contentRoot, { withFileTypes: true });
    for (const d of dirents) {
      if (d.isDirectory()) allSlugs.add(d.name);
    }
  } catch {
    // content dir absent or unreadable; proceed with record only
  }

  const results: any[] = [];
  for (const slug of allSlugs) {
    const meta = metaRecord[slug];
    let fromIndex: any = null;
    try {
      // Verify index.json exists before loading (lightweight discovery)
      const idxPath = path.join(contentRoot, slug, "index.json");
      await fs.access(idxPath);
      fromIndex = await loadSubjectIndex(slug);
    } catch {
      // No content/ entry for this slug; include only if it had a metadata record entry
      if (!meta) continue;
    }

    const cfg = fromIndex || {};
    const topicsArr = cfg.topics || [];
    const item = {
      slug,
      label: cfg.label || meta?.label || slug,
      shortDescription: cfg.shortDescription || meta?.shortDescription || `Learn ${slug}.`,
      modulesDescription: cfg.modulesDescription || meta?.modulesDescription || `Modules for ${slug}.`,
      icon: cfg.icon || meta?.icon || "📘",
      order: typeof cfg.order === "number" ? cfg.order : (meta?.order ?? 999),
      hasTests: typeof cfg.hasTests === "boolean" ? cfg.hasTests : (meta?.hasTests ?? false),
      category: cfg.category || meta?.category,
      // Lightweight count for the dedicated /subjects overview page (full topics loaded on demand per subject).
      topicCount: Array.isArray(topicsArr) ? topicsArr.length : 0,
      // SubjectConfig shape compat (consumers like dashboard expect these fields; name retained for compat)
      topics: [],
      problems: [],
      modules: [],
    };
    results.push(item);
  }

  results.sort((a: any, b: any) => a.order - b.order);
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
 * Server-side process-lifetime caches to fix dashboard over-fetching (and benefit sitemap/search/etc).
 *
 * - fileSystemBundleCache: full bundles (topics + problems + mdxModules). Lifetime because content is static
 *   (shipped in the deploy; runtime edits require server restart to pick up, which is acceptable for this SaaS).
 *   Avoids re-reading large questions.json (algebra ~400qs, statistics 461, real-analysis 353, geometry etc.)
 *   and re-parsing MDX on repeated calls.
 * - moduleStructureCache: the slim {topicId, sections[]} derived from MDX headings. Populated by derive.
 *
 * Dashboard previously did Promise.all over 14+ subjects, each doing *two* full getFileSystemContentBundle
 * (once explicit, once inside derive which re-reads everything + re-extracts). Now uses getDashboardDataForSubject
 * which does mdx-skipped problems load + cached derive (light mdx-only).
 *
 * No new deps; pure Map. Callers of getFileSystem... still get full fidelity.
 */
const fileSystemBundleCache = new Map<string, FileSystemContentBundle>();
const moduleStructureCache = new Map<string, Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }>>();

/**
 * Primary entry point for the data-driven architecture.
 * Returns a validated FileSystemContentBundle by reading directly from content/{slug}/
 * (index.json + topics/<topic>/ {index.json, questions.json, module.mdx}).
 *
 * Supports every subject that has a content/ folder — including newly dropped ones with
 * zero code changes and zero entry in subjects.ts (thanks to auto-discovery in getAvailableSubjectConfigs).
 *
 * This is now the single implementation path (previous per-subject load*FromContent shims removed).
 *
 * Results are cached in-memory for the process lifetime (see fileSystemBundleCache above).
 */
export async function getFileSystemContentBundle(slug: string): Promise<FileSystemContentBundle> {
  return loadSubjectFromContent(slug, { includeMdxModules: true });
}

/**
 * Generic loader for any subject that has a full content/{slug}/ structure
 * (index.json + topics/<topicId>/index.json + questions.json + module.mdx).
 * This is the single implementation used by getFileSystemContentBundle for all subjects.
 * For *listing* subjects with zero subjects.ts boilerplate, see getAvailableSubjectConfigs()
 * (scans content/ dirs). This load is for the data bundle of a known slug.
 *
 * Supports options.includeMdxModules=false for lightweight callers that only need topics+problems
 * (e.g. dashboard progress aggregates via getPracticeProgress which only needs the problem IDs/sections).
 * When mdx skipped, mdxModules will be [] in result (callers that need rich modules use the default full path).
 *
 * Internal caching: if a FULL (mdx-included) bundle for the slug is already cached, light requests
 * return a stripped view instantly with no FS I/O. Full requests always hit cache after first load.
 */
export async function loadSubjectFromContent(
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
        const { topic: _t, questions, mdxModule } = await loadTopicContent(slug, topicMeta.id, {
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

// ============================================
// Adapter / Validation helpers (for compat & other subjects)
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
// Compat / adapter entry points (primary data now always comes from getFileSystemContentBundle)
// ============================================

/**
 * Loads known subject bundles using (minimal) TS adapters — kept for compat.
 * Real usage has moved to getFileSystemContentBundle(slug) which is fully generic.
 *
 * For the official architecture (per 2026-06 declaration) use:
 *   - getFileSystemContentBundle(slug)  → returns FileSystemContentBundle from content/
 */
export async function loadAllContent(): Promise<Record<string, SubjectBundle>> {
  // For now synchronous under the hood; async for future FS or remote loads.
  const bundles: Record<string, SubjectBundle> = {
    "linear-algebra": getLinearAlgebraBundle(),
    // All other subjects (including auto-discovered) are served via the generic FS path.
  };
  return bundles;
}

/**
 * Convenience: fetch a single validated bundle by slug (SubjectBundle shape for compat).
 * Throws if unknown (in current impl).
 *
 * Primary code must use getFileSystemContentBundle(slug) for subjects that have content/ data.
 */
export async function getSubjectBundle(slug: string): Promise<SubjectBundle> {
  const all = await loadAllContent();
  const bundle = all[slug];
  if (!bundle) {
    throw new Error(`Unknown subject slug in content loader: ${slug}`);
  }
  return bundle;
}

// =============================================================================
// Section structure derivation (replaced the retired src/lib/modules/ tree)
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

/** Derive slim {topicId, sections[]} from content/ MDX (replaces src/lib/modules/ data).
 *  Uses the shared canonical extractor so section slugs are identical to validation and adapters.
 *
 *  Perf: uses moduleStructureCache (lifetime) + loadSlimModuleStructure (mdx-only, no questions.json).
 *  Previously this would call getFileSystemContentBundle (full load of ALL problems + mdx for the subject).
 *  Now safe to call for all 14+ subjects from dashboard without causing over-fetch of large questions files.
 *  (Bundle callers that need sections still get them from derive which is now light.)
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

/**
 * Lightweight helper specifically for the dashboard (and similar global aggregates).
 * Returns exactly the data needed for realData: topics (for list), problems (list of {id,topicId,section,...}
 * for getPracticeProgress + getSectionPracticeProgress which rely on stable IDs to compute solved/total
 * by intersecting with client progress state), and modules (slim sections for chapter expandables + per-sec mastery).
 *
 * Implementation:
 * - Uses loadSubjectFromContent(..., {includeMdxModules: false}) to avoid reading/parsing/storing all module.mdx
 *   when only problem IDs are required for progress math.
 * - Uses derive... for modules (which itself is now mdx-light + cached).
 * - Benefits from bundle cache (if a full bundle was loaded by a subject page, light requests get stripped instantly).
 *
 * This + the caches + slim derive is the fix for "Promise.all over 14 subjects, each full bundle + derive reparse".
 * Fidelity preserved 100%: same stable problem ids, same section slugs, full per-topic totals even for 0-progress subjects
 * (so UI shows correct "0 of N" and full chapter trees for every subject).
 *
 * Callers outside dashboard should prefer getFileSystemContentBundle for full (incl mdxSource for rendering).
 */
export async function getDashboardDataForSubject(slug: string): Promise<{
  topics: import("./schema").Topic[];
  problems: import("./schema").Problem[];
  modules: Array<{ topicId: string; sections: Array<{ title: string; section?: string }> }>;
}> {
  try {
    const [bundleLight, mods] = await Promise.all([
      loadSubjectFromContent(slug, { includeMdxModules: false }),
      deriveModuleStructureFromBundle(slug),
    ]);
    return {
      topics: bundleLight.topics,
      problems: bundleLight.problems,
      modules: mods,
    };
  } catch {
    return { topics: [], problems: [], modules: [] };
  }
}

/**
 * Back-compat helper (used by a few LA paths).
 * Implemented as thin wrapper over the FS loader (no more dual flag hacks).
 * Returns a minimal shape or null.
 */
export async function getOptionalLAContentBundle(): Promise<{ topics: import("./schema").Topic[]; problems: import("./schema").Problem[] } | null> {
  try {
    const b = await getFileSystemContentBundle("linear-algebra");
    if (b?.topics?.length) {
      return { topics: b.topics, problems: b.problems };
    }
    return null;
  } catch {
    return null;
  }
}
