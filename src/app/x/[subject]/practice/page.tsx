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
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <Link href={`/x/${subjectSlug}`} className="text-sm text-blue-700 hover:underline dark:text-[var(--accent)]">← Back to {config.label} topics</Link>

      <h1 className="mt-4 text-2xl font-semibold theme-text">Practice — {config.label}</h1>
      <p className="text-sm theme-text-muted">Choose a topic. All data from content/ only.</p>

      <div className="mt-6 grid gap-3">
        {topics.map((topic) => {
          const count = problems.filter((p) => p.topicId === topic.id).length;
          return (
            <Link
              key={topic.id}
              href={`/x/${subjectSlug}/practice/${topic.id}`}
              className="block rounded-xl border border-[var(--border)] bg-white p-4 hover:bg-zinc-50 dark:bg-[var(--surface)] dark:hover:bg-[var(--surface-2)]"
            >
              <div className="font-medium">{topic.title}</div>
              <div className="text-sm theme-text-secondary">{topic.description}</div>
              <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{count} questions available →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
