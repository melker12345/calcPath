import Link from "next/link";
import { curriculum, homeFaqs, approaches, sampleProblem } from "@/app/_landing-data";

const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

const C = {
  white: "#ffffff",
  navy: "#1e293b",
  muted: "#64748b",
  red: "#dc2626",
  redBg: "rgba(220,38,38,0.04)",
  gridDim: "#dbeafe",
  grid: "#93c5fd",
};

export default function CalculusHome() {
  return (
    <>
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16">
            <div>
              <div className="mb-5 flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full" style={{ background: C.red }} />
                <span className="text-base font-bold uppercase tracking-[0.3em]" style={{ color: C.red }}>Calculus</span>
              </div>

              <h1
                className="text-[2.5rem] font-bold leading-[1.08] tracking-tight sm:text-[3.5rem] md:text-[4.25rem]"
                style={{ fontFamily: serif, color: C.navy }}
              >
                Understand calculus,{" "}
                <span style={{ color: C.red }}>
                  don&apos;t just memorize it
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ fontFamily: body, color: C.muted }}>
                6 topic modules. 240+ practice problems — each with step-by-step solutions.
                Free to read. No account required.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/calculus/modules"
                  className="rounded-lg px-7 py-3.5 text-base font-semibold transition hover:brightness-110"
                  style={{ fontFamily: body, background: C.navy, color: C.white }}
                >
                  Start reading
                </Link>
                <Link
                  href="/calculus/practice"
                  className="rounded-lg px-7 py-3.5 text-base font-semibold transition hover:bg-red-50"
                  style={{ fontFamily: body, border: `2px solid ${C.red}`, color: C.red }}
                >
                  Start practicing
                </Link>
              </div>
            </div>

            {/* SVG curve */}
            <div className="hidden md:block">
              <svg viewBox="0 0 300 220" className="w-full" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.06))" }}>
                <line x1="50" y1="0" x2="50" y2="220" stroke={C.grid} strokeWidth="0.5" opacity="0.3" />
                <line x1="100" y1="0" x2="100" y2="220" stroke={C.grid} strokeWidth="0.5" opacity="0.3" />
                <line x1="150" y1="0" x2="150" y2="220" stroke={C.grid} strokeWidth="0.5" opacity="0.3" />
                <line x1="200" y1="0" x2="200" y2="220" stroke={C.grid} strokeWidth="0.5" opacity="0.3" />
                <line x1="250" y1="0" x2="250" y2="220" stroke={C.grid} strokeWidth="0.5" opacity="0.3" />
                <line x1="0" y1="170" x2="300" y2="170" stroke={C.navy} strokeWidth="1.2" opacity="0.3" />
                <line x1="30" y1="0" x2="30" y2="210" stroke={C.navy} strokeWidth="1.2" opacity="0.3" />
                <text x="290" y="165" fontSize="13" fill={C.navy} opacity="0.5" fontFamily="Georgia, serif" fontStyle="italic">x</text>
                <text x="35" y="15" fontSize="13" fill={C.navy} opacity="0.5" fontFamily="Georgia, serif" fontStyle="italic">y</text>
                <path d="M 35,165 C 80,162 110,140 140,100 S 200,25 270,15" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="100" y1="170" x2="200" y2="10" stroke={C.navy} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
                <circle cx="150" cy="90" r="5" fill={C.red} />
                <circle cx="150" cy="90" r="8" fill="none" stroke={C.red} strokeWidth="1" opacity="0.3" />
                <text x="162" y="94" fontSize="13" fill={C.navy} fontStyle="italic" fontFamily="Georgia, serif">slope = f ′(x)</text>
                <line x1="120" y1="175" x2="120" y2="185" stroke={C.navy} strokeWidth="1" opacity="0.4" />
                <line x1="180" y1="175" x2="180" y2="185" stroke={C.navy} strokeWidth="1" opacity="0.4" />
                <line x1="120" y1="183" x2="180" y2="183" stroke={C.navy} strokeWidth="1" opacity="0.4" />
                <text x="142" y="197" fontSize="13" fill={C.navy} opacity="0.5" fontFamily="Georgia, serif" fontStyle="italic">Δx</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Sample problem */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div
            className="overflow-hidden rounded-xl"
            style={{ background: C.white, border: `2px solid ${C.navy}`, boxShadow: "5px 5px 0 rgba(30,41,59,0.08)" }}
          >
            <div className="flex items-center gap-2.5 px-6 py-3.5" style={{ background: C.navy }}>
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: C.red }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#fbbf24" }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#4ade80" }} />
              <span className="ml-3 text-base font-bold uppercase tracking-wider" style={{ color: C.white }}>{sampleProblem.label}</span>
            </div>

            <div className="p-6 sm:p-8">
              <p className="mb-8 text-lg font-semibold leading-snug sm:text-xl" style={{ fontFamily: serif, color: C.navy }}>
                {sampleProblem.question}
              </p>

              <div className="space-y-5">
                {sampleProblem.steps.map((step, i) => (
                  <div key={i} className="flex gap-4" style={{ fontFamily: body }}>
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-base font-bold"
                      style={{ border: `2px solid ${C.red}`, color: C.red }}
                    >{i + 1}</span>
                    <span className="pt-1 text-base leading-relaxed" style={{ color: C.muted }}>{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-lg px-5 py-3" style={{ border: `2px solid ${C.red}`, background: C.redBg }}>
                <span className="text-base font-bold" style={{ color: C.red }}>Answer =</span>
                <span className="text-xl font-bold" style={{ fontFamily: serif, color: C.navy }}>{sampleProblem.answer}</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-base" style={{ fontFamily: body, color: C.muted }}>
            Every problem includes a full walkthrough.{" "}
            <Link href="/calculus/modules/limits" className="font-semibold underline" style={{ color: C.red }}>Read the Limits module →</Link>
          </p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.navy }}>Curriculum</h2>
          <p className="mb-10 text-base" style={{ fontFamily: body, color: C.muted }}>
            Six modules covering Calculus I–II. Each module is free to read with worked examples.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.map((topic) => (
              <Link
                key={topic.id}
                href={`/calculus/modules/${topic.id}`}
                className="group rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ background: C.white, border: `1.5px solid ${C.gridDim}`, boxShadow: "3px 3px 0 rgba(147,197,253,0.12)" }}
              >
                <span className="text-base font-bold" style={{ color: C.red }}>{topic.number}</span>
                <h3 className="mt-2 text-base font-semibold transition-colors group-hover:text-[#dc2626] sm:text-lg" style={{ fontFamily: serif, color: C.navy }}>
                  {topic.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed" style={{ fontFamily: body, color: C.muted }}>{topic.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.navy }}>How we teach</h2>
          <p className="mb-10 text-base italic" style={{ fontFamily: serif, color: C.muted }}>
            Not shortcuts. Not tricks. <span style={{ color: C.red }}>Understanding.</span>
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {approaches.map((a) => (
              <div key={a.label} className="flex gap-5 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.75)" }}>
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold"
                  style={{ background: C.navy, color: C.white }}
                >{a.label}</span>
                <div>
                  <h3 className="text-base font-semibold sm:text-lg" style={{ fontFamily: serif, color: C.navy }}>{a.title}</h3>
                  <p className="mt-2 text-base leading-relaxed" style={{ fontFamily: body, color: C.muted }}>{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.navy }}>Questions</h2>
          {homeFaqs.map((faq, i) => (
            <details key={i} className="group" style={{ borderBottom: `1px solid ${C.gridDim}` }}>
              <summary className="flex cursor-pointer select-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-base font-medium sm:text-lg" style={{ fontFamily: serif, color: C.navy }}>{faq.q}</span>
                <span className="ml-4 text-xl transition-transform group-open:rotate-45" style={{ color: C.red }}>+</span>
              </summary>
              <p className="pb-5 text-base leading-relaxed" style={{ fontFamily: body, color: C.muted }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-28 pt-8 sm:px-12 sm:pb-36">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.navy }}>
            Start with <span style={{ color: C.red }}>Limits</span>
          </h2>
          <p className="mt-3 text-base" style={{ fontFamily: body, color: C.muted }}>
            The foundation of all calculus. Read at your own pace.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/calculus/modules/limits"
              className="rounded-lg px-7 py-3.5 text-base font-semibold transition hover:brightness-110"
              style={{ fontFamily: body, background: C.navy, color: C.white }}
            >
              Read Chapter I
            </Link>
            <Link
              href="/calculus/practice"
              className="rounded-lg px-7 py-3.5 text-base font-semibold transition hover:bg-red-50"
              style={{ fontFamily: body, border: `2px solid ${C.red}`, color: C.red }}
            >
              Practice problems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
