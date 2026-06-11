#!/usr/bin/env node
/**
 * One-time migration: collapse precalculus micro-topics into course-style chapters.
 * Run: npx tsx scripts/consolidate-precalculus-chapters.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SUBJECT = "precalculus";
const TOPICS_DIR = path.join(ROOT, "content", SUBJECT, "topics");

const CHAPTERS = [
  {
    id: "functions-and-graphs",
    title: "Functions & Graphs",
    description:
      "Function notation, domain and range, symmetry, inverses, composition, transformations, and piecewise definitions.",
    order: 1,
    topicIds: [
      "function-mathematics",
      "domain-of-a-function",
      "range-mathematics",
      "even-and-odd-functions",
      "inverse-function",
      "function-composition",
      "transformation-of-functions",
      "piecewise-function",
    ],
  },
  {
    id: "polynomial-rational-functions",
    title: "Polynomial & Rational Functions",
    description:
      "Polynomial behavior, zeros and roots, rational functions, asymptotes, and partial fractions.",
    order: 2,
    topicIds: [
      "polynomial",
      "root-of-a-function",
      "rational-function",
      "asymptote",
      "partial-fraction-decomposition",
    ],
  },
  {
    id: "exponential-logarithmic-functions",
    title: "Exponential & Logarithmic Functions",
    description:
      "Exponential and logarithmic rules, the natural log, logarithmic scales, and growth models.",
    order: 3,
    topicIds: [
      "exponential-function",
      "logarithm",
      "natural-logarithm",
      "logarithmic-scale",
      "exponential-growth",
    ],
  },
  {
    id: "trigonometric-functions",
    title: "Trigonometric Functions",
    description:
      "Sine, cosine, tangent, the unit circle, and core trigonometric identities.",
    order: 4,
    topicIds: [
      "trigonometric-functions-overview",
      "sine",
      "cosine",
      "tangent",
      "unit-circle",
      "trigonometric-identity",
    ],
  },
  {
    id: "analytic-trigonometry",
    title: "Analytic Trigonometry",
    description:
      "Angle formulas, laws of sines and cosines, inverse trig, equations, and substitution preview.",
    order: 5,
    topicIds: [
      "double-angle-formula",
      "half-angle-formula",
      "sum-to-product-identity",
      "sum-and-difference-formulas",
      "law-of-sines",
      "law-of-cosines",
      "inverse-trigonometric-functions",
      "trigonometric-equation",
      "trigonometric-substitution",
    ],
  },
  {
    id: "systems-and-matrices",
    title: "Systems & Matrices",
    description:
      "Linear systems, matrix arithmetic, determinants, inverses, and Gaussian elimination.",
    order: 6,
    topicIds: [
      "system-of-linear-equations",
      "matrix-mathematics",
      "determinant",
      "inverse-matrix",
      "matrix-multiplication",
      "gaussian-elimination",
    ],
  },
  {
    id: "complex-and-polar",
    title: "Complex Numbers & Polar Coordinates",
    description:
      "Complex arithmetic, the complex plane, polar form, De Moivre's theorem, polar and parametric curves.",
    order: 7,
    topicIds: [
      "complex-number",
      "complex-plane",
      "polar-form-of-complex-numbers",
      "de-moivres-theorem",
      "polar-coordinates",
      "parametric-equation",
    ],
  },
  {
    id: "sequences-series-conics",
    title: "Sequences, Series & Conics",
    description:
      "Sequences, arithmetic and geometric progressions, the binomial theorem, and conic sections.",
    order: 8,
    topicIds: [
      "sequence",
      "arithmetic-progression",
      "geometric-progression",
      "binomial-theorem",
      "conic-section",
    ],
  },
  {
    id: "introduction-to-limits",
    title: "Introduction to Limits",
    description:
      "Limit notation and intuition as a bridge from precalculus into calculus.",
    order: 9,
    topicIds: ["limit-mathematics"],
  },
];

function stripFrontmatterAndH1(source: string): string {
  let s = source.replace(/^---\s*[\s\S]*?---\s*\r?\n?/, "").trim();
  s = s.replace(/^#\s+[^\n]+\n?/, "").trim();
  return s;
}

function demoteHeadings(body: string): string {
  return body.replace(/^## /gm, "### ");
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

async function main() {
  const allOldIds = new Set(
    (await fs.readdir(TOPICS_DIR)).filter((name) => !name.startsWith(".")),
  );
  const mappedOldIds = new Set(CHAPTERS.flatMap((c) => c.topicIds));
  for (const id of allOldIds) {
    if (!mappedOldIds.has(id)) {
      throw new Error(`Unmapped topic folder: ${id}`);
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

  const stagingDir = path.join(ROOT, "content", SUBJECT, "topics-next");
  await fs.rm(stagingDir, { recursive: true, force: true });
  await fs.mkdir(stagingDir, { recursive: true });

  for (const chapter of CHAPTERS) {
    const sectionBodies: string[] = [];
    const mergedQuestions: Array<Record<string, unknown>> = [];
    let estimatedMinutes = 0;

    for (const oldId of chapter.topicIds) {
      const oldDir = path.join(TOPICS_DIR, oldId);
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

      let body = stripFrontmatterAndH1(mdx)
        .replace(/<!--\s*section:\s*[a-z0-9-]+\s*-->\s*/gi, "")
        .trim();
      body = demoteHeadings(body);

      sectionBodies.push(
        `## ${meta.title}\n\n<!-- section: ${section} -->\n\n${body}`,
      );

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
    await fs.rm(path.join(TOPICS_DIR, oldId), { recursive: true, force: true });
  }

  for (const chapter of CHAPTERS) {
    const from = path.join(stagingDir, chapter.id);
    const to = path.join(TOPICS_DIR, chapter.id);
    await fs.rename(from, to);
  }
  await fs.rmdir(stagingDir);

  const indexPath = path.join(ROOT, "content", SUBJECT, "index.json");
  const index = await readJson<Record<string, unknown>>(indexPath);
  index.topics = newIndexTopics;
  index.modulesDescription =
    "Read the precalculus chapters in order, or jump directly to the topic you need.";
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + "\n");

  await fs.writeFile(
    path.join(ROOT, "content", SUBJECT, "legacy-topic-redirects.json"),
    JSON.stringify(legacyRedirects, null, 2) + "\n",
  );

  console.log(
    `Consolidated ${mappedOldIds.size} micro-topics into ${CHAPTERS.length} chapters.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});