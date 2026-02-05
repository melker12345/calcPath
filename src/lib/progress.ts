export type Attempt = {
  problemId: string;
  topicId: string;
  correct: boolean;
  createdAt: string;
};

export type StreakStats = {
  current: number;
  longest: number;
  lastCompletionDate?: string;
};

export type ProgressState = {
  attempts: Attempt[];
  attemptedProblemIds: string[];
  completedProblemIds: string[];
  topicStats: Record<string, { solved: number; correct: number }>;
  streak: StreakStats;
};

export const createEmptyProgress = (): ProgressState => ({
  attempts: [],
  attemptedProblemIds: [],
  completedProblemIds: [],
  topicStats: {},
  streak: { current: 0, longest: 0 },
});

const rebuildDerivedFields = (attempts: Attempt[]) => {
  const attempted = new Set<string>();
  const completed = new Set<string>();
  const attemptedByTopic = new Map<string, Set<string>>();
  const completedByTopic = new Map<string, Set<string>>();

  for (const a of attempts) {
    attempted.add(a.problemId);
    if (!attemptedByTopic.has(a.topicId)) attemptedByTopic.set(a.topicId, new Set());
    attemptedByTopic.get(a.topicId)!.add(a.problemId);

    if (a.correct) {
      completed.add(a.problemId);
      if (!completedByTopic.has(a.topicId)) completedByTopic.set(a.topicId, new Set());
      completedByTopic.get(a.topicId)!.add(a.problemId);
    }
  }

  const topicStats: Record<string, { solved: number; correct: number }> = {};
  for (const [topicId, set] of attemptedByTopic.entries()) {
    topicStats[topicId] = {
      solved: set.size,
      correct: completedByTopic.get(topicId)?.size ?? 0,
    };
  }

  return {
    attemptedProblemIds: Array.from(attempted).slice(0, 5000),
    completedProblemIds: Array.from(completed).slice(0, 5000),
    topicStats,
    streak: calculateStreak(attempts),
  };
};

export const normalizeProgressState = (
  input: Partial<ProgressState> | null | undefined,
): ProgressState => {
  const empty = createEmptyProgress();
  if (!input) return empty;
  const attempts = Array.isArray(input.attempts) ? input.attempts : empty.attempts;
  if (attempts.length > 0) {
    const derived = rebuildDerivedFields(attempts);
    return {
      attempts,
      attemptedProblemIds: derived.attemptedProblemIds,
      completedProblemIds: derived.completedProblemIds,
      topicStats: derived.topicStats,
      streak: derived.streak,
    };
  }
  return {
    attempts,
    attemptedProblemIds: Array.isArray(input.attemptedProblemIds)
      ? input.attemptedProblemIds
      : empty.attemptedProblemIds,
    completedProblemIds: Array.isArray(input.completedProblemIds)
      ? input.completedProblemIds
      : empty.completedProblemIds,
    topicStats: input.topicStats ?? empty.topicStats,
    streak: input.streak ?? empty.streak,
  };
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

export const calculateStreak = (attempts: Attempt[]): StreakStats => {
  const completionDays = new Set<string>();
  attempts.forEach((attempt) => {
    if (attempt.correct) {
      completionDays.add(dayKey(new Date(attempt.createdAt)));
    }
  });

  const sortedDays = Array.from(completionDays).sort();
  if (sortedDays.length === 0) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let current = 1;
  let run = 1;

  for (let i = 1; i < sortedDays.length; i += 1) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const todayKey = dayKey(new Date());
  const lastDay = sortedDays[sortedDays.length - 1];
  const yesterdayKey = dayKey(new Date(Date.now() - 86400000));

  if (lastDay === todayKey) {
    current = run;
  } else if (lastDay === yesterdayKey) {
    current = run;
  } else {
    current = 0;
  }

  return { current, longest, lastCompletionDate: lastDay };
};

export const recordAttempt = (
  state: ProgressState,
  attempt: Attempt,
): ProgressState => {
  const prevAttempted = state.attemptedProblemIds.includes(attempt.problemId);
  const prevCompleted = state.completedProblemIds.includes(attempt.problemId);

  const attempts = [attempt, ...state.attempts].slice(0, 5000);
  const topicStats = { ...state.topicStats };
  const stat = topicStats[attempt.topicId] ?? { solved: 0, correct: 0 };

  // solved = unique attempted problems (per topic)
  if (!prevAttempted) {
    stat.solved += 1;
  }

  // correct = unique correctly solved problems (per topic)
  if (attempt.correct && !prevCompleted) {
    stat.correct += 1;
  }
  topicStats[attempt.topicId] = stat;

  const attemptedProblemIds = prevAttempted
    ? state.attemptedProblemIds
    : Array.from(new Set([attempt.problemId, ...state.attemptedProblemIds])).slice(
        0,
        5000,
      );

  const completedProblemIds = attempt.correct
    ? Array.from(
        new Set([attempt.problemId, ...state.completedProblemIds]),
      ).slice(0, 5000)
    : state.completedProblemIds;

  const streak = calculateStreak(attempts);

  return {
    attempts,
    attemptedProblemIds,
    completedProblemIds,
    topicStats,
    streak,
  };
};

export const getTopicProgress = (
  state: ProgressState,
  topicId: string,
  totalProblems: number,
) => {
  const stat = state.topicStats[topicId];
  const solved = stat?.solved ?? 0;
  const correct = stat?.correct ?? 0;
  const attemptedRate =
    totalProblems === 0 ? 0 : Math.min(100, (solved / totalProblems) * 100);
  const masteryRate =
    totalProblems === 0 ? 0 : Math.min(100, (correct / totalProblems) * 100);
  const accuracyRate = solved === 0 ? 0 : Math.round((correct / solved) * 100);
  return { solved, correct, attemptedRate, masteryRate, accuracyRate };
};
