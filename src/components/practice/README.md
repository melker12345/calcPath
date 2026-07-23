# Practice Components (Shared)

This folder contains the shared building blocks for the question practice experience across all subjects.

## Goal
Avoid duplicating hundreds of lines of complex UI + state logic every time we add a new subject (Precalculus, Discrete Math, etc.).

## Current Shared Pieces

- `types.ts` — `QuestionStatus` and `FeedbackState`
- `ProgressDots.tsx` — The row(s) of colored progress dots
- `PracticeFeedback.tsx` — The "Correct!" and "Not quite / Solution" overlays
- `usePracticeSession.ts` — Core hook that manages index, statuses, manual navigation tracking, shuffle, etc.

## Usage Example (Linear Algebra)

```tsx
const {
  displayProblems,
  index,
  setIndex,
  questionStatuses,
  hasManuallyNavigated,
  ...
} = usePracticeSession({
  problems: topicProblems,
  completedProblemIds: progress.completedProblemIds,
  sectionFilter,
});

// Then use:
<ProgressDots
  statuses={questionStatuses}
  currentIndex={index}
  onSelect={setIndex}
/>

<PracticeFeedback ... />
```

## Migration Status (as of latest)

- **Linear Algebra**: Fully using the shared stack (`usePracticeSession`, `ProgressDots`, `PracticeFeedback`)
- **Calculus**: Major progress — using `usePracticeSession` + `ProgressDots` + `PracticeFeedback`. `PracticeFeedback` is now self-contained (no longer needs custom `renderSteps`). Advanced resume logic still partially local.
- **Statistics**: Not started

**Current focus**: Completing the Calculus migration (highest complexity, biggest duplication win).

## Future Direction

Ideally, most of the practice page logic should live in or around `usePracticeSession`, with subject pages becoming thin wrappers that only handle:
- Loading the correct `problems` array
- Any subject-specific rendering (e.g. different math input)
- Passing through `getModuleSectionUrl`

This will make adding new subjects cheap and consistent.
