/**
 * Loading one chapter for its page: the subject index for the chapter number
 * and the previous/next links, the module.mdx source, and whether a printable
 * problem set exists. Everything the page needs and nothing else — in
 * particular no questions.json, which the chapter page never shows.
 */

import "server-only";

import { getAvailableSubjectConfigs, loadSubjectIndex } from "./loader";
import { hasProblemSet } from "./problemset-loader";
import { renderChapter, type RenderedChapter } from "./render-chapter";
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
    rendered: renderChapter(source, position + 1),
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
