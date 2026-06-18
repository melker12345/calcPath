# TODO

- [x] Optimize the home page (shell, bg blur-in, defer parallax)
- [x] Fix styling touch-up for `/feedback`
- [x] Fix styling touch-up for `/diagnostic`
- [x] Fix styling touch-up for `/account`
- [ ] Validate every topic explanation is highest quality
- [x] Remove sync feature from `/sync` (keep it only on `/account`)
- [x] Fix practice feedback UI styling on dark theme ("Not quite / Hint / Solution / Answer")
- [x] Make the math input area a fixed size across all states
- [x] Test answering every question both correctly and incorrectly (grader verified over full bank via `npm run content:answers`)
- [x] Validate answers accept equivalent forms (exact value AND expression)
- [~] Test LaTeX rendering across all text on the site (tool added: `npm run content:latex`; ~234 real failures found — fix pending, see note)
- [~] Test MDX rendering across all text on the site (covered by the same KaTeX tool)
- [ ] Test other features

> LaTeX note: `normalizeMathInner` in `src/lib/math-text-normalize.ts` collapses
> the legitimate `\\` matrix/line-break separator to a lone `\`, breaking ~234
> fragments (mostly matrices). Removing the collapse fixes 194 but regresses 13
> genuinely over-escaped fragments, so the fix needs both the shared-code change
> and a few content corrections + browser verification.

---

## Details

### Optimize the home page
- Send a good-quality **shell** first (fast, meaningful initial paint).
- The **background blur can fade/blur in** after the shell loads, rather than blocking it.
- **Parallax effects should not run on the initial page shell load** — defer them so they don't add cost to first paint.

### Styling touch-ups (slight, not a rework)
Small visual polish on:
- `/feedback`
- `/diagnostic`
- `/account`

### Validate topic explanations
- Review each topic's explanation and confirm they are the **highest quality** (clear, correct, well-written).

### De-duplicate the sync feature
- The sync/backup feature currently lives in **both `/sync` and `/account`**.
- Keep it **only on `/account`** — remove it from `/sync` (or remove the `/sync` page).

### Practice feedback UI on dark theme
- The "wrong answer" feedback block currently **looks bad on dark theme**. Example of the content shown:
  ```
  ✗
  Not quite
  Hint
  All exponents.
  Solution
  1
  All exponents 11.
  Answer: Yes
  ```
- Touch up the styling so this reads well in dark mode.

### Fixed-size math input
- The answer/feedback area changes height between states, which is distracting.
  - While inputting an answer: ~**640px**
  - After getting a question wrong: ~**638px**
- Goal: keep the area the **same size regardless of state** — entering an answer, answered wrong, or answered right — so the UI doesn't shift and distract the user.
- Example of a "wrong" state whose height should match the input state:
  ```
  ✗
  Not quite
  Hint
  Divide by.
  Solution
  1
  Divide by 33.
  Answer: 2/3
  ```

### Full correctness pass (answering)
- Test **all aspects** of the app by answering questions **correctly and incorrectly**, and observe whether any issues appear.

### Equivalent answer forms
- Questions should accept **common equivalent forms** of the same answer.
  - e.g. "what is 5 - 2" should accept `3`.
  - For some questions it's more natural to answer with an **expression** rather than the evaluated value — **both should be accepted**.
- Apply this so that, **for all questions**, both the exact value and a natural equivalent expression are accepted.

### LaTeX testing
- Test LaTeX rendering for **all text on the page** (questions, hints, solutions, explanations, UI copy).

### MDX testing
- Same as above but for **MDX** content rendering.

### Other features
- Test any remaining features for issues.
