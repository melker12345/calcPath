import type { Topic } from "./shared-types";
import type { ModuleContent, ModuleSection, WorkedExample } from "./modules/types";
import { vectorsModule, matricesModule, systemsModule, spacesModule, eigenvaluesModule, determinantsModule, orthogonalityModule, symmetricMatricesModule } from "./modules/linear-algebra";

export type { ModuleContent, ModuleSection, WorkedExample };

export const modules: ModuleContent[] = [
  vectorsModule,  // extracted
  {
    topicId: "matrices",
    title: "Matrices",
    intro: [
      "A matrix is a rectangular array of numbers. This compact notation encodes systems of equations, linear transformations, data tables, and geometric operations. Everything you do in applied linear algebra involves matrices.",
      "The operations — addition, multiplication, transposition, and inversion — are not arbitrary rules. Each arises from the task of representing and composing linear transformations. Once you understand the motivation, the rules become natural.",
      "This chapter lays the algebraic groundwork for solving systems (Chapter 3), understanding vector spaces (Chapter 4), and computing eigenvalues (Chapter 5).",
    ],
    sections: [
      {
        title: "Matrix notation and basic operations",
        section: "operations",
        body: [
          "An $m \\times n$ matrix has $m$ rows and $n$ columns. The entry in row $i$, column $j$ is $A_{ij}$. A square matrix has $m = n$.",
          "Matrix addition: $(A+B)_{ij} = A_{ij}+B_{ij}$. Both matrices must have the same dimensions; you cannot add a $3\\times 2$ to a $2\\times 3$.",
          "Scalar multiplication: $(cA)_{ij} = c\\,A_{ij}$ — every entry is scaled by $c$.",
          "The transpose $A^T$ is obtained by swapping rows and columns: $(A^T)_{ij} = A_{ji}$. If $A$ is $m\\times n$, then $A^T$ is $n\\times m$. Key properties: $(AB)^T = B^TA^T$ (order reverses), $(A^T)^T = A$, $(A+B)^T = A^T+B^T$.",
          "A matrix is symmetric if $A = A^T$. Symmetric matrices appear ubiquitously in statistics (covariance matrices), physics (inertia tensors), and optimisation (Hessians). They are always square, and their eigenvalues are always real.",
          "The trace of a square matrix is the sum of its diagonal entries: $\\text{tr}(A) = \\sum_{i=1}^n A_{ii}$. It equals the sum of the eigenvalues of $A$ and satisfies $\\text{tr}(AB) = \\text{tr}(BA)$ even when $AB \\neq BA$.",
        ],
        eli5: [
          "A matrix is a spreadsheet of numbers. Adding two matrices is adding two spreadsheets cell by cell — they must have the same shape. Multiplying by a scalar scales every cell. Transposing rotates the spreadsheet so rows become columns.",
        ],
        examples: [
          {
            title: "Addition and transpose",
            steps: [
              "$A = \\begin{pmatrix}1&3\\\\2&0\\end{pmatrix}$, $B = \\begin{pmatrix}-1&4\\\\1&5\\end{pmatrix}$.",
              "$A+B = \\begin{pmatrix}0&7\\\\3&5\\end{pmatrix}$.",
              "$2A = \\begin{pmatrix}2&6\\\\4&0\\end{pmatrix}$.",
              "$A^T = \\begin{pmatrix}1&2\\\\3&0\\end{pmatrix}$. Note $A_{12}=3$ became $A^T_{21}=3$.",
              "Is $A$ symmetric? $A_{12}=3 \\neq 2=A_{21}$, so no.",
            ],
          },
        ],
      },
      {
        title: "Matrix multiplication",
        section: "multiplication",
        body: [
          "If $A$ is $m\\times n$ and $B$ is $n\\times p$, the product $AB$ is $m\\times p$. The inner dimensions must match: columns of $A$ must equal rows of $B$.",
          "Each entry is a dot product: $(AB)_{ij} = \\sum_{k=1}^{n} A_{ik}\\,B_{kj}$ — row $i$ of $A$ dotted with column $j$ of $B$.",
          "Why this definition? It encodes composition of linear transformations. If $T_A: \\mathbb{R}^n\\to\\mathbb{R}^m$ and $T_B: \\mathbb{R}^p\\to\\mathbb{R}^n$, then the composed map $T_A \\circ T_B$ is represented by $AB$. The rule $(AB)\\mathbf{x} = A(B\\mathbf{x})$ forces this definition.",
          "Matrix multiplication is not commutative: $AB \\neq BA$ in general, even when both products exist and have the same size. It is associative: $(AB)C = A(BC)$, and distributive: $A(B+C) = AB+AC$.",
          "The identity matrix $I_n$ (ones on the diagonal, zeros elsewhere) satisfies $AI = IA = A$. It is the matrix analogue of the number $1$.",
          "Column picture: $A\\mathbf{v} = v_1\\mathbf{a}_1 + v_2\\mathbf{a}_2 + \\cdots + v_n\\mathbf{a}_n$, a linear combination of the columns of $A$ with coefficients from $\\mathbf{v}$. This column view is the key to understanding column spaces and linear independence.",
        ],
        eli5: [
          "Matrix multiplication is like following two sets of instructions in sequence. $B$ maps inputs to an intermediate space; $A$ maps that to the final output. The product $AB$ gives you the combined effect. Because the order of instructions matters, $AB \\neq BA$ in general.",
        ],
        examples: [
          {
            title: "2×2 matrix multiplication",
            steps: [
              "$A = \\begin{pmatrix}2&1\\\\3&4\\end{pmatrix}$, $B = \\begin{pmatrix}1&0\\\\-1&2\\end{pmatrix}$.",
              "$(AB)_{11}$: row $1$ of $A$ · col $1$ of $B$: $(2)(1)+(1)(-1) = 1$.",
              "$(AB)_{12}$: row $1$ · col $2$: $(2)(0)+(1)(2) = 2$.",
              "$(AB)_{21}$: row $2$ · col $1$: $(3)(1)+(4)(-1) = -1$.",
              "$(AB)_{22}$: row $2$ · col $2$: $(3)(0)+(4)(2) = 8$.",
              "$AB = \\begin{pmatrix}1&2\\\\-1&8\\end{pmatrix}$.",
            ],
          },
        ],
      },
      {
        title: "Determinants",
        section: "determinants",
        body: [
          "The determinant is a scalar assigned to every square matrix that captures whether it is invertible, how it scales area/volume, and whether it preserves orientation.",
          "For $2\\times 2$: $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc$. The main-diagonal product minus the anti-diagonal product.",
          "Geometric meaning: $|\\det(A)|$ is the factor by which the transformation $A$ multiplies area ($n=2$) or volume ($n=3$). $\\det(A)=2$ means areas are doubled; $\\det(A)=0$ means the transformation collapses space to a lower dimension.",
          "Sign of the determinant: $\\det(A)>0$ means orientation is preserved (no reflection). $\\det(A)<0$ means orientation is reversed.",
          "The invertibility theorem: $A$ is invertible $\\iff$ $\\det(A) \\neq 0$. A singular matrix (det $=0$) squashes space and cannot be undone — its inverse does not exist. For $3\\times 3$ and larger matrices, cofactor expansion is covered in Chapter 6.",
        ],
        eli5: [
          "The determinant measures how much a matrix stretches or squishes space. A value of $3$ means it triples all areas. A value of $-1$ means it reflects without changing size. A value of $0$ means it flattens everything — you lose a whole dimension and can never get it back.",
        ],
      },
      {
        title: "Matrix inverse",
        section: "inverse",
        body: [
          "The inverse $A^{-1}$ of a square matrix $A$ satisfies $AA^{-1} = A^{-1}A = I$. It exists if and only if $\\det(A) \\neq 0$. A matrix without an inverse is called singular.",
          "For $2\\times 2$: $A^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$. Swap the main-diagonal entries, negate the off-diagonal entries, and divide by the determinant.",
          "For larger matrices, use Gauss-Jordan elimination: row-reduce the augmented matrix $[A\\;|\\;I]$. When the left block reaches $I$, the right block is $A^{-1}$.",
          "The inverse solves $A\\mathbf{x}=\\mathbf{b}$ immediately: $\\mathbf{x} = A^{-1}\\mathbf{b}$. However, computing $A^{-1}$ explicitly is costly. Gaussian elimination solves systems more efficiently without forming the inverse.",
          "Key properties: $(AB)^{-1} = B^{-1}A^{-1}$ (order reverses), $(A^{-1})^{-1}=A$, $(A^T)^{-1}=(A^{-1})^T$, $\\det(A^{-1})=1/\\det(A)$.",
          "Orthogonal matrices satisfy $Q^TQ=I$, so $Q^{-1}=Q^T$. For these matrices (rotations and reflections), the inverse is free — just transpose.",
        ],
        eli5: [
          "The inverse undoes what the matrix does. Rotate $30°$: the inverse rotates $-30°$. Double all lengths: the inverse halves them. A singular matrix flattens space — information is permanently lost and no inverse can recover it.",
        ],
        examples: [
          {
            title: "Inverse of a 2×2 matrix with verification",
            steps: [
              "Find $A^{-1}$ for $A = \\begin{pmatrix}3&1\\\\5&2\\end{pmatrix}$.",
              "$\\det(A) = 6-5 = 1$. Inverse exists.",
              "$A^{-1} = \\frac{1}{1}\\begin{pmatrix}2&-1\\\\-5&3\\end{pmatrix}$.",
              "Verify: $AA^{-1} = \\begin{pmatrix}3&1\\\\5&2\\end{pmatrix}\\begin{pmatrix}2&-1\\\\-5&3\\end{pmatrix} = \\begin{pmatrix}6-5&-3+3\\\\10-10&-5+6\\end{pmatrix} = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Special matrices",
        section: "properties",
        body: [
          "Symmetric matrices: $A = A^T$. By the Spectral Theorem (Chapter 8), all eigenvalues are real and there exists an orthonormal eigenvector basis. These arise in covariance matrices, Hessians, and physics.",
          "Orthogonal matrices: $Q^TQ = I$. Columns are orthonormal. $\\det(Q) = \\pm 1$. They represent rotations ($\\det=+1$) and reflections ($\\det=-1$). The inverse is simply the transpose: $Q^{-1}=Q^T$.",
          "Diagonal matrices: nonzero entries only on the main diagonal. Trivial to invert ($D^{-1}_{ii}=1/D_{ii}$), multiply ($(D_1D_2)_{ii}=(D_1)_{ii}(D_2)_{ii}$), and exponentiate. Diagonalisation is the act of finding a basis in which a matrix looks diagonal.",
          "Upper/lower triangular: all entries below/above the diagonal are zero. The determinant equals the product of diagonal entries. Systems $L\\mathbf{x}=\\mathbf{b}$ (lower) are solved by forward substitution; $U\\mathbf{x}=\\mathbf{b}$ (upper) by back substitution. The LU decomposition writes any invertible matrix as $A=LU$.",
          "Idempotent matrices: $P^2=P$. Projection matrices are idempotent — projecting twice gives the same result. They have eigenvalues $0$ and $1$ only.",
        ],
        eli5: [
          "Symmetric matrices are perfectly balanced across their diagonal. Orthogonal matrices are rigid rotations — nothing stretches or shrinks. Diagonal matrices are the simplest: each axis is just scaled independently, with no mixing. These are the building blocks everything else reduces to.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Assuming $AB = BA$. Matrix multiplication is almost never commutative. Even $2\\times 2$ matrices fail this.",
      "Multiplying matrices with incompatible dimensions. An $m\\times n$ matrix can only right-multiply an $n\\times p$ matrix.",
      "Computing the inverse when $\\det(A)=0$. Singular matrices have no inverse. The $2\\times 2$ formula gives division by zero.",
      "Confusing the transpose with the inverse. $A^T \\neq A^{-1}$ unless $A$ is orthogonal.",
      "Forgetting that $(AB)^{-1} = B^{-1}A^{-1}$ and $(AB)^T = B^TA^T$ — both reverse the order.",
    ],
  },
  systemsModule,  // extracted
  spacesModule,  // extracted
  eigenvaluesModule,  // extracted
  determinantsModule,  // extracted
  orthogonalityModule,  // extracted
  symmetricMatricesModule,  // extracted
;
