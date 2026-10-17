import "server-only";

import { getFileSystemContentBundle } from "@/lib/content/loader";
import { stripFrontmatterAndH1, toSlug } from "@/lib/content/mdx";
import type { QuestionSnapshot, ReportData } from "@/lib/reports";

/**
 * Builds the report data for one chapter from content/ at build time: every
 * snapshot a report against it can store. It is published as a static file the
 * feedback worker reads (worker/index.ts), so nothing a report stores comes
 * from client-supplied text, and nothing reads content/ at request time.
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

export async function buildReportData(subject: string, topicId: string): Promise<ReportData | null> {
  const bundle = await getFileSystemContentBundle(subject);
  const topic = bundle.topics.find((t) => t.id === topicId);
  if (!topic) return null;

  const mdx = bundle.mdxModules.find((m) => m.topicId === topicId);
  const blocks = mdx ? splitSections(mdx.mdxSource) : [];
  const sections: ReportData["sections"] = {};
  for (const b of blocks) {
    sections[b.slug] ??= {
      title: b.title,
      source: b.source.slice(0, SECTION_SOURCE_MAX),
      truncated: b.source.length > SECTION_SOURCE_MAX,
    };
  }

  const questions: Record<string, QuestionSnapshot> = {};
  for (const q of bundle.problems) {
    if (q.topicId !== topicId) continue;
    questions[q.id] = {
      kind: "question",
      subjectLabel: bundle.config.label,
      topicTitle: topic.title,
      sectionSlug: q.section,
      sectionTitle: sections[q.section]?.title ?? null,
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

  return {
    subjectLabel: bundle.config.label,
    topicTitle: topic.title,
    file: `content/${subject}/topics/${topicId}/module.mdx`,
    sections,
    questions,
  };
}
