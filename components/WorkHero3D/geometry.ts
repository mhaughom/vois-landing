import * as THREE from 'three';

// === CUBE GEOMETRY ===
export const S = 1.4; // half-size

export const VERT_COORDS: [number, number, number][] = [
  [-S, -S, -S], [-S, -S, S], [-S, S, -S], [-S, S, S],
  [S, -S, -S], [S, -S, S], [S, S, -S], [S, S, S],
];

export const EDGE_PAIRS: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

export const ISO_Y = Math.PI / 4;
export const ISO_X = Math.atan(1 / Math.sqrt(2));
export const CUBE_ROT = Math.PI + ISO_Y;
export const HEX_ROT_HALF = Math.PI;

export const EDGE_THICKNESS = 0.03;
export const NODE_SIZE = 0.15;

export const CUBE_FACES: {
  verts: [number, number, number, number];
  normal: [number, number, number];
}[] = [
  { verts: [0, 1, 3, 2], normal: [-1, 0, 0] },
  { verts: [4, 6, 7, 5], normal: [1, 0, 0] },
  { verts: [0, 4, 5, 1], normal: [0, -1, 0] },
  { verts: [2, 3, 7, 6], normal: [0, 1, 0] },
  { verts: [0, 2, 6, 4], normal: [0, 0, -1] },
  { verts: [1, 5, 7, 3], normal: [0, 0, 1] },
];

// === CUBOCTAHEDRON ===
export const HEX_SPH = S * 2 * Math.sqrt(2 / 3);
export const HEX_A = 0.9;
export const HEX_HR = (HEX_A * HEX_SPH) / 2;
export const HEX_W = (HEX_A * HEX_SPH * Math.sqrt(3)) / 2;
export const HEX_D = HEX_SPH * Math.sqrt(1 - HEX_A * HEX_A);

export const HEX3D_EDGES: [number, number][] = [
  [0, 2], [2, 4], [4, 1], [1, 6], [6, 8], [8, 0],
  [0, 3], [3, 5], [5, 1], [1, 7], [7, 9], [9, 0],
  [10, 0], [10, 2], [10, 4], [10, 1], [10, 6], [10, 8],
  [11, 0], [11, 3], [11, 5], [11, 1], [11, 7], [11, 9],
  [2, 3], [4, 5], [6, 7], [8, 9],
];

export const HEX_FACE_TRIS: [number, number, number][] = [
  // Front (0-5, hub 10)
  [10, 0, 2], [10, 2, 4], [10, 4, 1], [10, 1, 6], [10, 6, 8], [10, 8, 0],
  // Back (6-11, hub 11)
  [11, 0, 3], [11, 3, 5], [11, 5, 1], [11, 1, 7], [11, 7, 9], [11, 9, 0],
  // Sides (12-19)
  [0, 2, 3], [8, 0, 9],
  [4, 1, 5], [1, 6, 7],
  [2, 4, 5], [2, 5, 3],
  [6, 8, 9], [6, 9, 7],
];

// Per-triangle labels — 18 unique themes across 20 indices (17+19 share with 16+18)
export const TRI_LABELS: string[] = [
  // Front 6 (hub 10) — personal themes
  'Your Assistant', 'Your Super-Assistant', 'Your Day',
  'Meetings', 'Projects', 'Operations',
  // Back 6 (hub 11) — business themes
  'Clients', 'Documents', 'Finance',
  'Website', 'AI Agents', 'Reports',
  // Sides (12-19) — each unique, quad partners share
  'Your Team', 'Playbooks',
  'Field to Office', 'The Airlock',
  'Your Memory', 'Your Memory',     // quad 16+17
  'Growth Engine', 'Growth Engine', // quad 18+19
];

// Triangle pairs that form quads (rectangles) — clicking either selects both
// Indices 16+17 and 18+19 form rectangular faces from 2 triangles each
export function getTriGroup(idx: number): number[] {
  if (idx === 16 || idx === 17) return [16, 17];
  if (idx === 18 || idx === 19) return [18, 19];
  return [idx];
}

