"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/metrics", label: "Metrics" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 text-sm">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
