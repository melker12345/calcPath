import Link from "next/link";
import { curriculum, homeFaqs, approaches, sampleProblem } from "@/app/_landing-data";
import { VariantNav } from "@/app/_variant-nav";

/*
 * VARIANT 5 — PARCHMENT MANUSCRIPT
 *
 * Aged mathematical manuscript. Deep sepia tones, a wax-seal
 * accent, margin annotations. The page feels like opening a
 * rare original by Euler or Gauss. Roman numerals for chapters.
 * A dark warm brown with gold leaf accents.
 */

const C = {
  parchment: "#f5eedc",
  parchmentDark: "#e8dfc9",
  ink: "#2c1810",
  inkMuted: "#5c4a3a",
  sepia: "#8a7560",
  seal: "#9b2c2c",
  sealLight: "#b83d3d",
  gold: "#b8860b",
  goldDim: "rgba(184,134,11,0.1)",
  rule: "#d2c4aa",
  ruleFaint: "#e2d8c4",
};
const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];

export default function V5() {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse at 20% 0%, rgba(184,134,11,0.04) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 100%, rgba(184,134,11,0.04) 0%, transparent 50%),
          ${C.parchment}
        `,
      }}
    >
      <VariantNav current={5} />

      {/* Aged paper texture via pseudo-noise */}
      <div className="grain pointer-events-none fixed inset-0 z-[1] opacity-[0.03]" aria-hidden="true" />

      <div className="relative z-[2]">
        {/* ═══ TITLE PAGE ═══ */}
        <section className="px-6 pb-20 pt-20 sm:px-12 sm:pb-28 sm:pt-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Decorative border */}
            <div className="mx-auto mb-10 flex items-center justify-center gap-6">
              <div className="h-px flex-1 max-w-16" style={{ background: C.rule }} />
              <div className="flex items-center gap-3">
                <div className="h-px w-6" style={{ background: C.gold }} />
                <span style={{ color: C.gold, fontFamily: serif, fontSize: "0.85rem", letterSpacing: "0.1em" }}>⁂</span>
                <div className="h-px w-6" style={{ background: C.gold }} />
              </div>
              <div className="h-px flex-1 max-w-16" style={{ background: C.rule }} />
            </div>

            <p
              className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.6em]"
              style={{ fontFamily: body, color: C.sepia }}
            >
              A Treatise on
            </p>

            <h1
              className="text-[3rem] leading-[1] tracking-tight sm:text-[4.5rem] md:text-[6rem]"
              style={{ fontFamily: serif, color: C.ink, fontWeight: 400, fontStyle: "italic" }}
            >
              Calculus
            </h1>

            <p className="mt-3 text-lg sm:text-xl" style={{ fontFamily: serif, color: C.sepia }}>
              Being a Complete Course of Instruction<br className="hidden sm:block" />
              with Worked Solutions to Every Problem
            </p>

            {/* Wax seal */}
            <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.seal, boxShadow: `inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(155,44,44,0.3)` }}>
              <span className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: serif }}>CP</span>
            </div>

            <p className="mx-auto mt-8 max-w-md text-base leading-relaxed" style={{ fontFamily: body, color: C.inkMuted }}>
              Six modules spanning limits, derivatives, integrals, and their applications.
              Two hundred and forty practice problems — each solved in full.
            </p>
            <p className="mt-3 text-sm font-semibold" style={{ fontFamily: body, color: C.ink }}>
              Freely available. No inscription required.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/modules"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:brightness-110"
                style={{ fontFamily: body, background: C.seal, color: C.parchment }}
              >
                Begin Reading
              </Link>
              <Link
                href="/try"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:bg-[#9b2c2c]/10"
                style={{ fontFamily: body, border: `1.5px solid ${C.seal}`, color: C.seal }}
              >
                Attempt a Problem
              </Link>
            </div>

            <p className="mt-12 text-[0.65rem] uppercase tracking-[0.4em]" style={{ color: C.rule }}>
              CalcPath · Anno MMXXVI
            </p>
          </div>
        </section>

        {/* Double rule */}
        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div className="flex flex-col gap-1">
            <div style={{ borderTop: `1.5px solid ${C.rule}` }} />
            <div style={{ borderTop: `0.5px solid ${C.ruleFaint}` }} />
          </div>
        </div>

        {/* ═══ EXAMPLE ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg p-7 sm:p-9" style={{ background: C.parchmentDark, border: `1px solid ${C.rule}` }}>
              {/* Header */}
              <div className="mb-6 flex items-center gap-4" style={{ borderBottom: `1px solid ${C.rule}`, paddingBottom: "1rem" }}>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: C.seal, color: C.parchment }}
                >Ex</span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.seal }}>Example IV</span>
                  <p className="text-sm" style={{ fontFamily: body, color: C.sepia }}>{sampleProblem.label}</p>
                </div>
              </div>

              <p className="mb-8 text-xl font-medium leading-snug italic sm:text-2xl" style={{ fontFamily: serif, color: C.ink }}>
                {sampleProblem.question}
              </p>

              <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: C.gold }}>Demonstratio</p>

              <div className="space-y-5">
                {sampleProblem.steps.map((step, i) => (
                  <div key={i} className="flex gap-4" style={{ fontFamily: body }}>
                    <span className="flex-shrink-0 text-sm italic" style={{ color: C.gold }}>({romanNumerals[i] || i + 1})</span>
                    <p className="text-[0.95rem] leading-relaxed" style={{ color: C.inkMuted }}>{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="h-px w-8" style={{ background: C.gold }} />
                <span className="text-base font-bold italic" style={{ fontFamily: serif, color: C.seal }}>
                  ∴ {sampleProblem.answer}
                </span>
                <span className="ml-2 text-sm" style={{ color: C.sepia }}>Q.E.D.</span>
              </div>
            </div>

            <p className="mt-5 text-center text-sm italic" style={{ fontFamily: body, color: C.sepia }}>
              Each problem receives this thorough treatment.{" "}
              <Link href="/modules/limits" className="underline transition hover:opacity-70" style={{ color: C.seal }}>
                Read the Limits chapter →
              </Link>
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div className="flex flex-col gap-1">
            <div style={{ borderTop: `1.5px solid ${C.rule}` }} />
            <div style={{ borderTop: `0.5px solid ${C.ruleFaint}` }} />
          </div>
        </div>

        {/* ═══ TABLE OF CONTENTS ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-center text-2xl sm:text-3xl" style={{ fontFamily: serif, color: C.ink, fontWeight: 400, fontStyle: "italic" }}>
              Chapters
            </h2>
            <p className="mb-12 text-center text-sm" style={{ fontFamily: body, color: C.sepia }}>
              Six chapters, each freely available, with worked solutions throughout.
            </p>

            <div>
              {curriculum.map((topic, i) => (
                <Link key={topic.id} href={`/modules/${topic.id}`} className="group block">
                  <div className="py-5" style={{ borderBottom: i < curriculum.length - 1 ? `1px solid ${C.ruleFaint}` : "none" }}>
                    <div className="flex items-baseline gap-5">
                      <span className="w-12 flex-shrink-0 text-right text-base italic" style={{ fontFamily: serif, color: C.gold }}>
                        {romanNumerals[i]}.
                      </span>
                      <span className="text-base font-medium transition-colors group-hover:text-[#9b2c2c] sm:text-lg" style={{ fontFamily: serif, color: C.ink }}>
                        {topic.title}
                      </span>
                      <span className="mx-1 hidden flex-1 overflow-hidden whitespace-nowrap text-sm tracking-[0.25em] sm:block" style={{ color: C.rule }}>
                        {"·".repeat(100)}
                      </span>
                      <span className="hidden flex-shrink-0 text-sm italic opacity-0 transition group-hover:opacity-100 sm:block" style={{ color: C.seal }}>
                        Read →
                      </span>
                    </div>
                    <p className="mt-1 pl-[4.25rem] text-sm leading-relaxed" style={{ fontFamily: body, color: C.sepia }}>
                      {topic.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div className="flex flex-col gap-1">
            <div style={{ borderTop: `1.5px solid ${C.rule}` }} />
            <div style={{ borderTop: `0.5px solid ${C.ruleFaint}` }} />
          </div>
        </div>

        {/* ═══ APPROACH ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-center text-2xl sm:text-3xl" style={{ fontFamily: serif, color: C.ink, fontWeight: 400, fontStyle: "italic" }}>
              Our Method
            </h2>
            <p className="mb-12 text-center text-base italic" style={{ fontFamily: serif, color: C.sepia }}>
              &ldquo;Not shortcuts. Not tricks. Understanding.&rdquo;
            </p>

            <div className="space-y-10">
              {approaches.map((a, i) => (
                <div key={a.label} className="flex gap-6 sm:gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-lg italic" style={{ fontFamily: serif, color: C.gold }}>{romanNumerals[i]}</span>
                    <div className="mt-2 h-full w-px" style={{ background: C.rule }} />
                  </div>
                  <div className="pb-2">
                    <h3 className="text-base font-semibold sm:text-lg" style={{ fontFamily: serif, color: C.ink }}>{a.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed sm:text-[0.95rem]" style={{ fontFamily: body, color: C.inkMuted }}>{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 sm:px-12 md:px-20 lg:px-32">
          <div className="flex flex-col gap-1">
            <div style={{ borderTop: `1.5px solid ${C.rule}` }} />
            <div style={{ borderTop: `0.5px solid ${C.ruleFaint}` }} />
          </div>
        </div>

        {/* ═══ FAQ ═══ */}
        <section className="px-6 py-20 sm:px-12 sm:py-28 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-2xl sm:text-3xl" style={{ fontFamily: serif, color: C.ink, fontWeight: 400, fontStyle: "italic" }}>
              Common Enquiries
            </h2>
            {homeFaqs.map((faq, i) => (
              <details key={i} className="group" style={{ borderBottom: `1px solid ${C.rule}` }}>
                <summary className="flex cursor-pointer select-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-[0.95rem] font-medium sm:text-base" style={{ fontFamily: serif, color: C.ink }}>{faq.q}</span>
                  <span className="ml-4 text-lg transition-transform group-open:rotate-45" style={{ color: C.seal }}>+</span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed" style={{ fontFamily: body, color: C.inkMuted }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ═══ CLOSING ═══ */}
        <section className="px-6 pb-24 pt-8 sm:px-12 sm:pb-32 md:px-20 lg:px-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 flex items-center justify-center gap-6">
              <div className="h-px w-6" style={{ background: C.gold }} />
              <span style={{ color: C.gold, fontFamily: serif, fontSize: "0.85rem" }}>⁂</span>
              <div className="h-px w-6" style={{ background: C.gold }} />
            </div>
            <h2 className="text-xl italic sm:text-2xl" style={{ fontFamily: serif, color: C.ink }}>
              Begin with Chapter I
            </h2>
            <p className="mt-3 text-sm" style={{ fontFamily: body, color: C.sepia }}>
              Limits &amp; Continuity — the foundation upon which all of calculus is built.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/modules/limits"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:brightness-110"
                style={{ fontFamily: body, background: C.seal, color: C.parchment }}
              >
                Open Chapter I
              </Link>
              <Link
                href="/try"
                className="rounded px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition hover:bg-[#9b2c2c]/10"
                style={{ fontFamily: body, border: `1.5px solid ${C.seal}`, color: C.seal }}
              >
                Attempt a Problem First
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
