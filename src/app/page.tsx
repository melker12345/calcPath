export default function Home() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-black dark:to-purple-950/20" />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 dark:from-blue-900/30 dark:to-purple-900/30">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                CalcPath
              </p>
            </div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl dark:from-blue-400 dark:to-purple-400">
              Learn calculus with guided practice, streaks, and structured paths.
            </h1>
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-300">
              Start free with 120+ calculus problems. Upgrade for learning paths,
              streak tracking, and community discussions.
            </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
              href="/practice"
            >
              Start practicing →
            </a>
            <a
              className="rounded-full border-2 border-blue-200 bg-white px-6 py-3 font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-100 dark:hover:bg-blue-950"
              href="/modules"
            >
              Read modules
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm transition hover:shadow-md dark:border-blue-800 dark:from-zinc-900 dark:to-blue-950/30">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Problems</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">120+</p>
            </div>
            <div className="group rounded-2xl border border-purple-200 bg-gradient-to-br from-white to-purple-50 p-5 shadow-sm transition hover:shadow-md dark:border-purple-800 dark:from-zinc-900 dark:to-purple-950/30">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Topics</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">6</p>
            </div>
            <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition hover:shadow-md dark:border-emerald-800 dark:from-zinc-900 dark:to-emerald-950/30">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Learning paths</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">3</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 rounded-3xl border border-gradient-to-br from-blue-200 to-purple-200 bg-white p-8 shadow-xl dark:border-none dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-2xl text-white shadow-lg">
              ∫
            </div>
            <h2 className="text-2xl font-bold">What you get</h2>
          </div>
          <ul className="space-y-4 text-base">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">✓</span>
              <span className="text-zinc-700 dark:text-zinc-200">Guided calculus practice with instant feedback</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">✓</span>
              <span className="text-zinc-700 dark:text-zinc-200">Topic-level mastery and accuracy insights</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">✓</span>
              <span className="text-zinc-700 dark:text-zinc-200">Learning paths built for AP Calc AB and beyond</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">✓</span>
              <span className="text-zinc-700 dark:text-zinc-200">Streaks, reminders, and weekly goals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-700 dark:from-blue-900 dark:to-purple-900 dark:text-blue-300">✓</span>
              <span className="text-zinc-700 dark:text-zinc-200">Community forum for questions and clarifications</span>
            </li>
          </ul>
          <a
            className="block w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-center font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
            href="/dashboard"
          >
            Go to dashboard →
          </a>
        </div>
      </section>
    </div>
    </div>
  );
}
