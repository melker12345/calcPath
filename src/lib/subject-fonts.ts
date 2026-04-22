import { Lora, Newsreader } from "next/font/google";

export const subjectHeadingFont = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

export const subjectBodyFont = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
});
