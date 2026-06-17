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

/** Utility for tests: map a problem id to index (exposed for validation). */
export function resolveQuestionIndex(problemId: string): number | undefined {
  return getQuestionIndex(problemId);
}