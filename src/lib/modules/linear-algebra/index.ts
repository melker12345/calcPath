/**
 * Linear Algebra module content
 *
 * This barrel will export the combined list of all linear algebra modules
 * after we finish splitting them out of the original monolithic linalg-modules.ts.
 *
 * Following the same pattern established for Calculus.
 */

import type { ModuleContent } from "../types";

// Re-export types for convenience
export type { ModuleContent, ModuleSection, WorkedExample } from "../types";

// Extracted topics
export { vectorsModule } from "./vectors";
export { matricesModule } from "./matrices";
export { systemsModule } from "./systems";
export { spacesModule } from "./spaces";
export { eigenvaluesModule } from "./eigenvalues";
export { determinantsModule } from "./determinants";
export { orthogonalityModule } from "./orthogonality";
export { symmetric_matricesModule as symmetricMatricesModule } from "./symmetric-matrices";

// When complete, this will become something like:
// export const linearAlgebraModules: ModuleContent[] = [
//   vectorsModule,
//   matricesModule,
//   ...
// ];

export const linearAlgebraModules: ModuleContent[] = []; // Will be populated during migration
