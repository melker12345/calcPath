TODO:

- [x] Fix the /account page, the design is slighly broken. (already done at HEAD, no change needed)
- [x] Fix the /donate page, styling is from the old version. (already done at HEAD, no change needed)


Bugs:
- [x] Broken latex subscripts — plain-text x_0, m_i, Δx_i etc. outside $...$ in MDX explanations.
  Fixed across 20 module.mdx files (real-analysis, combinatorics, algebra, geometry, precalculus, number-theory).
  content:latex now checks 10,428 fragments with 0 failures.

- [ ] /feedback could do with a small touch up on it's style.

- [ ] Do we not have numerical id for each question? or is it divid up into it's topics? like every topic show <div class="justify-self-center rounded-full px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] ring-1 ring-[var(--border)]/80">Q1</div> for the first question in the topic, would it not be better to have just 0~4000?
makes the feed back for spesific questoin easier, then i can just look up question #356 or what ever the question is in focus.

- [ ] I think we have to many MCQ questions, why? does it make sence?

- [x] the scratch pad is broken on dark theme. Fixed: added full dark: variant coverage to toolbar, buttons, color swatches, stroke controls, and canvas background.


Content quality fixes done this session:
- [x] Escaped all literal $ currency signs in MDX prose (37 → 0 KaTeX failures)
- [x] Fixed 4 broken/thinking-out-loud question entries (numtheory-quadres-4, comb-hook-4, comb-prob-2, info-network-4)
- [x] Rewrote 18 thinking-out-loud explanations; corrected 7 wrong answers hidden inside them:
  - appint-average-4: -5/3 → 4/3
  - app-relatedrates-6: 0.4 → 0.45
  - multi-theorems-4: 9 → 18
  - parampolar-polar-between-2: (9π/2)-2 → 15π/2
  - parampolar-polar-calc-1: -1 → 0
  - stoch-markov-2: 0.61 → 0.39
  - geom-parab-7: 1/4 → 1


Answer-grading fixes (from the "typed answer right but it came out wrong" report):
- [x] MathQuill `^{...}` exponents were misparsed (e^{3x} became e^3*x) — braces now become parentheses before stripping.
- [x] `ln` after a letter ("2xln(x)") was unevaluable; MCQ was graded by expression equivalence, so distractors could grade correct (38 across the corpus) — MCQ now compares by identity.
- [x] Rounding tolerance was half a unit wide in both directions, so 0.25 passed for 0.2. Now: rounded to the coarser precision, the two values must agree.
- [x] Labels must agree when both sides have one ("y = -3" no longer passes for "x = -3"); comma lists ("1,-1") match in any order unless the parts are labelled.
- [x] `npm run content:answers` now replays every stored answer respelled the way learners type it, every MCQ distractor, and every answer pair within a topic. It caught all of the above; self-validation alone never could.
- [x] Last 5 KaTeX failures fixed (an unescaped `$1000s` and a `z^\*`) — content:latex is now at 0 failures.

Future work not to do now:
- [ ] Link to external resourses that explain the topic better, [youtube, khan accadamy, others (this is a manuall review step so i know we link to high quality resourses, also we need to validate that we can link to their resourse)]

- [ ] Implement vissual elements to represent the idea beeing explained.
