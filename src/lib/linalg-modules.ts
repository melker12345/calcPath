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
      "Vectors are the atomic units of linear algebra. Everything else — matrices, transformations, eigenvalues, the SVD — is ultimately built on top of vectors. Before any of those ideas make sense, you must be fluent with what a vector is, how vectors combine, and what the dot product measures.",
      "Geometrically, a vector in $\\mathbb{R}^2$ or $\\mathbb{R}^3$ is an arrow: it has a length (magnitude) and a direction. Algebraically, it is an ordered list of real numbers. The power of linear algebra is that the same algebraic rules work in any number of dimensions, even when there is no geometric picture to draw.",
      "This chapter covers vector arithmetic, the dot product, projections, and the cross product. These tools recur in every subsequent topic.",
    ],
    sections: [
      {
        title: "What is a vector?",
        body: [
          "A vector in $\\mathbb{R}^n$ is an ordered $n$-tuple of real numbers: $\\mathbf{v} = \\langle v_1, v_2, \\ldots, v_n \\rangle$. In $\\mathbb{R}^2$, a vector is an arrow in the plane; in $\\mathbb{R}^3$, an arrow in space. In $\\mathbb{R}^n$ for $n > 3$, there is no geometric picture, but the algebra is identical.",
          "What defines a vector is its displacement, not its starting point. Two arrows with the same length and direction, drawn anywhere on the page, are the same vector. This is why vectors model velocities, forces, and displacements — all of these are directional quantities independent of position.",
          "Two vectors are equal if and only if every corresponding component is equal: $\\langle u_1, u_2 \\rangle = \\langle v_1, v_2 \\rangle$ iff $u_1 = v_1$ and $u_2 = v_2$. A vector in $\\mathbb{R}^2$ and a vector in $\\mathbb{R}^3$ can never be equal — they live in different spaces.",
          "The zero vector $\\mathbf{0} = \\langle 0, 0, \\ldots, 0 \\rangle$ has zero magnitude and no defined direction. It is the additive identity: $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$ for any $\\mathbf{v}$.",
          "The magnitude (length, norm) is $\\|\\mathbf{v}\\| = \\sqrt{v_1^2 + v_2^2 + \\cdots + v_n^2}$, a direct generalisation of the Pythagorean theorem. For $\\mathbf{v} = \\langle 3, 4 \\rangle$: $\\|\\mathbf{v}\\| = \\sqrt{9+16} = 5$. Magnitude is always nonneg.",
        ],
        eli5: [
          "A vector is GPS walking directions: 'go $3$ blocks east and $4$ blocks north.' It doesn't say where you start — only the steps to take. The magnitude ($5$ blocks, by Pythagoras) is the total distance walked.",
          "A point marks a location on a map. A vector marks a movement. Two arrows pointing the same way and the same length are the same vector, no matter where they are drawn.",
        ],
      },
      {
        title: "Vector addition and scalar multiplication",
        body: [
          "Addition is component-wise: $\\mathbf{u} + \\mathbf{v} = \\langle u_1+v_1, u_2+v_2, \\ldots, u_n+v_n \\rangle$. Geometrically, place the tail of $\\mathbf{v}$ at the head of $\\mathbf{u}$; the sum is the arrow from the tail of $\\mathbf{u}$ to the head of $\\mathbf{v}$. This is called the parallelogram law.",
          "Scalar multiplication scales every component: $c\\mathbf{v} = \\langle cv_1, cv_2, \\ldots, cv_n \\rangle$. If $c > 0$, direction is preserved and magnitude is multiplied by $c$. If $c < 0$, direction reverses. If $c = 0$, the result is $\\mathbf{0}$.",
          "The magnitude satisfies $\\|c\\mathbf{v}\\| = |c|\\,\\|\\mathbf{v}\\|$ — scaling a vector scales its length by the absolute value of the scalar.",
          "A unit vector has magnitude exactly $1$. To normalise any nonzero vector: $\\hat{\\mathbf{v}} = \\mathbf{v}/\\|\\mathbf{v}\\|$. The result $\\hat{\\mathbf{v}}$ points in the same direction as $\\mathbf{v}$ but has length $1$.",
          "The standard unit vectors in $\\mathbb{R}^3$ are $\\mathbf{e}_1 = \\langle 1,0,0 \\rangle$, $\\mathbf{e}_2 = \\langle 0,1,0 \\rangle$, $\\mathbf{e}_3 = \\langle 0,0,1 \\rangle$ (also written $\\mathbf{i}, \\mathbf{j}, \\mathbf{k}$). Every vector in $\\mathbb{R}^3$ is a linear combination of these: $\\langle a,b,c \\rangle = a\\mathbf{e}_1 + b\\mathbf{e}_2 + c\\mathbf{e}_3$.",
          "These two operations — addition and scalar multiplication — satisfy eight axioms (commutativity, associativity, distributivity, and so on) that define what it means to be a vector space. Any collection of objects obeying these axioms, whether arrows, polynomials, or signals, is a vector space and the same theory applies.",
        ],
        eli5: [
          "Adding vectors is like following two sets of directions back-to-back. 'Go $3$ east, $4$ north' then 'go $1$ east, $2$ south' gives total displacement '$4$ east, $2$ north.'",
          "Scalar multiplication is adjusting your speed. Multiply by $2$ and you cover twice the ground in the same direction. Multiply by $-1$ and you turn around and retrace your steps.",
        ],
        examples: [
          {
            title: "Vector arithmetic and normalisation",
            steps: [
              "Let $\\mathbf{u} = \\langle 1, -2, 3 \\rangle$ and $\\mathbf{v} = \\langle 4, 1, -1 \\rangle$.",
              "Sum: $\\mathbf{u}+\\mathbf{v} = \\langle 5, -1, 2 \\rangle$.",
              "Scalar multiple: $3\\mathbf{u} = \\langle 3, -6, 9 \\rangle$.",
              "Magnitude of $\\mathbf{v}$: $\\|\\mathbf{v}\\| = \\sqrt{16+1+1} = \\sqrt{18} = 3\\sqrt{2}$.",
              "Unit vector: $\\hat{\\mathbf{v}} = \\tfrac{1}{3\\sqrt{2}}\\langle 4,1,-1\\rangle$. Verify: $\\|\\hat{\\mathbf{v}}\\| = \\frac{1}{3\\sqrt{2}}\\cdot 3\\sqrt{2} = 1$ ✓.",
            ],
          },
        ],
      },
      {
        title: "The dot product",
        body: [
          "The dot product (inner product) of $\\mathbf{u}, \\mathbf{v} \\in \\mathbb{R}^n$ is $\\mathbf{u} \\cdot \\mathbf{v} = u_1v_1 + u_2v_2 + \\cdots + u_nv_n$. It takes two vectors and returns a single scalar — not a vector.",
          "The geometric interpretation is fundamental: $\\mathbf{u}\\cdot\\mathbf{v} = \\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|\\cos\\theta$, where $\\theta \\in [0,\\pi]$ is the angle between the vectors. This ties algebraic computation directly to geometry.",
          "Three key cases from the geometric formula: $\\mathbf{u}\\cdot\\mathbf{v} > 0$ means the angle is acute (vectors point broadly the same way); $\\mathbf{u}\\cdot\\mathbf{v} < 0$ means obtuse (they point away from each other); $\\mathbf{u}\\cdot\\mathbf{v} = 0$ means $\\theta = 90°$ — the vectors are orthogonal (perpendicular).",
          "Self-dot product gives magnitude squared: $\\mathbf{v}\\cdot\\mathbf{v} = \\|\\mathbf{v}\\|^2$. So $\\|\\mathbf{v}\\| = \\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$.",
          "The Cauchy-Schwarz inequality states $|\\mathbf{u}\\cdot\\mathbf{v}| \\leq \\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|$, with equality iff the vectors are parallel. Rearranging gives the formula for $\\cos\\theta$; since $|\\cos\\theta| \\leq 1$, the inequality is automatically satisfied.",
          "Algebraic properties: $\\mathbf{u}\\cdot\\mathbf{v} = \\mathbf{v}\\cdot\\mathbf{u}$ (commutative), $\\mathbf{u}\\cdot(\\mathbf{v}+\\mathbf{w}) = \\mathbf{u}\\cdot\\mathbf{v}+\\mathbf{u}\\cdot\\mathbf{w}$ (distributive), $(c\\mathbf{u})\\cdot\\mathbf{v} = c(\\mathbf{u}\\cdot\\mathbf{v})$ (scalar associativity). These hold in any dimension.",
        ],
        eli5: [
          "The dot product answers: how much do these two arrows agree in direction? If both point the same way, the answer is as large as possible. If they are perpendicular, they have zero agreement. If they point opposite ways, the answer is maximally negative.",
          "Think of shining a torch beam: the dot product is like the shadow of one vector onto the other. Perpendicular vectors cast no shadow on each other. Parallel vectors have maximum shadow.",
        ],
        examples: [
          {
            title: "Angle between two vectors",
            steps: [
              "Find the angle between $\\mathbf{u} = \\langle 1,2,3\\rangle$ and $\\mathbf{v} = \\langle 4,-1,2\\rangle$.",
              "$\\mathbf{u}\\cdot\\mathbf{v} = 4-2+6 = 8$.",
              "$\\|\\mathbf{u}\\| = \\sqrt{14}$, $\\|\\mathbf{v}\\| = \\sqrt{21}$.",
              "$\\cos\\theta = 8/(\\sqrt{14}\\cdot\\sqrt{21}) = 8/\\sqrt{294} \\approx 0.466$.",
              "$\\theta = \\arccos(0.466) \\approx 62.2°$ — an acute angle.",
            ],
          },
        ],
      },
      {
        title: "Projections",
        body: [
          "The projection of $\\mathbf{u}$ onto $\\mathbf{v}$ is the component of $\\mathbf{u}$ that lies exactly in the direction of $\\mathbf{v}$ — the 'shadow' of $\\mathbf{u}$ on the line through the origin in the direction of $\\mathbf{v}$.",
          "Vector projection: $\\text{proj}_{\\mathbf{v}}\\mathbf{u} = \\dfrac{\\mathbf{u}\\cdot\\mathbf{v}}{\\mathbf{v}\\cdot\\mathbf{v}}\\,\\mathbf{v} = \\dfrac{\\mathbf{u}\\cdot\\mathbf{v}}{\\|\\mathbf{v}\\|^2}\\,\\mathbf{v}$. The result is a vector parallel to $\\mathbf{v}$.",
          "Scalar projection (signed length of the shadow): $\\text{comp}_{\\mathbf{v}}\\mathbf{u} = \\mathbf{u}\\cdot\\hat{\\mathbf{v}} = \\dfrac{\\mathbf{u}\\cdot\\mathbf{v}}{\\|\\mathbf{v}\\|}$. Positive if they lean the same way, negative if opposite.",
          "Orthogonal decomposition: every vector splits as $\\mathbf{u} = \\underbrace{\\text{proj}_{\\mathbf{v}}\\mathbf{u}}_{\\parallel\\mathbf{v}} + \\underbrace{(\\mathbf{u}-\\text{proj}_{\\mathbf{v}}\\mathbf{u})}_{\\perp\\mathbf{v}}$. The error $\\mathbf{u} - \\text{proj}_{\\mathbf{v}}\\mathbf{u}$ is perpendicular to $\\mathbf{v}$, as you can verify by dotting with $\\mathbf{v}$.",
          "Projections are the building block of the Gram-Schmidt process (Chapter 7), least-squares regression, and Fourier series. The single idea of 'drop a perpendicular' reappears throughout mathematics, statistics, and signal processing.",
        ],
        eli5: [
          "Shine a vertical flashlight on a tilted rod. The shadow on the floor is the projection — it captures how much of the rod's length goes in the horizontal direction. If the rod stands straight up, the shadow is a dot (zero projection). If the rod lies flat, the shadow equals the rod.",
        ],
        examples: [
          {
            title: "Computing a vector projection",
            steps: [
              "Project $\\mathbf{u} = \\langle 2,3\\rangle$ onto $\\mathbf{v} = \\langle 4,1\\rangle$.",
              "$\\mathbf{u}\\cdot\\mathbf{v} = 8+3 = 11$, $\\mathbf{v}\\cdot\\mathbf{v} = 17$.",
              "$\\text{proj}_{\\mathbf{v}}\\mathbf{u} = \\tfrac{11}{17}\\langle 4,1\\rangle = \\langle \\tfrac{44}{17},\\tfrac{11}{17}\\rangle$.",
              "Perpendicular component: $\\mathbf{u}-\\text{proj} = \\langle 2-\\tfrac{44}{17},\\,3-\\tfrac{11}{17}\\rangle = \\langle -\\tfrac{10}{17},\\,\\tfrac{40}{17}\\rangle$.",
              "Check: $\\langle -\\tfrac{10}{17},\\tfrac{40}{17}\\rangle\\cdot\\langle 4,1\\rangle = -\\tfrac{40}{17}+\\tfrac{40}{17} = 0$ ✓",
            ],
          },
        ],
      },
      {
        title: "The cross product (R³ only)",
        body: [
          "The cross product $\\mathbf{u}\\times\\mathbf{v}$ is defined only in $\\mathbb{R}^3$ and produces a vector, not a scalar. The result is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$.",
          "Determinant formula: $\\mathbf{u}\\times\\mathbf{v} = \\det\\begin{pmatrix}\\mathbf{e}_1&\\mathbf{e}_2&\\mathbf{e}_3\\\\u_1&u_2&u_3\\\\v_1&v_2&v_3\\end{pmatrix} = \\langle u_2v_3-u_3v_2,\\;u_3v_1-u_1v_3,\\;u_1v_2-u_2v_1\\rangle$.",
          "Magnitude: $\\|\\mathbf{u}\\times\\mathbf{v}\\| = \\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|\\sin\\theta$. This equals the area of the parallelogram spanned by $\\mathbf{u}$ and $\\mathbf{v}$. If the vectors are parallel ($\\sin\\theta = 0$), the cross product is $\\mathbf{0}$.",
          "Anti-commutativity: $\\mathbf{u}\\times\\mathbf{v} = -(\\mathbf{v}\\times\\mathbf{u})$. Reversing the order flips the sign. This is why the cross product is not commutative.",
          "Direction follows the right-hand rule: curl the fingers of your right hand from $\\mathbf{u}$ toward $\\mathbf{v}$; your thumb points in the direction of $\\mathbf{u}\\times\\mathbf{v}$.",
          "Applications: computing the normal vector to a plane, finding the area of a triangle ($\\frac{1}{2}\\|\\mathbf{u}\\times\\mathbf{v}\\|$), computing torque in physics ($\\boldsymbol{\\tau} = \\mathbf{r}\\times\\mathbf{F}$).",
        ],
        eli5: [
          "The cross product finds the direction perpendicular to two given arrows — like finding 'up' given two arrows lying on a table. Its length tells you the area the two arrows enclose as a parallelogram. If the arrows are parallel they enclose no area, so the cross product is zero.",
        ],
        examples: [
          {
            title: "Cross product and area of a triangle",
            steps: [
              "Find $\\mathbf{u}\\times\\mathbf{v}$ for $\\mathbf{u} = \\langle 1,2,3\\rangle$, $\\mathbf{v} = \\langle 4,5,6\\rangle$.",
              "$\\mathbf{u}\\times\\mathbf{v} = \\langle (2)(6)-(3)(5),\\,(3)(4)-(1)(6),\\,(1)(5)-(2)(4)\\rangle = \\langle -3,6,-3\\rangle$.",
              "Area of parallelogram: $\\|\\langle -3,6,-3\\rangle\\| = \\sqrt{9+36+9} = \\sqrt{54} = 3\\sqrt{6}$.",
              "Area of triangle with these two sides: $\\frac{1}{2}\\cdot 3\\sqrt{6} = \\frac{3\\sqrt{6}}{2}$.",
              "Verify perpendicularity: $\\langle -3,6,-3\\rangle\\cdot\\langle 1,2,3\\rangle = -3+12-9 = 0$ ✓.",
            ],
          },
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Confusing the dot product (scalar result) with the cross product (vector result). $\\mathbf{u}\\cdot\\mathbf{v}$ measures alignment; $\\mathbf{u}\\times\\mathbf{v}$ produces a perpendicular vector.",
      "Using $\\|c\\mathbf{v}\\| = c\\|\\mathbf{v}\\|$ when $c < 0$. Correct formula: $\\|c\\mathbf{v}\\| = |c|\\,\\|\\mathbf{v}\\|$. Magnitude is always nonneg.",
      "Normalising the zero vector. Always check $\\|\\mathbf{v}\\| \\neq 0$ before dividing.",
      "Thinking $\\mathbf{u}\\cdot\\mathbf{v}=0$ implies one vector is zero. Orthogonality and zero-ness are completely different conditions.",
      "Applying the cross product in dimensions other than $3$. It is only defined in $\\mathbb{R}^3$.",
      "Forgetting that vectors must share the same dimension before addition or the dot product can be computed.",
    ],
  },
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
  {
    topicId: "systems",
    title: "Systems of Linear Equations",
    intro: [
      "A system of linear equations is a set of constraints that must hold simultaneously. The question is always: do values of the unknowns exist that satisfy every equation at once, and if so, how many?",
      "Gaussian elimination — systematically row-reducing the augmented matrix — gives a complete algorithmic answer to this question for any system, regardless of size. It is one of the most important algorithms in all of computational mathematics.",
      "The theory connects directly to rank, the null space, and the fundamental theorem of linear maps. Every statement about when a system has zero, one, or infinitely many solutions follows from these ideas.",
    ],
    sections: [
      {
        title: "Setting up augmented matrices",
        body: [
          "A linear system $a_{11}x_1 + \\cdots + a_{1n}x_n = b_1, \\ldots, a_{m1}x_1 + \\cdots + a_{mn}x_n = b_m$ is written as the matrix equation $A\\mathbf{x} = \\mathbf{b}$, where $A$ is the $m\\times n$ coefficient matrix, $\\mathbf{x}$ is the unknown vector, and $\\mathbf{b}$ is the right-hand side.",
          "The augmented matrix $[A\\;|\\;\\mathbf{b}]$ packs all information into one array. Each row represents one equation. The vertical bar separates coefficients from constants.",
          "Three elementary row operations preserve the solution set: (R1) swap two rows, (R2) multiply a row by a nonzero scalar, (R3) add a scalar multiple of one row to another. These correspond exactly to legal algebraic manipulations of equations.",
          "Why row operations work: they produce equivalent systems — systems with identical solution sets. You are not changing the solutions; you are changing the representation until the solution is obvious.",
        ],
        eli5: [
          "Each equation is a constraint on a map: 'I'm somewhere on this line' and 'I'm somewhere on that line.' The solution is where the lines cross.",
          "Gaussian elimination redraws the map so the crossing point is obvious. Instead of two diagonal lines, you draw one horizontal and one vertical line. The answer is immediately readable.",
        ],
      },
      {
        title: "Gaussian elimination",
        body: [
          "Forward elimination reduces the augmented matrix to row echelon form (REF): a staircase pattern where each row's leading nonzero entry (pivot) is to the right of the pivot above, with zeros below each pivot.",
          "The procedure: work column by column from left to right. Use row operations to create zeros below the current pivot. Skip a column with no eligible pivot — this creates a free variable.",
          "Back substitution: starting from the last nonzero row, solve for the pivot variable, then substitute upward through the other equations.",
          "Reduced row echelon form (RREF) goes further: each pivot is scaled to $1$, and zeros are created both above and below each pivot. The solution can be read directly without back substitution.",
          "A useful check: the number of pivots in RREF equals the rank of $A$. The number of non-pivot columns equals the number of free variables.",
        ],
        eli5: [
          "Gaussian elimination is like solving a crossword one row at a time. You use each equation to eliminate one unknown, until you have one equation with one unknown. Solve it, substitute back, solve the next, and so on.",
        ],
        examples: [
          {
            title: "Solving a 3×3 system",
            steps: [
              "System: $x+y+z=6,\\; 2x-y+z=3,\\; x+2y-z=4$.",
              "Augmented matrix: $\\left(\\begin{array}{ccc|c}1&1&1&6\\\\2&-1&1&3\\\\1&2&-1&4\\end{array}\\right)$.",
              "$R_2\\leftarrow R_2-2R_1$, $R_3\\leftarrow R_3-R_1$: $\\left(\\begin{array}{ccc|c}1&1&1&6\\\\0&-3&-1&-9\\\\0&1&-2&-2\\end{array}\\right)$.",
              "$R_3\\leftarrow R_3+\\tfrac{1}{3}R_2$: $\\left(\\begin{array}{ccc|c}1&1&1&6\\\\0&-3&-1&-9\\\\0&0&-\\tfrac{7}{3}&-5\\end{array}\\right)$.",
              "Back-substitute: $z = 15/7$, then solve for $y$, then $x$.",
            ],
          },
        ],
      },
      {
        title: "Solution types",
        body: [
          "A linear system has exactly one of three outcomes: no solution (inconsistent), exactly one solution, or infinitely many solutions. There is no 'two solutions' in linear algebra.",
          "Inconsistency is flagged by a row $[0\\;0\\;\\cdots\\;0\\;|\\;b]$ with $b\\neq 0$ — the equation $0=b$ is impossible.",
          "A unique solution exists when every variable is a pivot variable — the coefficient matrix has full column rank ($\\text{rank}(A)=n$). RREF produces $[I\\;|\\;\\mathbf{x}^*]$.",
          "Infinitely many solutions arise when there are free variables — columns with no pivot. Each free variable can take any real value. You parameterise the solution set: express pivot variables in terms of free variables.",
          "The complete solution to $A\\mathbf{x}=\\mathbf{b}$ is $\\mathbf{x} = \\mathbf{x}_p + \\mathbf{x}_h$, where $\\mathbf{x}_p$ is any particular solution and $\\mathbf{x}_h$ is any solution to the homogeneous system $A\\mathbf{x}=\\mathbf{0}$.",
        ],
        eli5: [
          "Two lines either cross at one point (unique solution), are parallel and never meet (no solution), or are the same line (infinitely many solutions). In higher dimensions, replace 'lines' with 'hyperplanes' — the three possibilities are the same.",
        ],
      },
      {
        title: "Rank and the rank-nullity theorem",
        body: [
          "The rank of a matrix $A$ is the number of pivot columns in its row echelon form — equivalently, the dimension of the column space $\\text{Col}(A)$.",
          "Consistency condition: $A\\mathbf{x}=\\mathbf{b}$ is consistent iff $\\text{rank}([A\\;|\\;\\mathbf{b}]) = \\text{rank}(A)$. Adding $\\mathbf{b}$ as a column must not create a new pivot — $\\mathbf{b}$ must already lie in $\\text{Col}(A)$.",
          "Uniqueness condition: the solution is unique iff $\\text{rank}(A)=n$ (no free variables).",
          "The rank-nullity theorem: $\\text{rank}(A) + \\text{nullity}(A) = n$. Pivot columns contribute to rank; free columns contribute to nullity. Together they account for all $n$ columns.",
          "For an $m\\times n$ matrix: $\\text{rank}(A) \\leq \\min(m,n)$. You cannot have more independent directions than the smaller dimension.",
        ],
        eli5: [
          "Rank counts how many truly independent equations you have. Ten equations might contain only $3$ independent constraints if the rest are just combinations of those $3$. Rank-nullity says: independent constraints plus free variables always adds up to the total number of unknowns.",
        ],
      },
      {
        title: "Homogeneous systems",
        body: [
          "A homogeneous system $A\\mathbf{x}=\\mathbf{0}$ is always consistent — the trivial solution $\\mathbf{x}=\\mathbf{0}$ always works.",
          "Nontrivial solutions exist iff $\\text{rank}(A)<n$ — there are more unknowns than pivots, creating free variables.",
          "The set of all solutions to $A\\mathbf{x}=\\mathbf{0}$ is the null space $\\text{Null}(A)$, which is always a subspace of $\\mathbb{R}^n$. Its dimension (the nullity) equals the number of free variables.",
          "A square matrix $A$ is invertible iff $A\\mathbf{x}=\\mathbf{0}$ has only the trivial solution iff $\\text{nullity}(A)=0$ iff $\\det(A)\\neq 0$. These conditions are all equivalent.",
        ],
        eli5: [
          "A homogeneous system asks: what inputs does the matrix send to zero? Zero is always one answer. But if the matrix collapses space — if it's not full rank — then entire lines or planes of inputs get sent to zero. Those make up the null space.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Multiplying a row by zero during elimination. This destroys information and is invalid.",
      "Seeing free variables and claiming 'no solution.' Free variables mean infinitely many solutions. Inconsistency requires a row $[0\\;\\cdots\\;0\\;|\\;b]$ with $b\\neq 0$.",
      "Confusing $\\text{rank}(A)$ with $\\text{rank}([A|\\mathbf{b}])$. The system is consistent iff these are equal.",
      "Back-substituting in the wrong order. Always start from the bottom row and work upward.",
      "Forgetting to express the general solution as particular solution plus null-space solution.",
    ],
  },
  {
    topicId: "spaces",
    title: "Vector Spaces",
    intro: [
      "Vector spaces are the abstract framework that unifies all of linear algebra. The same theory that applies to arrows in $\\mathbb{R}^n$ applies equally to polynomials, matrices, functions, and signals. The key insight is that the 'size' of a space is fully captured by a single number: its dimension.",
      "The four core concepts — span, linear independence, basis, dimension — provide the language for describing what a set of vectors can and cannot represent. The column space and null space give these abstract ideas concrete computational content.",
      "Understanding vector spaces is the conceptual leap that separates people who use linear algebra from people who understand it. Every major theorem — eigenvalues, the SVD, least squares — is ultimately a statement about the structure of certain vector spaces.",
    ],
    sections: [
      {
        title: "Subspaces",
        body: [
          "A subspace of $\\mathbb{R}^n$ is a subset $V$ satisfying three conditions: (1) $\\mathbf{0} \\in V$, (2) if $\\mathbf{u},\\mathbf{v}\\in V$ then $\\mathbf{u}+\\mathbf{v}\\in V$ (closed under addition), and (3) if $\\mathbf{v}\\in V$ and $c\\in\\mathbb{R}$ then $c\\mathbf{v}\\in V$ (closed under scalar multiplication). The three conditions collapse into one: $V$ is a subspace iff every linear combination $c\\mathbf{u}+d\\mathbf{v}$ of vectors in $V$ stays in $V$.",
          "Examples of subspaces: $\\{\\mathbf{0}\\}$, any line through the origin, any plane through the origin, $\\mathbb{R}^n$ itself, the null space of any matrix $A$, and the column space of any matrix $A$.",
          "Non-examples: a line not through the origin (fails condition 1), a circle (not closed under addition), $\\{(x,y): x\\geq 0\\}$ (fails condition 3 — multiply any vector by $-1$ and you leave the set). The origin condition is always the fastest check.",
          "The intersection $V\\cap W$ of two subspaces is always a subspace. The union $V\\cup W$ is usually not — to get a subspace from two subspaces, take their sum $V+W = \\{\\mathbf{v}+\\mathbf{w}: \\mathbf{v}\\in V, \\mathbf{w}\\in W\\}$.",
        ],
        eli5: [
          "A subspace is a flat surface (of any dimension) passing through the origin. You can add vectors and scale them all you like and you'll never leave the surface. A tilted plane not through the origin, or a curved surface, is not a subspace.",
        ],
      },
      {
        title: "Span",
        body: [
          "The span of vectors $\\{\\mathbf{v}_1,\\ldots,\\mathbf{v}_k\\}$ is every possible linear combination: $\\text{span}\\{\\mathbf{v}_1,\\ldots,\\mathbf{v}_k\\} = \\{c_1\\mathbf{v}_1+\\cdots+c_k\\mathbf{v}_k : c_i\\in\\mathbb{R}\\}$. It is always a subspace — it contains $\\mathbf{0}$ (set all $c_i=0$) and is closed under addition and scaling.",
          "Geometrically in $\\mathbb{R}^3$: one nonzero vector spans a line through the origin; two independent vectors span a plane; three independent vectors span all of $\\mathbb{R}^3$.",
          "To check if $\\mathbf{b}\\in\\text{span}\\{\\mathbf{v}_1,\\ldots,\\mathbf{v}_k\\}$, set up $[\\mathbf{v}_1\\;\\cdots\\;\\mathbf{v}_k\\;|\\;\\mathbf{b}]$ and row-reduce. If consistent, $\\mathbf{b}$ is in the span.",
          "The column space $\\text{Col}(A)$ is the span of the columns of $A$. The question 'is $\\mathbf{b}\\in\\text{Col}(A)$?' is identical to 'is $A\\mathbf{x}=\\mathbf{b}$ consistent?'",
        ],
        eli5: [
          "The span of a set of vectors is everything you can reach by mixing them together. Vectors are like paint colors: red and blue span all mixtures of red and blue. Purple is in the span; orange is not (you'd need yellow). The span is your palette.",
        ],
        examples: [
          {
            title: "Is a vector in the span?",
            steps: [
              "Is $\\mathbf{b}=\\langle 1,5,3\\rangle$ in $\\text{span}\\{\\mathbf{v}_1,\\mathbf{v}_2\\}$ with $\\mathbf{v}_1=\\langle 1,1,1\\rangle$, $\\mathbf{v}_2=\\langle 0,2,1\\rangle$?",
              "Row-reduce $[\\mathbf{v}_1\\;\\mathbf{v}_2\\;|\\;\\mathbf{b}]$: $\\left(\\begin{array}{cc|c}1&0&1\\\\1&2&5\\\\1&1&3\\end{array}\\right)\\to\\left(\\begin{array}{cc|c}1&0&1\\\\0&1&2\\\\0&0&0\\end{array}\\right)$.",
              "Consistent. $c_1=1$, $c_2=2$: $\\mathbf{b} = 1\\cdot\\mathbf{v}_1+2\\cdot\\mathbf{v}_2$.",
              "Check: $\\langle 1,1,1\\rangle+2\\langle 0,2,1\\rangle = \\langle 1,5,3\\rangle$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Linear independence",
        body: [
          "Vectors $\\{\\mathbf{v}_1,\\ldots,\\mathbf{v}_k\\}$ are linearly independent if $c_1\\mathbf{v}_1+\\cdots+c_k\\mathbf{v}_k=\\mathbf{0}$ forces all $c_i=0$. If a non-trivial combination equals $\\mathbf{0}$, the vectors are linearly dependent.",
          "Dependence means redundancy: at least one vector is expressible as a combination of the others and adds no new direction. Removing it does not shrink the span.",
          "Test: form $A=[\\mathbf{v}_1\\;\\cdots\\;\\mathbf{v}_k]$ and row-reduce. The vectors are independent iff every column is a pivot column iff $\\text{Null}(A)=\\{\\mathbf{0}\\}$.",
          "In $\\mathbb{R}^n$, any set with more than $n$ vectors is automatically dependent. You cannot have more than $n$ independent directions in $n$-dimensional space.",
          "Any set containing $\\mathbf{0}$ is automatically dependent: $1\\cdot\\mathbf{0}=\\mathbf{0}$ provides a non-trivial combination equalling zero.",
        ],
        eli5: [
          "Vectors are independent if none of them is 'redundant' — if knowing the others doesn't already tell you where this one points. If $\\mathbf{v}_3 = 2\\mathbf{v}_1 - \\mathbf{v}_2$, then $\\mathbf{v}_3$ adds no new information and the set is dependent.",
        ],
        examples: [
          {
            title: "Dependence check in $\\mathbb{R}^3$",
            steps: [
              "Are $\\mathbf{v}_1=\\langle 1,0,2\\rangle$, $\\mathbf{v}_2=\\langle 0,1,3\\rangle$, $\\mathbf{v}_3=\\langle 2,1,7\\rangle$ independent?",
              "Row-reduce: $\\begin{pmatrix}1&0&2\\\\0&1&3\\\\2&1&7\\end{pmatrix}\\to\\begin{pmatrix}1&0&2\\\\0&1&3\\\\0&0&0\\end{pmatrix}$. Only 2 pivots — dependent.",
              "From RREF: $\\mathbf{v}_3=2\\mathbf{v}_1+\\mathbf{v}_2$. Check: $2\\langle 1,0,2\\rangle+\\langle 0,1,3\\rangle=\\langle 2,1,7\\rangle$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Basis and dimension",
        body: [
          "A basis for a subspace $V$ is a set of vectors that is both linearly independent and spans $V$. It is simultaneously a minimal spanning set and a maximal independent set.",
          "Every vector in $V$ has a unique representation as a linear combination of basis vectors. This uniqueness makes a basis a coordinate system: given basis $\\{\\mathbf{b}_1,\\ldots,\\mathbf{b}_n\\}$, each vector has unique coordinates $(c_1,\\ldots,c_n)$.",
          "The dimension of $V$ is the number of vectors in any basis. All bases for $V$ contain the same number of vectors — this is a theorem. Dimension is an intrinsic invariant of the space.",
          "To find a basis for $\\text{Col}(A)$: row-reduce $A$ and take the original columns (not the RREF columns) at pivot positions. To find a basis for $\\text{Null}(A)$: row-reduce, express pivot variables in terms of free variables, and write the general solution as a linear combination of vectors.",
        ],
        eli5: [
          "A basis is the minimum set of directions you need to describe every position in the space. In $\\mathbb{R}^2$, any two non-parallel vectors form a basis: one is not enough (you're stuck on a line), three is too many (one is redundant). Dimension is just how many directions you need.",
        ],
      },
      {
        title: "Column space and null space",
        body: [
          "The column space $\\text{Col}(A) = \\{A\\mathbf{x}: \\mathbf{x}\\in\\mathbb{R}^n\\}$ is the span of the columns of $A$ — all possible outputs. Its dimension is $\\text{rank}(A)$.",
          "The null space $\\text{Null}(A) = \\{\\mathbf{x}: A\\mathbf{x}=\\mathbf{0}\\}$ is the set of all inputs that map to zero. It is always a subspace of $\\mathbb{R}^n$, and its dimension is the nullity.",
          "The rank-nullity theorem: $\\text{rank}(A)+\\text{nullity}(A)=n$. Every column either contributes a new independent direction (pivot, adds $1$ to rank) or introduces a free variable (adds $1$ to nullity).",
          "The row space $\\text{Row}(A)=\\text{Col}(A^T)$ has dimension $\\text{rank}(A)$ as well. The fundamental theorem of linear algebra: $\\text{Row}(A)^\\perp = \\text{Null}(A)$ and $\\text{Col}(A)^\\perp = \\text{Null}(A^T)$. The four fundamental subspaces partition $\\mathbb{R}^n$ and $\\mathbb{R}^m$ into complementary pairs.",
        ],
        eli5: [
          "The column space is everywhere the matrix can take you — all reachable destinations. The null space is everything the matrix erases — inputs it maps to zero. A large null space means the matrix loses a lot of information; a trivial null space means it is injective (one-to-one).",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Claiming any subset of $\\mathbb{R}^n$ is a subspace without checking all three conditions. The easiest first check: does it contain $\\mathbf{0}$?",
      "Confusing span with independence. A spanning set can be dependent (redundant); an independent set may not span. A basis must be both.",
      "Stating 'the dimension is $2$' because you found two independent vectors, without checking they actually span the space.",
      "Extracting the column space basis from the RREF matrix instead of the original matrix. Use pivot positions to identify which original columns to take.",
      "Forgetting the zero vector is always in the null space — $\\text{Null}(A)$ is never empty.",
    ],
  },
  {
    topicId: "eigenvalues",
    title: "Eigenvalues and Eigenvectors",
    intro: [
      "Eigenvalues and eigenvectors reveal the intrinsic skeleton of a linear transformation. Most vectors get both rotated and stretched when a matrix acts on them. But a few special vectors — the eigenvectors — only get stretched: their direction is preserved (or reversed), and the stretch factor is the eigenvalue.",
      "Finding eigenvalues reduces to solving the characteristic equation $\\det(A-\\lambda I)=0$, a polynomial in $\\lambda$. Each root is an eigenvalue; for each eigenvalue, the eigenvectors are the nonzero solutions to $(A-\\lambda I)\\mathbf{v}=\\mathbf{0}$.",
      "Diagonalization — writing $A=PDP^{-1}$ — is the payoff: once you have eigenvectors and eigenvalues, complex operations like $A^{100}$ become trivial. This chapter also covers the full theory of linear transformations, which underpins every subsequent result.",
    ],
    sections: [
      {
        title: "Linear transformations and their matrices",
        body: [
          "A function $T:\\mathbb{R}^n\\to\\mathbb{R}^m$ is linear if $T(\\mathbf{u}+\\mathbf{v})=T(\\mathbf{u})+T(\\mathbf{v})$ and $T(c\\mathbf{v})=cT(\\mathbf{v})$ for all vectors and scalars. Together these imply $T(c\\mathbf{u}+d\\mathbf{v}) = cT(\\mathbf{u})+dT(\\mathbf{v})$ — linear maps preserve linear combinations.",
          "Every linear transformation has a unique representing matrix: $A = [T(\\mathbf{e}_1)\\;|\\;T(\\mathbf{e}_2)\\;|\\;\\cdots\\;|\\;T(\\mathbf{e}_n)]$, where the columns are the images of the standard basis vectors. Once you know what $T$ does to the basis, you know everything.",
          "Geometric examples: rotations, reflections, projections, shears, and scalings are all linear. Non-linear examples: translations, squaring a vector, adding a constant.",
          "Composition of transformations corresponds to matrix multiplication: $(T_A\\circ T_B)(\\mathbf{x}) = A(B\\mathbf{x}) = (AB)\\mathbf{x}$. This is the geometric motivation for the matrix multiplication rule.",
        ],
        eli5: [
          "A linear transformation reshapes space without bending, tearing, or moving the origin. Lines stay lines. Parallel lines stay parallel. The whole space gets rotated, stretched, or squished in a uniform way. Every such rule is exactly captured by a matrix.",
        ],
        examples: [
          {
            title: "Matrix of a 90° rotation",
            steps: [
              "Find the matrix for $90°$ counterclockwise rotation in $\\mathbb{R}^2$.",
              "$T(\\mathbf{e}_1)=T(\\langle 1,0\\rangle) = \\langle 0,1\\rangle$ (the $x$-axis vector rotates to the $y$-axis).",
              "$T(\\mathbf{e}_2)=T(\\langle 0,1\\rangle) = \\langle -1,0\\rangle$.",
              "Matrix: $R_{90} = \\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$.",
              "Apply to $\\langle 3,2\\rangle$: $\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\begin{pmatrix}3\\\\2\\end{pmatrix} = \\begin{pmatrix}-2\\\\3\\end{pmatrix}$. Rotated $90°$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Kernel and image",
        body: [
          "The kernel of $T$ is $\\ker(T) = \\{\\mathbf{x}: T(\\mathbf{x})=\\mathbf{0}\\}$ — the set of inputs that $T$ collapses to zero. For $T_A$, this is exactly $\\text{Null}(A)$.",
          "$T$ is injective (one-to-one) iff $\\ker(T)=\\{\\mathbf{0}\\}$ — only zero maps to zero. Equivalently, different inputs always produce different outputs.",
          "The image of $T$ is $\\text{Im}(T) = \\{T(\\mathbf{x}): \\mathbf{x}\\in\\mathbb{R}^n\\} = \\text{Col}(A)$. $T$ is surjective (onto) iff $\\text{Im}(T)=\\mathbb{R}^m$ iff $\\text{rank}(A)=m$.",
          "The rank-nullity theorem for transformations: $\\dim(\\ker(T))+\\dim(\\text{Im}(T))=n$. Independent of any choice of basis or matrix representation.",
        ],
        eli5: [
          "The kernel is the transformation's blind spot — inputs it can't distinguish from zero. The image is its range — all possible outputs. An injective map has a trivial kernel (no blind spots). A surjective map has an image that fills the entire output space.",
        ],
      },
      {
        title: "Eigenvalues and eigenvectors",
        body: [
          "A nonzero vector $\\mathbf{v}$ is an eigenvector of $A$ with eigenvalue $\\lambda$ if $A\\mathbf{v}=\\lambda\\mathbf{v}$. The matrix merely scales $\\mathbf{v}$ — it does not change its direction (or it reverses it when $\\lambda<0$).",
          "To find eigenvalues: rewrite as $(A-\\lambda I)\\mathbf{v}=\\mathbf{0}$. For a nonzero solution to exist, the matrix $A-\\lambda I$ must be singular: $\\det(A-\\lambda I)=0$. This is the characteristic equation.",
          "The characteristic polynomial of an $n\\times n$ matrix has degree $n$ and exactly $n$ roots in $\\mathbb{C}$ (counting multiplicity). Real matrices may have complex eigenvalues in conjugate pairs.",
          "For each eigenvalue $\\lambda_k$, the eigenspace is $E_{\\lambda_k}=\\text{Null}(A-\\lambda_k I)$. Any nonzero vector in this eigenspace is an eigenvector. The eigenspace always has dimension at least $1$.",
          "Trace and determinant shortcuts: $\\sum_i \\lambda_i = \\text{tr}(A)$ and $\\prod_i \\lambda_i = \\det(A)$. For a $2\\times 2$ matrix, these two conditions fully determine the eigenvalues once you find the characteristic polynomial.",
        ],
        eli5: [
          "Imagine pushing on a rubber sheet with a matrix. Most arrows move and spin. Eigenvectors are special arrows that only stretch or shrink — they never change direction. The eigenvalue is the stretch factor. If $\\lambda=3$, the arrow triples in length. If $\\lambda=-1$, it flips around.",
        ],
        examples: [
          {
            title: "Eigenvalues and eigenvectors of a 2×2 matrix",
            steps: [
              "Find eigenvalues and eigenvectors of $A=\\begin{pmatrix}3&1\\\\0&2\\end{pmatrix}$.",
              "Characteristic equation: $\\det(A-\\lambda I)=(3-\\lambda)(2-\\lambda)=0$. Eigenvalues: $\\lambda_1=3$, $\\lambda_2=2$.",
              "For $\\lambda_1=3$: $(A-3I)\\mathbf{v}=\\mathbf{0}\\Rightarrow\\begin{pmatrix}0&1\\\\0&-1\\end{pmatrix}\\mathbf{v}=\\mathbf{0}$. Solution: $\\mathbf{v}_1=\\langle 1,0\\rangle$.",
              "For $\\lambda_2=2$: $(A-2I)\\mathbf{v}=\\mathbf{0}\\Rightarrow\\begin{pmatrix}1&1\\\\0&0\\end{pmatrix}\\mathbf{v}=\\mathbf{0}$. Solution: $\\mathbf{v}_2=\\langle 1,-1\\rangle$.",
              "Check: $\\text{tr}(A)=5=3+2$ ✓. $\\det(A)=6=3\\times 2$ ✓.",
            ],
          },
        ],
      },
      {
        title: "Diagonalization",
        body: [
          "A matrix $A$ is diagonalizable if $A=PDP^{-1}$, where the columns of $P$ are $n$ linearly independent eigenvectors and $D=\\text{diag}(\\lambda_1,\\ldots,\\lambda_n)$ contains the corresponding eigenvalues.",
          "Criterion: $A$ is diagonalizable iff it has $n$ linearly independent eigenvectors. A sufficient condition: $n$ distinct eigenvalues. Repeated eigenvalues may or may not permit diagonalization.",
          "Computing powers: $A^k = PD^kP^{-1}$, and $D^k=\\text{diag}(\\lambda_1^k,\\ldots,\\lambda_n^k)$ is trivial. This turns computing $A^{100}$ into three matrix multiplications.",
          "Geometric interpretation: $D=P^{-1}AP$ means that in the coordinate system of eigenvectors, the transformation $A$ acts as pure diagonal scaling. Diagonalisation finds the 'natural' coordinate system for $A$.",
          "Non-diagonalisable matrices (defective matrices) require Jordan normal form — beyond this course but worth knowing exists.",
        ],
        eli5: [
          "Diagonalisation asks: is there a tilted coordinate system in which your transformation just stretches each axis independently? If you tilt your axes to align with the eigenvectors, the transformation becomes trivial. The tilt is $P$; the independent scalings are $D$.",
        ],
      },
      {
        title: "Geometric transformations and their eigenvalues",
        body: [
          "Rotation by $\\theta$ (counterclockwise): $R_\\theta=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}$. $\\det(R_\\theta)=1$ (area preserved, orientation maintained). Eigenvalues $e^{\\pm i\\theta}$ are complex for $\\theta\\neq 0,\\pi$ — no real eigenvectors, consistent with the fact that rotations spin everything.",
          "Reflection across the $x$-axis: $\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$. Eigenvalues $\\lambda_1=1$ (vectors on $x$-axis are fixed) and $\\lambda_2=-1$ (vectors on $y$-axis are flipped). $\\det=-1$: orientation reversed.",
          "Projection onto a line: eigenvalues $1$ (vectors on the line are fixed by projection) and $0$ (vectors orthogonal to the line collapse to zero). Idempotent: $P^2=P$.",
          "Shear $\\begin{pmatrix}1&k\\\\0&1\\end{pmatrix}$: repeated eigenvalue $\\lambda=1$ with only one independent eigenvector. Not diagonalisable — it is a canonical example of a defective matrix.",
        ],
        eli5: [
          "Each transformation type has its own eigenvalue signature. Rotations have complex eigenvalues (no real fixed directions). Reflections have eigenvalues $\\pm 1$ (one axis is fixed, the other flips). Projections have eigenvalues $0$ and $1$ (one subspace is kept, the complementary subspace is erased).",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Including the zero vector as an eigenvector. Eigenvectors must be nonzero by definition.",
      "Writing $\\det(A-\\lambda)=0$ instead of $\\det(A-\\lambda I)=0$. You cannot subtract a scalar from a matrix.",
      "Assuming every matrix is diagonalisable. A matrix with $n$ distinct eigenvalues is, but repeated eigenvalues can prevent it.",
      "Confusing eigenvalues (scalars $\\lambda$) and eigenvectors (nonzero vectors $\\mathbf{v}$). They are distinct objects that go together.",
      "Forgetting to check the trace/determinant as a sanity check after computing eigenvalues.",
    ],
  },
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
