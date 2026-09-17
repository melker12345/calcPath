#!/usr/bin/env node
/**
 * Split information-theory (8 -> 19) and combinatorics (8 -> 11) into chapters
 * of a readable size.
 *
 * The 2026-06 consolidation folded dozens of micro-topics into eight chapters
 * per subject. For most of the corpus that was right, but here it produced
 * chapters of 21-25 sections carrying six unrelated mini-topics apiece — and,
 * in three cases, the same material twice (the hook-length formula, Turán's
 * theorem, and Kolmogorov complexity's definition each appear in two passes).
 *
 * Each chapter below is one idea developed to its end, at least five sections
 * long, and reads 1 -> 2 -> 3. Prose moves verbatim; sections keep their slugs,
 * so every question follows its section and every old URL redirects.
 *
 * Run: npx tsx scripts/split-it-comb-chapters.ts
 */
import path from "path";
import { fileURLToPath } from "url";

import { splitSubjectChapters, type SplitChapterPlan } from "./lib/split-chapters";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export const INFORMATION_THEORY: SplitChapterPlan[] = [
  {
    id: "entropy",
    title: "Entropy, Joint and Conditional Entropy",
    description:
      "What information means, how entropy measures it, and how entropy behaves when several random variables are considered together.",
    order: 1,
    sections: [
      "information-measures/what-is-information",
      "information-measures/quantifying-information",
      "information-measures/applications-scope",
      "information-measures/definition",
      "information-measures/properties",
      "information-measures/calculating",
      "information-measures/definition-joint",
      "information-measures/relation-to-marginals",
      "information-measures/chain-rule",
      "information-measures/definition-conditional",
      "information-measures/interpretation-properties",
      "information-measures/chain-rule-relations",
    ],
  },
  {
    id: "mutual-information",
    title: "Mutual Information and Relative Entropy",
    description:
      "How much one variable says about another, how far one distribution sits from another, and the inequalities that tie the two together.",
    order: 2,
    sections: [
      "information-measures/definition-mutual",
      "information-measures/interpretation",
      "information-measures/properties-special",
      "information-measures/definition-kl",
      "information-measures/interpretation-kl",
      "information-measures/properties-uses",
    ],
  },
  {
    id: "entropy-rates-aep",
    title: "Entropy Rates and the AEP",
    description:
      "Information per symbol for a process with memory, and the asymptotic equipartition property that makes long sequences predictable in bulk.",
    order: 3,
    sections: [
      "information-measures/definition-entropy-rate",
      "information-measures/properties-processes",
      "information-measures/asymptotic",
      "source-coding/definition",
      "source-coding/typical-set",
      "source-coding/applications",
    ],
  },
  {
    id: "source-coding-theorem",
    title: "Source Coding and the Entropy Bound",
    description:
      "Shannon's source coding theorem in both directions, and Kraft's inequality — why entropy is the floor no lossless code can beat.",
    order: 4,
    sections: [
      "source-coding/statement",
      "source-coding/achievability",
      "source-coding/converse",
      "source-coding/lossless-vs-lossy",
      "source-coding/redundancy",
      "source-coding/practical",
    ],
  },
  {
    id: "huffman-coding",
    title: "Huffman and Shannon–Fano Codes",
    description:
      "Building an optimal prefix code symbol by symbol, proving it optimal, and seeing where the older Shannon–Fano construction falls short.",
    order: 5,
    sections: [
      "source-coding/algorithm",
      "source-coding/optimality",
      "source-coding/practical-huffman",
      "source-coding/construction",
      "source-coding/comparison",
      "source-coding/historical",
    ],
  },
  {
    id: "universal-compression",
    title: "Arithmetic, Lempel–Ziv and Universal Coding",
    description:
      "Coding a whole message as one interval, learning the dictionary as you go, and what it costs to compress a source you were not told about.",
    order: 6,
    sections: [
      "source-coding/idea",
      "source-coding/interval-narrowing",
      "source-coding/termination",
      "source-coding/dictionary",
      "source-coding/encoding-process",
      "source-coding/limitations",
      "source-coding/definition-universal",
      "source-coding/examples",
      "source-coding/limitations-universal",
    ],
  },
  {
    id: "channel-capacity",
    title: "Channel Capacity and the Coding Theorem",
    description:
      "How much a noisy channel can carry, the proof that the rate is achievable, and why feedback does not raise it.",
    order: 7,
    sections: [
      "channel-coding/definition",
      "channel-coding/binary-symmetric",
      "channel-coding/gaussian",
      "channel-coding/statement",
      "channel-coding/achievability",
      "channel-coding/converse",
      "channel-coding/capacity-feedback",
      "channel-coding/arq",
      "channel-coding/variable-length",
    ],
  },
  {
    id: "linear-codes",
    title: "Linear and Hamming Codes",
    description:
      "Minimum distance, the bounds it must obey, and the classical linear constructions that correct errors by syndrome.",
    order: 8,
    sections: [
      "channel-coding/errors-in-communication",
      "channel-coding/error-detection",
      "channel-coding/error-correction",
      "channel-coding/definition-hamming",
      "channel-coding/syndrome-decoding",
      "channel-coding/extended",
    ],
  },
  {
    id: "modern-codes",
    title: "Modern Codes: LDPC, Polar and Turbo",
    description:
      "The sparse-graph and polarization constructions that finally reach capacity in practice, and how they are decoded.",
    order: 9,
    sections: [
      "channel-coding/definition-sparsity",
      "channel-coding/tanner-graphs",
      "channel-coding/performance-decoding",
      "channel-coding/channel-polarization",
      "channel-coding/construction-encoding",
      "channel-coding/sc-decoding",
      "channel-coding/performance-standards",
      "channel-coding/construction",
      "channel-coding/iterative-decoding",
      "channel-coding/performance-applications",
    ],
  },
  {
    id: "rate-distortion",
    title: "Rate–Distortion Theory",
    description:
      "The best rate achievable at a given distortion, computed in closed form where it can be and numerically where it cannot.",
    order: 10,
    sections: [
      "rate-distortion/rate-distortion-tradeoff",
      "rate-distortion/definition-rd",
      "rate-distortion/computation-properties",
      "rate-distortion/examples-gaussian-binary",
      "rate-distortion/the-rd-function",
      "rate-distortion/parametric-s",
      "rate-distortion/closed-form-bounds",
      "network-information-theory/ba-for-rd",
      "network-information-theory/ba-for-capacity",
      "network-information-theory/convergence-use",
    ],
  },
  {
    id: "quantization",
    title: "Quantization",
    description:
      "Turning the theory into a codebook: scalar quantizers, the Lloyd–Max conditions, and why quantizing vectors beats quantizing one sample at a time.",
    order: 11,
    sections: [
      "rate-distortion/scalar-quantization",
      "rate-distortion/lloyd-max",
      "rate-distortion/performance-highrate",
      "rate-distortion/why-vector",
      "rate-distortion/lbg-design",
      "rate-distortion/performance-complexity",
    ],
  },
  {
    id: "distributed-source-coding",
    title: "Distributed Source Coding and Side Information",
    description:
      "Compressing correlated sources that cannot talk to each other — Slepian–Wolf, Wyner–Ziv, and the binning argument behind both.",
    order: 12,
    sections: [
      "rate-distortion/rd-si-decoder",
      "rate-distortion/rd-si-encoder",
      "rate-distortion/conditional-rd",
      "rate-distortion/general-rd-si",
      "rate-distortion/wz-setup",
      "rate-distortion/wz-rd",
      "rate-distortion/wz-binning",
      "rate-distortion/distributed-sc-problem",
      "rate-distortion/sw-rate-region",
      "rate-distortion/binning-achievability",
    ],
  },
  {
    id: "multi-user-channels",
    title: "Multiple-Access and Broadcast Channels",
    description:
      "Many senders into one receiver, and one sender to many receivers: capacity regions rather than a single number.",
    order: 13,
    sections: [
      "network-information-theory/mac-model",
      "network-information-theory/capacity-region",
      "network-information-theory/coding-strategies",
      "network-information-theory/bc-model",
      "network-information-theory/degraded-bc",
      "network-information-theory/superposition-coding",
    ],
  },
  {
    id: "network-coding",
    title: "Network Coding and Common Randomness",
    description:
      "Mixing packets inside the network instead of forwarding them, and distilling shared secrecy from correlated observations.",
    order: 14,
    sections: [
      "network-information-theory/store-forward-vs-nc",
      "network-information-theory/butterfly",
      "network-information-theory/linear-nc",
      "network-information-theory/cr-problem",
      "network-information-theory/key-agreement",
      "network-information-theory/extraction-amplification",
      "network-information-theory/applications-cr",
    ],
  },
  {
    id: "algorithmic-information",
    title: "Algorithmic Information Theory",
    description:
      "Kolmogorov complexity: the information in a single object, its relationship to entropy, and the results its uncomputability forces.",
    order: 15,
    // Document order is preserved. This chapter carries two overlapping passes
    // over the definition and over uncomputability; grouping them is an
    // editorial decision that belongs to the rebuild, which will merge them,
    // not to a split whose job is only to move sections between chapters.
    sections: [
      "algorithmic-information/kolmogorov-intro",
      "algorithmic-information/solomonoff",
      "algorithmic-information/incompressibility-chaitin",
      "algorithmic-information/definition",
      "algorithmic-information/relation-to-entropy",
      "algorithmic-information/incompressibility",
      "algorithmic-information/uncomputability",
      "algorithmic-information/kc-properties",
      "algorithmic-information/uncomputability-incompressibility",
      "algorithmic-information/applications-incompleteness",
    ],
  },
  {
    // Four sections today — below the five-section floor, and the only chapter
    // here that is. Splitting it into "Quantum States and Von Neumann Entropy"
    // and "Quantum Channels, Holevo and Capacity" would give two chapters of
    // two, so it stays whole until the rebuild writes the material that makes
    // two real chapters.
    id: "quantum-information",
    title: "Quantum Information",
    description:
      "Qubits and density matrices, von Neumann entropy, the Holevo bound, and what entanglement adds that no classical resource can.",
    order: 16,
    sections: [
      "quantum-information/qubits-states",
      "quantum-information/von-neumann",
      "quantum-information/quantum-channels-holevo",
      "quantum-information/entanglement-teleportation",
    ],
  },
  {
    id: "secret-sharing",
    title: "Secret Sharing and Secure Computation",
    description:
      "Splitting a secret so that any t shares reveal it and any t−1 reveal nothing, and computing on data nobody is allowed to see.",
    order: 17,
    sections: [
      "security-privacy/threshold-ss",
      "security-privacy/shamir",
      "security-privacy/properties-extensions",
      "security-privacy/mpc-problem",
      "security-privacy/yao-garbled",
      "security-privacy/bgw-ss",
      "security-privacy/security-models",
    ],
  },
  {
    id: "differential-privacy",
    title: "Differential Privacy",
    description:
      "A guarantee stated as a divergence bound, the mechanisms that meet it, and what composition costs across repeated queries.",
    order: 18,
    sections: [
      "security-privacy/dp-definition",
      "security-privacy/mechanisms",
      "security-privacy/composition-properties",
      "security-privacy/applications-limitations",
    ],
  },
];

export const COMBINATORICS: SplitChapterPlan[] = [
  {
    id: "counting-principles",
    title: "Counting Principles",
    description:
      "The rules every count rests on: bijections, the sum and product rules, pigeonhole, inclusion–exclusion and double counting.",
    order: 1,
    sections: [
      "counting-principles/basic-principle",
      "counting-principles/generalized",
      "counting-principles/applications-proofs",
      "counting-principles/two-sets",
      "counting-principles/three-or-more",
      "counting-principles/applications",
      "counting-principles/idea-of-bijection",
      "counting-principles/classic-examples",
      "counting-principles/power-and-limitations",
    ],
  },
  {
    id: "basic-counting",
    title: "Basic Counting",
    description:
      "Permutations, combinations and the binomial coefficients, with the identities that follow and the models they each apply to.",
    order: 2,
    sections: [
      "basic-counting/definition-scope",
      "basic-counting/counting-rules",
      "basic-counting/applications",
      "basic-counting/definition-factorial",
      "basic-counting/permutations-with-repetition",
      "basic-counting/circular-and-multiset",
      "basic-counting/unordered-selections",
      "basic-counting/binomial-notation",
      "basic-counting/identities-and-relations",
      "basic-counting/pascal-triangle",
      "basic-counting/binomial-theorem",
      "basic-counting/identities-applications",
    ],
  },
  {
    id: "generating-functions",
    title: "Generating Functions",
    description:
      "Formal power series as a bookkeeping device for counting, and the recurrences they solve in closed form.",
    order: 3,
    sections: [
      "generating-functions/ordinary-generating",
      "generating-functions/operations-on-gfs",
      "generating-functions/solving-counting-problems",
      "generating-functions/definition-egf",
      "generating-functions/labeled-structures",
      "generating-functions/relation-to-ogf",
      "generating-functions/linear-recurrences",
      "generating-functions/combinatorial-recurrences",
      "generating-functions/solving-techniques",
    ],
  },
  {
    id: "special-sequences",
    title: "Special Sequences",
    description:
      "Fibonacci, Catalan, Stirling, Bell, Eulerian and the partition numbers — what each counts and how each is computed.",
    order: 4,
    sections: [
      "special-sequences/definition-formula",
      "special-sequences/combinatorial-interpretations",
      "special-sequences/applications",
      "special-sequences/stirling-second",
      "special-sequences/stirling-first",
      "special-sequences/bell-relation",
      "special-sequences/definition-bell",
      "special-sequences/set-partitions",
      "special-sequences/applications-growth",
    ],
  },
  {
    id: "young-tableaux",
    title: "Partitions, Young Tableaux and RSK",
    description:
      "Integer partitions drawn as diagrams, the hook-length formula that counts their standard fillings, and the RSK correspondence.",
    order: 5,
    sections: [
      "enumerative-combinatorics/what-is-enumerative",
      "enumerative-combinatorics/generating-functions-role",
      "enumerative-combinatorics/bijective-and-other",
      "enumerative-combinatorics/young-diagrams",
      "enumerative-combinatorics/standard-tableaux",
      "enumerative-combinatorics/hook-definition",
      "enumerative-combinatorics/the-formula",
      "enumerative-combinatorics/hook-and-other",
      "enumerative-combinatorics/proofs-and-algos",
      "enumerative-combinatorics/the-correspondence",
      "enumerative-combinatorics/increasing-subseq",
      "enumerative-combinatorics/properties",
    ],
  },
  {
    id: "graph-coloring-ramsey",
    title: "Graph Coloring and Ramsey Theory",
    description:
      "Colouring vertices and edges, the chromatic number and its bounds, and the Ramsey results that make disorder impossible.",
    order: 6,
    sections: [
      "graph-combinatorics/vertex-coloring",
      "graph-combinatorics/chromatic-number",
      "graph-combinatorics/applications",
      "graph-combinatorics/ramsey-numbers",
      "graph-combinatorics/infinite-ramsey",
      "graph-combinatorics/ramsey-applications",
    ],
  },
  {
    id: "extremal-graph-theory",
    title: "Extremal Graph Theory",
    description:
      "How many edges a graph can carry before a forbidden subgraph is forced: Turán's theorem, its corollaries and what follows.",
    order: 7,
    sections: [
      "graph-combinatorics/extremal-function",
      "graph-combinatorics/statement-proof-idea",
      "graph-combinatorics/turan-special",
      "graph-combinatorics/the-graph",
      "graph-combinatorics/corollaries",
      "graph-combinatorics/other-theorems",
      "graph-combinatorics/statement",
      "graph-combinatorics/proof-ideas",
      "graph-combinatorics/impact",
    ],
  },
  {
    id: "probabilistic-method",
    title: "The Probabilistic Method",
    description:
      "Proving a structure exists by showing a random one works, sharpened by deletion and by the Lovász Local Lemma.",
    order: 8,
    sections: [
      "advanced-combinatorics/basic-idea",
      "advanced-combinatorics/deletion-method",
      "advanced-combinatorics/lovasz-lemma-preview",
      "advanced-combinatorics/the-lemma",
      "advanced-combinatorics/proof-sketch",
      "advanced-combinatorics/applications",
    ],
  },
  {
    id: "algebraic-combinatorics",
    title: "Algebraic and Additive Combinatorics",
    description:
      "Polynomials as a counting tool — the Combinatorial Nullstellensatz — and the structure of sumsets from Cauchy–Davenport onward.",
    order: 9,
    sections: [
      "advanced-combinatorics/the-theorem",
      "advanced-combinatorics/polynomial-method",
      "advanced-combinatorics/nullstellensatz-applications",
      "advanced-combinatorics/sumsets-basics",
      "advanced-combinatorics/cauchy-davenport",
      "advanced-combinatorics/advanced-results",
    ],
  },
  {
    id: "matroids-matchings",
    title: "Matroids and Matchings",
    description:
      "The structure that makes the greedy algorithm correct, and the matching theory of Hall and König that mirrors it.",
    order: 10,
    sections: [
      "combinatorial-optimization/definition-axioms",
      "combinatorial-optimization/examples",
      "combinatorial-optimization/optimization",
      "combinatorial-optimization/definition-matching",
      "combinatorial-optimization/halls-theorem",
      "combinatorial-optimization/algorithms",
    ],
  },
  {
    id: "flows-duality",
    title: "Flows and Linear Programming Duality",
    description:
      "Max-flow min-cut, the algorithms that realise it, and the linear programming duality that explains every min–max theorem here.",
    order: 11,
    sections: [
      "combinatorial-optimization/flow-networks",
      "combinatorial-optimization/maxflow-mincut",
      "combinatorial-optimization/applications",
      "combinatorial-optimization/lp-problem",
      "combinatorial-optimization/duality",
      "combinatorial-optimization/combinatorial-apps",
    ],
  },
];

export const PLANS: Record<string, SplitChapterPlan[]> = {
  "information-theory": INFORMATION_THEORY,
  combinatorics: COMBINATORICS,
};

async function main() {
  await splitSubjectChapters(ROOT, "information-theory", INFORMATION_THEORY, {
    // Its opening section (the AEP) moved to the entropy-rates chapter, but a
    // reader following an old source-coding link wants the theorem.
    "source-coding": { chapterId: "source-coding-theorem", section: "statement" },
  });
  await splitSubjectChapters(ROOT, "combinatorics", COMBINATORICS);
}

// Only split when run directly — this module is also imported for its plans,
// which describe where every section came from.
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
