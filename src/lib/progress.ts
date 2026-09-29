/**
 * Progress model, version 2.
 *
 * Progress lives in the browser only (localStorage, see progress-provider.tsx)
 * and can be exported and imported as a JSON file. It records three things:
 *
 *   - practice attempts, and the per-question / per-chapter counts derived
 *     from them (`attemptedProblemIds`, `completedProblemIds`, `topicStats`);
 *   - chapters the learner has marked as read (`readChapters`);
 *   - printable problem sets the learner has marked as done
 *     (`completedProblemSets`).
 *
 * Chapter and problem-set keys are `${subject}/${topicId}` (see `chapterKey`),
 * because a topic id alone is not unique across subjects. Question ids are
 * unique across the whole corpus, so attempts carry the bare question id.
 *
 * Version 1 (key `calc_progress_v1`) also stored test results, a day streak,
 * and two never-written chapter fields; `normalizeProgressState` accepts a v1
 * blob and drops those.
 */

export type Attempt = {
  problemId: string;
  topicId: string;
  correct: boolean;
  createdAt: string;
};

export type TopicStat = { solved: number; correct: number };

export type ProgressState = {
  attempts: Attempt[];
  /** Unique question ids attempted at least once. */
  attemptedProblemIds: string[];
  /** Unique question ids answered correctly at least once. */
  completedProblemIds: string[];
  /** Per topic id: unique questions attempted (`solved`) and answered correctly. */
  topicStats: Record<string, TopicStat>;
  /** `${subject}/${topicId}` of every chapter marked as read. */
  readChapters: string[];
  /** `${subject}/${topicId}` of every problem set marked as done. */
  completedProblemSets: string[];
};

export const chapterKey = (subject: string, topicId: string): string => `${subject}/${topicId}`;

export const createEmptyProgress = (): ProgressState => ({
  attempts: [],
  attemptedProblemIds: [],
  completedProblemIds: [],
  topicStats: {},
  readChapters: [],
  completedProblemSets: [],
});

/**
 * Hard size caps applied when normalizing an (untrusted) progress state, e.g.
 * an imported file. All are generously above what the app itself produces, so
 * legitimate data is never truncated; only abusive payloads are.
 */
const MAX_ATTEMPTS = 5000;
const MAX_PROBLEM_IDS = 5000;
const MAX_KEYS = 2000;
const MAX_KEY_LENGTH = 200;

const normalizeKeyList = (input: unknown): string[] => {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of input) {
    if (typeof value !== "string") continue;
    const key = value.trim().slice(0, MAX_KEY_LENGTH);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= MAX_KEYS) break;
  }
  return out;
};

const normalizeAttempt = (input: unknown): Attempt | null => {
  if (!input || typeof input !== "object") return null;
  const a = input as Record<string, unknown>;
  if (typeof a.problemId !== "string" || typeof a.topicId !== "string") return null;
  if (typeof a.correct !== "boolean") return null;
  const createdAt = typeof a.createdAt === "string" ? a.createdAt : new Date(0).toISOString();
  return {
    problemId: a.problemId.slice(0, MAX_KEY_LENGTH),
    topicId: a.topicId.slice(0, MAX_KEY_LENGTH),
    correct: a.correct,
    createdAt: createdAt.slice(0, 64),
  };
};

const normalizeTopicStats = (input: unknown): Record<string, TopicStat> => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, TopicStat> = {};
  let count = 0;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    const solved = typeof v.solved === "number" && Number.isFinite(v.solved) ? Math.max(0, Math.floor(v.solved)) : 0;
    const correct = typeof v.correct === "number" && Number.isFinite(v.correct) ? Math.max(0, Math.floor(v.correct)) : 0;
    out[key.slice(0, MAX_KEY_LENGTH)] = { solved, correct: Math.min(correct, solved) };
    count += 1;
    if (count >= MAX_KEYS) break;
  }
  return out;
};

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

  const topicStats: Record<string, TopicStat> = {};
  for (const [topicId, set] of attemptedByTopic.entries()) {
    topicStats[topicId] = {
      solved: set.size,
      correct: completedByTopic.get(topicId)?.size ?? 0,
    };
  }

  return {
    attemptedProblemIds: Array.from(attempted).slice(0, MAX_PROBLEM_IDS),
    completedProblemIds: Array.from(completed).slice(0, MAX_PROBLEM_IDS),
    topicStats,
  };
};

/**
 * Turn any stored or imported blob (v1, v2, or garbage) into a valid v2 state.
 * When attempts are present the derived fields are rebuilt from them, so an
 * edited file cannot claim questions it never answered.
 */
export const normalizeProgressState = (input: unknown): ProgressState => {
  const empty = createEmptyProgress();
  if (!input || typeof input !== "object" || Array.isArray(input)) return empty;
  const raw = input as Record<string, unknown>;

  const attempts = Array.isArray(raw.attempts)
    ? raw.attempts.map(normalizeAttempt).filter((a): a is Attempt => a !== null).slice(0, MAX_ATTEMPTS)
    : [];
  const readChapters = normalizeKeyList(raw.readChapters);
  const completedProblemSets = normalizeKeyList(raw.completedProblemSets);

  if (attempts.length > 0) {
    const derived = rebuildDerivedFields(attempts);
    return {
      attempts,
      attemptedProblemIds: derived.attemptedProblemIds,
      completedProblemIds: derived.completedProblemIds,
      topicStats: derived.topicStats,
      readChapters,
      completedProblemSets,
    };
  }

  return {
    attempts,
    attemptedProblemIds: normalizeKeyList(raw.attemptedProblemIds).slice(0, MAX_PROBLEM_IDS),
    completedProblemIds: normalizeKeyList(raw.completedProblemIds).slice(0, MAX_PROBLEM_IDS),
    topicStats: normalizeTopicStats(raw.topicStats),
    readChapters,
    completedProblemSets,
  };
};

export const recordAttempt = (state: ProgressState, attempt: Attempt): ProgressState => {
  const prevAttempted = state.attemptedProblemIds.includes(attempt.problemId);
  const prevCompleted = state.completedProblemIds.includes(attempt.problemId);

  const attempts = [attempt, ...state.attempts].slice(0, MAX_ATTEMPTS);
  const topicStats = { ...state.topicStats };
  const stat = { ...(topicStats[attempt.topicId] ?? { solved: 0, correct: 0 }) };

  // solved = unique attempted questions in the topic
  if (!prevAttempted) stat.solved += 1;
  // correct = unique correctly answered questions in the topic
  if (attempt.correct && !prevCompleted) stat.correct += 1;
  topicStats[attempt.topicId] = stat;

  const attemptedProblemIds = prevAttempted
    ? state.attemptedProblemIds
    : [attempt.problemId, ...state.attemptedProblemIds].slice(0, MAX_PROBLEM_IDS);

  const completedProblemIds =
    attempt.correct && !prevCompleted
      ? [attempt.problemId, ...state.completedProblemIds].slice(0, MAX_PROBLEM_IDS)
      : state.completedProblemIds;

  return {
    ...state,
    attempts,
    attemptedProblemIds,
    completedProblemIds,
    topicStats,
  };
};

/** Add `key` to the list if absent, remove it if present. */
export const toggleKey = (list: string[], key: string): string[] =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key].slice(-MAX_KEYS);

export const toggleChapterRead = (state: ProgressState, key: string): ProgressState => ({
  ...state,
  readChapters: toggleKey(state.readChapters, key),
});

export const toggleProblemSetDone = (state: ProgressState, key: string): ProgressState => ({
  ...state,
  completedProblemSets: toggleKey(state.completedProblemSets, key),
});

export const isChapterRead = (state: ProgressState, subject: string, topicId: string): boolean =>
  state.readChapters.includes(chapterKey(subject, topicId));

export const isProblemSetDone = (state: ProgressState, subject: string, topicId: string): boolean =>
  state.completedProblemSets.includes(chapterKey(subject, topicId));

/**
 * Questions answered correctly in a topic, from the per-topic counter, capped
 * at the topic's current size so questions removed from the bank never push a
 * chapter past 100%. Needs no question ids, so it is what the overview uses.
 */
export const countCorrectInTopic = (state: ProgressState, topicId: string, total: number): number =>
  Math.min(state.topicStats[topicId]?.correct ?? 0, total);

export const getTopicProgress = (state: ProgressState, topicId: string, totalProblems: number) => {
  const stat = state.topicStats[topicId];
  const solved = stat?.solved ?? 0;
  const correct = stat?.correct ?? 0;
  const attemptedRate = totalProblems === 0 ? 0 : Math.min(100, (solved / totalProblems) * 100);
  const solvedRate = totalProblems === 0 ? 0 : Math.min(100, (correct / totalProblems) * 100);
  const accuracyRate = solved === 0 ? 0 : Math.round((correct / solved) * 100);
  return { solved, correct, attemptedRate, solvedRate, accuracyRate };
};

/**
 * Practice progress for a topic, computed exactly from question ids: pass the
 * topic's questions (only `id` and `topicId` are read).
 */
export const getPracticeProgress = (
  state: ProgressState,
  topicId: string,
  practiceProblems: Array<{ id: string; topicId: string }>,
) => {
  const topicIds = new Set(practiceProblems.filter((p) => p.topicId === topicId).map((p) => p.id));
  const total = topicIds.size;
  const attempted = state.attemptedProblemIds.filter((id) => topicIds.has(id)).length;
  const correct = state.completedProblemIds.filter((id) => topicIds.has(id)).length;
  const attemptedRate = total === 0 ? 0 : Math.min(100, (attempted / total) * 100);
  const solvedRate = total === 0 ? 0 : Math.min(100, (correct / total) * 100);
  const accuracyRate = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
  return {
    attempted,
    correct,
    total,
    attemptedRate,
    solvedRate,
    accuracyRate,
    // An empty topic never reports as complete.
    isComplete: total > 0 && correct >= total,
  };
};

/** Same as getPracticeProgress, for one section of a topic. */
export const getSectionPracticeProgress = (
  state: ProgressState,
  topicId: string,
  section: string,
  practiceProblems: Array<{ id: string; topicId: string; section?: string }>,
) => {
  const sectionIds = new Set(
    practiceProblems.filter((p) => p.topicId === topicId && p.section === section).map((p) => p.id),
  );
  const total = sectionIds.size;
  const attempted = state.attemptedProblemIds.filter((id) => sectionIds.has(id)).length;
  const correct = state.completedProblemIds.filter((id) => sectionIds.has(id)).length;
  const attemptedRate = total === 0 ? 0 : Math.min(100, (attempted / total) * 100);
  const solvedRate = total === 0 ? 0 : Math.min(100, (correct / total) * 100);
  const accuracyRate = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
  return { attempted, correct, total, attemptedRate, solvedRate, accuracyRate, isComplete: total > 0 && correct >= total };
};

/** Count of correct answers over a set of question ids (exact, id-based). */
export const countCorrectIn = (state: ProgressState, ids: readonly string[]): number => {
  if (ids.length === 0) return 0;
  const done = new Set(state.completedProblemIds);
  let n = 0;
  for (const id of ids) if (done.has(id)) n += 1;
  return n;
};
