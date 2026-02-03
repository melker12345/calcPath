"use client";

import Link from "next/link";
import { useState } from "react";
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
  const { user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");

  return (
    <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CalcPath
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {user.email} · {user.plan.toUpperCase()}
              </span>
              <Link
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm"
                href="/account"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                signIn(email);
                setEmail("");
              }}
            >
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-900"
              />
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white"
              >
                Start free
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
};
