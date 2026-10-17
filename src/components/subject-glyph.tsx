import { subjectThemeClass } from "@/lib/themes";

/**
 * A subject's glyph in a list beside its name: a fixed column so the names
 * line up. Glyphs longer than two characters (H(X)) are set smaller to fit it.
 */
export function SubjectGlyph({ slug, icon }: { slug: string; icon?: string }) {
  const glyph = icon || "•";
  return (
    <span
      aria-hidden
      className={`w-7 shrink-0 whitespace-nowrap text-center font-serif text-[var(--subject-accent,var(--text-muted))] ${subjectThemeClass(slug)}`}
    >
      <span className={glyph.length > 2 ? "text-[0.7em]" : undefined}>{glyph}</span>
    </span>
  );
}
