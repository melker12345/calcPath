/**
 * Loading one chapter for its page: the subject index for the chapter number
 * and the previous/next links, the module.mdx source, and whether a printable
 * problem set exists. Everything the page needs and nothing else — in
 * particular no questions.json, which the chapter page never shows.
 */

import "server-only";

import { getAvailableSubjectConfigs, loadSubjectIndex } from "./loader";
import { hasProblemSet } from "./problemset-loader";
import { collectStatementTitles, normalizeTitle } from "./crossrefs";
import { renderChapter, type ExternalRefs, type RenderedChapter } from "./render-chapter";
import type { Topic } from "./schema";

export type Chapter = {
  subject: { slug: string; label: string };
  topic: Topic;
  /** 1-based position in the subject's reading order. */
  number: number;
  prev: Topic | null;
  next: Topic | null;
  hasProblemSet: boolean;
  rendered: RenderedChapter;
};

function modulePath(slug: string, topicId: string): string {
  return `content/${slug}/topics/${topicId}/module.mdx`;
}

async function readModuleSource(slug: string, topicId: string): Promise<string | null> {
  const fs = await import("fs/promises");
  const path = await import("path");
  try {
    return await fs.readFile(path.join(process.cwd(), modulePath(slug, topicId)), "utf-8");
  } catch {
    return null;
  }
}

/**
 * Statement titles of every other chapter in the subject, so that "the theorem
 * *Heine–Borel* of *Limits and Continuity*" links across chapters. A title
 * used by two chapters resolves to the earlier one in reading order.
 */
async function loadExternalRefs(slug: string, topics: Topic[], current: string): Promise<ExternalRefs> {
  const refs: ExternalRefs = new Map();
  for (const topic of topics) {
    if (topic.id === current) continue;
    const source = await readModuleSource(slug, topic.id);
    if (!source) continue;
    for (const statement of collectStatementTitles(source)) {
      if (statement.kind === "figure") continue;
      const key = normalizeTitle(statement.title);
      if (refs.has(key)) continue;
      const label = statement.kind.charAt(0).toUpperCase() + statement.kind.slice(1);
      refs.set(key, { href: `/${slug}/modules/${topic.id}#${statement.id}`, label: `${label}, ${topic.title}` });
    }
  }
  return refs;
}

export async function loadChapter(slug: string, topicId: string): Promise<Chapter | null> {
  let index;
  try {
    index = await loadSubjectIndex(slug);
  } catch {
    return null;
  }
  const topics = [...index.topics].sort((a, b) => a.order - b.order);
  const position = topics.findIndex((t) => t.id === topicId);
  if (position === -1) return null;

  const source = await readModuleSource(slug, topicId);
  if (!source || !source.trim()) return null;

  return {
    subject: { slug: index.slug, label: index.label },
    topic: topics[position],
    number: position + 1,
    prev: position > 0 ? topics[position - 1] : null,
    next: position < topics.length - 1 ? topics[position + 1] : null,
    hasProblemSet: await hasProblemSet(slug, topicId),
    rendered: renderChapter(source, position + 1, await loadExternalRefs(slug, topics, topicId)),
  };
}

/** Every chapter that has a module.mdx, for static generation. */
export async function listChapterParams(): Promise<Array<{ subject: string; topicId: string }>> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const params: Array<{ subject: string; topicId: string }> = [];
  for (const subject of await getAvailableSubjectConfigs()) {
    const index = await loadSubjectIndex(subject.slug);
    for (const topic of index.topics) {
      try {
        await fs.access(path.join(process.cwd(), modulePath(subject.slug, topic.id)));
        params.push({ subject: subject.slug, topicId: topic.id });
      } catch {
        // A topic listed in index.json without a chapter yet has no page.
      }
    }
  }
  return params;
}
