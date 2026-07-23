import Link from "next/link";
import { subjectThemeClass } from "@/lib/themes";

/**
 * Themed subject card — a miniature window into the subject's metaphor world
 * (graph paper, chalkboard, blueprint, vellum, terminal, ...). The
 * .subject-theme-<id> class (generated CSS in src/lib/themes.ts, injected by
 * the root layout) paints the theme's background texture and projects its
 * palette onto the token vars — with light AND dark variants, so cards follow
 * the site toggle. Server component, no client JS.
 *
 * Used by /subjects and the landing page subject grid.
 */

const CATEGORY_LABELS: Record<string, string> = {
  foundations: "Foundations",
  calculus: "Calculus",
  algebra: "Algebra",
  analysis: "Analysis",
  discrete: "Discrete",
  linear: "Linear algebra",
  logic: "Logic",
  stats: "Statistics",
};

export type SubjectCardData = {
  slug: string;
  label: string;
  icon?: string;
  shortDescription: string;
  category?: string | null;
  topicCount?: number | null;
};

export function SubjectCard({ subject }: { subject: SubjectCardData }) {
  const themeClass = subjectThemeClass(subject.slug);
  const glyph = subject.icon || subject.label.charAt(0).toUpperCase();
  const chapterLabel =
    subject.topicCount === 1 ? "1 chapter" : `${subject.topicCount ?? 0} chapters`;
  const categoryLabel = subject.category
    ? CATEGORY_LABELS[subject.category] ?? subject.category
    : null;

  return (
    <Link
      href={`/${subject.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border theme-border p-6 shadow-[0_1px_2px_rgba(2,6,23,0.05)] transition-shadow duration-300 ease-out hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--accent)_50%,rgba(2,6,23,0.35))] ${
        themeClass || "bg-[var(--surface)]"
      }`}
    >
      {/* Glyph as a typographic mark in the subject's accent */}
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="font-serif text-[1.9rem] leading-none text-[var(--accent)]"
        >
          {glyph}
        </span>
        {categoryLabel && (
          <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] theme-text-muted">
            {categoryLabel}
          </span>
        )}
      </div>

      <h3 className="mt-6 font-serif text-xl font-medium tracking-tight theme-text">
        {subject.label}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed theme-text-secondary">
        {subject.shortDescription}
      </p>

      {/* Accent-tinted divider so it reads as a UI line, not part of a ruled
          texture (notebook / manuscript / proof-sheet themes). */}
      <div
        className="mt-auto flex items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: "color-mix(in srgb, var(--accent) 28%, var(--border))" }}
      >
        <span className="text-xs font-medium theme-text-secondary">{chapterLabel}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)]">
          Start
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
