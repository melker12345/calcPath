/**
 * Equivalence of logic-formula answers (report 5e1b6a74).
 *
 * A propositional answer is graded by its truth table: "(q∨r)∧p" is the
 * stored "p∧(q∨r)", and "r∨q" is "q∨r". Two guards keep that from accepting
 * the question's own formula typed back for a normal-form or simplification
 * question: the answer may use no more connectives than the stored one, and
 * when the stored answer is in conjunctive (disjunctive) normal form the
 * answer must be too. A resolvent or a CNF clause is a set of literals, so
 * their order is never meaningful.
 *
 * A predicate-logic answer (quantifiers, or predicate applications such as
 * P(x)) has no truth table; it is compared after renaming its bound
 * variables in order of binding, so "∀y¬P(y)" is "∀x¬P(x)".
 *
 * Inputs are canonical strings from answer-check (lower case, no spaces,
 * LaTeX folded to the symbols ¬ ∧ ∨ → ↔ ↑ ∀ ∃).
 */

export type Formula =
  | { kind: "var"; name: string }
  | { kind: "not"; a: Formula }
  | { kind: "bin"; op: "∧" | "∨" | "→" | "↔" | "↑"; a: Formula; b: Formula };

const CONNECTIVES = "¬∧∨→↔↑";

/** True when the string is a formula this module can read at all. */
export function looksLikeLogic(s: string): boolean {
  return /[¬∧∨→↔↑∀∃]/.test(s) || /\b[a-z]\([a-z](?:,[a-z])*\)/.test(s);
}

export function isPredicateLogic(s: string): boolean {
  return /[∀∃]/.test(s) || /[a-z]\([a-z](?:,[a-z])*\)/.test(s);
}

// ---------------------------------------------------------------------------
// Propositional formulas
// ---------------------------------------------------------------------------

/** Recursive-descent parser: ↔ < → < ∨ < ↑ < ∧ < ¬ (loosest to tightest). */
export function parsePropositional(src: string): Formula | null {
  let i = 0;
  const peek = () => src[i];
  const eat = (c: string) => {
    if (src[i] === c) {
      i += 1;
      return true;
    }
    return false;
  };
  const atom = (): Formula | null => {
    if (eat("(")) {
      const f = iff();
      if (!f || !eat(")")) return null;
      return f;
    }
    if (eat("¬") || eat("~") || eat("!")) {
      const f = atom();
      return f ? { kind: "not", a: f } : null;
    }
    const c = peek();
    if (c && /[a-z]/.test(c)) {
      i += 1;
      // A subscripted variable such as p_1 or p1.
      let name = c;
      if (src[i] === "_") {
        i += 1;
        while (i < src.length && /[0-9a-z]/.test(src[i])) name += src[i++];
      } else {
        while (i < src.length && /[0-9]/.test(src[i])) name += src[i++];
      }
      return { kind: "var", name };
    }
    return null;
  };
  const chain = (next: () => Formula | null, ops: string[]): (() => Formula | null) => () => {
    let left = next();
    if (!left) return null;
    while (i < src.length && ops.includes(src[i])) {
      const op = src[i] as "∧" | "∨" | "→" | "↔" | "↑";
      i += 1;
      const right = next();
      if (!right) return null;
      left = { kind: "bin", op, a: left, b: right };
    }
    return left;
  };
  const conj = chain(atom, ["∧"]);
  const nand = chain(conj, ["↑"]);
  const disj = chain(nand, ["∨"]);
  const impl = chain(disj, ["→"]);
  const iff = chain(impl, ["↔"]);
  const f = iff();
  if (!f || i !== src.length) return null;
  return f;
}

function variablesOf(f: Formula, out: Set<string>): Set<string> {
  if (f.kind === "var") out.add(f.name);
  else if (f.kind === "not") variablesOf(f.a, out);
  else {
    variablesOf(f.a, out);
    variablesOf(f.b, out);
  }
  return out;
}

function evaluate(f: Formula, env: Record<string, boolean>): boolean {
  switch (f.kind) {
    case "var":
      return env[f.name];
    case "not":
      return !evaluate(f.a, env);
    case "bin": {
      const a = evaluate(f.a, env);
      const b = evaluate(f.b, env);
      switch (f.op) {
        case "∧":
          return a && b;
        case "∨":
          return a || b;
        case "→":
          return !a || b;
        case "↔":
          return a === b;
        case "↑":
          return !(a && b);
      }
    }
  }
}

/** Every connective occurrence, the measure of how far a formula was simplified. */
export function connectiveCount(f: Formula): number {
  if (f.kind === "var") return 0;
  if (f.kind === "not") return 1 + connectiveCount(f.a);
  return 1 + connectiveCount(f.a) + connectiveCount(f.b);
}

const isLiteral = (f: Formula) => f.kind === "var" || (f.kind === "not" && f.a.kind === "var");
const isClause = (f: Formula, op: "∧" | "∨"): boolean =>
  isLiteral(f) || (f.kind === "bin" && f.op === op && isClause(f.a, op) && isClause(f.b, op));

/** Conjunction of disjunctions of literals (a single clause or literal counts). */
export function isCNF(f: Formula): boolean {
  return isClause(f, "∨") || (f.kind === "bin" && f.op === "∧" && isCNF(f.a) && isCNF(f.b));
}

/** Disjunction of conjunctions of literals. */
export function isDNF(f: Formula): boolean {
  return isClause(f, "∧") || (f.kind === "bin" && f.op === "∨" && isDNF(f.a) && isDNF(f.b));
}

export function sameTruthTable(a: Formula, b: Formula): boolean {
  const vars = [...variablesOf(b, variablesOf(a, new Set<string>()))].sort();
  if (vars.length > 10) return false;
  const env: Record<string, boolean> = {};
  for (let mask = 0; mask < 1 << vars.length; mask += 1) {
    vars.forEach((v, k) => {
      env[v] = Boolean(mask & (1 << k));
    });
    if (evaluate(a, env) !== evaluate(b, env)) return false;
  }
  return true;
}

/**
 * The typed propositional formula is accepted for the stored one when the two
 * agree on every assignment, the typed one is no longer, and it keeps the
 * stored one's normal form.
 */
export function propositionalEquivalent(typed: string, stored: string): boolean {
  const a = parsePropositional(typed);
  const b = parsePropositional(stored);
  if (!a || !b) return false;
  if (!sameTruthTable(a, b)) return false;
  if (connectiveCount(a) > connectiveCount(b)) return false;
  if (isCNF(b) && !isCNF(a)) return false;
  if (isDNF(b) && !isDNF(a)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Predicate formulas
// ---------------------------------------------------------------------------

/**
 * Rename each quantified variable, in order of binding, to a canonical name,
 * applying the renaming to every later occurrence of that letter. Exact for
 * prenex and other simple formulas, which is what the question bank holds.
 */
export function alphaNormalize(s: string): string {
  let out = "";
  const renames = new Map<string, string>();
  let next = 0;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if ((c === "∀" || c === "∃") && /[a-z]/.test(s[i + 1] ?? "")) {
      const v = s[i + 1];
      renames.set(v, `#${next++}`);
      out += c + renames.get(v);
      i += 1;
      continue;
    }
    if (/[a-z]/.test(c) && renames.has(c) && !/[a-z]/.test(s[i - 1] ?? "") && !/[a-z]/.test(s[i + 1] ?? "")) {
      out += renames.get(c);
      continue;
    }
    out += c;
  }
  return out;
}

export function predicateEquivalent(typed: string, stored: string): boolean {
  return alphaNormalize(typed) === alphaNormalize(stored);
}

/** Entry point used by the grader; false when the strings are not logic. */
export function logicEquivalent(typed: string, stored: string): boolean {
  if (!looksLikeLogic(typed) || !looksLikeLogic(stored)) return false;
  if (isPredicateLogic(stored) || isPredicateLogic(typed)) return predicateEquivalent(typed, stored);
  if (![...stored].some((c) => CONNECTIVES.includes(c))) return false;
  return propositionalEquivalent(typed, stored);
}
