/**
 * Shared pure utilities for parsing the MDX dialect used in
 * content/{subject}/topics/{topicId}/module.mdx
 *
 * This centralizes the frontmatter stripping, H1 stripping, toSlug,
 * and especially the section heading + explicit <!-- section: slug --> lookahead logic.
 *
 * THE CRITICAL INVARIANT:
 * Every question's `section` (in questions.json) MUST exactly match one of the
 * `section` values produced here for the corresponding module.mdx.
 * This powers per-section mastery, deep links (?section=), dashboard, progress.
 *
 * Used by:
 * - loader.ts (deriveModuleStructureFromBundle for dashboard + slim modules; now via light mdx-only path + cache for perf)
 * - adapters.ts (parseMdxToLegacyModuleContent for SubjectModulePage compat)
 * - scripts/validate-content.ts (the hard section-matching check)
 *
 * Changes here affect ALL subjects and must preserve exact slug output for existing content.
 */

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Strip YAML frontmatter (--- ... ---) and the top-level # Title line.
 * We use the title from topic index.json instead.
 */
export function stripFrontmatterAndH1(source: string): string {
  let s = source.replace(/^---\s*[\s\S]*?---\s*\r?\n?/, "").trim();
  s = s.replace(/^#\s+[^\n]+\n?/, "").trim();
  return s;
}

/**
 * Resolve the stable section slug for a ## heading.
 * - Prefers explicit {#slug} in the heading
 * - Else falls back to toSlug(title)
 * - Then looks ahead a few lines for <!-- section: exact-slug --> (used in some ports, esp. calculus)
 * - Skips "Common Mistakes" headings (they are not practice sections)
 */
export function resolveSectionSlug(
  rawTitle: string,
  lines: string[],
  currentIndex: number
): string {
  if (rawTitle.toLowerCase().includes("common mistake")) {
    return ""; // caller should skip
  }
  // The regex match already gave us the optional capture, but this fn is for reuse
  // Here we assume caller has detected h2; we just compute slug + lookahead.
  let sec = toSlug(rawTitle);
  for (let j = currentIndex + 1; j < Math.min(currentIndex + 5, lines.length); j++) {
    const cm = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
    if (cm) {
      sec = cm[1];
      break;
    }
  }
  return sec;
}

/**
 * Extract the list of sections from a topic's module.mdx.
 * Returns array of { title, section } in document order.
 * - Skips the "Common Mistakes" section(s)
 * - Respects {#slug} and <!-- section: ... --> overrides
 *
 * This is the canonical implementation. All other section lists for a given MDX
 * should be derived from (or match) this.
 */
export function extractMdxSections(mdxSource?: string): Array<{ title: string; section: string }> {
  if (!mdxSource) return [];
  const src = stripFrontmatterAndH1(mdxSource);
  const lines = src.split(/\r?\n/);
  const secs: Array<{ title: string; section: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const h2 = line.match(/^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/i);
    if (h2) {
      const rawTitle = h2[1].trim();
      if (rawTitle.toLowerCase().includes("common mistake")) {
        continue;
      }
      const provided = h2[2];
      let sec = provided || toSlug(rawTitle);
      // Lookahead for explicit marker (reuse logic)
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const cm = lines[j].match(/<!--\s*section:\s*([a-z0-9-]+)\s*-->/i);
        if (cm) {
          sec = cm[1];
          break;
        }
      }
      secs.push({ title: rawTitle, section: sec });
    }
  }
  return secs;
}

/** Convenience: just the slugs (used heavily by validation). */
export function extractMdxSectionSlugs(mdxSource?: string): string[] {
  return extractMdxSections(mdxSource).map((s) => s.section);
}
