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

// When splitting is complete, this will look like:
// import { limitsModule } from "./limits";
// ...
// export const calculusModules: ModuleContent[] = [ limitsModule, ... ];

export const calculusModules: ModuleContent[] = []; // Populated during migration from monolithic file
