/**
 * Diagnostic question sampling (pure functions, client-safe).
 *
 * Stratified sampling by prerequisiteId with optional deterministic seeding.
 */

import type { DiagnosticQuestionFile } from "@/lib/content/schema";

export type SampledDiagnosticSession = {
  questions: DiagnosticQuestionFile[];
  sampleSize: number;
  seed?: number;
  allocationByPrerequisiteId: Record<string, number>;
};

function createRandom(seed?: number): () => number {
  if (seed === undefined) {
    return () => Math.random();
  }

  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function shuffleArray<T>(array: T[], rand: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function poolSeed(baseSeed: number, prerequisiteId: string): number {
  let hash = baseSeed >>> 0;
  for (let i = 0; i < prerequisiteId.length; i++) {
    hash = (hash * 31 + prerequisiteId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Allocate question counts per prerequisite using stratified proportional sampling.
 * Guarantees at least one per prerequisite when sampleSize >= prerequisite count.
 */
function allocateByPrerequisite(
  prerequisiteIds: string[],
  poolSizes: number[],
  sampleSize: number,
): Map<string, number> {
  const allocation = new Map<string, number>();
  for (const id of prerequisiteIds) allocation.set(id, 0);

  if (sampleSize <= 0 || prerequisiteIds.length === 0) return allocation;

  const totalPool = poolSizes.reduce((sum, size) => sum + size, 0);
  if (totalPool <= sampleSize) {
    for (let i = 0; i < prerequisiteIds.length; i++) {
      allocation.set(prerequisiteIds[i], poolSizes[i]);
    }
    return allocation;
  }

  const n = prerequisiteIds.length;
  let remaining = sampleSize;

  if (sampleSize >= n) {
    for (let i = 0; i < prerequisiteIds.length; i++) {
      if (poolSizes[i] > 0) {
        allocation.set(prerequisiteIds[i], 1);
        remaining -= 1;
      }
    }
  }

  if (remaining > 0) {
    const capacities = prerequisiteIds.map((id, i) => poolSizes[i] - (allocation.get(id) ?? 0));
    const totalCapacity = capacities.reduce((sum, cap) => sum + cap, 0);

    if (totalCapacity > 0) {
      const quotas = capacities.map((cap) => (remaining * cap) / totalCapacity);
      const floors = quotas.map((q) => Math.floor(q));
      let assigned = floors.reduce((sum, f) => sum + f, 0);
      const remainders = quotas
        .map((q, i) => ({ i, remainder: q - floors[i] }))
        .sort((a, b) => b.remainder - a.remainder);

      const extras = [...floors];
      let leftover = remaining - assigned;
      for (let k = 0; k < leftover && k < remainders.length; k++) {
        extras[remainders[k].i]++;
      }

      for (let i = 0; i < prerequisiteIds.length; i++) {
        const id = prerequisiteIds[i];
        const add = Math.min(extras[i], capacities[i]);
        allocation.set(id, (allocation.get(id) ?? 0) + add);
      }
    }
  } else if (sampleSize < n) {
    const quotas = poolSizes.map((size) => (sampleSize * size) / totalPool);
    const floors = quotas.map((q) => Math.floor(q));
    let assigned = floors.reduce((sum, f) => sum + f, 0);
    const remainders = quotas
      .map((q, i) => ({ i, remainder: q - floors[i] }))
      .sort((a, b) => b.remainder - a.remainder);

    const extras = [...floors];
    let leftover = sampleSize - assigned;
    for (let k = 0; k < leftover && k < remainders.length; k++) {
      extras[remainders[k].i]++;
    }

    for (let i = 0; i < prerequisiteIds.length; i++) {
      allocation.set(prerequisiteIds[i], Math.min(extras[i], poolSizes[i]));
    }
  }

  return allocation;
}

/**
 * Sample questions stratified by prerequisiteId.
 *
 * - Ensures at least one question per prerequisite when sampleSize allows.
 * - Allocates remaining slots proportionally to pool sizes.
 * - Fills or trims to the exact sampleSize.
 * - Uses a deterministic seeded shuffle when seed is provided; otherwise Math.random.
 */
export function sampleDiagnosticQuestions(
  questions: DiagnosticQuestionFile[],
  sampleSize: number,
  seed?: number,
): SampledDiagnosticSession {
  if (questions.length === 0 || sampleSize <= 0) {
    return {
      questions: [],
      sampleSize: 0,
      seed,
      allocationByPrerequisiteId: {},
    };
  }

  const effectiveSampleSize = Math.min(sampleSize, questions.length);
  const pools = new Map<string, DiagnosticQuestionFile[]>();

  for (const question of questions) {
    const pool = pools.get(question.prerequisiteId) ?? [];
    pool.push(question);
    pools.set(question.prerequisiteId, pool);
  }

  const prerequisiteIds = [...pools.keys()];
  const poolSizes = prerequisiteIds.map((id) => pools.get(id)!.length);
  const allocation = allocateByPrerequisite(prerequisiteIds, poolSizes, effectiveSampleSize);

  const shuffledPools = new Map<string, DiagnosticQuestionFile[]>();
  for (const id of prerequisiteIds) {
    const poolRand = createRandom(seed !== undefined ? poolSeed(seed, id) : undefined);
    shuffledPools.set(id, shuffleArray(pools.get(id)!, poolRand));
  }

  const selected: DiagnosticQuestionFile[] = [];
  const usedIds = new Set<string>();
  const allocationRecord: Record<string, number> = {};

  for (const id of prerequisiteIds) {
    const count = allocation.get(id) ?? 0;
    allocationRecord[id] = count;
    const pool = shuffledPools.get(id)!;

    for (let i = 0; i < count && i < pool.length; i++) {
      selected.push(pool[i]);
      usedIds.add(pool[i].id);
    }
  }

  if (selected.length < effectiveSampleSize) {
    const remaining = questions.filter((q) => !usedIds.has(q.id));
    const fillRand = createRandom(seed !== undefined ? seed + 1 : undefined);
    const shuffledRemaining = shuffleArray(remaining, fillRand);

    for (const question of shuffledRemaining) {
      if (selected.length >= effectiveSampleSize) break;
      selected.push(question);
      usedIds.add(question.id);
    }
  }

  const finalRand = createRandom(seed);
  const finalQuestions = shuffleArray(selected.slice(0, effectiveSampleSize), finalRand);

  return {
    questions: finalQuestions,
    sampleSize: effectiveSampleSize,
    seed,
    allocationByPrerequisiteId: allocationRecord,
  };
}