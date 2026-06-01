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
      <main className="mx-auto w-full max-w-5xl px-4 py-12">
        <p className="text-sm text-amber-700 dark:text-amber-400">Subject “{subjectSlug}” not yet available in the experimental data-driven loader (or partial content).</p>
        <Link href="/x" className="mt-4 inline-block text-sm text-blue-700 underline hover:no-underline dark:text-[var(--accent)]">← Back to experimental subjects</Link>
      </main>
    );
  }

  const { config, topics, problems, mdxModules } = bundle;

  // Quick stats
  const totalProblems = problems.length;
  const topicsWithContent = topics.filter((t) => mdxModules.some((m) => m.topicId === t.id) || problems.some((p) => p.topicId === t.id));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href="/x" className="text-sm text-blue-700 hover:underline dark:text-[var(--accent)]">← All experimental subjects</Link>
      </div>

      <div className="mb-8 border-b theme-border pb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config.icon}</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight theme-text">{config.label}</h1>
            <p className="theme-text-secondary">{config.shortDescription}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
          ✓ Loaded purely from <code>content/{subjectSlug}/</code> ( {topics.length} topics, {totalProblems} practice questions, {mdxModules.length} rich MDX modules )
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold theme-text">Topics — pick explanation or practice</h2>
      <p className="mb-4 text-sm theme-text-muted">This list + links are generated from the FileSystemContentBundle. Full dynamic flow demo.</p>

      <div className="grid gap-3">
        {topics.map((topic, idx) => {
          const hasMdx = mdxModules.some((m) => m.topicId === topic.id);
          const topicProblems = problems.filter((p) => p.topicId === topic.id);
          const hasPractice = topicProblems.length > 0;

          return (
            <div key={topic.id} className="flex flex-col gap-2 rounded-xl border theme-border theme-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium theme-text">
                  {idx + 1}. {topic.title}
                </div>
                <div className="text-sm theme-text-secondary">{topic.description}</div>
                <div className="mt-1 text-xs theme-text-muted">
                  {hasPractice ? `${topicProblems.length} practice questions` : "No questions yet"} • {hasMdx ? "has rich explanation" : "metadata only"}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 pt-2 sm:pt-0">
                <Link
                  href={`/x/${subjectSlug}/modules/${topic.id}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${hasMdx ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-muted)]"}`}
                  aria-disabled={!hasMdx}
                >
                  View explanation{hasMdx ? "" : " (soon)"}
                </Link>

                <Link
                  href={`/x/${subjectSlug}/practice/${topic.id}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${hasPractice ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400" : "cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-muted)]"}`}
                  aria-disabled={!hasPractice}
                >
                  Practice {hasPractice ? `(${topicProblems.length})` : "(no data)"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded border border-dashed theme-border p-4 text-xs theme-text-muted bg-[var(--surface-2)]/50">
        This page and its links demonstrate the “browse subject → view explanation → practice” flow entirely from new content data. No static subject folders or legacy imports used.
      </div>
    </main>
  );
}
