#!/usr/bin/env node
/**
 * content:contrast — WCAG contrast audit of every subject theme, both modes.
 *
 * Each theme projects its palette onto the global tokens, so a colour chosen for
 * its character can quietly make body text unreadable. This checks the three
 * that carry text:
 *
 *   textMuted -> --text-secondary   secondary prose, target 4.5:1 (we hold 7:1)
 *   textDim   -> --text-muted       labels and section numbers, target 4.5:1
 *   accent                          link text, target 4.5:1
 *
 * It also checks that a button's label still reads on its accent background.
 * Exits 1 if anything falls below AA.
 *
 * Run: npx tsx scripts/audit-contrast.ts
 */
import { getThemeForSubject } from "../src/lib/themes";

const SUBJECTS = ["calculus","statistics","linear-algebra","precalculus","algebra","geometry","set-theory","number-theory","combinatorics","discrete-mathematics","mathematical-logic","information-theory","real-analysis","abstract-algebra"];

type RGB = [number, number, number];
const parse = (c: string): { rgb: RGB; a: number } => {
  if (c.startsWith("#")) {
    const h = c.slice(1);
    const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
    return { rgb: [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)], a: 1 };
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error("bad color " + c);
  const p = m[1].split(",").map((x) => parseFloat(x.trim()));
  return { rgb: [p[0], p[1], p[2]], a: p[3] ?? 1 };
};
const over = (fg: string, bg: string): RGB => {
  const f = parse(fg), b = parse(bg);
  return [0,1,2].map((i) => f.rgb[i] * f.a + b.rgb[i] * (1 - f.a)) as RGB;
};
const lum = (rgb: RGB) => {
  const [r,g,b] = rgb.map((v) => { const s = v/255; return s <= 0.03928 ? s/12.92 : ((s+0.055)/1.055) ** 2.4; });
  return 0.2126*r + 0.7152*g + 0.0722*b;
};
const ratio = (fg: string, bg: string) => {
  const f = lum(over(fg, bg)), b = lum(over(bg, bg));
  return (Math.max(f,b) + 0.05) / (Math.min(f,b) + 0.05);
};
const fmt = (n: number) => n.toFixed(2).padStart(5);
const flag = (n: number, need: number) => (n < need ? " FAIL" : "     ");

for (const mode of ["light", "dark"] as const) {
  console.log(`\n=== ${mode.toUpperCase()} ===`);
  console.log("subject".padEnd(22) + "body(muted)".padStart(12) + "  " + "primary".padStart(8) + "  " + "dim".padStart(8) + "  " + "accent".padStart(8));
  for (const slug of SUBJECTS) {
    const t = getThemeForSubject(slug);
    if (!t) continue;
    const p = t[mode];
    const body = ratio(p.textMuted, p.bg);
    const prim = ratio(p.text, p.bg);
    const dim = ratio(p.textDim, p.bg);
    const acc = ratio(p.accent, p.bg);
    console.log(
      slug.padEnd(22) + fmt(body) + flag(body, 4.5) + "  " + fmt(prim) + "  " + fmt(dim) + flag(dim, 3) + "  " + fmt(acc) + flag(acc, 4.5)
    );
  }
}

// Button labels sit on the accent, not the page.
let failures = 0;
for (const slug of SUBJECTS) {
  const theme = getThemeForSubject(slug);
  if (!theme) continue;
  for (const mode of ["light", "dark"] as const) {
    const p = theme[mode];
    const onAccent = ratio(p.accentText, p.accent);
    if (onAccent < 4.5) {
      console.log(`FAIL button label ${slug} ${mode}: ${onAccent.toFixed(2)}`);
      failures += 1;
    }
    if (ratio(p.textMuted, p.bg) < 4.5) failures += 1;
    if (ratio(p.textDim, p.bg) < 4.5) failures += 1;
    if (ratio(p.accent, p.bg) < 4.5) failures += 1;
  }
}
console.log(failures === 0 ? "\nEvery theme meets AA in both modes." : `\n${failures} contrast failure(s).`);
process.exitCode = failures === 0 ? 0 : 1;
