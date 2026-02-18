"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calculus/practice", label: "Practice" },
  { href: "/calculus/modules", label: "Modules" },
  { href: "/flashcards", label: "Flash Cards" },
  { href: "/pricing", label: "Pricing" },
];

function MobileDrawer({
  open,
  onClose,
  user,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  user: boolean;
  onSignOut: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="md:hidden">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-[9999] flex h-dvh w-[min(300px,85vw)] flex-col border-l border-orange-200 bg-white shadow-2xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-orange-200 bg-orange-50 px-4 py-4">
          <span className="text-lg font-bold text-orange-900">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm transition active:bg-orange-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-white px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl bg-orange-50 px-4 py-3.5 text-base font-semibold text-orange-900 transition active:bg-orange-200"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <div className="my-2 border-t border-orange-100" />
              <Link
                href="/account"
                className="block rounded-xl bg-orange-50 px-4 py-3.5 text-base font-semibold text-orange-900 transition active:bg-orange-200"
                onClick={onClose}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => { onSignOut(); onClose(); }}
                className="rounded-xl bg-orange-50 px-4 py-3.5 text-left text-base font-semibold text-red-600 transition active:bg-red-50"
              >
                Sign out
              </button>
            </>
          )}
          {!user && (
            <>
              <div className="my-2 border-t border-orange-100" />
              <Link
                href="/auth"
                className="block rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3.5 text-center text-base font-semibold text-white transition active:opacity-90"
                onClick={onClose}
              >
                Sign in / Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>,
    document.body,
  );
}

export const SiteHeader = () => {
  const { user, isPro, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo - left */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CalcPath home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-lg font-bold text-white shadow-lg shadow-orange-200 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xl">
              ∫
            </div>
            <span className="hidden text-lg font-bold text-orange-900 sm:inline sm:text-xl">CalcPath</span>
          </Link>

          {/* Desktop nav - center */}
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

          {/* Mobile quick links: Modules + Sign in / Account */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/calculus/modules"
              className="text-sm font-semibold text-orange-700 transition active:text-orange-900"
            >
              Modules
            </Link>
            {user ? (
              <Link
                href="/account"
                className="rounded-xl border-2 border-orange-100 bg-white px-3 py-1.5 text-sm font-semibold text-orange-700 transition active:bg-orange-50"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/auth"
                className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/80 text-orange-700 transition active:bg-orange-200"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop right side */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-2xl border-2 border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-orange-900 shadow-sm transition hover:border-orange-200 hover:shadow-md"
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
                  className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer - portaled to body so it's not affected by header's backdrop-blur containing block */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={!!user}
        onSignOut={signOut}
      />
    </>
  );
};
