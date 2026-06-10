// Legacy shim (deprecated). All content now lives in content/ + loader + adapters.
// No active imports remain; this exists only to avoid resolution surprises during final cleanup.
export const topics: any[] = [];
export const problems: any[] = [];
export function getModuleSectionTitle() { return null; }
export function getModuleSectionUrl() { return null; }
export type { ProblemType, Problem, Topic } from "./shared-types";
