import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import { GenericPracticeExperience } from "@/components/generic-practice-experience";
import { PracticeErrorBoundary } from "../PracticeErrorBoundary";

interface Props {
  params: Promise<{ subject: string; topicId: string }>;
}

/**
 * Generic dynamic practice page under experimental /x/.
 * Server component loads *only* from FileSystemContentBundle (new data).
 * - If topic missing → friendly not-found.
 * - If 0 questions (not yet ported) → extremely clear intentional "no questions yet" UI (never generic error).
 * Then (for good topics) delegates to <GenericPracticeExperience> (robust MathText everywhere + 0-displayProblems guard + per-q fallbacks)
 * so bad data never produces generic "Something went wrong".
 *
 * This + the module viewer + browse page complete the "browse → explanation → practice" loop using purely new content.
 */
export default async function DynamicPracticePage({ params }: Props) {
  const { subject: subjectSlug, topicId } = await params;

  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch {
    notFound();
  }

  const topic = bundle.topics.find((t) => t.id === topicId);
  const topicProblems = bundle.problems.filter((p) => p.topicId === topicId);

  if (!topic) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-6">
          <p className="theme-text-secondary">Topic “{topicId}” not found in the data for {subjectSlug}.</p>
          <Link href={`/x/${subjectSlug}`} className="mt-4 inline-block text-[var(--accent)] hover:underline">← Browse topics</Link>
        </div>
      </main>
    );
  }

  if (topicProblems.length === 0) {
    // Extremely clear, intentional "not yet" state for topics not fully ported.
    // Never lets user see broken UI or generic error boundary. Matches polished /x/ visual language.
    const label = bundle.config.label;
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium tracking-wider theme-text-muted">
            PRACTICE — {subjectSlug.toUpperCase()}
          </div>
          <h1 className="text-2xl font-semibold theme-text">{topic.title}</h1>
          <p className="mt-3 text-base theme-text-secondary">
            No practice questions are available for this topic yet.
          </p>
          <p className="mt-2 text-sm theme-text-muted">
            This is an intentional “not yet” state in the experimental /x/ area while topics are ported from the legacy content. The full explanation is ready and complete.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/x/${subjectSlug}/modules/${topicId}`}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2 font-medium text-white transition hover:opacity-90 active:scale-[0.985]"
            >
              View the explanation →
            </Link>
            <Link
              href={`/x/${subjectSlug}`}
              className="inline-flex items-center justify-center rounded-lg border theme-border px-5 py-2 font-medium theme-text-muted transition hover:bg-[var(--surface)] hover:text-[var(--accent)]"
            >
              ← Back to {label}
            </Link>
            <Link
              href={`/x/${subjectSlug}/practice`}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium theme-text-muted underline-offset-4 hover:underline hover:text-[var(--accent)]"
            >
              All practice topics for {label}
            </Link>
          </div>

          <p className="mt-6 text-xs theme-text-muted">
            Once ported, questions will appear here automatically. You can start studying with the explanation now.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PracticeErrorBoundary subjectSlug={subjectSlug} topicId={topicId}>
      <GenericPracticeExperience
        topic={topic}
        problems={bundle.problems}
        subjectSlug={subjectSlug}
        subjectLabel={bundle.config.label}
      />
    </PracticeErrorBoundary>
  );
}
