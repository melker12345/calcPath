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


Future work not to do now:
- [ ] Link to external resourses that explain the topic better, [youtube, khan accadamy, others (this is a manuall review step so i know we link to high quality resourses, also we need to validate that we can link to their resourse)]

- [ ] Implement vissual elements to represent the idea beeing explained.
