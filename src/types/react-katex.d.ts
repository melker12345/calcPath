declare module "react-katex" {
  import * as React from "react";

  type MathComponentProps = {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  };

  export const InlineMath: React.ComponentType<MathComponentProps>;
  export const BlockMath: React.ComponentType<MathComponentProps>;
}

