#!/usr/bin/env npx tsx
/**
 * Generate diagnostic.json for tier-1 subjects: precalculus, real-analysis,
 * abstract-algebra, and number-theory.
 *
 * Run: npx tsx scripts/seed-tier1-diagnostics.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { DiagnosticFileSchema, type DiagnosticFile } from "@/lib/content/schema";
import { ABSTRACT_ALGEBRA } from "./diagnostic-banks/abstract-algebra";
import { NUMBER_THEORY } from "./diagnostic-banks/number-theory";
import { REAL_ANALYSIS } from "./diagnostic-banks/real-analysis";
import type { SubjectSpec } from "./seed-tier1-diagnostics-types";
import { buildDiagnostic } from "./seed-tier1-diagnostics-lib";
import { PRECALCULUS } from "./diagnostic-banks/precalculus";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SUBJECTS: SubjectSpec[] = [
  PRECALCULUS,
  REAL_ANALYSIS,
  ABSTRACT_ALGEBRA,
  NUMBER_THEORY,
];

async function writeDiagnostic(spec: SubjectSpec): Promise<number> {
  const diagnostic: DiagnosticFile = buildDiagnostic(spec);
  DiagnosticFileSchema.parse(diagnostic);

  const outPath = path.join(ROOT, "content", spec.slug, "diagnostic.json");
  await fs.writeFile(outPath, JSON.stringify(diagnostic, null, 2) + "\n");
  console.log(
    `${spec.slug}: wrote ${diagnostic.questions.length} questions across ${diagnostic.prerequisites.length} prerequisites`,
  );
  return diagnostic.questions.length;
}

async function main() {
  let total = 0;
  for (const spec of SUBJECTS) {
    total += await writeDiagnostic(spec);
  }
  console.log(`Done. ${total} questions across ${SUBJECTS.length} subjects.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});