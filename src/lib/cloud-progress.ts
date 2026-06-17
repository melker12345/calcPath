import type { DiagnosticResult, DiagnosticPrerequisiteSummary } from "@/lib/diagnostics";
import {
  createEmptyProgress,
  normalizeProgressState,
  type ProgressState,
  type TestResult,
} from "@/lib/progress";
import {
  getQuestionEntry,
  getQuestionIndex,
  getQuestionRegistry,
} from "@/lib/question-registry";

/** 2 bits per question: 00 unattempted, 01 wrong, 10 correct */
const BITS_PER_QUESTION = 2;
const STATE_UNATTEMPTED = 0;
const STATE_WRONG = 1;
const STATE_CORRECT = 2;

export type CloudTestResult = {
  testId: string;
  topicScores: Array<{ topicId: string; correct: number; total: number }>;
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  completedAt: string;
};

export type CloudDiagnosticSummary = {
  targetSubject: string;
  completedAt: string;
  score?: number;
  total?: number;
  prerequisites: Array<{ id: string; correct: number; total: number }>;
};

export type CloudProgressBlob = {
  v: 1;
  registryVersion: number;
  practiceBits: string;
  completedModuleIds: string[];
  moduleCompletions: Record<string, string>;
  testResults: CloudTestResult[];
  diagnostics: CloudDiagnosticSummary[];
};

function encodeBits(states: number[]): string {
  const totalBits = states.length * BITS_PER_QUESTION;
  const byteLen = Math.ceil(totalBits / 8);
  const bytes = new Uint8Array(byteLen);
  for (let i = 0; i < states.length; i++) {
    const bitOffset = i * BITS_PER_QUESTION;
    const value = states[i] & 0b11;
    for (let b = 0; b < BITS_PER_QUESTION; b++) {
      const bitIndex = bitOffset + b;
      if ((value >> b) & 1) {
        bytes[bitIndex >> 3] |= 1 << (bitIndex & 7);
      }
    }
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBits(base64: string, questionCount: number): number[] {
  let bytes: Uint8Array;
  if (typeof Buffer !== "undefined") {
    bytes = new Uint8Array(Buffer.from(base64, "base64"));
  } else {
    const binary = atob(base64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  }

  const states: number[] = [];
  for (let i = 0; i < questionCount; i++) {
    let value = 0;
    for (let b = 0; b < BITS_PER_QUESTION; b++) {
      const bitIndex = i * BITS_PER_QUESTION + b;
      const byte = bytes[bitIndex >> 3] ?? 0;
      if ((byte >> (bitIndex & 7)) & 1) value |= 1 << b;
    }
    states.push(value);
  }
  return states;
}

function practiceStateForId(
  problemId: string,
  attempted: Set<string>,
  completed: Set<string>,
): number {
  if (completed.has(problemId)) return STATE_CORRECT;
  if (attempted.has(problemId)) return STATE_WRONG;
  return STATE_UNATTEMPTED;
}

export function serializeProgressToCloud(state: ProgressState): CloudProgressBlob {
  const registry = getQuestionRegistry();
  const attempted = new Set(state.attemptedProblemIds);
  const completed = new Set(state.completedProblemIds);

  const states = registry.entries.map((entry) =>
    practiceStateForId(entry.id, attempted, completed),
  );

  const testResults: CloudTestResult[] = (state.testResults ?? []).map((result) => ({
    testId: result.testId ?? result.topicId,
    topicScores:
      result.topicScores ??
      [{ topicId: result.topicId, correct: result.score, total: result.total }],
    score: result.score,
    total: result.total,
    percentage: result.percentage,
    timeSeconds: result.timeSeconds,
    completedAt: result.completedAt,
  }));

  const latestDiagnosticBySubject = new Map<string, DiagnosticResult>();
  for (const diag of state.diagnostics ?? []) {
    if (diag.mode !== "prerequisite" || !diag.targetSubject) continue;
    const prev = latestDiagnosticBySubject.get(diag.targetSubject);
    if (!prev || diag.completedAt > prev.completedAt) {
      latestDiagnosticBySubject.set(diag.targetSubject, diag);
    }
  }

  const diagnostics: CloudDiagnosticSummary[] = [];
  for (const [targetSubject, diag] of latestDiagnosticBySubject) {
    const summaries = diag.prerequisiteSummaries ?? [];
    diagnostics.push({
      targetSubject,
      completedAt: diag.completedAt,
      score: diag.score,
      total: diag.total,
      prerequisites: summaries.map((s) => ({
        id: s.prerequisite.id,
        correct: s.correct,
        total: s.total,
      })),
    });
  }

  return {
    v: 1,
    registryVersion: registry.version,
    practiceBits: encodeBits(states),
    completedModuleIds: state.completedModuleIds ?? [],
    moduleCompletions: state.moduleCompletions ?? {},
    testResults,
    diagnostics,
  };
}

function summariesFromCloud(
  summary: CloudDiagnosticSummary,
  prerequisitesBySubject: Map<string, DiagnosticPrerequisiteSummary["prerequisite"][]>,
): DiagnosticPrerequisiteSummary[] {
  return summary.prerequisites.map((p) => {
    const percentage = p.total === 0 ? null : Math.round((p.correct / p.total) * 100);
    const known = prerequisitesBySubject.get(summary.targetSubject)?.find((x) => x.id === p.id);
    const prerequisite = known ?? {
      id: p.id,
      label: p.id,
      description: "",
    };
    let status: DiagnosticPrerequisiteSummary["status"] = "not-tested";
    if (percentage !== null) {
      if (percentage >= 80) status = "strong";
      else if (percentage >= 60) status = "ready";
      else if (percentage >= 30) status = "needs-review";
      else status = "weak";
    }
    return {
      prerequisite,
      correct: p.correct,
      total: p.total,
      percentage,
      status,
    };
  });
}

export function deserializeCloudToProgress(blob: CloudProgressBlob): ProgressState {
  const registry = getQuestionRegistry();
  const states = decodeBits(blob.practiceBits, registry.entries.length);

  const attemptedProblemIds: string[] = [];
  const completedProblemIds: string[] = [];
  const topicStats: ProgressState["topicStats"] = {};

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (state === STATE_UNATTEMPTED) continue;
    const entry = getQuestionEntry(i);
    if (!entry) continue;
    attemptedProblemIds.push(entry.id);
    const stat = topicStats[entry.topicId] ?? { solved: 0, correct: 0 };
    stat.solved += 1;
    if (state === STATE_CORRECT) {
      completedProblemIds.push(entry.id);
      stat.correct += 1;
    }
    topicStats[entry.topicId] = stat;
  }

  const testResults: TestResult[] = (blob.testResults ?? []).map((result) => {
    const primary = result.topicScores[0];
    return {
      testId: result.testId,
      topicId: primary?.topicId ?? result.testId,
      topicScores: result.topicScores,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      timeSeconds: result.timeSeconds,
      completedAt: result.completedAt,
    };
  });

  const diagnostics: DiagnosticResult[] = (blob.diagnostics ?? []).map((summary) => ({
    mode: "prerequisite" as const,
    targetSubject: summary.targetSubject,
    completedAt: summary.completedAt,
    score: summary.score,
    total: summary.total,
    questionResults: [],
    prerequisiteSummaries: summariesFromCloud(summary, new Map()),
  }));

  const empty = createEmptyProgress();
  return normalizeProgressState({
    attempts: [],
    attemptedProblemIds,
    completedProblemIds,
    completedModuleIds: blob.completedModuleIds ?? [],
    moduleCompletions: blob.moduleCompletions ?? {},
    topicStats,
    testResults,
    diagnostics,
    streak: empty.streak,
  });
}

/** Count practice questions whose 2-bit state differs between blobs. */
export function countPracticeDiff(a: CloudProgressBlob, b: CloudProgressBlob): number {
  const registry = getQuestionRegistry();
  const statesA = decodeBits(a.practiceBits, registry.entries.length);
  const statesB = decodeBits(b.practiceBits, registry.entries.length);
  let diff = 0;
  for (let i = 0; i < statesA.length; i++) {
    if (statesA[i] !== statesB[i]) diff++;
  }
  return diff;
}

/** Build a template blob with the first `fraction` of registry questions marked correct. */
export function buildTemplateBlob(fraction: number): CloudProgressBlob {
  const registry = getQuestionRegistry();
  const targetCorrect = Math.floor(registry.entries.length * fraction);
  const states = registry.entries.map((_, i) =>
    i < targetCorrect ? STATE_CORRECT : STATE_UNATTEMPTED,
  );
  return {
    v: 1,
    registryVersion: registry.version,
    practiceBits: encodeBits(states),
    completedModuleIds: [],
    moduleCompletions: {},
    testResults: [],
    diagnostics: [],
  };
}

/** Diff count between a live ProgressState and a stored cloud blob. */
export function countProgressDiffFromState(
  state: ProgressState,
  stored: CloudProgressBlob,
): number {
  return countPracticeDiff(serializeProgressToCloud(state), stored);
}

export type BlobComparison = {
  /** Questions answered correctly in `local` but not (yet) correct in `db`. */
  localOnlyCorrect: number;
  /** Questions answered correctly in `db` but not (yet) correct in `local`. */
  dbOnlyCorrect: number;
  direction: "local-ahead" | "db-ahead" | "diverged" | "same";
};

/**
 * Compare two blobs by their *correct* answer sets to decide which side is
 * further ahead. This is the basis for safe, non-destructive sync: neither side
 * should ever silently lose a completed question.
 */
export function compareCloudBlobs(
  local: CloudProgressBlob,
  db: CloudProgressBlob,
): BlobComparison {
  const registry = getQuestionRegistry();
  const n = registry.entries.length;
  const a = decodeBits(local.practiceBits, n);
  const b = decodeBits(db.practiceBits, n);

  let localOnlyCorrect = 0;
  let dbOnlyCorrect = 0;
  for (let i = 0; i < n; i++) {
    const la = a[i] ?? STATE_UNATTEMPTED;
    const lb = b[i] ?? STATE_UNATTEMPTED;
    if (la === STATE_CORRECT && lb !== STATE_CORRECT) localOnlyCorrect++;
    if (lb === STATE_CORRECT && la !== STATE_CORRECT) dbOnlyCorrect++;
  }

  let direction: BlobComparison["direction"];
  if (localOnlyCorrect === 0 && dbOnlyCorrect === 0) direction = "same";
  else if (dbOnlyCorrect === 0) direction = "local-ahead";
  else if (localOnlyCorrect === 0) direction = "db-ahead";
  else direction = "diverged";

  return { localOnlyCorrect, dbOnlyCorrect, direction };
}

function mergeTestResults(
  a: CloudTestResult[] = [],
  b: CloudTestResult[] = [],
): CloudTestResult[] {
  const byKey = new Map<string, CloudTestResult>();
  for (const result of [...a, ...b]) {
    if (!result) continue;
    const key = `${result.testId}|${result.completedAt}`;
    const prev = byKey.get(key);
    // Keep the better score if the same test/timestamp shows up on both sides.
    if (!prev || result.percentage > prev.percentage) byKey.set(key, result);
  }
  return Array.from(byKey.values())
    .sort((x, y) => (x.completedAt < y.completedAt ? 1 : -1))
    .slice(0, 100);
}

function mergeDiagnostics(
  a: CloudDiagnosticSummary[] = [],
  b: CloudDiagnosticSummary[] = [],
): CloudDiagnosticSummary[] {
  const latestBySubject = new Map<string, CloudDiagnosticSummary>();
  for (const diag of [...a, ...b]) {
    if (!diag) continue;
    const prev = latestBySubject.get(diag.targetSubject);
    if (!prev || diag.completedAt > prev.completedAt) {
      latestBySubject.set(diag.targetSubject, diag);
    }
  }
  return Array.from(latestBySubject.values());
}

function mergeModuleCompletions(
  a: Record<string, string> = {},
  b: Record<string, string> = {},
): Record<string, string> {
  const out: Record<string, string> = { ...b };
  for (const [moduleId, completedAt] of Object.entries(a)) {
    const existing = out[moduleId];
    // Earliest completion wins — a module stays "first completed when it was".
    if (!existing || completedAt < existing) out[moduleId] = completedAt;
  }
  return out;
}

/**
 * Convergent (monotonic) merge of two backup blobs. Completion only ever grows:
 * per question we keep the strongest state (correct > wrong > unattempted), and
 * we union modules / test history / diagnostics. This makes both "push to cloud"
 * and "pull from cloud" non-destructive regardless of which side is ahead.
 */
export function mergeCloudBlobs(
  a: CloudProgressBlob,
  b: CloudProgressBlob,
): CloudProgressBlob {
  const registry = getQuestionRegistry();
  const n = registry.entries.length;
  const sa = decodeBits(a.practiceBits, n);
  const sb = decodeBits(b.practiceBits, n);

  const merged = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    merged[i] = Math.max(sa[i] ?? STATE_UNATTEMPTED, sb[i] ?? STATE_UNATTEMPTED);
  }

  const completedModuleIds = Array.from(
    new Set([...(a.completedModuleIds ?? []), ...(b.completedModuleIds ?? [])]),
  );

  return {
    v: 1,
    registryVersion: Math.max(
      a.registryVersion ?? registry.version,
      b.registryVersion ?? registry.version,
    ),
    practiceBits: encodeBits(merged),
    completedModuleIds,
    moduleCompletions: mergeModuleCompletions(a.moduleCompletions, b.moduleCompletions),
    testResults: mergeTestResults(a.testResults, b.testResults),
    diagnostics: mergeDiagnostics(a.diagnostics, b.diagnostics),
  };
}

/**
 * True when `merged` carries no new information beyond `stored` — used to skip
 * pointless writes (and as cheap spam protection on the update endpoint).
 */
export function blobIsSupersetOf(
  merged: CloudProgressBlob,
  stored: CloudProgressBlob,
): boolean {
  return (
    merged.practiceBits === stored.practiceBits &&
    merged.testResults.length === (stored.testResults?.length ?? 0) &&
    merged.diagnostics.length === (stored.diagnostics?.length ?? 0) &&
    merged.completedModuleIds.length === (stored.completedModuleIds?.length ?? 0)
  );
}

/** Utility for tests: map a problem id to index (exposed for validation). */
export function resolveQuestionIndex(problemId: string): number | undefined {
  return getQuestionIndex(problemId);
}