import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CalcPath — Learn Math Step by Step",
    template: "%s | CalcPath",
  },
  description:
    "Free step-by-step math courses with practice problems, instant feedback, and topic tests. Calculus, statistics & linear algebra.",
  keywords: [
    "learn university mathematics",
    "university math",
    "free math courses",
    "learn calculus",
    "learn statistics",
    "learn linear algebra",
    "calculus",
    "statistics",
    "linear algebra",
    "math practice",
    "math problems",
    "limits",
    "derivatives",
    "integrals",
    "step by step math",
    "math tutor",
    "calculus problems",
    "statistics problems",
    "linear algebra problems",
  ],
  metadataBase: new URL("https://calc-path.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "CalcPath — Learn Math Step by Step",
    description:
      "Free step-by-step courses with practice problems and topic tests. Master math at your own pace.",
    url: "https://calc-path.com",
    siteName: "CalcPath",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalcPath — Learn math step by step",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalcPath — Learn Math Step by Step",
    description:
      "Free courses with practice problems, instant feedback, and topic tests.",
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
                    "Free step-by-step math courses with practice problems, instant feedback, and topic tests.",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://calc-path.com/calculus/modules?q={search_term_string}",
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
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
