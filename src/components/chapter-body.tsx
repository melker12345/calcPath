import Link from "next/link";
import { Figure } from "@/components/figure";
import type { RenderedChapter, RenderedSegment } from "@/lib/content/render-chapter";

/**
 * The body of a chapter page: the rendered parts of module.mdx.
 *
 * A Server Component. Prose and environments arrive as HTML strings typeset
 * on the server; figures are drawn by <Figure>. Nothing here hydrates.
 */

function Segments({ segments }: { segments: RenderedSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "prose") {
          return <div key={index} dangerouslySetInnerHTML={{ __html: segment.html }} />;
        }
        if (segment.type === "figure") {
          return (
            <figure
              key={index}
              id={segment.id}
              className="mb-env mb-env-figure print-keep-together"
              data-environment="figure"
            >
              <Figure spec={segment.spec} alt={segment.alt} uid={segment.uid} />
              <figcaption className="fig-caption" dangerouslySetInnerHTML={{ __html: segment.captionHtml }} />
            </figure>
          );
        }
        return (
          <section
            key={index}
            id={segment.id}
            className={`mb-env mb-env-${segment.style} mb-env-${segment.kind} print-keep-together`}
            data-environment={segment.kind}
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      })}
    </>
  );
}

export function ChapterBody({
  rendered,
  subjectSlug,
  topicId,
}: {
  rendered: RenderedChapter;
  subjectSlug: string;
  topicId: string;
}) {
  return (
    <>
      {rendered.parts.map((part) => {
        if (part.kind === "intro") {
          return (
            <div key={part.id} id={part.id} className="scroll-mt-20 print-keep-together">
              <h2 className="book-section-heading mb-4 text-2xl font-semibold theme-text">
                <span>Introduction</span>
              </h2>
              <div className="book-prose max-w-none">
                <Segments segments={part.segments} />
              </div>
            </div>
          );
        }

        if (part.kind === "mistakes") {
          return (
            <div
              key={part.id}
              id={part.id}
              className="mb-env mb-env-aside mb-env-pitfall book-prose print-keep-together scroll-mt-20 mt-12"
            >
              <span className="mb-env-head">
                <span className="mb-env-label">{part.titleText}</span>
              </span>
              <Segments segments={part.segments} />
            </div>
          );
        }

        return (
          <section key={part.id} id={part.id} className="scroll-mt-20 mt-12 print-keep-together">
            <h2 className="book-section-heading mb-4 text-2xl font-semibold theme-text">
              <span className="book-section-number">{part.number}</span>
              <span dangerouslySetInnerHTML={{ __html: part.titleHtml }} />
            </h2>
            <div className="book-prose max-w-none">
              <Segments segments={part.segments} />
            </div>
            {/* A book's end-of-section exercises. */}
            <p className="mt-5" data-no-print>
              <Link
                href={`/${subjectSlug}/practice/${topicId}?section=${part.id}`}
                className="text-sm font-medium text-[var(--accent)] underline underline-offset-2"
              >
                Exercises for §{part.number} →
              </Link>
            </p>
          </section>
        );
      })}
    </>
  );
}
