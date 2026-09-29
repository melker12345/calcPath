import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Progress tools (export, import, reset) live on the progress overview now.
// The URL is kept so old links and bookmarks still land somewhere useful.
export const metadata: Metadata = {
  title: "Progress",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  redirect("/dashboard");
}
