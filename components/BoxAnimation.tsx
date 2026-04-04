import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ═══════════════════════════════════════════════════
// Ported from Remotion HabosLogoV5 → R3F with useFrame
// Plays once on mount, holds final state after 30s
// ═══════════════════════════════════════════════════

// === Shared constants (from HabosLogo.tsx) ===
const S = 1.4;
const ISO_X = Math.atan(1 / Math.sqrt(2));
const ISO_Y = Math.PI / 4;
const CUBE_ROT = Math.PI + ISO_Y;

// === Easing functions (replacing Remotion's Easing) ===

function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  // Attempt to find t for given x using Newton's method on the cubic bezier
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
      const dx = 3 * x1 * (1 - t) * (1 - t) - 6 * x1 * t * (1 - t) + 6 * x2 * t * (1 - t) - 3 * x2 * t * t + 3 * t * t;
      if (Math.abs(dx) < 1e-6) break;
      t -= cx / dx;
      t = Math.max(0, Math.min(1, t));
    }
    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
  };
}

const easeInOut = (fn: (t: number) => number) => (t: number) => {
  if (t < 0.5) return fn(t * 2) / 2;
  return 1 - fn((1 - t) * 2) / 2;
};

const easeOut = (fn: (t: number) => number) => (t: number) => 1 - fn(1 - t);
const easeIn = (fn: (t: number) => number) => (t: number) => fn(t);

const cubicEase = (t: number) => t * t * t;
const quadEase = (t: number) => t * t;

const Easing = {
  bezier,
  inOut: easeInOut,
  out: easeOut,
  in: easeIn,
  cubic: cubicEase,
  quad: quadEase,
};

// === Clamped piecewise interpolation (replacing Remotion's interpolate) ===

function interp(
  time: number,
  inputRange: number[],
  outputRange: number[],
  easing?: (t: number) => number,
): number {
  // Clamp to input range
  if (time <= inputRange[0]) return outputRange[0];
  if (time >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

  // Find which segment we're in
  let segIdx = 0;
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (time >= inputRange[i] && time <= inputRange[i + 1]) {
      segIdx = i;
      break;
    }
  }

  const inStart = inputRange[segIdx];
  const inEnd = inputRange[segIdx + 1];
  const outStart = outputRange[segIdx];
  const outEnd = outputRange[segIdx + 1];

  let t = (time - inStart) / (inEnd - inStart);
  t = Math.max(0, Math.min(1, t));

  if (easing) t = easing(t);

  return outStart + (outEnd - outStart) * t;
}

// === Types ===
type V3 = [number, number, number];
type Q4 = [number, number, number, number];

// === Cube geometry constants ===
const THICK = S * 0.035;
const GAP = S * 0.82;
const OPEN_ANGLE = (210 * Math.PI) / 180;

// Grid in XZ plane (flat on ground, face up)
const GRID: V3[] = [
  [-GAP, 0, -GAP], [0, 0, -GAP], [GAP, 0, -GAP],
  [-GAP, 0, 0],    [0, 0, 0],    [GAP, 0, 0],
  [-GAP, 0, GAP],  [0, 0, GAP],  [GAP, 0, GAP],
];

// Flap hinge definitions
type FlapDef = {
  hinge: V3;
  offset: V3;
  axis: "x" | "z";
  sign: number;
};

const FLAP_DEFS: FlapDef[] = [
  { hinge: [0, S, S], offset: [0, 0, -S], axis: "x", sign: 1 },   // front
  { hinge: [0, S, -S], offset: [0, 0, S], axis: "x", sign: -1 },  // back
  { hinge: [S, S, 0], offset: [-S, 0, 0], axis: "z", sign: -1 },  // right
  { hinge: [-S, S, 0], offset: [S, 0, 0], axis: "z", sign: 1 },   // left
];

// Pre-allocated objects for hingeState to avoid GC pressure (called ~27x per render)
const _hingeAxisX = new THREE.Vector3(1, 0, 0);
const _hingeAxisZ = new THREE.Vector3(0, 0, 1);
const _hingeQ = new THREE.Quaternion();
const _hingeOff = new THREE.Vector3();
const _hingeBaseQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const _hingeTotalQ = new THREE.Quaternion();

function hingeState(def: FlapDef, angle: number): { pos: V3; quat: Q4 } {
  const a = angle * def.sign;
  const [hx, hy, hz] = def.hinge;
  const hingeAxis = def.axis === "x" ? _hingeAxisX : _hingeAxisZ;
  _hingeQ.setFromAxisAngle(hingeAxis, a);
  _hingeOff.set(def.offset[0], def.offset[1], def.offset[2]).applyQuaternion(_hingeQ);
  _hingeTotalQ.multiplyQuaternions(_hingeQ, _hingeBaseQ);
  return {
    pos: [hx + _hingeOff.x, hy + _hingeOff.y, hz + _hingeOff.z],
    quat: [_hingeTotalQ.x, _hingeTotalQ.y, _hingeTotalQ.z, _hingeTotalQ.w],
  };
}

const FLAT_QUAT: Q4 = (() => {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  return [q.x, q.y, q.z, q.w];
})();

// Wall hinges: each wall rotates 90deg up from the bottom panel's edge
const WALL_DEFS: FlapDef[] = [
  { hinge: [0, -S, -S], offset: [0, 0, -S], axis: "x", sign: 1 },   // back wall
  { hinge: [-S, -S, 0], offset: [-S, 0, 0], axis: "z", sign: -1 },  // left wall
  { hinge: [S, -S, 0], offset: [S, 0, 0], axis: "z", sign: 1 },     // right wall
  { hinge: [0, -S, S], offset: [0, 0, S], axis: "x", sign: -1 },    // front wall
];

// Grid layout from above:
//   [0:back-flap]  [1:back-wall]   [2:right-flap]
//   [3:left-wall]  [4:bottom]      [5:right-wall]
//   [6:left-flap]  [7:front-wall]  [8:front-flap]
type PanelType = "bottom" | "wall" | "flap";
const PANELS: {
  type: PanelType;
  wallIdx?: number;
  flapIdx?: number;
}[] = [
  { type: "flap", flapIdx: 1 },   // 0: back flap
  { type: "wall", wallIdx: 0 },   // 1: back wall
  { type: "flap", flapIdx: 2 },   // 2: right flap
  { type: "wall", wallIdx: 1 },   // 3: left wall
  { type: "bottom" },             // 4: bottom
  { type: "wall", wallIdx: 2 },   // 5: right wall
  { type: "flap", flapIdx: 3 },   // 6: left flap
  { type: "wall", wallIdx: 3 },   // 7: front wall
  { type: "flap", flapIdx: 0 },   // 8: front flap
];

// Light pastel palette (saturated but lightened)
const PANEL_COLORS = [
  '#FF9ED4', '#60C0FF', '#FFB878',
  '#50EE90', '#D09CFF', '#FFD060',
  '#40D8F0', '#FF9898', '#50EAAC',
];

// 3x3 grid adjacency (including diagonals)
const NEIGHBORS: number[][] = [
  [1, 3, 4],
  [0, 2, 3, 4, 5],
  [1, 4, 5],
  [0, 1, 4, 6, 7],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [1, 2, 4, 7, 8],
  [3, 4, 7],
  [3, 4, 5, 6, 8],
  [4, 5, 7],
];

const GRAY_COLOR = new THREE.Color('#6a7a96');

// Data-type labels for panel overlays
const PANEL_DATA_LABELS = [
  "Calendar", "Database", "Invoices",
  "Email", "Analytics", "Tasks",
  "Chat", "Website", "Documents",
];

function createPanelDataTexture(idx: number): THREE.CanvasTexture {
  const sz = 512;
  const canvas = document.createElement("canvas");
  canvas.width = sz; canvas.height = sz;
  const c = canvas.getContext("2d")!;
  c.clearRect(0, 0, sz, sz);

  const pad = 60;
  const w = sz - pad * 2;

  // Bright white fills + white outlines
  const wFill = "rgba(255,255,255,0.9)";
  const wMed = "rgba(255,255,255,0.7)";
  const wStroke = "rgba(255,255,255,0.95)";

  // Label
  c.fillStyle = wFill;
  c.font = "bold 55px sans-serif";
  c.textAlign = "center";
  c.strokeStyle = "rgba(0,0,0,0.7)"; c.lineWidth = 5;
  c.strokeText(PANEL_DATA_LABELS[idx], sz / 2, 100);
  c.fillText(PANEL_DATA_LABELS[idx], sz / 2, 100);

  const cTop = 130;
  c.fillStyle = wMed;
  c.strokeStyle = wStroke;
  c.lineWidth = 2.5;

  switch (idx) {
    case 0: { // Calendar grid
      const cols = 5, rows = 4;
      const cw = w / cols, ch = (sz - cTop - pad) / rows;
      for (let r = 0; r < rows; r++) for (let co = 0; co < cols; co++) {
        c.fillStyle = (r === 1 && co === 2) ? wFill : wMed;
        c.fillRect(pad + co * cw + 4, cTop + r * ch + 4, cw - 8, ch - 8);
        c.strokeStyle = wStroke; c.lineWidth = 2;
        c.strokeRect(pad + co * cw + 4, cTop + r * ch + 4, cw - 8, ch - 8);
      }
      break;
    }
    case 1: { // Database rows
      for (let i = 0; i < 5; i++) {
        const y = cTop + i * 52;
        c.fillStyle = wMed;
        c.beginPath(); c.arc(pad + 15, y + 16, 12, 0, Math.PI * 2); c.fill();
        c.strokeStyle = wStroke; c.lineWidth = 2;
        c.beginPath(); c.arc(pad + 15, y + 16, 12, 0, Math.PI * 2); c.stroke();
        c.fillStyle = wMed;
        c.fillRect(pad + 40, y + 4, w * 0.55, 12);
        c.fillRect(pad + 40, y + 22, w * 0.35, 8);
      }
      break;
    }
    case 2: { // Invoices table
      const cols = 3, rows = 5;
      c.strokeStyle = wStroke; c.lineWidth = 2.5;
      for (let r = 0; r <= rows; r++) {
        c.beginPath(); c.moveTo(pad, cTop + r * 50); c.lineTo(sz - pad, cTop + r * 50); c.stroke();
      }
      for (let co = 0; co <= cols; co++) {
        const x = pad + (w / cols) * co;
        c.beginPath(); c.moveTo(x, cTop); c.lineTo(x, cTop + rows * 50); c.stroke();
      }
      c.fillStyle = wMed;
      for (let r = 0; r < rows; r++) for (let co = 0; co < cols; co++)
        c.fillRect(pad + co * (w / cols) + 6, cTop + r * 50 + 6, (w / cols) - 12, 34);
      break;
    }
    case 3: { // Email
      for (let i = 0; i < 4; i++) {
        const y = cTop + i * 62;
        c.strokeStyle = wStroke; c.lineWidth = 2;
        c.strokeRect(pad, y, w, 50);
        c.fillStyle = wMed;
        c.fillRect(pad + 12, y + 10, 24, 18);
        c.fillRect(pad + 48, y + 10, w * 0.55, 12);
        c.fillStyle = "rgba(255,255,255,0.5)";
        c.fillRect(pad + 48, y + 28, w * 0.35, 8);
      }
      break;
    }
    case 4: { // Analytics bars
      const vals = [0.45, 0.7, 0.35, 0.85, 0.55, 0.75, 0.5];
      const bw = w / vals.length;
      const h = sz - cTop - pad;
      vals.forEach((v, i) => {
        c.fillStyle = wMed;
        c.fillRect(pad + i * bw + 6, cTop + h * (1 - v), bw - 12, h * v);
        c.strokeStyle = wStroke; c.lineWidth = 2;
        c.strokeRect(pad + i * bw + 6, cTop + h * (1 - v), bw - 12, h * v);
      });
      break;
    }
    case 5: { // Tasks checklist
      for (let i = 0; i < 5; i++) {
        const y = cTop + i * 52;
        c.strokeStyle = wStroke; c.lineWidth = 3;
        c.strokeRect(pad, y, 26, 26);
        if (i < 3) { c.fillStyle = wFill; c.fillRect(pad + 4, y + 4, 18, 18); }
        c.fillStyle = wMed;
        c.fillRect(pad + 42, y + 5, w * 0.55, 14);
      }
      break;
    }
    case 6: { // Chat bubbles
      const bubbles: [number, number, number, number][] = [
        [pad, cTop, w * 0.6, 42], [pad + w * 0.3, cTop + 58, w * 0.65, 42],
        [pad, cTop + 116, w * 0.5, 42], [pad + w * 0.35, cTop + 174, w * 0.6, 42]];
      bubbles.forEach(([bx, by, bw, bh]) => {
        c.fillStyle = wMed;
        c.beginPath(); c.roundRect(bx, by, bw, bh, 16); c.fill();
        c.strokeStyle = wStroke; c.lineWidth = 2;
        c.beginPath(); c.roundRect(bx, by, bw, bh, 16); c.stroke();
      });
      break;
    }
    case 7: { // Website layout
      c.fillStyle = wMed;
      c.fillRect(pad, cTop, w, 36);
      c.strokeStyle = wStroke; c.lineWidth = 2;
      c.strokeRect(pad, cTop, w, 36);
      c.fillStyle = "rgba(255,255,255,0.55)";
      c.fillRect(pad, cTop + 48, w, 80);
      c.strokeRect(pad, cTop + 48, w, 80);
      c.fillRect(pad, cTop + 140, w * 0.48, 100);
      c.strokeRect(pad, cTop + 140, w * 0.48, 100);
      c.fillRect(pad + w * 0.52, cTop + 140, w * 0.48, 100);
      c.strokeRect(pad + w * 0.52, cTop + 140, w * 0.48, 100);
      break;
    }
    case 8: { // Documents lines
      for (let i = 0; i < 8; i++) {
        const lw = w * (0.6 + Math.abs(Math.sin(i * 1.7)) * 0.35);
        c.fillStyle = wMed;
        c.beginPath(); c.roundRect(pad, cTop + i * 32, lw, 12, 4); c.fill();
        c.strokeStyle = wStroke; c.lineWidth = 1.5;
        c.beginPath(); c.roundRect(pad, cTop + i * 32, lw, 12, 4); c.stroke();
      }
      break;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ═══════════════════════════════════════════════════
// WIDGETS - business data cards thrown into the box
// ═══════════════════════════════════════════════════

type WidgetDef = {
  label: string;
  bg: string;
  edge: string;
  w: number;
  h: number;
  draw: (c: CanvasRenderingContext2D, cw: number, ch: number) => void;
};

const WIDGETS: WidgetDef[] = [
  {
    label: "Calendar", bg: "#88BBFF", edge: "#88BBFF", w: 0.85, h: 0.85,
    draw: (c, cw, ch) => {
      const days = ["M", "T", "W", "T", "F", "S", "S"];
      const gx = 24, gy = 70, gw = cw - 48;
      const cellW = gw / 7, cellH = (ch - gy - 20) / 6;
      c.fillStyle = "rgba(20,40,80,0.25)"; c.font = `bold ${Math.round(cw * 0.042)}px sans-serif`; c.textAlign = "center";
      for (let d = 0; d < 7; d++) c.fillText(days[d], gx + d * cellW + cellW / 2, gy + 12);
      for (let r = 0; r < 5; r++) for (let co = 0; co < 7; co++) {
        const x = gx + co * cellW + 3, y = gy + 20 + r * cellH + 3;
        const isToday = r === 1 && co === 3;
        c.fillStyle = isToday ? "rgba(40,90,200,0.4)" : "rgba(20,40,80,0.12)";
        c.beginPath(); c.roundRect(x, y, cellW - 6, cellH - 6, 4); c.fill();
        c.fillStyle = isToday ? "#fff" : "rgba(20,40,80,0.35)";
        c.font = `${Math.round(cw * 0.038)}px sans-serif`;
        c.fillText(`${r * 7 + co + 1}`, x + (cellW - 6) / 2, y + (cellH - 6) / 2 + 4);
      }
    },
  },
  {
    label: "CRM", bg: "#6CDBA0", edge: "#6CDBA0", w: 1.0, h: 0.75,
    draw: (c, cw, ch) => {
      for (let i = 0; i < 5; i++) {
        const y = 65 + i * ((ch - 80) / 5);
        c.fillStyle = "rgba(15,60,40,0.2)";
        c.beginPath(); c.arc(36, y + 14, 12, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(15,60,40,0.3)";
        c.fillRect(58, y + 4, cw * 0.45, 8);
        c.fillStyle = "rgba(15,60,40,0.15)";
        c.fillRect(58, y + 18, cw * 0.3, 6);
      }
    },
  },
  {
    label: "Website", bg: "#B090FF", edge: "#B090FF", w: 0.9, h: 1.1,
    draw: (c, cw, ch) => {
      c.fillStyle = "rgba(40,20,80,0.15)";
      c.beginPath(); c.roundRect(16, 62, cw - 32, 22, 6); c.fill();
      c.fillStyle = "rgba(40,20,80,0.1)";
      c.beginPath(); c.arc(30, 73, 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(40,20,80,0.2)";
      c.fillRect(44, 68, cw * 0.5, 8);
      c.fillStyle = "rgba(80,40,160,0.18)";
      c.beginPath(); c.roundRect(16, 94, cw - 32, ch * 0.2, 6); c.fill();
      const colW = (cw - 40) / 2;
      c.fillStyle = "rgba(40,20,80,0.12)";
      c.beginPath(); c.roundRect(16, 94 + ch * 0.23, colW, ch * 0.35, 4); c.fill();
      c.beginPath(); c.roundRect(24 + colW, 94 + ch * 0.23, colW, ch * 0.35, 4); c.fill();
    },
  },
  {
    label: "Notes", bg: "#FFD870", edge: "#FFD870", w: 0.7, h: 1.15,
    draw: (c, cw, ch) => {
      const lengths = [0.85, 0.7, 0.9, 0.55, 0.75, 0.6, 0.8, 0.45];
      c.fillStyle = "rgba(80,50,0,0.25)";
      for (let i = 0; i < lengths.length; i++) {
        c.beginPath(); c.roundRect(24, 68 + i * ((ch - 80) / 8), (cw - 48) * lengths[i], 8, 3); c.fill();
      }
    },
  },
  {
    label: "Email", bg: "#FF9090", edge: "#FF9090", w: 0.95, h: 0.8,
    draw: (c, cw, ch) => {
      for (let i = 0; i < 5; i++) {
        const y = 65 + i * ((ch - 80) / 5);
        const bold = i === 0;
        c.fillStyle = bold ? "rgba(120,20,30,0.3)" : "rgba(80,20,30,0.12)";
        c.beginPath(); c.roundRect(20, y, cw - 40, (ch - 80) / 5 - 6, 4); c.fill();
        c.fillStyle = bold ? "rgba(120,20,30,0.4)" : "rgba(80,20,30,0.25)";
        c.fillRect(30, y + 8, cw * 0.35, 7);
        c.fillStyle = "rgba(80,20,30,0.15)";
        c.fillRect(30, y + 22, cw * 0.6, 5);
      }
    },
  },
  {
    label: "Tasks", bg: "#60D8E8", edge: "#60D8E8", w: 0.75, h: 1.0,
    draw: (c, cw, ch) => {
      for (let i = 0; i < 6; i++) {
        const y = 68 + i * ((ch - 85) / 6);
        const done = i < 3;
        c.strokeStyle = "rgba(10,60,80,0.35)"; c.lineWidth = 2;
        c.strokeRect(24, y, 16, 16);
        if (done) { c.fillStyle = "rgba(10,100,130,0.4)"; c.fillRect(27, y + 3, 10, 10); }
        c.fillStyle = done ? "rgba(10,60,80,0.2)" : "rgba(10,60,80,0.3)";
        c.fillRect(50, y + 4, cw * 0.5, 8);
      }
    },
  },
  {
    label: "Analytics", bg: "#FF88C0", edge: "#FF88C0", w: 1.0, h: 0.85,
    draw: (c, cw, ch) => {
      const vals = [0.5, 0.75, 0.35, 0.9, 0.6, 0.45, 0.8];
      const colors = ["rgba(200,60,100,0.35)", "rgba(60,120,200,0.35)", "rgba(60,180,120,0.35)",
        "rgba(200,160,40,0.35)", "rgba(140,60,200,0.35)", "rgba(200,100,40,0.35)", "rgba(60,160,180,0.35)"];
      const barW = (cw - 60) / vals.length;
      const maxH = ch - 90;
      for (let i = 0; i < vals.length; i++) {
        const bh = vals[i] * maxH;
        c.fillStyle = colors[i];
        c.beginPath(); c.roundRect(28 + i * barW + 2, ch - 16 - bh, barW - 4, bh, [4, 4, 0, 0]); c.fill();
      }
    },
  },
  {
    label: "Documents", bg: "#A888FF", edge: "#A888FF", w: 0.8, h: 1.1,
    draw: (c, cw, ch) => {
      c.fillStyle = "rgba(255,255,255,0.6)";
      c.beginPath(); c.roundRect(28, 65, cw - 56, ch - 80, 6); c.fill();
      c.fillStyle = "rgba(40,20,80,0.2)";
      for (let i = 0; i < 9; i++) {
        const w = (cw - 80) * (0.5 + Math.abs(Math.sin(i * 1.7)) * 0.5);
        c.fillRect(40, 82 + i * ((ch - 110) / 9), w, 6);
      }
    },
  },
  {
    label: "Chat", bg: "#60E8B0", edge: "#60E8B0", w: 0.85, h: 0.95,
    draw: (c, cw, ch) => {
      const msgs = [
        { left: true, w: 0.55, y: 0 },
        { left: false, w: 0.5, y: 1 },
        { left: true, w: 0.4, y: 2 },
        { left: false, w: 0.6, y: 3 },
        { left: true, w: 0.35, y: 4 },
      ];
      const spacing = (ch - 90) / msgs.length;
      for (const m of msgs) {
        const bw = (cw - 48) * m.w;
        const bx = m.left ? 20 : cw - 20 - bw;
        c.fillStyle = m.left ? "rgba(10,60,50,0.18)" : "rgba(10,60,50,0.28)";
        c.beginPath(); c.roundRect(bx, 68 + m.y * spacing, bw, spacing * 0.6, 12); c.fill();
      }
    },
  },
  {
    label: "Invoices", bg: "#FFB868", edge: "#FFB868", w: 0.9, h: 0.9,
    draw: (c, cw, ch) => {
      const rows = 5, cols = 3;
      const gx = 20, gy = 65, gw = cw - 40, gh = ch - 85;
      const cellW = gw / cols, cellH = gh / rows;
      c.strokeStyle = "rgba(80,40,0,0.2)"; c.lineWidth = 1;
      for (let r = 0; r <= rows; r++) { c.beginPath(); c.moveTo(gx, gy + r * cellH); c.lineTo(gx + gw, gy + r * cellH); c.stroke(); }
      for (let co = 0; co <= cols; co++) { c.beginPath(); c.moveTo(gx + co * cellW, gy); c.lineTo(gx + co * cellW, gy + gh); c.stroke(); }
      c.fillStyle = "rgba(80,40,0,0.15)";
      for (let r = 0; r < rows; r++) for (let co = 0; co < cols; co++)
        c.fillRect(gx + co * cellW + 4, gy + r * cellH + 4, cellW - 8, cellH - 8);
    },
  },
];

function createWidgetTexture(def: WidgetDef): THREE.CanvasTexture {
  const TEX_W = 512;
  const TEX_H = Math.round(TEX_W * (def.h / def.w));
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W; canvas.height = TEX_H;
  const c = canvas.getContext("2d")!;
  c.clearRect(0, 0, TEX_W, TEX_H);
  c.fillStyle = def.bg;
  c.beginPath(); c.roundRect(6, 6, TEX_W - 12, TEX_H - 12, 32); c.fill();
  c.strokeStyle = "rgba(0,0,0,0.06)"; c.lineWidth = 2;
  c.beginPath(); c.roundRect(6, 6, TEX_W - 12, TEX_H - 12, 32); c.stroke();
  c.fillStyle = "#1a2744";
  c.font = `bold ${Math.round(TEX_W * 0.11)}px sans-serif`;
  c.textAlign = "center";
  c.fillText(def.label, TEX_W / 2, TEX_H * 0.15);
  def.draw(c, TEX_W, TEX_H);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// === Gaussian blob textures for fog ===
const fogBlobTextures = (() => {
  if (typeof document === "undefined") return [] as THREE.CanvasTexture[];
  const COLORS = ['#88BBFF', '#FF88C0', '#6CDBA0', '#FFD870', '#B090FF', '#FF9090', '#60D8E8', '#FFB868'];
  return COLORS.map((col) => {
    const sz = 256;
    const canvas = document.createElement("canvas");
    canvas.width = sz; canvas.height = sz;
    const c = canvas.getContext("2d")!;
    c.clearRect(0, 0, sz, sz);
    const grad = c.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
    grad.addColorStop(0, col + "FF");
    grad.addColorStop(0.35, col + "DD");
    grad.addColorStop(0.65, col + "88");
    grad.addColorStop(1, col + "00");
    c.fillStyle = grad;
    c.fillRect(0, 0, sz, sz);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  });
})();

// === Sub-components ===

const BORDER_R = S * 0.022;
const PanelEdges: React.FC<{ opacity: number }> = ({ opacity }) => {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(S * 2, S * 2, THICK)), []);
  const edges = useMemo(() => {
    const pos = geo.getAttribute("position");
    const segs: { mid: V3; rot: V3; len: number }[] = [];
    for (let i = 0; i < pos.count; i += 2) {
      const ax = pos.getX(i), ay = pos.getY(i), az = pos.getZ(i);
      const bx = pos.getX(i + 1), by = pos.getY(i + 1), bz = pos.getZ(i + 1);
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len < 0.001) continue;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
      const e = new THREE.Euler().setFromQuaternion(q);
      segs.push({ mid: [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2], rot: [e.x, e.y, e.z], len });
    }
    return segs;
  }, [geo]);
  return (
    <>
      {edges.map((e, j) => (
        <mesh key={j} position={e.mid} rotation={e.rot}>
          <cylinderGeometry args={[BORDER_R, BORDER_R, e.len, 4]} />
          <meshStandardMaterial color="#0d1525" transparent opacity={opacity} />
        </mesh>
      ))}
    </>
  );
};

const WidgetCard: React.FC<{
  pos: V3; quat: Q4; scale: number; opacity: number; def: WidgetDef; texture: THREE.CanvasTexture;
}> = ({ pos, quat, scale, opacity, def, texture }) => {
  if (scale < 0.01 || opacity < 0.01) return null;
  return (
    <group position={pos} quaternion={quat} scale={[scale, scale, scale]}>
      <mesh renderOrder={10}>
        <planeGeometry args={[S * def.w, S * def.h]} />
        <meshBasicMaterial map={texture} transparent opacity={opacity} side={THREE.DoubleSide} alphaTest={0.05} depthWrite />
      </mesh>
    </group>
  );
};

function lerp3(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const PanelMesh: React.FC<{
  pos: V3; quat: Q4; scaleXY: number; opacity: number; edgeOp: number;
  color: string; emissive: string; emissiveIntensity: number;
  dataTexture: THREE.CanvasTexture; dataOpacity: number;
  magicT: number;
}> = ({ pos, quat, scaleXY, opacity, edgeOp, color, emissive, emissiveIntensity, dataTexture, dataOpacity, magicT }) => {
  if (scaleXY < 0.003 || opacity < 0.003) return null;
  return (
    <group position={pos} quaternion={quat} scale={[scaleXY, scaleXY, 1]}>
      <mesh>
        <boxGeometry args={[S * 2, S * 2, THICK]} />
        <meshStandardMaterial
          color={color} emissive={emissive} emissiveIntensity={emissiveIntensity}
          transparent opacity={opacity}
          metalness={0.05} roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {dataOpacity > 0.01 && (
        <mesh position={[0, 0, THICK / 2 + 0.002]}>
          <planeGeometry args={[S * 2, S * 2]} />
          <meshBasicMaterial
            map={dataTexture} transparent opacity={dataOpacity}
            depthWrite={false} side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <PanelEdges opacity={edgeOp} />
    </group>
  );
};

// Box wireframe
const EDGE_R = S * 0.025;
const H = S;
const BOX_EDGES: { mid: V3; len: number; axis: "x" | "y" | "z" }[] = [
  { mid: [0, -H, -H], len: H * 2, axis: "x" }, { mid: [0, -H, H], len: H * 2, axis: "x" },
  { mid: [-H, -H, 0], len: H * 2, axis: "z" }, { mid: [H, -H, 0], len: H * 2, axis: "z" },
  { mid: [0, H, -H], len: H * 2, axis: "x" }, { mid: [0, H, H], len: H * 2, axis: "x" },
  { mid: [-H, H, 0], len: H * 2, axis: "z" }, { mid: [H, H, 0], len: H * 2, axis: "z" },
  { mid: [-H, 0, -H], len: H * 2, axis: "y" }, { mid: [H, 0, -H], len: H * 2, axis: "y" },
  { mid: [H, 0, H], len: H * 2, axis: "y" }, { mid: [-H, 0, H], len: H * 2, axis: "y" },
];
const AXIS_ROT: Record<"x" | "y" | "z", V3> = {
  x: [0, 0, Math.PI / 2], y: [0, 0, 0], z: [Math.PI / 2, 0, 0],
};
const BoxEdges: React.FC<{ opacity: number }> = ({ opacity }) => {
  if (opacity < 0.01) return null;
  return (
    <>
      {BOX_EDGES.map((e, i) => (
        <mesh key={i} position={e.mid} rotation={AXIS_ROT[e.axis]}>
          <cylinderGeometry args={[EDGE_R, EDGE_R, e.len, 4]} />
          <meshStandardMaterial color="#1a2744" transparent opacity={opacity} metalness={0.2} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
};

// Chain links
const CHAIN_CONNECTIONS: { a: number; b: number; dir: "x" | "z" }[] = [
  { a: 0, b: 1, dir: "x" }, { a: 1, b: 2, dir: "x" },
  { a: 3, b: 4, dir: "x" }, { a: 4, b: 5, dir: "x" },
  { a: 6, b: 7, dir: "x" }, { a: 7, b: 8, dir: "x" },
  { a: 0, b: 3, dir: "z" }, { a: 1, b: 4, dir: "z" },
  { a: 2, b: 5, dir: "z" }, { a: 3, b: 6, dir: "z" },
  { a: 4, b: 7, dir: "z" }, { a: 5, b: 8, dir: "z" },
];

const CHAIN_R = S * 0.1;
const CHAIN_TUBE = S * 0.022;
const chainGeo = new THREE.TorusGeometry(CHAIN_R, CHAIN_TUBE, 6, 16);
const halfChainGeo = new THREE.TorusGeometry(CHAIN_R, CHAIN_TUBE, 6, 8, Math.PI);

const CHAIN_APPEAR_ORDER = [4, 9, 1, 7, 11, 2, 6, 0, 10, 3, 8, 5];
const CHAIN_BREAK_ORDER = [7, 2, 10, 5, 0, 8, 3, 11, 6, 1, 9, 4];
const CHAIN_FLY: V3[] = [
  [-1, 0.5, 0.3], [1, 0.8, -0.2], [0.6, 0.4, 1], [-0.5, 0.7, -1],
  [1, 0.6, 0.5], [-1, 0.9, -0.4], [-0.8, 0.3, 0.7], [0.9, 0.5, -0.6],
  [0.4, 0.8, 1], [-0.7, 0.6, -0.8], [1, 0.4, -0.3], [-0.6, 0.7, 0.9],
];

const chainMat = { color: "#d0d0d0", metalness: 0.85, roughness: 0.15 };

// Pre-allocated objects for ChainLink (called ~12x per render)
const _chainEulerX = new THREE.Euler(0, 0, Math.PI / 2);
const _chainEulerZ = new THREE.Euler(0, Math.PI / 2, Math.PI / 2);
const _chainBaseQ = new THREE.Quaternion();
const _chainSpinQ = new THREE.Quaternion();
const _chainSpinAxis = new THREE.Vector3(0, 1, 0);
const _chainFinalQ = new THREE.Quaternion();

const ChainLink: React.FC<{
  pos: V3; dir: "x" | "z"; scaleXYZ: V3; opacity: number; threadSpin: number; splitT: number;
}> = ({ pos, dir, scaleXYZ, opacity, threadSpin, splitT }) => {
  if (opacity < 0.01) return null;
  _chainBaseQ.setFromEuler(dir === "x" ? _chainEulerX : _chainEulerZ);
  _chainSpinQ.setFromAxisAngle(_chainSpinAxis, threadSpin);
  _chainFinalQ.copy(_chainBaseQ).multiply(_chainSpinQ);
  const q: Q4 = [_chainFinalQ.x, _chainFinalQ.y, _chainFinalQ.z, _chainFinalQ.w];

  if (splitT < 0.01) {
    return (
      <mesh position={pos} quaternion={q} scale={scaleXYZ} geometry={chainGeo}>
        <meshStandardMaterial {...chainMat} transparent opacity={opacity} />
      </mesh>
    );
  }

  const sep = splitT * CHAIN_R * 4;
  const tumble = splitT * Math.PI * 2;
  return (
    <group position={pos} quaternion={q} scale={scaleXYZ}>
      <mesh position={[0, sep, 0]} rotation={[tumble * 0.4, 0, tumble * 0.6]} geometry={halfChainGeo}>
        <meshStandardMaterial {...chainMat} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, -sep, 0]} rotation={[-tumble * 0.3, Math.PI, -tumble * 0.5]} geometry={halfChainGeo}>
        <meshStandardMaterial {...chainMat} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

// ═══════════════════════════════════════════════════
// Main scene - uses useFrame to drive elapsed time
// ═══════════════════════════════════════════════════

const BoxAnimationScene: React.FC<{
  onTimeUpdate?: React.MutableRefObject<((time: number) => void) | undefined>;
  manualTimeRef?: React.MutableRefObject<number>;
}> = ({ onTimeUpdate, manualTimeRef }) => {
  const elapsedRef = useRef(0);
  const lastRenderTime = useRef(0);
  const isComplete = useRef(false);
  const [, setTick] = React.useState(0);

  // Pre-allocated reusable THREE objects to avoid GC pressure during animation.
  // Creating new Color/Vector3/Quaternion objects every render causes 180ms GC pauses.
  const _tmpColor = useMemo(() => new THREE.Color(), []);
  const _tmpColor2 = useMemo(() => new THREE.Color(), []);
  const _tmpColor3 = useMemo(() => new THREE.Color(), []);
  const _tmpAvgColor = useMemo(() => new THREE.Color(), []);
  const _panelColors = useMemo(() => PANEL_COLORS.map(c => new THREE.Color(c)), []);
  const _flapColors = useMemo(() => ['#FF80C8', '#60D8FF', '#FFB060', '#60FF90'].map(c => new THREE.Color(c)), []);

  const frameSkip = useRef(0);
  const fpsFrames = useRef(0);
  const fpsLastLog = useRef(performance.now());
  useFrame((_, delta) => {
    if (manualTimeRef) {
      elapsedRef.current = manualTimeRef.current;
    } else {
      const dt = Math.min(delta, 0.1);
      if (elapsedRef.current < 38) {
        elapsedRef.current += dt;
      }
    }
    // FPS counter — logs every 2 seconds
    fpsFrames.current++;
    const now = performance.now();
    if (now - fpsLastLog.current >= 2000) {
      const fps = fpsFrames.current / ((now - fpsLastLog.current) / 1000);
      console.log(`[PERF] R3F render loop: ${fps.toFixed(1)} fps | delta: ${(delta * 1000).toFixed(1)}ms | elapsed: ${elapsedRef.current.toFixed(1)}s`);
      fpsFrames.current = 0;
      fpsLastLog.current = now;
    }
    onTimeUpdate?.current?.(elapsedRef.current);
    // Stop re-rendering once animation is complete — scene is static
    if (elapsedRef.current >= 38 && !manualTimeRef) {
      if (!isComplete.current) {
        isComplete.current = true;
        setTick(t => t + 1); // one final render
      }
      return;
    }
    // Re-render React tree at ~20fps instead of 60fps to reduce reconciliation cost
    frameSkip.current++;
    if (frameSkip.current >= 3) {
      frameSkip.current = 0;
      setTick(t => t + 1);
    }
  });

  const time = elapsedRef.current;

  // === Timeline keypoints in seconds ===
  const tAppear = 1.0;
  const tGather = 8.0;
  const tHold = 13.0;
  const tSpread = 17.0;
  const tWallStart = 17.0;
  const tWallDone = 22.0;
  const tFlapRise = 19.0;
  const tFlapDone = 23.0;
  const tSettle = 29.0;
  const tWidgetStart = 22.0;
  const tWidgetGap = 0.4;
  const tFlapStart = 29.5;
  const tFlapGap = 0.7;
  const tFlapDur = 0.8;

  // Camera spin
  const camRotX = interp(time, [tHold, tSettle], [Math.PI / 2, ISO_X],
    Easing.bezier(0.2, 0.0, 0.2, 1.0));
  const camRotY = interp(time, [tHold, tSettle], [0, CUBE_ROT + Math.PI * 2],
    Easing.bezier(0.2, 0.0, 0.2, 1.0));

  // Front flip removed — video takes over after lids close
  const flipAngle = 0;

  // Spread
  const spread = interp(time, [tHold, tWallDone, tSettle], [0, 1.2, 0],
    Easing.inOut(Easing.cubic));

  // Wall fold
  const wallT = interp(time, [tWallStart, tWallDone], [0, 1],
    Easing.inOut(Easing.cubic));

  // Corner/flap rise
  const flapT = interp(time, [tFlapRise, tFlapDone], [0, 1],
    Easing.inOut(Easing.cubic));

  // Box edges fade in
  const edgeOp = interp(time, [tSettle, tSettle + 0.3], [0, 0.95]);

  // Grow panels
  const GRID_SC = 0.36;
  const growT = interp(time, [tSpread, tFlapDone], [0, 1],
    Easing.in(Easing.cubic));
  const scBase = GRID_SC + (1 - GRID_SC) * growT;

  // Pull-in delays (seconds from tAppear)
  const PULL_DELAYS = [
    2.8, 1.4, 3.6, 0.6, 0.0, 2.2, 3.2, 1.8, 4.0,
  ];

  const panels = GRID.map((gridPos, i) => {
    const def = PANELS[i];
    const pullDelay = PULL_DELAYS[i];

    const appear = interp(time - pullDelay, [0, tAppear], [0, 1],
      Easing.out(Easing.cubic));

    // Gather
    const gatherT = interp(time, [tAppear + pullDelay, tGather + 0.5], [0, 1],
      Easing.bezier(0.25, 0.1, 0.25, 1.0));
    const startPos: V3 = [gridPos[0] * 2.5, gridPos[1], gridPos[2] * 2.5];
    const gathered = lerp3(startPos, gridPos, gatherT);

    // Spread
    const cx = gathered[0] !== 0 ? Math.sign(gathered[0]) * S * spread : 0;
    const cz = gathered[2] !== 0 ? Math.sign(gathered[2]) * S * spread : 0;
    const curPos: V3 = [gathered[0] + cx, gathered[1], gathered[2] + cz];

    let pos: V3;
    let quat: Q4;

    if (def.type === "flap" && def.flapIdx !== undefined) {
      const fd = FLAP_DEFS[def.flapIdx];
      const angle = OPEN_ANGLE * flapT;
      const state = hingeState(fd, angle);
      pos = lerp3(curPos, state.pos, flapT);
      quat = state.quat;

      // After settling: flap close
      const flapCloseStart = tFlapStart + def.flapIdx * tFlapGap;
      const flapCloseT = interp(time, [flapCloseStart, flapCloseStart + tFlapDur], [0, 1],
        Easing.inOut(Easing.cubic));
      if (flapCloseT > 0) {
        const s = hingeState(fd, OPEN_ANGLE * (1 - flapCloseT));
        pos = s.pos;
        quat = s.quat;
      }
    } else if (def.type === "wall" && def.wallIdx !== undefined) {
      const wd = WALL_DEFS[def.wallIdx];
      const state = hingeState(wd, (Math.PI / 2) * wallT);
      pos = lerp3(curPos, state.pos, wallT);
      quat = state.quat;
    } else {
      pos = lerp3(gathered, [0, -S, 0] as V3, wallT);
      quat = FLAT_QUAT;
    }

    const scaleXY = scBase * appear;

    // Color: vibrant pastel -> neighbor spill -> desaturate to gray -> MAGIC recolor
    // Uses pre-allocated _tmpColor objects to avoid GC pressure
    const col = _tmpColor.copy(_panelColors[i]);
    const spillAmt = interp(time, [tGather, tHold], [0, 0.25]);
    if (spillAmt > 0) {
      _tmpAvgColor.setRGB(0, 0, 0);
      NEIGHBORS[i].forEach(ni => _tmpAvgColor.add(_panelColors[ni]));
      _tmpAvgColor.multiplyScalar(1 / NEIGHBORS[i].length);
      col.lerp(_tmpAvgColor, spillAmt);
    }
    const grayT2 = interp(time, [tHold + 3.5, tSpread + 3], [0, 1],
      Easing.inOut(Easing.cubic));
    const emissiveCol = _tmpColor2.copy(col);
    col.lerp(GRAY_COLOR, grayT2);

    // Widget phase
    const isBoxPanel = def.type === "wall" || def.type === "bottom";
    const isFlap = def.type === "flap";
    let closingColor = 0;
    if (isBoxPanel) {
      const widgetGlow = interp(time, [tWidgetStart + 1.8, tWidgetStart + 6], [0, 0.9],
        Easing.out(Easing.cubic));
      if (widgetGlow > 0) {
        col.copy(GRAY_COLOR).lerp(_panelColors[i], widgetGlow);
        emissiveCol.copy(_panelColors[i]).multiplyScalar(widgetGlow * 0.5);
      }
    }

    // Flaps: unified top color
    if (isFlap) {
      const flapProgress = interp(time, [tFlapStart, tFlapStart + 4 * tFlapGap + tFlapDur], [0, 4]);
      const colorIdx = Math.min(Math.floor(flapProgress), 3);
      const colorBlend = flapProgress - colorIdx;
      const nextIdx = Math.min(colorIdx + 1, 3);
      _tmpColor3.copy(_flapColors[colorIdx]).lerp(_flapColors[nextIdx], colorBlend);

      closingColor = def.flapIdx !== undefined
        ? interp(time, [tFlapStart + def.flapIdx * tFlapGap, tFlapStart + def.flapIdx * tFlapGap + tFlapDur], [0, 0.9],
            Easing.out(Easing.cubic))
        : 0;

      if (closingColor > 0) {
        col.copy(GRAY_COLOR).lerp(_tmpColor3, closingColor);
        emissiveCol.copy(_tmpColor3).multiplyScalar(closingColor * 0.5);
      }
    }

    // Post-close: box fully transforms to colorful
    const fAllClosed = tFlapStart + 4 * tFlapGap + tFlapDur;
    const transformT = interp(time, [fAllClosed, fAllClosed + 3], [0, 1],
      Easing.inOut(Easing.cubic));
    if (transformT > 0) {
      col.lerp(_panelColors[i], 0.6 + transformT * 0.4);
    }

    // When color is active, boost opacity + emissive
    const colorAmount = isBoxPanel
      ? interp(time, [tWidgetStart, tWidgetStart + 2], [0, 0.8], Easing.out(Easing.cubic))
      : closingColor;
    const totalColor = Math.max(colorAmount, transformT);

    const color = `#${col.getHexString()}`;
    const emissive = `#${col.getHexString()}`;
    const emissiveIntensity = totalColor * 0.6 + transformT * 0.3;

    const panelOp = 0.5 + 0.5 * Math.max(1 - grayT2, totalColor);
    const opacity = panelOp * appear;

    const dataOpacity = (1 - grayT2) * appear;

    const magicT = interp(time, [tWidgetStart, tWidgetStart + 1.5, tFlapStart, tFlapStart + tFlapDur * 4 + 2], [0, 0.9, 1.0, 0.6]);
    return { pos, quat, scaleXY, opacity, color, emissive, emissiveIntensity, dataOpacity, magicT };
  });

  // === Chain links ===
  const tChainAppear = tGather;
  const tChainStagger = 0.2;
  const tChainBreak = tHold + 1;
  const tChainBreakStagger = 0.25;
  const tChainFlyDur = 0.6;

  const chains = CHAIN_CONNECTIONS.map((conn, ci) => {
    const pa = panels[conn.a];
    const pb = panels[conn.b];
    const midPos: V3 = [
      (pa.pos[0] + pb.pos[0]) / 2,
      (pa.pos[1] + pb.pos[1]) / 2,
      (pa.pos[2] + pb.pos[2]) / 2,
    ];

    const aIdx = CHAIN_APPEAR_ORDER[ci];
    const aStart = tChainAppear + aIdx * tChainStagger;
    const appearT = interp(time, [aStart, aStart + 0.6], [0, 1],
      Easing.out(Easing.cubic));
    const threadSpin = (1 - appearT) * Math.PI * 3;

    const bIdx = CHAIN_BREAK_ORDER[ci];
    const bStart = tChainBreak + bIdx * tChainBreakStagger;
    const stretchT = interp(time, [tHold, bStart], [0, 1],
      Easing.in(Easing.quad));
    const squeezeCross = 1 - stretchT * 0.3;

    const breakT = interp(time, [bStart, bStart + 0.15], [0, 1],
      Easing.in(Easing.cubic));
    const flyT = interp(time, [bStart, bStart + tChainFlyDur], [0, 1],
      Easing.out(Easing.cubic));
    const fly = CHAIN_FLY[ci];
    const flyDist = S * 2;
    const pos: V3 = [
      midPos[0] + fly[0] * flyDist * flyT,
      midPos[1] + fly[1] * flyDist * flyT,
      midPos[2] + fly[2] * flyDist * flyT,
    ];

    const sc = appearT;
    const stretchAxis = stretchT * 0.5;
    const scaleXYZ: V3 = [sc * squeezeCross, sc * (1 + stretchAxis), sc * squeezeCross];

    const splitT = interp(time, [bStart, bStart + tChainFlyDur], [0, 1],
      Easing.out(Easing.cubic));

    const opacity = appearT * interp(flyT, [0, 0.4, 1], [1, 0.7, 0]);

    return { pos, dir: conn.dir, scaleXYZ, opacity, threadSpin, splitT };
  });

  // === Textures (created once) ===
  const panelDataTextures = useMemo(() => Array.from({ length: 9 }, (_, i) => createPanelDataTexture(i)), []);
  const widgetTextures = useMemo(() => WIDGETS.map(createWidgetTexture), []);

  // === Widget animations (pre-allocated to avoid GC) ===
  const _widgetGroupQ = useMemo(() => new THREE.Quaternion(), []);
  const _widgetBillQ = useMemo(() => new THREE.Quaternion(), []);
  const _widgetTiltQ = useMemo(() => new THREE.Quaternion(), []);
  const _widgetFaceQ = useMemo(() => new THREE.Quaternion(), []);
  const _scratchEuler = useMemo(() => new THREE.Euler(), []);
  _scratchEuler.set(camRotX + flipAngle, camRotY, 0);
  _widgetGroupQ.setFromEuler(_scratchEuler);
  _widgetBillQ.copy(_widgetGroupQ).invert();
  const groupQ = _widgetGroupQ;
  const billQ = _widgetBillQ;

  const STARTS: V3[] = [
    [-S * 1, S * 5, S * 0.3], [S * 0.8, S * 5.5, -S * 0.3],
    [-S * 0.5, S * 6, -S * 0.8], [S * 0.5, S * 5, S * 0.8],
    [-S * 1.2, S * 5.5, -S * 0.5], [S * 1.2, S * 5, S * 0.5],
    [-S * 0.3, S * 6.5, S * 0.6], [S * 0.3, S * 6, -S * 0.6],
    [-S * 0.8, S * 5.5, S * 1], [S * 0.8, S * 5, -S * 1],
  ];

  const widgets = WIDGETS.map((_, wi) => {
    const wStart = tWidgetStart + wi * tWidgetGap;
    const wDur = 4.0;

    const t = interp(time, [wStart, wStart + wDur], [0, 1],
      Easing.bezier(0.22, 0.0, 0.2, 1.0));

    if (t <= 0) return null;

    const start = STARTS[wi % STARTS.length];
    const landX = (wi % 3 - 1) * S * 0.12;
    const landZ = (Math.floor(wi / 3) - 1.5) * S * 0.12;
    const landY = -S * 1.2;

    const x = start[0] + (landX - start[0]) * t;
    const z = start[2] + (landZ - start[2]) * t;
    const y = start[1] + (landY - start[1]) * Easing.inOut(Easing.cubic)(t);

    const tumble = (1 - t) * 0.5;
    _scratchEuler.set(
      Math.sin(wi * 2.1 + t * 3) * tumble,
      Math.cos(wi * 1.7 + t * 2) * tumble,
      Math.sin(wi * 3.3 + t * 4) * tumble * 0.4,
    );
    _widgetTiltQ.setFromEuler(_scratchEuler);
    const faceQ = _widgetFaceQ.copy(billQ).multiply(_widgetTiltQ);

    const opacity = interp(t, [0, 0.1], [0, 1]);
    const scale = interp(t, [0, 0.15, 0.55, 0.75], [0.5, 1, 1, 0]);

    return {
      pos: [x, y, z] as V3,
      quat: [faceQ.x, faceQ.y, faceQ.z, faceQ.w] as Q4,
      opacity,
      scale,
      texIdx: wi,
    };
  });

  // === Light rays ===
  const rayElements = useMemo(() => {
    // This is a structure placeholder; the actual values are computed per-frame below
    return null;
  }, []);

  const rayT = interp(time, [tWidgetStart + 1.8, tWidgetStart + 5, tFlapStart, tFlapStart + tFlapDur], [0, 0.6, 1.0, 0]);

  const rays: React.ReactNode[] = [];
  if (rayT >= 0.01) {
    const RAY_COLORS = ['#FFE888', '#FFCC44', '#FFF0BB', '#FFD870', '#FFFFDD', '#FFE0A0'];
    const RAY_COUNT = 24;
    for (let ri = 0; ri < RAY_COUNT; ri++) {
      const angle = (ri / RAY_COUNT) * Math.PI * 2 + time * 0.15;
      const tilt = 0.5 + Math.sin(ri * 2.3) * 0.35;
      const rayH = S * (10 + Math.sin(time * 1.5 + ri * 0.8) * 3) * rayT;
      const rayW = S * (0.004 + Math.sin(ri * 3.1) * 0.002);
      const px = Math.sin(angle) * S * 0.5;
      const pz = Math.cos(angle) * S * 0.5;
      const op = rayT * (0.12 + Math.sin(time * 2 + ri * 1.5) * 0.05);
      const col = RAY_COLORS[ri % RAY_COLORS.length];
      rays.push(
        <mesh key={`ray${ri}`}
          position={[px, S * 0.2 + Math.sin(ri * 1.7) * S * 0.4, pz]}
          rotation={[tilt * Math.cos(angle), 0, -tilt * Math.sin(angle)]}
        >
          <planeGeometry args={[rayW, rayH]} />
          <meshBasicMaterial color={col} transparent opacity={op} side={THREE.DoubleSide} depthWrite={false} depthTest={false} />
        </mesh>
      );
    }

    // Particles flowing upward
    const PARTICLE_COLORS = ['#FFE888', '#FF88C0', '#88BBFF', '#6CDBA0', '#B090FF', '#FFD870'];
    const PARTICLE_COUNT = 15;
    for (let pi = 0; pi < PARTICLE_COUNT; pi++) {
      const seed = pi * 47.3;
      const pAngle = (seed * 1.3) % (Math.PI * 2);
      const pTilt = 0.3 + Math.sin(seed * 0.7) * 0.25;
      const life = ((time * 0.8 + seed * 0.1) % 2.0) / 2.0;
      const pRadius = S * (0.2 + Math.sin(seed * 2.1) * 0.15);
      const ppx = Math.sin(pAngle) * pRadius + Math.sin(pAngle) * life * pTilt * S * 3;
      const ppy = -S * 0.3 + life * S * 8;
      const ppz = Math.cos(pAngle) * pRadius + Math.cos(pAngle) * life * pTilt * S * 3;
      const pOp = rayT * (1 - life) * 0.5;
      if (pOp < 0.02) continue;
      const pSz = S * 0.03 * (1 - life * 0.7);
      const pCol = PARTICLE_COLORS[pi % PARTICLE_COLORS.length];
      rays.push(
        <sprite key={`rp${pi}`} position={[ppx, ppy, ppz]} scale={[pSz, pSz, 1]}>
          <spriteMaterial color={pCol} transparent opacity={pOp} depthWrite={false} depthTest={false} />
        </sprite>
      );
    }
  }

  // === Fog blobs ===
  const fogLevel = interp(time, [tWidgetStart + 1.8, tWidgetStart + 5, tFlapStart], [0, 0.6, 1.0]);
  const fogElements: React.ReactNode[] = [];
  if (fogLevel >= 0.01 && fogBlobTextures.length > 0) {
    const COUNT = 20;
    for (let fi = 0; fi < COUNT; fi++) {
      const seed = fi * 73.7;
      const px = Math.sin(seed * 1.3 + time * 0.5) * S * 0.6;
      const baseY = -S + (Math.sin(seed * 0.7) * 0.5 + 0.5) * S * 2;
      const py = baseY + Math.sin(time * 1.2 + seed) * S * 0.25;
      const pz = Math.cos(seed * 0.9 + time * 0.4) * S * 0.6;
      const heightNorm = (baseY + S) / (S * 2);
      const visible = fogLevel - heightNorm;
      if (visible <= 0) continue;
      const distFromCenter = Math.sqrt(px * px + pz * pz) / S;
      const edgeFade = 1.0 - Math.pow(Math.min(distFromCenter / 0.8, 1.0), 2.0);
      const op = Math.min(visible * 4.0, 1.0) * edgeFade;
      const sz = S * (0.9 + Math.sin(seed * 2.1) * 0.5);
      const tex = fogBlobTextures[fi % fogBlobTextures.length];
      fogElements.push(
        <sprite key={`fog${fi}`} position={[px, py, pz]} scale={[sz, sz, 1]}>
          <spriteMaterial map={tex} transparent opacity={op} depthWrite={false} depthTest={false} />
        </sprite>
      );
    }
  }

  // Scene scale: start big (1.6x), ease down to 1.0 as box closes
  const sceneScale = interp(time, [0, tSettle], [1.6, 1.0],
    Easing.inOut(Easing.cubic));

  return (
    <group rotation={[camRotX + flipAngle, camRotY, 0]} scale={[sceneScale, sceneScale, sceneScale]}>
      {panels.map((p, i) => (
        <PanelMesh key={i} pos={p.pos} quat={p.quat}
          scaleXY={p.scaleXY} opacity={p.opacity} edgeOp={1}
          color={p.color} emissive={p.emissive} emissiveIntensity={p.emissiveIntensity}
          dataTexture={panelDataTextures[i]} dataOpacity={p.dataOpacity}
          magicT={p.magicT} />
      ))}
      {chains.map((ch, i) => (
        <ChainLink key={`ch${i}`} pos={ch.pos} dir={ch.dir} scaleXYZ={ch.scaleXYZ} opacity={ch.opacity} threadSpin={ch.threadSpin} splitT={ch.splitT} />
      ))}
      <BoxEdges opacity={edgeOp} />
      {widgets.map((w, i) =>
        w ? (
          <WidgetCard
            key={`w${i}`}
            pos={w.pos}
            quat={w.quat}
            scale={w.scale}
            opacity={w.opacity}
            def={WIDGETS[w.texIdx]}
            texture={widgetTextures[w.texIdx]}
          />
        ) : null,
      )}
      {rays.length > 0 && <>{rays}</>}
      {fogElements.length > 0 && <>{fogElements}</>}
    </group>
  );
};

// ═══════════════════════════════════════════════════
// Exported wrapper with Canvas, camera, and lights
// ═══════════════════════════════════════════════════

export interface BoxAnimationProps {
  className?: string;
  style?: React.CSSProperties;
  onTimeUpdate?: (time: number) => void;
  preserveDrawingBuffer?: boolean;
  /** When set, animation advances only when this ref's value increases (frame-step mode for recording) */
  manualTimeRef?: React.MutableRefObject<number>;
}

export const BoxAnimation: React.FC<BoxAnimationProps> = ({ className, style, onTimeUpdate, preserveDrawingBuffer = false, manualTimeRef }) => {
  const timeCallbackRef = useRef(onTimeUpdate);
  timeCallbackRef.current = onTimeUpdate;
  // Delay Canvas creation by one frame so StrictMode's unmount can release the
  // previous WebGL context before we allocate a new one (prevents 2 competing canvases).
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => { cancelAnimationFrame(id); setReady(false); };
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "100%", ...style }}>
      {ready && (
      <Canvas
        orthographic
        camera={{ zoom: 55, position: [0, 0, 10], near: 0.1, far: 100 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer }}
        dpr={1}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 10]} intensity={1.2} />
        <directionalLight position={[-3, -2, -8]} intensity={0.3} />
        <BoxAnimationScene onTimeUpdate={timeCallbackRef} manualTimeRef={manualTimeRef} />
      </Canvas>
      )}
    </div>
  );
};

export default BoxAnimation;
