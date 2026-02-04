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
