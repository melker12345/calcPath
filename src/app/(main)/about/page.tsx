import type { Metadata } from "next";
import Link from "next/link";
import { getAvailableSubjectConfigs } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "About | CalcPath",
  description:
    "What CalcPath is, how the courses are structured and written, how practice grading and progress work, and a curated list of external resources for learning university mathematics.",
  alternates: { canonical: "https://calc-path.com/about" },
};

/** External link with consistent styling + safe attributes. */
function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[var(--accent)] underline underline-offset-2 transition hover:opacity-80"
    >
      {children}
    </a>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 first:mt-0">
      <h2 className="font-serif text-2xl font-semibold theme-text">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed theme-text-secondary">
        {children}
      </div>
    </section>
  );
}

export default async function AboutPage() {
  const subjects = await getAvailableSubjectConfigs();
  const topicCount = subjects.reduce((sum, s) => sum + (s.topicCount ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-4xl font-semibold tracking-tight theme-text">
        About CalcPath
      </h1>
      <p className="mt-4 text-lg leading-relaxed theme-text-secondary">
        CalcPath is a free, self-contained collection of university mathematics
        courses — currently {subjects.length} subjects and {topicCount} chapters,
        from precalculus through real analysis and abstract algebra. Every
        subject is written to be read like a good textbook and practiced like a
        good problem set, with nothing behind a sign-up.
      </p>

      <Section id="structure" title="How the content is structured">
        <p>
          Each subject is a course: a sequence of <strong className="theme-text">chapters</strong>,
          each split into numbered <strong className="theme-text">sections</strong> you can link to
          directly. The writing follows one house rule borrowed from the best
          textbooks: <em>statements are separated from discussion</em>. Definitions,
          theorems, propositions, proofs, and worked examples sit in clearly
          marked, numbered blocks (e.g. “Theorem 3.2”), while the surrounding
          prose motivates and unpacks them. Intuition boxes give the informal
          picture; every chapter ends with the mistakes students actually make.
        </p>
        <p>
          Every section is backed by practice questions tied to that exact
          section, so “Review the explanation for this topic” from any practice
          question lands you on the material it tests.
        </p>
      </Section>

      <Section id="practice" title="How practice works">
        <p>
          Free-response answers are graded by an expression-equivalence engine,
          not string matching: an exact radical like <code>√2/2</code>, the
          equivalent fraction, or a sensibly rounded decimal are all accepted
          when they mean the same thing. Multiple-choice questions grade
          instantly. Wrong answers offer a hint first, then the full worked
          solution — every solution shows its steps, not just the result.
        </p>
        <p>
          If a question ever seems wrongly graded, use <em>Report issue</em> on
          it. Reports arrive with the exact question and what was typed, and we
          read every one.
        </p>
      </Section>

      <Section id="progress" title="Your progress and your privacy">
        <p>
          There are no accounts. Progress is stored in your browser and never
          tied to an identity. If you want it on another device, the{" "}
          <Link href="/sync" className="font-medium text-[var(--accent)] underline underline-offset-2 hover:opacity-80">
            sync page
          </Link>{" "}
          creates a PIN + password backup you can restore anywhere — that backup
          holds only your progress, nothing personal. Site analytics are
          in-house and anonymous: no personal data, no IP addresses, no
          third-party trackers, no ads.
        </p>
      </Section>

      <Section id="served" title="How the site is built and served">
        <p>
          The content is plain text: every chapter is a Markdown/LaTeX document
          and every question bank a data file, versioned together with the
          site’s code. Mathematics renders with KaTeX. Pages are served
          statically wherever possible, so chapters load fast and read the same
          on a phone as on a desktop. Because content is data, fixes ship the
          same way code does — a reported typo is a one-line change away from
          production.
        </p>
      </Section>

      <Section id="resources" title="External resources we recommend">
        <p>
          CalcPath aims to be self-contained, but no single resource should be
          anyone’s only one. These are the references we ourselves reach for,
          and the standards the writing here aspires to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Ext href="https://linear.axler.net">Linear Algebra Done Right</Ext>{" "}
            (Sheldon Axler) — the model for how this site separates statements
            from discussion; a free electronic edition is available from the
            author.
          </li>
          <li>
            <Ext href="https://ocw.mit.edu">MIT OpenCourseWare</Ext> — full
            university courses with lectures, notes, and exams, free.
          </li>
          <li>
            <Ext href="https://tutorial.math.lamar.edu">
              Paul’s Online Math Notes
            </Ext>{" "}
            — thorough calculus and differential-equations notes with many
            worked problems.
          </li>
          <li>
            <Ext href="https://www.3blue1brown.com">3Blue1Brown</Ext> — visual
            intuition for linear algebra, calculus, and analysis that pairs well
            with formal study.
          </li>
          <li>
            <Ext href="https://www.khanacademy.org/math">Khan Academy</Ext> —
            gentle video-first coverage when a topic here feels too fast.
          </li>
          <li>
            <Ext href="https://openstax.org/subjects/math">OpenStax</Ext> —
            free, peer-reviewed full textbooks for calculus, statistics, and
            precalculus.
          </li>
          <li>
            <Ext href="https://proofwiki.org">ProofWiki</Ext> and{" "}
            <Ext href="https://mathworld.wolfram.com">Wolfram MathWorld</Ext> —
            reference for definitions and named theorems.
          </li>
          <li>
            <Ext href="https://www.desmos.com/calculator">Desmos</Ext> and{" "}
            <Ext href="https://www.geogebra.org">GeoGebra</Ext> — free graphing
            tools; plotting the function you’re studying is never wasted time.
          </li>
        </ul>
        <p>
          For deeper study beyond free resources: Abbott’s{" "}
          <em>Understanding Analysis</em>, Spivak’s <em>Calculus</em>,
          Velleman’s <em>How To Prove It</em>, and Gallian’s{" "}
          <em>Contemporary Abstract Algebra</em> are widely loved companions to
          the corresponding subjects here.
        </p>
      </Section>

      <Section id="contact" title="Improve it with us">
        <p>
          CalcPath is in active development and shaped directly by reports from
          people using it. Spotted a wrong answer, an unclear explanation, or
          anything off? Tell us on the{" "}
          <Link href="/feedback" className="font-medium text-[var(--accent)] underline underline-offset-2 hover:opacity-80">
            feedback page
          </Link>{" "}
          — or use <em>Report issue</em> right where you found it. If CalcPath
          helps you, you can{" "}
          <Link href="/donate" className="font-medium text-[var(--accent)] underline underline-offset-2 hover:opacity-80">
            support it
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
