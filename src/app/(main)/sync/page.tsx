import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Noindex for consistency with robots.ts (/sync is disallowed): the route only
// redirects to /account and should never appear in search results.
export const metadata: Metadata = {
  title: "Sync",
  robots: { index: false, follow: false },
};

// Cloud backup/restore now lives solely on the account page. Keep this route as
// a redirect so old links and bookmarks still work.
export default function SyncPage() {
  redirect("/account");
}
