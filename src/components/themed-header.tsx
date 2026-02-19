"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";
import type { SubjectTheme } from "@/lib/themes";

function ProfileIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function ThemedMobileDrawer({
  open,
  onClose,
  user,
  onSignOut,
  theme,
  navLinks,
}: {
  open: boolean;
  onClose: () => void;
  user: boolean;
  onSignOut: () => void;
  theme: SubjectTheme;
  navLinks: { href: string; label: string }[];
}) {
  const [mounted, setMounted] = useState(false);
  const c = theme.colors;

  useEffect(() => {
    setMounted(true);
  }, []);

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
        className="fixed right-0 top-0 z-[9999] flex h-dvh w-[min(300px,85vw)] flex-col shadow-2xl animate-slide-in-right"
        style={{ background: c.bg, borderLeft: `1px solid ${c.border}` }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
          <span className="text-lg font-bold" style={{ color: c.text }}>Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition active:opacity-70"
            style={{ background: c.card, color: c.text }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3.5 text-base font-semibold transition active:opacity-70"
              style={{ background: c.accentBg, color: c.text }}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <div className="my-2" style={{ borderTop: `1px solid ${c.border}` }} />
              <Link
                href="/account"
                className="block rounded-xl px-4 py-3.5 text-base font-semibold transition active:opacity-70"
                style={{ background: c.accentBg, color: c.text }}
                onClick={onClose}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => { onSignOut(); onClose(); }}
                className="rounded-xl px-4 py-3.5 text-left text-base font-semibold text-red-500 transition active:opacity-70"
                style={{ background: c.accentBg }}
              >
                Sign out
              </button>
            </>
          )}
          {!user && (
            <>
              <div className="my-2" style={{ borderTop: `1px solid ${c.border}` }} />
              <Link
                href="/auth"
                className="block rounded-xl px-4 py-3.5 text-center text-base font-semibold transition active:opacity-90"
                style={{ background: c.accent, color: c.navAccentText }}
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

export function ThemedHeader({
  theme,
  subjectSlug,
}: {
  theme: SubjectTheme;
  subjectSlug: string;
}) {
  const { user, isPro, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const c = theme.colors;
  const prefix = `/${subjectSlug}`;

  const navLinks = [
    { href: `${prefix}/modules`, label: "Modules" },
    { href: `${prefix}/practice`, label: "Practice" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/flashcards", label: "Flash Cards" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl pt-[env(safe-area-inset-top)]"
        style={{ background: c.navBg, borderBottom: `1px solid ${c.navBorder}` }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CalcPath home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-lg font-bold text-white shadow-lg shadow-orange-200 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xl">
              ∫
            </div>
            <span className="hidden text-lg font-bold text-orange-900 sm:inline sm:text-xl">CalcPath</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition"
                style={{ color: c.navText }}
                onMouseEnter={(e) => (e.currentTarget.style.color = c.navTextHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = c.navText)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={`${prefix}/modules`}
              className="text-sm font-semibold transition"
              style={{ color: c.navText }}
            >
              Modules
            </Link>
            {user ? (
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center rounded-full transition active:opacity-70"
                style={{ background: c.accentBg, border: `1.5px solid ${c.border}` }}
                aria-label="Account"
              >
                <ProfileIcon size={18} color={c.navText} />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm"
                style={{ background: c.accent, color: c.navAccentText }}
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition active:opacity-70"
              style={{ background: c.accentBg, color: c.navText }}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop right */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:opacity-80"
                  style={{ border: `1.5px solid ${c.border}` }}
                  aria-label="Account"
                >
                  <ProfileIcon size={18} color={c.navText} />
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: isPro ? c.accent : c.accentBg,
                      color: isPro ? c.navAccentText : c.accent,
                    }}
                  >
                    {isPro ? "PRO" : "FREE"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-80"
                  style={{ border: `1.5px solid ${c.border}`, color: c.navText }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium transition"
                  style={{ color: c.navText }}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:brightness-110"
                  style={{ background: c.accent, color: c.navAccentText }}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <ThemedMobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={!!user}
        onSignOut={signOut}
        theme={theme}
        navLinks={navLinks}
      />
    </>
  );
}
