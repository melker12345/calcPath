"use client";

import { useEffect } from "react";
import { FlashCardDeck } from "@/components/flash-cards";
import { PaywallGate } from "@/components/paywall-gate";
import { trackEvent } from "@/lib/analytics";

export default function FlashCardsPage() {
  useEffect(() => {
    trackEvent("view_flashcards");
  }, []);

  return (
    <PaywallGate feature="Flash Cards">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Flash Cards</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Quick review of key rules, formulas, and identities. Tap a card to
            reveal the answer, then mark it as mastered.
          </p>
        </div>

        <FlashCardDeck />
      </div>
    </PaywallGate>
  );
}
