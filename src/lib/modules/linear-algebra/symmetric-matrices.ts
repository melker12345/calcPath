import type { ModuleContent } from "../types";

export const symmetric_matricesModule: ModuleContent = {
    topicId: "symmetric-matrices",
    title: "Symmetric Matrices and Quadratic Forms",
    intro: [
      "Symmetric matrices are the most well-behaved matrices in linear algebra. The Spectral Theorem guarantees that every real symmetric matrix is orthogonally diagonalisable — its eigenvectors always form an orthonormal basis, and all its eigenvalues are real.",
      "Quadratic forms — expressions like $Q(\\mathbf{x}) = \\mathbf{x}^TA\\mathbf{x}$ — arise in optimisation, statistics (covariance), and physics (kinetic energy). Classifying them as positive definite, indefinite, etc. determines the shape of level sets and the nature of critical points.",
      "The Singular Value Decomposition (SVD) extends diagonalisation to any matrix, not just square or symmetric ones. It underlies the most important algorithms in modern data science, including PCA, compressed sensing, and recommender systems.",
    ],
    sections: [
      {
        title: "The Spectral Theorem",
        section: "spectral",
        body: [
          "Spectral Theorem: every real symmetric matrix $A$ ($A=A^T$) is orthogonally diagonalisable. That is, $A=Q\\Lambda Q^T$ where $Q$ is orthogonal ($Q^{-1}=Q^T$) and $\\Lambda=\\text{diag}(\\lambda_1,\\ldots,\\lambda_n)$. The columns of $Q$ are orthonormal eigenvectors of $A$.",
          "Three crucial consequences: (1) all eigenvalues of a real symmetric matrix are real; (2) eigenvectors corresponding to distinct eigenvalues are automatically orthogonal; (3) even with repeated eigenvalues, a full orthonormal eigenvector basis always exists.",
          "These facts hold for every real symmetric matrix without exception — they do not hold for general matrices, which may have complex eigenvalues, non-orthogonal eigenvectors, or insufficient independent eigenvectors.",
          "Note that $A=Q\\Lambda Q^T$ means $A\\mathbf{q}_k=\\lambda_k\\mathbf{q}_k$ for each column $\\mathbf{q}_k$ of $Q$. The decomposition is also written as $A=\\sum_{k=1}^n \\lambda_k \\mathbf{q}_k\\mathbf{q}_k^T$ — a sum of rank-one symmetric matrices scaled by eigenvalues.",
        ],
        eli5: [
          "For symmetric matrices, everything aligns perfectly. The natural directions (eigenvectors) of the transformation are guaranteed to be perpendicular to each other. It's like a perfect axis-aligned stretch — no rotation, no shear, just scaling along clean orthogonal axes.",
        ],
        examples: [
          {
            title: "Orthogonal diagonalisation",
            steps: [
              "Find $Q$ and $\\Lambda$ for $A=\\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}$.",
              "Characteristic equation: $(3-\\lambda)^2-1=0\\Rightarrow\\lambda^2-6\\lambda+8=0\\Rightarrow\\lambda_1=4,\\lambda_2=2$.",
              "For $\\lambda_1=4$: $(A-4I)\\mathbf{v}=0\\Rightarrow\\begin{pmatrix}-1&1\\\\1&-1\\end{pmatrix}\\mathbf{v}=0$. Eigenvector: $\\langle 1,1\\rangle$, normalised: $\\mathbf{q}_1=\\langle 1/\\sqrt{2},1/\\sqrt{2}\\rangle$.",
              "For $\\lambda_2=2$: eigenvector $\\langle 1,-1\\rangle$, normalised: $\\mathbf{q}_2=\\langle 1/\\sqrt{2},-1/\\sqrt{2}\\rangle$.",
              "$Q=\\begin{pmatrix}1/\\sqrt{2}&1/\\sqrt{2}\\\\1/\\sqrt{2}&-1/\\sqrt{2}\\end{pmatrix}$, $\\Lambda=\\begin{pmatrix}4&0\\\\0&2\\end{pmatrix}$. Verify: $Q^TQ=I$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Quadratic forms",
        section: "quadratic-forms",
        body: [
          "A quadratic form is $Q(\\mathbf{x})=\\mathbf{x}^TA\\mathbf{x}$ where $A$ is $n\\times n$ symmetric. In two variables: $Q(x_1,x_2)=ax_1^2+2bx_1x_2+cx_2^2$ corresponding to $A=\\begin{pmatrix}a&b\\\\b&c\\end{pmatrix}$.",
          "Classification by eigenvalues: (1) positive definite: all $\\lambda_k>0$, so $Q(\\mathbf{x})>0$ for all $\\mathbf{x}\\neq\\mathbf{0}$; (2) positive semidefinite: all $\\lambda_k\\geq 0$; (3) negative definite: all $\\lambda_k<0$; (4) negative semidefinite: all $\\lambda_k\\leq 0$; (5) indefinite: mixed signs.",
          "The principal axes theorem: by changing to eigenvector coordinates ($\\mathbf{x}=Q\\mathbf{y}$), the quadratic form simplifies to $Q=\\lambda_1 y_1^2+\\cdots+\\lambda_n y_n^2$ — a pure sum of squares with no cross terms. The eigenvalues determine the shape; the eigenvectors give the principal axes.",
          "In optimisation: at a critical point $\\mathbf{x}_0$ of a smooth function $f$, the Hessian $H$ (which is symmetric) determines the nature of the critical point. Positive definite $H$ means local minimum; negative definite means local maximum; indefinite means saddle point.",
          "Positive definite test without computing eigenvalues: use Sylvester's criterion — $A$ is positive definite iff all leading principal minors (determinants of upper-left $k\\times k$ submatrices) are positive.",
        ],
        eli5: [
          "A quadratic form is a bowl-shaped (or saddle-shaped) surface over the $\\mathbf{x}$-plane. Positive definite means it's a bowl opening upward — every direction goes up from the bottom. Indefinite means it's a saddle — some directions go up, others go down. The eigenvalues tell you the curvature in each principal direction.",
        ],
      },
      {
        title: "Singular Value Decomposition",
        section: "svd",
        body: [
          "Every $m\\times n$ matrix $A$ (any shape, any rank) has an SVD: $A=U\\Sigma V^T$, where $U$ is $m\\times m$ orthogonal, $V$ is $n\\times n$ orthogonal, and $\\Sigma$ is $m\\times n$ with nonneg diagonal entries $\\sigma_1\\geq\\sigma_2\\geq\\cdots\\geq\\sigma_r>0$ (the singular values), where $r=\\text{rank}(A)$.",
          "Computing the SVD: the singular values are $\\sigma_i=\\sqrt{\\lambda_i(A^TA)}$; the columns of $V$ are orthonormal eigenvectors of $A^TA$; the columns of $U$ are orthonormal eigenvectors of $AA^T$.",
          "The four fundamental subspaces from the SVD: $\\text{Col}(A)=\\text{span}\\{\\mathbf{u}_1,\\ldots,\\mathbf{u}_r\\}$, $\\text{Null}(A)=\\text{span}\\{\\mathbf{v}_{r+1},\\ldots,\\mathbf{v}_n\\}$, etc.",
          "Best rank-$k$ approximation: truncate to $A_k=\\sum_{i=1}^k\\sigma_i\\mathbf{u}_i\\mathbf{v}_i^T$. By the Eckart-Young theorem, this is the closest rank-$k$ matrix to $A$ in any unitarily invariant norm. Used for image compression, latent semantic analysis, and noise reduction.",
          "The condition number $\\kappa(A)=\\sigma_1/\\sigma_r$ measures numerical stability. A large condition number means small perturbations in $\\mathbf{b}$ can cause large changes in the solution $A\\mathbf{x}=\\mathbf{b}$.",
        ],
        eli5: [
          "Every matrix transformation can be broken into three steps: first rotate (by $V^T$), then stretch each axis differently (by $\\Sigma$), then rotate again (by $U$). The singular values are the stretch factors — the 'size' of the transformation in each independent direction. The first singular value is the biggest stretch; if it's much bigger than the last, the matrix is hard to 'invert' numerically.",
        ],
      },
      {
        title: "Principal Component Analysis",
        section: "positive-definite",
        body: [
          "PCA finds the directions of maximum variance in a dataset. Given a centered data matrix $X$ ($m$ observations, $n$ features, mean subtracted), the sample covariance matrix is $C=\\frac{1}{m-1}X^TX$, which is symmetric and positive semidefinite.",
          "The eigenvectors of $C$ (the principal components) are the directions of maximum variance. Eigenvalue $\\lambda_k$ equals the variance explained by the $k$-th component. Projecting the data onto the top $k$ eigenvectors gives the best $k$-dimensional linear approximation.",
          "Connection to SVD: if $X=U\\Sigma V^T$, the principal components are the columns of $V$, and the explained variances are $\\sigma_i^2/(m-1)$. The SVD gives a numerically stable way to perform PCA.",
          "Dimensionality reduction: retain only the top $k$ principal components (those with the largest eigenvalues). Choose $k$ to capture a target percentage (e.g., $95\\%$) of total variance: $\\sum_{i=1}^k\\lambda_i / \\sum_{i=1}^n\\lambda_i \\geq 0.95$.",
        ],
        eli5: [
          "PCA rotates your coordinate system to align with the directions the data actually varies. The first principal component is the direction the data is most spread out. The second is the next most spread-out direction perpendicular to the first. By keeping only the top few directions, you can summarise a high-dimensional dataset in 2D or 3D without losing much information.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Assuming every matrix is orthogonally diagonalisable. Only symmetric matrices are guaranteed this by the Spectral Theorem. A non-symmetric matrix may fail to diagonalise at all.",
      "Confusing SVD with eigendecomposition. The SVD $A=U\\Sigma V^T$ always exists for any matrix; eigendecomposition $A=PDP^{-1}$ requires $n$ linearly independent eigenvectors. For non-symmetric matrices, $U\\neq V$ in general.",
      "Forgetting to centre data before PCA. Without subtracting the mean, the first principal component often just aligns with the mean vector rather than the direction of maximum variance.",
      "Misidentifying positive definiteness. Checking that diagonal entries are positive is not enough. Use Sylvester's criterion (leading principal minors) or verify all eigenvalues are positive.",
      "Confusing the condition number with the determinant. A nearly singular matrix ($\\det\\approx 0$) has a large condition number, but a matrix with small determinant is not necessarily ill-conditioned if all singular values are small and roughly equal.",
    ],
  };
