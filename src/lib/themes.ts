/**
 * Per-subject metaphor themes — every subject owns a visual world, in BOTH
 * light and dark variants. Heritage: calculus/statistics/linear-algebra worlds
 * restored from the master branch (graph paper / chalkboard / blueprint); the
 * other eleven are new materials in the same spirit.
 *
 * Architecture: themes are projected onto the global token variables via
 * generated CSS classes — `.subject-theme-<id>` (light) and
 * `.dark .subject-theme-<id>` (dark) — injected once in the root layout by
 * rendering allThemesCss(). Anything inside an element carrying the class
 * (subject pages via CourseLayout, subject cards) renders in that world and
 * follows the site light/dark toggle automatically.
 *
 * Textures are deliberately faint (alpha ≤ ~0.1): they paint full content
 * pages, not just cards.
 */

export type ThemePalette = {
  bg: string;
  card: string;
  cardHover: string;
  border: string;
  accent: string;
  accentText: string;
  text: string;
  textMuted: string;
  textDim: string;
  /** Extra CSS declarations for the background texture,
      e.g. "background-image:...;background-size:24px 24px;" */
  texture?: string;
};

export type SubjectTheme = {
  id: string;
  name: string;
  slug: string;
  light: ThemePalette;
  dark: ThemePalette;
};

// ============================================
// The fourteen worlds
// ============================================

export const graphPaperTheme: SubjectTheme = {
  id: "graph-paper",
  name: "Calculus",
  slug: "calculus",
  light: {
    bg: "#f8fafc",
    card: "#ffffff",
    cardHover: "#ffffff",
    border: "#dbeafe",
    accent: "#dc2626",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#4b5768",
    textDim: "#697483",
    texture:
      "background-image:linear-gradient(rgba(147,197,253,0.20) 1px,transparent 1px),linear-gradient(90deg,rgba(147,197,253,0.20) 1px,transparent 1px);background-size:24px 24px;",
  },
  dark: {
    bg: "#0b1220",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(96,165,250,0.25)",
    accent: "#f87171",
    accentText: "#0b1220",
    text: "#e2e8f0",
    textMuted: "rgba(226,232,240,0.66)",
    textDim: "rgba(226,232,240,0.50)",
    texture:
      "background-image:linear-gradient(rgba(96,165,250,0.09) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.09) 1px,transparent 1px);background-size:24px 24px;",
  },
};

export const chalkboardTheme: SubjectTheme = {
  id: "chalkboard",
  name: "Statistics",
  slug: "statistics",
  light: {
    bg: "#eaf4ec",
    card: "#ffffff",
    cardHover: "#e4f1e7",
    border: "#c2dcca",
    accent: "#157f3c",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#475263",
    textDim: "#656f7d",
    texture:
      "background-image:radial-gradient(ellipse at 30% 20%, rgba(21,128,61,0.05) 0%, transparent 50%);",
  },
  dark: {
    bg: "#1a3a2a",
    card: "rgba(255,255,255,0.03)",
    cardHover: "rgba(255,255,255,0.06)",
    border: "rgba(232,228,217,0.14)",
    accent: "#fde68a",
    accentText: "#122a1f",
    text: "#e8e4d9",
    textMuted: "rgba(232,228,217,0.81)",
    textDim: "rgba(232,228,217,0.59)",
    texture:
      "background-image:radial-gradient(ellipse at 30% 20%, #1f4433 0%, transparent 50%),radial-gradient(ellipse at 70% 60%, #1f4433 0%, transparent 40%);",
  },
};

export const blueprintTheme: SubjectTheme = {
  id: "blueprint",
  name: "Linear Algebra",
  slug: "linear-algebra",
  light: {
    bg: "#eef4f9",
    card: "#ffffff",
    cardHover: "#eaf2f8",
    border: "#c3d8e9",
    accent: "#2d6a9f",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#475263",
    textDim: "#66707f",
    // Classic blueprint: fine grid + coarse major grid (dual scale).
    texture:
      "background-image:linear-gradient(rgba(45,106,159,0.16) 1px,transparent 1px),linear-gradient(90deg,rgba(45,106,159,0.16) 1px,transparent 1px),linear-gradient(rgba(45,106,159,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(45,106,159,0.07) 1px,transparent 1px);background-size:50px 50px,50px 50px,10px 10px,10px 10px;",
  },
  dark: {
    bg: "#0f172a",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(51,114,162,0.28)",
    accent: "#5b9fd4",
    accentText: "#0f172a",
    text: "#e2e8f0",
    textMuted: "rgba(226,232,240,0.67)",
    textDim: "rgba(226,232,240,0.51)",
    texture:
      "background-image:linear-gradient(rgba(91,159,212,0.14) 1px,transparent 1px),linear-gradient(90deg,rgba(91,159,212,0.14) 1px,transparent 1px),linear-gradient(rgba(91,159,212,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(91,159,212,0.06) 1px,transparent 1px);background-size:50px 50px,50px 50px,10px 10px,10px 10px;",
  },
};

export const notebookTheme: SubjectTheme = {
  id: "notebook",
  name: "Precalculus",
  slug: "precalculus",
  light: {
    bg: "#fefce8",
    card: "#fffdf2",
    cardHover: "#fffbea",
    border: "#f0e6c0",
    accent: "#ae5f05",
    accentText: "#ffffff",
    text: "#292524",
    textMuted: "#57534e",
    textDim: "#777370",
    // Ruled lines + the classic red margin line.
    texture:
      "background-image:linear-gradient(90deg,transparent 44px,rgba(220,38,38,0.20) 44px,rgba(220,38,38,0.20) 45px,transparent 45px),repeating-linear-gradient(transparent,transparent 27px,rgba(217,119,6,0.12) 27px,rgba(217,119,6,0.12) 28px);",
  },
  dark: {
    bg: "#1c1917",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(217,119,6,0.28)",
    accent: "#fbbf24",
    accentText: "#1c1917",
    text: "#e7e5e4",
    textMuted: "rgba(231,229,228,0.68)",
    textDim: "rgba(231,229,228,0.51)",
    texture:
      "background-image:linear-gradient(90deg,transparent 44px,rgba(248,113,113,0.22) 44px,rgba(248,113,113,0.22) 45px,transparent 45px),repeating-linear-gradient(transparent,transparent 27px,rgba(251,191,36,0.10) 27px,rgba(251,191,36,0.10) 28px);",
  },
};

export const whiteboardTheme: SubjectTheme = {
  id: "whiteboard",
  name: "Algebra",
  slug: "algebra",
  light: {
    bg: "#ffffff",
    card: "#ffffff",
    cardHover: "#fff7ed",
    border: "#fed7aa",
    accent: "#cc4d0a",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#4d596b",
    textDim: "#6c7786",
    // Corner glow + a faint diagonal marker swipe.
    texture:
      "background-image:linear-gradient(115deg,transparent 58%,rgba(234,88,12,0.05) 58%,rgba(234,88,12,0.05) 76%,transparent 76%),radial-gradient(ellipse at 0% 0%, rgba(234,88,12,0.07) 0%, transparent 55%);",
  },
  dark: {
    bg: "#191411",
    card: "rgba(255,255,255,0.045)",
    cardHover: "rgba(255,255,255,0.08)",
    border: "rgba(251,146,60,0.24)",
    accent: "#fb923c",
    accentText: "#191411",
    text: "#e7e5e4",
    textMuted: "rgba(231,229,228,0.67)",
    textDim: "rgba(231,229,228,0.51)",
    texture:
      "background-image:linear-gradient(115deg,transparent 58%,rgba(251,146,60,0.06) 58%,rgba(251,146,60,0.06) 76%,transparent 76%),radial-gradient(ellipse at 0% 0%, rgba(251,146,60,0.10) 0%, transparent 55%);",
  },
};

export const vellumTheme: SubjectTheme = {
  id: "vellum",
  name: "Geometry",
  slug: "geometry",
  light: {
    bg: "#fafaf5",
    card: "#ffffff",
    cardHover: "#f6faf8",
    border: "#d5e5df",
    accent: "#0b8176",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#4b5768",
    textDim: "#697483",
    texture:
      "background-image:linear-gradient(0deg,rgba(13,148,136,0.09) 1px,transparent 1px),linear-gradient(60deg,rgba(13,148,136,0.07) 1px,transparent 1px),linear-gradient(120deg,rgba(13,148,136,0.07) 1px,transparent 1px);background-size:28px 28px;",
  },
  dark: {
    bg: "#0e1716",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(45,212,191,0.22)",
    accent: "#2dd4bf",
    accentText: "#0e1716",
    text: "#e2e8f0",
    textMuted: "rgba(226,232,240,0.67)",
    textDim: "rgba(226,232,240,0.50)",
    texture:
      "background-image:linear-gradient(0deg,rgba(45,212,191,0.06) 1px,transparent 1px),linear-gradient(60deg,rgba(45,212,191,0.05) 1px,transparent 1px),linear-gradient(120deg,rgba(45,212,191,0.05) 1px,transparent 1px);background-size:28px 28px;",
  },
};

export const vennSlateTheme: SubjectTheme = {
  id: "venn-slate",
  name: "Set Theory",
  slug: "set-theory",
  light: {
    bg: "#f7f6f3",
    card: "#ffffff",
    cardHover: "#f1f5f2",
    border: "#dcd8d0",
    accent: "#04815a",
    accentText: "#ffffff",
    text: "#292524",
    textMuted: "#57534e",
    textDim: "#74706d",
    // One big Venn diagram — two overlapping rings, FIXED size and anchored in
    // the upper-centre so it stays a bounded, centred backdrop (never scaling
    // with page height into the footer).
    texture:
      "background-image:radial-gradient(circle at 40% 50%, transparent 27%, rgba(5,150,105,0.16) 27.4%, rgba(5,150,105,0.16) 28.4%, transparent 28.8%),radial-gradient(circle at 60% 50%, transparent 27%, rgba(5,150,105,0.13) 27.4%, rgba(5,150,105,0.13) 28.4%, transparent 28.8%);background-size:760px 600px,760px 600px;background-position:calc(50% - 150px) 130px,calc(50% - 150px) 130px;background-repeat:no-repeat,no-repeat;",
  },
  dark: {
    bg: "#292524",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(231,229,228,0.14)",
    accent: "#34d399",
    accentText: "#1c1917",
    text: "#e7e5e4",
    textMuted: "rgba(231,229,228,0.73)",
    textDim: "rgba(231,229,228,0.54)",
    texture:
      "background-image:radial-gradient(circle at 40% 50%, transparent 27%, rgba(52,211,153,0.14) 27.4%, rgba(52,211,153,0.14) 28.4%, transparent 28.8%),radial-gradient(circle at 60% 50%, transparent 27%, rgba(52,211,153,0.11) 27.4%, rgba(52,211,153,0.11) 28.4%, transparent 28.8%);background-size:760px 600px,760px 600px;background-position:calc(50% - 150px) 130px,calc(50% - 150px) 130px;background-repeat:no-repeat,no-repeat;",
  },
};

export const parchmentTheme: SubjectTheme = {
  id: "parchment",
  name: "Number Theory",
  slug: "number-theory",
  light: {
    bg: "#faf0d7",
    card: "#fffcf2",
    cardHover: "#f8ecca",
    border: "#e6d3a3",
    accent: "#b25209",
    accentText: "#ffffff",
    text: "#292524",
    textMuted: "#54504b",
    textDim: "#716d6a",
    // Ledger columns + aged-edge vignette.
    texture:
      "background-image:radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(180,83,9,0.09) 100%),repeating-linear-gradient(90deg,transparent,transparent 55px,rgba(180,83,9,0.09) 55px,rgba(180,83,9,0.09) 56px);",
  },
  dark: {
    bg: "#1f1a12",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(234,179,8,0.22)",
    accent: "#eab308",
    accentText: "#1f1a12",
    text: "#ede4d3",
    textMuted: "rgba(237,228,211,0.69)",
    textDim: "rgba(237,228,211,0.52)",
    texture:
      "background-image:radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(234,179,8,0.07) 100%),repeating-linear-gradient(90deg,transparent,transparent 55px,rgba(234,179,8,0.09) 55px,rgba(234,179,8,0.09) 56px);",
  },
};

export const dotLatticeTheme: SubjectTheme = {
  id: "dot-lattice",
  name: "Combinatorics",
  slug: "combinatorics",
  light: {
    bg: "#fdf9fb",
    card: "#ffffff",
    cardHover: "#fdf2f8",
    border: "#f3d3e3",
    accent: "#d72675",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#4b5768",
    textDim: "#697483",
    texture:
      "background-image:radial-gradient(circle, rgba(219,39,119,0.20) 1.5px, transparent 1.5px);background-size:18px 18px;",
  },
  dark: {
    bg: "#18181b",
    card: "rgba(255,255,255,0.045)",
    cardHover: "rgba(255,255,255,0.08)",
    border: "rgba(244,114,182,0.22)",
    accent: "#f472b6",
    accentText: "#18181b",
    text: "#e4e4e7",
    textMuted: "rgba(228,228,231,0.68)",
    textDim: "rgba(228,228,231,0.51)",
    texture:
      "background-image:radial-gradient(circle, rgba(244,114,182,0.14) 1px, transparent 1px);background-size:18px 18px;",
  },
};

export const terminalTheme: SubjectTheme = {
  id: "terminal",
  name: "Discrete Mathematics",
  slug: "discrete-mathematics",
  light: {
    bg: "#f0f7f9",
    card: "#ffffff",
    cardHover: "#e9f4f7",
    border: "#c4dfe6",
    accent: "#077b97",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#485464",
    textDim: "#66707f",
    texture:
      "background-image:repeating-linear-gradient(transparent,transparent 5px,rgba(8,145,178,0.05) 5px,rgba(8,145,178,0.05) 6px);",
  },
  dark: {
    bg: "#0a1214",
    card: "rgba(255,255,255,0.035)",
    cardHover: "rgba(255,255,255,0.06)",
    border: "rgba(34,211,238,0.18)",
    accent: "#22d3ee",
    accentText: "#0a1214",
    text: "#dcf5f7",
    textMuted: "rgba(220,245,247,0.63)",
    textDim: "rgba(220,245,247,0.48)",
    texture:
      "background-image:repeating-linear-gradient(transparent,transparent 5px,rgba(34,211,238,0.035) 5px,rgba(34,211,238,0.035) 6px);",
  },
};

export const proofSheetTheme: SubjectTheme = {
  id: "proof-sheet",
  name: "Mathematical Logic",
  slug: "mathematical-logic",
  light: {
    bg: "#f8fafc",
    card: "#ffffff",
    cardHover: "#f0f7fc",
    border: "#d7e6f2",
    accent: "#0279b7",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#4b5768",
    textDim: "#697483",
    // Fitch-style proof: one strong vertical rule + faint horizontal steps.
    texture:
      "background-image:linear-gradient(90deg,transparent 26px,rgba(2,132,199,0.28) 26px,rgba(2,132,199,0.28) 28px,transparent 28px),repeating-linear-gradient(transparent,transparent 25px,rgba(2,132,199,0.06) 25px,rgba(2,132,199,0.06) 26px);",
  },
  dark: {
    bg: "#0d1520",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(56,189,248,0.2)",
    accent: "#38bdf8",
    accentText: "#0d1520",
    text: "#e2e8f0",
    textMuted: "rgba(226,232,240,0.67)",
    textDim: "rgba(226,232,240,0.50)",
    texture:
      "background-image:linear-gradient(90deg,transparent 26px,rgba(56,189,248,0.30) 26px,rgba(56,189,248,0.30) 28px,transparent 28px),repeating-linear-gradient(transparent,transparent 25px,rgba(56,189,248,0.07) 25px,rgba(56,189,248,0.07) 26px);",
  },
};

export const signalTheme: SubjectTheme = {
  id: "signal",
  name: "Information Theory",
  slug: "information-theory",
  light: {
    bg: "#f6faf3",
    card: "#ffffff",
    cardHover: "#f2f8ec",
    border: "#d9e6c8",
    accent: "#4f7f0a",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#4a5667",
    textDim: "#687281",
    // Two overlaid bar rhythms — a bit-pattern, not plain stripes.
    texture:
      "background-image:repeating-linear-gradient(90deg,rgba(101,163,13,0.08) 0,rgba(101,163,13,0.08) 3px,transparent 3px,transparent 9px),repeating-linear-gradient(90deg,rgba(101,163,13,0.05) 0,rgba(101,163,13,0.05) 2px,transparent 2px,transparent 23px);",
  },
  dark: {
    bg: "#131c16",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(163,230,53,0.18)",
    accent: "#a3e635",
    accentText: "#131c16",
    text: "#e8f0e4",
    textMuted: "rgba(232,240,228,0.66)",
    textDim: "rgba(232,240,228,0.49)",
    texture:
      "background-image:repeating-linear-gradient(90deg,rgba(163,230,53,0.07) 0,rgba(163,230,53,0.07) 3px,transparent 3px,transparent 9px),repeating-linear-gradient(90deg,rgba(163,230,53,0.045) 0,rgba(163,230,53,0.045) 2px,transparent 2px,transparent 23px);",
  },
};

export const manuscriptTheme: SubjectTheme = {
  id: "manuscript",
  name: "Real Analysis",
  slug: "real-analysis",
  light: {
    bg: "#fffcf5",
    card: "#ffffff",
    cardHover: "#fdf5f4",
    border: "#f2dcd6",
    accent: "#9f1239",
    accentText: "#ffffff",
    text: "#292524",
    textMuted: "#57534e",
    textDim: "#777370",
    // Paired manuscript ruling (double lines), distinct from single-ruled notebook.
    texture:
      "background-image:repeating-linear-gradient(transparent,transparent 30px,rgba(159,18,57,0.08) 30px,rgba(159,18,57,0.08) 31px,transparent 31px,transparent 34px,rgba(159,18,57,0.08) 34px,rgba(159,18,57,0.08) 35px);",
  },
  dark: {
    bg: "#1c1214",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(251,113,133,0.2)",
    accent: "#fb7185",
    accentText: "#1c1214",
    text: "#eae2e4",
    textMuted: "rgba(234,226,228,0.68)",
    textDim: "rgba(234,226,228,0.51)",
    texture:
      "background-image:repeating-linear-gradient(transparent,transparent 30px,rgba(251,113,133,0.08) 30px,rgba(251,113,133,0.08) 31px,transparent 31px,transparent 34px,rgba(251,113,133,0.08) 34px,rgba(251,113,133,0.08) 35px);",
  },
};

export const obsidianTheme: SubjectTheme = {
  id: "obsidian",
  name: "Abstract Algebra",
  slug: "abstract-algebra",
  light: {
    bg: "#f7f3fc",
    card: "#ffffff",
    cardHover: "#f3edfa",
    border: "#ddd0f0",
    accent: "#7c3aed",
    accentText: "#ffffff",
    text: "#1e293b",
    textMuted: "#485464",
    textDim: "#66707f",
    texture:
      "background-image:radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 55%),radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.05) 0%, transparent 45%);",
  },
  dark: {
    bg: "#17131f",
    card: "rgba(255,255,255,0.045)",
    cardHover: "rgba(255,255,255,0.08)",
    border: "rgba(167,139,250,0.2)",
    accent: "#a78bfa",
    accentText: "#17131f",
    text: "#e8e4f3",
    textMuted: "rgba(232,228,243,0.67)",
    textDim: "rgba(232,228,243,0.51)",
    texture:
      "background-image:radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.09) 0%, transparent 55%);",
  },
};

const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  calculus: graphPaperTheme,
  statistics: chalkboardTheme,
  "linear-algebra": blueprintTheme,
  precalculus: notebookTheme,
  algebra: whiteboardTheme,
  geometry: vellumTheme,
  "set-theory": vennSlateTheme,
  "number-theory": parchmentTheme,
  combinatorics: dotLatticeTheme,
  "discrete-mathematics": terminalTheme,
  "mathematical-logic": proofSheetTheme,
  "information-theory": signalTheme,
  "real-analysis": manuscriptTheme,
  "abstract-algebra": obsidianTheme,
};

/** Theme for a subject, or null → default site look. */
export function getThemeForSubject(slug: string): SubjectTheme | null {
  return SUBJECT_THEMES[slug] ?? null;
}

/** Class carrying the subject's world; "" for unthemed subjects. */
export function subjectThemeClass(slug: string): string {
  const theme = SUBJECT_THEMES[slug];
  return theme ? `subject-theme-${theme.id}` : "";
}

function paletteBlock(selector: string, p: ThemePalette): string {
  // The card color may be translucent (frosted look over the textured page).
  // --surface-solid is always opaque: used by the nav bar and dropdown so they
  // never show the page texture through them.
  const surfaceSolid = p.card.startsWith("rgba") ? p.bg : p.card;
  return (
    `${selector}{` +
    `--bg:${p.bg};--surface:${p.card};--surface-solid:${surfaceSolid};--surface-2:${p.cardHover};` +
    `--text-primary:${p.text};--text-secondary:${p.textMuted};--text-muted:${p.textDim};` +
    `--border:${p.border};--accent:${p.accent};--accent-text:${p.accentText};` +
    `--background:${p.bg};--foreground:${p.text};` +
    `background-color:${p.bg};${p.texture ?? ""}` +
    `}`
  );
}

/**
 * CSS for every theme in both modes. Render once in the root layout:
 *   <style>{allThemesCss()}</style>
 * `.dark .subject-theme-x` outranks `.subject-theme-x`, so themed surfaces
 * follow the site's light/dark toggle.
 */
export function allThemesCss(): string {
  return Object.values(SUBJECT_THEMES)
    .map(
      (t) =>
        paletteBlock(`.subject-theme-${t.id}`, t.light) +
        "\n" +
        paletteBlock(`.dark .subject-theme-${t.id}`, t.dark),
    )
    .join("\n");
}
