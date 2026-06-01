"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { VoteFeedback } from "@/components/vote-feedback";
import { ProgressProvider } from "@/components/progress-provider";
import { AuthProvider } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { getTestQuestionsForTopic, TestQuestion } from "@/lib/test-questions";
import { isAnswerCorrectAsync } from "@/lib/answer-check";
import { trackEvent } from "@/lib/analytics";
import type { Topic } from "@/lib/shared-types";

type Result = {
  questionId: string;
  prompt: string;
  expected: string;
  userAnswer: string;
  correct: boolean;
  explanation: string;
};

type TestPhase = "confirm" | "active" | "complete";

interface TestClientProps {
  topicId: string;
  topic: Topic | null;
  allTestQuestions: TestQuestion[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function TestClient({ topicId, topic, allTestQuestions }: TestClientProps) {
  // Local providers so the rich test UI (which uses useProgress) never pulls the
  // progress graph into the main route chunk. This + the dynamic import on the
  // server page is the root-cause insulation against "topics is not defined".
  return (
    <AuthProvider>
      <ProgressProvider>
        <TestClientInner topicId={topicId} topic={topic} allTestQuestions={allTestQuestions} />
      </ProgressProvider>
    </AuthProvider>
  );
}

function TestClientInner({ topicId, topic, allTestQuestions }: TestClientProps) {
  const { addAttempt, addTestResult } = useProgress();

  const [phase, setPhase] = useState<TestPhase>("confirm");
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (phase !== "active" || !startTime) return;

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, startTime]);

  const startTest = useCallback(() => {
    const seed = Date.now();
    const shuffled = shuffleArray(allTestQuestions, seed);
    const selected = shuffled.slice(0, Math.min(20, shuffled.length));
    
    setTestQuestions(selected);
    setCurrentIndex(0);
    setResults([]);
    setCurrentAnswer("");
    setElapsedSeconds(0);
    setStartTime(Date.now());
    setPhase("active");
    
    trackEvent("test_started", { topicId });
  }, [allTestQuestions, topicId]);

  const current = testQuestions[currentIndex];
  const score = results.filter((r) => r.correct).length;
  const percentage = testQuestions.length > 0 
    ? Math.round((score / testQuestions.length) * 100) 
    : 0;

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">Topic not found.</p>
        <Link className="btn-secondary mt-4 inline-flex" href="/calculus">
          Back to Calculus
        </Link>
      </div>
    );
  }

  if (allTestQuestions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm text-zinc-600">No test questions available for this topic.</p>
        <Link className="btn-secondary mt-4 inline-flex" href={`/calculus/modules/${topic.id}`}>
          Back to module
        </Link>
      </div>
    );
  }

  // CONFIRMATION SCREEN
  if (phase === "confirm") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-700 ring-1 ring-slate-200">
              Test
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{topic.title} Test</h1>
            <p className="mt-2 text-lg text-zinc-600">
              Test your knowledge with {Math.min(20, allTestQuestions.length)} questions
            </p>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
            <h2 className="font-bold text-zinc-900">Test Rules:</h2>
            <ul className="space-y-3 text-zinc-700">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-600 ring-1 ring-slate-200">1</span>
                <span><strong>One attempt per question</strong> — no going back</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-600 ring-1 ring-slate-200">2</span>
                <span><strong>No hints available</strong> — test your true understanding</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-600 ring-1 ring-slate-200">3</span>
                <span><strong>Timer is running</strong> — complete at your own pace</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-600 ring-1 ring-slate-200">4</span>
                <span><strong>Score at the end</strong> — see your results and review mistakes</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={startTest}
              className="rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
            >
              Start Test →
            </button>
            <Link
              href={`/calculus/modules/${topic.id}`}
              className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Practice Instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETION SCREEN
  if (phase === "complete") {
    const perfectScore = score === testQuestions.length;
    const passed = percentage >= 70;
    
    const easyQuestions = results.filter((r) => testQuestions.find(q => q.id === r.questionId)?.difficulty === "easy");
    const mediumQuestions = results.filter((r) => testQuestions.find(q => q.id === r.questionId)?.difficulty === "medium");
    const hardQuestions = results.filter((r) => testQuestions.find(q => q.id === r.questionId)?.difficulty === "hard");
    
    const easyCorrect = easyQuestions.filter(r => r.correct).length;
    const mediumCorrect = mediumQuestions.filter(r => r.correct).length;
    const hardCorrect = hardQuestions.filter(r => r.correct).length;

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className={`rounded-2xl border p-5 text-center shadow-sm sm:rounded-3xl sm:p-8 ${
          perfectScore
            ? "border-amber-200 bg-amber-50"
            : passed
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
        }`}>
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Score
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-4xl">
            {perfectScore ? "Perfect Score!" : passed ? "Great Job!" : "Keep Practicing!"}
          </h1>
          <p className="mt-2 text-xl text-zinc-600">
            {topic.title} Test Complete
          </p>

          <div className="mt-6 inline-flex items-baseline gap-2 rounded-xl bg-white px-5 py-3 ring-1 ring-black/5 sm:mt-8 sm:rounded-2xl sm:px-8 sm:py-4">
            <span className="text-4xl font-bold text-zinc-900 sm:text-6xl">{score}</span>
            <span className="text-2xl text-zinc-500 sm:text-3xl">/ {testQuestions.length}</span>
          </div>

          <div className="mt-4 text-2xl font-semibold text-zinc-900">
            {percentage}% Correct
          </div>

          <div className="mt-4 text-lg text-zinc-500">
            Time: {formatTime(elapsedSeconds)}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl border-2 border-emerald-100 bg-white p-4 text-center shadow-md sm:rounded-2xl sm:p-5">
            <div className="text-sm font-medium text-emerald-600">Easy</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900">
              {easyCorrect}/{easyQuestions.length}
            </div>
            <div className="mt-1 h-2 rounded-full bg-emerald-100">
              <div 
                className="h-2 rounded-full bg-emerald-500" 
                style={{ width: easyQuestions.length > 0 ? `${(easyCorrect / easyQuestions.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
          <div className="rounded-xl border-2 border-amber-100 bg-white p-4 text-center shadow-md sm:rounded-2xl sm:p-5">
            <div className="text-sm font-medium text-amber-600">Medium</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900">
              {mediumCorrect}/{mediumQuestions.length}
            </div>
            <div className="mt-1 h-2 rounded-full bg-amber-100">
              <div 
                className="h-2 rounded-full bg-amber-500" 
                style={{ width: mediumQuestions.length > 0 ? `${(mediumCorrect / mediumQuestions.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
          <div className="rounded-xl border-2 border-rose-100 bg-white p-4 text-center shadow-md sm:rounded-2xl sm:p-5">
            <div className="text-sm font-medium text-rose-600">Hard</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900">
              {hardCorrect}/{hardQuestions.length}
            </div>
            <div className="mt-1 h-2 rounded-full bg-rose-100">
              <div 
                className="h-2 rounded-full bg-rose-500" 
                style={{ width: hardQuestions.length > 0 ? `${(hardCorrect / hardQuestions.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPhase("confirm");
              trackEvent("test_retake", { topicId });
            }}
            className="rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
          >
            Retake Test
          </button>
          <Link
            href={`/calculus/modules/${topic.id}`}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Practice More
          </Link>
          <Link
            href={`/calculus/modules/${topic.id}`}
            className="rounded-2xl border-2 border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            Back to Module
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {(["easy", "medium", "hard"] as const).map((difficulty) => {
            const diffResults = results
              .map((r, i) => ({ ...r, index: i, question: testQuestions.find(q => q.id === r.questionId) }))
              .filter((r) => r.question?.difficulty === difficulty);
            
            if (diffResults.length === 0) return null;
            
            const incorrectCount = diffResults.filter((r) => !r.correct).length;
            const allCorrect = incorrectCount === 0;
            
            const diffConfig = {
              easy: { label: "Easy", emoji: "🟢", border: "border-emerald-200", bg: "bg-emerald-50", summaryBg: "hover:bg-emerald-50/50", text: "text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
              medium: { label: "Medium", emoji: "🟡", border: "border-amber-200", bg: "bg-amber-50", summaryBg: "hover:bg-amber-50/50", text: "text-amber-800", badge: "bg-amber-100 text-amber-700" },
              hard: { label: "Hard", emoji: "🔴", border: "border-rose-200", bg: "bg-rose-50", summaryBg: "hover:bg-rose-50/50", text: "text-rose-800", badge: "bg-rose-100 text-rose-700" },
            }[difficulty];
            
            return (
              <details key={difficulty} className={`rounded-2xl border-2 ${diffConfig.border} bg-white shadow-sm`} open={!allCorrect}>
                <summary className={`flex cursor-pointer items-center justify-between px-5 py-4 ${diffConfig.summaryBg} rounded-2xl`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{diffConfig.emoji}</span>
                    <span className="text-lg font-bold text-zinc-900">{diffConfig.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${diffConfig.badge}`}>
                      {diffResults.filter(r => r.correct).length}/{diffResults.length} correct
                    </span>
                  </div>
                  {allCorrect ? (
                    <span className="text-sm font-semibold text-emerald-600">✓ All correct</span>
                  ) : (
                    <span className="text-sm font-semibold text-rose-600">{incorrectCount} to review</span>
                  )}
                </summary>
                
                <div className="border-t border-zinc-100 p-4 space-y-3">
                  {diffResults.map((r) => {
                    const isLatexAnswer = /[\\^_{}]/.test(r.expected);
                    
                    if (r.correct) {
                      return (
                        <div
                          key={r.questionId}
                          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                            {r.index + 1}
                          </span>
                          <span className="text-sm font-medium text-emerald-700">✓</span>
                          <span className="flex-1 text-sm text-zinc-700 line-clamp-1">
                            <MathText text={r.prompt} />
                          </span>
                          <span className="text-sm font-medium text-emerald-700">
                            {isLatexAnswer ? <MathText text={`$${r.expected}$`} /> : r.expected}
                          </span>
                        </div>
                      );
                    }
                    
                    return (
                      <div
                        key={r.questionId}
                        className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 font-bold text-rose-800">
                            {r.index + 1}
                          </span>
                          <span className="font-medium text-rose-700">✗ Incorrect</span>
                        </div>
                        
                        <div className="mt-2 text-base font-medium text-zinc-900">
                          <MathText text={r.prompt} />
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-zinc-500">You answered: </span>
                            <span className="font-semibold text-rose-700">{r.userAnswer || "(skipped)"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Correct: </span>
                            <span className="font-semibold text-emerald-700">
                              {isLatexAnswer ? <MathText text={`$${r.expected}$`} /> : r.expected}
                            </span>
                          </div>
                        </div>
                        
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            View step-by-step solution ▸
                          </summary>
                          <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-4">
                            <div className="space-y-3">
                              {(() => {
                                const parts = r.explanation.split(/Step \d+:\s*/);
                                const steps = parts.filter(Boolean).map((step) => 
                                  step.replace(/\s*Final answer:.*$/, "").trim()
                                );
                                return steps.map((step, stepIdx) => (
                                  <div key={stepIdx} className="flex gap-3">
                                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                      {stepIdx + 1}
                                    </span>
                                    <p className="flex-1 text-sm leading-relaxed text-zinc-700">
                                      <MathText text={step} />
                                    </p>
                                  </div>
                                ));
                              })()}
                            </div>
                            <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2">
                              <span className="text-sm font-semibold text-emerald-800">
                                Final Answer:{" "}
                                {isLatexAnswer ? <MathText text={`$${r.expected}$`} /> : r.expected}
                              </span>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <VoteFeedback targetType="problem" targetId={r.questionId} />
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    );
  }

  // ACTIVE TEST SCREEN
  const submit = async (overrideAnswer?: string) => {
    if (!current) return;
    const answer = (overrideAnswer ?? currentAnswer).trim();
    const correct = await isAnswerCorrectAsync(answer, current.answer);
    
    const result: Result = {
      questionId: current.id,
      prompt: current.prompt,
      expected: current.answer,
      userAnswer: answer,
      correct,
      explanation: current.explanation,
    };

    setResults((prev) => [...prev, result]);

    addAttempt({
      problemId: current.id,
      topicId: current.topicId,
      correct,
      createdAt: new Date().toISOString(),
    });

    trackEvent("test_answered", { topicId, correct });

    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer("");
    } else {
      const finalScore = results.filter(r => r.correct).length + (correct ? 1 : 0);
      const finalTotal = testQuestions.length;
      const finalPercentage = Math.round((finalScore / finalTotal) * 100);
      
      addTestResult({
        topicId,
        score: finalScore,
        total: finalTotal,
        percentage: finalPercentage,
        timeSeconds: elapsedSeconds,
        completedAt: new Date().toISOString(),
      });
      
      setPhase("complete");
      trackEvent("test_completed", { 
        topicId, 
        score: finalScore,
        total: finalTotal,
        timeSeconds: elapsedSeconds,
      });
    }
  };

  const progress = ((currentIndex) / testQuestions.length) * 100;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 sm:mb-6 sm:rounded-2xl sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 sm:text-xl">{topic.title} Test</h1>
            <p className="text-sm text-zinc-600">
              Question {currentIndex + 1} of {testQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white px-3 py-2 font-mono text-lg font-bold text-indigo-600 shadow-sm sm:px-4 sm:text-xl">
              ⏱️ {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 h-3 rounded-full bg-indigo-100">
          <div 
            className="h-3 rounded-full bg-slate-900 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 shadow-lg sm:rounded-3xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
            current.difficulty === "easy" ? "bg-emerald-100 text-emerald-700" :
            current.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
            "bg-rose-100 text-rose-700"
          }`}>
            {current.difficulty}
          </span>
          <span className="text-sm text-zinc-500">
            {results.filter(r => r.correct).length} correct so far
          </span>
        </div>

        <div className="py-4 text-center">
          <h2 className="text-lg font-semibold leading-relaxed text-zinc-900 sm:text-2xl">
            <MathText text={current.prompt} />
          </h2>
        </div>

        {current.type === "mcq" ? (
          <div className="mt-6 flex flex-col gap-3">
            {current.choices?.map((choice, idx) => (
              <button
                key={choice}
                type="button"
                onClick={() => submit(choice)}
                className="rounded-xl border-2 border-indigo-100 bg-white px-4 py-3 text-left text-base font-medium text-zinc-900 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md active:scale-[0.98] sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg"
              >
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {String.fromCharCode(65 + idx)}
                </span>
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <MathInput
              value={currentAnswer}
              onChange={setCurrentAnswer}
              onSubmit={() => submit()}
              placeholder="Enter your answer"
              answerHint={current.answer}
              questionPrompt={current.prompt}
            />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => submit("")}
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-600"
          >
            Skip question →
          </button>
        </div>
      </div>
    </div>
  );
}
