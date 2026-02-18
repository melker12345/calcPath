import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try 5 Free Calculus Problems | CalcPath",
  description:
    "No sign-up required. Solve 5 interactive calculus problems with instant feedback and step-by-step solutions. See what CalcPath is all about.",
  openGraph: {
    title: "Try 5 Free Calculus Problems",
    description:
      "No sign-up. Instant feedback. Step-by-step solutions. Try CalcPath now.",
    url: "https://calc-path.com/try",
    images: [{ url: "/try-og.png", width: 1200, height: 628 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Try 5 Free Calculus Problems",
    description:
      "No sign-up. Instant feedback. Step-by-step solutions. Try CalcPath now.",
    images: ["/try-og.png"],
  },
};

export default function TryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
