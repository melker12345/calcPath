"use client";

import Link from "next/link";
import { topics } from "@/lib/statistics-content";
import { modules } from "@/lib/statistics-modules";

const C = {
  text: "#e8e4d9",
  muted: "rgba(232,228,217,0.55)",
  amber: "#fde68a",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(253,230,138,0.18)",
};

export default function StatisticsModulesPage() {
  const available = topics.filter((topic) =>
    modules.some((m) => m.topicId === topic.id),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 sm:mb-10">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: C.amber }}>
          Statistics
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: C.text }}>All modules</h1>
        <p className="mt-1.5 text-sm sm:text-base" style={{ color: C.muted }}>
          Read the lesson, follow the worked examples, then practice.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {available.map((topic, i) => {
          const chapterNum = String(i + 1).padStart(2, "0");
          return (
            <div
              key={topic.id}
              className="flex flex-col rounded-xl p-5 sm:rounded-2xl sm:p-6"
              style={{ background: C.card, border: `1.5px solid ${C.border}`, borderLeft: `3px solid ${C.amber}` }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.amber }}>
                Chapter {chapterNum}
              </span>
              <h3
                className="mt-1 text-base font-semibold leading-snug sm:text-[1.05rem]"
                style={{ color: C.text }}
              >
                {topic.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: C.muted }}>
                {topic.description}
              </p>
              <p className="mt-3 text-xs" style={{ color: C.muted }}>
                {topic.estimatedMinutes} min
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-stats-primary" href={`/statistics/modules/${topic.id}`}>
                  Open module
                </Link>
                <Link className="btn-stats-secondary" href={`/statistics/practice/${topic.id}`}>
                  Practice
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
