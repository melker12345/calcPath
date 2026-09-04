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

    if (before !== null) {
      // Content loss is the failure that matters: an environment that swallowed
      // a paragraph, or a section quietly dropped.
      const wordsBefore = wordCount(before);
      const wordsNow = wordCount(now);
      if (wordsNow < wordsBefore * 0.9) {
        problems.push(
          `  ${rel}: prose shrank ${wordsBefore} -> ${wordsNow} words (${Math.round((1 - wordsNow / wordsBefore) * 100)}% lost)`
        );
      }
      const slugsBefore = extractMdxSectionSlugs(before).join(",");
      const slugsNow = extractMdxSectionSlugs(now).join(",");
      if (slugsBefore !== slugsNow) {
        problems.push(`  ${rel}: section slugs changed\n      was: ${slugsBefore}\n      now: ${slugsNow}`);
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

  if (problems.length) {
    console.log(`\n${problems.length} problem(s) against ${base}:`);
    problems.forEach((p) => console.log(p));
    process.exitCode = 1;
  } else {
    console.log(`\nNo content lost against ${base}; every section slug intact.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
