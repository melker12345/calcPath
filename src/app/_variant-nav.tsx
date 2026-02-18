"use client";

import Link from "next/link";

const variants = [
  { href: "/1", label: "Textbook" },
  { href: "/2", label: "Neon" },
  { href: "/3", label: "Graph Paper" },
  { href: "/4", label: "Chalkboard" },
  { href: "/5", label: "Manuscript" },
];

export function VariantNav({ current, dark = false }: { current: number; dark?: boolean }) {
  const bg = dark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.85)";
  const text = dark ? "#e5e5e5" : "#333";
  const active = "#ea580c";

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-[999] flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-1.5 shadow-2xl backdrop-blur-xl sm:gap-2 sm:px-3"
      style={{ background: bg, border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}
    >
      {variants.map((v, i) => {
        const num = i + 1;
        const isCurrent = num === current;
        return (
          <Link
            key={v.href}
            href={v.href}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
            style={{
              background: isCurrent ? active : "transparent",
              color: isCurrent ? "#fff" : text,
            }}
          >
            <span className="sm:hidden">{num}</span>
            <span className="hidden sm:inline">{v.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
