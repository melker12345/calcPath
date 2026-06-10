"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { getSubjectIconResponsiveClass } from "@/lib/subject-icon-styles";
import { LandingScrim } from "@/components/landing-scrim";

/**
 * Landing page parallax experience.
 *
 * - 5 discrete sections, each in a fixed 500px tall container
 * - Only one section visible at a time, vertically centered below the header
 * - Wheel / arrow-key input drives forward/backward transitions
 * - Current section exits upward, next enters from below (CSS transition)
 * - Normal page scroll is locked for the duration of the experience
 *
 * Background layers live in the parent page component.
 */

// Visual constants
const SECTION_HEIGHT = 500;

const SECTIONS = [
  { label: "Intro" },
  { label: "Subjects" },
  { label: "Practice" },
  { label: "Included" },
  { label: "Project" },
] as const;

const SECTION_COUNT = SECTIONS.length;

const FEATURED_SLUGS = [
  "calculus",
  "linear-algebra",
  "statistics",
  "precalculus",
  "algebra",
  "geometry",
];

const POPULAR_SLUGS = ["calculus", "linear-algebra", "statistics", "precalculus"];

/** Matches .landing-section-panel transition duration (ms). */
const SECTION_TRANSITION_MS = 480;

// Approximate header height (sticky) + breathing room.
const HEADER_OFFSET = "4rem";

type LandingSubject = {
  slug: string;
  label: string;
  icon?: string;
  shortDescription?: string;
  category?: string;
  topicCount?: number;
};

function pickFeaturedSubjects(list: LandingSubject[]): LandingSubject[] {
  const picked: LandingSubject[] = [];
  const seen = new Set<string>();

  for (const slug of FEATURED_SLUGS) {
    const match = list.find((s) => s.slug === slug);
    if (match) {
      picked.push(match);
      seen.add(match.slug);
    }
  }

  for (const subject of list) {
    if (picked.length >= 6) break;
    if (!seen.has(subject.slug)) {
      picked.push(subject);
      seen.add(subject.slug);
    }
  }

  return picked.slice(0, 6);
}

const MOBILE_LANDING_MQ = "(max-width: 639px)";

function subscribeMobileLanding(onStoreChange: () => void) {
  const mq = window.matchMedia(MOBILE_LANDING_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileLandingSnapshot() {
  return window.matchMedia(MOBILE_LANDING_MQ).matches;
}

function pickPopularSubjects(list: LandingSubject[]): LandingSubject[] {
  const picked: LandingSubject[] = [];
  for (const slug of POPULAR_SLUGS) {
    const match = list.find((s) => s.slug === slug);
    if (match) picked.push(match);
  }
  if (picked.length === 0) return list.slice(0, 4);
  return picked;
}

export function LandingContent({
  subjects: propSubjects,
  subjectCount,
  topicCount,
}: {
  subjects?: LandingSubject[];
  subjectCount?: number;
  topicCount?: number;
} = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  /** Mobile: subjects panel fills the stage. Desktop: vertically centered 500px slot. */
  const subjectsFullBleed = useSyncExternalStore(subscribeMobileLanding, getMobileLandingSnapshot, () => false);
  const currentIndexRef = useRef(0);
  const isLockedRef = useRef(false);
  const wheelAccumRef = useRef(0);

  const subjectList = propSubjects ?? [];
  const featuredSubjects = useMemo(() => pickFeaturedSubjects(subjectList), [subjectList]);
  const popularSubjects = useMemo(() => pickPopularSubjects(subjectList), [subjectList]);

  const totalSubjects = subjectCount ?? subjectList.length;
  const totalTopics =
    topicCount ??
    subjectList.reduce((sum, s) => sum + (s.topicCount ?? 0), 0);

  const goToSection = useCallback((index: number) => {
    if (isLockedRef.current) return;
    const next = Math.max(0, Math.min(SECTION_COUNT - 1, index));
    if (next === currentIndexRef.current) return;

    isLockedRef.current = true;
    currentIndexRef.current = next;
    setCurrentIndex(next);

    window.setTimeout(() => {
      isLockedRef.current = false;
    }, SECTION_TRANSITION_MS);
  }, []);

  const stepSection = useCallback((dir: 1 | -1) => {
    goToSection(currentIndexRef.current + dir);
  }, [goToSection]);

  // Wheel hijack: drives the one-section-at-a-time experience.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const scrollable = (e.target as HTMLElement | null)?.closest(
        "[data-landing-scroll]"
      ) as HTMLElement | null;
      if (scrollable) {
        const canScrollDown =
          scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1;
        const canScrollUp = scrollable.scrollTop > 0;
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return;
        }
      }

      e.preventDefault();

      if (isLockedRef.current) return;

      wheelAccumRef.current += e.deltaY;

      const threshold = 110;
      if (Math.abs(wheelAccumRef.current) < threshold) return;

      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      stepSection(dir);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLockedRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        stepSection(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        stepSection(-1);
      }
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [stepSection]);

  const stageHeight = `calc(100dvh - ${HEADER_OFFSET})`;

  const getSectionYOffset = (idx: number) => {
    if (idx === currentIndex) return 0;
    return idx < currentIndex ? -110 : 110;
  };

  const showScrollHint = currentIndex === 0;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: stageHeight }}
    >
      <LandingScrim />

      {[0, 1, 2, 3, 4].map((idx) => {
        const isActive = idx === currentIndex;
        const isSubjectsPanel = idx === 1;
        const subjectsUsesFullStage = isSubjectsPanel && subjectsFullBleed;
        const yOffset = getSectionYOffset(idx);

        return (
          <div
            key={idx}
            className="landing-section-panel absolute left-1/2 w-full max-w-4xl px-4 sm:px-6"
            style={{
              height: subjectsUsesFullStage ? "100%" : SECTION_HEIGHT,
              top: subjectsUsesFullStage ? 0 : "50%",
              marginTop: subjectsUsesFullStage ? 0 : -SECTION_HEIGHT / 2,
              pointerEvents: isActive ? "auto" : "none",
              zIndex: isActive ? 10 : 1,
              opacity: isActive ? 1 : 0,
              transform: `translateX(-50%) translateY(${yOffset}px)`,
            }}
          >
            <div
              className={
                isSubjectsPanel
                  ? subjectsUsesFullStage
                    ? "flex h-full min-h-0 flex-col pb-14 pt-2"
                    : "flex h-full min-h-0 flex-col"
                  : "flex h-full flex-col justify-center"
              }
            >
              {/* SECTION 0: Hero */}
              {idx === 0 && (
                <div className="max-w-3xl">
                  <h1 className="font-serif text-4xl font-semibold tracking-tight theme-text sm:text-5xl">
                    CalcPath
                  </h1>
                  <p className="mt-4 text-xl text-balance theme-text">
                    University math you can read, practice, and track — no account required.
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed theme-text-secondary">
                    Built for undergraduates and self-learners who want clear notes, worked examples,
                    and instant feedback — from foundations through advanced topics.
                  </p>

                  {(totalSubjects > 0 || totalTopics > 0) && (
                    <p className="mt-4 text-sm font-medium tabular-nums theme-text-muted">
                      {totalSubjects} {totalSubjects === 1 ? "subject" : "subjects"}
                      {totalTopics > 0 && (
                        <>
                          <span className="mx-2 opacity-40">·</span>
                          {totalTopics} topics
                        </>
                      )}
                    </p>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToSection(1)}
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                    >
                      Browse subjects
                    </button>
                    <Link
                      href="/subjects"
                      className="inline-flex items-center justify-center rounded-xl border theme-border px-5 py-2.5 text-sm font-medium theme-text-secondary transition hover:border-[var(--accent)]/35 hover:bg-[var(--surface-2)] hover:theme-text"
                    >
                      View all subjects
                    </Link>
                  </div>
                </div>
              )}

              {/* SECTION 1: Subjects — full stage height + scroll on small screens */}
              {idx === 1 && (
                <>
                  <div className="shrink-0">
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest theme-text-muted">
                      Subjects
                    </h2>
                    <p className="text-xs theme-text-secondary sm:text-sm">
                      Start with a core course or explore the full catalog.
                    </p>
                  </div>

                  <div
                    data-landing-scroll
                    className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:thin] sm:mt-4"
                  >
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
                      {featuredSubjects.map((subject) => {
                        const icon = subject.icon || "•";
                        const count = subject.topicCount ? `${subject.topicCount} topics` : "";
                        return (
                          <Link
                            key={subject.slug}
                            href={`/${subject.slug}`}
                            className="group flex items-center gap-3 rounded-xl border theme-border bg-[var(--surface)]/80 p-3.5 backdrop-blur-[1px] transition-colors active:bg-[var(--surface)] sm:items-start sm:rounded-2xl sm:p-4 lg:p-5 hover:border-[var(--accent)]/40 hover:bg-[var(--surface)]"
                          >
                            <div
                              className={`${getSubjectIconResponsiveClass(subject.category)} shrink-0 group-hover:border-[var(--accent)]/30`}
                            >
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2 sm:items-baseline sm:gap-1.5">
                                <span className="text-sm font-semibold leading-snug theme-text group-hover:text-[var(--accent)] sm:text-base sm:tracking-[-0.2px]">
                                  {subject.label}
                                </span>
                                {count ? (
                                  <span className="shrink-0 text-[10px] tabular-nums text-[var(--text-muted)]">
                                    {count}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs leading-snug theme-text-secondary sm:mt-1.5 sm:line-clamp-3">
                                {subject.shortDescription}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <Link
                      href="/subjects"
                      className="mt-3 inline-flex text-xs font-medium text-[var(--accent)] transition hover:opacity-80 sm:mt-4 sm:text-sm"
                    >
                      View all subjects →
                    </Link>
                  </div>
                </>
              )}

              {/* SECTION 2: Practice */}
              {idx === 2 && (
                <div className="max-w-3xl">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest theme-text-muted">
                    Practice
                  </h2>
                  <div className="space-y-4 text-[15px] leading-relaxed theme-text-secondary">
                    <p>Practice is built directly into the notes at two scales.</p>
                    <p>
                      <span className="font-medium theme-text">Section practice</span> appears alongside
                      the reading. Small, focused sets of questions let you check your understanding of
                      individual concepts as you go.
                    </p>
                    <p>
                      <span className="font-medium theme-text">Chapter practice</span> offers a complete
                      set of questions for an entire topic. These are useful for review or as a self-test
                      before moving on.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 3: What is included */}
              {idx === 3 && (
                <div className="max-w-3xl">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest theme-text-muted">
                    What is included
                  </h2>
                  <ul className="grid gap-x-8 gap-y-2 text-[15px] theme-text-secondary md:grid-cols-2">
                    <li>• Full step-by-step derivations for every major result</li>
                    <li>• Worked examples with detailed reasoning</li>
                    <li>• Practice problems with solutions for every chapter</li>
                    <li>• Section-specific practice while reading</li>
                    <li>• Chapter-level practice sets</li>
                    <li>• Local progress tracking (sync across devices with a short code — no account needed)</li>
                  </ul>
                </div>
              )}

              {/* SECTION 4: This project + popular paths */}
              {idx === 4 && (
                <div className="max-w-3xl">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest theme-text-muted">
                    This project
                  </h2>
                  <p className="text-[15px] leading-relaxed theme-text-secondary">
                    This is an independent hobby project. The goal is to collect clear, high-quality
                    mathematics reference material in one place. The notes and exercises will continue to
                    grow over time.
                  </p>

                  <div className="mt-10 border-t theme-border pt-8">
                    <p className="mb-2.5 text-[11px] uppercase tracking-[0.5px] theme-text-muted">
                      Popular paths
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularSubjects.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/${s.slug}`}
                          className="rounded-lg border theme-border px-3.5 py-1.5 text-sm font-medium transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/subjects"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition hover:opacity-80"
                    >
                      All subjects →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Bottom chrome: one compact control (dots + optional first-screen scroll hint) */}
      <div
        className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5"
        aria-label={`Section ${currentIndex + 1} of ${SECTION_COUNT}: ${SECTIONS[currentIndex].label}`}
      >
        {showScrollHint && (
          <svg
            aria-hidden
            className="landing-scroll-hint h-3 w-3 text-[var(--text-muted)]/50"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <div className="flex items-center gap-2" role="tablist" aria-label="Landing sections">
          {SECTIONS.map((section, i) => (
            <button
              key={section.label}
              type="button"
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`${section.label}, section ${i + 1} of ${SECTION_COUNT}`}
              title={section.label}
              onClick={() => goToSection(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "h-1 w-5 bg-[var(--text-primary)]"
                  : "h-1 w-1 bg-[var(--text-muted)]/30 hover:bg-[var(--text-muted)]/55"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}