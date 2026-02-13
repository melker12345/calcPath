import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CalcPath — Learn Calculus Step by Step",
    template: "%s | CalcPath",
  },
  description:
    "Free step-by-step calculus modules, 240+ practice problems with instant feedback, tests, and flashcards. Master limits, derivatives, integrals & more.",
  keywords: [
    "calculus",
    "learn calculus",
    "calculus practice",
    "calculus problems",
    "limits",
    "derivatives",
    "integrals",
    "calculus help",
    "step by step calculus",
    "calculus tutor",
    "math practice",
  ],
  metadataBase: new URL("https://calc-path.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "CalcPath — Learn Calculus Step by Step",
    description:
      "Free step-by-step modules, 240+ practice problems, tests, and flashcards. Master calculus at your own pace.",
    url: "https://calc-path.com",
    siteName: "CalcPath",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalcPath — Learn calculus step by step",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalcPath — Learn Calculus Step by Step",
    description:
      "Free modules, 240+ practice problems with instant feedback, tests & flashcards.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "CalcPath",
                  url: "https://calc-path.com",
                  description:
                    "Free step-by-step calculus modules, 240+ practice problems with instant feedback, tests, and flashcards.",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://calc-path.com/modules?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  name: "CalcPath",
                  url: "https://calc-path.com",
                  logo: "https://calc-path.com/og-image.png",
                  sameAs: ["https://x.com/CalcPath"],
                },
                {
                  "@type": "Course",
                  name: "Calculus — Limits, Derivatives, Integrals & More",
                  description:
                    "Complete calculus course with 6 topic modules, 240+ practice problems, step-by-step solutions, tests, and flashcards.",
                  provider: {
                    "@type": "Organization",
                    name: "CalcPath",
                    url: "https://calc-path.com",
                  },
                  offers: [
                    {
                      "@type": "Offer",
                      category: "Free",
                      price: "0",
                      priceCurrency: "USD",
                    },
                    {
                      "@type": "Offer",
                      category: "Pro",
                      price: "8",
                      priceCurrency: "USD",
                      billingDuration: "P1M",
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-rose-50 text-zinc-900">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
