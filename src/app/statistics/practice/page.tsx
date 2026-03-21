"use client";

import Link from "next/link";
import { topics, problems } from "@/lib/statistics-content";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress } from "@/lib/progress";

const C = {
  text: "#e8e4d9",
  muted: "rgba(232,228,217,0.55)",
  amber: "#fde68a",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(253,230,138,0.18)",
  track: "rgba(253,230,138,0.1)",
};

export default function StatisticsPracticePage() {
  const { progress } = useProgress();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 sm:mb-10">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: C.amber }}>
          Statistics
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: C.text }}>Practice by topic</h1>
        <p className="mt-1.5 text-sm sm:text-base" style={{ color: C.muted }}>
          Choose a topic and start solving problems.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {topics.map((topic) => {
          const stats = getPracticeProgress(progress, topic.id, problems);
          return (
            <div
              key={topic.id}
              className="flex flex-col rounded-xl p-5 sm:rounded-2xl sm:p-6"
              style={{ background: C.card, border: `1.5px solid ${C.border}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold leading-snug sm:text-[1.05rem]" style={{ color: C.text }}>
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: C.muted }}>
                    {topic.description}
                  </p>
                </div>
                {stats.isComplete && (
                  <span
                    className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
                  >
                    ✓ Done
                  </span>
                )}
              </div>

              {/* Progress tracker */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs" style={{ color: C.muted }}>
                  <span>
                    <span className="font-semibold" style={{ color: C.text }}>{stats.correct}</span>
                    /{stats.total} mastered
                  </span>
                  <span>{stats.accuracyRate}% accuracy · {topic.estimatedMinutes} min</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.track }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.masteryRate}%`,
                      background: stats.isComplete
                        ? "#34d399"
                        : `linear-gradient(90deg, #d97706, ${C.amber})`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-stats-primary" href={`/statistics/practice/${topic.id}`}>
                  {stats.correct > 0 && !stats.isComplete ? "Continue" : "Start"} practice
                </Link>
                <Link className="btn-stats-secondary" href={`/statistics/modules/${topic.id}`}>
                  Read module
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
