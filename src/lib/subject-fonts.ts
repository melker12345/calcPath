import { Lora, Newsreader } from "next/font/google";

// Headings use 400 for sub-headings and 700 for main headings (font-bold).
// Italic is only rendered in a single decorative tagline and is synthesised
// from the regular face on-the-fly, so we don't ship the italic font file.
export const subjectHeadingFont = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Body serif is only rendered at a single weight (400); drop unused variants
// to keep the linked-asset preload on subject pages lean on mobile.
export const subjectBodyFont = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400"],
});
