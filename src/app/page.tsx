export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/50 to-white dark:from-blue-950/20 dark:via-purple-950/20 dark:to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-20">
        <section className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 shadow-sm dark:from-blue-900/30 dark:to-purple-900/30">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              CalcPath
            </p>
          </div>
          
          <h1 className="mb-6 max-w-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl dark:from-blue-400 dark:to-purple-400">
            Learn calculus with guided practice, streaks, and structured paths.
          </h1>
          
          <p className="mb-10 max-w-2xl text-xl leading-relaxed text-zinc-600 dark:text-zinc-300">
            Start free with 120+ calculus problems. Upgrade for learning paths,
            streak tracking, and community discussions.
          </p>
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <a
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
              href="/practice"
            >
              Start practicing →
            </a>
            <a
              className="rounded-full border-2 border-blue-200 bg-white px-8 py-4 text-lg font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-100 dark:hover:bg-blue-950"
              href="/modules"
            >
              Read modules
            </a>
          </div>
          
          <div className="mb-16 grid gap-6 sm:grid-cols-3">
            <div className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-lg transition hover:shadow-xl dark:border-blue-800 dark:from-zinc-900 dark:to-blue-950/30">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Problems</p>
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">120+</p>
            </div>
            <div className="group rounded-2xl border border-purple-200 bg-gradient-to-br from-white to-purple-50 p-6 shadow-lg transition hover:shadow-xl dark:border-purple-800 dark:from-zinc-900 dark:to-purple-950/30">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Topics</p>
              <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">6</p>
            </div>
            <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-lg transition hover:shadow-xl dark:border-emerald-800 dark:from-zinc-900 dark:to-emerald-950/30">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Learning paths</p>
              <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-100">3</p>
            </div>
          </div>
          
          <div className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-gradient-to-br from-blue-200 to-purple-200 bg-white p-10 shadow-2xl dark:border-none dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-purple-950/50">
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
              className="block w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-center text-lg font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
              href="/dashboard"
            >
              Go to dashboard →
            </a>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
              Loved by students
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              See what learners are saying about CalcPath
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-lg dark:border-blue-900/30 dark:bg-zinc-900">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl text-yellow-400">★</span>
                ))}
              </div>
              <p className="mb-6 text-base text-zinc-700 dark:text-zinc-200">
                "CalcPath helped me go from struggling with derivatives to acing my AP Calc exam. The instant feedback and clear explanations made all the difference!"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-white">
                  S
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Sarah M.</p>
                  <p className="text-sm text-zinc-500">High School Senior</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-lg dark:border-purple-900/30 dark:bg-zinc-900">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl text-yellow-400">★</span>
                ))}
              </div>
              <p className="mb-6 text-base text-zinc-700 dark:text-zinc-200">
                "The learning paths are brilliant. Instead of random problems, I follow a structured plan that builds on each concept. My confidence has skyrocketed."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 font-bold text-white">
                  M
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Marcus T.</p>
                  <p className="text-sm text-zinc-500">College Freshman</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg dark:border-emerald-900/30 dark:bg-zinc-900">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl text-yellow-400">★</span>
                ))}
              </div>
              <p className="mb-6 text-base text-zinc-700 dark:text-zinc-200">
                "Finally, a platform that teaches calculus the right way—step by step with real explanations. The worked examples are gold."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 font-bold text-white">
                  E
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Emily R.</p>
                  <p className="text-sm text-zinc-500">Engineering Student</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="mt-24 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center shadow-2xl">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to master calculus?
          </h2>
          <p className="mb-8 text-xl text-blue-50">
            Join thousands of students improving their calculus skills every day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition hover:scale-105"
              href="/practice"
            >
              Start free now
            </a>
            <a
              className="rounded-full border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
              href="/pricing"
            >
              View pricing
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
