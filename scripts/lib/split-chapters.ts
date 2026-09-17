import fs from "fs/promises";
import path from "path";

/**
 * The inverse of consolidate-chapters.ts.
 *
 * Consolidation turned many micro-topics into a few chapters by concatenating
 * them. That went too far in places: a chapter carrying 25 sections is not a
 * chapter, it is six of them with the staples pulled out. This splits a subject
 * back into chapters of a readable size, driven by an explicit plan that names,
 * for each new chapter, the section slugs it takes and the order they read in.
 *
 * Section slugs are the join key to the question banks, so they are carried
 * across untouched — a question follows its section into whichever chapter that
 * section lands in. Nothing is rewritten; prose moves verbatim.
 */

export type SplitChapterPlan = {
  id: string;
  title: string;
  description: string;
  order: number;
  /**
   * Sections to take, in reading order, each as `old-topic-id/section-slug`.
   * Slugs are only unique within a chapter — `definition`, `applications` and
   * `statement` all recur across the subject — so the source chapter is part of
   * the address.
   */
  sections: string[];
};

type Block =
  | { kind: "section"; slug: string; text: string }
  | { kind: "mistakes"; text: string };

const SECTION_MARKER = /<!--\s*section:\s*([a-z0-9-]+)\s*-->/i;

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\$[^$]*\$/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripFrontmatterAndH1(source: string): string {
  let s = source.replace(/^---\s*[\s\S]*?---\s*\r?\n?/, "").trim();
  s = s.replace(/^#\s+[^\n]+\n?/, "").trim();
  return s;
}

/**
 * Cut a module into its preamble and its `##` blocks, keeping each block's text
 * exactly as written (heading line included) so nothing is reflowed on the way.
 * Slug resolution mirrors src/lib/content/mdx.ts, which is the canonical parser.
 */
function parseModule(source: string): { preamble: string; blocks: Block[] } {
  const body = stripFrontmatterAndH1(source);
  const lines = body.split(/\r?\n/);
  const starts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) starts.push(i);
  }
  const preamble = (starts.length ? lines.slice(0, starts[0]) : lines).join("\n").trim();

  const blocks: Block[] = [];
  for (let s = 0; s < starts.length; s++) {
    const from = starts[s];
    const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const text = lines.slice(from, to).join("\n").replace(/\s+$/, "");
    const heading = lines[from].match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/);
    const rawTitle = heading?.[1]?.trim() ?? "";
    if (rawTitle.toLowerCase().includes("common mistake")) {
      blocks.push({ kind: "mistakes", text });
      continue;
    }
    let slug = heading?.[2] || toSlug(rawTitle);
    for (let j = from + 1; j < Math.min(from + 5, to); j++) {
      const marker = lines[j].match(SECTION_MARKER);
      if (marker) {
        slug = marker[1];
        break;
      }
    }
    blocks.push({ kind: "section", slug, text });
  }
  return { preamble, blocks };
}

/** The bullets of a Common Mistakes block, without its heading. */
function mistakeBody(text: string): string {
  return text.replace(/^##\s+[^\n]*\n?/, "").trim();
}

export async function splitSubjectChapters(
  root: string,
  subject: string,
  chapters: SplitChapterPlan[],
  /**
   * Where an old chapter id should land, when the default — the chapter that
   * took its opening section — is not the one a reader means. `source-coding`
   * opens with the AEP, which moves to the entropy-rates chapter, but someone
   * following that link wants the source coding theorem.
   */
  redirectOverrides: Record<string, { chapterId: string; section: string }> = {}
): Promise<void> {
  const subjectDir = path.join(root, "content", subject);
  const topicsDir = path.join(subjectDir, "topics");
  const oldIds = (await fs.readdir(topicsDir)).filter((n) => !n.startsWith(".")).sort();

  // Index every section of every existing chapter by its slug.
  const sectionText = new Map<string, string>();
  const sectionOwner = new Map<string, string>();
  const questionsBySection = new Map<string, Array<Record<string, unknown>>>();
  const mistakesByOwner = new Map<string, string[]>();
  const preambleByOwner = new Map<string, string>();
  const firstSectionByOwner = new Map<string, string>();
  const minutesPerSection = new Map<string, number>();

  for (const oldId of oldIds) {
    const dir = path.join(topicsDir, oldId);
    const mdx = await fs.readFile(path.join(dir, "module.mdx"), "utf8");
    const { preamble, blocks } = parseModule(mdx);
    preambleByOwner.set(oldId, preamble);

    const owned: string[] = [];
    for (const block of blocks) {
      if (block.kind === "mistakes") {
        const list = mistakesByOwner.get(oldId) ?? [];
        list.push(mistakeBody(block.text));
        mistakesByOwner.set(oldId, list);
        continue;
      }
      const key = `${oldId}/${block.slug}`;
      if (sectionText.has(key)) {
        throw new Error(`${subject}: duplicate section slug "${block.slug}" within ${oldId}`);
      }
      sectionText.set(key, block.text);
      sectionOwner.set(key, oldId);
      owned.push(key);
    }
    if (owned.length) firstSectionByOwner.set(oldId, owned[0]);

    let minutes = 20;
    try {
      const meta = JSON.parse(await fs.readFile(path.join(dir, "index.json"), "utf8"));
      minutes = meta.estimatedMinutes ?? 20;
    } catch {
      /* subject-level index carries the metadata instead */
    }
    const share = owned.length ? Math.round(minutes / owned.length) : 0;
    for (const slug of owned) minutesPerSection.set(slug, share);

    const questions = JSON.parse(
      await fs.readFile(path.join(dir, "questions.json"), "utf8")
    ) as Array<Record<string, unknown>>;
    for (const q of questions) {
      const key = `${oldId}/${String(q.section ?? "")}`;
      const list = questionsBySection.get(key) ?? [];
      list.push(q);
      questionsBySection.set(key, list);
    }
  }

  // Every section must be claimed exactly once, or the split silently drops
  // content and the questions pointing at it.
  const claimed = new Map<string, string>();
  for (const chapter of chapters) {
    // Within one new chapter the bare slugs must still be unique, or questions
    // and ?section= links cannot tell the two sections apart.
    const bare = new Map<string, string>();
    for (const key of chapter.sections) {
      if (!sectionText.has(key)) {
        throw new Error(`${subject}/${chapter.id}: no such section "${key}"`);
      }
      const already = claimed.get(key);
      if (already) {
        throw new Error(`${subject}: section "${key}" claimed by both ${already} and ${chapter.id}`);
      }
      claimed.set(key, chapter.id);
      const slug = key.split("/").slice(1).join("/");
      const clash = bare.get(slug);
      if (clash) {
        throw new Error(
          `${subject}/${chapter.id}: sections "${clash}" and "${key}" would both be "${slug}"`
        );
      }
      bare.set(slug, key);
    }
  }
  const unclaimed = [...sectionText.keys()].filter((s) => !claimed.has(s));
  if (unclaimed.length) {
    throw new Error(`${subject}: ${unclaimed.length} section(s) unclaimed: ${unclaimed.join(", ")}`);
  }
  const strandedQuestionSections = [...questionsBySection.keys()].filter(
    (s) => s && !claimed.has(s)
  );
  if (strandedQuestionSections.length) {
    throw new Error(
      `${subject}: questions point at unknown section(s): ${strandedQuestionSections.join(", ")}`
    );
  }

  const staging = path.join(subjectDir, "topics-next");
  await fs.rm(staging, { recursive: true, force: true });
  await fs.mkdir(staging, { recursive: true });

  const indexTopics: Array<Record<string, unknown>> = [];
  const redirects: Record<string, { chapterId: string; section: string }> = {};

  for (const chapter of chapters) {
    const bodies: string[] = [];
    const chapterQuestions: Array<Record<string, unknown>> = [];
    const mistakes: string[] = [];
    const seenOwners = new Set<string>();
    let minutes = 0;

    for (const key of chapter.sections) {
      bodies.push(sectionText.get(key)!);
      minutes += minutesPerSection.get(key) ?? 0;
      for (const q of questionsBySection.get(key) ?? []) {
        chapterQuestions.push({ ...q, topicId: chapter.id });
      }
      // A chapter inherits the Common Mistakes of every old chapter it draws
      // from, merged into the single list at its end.
      const owner = sectionOwner.get(key)!;
      if (!seenOwners.has(owner)) {
        seenOwners.add(owner);
        for (const m of mistakesByOwner.get(owner) ?? []) mistakes.push(m);
      }
    }

    const merged = [...new Set(mistakes)].filter(Boolean);
    const mistakesBlock = merged.length ? `\n\n## Common Mistakes\n\n${merged.join("\n\n")}` : "";
    const moduleSource =
      `---\ntitle: ${chapter.title}\n---\n\n# ${chapter.title}\n\n${chapter.description}\n\n` +
      `${bodies.join("\n\n")}${mistakesBlock}\n`;

    const dir = path.join(staging, chapter.id);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "module.mdx"), moduleSource);
    await fs.writeFile(
      path.join(dir, "questions.json"),
      JSON.stringify(chapterQuestions, null, 2) + "\n"
    );
    const meta = {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      estimatedMinutes: Math.max(20, minutes),
    };
    await fs.writeFile(path.join(dir, "index.json"), JSON.stringify(meta, null, 2) + "\n");
    indexTopics.push(meta);
  }

  // Old chapter URLs keep working: each lands on the chapter that took its
  // opening section, at that section.
  for (const oldId of oldIds) {
    const first = firstSectionByOwner.get(oldId);
    if (!first) continue;
    redirects[oldId] = {
      chapterId: claimed.get(first)!,
      section: first.split("/").slice(1).join("/"),
    };
  }
  const redirectPath = path.join(subjectDir, "legacy-topic-redirects.json");
  let existing: Record<string, { chapterId: string; section: string }> = {};
  try {
    existing = JSON.parse(await fs.readFile(redirectPath, "utf8"));
  } catch {
    /* first split for this subject */
  }
  // An older redirect must follow its target through this split too.
  for (const [oldId, target] of Object.entries(existing)) {
    const landing = claimed.get(`${target.chapterId}/${target.section}`);
    redirects[oldId] = landing
      ? { chapterId: landing, section: target.section }
      : redirects[oldId] ?? target;
  }

  for (const [oldId, target] of Object.entries(redirectOverrides)) {
    // Sections are addressed by their source chapter, so check that some claimed
    // section with this slug really did land in the chapter named.
    const landed = [...claimed.entries()].some(
      ([key, chapterId]) =>
        chapterId === target.chapterId && key.split("/").slice(1).join("/") === target.section
    );
    if (!landed) {
      throw new Error(
        `${subject}: redirect override for "${oldId}" names no section "${target.section}" in ${target.chapterId}`
      );
    }
    redirects[oldId] = target;
  }

  // A redirect is consulted before the chapter itself (see the module route), so
  // an entry whose key is now a live chapter id would permanently redirect that
  // chapter's own canonical URL to one of its sections. Live chapters win.
  for (const chapter of chapters) {
    delete redirects[chapter.id];
  }

  for (const oldId of oldIds) {
    await fs.rm(path.join(topicsDir, oldId), { recursive: true, force: true });
  }
  for (const chapter of chapters) {
    await fs.rename(path.join(staging, chapter.id), path.join(topicsDir, chapter.id));
  }
  await fs.rmdir(staging);

  const indexPath = path.join(subjectDir, "index.json");
  const index = JSON.parse(await fs.readFile(indexPath, "utf8")) as Record<string, unknown>;
  index.topics = indexTopics;
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + "\n");
  await fs.writeFile(redirectPath, JSON.stringify(redirects, null, 2) + "\n");

  const totalSections = chapters.reduce((sum, c) => sum + c.sections.length, 0);
  console.log(
    `${subject}: ${oldIds.length} chapters -> ${chapters.length}, ${totalSections} sections re-homed, ${Object.keys(redirects).length} redirects written.`
  );
}
