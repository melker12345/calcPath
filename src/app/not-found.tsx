import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-zinc-500">
        The page you requested does not exist.
      </p>
      <Link className="btn-primary" href="/">
        Back to home
      </Link>
    </div>
  );
}
