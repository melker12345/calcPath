import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";

interface Props {
  params: Promise<{ subject: string }>;
}

/** Generic practice topic picker under /x/ (for the "practice overview" links) */
export default async function DynamicPracticeIndex({ params }: Props) {
  const { subject: subjectSlug } = await params;

  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch {
    notFound();
  }

  const { config, topics, problems } = bundle;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`/x/${subjectSlug}`} className="text-sm text-[var(--accent)] hover:underline transition-colors">← Back to {config.label} topics</Link>

      <h1 className="mt-4 text-2xl font-semibold theme-text">Practice — {config.label}</h1>
      <p className="text-sm theme-text-muted">Choose a topic. All data from content/ only. Topics without questions yet show an intentional “not ported” state with link to explanation.</p>

      <div className="mt-6 grid gap-3">
        {topics.map((topic) => {
          const count = problems.filter((p) => p.topicId === topic.id).length;
          const isAvailable = count > 0;
          return (
            <Link
              key={topic.id}
              href={`/x/${subjectSlug}/practice/${topic.id}`}
              className="block rounded-xl border theme-border theme-surface p-4 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="font-medium theme-text">{topic.title}</div>
              <div className="text-sm theme-text-secondary">{topic.description}</div>
              <div className={`mt-1 text-xs ${isAvailable ? "text-[var(--accent)]" : "theme-text-muted"}`}>
                {isAvailable ? `${count} questions available →` : "No questions yet — explanation ready →"}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
