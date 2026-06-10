"use client";

import Link from "next/link";
import { SyncPanel } from "@/components/sync-panel";

export default function SyncPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Sync Progress Across Devices</h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          No account needed. Your progress is always saved locally. Use a short code to copy it to another device.
        </p>
      </div>

      <SyncPanel />

      <div className="mt-8 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <p>• Progress is always kept locally on each device first.</p>
        <p>• The code transfers an exact snapshot. After import, both devices continue independently.</p>
        <p>• No personal data, no emails, no permanent accounts required for sync.</p>
        <p>• Each saved snapshot (with its code) is automatically removed after 1 week.</p>
        <p className="pt-2">For more options like JSON export/import backup and progress reset, go to <Link href="/account" className="underline">Profile &amp; Save</Link>.</p>
        <p className="pt-1 text-[10px] opacity-70">Admin: create the sync_snapshots table in Supabase (see code comment or run the SQL from src/app/api/sync/route.ts).</p>
      </div>
    </div>
  );
}
