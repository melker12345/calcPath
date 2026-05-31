/**
 * Calculus module content
 *
 * This barrel will eventually export the combined list of all calculus modules
 * after we finish splitting them out of the original monolithic file.
 *
 * Current status: Placeholder during the content-scalability refactor.
 */

import type { ModuleContent } from "../types";

// Re-export types for convenience within the calculus folder
export type { ModuleContent, ModuleSection, WorkedExample } from "../types";

// Successfully extracted modules (real content, wired in main modules.ts)
// Extracted topics (6 out of 8)
export { limitsModule } from "./limits";
export { derivativesModule } from "./derivatives";
export { integralsModule } from "./integrals";
export { applicationsModule } from "./applications";
export { seriesModule } from "./series";
export { differentialEquationsModule } from "./differential-equations";

// TODO: extract the last two
// export { applicationsOfIntegrationModule } from "./applications-of-integration";
// export { multivariableModule } from "./multivariable";

// Note: Other topics still live in the original modules.ts for now.
// They will be extracted one by one in future commits on this branch.


// When migration is complete this will become:
// export const calculusModules: ModuleContent[] = [
//   limitsModule,
//   derivativesModule,
//   ...
// ];

export const calculusModules: ModuleContent[] = []; // TODO: populate with real modules during split
