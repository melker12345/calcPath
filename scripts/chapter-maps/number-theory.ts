import type { ChapterPlan } from "../lib/consolidate-chapters";

export const NUMBER_THEORY_CHAPTERS: ChapterPlan[] = [
  {
    id: "divisibility-primes",
    title: "Divisors & Primes",
    description:
      "Divisors, prime numbers, unique factorization, and the Euclidean algorithm for computing GCD.",
    order: 1,
    topicIds: [
      "divisor",
      "prime-number",
      "fundamental-theorem-of-arithmetic",
      "euclidean-algorithm",
    ],
  },
  {
    id: "modular-arithmetic",
    title: "Modular Arithmetic",
    description:
      "Congruences, the Chinese remainder theorem, and quadratic residues with Jacobi and Legendre symbols.",
    order: 2,
    topicIds: [
      "modular-arithmetic",
      "chinese-remainder-theorem",
      "congruence-relation",
      "jacobi-symbol",
      "legendre-symbol",
      "quadratic-residue",
    ],
  },
  {
    id: "classical-theorems",
    title: "Classical Theorems",
    description:
      "Fermat's and Wilson's theorems, quadratic reciprocity, and Gauss sums.",
    order: 3,
    topicIds: [
      "fermats-little-theorem",
      "wilsons-theorem",
      "quadratic-reciprocity",
      "gauss-sum",
    ],
  },
  {
    id: "arithmetic-functions",
    title: "Arithmetic Functions",
    description:
      "Multiplicative functions, Euler's totient, Möbius and divisor functions, Dirichlet convolution, and Mertens theorems.",
    order: 4,
    topicIds: [
      "arithmetic-function",
      "multiplicative-function",
      "eulers-totient-function",
      "mobius-function",
      "divisor-function",
      "carmichael-function",
      "dirichlet-convolution",
      "mertens-theorems",
    ],
  },
  {
    id: "diophantine-equations",
    title: "Diophantine Equations",
    description:
      "Linear and classical Diophantine equations: Pythagorean triples, Pell's equation, Hasse principle, Thue's theorem, and Fermat's Last Theorem.",
    order: 5,
    topicIds: [
      "diophantine-equation",
      "linear-diophantine-equation",
      "pythagorean-triple",
      "pells-equation",
      "hasse-principle",
      "thues-theorem",
      "fermats-last-theorem",
    ],
  },
  {
    id: "analytic-number-theory",
    title: "Analytic Number Theory",
    description:
      "The Riemann zeta function, the prime number theorem, Dirichlet L-functions, and Dirichlet's theorem on arithmetic progressions.",
    order: 6,
    topicIds: [
      "riemann-zeta-function",
      "prime-number-theorem",
      "dirichlet-l-function",
      "dirichlets-theorem-on-arithmetic-progressions",
    ],
  },
  {
    id: "algebraic-number-theory",
    title: "Algebraic Number Theory",
    description:
      "Algebraic integers, rings of integers, Dedekind domains, ideal class groups, and Dirichlet's unit theorem.",
    order: 7,
    topicIds: [
      "algebraic-integer",
      "ring-of-integers",
      "dedekind-domain",
      "ideal-class-group",
      "algebraic-number-theory",
      "dirichlets-unit-theorem",
    ],
  },
];