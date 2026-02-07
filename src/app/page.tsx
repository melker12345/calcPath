import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          {/* Fun badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-lg">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-semibold text-orange-800">120+ practice problems!</span>
          </div>
          
          <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight text-orange-950 md:text-6xl">
            Calculus doesn't have to be 
            <span className="relative">
              <span className="relative z-10 text-transparent bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text"> scary!</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round"/>
                <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f97316"/><stop offset="100%" stopColor="#f43f5e"/></linearGradient></defs>
              </svg>
            </span>
          </h1>
          
          <p className="mb-10 max-w-xl text-xl text-orange-800">
            Learn step by step with instant feedback, fun streaks, and a supportive community. You've got this! 💪
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link 
              href="/practice"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-orange-200 transition hover:scale-105 hover:shadow-2xl"
            >
              <span>Start learning</span>
              <span className="text-2xl">🚀</span>
            </Link>
            <Link 
              href="/modules"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-orange-800 shadow-lg transition hover:shadow-xl"
            >
              <span>See modules</span>
              <span className="text-2xl">📚</span>
            </Link>
          </div>
        </div>

        {/* Fun floating elements */}
        <div className="absolute left-10 top-32 hidden text-6xl opacity-20 md:block">∑</div>
        <div className="absolute right-10 top-40 hidden text-5xl opacity-20 md:block">∫</div>
        <div className="absolute bottom-20 left-20 hidden text-4xl opacity-20 md:block">∂</div>
      </section>

      {/* Stats Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { emoji: "📝", value: "120+", label: "Fun problems", color: "from-orange-100 to-amber-100 border-orange-200" },
            { emoji: "🎓", value: "6", label: "Topics to master", color: "from-rose-100 to-pink-100 border-rose-200" },
            { emoji: "🛤️", value: "3", label: "Learning paths", color: "from-violet-100 to-purple-100 border-violet-200" },
          ].map((stat, i) => (
            <div key={i} className={`rounded-3xl border-2 ${stat.color} bg-gradient-to-br p-8 text-center shadow-lg transition hover:scale-105`}>
              <span className="mb-2 block text-4xl">{stat.emoji}</span>
              <p className="text-4xl font-extrabold text-orange-900">{stat.value}</p>
              <p className="text-sm font-medium text-orange-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-4xl">✨</span>
            <h2 className="mb-4 text-4xl font-extrabold text-orange-950">
              Why you'll love it
            </h2>
            <p className="text-xl text-orange-700">
              Everything you need to succeed, nothing you don't.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "⚡", title: "Instant feedback", desc: "Know if you're right in seconds!", bg: "bg-amber-50" },
              { emoji: "🎯", title: "Step-by-step help", desc: "We break down every solution.", bg: "bg-rose-50" },
              { emoji: "📈", title: "Track your progress", desc: "Watch your skills grow!", bg: "bg-violet-50" },
              { emoji: "🔥", title: "Build streaks", desc: "Stay motivated day after day.", bg: "bg-orange-50" },
              { emoji: "👥", title: "Friendly community", desc: "Get help when you're stuck.", bg: "bg-pink-50" },
              { emoji: "🏆", title: "Earn mastery", desc: "Level up topic by topic.", bg: "bg-emerald-50" },
            ].map((feature, i) => (
              <div key={i} className={`rounded-3xl ${feature.bg} p-8 transition hover:scale-105 hover:shadow-lg`}>
                <span className="mb-4 block text-4xl">{feature.emoji}</span>
                <h3 className="mb-2 text-xl font-bold text-orange-900">{feature.title}</h3>
                <p className="text-orange-700">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-4xl">💬</span>
          <h2 className="text-4xl font-extrabold text-orange-950">
            Happy learners
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            { quote: "CalcPath made calculus actually fun! I went from dreading homework to looking forward to it.", name: "Sarah M.", role: "High School Senior", emoji: "🎉" },
            { quote: "The streaks keep me motivated every day. I've learned more in a month than a whole semester!", name: "Marcus T.", role: "College Freshman", emoji: "🔥" },
            { quote: "Finally I understand WHY calculus works, not just how. Game changer!", name: "Emily R.", role: "Engineering Student", emoji: "💡" },
          ].map((t, i) => (
            <div key={i} className="rounded-3xl border-2 border-orange-100 bg-white p-8 shadow-lg">
              <span className="mb-4 block text-4xl">{t.emoji}</span>
              <p className="mb-6 text-lg text-orange-800">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-orange-900">{t.name}</p>
                  <p className="text-sm text-orange-600">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-rose-500 p-12 text-center shadow-2xl md:p-16">
          <span className="mb-6 inline-block text-6xl">🎓</span>
          <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
            Ready to become a calculus pro?
          </h2>
          <p className="mb-8 text-xl text-orange-100">
            Join thousands of students crushing it every day!
          </p>
          <Link 
            href="/practice"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-orange-600 shadow-xl transition hover:scale-105"
          >
            <span>Let's go!</span>
            <span className="text-2xl">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
