"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { trackEvent } from "@/lib/analytics";

const pricingFaqs = [
  { q: "What's included in the free plan?", a: "All 6 module lessons with full explanations, worked examples, \"Explain it simply\" breakdowns, and 5 preview practice problems per topic. No credit card required." },
  { q: "Can I cancel Pro anytime?", a: "Yes. Cancel from your account page at any time. You'll keep Pro access until the end of your billing period — no questions asked." },
  { q: "What payment methods do you accept?", a: "All major credit and debit cards. Payments are securely processed by Stripe. We never see or store your card details." },
  { q: "Is there a free trial of Pro?", a: "You can try 5 interactive problems for free at calc-path.com/try — no sign-up needed. This gives you a feel for the practice experience before upgrading." },
  { q: "What topics does CalcPath cover?", a: "Limits & Continuity, Derivatives, Applications of Derivatives, Integrals, Series & Sequences, and Differential Equations — with 40 practice problems each." },
  { q: "Do I get step-by-step solutions?", a: "Yes. Every single problem — all 240+ of them — comes with a complete step-by-step solution that walks you through the approach and final answer." },
];

export default function PricingPage() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("view_pricing", {
      plan: user ? (isPro ? "pro" : "free") : "anonymous",
    });
  }, [user, isPro]);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.url) {
        trackEvent("upgrade_plan");
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* FAQ JSON-LD */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pricingFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 text-center sm:mb-12">
        <h1 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl md:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-base text-zinc-600 sm:text-lg">
          Start free with all modules and worked examples. Upgrade to Pro when you're ready for unlimited practice.
        </p>
      </div>

      {error && (
        <div className="mx-auto mb-6 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Free plan */}
        <div className="rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-lg sm:rounded-3xl sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            Free forever
          </div>
          <p className="mb-1 text-4xl font-extrabold text-zinc-900">
            $0
          </p>
          <p className="mb-6 text-sm text-zinc-500">No credit card needed</p>
          <ul className="space-y-3 text-base text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              All 6 module lessons with full explanations
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              Worked examples in every module
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              5 preview practice problems per topic
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-500">✓</span>
              &ldquo;Explain it simply&rdquo; breakdowns
            </li>
          </ul>
          <div className="mt-8">
            {user ? (
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-600">
                {isPro ? "Included in your Pro plan" : "Your current plan"}
              </div>
            ) : (
              <Link
                className="block rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200"
                href="/auth"
              >
                Create free account
              </Link>
            )}
          </div>
        </div>

        {/* Pro plan */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-xl sm:rounded-3xl sm:p-8">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold uppercase tracking-wide">
              Pro
            </div>
            <p className="mb-1 text-4xl font-extrabold">
              $8<span className="text-lg font-medium text-orange-100">/month</span>
            </p>
            <p className="mb-6 text-sm text-orange-100">Cancel anytime</p>
            <ul className="space-y-3 text-base text-orange-100">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                <span className="text-white">Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                <strong className="text-white">240+ practice problems</strong> with solutions
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                20-question tests per topic
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Progress dashboard & analytics
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Flashcards & learning paths
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-white">✓</span>
                Achievement emblems
              </li>
            </ul>
            <div className="relative mt-8">
              {user ? (
                isPro ? (
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-orange-600 shadow-lg transition hover:shadow-xl disabled:opacity-60"
                    onClick={handleManage}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Manage subscription"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-orange-600 shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:opacity-60"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    {loading ? "Redirecting to checkout..." : "Upgrade to Pro — $8/mo"}
                  </button>
                )
              ) : (
                <Link
                  className="block rounded-2xl bg-white px-4 py-3 text-center text-base font-semibold text-orange-600 shadow-lg transition hover:shadow-xl"
                  href="/auth"
                >
                  Sign up to get Pro
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Try before you buy nudge */}
      <div className="mt-8 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-5 text-center sm:mt-10 sm:p-6">
        <p className="text-base font-semibold text-emerald-800 sm:text-lg">
          Not sure yet?{" "}
          <Link href="/try" className="font-bold underline hover:text-emerald-900">
            Try 5 free problems
          </Link>{" "}
          — no sign-up required.
        </p>
      </div>

      {/* FAQ */}
      <section className="mt-12 sm:mt-16">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-zinc-900 sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mx-auto max-w-3xl space-y-3">
          {pricingFaqs.map((faq, i) => (
            <details key={i} className="group rounded-xl border-2 border-orange-100 bg-white">
              <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 text-base font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg className="ml-3 h-4 w-4 flex-shrink-0 text-orange-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-base leading-relaxed text-zinc-600">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Trust footer */}
      <div className="mt-12 text-center text-sm text-zinc-500 sm:mt-16">
        <p>Cancel anytime from your account page. No questions asked.</p>
        <p className="mt-1">Payments securely processed by Stripe.</p>
      </div>
    </div>
    </>
  );
}
