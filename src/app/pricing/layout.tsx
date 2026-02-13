import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans | CalcPath",
  description:
    "Start free with all modules and worked examples. Upgrade to Pro for $8/mo to unlock 240+ practice problems, tests, flashcards, and more.",
  openGraph: {
    title: "CalcPath Pricing — Free & Pro Plans",
    description:
      "Free modules & examples. Pro: 240+ problems, tests, flashcards for $8/mo.",
    url: "https://calc-path.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
