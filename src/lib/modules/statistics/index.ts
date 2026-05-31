/**
 * Statistics module content
 *
 * This barrel will export the combined list of all statistics modules
 * after we finish splitting them out of the original monolithic statistics-modules.ts.
 *
 * Following the established pattern from Calculus and Linear Algebra.
 */

import type { ModuleContent } from "../types";

// Re-export types for convenience
export type { ModuleContent, ModuleSection, WorkedExample } from "../types";

// Extracted topics
export { descriptiveModule } from "./descriptive";

// TODO: extract remaining 9 topics
// export { probabilityModule } from "./probability";
// ... etc

// When complete:
// export const statisticsModules: ModuleContent[] = [
//   descriptiveModule,
//   probabilityModule,
//   ...
// ];

export const statisticsModules: ModuleContent[] = []; // Populated during migration
