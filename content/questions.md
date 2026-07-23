# Questions Guidelines for New Topics

**Strong preference going forward: heavily prioritize `numeric` (math-input) questions over MCQ.**

## Core Principle
- **Target 75%+ numeric per new topic** (ideally higher for computational/procedural subjects like algebra, calculus, geometry, number theory, precalculus, combinatorics, statistics, etc.).
- Use `type: "mcq"` **only** when it is genuinely the better pedagogical choice: conceptual identification, distinguishing similar ideas, or when the options themselves teach important nuances that a single numeric answer cannot.
- Numeric questions (free-response via MathInput) are superior for building actual calculation and problem-solving skills. MCQs are a fallback for quick conceptual checks.

## When to Use "numeric"
- Compute / evaluate / simplify / solve / find the value / exact expression / approximation / count / cardinality / measure / angle / area / length / probability / etc.
- Examples of good prompts:
  - "Compute: $\\lim_{x\\to 3} (2x + 1)$"
  - "Evaluate: $3a + 2b$ when $a = -1$, $b = 4$."
  - "How many positive divisors does $p^4 q^2$ have?"
  - "What is $\\sup (0,1)$?"
  - "From 5 men and 4 women, how many ways to choose a committee of 3?"
- `answer` should be the clean expected value/expression the user would type or the canonical form (e.g. "7", "2/3", "$b^2-4ac$", "84", "1").
- Explanations must follow the convention: "Step 1: ...\nStep 2: ... Final answer: $42$." (or equivalent). This enables nice rendering in feedback.

## When to (Rarely) Use "mcq"
Reserve for:
- "Which of the following is the definition of ...?"
- "Which axiom/property/theorem applies here?"
- "Identify the type/structure/distribution."
- Questions where listing plausible wrong answers helps highlight misconceptions or precise distinctions.
- Do **not** use MCQ just because it is easier to write.

Bad (avoid for new content): turning a simple computation into "which of these is the answer?" with 3 distractors.

## Required Fields & Format (every question in questions.json)
```json
{
  "id": "kebab-case-topic-unique-1",   // NEVER change after live (affects user progress)
  "section": "exact-matching-slug-from-module.mdx",  // Critical invariant
  "type": "numeric",                   // Preferred for new topics
  "difficulty": "easy" | "medium" | "hard",
  "prompt": "Clear question text. Always use $LaTeX$ for any math.",
  "answer": "exact canonical answer string (numeric) or one of the choices (mcq)",
  "explanation": "Step 1: ...\nStep 2: ... Final answer: $the-answer$.",
  "choices": [ ... ]                   // ONLY for type: "mcq". Must include the answer exactly.
}
```

## Other Rules
- Every question `section` **must exactly match** a `<!-- section: slug -->` or heading slug in the topic's `module.mdx`.
- Run `npm run content:validate` after any changes.
- Stable `id`s are critical for progress tracking across devices.
- Keep prompts self-contained. Use LaTeX liberally so MathText renders nicely.
- For new subjects/topics added via "just drop" into `content/`, follow this numeric-first rule strictly.

## Example Good Numeric Question
```json
{
  "id": "limits-directsub-1",
  "section": "directsub",
  "type": "numeric",
  "difficulty": "easy",
  "prompt": "Compute: $\\lim_{x\\to 3} (2x + 1)$",
  "answer": "7",
  "explanation": "Step 1: This is a polynomial, so we can use direct substitution. Step 2: Substitute $x = 3$: $2(3) + 1 = 6 + 1 = 7$. Final answer: $7$."
}
```

## Example (Rare) Good MCQ
```json
{
  "id": "sets-def-1",
  "section": "definition",
  "type": "mcq",
  "difficulty": "easy",
  "prompt": "A set is equal to another set if and only if:",
  "answer": "They contain exactly the same elements.",
  "choices": [
    "They contain exactly the same elements.",
    "They have the same number of elements.",
    "They were constructed in the same way.",
    "One is a subset of the other."
  ],
  "explanation": "Step 1: Equality of sets is defined purely by having identical members (extensionality). Step 2: Cardinality or construction method is irrelevant. Final answer: They contain exactly the same elements."
}
```

Follow these rules for all future content drops and generations. This ensures consistent, high-quality practice that favors real problem-solving over guessing.

See also: `content/ARCHITECTURE.md` (section matching, validation, folder structure) and `src/lib/content/schema.ts` (exact Zod shape).
