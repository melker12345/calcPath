import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn Linear Algebra — Free University Course | CalcPath",
  description:
    "Learn linear algebra step by step. Free university-level course covering systems of equations, vectors, matrices, determinants, vector spaces, eigenvalues, and SVD. Practice problems with full worked solutions.",
  alternates: { canonical: "https://calc-path.com/linear-algebra" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Linear Algebra",
  description:
    "Free university linear algebra course covering systems of equations, vectors, matrices, determinants, vector spaces, orthogonality, eigenvalues, and symmetric matrices. Includes practice problems with step-by-step solutions.",
  provider: {
    "@type": "Organization",
    name: "CalcPath",
    url: "https://calc-path.com",
  },
  url: "https://calc-path.com/linear-algebra",
  educationalLevel: "University",
  inLanguage: "en",
  isAccessibleForFree: true,
  hasCourseInstance: [
    { "@type": "CourseInstance", name: "Systems of Linear Equations", url: "https://calc-path.com/linear-algebra/modules/systems" },
    { "@type": "CourseInstance", name: "Eigenvalues and Eigenvectors", url: "https://calc-path.com/linear-algebra/modules/eigenvalues" },
    { "@type": "CourseInstance", name: "Vector Spaces", url: "https://calc-path.com/linear-algebra/modules/spaces" },
  ],
};

const serif = "var(--font-newsreader), Georgia, serif";
const body = "var(--font-lora), Georgia, serif";

const C = {
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.6)",
  blue: "#3372A2",
  blueBg: "rgba(51,114,162,0.08)",
  dark: "#0f172a",
};

const curriculum = [
  { id: "systems", number: "01", title: "Systems of Linear Equations", desc: "Row reduction, Gaussian elimination, and solution types." },
  { id: "vectors", number: "02", title: "Vectors and Euclidean Spaces", desc: "Vector arithmetic, linear combinations, span, and independence." },
  { id: "matrices", number: "03", title: "Matrix Algebra", desc: "Matrix operations, inverses, and characterizations of invertibility." },
  { id: "determinants", number: "04", title: "Determinants", desc: "Cofactor expansion, properties, Cramer's rule, and geometric interpretation." },
  { id: "spaces", number: "05", title: "Vector Spaces", desc: "Subspaces, basis, dimension, rank, and the rank-nullity theorem." },
  { id: "orthogonality", number: "06", title: "Orthogonality and Least Squares", desc: "Orthogonal projections, Gram-Schmidt process, and least-squares fitting." },
  { id: "eigenvalues", number: "07", title: "Eigenvalues and Eigenvectors", desc: "Characteristic equation, diagonalization, and complex eigenvalues." },
  { id: "symmetric-matrices", number: "08", title: "Symmetric Matrices and Quadratic Forms", desc: "Spectral theorem, quadratic forms, SVD, and PCA." },
];

export default function LinearAlgebraHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16 sm:px-12 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full" style={{ background: C.blue }} />
              <span className="text-base font-bold uppercase tracking-[0.3em]" style={{ color: C.blue }}>Linear Algebra</span>
            </div>

            <h1
              className="text-[2.5rem] font-bold leading-[1.08] tracking-tight sm:text-[3.5rem] md:text-[4.25rem]"
              style={{ fontFamily: serif, color: C.text }}
            >
              Master the language of{" "}
              <span style={{ color: C.blue }}>dimensions</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed sm:text-lg" style={{ fontFamily: body, color: C.muted }}>
              8 topic modules. Practice problems with step-by-step solutions.
              Free to read. No account required.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <Link
                href="/linear-algebra/modules"
                className="w-full rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
                style={{ fontFamily: body, background: C.blue, color: "#ffffff" }}
              >
                Start reading
              </Link>
              <Link
                href="/linear-algebra/practice"
                className="w-full rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
                style={{ fontFamily: body, border: `2px solid ${C.blue}`, color: C.blue }}
              >
                Start practicing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.text }}>Curriculum</h2>
              <p className="mt-1.5 text-sm sm:text-base" style={{ fontFamily: body, color: C.muted }}>
                8 chapters · from first principles to SVD and PCA
              </p>
            </div>
            <Link
              href="/linear-algebra/modules"
              className="mt-4 text-sm font-semibold transition hover:opacity-80 sm:mt-0"
              style={{ color: C.blue }}
            >
              View all modules →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {curriculum.map((topic) => (
              <Link
                key={topic.id}
                href={`/linear-algebra/modules/${topic.id}`}
                className="group flex flex-col rounded-xl p-4 transition-all hover:brightness-110 sm:rounded-2xl sm:p-5"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  border: "1.5px solid rgba(51,114,162,0.22)",
                  borderLeft: `3px solid ${C.blue}`,
                }}
              >
                <span
                  className="mb-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: C.blue }}
                >
                  {topic.number}
                </span>
                <h3
                  className="text-sm font-semibold leading-snug sm:text-[0.95rem]"
                  style={{ fontFamily: serif, color: C.text }}
                >
                  {topic.title}
                </h3>
                <p
                  className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
                  style={{ fontFamily: body, color: C.muted }}
                >
                  {topic.desc}
                </p>
                <span
                  className="mt-auto pt-3 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: C.blue }}
                >
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28 pt-8 sm:px-12 sm:pb-36">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: serif, color: C.text }}>
            Start with <span style={{ color: C.blue }}>Systems of Linear Equations</span>
          </h2>
          <p className="mt-3 text-base" style={{ fontFamily: body, color: C.muted }}>
            The starting point of linear algebra. Read at your own pace.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/linear-algebra/modules/systems"
              className="w-full max-w-xs rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
              style={{ fontFamily: body, background: C.blue, color: "#ffffff" }}
            >
              Read Chapter I
            </Link>
            <Link
              href="/linear-algebra/practice"
              className="w-full max-w-xs rounded-lg px-7 py-3.5 text-center text-base font-semibold transition hover:brightness-110 sm:w-auto"
              style={{ fontFamily: body, border: `2px solid ${C.blue}`, color: C.blue }}
            >
              Practice problems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
