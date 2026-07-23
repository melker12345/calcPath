/**
 * Soft vignette between the geometric background pattern and landing content.
 * Lives inside the parallax stage so it tracks the same area as the sections
 * (not the full viewport — avoids the header/footer offset bug).
 */
export function LandingScrim() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      {/* Opaque-ish center wash; edges fade out so the pattern remains visible */}
      <div
        className="absolute inset-0 bg-[var(--bg)] opacity-[0.93] dark:opacity-[0.9]"
        style={{
          maskImage:
            "radial-gradient(ellipse 92% 86% at 50% 46%, #000 22%, #000000e6 42%, transparent 74%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 92% 86% at 50% 46%, #000 22%, #000000e6 42%, transparent 74%)",
        }}
      />

      {/* Gentle blur only at the outer rim — pattern softens without losing contrast in the center */}
      <div
        className="absolute inset-0 backdrop-blur-[2px] sm:backdrop-blur-[3px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 98% 94% at 50% 48%, transparent 52%, #000 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 98% 94% at 50% 48%, transparent 52%, #000 88%)",
        }}
      />
    </div>
  );
}