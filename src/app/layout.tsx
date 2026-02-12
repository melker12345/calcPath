import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CalcPath | Master calculus, one problem at a time",
  description:
    "Step-by-step modules, 240+ practice problems, tests, and flashcards. Free modules — Pro for $8/mo.",
  metadataBase: new URL("https://calc-path.com"),
  openGraph: {
    title: "CalcPath | Master calculus, one problem at a time",
    description:
      "Step-by-step modules, 240+ practice problems, tests, and flashcards. Free modules — Pro for $8/mo.",
    url: "https://calc-path.com",
    siteName: "CalcPath",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalcPath — Master calculus, one problem at a time",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalcPath | Master calculus, one problem at a time",
    description:
      "Step-by-step modules, 240+ practice problems, tests, and flashcards. Free modules — Pro for $8/mo.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
