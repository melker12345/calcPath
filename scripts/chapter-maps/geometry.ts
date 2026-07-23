import type { ChapterPlan } from "../lib/consolidate-chapters";

export const GEOMETRY_CHAPTERS: ChapterPlan[] = [
  {
    id: "geometry-foundations",
    title: "Foundations of Geometry",
    description:
      "Points, lines, planes, angles, axioms, Euclid's Elements, and the parallel postulate.",
    order: 1,
    topicIds: [
      "geometry",
      "euclidean-geometry",
      "point-geometry",
      "line-geometry",
      "plane-geometry",
      "angle",
      "axiom",
      "euclids-elements",
      "parallel-postulate",
    ],
  },
  {
    id: "triangles",
    title: "Triangles",
    description:
      "Triangle properties, congruence and similarity criteria, the Pythagorean theorem, and key theorems.",
    order: 2,
    topicIds: [
      "triangle",
      "congruence-geometry",
      "sss-congruence",
      "sas-congruence",
      "asa-congruence",
      "pythagorean-theorem",
      "similarity-geometry",
      "aa-similarity",
      "isosceles-triangle-theorem",
      "triangle-inequality",
    ],
  },
  {
    id: "circles-polygons",
    title: "Circles & Polygons",
    description:
      "Circles, radii and diameters, polygons, inscribed angles, and area.",
    order: 3,
    topicIds: [
      "circle",
      "radius",
      "diameter",
      "polygon",
      "regular-polygon",
      "inscribed-angle",
      "circumscribed-circle",
      "area-of-a-circle",
    ],
  },
  {
    id: "coordinate-geometry",
    title: "Coordinate Geometry",
    description:
      "The coordinate plane, distance and midpoint, slope, lines, circles, parabolas, and ellipses.",
    order: 4,
    topicIds: [
      "cartesian-coordinate-system",
      "distance-formula",
      "midpoint",
      "slope",
      "linear-equation",
      "equation-of-a-circle",
      "parabola",
      "ellipse",
    ],
  },
  {
    id: "transformations-symmetry",
    title: "Transformations & Symmetry",
    description:
      "Isometries, translations, rotations, reflections, symmetry groups, and congruence transformations.",
    order: 5,
    topicIds: [
      "isometry",
      "translation-geometry",
      "rotation-mathematics",
      "reflection-mathematics",
      "symmetry-group",
      "congruence-transformations",
    ],
  },
  {
    id: "advanced-geometries",
    title: "Advanced Geometries",
    description:
      "Projective, non-Euclidean, hyperbolic, elliptic, and spherical geometry.",
    order: 6,
    topicIds: [
      "projective-geometry",
      "projective-plane",
      "non-euclidean-geometry",
      "hyperbolic-geometry",
      "elliptic-geometry",
      "spherical-geometry",
    ],
  },
];