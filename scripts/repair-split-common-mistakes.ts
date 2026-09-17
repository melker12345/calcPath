#!/usr/bin/env node
/**
 * Repair the Common Mistakes lists that the chapter split got wrong.
 *
 * split-chapters.ts gave each new chapter the Common Mistakes of every old
 * chapter it drew a section from. But an old chapter held one mistakes list per
 * mini-topic, and those mini-topics were split across several new chapters — so
 * a chapter that took six sections from `network-information-theory` inherited
 * that chapter's mistakes about network coding and Blahut-Arimoto too, material
 * that now lives two chapters away. Information theory's bullets tripled.
 *
 * A Common Mistakes block belongs to the sections that PRECEDE it, which is how
 * the mini-topics were concatenated in the first place. This reads the pre-split
 * revision, works out that association, and rewrites each chapter's list to hold
 * only the blocks whose sections it actually has.
 *
 * Run: npx tsx scripts/repair-split-common-mistakes.ts [--base=<rev>] [--dry]
 */
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { PLANS } from "./split-it-comb-chapters";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SUBJECTS = ["information-theory", "combinatorics"];

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\$[^$]*\$/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Sections are addressed as `old-topic/slug`, because bare slugs repeat across
 * the subject — matching on `applications` alone pulls in the mistakes of every
 * chapter that happened to have a section by that name.
 */
type MistakeBlock = { keys: string[]; bullets: string };

/** Each Common Mistakes block, with the sections it followed. */
function associateMistakes(source: string, oldId: string): MistakeBlock[] {
  const body = source.replace(/^---\s*[\s\S]*?---\s*\r?\n?/, "").replace(/^#\s+[^\n]+\n?/m, "");
  const lines = body.split(/\r?\n/);
  const starts: number[] = [];
  for (let i = 0; i < lines.length; i++) if (/^##\s+/.test(lines[i])) starts.push(i);

  const out: MistakeBlock[] = [];
  let pending: string[] = [];
  for (let s = 0; s < starts.length; s++) {
    const from = starts[s];
    const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const heading = lines[from].match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/);
    const rawTitle = heading?.[1]?.trim() ?? "";
    if (rawTitle.toLowerCase().includes("common mistake")) {
      const bullets = lines
        .slice(from + 1, to)
        .join("\n")
        .trim();
      if (bullets) out.push({ keys: pending, bullets });
      pending = [];
      continue;
    }
    let slug = heading?.[2] || toSlug(rawTitle);
    for (let j = from + 1; j < Math.min(from + 5, to); j++) {
      const marker = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
      if (marker) {
        slug = marker[1];
        break;
      }
    }
    pending.push(`${oldId}/${slug}`);
  }
  // A trailing group with no mistakes list of its own contributes nothing.
  return out;
}

async function main() {
  const baseArg = process.argv.find((a) => a.startsWith("--base="));
  const base = baseArg ? baseArg.split("=")[1] : "27d9fc6";
  const dry = process.argv.includes("--dry");

  for (const subject of SUBJECTS) {
    const oldFiles = execSync(`git -C ${ROOT} ls-tree -r --name-only ${base} -- content/${subject}`, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })
      .split("\n")
      .filter((f) => f.endsWith("module.mdx"));

    const blocks: MistakeBlock[] = [];
    for (const rel of oldFiles) {
      const source = execSync(`git -C ${ROOT} show ${base}:${rel}`, {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      const oldId = rel.split("/")[3];
      blocks.push(...associateMistakes(source, oldId));
    }

    const topicsDir = path.join(ROOT, "content", subject, "topics");
    for (const chapter of PLANS[subject]) {
      const id = chapter.id;
      const file = path.join(topicsDir, id, "module.mdx");
      let source: string;
      try {
        source = await fs.readFile(file, "utf8");
      } catch {
        continue; // a chapter a later rebuild has not created yet
      }
      // Exactly the sections this chapter took, as the split plan addressed them.
      const mine = new Set(chapter.sections);

      const kept: string[] = [];
      const seen = new Set<string>();
      for (const block of blocks) {
        if (!block.keys.some((k) => mine.has(k))) continue;
        for (const bullet of block.bullets.split(/\n(?=[-*]\s)/)) {
          const trimmed = bullet.trim();
          if (!trimmed || seen.has(trimmed)) continue;
          seen.add(trimmed);
          kept.push(trimmed);
        }
      }

      const marker = source.lastIndexOf("\n## Common Mistakes");
      const head = marker === -1 ? source.replace(/\s+$/, "") : source.slice(0, marker).replace(/\s+$/, "");
      const before = marker === -1 ? 0 : (source.slice(marker).match(/^[-*]\s/gm) ?? []).length;
      const next = kept.length ? `${head}\n\n## Common Mistakes\n\n${kept.join("\n")}\n` : `${head}\n`;

      if (before !== kept.length) {
        console.log(`  ${subject}/${id}: ${before} -> ${kept.length} mistake bullets`);
      }
      if (!dry) await fs.writeFile(file, next);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
