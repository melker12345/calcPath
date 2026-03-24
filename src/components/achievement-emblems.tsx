"use client";

import { useMemo } from "react";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress, getTopicTestStats } from "@/lib/progress";
import { topics as calculusTopics, problems as calculusProblems } from "@/lib/calculus-content";
import { topics as statisticsTopics, problems as statisticsProblems } from "@/lib/statistics-content";
import { topics as linalgTopics, problems as linalgProblems } from "@/lib/linalg-content";
import { SectionCard } from "@/components/section-card";
import type { Problem, Topic } from "@/lib/shared-types";

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  subject: string;
  check: (ctx: AchievementContext) => boolean;
};

type AchievementContext = {
  progress: ReturnType<typeof useProgress>["progress"];
  calcTopics: Topic[];
  calcProblems: Problem[];
  statsTopics: Topic[];
  statsProblems: Problem[];
  linalgTopics: Topic[];
  linalgProblems: Problem[];
};

function topicMastered(
  ctx: AchievementContext,
  topicId: string,
  problems: Problem[],
): boolean {
  const stats = getPracticeProgress(ctx.progress, topicId, problems);
  return stats.isComplete;
}

function buildAchievements(): Achievement[] {
  const achievements: Achievement[] = [];

  const subjects: {
    slug: string;
    name: string;
    icon: string;
    topics: Topic[];
    problemsKey: "calcProblems" | "statsProblems" | "linalgProblems";
    hasTests: boolean;
  }[] = [
    { slug: "calculus", name: "Calculus", icon: "∫", topics: calculusTopics, problemsKey: "calcProblems", hasTests: true },
    { slug: "statistics", name: "Statistics", icon: "σ", topics: statisticsTopics, problemsKey: "statsProblems", hasTests: false },
    { slug: "linear-algebra", name: "Linear Algebra", icon: "λ", topics: linalgTopics, problemsKey: "linalgProblems", hasTests: false },
  ];

  for (const s of subjects) {
    for (const topic of s.topics) {
      achievements.push({
        id: `${s.slug}-master-${topic.id}`,
        icon: s.icon,
        title: topic.title,
        description: `Master all practice problems in ${topic.title}`,
        subject: s.name,
        check: (ctx) => topicMastered(ctx, topic.id, ctx[s.problemsKey]),
      });
    }

    if (s.hasTests) {
      for (const topic of s.topics) {
        achievements.push({
          id: `${s.slug}-perfect-${topic.id}`,
          icon: "🏆",
          title: `${topic.title} — Perfect Test`,
          description: `Score 100% on the ${topic.title} test`,
          subject: s.name,
          check: (ctx) => {
            const stats = getTopicTestStats(ctx.progress, topic.id);
            return !!stats.isPerfect;
          },
        });
      }
    }

    achievements.push({
      id: `${s.slug}-complete-all`,
      icon: "⭐",
      title: `${s.name} — All Mastered`,
      description: `Master every practice problem in ${s.name}`,
      subject: s.name,
      check: (ctx) =>
        s.topics.every((t) => topicMastered(ctx, t.id, ctx[s.problemsKey])),
    });
  }

  achievements.push({
    id: "streak-7",
    icon: "🔥",
    title: "Week Warrior",
    description: "Achieve a 7-day practice streak",
    subject: "General",
    check: (ctx) => ctx.progress.streak.longest >= 7,
  });

  achievements.push({
    id: "streak-30",
    icon: "🔥",
    title: "Monthly Master",
    description: "Achieve a 30-day practice streak",
    subject: "General",
    check: (ctx) => ctx.progress.streak.longest >= 30,
  });

  achievements.push({
    id: "first-problem",
    icon: "🎯",
    title: "First Steps",
    description: "Solve your first practice problem",
    subject: "General",
    check: (ctx) => ctx.progress.completedProblemIds.length >= 1,
  });

  achievements.push({
    id: "fifty-problems",
    icon: "💪",
    title: "Half Century",
    description: "Solve 50 practice problems",
    subject: "General",
    check: (ctx) => ctx.progress.completedProblemIds.length >= 50,
  });

  achievements.push({
    id: "hundred-problems",
    icon: "💯",
    title: "Centurion",
    description: "Solve 100 practice problems",
    subject: "General",
    check: (ctx) => ctx.progress.completedProblemIds.length >= 100,
  });

  return achievements;
}

const ALL_ACHIEVEMENTS = buildAchievements();

const SUBJECT_ORDER = ["General", "Calculus", "Statistics", "Linear Algebra"];

export function AchievementsSection() {
  const { progress } = useProgress();

  const ctx: AchievementContext = useMemo(
    () => ({
      progress,
      calcTopics: calculusTopics,
      calcProblems: calculusProblems,
      statsTopics: statisticsTopics,
      statsProblems: statisticsProblems,
      linalgTopics: linalgTopics,
      linalgProblems: linalgProblems,
    }),
    [progress],
  );

  const results = useMemo(
    () =>
      ALL_ACHIEVEMENTS.map((a) => ({
        ...a,
        completed: a.check(ctx),
      })),
    [ctx],
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
