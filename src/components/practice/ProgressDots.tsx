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
 * Shows colored dots for each question (solved, wrong, hint-used, not-attempted)
 * and allows clicking to jump between questions.
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
    scroller.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [currentIndex, statuses.length]);

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div
        ref={scrollerRef}
        className="flex max-w-[380px] flex-nowrap items-center overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(90deg,transparent,black_14px,black_calc(100%-14px),transparent)] sm:max-w-[520px]"
      >
        {statuses.map((status, i) => {
          let colorClass = "bg-zinc-300 dark:bg-zinc-600"; // not-attempted

          if (status === "solved") {
            colorClass = "bg-emerald-500";
          } else if (status === "hint-used") {
            colorClass = "bg-amber-500";
          } else if (status === "wrong") {
            colorClass = "bg-red-500";
          }

          const isActive = i === currentIndex;
          const statusLabel =
            status === "solved"
              ? "Solved"
              : status === "hint-used"
              ? "Used hint"
              : status === "wrong"
              ? "Incorrect"
              : "Not attempted";

          return (
            // The button provides a comfortably sized hit area (~22×22px + row
            // padding); the inner span keeps the small 10px visual dot.
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
              aria-label={`Go to question ${i + 1} (${statusLabel})`}
              aria-current={isActive ? "true" : undefined}
              title={statusLabel}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full transition-all ${colorClass} ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[var(--surface)] ring-zinc-400"
                    : ""
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
