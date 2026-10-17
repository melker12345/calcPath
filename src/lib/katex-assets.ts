import { preload } from "react-dom";

/**
 * KaTeX's stylesheet and fonts are served from public/katex/ (see
 * scripts/sync-katex.ts). The query string changes with the KaTeX version so
 * the immutable cache header in out/_headers (scripts/cloudflare-assets.ts) is safe.
 */
export const KATEX_VERSION = "0.16.28";
export const KATEX_CSS_HREF = `/katex/katex.min.css?v=${KATEX_VERSION}`;

const CORE_FONTS = ["KaTeX_Main-Regular", "KaTeX_Math-Italic"];

/**
 * Ask the browser for the two fonts almost every formula uses before it has
 * parsed the stylesheet. Call from a Server Component that renders maths.
 */
export function preloadKatexFonts() {
  for (const name of CORE_FONTS) {
    preload(`/katex/fonts/${name}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
}
