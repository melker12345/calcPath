/**
 * Cross-references between statements.
 *
 * STYLE.md asks authors to cite a result by its title — "by the theorem
 * *Sum rule for limits*" — never by its number, because numbers are computed
 * at render time and shift when a statement is inserted. This module is the
 * other half of that bargain: it recognises those citations so the renderer
 * can turn them into links (carrying the live number), and so that
 * `content:validate` can fail on a citation whose title matches nothing.
 *
 * A citation is a statement kind — theorem, lemma, corollary, proposition,
 * definition, example, method, recipe — followed by an italic title. Titles
 * are matched case-insensitively with whitespace ignored, so `$\sigma>0$` and
 * `$\sigma > 0$` are the same title. An italic phrase that starts with a
 * lower-case letter ("Green's theorem *is* Stokes' theorem") is ordinary
 * emphasis, not a citation, and is left alone.
 */

import { slugify } from "./render-prose";

export const CITATION_KINDS = [
  "theorem",
  "lemma",
  "corollary",
  "proposition",
  "definition",
  "example",
  "method",
  "recipe",
] as const;

/** `the theorem *Title*` — group 1 is the lead-in, group 2 the title. */
export const CITATION_RE = new RegExp(
  `(\\b(?:${CITATION_KINDS.join("|")})s?\\s+)\\*([^*\\n]+?)\\*`,
  "gi",
);

/** Fence line: `:::theorem[Title]{#id}` for a numbered, titled environment. */
const TITLED_FENCE_RE =
  /^:::(definition|theorem|lemma|proposition|corollary|example|recipe|figure)\[(.*)\](?:\{#([\w-]+)\})?\s*$/;

export function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, "").toLowerCase();
}

/** True for an italic phrase that is a citation rather than emphasis. */
export function looksLikeTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed !== "" && !/^[a-z]/.test(trimmed);
}

export type StatementTitle = {
  kind: string;
  title: string;
  /** The explicit `{#id}` when given, else a slug of the title. */
  id: string;
  line: number;
};

/**
 * Every titled, numbered environment in a module source, with the anchor the
 * renderer gives it. The renderer assigns exactly the same id (explicit, else
 * `slugify(title)`), so a link built from this list resolves on the page.
 */
export function collectStatementTitles(source: string): StatementTitle[] {
  const out: StatementTitle[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = TITLED_FENCE_RE.exec(lines[i]);
    if (!m || !m[2].trim()) continue;
    out.push({ kind: m[1], title: m[2], id: m[3] ?? slugify(m[2]), line: i + 1 });
  }
  return out;
}

export type Citation = { title: string; line: number };

/** Every citation in a module source, in order. */
export function collectCitations(source: string): Citation[] {
  const out: Citation[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    CITATION_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = CITATION_RE.exec(lines[i])) !== null) {
      if (looksLikeTitle(m[2])) out.push({ title: m[2], line: i + 1 });
    }
  }
  return out;
}

export type CrossRefTarget = { href: string; label: string };

/**
 * Rewrite citations in a run of Markdown into links. `resolve` returns the
 * target for a title, or undefined to leave the citation as plain italics.
 * The link carries the statement's label and number as its title attribute,
 * so "Theorem 4.2" is one hover away without being typed into the prose.
 */
export function linkCitations(
  markdown: string,
  resolve: (normalizedTitle: string) => CrossRefTarget | undefined,
): string {
  return markdown.replace(CITATION_RE, (whole, lead: string, title: string) => {
    if (!looksLikeTitle(title)) return whole;
    const target = resolve(normalizeTitle(title));
    if (!target) return whole;
    const label = target.label.replace(/"/g, "'");
    return `${lead}[*${title}*](${target.href} "${label}")`;
  });
}
