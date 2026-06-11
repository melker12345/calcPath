#!/usr/bin/env node
/**
 * @deprecated Use: npx tsx scripts/consolidate-subject-chapters.ts precalculus
 */
import path from "path";
import { fileURLToPath } from "url";
import { consolidateSubjectChapters } from "./lib/consolidate-chapters";
import { PRECALCULUS_CHAPTERS } from "./chapter-maps/precalculus";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

consolidateSubjectChapters(ROOT, "precalculus", PRECALCULUS_CHAPTERS).catch((err) => {
  console.error(err);
  process.exit(1);
});