import type { ModuleContent } from "../types";

export const applicationsOfIntegrationModule: ModuleContent = {
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
  };
