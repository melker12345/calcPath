import Link from "next/link";
import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import type { FileSystemContentBundle } from "@/lib/content/schema";
import TopicRow from "./TopicRow";

interface Props {
  params: Promise<{ subject: string }>;
}

/**
 * Dynamic subject home (browse) — the main content browser for this subject in the evolving UI.
 * Loads 100% from new data (FileSystemContentBundle).
 * Subject config + topics list come purely from content/ JSON.
 * Links to explanation (MDX) and practice (generic) demonstrate the full flow.
 */
export default async function DynamicSubjectPage({ params }: Props) {
  const { subject: subjectSlug } = await params;

  let bundle: FileSystemContentBundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch (err) {
    // Unsupported subject in current FS loader (e.g. calculus was the last one added)
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h2 className="text-xl font-semibold theme-text">Subject not available yet</h2>
              <p className="mt-2 theme-text-secondary">
                “{subjectSlug}” is not yet available in the dynamic content system.
              </p>
              <p className="mt-1 text-sm theme-text-muted">
                We’re rolling out subjects progressively in this evolving UI. Linear Algebra and Statistics are the most complete.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/x"
                  className="inline-flex items-center rounded-lg border theme-border px-4 py-2 text-sm font-medium theme-text hover:bg-[var(--surface)] transition"
                >
                  ← Back to subjects
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center text-sm theme-text-muted hover:text-[var(--accent)] underline"
                >
                  Go to main site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { config, topics, problems, mdxModules } = bundle;

  // Precompute question counts + section info (from mdxSources) for the expandable <ol> topic list.
  // Uses the same toggle row + expanded details UX as the main CourseContentsPage (via TopicRow),
  // but fully data-driven here under /x/ with no legacy imports.
  const questionCounts: Record<string, number> = {};
  for (const p of problems) {
    questionCounts[p.topicId] = (questionCounts[p.topicId] || 0) + 1;
  }

  function slugifyForSections(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function extractSections(mdx?: string): Array<{ title: string; slug: string }> {
    if (!mdx) return [];
    const noFm = mdx.replace(/^---\s*[\s\S]*?---\s*/, "");
    const noTitle = noFm.replace(/^#\s+[^\n]+\n?/, "").trim();
    const secs: Array<{ title: string; slug: string }> = [];
    const re = /^##\s+(.+?)(?:\s*\{#([a-z0-9-]+)\})?$/gim;
    let m;
    while ((m = re.exec(noTitle)) !== null) {
      const raw = m[1].trim();
      if (raw.toLowerCase().includes("common mistake")) continue;
      const id = m[2] || slugifyForSections(raw);
      secs.push({ title: raw, slug: id });
    }
    return secs;
  }

  const modulesByTopic: Record<string, { sections: Array<{ title: string }> }> = {};
  for (const mdxMod of mdxModules) {
    const secs = extractSections(mdxMod.mdxSource);
    modulesByTopic[mdxMod.topicId] = { sections: secs.map((s) => ({ title: s.title })) };
  }
  // Ensure all topics have entry (empty sections for those without full MDX yet)
  for (const t of topics) {
    if (!modulesByTopic[t.id]) {
      modulesByTopic[t.id] = { sections: [] };
    }
  }

  // Quick stats
  const totalProblems = problems.length;
  const topicsWithContent = topics.filter((t) => mdxModules.some((m) => m.topicId === t.id) || problems.some((p) => p.topicId === t.id));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href="/x" className="text-sm text-[var(--accent)] hover:underline transition-colors">← All subjects</Link>
      </div>

      <div className="mb-8 border-b theme-border pb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config.icon}</span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight theme-text">{config.label}</h1>
            <p className="theme-text-secondary">{config.shortDescription}</p>
          </div>
        </div>
        <p className="mt-3 text-sm theme-text-secondary">
          ✓ Loaded purely from <code>content/{subjectSlug}/</code> ( {topics.length} topics, {totalProblems} practice questions, {mdxModules.length} rich MDX modules )
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold theme-text">Topics — pick explanation or practice</h2>
      <p className="mb-4 text-sm theme-text-muted">Expandable rows use the native CourseContentsPage pattern (chapter headers + chevrons). Shows question counts + module sections parsed from MDX. Fully powered by the dynamic content system.</p>

      <ol className="mt-5 divide-y theme-border border-y">
        {topics.map((topic, index) => {
          const questionCount = questionCounts[topic.id] || 0;
          const moduleData = modulesByTopic[topic.id];
          const sections = moduleData?.sections || [];

          return (
            <TopicRow
              key={topic.id}
              subjectSlug={subjectSlug}
              topic={topic}
              index={index}
              questionCount={questionCount}
              sections={sections}
            />
          );
        })}
      </ol>

      <div className="mt-8 rounded border border-dashed theme-border p-4 text-xs theme-text-muted bg-[var(--surface-2)]/50">
        This is the live topic browser for the dynamic content system. The expandable list and links demonstrate the full “browse → explanation → practice” flow using only data from content/. (See NOTES.md for history.)
      </div>
    </main>
  );
}
