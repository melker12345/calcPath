"use client";

import { useCallback, useMemo, useState } from "react";
import { MathText } from "@/components/math-text";
import { FlashCard, flashCards, getFlashCardsForTopic } from "@/lib/flashcards";
import { topics } from "@/lib/content";

export function FlashCardDeck() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const cards = useMemo(() => {
    const pool = selectedTopic === "all" 
      ? flashCards 
      : getFlashCardsForTopic(selectedTopic);
    // filter out known cards if user wants to study
    return pool.filter((c) => !knownIds.has(c.id));
  }, [selectedTopic, knownIds]);

  const current = cards[currentIndex] as FlashCard | undefined;

  const nextCard = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, cards.length));
  }, [cards.length]);

  const markKnown = useCallback(() => {
    if (!current) return;
    setKnownIds((prev) => new Set([...prev, current.id]));
    setFlipped(false);
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, cards.length - 2)));
  }, [current, cards.length]);

  const resetKnown = () => {
    setKnownIds(new Set());
    setCurrentIndex(0);
    setFlipped(false);
  };

  const totalForTopic = selectedTopic === "all" ? flashCards.length : getFlashCardsForTopic(selectedTopic).length;
  const knownForTopic = selectedTopic === "all" 
    ? knownIds.size 
    : flashCards.filter((c) => c.topicId === selectedTopic && knownIds.has(c.id)).length;

  const categoryColor = (cat: FlashCard["category"]) => {
    switch (cat) {
      case "rule": return "bg-indigo-100 text-indigo-700";
      case "formula": return "bg-emerald-100 text-emerald-700";
      case "identity": return "bg-amber-100 text-amber-700";
      case "technique": return "bg-rose-100 text-rose-700";
    }
  };

  return (
    <div>
      {/* Topic filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setSelectedTopic("all"); setCurrentIndex(0); setFlipped(false); }}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            selectedTopic === "all"
              ? "bg-orange-500 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          All ({flashCards.length})
        </button>
        {topics.map((t) => {
          const count = getFlashCardsForTopic(t.id).length;
          if (count === 0) return null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setSelectedTopic(t.id); setCurrentIndex(0); setFlipped(false); }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                selectedTopic === t.id
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {t.title.split(" ")[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mb-4 flex items-center justify-between text-sm text-zinc-500">
        <span>{knownForTopic}/{totalForTopic} mastered</span>
        <span>{cards.length} remaining</span>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-2 text-lg font-bold text-emerald-800">All cards mastered!</p>
          <button type="button" onClick={resetKnown} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Review again
          </button>
        </div>
      ) : current ? (
        <>
          {/* Card */}
          <button
            type="button"
            onClick={() => setFlipped(!flipped)}
            className="w-full cursor-pointer perspective-1000"
          >
            <div
              className={`relative min-h-[200px] rounded-2xl border-2 p-6 shadow-sm transition-all duration-300 ${
                flipped
                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
                  : "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
              }`}
            >
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor(current.category)}`}>
                  {current.category}
                </span>
              </div>
              <div className="absolute right-4 top-4 text-xs text-zinc-400">
                {flipped ? "Answer" : "Tap to reveal"}
              </div>

              <div className="flex min-h-[160px] items-center justify-center pt-4">
                <div className="text-center text-xl leading-relaxed">
                  <MathText text={flipped ? current.back : current.front} />
                </div>
              </div>
            </div>
          </button>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={nextCard}
              className="flex-1 rounded-xl border-2 border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Next card →
            </button>
            {flipped && (
              <button
                type="button"
                onClick={markKnown}
                className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                ✓ Got it
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
