import Link from "next/link";

/**
 * Subject card for the /subjects catalogue. Plain bordered box, server
 * component, no client JS. Per-subject colour lives in the nav bar only.
 */

const CATEGORY_LABELS: Record<string, string> = {
  foundations: "Foundations",
  calculus: "Calculus",
  algebra: "Algebra",
  analysis: "Analysis",
  discrete: "Discrete",
  linear: "Linear algebra",
  logic: "Logic",
  stats: "Probability & statistics",
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
  const glyph = subject.icon || subject.label.charAt(0).toUpperCase();
  const chapterLabel =
    subject.topicCount === 1 ? "1 chapter" : `${subject.topicCount ?? 0} chapters`;
  const categoryLabel = subject.category
    ? (CATEGORY_LABELS[subject.category] ?? subject.category)
    : null;

  return (
    <Link href={`/${subject.slug}`} className="flex flex-col border theme-border bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden className="font-serif text-2xl leading-none theme-text">
          {glyph}
        </span>
        {categoryLabel && (
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] theme-text-muted">
            {categoryLabel}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-serif text-xl font-medium tracking-tight theme-text">{subject.label}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed theme-text-secondary">
        {subject.shortDescription}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t theme-border pt-3">
        <span className="text-xs theme-text-secondary">{chapterLabel}</span>
        <span className="text-sm text-[var(--accent)]">Open →</span>
      </div>
    </Link>
  );
}
