"use client";

import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { SectionCard } from "@/components/section-card";
import { getAchievementResults, SUBJECT_ORDER } from "@/lib/achievements";

export function AchievementsSection() {
  const { progress } = useProgress();

  const results = useMemo(
    () => getAchievementResults(progress),
    [progress],
  );

  const completedCount = results.filter((r) => r.completed).length;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const r of results) {
      const list = map.get(r.subject) ?? [];
      list.push(r);
      map.set(r.subject, list);
    }
    return SUBJECT_ORDER
      .filter((s) => map.has(s))
      .map((s) => ({ subject: s, items: map.get(s)! }));
  }, [results]);

  return (
    <SectionCard title="Achievements">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-900">
          {completedCount}/{results.length}
        </span>
        <div className="h-1.5 flex-1 rounded-full bg-zinc-100">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
            style={{
              width: `${results.length > 0 ? (completedCount / results.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {grouped.map(({ subject, items }) => (
          <div key={subject}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {subject}
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                    a.completed
                      ? "border-amber-200 bg-amber-50"
                      : "border-zinc-100 bg-zinc-50/50 opacity-50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
                      a.completed
                        ? "bg-amber-100 text-amber-600"
                        : "bg-zinc-100 text-zinc-400 grayscale"
                    }`}
                  >
                    {a.icon}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        a.completed ? "text-zinc-900" : "text-zinc-400"
                      }`}
                    >
                      {a.title}
                    </p>
                    <p
                      className={`text-xs leading-snug ${
                        a.completed ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      {a.description}
                    </p>
                  </div>
                  {a.completed && (
                    <span className="ml-auto shrink-0 text-sm text-amber-500">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
