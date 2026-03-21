"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getPracticeProgress, getTopicTestStats } from "@/lib/progress";
import { problems, topics } from "@/lib/calculus-content";
import { trackEvent } from "@/lib/analytics";

export default function DashboardPage() {
  const { user } = useAuth();
  const { progress } = useProgress();
  
  // Calculate overall stats on client to avoid hydration mismatch
  const [stats, setStats] = useState({
    totalMastered: 0,
    totalProblems: problems.length,
    accuracy: 0,
  });

  useEffect(() => {
    trackEvent("view_dashboard", {
      plan: user ? "user" : "anonymous",
    });
  }, [user]);

  // Calculate overall practice progress (excluding test questions)
  useEffect(() => {
    let totalMastered = 0;
    let totalAttempted = 0;
    
    for (const topic of topics) {
      const practiceStats = getPracticeProgress(progress, topic.id, problems);
      totalMastered += practiceStats.correct;
      totalAttempted += practiceStats.attempted;
    }
    
    const accuracy = totalAttempted === 0 ? 0 : Math.round((totalMastered / totalAttempted) * 100);
    setStats({ totalMastered, totalProblems: problems.length, accuracy });
  }, [progress]);

  const recentDays = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of progress.attempts) {
      const day = a.createdAt.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    const days: Array<{ day: string; count: number }> = [];
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days.push({ day: d, count: counts.get(d) ?? 0 });
    }
    return days;
  }, [progress.attempts]);

  const completionPercent = Math.round((stats.totalMastered / stats.totalProblems) * 100);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-zinc-600">
            {user
              ? `Welcome back, ${user.email ?? "student"}`
              : "Sign in to sync progress across devices."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-secondary flex-1 justify-center sm:flex-initial" href="/calculus/practice">
            Practice
          </Link>
          {/* <Link className="btn-primary flex-1 justify-center sm:flex-initial" href="/calculus/flashcards">
            Flash Cards
          </Link> */}
        </div>
      </div>

      {/* Stats Overview - 3 columns */}
      <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:rounded-2xl sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-orange-600">
            Problems Mastered
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-zinc-900">{stats.totalMastered}</span>
            <span className="text-lg text-zinc-500">/ {stats.totalProblems}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-orange-100">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-zinc-500">{completionPercent}% complete</div>
        </div>
        
        <div className="rounded-xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:rounded-2xl sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Current Streak
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-zinc-900">{progress.streak.current}</span>
            <span className="text-lg text-zinc-500">days</span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {recentDays.map((d) => {
              const intensity =
                d.count === 0
                  ? "bg-emerald-100"
                  : d.count < 3
                    ? "bg-emerald-200"
                    : d.count < 6
                      ? "bg-emerald-400"
                      : "bg-emerald-600";
              return (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.count} attempts`}
                  className={`h-3 flex-1 rounded-sm ${intensity}`}
                />
              );
            })}
          </div>
          <div className="mt-2 text-sm text-zinc-500">Best: {progress.streak.longest} days</div>
        </div>
        
        <div className="rounded-xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:rounded-2xl sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Accuracy
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-zinc-900">{stats.accuracy}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-indigo-100">
            <div 
              className={`h-2 rounded-full transition-all ${
                stats.accuracy >= 80 ? "bg-emerald-500" : 
                stats.accuracy >= 60 ? "bg-amber-400" : 
                "bg-gradient-to-r from-indigo-400 to-purple-400"
              }`}
              style={{ width: `${stats.accuracy}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-zinc-500">First-try success rate</div>
        </div>
      </div>

      {/* Topic Progress - Full width cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">Topic Progress</h2>
        
        {topics.map((topic) => {
          const practiceStats = getPracticeProgress(progress, topic.id, problems);
          const testStats = getTopicTestStats(progress, topic.id);
          
          return (
            <div
              key={topic.id}
              className="rounded-xl border-2 border-zinc-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">{topic.title}</h3>
                  <p className="mt-0.5 text-sm text-zinc-500">{topic.description}</p>
                </div>
                <Link
                  href={`/calculus/modules/${topic.id}`}
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-600"
                >
                  View module →
                </Link>
              </div>
              
              {/* Progress bars side by side */}
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                {/* Practice Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                        <span className="text-sm">📝</span>
                      </div>
                      <span className="font-medium text-zinc-900">Practice</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-zinc-900">
                        {practiceStats.correct}/{practiceStats.total}
                      </span>
                      {practiceStats.isComplete && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Complete
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-2.5 rounded-full bg-orange-100">
                    <div 
                      className={`h-2.5 rounded-full transition-all ${
                        practiceStats.isComplete 
                          ? "bg-emerald-500" 
                          : "bg-gradient-to-r from-orange-400 to-amber-400"
                      }`}
                      style={{ width: `${practiceStats.masteryRate}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {practiceStats.accuracyRate}% accuracy
                    </span>
                    <Link
                      href={`/calculus/practice/${topic.id}`}
                      className="font-semibold text-orange-600 hover:text-orange-800"
                    >
                      Practice →
                    </Link>
                  </div>
                </div>
                
                {/* Test Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                        <span className="text-sm">🎯</span>
                      </div>
                      <span className="font-medium text-zinc-900">Test</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {testStats.bestScore !== null ? (
                        <>
                          <span className="text-sm font-semibold text-zinc-900">
                            {testStats.bestScore}/{testStats.bestTotal}
                          </span>
                          {testStats.isPerfect && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              🏆 Perfect
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-zinc-400">Not taken</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-2.5 rounded-full bg-indigo-100">
                    {testStats.bestPercentage !== null && (
                      <div 
                        className={`h-2.5 rounded-full transition-all ${
                          testStats.isPerfect 
                            ? "bg-amber-400" 
                            : (testStats.bestPercentage ?? 0) >= 70
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-indigo-400 to-purple-400"
                        }`}
                        style={{ width: `${testStats.bestPercentage}%` }}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {testStats.attemptCount > 0 
                        ? `${testStats.attemptCount} attempt${testStats.attemptCount !== 1 ? "s" : ""}`
                        : "20 questions"
                      }
                    </span>
                    <Link
                      href={`/calculus/test/${topic.id}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {testStats.attemptCount > 0 ? "Retake →" : "Take Test →"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
