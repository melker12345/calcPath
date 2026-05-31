import type { Topic } from "./shared-types";
import type { ModuleContent, ModuleSection, WorkedExample } from "./modules/types";

import {
  vectorsModule,
  matricesModule,
  systemsModule,
  spacesModule,
  eigenvaluesModule,
  determinantsModule,
  orthogonalityModule,
  symmetricMatricesModule
} from "./modules/linear-algebra";

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
  {
    topicId: "determinants",
    title: "Determinants",
    intro: [
      "The determinant is a single number that encodes the most essential properties of a square matrix: whether it is invertible, how it scales volumes, and whether it preserves or reverses orientation. Despite appearing as an arcane formula, it has deep geometric meaning.",
      "The central fact: $A$ is invertible if and only if $\\det(A)\\neq 0$. A zero determinant means the matrix collapses space to a lower dimension — information is permanently lost and the transformation cannot be undone.",
      "We compute determinants by cofactor expansion, exploit transformation properties to simplify calculations, and connect the result to Cramer's Rule and geometry.",
    ],
    sections: [
      {
        title: "Cofactor expansion",
        section: "cofactor",
        body: [
          "For $2\\times 2$: $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad-bc$. Main diagonal minus anti-diagonal.",
          "For $n\\times n$, expand along any row or column. Along row $i$: $\\det(A) = \\sum_{j=1}^{n}(-1)^{i+j}\\,a_{ij}\\,M_{ij}$, where the $(i,j)$ minor $M_{ij}$ is the determinant of the $(n-1)\\times(n-1)$ submatrix obtained by deleting row $i$ and column $j$. The factor $(-1)^{i+j}$ is the cofactor sign.",
          "Sign pattern: $(-1)^{i+j}$ creates a checkerboard starting with $+$ at $(1,1)$: $\\begin{pmatrix}+&-&+\\\\-&+&-\\\\+&-&+\\end{pmatrix}$. Always expand along the row or column with the most zeros to minimise computation.",
          "For a triangular matrix (upper or lower), the determinant is simply the product of the diagonal entries. Row reducing to triangular form is often faster than cofactor expansion for large matrices.",
        ],
        eli5: [
          "The $2\\times 2$ determinant is just 'main diagonal product minus off-diagonal product.' For $3\\times 3$, you split the problem into three $2\\times 2$ problems, alternating signs. Each step peels off one layer of the calculation.",
        ],
        examples: [
          {
            title: "3×3 determinant by cofactor expansion",
            steps: [
              "$A = \\begin{pmatrix}1&2&3\\\\0&4&5\\\\1&0&6\\end{pmatrix}$. Expand along row 1 (start with the most zeros, but row 1 works fine here).",
              "$\\det(A) = 1\\cdot\\det\\begin{pmatrix}4&5\\\\0&6\\end{pmatrix} - 2\\cdot\\det\\begin{pmatrix}0&5\\\\1&6\\end{pmatrix} + 3\\cdot\\det\\begin{pmatrix}0&4\\\\1&0\\end{pmatrix}$.",
              "$= 1(24-0) - 2(0-5) + 3(0-4)$.",
              "$= 24 + 10 - 12 = 22$.",
            ],
          },
        ],
      },
      {
        title: "Properties of determinants",
        section: "properties",
        body: [
          "Row operations have predictable effects: swapping two rows multiplies $\\det$ by $-1$; scaling a row by $c$ multiplies $\\det$ by $c$; adding a scalar multiple of one row to another leaves $\\det$ unchanged. These three rules make row reduction a fast alternative to cofactor expansion.",
          "Product rule: $\\det(AB)=\\det(A)\\det(B)$. Composition scales volumes multiplicatively. Consequences: $\\det(A^{-1})=1/\\det(A)$ and $\\det(A^k)=\\det(A)^k$.",
          "Transpose rule: $\\det(A^T)=\\det(A)$. Rows and columns play symmetric roles in the determinant.",
          "Scaling: $\\det(cA) = c^n\\det(A)$ for an $n\\times n$ matrix, because each of the $n$ rows is scaled by $c$.",
          "A matrix has $\\det=0$ whenever: two rows are equal, a row is all zeros, a row is a linear combination of the others (i.e., the rows are linearly dependent). All of these are equivalent to the columns being linearly dependent.",
        ],
        eli5: [
          "Swapping rows is like flipping a shape — same size, opposite orientation, so the sign flips. Scaling a row scales the 'height' of the shape, proportionally scaling the area. Adding a row multiple is a shear — it slides rows without changing area.",
        ],
      },
      {
        title: "Cramer's Rule",
        section: "cramer",
        body: [
          "For an invertible system $A\\mathbf{x}=\\mathbf{b}$, Cramer's Rule gives each variable explicitly: $x_i = \\det(A_i)/\\det(A)$, where $A_i$ is the matrix $A$ with its $i$-th column replaced by $\\mathbf{b}$.",
          "Cramer's Rule is elegant but computationally expensive — computing $n+1$ determinants of $n\\times n$ matrices is $O(n!)$ for each determinant via cofactor expansion, far slower than $O(n^3)$ Gaussian elimination.",
          "Its primary value is theoretical. The formula shows that solutions are rational functions of the entries of $A$ and $\\mathbf{b}$, which is useful in sensitivity analysis and proofs involving matrix calculus (e.g., the derivative of the inverse).",
        ],
        eli5: [
          "Cramer's Rule gives you each unknown in one formula. It's like having a direct calculator for the answer, without any elimination steps. The problem is the calculator is very slow for big systems. Gaussian elimination is the fast version for practical computation.",
        ],
        examples: [
          {
            title: "Cramer's Rule for a 2×2 system",
            steps: [
              "Solve $3x+y=7$, $2x+5y=4$ using Cramer's Rule.",
              "$A=\\begin{pmatrix}3&1\\\\2&5\\end{pmatrix}$, $\\mathbf{b}=\\begin{pmatrix}7\\\\4\\end{pmatrix}$, $\\det(A)=15-2=13$.",
              "$x = \\det\\begin{pmatrix}7&1\\\\4&5\\end{pmatrix}/13 = (35-4)/13 = 31/13$.",
              "$y = \\det\\begin{pmatrix}3&7\\\\2&4\\end{pmatrix}/13 = (12-14)/13 = -2/13$.",
            ],
          },
        ],
      },
      {
        title: "Geometric interpretation",
        section: "geometric",
        body: [
          "For a $2\\times 2$ matrix $A$, $|\\det(A)|$ equals the area of the parallelogram spanned by the columns (or rows) of $A$. For $3\\times 3$, it equals the volume of the parallelepiped.",
          "If $\\det(A)>0$, the transformation preserves orientation (counterclockwise goes to counterclockwise). If $\\det(A)<0$, orientation is reversed (a reflection is involved).",
          "If $\\det(A)=0$, the columns are linearly dependent and the transformation collapses the full-dimensional space to a lower-dimensional one — it maps $\\mathbb{R}^n$ onto a proper subspace.",
          "The determinant is multilinear and alternating in the columns: scaling one column by $c$ scales $\\det$ by $c$; swapping two columns flips the sign. The parallelogram area interpretation makes this geometric: scaling a side scales the area; reflecting a side flips orientation.",
        ],
        eli5: [
          "The determinant tells you how much the matrix squishes or stretches space. A value of $3$ means it triples all areas. A value of $0.5$ means it halves them. A negative value means it flips orientation. Zero means it squashes a whole dimension flat — irreversibly.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Applying $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc$ directly to a $3\\times 3$ matrix. You must expand.",
      "Getting cofactor signs wrong. Entry $(i,j)$ has sign $(-1)^{i+j}$: $(1,1)$ is $+$, $(1,2)$ is $-$, $(2,1)$ is $-$, etc.",
      "Writing $\\det(cA)=c\\,\\det(A)$ for an $n\\times n$ matrix. The correct formula is $\\det(cA)=c^n\\det(A)$.",
      "Assuming $\\det(A+B)=\\det(A)+\\det(B)$. The determinant is multilinear in each row separately, not in the whole matrix.",
      "Expanding along the wrong row and missing the sign pattern. Always recheck the checkerboard before assigning cofactor signs.",
    ],
  },
  {
    topicId: "orthogonality",
    title: "Orthogonality and Least Squares",
    intro: [
      "Orthogonality — the generalisation of perpendicularity to any number of dimensions — is one of the most powerful structures in linear algebra. Orthogonal vectors carry independent information; orthonormal bases make coordinate computations trivial.",
      "The central application is the least-squares problem: when a system $A\\mathbf{x}=\\mathbf{b}$ has no solution (more equations than unknowns), find the $\\hat{\\mathbf{x}}$ that minimises $\\|A\\hat{\\mathbf{x}}-\\mathbf{b}\\|$. The answer is the projection of $\\mathbf{b}$ onto the column space of $A$.",
      "Gram-Schmidt orthogonalisation and the QR decomposition are the computational engines. They appear in numerical analysis, statistics (regression), signal processing, and machine learning.",
    ],
    sections: [
      {
        title: "Inner product, length, and orthogonality",
        section: "dot",
        body: [
          "In $\\mathbb{R}^n$, the inner product (dot product) is $\\mathbf{u}\\cdot\\mathbf{v} = \\mathbf{u}^T\\mathbf{v} = \\sum_i u_iv_i$. The length is $\\|\\mathbf{v}\\|=\\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$.",
          "Two vectors are orthogonal if $\\mathbf{u}\\cdot\\mathbf{v}=0$. A unit vector has $\\|\\mathbf{v}\\|=1$. An orthonormal set is orthogonal and every vector has unit length.",
          "The orthogonal complement of a subspace $W$ is $W^\\perp = \\{\\mathbf{v}: \\mathbf{v}\\cdot\\mathbf{w}=0\\text{ for all }\\mathbf{w}\\in W\\}$. Key relationship: $(\\text{Row}(A))^\\perp=\\text{Null}(A)$ and $(\\text{Col}(A))^\\perp=\\text{Null}(A^T)$.",
          "Every $\\mathbf{y}\\in\\mathbb{R}^n$ can be uniquely split as $\\mathbf{y} = \\hat{\\mathbf{y}} + \\mathbf{z}$ where $\\hat{\\mathbf{y}}\\in W$ and $\\mathbf{z}\\in W^\\perp$. This is the orthogonal decomposition theorem.",
          "The Pythagorean theorem in $\\mathbb{R}^n$: if $\\mathbf{u}\\perp\\mathbf{v}$, then $\\|\\mathbf{u}+\\mathbf{v}\\|^2=\\|\\mathbf{u}\\|^2+\\|\\mathbf{v}\\|^2$. Orthogonality and right angles are the same idea in any dimension.",
        ],
        eli5: [
          "Orthogonal vectors are like perpendicular compass directions — north and east carry completely independent information. Orthonormal vectors add the requirement that each direction has length exactly $1$. Working in an orthonormal basis is like having a perfectly square grid — every coordinate reads off cleanly with a single dot product.",
        ],
      },
      {
        title: "Orthogonal sets and projections",
        section: "orthogonal-sets",
        body: [
          "An orthogonal set of nonzero vectors is automatically linearly independent — each vector points in a direction not reachable by combining the others.",
          "The orthogonal projection of $\\mathbf{y}$ onto a subspace $W$ is the unique closest point in $W$ to $\\mathbf{y}$. The error $\\mathbf{y}-\\hat{\\mathbf{y}}$ is perpendicular to $W$: $\\mathbf{y}-\\hat{\\mathbf{y}}\\in W^\\perp$.",
          "If $\\{\\mathbf{u}_1,\\ldots,\\mathbf{u}_p\\}$ is an orthonormal basis for $W$, the projection formula simplifies to $\\hat{\\mathbf{y}} = (\\mathbf{y}\\cdot\\mathbf{u}_1)\\mathbf{u}_1 + \\cdots + (\\mathbf{y}\\cdot\\mathbf{u}_p)\\mathbf{u}_p$. Each coordinate is just a dot product — no system of equations to solve.",
          "The projection matrix onto $W$ (when $A$ has columns forming a basis for $W$) is $P = A(A^TA)^{-1}A^T$. Note: $P^2=P$ (idempotent) and $P^T=P$ (symmetric).",
        ],
        eli5: [
          "Projecting $\\mathbf{y}$ onto $W$ is like finding your shadow on a surface when the sun is directly overhead. The shadow is the point on the surface closest to you. The vector from shadow to you (the error) is perpendicular to the surface.",
        ],
        examples: [
          {
            title: "Projection onto a plane in $\\mathbb{R}^3$",
            steps: [
              "Project $\\mathbf{y}=\\langle 1,2,3\\rangle$ onto $W=\\text{span}\\{\\mathbf{u}_1,\\mathbf{u}_2\\}$ with $\\mathbf{u}_1=\\langle 1,0,0\\rangle$, $\\mathbf{u}_2=\\langle 0,1,0\\rangle$ (the $xy$-plane).",
              "$\\hat{\\mathbf{y}} = (\\mathbf{y}\\cdot\\mathbf{u}_1)\\mathbf{u}_1 + (\\mathbf{y}\\cdot\\mathbf{u}_2)\\mathbf{u}_2 = 1\\cdot\\langle 1,0,0\\rangle + 2\\cdot\\langle 0,1,0\\rangle = \\langle 1,2,0\\rangle$.",
              "Error: $\\mathbf{y}-\\hat{\\mathbf{y}} = \\langle 0,0,3\\rangle$. Check orthogonality to $W$: $\\langle 0,0,3\\rangle\\cdot\\langle 1,0,0\\rangle=0$ ✓, $\\langle 0,0,3\\rangle\\cdot\\langle 0,1,0\\rangle=0$ ✓.",
            ],
          },
        ],
      },
      {
        title: "The Gram-Schmidt process",
        section: "gram-schmidt",
        body: [
          "Gram-Schmidt converts any linearly independent set $\\{\\mathbf{x}_1,\\ldots,\\mathbf{x}_p\\}$ into an orthonormal basis $\\{\\mathbf{u}_1,\\ldots,\\mathbf{u}_p\\}$ for the same subspace.",
          "Procedure: for each new vector $\\mathbf{x}_k$, subtract its projections onto all previously constructed $\\mathbf{v}_j$, then normalise. Formally: $\\mathbf{v}_k = \\mathbf{x}_k - \\sum_{j=1}^{k-1}\\frac{\\mathbf{x}_k\\cdot\\mathbf{v}_j}{\\mathbf{v}_j\\cdot\\mathbf{v}_j}\\mathbf{v}_j$, then $\\mathbf{u}_k = \\mathbf{v}_k/\\|\\mathbf{v}_k\\|$.",
          "The QR decomposition: if $A=[\\mathbf{x}_1\\;\\cdots\\;\\mathbf{x}_p]$, Gram-Schmidt produces $A=QR$ where $Q=[\\mathbf{u}_1\\;\\cdots\\;\\mathbf{u}_p]$ has orthonormal columns and $R$ is upper triangular. QR is the backbone of modern numerical eigenvalue algorithms.",
          "Why subtract projections? Each new vector $\\mathbf{v}_k$ must be orthogonal to all previous $\\mathbf{v}_j$. The projection $\\text{proj}_{\\mathbf{v}_j}\\mathbf{x}_k$ is the component of $\\mathbf{x}_k$ that lies in the direction of $\\mathbf{v}_j$. Subtracting it removes all overlap.",
        ],
        eli5: [
          "Gram-Schmidt builds a clean coordinate system one axis at a time. The first axis is just the first vector, normalised. The second axis is the second vector with its shadow onto the first axis subtracted — that makes it perpendicular. The third strips out shadows on both previous axes. Each step removes overlap until you have perfectly perpendicular, unit-length axes.",
        ],
        examples: [
          {
            title: "Gram-Schmidt in $\\mathbb{R}^3$",
            steps: [
              "Orthogonalise $\\mathbf{x}_1=\\langle 1,1,0\\rangle$, $\\mathbf{x}_2=\\langle 1,0,1\\rangle$.",
              "Step 1: $\\mathbf{v}_1=\\mathbf{x}_1=\\langle 1,1,0\\rangle$. Normalise: $\\|\\mathbf{v}_1\\|=\\sqrt{2}$, $\\mathbf{u}_1=\\langle 1/\\sqrt{2},1/\\sqrt{2},0\\rangle$.",
              "Step 2: $\\text{proj}_{\\mathbf{v}_1}\\mathbf{x}_2 = \\frac{\\mathbf{x}_2\\cdot\\mathbf{v}_1}{\\mathbf{v}_1\\cdot\\mathbf{v}_1}\\mathbf{v}_1 = \\frac{1}{2}\\langle 1,1,0\\rangle = \\langle 1/2,1/2,0\\rangle$.",
              "$\\mathbf{v}_2 = \\mathbf{x}_2 - \\langle 1/2,1/2,0\\rangle = \\langle 1/2,-1/2,1\\rangle$.",
              "Normalise: $\\|\\mathbf{v}_2\\|=\\sqrt{1/4+1/4+1}=\\sqrt{3/2}$, $\\mathbf{u}_2=\\mathbf{v}_2/\\sqrt{3/2}$.",
              "Check: $\\mathbf{u}_1\\cdot\\mathbf{u}_2 = 0$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Least-squares problems",
        section: "least-squares",
        body: [
          "When $A\\mathbf{x}=\\mathbf{b}$ is inconsistent (no exact solution), the least-squares solution $\\hat{\\mathbf{x}}$ minimises the residual $\\|A\\mathbf{x}-\\mathbf{b}\\|^2$. It is not an exact solution — it is the best approximation.",
          "Geometric insight: the closest point in $\\text{Col}(A)$ to $\\mathbf{b}$ is $A\\hat{\\mathbf{x}}=\\hat{\\mathbf{b}}=\\text{proj}_{\\text{Col}(A)}\\mathbf{b}$. The residual $\\mathbf{b}-\\hat{\\mathbf{b}}$ must be orthogonal to $\\text{Col}(A)$, giving $A^T(\\mathbf{b}-A\\hat{\\mathbf{x}})=\\mathbf{0}$.",
          "Normal equations: $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$. If $A$ has linearly independent columns ($\\text{rank}(A)=n$), then $A^TA$ is invertible and $\\hat{\\mathbf{x}}=(A^TA)^{-1}A^T\\mathbf{b}$.",
          "Linear regression: fitting $y=\\beta_0+\\beta_1 x$ to $m$ data points $(x_i,y_i)$ is a least-squares problem with $A=\\begin{pmatrix}1&x_1\\\\\\vdots&\\vdots\\\\1&x_m\\end{pmatrix}$ and $\\mathbf{b}=\\begin{pmatrix}y_1\\\\\\vdots\\\\y_m\\end{pmatrix}$. The least-squares solution gives the best-fit line.",
          "The pseudo-inverse: $A^+ = (A^TA)^{-1}A^T$ (when columns are independent) satisfies $A^+A=I$ and $\\hat{\\mathbf{x}}=A^+\\mathbf{b}$. The pseudo-inverse generalises the matrix inverse to non-square systems.",
        ],
        eli5: [
          "Least squares asks: if I can't hit the target exactly, where should I aim to get as close as possible? The answer is the point in the column space of $A$ closest to $\\mathbf{b}$. The normal equations are the algebraic condition that says 'the error vector points away from the column space' — i.e., is perpendicular to it.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing orthogonal with orthonormal. Orthogonal means perpendicular ($\\mathbf{u}\\cdot\\mathbf{v}=0$). Orthonormal adds the unit-length requirement. The simplified projection formula $\\hat{\\mathbf{y}}=\\sum(\\mathbf{y}\\cdot\\mathbf{u}_k)\\mathbf{u}_k$ only works for orthonormal bases.",
      "Forgetting to subtract all previous projections in Gram-Schmidt. Each new vector must be made orthogonal to every previously constructed vector, not just the previous one.",
      "Writing the normal equations as $A\\hat{\\mathbf{x}}=A^T\\mathbf{b}$ or similar. The correct form is $A^TA\\hat{\\mathbf{x}}=A^T\\mathbf{b}$.",
      "Trying to apply $(A^TA)^{-1}$ when $A$ does not have full column rank. $A^TA$ is invertible iff the columns of $A$ are linearly independent.",
      "Thinking the least-squares solution satisfies $A\\hat{\\mathbf{x}}=\\mathbf{b}$. It does not — it only satisfies the normal equations.",
    ],
  },
  {
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
  },
];
