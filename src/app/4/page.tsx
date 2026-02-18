import Link from "next/link";
import { curriculum, homeFaqs, approaches, sampleProblem } from "@/app/_landing-data";
import { VariantNav } from "@/app/_variant-nav";

/*
 * VARIANT 4 — CHALKBOARD
 *
 * The page is a green chalkboard with a wooden frame.
 * All text is chalk-white with a slightly rough feel.
 * Section headers look hand-chalked. The example uses
 * a chalk outline box. Yellow chalk for accents.
 * A wooden ledge at the bottom holds chalk dust.
 */

const C = {
  board: "#1a3a2a",
  boardDark: "#122a1f",
  boardLight: "#1f4433",
  chalk: "#e8e4d9",
  chalkDim: "rgba(232,228,217,0.55)",
  chalkFaint: "rgba(232,228,217,0.12)",
  yellow: "#fde68a",
  yellowDim: "rgba(253,230,138,0.15)",
  wood: "#8b6c4a",
  woodDark: "#6b4f33",
  woodLight: "#a0845c",
};
const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

export default function V4() {
  return (
    <div className="min-h-screen" style={{ background: C.boardDark }}>
      <VariantNav current={4} dark />

      {/* Wooden frame — top */}
      <div
        className="h-4 w-full sm:h-5"
        style={{
          background: `linear-gradient(to bottom, ${C.woodLight}, ${C.wood} 40%, ${C.woodDark})`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      />

      {/* Board surface */}
      <div
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${C.boardLight} 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, ${C.boardLight} 0%, transparent 40%),
            ${C.board}
          `,
        }}
      >
        {/* ═══ HERO ═══ */}
        <section className="px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-24 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Chalk underline */}
            <div className="mx-auto mb-8 h-px w-32" style={{ background: C.chalkFaint }} />

            <p className="mb-5 text-xs font-bold uppercase tracking-[0.5em]" style={{ color: C.yellow, fontFamily: body }}>
              CalcPath
            </p>

            <h1
              className="text-[2.75rem] leading-[1.08] tracking-tight sm:text-[3.75rem] md:text-[5rem]"
              style={{ fontFamily: serif, color: C.chalk, fontWeight: 400 }}
            >
              Understand<br />
              <span style={{ color: C.yellow }}>Calculus</span>
            </h1>

            <p className="mt-4 text-lg italic sm:text-xl" style={{ fontFamily: serif, color: C.chalkDim }}>
              Step by step. Concept by concept.
            </p>

            <p className="mx-auto mt-8 max-w-md text-base leading-relaxed" style={{ fontFamily: body, color: C.chalkDim }}>
              Six modules covering limits, derivatives, and integrals.
              240+ practice problems — every one solved step by step.
              Free to read. No account needed.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/modules"
                className="rounded-lg px-7 py-3.5 text-sm font-semibold transition hover:brightness-110"
                style={{ fontFamily: body, background: C.yellow, color: C.boardDark }}
              >
                Start reading — free
              </Link>
              <Link
                href="/try"
                className="rounded-lg px-7 py-3.5 text-sm font-semibold transition hover:bg-white/5"
                style={{ fontFamily: body, border: `1.5px solid ${C.chalkFaint}`, color: C.chalk }}
              >
                Try a problem
              </Link>
            </div>

            <div className="mx-auto mt-12 h-px w-32" style={{ background: C.chalkFaint }} />
          </div>
        </section>

        {/* ═══ EXAMPLE — chalk outline box ═══ */}
        <section className="px-6 py-16 sm:px-12 sm:py-24 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.35em]" style={{ color: C.yellow }}>
              What learning looks like
            </p>

            <div
              className="rounded-xl p-7 sm:p-9"
              style={{
                border: `2px dashed ${C.chalkFaint}`,
                background: "rgba(0,0,0,0.1)",
              }}
            >
              <div className="mb-6 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.chalkFaint}`, paddingBottom: "1rem" }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.yellow }}>{sampleProblem.label}</span>
              </div>

              <p className="mb-8 text-lg font-medium leading-snug sm:text-xl" style={{ fontFamily: serif, color: C.chalk }}>
                {sampleProblem.question}
              </p>

              <div className="space-y-5">
                {sampleProblem.steps.map((step, i) => (
                  <div key={i} className="flex gap-4" style={{ fontFamily: body }}>
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ border: `1.5px solid ${C.yellow}`, color: C.yellow }}
                    >{i + 1}</span>
                    <span className="pt-0.5 text-sm leading-relaxed" style={{ color: C.chalkDim }}>{step}</span>
                  </div>
                ))}
              </div>

              {/* Boxed answer */}
              <div className="mt-8 inline-block rounded px-5 py-2.5" style={{ border: `2px solid ${C.yellow}`, background: C.yellowDim }}>
                <span className="text-base font-bold" style={{ fontFamily: serif, color: C.yellow }}>
                  Answer = {sampleProblem.answer}
                </span>
              </div>
            </div>

            <p className="mt-5 text-center text-sm" style={{ fontFamily: body, color: C.chalkDim }}>
              Every problem includes a walkthrough like this.{" "}
              <Link href="/modules/limits" className="underline transition hover:opacity-80" style={{ color: C.yellow }}>
                Read the Limits module →
              </Link>
            </p>
          </div>
        </section>

        {/* ═══ CURRICULUM ═══ */}
        <section className="px-6 py-16 sm:px-12 sm:py-24 md:px-20 lg:px-32">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.chalk }}>Curriculum</h2>
            <p className="mb-10 text-sm" style={{ fontFamily: body, color: C.chalkDim }}>
              Six modules. Free lessons. Worked examples. Practice problems with solutions.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {curriculum.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/modules/${topic.id}`}
                  className="group rounded-xl p-6 transition-all hover:-translate-y-0.5"
                  style={{ border: `1px solid ${C.chalkFaint}`, background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-light" style={{ fontFamily: serif, color: C.yellow }}>{topic.number}</span>
                    <div>
                      <h3 className="text-base font-semibold transition-colors group-hover:text-[#fde68a] sm:text-lg" style={{ fontFamily: serif, color: C.chalk }}>
                        {topic.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: body, color: C.chalkDim }}>{topic.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ APPROACH ═══ */}
        <section className="px-6 py-16 sm:px-12 sm:py-24 md:px-20 lg:px-32">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.chalk }}>How we teach</h2>
            <p className="mb-12 text-lg italic" style={{ fontFamily: serif, color: C.chalkDim }}>
              Not shortcuts. Not tricks. <span style={{ color: C.yellow }}>Understanding.</span>
            </p>

            <div className="grid gap-8 sm:grid-cols-2">
              {approaches.map((a) => (
                <div key={a.label} className="flex gap-5">
                  <span
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ background: C.yellowDim, color: C.yellow, border: `1px solid rgba(253,230,138,0.2)` }}
                  >{a.label}</span>
                  <div>
                    <h3 className="text-base font-semibold" style={{ fontFamily: serif, color: C.chalk }}>{a.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: body, color: C.chalkDim }}>{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="px-6 py-16 sm:px-12 sm:py-24 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.chalk }}>Questions</h2>
            {homeFaqs.map((faq, i) => (
              <details key={i} className="group" style={{ borderBottom: `1px solid ${C.chalkFaint}` }}>
                <summary className="flex cursor-pointer select-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[0.95rem] font-medium sm:text-base" style={{ fontFamily: serif, color: C.chalk }}>{faq.q}</span>
                  <span className="ml-4 text-lg transition-transform group-open:rotate-45" style={{ color: C.yellow }}>+</span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed" style={{ fontFamily: body, color: C.chalkDim }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ CLOSING ═══ */}
        <section className="px-6 pb-12 pt-8 sm:px-12 sm:pb-16 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 h-px w-32" style={{ background: C.chalkFaint }} />
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.chalk }}>
              Start with <span style={{ color: C.yellow }}>Limits</span>
            </h2>
            <p className="mt-3 text-sm" style={{ fontFamily: body, color: C.chalkDim }}>
              The foundation of all calculus. Read at your own pace.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/modules/limits"
                className="rounded-lg px-7 py-3.5 text-sm font-semibold transition hover:brightness-110"
                style={{ fontFamily: body, background: C.yellow, color: C.boardDark }}
              >
                Read the first module
              </Link>
              <Link
                href="/try"
                className="rounded-lg px-7 py-3.5 text-sm font-semibold transition hover:bg-white/5"
                style={{ fontFamily: body, border: `1.5px solid ${C.chalkFaint}`, color: C.chalk }}
              >
                Try a problem first
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Chalk ledge — bottom */}
      <div
        className="relative h-6 w-full sm:h-8"
        style={{
          background: `linear-gradient(to bottom, ${C.woodDark}, ${C.wood} 40%, ${C.woodLight})`,
          boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {/* Chalk dust */}
        <div
          className="absolute left-[10%] top-0 h-1 w-12 rounded-b opacity-40"
          style={{ background: C.chalk }}
        />
        <div
          className="absolute left-[30%] top-0 h-1 w-8 rounded-b opacity-25"
          style={{ background: C.yellow }}
        />
        <div
          className="absolute right-[20%] top-0 h-1 w-16 rounded-b opacity-30"
          style={{ background: C.chalk }}
        />
      </div>
    </div>
  );
}
