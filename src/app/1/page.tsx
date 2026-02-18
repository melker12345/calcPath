import Link from "next/link";
import { curriculum, homeFaqs, approaches, sampleProblem } from "@/app/_landing-data";
import { VariantNav } from "@/app/_variant-nav";

/*
 * VARIANT 1 — THE TEXTBOOK (polished)
 *
 * A calculus textbook opened to its title page.
 * Cloth spine on the left. Warm ivory paper. Example boxes with
 * colored left bars. Table of Contents with dot leaders and
 * descriptions. Generous padding everywhere.
 */

const C = {
  paper: "#f8f4eb",
  paperDark: "#f0eadd",
  spine: "#8b2525",
  spineDark: "#6b1c1c",
  ink: "#1a1a1a",
  body: "#3d3028",
  muted: "#8b6c5c",
  rule: "#d4c9b8",
  ruleLight: "#e4ddd0",
};
const serif = "var(--font-newsreader), Georgia, serif";
const text = "var(--font-lora), Georgia, serif";

export default function V1() {
  return (
    <div className="relative min-h-screen" style={{ background: C.paper }}>
      <VariantNav current={1} />

      {/* Cloth spine */}
      <div
        className="fixed left-0 top-0 z-50 hidden h-full w-3 md:block"
        style={{
          background: `linear-gradient(to right, ${C.spineDark}, ${C.spine} 40%, #7a2020 60%, #5a1818)`,
          boxShadow: "2px 0 12px rgba(0,0,0,0.12)",
        }}
      />

      <div className="md:ml-3">
        {/* ═══ TITLE PAGE ═══ */}
        <section className="px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-24 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 flex items-center justify-center gap-5">
              <div className="h-px w-20" style={{ background: C.spine }} />
              <span style={{ color: C.spine, fontFamily: serif, fontSize: "1.2rem" }}>✦</span>
              <div className="h-px w-20" style={{ background: C.spine }} />
            </div>

            <p className="mb-5 text-sm uppercase tracking-[0.45em]" style={{ fontFamily: text, color: C.muted }}>
              An Introduction to
            </p>

            <h1
              className="text-[3rem] leading-[1.05] tracking-tight sm:text-[4rem] md:text-[5.5rem]"
              style={{ fontFamily: serif, color: C.ink, fontWeight: 400 }}
            >
              Calculus
            </h1>

            <p className="mt-3 text-xl italic sm:text-2xl md:text-3xl" style={{ fontFamily: serif, color: C.muted }}>
              with Step-by-Step Solutions
            </p>

            <div className="mx-auto mt-8 flex items-center justify-center gap-5">
              <div className="h-px w-20" style={{ background: C.spine }} />
              <span style={{ color: C.spine, fontFamily: serif, fontSize: "1.2rem" }}>✦</span>
              <div className="h-px w-20" style={{ background: C.spine }} />
            </div>

            <p className="mx-auto mt-10 max-w-md text-base leading-relaxed sm:text-lg" style={{ fontFamily: text, color: C.body }}>
              Six modules covering limits, derivatives, integrals, and more.
              240+ practice problems — each solved step by step.
            </p>
            <p className="mt-3 text-base font-semibold sm:text-lg" style={{ fontFamily: text, color: C.ink }}>
              Free to read. No account required.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/modules"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:brightness-110"
                style={{ fontFamily: text, background: C.spine, color: C.paper }}
              >
                Begin Reading
              </Link>
              <Link
                href="/try"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:bg-[#8b2525]/10"
                style={{ fontFamily: text, border: `1.5px solid ${C.spine}`, color: C.spine }}
              >
                Try a Problem
              </Link>
            </div>

            <p className="mt-12 text-xs uppercase tracking-[0.3em]" style={{ color: C.rule }}>
              CalcPath — 2026 Edition
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div style={{ borderTop: `1px solid ${C.rule}` }} />
        </div>

        {/* ═══ EXAMPLE BOX ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded" style={{ background: C.paperDark, border: `1px solid ${C.rule}` }}>
              <div className="absolute left-0 top-0 h-full w-2" style={{ background: C.spine }} />

              <div className="px-8 py-6 pl-10 sm:px-10 sm:py-7 sm:pl-12" style={{ borderBottom: `1px solid ${C.rule}` }}>
                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: C.spine }}>Example 4</p>
                <p className="mt-1 text-sm tracking-wider" style={{ fontFamily: text, color: C.muted }}>{sampleProblem.label}</p>
              </div>

              <div className="px-8 py-8 pl-10 sm:px-10 sm:py-10 sm:pl-12">
                <p className="mb-10 text-xl font-medium leading-snug sm:text-2xl" style={{ fontFamily: serif, color: C.ink }}>
                  {sampleProblem.question}
                </p>

                <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: C.spine }}>Solution</p>

                <div className="space-y-5">
                  {sampleProblem.steps.map((step, i) => (
                    <div key={i} className="flex gap-4" style={{ fontFamily: text }}>
                      <span className="flex-shrink-0 text-sm font-bold" style={{ color: C.spine }}>({i + 1})</span>
                      <p className="text-[0.95rem] leading-relaxed" style={{ color: C.body }}>{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 inline-block rounded-sm px-5 py-2.5" style={{ border: `2px solid ${C.spine}` }}>
                  <span className="text-base font-bold" style={{ fontFamily: serif, color: C.spine }}>
                    ∴ Answer = {sampleProblem.answer}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm italic" style={{ fontFamily: text, color: C.muted }}>
              Every problem includes a full walkthrough like this.{" "}
              <Link href="/modules/limits" className="underline transition hover:opacity-70" style={{ color: C.spine }}>
                Read the Limits module →
              </Link>
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div style={{ borderTop: `1px solid ${C.rule}` }} />
        </div>

        {/* ═══ TABLE OF CONTENTS ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-center text-2xl sm:text-3xl" style={{ fontFamily: serif, color: C.ink, fontWeight: 400 }}>
              Table of Contents
            </h2>
            <p className="mb-12 text-center text-sm" style={{ fontFamily: text, color: C.muted }}>
              Six modules covering Calculus I–II. Each includes free lessons and worked examples.
            </p>

            <div className="space-y-0">
              {curriculum.map((topic, i) => (
                <Link key={topic.id} href={`/modules/${topic.id}`} className="group block">
                  <div className="py-5" style={{ borderBottom: i < curriculum.length - 1 ? `1px solid ${C.ruleLight}` : "none" }}>
                    <div className="flex items-baseline gap-4">
                      <span className="w-10 flex-shrink-0 text-right text-sm font-semibold" style={{ fontFamily: serif, color: C.spine }}>
                        {topic.number}.
                      </span>
                      <span className="text-base font-medium transition-colors group-hover:text-[#8b2525] sm:text-lg" style={{ fontFamily: serif, color: C.ink }}>
                        {topic.title}
                      </span>
                      <span className="mx-1 hidden flex-1 overflow-hidden whitespace-nowrap text-sm tracking-[0.3em] sm:block" style={{ color: C.rule }}>
                        {"·".repeat(100)}
                      </span>
                      <span className="hidden flex-shrink-0 text-sm opacity-0 transition group-hover:opacity-100 sm:block" style={{ color: C.spine }}>
                        Read →
                      </span>
                    </div>
                    <p className="mt-1 pl-14 text-sm leading-relaxed" style={{ fontFamily: text, color: C.muted }}>
                      {topic.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div style={{ borderTop: `1px solid ${C.rule}` }} />
        </div>

        {/* ═══ APPROACH ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-center text-2xl sm:text-3xl" style={{ fontFamily: serif, color: C.ink, fontWeight: 400 }}>
              Our Approach
            </h2>
            <p className="mb-12 text-center text-lg italic" style={{ fontFamily: serif, color: C.muted }}>
              &ldquo;Not shortcuts. Not tricks. Understanding.&rdquo;
            </p>

            <div className="space-y-10">
              {approaches.map((a) => (
                <div key={a.label} className="flex gap-6 sm:gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-light" style={{ fontFamily: serif, color: C.spine }}>{a.label}</span>
                    <div className="mt-2 h-full w-px" style={{ background: C.rule }} />
                  </div>
                  <div className="pb-2">
                    <h3 className="text-base font-semibold sm:text-lg" style={{ fontFamily: serif, color: C.ink }}>{a.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed sm:text-[0.95rem]" style={{ fontFamily: text, color: C.body }}>{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div style={{ borderTop: `1px solid ${C.rule}` }} />
        </div>

        {/* ═══ FAQ ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl sm:text-3xl" style={{ fontFamily: serif, color: C.ink, fontWeight: 400 }}>
              Frequently Asked Questions
            </h2>
            {homeFaqs.map((faq, i) => (
              <details key={i} className="group" style={{ borderBottom: `1px solid ${C.rule}` }}>
                <summary className="flex cursor-pointer select-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[0.95rem] font-medium sm:text-base" style={{ fontFamily: serif, color: C.ink }}>{faq.q}</span>
                  <span className="ml-4 text-lg transition-transform group-open:rotate-45" style={{ color: C.spine }}>+</span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed" style={{ fontFamily: text, color: C.body }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ CLOSING ═══ */}
        <section className="px-6 pb-24 pt-8 sm:px-12 sm:pb-32 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 flex items-center justify-center gap-5">
              <div className="h-px w-20" style={{ background: C.spine }} />
              <span style={{ color: C.spine, fontFamily: serif, fontSize: "1.2rem" }}>✦</span>
              <div className="h-px w-20" style={{ background: C.spine }} />
            </div>
            <h2 className="text-xl sm:text-2xl" style={{ fontFamily: serif, color: C.ink }}>Begin with Chapter I</h2>
            <p className="mt-3 text-sm" style={{ fontFamily: text, color: C.muted }}>
              Limits &amp; Continuity — the foundation of all calculus.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/modules/limits"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:brightness-110"
                style={{ fontFamily: text, background: C.spine, color: C.paper }}
              >
                Open Chapter I
              </Link>
              <Link
                href="/try"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:bg-[#8b2525]/10"
                style={{ fontFamily: text, border: `1.5px solid ${C.spine}`, color: C.spine }}
              >
                Try a Problem First
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
