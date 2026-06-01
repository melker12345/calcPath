"use client";

import React from "react";
import Link from "next/link";

/**
 * PracticeErrorBoundary
 *
 * Class-based React error boundary (required for catching render errors in children).
 * Used exclusively by /x/[subject]/practice/[topicId] to ensure that even if a question
 * has bad data/LaTeX that slips past <MathText> safeguards + GenericPracticeExperience guards,
 * the user sees a friendly, actionable fallback (with links to explanation + subject) instead
 * of the generic /x/ or root "Something went wrong" error page.
 *
 * Improved from prior functional+inner wrapper: now self-contained standard class component
 * (more reliable state+error capture, no cross-component prop callbacks during catch).
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
              Something went wrong while rendering this question (often a complex LaTeX expression or malformed content).
            </p>
            {this.state.error && (
              <p className="text-xs theme-text-muted mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href={`/x/${subjectSlug}/modules/${topicId}`}
                className="text-[var(--accent)] hover:underline"
              >
                View the explanation →
              </Link>
              <Link
                href={`/x/${subjectSlug}`}
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
