import type { Metadata } from "next";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";
import { SubjectCard } from "@/components/subject-card";

export const metadata: Metadata = {
  title: "All Subjects",
  description:
    "Browse every free CalcPath course — calculus, linear algebra, statistics, and more — with step-by-step chapters and practice problems.",
  alternates: { canonical: "https://calc-path.com/subjects" },
};

/**
 * Card blurb derived from the subject's shortDescription at render time only —
 * the underlying content descriptions feed SEO metadata and stay untouched.
 * Strips the repeated "A free X course covering/on/…" lead-in (it reads poorly
 * repeated across the grid) and truncates on a word boundary so the card never
 * clips mid-word.
 */
// Two lines at the card's width fit ~64 chars; keeping the JS cut below that
// means the word-boundary ellipsis lands before the CSS line-clamp can cut
// mid-word.
const BLURB_MAX = 64;

function cardBlurb(description: string): string {
  const stripped = description.replace(/^A free .+? course (?:covering |on )?/i, "");
  const blurb = stripped.charAt(0).toUpperCase() + stripped.slice(1);
  if (blurb.length <= BLURB_MAX) return blurb;
  const cut = blurb.slice(0, BLURB_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s—–-]+$/, "")}…`;
}

export default async function SubjectsPage() {
  const subjectList = await getAvailableSubjectConfigs();
  const sorted = [...subjectList].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">All subjects</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed theme-text-secondary">
          Free, self-contained math courses. Read the chapters or jump
          straight into practice.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((subject) => (
          <SubjectCard
            key={subject.slug}
            subject={{
              slug: subject.slug,
              label: subject.label,
              icon: subject.icon,
              shortDescription: cardBlurb(subject.shortDescription),
              category: subject.category,
              topicCount: subject.topicCount,
            }}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="text-sm theme-text-muted">No subjects found.</p>
      )}
    </div>
  );
}
