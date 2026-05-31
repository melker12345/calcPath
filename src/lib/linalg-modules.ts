import type { Topic } from "./shared-types";
import type { ModuleContent, ModuleSection, WorkedExample } from "./modules/types";

import {
  vectorsModule,
  matricesModule,
  systemsModule,
  spacesModule,
  eigenvaluesModule,
  determinantsModule,
  orthogonalityModule,
  symmetricMatricesModule
} from "./modules/linear-algebra";

export type { ModuleContent, ModuleSection, WorkedExample };

export const modules: ModuleContent[] = [
  vectorsModule,
  matricesModule,
  systemsModule,
  spacesModule,
  eigenvaluesModule,
  determinantsModule,
  orthogonalityModule,
  symmetricMatricesModule,
];
