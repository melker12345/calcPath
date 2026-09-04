#!/usr/bin/env node
/**
 * One-off migration: rewrite the authoring markers in every module.mdx as the
 * math-book environments documented in content/STYLE.md.
 *
 *   **ELI5**                     ->  :::intuition ... :::
 *   **Worked Example: Title**    ->  :::example[Title] ... :::  +  :::solution ... :::
 *
 * The transformation is purely structural: not one word of prose is rewritten,
 * and the only text ever removed is a marker or a redundant "Step 3:" prefix in
 * front of a step that a numbered list already numbers.
 *
 * Block extents follow exactly the rules the MDX adapter already uses
 * (src/lib/content/adapters.ts), so what used to land in the ELI5 card lands in
 * the intuition aside, and what used to be a worked example's steps becomes the
 * solution. Anything the adapter treated as body text stays body text.
 *
 * Run:
 *   npx tsx scripts/convert-book-style.ts --dry-run   # report, touch nothing
 *   npx tsx scripts/convert-book-style.ts             # rewrite in place
 *   npx tsx scripts/convert-book-style.ts --check     # verify prose preserved
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "..", "content");

const ELI5_INLINE = /^\*\*ELI5\*\*\s*:?\s*(.*)$/i;
const ELI5_LOOSE = /^\*\*ELI5\b.*?\*\*\s*:?\s*(.*)$/i;
// "**Worked Example: Title**", and also "**Worked Example:** lead-in text",
// where everything after the bold is the example's opening sentence.
const WORKED = /^\*\*Worked Examples?\s*:?\s*(.*?)\*\*\s*:?\s*(.*)$/i;
const HEADING = /^#{1,6}\s/;
const LIST_ITEM = /^(?:[-*]\s+|\d+\.\s+)/;
const BOLD_ONLY = /^\*\*(.+)\*\*$/;
const STEP_PREFIX = /^\*{0,2}Step\s*\d+\s*(?:[:.—-]\s*)\*{0,2}/i;

const isBlank = (line: string) => line.trim() === "";
const isMarker = (line: string) => {
  const t = line.trim();
  return ELI5_LOOSE.test(t) || WORKED.test(t) || HEADING.test(t) || t.startsWith(":::");
};
const isGenericTitle = (title: string) =>
  !title || /^(?:worked\s+)?examples?$/i.test(title.trim());

/** Strip the list bullet or number from a line, leaving its content. */
const stripListMarker = (line: string) => line.trim().replace(LIST_ITEM, "");

type Block = { end: number; lines: string[] };

/** Collect the lines belonging to a marker's block, per the adapter's rules. */
function collectBlock(lines: string[], start: number): Block {
  const body: string[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      // A blank line does not end a block; a marker or heading after it does.
      let j = i;
      while (j < lines.length && isBlank(lines[j])) j += 1;
      if (j >= lines.length || isMarker(lines[j])) break;
      body.push("");
      i = j;
      continue;
    }
    if (isMarker(line)) break;
    body.push(line);
    i += 1;
  }
  while (body.length && isBlank(body[body.length - 1])) body.pop();
  return { end: i, lines: body };
}

/**
 * The intuition aside. Bullets become separate paragraphs, which is how the
 * card already read them; a bare marker over prose takes that one paragraph.
 */
function convertEli5(lines: string[], start: number): { end: number; out: string[] } {
  const marker = lines[start].trim();
  const inline = (marker.match(ELI5_INLINE) ?? marker.match(ELI5_LOOSE))?.[1]?.trim() ?? "";

  let end = start + 1;
  const paragraphs: string[] = [];
  if (inline) paragraphs.push(inline);

  let cursor = start + 1;
  while (cursor < lines.length && isBlank(lines[cursor])) cursor += 1;

  if (!inline && cursor < lines.length && !isMarker(lines[cursor])) {
    if (LIST_ITEM.test(lines[cursor].trim())) {
      // A run of list items, blank lines allowed between them.
      let i = cursor;
      while (i < lines.length) {
        if (isBlank(lines[i])) {
          let j = i;
          while (j < lines.length && isBlank(lines[j])) j += 1;
          if (j < lines.length && LIST_ITEM.test(lines[j].trim())) {
            i = j;
            continue;
          }
          break;
        }
        const trimmed = lines[i].trim();
        if (!LIST_ITEM.test(trimmed)) break;
        paragraphs.push(stripListMarker(trimmed));
        i += 1;
      }
      end = i;
    } else {
      // One prose paragraph — the author wrote the aside without bullets.
      let i = cursor;
      const paragraph: string[] = [];
      while (i < lines.length && !isBlank(lines[i]) && !isMarker(lines[i])) {
        paragraph.push(lines[i].trim());
        i += 1;
      }
      paragraphs.push(paragraph.join(" "));
      end = i;
    }
  }

  if (paragraphs.length === 0) return { end, out: [] };
  return { end, out: [":::intuition", ...interleave(paragraphs), ":::"] };
}

/** Join paragraphs with the blank line MDX needs between them. */
function interleave(paragraphs: string[]): string[] {
  const out: string[] = [];
  paragraphs.forEach((paragraph, index) => {
    if (index > 0) out.push("");
    out.push(paragraph);
  });
  return out;
}

/**
 * The worked example. The first step is the problem — that is the convention
 * every module already follows — and the rest become the solution.
 */
function convertWorked(lines: string[], start: number): { end: number; out: string[] } {
  const marker = lines[start].trim().match(WORKED);
  let title = (marker?.[1] ?? "").trim();
  const leadIn = (marker?.[2] ?? "").trim();
  const block = collectBlock(lines, start + 1);
  let body = leadIn ? [leadIn, ...block.lines] : block.lines;

  // "**Worked Example:**" on its own, with the name on the next bold line.
  // Only lift it when something follows: a few examples are nothing BUT that
  // bold line, and lifting it there would leave an empty example and lose the
  // text (which is exactly what the current renderer does with them).
  if (isGenericTitle(title)) {
    const firstIndex = body.findIndex((line) => !isBlank(line));
    const bold = firstIndex >= 0 ? body[firstIndex].trim().match(BOLD_ONLY) : null;
    const rest = firstIndex >= 0 ? body.slice(firstIndex + 1).filter((line) => !isBlank(line)) : [];
    if (bold && rest.length > 0) {
      title = bold[1].trim();
      body = body.slice(firstIndex + 1);
      while (body.length && isBlank(body[0])) body.shift();
    }
  }

  const steps: string[] = [];
  const allListItems = body.filter((l) => !isBlank(l)).every((l) => LIST_ITEM.test(l.trim()));
  const hasRichContent = body.some(
    (line) => line.trim().startsWith("|") || line.includes("$$") || line.trim().startsWith(">")
  );

  if (allListItems && !hasRichContent) {
    for (const line of body) {
      if (isBlank(line)) continue;
      steps.push(stripListMarker(line));
    }
  } else {
    // Tables, display equations and multi-line prose keep their original shape.
    let paragraph: string[] = [];
    const flush = () => {
      if (paragraph.length) steps.push(paragraph.join("\n"));
      paragraph = [];
    };
    for (const line of body) {
      if (isBlank(line)) flush();
      else paragraph.push(LIST_ITEM.test(line.trim()) ? stripListMarker(line) : line);
    }
    flush();
  }

  if (steps.length === 0) return { end: block.end, out: [] };

  const open = isGenericTitle(title) ? ":::example" : `:::example[${title}]`;
  const problem = steps[0];
  const rest = steps.slice(1).map((step) => step.replace(STEP_PREFIX, ""));

  const out = [open, problem, ":::"];
  if (rest.length > 0) {
    out.push("", ":::solution");
    const numbered = rest.every((step) => !step.includes("\n") && !step.includes("$$"));
    if (numbered) {
      rest.forEach((step, index) => out.push(`${index + 1}. ${step}`));
    } else {
      out.push(...interleave(rest));
    }
    out.push(":::");
  }
  return { end: block.end, out };
}

export function convert(source: string): { text: string; eli5: number; examples: number } {
  const lines = source.split("\n");
  const out: string[] = [];
  let eli5 = 0;
  let examples = 0;
  let i = 0;

  // Never open an environment inside one that is already open. A marker can
  // only sit inside a fence if an earlier run wrapped it there, and converting
  // it in place would nest — which the content validator rightly rejects.
  let insideFence = false;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith(":::")) {
      insideFence = trimmed === ":::" ? false : true;
      out.push(lines[i]);
      i += 1;
      continue;
    }

    if (insideFence) {
      out.push(lines[i]);
      i += 1;
      continue;
    }

    if (ELI5_LOOSE.test(trimmed)) {
      const { end, out: block } = convertEli5(lines, i);
      if (block.length) {
        eli5 += 1;
        if (out.length && !isBlank(out[out.length - 1])) out.push("");
        out.push(...block, "");
      }
      i = end;
      continue;
    }

    if (WORKED.test(trimmed)) {
      const { end, out: block } = convertWorked(lines, i);
      if (block.length) {
        examples += 1;
        if (out.length && !isBlank(out[out.length - 1])) out.push("");
        out.push(...block, "");
      }
      i = end;
      continue;
    }

    out.push(lines[i]);
    i += 1;
  }

  // Collapse the runs of blank lines the splicing can leave behind.
  const text = out.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "\n");
  return { text, eli5, examples };
}

/**
 * Every word of prose must survive the conversion. Compare the two versions
 * with all structural syntax removed: if a single word moved, this catches it.
 */
export function proseOf(source: string): string {
  return source
    .split("\n")
    .map((line) => line.trim())
    // Keep the name an environment carries in its fence: ":::example[Sine rule]"
    // holds prose that the old "**Worked Example: Sine rule**" marker held.
    .map((line) => (/^:::\w+\[/.test(line) ? line.replace(/^:::\w+\[(.*)\]\s*$/, "$1") : line))
    .filter((line) => !/^:::/.test(line))
    .map((line) =>
      line
        .replace(ELI5_LOOSE, "$1")
        .replace(WORKED, "$1 $2")
        .replace(LIST_ITEM, "")
        .replace(STEP_PREFIX, "")
    )
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
  const checkOnly = process.argv.includes("--check");
  const files = (await walk(CONTENT)).sort();

  let converted = 0;
  let eli5Total = 0;
  let exampleTotal = 0;
  const mismatches: string[] = [];
  const untouched: string[] = [];

  for (const file of files) {
    const rel = path.relative(path.join(__dirname, ".."), file);
    const source = await fs.readFile(file, "utf8");
    const { text, eli5, examples } = convert(source);

    if (eli5 === 0 && examples === 0) {
      if (!source.includes(":::")) untouched.push(rel);
      continue;
    }

    if (proseOf(source) !== proseOf(text)) {
      mismatches.push(rel);
      continue;
    }

    converted += 1;
    eli5Total += eli5;
    exampleTotal += examples;
    if (!dryRun && !checkOnly) await fs.writeFile(file, text, "utf8");
  }

  console.log(
    `${checkOnly ? "Checked" : dryRun ? "Would convert" : "Converted"} ${converted} module(s): ` +
      `${eli5Total} intuition asides, ${exampleTotal} examples.`
  );
  if (untouched.length) {
    console.log(`\n${untouched.length} module(s) had no markers to convert:`);
    untouched.forEach((f) => console.log(`  ${f}`));
  }
  if (mismatches.length) {
    console.log(`\n${mismatches.length} module(s) SKIPPED — prose would not survive intact:`);
    mismatches.forEach((f) => console.log(`  ${f}`));
    process.exitCode = 1;
  }
}

// Only run as a script; importing convert()/proseOf() for tests must not write.
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
