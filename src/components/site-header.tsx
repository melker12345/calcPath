"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";
import { AuthBoundary } from "@/components/scoped-providers";
import { SearchTrigger } from "@/components/search-command";
import { ThemeToggle } from "@/components/theme-toggle";

function ProfileIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

const subjectLinks = [
  { href: "/calculus", label: "Calculus" },
  { href: "/linear-algebra", label: "Linear Algebra" },
  { href: "/statistics", label: "Statistics" },
] as const;

const utilityLinks = [
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/feedback", label: "Feedback" },
] as const;

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

  useEffect(() => { setMounted(true); }, []);

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
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
      />

      <div
        className="fixed right-0 top-0 z-[9999] flex h-dvh w-[min(300px,85vw)] flex-col border-l border-zinc-200 bg-white shadow-2xl animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-white/10 dark:bg-[#121214]">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-600 shadow-sm transition active:bg-zinc-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-white px-3 py-4">
          {subjectLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-900 transition active:bg-zinc-100"
              onClick={onClose}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm text-stone-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              {link.label}
            </Link>
          ))}

          {/* separator between subject links and utility links */}
          <div className="my-2 border-t theme-border" />

          {utilityLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-900 transition active:bg-zinc-100"
              onClick={onClose}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm text-stone-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t theme-border" />
          {user && (
            <>
              <Link
                href="/account"
                className="block rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-900 transition active:bg-zinc-100"
                onClick={onClose}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => { onSignOut(); onClose(); }}
                className="rounded-xl bg-zinc-50 px-4 py-3.5 text-left text-base font-semibold text-red-600 transition active:bg-red-50"
              >
                Sign out
              </button>
            </>
          )}
          {!user && (
            <Link
              href="/auth"
              className="block rounded-xl bg-slate-900 px-4 py-3.5 text-center text-base font-semibold text-white transition active:opacity-90"
              onClick={onClose}
            >
              Sign in / Register
            </Link>
          )}
        </nav>
      </div>
    </div>,
    document.body,
  );
}

export const SiteHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b theme-border theme-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CalcPath home">
            <span className="font-serif text-xl font-semibold theme-text">CalcPath</span>
          </Link>

          <nav className="hidden items-center gap-3 text-sm md:flex">
            {subjectLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="theme-text-secondary transition hover:theme-text"
              >
                {link.label}
              </Link>
            ))}

            {/* subtle separator between subject group and utility links */}
            <span className="mx-1 h-3 w-px bg-[var(--border)]" aria-hidden="true" />

            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="theme-text-secondary transition hover:theme-text"
              >
                {link.label}
              </Link>
            ))}

            <SearchTrigger />
          </nav>

          <AuthBoundary>
            <SiteHeaderAuthControls
              mobileMenuOpen={mobileMenuOpen}
              onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
              onCloseMobileMenu={() => setMobileMenuOpen(false)}
            />
          </AuthBoundary>
        </div>
      </header>
    </>
  );
};

function SiteHeaderAuthControls({
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
}) {
  const { user, signOut } = useAuth();

  return (
    <>
      <div className="flex items-center gap-1.5 md:hidden">
        <ThemeToggle />
        {user ? (
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-200 bg-white transition active:bg-zinc-50 dark:border-white/15 dark:bg-[#18181b]"
            aria-label="Account"
          >
            <ProfileIcon size={18} color="#3f3f46" />
          </Link>
        ) : (
          <Link
            href="/auth"
            className="rounded border border-stone-300 bg-[#fffef8] px-3 py-1.5 text-sm text-stone-800 dark:border-white/15 dark:bg-[#18181b] dark:text-[#ededed]"
          >
            Sign in
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded border border-stone-300 bg-[#fffef8] text-stone-700 transition active:bg-stone-100 dark:border-white/15 dark:bg-[#18181b] dark:text-[#ededed]"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <ThemeToggle />
        {user ? (
          <>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full border-2 theme-border theme-surface px-3 py-1.5 text-sm font-semibold theme-text shadow-sm transition hover:shadow-md"
              aria-label="Account"
            >
              <ProfileIcon size={18} color="currentColor" />
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border-2 theme-border theme-surface px-4 py-2 text-sm font-semibold theme-text-secondary transition hover:theme-text"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="text-sm theme-text-secondary hover:theme-text"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="rounded border theme-border theme-surface px-4 py-2 text-sm theme-text transition"
            >
              Get started
            </Link>
          </>
        )}
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={onCloseMobileMenu}
        user={!!user}
        onSignOut={signOut}
      />
    </>
  );
}
