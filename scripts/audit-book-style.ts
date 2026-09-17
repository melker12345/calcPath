#!/usr/bin/env node
/**
 * content:audit — a health check on the book-style conversion.
 *
 * The other validators answer "is this content well-formed?". This one answers
 * "did the conversion do a good job, and did anything get lost on the way?" by
 * comparing every module against a git revision (default: the commit before the
 * statement-lifting pass) and reporting per-subject coverage.
 *
 * Run:
 *   npx tsx scripts/audit-book-style.ts                 # compare against HEAD
 *   npx tsx scripts/audit-book-style.ts --base=<rev>    # against another commit
 *   npx tsx scripts/audit-book-style.ts --verbose       # list every module
 *
 * Exits 1 when a module looks like it lost content, so it can gate a commit.
 */
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { MATH_BLOCK_SPECS, segmentMathBlocks, type MathBlockKind } from "../src/lib/content/math-blocks";
import { extractMdxSectionSlugs } from "../src/lib/content/mdx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** Words of actual prose, ignoring structure, so two versions can be compared. */
function wordCount(source: string): number {
  return source
    .split("\n")
    .filter((line) => !/^\s*:::/.test(line) && !/^\s*<!--/.test(line))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function countKinds(source: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const segment of segmentMathBlocks(source)) {
    if (segment.type !== "block") continue;
    counts[segment.kind] = (counts[segment.kind] ?? 0) + 1;
  }
  return counts;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return Promise.resolve(entry.name === "module.mdx" ? [full] : []);
    })
  );
  return nested.flat();
}

const STATEMENT_KINDS: MathBlockKind[] = [
  "definition",
  "theorem",
  "lemma",
  "proposition",
  "corollary",
  "recipe",
];

async function main() {
  const baseArg = process.argv.find((a) => a.startsWith("--base="));
  const base = baseArg ? baseArg.split("=")[1] : "HEAD";
  const verbose = process.argv.includes("--verbose");

  const files = (await walk(path.join(ROOT, "content"))).sort();
  const problems: string[] = [];
  const addedSlugs: string[] = [];
  type Totals = {
    wordsBefore: number;
    wordsNow: number;
    slugsBefore: Map<string, string>;
    slugsNow: Map<string, string>;
  };
  const emptyTotals = (): Totals => ({
    wordsBefore: 0,
    wordsNow: 0,
    slugsBefore: new Map(),
    slugsNow: new Map(),
  });
  const subjectTotals = new Map<string, Totals>();

  // The "before" side comes from the revision itself rather than from the files
  // on disk, so a module that was deleted or renamed by a restructure still
  // counts towards what the subject used to hold.
  const baseFiles = execSync(`git -C ${ROOT} ls-tree -r --name-only ${base} -- content`, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\n")
    .filter((f) => f.endsWith("module.mdx"));
  for (const rel of baseFiles) {
    const subject = rel.split("/")[1];
    let source: string;
    try {
      source = execSync(`git -C ${ROOT} show ${base}:${rel}`, {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      continue;
    }
    const totals = subjectTotals.get(subject) ?? emptyTotals();
    totals.wordsBefore += wordCount(source);
    for (const slug of extractMdxSectionSlugs(source)) totals.slugsBefore.set(slug, rel);
    subjectTotals.set(subject, totals);
  }
  const bySubject = new Map<string, { modules: number; sections: number; kinds: Record<string, number>; withoutStatement: string[] }>();

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const subject = rel.split(path.sep)[1];
    const now = await fs.readFile(file, "utf8");

    let before: string | null = null;
    try {
      before = execSync(`git -C ${ROOT} show ${base}:${rel}`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    } catch {
      before = null; // new file
    }

    const kinds = countKinds(now);
    const sections = extractMdxSectionSlugs(now).length;
    const entry = bySubject.get(subject) ?? { modules: 0, sections: 0, kinds: {}, withoutStatement: [] };
    entry.modules += 1;
    entry.sections += sections;
    for (const [kind, count] of Object.entries(kinds)) {
      entry.kinds[kind] = (entry.kinds[kind] ?? 0) + count;
    }
    const statements = STATEMENT_KINDS.reduce((sum, kind) => sum + (kinds[kind] ?? 0), 0);
    if (statements === 0) entry.withoutStatement.push(rel);
    bySubject.set(subject, entry);

    // Content loss is the failure that matters: an environment that swallowed a
    // paragraph, or a section quietly dropped. Both are judged per subject
    // rather than per file, because splitting a chapter moves sections and prose
    // between files without losing a word of either. The "now" side counts every
    // module, new ones included; the "before" side is read from the revision
    // below, so a chapter that was deleted still contributes what it held.
    const nowTotals = subjectTotals.get(subject) ?? emptyTotals();
    nowTotals.wordsNow += wordCount(now);
    for (const slug of extractMdxSectionSlugs(now)) nowTotals.slugsNow.set(slug, rel);
    subjectTotals.set(subject, nowTotals);

    if (before !== null) {
      // Slugs are the join key between a chapter and its question bank, but the
      // three ways the list can change are not equally bad. Removing one strands
      // its questions and breaks ?section= deep links; reordering shuffles the
      // reader's path through the chapter. Adding one breaks nothing — progress
      // is tracked per question id (see src/lib/progress.ts), so a new section
      // starts empty and touches no stored record. A rebuild that deepens a
      // chapter usually needs new sections, so only the first two fail here.
      // Within one file, the slugs that stayed put must stay in order — but only
      // those. A slug that left for another chapter is checked at subject level.
      const slugsBefore = extractMdxSectionSlugs(before);
      const slugsNow = extractMdxSectionSlugs(now);
      const nowSet = new Set(slugsNow);
      const beforeSet = new Set(slugsBefore);
      const keptBefore = slugsBefore.filter((s) => nowSet.has(s));
      const keptNow = slugsNow.filter((s) => beforeSet.has(s));
      if (keptBefore.join(",") !== keptNow.join(",")) {
        problems.push(
          `  ${rel}: existing section slugs reordered\n      was: ${keptBefore.join(",")}\n      now: ${keptNow.join(",")}`
        );
      }
    }

    if (verbose) {
      const summary = Object.entries(kinds)
        .map(([kind, count]) => `${count} ${MATH_BLOCK_SPECS[kind as MathBlockKind].label.toLowerCase()}`)
        .join(", ");
      console.log(`  ${rel}: ${summary || "no environments"}`);
    }
  }

  console.log(`\nBook-style coverage across ${files.length} modules\n`);
  const header = "subject".padEnd(24) + "mods".padStart(5) + "defs".padStart(6) + "thms".padStart(6) + "proofs".padStart(8) + "exs".padStart(6) + "intu".padStart(6);
  console.log(header);
  console.log("-".repeat(header.length));
  for (const [subject, entry] of [...bySubject.entries()].sort()) {
    const theorems = ["theorem", "lemma", "proposition", "corollary"].reduce(
      (sum, kind) => sum + (entry.kinds[kind] ?? 0),
      0
    );
    console.log(
      subject.padEnd(24) +
        String(entry.modules).padStart(5) +
        String(entry.kinds.definition ?? 0).padStart(6) +
        String(theorems).padStart(6) +
        String(entry.kinds.proof ?? 0).padStart(8) +
        String(entry.kinds.example ?? 0).padStart(6) +
        String(entry.kinds.intuition ?? 0).padStart(6)
    );
  }

  const thin = [...bySubject.values()].flatMap((entry) => entry.withoutStatement);
  if (thin.length) {
    console.log(`\n${thin.length} module(s) with no definition or theorem yet:`);
    thin.forEach((f) => console.log(`  ${f}`));
  }

  // Subject-level verdict on loss. A section that moved from one chapter to
  // another is still in the subject, so only a slug that left the subject
  // entirely strands its questions; likewise prose is counted across the whole
  // subject, so a split that re-homes half a chapter reads as no loss at all.
  for (const [subject, totals] of [...subjectTotals.entries()].sort()) {
    const gone = [...totals.slugsBefore.keys()].filter((s) => !totals.slugsNow.has(s));
    if (gone.length) {
      problems.push(
        `  ${subject}: section slug(s) gone from the subject: ${gone.join(", ")}\n` +
          `      questions pointing at them are stranded and ?section= links break`
      );
    }
    if (totals.wordsNow < totals.wordsBefore * 0.9) {
      problems.push(
        `  ${subject}: prose shrank ${totals.wordsBefore} -> ${totals.wordsNow} words ` +
          `(${Math.round((1 - totals.wordsNow / totals.wordsBefore) * 100)}% lost)`
      );
    }
    const moved = [...totals.slugsNow.entries()].filter(
      ([slug, file]) => totals.slugsBefore.has(slug) && totals.slugsBefore.get(slug) !== file
    );
    if (moved.length) {
      addedSlugs.push(`  ${subject}: ${moved.length} section(s) moved to another chapter (allowed)`);
    }
    const added = [...totals.slugsNow.keys()].filter((s) => !totals.slugsBefore.has(s));
    if (added.length) {
      addedSlugs.push(`  ${subject}: +${added.length} new section(s): ${added.join(", ")}`);
    }
  }

  // Added sections are allowed, but never silent: a rebuild that invents fifteen
  // of them should be visible in review even though it is not a failure.
  if (addedSlugs.length) {
    console.log(`\nStructural changes against ${base} (allowed):`);
    addedSlugs.forEach((a) => console.log(a));
  }

  if (problems.length) {
    console.log(`\n${problems.length} problem(s) against ${base}:`);
    problems.forEach((p) => console.log(p));
    process.exitCode = 1;
  } else {
    console.log(`\nNo content lost against ${base}; no section slug dropped or reordered.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
