#!/usr/bin/env node
/**
 * Build the section-level redirect map for subjects whose chapters were split.
 *
 * The chapter-level map answers "where did this chapter go?". It cannot answer
 * "where did this SECTION go?", and a split moves sections between chapters: the
 * old `source-coding` chapter's sections are now spread over four. A practice
 * link like /information-theory/practice/source-coding?section=algorithm
 * therefore lands on whichever chapter the old one redirects to, with a section
 * that chapter does not have.
 *
 * Module links carry their section as a #fragment, which browsers never send, so
 * nothing server-side can rescue those. Practice links carry ?section=, which
 * this map fixes.
 *
 * Run: npx tsx scripts/build-legacy-section-redirects.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { PLANS } from "./split-it-comb-chapters";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** Moves a later rebuild made that the split plan cannot know about. */
const EXTRA: Record<string, Record<string, string>> = {
  "information-theory": {
    // The quantum rebuild split one chapter in two and took these with it.
    "quantum-information/quantum-channels-holevo": "quantum-channels",
    "quantum-information/entanglement-teleportation": "quantum-channels",
  },
};

function main() {
  for (const [subject, chapters] of Object.entries(PLANS)) {
    // section key "old-chapter/slug" -> the chapter it lives in now
    const moved: Record<string, Record<string, string>> = {};

    for (const chapter of chapters) {
      for (const key of chapter.sections) {
        const [oldId, ...rest] = key.split("/");
        const slug = rest.join("/");
        if (oldId === chapter.id) continue; // never left its chapter
        (moved[oldId] ??= {})[slug] = chapter.id;
      }
    }

    for (const [key, target] of Object.entries(EXTRA[subject] ?? {})) {
      const [oldId, ...rest] = key.split("/");
      (moved[oldId] ??= {})[rest.join("/")] = target;
    }

    // Sanity: the destination chapter must really hold the section now.
    for (const [oldId, map] of Object.entries(moved)) {
      for (const [slug, chapterId] of Object.entries(map)) {
        const file = path.join(ROOT, "content", subject, "topics", chapterId, "module.mdx");
        if (!fs.existsSync(file) || !fs.readFileSync(file, "utf8").includes(slug)) {
          throw new Error(`${subject}: ${oldId}/${slug} -> ${chapterId}, which does not contain it`);
        }
      }
    }

    const out = path.join(ROOT, "content", subject, "legacy-section-redirects.json");
    fs.writeFileSync(out, JSON.stringify(moved, null, 2) + "\n");
    const count = Object.values(moved).reduce((n, m) => n + Object.keys(m).length, 0);
    console.log(`${subject}: ${count} section redirect(s) across ${Object.keys(moved).length} old chapter(s)`);
  }
}

main();
