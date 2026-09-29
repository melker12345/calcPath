import "server-only";

import { getFileSystemContentBundle } from "@/lib/content/loader";
import { stripFrontmatterAndH1, toSlug } from "@/lib/content/mdx";
import type { ChapterSnapshot, QuestionSnapshot } from "@/lib/reports";

/**
 * Builds the content snapshot stored with a report, read from content/ on the
 * server at report time. Nothing here trusts client-supplied text.
 */

const SECTION_SOURCE_MAX = 4000;

type SectionBlock = { title: string; slug: string; source: string };

/**
 * Splits a module.mdx into its `##` sections with the same slug resolution as
 * extractMdxSections (explicit {#slug}, else <!-- section: --> lookahead, else
 * the slugified title). "Common Mistakes" headings are kept here so they can be
 * reported too.
 */
function splitSections(mdxSource: string): SectionBlock[] {
  const lines = stripFrontmatterAndH1(mdxSource).split(/\r?\n/);
  const blocks: SectionBlock[] = [];
  let current: SectionBlock | null = null;
  for (let i = 0; i < lines.length; i++) {
    const h2 = lines[i].trim().match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/i);
    if (h2) {
      if (current) blocks.push(current);
      const rawTitle = h2[1].trim();
      let slug = h2[2] || toSlug(rawTitle);
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const cm = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
        if (cm) {
          slug = cm[1];
          break;
        }
      }
      current = { title: rawTitle, slug, source: lines[i] };
      continue;
    }
    if (current) current.source += "\n" + lines[i];
  }
  if (current) blocks.push(current);
  return blocks;
}

export async function buildQuestionSnapshot(
  subject: string,
  topicId: string,
  questionId: string,
): Promise<QuestionSnapshot | null> {
  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subject);
  } catch {
    return null;
  }
  const topic = bundle.topics.find((t) => t.id === topicId);
  const q = bundle.problems.find((p) => p.id === questionId && p.topicId === topicId);
  if (!topic || !q) return null;

  const mdx = bundle.mdxModules.find((m) => m.topicId === topicId);
  const section = mdx ? splitSections(mdx.mdxSource).find((b) => b.slug === q.section) : undefined;

  return {
    kind: "question",
    subjectLabel: bundle.config.label,
    topicTitle: topic.title,
    sectionSlug: q.section,
    sectionTitle: section?.title ?? null,
    file: `content/${subject}/topics/${topicId}/questions.json`,
    question: {
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      prompt: q.prompt,
      ...(q.choices ? { choices: q.choices } : {}),
      answer: q.answer,
      explanation: q.explanation,
    },
  };
}

export async function buildChapterSnapshot(
  subject: string,
  topicId: string,
  section: string | null,
): Promise<ChapterSnapshot | null> {
  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subject);
  } catch {
    return null;
  }
  const topic = bundle.topics.find((t) => t.id === topicId);
  if (!topic) return null;

  const mdx = bundle.mdxModules.find((m) => m.topicId === topicId);
  const block = section && mdx ? splitSections(mdx.mdxSource).find((b) => b.slug === section) : undefined;
  const truncated = (block?.source.length ?? 0) > SECTION_SOURCE_MAX;

  return {
    kind: "chapter",
    subjectLabel: bundle.config.label,
    topicTitle: topic.title,
    sectionSlug: section,
    sectionTitle: block?.title ?? null,
    file: `content/${subject}/topics/${topicId}/module.mdx`,
    sectionSource: block ? block.source.slice(0, SECTION_SOURCE_MAX) : null,
    sectionSourceTruncated: truncated,
  };
}
