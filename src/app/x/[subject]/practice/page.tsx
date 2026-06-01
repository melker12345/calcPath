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
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`/x/${subjectSlug}`} className="text-sm text-[var(--accent)] hover:underline">← Back to {config.label} topics</Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold theme-text">Practice — {config.label}</h1>
        <p className="text-sm theme-text-secondary">Choose a topic. All data from <code>content/</code> only.</p>
      </div>

      <div className="grid gap-3">
        {topics.map((topic) => {
          const count = problems.filter((p) => p.topicId === topic.id).length;
          return (
            <Link
              key={topic.id}
              href={`/x/${subjectSlug}/practice/${topic.id}`}
              className="block rounded-xl border theme-border theme-surface p-4 transition hover:bg-[var(--surface-2)]"
            >
              <div className="font-medium theme-text">{topic.title}</div>
              <div className="text-sm theme-text-secondary">{topic.description}</div>
              <div className="mt-1 text-xs text-[var(--accent)]">{count} questions available →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
