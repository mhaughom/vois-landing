import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AnimatedHabosIcon — the Habos cube/network icon with hover-triggered animations.
 * On hover, randomly picks one of 5 animations and plays it once:
 *   1. Flat 2D spin (360°)
 *   2. 3D cube tumble
 *   3. Explode faces outward (3D), hold, smash back
 *   4. 2D pizza wave — 6 triangular slices spread out one-by-one, snap back
 *   5. Cube → cuboctahedron crossfade with rotation, then back
 * Returns to static isometric pose after animation completes.
 */

// ─── 3D Cube Geometry ──────────────────────────────────────────────────────

const S = 1;
const CX = 12, CY = 12;
const NODE_PX = 1.35;
const STROKE_W = 1.15;
const COLOR = '#1e293b';
const FACE_FILL = '#b8c4d8';

const ISO_Y = Math.PI / 4;
const ISO_X = Math.atan(1 / Math.sqrt(2));
const EXPLODE_DIST = 1.5;

const V: [number, number, number][] = [
  [-S,-S,-S], [-S,-S,S], [-S,S,-S], [-S,S,S],
  [S,-S,-S],  [S,-S,S],  [S,S,-S],  [S,S,S],
];

const FACES: { vi: number[]; n: [number, number, number] }[] = [
  { vi: [4,5,7,6], n: [1,0,0] },
  { vi: [0,2,3,1], n: [-1,0,0] },
  { vi: [2,6,7,3], n: [0,1,0] },
  { vi: [0,1,5,4], n: [0,-1,0] },
  { vi: [1,3,7,5], n: [0,0,1] },
  { vi: [0,4,6,2], n: [0,0,-1] },
];

// ─── Precompute hexagonal outline from the static isometric projection ─────

function projectVertex(vi: number): [number, number] {
  const [bx, by, bz] = V[vi];
  const cy = Math.cos(ISO_Y), sy = Math.sin(ISO_Y);
  const cx = Math.cos(ISO_X), sx = Math.sin(ISO_X);
  const x1 = bx * cy + bz * sy;
  const z1 = -bx * sy + bz * cy;
  const y2 = by * cx - z1 * sx;
  return [CX + x1 * 3.6, CY - y2 * 3.6];
}

// Project all 8 cube vertices, deduplicate, find 6 outermost → hex outline
const _allProj = V.map((_, i) => projectVertex(i));
const _unique: { x: number; y: number; d: number }[] = [];
for (const [px, py] of _allProj) {
  if (!_unique.some(u => Math.abs(u.x - px) < 0.1 && Math.abs(u.y - py) < 0.1)) {
    _unique.push({ x: px, y: py, d: Math.sqrt((px - CX) ** 2 + (py - CY) ** 2) });
  }
}
_unique.sort((a, b) => b.d - a.d);
const HEX_VERTS: [number, number][] = _unique.slice(0, 6).map(u => [u.x, u.y]);
// Sort by angle so they form a proper ring
HEX_VERTS.sort((a, b) => Math.atan2(a[1] - CY, a[0] - CX) - Math.atan2(b[1] - CY, b[0] - CX));

// Precompute outward direction for each of the 6 slices
const SLICE_DIRS: [number, number][] = HEX_VERTS.map((v, i) => {
  const next = HEX_VERTS[(i + 1) % 6];
  const mx = (v[0] + next[0]) / 2 - CX;
  const my = (v[1] + next[1]) / 2 - CY;
  const len = Math.sqrt(mx * mx + my * my) || 1;
  return [mx / len, my / len];
});

const PIZZA_DIST = 2.8;

// ─── Cuboctahedron geometry (matching WorkHero3D/geometry.ts) ─────────────
// This is the HABOS cuboctahedron — 12 vertices (2 poles + 8 equatorial + 2 hubs),
// 28 edges. From the right angle, projects to the same hexagonal shape as the logo.

const HEX_A = 0.9; // equatorial compression factor, same as WorkHero3D

// Cuboctahedron vertices, pre-rotated so the front hub (Fh) aligns with the
// cube's top vertex and back hub (Bh) with the bottom. The poles (T/B) sit
// near-center in depth. Found via interactive alignment tool.
// Euler angles: (-54°, 133°, 2°)
const CUBOCTA_VERTS: [number, number, number][] = (() => {
  // Scale circumradius to match cube's bounding sphere (√3 instead of 2√(2/3))
  // so the hexagonal outlines have equal size in projection.
  const R = Math.sqrt(3);
  const a = HEX_A;
  const hr = (a * R) / 2;
  const w = (a * R * Math.sqrt(3)) / 2;
  const d = R * Math.sqrt(1 - a * a);
  const cd = R;

  // Base vertices (pole axis along Y)
  const base: [number, number, number][] = [
    [0, R, 0],       // 0: top pole
    [0, -R, 0],      // 1: bottom pole
    [w, hr, d],       // 2
    [w, hr, -d],      // 3
    [w, -hr, d],      // 4
    [w, -hr, -d],     // 5
    [-w, -hr, d],     // 6
    [-w, -hr, -d],    // 7
    [-w, hr, d],      // 8
    [-w, hr, -d],     // 9
    [0, 0, cd],       // 10: front hub
    [0, 0, -cd],      // 11: back hub
  ];

  // Pre-rotation matrix from Euler(-54°, 133°, 2°), ZYX order.
  const r00 = -0.6815829051, r01 = -0.6118305490, r02 =  0.4013827635;
  const r10 = -0.0238013995, r11 =  0.5667779399, r12 =  0.8235267210;
  const r20 = -0.7313537016, r21 =  0.5517482634, r22 = -0.4008685781;

  return base.map(([x, y, z]) => [
    r00 * x + r01 * y + r02 * z,
    r10 * x + r11 * y + r12 * z,
    r20 * x + r21 * y + r22 * z,
  ] as [number, number, number]);
})();

const CUBOCTA_EDGES: [number, number][] = [
  // front ring
  [0, 2], [2, 4], [4, 1], [1, 6], [6, 8], [8, 0],
  // back ring
  [0, 3], [3, 5], [5, 1], [1, 7], [7, 9], [9, 0],
  // front hub spokes
  [10, 0], [10, 2], [10, 4], [10, 1], [10, 6], [10, 8],
  // back hub spokes
  [11, 0], [11, 3], [11, 5], [11, 1], [11, 7], [11, 9],
  // equatorial pairs (front↔back)
  [2, 3], [4, 5], [6, 7], [8, 9],
];

interface HexFrame {
  nodes: [number, number, number][];
  edges: [number, number][];
}

function computeHexFrame(rotY: number, rotX: number): HexFrame {
  const cy = Math.cos(rotY), sy = Math.sin(rotY);
  const cx = Math.cos(rotX), sx = Math.sin(rotX);
  const nodes = CUBOCTA_VERTS.map(([vx, vy, vz]) => {
    const x1 = vx * cy + vz * sy;
    const z1 = -vx * sy + vz * cy;
    const y2 = vy * cx - z1 * sx;
    const z2 = vy * sx + z1 * cx;
    return [CX + x1 * 3.6, CY - y2 * 3.6, z2] as [number, number, number];
  });
  return { nodes, edges: CUBOCTA_EDGES };
}

// ─── Easing ────────────────────────────────────────────────────────────────

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutBack(t: number) {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

// ─── Face computation ──────────────────────────────────────────────────────

interface FaceData {
  pts: [number, number, number][];
  avgZ: number;
}

function computeFaces(rotY: number, rotX: number, explode: number): FaceData[] {
  const cy = Math.cos(rotY), sy = Math.sin(rotY);
  const cx = Math.cos(rotX), sx = Math.sin(rotX);
  return FACES.map(({ vi, n }) => {
    const pts = vi.map((i) => {
      const [bx, by, bz] = V[i];
      const x = bx + n[0] * explode * EXPLODE_DIST;
      const y = by + n[1] * explode * EXPLODE_DIST;
      const z = bz + n[2] * explode * EXPLODE_DIST;
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      return [CX + x1 * 3.6, CY - y2 * 3.6, z2] as [number, number, number];
    });
    const avgZ = pts.reduce((s, p) => s + p[2], 0) / pts.length;
    return { pts, avgZ };
  });
}

// ─── Animation phase configs ───────────────────────────────────────────────

// Phase 0: flat 2D spin — 1800ms
// Phase 1: 3D tumble — 1800ms
// Phase 2: 3D explode/hold/smash — 2100ms
// Phase 3: 2D pizza wave — 2400ms
// Phase 4: cube → cuboctahedron crossfade with rotation — 2400ms
const PHASE_DURATIONS = [1800, 1800, 2100, 2400, 2400];

function computePhase(phase: number, ms: number) {
  let rotY = ISO_Y;
  let rotX = ISO_X;
  let spin2d = 0;
  let explode = 0;

  if (phase === 0) {
    spin2d = easeInOutCubic(ms / 1800) * Math.PI * 2;
  } else if (phase === 1) {
    const p = easeInOutCubic(ms / 1800);
    rotY = ISO_Y + p * Math.PI * 2;
    rotX = ISO_X + Math.sin(p * Math.PI * 2) * 0.4;
  } else if (phase === 2) {
    if (ms < 900) {
      explode = easeOutCubic(ms / 900);
    } else if (ms < 1200) {
      explode = 1;
    } else {
      const p = (ms - 1200) / 900;
      explode = Math.max(0, 1 - easeOutBack(p));
    }
  }
  // Phase 3 (pizza) handled separately — it renders 6 triangles, not cube faces
  // Phase 4 (cuboctahedron morph) handled separately in tick

  const faceData = computeFaces(rotY, rotX, explode);

  if (spin2d !== 0) {
    const cs = Math.cos(spin2d), ss = Math.sin(spin2d);
    for (const face of faceData) {
      for (const pt of face.pts) {
        const dx = pt[0] - CX, dy = pt[1] - CY;
        pt[0] = CX + dx * cs - dy * ss;
        pt[1] = CY + dx * ss + dy * cs;
      }
    }
  }

  return { faces: faceData, explode };
}

// Compute per-slice pizza offset amounts
function computePizzaSlices(ms: number): number[] {
  const amounts = new Array(6).fill(0);
  const STAGGER = 150;
  const SLIDE_DUR = 350;
  const HOLD_START = 6 * STAGGER + SLIDE_DUR; // ~1250ms
  const HOLD_END = HOLD_START + 250;           // ~1500ms

  for (let i = 0; i < 6; i++) {
    const start = i * STAGGER;
    if (ms < HOLD_START) {
      const localT = Math.max(0, Math.min(1, (ms - start) / SLIDE_DUR));
      amounts[i] = easeOutCubic(localT);
    } else if (ms < HOLD_END) {
      amounts[i] = 1;
    } else {
      const p = (ms - HOLD_END) / (2400 - HOLD_END);
      amounts[i] = Math.max(0, 1 - easeOutBack(p));
    }
  }
  return amounts;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface AnimatedHabosIconProps {
  className?: string;
  isHovered: boolean;
}

export const AnimatedHabosIcon: React.FC<AnimatedHabosIconProps> = ({ className, isHovered }) => {
  const [faces, setFaces] = useState<FaceData[]>(() => computeFaces(ISO_Y, ISO_X, 0));
  const [explodeAmt, setExplodeAmt] = useState(0);
  const [breatheT, setBreatheT] = useState(0);
  const [pizzaSlices, setPizzaSlices] = useState<number[]>([]);
  const [hexFrame, setHexFrame] = useState<HexFrame | null>(null);
  const [hexFade, setHexFade] = useState(0); // 0 = cube visible, 1 = cuboctahedron visible
  const [activePhase, setActivePhase] = useState(-1);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const lastPhaseRef = useRef(-1);
  const animatingRef = useRef(false);

  const pickPhase = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * 5);
    } while (next === lastPhaseRef.current && lastPhaseRef.current !== -1);
    lastPhaseRef.current = next;
    return next;
  }, []);

  const prevHoveredRef = useRef(false);
  const pendingRef = useRef(false);

  const startAnimation = useCallback(() => {
    const phase = pickPhase();
    setActivePhase(phase);
    animatingRef.current = true;
    startRef.current = performance.now();

    const duration = PHASE_DURATIONS[phase];

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const ms = Math.min(elapsed, duration);

      if (phase === 3) {
        setPizzaSlices(computePizzaSlices(ms));
      } else if (phase === 4) {
        // Crossfade cube → cuboctahedron, rotate 180°, crossfade back
        // 0–400ms: fade cube out, cuboctahedron in
        // 400–2000ms: cuboctahedron rotates
        // 2000–2400ms: fade cuboctahedron out, cube back in
        let fade: number;
        if (ms < 400) {
          fade = easeInOutCubic(ms / 400);
        } else if (ms < 2000) {
          fade = 1;
        } else {
          fade = 1 - easeInOutCubic((ms - 2000) / 400);
        }
        setHexFade(fade);
        // Smooth 180° Y rotation over full duration
        const p = easeInOutCubic(ms / 2400);
        const rotY = ISO_Y + p * Math.PI;
        setHexFrame(computeHexFrame(rotY, ISO_X));
        // Also update cube faces with matching rotation so crossfade blends
        setFaces(computeFaces(rotY, ISO_X, 0));
      } else {
        const { faces: faceData, explode } = computePhase(phase, ms);
        setFaces(faceData);
        setExplodeAmt(explode);
        setBreatheT(now);
      }

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setFaces(computeFaces(ISO_Y, ISO_X, 0));
        setExplodeAmt(0);
        setPizzaSlices([]);
        setHexFrame(null);
        setHexFade(0);
        setActivePhase(-1);
        animatingRef.current = false;
        // If a hover happened while we were animating, play it now
        if (pendingRef.current) {
          pendingRef.current = false;
          startAnimation();
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [pickPhase]);

  useEffect(() => {
    // Only trigger on hover-in (false → true)
    const hoverIn = isHovered && !prevHoveredRef.current;
    prevHoveredRef.current = isHovered;

    if (hoverIn) {
      if (animatingRef.current) {
        pendingRef.current = true; // queue it for when current animation finishes
      } else {
        startAnimation();
      }
    }
  }, [isHovered, startAnimation]);

  useEffect(() => {
    return () => { cancelAnimationFrame(rafRef.current); };
  }, []);

  // ─── Pizza render (6 triangular slices) ────────────────────────────────
  if (activePhase === 3 && pizzaSlices.length > 0) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {HEX_VERTS.map((v1, i) => {
          const v2 = HEX_VERTS[(i + 1) % 6];
          const amt = pizzaSlices[i] || 0;
          const dir = SLICE_DIRS[i];
          const tx = dir[0] * amt * PIZZA_DIST;
          const ty = dir[1] * amt * PIZZA_DIST;

          // Entire triangle moves — tip detaches from center
          const tipX = CX + tx, tipY = CY + ty;
          const ox1 = v1[0] + tx, oy1 = v1[1] + ty;
          const ox2 = v2[0] + tx, oy2 = v2[1] + ty;

          return (
            <g key={i}>
              {/* Radial edges — from moving tip to moving outer nodes */}
              <line x1={tipX} y1={tipY} x2={ox1} y2={oy1}
                stroke={COLOR} strokeWidth={STROKE_W} strokeLinecap="round" opacity={0.7} />
              <line x1={tipX} y1={tipY} x2={ox2} y2={oy2}
                stroke={COLOR} strokeWidth={STROKE_W} strokeLinecap="round" opacity={0.7} />
              {/* Outer edge */}
              <line x1={ox1} y1={oy1} x2={ox2} y2={oy2}
                stroke={COLOR} strokeWidth={STROKE_W} strokeLinecap="round" opacity={0.85} />
              {/* Two outer dots (no dot at tip) */}
              <circle cx={ox1} cy={oy1} r={NODE_PX} fill={COLOR} />
              <circle cx={ox2} cy={oy2} r={NODE_PX} fill={COLOR} />
            </g>
          );
        })}
        {/* Center dot — stays put */}
        <circle cx={CX} cy={CY} r={NODE_PX * 1.1} fill={COLOR} />
      </svg>
    );
  }

  // ─── 3D cube render (phases 0–2, static, and crossfade during phase 4) ──
  const allZ = faces.flatMap((f) => f.pts.map((p) => p[2]));
  const zMin = Math.min(...allZ);
  const zMax = Math.max(...allZ);
  const zRange = zMax - zMin || 1;

  const sorted = [...faces.entries()].sort(([ai, a], [bi, b]) =>
    explodeAmt > 0.05 ? ai - bi : a.avgZ - b.avgZ,
  );

  // Cuboctahedron layer data (for crossfade during phase 4)
  const showHex = hexFade > 0.01 && hexFrame;
  let hZMin = 0, hZMax = 1, hZRange = 1;
  if (showHex && hexFrame) {
    const hAllZ = hexFrame.nodes.map(n => n[2]);
    hZMin = Math.min(...hAllZ);
    hZMax = Math.max(...hAllZ);
    hZRange = hZMax - hZMin || 1;
  }

  const cubeOpacity = 1 - hexFade;

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Cube wireframe layer */}
      {cubeOpacity > 0.01 && (
        <g opacity={cubeOpacity}>
          {sorted.map(([fi, face]) => {
            const { pts } = face;
            const faceDepth = (face.avgZ - zMin) / zRange;

            const backFade = explodeAmt > 0.05
              ? Math.max(0, Math.min(1, (faceDepth - 0.3) / 0.4))
              : 1;
            const fadeMultiplier = 1 - explodeAmt * (1 - backFade);

            if (fadeMultiplier < 0.02) return null;

            return (
              <g key={fi} opacity={fadeMultiplier}>
                {explodeAmt > 0.05 && (
                  <polygon
                    points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')}
                    fill={FACE_FILL}
                    opacity={0.12 + explodeAmt * 0.15}
                    stroke={COLOR}
                    strokeWidth={STROKE_W * 0.5}
                    strokeLinejoin="round"
                    strokeOpacity={explodeAmt * 0.4}
                  />
                )}

                {[0, 1, 2, 3].map((ei) => {
                  const a = pts[ei];
                  const b = pts[(ei + 1) % 4];
                  return (
                    <line
                      key={ei}
                      x1={a[0]} y1={a[1]}
                      x2={b[0]} y2={b[1]}
                      stroke={COLOR}
                      strokeWidth={STROKE_W}
                      strokeLinecap="round"
                      opacity={0.35 + faceDepth * 0.65}
                    />
                  );
                })}

                {pts.map((p, ni) => {
                  const nDepth = (p[2] - zMin) / zRange;
                  const breathe = animatingRef.current
                    ? Math.sin(breatheT / 700 + fi * 1.1 + ni * 0.8) * 0.1
                    : 0;
                  return (
                    <circle
                      key={ni}
                      cx={p[0]}
                      cy={p[1]}
                      r={NODE_PX * (0.9 + nDepth * 0.2 + breathe)}
                      fill={COLOR}
                      opacity={0.4 + nDepth * 0.6}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      )}

      {/* Cuboctahedron wireframe layer (crossfade during phase 4) */}
      {showHex && hexFrame && (
        <g opacity={hexFade}>
          {[...hexFrame.edges]
            .map(([a, b]) => ({ a, b, z: (hexFrame.nodes[a][2] + hexFrame.nodes[b][2]) / 2 }))
            .sort((a, b) => a.z - b.z)
            .map(({ a, b, z }, i) => {
              const depth = (z - hZMin) / hZRange;
              return (
                <line
                  key={i}
                  x1={hexFrame.nodes[a][0]} y1={hexFrame.nodes[a][1]}
                  x2={hexFrame.nodes[b][0]} y2={hexFrame.nodes[b][1]}
                  stroke={COLOR}
                  strokeWidth={STROKE_W}
                  strokeLinecap="round"
                  opacity={0.3 + depth * 0.7}
                />
              );
            })}
          {[...hexFrame.nodes.entries()]
            .sort(([, a], [, b]) => a[2] - b[2])
            .map(([ni, n]) => {
              const depth = (n[2] - hZMin) / hZRange;
              return (
                <circle
                  key={ni}
                  cx={n[0]}
                  cy={n[1]}
                  r={NODE_PX * (0.85 + depth * 0.3)}
                  fill={COLOR}
                  opacity={0.35 + depth * 0.65}
                />
              );
            })}
        </g>
      )}
    </svg>
  );
};
