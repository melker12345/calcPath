import Link from "next/link";
import dynamic from "next/dynamic";
import type { Topic, Problem } from "@/lib/shared-types";

// The rich interactive practice UI (with usePracticeSession, MathInput, full overlays,
// navigation, hints, etc.) lives in the client component below.
// Dynamic + ssr:false isolates the ProgressProvider graph (and MathInput etc.) into
// a separate client chunk. Combined with local providers inside the client and the
// cleaned layout, this prevents the "topics is not defined" module-eval error on
// real statistics practice routes.
const PracticeClient = dynamic(
  () => import("./PracticeClient"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="text-sm text-stone-500">Loading practice session…</div>
      </div>
    ),
  }
);

export default async function StatisticsPracticeTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams?: Promise<{ focus?: string }>;
}) {
  const { topicId } = await params;
  const sp = await (searchParams ?? Promise.resolve({}));
  const focusId = sp.focus ?? null;

  // === DATA SOURCING (Server Component only): use the new FileSystemContentBundle architecture.
  // Dynamic import inside try for reversible transition safety (matches pattern in other
  // production /statistics/* pages). This guarantees the server page (and thus the whole route)
  // never imports any "@/lib/statistics-content", "@/lib/statistics-modules", or equivalent
  // legacy shims — those were the direct vector that injected `topics`/`problems` symbols
  // (even as empty) into the *client* bundle for this page.
  let bundle: { topics: Topic[]; problems: Problem[] } | null = null;
  try {
    const { getFileSystemContentBundle } = await import("@/lib/content/loader");
    bundle = await getFileSystemContentBundle("statistics");
  } catch (err) {
    // Loader failure (should not happen in prod with content/ present) → treat as not found.
    // The not-found UI below is rendered server-side.
  }

  const topic = bundle?.topics?.find((t) => t.id === topicId) ?? null;
  const topicProblems = bundle?.problems?.filter((p) => p.topicId === topicId) ?? [];

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-stone-600">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/statistics">Back to Statistics</Link>
      </div>
    );
  }

  // Pass *clean* pre-filtered data (from FS bundle) as props to the client.
  // The client component owns the full original high-fidelity practice experience
  // (no simplification, 100% of hooks + components + logic preserved).
  return (
    <PracticeClient
      topic={topic}
      problems={topicProblems}
      focusId={focusId}
    />
  );
}
