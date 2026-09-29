"use client";

import { useEffect, useRef } from "react";
import type { QuestionStatus } from "./types";

interface ProgressDotsProps {
  statuses: QuestionStatus[];
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Reusable progress dots component for practice sessions.
 * One small square per question (filled when solved) that jumps to it on click.
 *
 * Always a SINGLE row: with many questions (some topics have 75+) the dots
 * scroll horizontally instead of wrapping into a wall of rows. The scrollbar is
 * hidden, faded edges hint at the overflow, and the active dot is auto-centered
 * as the user moves through the session.
 */
export function ProgressDots({
  statuses,
  currentIndex,
  onSelect,
  className = "",
}: ProgressDotsProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Keep the active dot centered in the scroll window. Positions come from
  // getBoundingClientRect deltas — offsetLeft would be relative to the nearest
  // positioned ancestor (the practice card), not the scroller, and over-scrolls.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const active = scroller.children[currentIndex] as HTMLElement | undefined;
    if (!active) return;
    const activeRect = active.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const target =
      activeRect.left -
      scrollerRect.left +
      scroller.scrollLeft -
      scroller.clientWidth / 2 +
      activeRect.width / 2;
    scroller.scrollTo({ left: Math.max(0, target) });
  }, [currentIndex, statuses.length]);

  return (
    <div className={`flex w-full min-w-0 justify-center ${className}`}>
      {/* Width is additionally capped relative to the viewport so on narrow
          screens the row leaves room for the adjacent "1 / N" counter instead
          of pushing it past the right edge. */}
      <div
        ref={scrollerRef}
        className="flex min-w-0 max-w-[min(380px,calc(100vw_-_7.5rem))] flex-nowrap items-center overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(90deg,transparent,black_14px,black_calc(100%-14px),transparent)] sm:max-w-[520px]"
      >
        {statuses.map((status, i) => {
          const isActive = i === currentIndex;
          const statusLabel =
            status === "solved"
              ? "Solved"
              : status === "hint-used"
              ? "Used hint"
              : status === "wrong"
              ? "Incorrect"
              : "Not attempted";
          // Solved: filled with the accent. Otherwise: an outlined square. The
          // current question gets a thicker outline.
          const dotClass =
            status === "solved"
              ? "bg-[var(--accent)] border-[var(--accent)]"
              : status === "wrong"
              ? "border-[var(--text-muted)] bg-transparent"
              : "border-[var(--border)] bg-transparent";

          return (
            // The button provides a comfortably sized hit area (~22×22px); the
            // inner span keeps the small 10px visual mark.
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center"
              aria-label={`Go to question ${i + 1} (${statusLabel})`}
              aria-current={isActive ? "true" : undefined}
              title={statusLabel}
            >
              <span
                aria-hidden="true"
                className={`block h-2.5 w-2.5 border ${dotClass} ${isActive ? "outline outline-2 outline-offset-2 outline-[var(--text-primary)]" : ""}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
