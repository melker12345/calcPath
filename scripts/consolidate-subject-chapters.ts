#!/usr/bin/env node
/**
 * Collapse micro-topics into course-style chapters for a subject.
 * Run: npx tsx scripts/consolidate-subject-chapters.ts <subject>
 */
import path from "path";
import { fileURLToPath } from "url";
import { consolidateSubjectChapters } from "./lib/consolidate-chapters";
import { ALGEBRA_CHAPTERS } from "./chapter-maps/algebra";
import { COMBINATORICS_CHAPTERS } from "./chapter-maps/combinatorics";
import { GEOMETRY_CHAPTERS } from "./chapter-maps/geometry";
import { INFORMATION_THEORY_CHAPTERS } from "./chapter-maps/information-theory";
import { NUMBER_THEORY_CHAPTERS } from "./chapter-maps/number-theory";
import { PRECALCULUS_CHAPTERS } from "./chapter-maps/precalculus";
import { REAL_ANALYSIS_CHAPTERS } from "./chapter-maps/real-analysis";
import { SET_THEORY_CHAPTERS } from "./chapter-maps/set-theory";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MAPS = {
  algebra: ALGEBRA_CHAPTERS,
  combinatorics: COMBINATORICS_CHAPTERS,
  geometry: GEOMETRY_CHAPTERS,
  "information-theory": INFORMATION_THEORY_CHAPTERS,
  "number-theory": NUMBER_THEORY_CHAPTERS,
  precalculus: PRECALCULUS_CHAPTERS,
  "real-analysis": REAL_ANALYSIS_CHAPTERS,
  "set-theory": SET_THEORY_CHAPTERS,
} as const;

async function main() {
  const subject = process.argv[2];
  if (!subject || !(subject in MAPS)) {
    console.error(
      "Usage: npx tsx scripts/consolidate-subject-chapters.ts <algebra|combinatorics|geometry|information-theory|number-theory|precalculus|real-analysis|set-theory>",
    );
    process.exit(1);
  }

  await consolidateSubjectChapters(ROOT, subject, MAPS[subject as keyof typeof MAPS]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});