"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SectionCard } from "@/components/section-card";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getTopicProgress } from "@/lib/progress";
import { learningPaths, problems, topics } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

const totalProblemsByTopic = topics.reduce<Record<string, number>>(
  (acc, topic) => {
    acc[topic.id] = problems.filter((problem) => problem.topicId === topic.id)
      .length;
    return acc;
  },
  {},
);

export default function LearningPathsPage() {
  const { user, isPro } = useAuth();
  const { progress } = useProgress();

  useEffect(() => {
    trackEvent("view_learning_paths", { plan: user ? (isPro ? "pro" : "free") : "anonymous" });
  }, [user, isPro]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Learning paths</h1>
          <p className="text-sm text-zinc-500">
            Structured plans to guide your calculus practice.
          </p>
        </div>
        {!isPro && (
          <Link className="btn-primary" href="/pricing">
            Upgrade to unlock paths
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {learningPaths.map((path) => {
          const locked = path.paidOnly && !isPro;
          return (
            <SectionCard
              key={path.id}
              title={path.title}
              description={path.description}
            >
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{path.level.toUpperCase()}</span>
                {locked ? <span>Locked</span> : <span>Available</span>}
              </div>
              <div className="mt-4 space-y-3">
                {path.steps.map((step) => {
                  const topic = topics.find((item) => item.id === step.topicId);
                  const totals = totalProblemsByTopic[step.topicId];
                  const stats = getTopicProgress(
                    progress,
                    step.topicId,
                    totals,
                  );
                  return (
                    <div
                      key={step.topicId}
                      className="rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{topic?.title}</span>
                        <span className="text-xs text-zinc-500">
                          Target: {step.targetProblems}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {stats.solved}/{totals} solved · {stats.accuracyRate}%
                        accuracy
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                {locked ? (
                  <Link className="btn-primary" href="/pricing">
                    Unlock path
                  </Link>
                ) : (
                  <Link className="btn-secondary" href="/practice">
                    Start path
                  </Link>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
