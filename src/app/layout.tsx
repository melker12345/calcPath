import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { allThemesCss } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CalcPath — Learn Math Step by Step",
    template: "%s | CalcPath",
  },
  description:
    "Free step-by-step university mathematics: textbook chapters, practice problems with full solutions, and printable problem sets.",
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
    "step by step math",
  ],
  metadataBase: new URL("https://calc-path.com"),
  // NOTE: no `alternates` here — Next.js metadata is shallow-merged, so a root
  // canonical would be inherited verbatim by every page that doesn't declare
  // its own `alternates`, making them all claim "/" as canonical. Each page
  // declares its own self-canonical instead.
  openGraph: {
    title: "CalcPath — Learn Math Step by Step",
    description:
      "Free university mathematics: textbook chapters, practice problems with full solutions, and printable problem sets.",
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
      "Free university mathematics: textbook chapters, practice problems with full solutions, and printable problem sets.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Per-subject nav tint (light + dark), generated from src/lib/themes.ts
            and scoped via .subject-theme-<id> classes. */}
        <style
          id="subject-themes"
          dangerouslySetInnerHTML={{ __html: allThemesCss() }}
        />
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
                    "Free step-by-step university mathematics with practice problems and printable problem sets.",
                },
                {
                  "@type": "Organization",
                  "@id": "https://calc-path.com/#org",
                  name: "CalcPath",
                  url: "https://calc-path.com",
                  logo: "https://calc-path.com/og-image.png",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
