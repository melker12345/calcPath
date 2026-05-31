import type { Topic } from "@/lib/shared-types";
import { limitsModule, derivativesModule, integralsModule, applicationsModule, seriesModule, differentialEquationsModule } from "./modules/calculus";




export type WorkedExample = {
  title: string;
  steps: string[];
};

export type ModuleSection = {
  title: string;
  /**
   * Stable slug used for progress tracking and deep links.
   * MUST match the `section` field on the corresponding questions exactly
   * (e.g. "squeeze", "lhopital", "chain", "gauss", "confidence-intervals").
   * When present, the dashboard and practice pages can show accurate per-section progress.
   */
  section?: string;
  body: string[];
  /** Optional "Explain Like I'm 5" — simpler, intuition-based explanation */
  eli5?: string[];
  /** Inline worked examples for this section (1-2 detailed examples) */
  examples?: WorkedExample[];
};

export type ModuleContent = {
  topicId: Topic["id"];
  title: string;
  intro: string[];
  sections: ModuleSection[];
  examples: {
    title: string;
    steps: string[];
  }[];
  commonMistakes: string[];
};

export const modules: ModuleContent[] = [
  limitsModule,  // extracted
  derivativesModule,  // extracted
  integralsModule,  // extracted
  applicationsModule,  // extracted
  seriesModule,  // extracted
  differentialEquationsModule,  // extracted
  {
    topicId: "applications-of-integration",
    title: "Applications of Integration",
    intro: [
      "Integration computes accumulated quantities. So far you've seen it as 'area under a curve,' but the real power of the integral is that it can measure anything that accumulates: length along a curve, volume of a solid, work done by a force, or probability of an event.",
      "The strategy is always the same: slice the quantity into infinitely many small pieces, write a formula for each piece, then integrate (sum them up). The only thing that changes from problem to problem is what you're slicing and how.",
      "This module covers the major geometric and physical applications: areas between curves, volumes of solids of revolution, arc length, and an introduction to parametric curves.",
    ],
    sections: [
      {
        title: "Areas between curves",
        section: "areacurves",
        body: [
          "The area between $y = f(x)$ (top) and $y = g(x)$ (bottom) from $x = a$ to $x = b$ is $A = \\int_a^b [f(x) - g(x)]\\,dx$.",
          "The integrand is always (top minus bottom) or (right minus left). If the curves cross, split the integral at the crossing points and take care with which function is on top in each sub-interval.",
          "To find crossing points, solve $f(x) = g(x)$. These are the limits of integration.",
          "For curves given as $x = h(y)$, integrate with respect to $y$: $A = \\int_c^d [h_{\\text{right}}(y) - h_{\\text{left}}(y)]\\,dy$. Sometimes integrating in $y$ is simpler because it avoids splitting at crossings.",
        ],
        examples: [
          {
            title: "Area between a parabola and a line",
            steps: [
              "Find the area between $y = x^2$ and $y = x + 2$.",
              "Find the crossing points: $x^2 = x + 2 \\Rightarrow x^2 - x - 2 = 0 \\Rightarrow (x-2)(x+1) = 0$, so $x = -1$ and $x = 2$.",
              "Determine which is on top: at $x = 0$, $x+2 = 2$ and $x^2 = 0$. The line is above the parabola on $[-1, 2]$.",
              "$A = \\int_{-1}^{2} [(x+2) - x^2]\\,dx = \\int_{-1}^{2} (x + 2 - x^2)\\,dx$.",
              "Antiderivative: $\\frac{x^2}{2} + 2x - \\frac{x^3}{3}$.",
              "Evaluate: $\\left(\\frac{4}{2} + 4 - \\frac{8}{3}\\right) - \\left(\\frac{1}{2} - 2 + \\frac{1}{3}\\right) = \\left(2 + 4 - \\frac{8}{3}\\right) - \\left(\\frac{1}{2} - 2 + \\frac{1}{3}\\right) = \\frac{9}{2}$.",
              "The area is $\\frac{9}{2}$.",
            ],
          },
        ],
      },
      {
        title: "Volumes of solids of revolution: disk and washer methods",
        section: "diskwasher",
        body: [
          "When you rotate a region around an axis, it sweeps out a solid. To find its volume, slice perpendicular to the axis of rotation.",
          "Disk method (no hole): rotating $y = f(x)$ around the $x$-axis from $a$ to $b$: $V = \\int_a^b \\pi [f(x)]^2\\,dx$. Each cross-section is a disk with radius $f(x)$.",
          "Washer method (with a hole): if the region is between $y = f(x)$ (outer) and $y = g(x)$ (inner), $V = \\int_a^b \\pi\\left([f(x)]^2 - [g(x)]^2\\right)dx$. Each cross-section is a washer (annulus).",
          "For rotation around the $y$-axis, express $x$ as a function of $y$ and integrate with respect to $y$.",
          "For rotation around a line $y = c$ (not the $x$-axis), adjust the radii: outer radius is $|f(x) - c|$ and inner radius is $|g(x) - c|$.",
        ],
        examples: [
          {
            title: "Disk method: solid of revolution",
            steps: [
              "Find the volume of the solid obtained by rotating $y = \\sqrt{x}$ around the $x$-axis from $x = 0$ to $x = 4$.",
              "Using the disk method, each cross-section at position $x$ is a disk with radius $r = \\sqrt{x}$.",
              "$V = \\int_0^4 \\pi (\\sqrt{x})^2\\,dx = \\int_0^4 \\pi x\\,dx = \\pi \\cdot \\frac{x^2}{2}\\Big|_0^4 = \\pi \\cdot \\frac{16}{2} = 8\\pi$.",
            ],
          },
        ],
        eli5: [
          "Imagine spinning a shape (like a half-circle) around a stick, like a pottery wheel. It carves out a solid 3D object. To find the volume, imagine slicing it into thin circular disks, computing each disk's volume ($\\pi r^2 \\cdot \\text{thickness}$), and adding them all up. That's the disk method.",
          "If the shape has a hole in the middle (like a donut), each slice is a washer (a disk with a hole). Subtract the inner circle from the outer circle: $\\pi(R^2 - r^2) \\cdot \\text{thickness}$. That's the washer method.",
        ],
      },
      {
        title: "Volumes by cylindrical shells",
        section: "shells",
        body: [
          "The shell method computes volumes of revolution by wrapping thin cylindrical shells around the axis of rotation, rather than slicing perpendicular to it.",
          "For rotation around the $y$-axis: $V = \\int_a^b 2\\pi x \\cdot f(x)\\,dx$. Each shell is a thin hollow cylinder with radius $x$ (distance from the axis), height $f(x)$, and thickness $dx$. Unrolling a shell gives a rectangle with area $2\\pi x \\cdot f(x)$.",
          "For rotation around the $x$-axis: $V = \\int_c^d 2\\pi y \\cdot h(y)\\,dy$, where $h(y)$ is the horizontal width of the region at height $y$.",
          "For rotation around a vertical line $x = c$: the radius becomes $|x - c|$ instead of $x$.",
          "When to use shells vs. washers: use whichever makes the integral simpler. Shells are ideal when: (a) the function is easier to express as $y = f(x)$ but you're rotating around a vertical axis, or (b) the washer method would require splitting into multiple integrals but shells give a single clean integral.",
          "General formula: $V = \\int 2\\pi \\cdot (\\text{radius from axis}) \\cdot (\\text{height of shell}) \\cdot d(\\text{variable})$. Always identify the three components before writing the integral.",
        ],
        eli5: [
          "Imagine wrapping thin layers of paper around a pole to form a cylinder. Each layer is a shell. Its volume is the circumference ($2\\pi r$) times the height times the thickness. To find the total volume, add up infinitely many such shells from the inside out. That's the shell method.",
          "The key question is: are you slicing the solid like a loaf of bread (washers) or peeling it like an onion (shells)? Both give the same answer, but one might be easier to set up.",
        ],
        examples: [
          {
            title: "Shell method: rotation around the y-axis",
            steps: [
              "Find the volume of the solid obtained by rotating the region under $y = x^2$ from $x = 0$ to $x = 2$ around the $y$-axis.",
              "Using shells: each shell at position $x$ has radius $x$, height $x^2$, and thickness $dx$.",
              "$V = \\int_0^2 2\\pi x \\cdot x^2\\,dx = 2\\pi \\int_0^2 x^3\\,dx$.",
              "$= 2\\pi \\cdot \\frac{x^4}{4}\\Big|_0^2 = 2\\pi \\cdot \\frac{16}{4} = 8\\pi$.",
              "Compare: using washers would require rewriting as $x = \\sqrt{y}$ and integrating in $y$, which works but involves more setup.",
            ],
          },
        ],
      },
      {
        title: "Arc length",
        section: "arclength",
        body: [
          "The length of a curve $y = f(x)$ from $x = a$ to $x = b$ is $L = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "Derivation: on a tiny interval $[x, x+dx]$, the curve covers a horizontal distance $dx$ and a vertical distance $dy = f'(x)\\,dx$. By Pythagoras, the actual distance along the curve is $\\sqrt{(dx)^2 + (dy)^2} = \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "Warning: most arc length integrals are hard or impossible to evaluate in closed form. The formula is simple; the computation rarely is. Numerical methods are often used in practice.",
          "For parametric curves $x = x(t)$, $y = y(t)$: $L = \\int_\\alpha^\\beta \\sqrt{[x'(t)]^2 + [y'(t)]^2}\\,dt$.",
        ],
        examples: [
          {
            title: "Arc length of a parabola",
            steps: [
              "Find the arc length of $y = x^2$ from $x = 0$ to $x = 1$.",
              "$f'(x) = 2x$, so $[f'(x)]^2 = 4x^2$.",
              "$L = \\int_0^1 \\sqrt{1 + 4x^2}\\,dx$.",
              "Use the substitution $x = \\frac{1}{2}\\tan\\theta$, $dx = \\frac{1}{2}\\sec^2\\theta\\,d\\theta$.",
              "After simplification: $L = \\frac{1}{2}[\\sec\\theta\\tan\\theta + \\ln|\\sec\\theta + \\tan\\theta|]$ evaluated at the appropriate bounds.",
              "$L = \\frac{\\sqrt{5}}{2} + \\frac{1}{4}\\ln(2 + \\sqrt{5}) \\approx 1.4789$.",
            ],
          },
        ],
      },
      {
        title: "Parametric equations: curves in motion",
        section: "parametric",
        body: [
          "A parametric curve is defined by $x = x(t)$ and $y = y(t)$ as a parameter $t$ varies. The point $(x(t), y(t))$ traces out a path in the plane.",
          "Example: $x = \\cos t$, $y = \\sin t$ for $t \\in [0, 2\\pi]$ traces the unit circle.",
          "The slope of the tangent line is $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt} = \\frac{y'(t)}{x'(t)}$, provided $x'(t) \\neq 0$.",
          "The second derivative: $\\frac{d^2y}{dx^2} = \\frac{\\frac{d}{dt}(dy/dx)}{dx/dt}$.",
          "Arc length: $L = \\int_\\alpha^\\beta \\sqrt{[x'(t)]^2 + [y'(t)]^2}\\,dt$.",
          "Area under a parametric curve: $A = \\int_\\alpha^\\beta y(t) \\cdot x'(t)\\,dt$ (careful with orientation).",
          "Parametric curves are essential for describing motion: $t$ is time, $(x(t), y(t))$ is position, $(x'(t), y'(t))$ is the velocity vector.",
        ],
        examples: [
          {
            title: "Tangent line to a parametric curve",
            steps: [
              "Find the slope of the tangent line to $x = t^2$, $y = t^3$ at $t = 1$.",
              "$\\frac{dx}{dt} = 2t$ and $\\frac{dy}{dt} = 3t^2$.",
              "$\\frac{dy}{dx} = \\frac{3t^2}{2t} = \\frac{3t}{2}$.",
              "At $t = 1$: $\\frac{dy}{dx} = \\frac{3}{2}$.",
              "The point is $(1^2, 1^3) = (1, 1)$.",
              "Tangent line: $y - 1 = \\frac{3}{2}(x - 1)$, i.e., $y = \\frac{3}{2}x - \\frac{1}{2}$.",
            ],
          },
        ],
      },
      {
        title: "Surface area of revolution",
        section: "surfacearea",
        body: [
          "When rotating $y = f(x)$ around the $x$-axis, each tiny piece of the curve sweeps out a band (frustum) on the surface. The surface area of that band is the circumference $2\\pi f(x)$ times the arc length element $ds = \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "Full formula: $S = \\int_a^b 2\\pi f(x) \\sqrt{1 + [f'(x)]^2}\\,dx$. This is the integral of $2\\pi r \\cdot ds$ where $r = f(x)$ is the radius (distance from the axis) and $ds$ is the length element along the curve.",
          "For rotation around the $y$-axis: the radius is $x$ instead of $f(x)$, giving $S = \\int_a^b 2\\pi x \\sqrt{1 + [f'(x)]^2}\\,dx$.",
          "For parametric curves: $S = \\int_\\alpha^\\beta 2\\pi y(t) \\sqrt{[x'(t)]^2 + [y'(t)]^2}\\,dt$ (rotation around the $x$-axis).",
          "Warning: surface area integrals are typically harder than volume integrals. The $\\sqrt{1+[f']^2}$ factor rarely simplifies to something nice. Most surface area problems either have exact answers engineered to work out (like cones and spheres) or require numerical methods.",
        ],
        eli5: [
          "Imagine painting the outside of a vase. The surface area tells you how much paint you need. To compute it, think of the vase as many thin rings stacked together. Each ring has a circumference ($2\\pi$ times its radius) and a tiny width (the arc length of the curve, not just $dx$, because the surface might be slanted). Multiply and add up all the rings.",
        ],
        examples: [
          {
            title: "Surface area of a cone",
            steps: [
              "Find the surface area of the cone formed by rotating $y = x$ from $x = 0$ to $x = 1$ around the $x$-axis.",
              "$f(x) = x$, $f'(x) = 1$, so $\\sqrt{1+[f'(x)]^2} = \\sqrt{1+1} = \\sqrt{2}$.",
              "$S = \\int_0^1 2\\pi x \\cdot \\sqrt{2}\\,dx = 2\\pi\\sqrt{2} \\int_0^1 x\\,dx$.",
              "$= 2\\pi\\sqrt{2} \\cdot \\frac{1}{2} = \\pi\\sqrt{2}$.",
              "This is the lateral surface area of a cone with radius $1$, height $1$, and slant height $\\sqrt{2}$. It matches the formula $\\pi r \\ell$ where $\\ell = \\sqrt{2}$. ✓",
            ],
          },
        ],
      },
      {
        title: "Work and physical applications",
        section: "work",
        body: [
          "In physics, work = force × distance. When the force varies over the displacement, you slice the motion into tiny steps where the force is approximately constant and integrate: $W = \\int_a^b F(x)\\,dx$.",
          "Spring problems (Hooke's Law): the force to stretch a spring $x$ units beyond its natural length is $F(x) = kx$. The work to stretch from $x = a$ to $x = b$ is $W = \\int_a^b kx\\,dx = \\frac{k}{2}(b^2 - a^2)$. Note: $x$ measures displacement from natural length, not the total length of the spring.",
          "Pumping problems: to pump liquid out of a tank, slice the liquid into thin horizontal layers. Each layer at height $y$ has volume $A(y)\\,dy$ (where $A(y)$ is the cross-sectional area), weighs $\\rho g \\cdot A(y)\\,dy$, and must be lifted a distance $d(y)$ to the top. Total work: $W = \\int_0^h \\rho g \\cdot A(y) \\cdot d(y)\\,dy$. The tricky part is expressing $A(y)$ and $d(y)$ correctly for the tank's shape.",
          "Hydrostatic force: the pressure at depth $d$ below the surface of a fluid is $P = \\rho g d$. The total force on a submerged vertical plate is $F = \\int_a^b \\rho g \\cdot d(y) \\cdot w(y)\\,dy$, where $w(y)$ is the width of the plate at depth $d(y)$.",
          "The unifying idea: in every application, you identify the small piece, write its contribution ($dW$, $dF$, etc.), and integrate. The calculus is the same; only the physical setup changes.",
        ],
        eli5: [
          "If you push a box with a constant force, work is just force times distance. But what if the force changes as you go — like stretching a rubber band, where it gets harder the further you stretch? You can't just multiply one force by one distance anymore.",
          "Instead, break the motion into tiny steps. In each tiny step, the force is approximately constant. Compute force × tiny distance for each step and add them all up. That's exactly what the integral does.",
        ],
        examples: [
          {
            title: "Work to stretch a spring",
            steps: [
              "A spring has natural length 10 cm and spring constant $k = 40$ N/m. Find the work to stretch it from 12 cm to 15 cm.",
              "We measure $x$ as displacement from natural length. So we stretch from $x = 0.02$ m to $x = 0.05$ m.",
              "By Hooke's Law: $F(x) = 40x$ newtons.",
              "$W = \\int_{0.02}^{0.05} 40x\\,dx = 40 \\cdot \\frac{x^2}{2}\\Big|_{0.02}^{0.05} = 20(0.0025 - 0.0004) = 20(0.0021) = 0.042$ J.",
              "The work is $0.042$ joules. Note: stretching the first 2 cm requires less work than stretching the next 3 cm, because the force increases with displacement.",
            ],
          },
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting to determine which curve is on top (or right) before subtracting. Always check a test point in each interval.",
      "Squaring the difference instead of differencing the squares in the washer method. It is $\\pi(R^2 - r^2)$, not $\\pi(R - r)^2$.",
      "Using the wrong method (shells vs. washers) and ending up with an impossible integral. Try both and pick the simpler one.",
      "In arc length, forgetting to take the derivative. The formula involves $f'(x)$, not $f(x)$.",
      "Not adjusting radii when rotating around a line other than an axis. If rotating around $y = 3$, the radius is $|f(x) - 3|$, not $f(x)$.",
      "Confusing the parameter $t$ with $x$ in parametric problems. $\\frac{dy}{dx} \\neq \\frac{dy}{dt}$; you need $\\frac{dy/dt}{dx/dt}$.",
    ],
  },
  {
    topicId: "multivariable",
    title: "Multivariable & Vector Calculus",
    intro: [
      "Single-variable calculus studies functions $f: \\mathbb{R} \\to \\mathbb{R}$ — one input, one output. Multivariable calculus extends everything to functions of two or three variables: surfaces, vector fields, and 3D geometry.",
      "The core ideas (limits, derivatives, integrals) carry over, but with richer structure. A function of two variables has infinitely many directions to differentiate in. An integral over a region in the plane computes volume. Vector fields assign a vector to every point in space, and their integrals compute work and flux.",
      "This module covers vectors, partial derivatives, optimization with several variables, multiple integrals, and the three great theorems of vector calculus: Green's, Stokes', and the Divergence Theorem.",
    ],
    sections: [
      {
        title: "Vectors and the geometry of space",
        section: "vectors",
        body: [
          "A vector $\\mathbf{v} = \\langle a, b, c \\rangle$ in $\\mathbb{R}^3$ has magnitude $|\\mathbf{v}| = \\sqrt{a^2 + b^2 + c^2}$ and direction.",
          "Dot product: $\\mathbf{u} \\cdot \\mathbf{v} = u_1 v_1 + u_2 v_2 + u_3 v_3 = |\\mathbf{u}||\\mathbf{v}|\\cos\\theta$. It measures how aligned two vectors are. Zero dot product means perpendicular.",
          "Cross product: $\\mathbf{u} \\times \\mathbf{v}$ is a vector perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$, with magnitude $|\\mathbf{u}||\\mathbf{v}|\\sin\\theta$ (the area of the parallelogram they span).",
          "Equations of lines: $\\mathbf{r}(t) = \\mathbf{r}_0 + t\\mathbf{v}$ (point plus direction). Equations of planes: $\\mathbf{n} \\cdot (\\mathbf{r} - \\mathbf{r}_0) = 0$ (normal vector dotted with displacement is zero).",
          "These tools let you describe points, lines, planes, and curves in 3D space — the setting for everything that follows.",
        ],
        examples: [
          {
            title: "Finding the equation of a plane",
            steps: [
              "Find the equation of the plane through $(1, 2, 3)$ with normal vector $\\mathbf{n} = \\langle 2, -1, 4 \\rangle$.",
              "The plane equation is $\\mathbf{n} \\cdot (\\mathbf{r} - \\mathbf{r}_0) = 0$.",
              "$2(x - 1) + (-1)(y - 2) + 4(z - 3) = 0$.",
              "Expand: $2x - 2 - y + 2 + 4z - 12 = 0$.",
              "Simplify: $2x - y + 4z = 12$.",
            ],
          },
        ],
      },
      {
        title: "Vector functions and space curves",
        section: "vectorfunc",
        body: [
          "A vector function $\\mathbf{r}(t) = \\langle x(t), y(t), z(t) \\rangle$ traces a curve in 3D space as the parameter $t$ varies. Think of $t$ as time: at each moment, the point $(x(t), y(t), z(t))$ is the particle's position.",
          "The derivative $\\mathbf{r}'(t) = \\langle x'(t), y'(t), z'(t) \\rangle$ is the velocity vector — it points in the direction of motion and its magnitude is the speed.",
          "Speed: $|\\mathbf{r}'(t)| = \\sqrt{[x'(t)]^2 + [y'(t)]^2 + [z'(t)]^2}$. The unit tangent vector $\\mathbf{T}(t) = \\mathbf{r}'(t)/|\\mathbf{r}'(t)|$ gives the direction of motion without the speed information.",
          "Arc length: $L = \\int_a^b |\\mathbf{r}'(t)|\\,dt$ — integrate speed over time to get total distance traveled. This is the 3D generalization of $L = \\int \\sqrt{1+[f']^2}\\,dx$.",
          "Curvature $\\kappa$ measures how sharply the curve turns: $\\kappa = |\\mathbf{T}'(t)|/|\\mathbf{r}'(t)| = |\\mathbf{r}' \\times \\mathbf{r}''|/|\\mathbf{r}'|^3$. A straight line has $\\kappa = 0$; a circle of radius $r$ has $\\kappa = 1/r$ (tighter circle = higher curvature).",
          "The acceleration vector $\\mathbf{a} = \\mathbf{r}''(t)$ naturally decomposes into two components: $\\mathbf{a} = a_T \\mathbf{T} + a_N \\mathbf{N}$ where $a_T = \\frac{d}{dt}|\\mathbf{r}'|$ (tangential — speeding up or slowing down) and $a_N = \\kappa|\\mathbf{r}'|^2$ (normal — turning). This is why you feel pushed sideways on a curve and pressed back under acceleration.",
        ],
        eli5: [
          "A vector function describes a path through space, like the GPS track of a drone. The derivative is the velocity — how fast and which direction it's flying at each moment. Speed is how fast; the unit tangent vector is which direction.",
          "Curvature measures how 'bendy' the path is at each point. Flying straight? Curvature is zero. Doing a tight spiral? Curvature is large. A circle with a small radius has high curvature (tight turns), while a circle with a huge radius has low curvature (gentle turns).",
        ],
      },
      {
        title: "Partial derivatives",
        section: "partials",
        body: [
          "For $f(x, y)$, the partial derivative $f_x = \\frac{\\partial f}{\\partial x}$ differentiates with respect to $x$ while treating $y$ as a constant.",
          "Geometrically: $f_x(a, b)$ is the slope of the surface $z = f(x, y)$ in the $x$-direction at the point $(a, b)$.",
          "Higher-order partials: $f_{xx}$, $f_{yy}$, $f_{xy}$, $f_{yx}$. Clairaut's Theorem: if $f_{xy}$ and $f_{yx}$ are continuous, then $f_{xy} = f_{yx}$ (the order of differentiation doesn't matter).",
          "Example: if $f(x,y) = x^2 y + \\sin(xy)$, then $f_x = 2xy + y\\cos(xy)$ and $f_y = x^2 + x\\cos(xy)$.",
          "Limits and continuity in multiple variables: $\\lim_{(x,y)\\to(a,b)} f(x,y) = L$ means $f$ approaches $L$ from every possible path. To show a limit doesn't exist, find two paths that give different limits.",
        ],
        examples: [
          {
            title: "Showing a multivariable limit does not exist",
            steps: [
              "Investigate $\\lim_{(x,y)\\to(0,0)} \\frac{xy}{x^2 + y^2}$.",
              "Along the path $y = 0$: $\\frac{x \\cdot 0}{x^2 + 0} = 0$. Limit is $0$.",
              "Along the path $y = x$: $\\frac{x \\cdot x}{x^2 + x^2} = \\frac{x^2}{2x^2} = \\frac{1}{2}$. Limit is $\\frac{1}{2}$.",
              "Two paths give different limits ($0 \\neq \\frac{1}{2}$), so the limit does not exist.",
            ],
          },
        ],
      },
      {
        title: "The gradient vector and directional derivatives",
        section: "gradient",
        body: [
          "The gradient of $f(x,y)$ is the vector $\\nabla f = \\langle f_x, f_y \\rangle$. It encodes all the directional information about how $f$ changes. Its direction points toward the steepest uphill, and its magnitude $|\\nabla f|$ is the rate of steepest ascent.",
          "The directional derivative of $f$ in the direction of unit vector $\\mathbf{u}$ is $D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u} = |\\nabla f|\\cos\\theta$, where $\\theta$ is the angle between $\\nabla f$ and $\\mathbf{u}$. This tells you the rate of change of $f$ in any direction.",
          "Key consequences: $D_{\\mathbf{u}} f$ is maximized when $\\mathbf{u}$ points in the direction of $\\nabla f$ (steepest ascent, $\\theta=0$). It's minimized in the direction of $-\\nabla f$ (steepest descent, $\\theta=\\pi$). It's zero when $\\mathbf{u}$ is perpendicular to $\\nabla f$ — this is the 'contour direction' where $f$ stays constant.",
          "The gradient is perpendicular to level curves (in 2D) and level surfaces (in 3D). This is why contour maps work: if you walk along a contour line ($f = $ constant), you're moving perpendicular to $\\nabla f$, so $f$ doesn't change.",
          "The tangent plane to $z = f(x,y)$ at $(a, b, f(a,b))$ is $z - f(a,b) = f_x(a,b)(x-a) + f_y(a,b)(y-b)$. This is the multivariable analog of the tangent line — the best linear approximation to the surface at that point.",
        ],
        eli5: [
          "Imagine standing on a hillside. The gradient vector is an arrow that points directly uphill — the steepest direction you could walk. The length of the arrow tells you how steep that steepest direction is. Walking perpendicular to the gradient means walking along a contour line — staying at the same elevation.",
          "The directional derivative answers: 'If I walk in this particular direction, how steep is the slope?' Walking straight uphill (with the gradient) gives the maximum slope. Walking along a contour (perpendicular to the gradient) gives zero slope. Walking at an angle gives something in between.",
        ],
      },
      {
        title: "Optimization and Lagrange multipliers",
        section: "optimization",
        body: [
          "To find extrema of $f(x,y)$: set $f_x = 0$ and $f_y = 0$ simultaneously. Solutions are critical points.",
          "Second derivative test: compute $D = f_{xx} f_{yy} - (f_{xy})^2$ at a critical point. If $D > 0$ and $f_{xx} > 0$: local min. If $D > 0$ and $f_{xx} < 0$: local max. If $D < 0$: saddle point. If $D = 0$: inconclusive.",
          "Lagrange multipliers solve constrained optimization: maximize/minimize $f(x,y)$ subject to a constraint $g(x,y) = c$.",
          "Method: solve $\\nabla f = \\lambda \\nabla g$ and $g(x,y) = c$ simultaneously. The scalar $\\lambda$ is the Lagrange multiplier.",
          "Geometric insight: at a constrained extremum, the gradient of $f$ must be parallel to the gradient of $g$. They point in the same (or opposite) direction along the constraint curve.",
        ],
        examples: [
          {
            title: "Lagrange multipliers: maximizing on a circle",
            steps: [
              "Maximize $f(x,y) = x + 2y$ subject to $g(x,y) = x^2 + y^2 = 5$.",
              "$\\nabla f = \\langle 1, 2 \\rangle$ and $\\nabla g = \\langle 2x, 2y \\rangle$.",
              "Set $\\nabla f = \\lambda \\nabla g$: $1 = 2\\lambda x$ and $2 = 2\\lambda y$.",
              "From equation 1: $\\lambda = \\frac{1}{2x}$. From equation 2: $\\lambda = \\frac{1}{y}$.",
              "So $\\frac{1}{2x} = \\frac{1}{y} \\Rightarrow y = 2x$.",
              "Substitute into the constraint: $x^2 + (2x)^2 = 5 \\Rightarrow 5x^2 = 5 \\Rightarrow x = \\pm 1$.",
              "Points: $(1, 2)$ and $(-1, -2)$. $f(1,2) = 5$ (max) and $f(-1,-2) = -5$ (min).",
            ],
          },
        ],
      },
      {
        title: "Multiple integrals",
        section: "multiint",
        body: [
          "A double integral $\\iint_R f(x,y)\\,dA$ computes the volume under $z = f(x,y)$ over a region $R$ in the $xy$-plane.",
          "Iterated integrals: $\\iint_R f\\,dA = \\int_a^b \\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\,dx$. Evaluate the inner integral first (treating the outer variable as a constant).",
          "Fubini's Theorem: if $f$ is continuous on $R$, you can integrate in either order: $\\int\\int f\\,dy\\,dx = \\int\\int f\\,dx\\,dy$. Sometimes one order is much easier.",
          "Polar coordinates: for circular or radial regions, use $x = r\\cos\\theta$, $y = r\\sin\\theta$, $dA = r\\,dr\\,d\\theta$. The extra factor of $r$ is critical.",
          "Triple integrals extend to 3D: $\\iiint_E f\\,dV$ computes mass (if $f$ is density), or volume (if $f = 1$).",
          "Cylindrical coordinates $(r, \\theta, z)$: $dV = r\\,dr\\,d\\theta\\,dz$. Use for problems with cylindrical symmetry.",
          "Spherical coordinates $(\\rho, \\phi, \\theta)$: $dV = \\rho^2 \\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$. Use for spheres and cones.",
          "Applications: mass = $\\iint \\rho\\,dA$, center of mass = $\\frac{\\iint x\\rho\\,dA}{\\text{mass}}$, moments of inertia.",
        ],
        examples: [
          {
            title: "Double integral in polar coordinates",
            steps: [
              "Evaluate $\\iint_R e^{-(x^2+y^2)}\\,dA$ where $R$ is the disk $x^2 + y^2 \\leq 4$.",
              "Convert to polar: $x^2 + y^2 = r^2$, $dA = r\\,dr\\,d\\theta$, and the disk becomes $0 \\leq r \\leq 2$, $0 \\leq \\theta \\leq 2\\pi$.",
              "$\\int_0^{2\\pi} \\int_0^2 e^{-r^2} \\cdot r\\,dr\\,d\\theta$.",
              "The $\\theta$ integral is trivial: $\\int_0^{2\\pi} d\\theta = 2\\pi$.",
              "For the $r$ integral: $\\int_0^2 r e^{-r^2}\\,dr$. Let $u = -r^2$, $du = -2r\\,dr$: $-\\frac{1}{2}\\int_0^{-4} e^u\\,du = -\\frac{1}{2}[e^{-4} - 1] = \\frac{1-e^{-4}}{2}$.",
              "Total: $2\\pi \\cdot \\frac{1 - e^{-4}}{2} = \\pi(1 - e^{-4})$.",
            ],
          },
        ],
      },
      {
        title: "Vector fields",
        section: "vectorfields",
        body: [
          "A vector field assigns a vector to every point in space: $\\mathbf{F}(x,y) = \\langle P(x,y), Q(x,y) \\rangle$ in 2D, or $\\mathbf{F}(x,y,z) = \\langle P, Q, R \\rangle$ in 3D. Visually, draw a small arrow at each point showing the direction and magnitude.",
          "Physical examples: gravitational fields (arrows point toward massive objects), electric fields (arrows show the force on a positive charge), fluid velocity fields (arrows show speed and direction of flow at each point), wind maps, and magnetic fields.",
          "A vector field is conservative if $\\mathbf{F} = \\nabla f$ for some scalar function $f$ (called the potential function). This means the field is the gradient of something. Conservative fields have a crucial property: the line integral between two points is independent of the path taken — only the endpoints matter.",
          "Test for conservative fields in 2D: $\\mathbf{F} = \\langle P, Q \\rangle$ is conservative if and only if $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$ on a simply connected domain (no holes). This is the 'cross-partial' test.",
          "Finding the potential function: if $\\mathbf{F} = \\langle P, Q \\rangle$ passes the cross-partial test, find $f$ by integrating: $f(x,y) = \\int P\\,dx$ (treating $y$ as constant), then determine any leftover function of $y$ by matching $f_y = Q$.",
          "Non-conservative fields include anything with a nonzero curl (in 3D) or failing the cross-partial test. The work done by such a field depends on the path, not just the endpoints. Example: $\\mathbf{F} = \\langle -y, x \\rangle$ has $P_y = -1$ but $Q_x = 1$, so it's not conservative — it swirls.",
        ],
        eli5: [
          "A vector field is like a weather map with wind arrows at every location. At each point, the arrow tells you which way the wind blows and how strong it is.",
          "A conservative field is special: it has a 'potential energy landscape' underneath it, like a hilly terrain where the arrows always point downhill. In such a field, the work done between two points depends only on the elevation difference, not on the path you take. A non-conservative field has no such landscape — the path matters, like a wind field that swirls in circles.",
        ],
      },
      {
        title: "Line integrals",
        section: "lineint",
        body: [
          "A line integral computes a quantity accumulated along a curve $C$ in space. There are two main types, and they answer different questions.",
          "Scalar line integral: $\\int_C f\\,ds = \\int_a^b f(\\mathbf{r}(t)) |\\mathbf{r}'(t)|\\,dt$. Here $ds = |\\mathbf{r}'(t)|\\,dt$ is the arc length element. This computes the 'weighted length' of the curve — for example, the mass of a wire with density $f$ at each point, or the total cost of a path where $f$ is the cost per unit length.",
          "Vector line integral (work integral): $\\int_C \\mathbf{F} \\cdot d\\mathbf{r} = \\int_a^b \\mathbf{F}(\\mathbf{r}(t)) \\cdot \\mathbf{r}'(t)\\,dt$. The dot product picks out the component of $\\mathbf{F}$ in the direction of motion. This computes the work done by the force field $\\mathbf{F}$ on a particle moving along $C$. Force components perpendicular to the path contribute zero work.",
          "Fundamental Theorem for Line Integrals: if $\\mathbf{F} = \\nabla f$ (conservative), then $\\int_C \\nabla f \\cdot d\\mathbf{r} = f(\\text{end}) - f(\\text{start})$. The integral depends only on the endpoints, not the path. This is the multivariable analog of $\\int_a^b F'(x)\\,dx = F(b) - F(a)$.",
          "Corollary: for a conservative field, the line integral around any closed loop is zero ($\\oint_C \\nabla f \\cdot d\\mathbf{r} = 0$). You end where you started, so the potential difference is zero.",
        ],
        eli5: [
          "A scalar line integral is like measuring the total cost of a road trip, where different stretches of road have different tolls per mile. You multiply the toll rate by the distance at each point and add up along the route.",
          "A vector line integral (work) is like measuring how much the wind helps or hinders you as you walk along a path. Wind pushing you forward = positive work. Wind pushing sideways = zero contribution. Wind pushing backward = negative work. The total work is what you feel over the entire walk.",
        ],
        examples: [
          {
            title: "Work integral using the Fundamental Theorem",
            steps: [
              "Compute $\\int_C \\mathbf{F} \\cdot d\\mathbf{r}$ where $\\mathbf{F} = \\langle 2x, 2y \\rangle$ and $C$ is any path from $(0,0)$ to $(3,4)$.",
              "Check if $\\mathbf{F}$ is conservative: $P = 2x$, $Q = 2y$. $P_y = 0$ and $Q_x = 0$. Since $P_y = Q_x$, $\\mathbf{F}$ is conservative.",
              "Find the potential function: $f_x = 2x \\Rightarrow f = x^2 + g(y)$. Then $f_y = g'(y) = 2y \\Rightarrow g(y) = y^2 + C$.",
              "So $f(x,y) = x^2 + y^2$.",
              "By the Fundamental Theorem: $\\int_C \\nabla f \\cdot d\\mathbf{r} = f(3,4) - f(0,0) = (9+16) - 0 = 25$.",
              "The answer is $25$, regardless of which path we take from $(0,0)$ to $(3,4)$.",
            ],
          },
        ],
      },
      {
        title: "Curl and divergence",
        section: "curldiv",
        body: [
          "Divergence measures how much a vector field 'spreads out' from a point: $\\text{div}\\,\\mathbf{F} = \\nabla \\cdot \\mathbf{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}$.",
          "Positive divergence: source (field flows outward). Negative: sink (field flows inward). Zero: incompressible flow.",
          "Curl measures the 'rotation' or 'circulation' of a field: $\\text{curl}\\,\\mathbf{F} = \\nabla \\times \\mathbf{F} = \\left\\langle \\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z},\\, \\frac{\\partial P}{\\partial z} - \\frac{\\partial R}{\\partial x},\\, \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right\\rangle$.",
          "If $\\text{curl}\\,\\mathbf{F} = \\mathbf{0}$ everywhere, the field is irrotational (no swirling). For simply connected domains, irrotational implies conservative.",
          "Physical examples: the curl of a fluid velocity field tells you how fast and around which axis a small paddle wheel would spin. The divergence tells you whether fluid is being created or destroyed at a point.",
        ],
      },
      {
        title: "Green's, Stokes', and the Divergence Theorem",
        section: "theorems",
        body: [
          "These three theorems are the pinnacle of vector calculus. Each relates an integral over a boundary to an integral over the region it encloses.",
          "Green's Theorem (2D): $\\oint_C P\\,dx + Q\\,dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA$. A line integral around a closed curve equals a double integral over the enclosed region.",
          "Stokes' Theorem (3D surfaces): $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$. A line integral around the boundary of a surface equals the surface integral of the curl.",
          "Divergence Theorem (3D volumes): $\\oiint_S \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_E (\\nabla \\cdot \\mathbf{F})\\,dV$. The flux through a closed surface equals the triple integral of the divergence inside.",
          "Unified pattern: in every case, an integral over the boundary = an integral of a derivative over the interior. This is the same idea as the Fundamental Theorem of Calculus ($\\int_a^b f'(x)\\,dx = f(b) - f(a)$), generalized to higher dimensions.",
          "Green's Theorem is the 2D special case of Stokes'. The Divergence Theorem is the 3D analog for flux instead of circulation.",
        ],
        eli5: [
          "Imagine you have a pond with water flowing around. You want to know the total circulation (how much the water swirls) around the edge of the pond. Green's Theorem says: instead of measuring along the entire bank, you can add up all the tiny swirls inside the pond. The total around the boundary equals the sum of what's happening inside.",
          "Stokes' Theorem is the same idea but for a surface in 3D — like measuring the total wind circulation around the edge of a sail by adding up the curl of the wind over the sail's surface.",
          "The Divergence Theorem says: the total amount of stuff flowing out through the walls of a room equals the total amount of stuff being produced inside the room. Sources inside push flux out through the boundary.",
          "All three theorems say the same thing at different levels: boundary integral = interior derivative integral. This is the grand unification of calculus.",
        ],
      },
    ],
    examples: [],
    commonMistakes: [
      "Forgetting the $r$ factor when converting to polar coordinates: $dA = r\\,dr\\,d\\theta$, not $dr\\,d\\theta$.",
      "In double integrals, getting the order of integration wrong or using incorrect bounds. Always sketch the region first.",
      "Confusing the dot product and cross product. The dot product gives a scalar; the cross product gives a vector.",
      "Applying the 2D conservative test ($P_y = Q_x$) to a non-simply-connected domain. The test can give a false positive if the domain has holes.",
      "In line integrals, forgetting to parametrize the curve before integrating. You need $\\mathbf{r}(t)$ and $\\mathbf{r}'(t)$.",
      "Confusing divergence (a scalar) with curl (a vector). Divergence measures expansion; curl measures rotation.",
      "In Stokes' Theorem, using the wrong orientation. The boundary curve and surface normal must be consistently oriented (right-hand rule).",
      "Forgetting the $\\rho^2 \\sin\\phi$ factor in spherical coordinates. This is the 3D analog of the $r$ factor in polar.",
    ],
  },
];
