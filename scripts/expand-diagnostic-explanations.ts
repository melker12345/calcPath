#!/usr/bin/env npx tsx
/**
 * Expand diagnostic explanations into Step 1 / Step 2 / Final answer format
 * where multi-step reasoning helps. Leaves simple one-step problems wrapped
 * in a single Step 1.
 *
 * Run: npx tsx scripts/expand-diagnostic-explanations.ts
 * Dry run: npx tsx scripts/expand-diagnostic-explanations.ts --dry-run
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { DiagnosticFileSchema } from "@/lib/content/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const DRY_RUN = process.argv.includes("--dry-run");

type Question = {
  id: string;
  explanation: string;
  answer: string;
  type: string;
  difficulty: string;
  prompt?: string;
};

function stripFinalAnswer(explanation: string): string {
  return explanation.replace(/\s*Final answer:\s*[\s\S]*$/i, "").trim();
}

function ensurePeriod(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function formatFinalAnswer(answer: string): string {
  const trimmed = answer.trim();
  if (!trimmed) return "";
  if (trimmed.includes("$")) return trimmed;
  const isProse =
    /[A-Za-z]\s+[A-Za-z]/.test(trimmed) ||
    (/^[A-Za-z][A-Za-z\s.,'();:-]+$/.test(trimmed) &&
      !/^[0-9+\-*/=^x().\\]+$/.test(trimmed));
  return isProse ? trimmed : `$${trimmed}$`;
}

function isTrivialOneStep(q: Question, body: string): boolean {
  if (q.difficulty !== "easy") return false;

  const plain = body.replace(/\$[^$]+\$/g, "").trim();

  if (q.type === "mcq") {
    return (
      plain.length <= 70 &&
      !/\bthen\b|;|Rightarrow|rightarrow|Step\s+\d/i.test(body) &&
      (plain.split(/[.!?]/).filter(Boolean).length <= 1)
    );
  }

  // Easy numeric: single substitution/evaluation
  return (
    plain.length <= 55 &&
    !/\bthen\b|;|Rightarrow|rightarrow/i.test(body) &&
    (plain.split(/[.!?]/).filter(Boolean).length <= 1)
  );
}

function capitalizeLead(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitIntoStepParts(body: string): string[] {
  const normalized = body.trim();
  if (!normalized) return [];

  // Arrow chain fully inside one math block: $a \Rightarrow b \Rightarrow c$
  const mathArrow = normalized.match(/^\$([\s\S]*?(?:\\Rightarrow|Rightarrow)[\s\S]*?)\.?$/);
  if (mathArrow) {
    const inner = mathArrow[1];
    const arrowParts = inner
      .split(/\s*(?:\\Rightarrow|Rightarrow)\s*/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (arrowParts.length >= 2) {
      return arrowParts.map((part, i) => {
        const cleaned = part.replace(/^\$+|\$+$/g, "").trim();
        const math = `$${cleaned}$`;
        if (i === 0) return ensurePeriod(`Start from ${math}`);
        if (i === arrowParts.length - 1) return ensurePeriod(`So ${math}`);
        return ensurePeriod(`This simplifies to ${math}`);
      });
    }
  }

  // Explicit arrow chains in prose or mixed math
  const arrowParts = normalized
    .split(/\s*(?:\\Rightarrow|Rightarrow)\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (arrowParts.length >= 2 && !arrowParts.some((p) => (p.match(/\$/g) ?? []).length % 2 === 1)) {
    return arrowParts.map((part, i) => {
      const cleaned = part.replace(/^\$+|\$+$/g, "").trim();
      const math = `$${cleaned}$`;
      if (i === 0) return ensurePeriod(`Start from ${math}`);
      if (i === arrowParts.length - 1) return ensurePeriod(`So ${math}`);
      return ensurePeriod(`This simplifies to ${math}`);
    });
  }

  // "..., cancel, then ..." style limit work
  const cancelThen = normalized.match(/^(.+?),\s*cancel,\s*then\s+(.+)$/i);
  if (cancelThen) {
    return [
      ensurePeriod(cancelThen[1].trim()),
      ensurePeriod("Cancel the common factor"),
      ensurePeriod(capitalizeLead(cancelThen[2].trim())),
    ];
  }

  // "..., then ..."
  const thenParts = normalized
    .split(/\s*,\s*then\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (thenParts.length >= 2) {
    return thenParts.map((p, i) => ensurePeriod(i === 0 ? p : capitalizeLead(p)));
  }

  // Semicolon-separated reasoning
  const semiParts = normalized
    .split(/\s*;\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (semiParts.length >= 2 && semiParts.every((p) => p.length >= 8)) {
    return semiParts.map(ensurePeriod);
  }

  // Multiple sentences with substantive follow-up
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length >= 2) {
    const hasWork =
      sentences.slice(1).some((s) =>
        /[=+\-*/^]|\\frac|\\sqrt|substitut|factor|simplif|divide|multiply|cancel|approach|squeeze|limit|solve/i.test(
          s,
        ),
      );
    if (hasWork || sentences.length >= 3) {
      return sentences.map(ensurePeriod);
    }
  }

  return [ensurePeriod(normalized)];
}

function shouldPreferMultiStep(q: Question, body: string): boolean {
  if (q.difficulty === "hard") return true;
  if (/\s*(?:\\Rightarrow|Rightarrow)\s*/.test(body)) return true;
  if (/\bthen\b|;/.test(body)) return true;
  if (q.type === "numeric" && q.difficulty === "medium") {
    return body.length > 40 || /[=]/.test(body);
  }
  if (body.split(/(?<=[.!?])\s+/).filter(Boolean).length >= 2) return true;
  return false;
}

/** Fix math delimiters broken by earlier arrow-chain splits. */
export function repairExplanationMath(explanation: string): string {
  return explanation
    .replace(/So ([^$][^.;]*)\$\./g, (_, inner: string) => `So $${inner.trim()}$.`)
    .replace(/So ([^$][^.;]*)\$;/g, (_, inner: string) => `So $${inner.trim()}$; then `)
    .replace(/This simplifies to ([^$][^.;]*)\$\./g, (_, inner: string) => `This simplifies to $${inner.trim()}$.`)
    .replace(/So ([^$]+)\$, so /g, (_, inner: string) => `So $${inner.trim()}$, which gives `);
}

export function expandExplanation(q: Question): string | null {
  const original = q.explanation.trim();
  if (/Step\s+1:/i.test(original)) return null;

  const existingFinal = original.match(/Final answer:\s*([\s\S]+?)\.?\s*$/i)?.[1]?.trim();
  const body = stripFinalAnswer(original);
  if (!body) return null;

  const finalAnswer = formatFinalAnswer(existingFinal ?? q.answer);
  let parts = splitIntoStepParts(body);

  if (parts.length === 1 && shouldPreferMultiStep(q, body) && !isTrivialOneStep(q, body)) {
    // Try harder split on comma clauses for medium work
    const commaParts = body
      .split(/\s*,\s+(?=[A-Za-z$\\])/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 10);
    if (commaParts.length >= 2) {
      parts = commaParts.map(ensurePeriod);
    }
  }

  if (isTrivialOneStep(q, body)) {
    parts = [ensurePeriod(body)];
  }

  const steps = parts
    .map((part, i) => `Step ${i + 1}: ${part.replace(/^Step \d+:\s*/i, "").trim()}`)
    .join(" ");

  const expanded = `${steps} Final answer: ${finalAnswer}.`;
  return expanded === original ? null : expanded;
}

async function main() {
  let totalChanged = 0;
  let totalMulti = 0;
  let totalSingle = 0;

  const dirents = await fs.readdir(CONTENT, { withFileTypes: true });

  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    const filePath = path.join(CONTENT, d.name, "diagnostic.json");
    try {
      await fs.access(filePath);
    } catch {
      continue;
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const data = DiagnosticFileSchema.parse(JSON.parse(raw));
    let changed = 0;

    for (const q of data.questions) {
      const repaired = repairExplanationMath(q.explanation);
      const repairChanged = repaired !== q.explanation;

      const next = expandExplanation({ ...q, explanation: repaired });
      if (next) {
        const stepCount = (next.match(/Step \d+:/g) ?? []).length;
        if (stepCount > 1) totalMulti++;
        else totalSingle++;
        q.explanation = next;
        changed++;
      } else if (repairChanged) {
        q.explanation = repaired;
        changed++;
      }
    }

    if (changed > 0) {
      totalChanged += changed;
      console.log(`${d.name}: expanded ${changed}/${data.questions.length} explanations`);
      if (!DRY_RUN) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
      }
    }
  }

  console.log(
    DRY_RUN
      ? `[dry-run] Would update ${totalChanged} explanations (${totalMulti} multi-step, ${totalSingle} single-step wrap)`
      : `Updated ${totalChanged} explanations (${totalMulti} multi-step, ${totalSingle} single-step wrap)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});