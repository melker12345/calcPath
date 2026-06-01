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
    // Unsupported subject in current FS loader (e.g. calculus was the last one added)
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h2 className="text-xl font-semibold theme-text">Subject not available yet</h2>
              <p className="mt-2 theme-text-secondary">
                “{subjectSlug}” is not fully wired up in the experimental data-driven loader yet.
              </p>
              <p className="mt-1 text-sm theme-text-muted">
                We’re adding subjects one by one. Linear Algebra and Statistics are currently the most complete.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/x"
                  className="inline-flex items-center rounded-lg border theme-border px-4 py-2 text-sm font-medium theme-text hover:bg-[var(--surface)] transition"
                >
                  ← Back to experimental subjects
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
  // This lets us use the exact same toggle row + expanded details/questions/module-sections UX as CourseContentsPage,
  // but isolated to this experimental page (no file creates, links prefixed /x/, no edits elsewhere).
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
        <Link href="/x" className="text-sm text-[var(--accent)] hover:underline transition-colors">← All experimental subjects</Link>
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
      <p className="mb-4 text-sm theme-text-muted">Expandable list (click rows) matches the real CourseContentsPage &lt;ol&gt; + toggle pattern exactly. Data + sections from FileSystemContentBundle. Full dynamic flow demo.</p>

      <ol className="mt-5 divide-y theme-border border-y">
        {topics.map((topic, index) => {
          const questionCount = questionCounts[topic.id] || 0;
          const moduleData = modulesByTopic[topic.id];
          const sections = moduleData?.sections || [];
          const hasSections = sections.length > 0;

          return (
            <li key={topic.id} className="border-b theme-border last:border-b-0 py-[10px]">
              <details className="group">
                <summary className="flex w-full items-center justify-between gap-4 py-[10px] text-left hover:bg-[var(--surface-2)] rounded-lg px-3 transition-colors cursor-pointer list-none focus:outline-none group-open:bg-[var(--surface-2)]/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-medium tabular-nums theme-text-muted shrink-0">
                        Chapter {index + 1}
                      </span>
                      <Link
                        href={`/x/${subjectSlug}/modules/${topic.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold theme-text text-lg leading-tight hover:underline hover:text-[var(--accent)]"
                      >
                        {topic.title}
                      </Link>
                    </div>
                    <p className="mt-1 text-sm leading-6 theme-text-secondary line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-stone-500 dark:text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
                      {questionCount} questions
                    </span>

                    {/* Practice chapter button (always visible in header like real) */}
                    <Link
                      href={`/x/${subjectSlug}/practice/${topic.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:text-sm"
                    >
                      Practice chapter
                    </Link>

                    {/* Chevron (rotates on open via group-open) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-hover:text-[var(--accent)] group-open:rotate-90`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </summary>

                {hasSections && (
                  <div className="pb-4 px-3">
                    <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
                      <ul className="space-y-1 text-sm">
                        {sections.map((section, sIdx) => {
                          const slug = slugifyForSections(section.title);
                          const chapterNum = index + 1;
                          const sectionNum = sIdx;
                          return (
                            <li key={sIdx}>
                              <Link
                                href={`/x/${subjectSlug}/modules/${topic.id}#${slug}`}
                                className="flex items-start gap-2 py-1.5 text-zinc-600 hover:text-[var(--accent)] dark:text-[var(--text-secondary)] transition-colors"
                              >
                                <span className="font-mono text-xs text-zinc-400 tabular-nums shrink-0 mt-0.5">
                                  {chapterNum}.{sectionNum}
                                </span>
                                <span>{section.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </details>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded border border-dashed theme-border p-4 text-xs theme-text-muted bg-[var(--surface-2)]/50">
        This page and its links demonstrate the “browse subject → view explanation → practice” flow entirely from new content data. No static subject folders or legacy imports used.
      </div>
    </main>
  );
}
