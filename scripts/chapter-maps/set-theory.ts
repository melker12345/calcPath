import type { ChapterPlan } from "../lib/consolidate-chapters";

export const SET_THEORY_CHAPTERS: ChapterPlan[] = [
  {
    id: "naive-set-theory",
    title: "Naive Set Theory",
    description:
      "Sets, elements, subsets, power sets, unions, and intersections — the language of modern mathematics.",
    order: 1,
    topicIds: [
      "set-mathematics",
      "element-mathematics",
      "subset",
      "power-set",
      "union-set-theory",
      "intersection-set-theory",
    ],
  },
  {
    id: "zfc-axioms",
    title: "ZFC Axioms",
    description:
      "The Zermelo–Fraenkel axioms: extensionality, regularity, infinity, power set, and replacement.",
    order: 2,
    topicIds: [
      "zermelo-fraenkel-set-theory",
      "axiom-of-extensionality",
      "axiom-of-regularity",
      "axiom-of-infinity",
      "axiom-of-power-set",
      "axiom-schema-of-replacement",
    ],
  },
  {
    id: "ordinals-cardinals",
    title: "Ordinals & Cardinals",
    description:
      "Ordinal and cardinal numbers, alephs, the continuum hypothesis, and transfinite induction.",
    order: 3,
    topicIds: [
      "ordinal-number",
      "cardinal-number",
      "aleph-number",
      "continuum-hypothesis",
      "transfinite-induction",
    ],
  },
  {
    id: "axiom-of-choice",
    title: "Axiom of Choice & Equivalents",
    description:
      "The axiom of choice and its equivalents: Zorn's lemma, well-ordering theorems, and Tychonoff's theorem.",
    order: 4,
    topicIds: [
      "axiom-of-choice",
      "zorns-lemma",
      "well-ordering-theorem",
      "well-ordering-theorem-2",
      "tychonoffs-theorem",
    ],
  },
  {
    id: "independence-forcing",
    title: "Independence & Forcing",
    description:
      "Independence results, forcing, proper forcing, inner models, and Gödel's constructible universe.",
    order: 5,
    topicIds: [
      "independence-mathematical-logic",
      "forcing-mathematics",
      "proper-forcing",
      "inner-model",
      "godels-constructible-universe",
    ],
  },
  {
    id: "advanced-set-theory",
    title: "Advanced Set Theory",
    description:
      "Descriptive set theory, large cardinals, and Martin's axiom.",
    order: 6,
    topicIds: [
      "descriptive-set-theory",
      "large-cardinal",
      "martins-axiom",
    ],
  },
];