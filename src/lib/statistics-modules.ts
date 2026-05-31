import type { Topic } from "./shared-types";
import type { ModuleContent, ModuleSection, WorkedExample } from "./modules/types";

import {
  descriptiveModule,
  probabilityModule,
  discreteDistributionsModule,
  estimationModule,
  regressionModule,
  continuousDistributionsModule,
  samplingModule,
  hypothesisTestingModule,
  anovaModule,
  nonparametricModule
} from "./modules/statistics";

export type { ModuleContent, ModuleSection, WorkedExample };

export const modules: ModuleContent[] = [
  descriptiveModule,  // extracted
  probabilityModule,  // extracted
  discreteDistributionsModule,  // extracted
  estimationModule,  // extracted
  regressionModule,  // extracted
  continuousDistributionsModule,  // extracted
  samplingModule,  // extracted
  hypothesisTestingModule,  // extracted
  anovaModule,  // extracted
  nonparametricModule,  // extracted
;
