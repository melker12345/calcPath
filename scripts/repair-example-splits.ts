#!/usr/bin/env node
/**
 * Repairs three defects the bulk marker conversion left behind. Each is
 * mechanical, each is verified by comparing prose before and after.
 *
 *  1. An example whose body starts at "Step 1". The converter takes an
 *     example's first item as its problem statement, but where the author
 *     wrote steps with no problem, that stole step one and the solution began
 *     at "Step 2". Such a pair is merged back into one example holding the
 *     whole list — the title is the problem.
 *
 *  2. A ":::solution" with no example before it, which renders as a bare
 *     "Solution." attached to nothing. Its content is unwrapped back to prose.
 *
 *  3. A line with unbalanced bold, left when stripping "**Step 1 — " from
 *     "**Step 1 — check the axioms.** ..." orphaned the closing "**". The
 *     opening marker is restored, so the author's mini-heading is bold again.
 *
 * Run:
 *   npx tsx scripts/repair-example-splits.ts --dry-run
 *   npx tsx scripts/repair-example-splits.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "..", "content");

const OPEN_FENCE = /^:::([a-z]+)(\[[^\]]*\])?(\{#[^}]*\})?\s*$/;
const CLOSE_FENCE = /^:::\s*$/;
const STEP_ONE = /^\s*\*{0,2}Step\s*1\b/i;
const STEP_PREFIX = /^\*{0,2}Step\s*\d+\s*(?:[:.—-]\s*)\*{0,2}/i;
const LIST_ITEM = /^(?:[-*]\s+|\d+\.\s+)/;

type Block = { kind: string; suffix: string; start: number; end: number; body: string[] };

/** Parse a module into its top-level environments, in document order. */
function readBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const open = lines[i].match(OPEN_FENCE);
    if (!open) continue;
    let close = -1;
    for (let j = i + 1; j < lines.length; j += 1) {
      if (CLOSE_FENCE.test(lines[j])) {
        close = j;
        break;
      }
    }
    if (close === -1) continue;
    blocks.push({
      kind: open[1],
      suffix: `${open[2] ?? ""}${open[3] ?? ""}`,
      start: i,
      end: close,
      body: lines.slice(i + 1, close),
    });
    i = close;
  }
  return blocks;
}

/** Renumber a list so merged items read 1..n. */
function renumber(items: string[]): string[] {
  return items.map((item, index) => `${index + 1}. ${item.replace(LIST_ITEM, "")}`);
}

function repair(source: string) {
  let lines = source.split("\n");
  const counts = { merged: 0, unwrapped: 0, rebolded: 0 };

  // --- 1 + 2: rebuild the file around example/solution pairs -----------------
  for (let pass = 0; pass < 20; pass += 1) {
    const blocks = readBlocks(lines);
    let changed = false;

    for (let b = 0; b < blocks.length; b += 1) {
      const block = blocks[b];

      // (1) example that begins at "Step 1", followed by its solution
      if (block.kind === "example" && STEP_ONE.test(block.body.join("\n"))) {
        const next = blocks[b + 1];
        if (next && next.kind === "solution" && next.start === block.end + 2) {
          const stolen = block.body.filter((l) => l.trim()).map((l) => l.replace(STEP_PREFIX, "").trim());
          const rest = next.body.filter((l) => l.trim()).map((l) => l.replace(LIST_ITEM, "").trim());
          const merged = renumber([...stolen, ...rest]);
          lines = [
            ...lines.slice(0, block.start),
            `:::example${block.suffix}`,
            ...merged,
            ":::",
            ...lines.slice(next.end + 1),
          ];
          counts.merged += 1;
          changed = true;
          break;
        }
      }

      // (2) solution with nothing to solve
      if (block.kind === "solution") {
        const previous = blocks[b - 1];
        const precededByExample = previous && previous.kind === "example" && previous.end < block.start;
        if (!precededByExample) {
          lines = [
            ...lines.slice(0, block.start),
            ...block.body,
            ...lines.slice(block.end + 1),
          ];
          counts.unwrapped += 1;
          changed = true;
          break;
        }
      }
    }
    if (!changed) break;
  }

  // --- 3: restore the bold opener the step prefix took with it ---------------
  lines = lines.map((line) => {
    const marks = (line.match(/\*\*/g) ?? []).length;
    if (marks % 2 === 0) return line;
    const withoutList = line.replace(LIST_ITEM, "");
    if (withoutList.startsWith("**")) return line; // opener present, closer missing: leave alone
    counts.rebolded += 1;
    const listMarker = line.slice(0, line.length - withoutList.length);
    return `${listMarker}**${withoutList}`;
  });

  return { text: lines.join("\n"), counts };
}

/** Words, ignoring structure — must be identical before and after. */
function proseOf(source: string): string {
  return source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !/^:::/.test(l))
    .map((l) => l.replace(LIST_ITEM, "").replace(STEP_PREFIX, ""))
    .join(" ")
    .replace(/\*\*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const files = (await walk(CONTENT)).sort();
  const totals = { merged: 0, unwrapped: 0, rebolded: 0, files: 0 };
  const refused: string[] = [];

  for (const file of files) {
    const rel = path.relative(path.join(__dirname, ".."), file);
    const source = await fs.readFile(file, "utf8");
    const { text, counts } = repair(source);
    if (counts.merged + counts.unwrapped + counts.rebolded === 0) continue;

    if (proseOf(source) !== proseOf(text)) {
      refused.push(rel);
      continue;
    }

    totals.files += 1;
    totals.merged += counts.merged;
    totals.unwrapped += counts.unwrapped;
    totals.rebolded += counts.rebolded;
    console.log(
      `  ${rel}: ${counts.merged} merged, ${counts.unwrapped} unwrapped, ${counts.rebolded} re-bolded`
    );
    if (!dryRun) await fs.writeFile(file, text, "utf8");
  }

  console.log(
    `\n${dryRun ? "Would repair" : "Repaired"} ${totals.files} file(s): ` +
      `${totals.merged} example/solution pairs merged, ${totals.unwrapped} orphan solutions unwrapped, ` +
      `${totals.rebolded} bold markers restored.`
  );
  if (refused.length) {
    console.log(`\n${refused.length} file(s) SKIPPED — prose would not survive intact:`);
    refused.forEach((f) => console.log(`  ${f}`));
    process.exitCode = 1;
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
