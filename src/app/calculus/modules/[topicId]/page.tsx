"use client";

import { useEffect, useState } from "react";
import { modules as legacyModules } from "@/lib/modules";
import { topics as legacyTopics } from "@/lib/calculus-content";
import { SubjectModulePage } from "@/components/subject-module-page";
import type { ModuleContent } from "@/lib/modules/types";
import type { Topic } from "@/lib/shared-types";

/**
 * PHASE 1 EVOLUTIONARY INTEGRATION — CALCULUS MODULE PAGE (minimal demo)
 *
 * This is the *only* change needed in the real page to source explanation data
 * (ModuleContent + Topics) from the new canonical `content/calculus/` via the adapter.
 *
 * - SubjectModulePage and all its children are 100% untouched.
 * - The data shape fed to it is identical (legacy ModuleContent).
 * - Fallback to the (now shimmed) legacy imports is automatic and silent.
 * - Reversible in one step: delete the useEffect + dynamic state lines; always use legacy* .
 *
 * See src/lib/content/adapters.ts for the full documented transition pattern
 * and the getLegacyModulesAndTopicsForSubject helper (the enabler of this tiny diff).
 */

/* ── FAQ data per topic (SEO-targeted questions people actually Google) ── */
const topicFaqs: Record<string, { q: string; a: string }[]> = {
  limits: [
    { q: "What is a limit in calculus?", a: "A limit describes the value a function approaches as its input gets closer to a specific point. Limits are the foundation of both derivatives and integrals." },
    { q: "How do you evaluate a limit?", a: "Start with direct substitution. If that gives an indeterminate form like 0/0, try factoring, rationalizing, or applying L'Hôpital's rule." },
    { q: "What is L'Hôpital's rule?", a: "L'Hôpital's rule states that if a limit gives 0/0 or ∞/∞, you can differentiate the numerator and denominator separately and re-evaluate the limit." },
  ],
  derivatives: [
    { q: "What is a derivative in calculus?", a: "A derivative measures how fast a function is changing at any given point. Geometrically, it equals the slope of the tangent line to the curve at that point." },
    { q: "What is the chain rule?", a: "The chain rule differentiates composite functions. If y = f(g(x)), then dy/dx = f'(g(x)) · g'(x). It's essential for nested functions." },
    { q: "What is the power rule?", a: "The power rule states that the derivative of x^n is n·x^(n-1). It's the most commonly used differentiation rule in calculus." },
  ],
  applications: [
    { q: "What is optimization in calculus?", a: "Optimization uses derivatives to find the maximum or minimum value of a function. Common applications include maximizing area, minimizing cost, and finding shortest paths." },
    { q: "What are related rates problems?", a: "Related rates problems involve finding how fast one quantity is changing given the rate of change of another related quantity, using implicit differentiation with respect to time." },
    { q: "How do you find critical points?", a: "Set the first derivative equal to zero and solve. Critical points are where the function may have a local maximum, minimum, or inflection point." },
  ],
  integrals: [
    { q: "What is an integral in calculus?", a: "An integral computes the accumulated area under a curve. Definite integrals give a numerical value, while indefinite integrals give a family of antiderivative functions." },
    { q: "What is u-substitution?", a: "U-substitution is an integration technique where you replace part of the integrand with a new variable u to simplify the expression into a standard form you can integrate." },
    { q: "What is the difference between definite and indefinite integrals?", a: "A definite integral has upper and lower bounds and evaluates to a number (the net area). An indefinite integral has no bounds and gives a general antiderivative plus a constant C." },
  ],
  series: [
    { q: "What is a series in calculus?", a: "A series is the sum of the terms of a sequence. An infinite series adds up infinitely many terms and may converge to a finite value or diverge to infinity." },
    { q: "How do you test if a series converges?", a: "Common convergence tests include the ratio test, comparison test, integral test, alternating series test, and the nth-term divergence test." },
    { q: "What is a Taylor series?", a: "A Taylor series represents a function as an infinite sum of terms calculated from the function's derivatives at a single point. A Maclaurin series is a Taylor series centered at x = 0." },
  ],
  "differential-equations": [
    { q: "What is a differential equation?", a: "A differential equation is an equation that relates a function to one or more of its derivatives. Solving it means finding the function that satisfies the equation." },
    { q: "What is a separable differential equation?", a: "A separable differential equation can be rewritten so all terms involving y are on one side and all terms involving x are on the other. Both sides are then integrated independently." },
    { q: "What is exponential growth and decay?", a: "Exponential growth and decay are modeled by dy/dt = ky. The solution is y = y₀·e^(kt), where k > 0 means growth and k < 0 means decay." },
  ],
};

export default function CalculusModulePage() {
  const [dynamicModules, setDynamicModules] = useState<ModuleContent[] | null>(null);
  const [dynamicTopics, setDynamicTopics] = useState<Topic[] | null>(null);

  useEffect(() => {
    // === MINIMAL, REVERSIBLE NEW-DATA-SOURCE INTEGRATION (Phase 1) ===
    // One small block. Uses the polished adapter helper. No other files touched.
    // On success: full calculus content now flows from content/calculus/.../module.mdx + index.json
    //   through the adapter → identical shape → untouched SubjectModulePage.
    // On any hiccup: zero user impact, legacy shims provide the data.
    let cancelled = false;

    (async () => {
      try {
        const { getLegacyModulesAndTopicsForSubject } = await import("@/lib/content/adapters");
        const data = await getLegacyModulesAndTopicsForSubject("calculus");
        if (!cancelled && data) {
          setDynamicModules(data.modules);
          setDynamicTopics(data.topics);
        }
      } catch {
        // Silent legacy fallback is the entire point of the evolutionary pattern.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const finalModules = dynamicModules ?? legacyModules;
  const finalTopics = dynamicTopics ?? legacyTopics;

  return (
    <SubjectModulePage
      subjectSlug="calculus"
      subjectLabel="Calculus"
      modules={finalModules}
      topics={finalTopics}
      faqs={topicFaqs}
    />
  );
}
