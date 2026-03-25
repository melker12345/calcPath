"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";
import { SearchTrigger } from "@/components/search-command";

import { topics as calculusTopics } from "@/lib/calculus-content";
import { topics as statisticsTopics } from "@/lib/statistics-content";
import { topics as linalgTopics } from "@/lib/linalg-content";

function ProfileIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

const subjects = [
  { slug: "calculus", label: "Calculus", icon: "∫", topics: calculusTopics },
  { slug: "statistics", label: "Statistics", icon: "σ", topics: statisticsTopics },
  { slug: "linear-algebra", label: "Linear Algebra", icon: "λ", topics: linalgTopics },
] as const;

function SubjectDropdown({
  subject,
  isOpen,
  onEnter,
  onLeave,
  onClose,
}: {
  subject: (typeof subjects)[number];
  isOpen: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link
        href={`/${subject.slug}`}
        className="flex items-center gap-1 px-1 py-1 text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
      >
        {subject.label}
        <svg className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 pt-1.5">
          <div className="w-64 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
            <div className="max-h-72 overflow-y-auto py-1">
              {subject.topics.map((t) => (
                <Link
                  key={t.id}
                  href={`/${subject.slug}/modules/${t.id}`}
                  className="block px-3.5 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
                  onClick={onClose}
                >
                  {t.title}
                </Link>
              ))}
            </div>
            <div className="border-t border-zinc-100">
              <Link
                href={`/${subject.slug}/dashboard`}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                onClick={onClose}
              >
                Dashboard
                <span className="text-zinc-400">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

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
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-4">
          <span className="text-lg font-bold text-zinc-900">Menu</span>
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
          {subjects.map((s) => {
            const isExpanded = expandedSubject === s.slug;
            return (
              <div key={s.slug}>
                <button
                  type="button"
                  onClick={() => setExpandedSubject(isExpanded ? null : s.slug)}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-base font-semibold text-zinc-900 transition active:bg-zinc-100"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-200 text-sm font-bold text-zinc-600">
                      {s.icon}
                    </span>
                    {s.label}
                  </span>
                  <svg className={`h-4 w-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-zinc-100 pl-3">
                    {s.topics.map((t) => (
                      <Link
                        key={t.id}
                        href={`/${s.slug}/modules/${t.id}`}
                        className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition active:bg-zinc-50"
                        onClick={onClose}
                      >
                        {t.title}
                      </Link>
                    ))}
                    <Link
                      href={`/${s.slug}/dashboard`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition active:bg-zinc-50"
                      onClick={onClose}
                    >
                      Dashboard →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          <div className="my-2 border-t border-zinc-100" />
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
              className="block rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3.5 text-center text-base font-semibold text-white transition active:opacity-90"
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
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleEnter = (slug: string) => {
    clearTimeout(closeTimeout.current);
    setActiveSlug(slug);
  };

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => setActiveSlug(null), 150);
  };

  useEffect(() => () => clearTimeout(closeTimeout.current), []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CalcPath home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-lg font-bold text-white sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xl">
              ∫
            </div>
            <span className="hidden text-lg font-bold text-zinc-900 sm:inline sm:text-xl">CalcPath</span>
          </Link>

          {/* Desktop nav — subject dropdowns + search */}
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            {subjects.map((s) => (
              <SubjectDropdown
                key={s.slug}
                subject={s}
                isOpen={activeSlug === s.slug}
                onEnter={() => handleEnter(s.slug)}
                onLeave={handleLeave}
                onClose={() => setActiveSlug(null)}
              />
            ))}
            <SearchTrigger />
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-200 bg-white transition active:bg-zinc-50"
                aria-label="Account"
              >
                <ProfileIcon size={18} color="#3f3f46" />
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
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition active:bg-zinc-200"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop right — profile + sign out */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                  aria-label="Account"
                >
                  <ProfileIcon size={18} color="#3f3f46" />
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full border-2 border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={!!user}
        onSignOut={signOut}
      />
    </>
  );
};
