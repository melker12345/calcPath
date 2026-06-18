# TODO

- [ ] Optimize the home page (shell, bg blur-in, defer parallax)
- [ ] Fix styling touch-up for `/feedback`
- [ ] Fix styling touch-up for `/diagnostic`
- [ ] Fix styling touch-up for `/account`
- [ ] Validate every topic explanation is highest quality
- [ ] Remove sync feature from `/sync` (keep it only on `/account`)
- [ ] Fix practice feedback UI styling on dark theme ("Not quite / Hint / Solution / Answer")
- [ ] Make the math input area a fixed size across all states
- [ ] Test answering every question both correctly and incorrectly
- [ ] Validate answers accept equivalent forms (exact value AND expression)
- [ ] Test LaTeX rendering across all text on the site
- [ ] Test MDX rendering across all text on the site
- [ ] Test other features

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
