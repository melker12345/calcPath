import type { CSSProperties } from "react";

export type SubjectTheme = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  colors: {
    bg: string;
    card: string;
    cardHover: string;
    border: string;
    borderBright: string;
    accent: string;
    accentLight: string;
    accentBg: string;
    text: string;
    textMuted: string;
    textDim: string;
    navBg: string;
    navBorder: string;
    navText: string;
    navTextHover: string;
    navAccent: string;
    navAccentText: string;
    logoBg: string;
    logoText: string;
  };
  fonts: { heading: string; body: string };
  backgroundCSS: CSSProperties;
};

const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

export const graphPaperTheme: SubjectTheme = {
  id: "graph-paper",
  name: "Calculus",
  slug: "calculus",
  icon: "∫",
  colors: {
    bg: "#f8fafc",
    card: "#ffffff",
    cardHover: "#ffffff",
    border: "#dbeafe",
    borderBright: "#93c5fd",
    accent: "#dc2626",
    accentLight: "#fecaca",
    accentBg: "rgba(220,38,38,0.04)",
    text: "#1e293b",
    textMuted: "#64748b",
    textDim: "#94a3b8",
    navBg: "rgba(255,255,255,0.85)",
    navBorder: "#dbeafe",
    navText: "#1e293b",
    navTextHover: "#dc2626",
    navAccent: "#1e293b",
    navAccentText: "#ffffff",
    logoBg: "#1e293b",
    logoText: "#ffffff",
  },
  fonts: { heading: serif, body },
  backgroundCSS: {
    backgroundColor: "#f8fafc",
    backgroundImage: `
      linear-gradient(#93c5fd33 1px, transparent 1px),
      linear-gradient(90deg, #93c5fd33 1px, transparent 1px)
    `,
    backgroundSize: "24px 24px",
  },
};

export const chalkboardTheme: SubjectTheme = {
  id: "chalkboard",
  name: "Statistics",
  slug: "statistics",
  icon: "σ",
  colors: {
    bg: "#1a3a2a",
    card: "rgba(255,255,255,0.02)",
    cardHover: "rgba(255,255,255,0.05)",
    border: "rgba(232,228,217,0.12)",
    borderBright: "rgba(232,228,217,0.2)",
    accent: "#fde68a",
    accentLight: "rgba(253,230,138,0.15)",
    accentBg: "rgba(253,230,138,0.1)",
    text: "#e8e4d9",
    textMuted: "rgba(232,228,217,0.55)",
    textDim: "rgba(232,228,217,0.35)",
    navBg: "rgba(18,42,31,0.9)",
    navBorder: "rgba(232,228,217,0.1)",
    navText: "#e8e4d9",
    navTextHover: "#fde68a",
    navAccent: "#fde68a",
    navAccentText: "#122a1f",
    logoBg: "#fde68a",
    logoText: "#122a1f",
  },
  fonts: { heading: serif, body },
  backgroundCSS: {
    background: `
      radial-gradient(ellipse at 30% 20%, #1f4433 0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, #1f4433 0%, transparent 40%),
      #1a3a2a
    `,
  },
};

export const neonTheme: SubjectTheme = {
  id: "neon",
  name: "Neon",
  slug: "neon",
  icon: "λ",
  colors: {
    bg: "#0b1120",
    card: "rgba(255,255,255,0.035)",
    cardHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    borderBright: "rgba(255,255,255,0.12)",
    accent: "#22d3ee",
    accentLight: "rgba(34,211,238,0.15)",
    accentBg: "rgba(34,211,238,0.06)",
    text: "#e2e8f0",
    textMuted: "rgba(255,255,255,0.55)",
    textDim: "rgba(255,255,255,0.35)",
    navBg: "rgba(11,17,32,0.9)",
    navBorder: "rgba(255,255,255,0.08)",
    navText: "#e2e8f0",
    navTextHover: "#22d3ee",
    navAccent: "#22d3ee",
    navAccentText: "#0b1120",
    logoBg: "#22d3ee",
    logoText: "#0b1120",
  },
  fonts: { heading: serif, body },
  backgroundCSS: {
    background: "#0b1120",
  },
};

export const blueprintTheme: SubjectTheme = {
  id: "blueprint",
  name: "Linear Algebra",
  slug: "linear-algebra",
  icon: "λ",
  colors: {
    bg: "#0f172a",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(51,114,162,0.25)",
    borderBright: "rgba(51,114,162,0.45)",
    accent: "#3372A2",
    accentLight: "rgba(51,114,162,0.18)",
    accentBg: "rgba(51,114,162,0.08)",
    text: "#e2e8f0",
    textMuted: "rgba(226,232,240,0.6)",
    textDim: "rgba(226,232,240,0.35)",
    navBg: "rgba(15,23,42,0.92)",
    navBorder: "rgba(51,114,162,0.2)",
    navText: "#e2e8f0",
    navTextHover: "#5b9fd4",
    navAccent: "#3372A2",
    navAccentText: "#ffffff",
    logoBg: "#3372A2",
    logoText: "#ffffff",
  },
  fonts: { heading: serif, body },
  backgroundCSS: {
    background: `
      radial-gradient(ellipse at 20% 30%, rgba(51,114,162,0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(51,114,162,0.06) 0%, transparent 40%),
      #0f172a
    `,
  },
};

export const themes = {
  "graph-paper": graphPaperTheme,
  chalkboard: chalkboardTheme,
  blueprint: blueprintTheme,
  neon: neonTheme,
} as const;

export function getThemeForSubject(slug: string): SubjectTheme {
  switch (slug) {
    case "calculus":
      return graphPaperTheme;
    case "statistics":
      return chalkboardTheme;
    case "linear-algebra":
      return blueprintTheme;
    default:
      return graphPaperTheme;
  }
}
