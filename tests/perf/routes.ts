export type RouteBudget = {
  name: string;
  path: string;
  maxDocumentTransferBytes: number;
  maxScriptTransferBytes: number;
  maxStylesheetTransferBytes: number;
  maxTotalTransferBytes: number;
  maxTimeToFirstByteMs: number;
  maxDomContentLoadedMs: number;
  maxLoadMs: number;
};

const defaultBudget = {
  maxDocumentTransferBytes: 120_000,
  maxScriptTransferBytes: 600_000,
  maxStylesheetTransferBytes: 300_000,
  maxTotalTransferBytes: 1_000_000,
  maxTimeToFirstByteMs: 1_000,
  maxDomContentLoadedMs: 1_800,
  maxLoadMs: 3_500,
} satisfies Omit<RouteBudget, "name" | "path">;

// Budgets focus on same-origin, first-load resources in a production build.
export const routeBudgets: RouteBudget[] = [
  { name: "home", path: "/" },
  { name: "feedback", path: "/feedback" },
  { name: "calculus overview", path: "/calculus" },
  { name: "calculus modules", path: "/calculus/modules" },
  { name: "calculus module topic", path: "/calculus/modules/limits" },
  { name: "statistics overview", path: "/statistics" },
  { name: "statistics modules", path: "/statistics/modules" },
  { name: "statistics module topic", path: "/statistics/modules/probability" },
  { name: "linear algebra overview", path: "/linear-algebra" },
  { name: "linear algebra modules", path: "/linear-algebra/modules" },
  { name: "linear algebra module topic", path: "/linear-algebra/modules/systems" },
  {
    name: "linear algebra practice topic",
    path: "/linear-algebra/practice/systems",
    maxScriptTransferBytes: 650_000,
  },
].map((route) => ({
  ...defaultBudget,
  ...route,
}));
