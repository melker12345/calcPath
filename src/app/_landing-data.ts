export const curriculum = [
  {
    id: "limits",
    number: "I",
    title: "Limits & Continuity",
    desc: "What does it mean for a function to approach a value? Build intuition for limits through direct substitution, factoring, the squeeze theorem, and L'Hôpital's rule.",
  },
  {
    id: "derivatives",
    number: "II",
    title: "Derivatives",
    desc: "The derivative measures instantaneous rate of change. Master the power rule, product and quotient rules, chain rule, and implicit differentiation.",
  },
  {
    id: "applications",
    number: "III",
    title: "Applications of Derivatives",
    desc: "Solve optimization problems, related rates, and curve sketching. Understand how derivatives describe the physical world.",
  },
  {
    id: "integrals",
    number: "IV",
    title: "Integrals",
    desc: "Integration is the reverse of differentiation — and much more. Master substitution, integration by parts, and the Fundamental Theorem of Calculus.",
  },
  {
    id: "series",
    number: "V",
    title: "Series & Sequences",
    desc: "When does an infinite sum converge? Study convergence tests, power series, and Taylor expansions that underpin modern mathematics.",
  },
  {
    id: "differential-equations",
    number: "VI",
    title: "Differential Equations",
    desc: "Equations involving derivatives model growth, decay, and change. Solve separable and first-order linear equations with real applications.",
  },
];

export const homeFaqs = [
  { q: "What background do I need?", a: "Algebra and basic trigonometry. If you're comfortable with functions, factoring, and solving equations, you're ready to start." },
  { q: "Is this free?", a: "All modules — lessons, explanations, and worked examples — are free with no account required. Practice problems and tests require a Pro subscription." },
  { q: "How is this different from a textbook?", a: "You get the same rigor, but with instant feedback. Every practice problem checks your answer immediately and walks through the solution step by step." },
  { q: "What topics are covered?", a: "Limits, derivatives, applications of derivatives, integrals, series & sequences, and differential equations. This covers a standard Calculus I–II curriculum." },
  { q: "Can I try the practice problems first?", a: "Yes. You can solve 5 interactive problems right now — no account needed. Visit the practice sampler to try it." },
  { q: "Who made this?", a: "CalcPath is an independent project built to make calculus more accessible. Every explanation is written to build understanding, not just get you through an exam." },
];

export const approaches = [
  {
    label: "01",
    title: "Intuition before formulas",
    text: "Each module builds understanding of why a concept works before introducing the formal machinery.",
  },
  {
    label: "02",
    title: "Worked examples throughout",
    text: "Detailed examples solved step by step — you see the thinking process, not just the answer.",
  },
  {
    label: "03",
    title: "Immediate feedback",
    text: "Practice problems check your answer instantly. When you're wrong, hints come first — then the full solution.",
  },
  {
    label: "04",
    title: "Progressive difficulty",
    text: "Problems go from straightforward to challenging. Easy problems build confidence; hard problems build depth.",
  },
];

export const sampleProblem = {
  label: "Limits — Problem 4",
  question: "Compute lim(x→4) of (x² − 16) / (x − 4)",
  steps: [
    "Direct substitution gives 0/0 — an indeterminate form.",
    "Factor the numerator: x² − 16 = (x − 4)(x + 4)",
    "Cancel the common factor (x − 4), leaving lim(x→4) of (x + 4)",
    "Substitute x = 4: 4 + 4 = 8",
  ],
  answer: "8",
};
