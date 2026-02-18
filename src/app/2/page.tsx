import Link from "next/link";
import { curriculum, homeFaqs, approaches, sampleProblem } from "@/app/_landing-data";
import { VariantNav } from "@/app/_variant-nav";

/*
 * VARIANT 2 — NEON MATH (polished)
 *
 * Dark slate background. Electric cyan accent that glows.
 * The giant ∫ pulses softly behind the hero. Glass cards
 * with frosted edges. Generous whitespace. Tight hierarchy.
 */

const C = {
  bg: "#0b1120",
  card: "rgba(255,255,255,0.035)",
  cardHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderBright: "rgba(255,255,255,0.12)",
  glow: "#22d3ee",
  glowDim: "rgba(34,211,238,0.12)",
  glowFaint: "rgba(34,211,238,0.06)",
  text: "#e2e8f0",
  textDim: "rgba(255,255,255,0.55)",
  white: "#ffffff",
};
const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

export default function V2() {
  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen">
      <VariantNav current={2} dark />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:px-12 sm:pb-36 sm:pt-28">
        {/* Background integral */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none" aria-hidden="true">
          <span
            className="block text-[18rem] font-extralight leading-none sm:text-[24rem] md:text-[30rem]"
            style={{
              fontFamily: serif,
              color: C.glow,
              opacity: 0.06,
              filter: `drop-shadow(0 0 80px ${C.glow}) drop-shadow(0 0 160px rgba(34,211,238,0.25))`,
            }}
          >∫</span>
        </div>

        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[800px] sm:w-[800px]"
          style={{ background: `radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.5em]" style={{ color: C.glow, fontFamily: body }}>
            CalcPath
          </p>

          <h1
            className="text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-[3.75rem] md:text-[5rem]"
            style={{ fontFamily: serif, color: C.white }}
          >
            Understand calculus,<br />
            <span style={{ color: C.glow }}>don&apos;t just memorize it</span>
          </h1>

          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed sm:text-lg" style={{ fontFamily: body, color: C.textDim }}>
            6 modules. 240+ problems with step-by-step solutions.
            Free to read — built for real understanding.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
            <Link
              href="/modules"
              className="rounded-lg px-8 py-4 text-sm font-semibold transition hover:brightness-110 sm:text-base"
              style={{
                fontFamily: body,
                background: C.glow,
                color: C.bg,
                boxShadow: `0 0 24px rgba(34,211,238,0.3), 0 0 48px rgba(34,211,238,0.1)`,
              }}
            >
              Start reading — free
            </Link>
            <Link
              href="/try"
              className="rounded-lg px-8 py-4 text-sm font-semibold transition hover:bg-white/5 sm:text-base"
              style={{ fontFamily: body, border: `1px solid ${C.borderBright}`, color: C.text }}
            >
              Try 5 problems
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SAMPLE PROBLEM ═══ */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.35em]" style={{ color: C.glow }}>
            What learning looks like
          </p>

          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              backdropFilter: "blur(16px)",
              boxShadow: `0 0 60px ${C.glowFaint}, inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            <div className="px-7 py-6 sm:px-9" style={{ borderBottom: `1px solid ${C.border}` }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.glow }}>{sampleProblem.label}</span>
              <p className="mt-3 text-lg font-medium leading-snug sm:text-xl" style={{ fontFamily: serif, color: C.white }}>
                {sampleProblem.question}
              </p>
            </div>

            <div className="px-7 py-7 sm:px-9">
              <div className="space-y-5">
                {sampleProblem.steps.map((step, i) => (
                  <div key={i} className="flex gap-4" style={{ fontFamily: body }}>
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: C.glow, color: C.bg }}
                    >{i + 1}</span>
                    <span className="pt-0.5 text-sm leading-relaxed" style={{ color: C.textDim }}>{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="h-px w-8" style={{ background: C.glow }} />
                <span className="text-base font-bold" style={{ fontFamily: serif, color: C.glow }}>
                  Answer: {sampleProblem.answer}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-sm" style={{ fontFamily: body, color: C.textDim }}>
            Every problem gets this treatment.{" "}
            <Link href="/modules/limits" className="underline transition hover:opacity-80" style={{ color: C.glow }}>
              Read the Limits module →
            </Link>
          </p>
        </div>
      </section>

      {/* ═══ CURRICULUM ═══ */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.white }}>Curriculum</h2>
          <p className="mb-12 text-sm" style={{ fontFamily: body, color: C.textDim }}>
            Six modules. Free lessons. Worked examples. Practice problems with step-by-step solutions.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {curriculum.map((topic) => (
              <Link
                key={topic.id}
                href={`/modules/${topic.id}`}
                className="group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-[1.01] sm:p-7"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: C.glow, boxShadow: `0 0 16px ${C.glow}` }}
                />
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-light" style={{ fontFamily: serif, color: C.glow }}>{topic.number}</span>
                  <div>
                    <h3 className="text-base font-semibold transition-colors group-hover:text-[#22d3ee] sm:text-lg" style={{ fontFamily: serif, color: C.white }}>
                      {topic.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: body, color: C.textDim }}>{topic.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ APPROACH ═══ */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.white }}>How we teach</h2>
          <p className="mb-12 text-lg italic" style={{ fontFamily: serif, color: C.textDim }}>
            Not shortcuts. Not tricks. <span style={{ color: C.glow }}>Understanding.</span>
          </p>

          <div className="grid gap-8 sm:grid-cols-2">
            {approaches.map((a) => (
              <div key={a.label} className="flex gap-5">
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{ background: C.glowDim, color: C.glow, border: `1px solid rgba(34,211,238,0.2)` }}
                >{a.label}</span>
                <div>
                  <h3 className="text-base font-semibold" style={{ fontFamily: serif, color: C.white }}>{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: body, color: C.textDim }}>{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.white }}>Questions</h2>
          {homeFaqs.map((faq, i) => (
            <details key={i} className="group" style={{ borderBottom: `1px solid ${C.border}` }}>
              <summary className="flex cursor-pointer select-none items-center justify-between py-6 [&::-webkit-details-marker]:hidden">
                <span className="text-[0.95rem] font-medium sm:text-base" style={{ fontFamily: serif, color: C.white }}>{faq.q}</span>
                <span className="ml-4 text-lg transition-transform group-open:rotate-45" style={{ color: C.glow }}>+</span>
              </summary>
              <p className="pb-6 text-sm leading-relaxed" style={{ fontFamily: body, color: C.textDim }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ CLOSING ═══ */}
      <section className="px-6 pb-28 pt-8 sm:px-12 sm:pb-36">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.white }}>
            Start with <span style={{ color: C.glow }}>Limits</span>
          </h2>
          <p className="mt-4 text-sm" style={{ fontFamily: body, color: C.textDim }}>
            Read at your own pace. Practice when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
            <Link
              href="/modules/limits"
              className="rounded-lg px-8 py-4 text-sm font-semibold transition hover:brightness-110"
              style={{
                fontFamily: body,
                background: C.glow, color: C.bg,
                boxShadow: `0 0 24px rgba(34,211,238,0.3)`,
              }}
            >
              Read the first module
            </Link>
            <Link
              href="/try"
              className="rounded-lg px-8 py-4 text-sm font-semibold transition hover:bg-white/5"
              style={{ fontFamily: body, border: `1px solid ${C.borderBright}`, color: C.text }}
            >
              Try a problem first
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
