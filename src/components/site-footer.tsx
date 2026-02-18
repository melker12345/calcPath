"use client";

import Link from "next/link";

export const SiteFooter = () => (
  <footer className="border-t border-orange-100 bg-white pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 sm:py-8">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-sm font-bold text-white">
          ∫
        </div>
        <span className="font-bold text-orange-900">CalcPath</span>
      </div>
      <p className="text-sm text-orange-600">© 2026 CalcPath. Made with 💖</p>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <Link href="/pricing" className="text-sm text-orange-600 hover:text-orange-900">Pricing</Link>
        <Link href="/calculus/modules" className="text-sm text-orange-600 hover:text-orange-900">Modules</Link>
      </div>
    </div>
  </footer>
);
