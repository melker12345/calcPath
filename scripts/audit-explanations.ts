/**
 * Audit topic explanation quality across all module.mdx files under content/.
 *
 * Flags mechanical quality issues that warrant a human/agent review:
 *  - Duplicate or near-duplicate paragraphs within the same file (e.g. ELI5 blocks
 *    that were accidentally pasted twice).
 *  - "Thinking-out-loud" phrasing that should never appear in a finished explanation
 *    ("wait", "let me recalculate", "oops", "actually no", etc.).
 *  - Repeated section anchors / headings.
 *  - Empty sections (a heading immediately followed by another heading).
 *
 * Run: npx tsx scripts/audit-explanations.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

const THINKING_OUT_LOUD =
  /\b(wait,|let me recalculate|let me recompute|let me redo|oops|actually,? no\b|i made a mistake|scratch that|on second thought|never mind)\b/i;

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return Promise.resolve([full]);
    }),
  );
  return nested.flat();
}

function normalizeParagraph(p: string): string {
  return p
    .replace(/\s+/g, " ")
    .replace(/^[-*\d.\s]+/, "")
    .trim()
    .toLowerCase();
}

type Issue = { kind: string; detail: string };

function auditFile(raw: string): Issue[] {
  const issues: Issue[] = [];
  const lines = raw.split("\n");

  // Thinking-out-loud
  lines.forEach((line, i) => {
    if (THINKING_OUT_LOUD.test(line)) {
      issues.push({ kind: "thinking-out-loud", detail: `L${i + 1}: ${line.trim().slice(0, 140)}` });
    }
  });

  // Duplicate paragraphs (block separated by blank lines)
  const paragraphs = raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const seen = new Map<string, number>();
  paragraphs.forEach((p, idx) => {
    const norm = normalizeParagraph(p);
    if (norm.length < 40) return; // ignore short fragments / headings
    if (seen.has(norm)) {
      issues.push({
        kind: "duplicate-paragraph",
        detail: `paragraph #${idx} duplicates #${seen.get(norm)}: "${p.slice(0, 120).replace(/\n/g, " ")}"`,
      });
    } else {
      seen.set(norm, idx);
    }
  });

  // Per-section duplicate ELI5: a single section (between ## headings) should not
  // contain more than one **ELI5** marker. This catches the inline-then-bullet
  // paste duplication bug.
  {
    let currentHeading = "(top)";
    let headingLine = 0;
    let eliCount = 0;
    const flush = () => {
      if (eliCount > 1) {
        issues.push({ kind: "duplicate-eli5-in-section", detail: `L${headingLine}: "${currentHeading}" has ${eliCount} ELI5 blocks` });
      }
    };
    lines.forEach((line, i) => {
      if (/^##\s/.test(line)) {
        flush();
        currentHeading = line.replace(/^#+\s/, "").trim();
        headingLine = i + 1;
        eliCount = 0;
      }
      if (/\*\*ELI5\*\*/.test(line)) eliCount += 1;
    });
    flush();
  }

  // Sentence-level duplication within the file (same sentence appearing twice).
  {
    const sentences = raw
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.replace(/^[-*\d.\s]+/, "").replace(/\*\*ELI5\*\*:?/i, "").trim());
    const sSeen = new Map<string, number>();
    sentences.forEach((s) => {
      const norm = s.replace(/\s+/g, " ").toLowerCase();
      if (norm.length < 60) return;
      sSeen.set(norm, (sSeen.get(norm) ?? 0) + 1);
    });
    for (const [norm, count] of sSeen) {
      if (count > 1) issues.push({ kind: "duplicate-sentence", detail: `x${count}: "${norm.slice(0, 100)}"` });
    }
  }

  // Prose-in-math: a $...$ span whose content reads like an English sentence
  // (3+ lowercase words in a row) usually means an unescaped currency $ silently
  // turned prose into math. KaTeX renders it without error, so validate-latex misses it.
  {
    const mathRe = /(?<!\\)\$([^$\n]{1,120}?)(?<!\\)\$/g;
    let m: RegExpExecArray | null;
    while ((m = mathRe.exec(raw)) !== null) {
      const inner = m[1];
      // 3+ consecutive plain English words (no math symbols between them)
      if (/\b[a-z]{2,}\s+[a-z]{2,}\s+[a-z]{2,}\b/.test(inner) && !/[\\^_{}=]/.test(inner)) {
        const line = raw.slice(0, m.index).split("\n").length;
        issues.push({ kind: "prose-in-math", detail: `L${line}: $${inner}$` });
      }
    }
  }

  // Raw LaTeX outside math delimiters: the renderer only understands $...$ and
  // $$...$$. A LaTeX command (\frac, \sqrt, \bar, ...) or \[ \] / \( \) display
  // delimiter sitting OUTSIDE dollars renders as literal backslash text.
  {
    // Blank out multi-line $$...$$ blocks first (keep newlines so line numbers stay correct).
    const rawNoBlocks = raw.replace(/\$\$[\s\S]*?\$\$/g, (m) => m.replace(/[^\n]/g, " "));
    // Remove fenced code, then blank out all $...$ spans and \$ escapes so we only inspect prose.
    const lines2 = rawNoBlocks.split("\n");
    let inFrontmatter = false;
    lines2.forEach((rawLine, i) => {
      if (i === 0 && rawLine.trim() === "---") { inFrontmatter = true; return; }
      if (inFrontmatter) { if (rawLine.trim() === "---") inFrontmatter = false; return; }
      // strip math spans + escapes from this line
      const stripped = rawLine
        .replace(/\\\$/g, "")
        .replace(/\$\$[\s\S]*?\$\$/g, "")
        .replace(/\$[^$\n]*?\$/g, "");
      const cmd = stripped.match(/\\(frac|sqrt|bar|vec|cdot|times|pm|mp|sum|int|lim|infty|alpha|beta|gamma|theta|lambda|sigma|pi|leq|geq|neq|left|right|begin|partial|nabla)\b/);
      if (cmd) {
        issues.push({ kind: "raw-latex-outside-math", detail: `L${i + 1}: ...${stripped.trim().slice(0, 90)}...` });
      } else if (/\\\[|\\\]|\\\(|\\\)/.test(stripped)) {
        issues.push({ kind: "display-delim-unsupported", detail: `L${i + 1}: ${stripped.trim().slice(0, 90)}` });
      }
    });
  }

  // Duplicate section anchors
  const anchors = [...raw.matchAll(/<!--\s*section:\s*([^\s]+)\s*-->/g)].map((m) => m[1]);
  const aSeen = new Set<string>();
  for (const a of anchors) {
    if (aSeen.has(a)) issues.push({ kind: "duplicate-section-anchor", detail: a });
    aSeen.add(a);
  }

  // Empty sections: heading directly followed (only blank/anchor) by another heading
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && (lines[j].trim() === "" || /^<!--/.test(lines[j].trim()))) j++;
      if (j < lines.length && /^#{1,6}\s/.test(lines[j])) {
        issues.push({ kind: "empty-section", detail: `L${i + 1}: ${lines[i].trim()}` });
      }
    }
  }

  return issues;
}

async function main() {
  const files = (await walk(CONTENT)).filter((f) => f.endsWith("module.mdx"));
  files.sort();
  let total = 0;
  const byKind: Record<string, number> = {};
  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const issues = auditFile(raw);
    if (issues.length === 0) continue;
    const rel = path.relative(ROOT, file);
    console.log(`\n=== ${rel} (${issues.length}) ===`);
    for (const issue of issues) {
      console.log(`  [${issue.kind}] ${issue.detail}`);
      byKind[issue.kind] = (byKind[issue.kind] ?? 0) + 1;
      total += 1;
    }
  }
  console.log(`\n---\nTotal issues: ${total}`);
  console.log(Object.entries(byKind).map(([k, v]) => `  ${k}: ${v}`).join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
