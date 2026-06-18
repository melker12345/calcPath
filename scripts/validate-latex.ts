/**
 * Validates that every LaTeX fragment in content renders under KaTeX, mirroring
 * what <MathText> does at runtime (normalizeMathText -> same $/$$ splitter ->
 * KaTeX). Scans all content JSON string fields and all .mdx note files.
 *
 * Run: npx tsx scripts/validate-latex.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import katex from "katex";
import { normalizeMathText } from "../src/lib/math-text-normalize";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

// Same matcher <MathText>'s splitMath uses.
const MATH_RE = /(?<!\\)(\$\$([\s\S]*?)(?<!\\)\$\$|\$([\s\S]*?)(?<!\\)\$)/g;

type Frag = { value: string; display: boolean };

function extractFragments(text: string): Frag[] {
  const out: Frag[] = [];
  const normalized = normalizeMathText(text);
  let m: RegExpExecArray | null;
  MATH_RE.lastIndex = 0;
  while ((m = MATH_RE.exec(normalized)) !== null) {
    if (m[0].startsWith("$$")) out.push({ value: m[2] ?? "", display: true });
    else out.push({ value: m[3] ?? "", display: false });
  }
  return out;
}

function collectStrings(node: unknown, acc: string[]) {
  if (typeof node === "string") acc.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectStrings(n, acc));
  else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectStrings(v, acc);
  }
}

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

type Failure = { source: string; fragment: string; display: boolean; error: string };

function tryRender(frag: Frag): string | null {
  try {
    katex.renderToString(frag.value, {
      throwOnError: true,
      strict: false,
      displayMode: frag.display,
    });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message.split("\n")[0] : String(e);
  }
}

async function main() {
  const files = await walk(CONTENT);
  const failures: Failure[] = [];
  let fragCount = 0;
  const seen = new Set<string>();

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const raw = await fs.readFile(file, "utf8");

    let texts: string[] = [];
    if (file.endsWith(".json")) {
      try {
        collectStrings(JSON.parse(raw), texts);
      } catch {
        continue;
      }
    } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
      texts = [raw];
    } else {
      continue;
    }

    for (const t of texts) {
      for (const frag of extractFragments(t)) {
        const key = `${frag.display ? "B" : "I"}:${frag.value}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fragCount += 1;
        const err = tryRender(frag);
        if (err) failures.push({ source: rel, fragment: frag.value, display: frag.display, error: err });
      }
    }
  }

  console.log(`Checked ${fragCount} unique LaTeX fragments across content/\n`);
  if (failures.length === 0) {
    console.log("All LaTeX fragments render under KaTeX.");
    process.exitCode = 0;
    return;
  }

  console.log(`${failures.length} fragment(s) failed to render:\n`);
  for (const f of failures.slice(0, 200)) {
    console.log(`  [${f.display ? "block" : "inline"}] ${f.source}`);
    console.log(`      ${JSON.stringify(f.fragment)}`);
    console.log(`      -> ${f.error}`);
  }
  if (failures.length > 200) console.log(`  ...and ${failures.length - 200} more.`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
