/**
 * Validates the answer-grading pipeline against real content.
 *
 *  1. Self-validation: every stored canonical answer must be graded CORRECT
 *     when submitted verbatim (catches answers the grader can't even parse).
 *  2. Equivalence suite: a fixed set of (input, expected) pairs that SHOULD be
 *     accepted (value vs expression forms) and a set that SHOULD be rejected,
 *     proving the equivalence engine behaves.
 *  3. Respelling sweep: for every stored answer, a set of meaning-preserving
 *     respellings a real learner would type (MathQuill braces, \cdot, spaces,
 *     "y=" prefixes, ** powers, a trailing period) must all grade CORRECT.
 *     Self-validation alone cannot catch a false negative — an answer always
 *     matches itself by string equality — which is why a whole class of
 *     wrongly-rejected correct answers went unnoticed.
 *  4. MCQ sweep: for every multiple-choice question the keyed choice must grade
 *     CORRECT and every distractor must grade INCORRECT.
 *  5. Cross-question sweep: one question's answer must not grade CORRECT for a
 *     different question in the same topic. This is what catches normalization
 *     that throws information away (deleting an unknown LaTeX command once made
 *     "p \\land \\neg p" and "p \\lor \\neg p" the same string). Pairs where both
 *     answers are numeric are exempt — 3^2 and 9 ARE the same answer, and how
 *     close two numbers must be is the tolerance rules' business, covered by the
 *     equivalence suite above.
 *
 * Run: npx tsx scripts/validate-answers.ts
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import * as math from "mathjs";
import { isAnswerCorrectAsync, isMcqAnswerCorrect } from "../src/lib/answer-check";

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
    // Regressions from a "typed answer right but it came out wrong" report on
    // /calculus/practice/derivatives.
    ["3e^{3x}", "3*e^(3*x)"],
    ["3\\cdot e^{3x}", "3*e^(3*x)"],
    ["e^{2x}\\cdot 8", "8*e^(2*x)"],
    ["2xln(x)+x", "2*x*ln(x)+x"],
    ["2x\\ln\\left(x\\right)+x", "2*x*ln(x)+x"],
    ["\\frac{2}{\\sqrt{1-4x^2}}", "2/sqrt(1-4*x^2)"],
    ["f'(x)=15x^2", "15*x^2"],
    ["y'=15x^2", "15*x^2"],
    ["dy/dx=-x/y", "-x/y"],
    ["15*x**2", "15*x^2"],
    ["15x\u00b2", "15*x^2"],
    ["15x^2.", "15*x^2"],

    // Symbols: LaTeX, keyboard and Unicode spellings are one answer.
    ["x >= 4", "x \\ge 4"],
    ["x \u2265 4", "x \\ge 4"],
    ["x \\geq 4", "x \\ge 4"],
    ["R", "$\\mathbb{R}$"],
    ["\\theta = \\pi/4", "\u03b8 = \u03c0/4"],
    ["r=\\sqrt{2}", "r=\u221a2"],

    // Rounding: a learner may answer to fewer decimals than the stored answer
    // carries, as long as it is the correct rounding (few prompts state a
    // precision, so the stored precision cannot be held against them).
    ["0.3", "0.333"],
    ["1/6", "0.167"],
    ["0.6592", "0.659"],

    // Labels: omitted, or spelled another way for the same thing.
    ["-3", "x = -3"],
    ["f(x)=2x", "y=2x"],
    ["dy/dx=-x/y", "y'=-x/y"],

    // Comma lists have no inherent order.
    ["-1,1", "1,-1"],
    ["1, -1", "1,-1"],
    ["3,3,2,1", "1,2,3,3"],
    ["3,-3", "x = 3, x = -3"],
  ];
  // Pairs that MUST be rejected.
  const shouldReject: Array<[string, string]> = [
    ["4", "3"],
    ["x", "2x"],
    ["1/3", "2/3"],
    ["x^2", "x^3"],
    // The brace fix must not make e^{3x} and e^3*x the same expression.
    ["3*e^3*x", "3*e^(3*x)"],
    ["2*x*ln(x)", "2*x*ln(x)+x"],

    // Opposite symbols must not collapse onto each other.
    ["x \\le 4", "x \\ge 4"],
    ["x <= 4", "x >= 4"],
    ["$p \\land \\neg p$", "$p \\lor \\neg p$"],
    ["$\\neg p \\lor q$", "$\\neg p \\lor \\neg q$"],
    ["$A \\cup B$", "$A \\cap B$"],
    ["$x \\in A$", "$x \\notin A$"],
    ["$\\{1,3\\} \\in S$", "$\\{1,3\\} \\subseteq S$"],

    // Rounding is not a licence for a neighbouring value: 0.25 rounds to 0.3.
    ["0.25", "0.2"],
    ["0.2", "0.25"],

    // A different label is a different answer.
    ["y = -3", "x = -3"],
    ["N=10", "T=10"],
    ["x=3, y=-1", "x=-1, y=3"],

    // Lists still have to contain the right values.
    ["1,2", "1,-1"],
    ["1,2,3", "1,2,3,3"],
    ["(2,-1)", "(-1,2)"],
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

/**
 * Meaning-preserving respellings of a stored answer. Every one of these is the
 * same mathematics (or the same prose) as the original, so every one must be
 * accepted. They are the shapes the answer widget and real keyboards produce.
 */
function respellings(answer: string): Array<{ label: string; value: string }> {
  const variants: Array<{ label: string; value: string }> = [];

  const spaced = answer.replace(/([+\-*/^=])/g, " $1 ");
  if (spaced !== answer) variants.push({ label: "spaces around operators", value: spaced });

  if (!answer.trimEnd().endsWith(".")) {
    variants.push({ label: "trailing period", value: `${answer}.` });
  }

  // MathQuill wraps every exponent longer than one character in braces, and
  // wraps single-character ones when they come from pasted LaTeX.
  const braced = answer
    .replace(/\^\(([^()]*)\)/g, "^{$1}")
    .replace(/\^([A-Za-z0-9])(?![A-Za-z0-9])/g, "^{$1}");
  if (braced !== answer) variants.push({ label: "MathQuill braces in exponent", value: braced });

  if (answer.includes("*")) {
    variants.push({ label: "\\cdot for *", value: answer.replace(/\*/g, "\\cdot ") });
    variants.push({ label: "** for ^", value: answer.replace(/\^/g, "**") });
  }

  // Only a single expression can sensibly carry a label; "y=x = 6 or x = -6"
  // is not something a learner would type.
  if (!/[=,]|\s(or|and)\s/i.test(answer)) {
    variants.push({ label: '"y=" label prefix', value: `y=${answer}` });
  }

  return variants;
}

async function respellingSweep(items: Loaded[], limit: number | null) {
  const failures: string[] = [];
  let checked = 0;
  let considered = 0;

  for (const { source, q } of items) {
    if (typeof q.answer !== "string" || q.answer.trim() === "") continue;
    if (q.type === "mcq") continue; // graded by identity, not by equivalence
    considered += 1;
    if (limit !== null && considered > limit) break;

    for (const variant of respellings(q.answer)) {
      checked += 1;
      const ok = await isAnswerCorrectAsync(variant.value, q.answer);
      if (!ok) {
        failures.push(
          `  ${q.id ?? "(no id)"} (${source})\n      stored: ${JSON.stringify(q.answer)}\n      typed:  ${JSON.stringify(variant.value)}  [${variant.label}]`
        );
      }
    }
  }
  return { checked, failures };
}

async function mcqSweep(items: Loaded[]) {
  const failures: string[] = [];
  let questions = 0;
  let checked = 0;

  for (const { source, q } of items) {
    if (q.type !== "mcq" || typeof q.answer !== "string") continue;
    const choices = Array.isArray(q.choices) ? (q.choices as unknown[]).filter((c): c is string => typeof c === "string") : [];
    if (choices.length === 0) continue;
    questions += 1;

    const keyed = isMcqAnswerCorrect(q.answer, q.answer, choices);
    checked += 1;
    if (keyed !== true) {
      failures.push(`  ${q.id ?? "(no id)"} (${source}): keyed answer ${JSON.stringify(q.answer)} is not among its choices`);
      continue;
    }

    for (const choice of choices) {
      if (choice === q.answer) continue;
      checked += 1;
      if (isMcqAnswerCorrect(choice, q.answer, choices) !== false) {
        failures.push(
          `  ${q.id ?? "(no id)"} (${source}): distractor ${JSON.stringify(choice)} grades CORRECT against ${JSON.stringify(q.answer)}`
        );
      }
    }
  }
  return { questions, checked, failures };
}

/** Does this answer denote a plain number? Two numeric answers may coincide. */
const numericValue = (value: string): number | null => {
  const prepared = value
    .trim()
    .replace(/\$/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
    .replace(/[{}]/g, "")
    .replace(/\\pi/g, "pi");
  try {
    const evaluated = math.evaluate(prepared, {});
    const asNumber = typeof evaluated === "number" ? evaluated : Number(evaluated);
    return Number.isFinite(asNumber) ? asNumber : null;
  } catch {
    return null;
  }
};

async function crossQuestionSweep(items: Loaded[]) {
  const byTopic = new Map<string, Loaded[]>();
  for (const item of items) {
    const { q } = item;
    if (q.type === "mcq" || typeof q.answer !== "string" || q.answer.trim() === "") continue;
    const key = `${item.source}::${q.topicId ?? ""}`;
    const list = byTopic.get(key) ?? [];
    list.push(item);
    byTopic.set(key, list);
  }

  const failures: string[] = [];
  let pairs = 0;

  for (const group of byTopic.values()) {
    for (const a of group) {
      for (const b of group) {
        if (a.q.id === b.q.id) continue;
        const aAnswer = a.q.answer as string;
        const bAnswer = b.q.answer as string;
        if (aAnswer === bAnswer) continue; // two questions with the same answer
        // Two numeric answers may legitimately agree (3^2 and 9), and how close
        // counts is the tolerance rules' business, tested in the suite above.
        if (numericValue(aAnswer) !== null && numericValue(bAnswer) !== null) continue;
        pairs += 1;
        if (await isAnswerCorrectAsync(aAnswer, bAnswer)) {
          failures.push(
            `  ${a.q.id ?? "?"} answer ${JSON.stringify(aAnswer)} grades CORRECT for ${b.q.id ?? "?"} (expects ${JSON.stringify(bAnswer)})  — ${a.source}`
          );
        }
      }
    }
  }
  return { pairs, failures };
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

  console.log("== MCQ sweep (keyed choice correct, every distractor incorrect) ==");
  const mcq = await mcqSweep(items);
  console.log(`Checked ${mcq.checked} choices across ${mcq.questions} multiple-choice questions.`);
  if (mcq.failures.length === 0) {
    console.log("All multiple-choice questions grade their own choices correctly.\n");
  } else {
    mcq.failures.slice(0, 40).forEach((l) => console.log(l));
    if (mcq.failures.length > 40) console.log(`  ... and ${mcq.failures.length - 40} more`);
    console.log(`\n${mcq.failures.length} multiple-choice problem(s).\n`);
  }

  console.log("== Respelling sweep (a correct answer typed differently must still be correct) ==");
  // The full corpus takes a few seconds, so it is the default; --limit=N narrows
  // it while iterating on the grader.
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : null;
  const respell = await respellingSweep(items, limit);
  console.log(
    `Checked ${respell.checked} respellings${limit === null ? " (full corpus)" : ` (first ${limit} answers)`}.`
  );
  if (respell.failures.length === 0) {
    console.log("Every respelling was accepted.\n");
  } else {
    respell.failures.slice(0, 40).forEach((l) => console.log(l));
    if (respell.failures.length > 40) console.log(`  ... and ${respell.failures.length - 40} more`);
    console.log(`\n${respell.failures.length} respelling(s) wrongly rejected.\n`);
  }

  console.log("== Cross-question sweep (one question's answer must not pass for another) ==");
  const cross = await crossQuestionSweep(items);
  console.log(`Checked ${cross.pairs} answer pairs within topics.`);
  if (cross.failures.length === 0) {
    console.log("No answer collides with a different question's answer.\n");
  } else {
    cross.failures.slice(0, 40).forEach((l) => console.log(l));
    if (cross.failures.length > 40) console.log(`  ... and ${cross.failures.length - 40} more`);
    console.log(`\n${cross.failures.length} colliding pair(s).\n`);
  }

  const failed =
    cross.failures.length +
    suite.accepts.length +
    suite.rejects.length +
    failures.length +
    mcq.failures.length +
    respell.failures.length;
  process.exitCode = failed > 0 ? 1 : 0;
  console.log(failed > 0 ? `DONE with ${failed} issue(s).` : "DONE — no issues.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
