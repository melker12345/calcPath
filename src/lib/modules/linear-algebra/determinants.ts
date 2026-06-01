import type { ModuleContent } from "../types";

export const determinantsModule: ModuleContent = {
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
  };
