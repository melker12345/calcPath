"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SectionCard } from "@/components/section-card";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress } from "@/lib/progress";
import { problems, topics } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

export default function PracticePage() {
  const { progress } = useProgress();

  useEffect(() => {
    trackEvent("view_practice_topics");
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Practice by topic</h1>
        <p className="text-sm text-zinc-500">
          Choose a calculus topic and start solving problems.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {topics.map((topic) => {
          const stats = getPracticeProgress(progress, topic.id, problems);
          return (
            <SectionCard
              key={topic.id}
              title={topic.title}
              description={topic.description}
            >
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-zinc-900">
                    {stats.correct}/{stats.total}
                  </span>
                  <span className="text-sm text-zinc-500">mastered</span>
                </div>
                <span className="text-sm text-zinc-500">{topic.estimatedMinutes} min</span>
              </div>
              
              <div className="mt-3 h-2 rounded-full bg-orange-100">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    stats.isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-orange-400 to-amber-400"
                  }`}
                  style={{ width: `${stats.masteryRate}%` }}
                />
              </div>
              
              <div className="mt-2 text-sm text-zinc-500">
                {stats.accuracyRate}% accuracy
                {stats.isComplete && (
                  <span className="ml-2 font-semibold text-emerald-600">✓ Complete</span>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="btn-primary" href={`/calculus/practice/${topic.id}`}>
                  {stats.correct > 0 ? "Continue" : "Start"} practice
                </Link>
                <Link className="btn-secondary" href={`/calculus/modules/${topic.id}`}>
                  Read module
                </Link>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
