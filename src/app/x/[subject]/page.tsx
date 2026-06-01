import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import type { FileSystemContentBundle } from "@/lib/content/schema";

interface Props {
  params: Promise<{ subject: string }>;
}

/**
 * Experimental dynamic subject home (browse).
 * Loads 100% from new data (FileSystemContentBundle).
 * Proves: subject config + topics list come purely from content/ JSON.
 * Links prove navigation to explanation (MDX) and practice (generic).
 */
export default async function DynamicSubjectPage({ params }: Props) {
  const { subject: subjectSlug } = await params;

  let bundle: FileSystemContentBundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch (err) {
    // Unsupported subject in current FS loader (e.g. calculus partial)
    return (
      <div className="px-4 py-12">
        <p className="text-sm text-amber-700">Subject “{subjectSlug}” not yet available in the experimental data-driven loader (or partial content).</p>
        <Link href="/x" className="mt-4 inline-block underline">← Back to experimental subjects</Link>
      </div>
    );
  }

  const { config, topics, problems, mdxModules } = bundle;

  // Quick stats
  const totalProblems = problems.length;
  const topicsWithContent = topics.filter((t) => mdxModules.some((m) => m.topicId === t.id) || problems.some((p) => p.topicId === t.id));

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Link href="/x" className="text-sm text-blue-700 hover:underline">← All experimental subjects</Link>
      </div>

      <div className="mb-8 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config.icon}</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight font-serif">{config.label}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">{config.shortDescription}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
          ✓ Loaded purely from <code>content/{subjectSlug}/</code> ( {topics.length} topics, {totalProblems} practice questions, {mdxModules.length} rich MDX modules )
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Topics — pick explanation or practice</h2>
      <p className="mb-4 text-sm text-zinc-500">This list + links are generated from the FileSystemContentBundle. Full dynamic flow demo.</p>

      <div className="grid gap-3">
        {topics.map((topic, idx) => {
          const hasMdx = mdxModules.some((m) => m.topicId === topic.id);
          const topicProblems = problems.filter((p) => p.topicId === topic.id);
          const hasPractice = topicProblems.length > 0;

          return (
            <div key={topic.id} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-white p-4 dark:bg-[var(--surface)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">
                  {idx + 1}. {topic.title}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{topic.description}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {hasPractice ? `${topicProblems.length} practice questions` : "No questions yet"} • {hasMdx ? "has rich explanation" : "metadata only"}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 pt-2 sm:pt-0">
                <Link
                  href={`/x/${subjectSlug}/modules/${topic.id}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${hasMdx ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800"}`}
                  aria-disabled={!hasMdx}
                >
                  View explanation{hasMdx ? "" : " (soon)"}
                </Link>

                <Link
                  href={`/x/${subjectSlug}/practice/${topic.id}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${hasPractice ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400" : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800"}`}
                  aria-disabled={!hasPractice}
                >
                  Practice {hasPractice ? `(${topicProblems.length})` : "(no data)"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700">
        This page and its links demonstrate the “browse subject → view explanation → practice” flow entirely from new content data. No static subject folders or legacy imports used.
      </div>
    </div>
  );
}
