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
 * P(x)) has no truth table; it is compared structurally after renaming its
 * bound variables in order of binding, reordering the operands of ∧ and ∨,
 * and treating a block of same-kind quantifiers as unordered, so "∀y¬P(y)" is
 * "∀x¬P(x)" and "∃x(∀y¬Q(x,y)∧P(x))" is "∃x(P(x)∧∀y¬Q(x,y))" (report 1d69a3d0).
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
 * applying the renaming to every later occurrence of that letter. The
 * fallback for a formula the predicate parser cannot read.
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

export type Term = { name: string; args: Term[] };
export type PFormula =
  | { kind: "atom"; name: string; args: Term[] }
  | { kind: "not"; a: PFormula }
  | { kind: "bin"; op: "∧" | "∨" | "→" | "↔" | "↑"; a: PFormula; b: PFormula }
  | { kind: "quant"; q: "∀" | "∃"; v: string; a: PFormula };

/**
 * Parser for first-order formulas in the grader's canonical spelling: atoms
 * are predicate applications "p(x,f(y))" or bare propositional letters, and
 * a quantifier binds the atom that follows it ("∀x∃y(...)", "∀x¬p(x)").
 */
export function parsePredicate(src: string): PFormula | null {
  let i = 0;
  const eat = (c: string) => {
    if (src[i] === c) {
      i += 1;
      return true;
    }
    return false;
  };
  const name = (): string | null => {
    if (!/[a-z]/.test(src[i] ?? "")) return null;
    let n = src[i++];
    if (src[i] === "_") {
      i += 1;
      while (i < src.length && /[0-9a-z]/.test(src[i])) n += src[i++];
    } else {
      while (i < src.length && /[0-9]/.test(src[i])) n += src[i++];
    }
    return n;
  };
  const args = (): Term[] | null => {
    if (!eat("(")) return [];
    const out: Term[] = [];
    for (;;) {
      const t = term();
      if (!t) return null;
      out.push(t);
      if (eat(",")) continue;
      if (eat(")")) return out;
      return null;
    }
  };
  const term = (): Term | null => {
    const n = name();
    if (!n) return null;
    const a = args();
    return a ? { name: n, args: a } : null;
  };
  const atom = (): PFormula | null => {
    if (eat("(")) {
      const f = iff();
      if (!f || !eat(")")) return null;
      return f;
    }
    if (eat("¬") || eat("~") || eat("!")) {
      const f = atom();
      return f ? { kind: "not", a: f } : null;
    }
    if (src[i] === "∀" || src[i] === "∃") {
      const q = src[i++] as "∀" | "∃";
      const v = name();
      if (!v) return null;
      const f = atom();
      return f ? { kind: "quant", q, v, a: f } : null;
    }
    const n = name();
    if (!n) return null;
    const a = args();
    return a ? { kind: "atom", name: n, args: a } : null;
  };
  const chain = (next: () => PFormula | null, ops: string[]): (() => PFormula | null) => () => {
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

const COMMUTATIVE = new Set(["∧", "∨", "↔", "↑"]);

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, k) => permutations([...xs.slice(0, k), ...xs.slice(k + 1)]).map((rest) => [x, ...rest]));
}

/**
 * One string per equivalence class under: renaming bound variables,
 * reordering and regrouping the operands of ∧ and ∨ (and ↔, ↑), and
 * permuting a block of adjacent quantifiers of the same kind. Bound
 * variables are named by position; a block tries every order and keeps the
 * smallest body, so "∃x∃z(p(x)→q(z))" and "∃z∃x(p(x)→q(z))" agree.
 */
export function canonicalPredicate(f: PFormula, env: Map<string, string> = new Map(), depth = 0): string {
  const termStr = (t: Term): string =>
    (env.get(t.name) ?? t.name) + (t.args.length ? `(${t.args.map(termStr).join(",")})` : "");
  switch (f.kind) {
    case "atom":
      return f.name + (f.args.length ? `(${f.args.map(termStr).join(",")})` : "");
    case "not":
      return "¬" + canonicalPredicate(f.a, env, depth);
    case "quant": {
      const vars: string[] = [];
      let body: PFormula = f;
      while (body.kind === "quant" && body.q === f.q && vars.length < 5) {
        vars.push(body.v);
        body = body.a;
      }
      let best: string | null = null;
      for (const order of permutations(vars)) {
        const inner = new Map(env);
        order.forEach((v, k) => inner.set(v, `#${depth + k}`));
        const s = canonicalPredicate(body, inner, depth + order.length);
        if (best === null || s < best) best = s;
      }
      return f.q.repeat(vars.length) + best;
    }
    case "bin": {
      if (!COMMUTATIVE.has(f.op)) {
        return `(${canonicalPredicate(f.a, env, depth)}${f.op}${canonicalPredicate(f.b, env, depth)})`;
      }
      const operands: PFormula[] = [];
      const collect = (g: PFormula) => {
        if (g.kind === "bin" && g.op === f.op && f.op !== "↑") {
          collect(g.a);
          collect(g.b);
        } else operands.push(g);
      };
      collect(f);
      return `(${operands.map((g) => canonicalPredicate(g, env, depth)).sort().join(f.op)})`;
    }
  }
}

export function predicateEquivalent(typed: string, stored: string): boolean {
  const a = parsePredicate(typed);
  const b = parsePredicate(stored);
  if (a && b) return canonicalPredicate(a) === canonicalPredicate(b);
  return alphaNormalize(typed) === alphaNormalize(stored);
}

/** Entry point used by the grader; false when the strings are not logic. */
export function logicEquivalent(typed: string, stored: string): boolean {
  if (!looksLikeLogic(typed) || !looksLikeLogic(stored)) return false;
  if (isPredicateLogic(stored) || isPredicateLogic(typed)) return predicateEquivalent(typed, stored);
  if (![...stored].some((c) => CONNECTIVES.includes(c))) return false;
  return propositionalEquivalent(typed, stored);
}
