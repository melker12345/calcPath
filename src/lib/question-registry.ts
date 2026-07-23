import registryData from "./question-registry.json";

export type QuestionRegistryEntry = { id: string; topicId: string };

export type QuestionRegistry = {
  version: number;
  entries: QuestionRegistryEntry[];
};

const registry = registryData as QuestionRegistry;

const idToIndex = new Map(registry.entries.map((entry, index) => [entry.id, index]));

export function getQuestionRegistry(): QuestionRegistry {
  return registry;
}

export function getQuestionIndex(problemId: string): number | undefined {
  return idToIndex.get(problemId);
}

export function getQuestionEntry(index: number): QuestionRegistryEntry | undefined {
  return registry.entries[index];
}