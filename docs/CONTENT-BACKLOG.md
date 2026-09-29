# Content backlog

Measured, not estimated. Re-measure before acting; commands are included where
they exist. Ordered by value.

## 1. Wrong mathematics and missing definitions (highest value)

From the seven-subject audit of 2026-09-17, about 25 confirmed items, among
them:

- abstract-algebra: Cauchy's theorem is missing, and one proof is invalid
  without it. Cayley's theorem, "a finite integral domain is a field" and the
  classification of finite fields appear nowhere. Eisenstein's criterion is
  used by name twice but never stated.
- geometry: elliptic geometry is stated as keeping Euclid's first four
  postulates.
- number-theory: λ(510510) is given as 144 (it is 240, and the answer key says
  240). Dirichlet convolution identity was backwards in a Common Mistakes
  bullet (fixed; check it stayed fixed).
- calculus: the arcsec derivative is missing its absolute value.
- linear-algebra: Gram–Schmidt ↔ Orthogonal Decomposition are proved
  circularly.
- probability/markov-chains: existence ↔ return-time ↔ ergodic are proved
  circularly.
- real-analysis/real-number-system: an example claims an infinite set of
  integers "has a max (finite set of integers)"; the cardinality-of-the-
  continuum example muddles its two inequalities.
- algebra/exponents-radicals-logarithms: "the graph is always above the
  x-axis" is false for a<0, and its own Common Mistakes bullet says so.
- Missing vocabulary: `limsup`/`liminf` (37 uses, never defined), uniform
  convergence (a whole missing chapter in real-analysis), functions/relations
  in set theory (62 uses, never defined), radian measure in precalculus, the
  Remainder Theorem in precalculus, the product-to-sum identities in the
  section that promises them, the division algorithm in discrete-mathematics.
- discrete-mathematics/graph-theory: Euler's formula for planar graphs,
  Kuratowski, the four colour theorem and planarity are absent; Hamiltonian
  graphs get a definition but no characterisation.

## 2. Multiple choice

House rule (`content/questions.md`): at most 5% of a chapter's bank is MCQ.

Measured 2026-09-29 — 1,637 MCQ of 12,959 questions (13%):

| subject | mcq | numeric | mcq % |
|---|---|---|---|
| geometry | 279 | 73 | 79 |
| precalculus | 194 | 90 | 68 |
| algebra | 234 | 179 | 57 |
| mathematical-logic | 283 | 291 | 49 |
| information-theory | 212 | 1398 | 13 |
| combinatorics | 133 | 985 | 12 |
| every other subject | | | ≤ 4 |

- The correct answer was stored as the first choice in 1,588 of 1,637 MCQs.
  The practice UI now shuffles choices by question id, so this is no longer a
  free signal, but the data is still lopsided.
- **Length tell**: in 508 MCQs the correct choice is more than 25 characters
  longer than every distractor (mathematical-logic 122, geometry 82,
  information-theory 76, combinatorics 62, precalculus 59, algebra 51).
  Needs content edits: pad distractors or trim the answer.
- Two one-offs: `geom-refl-7` has only 2 choices; `geom-similarity-3` has a
  "none/all of the above" option, the only one in the corpus.

Re-measure:

```bash
npx tsx -e "
const fs=require('fs');const pos={};
for(const s of fs.readdirSync('content')){const d='content/'+s+'/topics';if(!fs.existsSync(d))continue;
for(const c of fs.readdirSync(d)){const f=d+'/'+c+'/questions.json';if(!fs.existsSync(f))continue;
for(const q of JSON.parse(fs.readFileSync(f,'utf8')))
 if(q.type==='mcq'){const i=(q.choices||[]).indexOf(String(q.answer));if(i>=0)pos[i]=(pos[i]||0)+1;}}}
console.log(pos);"
```

## 3. Chapter shape

- **Over-consolidated chapters** (about 40 across 9 subjects). Worst:
  `algebra/functions-and-graphs` 49 sections including 10 separate "Common
  Mistakes" blocks; `geometry/geometry-foundations` 43; `geometry/triangles`
  40; `algebra/polynomials-factoring` 39; `algebra/exponents-radicals-
  logarithms` 34; `geometry/advanced-geometries` 33; `real-analysis/advanced-
  analysis` 33 (19,875 words). These read as several chapters glued together
  and should be split. Algebra (172 sections) and geometry (155) need
  splitting before any rebuild.
- **Thin chapters**: every precalculus chapter is under 3,500 words;
  `introduction-to-limits` is 1,650. The calculus limits chapter, the
  reference implementation, is about 15,000.
- **Overlapping chapters across subjects**, needing a decision on where each
  topic lives and cross-links instead of duplicates: `functions-and-graphs`
  in both algebra and precalculus; `precalculus/introduction-to-limits` vs
  `calculus/limits`; `precalculus/systems-and-matrices` vs
  `linear-algebra/matrices`; `precalculus/sequences-series-conics` vs
  `calculus/series` and `real-analysis/sequences-and-series`.
- **Questions per section**: about 2,500 questions are needed to bring every
  section to 10+.
- Subjects the author put on hold: precalculus, algebra, geometry.

Measure section counts:

```bash
for f in content/*/topics/*/module.mdx; do echo "$(grep -c '^## ' $f) $(wc -w < $f) $f"; done | sort -rn | head
```

## 4. Mechanical prose issues

`npx tsx scripts/audit-explanations.ts` (2026-09-29, after fixing the audit's
own dollar pairing so escaped `\$` and long inline spans no longer produce
false "prose-in-math" reports): 19 findings, all real.

- 5 duplicate paragraphs: a displayed equation repeated within
  `calculus/derivatives`, `calculus/techniques-of-integration`,
  `geometry/coordinate-geometry`, `probability/joint-distributions` (a whole
  joint-pmf table), `real-analysis/differentiation`.
- 13 duplicate sentences: `calculus/techniques-of-integration` (one
  substitution line), and repeated Common Mistakes bullets in precalculus
  `complex-and-polar`, `polynomial-rational-functions`,
  `sequences-series-conics`, `systems-and-matrices`,
  `trigonometric-functions`.
- 1 raw LaTeX command outside math: `precalculus/complex-and-polar` line 70,
  `\bar (z+w) = \bar z + \bar w` in a bullet.

## 5. Problem sets

41 of 139 chapters have a `problemset.json` (calculus 13, linear-algebra 12,
statistics 10, probability 6 of 9). 98 to go. Each sheet: 12 fresh problems,
about 100 minutes, a mix of computation / proof / sketch / critique, validated
by `npm run content:problemsets`. Do not recycle `questions.json` items.

## 6. Validators to add

- Duplicate anchor ids (158 corpus-wide) and cross-references that name a
  result which does not exist.
- `index.json` consistency: 47 chapters disagree between
  `topics/<id>/index.json` and the subject index, and two chapters carry two
  different titles. The loader prefers the topic file; the validator should
  refuse the disagreement.

## 7. Later

- External sources: link out (never copy) to open texts once every chapter
  has its own sheet. CC BY (OpenStax, Open Logic, forall x) are cleanest;
  CC BY-SA/GFDL (Hefferon, Judson, Levin, Lebl, OpenIntro, Grinstead–Snell)
  need share-alike; MIT OCW is BY-NC-SA; Paul's Notes, MacKay, Book of Proof
  (BY-ND) are link-only. Add a LICENSE file before mixing in any share-alike
  material.
- Visuals: a review page listing every figure per chapter with a Bad / OK /
  Good grade and a note field, feeding fixes back one figure at a time.
