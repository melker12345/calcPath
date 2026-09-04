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
import {
  MATH_BLOCK_SPECS,
  isMathBlockClose,
  type MathBlockSpec,
} from "../src/lib/content/math-blocks";

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

      // Two ## sections deriving the same slug is a silent data bug: questions,
      // deep links (?section=) and per-section progress can only resolve to the
      // first one, so the other section's questions are stranded.
      const sectionCounts = new Map<string, number>();
      for (const slug of extractMdxSectionSlugs(mdx)) {
        sectionCounts.set(slug, (sectionCounts.get(slug) ?? 0) + 1);
      }
      for (const [slug, count] of sectionCounts) {
        if (count > 1) {
          const stranded = questions.filter((q) => q.section === slug).length;
          warnings.push(
            `${slug}/topics/${tid}/module.mdx: ${count} sections share the slug "${slug}"` +
              (stranded ? ` — ${stranded} question(s) cannot tell them apart` : "") +
              ` (give each an explicit {#slug} or <!-- section: --> marker)`
          );
        }
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

      // math-book environments (::: fences, see content/STYLE.md)
      // A mistyped kind or a missing closer silently degrades to plain prose at
      // runtime, so both are caught here instead of on the page.
      const mdxLines = mdx.split(/\r?\n/);
      let openFence: { kind: string; line: number } | null = null;
      for (let li = 0; li < mdxLines.length; li++) {
        const line = mdxLines[li].trim();
        if (!line.startsWith(":::")) continue;
        if (isMathBlockClose(line)) {
          if (!openFence) {
            errors.push(`${slug}/topics/${tid}/module.mdx:${li + 1}: closing ":::" with no open environment`);
          }
          openFence = null;
          continue;
        }
        const opener = line.match(/^:::([a-zA-Z]+)/);
        if (!opener) {
          errors.push(`${slug}/topics/${tid}/module.mdx:${li + 1}: malformed environment fence "${line}"`);
          continue;
        }
        const kind = opener[1];
        if (!(MATH_BLOCK_SPECS as Record<string, MathBlockSpec>)[kind]) {
          errors.push(
            `${slug}/topics/${tid}/module.mdx:${li + 1}: unknown environment ":::${kind}" (known: ${Object.keys(MATH_BLOCK_SPECS).join(", ")})`
          );
          continue;
        }
        if (openFence) {
          errors.push(
            `${slug}/topics/${tid}/module.mdx:${li + 1}: ":::${kind}" opened inside ":::${openFence.kind}" (line ${openFence.line}) — environments do not nest`
          );
        }
        openFence = { kind, line: li + 1 };
      }
      if (openFence) {
        errors.push(`${slug}/topics/${tid}/module.mdx: ":::${openFence.kind}" (line ${openFence.line}) is never closed`);
      }

      // optional nice markers (recommended for best UX cards per ARCHITECTURE.md)
      // Parser in adapters.ts is resilient and will still populate examples[]/eli5 from auto-detect (### Example, Step 1:, variants, etc.)
      // so missing markers do not degrade runtime UX. To silence warnings for intentionally thin/minimal topics, add `minimal: true` to frontmatter.
      const intentionallyMinimal = /minimal:\s*true/i.test(mdx) || /<!--\s*intentionally.?minimal/i.test(mdx);
      if (!intentionallyMinimal) {
        if (!hasMarker(mdx, /\*\*ELI5/i) && !hasMarker(mdx, /^:::intuition\b/m)) {
          warnings.push(`${slug}/topics/${tid}/module.mdx: no **ELI5** or :::intuition found (some sections may lack an intuition aside; parser resilient)`);
        }
        if (!hasMarker(mdx, /\*\*Worked Example/i) && !hasMarker(mdx, /^:::example\b/m)) {
          warnings.push(`${slug}/topics/${tid}/module.mdx: no **Worked Example:** or :::example found (parser will auto-detect examples)`);
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
