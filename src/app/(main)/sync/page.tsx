import { redirect } from "next/navigation";

// Cloud backup/restore now lives solely on the account page. Keep this route as
// a redirect so old links and bookmarks still work.
export default function SyncPage() {
  redirect("/account");
}
