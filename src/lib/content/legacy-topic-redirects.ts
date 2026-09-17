import "server-only";

type LegacyTopicRedirect = {
  chapterId: string;
  section: string;
  /**
   * Target subject, when a chapter has moved to a different subject entirely.
   * Omitted for the common case of a chapter merging into another within the
   * same subject. Without this, splitting a subject would 404 every indexed URL
   * of the chapters that moved.
   */
  subject?: string;
};

const cache = new Map<string, Record<string, LegacyTopicRedirect>>();

export async function getLegacyTopicRedirect(
  subjectSlug: string,
  topicId: string,
): Promise<LegacyTopicRedirect | null> {
  let map = cache.get(subjectSlug);
  if (!map) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "content",
      subjectSlug,
      "legacy-topic-redirects.json",
    );
    try {
      const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as Record<
        string,
        LegacyTopicRedirect
      >;
      map = raw;
      cache.set(subjectSlug, raw);
    } catch {
      map = {};
      cache.set(subjectSlug, map);
    }
  }
  return map[topicId] ?? null;
}
/**
 * Where a SECTION went, for subjects whose chapters were split.
 *
 * The chapter map answers "where did this chapter go?" and sends every visitor
 * to one landing section. That is wrong for a deep link: the old `source-coding`
 * chapter's sections are spread over four chapters now, so a request for one of
 * them should follow that section, not the chapter's landing point.
 *
 * Only ?section= links can be rescued. Module pages address sections with a
 * #fragment, which the browser never sends, so the server cannot see them.
 */
const sectionCache = new Map<string, Record<string, Record<string, string>>>();

export async function getLegacySectionRedirect(
  subjectSlug: string,
  topicId: string,
  section: string | undefined,
): Promise<string | null> {
  if (!section) return null;
  let map = sectionCache.get(subjectSlug);
  if (!map) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "content",
      subjectSlug,
      "legacy-section-redirects.json",
    );
    try {
      map = JSON.parse(await fs.readFile(filePath, "utf8")) as Record<
        string,
        Record<string, string>
      >;
    } catch {
      map = {};
    }
    sectionCache.set(subjectSlug, map);
  }
  return map[topicId]?.[section] ?? null;
}
