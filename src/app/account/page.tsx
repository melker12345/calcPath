"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { SectionCard } from "@/components/section-card";

type Invoice = {
  id: string;
  number: string | null;
  date: number;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  hostedUrl: string | null;
  pdfUrl: string | null;
};

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const { user, isPro, signOut, refreshProfile } = useAuth();
  const { resetProgress } = useProgress();
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams?.get("checkout");

  // After successful checkout, poll for the webhook to update the profile
  useEffect(() => {
    if (checkoutStatus !== "success" || !user) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      await refreshProfile();
      if (attempts >= 10) clearInterval(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [checkoutStatus, user, refreshProfile]);

  // Fetch invoices when user is pro
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const res = await fetch("/api/stripe/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInvoicesError(data.error ?? "Failed to load invoices.");
        return;
      }
      setInvoices(data.invoices ?? []);
      // If user has no Stripe customer (e.g. admin bypass), note it
      if (data.note === "no_customer") {
        setInvoicesError(null); // not an error, just no billing
      }
    } catch {
      setInvoicesError("Failed to load invoices.");
    } finally {
      setInvoicesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isPro && user) {
      fetchInvoices();
    }
  }, [isPro, user, fetchInvoices]);

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail — user can try again
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error ?? "Failed to cancel.");
        return;
      }
      setCancelSuccess(true);
      setCancelConfirm(false);
      // Refresh profile to pick up changes after a short delay
      setTimeout(() => refreshProfile(), 2000);
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <SectionCard title="Sign in required">
          <p className="text-sm text-zinc-600">
            Create a free account to save progress and unlock streak tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary inline-flex" href="/auth">
              Sign in / register
            </Link>
            <Link className="btn-secondary inline-flex" href="/">
              Back to home
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function invoiceStatusBadge(status: string | null) {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "open":
        return "bg-amber-100 text-amber-700";
      case "void":
        return "bg-zinc-100 text-zinc-500";
      case "uncollectible":
        return "bg-red-100 text-red-700";
      default:
        return "bg-zinc-100 text-zinc-500";
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {checkoutStatus === "success" && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
          <p className="font-semibold">Payment successful!</p>
          <p className="text-sm">
            {isPro
              ? "Your Pro subscription is now active. Enjoy!"
              : "Processing your subscription... This page will update automatically."}
          </p>
        </div>
      )}

      {cancelSuccess && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
          <p className="font-semibold">Subscription cancelled</p>
          <p className="text-sm">
            Your subscription will remain active until the end of your current billing period.
            You won&apos;t be charged again.
          </p>
        </div>
      )}

      <h1 className="mb-4 text-2xl font-bold text-zinc-900 sm:mb-6 sm:text-3xl">Account</h1>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Profile info */}
        <SectionCard title="Profile">
          <p className="text-sm text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900">{user.email ?? "—"}</p>
          <p className="mt-4 text-sm text-zinc-500">Member since</p>
          <p className="font-medium text-zinc-900">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </SectionCard>

        {/* Subscription */}
        <SectionCard title="Subscription">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                isPro
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
          {isPro && user.proUntil && (
            <div className="mt-3">
              <p className="text-sm text-zinc-500">Current period ends</p>
              <p className="font-medium text-zinc-900">
                {new Date(user.proUntil).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2">
            {isPro ? (
              <>
                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? "Loading..." : "Manage payment method"}
                </button>
                {!cancelSuccess && !cancelConfirm && (
                  <button
                    type="button"
                    className="w-full rounded-2xl border-2 border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                    onClick={() => setCancelConfirm(true)}
                  >
                    Cancel subscription
                  </button>
                )}
              </>
            ) : (
              <Link className="btn-primary inline-flex w-full justify-center" href="/pricing">
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Cancel confirmation */}
          {cancelConfirm && !cancelSuccess && (
            <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Are you sure you want to cancel?
              </p>
              <p className="mt-1 text-sm text-red-700">
                You&apos;ll keep Pro access until the end of your current billing period.
                After that, you&apos;ll lose access to practice, tests, dashboard, and flash cards.
              </p>
              {cancelError && (
                <p className="mt-2 text-sm font-medium text-red-600">{cancelError}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? "Cancelling..." : "Yes, cancel"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border-2 border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  onClick={() => { setCancelConfirm(false); setCancelError(null); }}
                >
                  Keep subscription
                </button>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-zinc-400">
            {isPro
              ? "Update payment details or view full billing history via Stripe."
              : "Unlock practice problems, tests, dashboard & more."}
          </p>
        </SectionCard>

        {/* Data & security */}
        <SectionCard title="Data & security">
          <p className="text-sm text-zinc-600">
            Your progress is synced to the cloud. Resetting progress is irreversible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={resetProgress}>
              Reset progress
            </button>
            <button className="btn-primary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </SectionCard>
      </div>

      {/* Invoice history — full width below the grid */}
      {isPro && (
        <div className="mt-6">
          <SectionCard title="Invoice history">
            {invoicesLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading invoices...
              </div>
            )}

            {invoicesError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {invoicesError}
                <button
                  type="button"
                  className="ml-2 font-semibold underline"
                  onClick={fetchInvoices}
                >
                  Retry
                </button>
              </div>
            )}

            {!invoicesLoading && !invoicesError && invoices.length === 0 && (
              <p className="py-2 text-sm text-zinc-500">No invoices yet.</p>
            )}

            {!invoicesLoading && invoices.length > 0 && (
              <div className="overflow-x-auto">
                {/* Desktop table */}
                <table className="hidden w-full text-sm sm:table">
                  <thead>
                    <tr className="border-b border-orange-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Invoice</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-orange-50">
                        <td className="py-3 pr-4 text-zinc-900">{formatDate(inv.date)}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500">
                          {inv.number ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-zinc-900">
                          {formatCurrency(inv.amountPaid || inv.amountDue, inv.currency)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${invoiceStatusBadge(inv.status)}`}>
                            {inv.status ?? "unknown"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {inv.hostedUrl && (
                              <a
                                href={inv.hostedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-orange-600 hover:text-orange-800"
                              >
                                View
                              </a>
                            )}
                            {inv.pdfUrl && (
                              <a
                                href={inv.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-orange-600 hover:text-orange-800"
                              >
                                PDF
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-xl border border-orange-100 bg-orange-50/30 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-900">
                          {formatCurrency(inv.amountPaid || inv.amountDue, inv.currency)}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${invoiceStatusBadge(inv.status)}`}>
                          {inv.status ?? "unknown"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                        <span>{formatDate(inv.date)}</span>
                        <span className="font-mono">{inv.number ?? ""}</span>
                      </div>
                      <div className="mt-2 flex gap-3">
                        {inv.hostedUrl && (
                          <a
                            href={inv.hostedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-orange-600 active:text-orange-800"
                          >
                            View invoice
                          </a>
                        )}
                        {inv.pdfUrl && (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-orange-600 active:text-orange-800"
                          >
                            Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
