/**
 * Math-book environments for module.mdx
 * =====================================
 *
 * Textbooks do not explain in one long column of prose. They alternate between
 * *statements* (definitions, theorems, examples — set apart, labelled, numbered,
 * referable) and *discussion* (the prose that motivates and unpacks them).
 *
 * This module adds that vocabulary to the MDX dialect in
 * `content/{subject}/topics/{topicId}/module.mdx` using a directive fence:
 *
 * ```mdx
 * :::definition[Derivative]{#derivative}
 * The derivative of $f$ at $a$ is $f'(a) = \lim_{h\to 0}\frac{f(a+h)-f(a)}{h}$,
 * provided the limit exists.
 * :::
 *
 * :::theorem[Differentiability implies continuity]
 * If $f$ is differentiable at $a$, then $f$ is continuous at $a$.
 * :::
 *
 * :::proof
 * Write $f(x)-f(a) = \frac{f(x)-f(a)}{x-a}\cdot (x-a)$ and let $x\to a$.
 * :::
 * ```
 *
 * Everything is optional: `[Title]` names the environment, `{#id}` gives it a
 * stable anchor for cross-references. The body is ordinary MDX (prose, lists,
 * tables, `$math$`, `$$display$$`).
 *
 * Design constraints:
 * - **Pure + server-safe.** No React, no DOM. Used by the renderer, the adapter
 *   and the content validator alike.
 * - **Additive.** Modules that use none of this are unaffected; the existing
 *   `**ELI5**` / `**Worked Example:**` markers keep working exactly as before.
 * - **Deterministic numbering.** Numbers are a pure function of the source, so
 *   server and client render the same "Theorem 3.4" with no counters in render.
 */

export type MathBlockKind =
  | "definition"
  | "theorem"
  | "lemma"
  | "proposition"
  | "corollary"
  | "example"
  | "proof"
  | "solution"
  | "remark"
  | "note"
  | "notation"
  | "intuition"
  | "pitfall"
  | "recipe"
  | "summary";

export type MathBlockStyle =
  /** Numbered statement, italic body — theorem family. */
  | "statement"
  /** Numbered statement, upright body — definitions, examples, recipes. */
  | "declaration"
  /** Unnumbered, run-in head, closing tombstone — proofs and solutions. */
  | "argument"
  /** Unnumbered aside — intuition, remarks, notation, pitfalls, summaries. */
  | "aside";

export type MathBlockSpec = {
  kind: MathBlockKind;
  /** Word printed in the run-in head, e.g. "Theorem". */
  label: string;
  /** Numbered environments participate in the topic-wide counter. */
  numbered: boolean;
  style: MathBlockStyle;
  /** Closing mark: ∎ ends a proof, □ ends a worked solution. */
  endMark?: string;
};

export const MATH_BLOCK_SPECS: Record<MathBlockKind, MathBlockSpec> = {
  definition: { kind: "definition", label: "Definition", numbered: true, style: "declaration" },
  theorem: { kind: "theorem", label: "Theorem", numbered: true, style: "statement" },
  lemma: { kind: "lemma", label: "Lemma", numbered: true, style: "statement" },
  proposition: { kind: "proposition", label: "Proposition", numbered: true, style: "statement" },
  corollary: { kind: "corollary", label: "Corollary", numbered: true, style: "statement" },
  example: { kind: "example", label: "Example", numbered: true, style: "declaration" },
  recipe: { kind: "recipe", label: "Method", numbered: true, style: "declaration" },
  proof: { kind: "proof", label: "Proof", numbered: false, style: "argument", endMark: "∎" },
  solution: { kind: "solution", label: "Solution", numbered: false, style: "argument", endMark: "□" },
  remark: { kind: "remark", label: "Remark", numbered: false, style: "aside" },
  note: { kind: "note", label: "Note", numbered: false, style: "aside" },
  notation: { kind: "notation", label: "Notation", numbered: false, style: "aside" },
  intuition: { kind: "intuition", label: "Intuition", numbered: false, style: "aside" },
  pitfall: { kind: "pitfall", label: "Pitfall", numbered: false, style: "aside" },
  summary: { kind: "summary", label: "Summary", numbered: false, style: "aside" },
};

export const MATH_BLOCK_KINDS = Object.keys(MATH_BLOCK_SPECS) as MathBlockKind[];

/** `:::kind[Optional title]{#optional-id}` */
const OPEN_FENCE = /^:::([a-z]+)(?:\[([^\]]*)\])?(?:\{#([a-zA-Z0-9_-]+)\})?\s*$/;
const CLOSE_FENCE = /^:::\s*$/;

export function isMathBlockOpen(line: string): boolean {
  const m = line.trim().match(OPEN_FENCE);
  return Boolean(m && (MATH_BLOCK_SPECS as Record<string, MathBlockSpec>)[m[1]]);
}

export function isMathBlockClose(line: string): boolean {
  return CLOSE_FENCE.test(line.trim());
}

export type MathBlockSegment = {
  type: "block";
  kind: MathBlockKind;
  title?: string;
  id?: string;
  /** Raw MDX body of the environment (rendered recursively). */
  body: string;
};

export type ProseSegment = {
  type: "prose";
  body: string;
};

export type MdxSegment = MathBlockSegment | ProseSegment;

/**
 * Split raw MDX into prose runs and math-book environments, in document order.
 *
 * Unterminated or unknown fences degrade gracefully: the text stays prose, so a
 * typo can never swallow the rest of a module.
 */
export function segmentMathBlocks(source: string): MdxSegment[] {
  const lines = source.split(/\r?\n/);
  const segments: MdxSegment[] = [];
  let prose: string[] = [];

  const flushProse = () => {
    const body = prose.join("\n").trim();
    if (body) segments.push({ type: "prose", body });
    prose = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].trim().match(OPEN_FENCE);
    const spec = open ? (MATH_BLOCK_SPECS as Record<string, MathBlockSpec>)[open[1]] : undefined;
    if (!open || !spec) {
      prose.push(lines[i]);
      continue;
    }

    // Find the matching close fence. Without one, treat the opener as prose.
    let close = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (isMathBlockClose(lines[j])) {
        close = j;
        break;
      }
    }
    if (close === -1) {
      prose.push(lines[i]);
      continue;
    }

    flushProse();
    segments.push({
      type: "block",
      kind: spec.kind,
      title: open[2]?.trim() || undefined,
      id: open[3] || undefined,
      body: lines.slice(i + 1, close).join("\n").trim(),
    });
    i = close;
  }

  flushProse();
  return segments;
}

/** How many numbered environments a chunk of MDX contributes to the counter. */
export function countNumberedBlocks(source: string): number {
  return segmentMathBlocks(source).filter(
    (segment) => segment.type === "block" && MATH_BLOCK_SPECS[segment.kind].numbered
  ).length;
}

/**
 * Book-style number for an environment: chapter.item, e.g. "Theorem 3.4".
 * `chapter` is the topic's position in its subject; `item` is a single counter
 * shared by every numbered environment in the topic, exactly as in a printed
 * textbook (so a reader scanning for "Example 3.7" finds it in order).
 */
export function formatBlockNumber(chapter: number | undefined, item: number): string {
  return chapter && chapter > 0 ? `${chapter}.${item}` : `${item}`;
}

/**
 * Run-in heads for *unfenced* prose.
 *
 * Existing modules state their key results as ordinary sentences that open with
 * a cue ("Power rule: ...", "Theorem: ...", "Notation and one-sided limits."),
 * which is why they read as one undifferentiated column. Recognising that cue
 * lets the renderer set the lead as a book-style run-in head — no content edits
 * required — while the whitelist keeps ordinary sentences untouched.
 */
const RUN_IN_CUES = [
  "definition",
  "theorem",
  "lemma",
  "proposition",
  "corollary",
  "claim",
  "fact",
  "rule",
  "law",
  "formula",
  "identity",
  "property",
  "test",
  "criterion",
  "method",
  "recipe",
  "algorithm",
  "notation",
  "convention",
  "remark",
  "note",
  "warning",
  "caution",
  "key idea",
  "big idea",
  "intuition",
  "memory aid",
  "mnemonic",
  "example",
  "special case",
  "edge case",
  "why it works",
  "when to use it",
  "tip",
];

/**
 * Matches a short lead like "Power rule:" / "Theorem:" / "Quotient rule:" —
 * a cue word, optionally preceded by up to three qualifying words.
 */
const RUN_IN_HEAD = new RegExp(
  `^((?:[A-Z][\\w'’-]*(?:\\s+[\\w'’/-]+){0,3}\\s+)?(?:${RUN_IN_CUES.join("|")}))\\s*:\\s+`,
  "i"
);

export type RunInSplit = { head: string; rest: string };

/**
 * If `text` opens with a recognised run-in cue, split it into head + remainder.
 * Returns null for ordinary prose (the overwhelmingly common case).
 */
export function splitRunInHead(text: string): RunInSplit | null {
  const trimmed = text.trimStart();
  // Never touch a paragraph that is already marked up or is pure math.
  if (trimmed.startsWith("**") || trimmed.startsWith("$")) return null;
  const match = trimmed.match(RUN_IN_HEAD);
  if (!match) return null;
  const head = match[1].trim();
  // A cue must read as a label, not as the subject of a long sentence.
  if (head.length > 42) return null;
  let rest = trimmed.slice(match[0].length).trim();
  if (!rest) return null;
  // "Tip: always check ..." becomes "Tip. Always check ..." — once the cue is a
  // head rather than a clause opener, the sentence after it starts a sentence.
  if (/^[a-z]/.test(rest) && !rest.startsWith("$")) {
    rest = rest[0].toUpperCase() + rest.slice(1);
  }
  return { head, rest };
}

/**
 * True when `text` is nothing but a single math expression (optionally with a
 * trailing period). Such a "sentence" is a displayed equation in book form.
 */
export function isBareMath(text: string): boolean {
  const trimmed = text.trim().replace(/[.,;]$/, "").trim();
  if (!trimmed.startsWith("$") || !trimmed.endsWith("$")) return false;
  const inner = trimmed.startsWith("$$")
    ? trimmed.slice(2, -2)
    : trimmed.slice(1, -1);
  return inner.length > 0 && !inner.includes("$");
}

/** Strip the delimiters from a bare-math string (see `isBareMath`). */
export function bareMathBody(text: string): string {
  const trimmed = text.trim().replace(/[.,;]$/, "").trim();
  return trimmed.replace(/^\${1,2}/, "").replace(/\${1,2}$/, "").trim();
}
