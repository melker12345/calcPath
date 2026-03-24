"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MathText } from "@/components/math-text";
import { MathInput } from "@/components/math-input";
import { VoteFeedback } from "@/components/vote-feedback";
import { useProgress } from "@/components/progress-provider";
import { problems, topics, getModuleSectionUrl, getModuleSectionTitle } from "@/lib/linalg-content";
import { isAnswerCorrectAsync } from "@/lib/answer-check";

function detectQuestionContext(prompt: string) {
  const ctx = { hasVariable: [] as string[], hasTrig: false, hasExp: false, hasLn: false, hasPi: false };
  if (/\bx\b/.test(prompt)) ctx.hasVariable.push("x");
  if (/\by\b/.test(prompt)) ctx.hasVariable.push("y");
  if (/\bt\b/.test(prompt)) ctx.hasVariable.push("t");
  if (/\bn\b/.test(prompt)) ctx.hasVariable.push("n");
  if (/\\?(sin|cos|tan|sec|csc|cot)/i.test(prompt)) ctx.hasTrig = true;
  if (/e\^|\\exp/i.test(prompt)) ctx.hasExp = true;
  if (/\\ln|\\log/i.test(prompt)) ctx.hasLn = true;
  if (/\\pi|π/i.test(prompt)) ctx.hasPi = true;
  return ctx;
}

type FeedbackState =
  | null
  | { type: "correct" }
  | { type: "incorrect"; attempts: number; hintUsed: boolean; showSolution: boolean };

export default function LinalgPracticeTopic() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const { progress, addAttempt } = useProgress();
  const topic = topics.find((t) => t.id === topicId);
  const topicProblems = useMemo(() => problems.filter((p) => p.topicId === topicId), [topicId]);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [displayProblems, setDisplayProblems] = useState(topicProblems);
  const [resumeReady, setResumeReady] = useState(false);

  const current = displayProblems[index];
  const questionContext = useMemo(() => current ? detectQuestionContext(current.prompt) : undefined, [current]);

  useEffect(() => {
    const count = progress.completedProblemIds.filter((id) =>
      topicProblems.some((p) => p.id === id)
    ).length;
    setSolvedCount(count);
  }, [progress.completedProblemIds, topicProblems]);

  useEffect(() => {
    if (resumeReady) return;
    const completedSet = new Set(progress.completedProblemIds);
    const firstUnsolved = topicProblems.findIndex((p) => !completedSet.has(p.id));
    if (firstUnsolved > 0) setIndex(firstUnsolved);
    setResumeReady(true);
  }, [progress.completedProblemIds, topicProblems, resumeReady]);

  useEffect(() => { if (!shuffled) setDisplayProblems(topicProblems); }, [topicProblems, shuffled]);
  useEffect(() => { setFeedback(null); setAnswer(""); setOverlayDismissed(false); }, [index]);

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-sm" style={{ color: "rgba(226,232,240,0.6)" }}>Topic not found.</p>
        <Link className="btn-linalg-secondary mt-4 inline-flex" href="/linear-algebra/practice">Back to practice</Link>
      </div>
    );
  }

  if (!current) return null;

  const submitAnswer = async (val: string) => {
    const isCorrect = await isAnswerCorrectAsync(val, current.answer);
    const currentAttempts = feedback?.type === "incorrect" ? feedback.attempts : 0;
    const hintWasUsed = feedback?.type === "incorrect" ? feedback.hintUsed : false;
    addAttempt({ problemId: current.id, topicId: current.topicId, correct: isCorrect, createdAt: new Date().toISOString() });
    setOverlayDismissed(false);
    if (isCorrect) {
      setFeedback({ type: "correct" });
    } else {
      const newAttempts = currentAttempts + 1;
      setFeedback({ type: "incorrect", attempts: newAttempts, hintUsed: hintWasUsed, showSolution: newAttempts >= 3 || (hintWasUsed && newAttempts >= 2) });
    }
  };

  const useHint = () => {
    if (feedback?.type === "correct") return;
    if (feedback?.type === "incorrect" && feedback.hintUsed) return;
    setOverlayDismissed(false);
    if (feedback?.type === "incorrect") setFeedback({ ...feedback, hintUsed: true });
    else setFeedback({ type: "incorrect", attempts: 0, hintUsed: true, showSolution: false });
  };

  const goToNext = () => { setFeedback(null); setAnswer(""); setIndex((i) => Math.min(displayProblems.length - 1, i + 1)); };
  const goToPrev = () => { setFeedback(null); setAnswer(""); setIndex((i) => Math.max(0, i - 1)); };
  const shuffleAndRestart = () => {
    setDisplayProblems([...topicProblems].sort(() => Math.random() - 0.5));
    setShuffled(true); setIndex(0); setFeedback(null); setAnswer("");
  };

  const getHint = () => {
    const m = current.explanation.match(/Step 1:\s*([^.]+\.)/);
    return m?.[1] || "Think about the rules that apply to this type of problem.";
  };

  const progressPct = Math.round((solvedCount / displayProblems.length) * 100);

  const renderSteps = (color: "emerald" | "amber") =>
    current.explanation.split(/Step \d+:\s*/).filter(Boolean)
      .map((s) => s.replace(/\s*Final answer:.*$/, "").trim())
      .map((step, i) => (
        <div key={i} className={`flex gap-2 sm:gap-3 ${color === "emerald" ? "animate-step-in" : ""}`} style={color === "emerald" ? { animationDelay: `${0.25 + i * 0.1}s` } : undefined}>
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs ${color === "emerald" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>{i + 1}</span>
          <p className="flex-1 text-sm leading-relaxed text-zinc-700 sm:text-base"><MathText text={step} /></p>
        </div>
      ));

  const finalAnswer = current.explanation.match(/Final answer:\s*(.+?)\.?$/)?.[1] || `$${current.answer}$`;
  const isDismissable = feedback?.type === "incorrect" && !feedback.showSolution;

  const correctOverlay = feedback?.type === "correct" ? (
    <div className="animate-correct-pop flex h-full flex-col border-t border-emerald-200 bg-emerald-50 p-3 pt-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <div className="animate-check-bounce flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">✓</div>
        <p className="text-base font-bold text-emerald-800 sm:text-xl">Correct!</p>
      </div>
      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">{renderSteps("emerald")}</div>
      <div className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3">
        <p className="text-sm font-semibold text-emerald-900 sm:text-base">Answer: <span className="text-base sm:text-lg"><MathText text={finalAnswer} /></span></p>
      </div>
      <div className="mt-2 flex justify-end sm:mt-3"><VoteFeedback targetType="problem" targetId={current.id} /></div>
      <button type="button" onClick={goToNext} className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] sm:mt-3 sm:py-3 sm:text-base">
        Next Question →
      </button>
    </div>
  ) : null;

  const incorrectOverlay = (feedback?.type === "incorrect" && !overlayDismissed) ? (
    <div className={`flex h-full flex-col border-t p-3 pt-4 sm:p-5 ${feedback.showSolution || feedback.attempts > 0 ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
      {feedback.attempts > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-base">✗</div>
          <div>
            <p className="text-sm font-bold text-amber-800 sm:text-lg">Not quite</p>
            <p className="text-[11px] text-amber-700 sm:text-sm">
              {feedback.showSolution && "Here's the solution:"}
              {!feedback.showSolution && feedback.attempts === 1 && !feedback.hintUsed && "Give it another try!"}
              {!feedback.showSolution && feedback.attempts === 1 && feedback.hintUsed && "Use the hint and try again!"}
              {!feedback.showSolution && feedback.attempts === 2 && !feedback.hintUsed && "Need a hint?"}
              {!feedback.showSolution && feedback.attempts === 2 && feedback.hintUsed && "Use the hint and try again!"}
            </p>
          </div>
        </div>
      )}
      {feedback.hintUsed && !feedback.showSolution && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 sm:mt-4 sm:p-4">
          <p className="text-[11px] font-semibold text-blue-700 sm:text-sm">Hint</p>
          <p className="mt-0.5 text-xs text-blue-900 sm:mt-1 sm:text-base"><MathText text={getHint()} /></p>
        </div>
      )}
      {feedback.showSolution && (
        <>
          <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto sm:mt-4 sm:space-y-2">{renderSteps("amber")}</div>
          <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 sm:mt-4 sm:rounded-xl sm:px-4 sm:py-3">
            <p className="text-sm font-semibold text-amber-900 sm:text-base">Answer: <span className="text-base sm:text-lg"><MathText text={finalAnswer} /></span></p>
          </div>
          <div className="mt-2 flex justify-end sm:mt-3"><VoteFeedback targetType="problem" targetId={current.id} /></div>
        </>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
        {!feedback.showSolution && !feedback.hintUsed && (
          <button type="button" onClick={useHint} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">Hint</button>
        )}
        {!feedback.showSolution && (
          <button type="button" onClick={() => setFeedback({ ...feedback, showSolution: true })} className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">Solution</button>
        )}
        {feedback.showSolution ? (
          <button type="button" onClick={goToNext} className="mt-1 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] sm:mt-2 sm:py-3 sm:text-base">Next Question →</button>
        ) : (
          <button type="button" onClick={goToNext} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 active:scale-95 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">Skip</button>
        )}
      </div>
    </div>
  ) : null;

  const overlay = correctOverlay || incorrectOverlay || undefined;

  return (
    <div className="mx-auto w-full max-w-3xl px-0 pb-0 sm:px-6 sm:py-10">
      {/* Desktop header */}
      <div className="mb-5 hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#e2e8f0" }}>{topic.title}</h1>
          <p className="mt-0.5 text-sm" style={{ color: "rgba(226,232,240,0.58)" }}>{topic.description}</p>
        </div>
        <span className="text-sm" style={{ color: "rgba(226,232,240,0.5)" }}>{solvedCount}/{displayProblems.length} mastered</span>
      </div>

      {/* Main card */}
      <style>{`@media(min-width:640px){.la-card{background:rgba(255,255,255,0.04)!important;border-color:rgba(51,114,162,0.28)!important;}}`}</style>
      <div className="la-card flex min-h-[calc(100dvh-56px)] flex-col justify-end px-4 pb-1 pt-2 sm:min-h-[min(80vh,700px)] sm:rounded-2xl sm:border sm:px-8 sm:pb-6 sm:pt-6 sm:shadow-lg">

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(51,114,162,0.18)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#3372A2,#5b9bd5)" }} />
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: "rgba(226,232,240,0.45)" }}>{index + 1} / {displayProblems.length}</span>
          </div>

          {/* Question */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-5">
            <h2 className="text-center text-lg font-semibold leading-relaxed sm:text-2xl" style={{ color: "#e2e8f0" }}>
              <MathText text={current.prompt} />
            </h2>
            {(() => {
              const moduleUrl = getModuleSectionUrl(current.topicId, current.section);
              const sectionTitle = getModuleSectionTitle(current.topicId, current.section);
              if (!moduleUrl) return null;
              return (
                <Link
                  href={moduleUrl}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors hover:bg-blue-900/30"
                  style={{ color: "#5b9bd5" }}
                  title={sectionTitle ? `Read: ${sectionTitle}` : "Review this topic"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                    <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.34A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                  </svg>
                  {sectionTitle ? sectionTitle : "Review this topic"}
                </Link>
              );
            })()}
          </div>

          {/* Answer area */}
          {current.type === "mcq" ? (
            <div className="flex flex-col gap-2 sm:gap-3">
              {(!overlay || overlayDismissed) && current.choices?.map((choice) => (
                <button key={choice} type="button" onClick={() => { setAnswer(choice); submitAnswer(choice); }}
                  disabled={feedback?.type === "correct"}
                  className="rounded-xl border px-4 py-3 text-left text-base font-medium transition active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-3.5 sm:text-lg"
                  style={{ borderColor: "rgba(51,114,162,0.3)", color: "#e2e8f0" }}
                >
                  <MathText text={choice} />
                </button>
              ))}
              {overlay && !overlayDismissed && (
                <div className="relative overflow-hidden rounded-xl border border-slate-200">
                  {isDismissable && (
                    <button type="button" onClick={() => setOverlayDismissed(true)}
                      className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-zinc-400 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-600">×</button>
                  )}
                  {overlay}
                </div>
              )}
            </div>
          ) : (
            <MathInput
              value={answer}
              onChange={setAnswer}
              onSubmit={() => submitAnswer(answer)}
              onHint={useHint}
              subject="linalg"
              hintDisabled={feedback?.type === "correct" || (feedback?.type === "incorrect" && (feedback.hintUsed || feedback.showSolution))}
              questionContext={questionContext}
              answerHint={current.answer}
              feedbackOverlay={overlay}
              onDismissOverlay={isDismissable ? () => setOverlayDismissed(true) : undefined}
              questionPrompt={current.prompt}
            />
          )}

          {/* All mastered */}
          {solvedCount >= displayProblems.length && (
            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-900/20 p-4 text-center sm:mt-6 sm:rounded-2xl sm:p-5">
              <p className="text-lg font-bold text-emerald-300">All {displayProblems.length} problems mastered!</p>
              <p className="mt-1 text-sm" style={{ color: "rgba(226,232,240,0.58)" }}>Shuffle for a fresh run.</p>
              <button type="button" onClick={shuffleAndRestart} className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95" style={{ background: "#3372A2" }}>
                Shuffle &amp; restart
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-1 flex items-center justify-between py-1 sm:mt-3 sm:py-0">
            <div className="flex items-center gap-1">
              <button type="button" onClick={goToPrev} disabled={index === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-25 sm:h-9 sm:w-9"
                style={{ color: "rgba(226,232,240,0.5)" }}
                aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button type="button" onClick={goToNext} disabled={index === displayProblems.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-25 sm:h-9 sm:w-9"
                style={{ color: "rgba(226,232,240,0.5)" }}
                aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              {solvedCount > 0 && solvedCount < displayProblems.length && (
                <button type="button"
                  className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium transition sm:text-sm"
                  style={{ color: "rgba(226,232,240,0.5)" }}
                  onClick={() => {
                    const done = new Set(progress.completedProblemIds);
                    const next = displayProblems.findIndex((p, i) => i > index && !done.has(p.id));
                    setIndex(next >= 0 ? next : (displayProblems.findIndex((p) => !done.has(p.id)) || 0));
                    setFeedback(null); setAnswer("");
                  }}>Skip to unsolved</button>
              )}
            </div>
            <Link className="rounded-lg px-2.5 py-1 text-xs font-medium transition sm:text-sm" style={{ color: "rgba(226,232,240,0.5)" }} href="/linear-algebra/practice">
              All topics
            </Link>
          </div>
        </div>
      </div>
  );
}
