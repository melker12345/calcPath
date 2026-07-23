/**
 * Shared subject icon tile styles — neutral surface, muted category tint on the glyph only.
 * Avoids the loud per-category background + ring treatment.
 */

export type SubjectIconSize = "xs" | "sm" | "md";

const SIZE_CLASSES: Record<SubjectIconSize, string> = {
  xs: "h-5 w-5 text-[11px] rounded",
  sm: "h-7 w-7 text-sm rounded-md",
  md: "h-10 w-10 text-xl rounded-xl",
};

const CONTAINER_BASE =
  "shrink-0 flex items-center justify-center border theme-border bg-[var(--surface)] font-serif font-medium leading-none tabular-nums transition-colors";

/** Muted glyph color by subject category (container stays neutral). */
export function getSubjectIconGlyphClass(category?: string): string {
  switch (category) {
    case "foundations":
      return "text-stone-600 dark:text-stone-400";
    case "calculus":
      return "text-[var(--accent)]";
    case "linear":
      return "text-indigo-600/85 dark:text-indigo-400/90";
    case "stats":
      return "text-slate-600 dark:text-slate-400";
    case "discrete":
      return "text-violet-700/75 dark:text-violet-400/90";
    case "algebra":
      return "text-purple-700/75 dark:text-purple-400/90";
    case "logic":
      return "text-amber-800/75 dark:text-amber-400/90";
    case "analysis":
      return "text-rose-800/75 dark:text-rose-400/90";
    default:
      return "text-[var(--text-secondary)]";
  }
}

export function getSubjectIconClass(
  category?: string,
  size: SubjectIconSize = "md"
): string {
  return `${CONTAINER_BASE} ${SIZE_CLASSES[size]} ${getSubjectIconGlyphClass(category)}`;
}

/** Scales from compact (mobile list) to full tile (desktop grid). */
export function getSubjectIconResponsiveClass(category?: string): string {
  return `${CONTAINER_BASE} h-8 w-8 rounded-lg text-base sm:h-9 sm:w-9 sm:rounded-xl sm:text-lg lg:h-10 lg:w-10 lg:text-xl ${getSubjectIconGlyphClass(category)}`;
}