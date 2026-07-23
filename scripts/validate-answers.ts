/**
 * Validates the answer-grading pipeline against real content.
 *
 *  1. Self-validation: every stored canonical answer must be graded CORRECT
 *     when submitted verbatim (catches answers the grader can't even parse).
 *  2. Equivalence suite: a fixed set of (input, expected) pairs that SHOULD be
 *     accepted (value vs expression forms) and a set that SHOULD be rejected,
 *     proving the equivalence engine behaves.
 *
 * Run: npx tsx scripts/validate-answers.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { isAnswerCorrectAsync } from "../src/lib/answer-check";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

type Question = {
  id?: string;
  topicId?: string;
  type?: string;
  answer?: unknown;
  choices?: unknown;
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return Promise.resolve(full.endsWith(".json") ? [full] : []);
    }),
  );
  return files.flat();
}

type Loaded = { source: string; q: Question };

async function loadAllQuestions(): Promise<Loaded[]> {
  const all = await walk(CONTENT);
  const out: Loaded[] = [];

  for (const file of all) {
    const rel = path.relative(ROOT, file);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      continue;
    }

    // Practice questions: top-level array.
    if (Array.isArray(parsed) && file.endsWith("questions.json")) {
      for (const q of parsed as Question[]) out.push({ source: rel, q });
    }

    // Diagnostic files: { questions: [...] }.
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { questions?: unknown }).questions)
    ) {
      for (const q of (parsed as { questions: Question[] }).questions) {
        out.push({ source: rel, q });
      }
    }
  }
  return out;
}

async function selfValidate(items: Loaded[]) {
  const failures: Array<{ source: string; id: string; type: string; answer: string }> = [];
  let checked = 0;

  for (const { source, q } of items) {
    if (typeof q.answer !== "string" || q.answer.trim() === "") continue;
    checked += 1;
    const ok = await isAnswerCorrectAsync(q.answer, q.answer);
    if (!ok) {
      failures.push({
        source,
        id: q.id ?? "(no id)",
        type: q.type ?? "(no type)",
        answer: q.answer,
      });
    }
  }
  return { checked, failures };
}

async function equivalenceSuite() {
  // Pairs that MUST be accepted (user input, expected answer).
  const shouldAccept: Array<[string, string]> = [
    ["3", "3"],
    ["3", "3.0"],
    ["5-2", "3"],
    ["1+2", "3"],
    ["4/6", "2/3"],
    ["0.5", "1/2"],
    ["1/2", "0.5"],
    ["x*2", "2x"],
    ["2*x", "2x"],
    ["sqrt(4)", "2"],
    ["\\frac{1}{2}", "0.5"],
    ["2^3", "8"],
    ["x^2", "x*x"],
    ["sin(x)^2+cos(x)^2", "1"],
    ["5.48", "\\sqrt{30}"],
  ];
  // Pairs that MUST be rejected.
  const shouldReject: Array<[string, string]> = [
    ["4", "3"],
    ["x", "2x"],
    ["1/3", "2/3"],
    ["x^2", "x^3"],
  ];

  const accepts: string[] = [];
  for (const [a, b] of shouldAccept) {
    const ok = await isAnswerCorrectAsync(a, b);
    if (!ok) accepts.push(`  EXPECTED ACCEPT but rejected:  "${a}"  ==  "${b}"`);
  }
  const rejects: string[] = [];
  for (const [a, b] of shouldReject) {
    const ok = await isAnswerCorrectAsync(a, b);
    if (ok) rejects.push(`  EXPECTED REJECT but accepted:  "${a}"  !=  "${b}"`);
  }
  return { accepts, rejects, total: shouldAccept.length + shouldReject.length };
}

async function main() {
  const items = await loadAllQuestions();
  console.log(`Loaded ${items.length} questions from content/\n`);

  console.log("== Equivalence suite ==");
  const suite = await equivalenceSuite();
  if (suite.accepts.length === 0 && suite.rejects.length === 0) {
    console.log(`All ${suite.total} equivalence cases behaved as expected.\n`);
  } else {
    [...suite.accepts, ...suite.rejects].forEach((l) => console.log(l));
    console.log(`\n${suite.accepts.length + suite.rejects.length} of ${suite.total} equivalence cases FAILED.\n`);
  }

  console.log("== Self-validation (every stored answer must grade itself correct) ==");
  const { checked, failures } = await selfValidate(items);
  console.log(`Checked ${checked} string answers.`);
  if (failures.length === 0) {
    console.log("All stored answers self-validate.\n");
  } else {
    console.log(`${failures.length} answers do NOT self-validate:\n`);
    for (const f of failures) {
      console.log(`  [${f.type}] ${f.id}  (${f.source})`);
      console.log(`      answer: ${JSON.stringify(f.answer)}`);
    }
    console.log("");
  }

  const failed = suite.accepts.length + suite.rejects.length + failures.length;
  process.exitCode = failed > 0 ? 1 : 0;
  console.log(failed > 0 ? `DONE with ${failed} issue(s).` : "DONE — no issues.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
