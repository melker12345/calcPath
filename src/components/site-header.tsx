"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchTrigger } from "@/components/search-command";
import { ThemeToggle } from "@/components/theme-toggle";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { getSubjectIconClass } from "@/lib/subject-icon-styles";
import type { NavSubject } from "@/lib/subjects";

function ProfileIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

const utilityLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/feedback", label: "Feedback" },
] as const;

function SubjectsDropdown({
  subjects,
}: {
  subjects: Array<{ slug: string; label: string; icon?: string; category?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeAndNavigate = () => setOpen(false);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm theme-text-secondary transition hover:theme-text hover:bg-[var(--surface-2)]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Subjects
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-xl border theme-border theme-surface shadow-xl"
          role="menu"
        >
          <div className="grid grid-cols-2 gap-0.5 p-1">
            {subjects.map((subject) => (
              <Link
                key={subject.slug}
                href={`/${subject.slug}`}
                onClick={closeAndNavigate}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm theme-text transition hover:bg-[var(--surface-2)] hover:theme-text"
                role="menuitem"
              >
                <span className={getSubjectIconClass(subject.category, "xs")}>
                  {subject.icon || "•"}
                </span>
                <span className="truncate">{subject.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t theme-border" />
          <Link
            href="/subjects"
            onClick={closeAndNavigate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--surface-2)]"
            role="menuitem"
          >
            All subjects →
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  subjects = [],
}: {
  open: boolean;
  onClose: () => void;
  subjects?: Array<{ slug: string; label: string; icon?: string; category?: string }>;
}) {
  // Auth removed: always show Account link in drawer (no conditional sign in/out).
  const mounted = useClientMounted();

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
          <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[1px] theme-text-muted">Subjects</div>
          {subjects.map((subject) => (
            <Link
              key={subject.slug}
              href={`/${subject.slug}`}
              className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-900 transition active:bg-zinc-100"
              onClick={onClose}
            >
              <span className={getSubjectIconClass(subject.category, "sm")}>
                {subject.icon || "•"}
              </span>
              {subject.label}
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
          <Link
            href="/account"
            className="block rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-900 transition active:bg-zinc-100"
            onClick={onClose}
          >
            Account
          </Link>
        </nav>
      </div>
    </div>,
    document.body,
  );
}

export const SiteHeader = ({ subjects }: { subjects: NavSubject[] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navSubjects = subjects.filter((s) => (s.order ?? 0) < 50);

  return (
    <>
      <header className="sticky top-0 z-50 border-b theme-border theme-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CalcPath home">
            <span className="font-serif text-xl font-semibold theme-text">CalcPath</span>
          </Link>

          <nav className="hidden items-center gap-3 text-sm md:flex">
            <SubjectsDropdown subjects={navSubjects} />

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

          <SiteHeaderAuthControls
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
            onCloseMobileMenu={() => setMobileMenuOpen(false)}
            subjects={navSubjects}
          />
        </div>
      </header>
    </>
  );
};

function SiteHeaderAuthControls({
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  subjects = [],
}: {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  subjects?: Array<{ slug: string; label: string; icon?: string; category?: string }>;
}) {
  // Auth removed: always show Profile/Account + Sync devices (anon accessible). No sign in/out CTAs.
  return (
    <>
      <div className="flex items-center gap-1.5 md:hidden">
        <ThemeToggle />
        <Link
          href="/account"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-200 bg-white transition active:bg-zinc-50 dark:border-white/15 dark:bg-[#18181b]"
          aria-label="Account"
        >
          <ProfileIcon size={18} color="#3f3f46" />
        </Link>
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
        <Link
          href="/account"
          className="flex items-center gap-2 rounded-full border-2 theme-border theme-surface px-3 py-1.5 text-sm font-semibold theme-text shadow-sm transition hover:shadow-md"
          aria-label="Account"
        >
          <ProfileIcon size={18} color="currentColor" />
        </Link>
        <Link href="/sync" className="text-sm theme-text-secondary hover:theme-text">Sync devices</Link>
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={onCloseMobileMenu}
        subjects={subjects}
      />
    </>
  );
}
