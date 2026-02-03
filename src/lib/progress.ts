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
  completedProblemIds: string[];
  topicStats: Record<string, { solved: number; correct: number }>;
  streak: StreakStats;
};

export const createEmptyProgress = (): ProgressState => ({
  attempts: [],
  completedProblemIds: [],
  topicStats: {},
  streak: { current: 0, longest: 0 },
});

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
  const attempts = [attempt, ...state.attempts].slice(0, 5000);
  const topicStats = { ...state.topicStats };
  const stat = topicStats[attempt.topicId] ?? { solved: 0, correct: 0 };
  if (!state.completedProblemIds.includes(attempt.problemId)) {
    stat.solved += 1;
  }
  if (attempt.correct) {
    stat.correct += 1;
  }
  topicStats[attempt.topicId] = stat;

  const completedProblemIds = attempt.correct
    ? Array.from(
        new Set([attempt.problemId, ...state.completedProblemIds]),
      ).slice(0, 5000)
    : state.completedProblemIds;

  const streak = calculateStreak(attempts);

  return {
    attempts,
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
  const completionRate =
    totalProblems === 0 ? 0 : Math.min(100, (solved / totalProblems) * 100);
  const accuracyRate = solved === 0 ? 0 : Math.round((correct / solved) * 100);
  return { solved, correct, completionRate, accuracyRate };
};
