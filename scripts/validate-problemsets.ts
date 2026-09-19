#!/usr/bin/env node
/**
 * content:problemsets
 * Run with: npx tsx scripts/validate-problemsets.ts
 *
 * The gate for content/{subject}/topics/{topic}/problemset.json — the printable
 * chapter tests. A problem sheet is printed and worked by hand, so a mistake in
 * one is expensive in a way an on-screen typo is not: the learner has already
 * spent twenty minutes on it before they find out.
 *
 * Checks:
 *  - The file parses and validates against ProblemSetFileSchema.
 *  - topicId matches the folder, and the topic is declared in the subject index.
 *  - Every problem.section exactly matches a section slug derived from the
 *    topic's module.mdx — the same hard requirement questions.json carries, via
 *    the same canonical extractor, so a sheet cannot drift from its chapter.
 *  - Problem ids are unique across the whole corpus, and never collide with a
 *    practice question id (the question registry is global and keyed by id).
 *  - Every LaTeX fragment in every prompt, part and solution renders under
 *    KaTeX, exactly as scripts/validate-latex.ts checks the rest of content/.
 *
 * Warnings (authoring guidance, not failures):
 *  - A sheet of nothing but "computation" wastes the format — paper is what
 *    finally allows proof / sketch / critique.
 *  - Difficulty that jumps backwards, since sheets are meant to run easy → hard.
 *  - A sheet that draws on only one or two sections of its chapter.
 *
 * Exits 1 on any error.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import katex from "katex";

import { ProblemSetFileSchema, QuestionFileSchema } from "../src/lib/content/schema";
import type { ProblemSetFile, ProblemSetProblem } from "../src/lib/content/schema";
import { extractMdxSectionSlugs } from "../src/lib/content/mdx";
import { normalizeMathText } from "../src/lib/math-text-normalize";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");

/** Same matcher <MathText> and validate-latex.ts use. */
const MATH_RE = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;

const DIFFICULTY_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

async function exists(p: string): Promise<boolean> {
  return fs
    .access(p)
    .then(() => true)
    .catch(() => false);
}

/** Render every $…$ / $$…$$ fragment in a string; returns the KaTeX errors. */
function latexErrors(text: string): string[] {
  const out: string[] = [];
  const normalized = normalizeMathText(text);
  MATH_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MATH_RE.exec(normalized)) !== null) {
    const display = m[0].startsWith("$$");
    const value = (display ? m[2] : m[3]) ?? "";
    try {
      katex.renderToString(value, { throwOnError: true, strict: false, displayMode: display });
    } catch (e) {
      const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
      out.push(`${JSON.stringify(value)} -> ${msg}`);
    }
  }
  return out;
}

/** Every authored string on one problem, with a label for the error message. */
function authoredStrings(problem: ProblemSetProblem): Array<[string, string]> {
  const fields: Array<[string, string]> = [
    ["prompt", problem.prompt],
    ["solution", problem.solution],
  ];
  (problem.parts ?? []).forEach((part, i) => {
    fields.push([`parts[${i}]`, part]);
  });
  return fields;
}

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  /** problem-set id -> where it was first seen. Corpus-wide. */
  const seenIds = new Map<string, string>();
  /** Practice question ids, so a sheet can never reuse one. */
  const practiceIds = new Set<string>();

  let subjectSlugs: string[] = [];
  try {
    const dirents = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    subjectSlugs = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    console.error("Cannot read content/ dir");
    process.exit(1);
  }

  // Pass 1: collect every practice question id in the corpus.
  for (const slug of subjectSlugs) {
    const topicsDir = path.join(CONTENT_DIR, slug, "topics");
    let topicDirs: string[] = [];
    try {
      const entries = await fs.readdir(topicsDir, { withFileTypes: true });
      topicDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }
    for (const tid of topicDirs) {
      const qpath = path.join(topicsDir, tid, "questions.json");
      if (!(await exists(qpath))) continue;
      try {
        const raw = JSON.parse(await fs.readFile(qpath, "utf8"));
        for (const item of Array.isArray(raw) ? raw : []) {
          const res = QuestionFileSchema.safeParse(item);
          if (res.success) practiceIds.add(res.data.id);
        }
      } catch {
        // validate-content.ts owns questions.json; nothing to add here.
      }
    }
  }

  // Pass 2: the problem sets themselves.
  let sheetCount = 0;
  let problemCount = 0;

  for (const slug of subjectSlugs) {
    const topicsDir = path.join(CONTENT_DIR, slug, "topics");
    let topicDirs: string[] = [];
    try {
      const entries = await fs.readdir(topicsDir, { withFileTypes: true });
      topicDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }

    // Topics the subject index declares, so a sheet on an undeclared (and
    // therefore unreachable) chapter is reported rather than silently shipped.
    let declaredTopicIds = new Set<string>();
    try {
      const idx = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, slug, "index.json"), "utf8"));
      declaredTopicIds = new Set(
        (idx.topics ?? []).map((t: { id: string }) => t.id)
      );
    } catch {
      // validate-content.ts reports a broken subject index.
    }

    for (const tid of topicDirs) {
      const psPath = path.join(topicsDir, tid, "problemset.json");
      if (!(await exists(psPath))) continue;

      const where = `${slug}/topics/${tid}/problemset.json`;
      sheetCount += 1;

      let set: ProblemSetFile;
      try {
        set = ProblemSetFileSchema.parse(JSON.parse(await fs.readFile(psPath, "utf8")));
      } catch (e: unknown) {
        errors.push(`${where}: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }

      if (set.topicId !== tid) {
        errors.push(`${where}: topicId "${set.topicId}" must match the folder "${tid}"`);
      }
      if (declaredTopicIds.size > 0 && !declaredTopicIds.has(tid)) {
        errors.push(
          `${where}: topic "${tid}" is not listed in ${slug}/index.json topics[], so the sheet is unreachable`
        );
      }

      // Section slugs, from the canonical extractor — identical to the ones the
      // loader, the adapters and validate-content.ts produce.
      const mdxPath = path.join(topicsDir, tid, "module.mdx");
      let moduleSections: string[] = [];
      if (await exists(mdxPath)) {
        moduleSections = extractMdxSectionSlugs(await fs.readFile(mdxPath, "utf8"));
      } else {
        errors.push(`${where}: topic has no module.mdx, so no section can be verified`);
      }

      const usedSections = new Set<string>();
      let previousRank = -1;

      for (const [index, problem] of set.problems.entries()) {
        problemCount += 1;
        const at = `${where} problem ${index + 1} ("${problem.id}")`;

        const prior = seenIds.get(problem.id);
        if (prior) {
          errors.push(`${at}: duplicate problem id — already used by ${prior}`);
        }
        seenIds.set(problem.id, where);

        if (practiceIds.has(problem.id)) {
          errors.push(
            `${at}: id collides with a practice question id. The question registry is global and keyed by id, so the two would share a progress slot.`
          );
        }

        if (moduleSections.length > 0 && !moduleSections.includes(problem.section)) {
          errors.push(
            `${at}: section "${problem.section}" has no matching module.mdx section (known: ${moduleSections.join(", ")})`
          );
        }
        usedSections.add(problem.section);

        for (const [field, text] of authoredStrings(problem)) {
          for (const err of latexErrors(text)) {
            errors.push(`${at}: LaTeX in ${field} does not render — ${err}`);
          }
        }

        // A solution is the method, not the answer. A one-liner is almost
        // always an answer key, which defeats the point of working on paper.
        if (problem.solution.trim().length < 80) {
          warnings.push(
            `${at}: solution is very short (${problem.solution.trim().length} chars) — sheets exist so the learner can check their method, not just the final value`
          );
        }

        const rank = DIFFICULTY_RANK[problem.difficulty] ?? 0;
        if (rank < previousRank) {
          warnings.push(
            `${at}: difficulty "${problem.difficulty}" comes after "${Object.keys(DIFFICULTY_RANK).find((k) => DIFFICULTY_RANK[k] === previousRank)}" — sheets should run easy to hard`
          );
        }
        previousRank = Math.max(previousRank, rank);
      }

      const kinds = new Set(set.problems.map((p) => p.kind));
      if (kinds.size === 1 && kinds.has("computation")) {
        warnings.push(
          `${where}: every problem is a computation. Paper is what makes proof / sketch / critique gradable-by-hand — a sheet of computations could have stayed online.`
        );
      }

      if (moduleSections.length >= 4 && usedSections.size < 3) {
        warnings.push(
          `${where}: draws on only ${usedSections.size} of the chapter's ${moduleSections.length} sections`
        );
      }
    }
  }

  console.log(`Checked ${sheetCount} problem set(s), ${problemCount} problem(s).\n`);

  if (warnings.length) {
    console.log("Warnings:");
    warnings.forEach((w) => console.log("  " + w));
    console.log("");
  }

  if (errors.length) {
    console.error("Errors:");
    errors.forEach((e) => console.error("  " + e));
    console.error(`\n${errors.length} error(s). Fix and re-run.`);
    process.exit(1);
  }

  console.log("✅ problemset.json validation passed.");
  if (warnings.length) console.log(`   (${warnings.length} warnings)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
