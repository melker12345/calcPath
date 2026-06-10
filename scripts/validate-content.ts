#!/usr/bin/env node
/**
 * content:validate
 * Run with: npx tsx scripts/validate-content.ts
 * Checks:
 *  - All subject/topic JSONs validate against Zod schemas
 *  - 1:1 between subject index topics[] and topics/ folders
 *  - Every question.section exactly matches a section slug derived from its topic's module.mdx
 *    (## + {#slug} or following <!-- section: slug --> ; skips Common Mistakes)
 *  - No duplicate problem ids across a topic
 *  - Basic MDX structure (frontmatter, #, at least one ##)
 * Exits 1 on any errors. Warnings for nice-to-haves (ELI5 / **Worked Example:** presence — recommended but parser is resilient + supports `minimal: true` frontmatter to opt out per-topic).
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import type { Dirent } from "fs";

import {
  SubjectIndexSchema,
  TopicIndexSchema,
  QuestionFileSchema,
  DiagnosticFileSchema,
} from "../src/lib/content/schema";
import type {
  SubjectIndex,
  QuestionFile,
  DiagnosticFile,
} from "../src/lib/content/schema";
import { extractMdxSectionSlugs } from "../src/lib/content/mdx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");

function hasMarker(source: string, re: RegExp): boolean {
  return re.test(source);
}

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  let dirents: Dirent[] = [];
  try {
    dirents = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  } catch {
    console.error("Cannot read content/ dir");
    process.exit(1);
  }

  const subjectSlugs = dirents
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => name !== "ARCHITECTURE.md"); // just in case

  for (const slug of subjectSlugs) {
    const subjDir = path.join(CONTENT_DIR, slug);
    const idxPath = path.join(subjDir, "index.json");

    let subjectIndex: SubjectIndex;
    try {
      const raw = await fs.readFile(idxPath, "utf8");
      subjectIndex = SubjectIndexSchema.parse(JSON.parse(raw));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${slug}/index.json: ${msg}`);
      continue;
    }

    const declaredTopics = subjectIndex.topics || [];
    const declaredIds = new Set(declaredTopics.map((t) => t.id));

    // discover actual topic folders
    let actualTopicDirs: string[] = [];
    try {
      const tdir = path.join(subjDir, "topics");
      const entries = await fs.readdir(tdir, { withFileTypes: true });
      actualTopicDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {}

    // bidirectional check
    for (const tid of Array.from(declaredIds) as string[]) {
      if (!actualTopicDirs.includes(tid)) {
        errors.push(`${slug}: topic "${tid}" declared in index.json but no topics/${tid}/ dir`);
      }
    }
    for (const dir of actualTopicDirs) {
      if (!declaredIds.has(dir)) {
        warnings.push(`${slug}: topics/${dir}/ exists but not listed in index.json topics[]`);
      }
    }

    // optional diagnostic.json
    const diagnosticPath = path.join(subjDir, "diagnostic.json");
    if (await fs.access(diagnosticPath).then(() => true).catch(() => false)) {
      try {
        const raw = JSON.parse(await fs.readFile(diagnosticPath, "utf8"));
        const diagnostic: DiagnosticFile = DiagnosticFileSchema.parse(raw);

        if (diagnostic.targetSubject !== slug) {
          errors.push(`${slug}/diagnostic.json: targetSubject "${diagnostic.targetSubject}" must match subject slug "${slug}"`);
        }

        const prerequisiteIds = new Set(diagnostic.prerequisites.map((p) => p.id));
        const diagnosticQuestionIds = new Set<string>();

        for (const question of diagnostic.questions) {
          if (!prerequisiteIds.has(question.prerequisiteId)) {
            errors.push(`${slug}/diagnostic.json: question "${question.id}" references unknown prerequisite "${question.prerequisiteId}"`);
          }
          if (diagnosticQuestionIds.has(question.id)) {
            errors.push(`${slug}/diagnostic.json: duplicate question id "${question.id}"`);
          }
          diagnosticQuestionIds.add(question.id);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${slug}/diagnostic.json: ${msg}`);
      }
    }

    // per topic
    const allProblemIds = new Set<string>();

    for (const tmeta of declaredTopics) {
      const tid = tmeta.id;
      const tdir = path.join(subjDir, "topics", tid);
      const qpath = path.join(tdir, "questions.json");
      const mpath = path.join(tdir, "module.mdx");
      const tipath = path.join(tdir, "index.json");

      // topic index optional but validate if present
      if (await fs.access(tipath).then(() => true).catch(() => false)) {
        try {
          const raw = JSON.parse(await fs.readFile(tipath, "utf8"));
          TopicIndexSchema.parse(raw);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`${slug}/topics/${tid}/index.json: ${msg}`);
        }
      }

      // questions
      let questions: QuestionFile[] = [];
      try {
        const raw = JSON.parse(await fs.readFile(qpath, "utf8"));
        // tolerant like loader
        const valid: QuestionFile[] = [];
        for (const item of Array.isArray(raw) ? raw : []) {
          const res = QuestionFileSchema.safeParse(item);
          if (res.success) valid.push(res.data);
          else {
            errors.push(`${slug}/topics/${tid}/questions.json: invalid item ${item?.id || "?"} - ${res.error.issues.map((i: { message: string }) => i.message).join("; ")}`);
          }
        }
        questions = valid;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${slug}/topics/${tid}/questions.json: ${msg}`);
        continue;
      }

      // inject topicId like loader (for check)
      questions = questions.map((q) => ({ ...q, topicId: q.topicId ?? tid }));

      // dup ids in topic
      for (const q of questions) {
        if (allProblemIds.has(q.id)) {
          errors.push(`${slug}/topics/${tid}: duplicate problem id "${q.id}" (global per subject)`);
        }
        allProblemIds.add(q.id);
      }

      // mdx
      let mdx = "";
      try {
        mdx = await fs.readFile(mpath, "utf8");
      } catch {
        errors.push(`${slug}/topics/${tid}/module.mdx: missing or unreadable`);
        continue;
      }

      // basic mdx structure
      if (!/^---[\s\S]*?title:/.test(mdx)) {
        warnings.push(`${slug}/topics/${tid}/module.mdx: missing frontmatter title`);
      }
      if (!/^#\s+/m.test(mdx)) {
        errors.push(`${slug}/topics/${tid}/module.mdx: missing top-level # title`);
      }
      const h2count = (mdx.match(/^##\s+/gm) || []).length;
      if (h2count < 1) {
        warnings.push(`${slug}/topics/${tid}/module.mdx: no ## sections`);
      }

      // section matching (the critical one) — now uses the shared canonical implementation
      // so it is guaranteed identical to what deriveModuleStructureFromBundle and adapters produce.
      const msecs = extractMdxSectionSlugs(mdx);
      const qsecs = [...new Set(questions.map((q) => q.section).filter(Boolean))];
      for (const qs of qsecs) {
        if (!msecs.includes(qs)) {
          errors.push(`${slug}/topics/${tid}/questions.json: section "${qs}" has no matching mdx section (add <!-- section: ${qs} --> after the relevant ## or use {#${qs}})`);
        }
      }

      // optional nice markers (recommended for best UX cards per ARCHITECTURE.md)
      // Parser in adapters.ts is resilient and will still populate examples[]/eli5 from auto-detect (### Example, Step 1:, variants, etc.)
      // so missing markers do not degrade runtime UX. To silence warnings for intentionally thin/minimal topics, add `minimal: true` to frontmatter.
      const intentionallyMinimal = /minimal:\s*true/i.test(mdx) || /<!--\s*intentionally.?minimal/i.test(mdx);
      if (!intentionallyMinimal) {
        if (!hasMarker(mdx, /\*\*ELI5/i)) {
          warnings.push(`${slug}/topics/${tid}/module.mdx: no **ELI5** found (some sections may lack rich ELI5 box; parser resilient)`);
        }
        if (!hasMarker(mdx, /\*\*Worked Example/i)) {
          warnings.push(`${slug}/topics/${tid}/module.mdx: no **Worked Example:** found (parser will auto-detect examples for cards)`);
        }
      }
    }
  }

  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log("  " + w));
  }

  if (errors.length) {
    console.error("\nErrors:");
    errors.forEach((e) => console.error("  " + e));
    console.error(`\n${errors.length} error(s). Fix and re-run.`);
    process.exit(1);
  }

  console.log("\n✅ content/ validation passed.");
  if (warnings.length) console.log(`   (${warnings.length} warnings)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
