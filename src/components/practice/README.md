# Practice components

The practice page for one chapter is `src/components/generic-practice-experience.tsx`,
rendered by `src/app/[subject]/practice/[topicId]/page.tsx` (a static route; every
chapter is prerendered). Everything in this folder is a building block for it.

- `usePracticeSession.ts` — session state: which question is current, the
  per-question transient state (typed answer, feedback), navigation, the
  optional `?section=` filter and `?focus=` deep link.
- `shuffleChoices.ts` — `orderedChoices(questionId, choices)`: the display
  order of a multiple-choice question's options, seeded on the question id.
  Every place that renders or highlights choices must use it, so the order is
  the same before and after grading. (Stored order puts the correct answer first
  in ~97% of questions.)
- `PracticeFeedback.tsx` — the graded-answer feedback: a compact "Not quite"
  banner with Hint / Solution / Skip, or the full card with worked steps and the
  answer. Also exports the pure helpers that read the conventional explanation
  format (`extractSteps`, `extractFinalAnswer`, `getDefaultHint`).
- `ProgressDots.tsx` — one small square per question, filled when solved.
- `PracticeErrorBoundary.tsx` — the outer boundary for the route.
- `types.ts` — `QuestionStatus`, `FeedbackState`.

Typed answers go through `src/components/math-input.tsx` (MathQuill + keypad)
and are graded by `src/lib/answer-check.ts`; multiple choice is graded by
identity against the offered choices. Progress is recorded through
`useProgress().addAttempt` and read back as `completedProblemIds`.
