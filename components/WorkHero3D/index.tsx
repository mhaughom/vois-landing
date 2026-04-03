import React, { useState, useRef, useCallback, useEffect, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { AnimationScene } from './AnimationScene';
import { TRI_LABELS } from './geometry';
import { screenToSphere, arcballDelta } from './arcball';
import { FEATURE_MAP, FeatureInfo } from './featureData';

export type AnimPhase = 'dot' | 'split' | 'cube' | 'hex-morph' | 'idle';

// ─── Card component ───
const Card: React.FC<{ title: string; subtitle?: string; body: string; className?: string; visual?: React.ReactNode }> = ({ title, subtitle, body, className = '', visual }) => (
  <div className={`bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/70 pointer-events-auto ${className}`}>
    <div className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-2">{title}</div>
    {subtitle && <div className="text-slate-700 text-sm font-medium mb-1">{subtitle}</div>}
    <div className="text-slate-500 text-xs leading-relaxed">{body}</div>
    {visual}
  </div>
);

// ─── Precomputed panel templates — one per face, measured at settled position ───

interface Pt { x: number; y: number }
interface PanelTemplate {
  svgPath: string;       // SVG path with rounded corners (viewBox 170×120)
  centroid: Pt;          // overlay-fraction position for content
  region: Pt[];          // polygon vertices in overlay fractions
  bbox: { left: number; top: number; width: number; height: number }; // axis-aligned bounding box (overlay fractions)
}
interface FaceTemplate {
  panels: PanelTemplate[];  // ordered: [primary, secondary, accent, ...]
}

// ─── Geometry utilities (used only during precomputation) ───

const PANEL_INSET = 0.03;
const BOUNDING_RECT: Pt[] = [
  { x: PANEL_INSET, y: PANEL_INSET },
  { x: 1 - PANEL_INSET, y: PANEL_INSET },
  { x: 1 - PANEL_INSET, y: 1 - PANEL_INSET },
  { x: PANEL_INSET, y: 1 - PANEL_INSET },
];
const PANEL_GAP = 0.012;
const CORNER_RADIUS = 4;

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

function computePanelRegions(vertices: Pt[]): Pt[][] {
  const N = vertices.length;
  const cx = vertices.reduce((s, v) => s + v.x, 0) / N;
  const cy = vertices.reduce((s, v) => s + v.y, 0) / N;

  const regions: Pt[][] = [];
  for (let i = 0; i < N; i++) {
    const nextI = (i + 1) % N;
    const a = vertices[i], b = vertices[nextI];
    let poly: Pt[] = [...BOUNDING_RECT];

    // 1. Clip to outward side of edge i (with gap from the 3D shape)
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const edgeDx = b.x - a.x, edgeDy = b.y - a.y;
    const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy) || 1;
    let enx = -edgeDy / edgeLen, eny = edgeDx / edgeLen;
    if (enx * (mx - cx) + eny * (my - cy) < 0) { enx = -enx; eny = -eny; }
    poly = clipPolygonByLine(poly,
      { x: mx + enx * PANEL_GAP, y: my + eny * PANEL_GAP },
      { x: enx, y: eny },
    );

    // 2. Clip by radial line through vertex i (straight separator between panels)
    const rdx1 = a.x - cx, rdy1 = a.y - cy;
    const rlen1 = Math.sqrt(rdx1 * rdx1 + rdy1 * rdy1) || 1;
    let rnx1 = -rdy1 / rlen1, rny1 = rdx1 / rlen1;
    if (rnx1 * (mx - a.x) + rny1 * (my - a.y) < 0) { rnx1 = -rnx1; rny1 = -rny1; }
    poly = clipPolygonByLine(poly,
      { x: a.x + rnx1 * PANEL_GAP * 0.5, y: a.y + rny1 * PANEL_GAP * 0.5 },
      { x: rnx1, y: rny1 },
    );

    // 3. Clip by radial line through vertex (i+1) (straight separator on the other side)
    const rdx2 = b.x - cx, rdy2 = b.y - cy;
    const rlen2 = Math.sqrt(rdx2 * rdx2 + rdy2 * rdy2) || 1;
    let rnx2 = -rdy2 / rlen2, rny2 = rdx2 / rlen2;
    if (rnx2 * (mx - b.x) + rny2 * (my - b.y) < 0) { rnx2 = -rnx2; rny2 = -rny2; }
    poly = clipPolygonByLine(poly,
      { x: b.x + rnx2 * PANEL_GAP * 0.5, y: b.y + rny2 * PANEL_GAP * 0.5 },
      { x: rnx2, y: rny2 },
    );

    regions.push(poly);
  }
  return regions;
}

function polygonCentroid(poly: Pt[]): Pt {
  if (poly.length === 0) return { x: 0.5, y: 0.5 };
  return { x: poly.reduce((s, p) => s + p.x, 0) / poly.length, y: poly.reduce((s, p) => s + p.y, 0) / poly.length };
}

function polygonArea(poly: Pt[]): number {
  let area = 0;
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; area += a.x * b.y - b.x * a.y; }
  return Math.abs(area) / 2;
}

function roundedPolygonPath(vertices: Pt[], radius: number): string {
  const filtered: Pt[] = [];
  for (const v of vertices) {
    const prev = filtered[filtered.length - 1];
    if (!prev || Math.abs(v.x - prev.x) + Math.abs(v.y - prev.y) > 0.01) filtered.push(v);
  }
  const N = filtered.length;
  if (N < 3) return '';
  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const prev = filtered[(i - 1 + N) % N], curr = filtered[i], next = filtered[(i + 1) % N];
    const dx1 = prev.x - curr.x, dy1 = prev.y - curr.y, len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y, len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
    const r = Math.min(radius, len1 / 3, len2 / 3);
    const ax = curr.x + (dx1 / len1) * r, ay = curr.y + (dy1 / len1) * r;
    const bx = curr.x + (dx2 / len2) * r, by = curr.y + (dy2 / len2) * r;
    // Quadratic bezier through the corner vertex — guaranteed to stay inside the polygon
    parts.push(i === 0 ? `M ${ax.toFixed(2)} ${ay.toFixed(2)}` : `L ${ax.toFixed(2)} ${ay.toFixed(2)}`);
    parts.push(`Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

function assignEdgeRoles(edgeNormals: Pt[]): number[] {
  const N = edgeNormals.length;
  const indices = Array.from({ length: N }, (_, i) => i);
  indices.sort((a, b) => Math.abs(edgeNormals[b].x) - Math.abs(edgeNormals[a].x));
  const primaryIdx = indices[0];
  const pn = edgeNormals[primaryIdx];
  const rest = indices.slice(1);
  rest.sort((a, b) => (edgeNormals[a].x * pn.x + edgeNormals[a].y * pn.y) - (edgeNormals[b].x * pn.x + edgeNormals[b].y * pn.y));
  return [primaryIdx, ...rest];
}

// ─── Precompute all 20 face templates at module load time ───

import { HEX_SPH, HEX_A, HEX_FACE_TRIS } from './geometry';

function precomputeAllTemplates(): FaceTemplate[] {
  // Replicate getHexVerts() at morph=1
  const a = HEX_A;
  const hr = (a * HEX_SPH) / 2;
  const w = (a * HEX_SPH * Math.sqrt(3)) / 2;
  const d = HEX_SPH * Math.sqrt(Math.max(0, 1 - a * a));
  const cd = HEX_SPH;
  const verts = [
    new THREE.Vector3(0, HEX_SPH, 0),
    new THREE.Vector3(0, -HEX_SPH, 0),
    new THREE.Vector3(w, hr, d),
    new THREE.Vector3(w, hr, -d),
    new THREE.Vector3(w, -hr, d),
    new THREE.Vector3(w, -hr, -d),
    new THREE.Vector3(-w, -hr, d),
    new THREE.Vector3(-w, -hr, -d),
    new THREE.Vector3(-w, hr, d),
    new THREE.Vector3(-w, hr, -d),
    new THREE.Vector3(0, 0, cd),
    new THREE.Vector3(0, 0, -cd),
  ];

  // Canvas inset: -50% -70% → scale factors for NDC→container
  // Canvas width = 2.4 × container, height = 2.0 × container
  const SX = 1.2; // (2.4 / 2)
  const SY = 1.0; // (2.0 / 2)

  // Overlay: inset -10% -35% → container→overlay conversion
  const OX_OFF = 0.35, OX_SCALE = 1.7;
  const OY_OFF = 0.10, OY_SCALE = 1.2;

  // For orthographic camera: NDC = worldXY * zoom / (canvasPixels/2)
  // Since canvas fills 2.4W × 2.0W pixels (W = container px), and zoom = 220 (focused):
  // ndcX = worldX * 220 / (2.4W / 2) = worldX * 220 / (1.2W)
  // But W cancels when we convert NDC→container fraction:
  // containerFracX = SX * ndcX + 0.5 = SX * worldX * zoom / (SX * W) + 0.5
  // Actually for orthographic: ndcX = worldX * 2 * zoom / canvasWidth_in_css_pixels
  // This depends on actual pixel size. But since the container is aspect-square and
  // we use percentage-based layout, I can compute a "virtual" projection.
  //
  // Key insight: at zoom=220, the orthographic camera's half-width = canvasWidth/(2*zoom).
  // canvasWidth = 2.4 * containerWidth. So half-width = 2.4*containerWidth/(2*220) = 2.4/(440) * containerWidth.
  // ndcX = worldX / halfWidth = worldX * 440 / (2.4 * containerWidth).
  // containerFracX = SX * ndcX + 0.5 = 1.2 * worldX * 440 / (2.4 * containerWidth) + 0.5
  //                = worldX * 220 / containerWidth + 0.5
  //
  // But containerWidth in "world units" via zoom: if the camera sees ±(canvasWidth/(2*zoom)) world units,
  // and canvasWidth = 2.4 * containerWidth_pixels:
  // In NDC, worldX maps to: ndcX = worldX * zoom * 2 / canvasWidth_css
  //
  // Since we need container-fraction (not pixels), and the canvas is 2.4× container:
  // ndcX = worldX * 2 * zoom / (2.4 * containerPx)
  // containerFracX = (ndcX + 1) / 2 * 2.4 - 0.7 = 1.2 * ndcX + 0.5
  //
  // The NDC depends on containerPx which we don't know. BUT: for precomputation we just
  // need the RELATIVE positions. The aspect-square container means containerPx is the same
  // for width and height. So we can pick any value.
  //
  // Let's use containerPx = 1 (unit container). Then:
  // ndcX = worldX * 2 * 220 / 2.4 = worldX * 183.33
  // ndcY = worldY * 2 * 220 / 2.0 = worldY * 220
  //
  // containerFracX = 1.2 * worldX * 183.33 + 0.5 = worldX * 220 + 0.5
  // containerFracY = 0.5 - 1.0 * worldY * 220 = 0.5 - worldY * 220
  //
  // That can't be right — the world coordinates are ~2.3 which would give 500+.
  // The issue is that containerPx = 1 is too small. The zoom relates to pixel space.
  //
  // BETTER APPROACH: Use the same trick as AnimationScene — compute the target quaternion,
  // apply to vertices, then use camera.project(). But we don't have a camera object.
  //
  // SIMPLEST: just measure empirically by reading facePointsRef after settling.
  // But we're precomputing...
  //
  // PRACTICAL APPROACH: The orthographic projection at zoom Z of a point (wx, wy, wz):
  // ndcX = wx / (halfWidth), ndcY = wy / (halfHeight)
  // halfWidth = canvasWidth / (2 * Z), halfHeight = canvasHeight / (2 * Z)
  // With canvas fitting the CSS element (which is 2.4W × 2.0W for container width W):
  //
  // For a unit container (W=1): canvasCSS = 2.4 × 2.0
  // But devicePixelRatio affects actual pixels... this is getting circular.
  //
  // Let me just use: for orthographic camera, the projection of (wx,wy) to NDC is
  // proportional to wx and wy, scaled by zoom and canvas aspect. Since all faces are
  // roughly the same size (~2.3 world units across), and the container is ~42rem max,
  // the NDC→container mapping should be consistent.
  //
  // I'll use the formula that AnimationScene SHOULD be using (corrected for canvas inset):
  // containerFracX = SX * ndcX + 0.5
  // containerFracY = 0.5 - SY * ndcY
  //
  // And I'll calibrate: at zoom=220, a world point at (0,0) projects to container center (0.5, 0.5). ✓
  // A point at world (1,0) projects to ndcX = 1 * zoom / halfWidthPx... nope, still need pixel size.
  //
  // OK — truly simplest: just use a fixed scale factor derived from the geometry size
  // and typical container. The cuboctahedron radius is ~2.285. At zoom 220, with
  // canvas = 2.4W, the NDC range covered by the shape is:
  // ndcX_range ≈ 2 * 2.285 * 220 / (2.4 * W * DPR)
  //
  // This depends on W and DPR. I can't precompute exact pixel positions.
  //
  // FINAL APPROACH: precompute in NORMALIZED WORLD space (apply quaternion, take X,Y),
  // then at runtime, project once when settled to get the actual scale factor,
  // and apply it to the precomputed templates.

  // For now: precompute the RELATIVE vertex positions (quaternion-rotated X,Y),
  // then normalize them to overlay fractions at runtime using a single scale+offset.

  const templates: FaceTemplate[] = [];

  for (let faceIdx = 0; faceIdx < HEX_FACE_TRIS.length; faceIdx++) {
    // Skip second triangle of quad pairs (17, 19) — handled by 16, 18
    const isQuad = faceIdx === 16 || faceIdx === 18;
    const isSkipped = faceIdx === 17 || faceIdx === 19;
    if (isSkipped) { templates.push({ panels: [] }); continue; }

    // Get vertex indices for this face
    const vertIdxs = isQuad
      ? [...new Set([...HEX_FACE_TRIS[faceIdx], ...HEX_FACE_TRIS[faceIdx + 1]])]
      : [...HEX_FACE_TRIS[faceIdx]];

    // Compute target quaternion: rotates face normal to (0,0,1)
    const [ai, bi, ci] = HEX_FACE_TRIS[faceIdx];
    const va = verts[ai], vb = verts[bi], vc = verts[ci];
    const centroid3 = new THREE.Vector3(
      (va.x + vb.x + vc.x) / 3, (va.y + vb.y + vc.y) / 3, (va.z + vb.z + vc.z) / 3,
    );
    const e1 = new THREE.Vector3().subVectors(vb, va);
    const e2 = new THREE.Vector3().subVectors(vc, va);
    const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();
    if (normal.dot(centroid3) < 0) normal.negate();
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));

    // Apply quaternion to vertices → get settled world-space positions
    const worldPts = vertIdxs.map(vi => verts[vi].clone().applyQuaternion(targetQuat));

    // For quads, sort by angle around centroid for proper polygon winding
    if (worldPts.length > 3) {
      const pcx = worldPts.reduce((s, p) => s + p.x, 0) / worldPts.length;
      const pcy = worldPts.reduce((s, p) => s + p.y, 0) / worldPts.length;
      worldPts.sort((a, b) => Math.atan2(a.y - pcy, a.x - pcx) - Math.atan2(b.y - pcy, b.x - pcx));
    }

    // Store normalized world XY (will be projected at runtime)
    templates.push({
      panels: [], // filled at runtime
      _worldPts: worldPts.map(p => ({ x: p.x, y: p.y })),
    } as any);
  }

  return templates;
}

const RAW_TEMPLATES = precomputeAllTemplates();

/**
 * Project precomputed world points to overlay fractions using live facePointsRef
 * as calibration (one-shot measurement when face settles).
 */
function buildTemplateFromRef(
  faceIdx: number,
  facePoints: { x: number; y: number }[],
): FaceTemplate | null {
  // Convert container fractions → overlay fractions
  const op: Pt[] = facePoints.map(p => ({
    x: (p.x + 0.35) / 1.7,
    y: (p.y + 0.10) / 1.2,
  }));
  const N = op.length;
  if (N < 3) return null;

  const regions = computePanelRegions(op);

  // Assign roles
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
  const roleMap = assignEdgeRoles(edgeNormals);

  const panels: PanelTemplate[] = [];
  for (let panelIdx = 0; panelIdx < N; panelIdx++) {
    const edgeIdx = roleMap[panelIdx];
    const region = regions[edgeIdx];
    if (!region || region.length < 3 || polygonArea(region) < 0.002) {
      panels.push({ svgPath: '', centroid: { x: 0.5, y: 0.5 }, region: [], bbox: { left: 0, top: 0, width: 0, height: 0 } });
      continue;
    }
    const scaled = region.map(p => ({ x: p.x * 170, y: p.y * 120 }));
    // Compute axis-aligned bounding box of the polygon region
    const xs = region.map(p => p.x);
    const ys = region.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    // Inset the bbox slightly so text doesn't touch the rounded corners
    const bboxPad = 0.02;
    panels.push({
      svgPath: roundedPolygonPath(scaled, CORNER_RADIUS),
      centroid: polygonCentroid(region),
      region,
      bbox: { left: minX + bboxPad, top: minY + bboxPad, width: maxX - minX - bboxPad * 2, height: maxY - minY - bboxPad * 2 },
    });
  }

  return { panels };
}

// ─── Rich panel content per feature ───

// Helper: big stat block
const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-blue-500 leading-none">{value}</div>
    <div className="text-slate-400 text-[12px] mt-1 leading-tight">{label}</div>
  </div>
);

// Helper: italic quote — short, punchy
const Quote: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center">
    <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;{text}&rdquo;</div>
  </div>
);

// Helper: body text — main description
const Body: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center">
    <div className="text-slate-500 text-[15px] leading-relaxed">{text}</div>
  </div>
);

// Helper: labeled section
const LabeledText: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div className="text-center">
    <div className="text-[11px] text-blue-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
    <div className="text-slate-500 text-[14px] leading-relaxed">{text}</div>
  </div>
);

// Helper: tiny label — for very small triangle panels
const Tiny: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center">
    <div className="text-slate-400 text-[12px] font-medium leading-tight">{text}</div>
  </div>
);

function getRichPanelContents(label: string, feat: FeatureInfo | undefined): (React.ReactNode | null)[] {
  if (!feat) return [null, null, null, null];

  switch (label) {

    // ── Your Assistant ── P0=left wide rect, P1=right trapezoid, P2=bottom-right
    case 'Your Assistant':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Total awareness</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">It already knows<br />your business.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Learns your processes, preferences, and history. Anticipates what you need before you ask.</div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {['Emails', 'Meetings', 'Projects', 'CRM', 'Docs', 'Voice'].map(s => (
              <div key={s} className="bg-slate-50 rounded px-1.5 py-1 text-[11px] text-slate-500 font-medium text-center">{s}</div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">19</div>
          <div className="text-slate-600 text-[14px] font-semibold">data sources</div>
          <div className="text-slate-400 text-[12px]">searched in parallel</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Voice, email, CRM,<br />docs, chat, projects,<br />and <span className="font-semibold text-slate-700">13 more</span>.</div>
        </div>,
        <div key="a" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Other assistants need instructions.<br />VOIS already knows.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Your Super-Assistant ── P0=right narrow tall, P1=bottom-left, P2=top wide rect
    case 'Your Super-Assistant':
      return [
        <div key="p" className="text-center space-y-2.5 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Inputs</div>
          <div className="text-slate-500 text-[13px] leading-relaxed">
            <span className="font-semibold text-slate-600">Voice</span> &mdash; speak naturally<br />
            <span className="font-semibold text-slate-600">Watch</span> &mdash; tap your wrist<br />
            <span className="font-semibold text-slate-600">Email</span> &mdash; forward it<br />
            <span className="font-semibold text-slate-600">Chat</span> &mdash; type or text<br />
            <span className="font-semibold text-slate-600">Slack</span> &mdash; command it
          </div>
        </div>,
        <div key="s" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;One brain.<br />Every interface.&rdquo;</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Every surface, one brain</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Speak, type, tap, forward.<br />It all lands in one place.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Every input is routed, prioritized, and remembered — no matter which device you used.</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {['Watch', 'Phone', 'Desktop', 'Inbox'].map(s => (
              <div key={s} className="bg-blue-50 rounded-full px-2 py-0.5 text-[11px] text-blue-500 font-semibold">{s}</div>
            ))}
          </div>
        </div>,
        null,
      ];

    // ── Your Day ── P0=left wide rect, P1=bottom-right, P2=right upper rect
    case 'Your Day':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Morning brief</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Your day, planned<br />before you wake up.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">VOIS reviews tasks, calendar, and deadlines overnight. You wake to a proposed schedule.</div>
          <div className="space-y-1 mt-2 text-left">
            {[
              ['8:00', 'Deep work — Q3 proposal'],
              ['10:00', 'Client call — Henderson'],
              ['11:30', 'Review — sprint items'],
            ].map(([time, task]) => (
              <div key={time} className="flex items-center gap-2">
                <div className="text-[12px] font-mono text-blue-500 w-8 shrink-0">{time}</div>
                <div className="text-[12px] text-slate-500">{task}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">7 AM</div>
          <div className="text-slate-600 text-[14px] font-semibold">your plan is ready</div>
          <div className="text-slate-400 text-[12px]">built while you slept</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Time blocks, prep notes,<br />and flagged priorities.<br /><span className="font-semibold text-slate-700">Zero decisions needed</span>.</div>
        </div>,
        <div key="a" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Your day should start with a plan, not decisions.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Meetings ── P0=right wide rect, P1=bottom-left, P2=left upper rect
    case 'Meetings':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">The full cycle</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Prepared. Transcribed.<br />Acted on.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">
            <span className="font-semibold text-slate-600">Before</span> &mdash; personalized briefing<br />
            <span className="font-semibold text-slate-600">During</span> &mdash; live transcription<br />
            <span className="font-semibold text-slate-600">After</span> &mdash; action items routed
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Prep</div>
              <div className="text-[10px] text-slate-400">auto-brief</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Capture</div>
              <div className="text-[10px] text-slate-400">transcribe</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Act</div>
              <div className="text-[10px] text-slate-400">route tasks</div>
            </div>
          </div>
        </div>,
        <div key="s" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Other tools transcribe.<br />VOIS prepares, captures,<br />and acts.&rdquo;</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">0</div>
          <div className="text-slate-600 text-[14px] font-semibold">manual follow-ups</div>
          <div className="text-slate-400 text-[12px]">actions auto-routed to projects</div>
        </div>,
        null,
      ];

    // ── Projects ── P0=left narrow tall, P1=bottom wide rect, P2=right upper wide rect
    case 'Projects':
      return [
        <div key="p" className="text-center space-y-2.5 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Health</div>
          <div className="space-y-1.5">
            {[
              ['On track', 'bg-emerald-400', '82%'],
              ['At risk', 'bg-amber-400', '14%'],
              ['Stalled', 'bg-red-400', '4%'],
            ].map(([label, color, pct]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                <div className="text-[11px] text-slate-500 w-10">{label}</div>
                <div className="text-[11px] font-semibold text-slate-700">{pct}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Proactive, not reactive</div>
          <div className="text-slate-800 text-[19px] font-bold leading-snug">Know what needs you<br />before it stalls.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">AI monitors completion, activity, and timelines. When a project goes quiet, VOIS flags it and suggests next steps.</div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {['Stalled tasks', 'Missed milestones', 'Activity drops', 'Timeline drift'].map(s => (
              <div key={s} className="bg-slate-50 rounded px-1.5 py-1 text-[11px] text-slate-500 font-medium text-center">{s}</div>
            ))}
          </div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Dashboards show what happened.<br />VOIS tells you what to do next.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Operations ── P0=right wide rect, P1=left upper, P2=bottom-left
    case 'Operations':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Always watching</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Your business<br />monitors itself.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">KPIs, workflows, recurring processes. When something deviates, you get context and a recommended fix.</div>
          <div className="space-y-1 mt-2">
            {[
              ['Delayed delivery', 'Auto-notify client'],
              ['Missed SLA', 'Escalate to lead'],
              ['Budget overrun', 'Flag for review'],
            ].map(([trigger, action]) => (
              <div key={trigger} className="flex items-center gap-1.5 text-[11px]">
                <div className="text-red-400 font-semibold shrink-0">{trigger}</div>
                <div className="text-slate-300">&rarr;</div>
                <div className="text-emerald-500 font-medium">{action}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">24/7</div>
          <div className="text-slate-600 text-[14px] font-semibold">monitoring</div>
          <div className="text-slate-400 text-[12px]">zero human bandwidth</div>
        </div>,
        <div key="a" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Stop firefighting.<br />Start preventing.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Clients ── P0=left wide rect, P1=right upper trapezoid, P2=bottom-right
    case 'Clients':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Full context CRM</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Every relationship,<br />total recall.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Rich profiles built from every interaction. Before any call, see full history and AI-suggested talking points.</div>
          <div className="space-y-1.5 mt-2 text-left">
            {[
              ['Last contact', '3 days ago — email'],
              ['Sentiment', 'Positive, engaged'],
              ['Open items', '2 proposals pending'],
              ['Next step', 'Follow up on pricing'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start gap-2">
                <div className="text-[11px] font-semibold text-slate-600 w-16 shrink-0">{k}</div>
                <div className="text-[11px] text-slate-400">{v}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Before every call</div>
          <div className="text-slate-500 text-[13px] leading-relaxed">History, sentiment,<br />open items, talking<br />points — <span className="font-semibold text-slate-700">auto-prepared</span>.</div>
        </div>,
        <div key="a" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Your CRM should be a memory, not a database.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Documents ── P0=left narrow tall, P1=bottom, P2=right upper wide rect
    case 'Documents':
      return [
        <div key="p" className="text-center space-y-2.5 w-full">
          <div className="text-5xl font-black text-blue-500 leading-none tracking-tight">Voice</div>
          <div className="text-slate-600 text-[14px] font-semibold">to document</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[12px] leading-relaxed">
            Briefs<br />Proposals<br />Reports<br />Updates
          </div>
        </div>,
        <div key="s" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Stop staring at blank pages. Start talking.&rdquo;</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Talk, don't type</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Describe what you need.<br />Get a finished document.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">VOIS pulls context from your projects and generates structured docs from your voice.</div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Speak</div>
              <div className="text-[10px] text-slate-400">describe it</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">AI</div>
              <div className="text-[10px] text-slate-400">drafts it</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Done</div>
              <div className="text-[10px] text-slate-400">formatted</div>
            </div>
          </div>
        </div>,
        null,
      ];

    // ── Finance ── P0=left wide rect, P1=bottom-right, P2=right upper rect
    case 'Finance':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Financial intelligence</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Every dollar,<br />one view.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Revenue, expenses, invoices, and forecasts in one AI dashboard. Ask questions in plain language.</div>
          <div className="space-y-1 mt-2">
            {[
              ['Revenue', '$48.2K', 'text-emerald-500'],
              ['Expenses', '$31.7K', 'text-amber-500'],
              ['Net', '$16.5K', 'text-blue-500'],
            ].map(([label, val, color]) => (
              <div key={label} className="flex items-center justify-between">
                <div className="text-[11px] text-slate-500">{label}</div>
                <div className={`text-[12px] font-bold ${color}`}>{val}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Your books should explain themselves.&rdquo;</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Ask anything</div>
          <div className="space-y-1">
            {['"How much did we spend on marketing?"', '"Show overdue invoices"', '"Revenue trend last 6 months"'].map(q => (
              <div key={q} className="bg-slate-50 rounded px-2 py-1 text-[11px] text-slate-500 italic">{q}</div>
            ))}
          </div>
        </div>,
        null,
      ];

    // ── Website ── P0=right wide rect, P1=bottom-left, P2=left upper rect
    case 'Website':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">AI-built sites</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Describe your business.<br />Get a website.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Copy, layout, images, SEO — generated. Update by voice. Connect forms, booking, and payments.</div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {['Copy & SEO', 'Layout', 'Forms', 'Booking', 'Payments', 'Analytics'].map(s => (
              <div key={s} className="bg-blue-50 rounded px-1.5 py-1 text-[11px] text-blue-500 font-medium text-center">{s}</div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Your website shouldn&rsquo;t need a developer.&rdquo;</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">0</div>
          <div className="text-slate-600 text-[14px] font-semibold">lines of code</div>
          <div className="text-slate-400 text-[12px]">voice-updated, always live</div>
        </div>,
        null,
      ];

    // ── AI Agents ── P0=right wide rect, P1=bottom wide rect, P2=top-left wide rect
    case 'AI Agents':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Your AI org chart</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Your first ten hires<br />don&rsquo;t need salaries.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Build agents in an org chart. Each has responsibilities, tools, budgets, and reporting lines.</div>
          <div className="space-y-1 mt-2">
            {[
              ['Researcher', 'Web scraping, analysis'],
              ['Writer', 'Content, proposals'],
              ['Analyst', 'Data, forecasts'],
              ['Ops', 'Scheduling, routing'],
            ].map(([role, desc]) => (
              <div key={role} className="flex items-center gap-2 text-[11px]">
                <div className="font-semibold text-blue-500 w-14 shrink-0">{role}</div>
                <div className="text-slate-400">{desc}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">The loop</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            {['Plan', 'Act', 'Pause', 'Deliver'].map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && <div className="text-slate-300 text-[14px]">&rarr;</div>}
                <div className="bg-blue-50 rounded-full px-2 py-0.5 text-[11px] text-blue-500 font-semibold">{step}</div>
              </React.Fragment>
            ))}
          </div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Agents plan before acting<br />and pause for your approval.<br /><span className="font-semibold text-slate-700">Always in control</span>.</div>
        </div>,
        <div key="a" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;ChatGPT answers questions.<br />VOIS agents complete missions.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Reports ── P0=left wide rect, P1=bottom-right, P2=right upper
    case 'Reports':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Reports, reimagined</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Call your assistant.<br />Describe what happened.<br />Get a finished report.</div>
          <div className="text-slate-400 text-[14px] leading-relaxed">No forms. No laptop. Just a phone call.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Upload any template and VOIS extracts every field. Then fill it by voice — the AI interviews you and pre-fills what it already knows.</div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-[19px] font-bold text-blue-500">Upload</div>
              <div className="text-[10px] text-slate-400">template</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[19px] font-bold text-blue-500">Call</div>
              <div className="text-[10px] text-slate-400">your AI</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[19px] font-bold text-blue-500">Done</div>
              <div className="text-[10px] text-slate-400">report filed</div>
            </div>
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">90s</div>
          <div className="text-slate-600 text-[14px] font-semibold">avg. report time</div>
          <div className="text-slate-400 text-[12px]">vs 30 min traditional</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">People talk 3&ndash;4x faster<br />than they type. Add AI<br />formatting = <span className="font-semibold text-slate-700">10x faster</span>.</div>
        </div>,
        <div key="a" className="text-center space-y-2.5 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Voice-first</div>
          <div className="text-slate-800 text-[19px] font-bold leading-snug">AI asks. You answer.<br />10 questions. Done.</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">
            <span className="font-semibold text-slate-600">Phone call</span> &mdash; ring your assistant<br />
            <span className="font-semibold text-slate-600">Interview</span> &mdash; AI walks through fields<br />
            <span className="font-semibold text-slate-600">Dictation</span> &mdash; one voice note fills all<br />
            <span className="font-semibold text-slate-600">Chat</span> &mdash; conversational text input
          </div>
        </div>,
        null,
      ];

    // ── Your Team ── P0=bottom-left rect, P1=bottom-right rect, P2=top wide rect
    case 'Your Team':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Per-role AI</div>
          <div className="text-slate-800 text-[19px] font-bold leading-snug">Every seat gets<br />a super-assistant.</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Company context, processes, and history — personalized per role.</div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">1:1</div>
          <div className="text-slate-600 text-[14px] font-semibold">AI per employee</div>
          <div className="text-slate-400 text-[12px]">tailored to their role</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Not a shared chatbot.<br />A <span className="font-semibold text-slate-700">personal assistant</span><br />that knows their job.</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">What each employee gets</div>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {['Onboarding guide', 'Daily planner', 'Knowledge lookup', 'Task manager', 'Process coach', 'Meeting prep'].map(s => (
              <div key={s} className="bg-slate-50 rounded px-1.5 py-1 text-[11px] text-slate-500 font-medium text-center">{s}</div>
            ))}
          </div>
        </div>,
        null,
      ];

    // ── Playbooks ── P0=right wide rect, P1=bottom-left, P2=top wide rect
    case 'Playbooks':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Living SOPs</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Your playbooks<br />run themselves.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Turn procedures into workflows that monitor compliance, guide each step, and flag deviations.</div>
          <div className="space-y-1 mt-2">
            {[
              ['Step 1', 'Guide team member', 'text-emerald-500'],
              ['Step 2', 'Verify compliance', 'text-blue-500'],
              ['Step 3', 'Flag deviation', 'text-amber-500'],
            ].map(([step, desc, color]) => (
              <div key={step} className="flex items-center gap-2 text-[11px]">
                <div className={`font-bold ${color} w-8 shrink-0`}>{step}</div>
                <div className="text-slate-400">{desc}</div>
              </div>
            ))}
          </div>
        </div>,
        <div key="s" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;SOPs shouldn&rsquo;t live in binders. They should run themselves.&rdquo;</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Compliance score</div>
          <div className="text-5xl font-black text-emerald-500 leading-none tracking-tight">97%</div>
          <div className="text-slate-400 text-[12px]">avg. across active playbooks</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Real-time monitoring.<br />Deviations caught <span className="font-semibold text-slate-700">before</span><br />they become problems.</div>
        </div>,
        null,
      ];

    // ── Field to Office ── P0=left wide rect, P1=right upper trapezoid, P2=bottom wide rect
    case 'Field to Office':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Bridge the gap</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">Field update in 30s.<br />Office sees it instantly.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Technician speaks a voice note. It&rsquo;s structured, filed, and linked to the right project, client, and invoice.</div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Speak</div>
              <div className="text-[10px] text-slate-400">on site</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">AI</div>
              <div className="text-[10px] text-slate-400">structures</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">Office</div>
              <div className="text-[10px] text-slate-400">sees it</div>
            </div>
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-5xl font-black text-blue-500 leading-none tracking-tight">30s</div>
          <div className="text-slate-600 text-[13px] font-semibold">voice note replaces</div>
          <div className="text-slate-400 text-[12px]">20 min of paperwork</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Auto-linked to</div>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {['Project', 'Client', 'Invoice', 'Timeline'].map(s => (
              <div key={s} className="bg-slate-50 rounded px-1.5 py-1 text-[11px] text-slate-500 font-medium text-center">{s}</div>
            ))}
          </div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;The field is never<br />a day behind again.&rdquo;</div>
        </div>,
        null,
      ];

    // ── The Airlock ── P0=right wide rect, P1=left upper, P2=bottom wide rect
    case 'The Airlock':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">AI safety layer</div>
          <div className="text-slate-800 text-[20px] font-bold leading-snug">AI power.<br />Human control.</div>
          <div className="w-8 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Every AI action goes through a preview card. You see the exact output, then approve. Nothing happens without your sign-off.</div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">AI</div>
              <div className="text-[10px] text-slate-400">proposes</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-blue-500">You</div>
              <div className="text-[10px] text-slate-400">review</div>
            </div>
            <div className="text-slate-300 text-[16px]">&rarr;</div>
            <div className="flex flex-col items-center">
              <div className="text-[16px] font-bold text-emerald-500">Approve</div>
              <div className="text-[10px] text-slate-400">or reject</div>
            </div>
          </div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-6xl font-black text-blue-500 leading-none tracking-tight">100%</div>
          <div className="text-slate-600 text-[14px] font-semibold">human-approved</div>
          <div className="text-slate-400 text-[12px]">every action, every time</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">The iron rule</div>
          <div className="text-slate-800 text-[19px] font-bold leading-snug">AI proposes. You review.<br />You approve. Always.</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Trust isn&rsquo;t a setting.<br />It&rsquo;s an architecture.&rdquo;</div>
        </div>,
        null,
      ];

    // ── Your Memory (quad) ── P0=right, P1=left, P2=bottom wide, P3=top wide
    case 'Your Memory':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Semantic search</div>
          <div className="text-slate-800 text-[19px] font-bold leading-snug">Ask anything<br />you&rsquo;ve ever said.</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Search by meaning, not keywords. VOIS finds answers across every source.</div>
        </div>,
        <div key="s" className="text-center space-y-2.5 w-full">
          <div className="text-5xl font-black text-blue-500 leading-none tracking-tight">19</div>
          <div className="text-slate-600 text-[13px] font-semibold">sources indexed</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[12px] leading-relaxed">
            Voice &middot; Email &middot; Docs<br />
            CRM &middot; Chat &middot; Notes<br />
            + 13 more
          </div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">Example queries</div>
          <div className="space-y-1">
            {['"What did Sarah say about the budget?"', '"Find everything about permit delays"', '"Where are we with Henderson?"'].map(q => (
              <div key={q} className="bg-slate-50 rounded px-2 py-1 text-[11px] text-slate-500 italic">{q}</div>
            ))}
          </div>
        </div>,
        <div key="f" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Your second brain,<br />with perfect recall.&rdquo;</div>
        </div>,
      ];

    // ── Growth Engine (quad) ── P0=right, P1=left, P2=bottom wide, P3=top wide
    case 'Growth Engine':
      return [
        <div key="p" className="text-center space-y-3 w-full">
          <div className="text-blue-500 text-[12px] font-bold uppercase tracking-widest">Viral loop</div>
          <div className="text-slate-800 text-[19px] font-bold leading-snug">Share a meeting note.<br />Gain a customer.</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Recipients see your company, get a promo, and sign up pre-seeded with their own data.</div>
        </div>,
        <div key="s" className="text-center space-y-3 w-full">
          <div className="text-5xl font-black text-blue-500 leading-none tracking-tight">90%</div>
          <div className="text-slate-600 text-[13px] font-semibold">off for referrals</div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[12px] leading-relaxed">Referred signups get<br />a workspace pre-seeded<br />from <span className="font-semibold text-slate-700">their own data</span>.</div>
        </div>,
        <div key="a" className="text-center space-y-3 w-full">
          <div className="text-[12px] text-blue-500 font-bold uppercase tracking-widest">The flywheel</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            {['Share', 'Discover', 'Sign up', 'Share'].map((step, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="text-slate-300 text-[12px]">&rarr;</div>}
                <div className="bg-blue-50 rounded-full px-2 py-0.5 text-[10px] text-blue-500 font-semibold">{step}</div>
              </React.Fragment>
            ))}
          </div>
          <div className="w-6 h-px bg-slate-200 mx-auto" />
          <div className="text-slate-500 text-[13px] leading-relaxed">Your product sells itself<br />through the work it does.</div>
        </div>,
        <div key="f" className="text-center space-y-2 w-full">
          <div className="text-slate-600 text-[15px] font-serif italic leading-snug">&ldquo;Every meeting note<br />is a growth channel.&rdquo;</div>
        </div>,
      ];

    default:
      return [
        <Body key="p" text={feat.body} />,
        <Quote key="s" text={feat.closingLine} />,
        null,
        null,
      ];
  }
}

// ─── FocusPanels — renders precomputed static templates, no RAF loop ───

const BASE_FOCUS_ZOOM = 220;
const BASE_CONTAINER_PX = 672;

const FocusPanels: React.FC<{
  containerWidth: number;
  label: string;
  faceIdx: number;
  interactive: boolean;
  visible?: boolean;
}> = ({ containerWidth, label, faceIdx, visible = true }) => {
  const feat = FEATURE_MAP[label];

  // Analytically compute panel template from pre-computed world-space vertices.
  // Orthographic projection: containerFrac = worldXY * (zoom / containerWidth) + 0.5
  const template = useMemo(() => {
    if (!containerWidth || containerWidth < 1) return null;
    const raw = RAW_TEMPLATES[faceIdx] as any;
    const worldPts: Pt[] | undefined = raw?._worldPts;
    if (!worldPts || worldPts.length < 3) return null;

    const k = BASE_FOCUS_ZOOM / BASE_CONTAINER_PX;
    const containerPts = worldPts.map(p => ({
      x: p.x * k + 0.5,
      y: 0.5 - p.y * k,
    }));
    return buildTemplateFromRef(faceIdx, containerPts);
  }, [faceIdx]);

  if (!template) return null;

  // Rich content per panel — varies by feature
  const contents: (React.ReactNode | null)[] = getRichPanelContents(label, feat);

  return (
    <>
      {/* SVG panel shapes */}
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
        {template.panels.map((panel, i) => panel.svgPath && (
          <path
            key={i}
            d={panel.svgPath}
            fill="rgba(255,255,255,0.94)"
            stroke="rgba(226,232,240,0.4)"
            strokeWidth="0.15"
            filter="url(#panelShadow)"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(2px)',
              transition: visible
                ? `opacity 500ms ease-out ${i * 150}ms, transform 500ms ease-out ${i * 150}ms`
                : 'opacity 80ms ease-out, transform 80ms ease-out',
            }}
          />
        ))}
      </svg>

      {/* Content positioned in safe inscribed rectangles — no clip-path clipping */}
      {template.panels.map((panel, i) => {
        if (!panel.svgPath || !contents[i] || panel.region.length < 3) return null;

        // Compute largest inscribed axis-aligned rectangle inside the polygon.
        // Sample horizontal strips and find the widest safe rect.
        const pts = panel.region;
        const ys = pts.map(p => p.y);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const STEPS = 40;
        let bestRect = { left: 0, top: 0, width: 0, height: 0, area: 0 };

        for (let a = 0; a < STEPS; a++) {
          const y0 = minY + (a / STEPS) * (maxY - minY);
          for (let b = a + 1; b <= STEPS; b++) {
            const y1 = minY + (b / STEPS) * (maxY - minY);
            // Find min x-range across this y band
            let xMin = -Infinity, xMax = Infinity;
            for (let s = 0; s <= 4; s++) {
              const yy = y0 + (s / 4) * (y1 - y0);
              // Ray cast: find x intersections at this y
              const xs: number[] = [];
              for (let e = 0; e < pts.length; e++) {
                const p1 = pts[e], p2 = pts[(e + 1) % pts.length];
                if ((p1.y <= yy && p2.y > yy) || (p2.y <= yy && p1.y > yy)) {
                  const t = (yy - p1.y) / (p2.y - p1.y);
                  xs.push(p1.x + t * (p2.x - p1.x));
                }
              }
              if (xs.length >= 2) {
                xs.sort((a, b) => a - b);
                xMin = Math.max(xMin, xs[0]);
                xMax = Math.min(xMax, xs[xs.length - 1]);
              }
            }
            if (xMax > xMin) {
              const area = (xMax - xMin) * (y1 - y0);
              if (area > bestRect.area) {
                bestRect = { left: xMin, top: y0, width: xMax - xMin, height: y1 - y0, area };
              }
            }
          }
        }

        // Add inward padding from polygon edges
        const inset = 0.03;
        const safeRect = {
          left: bestRect.left + inset,
          top: bestRect.top + inset,
          width: Math.max(0.01, bestRect.width - inset * 2),
          height: Math.max(0.01, bestRect.height - inset * 2),
        };

        const scale = containerWidth / BASE_CONTAINER_PX;
        return (
          <div
            key={i}
            className="absolute pointer-events-none overflow-hidden flex items-center justify-center"
            style={{
              left: `${(safeRect.left * 100).toFixed(2)}%`,
              top: `${(safeRect.top * 100).toFixed(2)}%`,
              width: `${(safeRect.width * 100).toFixed(2)}%`,
              height: `${(safeRect.height * 100).toFixed(2)}%`,
              fontSize: `${Math.max(0.65, scale)}em`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              transition: visible
                ? `opacity 500ms ease-out ${i * 150}ms, transform 500ms ease-out ${i * 150}ms`
                : 'opacity 80ms ease-out, transform 80ms ease-out',
            }}
          >
            {contents[i]}
          </div>
        );
      })}
    </>
  );
};

interface WorkHero3DProps {
  onPhaseChange?: (phase: AnimPhase) => void;
  onFocusChange?: (label: string | null) => void;
  unfocusRef?: React.MutableRefObject<(() => void) | null>;
  muted?: boolean;
  paused?: boolean;
  onToggleMute?: () => void;
}

export const WorkHero3D: React.FC<WorkHero3DProps> = ({ onPhaseChange, onFocusChange, unfocusRef, muted = true, paused = false, onToggleMute }) => {
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
  const [containerWidth, setContainerWidth] = useState(0);
  React.useLayoutEffect(() => {
    const measure = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.getBoundingClientRect().width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

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

  // Window-level move/up so dragging works even outside the container
  React.useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newPoint = screenToSphere(e.clientX, e.clientY, rect);
      const delta = arcballDelta(lastSpherePoint.current, newPoint);
      dragDeltaQuat.current.copy(delta);
      lastVelocityQuat.current.copy(delta);
      dragDistRef.current += Math.abs(e.movementX) + Math.abs(e.movementY);
      lastSpherePoint.current.copy(newPoint);
    };
    const handleUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setDragging(false);
      dragDeltaQuat.current.identity();
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  // Keep these as no-ops so JSX props don't break
  const onPointerMove = useCallback(() => {}, []);
  const onPointerUp = useCallback(() => {}, []);

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

  // Delay panel appearance so the camera snap finishes first
  // Re-triggers on focus enter, face change (previewFace), and drag release
  const [panelsReady, setPanelsReady] = useState(false);
  React.useEffect(() => {
    if (isFocusMode && !dragging) {
      setPanelsReady(false);
      const timer = setTimeout(() => setPanelsReady(true), 800);
      return () => clearTimeout(timer);
    }
    if (!isFocusMode) setPanelsReady(false);
  }, [isFocusMode, dragging, previewFace]);

  // Report focus state to parent
  React.useEffect(() => {
    onFocusChange?.(displayLabel);
  }, [displayLabel, onFocusChange]);

  // Expose unfocus function to parent
  React.useEffect(() => {
    if (unfocusRef) unfocusRef.current = () => setFocusedTri(null);
  }, [unfocusRef]);

  // Reduce canvas overdraw on mobile for performance
  const isMobile = containerWidth > 0 && containerWidth < 500;
  const canvasInset = isMobile ? '-25% -35%' : '-50% -70%';

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
      {/* Canvas matches fog size so nothing gets clipped */}
      {containerWidth > 0 && (
      <div className="absolute" style={{ inset: canvasInset }}>
      <Canvas
        orthographic
        camera={{ zoom: 160 * (containerWidth / 672), position: [0, 0, 10], near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
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
            muted={muted}
            paused={paused}
            containerWidth={containerWidth || 672}
          />
        </Suspense>
      </Canvas>
      </div>
      )}

      {/* Focus controls — back only, bottom-left */}
      <div
        className="absolute left-3 bottom-3 z-30 flex items-center gap-2 transition-opacity duration-500"
        style={{ opacity: isFocusMode ? 1 : 0, pointerEvents: isFocusMode ? 'auto' : 'none' }}
      >
      </div>

      {/* Focus overlay — panels vary per face, fade in/out */}
      {(() => {
        const panelsVisible = isFocusMode && panelsReady && !dragging;
        return (
      <div
        className="absolute pointer-events-none z-20"
        style={{
          inset: '-10% -35%',
          transition: !panelsVisible ? 'opacity 80ms ease-out' : 'none',
          opacity: isFocusMode ? 1 : 0,
        }}
      >
        <FocusPanels containerWidth={containerWidth} label={displayLabel || ''} faceIdx={previewFace} interactive={isFocusMode} visible={panelsVisible} />
      </div>
        );
      })()}
    </div>
  );
};
