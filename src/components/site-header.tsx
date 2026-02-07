"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/modules", label: "Modules" },
  { href: "/flashcards", label: "Flash Cards" },
  { href: "/pricing", label: "Pricing" },
];

export const SiteHeader = () => {
  const { user, isPro, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 text-xl font-bold text-white shadow-lg shadow-orange-200">
            ∫
          </div>
          <span className="text-xl font-bold text-orange-900">CalcPath</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-orange-700 transition hover:text-orange-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-2xl border-2 border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-orange-900 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:flex"
              >
                <span className="max-w-[140px] truncate">
                  {user.email ?? user.phone ?? user.id.slice(0, 8)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isPro 
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white" 
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {isPro ? "PRO" : "FREE"}
                </span>
              </Link>
              <Link className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-orange-700 sm:hidden" href="/account">
                Account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-200 hover:bg-orange-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth" 
                className="text-sm font-medium text-orange-700 hover:text-orange-900"
              >
                Sign in
              </Link>
              <Link 
                href="/auth" 
                className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
