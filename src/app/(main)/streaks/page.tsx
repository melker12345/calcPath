"use client";

import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { useProgress } from "@/components/progress-provider";
import { problems } from "@/lib/calculus-content";

export default function StreaksPage() {
  const { progress } = useProgress();
  const totalAttempts = progress.attempts.length;
  const totalCorrect = progress.attempts.filter((a) => a.correct).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Streaks & goals</h1>
        <p className="text-sm text-zinc-600">
          Maintain momentum with consistent practice.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard title="Current streak">
          <div className="text-3xl font-bold text-zinc-900">{progress.streak.current}</div>
          <p className="text-sm text-zinc-600">Days in a row</p>
        </SectionCard>
        <SectionCard title="Longest streak">
          <div className="text-3xl font-bold text-zinc-900">{progress.streak.longest}</div>
          <p className="text-sm text-zinc-600">Personal best</p>
        </SectionCard>
        <SectionCard title="Accuracy trend">
          <div className="text-3xl font-bold text-zinc-900">
            {totalAttempts === 0
              ? 0
              : Math.round((totalCorrect / totalAttempts) * 100)}
            %
          </div>
          <p className="text-sm text-zinc-600">
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
            <div className="h-2 w-full rounded-full bg-orange-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                style={{
                  width: `${Math.min(
                    100,
                    (progress.completedProblemIds.length / 30) * 100,
                  )}%`,
                }}
              />
            </div>
            <span className="text-sm text-zinc-600">
              {progress.completedProblemIds.length}/30
            </span>
          </div>
          <Link className="btn-primary mt-4 inline-flex" href="/calculus/practice">
            Keep practicing
          </Link>
        </SectionCard>
        <SectionCard
          title="Focus recommendation"
          description="Build consistent mastery with high-impact topics."
        >
          <p className="text-sm text-zinc-700">
            You have {problems.length} problems available. Start with the next
            10 in derivatives to reinforce core skills.
          </p>
          <Link className="btn-secondary mt-4 inline-flex" href="/calculus/practice">
            Open derivatives
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
