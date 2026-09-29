#!/usr/bin/env node
/**
 * content:contrast — WCAG contrast audit of the site tokens and every
 * subject's nav tint, in both modes.
 *
 * A subject changes only the nav bar tint and the accent used for its glyph
 * and links (src/lib/themes.ts). This checks that
 *
 *   - the site's text tokens read on the site background (AA 4.5:1),
 *   - the primary text still reads on each subject's tinted nav bar,
 *   - each subject accent reads as link text on the surface,
 *   - a label in accentText reads on the accent.
 *
 * color-mix(in srgb, accent N%, surface) is reproduced as a linear sRGB mix.
 * Exits 1 if anything falls below AA.
 *
 * Run: npx tsx scripts/audit-contrast.ts
 */
import { allSubjectThemes } from "../src/lib/themes";

// Mirrors :root / .dark in src/app/globals.css. Keep in sync by hand.
const TOKENS = {
  light: { bg: "#ffffff", surface: "#ffffff", text: "#111111", textSecondary: "#374151", textMuted: "#6b7280", accent: "#0969da" },
  dark: { bg: "#0d1117", surface: "#161b22", text: "#f0f6fc", textSecondary: "#d0d7de", textMuted: "#8b949e", accent: "#58a6ff" },
} as const;

type RGB = [number, number, number];
const hex = (c: string): RGB => {
  const h = c.slice(1);
  const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};
const mix = (a: string, pct: number, b: string): RGB => {
  const x = hex(a), y = hex(b);
  return [0, 1, 2].map((i) => x[i] * (pct / 100) + y[i] * (1 - pct / 100)) as RGB;
};
const lum = (rgb: RGB) => {
  const [r, g, b] = rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg: RGB, bg: RGB) => {
  const f = lum(fg), b = lum(bg);
  return (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
};
const fmt = (n: number) => n.toFixed(2).padStart(5);

let failures = 0;
const check = (label: string, r: number, need: number) => {
  const ok = r >= need;
  if (!ok) failures += 1;
  console.log(`${label.padEnd(44)} ${fmt(r)} ${ok ? "" : " FAIL"}`);
};

for (const mode of ["light", "dark"] as const) {
  const t = TOKENS[mode];
  console.log(`\n=== ${mode.toUpperCase()} ===`);
  check("text on bg", ratio(hex(t.text), hex(t.bg)), 4.5);
  check("text-secondary on bg", ratio(hex(t.textSecondary), hex(t.bg)), 4.5);
  check("text-muted on bg", ratio(hex(t.textMuted), hex(t.bg)), 4.5);
  check("accent on surface", ratio(hex(t.accent), hex(t.surface)), 4.5);
  const tint = mode === "dark" ? 16 : 12;
  for (const s of allSubjectThemes()) {
    const p = s[mode];
    const navBg = mix(p.accent, tint, t.surface);
    check(`${s.slug}: text on nav tint`, ratio(hex(t.text), navBg), 4.5);
    check(`${s.slug}: accent on surface`, ratio(hex(p.accent), hex(t.surface)), 4.5);
    check(`${s.slug}: accentText on accent`, ratio(hex(p.accentText), hex(p.accent)), 4.5);
  }
}

console.log(failures === 0 ? "\nEverything meets AA in both modes." : `\n${failures} contrast failure(s).`);
process.exitCode = failures === 0 ? 0 : 1;
