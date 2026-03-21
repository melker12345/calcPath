import type { Topic } from "./shared-types";

export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
  body: string[];
  eli5?: string[];
  examples?: WorkedExample[];
};

export type ModuleContent = {
  topicId: Topic["id"];
  title: string;
  intro: string[];
  sections: ModuleSection[];
  examples: { title: string; steps: string[] }[];
  commonMistakes: string[];
};

export const modules: ModuleContent[] = [
  {
    topicId: "vectors",
    title: "Vectors & Operations",
    intro: [
      "Vectors are the fundamental objects of linear algebra. A vector is an ordered list of numbers that represents a magnitude and direction — or more abstractly, a point in $n$-dimensional space.",
      "Everything in linear algebra — matrices, transformations, eigenvalues — ultimately acts on vectors. Mastering vector operations is the foundation for everything that follows.",
      "We will cover vector arithmetic, the dot product, and how these operations connect to geometry.",
    ],
    sections: [
      {
        title: "What is a vector?",
        body: [
          "A vector in $\\mathbb{R}^n$ is an ordered $n$-tuple of real numbers: $\\mathbf{v} = \\langle v_1, v_2, \\ldots, v_n \\rangle$. In $\\mathbb{R}^2$, vectors are arrows in the plane; in $\\mathbb{R}^3$, arrows in space.",
          "Two vectors are equal if and only if all their corresponding components are equal.",
          "The zero vector $\\mathbf{0} = \\langle 0, 0, \\ldots, 0 \\rangle$ has zero magnitude and no direction. It is the additive identity: $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$.",
        ],
        eli5: [
          "A vector is like GPS directions: it tells you how far to go and in which direction. The vector $\\langle 3, 4 \\rangle$ says 'go $3$ units right and $4$ units up.' Unlike a point, a vector does not care where you start — it only describes the displacement.",
        ],
      },
      {
        title: "Vector addition and scalar multiplication",
        body: [
          "Addition is component-wise: $\\mathbf{u} + \\mathbf{v} = \\langle u_1 + v_1, u_2 + v_2, \\ldots, u_n + v_n \\rangle$.",
          "Scalar multiplication scales each component: $c\\mathbf{v} = \\langle cv_1, cv_2, \\ldots, cv_n \\rangle$. If $c > 0$, the direction is preserved; if $c < 0$, it reverses.",
          "The magnitude (length) of a vector is $\\|\\mathbf{v}\\| = \\sqrt{v_1^2 + v_2^2 + \\cdots + v_n^2}$.",
          "A unit vector has magnitude $1$. To normalize a vector: $\\hat{\\mathbf{v}} = \\frac{\\mathbf{v}}{\\|\\mathbf{v}\\|}$.",
        ],
        examples: [
          {
            title: "Vector arithmetic in R²",
            steps: [
              "Let $\\mathbf{u} = \\langle 1, 3 \\rangle$ and $\\mathbf{v} = \\langle 4, -1 \\rangle$.",
              "$\\mathbf{u} + \\mathbf{v} = \\langle 1+4, 3+(-1) \\rangle = \\langle 5, 2 \\rangle$.",
              "$2\\mathbf{u} = \\langle 2, 6 \\rangle$.",
              "$\\|\\mathbf{v}\\| = \\sqrt{16 + 1} = \\sqrt{17}$.",
            ],
          },
        ],
      },
      {
        title: "The dot product",
        body: [
          "The dot product of two vectors is $\\mathbf{u} \\cdot \\mathbf{v} = u_1 v_1 + u_2 v_2 + \\cdots + u_n v_n$. It returns a scalar, not a vector.",
          "Geometric interpretation: $\\mathbf{u} \\cdot \\mathbf{v} = \\|\\mathbf{u}\\| \\|\\mathbf{v}\\| \\cos\\theta$, where $\\theta$ is the angle between the vectors.",
          "Two vectors are orthogonal (perpendicular) if and only if $\\mathbf{u} \\cdot \\mathbf{v} = 0$.",
          "The dot product also gives the magnitude: $\\mathbf{v} \\cdot \\mathbf{v} = \\|\\mathbf{v}\\|^2$.",
        ],
        eli5: [
          "The dot product measures how much two vectors point in the same direction. If they point the same way, the dot product is large and positive. If they are perpendicular, it is zero. If they point in opposite directions, it is negative.",
        ],
        examples: [
          {
            title: "Checking orthogonality",
            steps: [
              "Are $\\mathbf{u} = \\langle 2, -3 \\rangle$ and $\\mathbf{v} = \\langle 3, 2 \\rangle$ orthogonal?",
              "$\\mathbf{u} \\cdot \\mathbf{v} = (2)(3) + (-3)(2) = 6 - 6 = 0$.",
              "Since the dot product is zero, they are orthogonal. ✓",
            ],
          },
        ],
      },
      {
        title: "Projections",
        body: [
          "The projection of $\\mathbf{u}$ onto $\\mathbf{v}$ is the vector component of $\\mathbf{u}$ in the direction of $\\mathbf{v}$: $\\text{proj}_{\\mathbf{v}} \\mathbf{u} = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\mathbf{v} \\cdot \\mathbf{v}} \\mathbf{v}$.",
          "The scalar projection (component) is $\\text{comp}_{\\mathbf{v}} \\mathbf{u} = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{v}\\|}$.",
          "Projections are used in least-squares fitting, orthogonal decomposition, and the Gram-Schmidt process.",
        ],
      },
      {
        title: "The cross product (R³ only)",
        body: [
          "The cross product $\\mathbf{u} \\times \\mathbf{v}$ is defined only in $\\mathbb{R}^3$ and produces a vector perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$.",
          "Formula: $\\mathbf{u} \\times \\mathbf{v} = \\langle u_2 v_3 - u_3 v_2,\\; u_3 v_1 - u_1 v_3,\\; u_1 v_2 - u_2 v_1 \\rangle$.",
          "The magnitude $\\|\\mathbf{u} \\times \\mathbf{v}\\| = \\|\\mathbf{u}\\| \\|\\mathbf{v}\\| \\sin\\theta$ equals the area of the parallelogram spanned by $\\mathbf{u}$ and $\\mathbf{v}$.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing the dot product (scalar result) with the cross product (vector result). They answer different questions.",
      "Forgetting that vectors must have the same dimension to be added or dotted.",
      "Normalizing a vector without checking that it is nonzero — division by zero if $\\|\\mathbf{v}\\| = 0$.",
      "Thinking that $\\mathbf{u} \\cdot \\mathbf{v} = 0$ means one of the vectors is zero. It means they are perpendicular, not zero.",
    ],
  },
  {
    topicId: "matrices",
    title: "Matrices",
    intro: [
      "A matrix is a rectangular array of numbers arranged in rows and columns. Matrices are the language of linear algebra — they encode systems of equations, linear transformations, and data.",
      "The key operations are addition, scalar multiplication, matrix multiplication, transposition, and computing determinants and inverses.",
      "Understanding matrices unlocks the ability to solve systems of equations, transform geometric objects, and analyze data structures.",
    ],
    sections: [
      {
        title: "Matrix notation and basic operations",
        body: [
          "An $m \\times n$ matrix has $m$ rows and $n$ columns. We write $A_{ij}$ for the entry in row $i$, column $j$.",
          "Addition: $(A + B)_{ij} = A_{ij} + B_{ij}$. Matrices must have the same dimensions.",
          "Scalar multiplication: $(cA)_{ij} = c \\cdot A_{ij}$.",
          "The transpose $A^T$ swaps rows and columns: $(A^T)_{ij} = A_{ji}$. If $A$ is $m \\times n$, then $A^T$ is $n \\times m$.",
        ],
        eli5: [
          "Think of a matrix as a spreadsheet of numbers. Adding two matrices is like adding two spreadsheets cell by cell. The transpose is like rotating the spreadsheet so rows become columns.",
        ],
      },
      {
        title: "Matrix multiplication",
        body: [
          "If $A$ is $m \\times n$ and $B$ is $n \\times p$, then $AB$ is $m \\times p$. The inner dimensions must match.",
          "Each entry: $(AB)_{ij} = \\sum_{k=1}^{n} A_{ik} B_{kj}$ — row $i$ of $A$ dotted with column $j$ of $B$.",
          "Matrix multiplication is not commutative: in general, $AB \\neq BA$.",
          "The identity matrix $I$ satisfies $AI = IA = A$ for any compatible matrix $A$.",
        ],
        examples: [
          {
            title: "Multiplying 2×2 matrices",
            steps: [
              "$A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, $B = \\begin{pmatrix} 2 & 0 \\\\ 1 & 3 \\end{pmatrix}$.",
              "$(AB)_{11} = 1(2) + 2(1) = 4$.",
              "$(AB)_{12} = 1(0) + 2(3) = 6$.",
              "$(AB)_{21} = 3(2) + 4(1) = 10$.",
              "$(AB)_{22} = 3(0) + 4(3) = 12$.",
              "$AB = \\begin{pmatrix} 4 & 6 \\\\ 10 & 12 \\end{pmatrix}$.",
            ],
          },
        ],
      },
      {
        title: "Determinants",
        body: [
          "The determinant is a scalar that encodes important properties of a square matrix. For $2 \\times 2$: $\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$.",
          "Geometric interpretation: $|\\det(A)|$ gives the factor by which $A$ scales area (in 2D) or volume (in 3D). If $\\det(A) < 0$, orientation is reversed.",
          "Key fact: $A$ is invertible if and only if $\\det(A) \\neq 0$.",
          "For $3 \\times 3$ matrices, use cofactor expansion along any row or column.",
        ],
      },
      {
        title: "Matrix inverse",
        body: [
          "The inverse of $A$ is the matrix $A^{-1}$ such that $AA^{-1} = A^{-1}A = I$. It exists only when $\\det(A) \\neq 0$.",
          "For $2 \\times 2$: $A^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$.",
          "For larger matrices, compute using row reduction: augment $[A | I]$ and reduce to $[I | A^{-1}]$.",
          "If $A\\mathbf{x} = \\mathbf{b}$ and $A$ is invertible, then $\\mathbf{x} = A^{-1}\\mathbf{b}$.",
        ],
        examples: [
          {
            title: "Inverse of a 2×2 matrix",
            steps: [
              "$A = \\begin{pmatrix} 3 & 1 \\\\ 2 & 5 \\end{pmatrix}$.",
              "$\\det(A) = 3(5) - 1(2) = 13$.",
              "$A^{-1} = \\frac{1}{13}\\begin{pmatrix} 5 & -1 \\\\ -2 & 3 \\end{pmatrix}$.",
            ],
          },
        ],
      },
      {
        title: "Special matrices",
        body: [
          "Symmetric: $A = A^T$. All eigenvalues are real. Common in statistics and physics.",
          "Diagonal: nonzero entries only on the main diagonal. Easy to multiply, invert, and exponentiate.",
          "Orthogonal: $A^T A = I$, meaning $A^{-1} = A^T$. Columns are orthonormal. Represents rotations and reflections.",
          "Upper/Lower triangular: all entries below/above the diagonal are zero. The determinant is the product of diagonal entries.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Assuming $AB = BA$. Matrix multiplication is not commutative.",
      "Trying to multiply matrices with incompatible dimensions. The number of columns of $A$ must equal the number of rows of $B$.",
      "Computing the inverse when $\\det(A) = 0$. Singular matrices have no inverse.",
      "Confusing the transpose with the inverse. $A^T \\neq A^{-1}$ in general (only for orthogonal matrices).",
    ],
  },
  {
    topicId: "systems",
    title: "Systems of Linear Equations",
    intro: [
      "A system of linear equations asks: which values of the unknowns satisfy all equations simultaneously? Linear algebra provides a systematic, algorithmic approach to solving any such system.",
      "The key tool is Gaussian elimination — reducing the augmented matrix to row echelon form. From there, you can read off whether the system has zero, one, or infinitely many solutions.",
      "Systems of equations appear everywhere: circuit analysis, network flow, curve fitting, economics, and computer graphics.",
    ],
    sections: [
      {
        title: "Setting up augmented matrices",
        body: [
          "A system of linear equations can be written as $A\\mathbf{x} = \\mathbf{b}$, where $A$ is the coefficient matrix, $\\mathbf{x}$ is the vector of unknowns, and $\\mathbf{b}$ is the constant vector.",
          "The augmented matrix $[A | \\mathbf{b}]$ captures all the information. Row operations on this matrix correspond to algebraic manipulations of the equations.",
          "Three elementary row operations preserve solutions: swap two rows, multiply a row by a nonzero scalar, add a multiple of one row to another.",
        ],
        eli5: [
          "Think of each equation as a constraint. If you have two equations with two unknowns, each equation describes a line. The solution is where the lines cross. Three equations with three unknowns? Each equation is a plane, and you are looking for where all three planes meet.",
        ],
      },
      {
        title: "Gaussian elimination",
        body: [
          "Forward elimination reduces the matrix to row echelon form (REF): a staircase pattern of leading ones, with zeros below each pivot.",
          "Back substitution then solves for each variable starting from the last row and working upward.",
          "Reduced row echelon form (RREF) goes further: each pivot is $1$ with zeros both above and below. This gives the solution directly.",
        ],
        examples: [
          {
            title: "Solving a 2×2 system",
            steps: [
              "System: $x + 2y = 5$ and $3x + 5y = 14$.",
              "Augmented matrix: $\\left(\\begin{array}{cc|c} 1 & 2 & 5 \\\\ 3 & 5 & 14 \\end{array}\\right)$.",
              "$R_2 \\leftarrow R_2 - 3R_1$: $\\left(\\begin{array}{cc|c} 1 & 2 & 5 \\\\ 0 & -1 & -1 \\end{array}\\right)$.",
              "From row 2: $-y = -1$, so $y = 1$. Back-substitute: $x + 2(1) = 5$, so $x = 3$.",
            ],
          },
        ],
      },
      {
        title: "Solution types",
        body: [
          "A system is consistent if it has at least one solution, and inconsistent if it has none (a row like $[0\\ 0\\ |\\ b]$ with $b \\neq 0$).",
          "A consistent system has a unique solution if every variable is a pivot variable, or infinitely many solutions if there are free variables.",
          "Free variables arise when the number of pivots is less than the number of unknowns. Each free variable can take any value, parameterizing the infinite family of solutions.",
        ],
      },
      {
        title: "Rank and the rank-nullity theorem",
        body: [
          "The rank of a matrix is the number of pivots in its row echelon form — equivalently, the dimension of the column space.",
          "The rank-nullity theorem: $\\text{rank}(A) + \\text{nullity}(A) = n$, where $n$ is the number of columns.",
          "For $A\\mathbf{x} = \\mathbf{b}$: the system is consistent iff $\\text{rank}([A|\\mathbf{b}]) = \\text{rank}(A)$. The solution is unique iff $\\text{rank}(A) = n$.",
        ],
      },
      {
        title: "Homogeneous systems",
        body: [
          "A homogeneous system $A\\mathbf{x} = \\mathbf{0}$ always has at least one solution: the trivial solution $\\mathbf{x} = \\mathbf{0}$.",
          "It has nontrivial solutions if and only if $\\text{rank}(A) < n$ (more unknowns than pivots).",
          "The solution set of a homogeneous system is the null space of $A$, which is always a subspace of $\\mathbb{R}^n$.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Performing invalid row operations (e.g., multiplying a row by zero, or swapping a row with a non-row).",
      "Declaring a system has no solution when there are free variables — free variables mean infinitely many solutions, not no solution.",
      "Forgetting to check for inconsistency: a row $[0\\ 0\\ \\cdots\\ 0\\ |\\ b]$ with $b \\neq 0$ means no solution.",
      "Confusing the rank of $A$ with the rank of the augmented matrix $[A|\\mathbf{b}]$. They can differ.",
    ],
  },
  {
    topicId: "spaces",
    title: "Vector Spaces",
    intro: [
      "Vector spaces are the abstract setting in which linear algebra operates. While $\\mathbb{R}^n$ is the most familiar example, vector spaces also include function spaces, polynomial spaces, and matrix spaces.",
      "The key concepts — span, linear independence, basis, and dimension — tell us about the structure and 'size' of a vector space.",
      "Understanding vector spaces reveals why linear algebra is so broadly applicable: the same theorems apply whether your vectors are arrows, polynomials, or signals.",
    ],
    sections: [
      {
        title: "Subspaces",
        body: [
          "A subspace of $\\mathbb{R}^n$ is a subset that is itself a vector space: it must contain $\\mathbf{0}$, and be closed under addition and scalar multiplication.",
          "Examples of subspaces: lines through the origin, planes through the origin, the null space of a matrix, the column space of a matrix.",
          "Non-examples: a line that does not pass through the origin, a circle, a set like $\\{(x,y) : x \\geq 0\\}$.",
        ],
        eli5: [
          "A subspace is like a flat surface passing through the origin. You can move anywhere on it by adding vectors and scaling them, and you will never leave the surface.",
        ],
      },
      {
        title: "Span",
        body: [
          "The span of a set of vectors is the set of all possible linear combinations: $\\text{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\} = \\{c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k : c_i \\in \\mathbb{R}\\}$.",
          "Span answers the question: what vectors can I reach by combining these vectors?",
          "If a set of vectors spans $\\mathbb{R}^n$, then every vector in $\\mathbb{R}^n$ can be written as a linear combination of them.",
        ],
      },
      {
        title: "Linear independence",
        body: [
          "Vectors $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$ are linearly independent if $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$ implies all $c_i = 0$.",
          "Equivalently, no vector in the set can be written as a linear combination of the others. Each vector contributes a genuinely new direction.",
          "In $\\mathbb{R}^n$, you can have at most $n$ linearly independent vectors.",
        ],
        examples: [
          {
            title: "Testing linear independence",
            steps: [
              "Are $\\langle 1, 2 \\rangle$ and $\\langle 3, 6 \\rangle$ linearly independent?",
              "Check: $\\langle 3, 6 \\rangle = 3 \\langle 1, 2 \\rangle$.",
              "Since one is a scalar multiple of the other, they are linearly dependent.",
            ],
          },
        ],
      },
      {
        title: "Basis and dimension",
        body: [
          "A basis for a vector space $V$ is a set of vectors that is linearly independent and spans $V$. Every vector in $V$ has a unique representation as a linear combination of basis vectors.",
          "The dimension of $V$ is the number of vectors in any basis. The standard basis for $\\mathbb{R}^n$ is $\\{\\mathbf{e}_1, \\ldots, \\mathbf{e}_n\\}$.",
          "Any two bases for the same space have the same number of vectors — dimension is well-defined.",
        ],
      },
      {
        title: "Column space and null space",
        body: [
          "The column space of $A$ is $\\text{Col}(A) = \\{A\\mathbf{x} : \\mathbf{x} \\in \\mathbb{R}^n\\}$ — the set of all possible outputs. Its dimension is the rank.",
          "The null space of $A$ is $\\text{Null}(A) = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$ — the set of inputs that map to zero. Its dimension is the nullity.",
          "The rank-nullity theorem connects them: $\\text{rank}(A) + \\text{nullity}(A) = n$.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Thinking any subset of $\\mathbb{R}^n$ is a subspace. It must contain $\\mathbf{0}$ and be closed under addition and scalar multiplication.",
      "Confusing 'spans $\\mathbb{R}^n$' with 'is linearly independent.' A basis must be both.",
      "Claiming $\\mathbb{R}^3$ has dimension $2$ because you found two independent vectors. You need to check if they span the whole space.",
      "Forgetting that the zero vector is always in the null space — the null space is never empty.",
    ],
  },
  {
    topicId: "eigenvalues",
    title: "Eigenvalues and Eigenvectors",
    intro: [
      "Eigenvalues and eigenvectors reveal the intrinsic geometry of a linear transformation. An eigenvector is a nonzero vector that only gets scaled — not rotated — when a matrix acts on it. The scale factor is the corresponding eigenvalue.",
      "Finding eigenvalues and eigenvectors reduces to solving $\\det(A - \\lambda I) = 0$, the characteristic equation. This single equation unlocks diagonalization, matrix powers, and stability analysis.",
      "Diagonalization — writing $A = PDP^{-1}$ — transforms a complex matrix into a diagonal one, making operations like $A^k$ trivial. This chapter also covers the connection between linear transformations and their matrix representations.",
    ],
    sections: [
      {
        title: "Definition and matrix representation",
        body: [
          "A function $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ is linear if $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$ and $T(c\\mathbf{v}) = cT(\\mathbf{v})$ for all vectors and scalars.",
          "Every such $T$ has a unique matrix $A$ such that $T(\\mathbf{x}) = A\\mathbf{x}$. The columns of $A$ are $T(\\mathbf{e}_1), T(\\mathbf{e}_2), \\ldots, T(\\mathbf{e}_n)$.",
          "Examples: rotations, reflections, projections, scaling — all are linear transformations.",
        ],
        eli5: [
          "A linear transformation is a rule that reshapes space without bending or tearing it. Lines stay as lines, the origin stays fixed, and parallel lines remain parallel.",
        ],
      },
      {
        title: "Kernel and image",
        body: [
          "The kernel (null space) of $T$ is $\\ker(T) = \\{\\mathbf{x} : T(\\mathbf{x}) = \\mathbf{0}\\}$. It measures what $T$ 'collapses' to zero.",
          "The image (range) of $T$ is $\\text{Im}(T) = \\{T(\\mathbf{x}) : \\mathbf{x} \\in V\\}$. It is the set of all possible outputs.",
          "$T$ is injective (one-to-one) iff $\\ker(T) = \\{\\mathbf{0}\\}$. $T$ is surjective (onto) iff $\\text{Im}(T) = W$.",
        ],
      },
      {
        title: "Eigenvalues and eigenvectors",
        body: [
          "An eigenvector of $A$ is a nonzero vector $\\mathbf{v}$ such that $A\\mathbf{v} = \\lambda \\mathbf{v}$ for some scalar $\\lambda$ (the eigenvalue). The transformation only scales $\\mathbf{v}$, without changing its direction.",
          "To find eigenvalues, solve $\\det(A - \\lambda I) = 0$ — the characteristic equation.",
          "For each eigenvalue $\\lambda$, find eigenvectors by solving $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$.",
          "Key properties: the sum of eigenvalues equals $\\text{tr}(A)$, and the product equals $\\det(A)$.",
        ],
        eli5: [
          "Imagine stretching a rubber sheet. Most points move in complicated ways, but some special arrows just get longer or shorter without rotating. Those are the eigenvectors — the 'natural directions' of the transformation.",
        ],
        examples: [
          {
            title: "Finding eigenvalues of a 2×2 matrix",
            steps: [
              "$A = \\begin{pmatrix} 4 & 1 \\\\ 0 & 3 \\end{pmatrix}$.",
              "Characteristic equation: $\\det(A - \\lambda I) = (4-\\lambda)(3-\\lambda) - 0 = 0$.",
              "$(4-\\lambda)(3-\\lambda) = 0$ gives $\\lambda = 4$ and $\\lambda = 3$.",
              "Check: $\\text{tr}(A) = 7 = 4 + 3$ ✓, $\\det(A) = 12 = 4 \\times 3$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Diagonalization",
        body: [
          "A matrix $A$ is diagonalizable if $A = PDP^{-1}$, where $D$ is a diagonal matrix of eigenvalues and $P$ is the matrix of corresponding eigenvectors.",
          "Diagonalization makes computing $A^k$ easy: $A^k = PD^kP^{-1}$, and powers of a diagonal matrix are trivial.",
          "$A$ is diagonalizable if and only if it has $n$ linearly independent eigenvectors (which happens whenever it has $n$ distinct eigenvalues).",
        ],
      },
      {
        title: "Geometric transformations",
        body: [
          "Rotation by angle $\\theta$ in $\\mathbb{R}^2$: $R = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}$. Determinant is $1$, preserving area.",
          "Reflection across the $x$-axis: $\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$. Determinant is $-1$, reversing orientation.",
          "Projection onto a line through the origin has eigenvalues $0$ and $1$. Points on the line are fixed; points perpendicular to it collapse to zero.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Claiming the zero vector is an eigenvector. By definition, eigenvectors must be nonzero.",
      "Forgetting to subtract $\\lambda I$ (not just $\\lambda$) when computing the characteristic polynomial.",
      "Assuming every matrix is diagonalizable. A matrix needs $n$ linearly independent eigenvectors.",
      "Confusing eigenvalues with eigenvectors. The eigenvalue is the scalar $\\lambda$; the eigenvector is the direction $\\mathbf{v}$.",
    ],
  },
  {
    topicId: "determinants",
    title: "Determinants",
    intro: [
      "The determinant is a single scalar that captures the most important properties of a square matrix. It tells you whether the matrix is invertible, how much it scales area or volume, and the sign of its orientation.",
      "The fundamental theorem: a square matrix $A$ is invertible if and only if $\\det(A) \\neq 0$. Every solvability criterion in linear algebra ultimately connects back to this fact.",
      "We compute determinants using cofactor expansion, then explore powerful properties that make calculation efficient. Applications include Cramer's Rule and the geometric interpretation of linear maps.",
    ],
    sections: [
      {
        title: "Cofactor expansion",
        body: [
          "For a $2 \\times 2$ matrix: $\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$.",
          "For larger matrices, use cofactor expansion along any row or column. Expanding along row $i$: $\\det(A) = \\sum_{j=1}^{n} (-1)^{i+j} a_{ij} M_{ij}$, where $M_{ij}$ is the $(i,j)$ minor — the determinant of $A$ with row $i$ and column $j$ removed.",
          "The sign pattern for cofactors follows the checkerboard $\\begin{pmatrix} + & - & + \\\\ - & + & - \\\\ + & - & + \\end{pmatrix}$. Choosing a row or column with many zeros minimizes computation.",
        ],
        eli5: [
          "The determinant of a $2\\times 2$ matrix is just \"main diagonal product minus off-diagonal product.\" For larger matrices, you peel off the problem layer by layer — each step reduces a $3\\times 3$ to three $2\\times 2$ problems.",
        ],
        examples: [
          {
            title: "Cofactor expansion of a 3×3 matrix",
            steps: [
              "$A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 4 & 5 \\\\ 1 & 0 & 6 \\end{pmatrix}$. Expand along the first row.",
              "$\\det(A) = 1 \\cdot \\det\\begin{pmatrix}4&5\\\\0&6\\end{pmatrix} - 2 \\cdot \\det\\begin{pmatrix}0&5\\\\1&6\\end{pmatrix} + 3 \\cdot \\det\\begin{pmatrix}0&4\\\\1&0\\end{pmatrix}$.",
              "$= 1(24 - 0) - 2(0 - 5) + 3(0 - 4)$.",
              "$= 24 + 10 - 12 = 22$.",
            ],
          },
        ],
      },
      {
        title: "Properties of determinants",
        body: [
          "Row operations change the determinant in predictable ways: swapping two rows multiplies $\\det$ by $-1$; scaling a row by $c$ multiplies $\\det$ by $c$; adding a multiple of one row to another leaves $\\det$ unchanged.",
          "Product rule: $\\det(AB) = \\det(A)\\det(B)$. As a consequence, $\\det(A^{-1}) = 1/\\det(A)$.",
          "Transpose rule: $\\det(A^T) = \\det(A)$. You can expand along columns as freely as rows.",
          "A matrix with two identical rows, a zero row, or a row that is a linear combination of others has determinant $0$.",
        ],
        eli5: [
          "The determinant behaves like a signed area. Swapping rows is like flipping the orientation of a shape — you get the same size but the sign flips. Scaling a row scales the area. Adding a multiple of one row to another is like a shear — it doesn't change area.",
        ],
      },
      {
        title: "Cramer's Rule",
        body: [
          "Cramer's Rule gives an explicit formula for the solution of $A\\mathbf{x} = \\mathbf{b}$ when $\\det(A) \\neq 0$: $x_i = \\frac{\\det(A_i)}{\\det(A)}$, where $A_i$ is $A$ with the $i$-th column replaced by $\\mathbf{b}$.",
          "Cramer's Rule is theoretically elegant but computationally expensive for large systems. Gaussian elimination is much faster in practice.",
          "Its real value is theoretical: it gives a closed-form expression for each variable and is used in proofs involving derivatives of matrix inverses.",
        ],
      },
      {
        title: "Geometric interpretation",
        body: [
          "For a $2\\times 2$ matrix $A$, $|\\det(A)|$ equals the area of the parallelogram formed by the columns of $A$. For $3\\times 3$, it is the volume of the parallelepiped.",
          "If $\\det(A) > 0$, the transformation preserves orientation (no reflection). If $\\det(A) < 0$, orientation is reversed.",
          "If $\\det(A) = 0$, the transformation collapses all of $\\mathbb{R}^n$ into a lower-dimensional subspace — the columns are linearly dependent.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Using the $2\\times 2$ formula $ad-bc$ on a $3\\times 3$ matrix without expanding. The formula only applies directly to $2\\times 2$ matrices.",
      "Getting cofactor signs wrong. The pattern alternates: entry $(i,j)$ has sign $(-1)^{i+j}$.",
      "Forgetting that $\\det(cA) = c^n \\det(A)$ for an $n\\times n$ matrix — each of the $n$ rows gets scaled.",
      "Assuming $\\det(A+B) = \\det(A) + \\det(B)$. Determinants are not linear in the whole matrix, only in each individual row.",
    ],
  },
  {
    topicId: "orthogonality",
    title: "Orthogonality and Least Squares",
    intro: [
      "Orthogonality — the generalization of perpendicularity to higher dimensions — is one of the most useful structures in linear algebra. Orthogonal vectors and bases make computations dramatically simpler.",
      "The central application is the least-squares problem: given an inconsistent system $A\\mathbf{x} = \\mathbf{b}$ (more equations than unknowns, no exact solution), find the $\\hat{\\mathbf{x}}$ that makes $\\|A\\hat{\\mathbf{x}} - \\mathbf{b}\\|$ as small as possible.",
      "The Gram-Schmidt process converts any basis into an orthonormal one, and its output is the foundation of the QR decomposition used in numerical linear algebra.",
    ],
    sections: [
      {
        title: "Inner product, length, and orthogonality",
        body: [
          "The inner product (dot product) of $\\mathbf{u}$ and $\\mathbf{v}$ in $\\mathbb{R}^n$ is $\\mathbf{u} \\cdot \\mathbf{v} = \\mathbf{u}^T \\mathbf{v}$. The length is $\\|\\mathbf{v}\\| = \\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$.",
          "Two vectors are orthogonal if $\\mathbf{u} \\cdot \\mathbf{v} = 0$. A vector is a unit vector if $\\|\\mathbf{v}\\| = 1$. An orthonormal set is both orthogonal and unit-length.",
          "The orthogonal complement of a subspace $W$ is $W^\\perp = \\{\\mathbf{v} : \\mathbf{v} \\cdot \\mathbf{w} = 0 \\text{ for all } \\mathbf{w} \\in W\\}$. Key fact: $(\\text{Row}(A))^\\perp = \\text{Null}(A)$.",
        ],
        eli5: [
          "Orthogonal vectors are perpendicular to each other — they carry completely independent information. Orthonormal vectors are both perpendicular and unit-length, like the $x$-, $y$-, $z$-axes. Working in an orthonormal basis is like using a clean, square grid — coordinates are easy to compute.",
        ],
      },
      {
        title: "Orthogonal sets and projections",
        body: [
          "An orthogonal set of nonzero vectors is automatically linearly independent. An orthonormal basis $\\{\\mathbf{u}_1, \\ldots, \\mathbf{u}_n\\}$ gives immediate coordinates: the component of $\\mathbf{y}$ along $\\mathbf{u}_k$ is simply $\\mathbf{y} \\cdot \\mathbf{u}_k$.",
          "The orthogonal projection of $\\mathbf{y}$ onto a subspace $W$ is the closest point in $W$ to $\\mathbf{y}$: $\\hat{\\mathbf{y}} = \\text{proj}_W \\mathbf{y}$. The error $\\mathbf{y} - \\hat{\\mathbf{y}}$ is orthogonal to $W$.",
          "If $\\{\\mathbf{u}_1, \\ldots, \\mathbf{u}_p\\}$ is an orthonormal basis for $W$, then $\\hat{\\mathbf{y}} = (\\mathbf{y}\\cdot\\mathbf{u}_1)\\mathbf{u}_1 + \\cdots + (\\mathbf{y}\\cdot\\mathbf{u}_p)\\mathbf{u}_p$.",
        ],
        examples: [
          {
            title: "Projecting onto a subspace",
            steps: [
              "Project $\\mathbf{y} = \\langle 1, 2, 3 \\rangle$ onto $W = \\text{span}\\{\\mathbf{u}_1\\}$ where $\\mathbf{u}_1 = \\langle 1, 0, 0 \\rangle$ (already a unit vector).",
              "$\\hat{\\mathbf{y}} = (\\mathbf{y}\\cdot\\mathbf{u}_1)\\mathbf{u}_1 = (1)(\\langle 1,0,0 \\rangle) = \\langle 1, 0, 0 \\rangle$.",
              "Error: $\\mathbf{y} - \\hat{\\mathbf{y}} = \\langle 0, 2, 3 \\rangle$. Check: $\\langle 0,2,3 \\rangle \\cdot \\langle 1,0,0 \\rangle = 0$ ✓.",
            ],
          },
        ],
      },
      {
        title: "The Gram-Schmidt process",
        body: [
          "Gram-Schmidt converts a linearly independent set $\\{\\mathbf{x}_1, \\ldots, \\mathbf{x}_p\\}$ into an orthonormal basis $\\{\\mathbf{u}_1, \\ldots, \\mathbf{u}_p\\}$ for the same subspace.",
          "Step: set $\\mathbf{v}_k = \\mathbf{x}_k - \\text{proj}_{\\mathbf{v}_1}\\mathbf{x}_k - \\cdots - \\text{proj}_{\\mathbf{v}_{k-1}}\\mathbf{x}_k$ (subtract projections onto all previous vectors). Then normalize: $\\mathbf{u}_k = \\mathbf{v}_k / \\|\\mathbf{v}_k\\|$.",
          "The process produces the QR factorization $A = QR$, where $Q$ has orthonormal columns and $R$ is upper triangular.",
        ],
        eli5: [
          "Gram-Schmidt is like building a clean coordinate system one axis at a time. The first axis is just the first vector, normalized. The second axis is the second vector with any 'shadow' on the first axis removed, then normalized. Each step strips out any component that overlaps with the axes already built.",
        ],
      },
      {
        title: "Least-squares problems",
        body: [
          "When $A\\mathbf{x} = \\mathbf{b}$ has no solution (the system is inconsistent), the least-squares solution $\\hat{\\mathbf{x}}$ minimizes $\\|A\\mathbf{x} - \\mathbf{b}\\|$.",
          "The least-squares solution satisfies the normal equations: $A^T A \\hat{\\mathbf{x}} = A^T \\mathbf{b}$. If $A$ has linearly independent columns, $A^T A$ is invertible and $\\hat{\\mathbf{x}} = (A^T A)^{-1} A^T \\mathbf{b}$.",
          "Geometrically, $A\\hat{\\mathbf{x}}$ is the projection of $\\mathbf{b}$ onto the column space of $A$ — the closest point in $\\text{Col}(A)$ to $\\mathbf{b}$.",
          "Application: fitting a line $y = mx + b$ to data points minimizes the sum of squared vertical errors. This is ordinary least-squares (OLS) regression.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Assuming orthogonal vectors are also unit-length. Orthogonal means perpendicular ($\\mathbf{u}\\cdot\\mathbf{v}=0$); orthonormal means both perpendicular and unit-length.",
      "Using the projection formula for a general vector when an orthonormal basis is not available. The formula $\\hat{\\mathbf{y}} = \\sum (\\mathbf{y}\\cdot\\mathbf{u}_k)\\mathbf{u}_k$ only holds when $\\{\\mathbf{u}_k\\}$ is orthonormal.",
      "Forgetting to subtract all previous projections in Gram-Schmidt. Each new vector must be orthogonal to all previously computed vectors.",
      "Setting up the normal equations incorrectly. The formula is $A^T A \\hat{\\mathbf{x}} = A^T \\mathbf{b}$, not $A\\hat{\\mathbf{x}} = \\mathbf{b}$.",
    ],
  },
  {
    topicId: "symmetric-matrices",
    title: "Symmetric Matrices and Quadratic Forms",
    intro: [
      "Symmetric matrices are the most well-behaved matrices in linear algebra. The Spectral Theorem guarantees that every real symmetric matrix is orthogonally diagonalizable — its eigenvectors form an orthonormal basis.",
      "Quadratic forms — expressions like $\\mathbf{x}^T A \\mathbf{x}$ — arise in optimization, physics, and statistics. Their classification (positive definite, indefinite, etc.) determines the shape of level curves and the nature of critical points.",
      "The Singular Value Decomposition (SVD) extends diagonalization to non-square matrices and underlies modern data analysis tools like Principal Component Analysis (PCA).",
    ],
    sections: [
      {
        title: "The Spectral Theorem",
        body: [
          "A real symmetric matrix $A$ ($A = A^T$) always has real eigenvalues and eigenvectors from different eigenspaces are automatically orthogonal.",
          "The Spectral Theorem: every real symmetric matrix can be orthogonally diagonalized as $A = PDP^T$, where $P$ is orthogonal ($P^{-1} = P^T$) and $D$ is diagonal.",
          "This is stronger than ordinary diagonalization: the eigenvector matrix $P$ is orthogonal, so $P^{-1}$ is just $P^T$ — no matrix inversion needed.",
        ],
        eli5: [
          "For symmetric matrices, everything aligns perfectly. The natural directions (eigenvectors) of the transformation are guaranteed to be perpendicular to each other. It's like a perfect axis-aligned stretch — no rotation, no shear, just scaling along clean orthogonal axes.",
        ],
      },
      {
        title: "Quadratic forms",
        body: [
          "A quadratic form in $\\mathbf{x} \\in \\mathbb{R}^n$ is $Q(\\mathbf{x}) = \\mathbf{x}^T A \\mathbf{x}$ where $A$ is symmetric. In $\\mathbb{R}^2$: $Q(x_1, x_2) = ax_1^2 + 2bx_1 x_2 + cx_2^2$.",
          "Classification by eigenvalues: $Q$ is positive definite if all eigenvalues $> 0$; positive semidefinite if all $\\geq 0$; negative definite if all $< 0$; indefinite if eigenvalues have mixed signs.",
          "The change of variable $\\mathbf{x} = P\\mathbf{y}$ (principal axes) eliminates cross terms, reducing $Q$ to a sum of squared terms: $Q = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2$.",
        ],
      },
      {
        title: "Singular Value Decomposition",
        body: [
          "Every $m \\times n$ matrix $A$ factors as $A = U \\Sigma V^T$, where $U$ is $m\\times m$ orthogonal, $V$ is $n\\times n$ orthogonal, and $\\Sigma$ is $m\\times n$ diagonal with nonneg entries $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0$ (singular values).",
          "Singular values: $\\sigma_i = \\sqrt{\\lambda_i(A^T A)}$. The columns of $V$ are eigenvectors of $A^T A$; columns of $U$ are eigenvectors of $AA^T$.",
          "SVD generalizes diagonalization to rectangular matrices and provides the best low-rank approximation (Eckart-Young theorem): truncating to the $k$ largest singular values gives the closest rank-$k$ matrix to $A$.",
        ],
        eli5: [
          "SVD decomposes any transformation into three simple steps: first rotate (or reflect) the input, then stretch along the coordinate axes (that's $\\Sigma$), then rotate (or reflect) the output. Every matrix, no matter its shape, can be broken down this way.",
        ],
      },
      {
        title: "Principal Component Analysis",
        body: [
          "PCA finds the directions of maximum variance in a dataset. Given a data matrix $X$ (centered), compute the covariance matrix $C = \\frac{1}{n-1}X^T X$.",
          "The eigenvectors of $C$ are the principal components — the directions that capture the most variance. The corresponding eigenvalues give the variance explained by each direction.",
          "In SVD terms: the right singular vectors of $X$ are the principal components; the singular values squared (scaled) are the variances.",
          "PCA is used for dimensionality reduction: projecting data onto the top $k$ principal components captures the most information in $k$ dimensions.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing $A = PDP^{-1}$ (general diagonalization) with $A = PDP^T$ (symmetric case). The symmetric case uses $P^T$ instead of $P^{-1}$ because $P$ is orthogonal.",
      "Thinking that all diagonalizable matrices are symmetric. Symmetric matrices are orthogonally diagonalizable; diagonalizable matrices need not be symmetric.",
      "Confusing singular values with eigenvalues. Eigenvalues can be negative; singular values are always nonneg. For symmetric positive definite $A$, they coincide.",
      "Skipping the centering step in PCA. The covariance matrix requires the data to be mean-centered first.",
    ],
  },
];
