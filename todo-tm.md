# Tomorrow: question refinement

Written 2026-09-17. Everything below was measured, not estimated — the commands
to re-measure are included so nothing has to be taken on trust.

State when this was written: `dev` is 170 commits ahead of `master`, nothing
pushed, all five content gates green, build/typecheck/lint clean. 12,959 live
questions (registry holds 14,884 ids including retired ones).

---

## 1. MCQ answers are almost always option A — the big one

**1,588 of 1,637 MCQs (97%) store the correct answer as the first choice.**

```
position of correct answer:   A: 1588    B: 41    C: 6    D: 2
```

The UI does not shuffle: `src/components/generic-practice-experience.tsx:443`
renders `current.choices?.map(...)` in stored order, and there is no `shuffle`
or `Math.random` anywhere in the practice code. Confirmed in a real browser —
the first question of `mathematical-logic/computability` shows its correct
answer at the top of the list.

**A learner who always picks the first option scores 97% on every multiple
choice question in the corpus.** This affects all 15 subjects and predates
today's work.

### Preferred fix: deterministic shuffle at render time

Shuffle the choices keyed on the question id (e.g. a small string hash seeding
the permutation), applied where the choices are rendered.

Why this rather than rewriting the data:
- one change fixes all 1,637 at once, and every future question bank;
- keyed on the id, the order is *stable* for a given question — a learner who
  returns to it sees the same layout, so "I picked B" keeps its meaning;
- grading is unaffected: `isMcqAnswerCorrect(choice, current.answer, ...)`
  compares values, not positions.

Watch out for: the review/feedback panel (`PracticeFeedback.tsx`) and anything
that renders the choices a second time must use the *same* permutation, or the
correct answer will be highlighted in the wrong row after submission.

### Re-measure

```bash
npx tsx -e "
const fs=require('fs');const pos={};
for(const s of fs.readdirSync('content')){const d='content/'+s+'/topics';if(!fs.existsSync(d))continue;
for(const c of fs.readdirSync(d))for(const q of JSON.parse(fs.readFileSync(d+'/'+c+'/questions.json','utf8')))
 if(q.type==='mcq'){const i=(q.choices||[]).indexOf(String(q.answer));if(i>=0)pos[i]=(pos[i]||0)+1;}}
console.log(pos);"
```

---

## 2. Length tell — the correct choice is the longest one

**508 of 1,637 MCQs (31%)** have a correct choice longer than every distractor
by more than 25 characters. Worst affected:

| subject | count |
|---|---|
| mathematical-logic | 122 |
| geometry | 82 |
| information-theory | 76 |
| combinatorics | 62 |
| precalculus | 59 |
| algebra | 51 |

This one needs content edits, not code — distractors want padding out to match,
or the correct answer trimming. Lower priority than 1, but it is the second
free signal a test-wise learner gets.

---

## 3. Two one-off oddities

- `geometry/transformations-symmetry` `geom-refl-7` — only **2 choices**; every
  other MCQ in the corpus has 3+.
- `geometry/triangles` `geom-similarity-3` — contains a **"none/all of the
  above"** option, the only one in the corpus. `content/questions.md` implies
  these should not exist.

---

## 4. Layout: dead space under MCQ choices

On a multiple-choice question the answer panel keeps the height reserved for the
numeric keypad, leaving roughly 500px empty below the last choice at 1280px
wide. Not broken — mobile (390px) is fine, choices wrap cleanly, KaTeX renders
in both prompts and choices, no horizontal scroll — just loose.

Screenshots were taken with system Chromium; no Playwright/Puppeteer is
installed, but this works:

```bash
PORT=3318 npm start &                      # never use :3000, that is the dev server
chromium --headless --disable-gpu --no-sandbox --virtual-time-budget=6000 \
  --window-size=1280,1000 --screenshot=out.png \
  "http://localhost:3318/mathematical-logic/practice/computability"
```

---

## 5. Already verified clean — do not re-audit

Across all 12,959 questions: no answer missing from its own choice list, no
duplicate choices, no unbalanced `$` in any prompt or choice, no missing
explanation, no missing difficulty, no prompt over 600 chars, no numeric answer
too long to type, and the prose-answer sweep reports zero (it is now a hard
failure in `content:answers`).

---

## Not questions, but queued behind this

From the seven-subject audit, in the order I would do them:

1. **Validators** — duplicate anchor ids (158 corpus-wide), cross-references
   naming results that do not exist, and `index.json` consistency (47 chapters
   disagree between `topics/<id>/index.json` and the subject index; `loader.ts`
   prefers the topic file while `ARCHITECTURE.md` says the opposite, and two
   chapters have two different titles).
2. **~25 confirmed wrong-mathematics items** — Cauchy's theorem missing in
   abstract-algebra (one proof is invalid without it), elliptic geometry stated
   as keeping Euclid's first four postulates, λ(510510) given as 144 (it is 240,
   and the repo's own answer key says 240), the arcsec derivative missing its
   absolute value, the Gram–Schmidt ↔ Orthogonal Decomposition circularity,
   the markov-chains existence↔return-time↔ergodic circularity.
3. **Missing vocabulary** — `limsup`/`liminf` (37 uses, never defined), uniform
   convergence (a whole missing chapter), functions/relations in set theory
   (62 uses, never defined), radian measure in precalculus (and the diagnostic
   grades students on it).
4. **~40 over-consolidated chapters** across 9 subjects.
5. **~2,500 questions** to bring every section to 10+.

Subjects still on hold at the user's request: **precalculus, algebra, geometry**.
Algebra and geometry need splitting before any rebuild — 172 and 155 sections
respectively, one algebra chapter has 39 sections and 10 Common Mistakes blocks.
