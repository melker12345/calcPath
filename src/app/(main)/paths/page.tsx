"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SectionCard } from "@/components/section-card";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress } from "@/lib/progress";
import { learningPaths, problems, topics } from "@/lib/calculus-content";
import { trackEvent } from "@/lib/analytics";


export default function LearningPathsPage() {
  const { user } = useAuth();
  const { progress } = useProgress();

  useEffect(() => {
    trackEvent("view_learning_paths", { plan: user ? "user" : "anonymous" });
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Learning paths</h1>
          <p className="text-sm text-zinc-600">
            Structured plans to guide your calculus practice.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {learningPaths.map((path) => {
          return (
            <SectionCard
              key={path.id}
              title={path.title}
              description={path.description}
            >
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{path.level.toUpperCase()}</span>
                <span>Available</span>
              </div>
              <div className="mt-4 space-y-3">
                {path.steps.map((step) => {
                  const topic = topics.find((item) => item.id === step.topicId);
                  const stats = getPracticeProgress(progress, step.topicId, problems);
                  return (
                    <div
                      key={step.topicId}
                      className="rounded-2xl border-2 border-orange-100 px-4 py-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-900">{topic?.title}</span>
                        <span className="text-xs text-zinc-500">
                          Target: {step.targetProblems}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-orange-100">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            stats.isComplete ? "bg-emerald-500" : "bg-orange-400"
                          }`}
                          style={{ width: `${stats.masteryRate}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {stats.correct}/{stats.total} mastered · {stats.accuracyRate}% accuracy
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <Link className="btn-secondary" href="/calculus/practice">
                  Start path
                </Link>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
