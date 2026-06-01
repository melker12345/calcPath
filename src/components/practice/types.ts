export type QuestionStatus = "not-attempted" | "wrong" | "hint-used" | "solved";

export type FeedbackState =
  | null
  | { type: "correct" }
  | {
      type: "incorrect";
      attempts: number;
      hintUsed: boolean;
      showSolution: boolean;
    };
