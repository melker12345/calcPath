"use client";

import Link from "next/link";
import { SyncPanel } from "@/components/sync-panel";

export default function SyncPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cloud Backup &amp; Restore</h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Progress stays on your device first. Back up to the cloud with a 6-digit PIN and password, then restore on any browser.
        </p>
      </div>

      <SyncPanel />

      <div className="mt-8 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <p>• Progress is always kept locally on each device first.</p>
        <p>• Restore replaces local progress with the cloud copy.</p>
        <p>• Updates need your password and at least 5 new question changes (or wait 1 minute).</p>
        <p>• Lost PIN? Create a new backup if you still have local progress, or use a public template (111111–888888).</p>
        <p>• No personal data, no emails, no accounts.</p>
        <p className="pt-2">
          JSON export/import is on{" "}
          <Link href="/account" className="underline">
            Profile &amp; Save
          </Link>
          .
        </p>
        <p className="pt-1 text-[10px] opacity-70">
          Admin: create the progress_backups table in Supabase (SQL in src/app/api/backup/route.ts), then run{" "}
          <code className="font-mono">npx tsx scripts/seed-progress-templates.ts</code>.
        </p>
      </div>
    </div>
  );
}