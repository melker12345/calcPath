"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/modules", label: "Modules" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/streaks", label: "Streaks" },
  { href: "/forum", label: "Forum" },
  { href: "/pricing", label: "Pricing" },
];

export const SiteHeader = () => {
  const { user, isPro, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
            CalcPath
          </span>
          <span className="hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 sm:inline">
            Beta
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-zinc-600 dark:text-zinc-300 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-zinc-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 sm:flex"
              >
                <span className="max-w-[180px] truncate">
                  {user.email ?? user.phone ?? user.id.slice(0, 8)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isPro ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                }`}>
                  {isPro ? "PRO" : "FREE"}
                </span>
              </Link>
              <Link className="btn-secondary sm:hidden" href="/account">
                Account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn-secondary" href="/auth">
                Sign in
              </Link>
              <Link className="btn-primary" href="/auth">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
