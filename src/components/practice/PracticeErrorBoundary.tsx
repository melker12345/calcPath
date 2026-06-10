"use client";

import React from "react";
import Link from "next/link";

/**
 * PracticeErrorBoundary
 *
 * Class-based React error boundary (required for catching render errors in children).
 * Used by the GenericPracticeExperience for the primary data-driven /[subject]/practice routes (wraps it as the outer last-resort boundary).
 *
 * Strengthened for Migration Phase:
 * - Most per-question render issues (bad LaTeX, malformed data) are now caught *inside* GenericPracticeExperience
 *   by its local QuestionErrorBoundary → clear skip UI, session never breaks, progress intact.
 * - This remains the outer last-resort (e.g. hook init crash, total topic data failure, uncaught in feedback).
 * - Never lets generic error.tsx surface for practice; always friendly + actionable.
 *
 * (History: replaced fragile functional wrapper in prior UX robustness work.)
 */
interface PracticeErrorBoundaryProps {
  children: React.ReactNode;
  subjectSlug: string;
  topicId: string;
}

interface PracticeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PracticeErrorBoundary extends React.Component<
  PracticeErrorBoundaryProps,
  PracticeErrorBoundaryState
> {
  constructor(props: PracticeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Practice render error caught by boundary:", error, errorInfo);

    // Surface migration/porting context for content-related crashes (e.g. legacy data shape issues
    // leaking into the generic practice path, or a not-yet-ported component inside the tree).
    if (process.env.NODE_ENV === "development") {
      import("@/lib/migration-diagnostics")
        .then((m) => m.onContentRelatedError(error))
        .catch(() => {});
    }
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { subjectSlug, topicId } = this.props;
      return (
        <main className="mx-auto max-w-3xl p-8">
          <div className="rounded-2xl border theme-border bg-[var(--surface-2)] p-6">
            <h2 className="text-lg font-semibold theme-text mb-2">Practice session error</h2>
            <p className="theme-text-secondary mb-4">
              A session-level render error occurred (most per-question issues are now isolated and auto-skipped by the inner GenericPracticeExperience boundary + tolerant loader).
            </p>
            {this.state.error && (
              <p className="text-xs theme-text-muted mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href={`/${subjectSlug}/modules/${topicId}`}
                className="text-[var(--accent)] hover:underline"
              >
                View the explanation →
              </Link>
              <Link
                href={`/${subjectSlug}`}
                className="theme-text-muted hover:text-[var(--accent)] hover:underline"
              >
                ← Back to all topics
              </Link>
            </div>
            <button
              onClick={this.reset}
              className="mt-4 text-sm underline theme-text-muted hover:text-[var(--accent)]"
            >
              Try again
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
