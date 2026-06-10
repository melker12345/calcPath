"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { subjectList as fallbackSubjectList } from "@/lib/subjects";

/**
 * Landing page parallax experience.
 *
 * - 4 discrete sections, each in a fixed 500px tall container
 * - Only one section visible at a time, vertically centered below the header
 * - Wheel input drives forward/backward transitions
 * - Current section exits upward, next enters from below (spring animation)
 * - Normal page scroll is locked for the duration of the experience
 *
 * Background layers live in the parent page component.
 */

// Visual constants
const SECTION_HEIGHT = 500;
const SECTION_COUNT = 4;

// Approximate header height (sticky) + breathing room.
// Used to size the parallax stage so sections are centered in the remaining viewport.
const HEADER_OFFSET = "4rem";

export function LandingContent({
  subjects: propSubjects,
}: {
  /** Optional list from server auto-discovery (supports subjects with no entry in subjects.ts). Falls back to sync list. */
  subjects?: Array<{ slug: string; label: string; icon?: string; shortDescription?: string }>;
} = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const currentIndexRef = useRef(0);
  const isLockedRef = useRef(false);
  const wheelAccumRef = useRef(0);

  const subjectList = propSubjects && propSubjects.length > 0 ? propSubjects : fallbackSubjectList;

  function getCategoryIconClass(cat?: string) {
    // Prominent but clean category color on the icon container as the main subtle visual cue.
    // No borders, lines, or dots on the card itself. Icon color + ring indicates category.
    switch (cat) {
      case "foundations":
        return "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300/70 dark:bg-emerald-900/70 dark:text-emerald-300 dark:ring-emerald-400/50";
      case "calculus":
        return "bg-blue-100 text-blue-700 ring-2 ring-blue-300/70 dark:bg-blue-900/70 dark:text-blue-300 dark:ring-blue-400/50";
      case "linear":
        return "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300/70 dark:bg-indigo-900/70 dark:text-indigo-300 dark:ring-indigo-400/50";
      case "stats":
        return "bg-teal-100 text-teal-700 ring-2 ring-teal-300/70 dark:bg-teal-900/70 dark:text-teal-300 dark:ring-teal-400/50";
      case "discrete":
        return "bg-violet-100 text-violet-700 ring-2 ring-violet-300/70 dark:bg-violet-900/70 dark:text-violet-300 dark:ring-violet-400/50";
      case "algebra":
        return "bg-purple-100 text-purple-700 ring-2 ring-purple-300/70 dark:bg-purple-900/70 dark:text-purple-300 dark:ring-purple-400/50";
      case "logic":
        return "bg-amber-100 text-amber-700 ring-2 ring-amber-300/70 dark:bg-amber-900/70 dark:text-amber-300 dark:ring-amber-400/50";
      case "analysis":
        return "bg-rose-100 text-rose-700 ring-2 ring-rose-300/70 dark:bg-rose-900/70 dark:text-rose-300 dark:ring-rose-400/50";
      default:
        return "bg-[var(--surface-2)] text-[var(--text-primary)] ring-2 ring-zinc-300/50 dark:ring-zinc-400/30";
    }
  }

  // Wheel hijack: drives the one-section-at-a-time experience.
  // Normal scrolling is disabled while this component is mounted.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isLockedRef.current) return;

      // Accumulate to require a deliberate scroll gesture before advancing
      wheelAccumRef.current += e.deltaY;

      const threshold = 110;
      if (Math.abs(wheelAccumRef.current) < threshold) return;

      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;

      const next = Math.max(0, Math.min(SECTION_COUNT - 1, currentIndexRef.current + dir));
      if (next === currentIndexRef.current) return;

      // Lock briefly for snappy non-overlapping transitions
      isLockedRef.current = true;
      currentIndexRef.current = next;
      setCurrentIndex(next);

      // Release lock after the spring animation roughly completes
      window.setTimeout(() => {
        isLockedRef.current = false;
      }, 480);
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Helper to compute target y/opacity for a given section index
  const getSectionTargets = (idx: number) => {
    if (idx === currentIndex) {
      return { y: 0, opacity: 1 };
    }
    // Sections before current live above (have exited upward on forward nav)
    if (idx < currentIndex) {
      return { y: -110, opacity: 0 };
    }
    // Sections after live below
    return { y: 110, opacity: 0 };
  };

  const stageHeight = `calc(100dvh - ${HEADER_OFFSET})`;

  // Prevent flash of stacked sections on first paint / hydration.
  // We force opacity:0 on inactive sections until after mount + Framer has applied styles.
  useLayoutEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: stageHeight }}
    >
      {/* Subtle legibility gradient (stronger at very top) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[var(--bg)]/75 via-[var(--bg)]/35 to-transparent pointer-events-none z-10"
      />

      {/* The four 500px centered sections — only one visible at a time */}
      {[0, 1, 2, 3].map((idx) => {
        const targets = getSectionTargets(idx);
        const isActive = idx === currentIndex;

        // First-paint safety: inactive sections must be invisible until the component has mounted.
        const firstPaintOpacity = hasMounted ? targets.opacity : (isActive ? 1 : 0);

        return (
          <motion.div
            key={idx}
            initial={false}
            animate={{ y: targets.y, opacity: targets.opacity }}
            transition={{
              type: "spring",
              stiffness: 135,
              damping: 26,
              mass: 0.75,
            }}
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-4xl px-6"
            style={{
              height: SECTION_HEIGHT,
              top: "50%",
              marginTop: -SECTION_HEIGHT / 2,
              pointerEvents: isActive ? "auto" : "none",
              opacity: hasMounted ? undefined : firstPaintOpacity,
              zIndex: isActive ? 10 : 1,
            }}
          >
            {/* Inner content wrapper — vertically centered within the 500px box for text sections */}
            <div className={`h-full ${idx === 1 ? "pt-3" : "flex flex-col justify-center"}`}>
              {/* SECTION 0: Hero / intro (exactly as requested) */}
              {idx === 0 && (
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-semibold tracking-tight theme-text">CalcPath</h1>
                  <p className="mt-4 text-xl text-balance theme-text-secondary">
                    Free reference notes for university mathematics.
                  </p>
                  <div className="mt-9 space-y-5 text-[15px] leading-relaxed theme-text-secondary">
                    <p>
                      This site contains complete, self-contained notes for three core subjects in the undergraduate mathematics curriculum.
                      Each subject is covered from the foundations up, with full derivations and carefully chosen examples.
                    </p>
                    <p>
                      The notes are written to be read directly. They are not a replacement for lectures or textbooks, but a clear, independent reference that you can work through at your own pace.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 1: Subjects */}
              {idx === 1 && (
                <div>
                  <h2 className="text-sm font-semibold tracking-widest uppercase theme-text-muted mb-5">Subjects</h2>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
                    {/* Featured: first 6 by order only (core subjects showcase). Bottom "ready" list below uses full. */}
                    {subjectList.slice(0, 6).map((subject: any) => {
                      const icon = subject.icon || "•";
                      const count = subject.topicCount ? `${subject.topicCount} topics` : "";
                      return (
                        <Link
                          key={subject.slug}
                          href={`/${subject.slug}`}
                          className="group block rounded-2xl border theme-border theme-surface p-5 transition-all hover:shadow-xl"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl font-light tracking-[-1px] ${getCategoryIconClass(subject.category)}`}>
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-semibold text-base tracking-[-0.2px] theme-text group-hover:underline">
                                  {subject.label}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                                  {count}
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs leading-snug theme-text-secondary line-clamp-3">
                                {subject.shortDescription}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: Practice */}
              {idx === 2 && (
                <div className="max-w-3xl">
                  <h2 className="text-sm font-semibold tracking-widest uppercase theme-text-muted mb-4">Practice</h2>
                  <div className="text-[15px] leading-relaxed theme-text-secondary space-y-4">
                    <p>Practice is built directly into the notes at two scales.</p>
                    <p>
                      <span className="font-medium theme-text">Section practice</span> appears alongside the reading. Small, focused sets of questions let you check your understanding of individual concepts as you go.
                    </p>
                    <p>
                      <span className="font-medium theme-text">Chapter practice</span> offers a complete set of questions for an entire topic. These are useful for review or as a self-test before moving on.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 3: What is included + This project + closing line */}
              {idx === 3 && (
                <div className="max-w-3xl">
                  <h2 className="text-sm font-semibold tracking-widest uppercase theme-text-muted mb-4">What is included</h2>
                  <ul className="grid gap-x-8 gap-y-2 text-[15px] theme-text-secondary md:grid-cols-2">
                    <li>• Full step-by-step derivations for every major result</li>
                    <li>• Worked examples with detailed reasoning</li>
                    <li>• Practice problems with solutions for every chapter</li>
                    <li>• Section-specific practice while reading</li>
                    <li>• Chapter-level practice sets</li>
                    <li>• Local progress tracking (sync across devices with a short code — no account needed)</li>
                  </ul>

                  <div className="mt-10">
                    <h2 className="text-sm font-semibold tracking-widest uppercase theme-text-muted mb-4">This project</h2>
                    <p className="text-[15px] leading-relaxed theme-text-secondary">
                      This is an independent hobby project. The goal is to collect clear, high-quality mathematics reference material in one place. The notes and exercises will continue to grow over time.
                    </p>
                  </div>

                  <div className="mt-9 border-t theme-border pt-6 text-sm theme-text-muted">
                    All material is freely available. No login required to read or practice.
                  </div>

                  {/* Bottom-of-experience navigation to subjects so users don't have to wheel back up */}
                  <div className="mt-8 pt-6 border-t theme-border">
                    <p className="text-[11px] uppercase tracking-[0.5px] theme-text-muted mb-2.5">Ready to dive in?</p>
                    <div className="flex flex-wrap gap-2">
                      {(subjectList as any[]).map((s) => (
                        <Link
                          key={s.slug}
                          href={`/${s.slug}`}
                          className="rounded-lg border theme-border px-3.5 py-1.5 text-sm font-medium transition hover:bg-[var(--surface-2)] hover:border-[var(--accent)]/40"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Progress dots — allow direct jumping between sections */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {Array.from({ length: SECTION_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (isLockedRef.current) return;
              currentIndexRef.current = i;
              setCurrentIndex(i);
              isLockedRef.current = true;
              setTimeout(() => (isLockedRef.current = false), 420);
            }}
            className={`h-px rounded-full transition-all duration-200 ${
              i === currentIndex
                ? "w-6 bg-[var(--text-primary)]"
                : "w-1.5 bg-[var(--text-muted)]/35 hover:bg-[var(--text-muted)]/60"
            }`}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

