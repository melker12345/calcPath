export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            CalcPath
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Learn calculus with guided practice, streaks, and structured paths.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Start free with 120+ calculus problems. Upgrade for learning paths,
            streak tracking, and community discussions.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn-primary" href="/practice">
              Start practicing
            </a>
            <a className="btn-secondary" href="/pricing">
              View pricing
            </a>
            <a className="btn-secondary" href="/modules">
              Read modules
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">Problems</p>
              <p className="text-2xl font-semibold">120+</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">Topics</p>
              <p className="text-2xl font-semibold">6</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">Learning paths</p>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">What you get</h2>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Guided calculus practice with instant feedback</li>
            <li>Topic-level mastery and accuracy insights</li>
            <li>Learning paths built for AP Calc AB and beyond</li>
            <li>Streaks, reminders, and weekly goals</li>
            <li>Community forum for questions and clarifications</li>
          </ul>
          <a className="btn-primary w-full text-center" href="/dashboard">
            Go to dashboard
          </a>
        </div>
      </section>
    </div>
  );
}
