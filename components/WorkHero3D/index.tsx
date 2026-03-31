import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { AnimationScene } from './AnimationScene';
import { TRI_LABELS } from './geometry';
import { screenToSphere, arcballDelta } from './arcball';
import { FEATURE_MAP } from './featureData';

export type AnimPhase = 'dot' | 'split' | 'cube' | 'hex-morph' | 'idle';

// ─── Card component ───
const Card: React.FC<{ title: string; subtitle?: string; body: string; className?: string; visual?: React.ReactNode }> = ({ title, subtitle, body, className = '', visual }) => (
  <div className={`bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/60 pointer-events-auto ${className}`}>
    <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-2">{title}</div>
    {subtitle && <div className="text-slate-700 text-sm font-medium mb-1">{subtitle}</div>}
    <div className="text-slate-500 text-xs leading-relaxed">{body}</div>
    {visual}
  </div>
);

// ─── Geometry: Sutherland-Hodgman clipping + SVG rounded polygon paths ───

interface Pt { x: number; y: number }

// Inset bounding area — panels don't fill to viewport edges
const PANEL_INSET = 0.08;
const BOUNDING_RECT: Pt[] = [
  { x: PANEL_INSET, y: PANEL_INSET },
  { x: 1 - PANEL_INSET, y: PANEL_INSET },
  { x: 1 - PANEL_INSET, y: 1 - PANEL_INSET },
  { x: PANEL_INSET, y: 1 - PANEL_INSET },
];
const MAX_PANELS = 4; // 3 for triangles, 4 for quads
const PANEL_GAP = 0.08; // gap between triangle edge and panel shapes

/** Sutherland-Hodgman single-edge clip. Keeps the half-plane where dot(p-linePoint, normal) >= 0. */
function clipPolygonByLine(polygon: Pt[], linePoint: Pt, normal: Pt): Pt[] {
  if (polygon.length === 0) return [];
  const out: Pt[] = [];
  const dot = (p: Pt) => (p.x - linePoint.x) * normal.x + (p.y - linePoint.y) * normal.y;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    const dA = dot(a), dB = dot(b);
    if (dA >= 0) out.push(a);
    if ((dA >= 0) !== (dB >= 0)) {
      const t = dA / (dA - dB);
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
    }
  }
  return out;
}

/** Score edges by outward normal direction, return [primaryEdgeIdx, secondaryEdgeIdx, ...] */
function assignEdgeRoles(edgeNormals: Pt[]): number[] {
  const N = edgeNormals.length;
  const indices = Array.from({ length: N }, (_, i) => i);
  indices.sort((a, b) => Math.abs(edgeNormals[b].x) - Math.abs(edgeNormals[a].x));
  const primaryIdx = indices[0];
  const pn = edgeNormals[primaryIdx];
  const rest = indices.slice(1);
  rest.sort((a, b) => {
    const dA = edgeNormals[a].x * pn.x + edgeNormals[a].y * pn.y;
    const dB = edgeNormals[b].x * pn.x + edgeNormals[b].y * pn.y;
    return dA - dB;
  });
  return [primaryIdx, ...rest];
}

/** Compute one panel region per edge — clipped to the bounding rect, offset from the face. */
function computePanelRegions(vertices: Pt[]): Pt[][] {
  const N = vertices.length;
  const cx = vertices.reduce((s, v) => s + v.x, 0) / N;
  const cy = vertices.reduce((s, v) => s + v.y, 0) / N;

  // Compute edge lines offset outward by PANEL_GAP
  const edges: { point: Pt; normal: Pt }[] = [];
  for (let i = 0; i < N; i++) {
    const a = vertices[i], b = vertices[(i + 1) % N];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    let nx = -dy / len, ny = dx / len;
    if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
    edges.push({
      point: { x: mx + nx * PANEL_GAP, y: my + ny * PANEL_GAP },
      normal: { x: nx, y: ny },
    });
  }

  const regions: Pt[][] = [];
  for (let i = 0; i < N; i++) {
    let poly: Pt[] = [...BOUNDING_RECT];
    // Keep outward half-plane of this edge
    poly = clipPolygonByLine(poly, edges[i].point, edges[i].normal);
    // Clip to inward half-plane of adjacent edges (prevents overlap)
    const prev = edges[(i - 1 + N) % N];
    poly = clipPolygonByLine(poly, prev.point, { x: -prev.normal.x, y: -prev.normal.y });
    const next = edges[(i + 1) % N];
    poly = clipPolygonByLine(poly, next.point, { x: -next.normal.x, y: -next.normal.y });
    regions.push(poly);
  }
  return regions;
}

function polygonCentroid(poly: Pt[]): Pt {
  if (poly.length === 0) return { x: 0.5, y: 0.5 };
  return {
    x: poly.reduce((s, p) => s + p.x, 0) / poly.length,
    y: poly.reduce((s, p) => s + p.y, 0) / poly.length,
  };
}

function polygonArea(poly: Pt[]): number {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

/** Generate SVG path for a polygon with rounded corners using arc commands. */
function roundedPolygonPath(vertices: Pt[], radius: number): string {
  // Filter near-duplicate vertices (prevents zero-length edges from clipping)
  const filtered: Pt[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const prev = filtered[filtered.length - 1];
    const v = vertices[i];
    if (!prev || Math.abs(v.x - prev.x) + Math.abs(v.y - prev.y) > 0.01) {
      filtered.push(v);
    }
  }
  const N = filtered.length;
  if (N < 3) return '';

  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const prev = filtered[(i - 1 + N) % N];
    const curr = filtered[i];
    const next = filtered[(i + 1) % N];

    const dx1 = prev.x - curr.x, dy1 = prev.y - curr.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

    // Clamp radius to avoid overlapping on short edges
    const r = Math.min(radius, len1 / 3, len2 / 3);

    // Points inset from the corner along each edge
    const ax = curr.x + (dx1 / len1) * r;
    const ay = curr.y + (dy1 / len1) * r;
    const bx = curr.x + (dx2 / len2) * r;
    const by = curr.y + (dy2 / len2) * r;

    // Per-corner sweep: use cross product of incoming × outgoing edge
    const cross = (curr.x - prev.x) * (next.y - curr.y) - (curr.y - prev.y) * (next.x - curr.x);
    const sweep = cross > 0 ? 1 : 0;

    if (i === 0) {
      parts.push(`M ${ax.toFixed(2)} ${ay.toFixed(2)}`);
    } else {
      parts.push(`L ${ax.toFixed(2)} ${ay.toFixed(2)}`);
    }
    parts.push(`A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sweep} ${bx.toFixed(2)} ${by.toFixed(2)}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

// ─── Per-face panels — SVG shapes with rounded corners, split by vertex lines ───

const FocusPanels: React.FC<{
  facePointsRef: React.MutableRefObject<{x: number; y: number}[] | null>;
  label: string;
  faceIdx: number;
  interactive: boolean;
}> = ({ facePointsRef, label }) => {
  const feat = FEATURE_MAP[label];
  const pathRefs = useRef<(SVGPathElement | null)[]>(Array(MAX_PANELS).fill(null));
  const textRefs = useRef<(HTMLDivElement | null)[]>(Array(MAX_PANELS).fill(null));

  useEffect(() => {
    let rafId: number;
    const update = () => {
      const pts = facePointsRef.current;
      if (pts && pts.length >= 3) {
        const op: Pt[] = pts.map(p => ({
          x: (p.x + 0.35) / 1.7,
          y: (p.y + 0.10) / 1.2,
        }));
        const N = op.length;

        const regions = computePanelRegions(op);

        // Compute edge normals to assign content roles
        const cx = op.reduce((s, p) => s + p.x, 0) / N;
        const cy = op.reduce((s, p) => s + p.y, 0) / N;
        const edgeNormals: Pt[] = [];
        for (let i = 0; i < N; i++) {
          const a = op[i], b = op[(i + 1) % N];
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          let nx = -dy / len, ny = dx / len;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
          edgeNormals.push({ x: nx, y: ny });
        }
        // roleMap[panelIdx] = edgeIdx
        const roleMap = assignEdgeRoles(edgeNormals);

        for (let panelIdx = 0; panelIdx < MAX_PANELS; panelIdx++) {
          const path = pathRefs.current[panelIdx];
          const text = textRefs.current[panelIdx];
          if (!path) continue;

          if (panelIdx >= N) {
            path.setAttribute('d', '');
            if (text) text.style.display = 'none';
            continue;
          }

          const edgeIdx = roleMap[panelIdx];
          const region = regions[edgeIdx];
          if (!region || region.length < 3 || polygonArea(region) < 0.002) {
            path.setAttribute('d', '');
            if (text) text.style.display = 'none';
            continue;
          }

          // Draw SVG shape — scale to viewBox 170×120 to match overlay aspect ratio (1.7:1.2)
          const scaled = region.map(p => ({ x: p.x * 170, y: p.y * 120 }));
          path.setAttribute('d', roundedPolygonPath(scaled, 4));

          // Position text at centroid (guaranteed inside convex polygon), centered
          if (text) {
            text.style.display = '';
            const c = polygonCentroid(region);
            text.style.left = `${(c.x * 100).toFixed(2)}%`;
            text.style.top = `${(c.y * 100).toFixed(2)}%`;
          }
        }
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [facePointsRef]);

  // Content per panel — each slot accepts any React component.
  // Panel 0 = primary (most horizontal edge), Panel 1 = secondary (opposite), Panel 2 = accent
  const panels: (React.ReactNode | null)[] = [
    // Panel 0: primary — headline + body
    feat ? (
      <div>
        <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-1.5">{label}</div>
        <div className="text-slate-700 text-sm font-medium leading-snug mb-2">{feat.headline}</div>
        <div className="text-slate-500 text-xs leading-relaxed">{feat.body}</div>
      </div>
    ) : (
      <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">{label}</div>
    ),
    // Panel 1: secondary — closing line
    feat ? (
      <div>
        <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-1.5">The difference</div>
        <div className="text-slate-500 text-xs leading-relaxed">{feat.closingLine}</div>
      </div>
    ) : null,
    // Panel 2: accent — can hold any React component (demo, chart, icon, etc.)
    null,
    // Panel 3: (quads only)
    null,
  ];

  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 170 120"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="panelShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="0.3" stdDeviation="0.6" floodOpacity="0.06" />
          </filter>
        </defs>
        {Array.from({ length: MAX_PANELS }, (_, i) => (
          <path
            key={i}
            ref={el => { pathRefs.current[i] = el; }}
            fill="rgba(255,255,255,0.85)"
            stroke="rgba(226,232,240,0.4)"
            strokeWidth="0.12"
            filter="url(#panelShadow)"
          />
        ))}
      </svg>

      {Array.from({ length: MAX_PANELS }, (_, i) => (
        <div
          key={i}
          ref={el => { textRefs.current[i] = el; }}
          className="absolute pointer-events-none overflow-hidden"
          style={{ maxWidth: '20%', transform: 'translate(-50%, -50%)' }}
        >
          {panels[i]}
        </div>
      ))}
    </>
  );
};

interface WorkHero3DProps {
  onPhaseChange?: (phase: AnimPhase) => void;
  onFocusChange?: (label: string | null) => void;
  unfocusRef?: React.MutableRefObject<(() => void) | null>;
  muted?: boolean;
}

export const WorkHero3D: React.FC<WorkHero3DProps> = ({ onPhaseChange, onFocusChange, unfocusRef, muted = true }) => {
  const [introComplete, setIntroComplete] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [focusedTri, setFocusedTri] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragDistRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Arcball: store last sphere point and accumulate drag quaternion
  const lastSpherePoint = useRef(new THREE.Vector3(0, 0, 1));
  const dragDeltaQuat = useRef(new THREE.Quaternion()); // per-frame delta
  const lastVelocityQuat = useRef(new THREE.Quaternion()); // for inertia
  const facePointsRef = useRef<{x: number; y: number}[] | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!introComplete) return;
      isDraggingRef.current = true;
      setDragging(true);
      dragDistRef.current = 0;
      dragDeltaQuat.current.identity();
      lastVelocityQuat.current.identity();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        lastSpherePoint.current = screenToSphere(e.clientX, e.clientY, rect);
      }
    },
    [introComplete],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newPoint = screenToSphere(e.clientX, e.clientY, rect);
      const delta = arcballDelta(lastSpherePoint.current, newPoint);
      dragDeltaQuat.current.copy(delta);
      lastVelocityQuat.current.copy(delta);
      dragDistRef.current += Math.abs(e.movementX) + Math.abs(e.movementY);
      lastSpherePoint.current.copy(newPoint);
    },
    [],
  );

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setDragging(false);
    dragDeltaQuat.current.identity();
  }, []);

  const handleTriClick = useCallback((index: number | null) => {
    if (dragDistRef.current > 8) return;
    // Click same face (or its quad partner) → exit focus
    setFocusedTri(prev => {
      if (prev === null) return index;
      if (index === null) return null;
      // Check if clicking the same face group
      const prevGroup = (prev === 16 || prev === 17) ? 16 : (prev === 18 || prev === 19) ? 18 : prev;
      const clickGroup = (index === 16 || index === 17) ? 16 : (index === 18 || index === 19) ? 18 : index;
      if (prevGroup === clickGroup) return null; // exit focus
      return index;
    });
  }, []);

  const handleSnapToFace = useCallback((index: number) => {
    setFocusedTri(index);
  }, []);

  // Dynamic preview: whichever face is best-facing right now
  const [previewFace, setPreviewFace] = useState<number>(0);
  const handlePreviewFace = useCallback((index: number) => {
    setPreviewFace(index);
  }, []);

  // Scroll wheel out → exit focus
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY > 0) setFocusedTri(null); // scroll down = zoom out = exit
  }, []);

  const isFocusMode = focusedTri !== null;
  const displayLabel = isFocusMode ? (TRI_LABELS[previewFace] || TRI_LABELS[focusedTri!]) : null;

  // Report focus state to parent
  React.useEffect(() => {
    onFocusChange?.(displayLabel);
  }, [displayLabel, onFocusChange]);

  // Expose unfocus function to parent
  React.useEffect(() => {
    if (unfocusRef) unfocusRef.current = () => setFocusedTri(null);
  }, [unfocusRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square overflow-visible"
      style={{
        cursor: introComplete
          ? (dragging ? 'grabbing' : 'grab')
          : 'default',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      {/* Subtle vignette — fades geometry edges into page, no hard boundary */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          inset: '-50% -70%',
          background: 'radial-gradient(ellipse 42% 45% at center, transparent 0%, transparent 50%, rgba(248,249,250,0.08) 65%, rgba(248,249,250,0.25) 80%, rgba(248,249,250,0.6) 100%)',
        }}
      />
      {/* Canvas matches fog size so nothing gets clipped */}
      <div className="absolute" style={{ inset: '-50% -70%' }}>
      <Canvas
        orthographic
        camera={{ zoom: 160, position: [0, 0, 10], near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 10]} intensity={1.2} />
        <directionalLight position={[-3, -2, -8]} intensity={0.3} />
        <Suspense fallback={null}>
          <AnimationScene
            onIntroComplete={() => setIntroComplete(true)}
            isDraggingRef={isDraggingRef}
            dragDistRef={dragDistRef}
            dragDeltaQuat={dragDeltaQuat}
            lastVelocityQuat={lastVelocityQuat}
            focusedTri={focusedTri}
            onTriClick={handleTriClick}
            onSnapToFace={handleSnapToFace}
            onPreviewFace={handlePreviewFace}
            onPhaseChange={onPhaseChange}
            facePointsRef={facePointsRef}
            muted={muted}
          />
        </Suspense>
      </Canvas>
      </div>

      {/* Focus overlay — panels vary per face, fade in/out */}
      {(() => {
        const panelsVisible = isFocusMode && !dragging;
        return (
      <div
        className="absolute pointer-events-none z-20"
        style={{
          inset: '-10% -35%',
          opacity: panelsVisible ? 1 : 0,
          transform: panelsVisible ? 'scale(1)' : 'scale(0.97)',
          transition: panelsVisible
            ? 'opacity 600ms ease-in-out, transform 600ms ease-in-out'
            : 'opacity 150ms ease-out, transform 150ms ease-out',
        }}
      >
        <FocusPanels facePointsRef={facePointsRef} label={displayLabel || ''} faceIdx={previewFace} interactive={isFocusMode} />
      </div>
        );
      })()}
    </div>
  );
};
