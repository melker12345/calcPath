import type { ModuleContent } from "../types";

/**
 * Multivariable & Vector Calculus
 * Properly extracted with balanced brace counting.
 */

export const multivariableModule: ModuleContent = 
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
  };
