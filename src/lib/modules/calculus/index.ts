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

// Placeholders (content will be filled during migration)
export { limitsModule } from "./limits";
export { derivativesModule } from "./derivatives";
export { integralsModule } from "./integrals";
export { applicationsModule } from "./applications";
export { seriesModule } from "./series";
export { differentialEquationsModule } from "./differential-equations";
export { applicationsOfIntegrationModule } from "./applications-of-integration";
export { multivariableModule } from "./multivariable";

// When migration is complete this will become:
// export const calculusModules: ModuleContent[] = [
//   limitsModule,
//   derivativesModule,
//   ...
// ];

export const calculusModules: ModuleContent[] = []; // TODO: populate with real modules during split
