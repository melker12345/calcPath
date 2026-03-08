# CalcPath

A free calculus learning platform with in-depth modules, practice problems, structured learning paths, streaks,
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
- Learning paths
- Community forum
- Flash cards for rules and formulas
- Analytics capture via `/api/track`

### Business Model
- **Everything is free** — no paywalls, no tiers
- Auth (Supabase) is optional, used only for progress tracking
- Voluntary donations via Stripe one-time payments

## Testing

```bash
npm run test
```

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Math rendering**: KaTeX
- **Auth**: Supabase (for progress tracking)
- **Donations**: Stripe (one-time payments)
- **Testing**: Vitest

## Roadmap

- [ ] Spaced repetition algorithm
- [ ] Adaptive difficulty
- [ ] More topics (Statistics, Linear Algebra, Discrete Math)
- [ ] Diagnostic test with learning path suggestions
- [ ] Email reminders
