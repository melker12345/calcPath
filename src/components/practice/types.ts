export type QuestionStatus = "not-attempted" | "wrong" | "hint-used" | "solved";

export type FeedbackState =
  | null
  | {
      type: "correct";
      /** The solution had already been shown, so the answer does not count as solved. */
      afterSolution?: boolean;
    }
  | {
      type: "incorrect";
      attempts: number;
      hintUsed: boolean;
      showSolution: boolean;
    };
