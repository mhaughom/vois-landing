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
    <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-2">{title}</div>
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
    <div className="text-3xl md:text-4xl font-bold text-indigo-500 leading-none">{value}</div>
    <div className="text-slate-500 text-xs mt-1">{label}</div>
  </div>
);

// Helper: italic quote
const Quote: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center">
    <div className="text-slate-700 text-sm font-serif italic leading-snug">&ldquo;{text}&rdquo;</div>
  </div>
);

// Helper: body text
const Body: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center">
    <div className="text-slate-600 text-sm leading-relaxed">{text}</div>
  </div>
);

// Helper: labeled section with short text
const LabeledText: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div className="text-center">
    <div className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider mb-1">{label}</div>
    <div className="text-slate-600 text-sm leading-relaxed">{text}</div>
  </div>
);

function getRichPanelContents(label: string, feat: FeatureInfo | undefined): (React.ReactNode | null)[] {
  if (!feat) return [null, null, null, null];

  // P0 = primary (largest), P1 = secondary, P2 = accent (often small), P3 = fourth (quads only)
  // Content must be centered and compact — panels are irregular polygons that clip edges.

  switch (label) {

    // ── Your Assistant ── P0=left tall, P1=right upper, P2=bottom-right
    case 'Your Assistant':
      return [
        <Stat key="p" value="19" label="data sources, one search" />,
        <Body key="s" text="It learns your processes and history. Anticipates needs, drafts responses, acts on your behalf." />,
        <Quote key="a" text="Other assistants need instructions. VOIS already knows." />,
        null,
      ];

    // ── Your Super-Assistant ── P0=right tall, P1=bottom-left small, P2=top wide
    case 'Your Super-Assistant':
      return [
        <Body key="p" text="Voice, watch, inbox, email — every input lands in one intelligent system that routes, prioritizes, and remembers." />,
        <Quote key="s" text="One brain. Every interface." />,
        <LabeledText key="a" label="Surfaces" text="Chat, voice, watch, inbox, desktop, Slack" />,
        null,
      ];

    // ── Your Day ── P0=left tall, P2=right upper, P1=bottom-right
    case 'Your Day':
      return [
        <Body key="p" text="VOIS reviews your tasks, calendar, and priorities overnight. Each morning: a proposed schedule, prep notes, and flagged items." />,
        <Quote key="s" text="Your day should start with a plan, not decisions." />,
        <LabeledText key="a" label="Every morning" text="Time blocks, meeting prep, priorities" />,
        null,
      ];

    // ── Meetings ── P0=right tall, P1=bottom-left small, P2=left upper
    case 'Meetings':
      return [
        <Body key="p" text="Personalized briefings before. Live transcription with speaker diarization during. Action items extracted and routed after." />,
        <Quote key="s" text="Other tools transcribe. VOIS prepares, captures, and acts." />,
        <LabeledText key="a" label="The cycle" text="Prepare &rarr; Capture &rarr; Act" />,
        null,
      ];

    // ── Projects ── P0=left tall, P1=bottom wide, P2=right upper
    case 'Projects':
      return [
        <Body key="p" text="AI health scoring monitors completion, activity, and timelines. When a project stalls, VOIS flags it and suggests next steps." />,
        <Quote key="s" text="Dashboards show what happened. VOIS tells you what to do next." />,
        <LabeledText key="a" label="Monitors" text="Tasks, milestones, activity patterns" />,
        null,
      ];

    // ── Operations ── P0=right tall, P1=left upper, P2=bottom-left
    case 'Operations':
      return [
        <Body key="p" text="VOIS watches KPIs, workflows, and recurring processes. Deviations trigger alerts with context and recommended action." />,
        <Quote key="s" text="Stop firefighting. Start preventing." />,
        <Stat key="a" value="24/7" label="background monitoring" />,
        null,
      ];

    // ── Clients ── P0=left tall, P1=right upper, P2=bottom-right small
    case 'Clients':
      return [
        <Body key="p" text="Rich profiles from every interaction — meetings, emails, notes. Full history, sentiment trends, and AI-suggested talking points before every call." />,
        <LabeledText key="s" label="Before every call" text="History, sentiment, talking points, open items" />,
        <Quote key="a" text="Your CRM should be a memory, not a database." />,
        null,
      ];

    // ── Documents ── P0=left tall, P1=bottom, P2=right upper wide
    case 'Documents':
      return [
        <Body key="p" text="Describe what you need — a brief, a proposal, an update — and VOIS generates it from your voice, pulling context from your projects." />,
        <Quote key="s" text="Stop staring at blank pages. Start talking." />,
        <LabeledText key="a" label="Input" text="Voice, chat, or template" />,
        null,
      ];

    // ── Finance ── P0=left tall, P1=bottom-right, P2=right upper
    case 'Finance':
      return [
        <Body key="p" text="Revenue, expenses, invoices, and forecasts in one AI-powered dashboard. Ask questions about your numbers in plain language." />,
        <Quote key="s" text="Your books should explain themselves." />,
        <LabeledText key="a" label="Unified" text="Revenue, expenses, invoices, forecasts" />,
        null,
      ];

    // ── Website ── P0=right tall, P1=bottom-left, P2=left upper
    case 'Website':
      return [
        <Body key="p" text="Describe your business and VOIS generates a complete website — copy, layout, images, SEO. Update by voice. No code needed." />,
        <Quote key="s" text="Your website shouldn't need a developer." />,
        <Stat key="a" value="0" label="lines of code required" />,
        null,
      ];

    // ── AI Agents ── P0=right tall, P1=bottom wide, P2=top-left
    case 'AI Agents':
      return [
        <Quote key="p" text="ChatGPT answers questions. VOIS agents complete missions." />,
        <LabeledText key="s" label="Your AI team" text="Researcher, Writer, Strategist, Coder, Slides" />,
        <LabeledText key="a" label="The loop" text="Plan &rarr; Act &rarr; Approve &rarr; Deliver" />,
        null,
      ];

    // ── Reports ── P0=large, P1=secondary, P2=accent
    case 'Reports':
      return [
        <Body key="p" text="Upload a template, VOIS extracts every field. Fill the entire report by voice — the AI interviews you and pre-fills what it already knows." />,
        <Quote key="s" text="Ten questions. Done." />,
        <Stat key="a" value="90s" label="average report time" />,
        null,
      ];

    // ── Your Team ── P0=bottom-left, P1=bottom-right, P2=top wide
    case 'Your Team':
      return [
        <Body key="p" text="Every team member gets their own AI assistant — company context, processes, and history. Personalized per role." />,
        <Quote key="s" text="Scale your best practices to every seat." />,
        <LabeledText key="a" label="Per-role AI" text="Onboarding, daily planning, knowledge lookup" />,
        null,
      ];

    // ── Playbooks ── P0=right large, P1=bottom-left small, P2=top wide
    case 'Playbooks':
      return [
        <Body key="p" text="Turn SOPs into living workflows. VOIS monitors compliance, guides each step, and flags deviations before they become problems." />,
        <Quote key="s" text="SOPs shouldn't live in binders." />,
        <LabeledText key="a" label="Living workflows" text="Monitor, guide, enforce" />,
        null,
      ];

    // ── Field to Office ── P0=left, P1=right upper, P2=bottom wide
    case 'Field to Office':
      return [
        <Body key="p" text="A technician speaks a 30-second update. The office sees it instantly — structured, filed, and linked to the right project and client." />,
        <Quote key="s" text="The field is never a day behind again." />,
        <Stat key="a" value="30s" label="voice note replaces 20 min of data entry" />,
        null,
      ];

    // ── The Airlock ── P0=right tall, P1=left upper, P2=bottom wide
    case 'The Airlock':
      return [
        <Body key="p" text="Every AI action shows a preview with cryptographic confirmation. You review the exact output, then approve. Nothing happens without your sign-off." />,
        <Quote key="s" text="Trust isn't a setting. It's an architecture." />,
        <LabeledText key="a" label="The iron rule" text="AI proposes. You approve. Always." />,
        null,
      ];

    // ── Your Memory (quad) ── P0=right, P1=left, P2=bottom wide, P3=top wide
    case 'Your Memory':
      return [
        <Body key="p" text="Search across all 19 data sources — voice, emails, documents, transcripts, CRM — with semantic search." />,
        <Quote key="s" text="Your second brain, with perfect recall." />,
        <LabeledText key="a" label="Semantic search" text="Finds answers even when you forget which app it was in" />,
        <Stat key="f" value="19" label="sources searched at once" />,
      ];

    // ── Growth Engine (quad) ── P0=right, P1=left, P2=bottom wide, P3=top wide
    case 'Growth Engine':
      return [
        <Body key="p" text="Shared meeting notes become a growth channel. Recipients see your company, get a promo offer, and sign up pre-seeded with their data." />,
        <Quote key="s" text="Your product sells itself through the work it does." />,
        <LabeledText key="a" label="The flywheel" text="Share notes &rarr; Discover &rarr; Sign up" />,
        <Stat key="f" value="90%" label="off for referred signups" />,
      ];

    // ── Fallback ──
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
}> = ({ containerWidth, label, faceIdx }) => {
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
            fill="rgba(255,255,255,0.85)"
            stroke="rgba(226,232,240,0.4)"
            strokeWidth="0.15"
            filter="url(#panelShadow)"
          />
        ))}
      </svg>

      {/* Content clipped to panel shapes */}
      {template.panels.map((panel, i) => {
        if (!panel.svgPath || !contents[i] || panel.region.length < 3) return null;
        const clipPts = panel.region.map(p => {
          const px = panel.bbox.width > 0 ? ((p.x - panel.bbox.left) / panel.bbox.width) * 100 : 50;
          const py = panel.bbox.height > 0 ? ((p.y - panel.bbox.top) / panel.bbox.height) * 100 : 50;
          return `${px.toFixed(1)}% ${py.toFixed(1)}%`;
        });
        const scale = containerWidth / BASE_CONTAINER_PX;
        const pad = Math.round(16 * scale);
        return (
          <div
            key={i}
            className="absolute pointer-events-none overflow-hidden flex items-center justify-center"
            style={{
              left: `${(panel.bbox.left * 100).toFixed(2)}%`,
              top: `${(panel.bbox.top * 100).toFixed(2)}%`,
              width: `${(panel.bbox.width * 100).toFixed(2)}%`,
              height: `${(panel.bbox.height * 100).toFixed(2)}%`,
              padding: `${pad}px`,
              fontSize: `${Math.max(0.65, scale)}em`,
              clipPath: `polygon(${clipPts.join(', ')})`,
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
  onToggleMute?: () => void;
}

export const WorkHero3D: React.FC<WorkHero3DProps> = ({ onPhaseChange, onFocusChange, unfocusRef, muted = true, onToggleMute }) => {
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
          background: 'radial-gradient(ellipse 42% 45% at center, rgba(248,249,250,0.6) 0%, rgba(248,249,250,0.25) 20%, rgba(248,249,250,0.08) 35%, transparent 50%, transparent 100%)',
        }}
      />
      {/* Canvas matches fog size so nothing gets clipped */}
      {containerWidth > 0 && (
      <div className="absolute" style={{ inset: '-50% -70%' }}>
      <Canvas
        orthographic
        camera={{ zoom: 160 * (containerWidth / 672), position: [0, 0, 10], near: 0.1, far: 100 }}
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
            muted={muted}
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
        <FocusPanels containerWidth={containerWidth} label={displayLabel || ''} faceIdx={previewFace} interactive={isFocusMode} />
      </div>
        );
      })()}
    </div>
  );
};
