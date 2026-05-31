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
export { probabilityModule } from "./probability";
export { discreteDistributionsModule } from "./discrete-distributions";
export { estimationModule } from "./estimation";
export { regressionModule } from "./regression";

// TODO: extract remaining 5 topics
// export { continuousDistributionsModule } from "./continuous-distributions";
// export { samplingModule } from "./sampling";
// export { hypothesisTestingModule } from "./hypothesis-testing";
// export { anovaModule } from "./anova";
// export { nonparametricModule } from "./nonparametric";

// When complete:
// export const statisticsModules: ModuleContent[] = [
//   descriptiveModule,
//   probabilityModule,
//   ...
// ];

export const statisticsModules: ModuleContent[] = []; // Populated during migration
