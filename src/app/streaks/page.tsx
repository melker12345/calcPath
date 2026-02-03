"use client";

import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { useProgress } from "@/components/progress-provider";
import { problems } from "@/lib/content";

export default function StreaksPage() {
  const { progress } = useProgress();
  const totalAttempts = progress.attempts.length;
  const totalCorrect = progress.attempts.filter((a) => a.correct).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Streaks & goals</h1>
        <p className="text-sm text-zinc-500">
          Maintain momentum with consistent practice.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard title="Current streak">
          <div className="text-3xl font-semibold">{progress.streak.current}</div>
          <p className="text-sm text-zinc-500">Days in a row</p>
        </SectionCard>
        <SectionCard title="Longest streak">
          <div className="text-3xl font-semibold">{progress.streak.longest}</div>
          <p className="text-sm text-zinc-500">Personal best</p>
        </SectionCard>
        <SectionCard title="Accuracy trend">
          <div className="text-3xl font-semibold">
            {totalAttempts === 0
              ? 0
              : Math.round((totalCorrect / totalAttempts) * 100)}
            %
          </div>
          <p className="text-sm text-zinc-500">
            {totalCorrect} correct attempts
          </p>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Weekly goal"
          description="Finish 30 problems this week to keep your streak growing."
        >
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 w-full rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-zinc-900"
                style={{
                  width: `${Math.min(
                    100,
                    (progress.completedProblemIds.length / 30) * 100,
                  )}%`,
                }}
              />
            </div>
            <span className="text-sm text-zinc-500">
              {progress.completedProblemIds.length}/30
            </span>
          </div>
          <Link className="btn-primary mt-4 inline-flex" href="/practice">
            Keep practicing
          </Link>
        </SectionCard>
        <SectionCard
          title="Focus recommendation"
          description="Build consistent mastery with high-impact topics."
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            You have {problems.length} problems available. Start with the next
            10 in derivatives to reinforce core skills.
          </p>
          <Link className="btn-secondary mt-4 inline-flex" href="/practice">
            Open derivatives
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
