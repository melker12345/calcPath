import Link from "next/link";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";

function getCategoryIconClass(cat?: string) {
  // Prominent but clean category color on the icon container (with ring) as the main subtle visual cue for category.
  // No borders, lines, dots, or extra elements on the card body itself. Consistent with home page.
  switch (cat) {
    case "foundations":
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/70 dark:bg-emerald-900/70 dark:text-emerald-300 dark:ring-emerald-400/50";
    case "calculus":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-300/70 dark:bg-blue-900/70 dark:text-blue-300 dark:ring-blue-400/50";
    case "linear":
      return "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300/70 dark:bg-indigo-900/70 dark:text-indigo-300 dark:ring-indigo-400/50";
    case "stats":
      return "bg-teal-100 text-teal-700 ring-1 ring-teal-300/70 dark:bg-teal-900/70 dark:text-teal-300 dark:ring-teal-400/50";
    case "discrete":
      return "bg-violet-100 text-violet-700 ring-1 ring-violet-300/70 dark:bg-violet-900/70 dark:text-violet-300 dark:ring-violet-400/50";
    case "algebra":
      return "bg-purple-100 text-purple-700 ring-1 ring-purple-300/70 dark:bg-purple-900/70 dark:text-purple-300 dark:ring-purple-400/50";
    case "logic":
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-300/70 dark:bg-amber-900/70 dark:text-amber-300 dark:ring-amber-400/50";
    case "analysis":
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-300/70 dark:bg-rose-900/70 dark:text-rose-300 dark:ring-rose-400/50";
    default:
      return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300/50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/30";
  }
}

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
                <div className={`flex h-7 w-7 items-center justify-center rounded-md text-base ${getCategoryIconClass(subject.category)}`}>
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
                href={`/${subject.slug}/modules`}
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
