/**
 * Problem Set Loader (server-only)
 *
 * Loads and validates content/{slug}/topics/{topicId}/problemset.json — the
 * printable chapter test.
 *
 * Auto-discovery, exactly like questions.json and module.mdx: a chapter has a
 * chapter test if and only if this file is on disk. There is no per-subject
 * flag to remember to flip (the old `hasTests` on the subject index was the
 * wrong granularity — tests are per chapter, not per subject), and no code
 * change is needed to give a new subject tests. Drop the file in, and the
 * route, the link and the validator all pick it up.
 *
 * Follows the idiom of loader.ts / diagnostic-loader.ts: `server-only`,
 * dynamic fs import so nothing leaks into a client bundle, Zod-validated reads.
 */

import "server-only";

import { ProblemSetFileSchema, type ProblemSetFile } from "./schema";

const CONTENT_DIR = "content";

function problemSetPath(slug: string, topicId: string): string {
  return `${CONTENT_DIR}/${slug}/topics/${topicId}/problemset.json`;
}

/**
 * Load and validate one topic's problem set.
 * Returns null when the topic ships no problemset.json (the common case), and
 * also when the file is present but invalid — a broken sheet must not 500 the
 * chapter around it. Invalid files are loud in `npm run content:problemsets`,
 * which is the gate that keeps them out of the repo in the first place.
 */
export async function loadProblemSet(
  slug: string,
  topicId: string
): Promise<ProblemSetFile | null> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), problemSetPath(slug, topicId));

  let raw: string;
  try {
    raw = await fs.readFile(fullPath, "utf-8");
  } catch {
    return null;
  }

  try {
    return ProblemSetFileSchema.parse(JSON.parse(raw));
  } catch (err) {
    console.warn(
      `[problemset-loader] ${problemSetPath(slug, topicId)} failed validation:`,
      (err as Error).message
    );
    return null;
  }
}

/** Returns true when content/{slug}/topics/{topicId}/problemset.json exists. */
export async function hasProblemSet(slug: string, topicId: string): Promise<boolean> {
  const fs = await import("fs/promises");
  const path = await import("path");
  try {
    await fs.access(path.join(process.cwd(), problemSetPath(slug, topicId)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Every topic id in a subject that ships a problem set, in `topics/` scan order.
 * Used to decide which chapters advertise a chapter test.
 */
export async function listTopicsWithProblemSets(slug: string): Promise<string[]> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const topicsDir = path.join(process.cwd(), CONTENT_DIR, slug, "topics");

  let dirents;
  try {
    dirents = await fs.readdir(topicsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const found: string[] = [];
  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    if (await hasProblemSet(slug, d.name)) found.push(d.name);
  }
  return found;
}

/**
 * Total expected working time for a sheet, in minutes.
 * Printed on the header so a learner knows what they are sitting down to.
 */
export function problemSetMinutes(set: ProblemSetFile): number {
  return set.problems.reduce((total, p) => total + p.minutes, 0);
}

/** One row of the site-wide problem-set catalogue (see /problem-sets). */
export type ProblemSetListing = {
  subjectSlug: string;
  subjectLabel: string;
  topicId: string;
  /** Sheet title from problemset.json, e.g. "Limits & Continuity". */
  title: string;
  problemCount: number;
  minutes: number;
};

/**
 * Every problem set on the site, grouped by subject in subject `order`, with
 * chapters in the subject's own topic order. A subject with no sheets is
 * omitted, so the catalogue never advertises an empty subject.
 */
export async function listAllProblemSets(): Promise<
  Array<{ subjectSlug: string; subjectLabel: string; sets: ProblemSetListing[] }>
> {
  const { getAvailableSubjectConfigs } = await import("./loader");
  const subjects = await getAvailableSubjectConfigs();

  const groups: Array<{ subjectSlug: string; subjectLabel: string; sets: ProblemSetListing[] }> = [];
  for (const subject of subjects) {
    const topicIds = await listTopicsWithProblemSets(subject.slug);
    if (topicIds.length === 0) continue;

    // Order by the subject's topic list; anything unlisted sorts to the end.
    const position = new Map(subject.topics.map((t, i) => [t.id, i]));
    topicIds.sort((a, b) => (position.get(a) ?? Infinity) - (position.get(b) ?? Infinity));

    const sets: ProblemSetListing[] = [];
    for (const topicId of topicIds) {
      const set = await loadProblemSet(subject.slug, topicId);
      if (!set) continue;
      sets.push({
        subjectSlug: subject.slug,
        subjectLabel: subject.label,
        topicId,
        title: set.title,
        problemCount: set.problems.length,
        minutes: problemSetMinutes(set),
      });
    }
    if (sets.length > 0) {
      groups.push({ subjectSlug: subject.slug, subjectLabel: subject.label, sets });
    }
  }
  return groups;
}
