"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const PRESETS = [300, 500] as const;

export function DonateWidget({
  accentColor = "#f97316",
  accentText = "#fff",
  mutedText = "rgba(0,0,0,0.5)",
  borderColor = "rgba(0,0,0,0.08)",
  inputBg = "#fff",
  inputText = "#18181b",
}: {
  accentColor?: string;
  accentText?: string;
  mutedText?: string;
  borderColor?: string;
  inputBg?: string;
  inputText?: string;
}) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = selected ?? (custom ? Math.round(parseFloat(custom) * 100) : 0);
  const valid = amount >= 100;

  const handleDonate = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email: user?.email ?? undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const isCustomActive = selected === null && custom !== "";

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-base font-medium" style={{ color: mutedText }}>
        Enjoy CalcPath? Consider a donation.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {PRESETS.map((cents) => {
          const active = selected === cents;
          return (
            <button
              key={cents}
              onClick={() => {
                setSelected(cents);
                setCustom("");
              }}
              className="h-10 rounded-full px-5 text-sm font-semibold transition"
              style={{
                background: active ? accentColor : "transparent",
                color: active ? accentText : mutedText,
                border: `1.5px solid ${active ? accentColor : borderColor}`,
              }}
            >
              ${cents / 100}
            </button>
          );
        })}

        {/* Custom amount */}
        <div
          className="flex h-10 items-center overflow-hidden rounded-full transition px-3"
          style={{
            border: `1.5px solid ${isCustomActive ? accentColor : borderColor}`,
            background: inputBg,
          }}
        >
          <span
            className="px-3.5 text-sm font-medium"
            style={{ color: mutedText }}
          >
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Other"
            value={custom}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              setCustom(v);
              setSelected(null);
            }}
            onFocus={() => setSelected(null)}
            className="h-full w-20 bg-transparent pr-3 text-sm text-left font-medium outline-none placeholder:font-normal"
            style={{ color: inputText }}
          />
        </div>

        <button
          onClick={handleDonate}
          disabled={!valid || loading}
          className="h-10 rounded-full px-6 text-sm font-semibold transition disabled:opacity-40"
          style={{ background: accentColor, color: accentText }}
        >
          {loading ? "…" : "Donate"}
        </button>
      </div>
    </div>
  );
}
