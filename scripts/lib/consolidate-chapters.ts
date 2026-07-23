import fs from "fs/promises";
import path from "path";

export type ChapterPlan = {
  id: string;
  title: string;
  description: string;
  order: number;
  topicIds: string[];
};

function stripFrontmatterAndH1(source: string): string {
  let s = source.replace(/^---\s*[\s\S]*?---\s*\r?\n?/, "").trim();
  s = s.replace(/^#\s+[^\n]+\n?/, "").trim();
  return s;
}

function primarySectionSlug(mdx: string, questions: Array<{ section: string }>): string {
  const fromMdx = mdx.match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i)?.[1];
  if (fromMdx) return fromMdx;
  if (questions[0]?.section) return questions[0].section;
  throw new Error("Could not resolve section slug");
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

export async function consolidateSubjectChapters(
  root: string,
  subject: string,
  chapters: ChapterPlan[],
): Promise<void> {
  const topicsDir = path.join(root, "content", subject, "topics");

  const allOldIds = new Set(
    (await fs.readdir(topicsDir)).filter((name) => !name.startsWith(".")),
  );
  const mappedOldIds = new Set(chapters.flatMap((c) => c.topicIds));
  for (const id of allOldIds) {
    if (!mappedOldIds.has(id)) {
      throw new Error(`${subject}: unmapped topic folder: ${id}`);
    }
  }

  const legacyRedirects: Record<string, { chapterId: string; section: string }> = {};
  const newIndexTopics: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    estimatedMinutes: number;
  }> = [];

  const stagingDir = path.join(root, "content", subject, "topics-next");
  await fs.rm(stagingDir, { recursive: true, force: true });
  await fs.mkdir(stagingDir, { recursive: true });

  for (const chapter of chapters) {
    const sectionBodies: string[] = [];
    const mergedQuestions: Array<Record<string, unknown>> = [];
    let estimatedMinutes = 0;

    for (const oldId of chapter.topicIds) {
      const oldDir = path.join(topicsDir, oldId);
      const meta = await readJson<{ title: string; estimatedMinutes?: number }>(
        path.join(oldDir, "index.json"),
      );
      estimatedMinutes += meta.estimatedMinutes ?? 20;

      const mdx = await fs.readFile(path.join(oldDir, "module.mdx"), "utf8");
      const questions = await readJson<Array<{ section: string }>>(
        path.join(oldDir, "questions.json"),
      );
      const section = primarySectionSlug(mdx, questions);
      legacyRedirects[oldId] = { chapterId: chapter.id, section };

      const body = stripFrontmatterAndH1(mdx).trim();
      sectionBodies.push(body);

      for (const q of questions as Array<Record<string, unknown>>) {
        mergedQuestions.push({ ...q, topicId: chapter.id });
      }
    }

    const chapterDir = path.join(stagingDir, chapter.id);
    await fs.mkdir(chapterDir, { recursive: true });

    const moduleSource = `---\ntitle: ${chapter.title}\n---\n\n# ${chapter.title}\n\n${chapter.description}\n\n${sectionBodies.join("\n\n")}\n`;
    await fs.writeFile(path.join(chapterDir, "module.mdx"), moduleSource);
    await fs.writeFile(
      path.join(chapterDir, "index.json"),
      JSON.stringify(
        {
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          order: chapter.order,
          estimatedMinutes,
        },
        null,
        2,
      ) + "\n",
    );
    await fs.writeFile(
      path.join(chapterDir, "questions.json"),
      JSON.stringify(mergedQuestions, null, 2) + "\n",
    );

    newIndexTopics.push({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      estimatedMinutes,
    });
  }

  for (const oldId of mappedOldIds) {
    await fs.rm(path.join(topicsDir, oldId), { recursive: true, force: true });
  }

  for (const chapter of chapters) {
    const from = path.join(stagingDir, chapter.id);
    const to = path.join(topicsDir, chapter.id);
    await fs.rename(from, to);
  }
  await fs.rmdir(stagingDir);

  const indexPath = path.join(root, "content", subject, "index.json");
  const index = await readJson<Record<string, unknown>>(indexPath);
  index.topics = newIndexTopics;
  index.modulesDescription = `Read the ${subject} chapters in order, or jump directly to the topic you need.`;
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + "\n");

  await fs.writeFile(
    path.join(root, "content", subject, "legacy-topic-redirects.json"),
    JSON.stringify(legacyRedirects, null, 2) + "\n",
  );

  console.log(
    `${subject}: consolidated ${mappedOldIds.size} micro-topics into ${chapters.length} chapters.`,
  );
}