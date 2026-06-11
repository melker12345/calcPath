import Link from "next/link";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";
import { getSubjectIconClass } from "@/lib/subject-icon-styles";

export default async function SubjectsPage() {
  const subjectList = await getAvailableSubjectConfigs();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">All Subjects</h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Browse our full collection of self-contained mathematics courses. New subjects can be added simply by dropping files into the <code>content/</code> directory — no code changes required.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjectList.map((subject) => (
          <div
            key={subject.slug}
            className={`rounded-xl border theme-border theme-surface p-3 shadow-sm transition hover:shadow-lg dark:hover:shadow-xl group`}
          >
            <Link href={`/${subject.slug}`} className="block">
              <div className="mb-1.5 flex items-center gap-2">
                <div className={`${getSubjectIconClass(subject.category, "sm")} group-hover:border-[var(--accent)]/25`}>
                  {subject.icon || "📘"}
                </div>
                <h2 className="text-base font-semibold">{subject.label}</h2>
              </div>

              <p className="mb-0.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {subject.shortDescription}
              </p>

              <p className="mb-0.5 text-[10px] text-zinc-500 dark:text-zinc-500 line-clamp-1">
                {subject.modulesDescription}
              </p>
              {subject.topicCount ? (
                <p className="mb-1.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {subject.topicCount} topics
                </p>
              ) : null}
            </Link>

            <div className="flex flex-wrap gap-1">
              <Link
                href={`/${subject.slug}`}
                className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-medium text-zinc-600 transition hover:text-zinc-900 active:scale-[0.985] dark:text-zinc-400 dark:hover:text-white"
              >
                Chapters
              </Link>
              <Link
                href={`/${subject.slug}/practice`}
                className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-medium text-zinc-600 transition hover:text-zinc-900 active:scale-[0.985] dark:text-zinc-400 dark:hover:text-white"
              >
                Practice
              </Link>
            </div>
          </div>
        ))}
      </div>

      {subjectList.length === 0 && (
        <p className="text-sm text-zinc-500">No subjects found.</p>
      )}

      <div className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
        Subjects are discovered automatically from <code>content/</code> directories containing an <code>index.json</code>. No code changes required to add new ones.
      </div>
    </div>
  );
}
