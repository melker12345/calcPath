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

## General ideas (not thought out.)

### Linking external reasourses.
We should for each topic link to external reasourses like youtube videos or other well structured explenations of that topic.


### Topics home page (/calculus /statistiks etc.)

Should all have a rotating problem that is displayed.
We should show a problem and its solution in detail
By rotating I mean it should not be one static problem, say we allocate 5 questions that on page reload alternates.

### Font size 

It would be great if we had like a button "assesible" that reloaded the page with new css.
This would emphezise on makinging text ledgible, styled like Wikipedia no animations fancy colors etc. 
This could also serve as a function for allowing the user to set what font size they want - one setting dictates the size of the smallest latax to be no less then X, the other latax and normal text has to adjust to this minimum.
So this might entail us setting up different "schemas" for text size. meaning if smallest latext is of size X normal text is F(X) etc. to make the text legability more adjustible for the users. 


### 

# Website Tasks & Improvements

okay now we need to update some "meta" text on the site to reflect the correct amount of questions and chapters like in the text  
"6 topic modules. 240+ practice problems — each with step-by-step solutions. Free to read. No account required." etc.

Also we have some smaller css fixes:
- Font on the home page needs to not be the font for /calculus
- The following SectionCard needs to be restyled a touch to match the calculus pattern better.
- We also need to fix some small things on mobile
- The buttons on /calculus need to get centered when stacked next to each other as it occupies too much screen width
- The footer on mobile needs to be better, one thing could be to right-align the links on the right-hand side so that the UX on mobile becomes better.
- And as for the MathInput on mobile there are a couple of things that we could improve:

1. The user should not have to scroll to press next question, this can be fixed by changing the "correct answer" into a model that replaces the math input area but does not cover the question.  
   so that the user can view the question and all actions on same screen for reflecting - this should be a general rule for any place that the user inputs stuff, i.e. that the question is visible when the user inputs.  
   also the user should not have to scroll when the user presses "hint", when "not quite" appears nor when the "correct answer" appears, for the aforementioned scenarios the user should be able to see the question without having to scroll, this is important

2. The number buttons on the math input need to be more square.

3. there is too large of a gap between the bottom of the math input area and the footer.

**More of niceties than things to focus on**

1. It would be nice if there was a button to switch to "draw" where the user can write some math with their fingers on mobile/tablets.

2. Allowing the user to set the absolute minimum font and have the rest of the fonts across the whole site adjust. so we have some preset font-sizes for all fonts and when the user adjusts it in their profile page all fonts get adjusted this includes starting page, topics page and all of the other pages.  
   I'm thinking we define the absolute smallest size some latex character can be and adjust the rest based on it.  
   To build on this we could allow the user to load a more "simple" theme that applies more of a wikipedia styling to all pages where we remove completely the focus on "how good" things look and simply focus on making everything easily readable and interactable, no fancy colors, animations, rounded borders, fancy stuff.

3. Allow users to print the text content/explanations to paper well formatted - this includes questions.  
   A button on each module at the top "print" that allows the user to print the contents of the explanations as well as the questions if they want