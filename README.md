# CalcPath

Calculus learning SaaS with in-depth modules, free practice, structured learning paths, streaks,
and community forums.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

### Content
- **6 comprehensive calculus modules** with LaTeX-rendered explanations:
  - Limits & Continuity (with L'Hôpital's Rule)
  - Derivatives (with implicit differentiation)
  - Integrals (with substitution, integration by parts, partial fractions)
  - Applications of Derivatives
  - Series & Sequences (with alternating series, p-series, Taylor series)
  - Differential Equations (separable, linear, second-order)
- **120+ practice problems** with instant feedback
- Worked examples and common mistakes for each topic

### Learning Tools
- Progress tracking with topic-level mastery
- Streak tracking and goals
- Learning paths (free and paid)
- Community forum (Pro plan)
- Analytics capture via `/api/track`

## Testing

```bash
npm run test
```

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Math rendering**: KaTeX
- **State**: Local storage (auth + progress)
- **Testing**: Vitest

## Roadmap

- [ ] Real authentication (NextAuth/Clerk)
- [ ] Stripe subscriptions + webhooks
- [ ] Database persistence (Postgres/Prisma)
- [ ] Spaced repetition algorithm
- [ ] Adaptive difficulty
- [ ] Email reminders

## Notes

- Authentication and billing are mocked with local storage for the MVP.
- Replace the mock billing in `src/app/pricing/page.tsx` with Stripe when ready.




## Brain storming

So how do i think so far?
This is a very good start but the questions needs to be more diverse and differ.
We need more questions.

Answers should not be displayed instantly on wrong answer. 
We should provide a hint if the answer is wrong then the user should see a get hint button.
(we should also track how many hints are used these should be marked as incorrect since answer is provided).

We could add flash cards for rules and formulas in Dashboard.

After answering all the practice questions the user should see a celebratory screen indicating they have answered all questions.
Preferably we should have so many questions that the user never runs out of practice questions.

If the test is passed with 100% for a module we should keep track of that.
We could add like token that floats in the background of all pages (except test pages), 
this token is like a achievement emblem it does nothing just visual.
It should not disturb the content on the page nor be distracting to the user.




Fixes:
- The ^ button on the input does not work as it should.


- Input
  We could also clean up the input a bit I'm thinking we restructure the calculator input section to have the category ("123", "Trig", "Var", "Tools").
  Under that we can have a suggested section,
  This contains variables, trig etc based on the question and is unique to the question so if the question have the variable e we might suggest the var e. 

  Under this we have the "normal calculator interface" containing the operators and numbers and decimal etc.
  Under this we have the clear delete and check 

  This is to simplify for the user resulting in better UX.
  There is no need to clutter the input section with things that are not needed but we need to keep the options available for the user.


- We could also include some visuals in the modules for better explanations.



Some Notes:
I'm thinking we have the modules free and available to everyone, the practice questions, tests, dashboard are for paying costumers.

Free:
  - Read modules

Paid:
 - Practice
 - Dashboard
 - Learning paths
 - Tests


Potential features:
 - More topics like Algebra, linear Algebra, discrete math,
 - Diagnostic test mixture of all topics and then suggests learning paths, this can get complicated so this is for the future.

Also we should have tests containing a list of questions that we only provide for tests and not as practice questions.

The progress tracks test results 
The streaks tracks practice and tests 

We should make it more clear that the user is practicing vs taking a test this can be done by adding a screen that confirms beginning of test. 

I want the test to look different then just the practice questions



Need to fix the results page for test have each category expandible rather then all questions in the 📋 Question Review (19 incorrect).
We could have 
📋 Question Review Easy (4 incorrect/5)
📋 Question Review Medium (6 incorrect/8)
📋 Question Review Hard (9 incorrect/7)
Where each can get expanded.





Today 11 - Feb:

Noticed we need to fix mobile.
And manage subscriptions 
