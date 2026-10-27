/**
 * Per-subject identity colour. The only thing that changes between subjects
 * is the nav bar tint (and the accent on subject cards and the dashboard
 * glyphs); everything else uses the site tokens, in light and dark alike.
 *
 * `allThemesCss()` emits one `.subject-theme-<id>` block per subject (plus a
 * `.dark` variant) defining --subject-accent, --nav-bg, --nav-border and the
 * nav control colours as color-mix() of the accent with the site tokens, so
 * the tint follows the light/dark toggle automatically. The root layout
 * injects that CSS once; `CourseLayout` puts the class on the subject subtree.
 */

export type SubjectAccent = { accent: string; accentText: string };

export type SubjectTheme = {
  slug: string;
  id: string;
  name: string;
  light: SubjectAccent;
  dark: SubjectAccent;
};

const SUBJECT_THEMES: Record<string, Omit<SubjectTheme, "slug">> = {
  calculus: { id: "graph-paper", name: "Calculus", light: { accent: "#dc2626", accentText: "#ffffff" }, dark: { accent: "#f87171", accentText: "#0b1220" } },
  statistics: { id: "chalkboard", name: "Statistics", light: { accent: "#157f3c", accentText: "#ffffff" }, dark: { accent: "#fde68a", accentText: "#122a1f" } },
  "linear-algebra": { id: "blueprint", name: "Linear Algebra", light: { accent: "#2d6a9f", accentText: "#ffffff" }, dark: { accent: "#5b9fd4", accentText: "#0f172a" } },
  precalculus: { id: "notebook", name: "Precalculus", light: { accent: "#ae5f05", accentText: "#ffffff" }, dark: { accent: "#fbbf24", accentText: "#1c1917" } },
  algebra: { id: "whiteboard", name: "Algebra", light: { accent: "#cc4d0a", accentText: "#ffffff" }, dark: { accent: "#fb923c", accentText: "#191411" } },
  geometry: { id: "vellum", name: "Geometry", light: { accent: "#0b8176", accentText: "#ffffff" }, dark: { accent: "#2dd4bf", accentText: "#0e1716" } },
  "set-theory": { id: "venn-slate", name: "Set Theory", light: { accent: "#04815a", accentText: "#ffffff" }, dark: { accent: "#34d399", accentText: "#1c1917" } },
  "number-theory": { id: "parchment", name: "Number Theory", light: { accent: "#b25209", accentText: "#ffffff" }, dark: { accent: "#eab308", accentText: "#1f1a12" } },
  combinatorics: { id: "dot-lattice", name: "Combinatorics", light: { accent: "#d72675", accentText: "#ffffff" }, dark: { accent: "#f472b6", accentText: "#18181b" } },
  "discrete-mathematics": { id: "terminal", name: "Discrete Mathematics", light: { accent: "#077b97", accentText: "#ffffff" }, dark: { accent: "#22d3ee", accentText: "#0a1214" } },
  "mathematical-logic": { id: "proof-sheet", name: "Mathematical Logic", light: { accent: "#0279b7", accentText: "#ffffff" }, dark: { accent: "#38bdf8", accentText: "#0d1520" } },
  "information-theory": { id: "signal", name: "Information Theory", light: { accent: "#4f7f0a", accentText: "#ffffff" }, dark: { accent: "#a3e635", accentText: "#131c16" } },
  "real-analysis": { id: "manuscript", name: "Real Analysis", light: { accent: "#9f1239", accentText: "#ffffff" }, dark: { accent: "#fb7185", accentText: "#1c1214" } },
  "abstract-algebra": { id: "obsidian", name: "Abstract Algebra", light: { accent: "#7c3aed", accentText: "#ffffff" }, dark: { accent: "#a78bfa", accentText: "#17131f" } },
  probability: { id: "probability", name: "Probability", light: { accent: "#4338ca", accentText: "#ffffff" }, dark: { accent: "#a5b4fc", accentText: "#111827" } },
};

export function getThemeForSubject(slug: string): SubjectTheme | null {
  const t = SUBJECT_THEMES[slug];
  return t ? { ...t, slug } : null;
}

export function subjectThemeClass(slug: string): string {
  const t = SUBJECT_THEMES[slug];
  return t ? `subject-theme-${t.id}` : "";
}

function block(selector: string, p: SubjectAccent, mode: "light" | "dark"): string {
  const tint = mode === "dark" ? 16 : 12;
  return (
    `${selector}{` +
    `--subject-accent:${p.accent};--subject-accent-text:${p.accentText};` +
    `--nav-bg:color-mix(in srgb, ${p.accent} ${tint}%, var(--surface-solid));` +
    `--nav-border:color-mix(in srgb, ${p.accent} 42%, var(--border));` +
    // The search box, theme toggle and menu button have no border; they read
    // as controls because their fill is one step deeper than the bar's.
    `--nav-control-bg:color-mix(in srgb, ${p.accent} ${tint + 12}%, var(--surface-solid));` +
    `}`
  );
}

export function allSubjectThemes(): SubjectTheme[] {
  return Object.entries(SUBJECT_THEMES).map(([slug, t]) => ({ ...t, slug }));
}

export function allThemesCss(): string {
  return Object.values(SUBJECT_THEMES)
    .map((t) => block(`.subject-theme-${t.id}`, t.light, "light") + "\n" + block(`.dark .subject-theme-${t.id}`, t.dark, "dark"))
    .join("\n");
}
