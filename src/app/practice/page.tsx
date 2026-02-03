"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SectionCard } from "@/components/section-card";
import { useProgress } from "@/components/progress-provider";
import { getTopicProgress } from "@/lib/progress";
import { problems, topics } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

const totalProblemsByTopic = topics.reduce<Record<string, number>>(
  (acc, topic) => {
    acc[topic.id] = problems.filter((problem) => problem.topicId === topic.id)
      .length;
    return acc;
  },
  {},
);

export default function PracticePage() {
  const { progress } = useProgress();

  useEffect(() => {
    trackEvent("view_practice_topics");
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Practice by topic</h1>
        <p className="text-sm text-zinc-500">
          Choose a calculus topic and start solving problems.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic) => {
          const totals = totalProblemsByTopic[topic.id];
          const stats = getTopicProgress(progress, topic.id, totals);
          return (
            <SectionCard
              key={topic.id}
              title={topic.title}
              description={topic.description}
            >
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>
                  {stats.solved}/{totals} solved · {stats.accuracyRate}% accuracy
                </span>
                <span>{topic.estimatedMinutes} min</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link className="btn-primary" href={`/practice/${topic.id}`}>
                  Start session
                </Link>
                <Link className="btn-secondary" href={`/modules/${topic.id}`}>
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
