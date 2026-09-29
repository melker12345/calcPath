import Link from "next/link";
import { ChapterBody } from "@/components/chapter-body";
import { MarkChapterRead } from "@/components/mark-chapter-read";
import { ModuleSectionNav } from "@/components/module-section-nav";
import { ReportIssue } from "@/components/report-issue";
import { SubjectBreadcrumbs } from "@/components/subject-breadcrumbs";
import type { Chapter } from "@/lib/content/chapter";
import { renderMathText } from "@/lib/content/render-math";
import { getModulesPath, getPracticePath, getTestPath } from "@/lib/subject-urls";

/**
 * A chapter page, set like a page of a textbook.
 *
 * A Server Component: the whole chapter is static HTML. The only client
 * components are the two small controls at the foot of the page — "mark as
 * read" and the report form.
 */
export function ChapterPage({ chapter }: { chapter: Chapter }) {
  const { subject, topic, number, prev, next, hasProblemSet, rendered } = chapter;

  return (
    <>
      <ModuleSectionNav items={rendered.nav} />
      <article className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 border-b theme-border pb-5 sm:mb-8">
          <SubjectBreadcrumbs
            subjectSlug={subject.slug}
            subjectLabel={subject.label}
            currentTopicTitle={topic.title}
          />
          <p className="mt-4 book-chapter-label">Chapter {number}</p>
          <h1
            className="mt-1 font-serif text-3xl font-semibold tracking-tight theme-text sm:text-4xl"
            dangerouslySetInnerHTML={{ __html: renderMathText(topic.title) }}
          />
          {topic.description && (
            <p className="book-prose mt-3 theme-text-secondary">{topic.description}</p>
          )}
        </header>

        <ChapterBody rendered={rendered} subjectSlug={subject.slug} topicId={topic.id} />

        {/* What the practice bank does and does not certify, placed where a
            reader decides they are done with the chapter. */}
        <div className="mt-12 border theme-border p-4 text-sm leading-relaxed theme-text-muted sm:p-5" data-no-print>
          <span className="font-semibold theme-text-secondary">About the practice questions.</span>{" "}
          They check that you can carry out this chapter&apos;s computations correctly, and each one
          is graded on a single answer. They are not proof exercises: working through them confirms
          the mechanics, not that you could prove the results yourself. For that, re-read the
          statements above and try to reconstruct their proofs with the page closed.
          {hasProblemSet && (
            <>
              {" "}
              This chapter also has a{" "}
              <Link prefetch={false}
                href={getTestPath(subject.slug, topic.id)}
                className="font-semibold text-[var(--accent)] underline underline-offset-2"
              >
                printable problem set
              </Link>
              : proofs, sketches and find-the-error work to do on paper, with full solutions on
              a separate page.
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t theme-border pt-6" data-no-print>
          <MarkChapterRead subject={subject.slug} topicId={topic.id} />
          <div className="flex flex-wrap gap-3">
            <Link prefetch={false} href={getPracticePath(subject.slug, topic.id)} className="btn-primary inline-flex">
              Practice this chapter
            </Link>
            {hasProblemSet && (
              <Link prefetch={false} href={getTestPath(subject.slug, topic.id)} className="btn-secondary inline-flex">
                Printable problem set
              </Link>
            )}
          </div>
        </div>

        <nav
          className="mt-8 flex flex-col gap-3 border-t theme-border pt-6 sm:flex-row sm:justify-between"
          aria-label="Chapter navigation"
          data-no-print
        >
          {prev ? (
            <Link prefetch={false} href={getModulesPath(subject.slug, prev.id)} className="btn-secondary inline-flex w-full justify-center sm:w-auto">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link prefetch={false} href={getModulesPath(subject.slug, next.id)} className="btn-secondary inline-flex w-full justify-center sm:w-auto">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="mt-8" data-no-print>
          <ReportIssue target={{ kind: "chapter", subject: subject.slug, topicId: topic.id }} />
        </div>
      </article>
    </>
  );
}
