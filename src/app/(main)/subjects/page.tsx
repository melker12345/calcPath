import Link from "next/link";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";
import { getSubjectIconClass } from "@/lib/subject-icon-styles";

export default async function SubjectsPage() {
  const subjectList = await getAvailableSubjectConfigs();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight theme-text">All subjects</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed theme-text-secondary">
          Free, self-contained math courses. Read the chapters or jump straight into practice problems.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjectList.map((subject) => {
          const chapterLabel =
            subject.topicCount === 1 ? "1 chapter" : `${subject.topicCount ?? 0} chapters`;

          return (
            <article
              key={subject.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm transition hover:border-[var(--accent)]/25 hover:shadow-md"
            >
              <Link
                href={`/${subject.slug}`}
                className="flex flex-1 flex-col p-4 transition hover:bg-[var(--surface-2)]/40 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`${getSubjectIconClass(subject.category, "sm")} group-hover:border-[var(--accent)]/30`}
                  >
                    {subject.icon || "📘"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold theme-text sm:text-lg">{subject.label}</h2>
                    {subject.topicCount ? (
                      <p className="mt-0.5 text-xs font-medium theme-text-muted">{chapterLabel}</p>
                    ) : null}
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed theme-text-secondary">
                  {subject.shortDescription}
                </p>
              </Link>

              <div className="grid grid-cols-2 gap-2 border-t theme-border bg-[var(--surface)]/50 p-3">
                <Link
                  href={`/${subject.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary transition hover:border-[var(--accent)]/35 hover:bg-[var(--surface-2)] hover:theme-text sm:text-sm"
                >
                  <span aria-hidden>📖</span>
                  Chapters
                </Link>
                <Link
                  href={`/${subject.slug}/practice`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:text-sm"
                >
                  <span aria-hidden>✎</span>
                  Practice
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {subjectList.length === 0 && (
        <p className="text-sm theme-text-muted">No subjects found.</p>
      )}
    </div>
  );
}