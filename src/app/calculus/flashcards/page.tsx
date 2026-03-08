"use client";

import { useEffect } from "react";
import { FlashCardDeck } from "@/components/flash-cards";
import { trackEvent } from "@/lib/analytics";

export default function FlashCardsPage() {
  useEffect(() => {
    trackEvent("view_flashcards");
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Flash Cards</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Quick review of key rules, formulas, and identities. Tap a card to
          reveal the answer, then mark it as mastered.
        </p>
      </div>

      <FlashCardDeck />
    </div>
  );
}
