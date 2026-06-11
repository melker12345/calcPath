#!/usr/bin/env node
/**
 * Collapse micro-topics into course-style chapters for a subject.
 * Run: npx tsx scripts/consolidate-subject-chapters.ts algebra
 */
import path from "path";
import { fileURLToPath } from "url";
import { consolidateSubjectChapters } from "./lib/consolidate-chapters";
import { ALGEBRA_CHAPTERS } from "./chapter-maps/algebra";
import { GEOMETRY_CHAPTERS } from "./chapter-maps/geometry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MAPS = {
  algebra: ALGEBRA_CHAPTERS,
  geometry: GEOMETRY_CHAPTERS,
} as const;

async function main() {
  const subject = process.argv[2];
  if (!subject || !(subject in MAPS)) {
    console.error("Usage: npx tsx scripts/consolidate-subject-chapters.ts <algebra|geometry>");
    process.exit(1);
  }

  await consolidateSubjectChapters(ROOT, subject, MAPS[subject as keyof typeof MAPS]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});