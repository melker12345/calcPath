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
      <div className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm theme-text-secondary">Subject “{subjectSlug}” is not yet fully available in the experimental data-driven loader (or only partial content exists in <code>content/</code>).</p>
          <Link href="/x" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">← Back to experimental subjects</Link>
        </div>
      </div>
    );
  }

  const { config, topics, problems, mdxModules } = bundle;

  // Quick stats
  const totalProblems = problems.length;

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href="/x" className="text-sm text-[var(--accent)] hover:underline">← All experimental subjects</Link>
      </div>

      <div className="mb-8 border-b theme-border pb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>{config.icon}</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight theme-text">{config.label}</h1>
            <p className="text-[15px] theme-text-secondary">{config.shortDescription}</p>
          </div>
        </div>
        <p className="mt-3 text-sm theme-text-muted">
          ✓ Loaded 100% from <code>content/{subjectSlug}/</code> — {topics.length} topics • {totalProblems} questions • {mdxModules.length} MDX explanations
        </p>
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold theme-text">Topics</h2>
        <span className="text-xs theme-text-muted">Pick explanation or practice — all data-driven</span>
      </div>

      <div className="grid gap-3">
        {topics.map((topic, idx) => {
          const hasMdx = mdxModules.some((m) => m.topicId === topic.id);
          const topicProblems = problems.filter((p) => p.topicId === topic.id);
          const hasPractice = topicProblems.length > 0;
          const est = (topic as any).estimatedMinutes;

          return (
            <div key={topic.id} className="flex flex-col gap-2 rounded-xl border theme-border theme-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium theme-text">
                  {idx + 1}. {topic.title}
                  {est ? <span className="ml-2 text-xs font-normal theme-text-muted">~{est} min</span> : null}
                </div>
                <div className="text-sm theme-text-secondary">{topic.description}</div>
                <div className="mt-1 text-xs theme-text-muted">
                  {hasPractice ? `${topicProblems.length} practice questions` : "No questions yet"} • {hasMdx ? "rich explanation" : "metadata only"}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 pt-2 sm:pt-0">
                <Link
                  href={`/x/${subjectSlug}/modules/${topic.id}`}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition ${hasMdx ? "bg-[var(--accent)] text-[var(--accent-text)] hover:brightness-95" : "cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-muted)]"}`}
                  aria-disabled={!hasMdx}
                >
                  View explanation{hasMdx ? "" : " (soon)"}
                </Link>

                <Link
                  href={`/x/${subjectSlug}/practice/${topic.id}`}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition ${hasPractice ? "border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)]" : "cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-muted)]"}`}
                  aria-disabled={!hasPractice}
                >
                  Practice {hasPractice ? `(${topicProblems.length})` : "(no data)"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-dashed theme-border p-4 text-xs theme-text-muted">
        Demonstrates “browse → explanation (MDX) → practice” entirely from <code>FileSystemContentBundle</code>. No static folders or legacy imports.
      </div>
    </div>
  );
}
