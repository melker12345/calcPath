import Link from "next/link";

type CourseTopic = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes?: number;
};

export function CourseContentsPage({
  title,
  description,
  subjectSlug,
  topics,
}: {
  title: string;
  description: string;
  subjectSlug: string;
  topics: CourseTopic[];
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="border-b border-stone-300 pb-6 dark:border-[var(--border)] dark:bg-[var(--bg)]">
        <p className="text-sm text-stone-600 dark:text-[var(--text-muted)]">
          <Link href="/" className="text-blue-700 hover:underline dark:text-[var(--accent)]">
            Contents
          </Link>
          {" / "}
          {title}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-[var(--text-primary)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-stone-700 dark:text-[var(--text-secondary)]">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={`/${subjectSlug}/modules`} className="text-blue-700 hover:underline dark:text-[var(--accent)]">
            View all chapters
          </Link>
          <Link href={`/${subjectSlug}/practice`} className="text-blue-700 hover:underline dark:text-[var(--accent)]">
            Practice problems
          </Link>
          <Link href={`/${subjectSlug}/dashboard`} className="text-blue-700 hover:underline dark:text-[var(--accent)]">
            Dashboard
          </Link>
        </div>
      </div>

      <section className="py-8">
        <h2 className="text-xl font-semibold text-stone-950 dark:text-[var(--text-primary)]">Course Contents</h2>
        <ol className="mt-5 divide-y divide-stone-300 border-y border-stone-300 dark:divide-[var(--border)] dark:border-[var(--border)]">
          {topics.map((topic, index) => (
            <li key={topic.id} className="grid gap-2 py-4 sm:grid-cols-[5rem_1fr_auto] sm:items-start">
              <span className="text-sm font-medium tabular-nums text-stone-500 dark:text-[var(--text-muted)]">
                Chapter {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-stone-950 dark:text-[var(--text-primary)]">
                  <Link href={`/${subjectSlug}/modules/${topic.id}`} className="text-blue-800 hover:underline dark:text-[var(--accent)]">
                    {topic.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-[var(--text-secondary)]">
                  {topic.description}
                </p>
              </div>
              {topic.estimatedMinutes ? (
                <span className="text-sm text-stone-500 sm:text-right dark:text-[var(--text-muted)]">
                  {topic.estimatedMinutes} min
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
