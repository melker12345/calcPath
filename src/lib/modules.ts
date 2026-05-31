import type { Topic } from "@/lib/shared-types";
import { 
  limitsModule, 
  derivativesModule, 
  integralsModule, 
  applicationsModule, 
  seriesModule, 
  differentialEquationsModule,
  applicationsOfIntegrationModule,
  multivariableModule,
} from "./modules/calculus";


export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
  /**
   * Stable slug used for progress tracking and deep links.
   * MUST match the `section` field on the corresponding questions exactly
   * (e.g. "squeeze", "lhopital", "chain", "gauss", "confidence-intervals").
   * When present, the dashboard and practice pages can show accurate per-section progress.
   */
  section?: string;
  body: string[];
  /** Optional "Explain Like I'm 5" — simpler, intuition-based explanation */
  eli5?: string[];
  /** Inline worked examples for this section (1-2 detailed examples) */
  examples?: WorkedExample[];
};

export type ModuleContent = {
  topicId: Topic["id"];
  title: string;
  intro: string[];
  sections: ModuleSection[];
  examples: {
    title: string;
    steps: string[];
  }[];
  commonMistakes: string[];
};

export const modules: ModuleContent[] = [
  limitsModule,  // extracted
  derivativesModule,  // extracted
  integralsModule,  // extracted
  applicationsModule,  // extracted
  seriesModule,  // extracted
  differentialEquationsModule,  // extracted
  applicationsOfIntegrationModule,  // extracted
  multivariableModule,  // extracted
];
