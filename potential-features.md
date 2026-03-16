## Here are some features I want added.


## Main features.

### Explanation swapout 

Why:
Text sections in a module might be explaining the consept in a way the user do not understad.
This is why we might want a button for some sections that renders an other explenation.

Explanation:
We explain topic A.
We might initially load explanation of A in format A1,
But if the user struggles to understand what is meant by A1 we offer the user to load A2.

Negative:
This would mean for each explenation we store multiple verions.

Bennefit:
We would also have the ability to track wich explenations are best from user input
E.g. Was this explenation better or worse. 


### Feedback loop

#### The problem

Explanations are currently written with LLM assistance and manual review. LLMs are good at producing technically correct, conventional explanations — but "technically correct" and "actually good for learning" are not the same thing. Manual review helps, but one person reviewing content they are still learning themselves is not a reliable quality gate. The explanations need to be validated by the people actually using them.

#### The idea

Two feedback mechanisms, working together:

1. **Quick signal (+1 / -1)** — Every explanation section gets a small "Was this helpful?" vote. Low friction, high volume. Over time this surfaces which explanations land well and which don't. Combined with the explanation swapout feature (multiple versions per section), this creates a natural selection process: the version users prefer floats to the top.

2. **Structured suggestions** — A form where users can propose rewording, flag errors, suggest new topics, or report confusing questions. This is higher friction but captures the kind of feedback that voting can't: "this step skips over why we can cancel (x-3)" or "this would make more sense if you showed a graph first."

#### Concerns and tradeoffs

- **Qualification gap**: You don't need to be an expert to manage this. The +1/-1 data speaks for itself — if version A2 consistently outperforms A1, that's objective. For written suggestions, you review them for coherence and correctness, but the community signal does the heavy lifting over time.
- **Stability vs. improvement**: Explanations shouldn't change under people mid-study. Solution: version explanations. When a better version is promoted, existing users who started with version A1 keep seeing A1 for that session/topic. New users get the better version. No rug-pulling.
- **Bad feedback risk**: A user submits a suggestion that seems good but turns out to be worse. Mitigated by: (a) never deploying a suggestion without review, (b) A/B testing new versions with the +1/-1 signal before fully replacing the old one.
- **Cold start**: With few users, voting data is noisy. Early on, lean more on manual review. As traffic grows, the signal gets reliable.

#### The loop

The positive feedback loop: better explanations → users learn more → users give better feedback → explanations improve further. This compounds over time and is a genuine moat — content shaped by real learner data is hard to replicate.

---

#### Implementation plan

**Phase 1 — Quick votes (build first, lowest effort, highest value)**

Where: a small thumbs up/down appears at the bottom of each explanation section in modules and each worked example.

Data model:
```
explanation_votes {
  id: uuid
  user_id: uuid | null          -- null for anonymous
  section_key: string           -- e.g. "limits.lhopital.body" or "limits.lhopital.example.1"
  variant: string               -- e.g. "A1", "A2" (for when swapout exists)
  vote: +1 | -1
  created_at: timestamp
}
```

Flow:
1. User reads an explanation section.
2. At the bottom: "Was this helpful?" with thumbs up / thumbs down.
3. Vote is stored. One vote per user per section (upsert). Anonymous users use localStorage to prevent repeat votes.
4. Admin dashboard (or simple SQL query) shows net score per section, sorted by worst-performing.

**Phase 2 — Structured suggestions**

Where: a "Suggest an edit" or "Report issue" link below each section, and a general feedback form accessible from the footer or account page.

Data model:
```
feedback_submissions {
  id: uuid
  user_id: uuid | null
  section_key: string | null    -- null for general feedback
  type: "rewrite" | "error" | "suggestion" | "new_topic" | "question_issue"
  body: text
  status: "pending" | "reviewed" | "accepted" | "rejected"
  created_at: timestamp
}
```

Flow:
1. User clicks "Suggest an edit" on a section, or opens the general feedback form.
2. They pick a category (rewrite, error, suggestion, etc.) and write their feedback.
3. Submission goes to `feedback_submissions` with status "pending."
4. You review submissions periodically. Accept, reject, or use as inspiration for a new explanation variant.

**Phase 3 — Explanation swapout + A/B testing (ties into the swapout feature)**

Once both votes and multiple explanation variants exist:
1. New users are randomly assigned variant A1 or A2 for a given section.
2. Vote data accumulates per variant.
3. When one variant has a statistically meaningful lead (e.g. >60% positive with 30+ votes), promote it as the default.
4. Keep the losing variant available via the "Show another explanation" button — some users may still prefer it.

**Priority order**: Phase 1 → Phase 2 → Phase 3. Phase 1 alone gives you actionable data. Phase 2 gives you qualitative insight. Phase 3 is the full loop but depends on the explanation swapout feature existing first.


---


### Linking external reasourses.
We should for each topic link to external reasourses like youtube videos or other well structured explenations of that topic.


### Topics home page (/calculus /statistiks etc.)

Should all have a rotating problem that is displayed.
We should show a problem and its solution in detail
By rotating I mean it should not be one static problem, say we allocate 5 questions that on page reload alternates.



---


# The Comprehensive Calculus Roadmap (Essential +) – Revised

## 1. Foundations & Limits
* **1.1 Functional Representations:** Understanding how to model data (linear, power, periodic, **exponential growth/decay**, and basic inverse functions) **(Expanded)**
* **1.2 The Limit Concept:** Defining how a function behaves as it approaches a specific point.
* **1.3 Continuity:** The formal rules for "unbroken" curves and the Intermediate Value Theorem.
* **1.4 Limits at Infinity:** Determining horizontal asymptotes and long-term behavior.

## 2. The Derivative (Differential Calculus)
* **2.1 Derivatives and Rates of Change:** The transition from average slope to instantaneous velocity.
* **2.2 Differentiation Rules:** Power, Product, and Quotient rules.
* **2.3 Derivatives of Transcendental Functions:** Essential rules for $e^x$, $\ln(x)$, trigonometry, and **inverse trigonometric functions** **(Added)**
* **2.4 The Chain Rule:** The most critical tool for differentiating composite functions.
* **2.5 Implicit Differentiation:** Finding the slope of shapes that aren't simple functions (like circles or ellipses).
* **2.6 Linear Approximations and Differentials:** Using derivatives for quick estimates and error analysis **(Added)**
* **2.7 Inverse Functions, Logarithms, and Hyperbolic Functions (Intro):** Managing exponential growth/decay and basic hyperbolic rules **(Expanded)**

## 3. Applications of the Derivative
* **3.1 Related Rates:** How the change in one variable affects another (e.g., water level rising as volume increases).
* **3.2 Maximum and Minimum Values:** Finding the "peaks and valleys" of a function.
* **3.3 The Mean Value Theorem:** The theoretical backbone of calculus.
* **3.4 L’Hôpital’s Rule:** A powerful shortcut for solving "indeterminate" limits (like $0/0$).
* **3.5 Optimization Problems:** Applying derivatives to find the most efficient path, lowest cost, or maximum area.
* **3.6 Newton’s Method:** Using calculus to find roots numerically, with basic error considerations **(Expanded)**
* **3.7 Rates of Change in Sciences and Modeling (Intro):** Brief examples from physics, biology, and economics **(Added)**

## 4. The Integral (Integral Calculus)
* **4.1 The Definite Integral:** Calculating total accumulation (area) using Riemann Sums.
* **4.2 The Fundamental Theorem of Calculus:** The formal link between the derivative and the integral.
* **4.3 The Substitution Rule ($u$-sub):** The primary technique for simplifying integrals.
* **4.4 Integration by Parts:** The essential method for integrating products of functions.
* **4.5 Advanced Integration Techniques:** Partial fractions for rational functions and trigonometric substitution (essentials only) **(Added)**
* **4.6 Improper Integrals:** Dealing with areas that extend to infinity—critical for probability and statistics.

## 5. Applications of Integration
* **5.1 Areas Between Curves:** Finding the space enclosed by two or more functions.
* **5.2 Volumes of Solids:** Using the Disk, Washer, and Shell methods to calculate 3D volume.
* **5.3 Arc Length:** Calculating the actual distance along a curved path.
* **5.4 Parametric Equations (Intro):** Derivatives, integrals, and arc length for parametric curves **(Added)**
* **5.5 Differential Equations (Intro + Modeling):** Modeling growth/decay ($y' = ky$), separable equations, **direction fields, Euler's method (numerical intro), and basic population models** **(Expanded)**

## 6. Sequences and Series
* **6.1 Infinite Sequences & Series:** Determining if an infinite list of numbers sums to a finite value.
* **6.2 Convergence Tests:** The Ratio, Root, Integral, and **Comparison/Alternating Series tests** **(Expanded)**
* **6.3 Power Series:** Representing functions as "infinite polynomials."
* **6.4 Taylor and Maclaurin Series:** Approximating complex curves (like $\sin x$) for computers, physics, and error bounds **(Expanded)**

## 7. Multivariable & Vector Calculus
* **7.1 Vectors & Geometry of Space:** Dot products, cross products, and 3D coordinate systems.
* **7.2 Vector Functions:** Describing motion, velocity, and acceleration in 3D space; **parametric surfaces intro** **(Expanded)**
* **7.3 Partial Derivatives:** Finding the slope of a surface in the $x$ or $y$ direction; **limits/continuity in multiple variables** **(Added)**
* **7.4 The Gradient Vector & Optimization:** Direction of steepest ascent; **constrained optimization with Lagrange multipliers (essentials)** **(Expanded)**
* **7.5 Multiple Integrals:** Calculating volume, mass, and center of gravity for 3D objects; **polar, cylindrical coordinates for simplification** **(Added)**
* **7.6 Vector Fields & Line Integrals:** Calculating the "Work" done by a force over a specific path.
* **7.7 Green’s, Stokes’, and Divergence Theorems:** The "Grand Unified Theory" of calculus; **curl and divergence interpretations with physical examples (fluid flow, etc.)** **(Expanded)**