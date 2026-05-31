import type { ModuleContent } from "../types";

export const spacesModule: ModuleContent = {
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
        section: "subspaces",
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
        section: "span",
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
        section: "independence",
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
        section: "basis",
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
        section: "linear-transformations",
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
  };
