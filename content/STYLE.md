# House style: writing a module that reads like a math book

The complaint this guide answers is that explanations read as *one long text*. A
textbook reads differently for reasons that are concrete and reproducible, and
this file records them as rules you can apply to any `module.mdx`.

Two calculus chapters are written to this standard and are the reference
implementation:

- `content/calculus/topics/limits/module.mdx`
- `content/calculus/topics/derivatives/module.mdx`

---

## 1. Separate statements from discussion

A textbook alternates between *statements* — definitions, theorems, examples,
which are set apart, labelled and numbered — and *discussion*, the prose that
motivates and unpacks them. A wall of paragraphs blurs the two, so the reader
cannot tell what they must remember from what merely helped them get there.

Write statements inside an environment fence:

```mdx
:::definition[Derivative at a point]{#derivative-definition}
Let $f$ be defined on an open interval containing $x$. The derivative of $f$ at
$x$ is

$$f'(x) = \lim_{h\to 0} \frac{f(x+h)-f(x)}{h},$$

whenever this limit exists.
:::

:::theorem[Differentiability implies continuity]
If $f$ is differentiable at $a$, then $f$ is continuous at $a$.
:::

:::proof
For $x \neq a$ write $f(x) - f(a) = \frac{f(x)-f(a)}{x-a}\cdot(x-a)$ and let $x \to a$.
:::
```

`[Title]` and `{#id}` are both optional; the id gives the statement a stable
anchor to link to. Environments do **not** nest — an example and its solution are
two consecutive fences, not one inside the other.

### The available environments

| Fence | Renders as | Numbered | Use it for |
|---|---|---|---|
| `:::definition` | Definition 4.1 | yes | the precise meaning of a term, stated once |
| `:::theorem` | Theorem 4.2 | yes | a result that carries weight and is referred back to |
| `:::lemma` / `:::proposition` / `:::corollary` | Lemma 4.3, … | yes | supporting or derived results |
| `:::example` | Example 4.4 | yes | a problem statement, one idea at a time |
| `:::recipe` | Method 4.5 | yes | a procedure with steps, e.g. logarithmic differentiation |
| `:::proof` | *Proof.* … ∎ | no | why the preceding statement is true |
| `:::solution` | *Solution.* … □ | no | the worked steps for the preceding example |
| `:::intuition` | INTUITION aside | no | the plain-English picture (what `**ELI5**` used to be) |
| `:::remark` / `:::note` / `:::notation` | aside | no | a side comment, a notational convention |
| `:::pitfall` | aside, amber rule | no | a specific trap, in place |
| `:::summary` | aside | no | the section's results gathered in one place |

Numbering is automatic: one counter runs through the whole topic, so a reader
sees Definition 4.1, Theorem 4.2, Example 4.3 in order, and it renumbers itself
when you insert something. Never write the number yourself.

## 2. Display the equations that matter

An equation buried mid-sentence reads as prose; the same equation on its own
line reads as a result. If a formula is worth remembering, give it a line:

```mdx
The formal definition is

$$f'(a) = \lim_{h\to 0} \frac{f(a+h)-f(a)}{h},$$

which says: zoom in until the curve looks straight, then measure the slope.
```

Keep `$inline$` math for symbols and small fragments — $f'(a)$, $x < 3$, $\ln x$
— and lift anything with a fraction, a limit, a sum or an integral out of the
sentence. A paragraph that is *only* an equation is displayed automatically.

A paragraph of the form `Power rule: $\frac{d}{dx}x^n = nx^{n-1}$` is also
recognised: the label is set as a run-in head and the formula is displayed. That
rescue exists for the modules not yet converted; in new writing, prefer a fence
or an explicit `$$…$$`.

## 3. Say it once, in the right order

The rhythm of a section is: state, explain, illustrate, warn.

1. **State** the definition or theorem in a fence.
2. **Explain** it in two or three paragraphs of prose — what it means, why the
   hypotheses are there, what breaks without them.
3. **Illustrate** with `:::example` + `:::solution`.
4. **Warn** with `:::pitfall` where a specific trap lives, or leave it to the
   chapter's Common Mistakes list.

Cut anything that repeats a point already made. Long explanations feel long
mostly because the same idea is restated three times in different words; a book
says it once, precisely, and moves on.

## 4. Number and cross-reference

Because environments are numbered, you can write "by Theorem 4.2" instead of "as
we saw above". Say which result you are using — it teaches the reader that
results have names and are reusable.

## 5. Keep the structural invariants

These are enforced by `npm run content:validate` and must not drift:

- Every `## Section` keeps its `<!-- section: slug -->` marker (or `{#slug}`).
  Question banks reference those slugs; changing one silently breaks per-section
  progress and deep links.
- Section titles may be rewritten freely; slugs may not.
- Fences must be closed, must not nest, and must use a known kind.

Run before committing:

```bash
npm run content:validate   # schemas, section slugs, environment fences
npm run content:latex      # every $…$ fragment renders under KaTeX
```

## 6. Converting an existing module

Work section by section:

1. Find the sentence that *defines* the term and lift it into `:::definition`.
2. Find the sentences that state a *rule* and lift them into `:::theorem`, with
   the formula displayed. Add a `:::proof` when it is two or three lines; a
   short proof is what makes a book feel like a book rather than a formula sheet.
3. Turn each `**Worked Example: Title**` block into `:::example[Title]` (the
   problem, one or two sentences) followed by `:::solution` (the steps). Drop
   "Step 1:" prefixes — the list numbers itself.
4. Turn each `**ELI5**` block into `:::intuition`.
5. Re-read the remaining prose and delete the repetition the structure exposes.

Unconverted modules keep working: `**ELI5**` and `**Worked Example:**` are still
parsed, and the existing prose still gets book typography, run-in heads and
displayed equations. Conversion is what adds numbered, referable statements.
