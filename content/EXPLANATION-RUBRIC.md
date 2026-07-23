# Explanation Grading Rubric

This document is the **spec of concerns** used to grade the teaching quality of a
topic. It is written to be read by a human reviewer *or* by an LLM subagent that
scores one topic and emits a report. It is deliberately concrete: every
dimension has 1–5 anchors so two graders (or two runs) land on the same score.

`scripts/audit-explanations.ts` already covers the **mechanical floor** (duplicate
paragraphs, thinking-out-loud phrasing, broken/mis-delimited LaTeX, empty
sections). Do **not** re-score those here — this rubric is about *pedagogical*
quality, the layer above mechanics.

---

## What gets graded

For one topic, the grader reads:

- `content/<subject>/topics/<topic>/module.mdx` — the rich teaching content (**primary**)
- `content/<subject>/topics/<topic>/index.json` — the topic's advertised `title` + `description`
- `content/<subject>/topics/<topic>/questions.json` — practice questions + their `explanation` fields (**supporting**)

### The shape of a `module.mdx`

- YAML frontmatter with `title:`; a top-level `#` (stripped at render); one `##` per section.
- Each `##` section carries a stable slug via `{#slug}` or `<!-- section: slug -->`.
  Every `problem.section` in `questions.json` **must** map to one of these slugs.
- Sections typically contain: body prose, an **ELI5** block, and a **Worked Example:** block.
- A final `## Common Mistakes` section (not a practice section).

---

## Dimensions

Score each 1–5. **D1 (Correctness) is a gate** — see Aggregation.

### D1 — Mathematical correctness  *(gate)*
Is every definition, formula, claim, worked-example step, **and practice question** actually true and well-posed?
- **5** — No errors anywhere. Worked-example arithmetic checks out; every stated theorem/condition is correct; every sampled question is well-posed and its `answer` matches a correct solution.
- **3** — All claims and questions are *correct*, but one prose statement is imprecise/ambiguous (no wrong result, no ill-posed question).
- **2** — *Any* of: a false definition/formula, a worked example that reaches a wrong answer, or a **wrong or ill-posed practice question** (e.g. asks for a unique value on an underdetermined system, `answer` doesn't match a correct solution). Trips the gate.
- **1** — Multiple such errors, or a foundational claim is wrong.

> The grader must *actually verify* the worked-example computations and spot-check
> a sample of `questions.json` answers against their `explanation` AND against a
> fresh solve. A single wrong/ill-posed question caps D1 at **2** → "Needs
> rewrite". Report each error with the exact line/step/question-id and the correction.

### D2 — Coverage & completeness
Does the content deliver what it promises and what learners need?
- Cross-check the `module.mdx` against the topic's advertised `title`/`description` in `index.json`.
- Every question `section` slug should have real teaching prose behind it — not a stub.
- **5** — Covers everything the title/description promise; every question-bearing section is taught in depth; no obvious missing concept for the topic.
- **3** — Core is covered but a promised sub-topic is thin or a question section is under-served.
- **1** — Major promised concept absent, or sections exist only as headings.

> Example failure: `index.json` description says "span, and independence" but the
> module never defines either. Flag it explicitly.

### D3 — Conceptual clarity & progression
Does it build understanding rather than just state facts?
- Order should move intuition → formal definition → application. Jargon defined before use.
- **5** — Each idea motivated before it's formalized; smooth ramp; a motivated beginner could follow unaided.
- **3** — Correct and readable but reads as a reference dump; some terms used before defined.
- **1** — Disordered, assumes unstated prerequisites, or is impenetrable without an outside source.

### D4 — ELI5 quality
Is the plain-language intuition *genuine* — a concrete analogy or worked-in numbers — not a restatement of the formula in words?
- **5** — Every major section has an ELI5 that maps the concept to a concrete, memorable scenario (e.g. dot product = "shadow"/"how much two arrows agree").
- **3** — ELI5 present but generic or partly a formula restatement; some sections lack one.
- **1** — Missing, or actively misleading (analogy that breaks the concept).

### D5 — Worked examples
Do examples show the *reasoning pattern*, fully, with verification?
- **5** — At least one fully-worked example per major section; every step shown and justified; includes a sanity-check (e.g. "verify ⊥: dot = 0 ✓"); difficulty spans easy→harder.
- **3** — Examples present but skip steps, or only cover the easy case.
- **1** — Missing, or example is just the answer with no working.

### D6 — Common mistakes
Are the traps *specific to this topic*, not generic study advice?
- **5** — Names the real, topic-specific pitfalls learners hit (e.g. `‖cv‖ = c‖v‖` when `c<0`; normalizing the zero vector).
- **3** — Present but partly generic, or misses the most common trap.
- **1** — Missing or purely generic.

### D7 — Rigor & precision
Are conditions, domains, and edge cases stated where they matter?
- **5** — Hypotheses/domains stated (e.g. "cross product is `ℝ³` only", "nonzero before normalizing"); no hand-waving on the parts that need care.
- **3** — Mostly precise, a couple of missing conditions.
- **1** — Sloppy conditions that could teach a wrong mental model.

### D8 — Question ↔ explanation alignment  *(supporting)*
Sampling `questions.json`: does each `explanation` follow the "Step 1… Final answer:" convention, does `Final answer:` match the `answer` field, and is the notation consistent with the module?
- **5** — Answers consistent, steps sound, notation matches the module, Step 1 works as a non-spoiler hint.
- **3** — Mostly fine, occasional terse/spoiler step or notation drift.
- **1** — Wrong answers, or explanations that don't match their questions.

---

## Aggregation

- **Weighted score** (0–100): D1 ×3, D2 ×2, D3 ×2, D5 ×2, D4 ×1, D6 ×1, D7 ×1, D8 ×1 → normalize to 100.
- **Correctness gate:** if **D1 ≤ 2**, the topic is capped at **"Needs rewrite"** regardless of the weighted score. A wrong-but-beautiful explanation is worse than useless.
- **Verdict tiers:**
  - **Keep** — weighted ≥ 85 and D1 = 5.
  - **Minor edits** — weighted 70–84, no gate.
  - **Needs work** — weighted 50–69.
  - **Needs rewrite** — weighted < 50 **or** D1 ≤ 2.

---

## Report format (per topic)

Keep it concise and actionable — a reviewer should know in 20 seconds what to fix.

```md
### <subject> › <topic>
**Verdict:** <Keep | Minor edits | Needs work | Needs rewrite>  ·  **Score:** <NN>/100

| D1 corr | D2 cov | D3 clar | D4 eli5 | D5 examples | D6 mistakes | D7 rigor | D8 questions |
|--------:|-------:|--------:|--------:|------------:|------------:|---------:|-------------:|
|    5    |   3    |    4    |    5    |      4      |      5      |    4     |      4       |

**Correctness issues** (if any): <line/step + the fix, or "none found">

**Top fixes** (max 3, most impactful first):
1. <concrete, specific action>
2. ...
3. ...

**Strengths** (1 line): <what to preserve>
```

Rules for the report:
- Cite specifics (`L47`, `§dot`, `vec-dot-2`), never vague ("could be clearer").
- Every correctness issue must include the correction, not just the flag.
- No more than three "Top fixes" — force prioritization.
- If nothing is wrong, say so plainly; don't invent issues to fill space.
