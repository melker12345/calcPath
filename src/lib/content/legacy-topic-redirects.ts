import "server-only";

type LegacyTopicRedirect = {
  chapterId: string;
  section: string;
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