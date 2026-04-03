import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Abstract mini-widgets ─────────────────────────────────────────────── */

const WCalendar = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-0.5">
    <div className="h-1.5 rounded-full w-1/2" style={{ background: c }} />
    <div className="flex-1 grid grid-cols-5 grid-rows-3 gap-px">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="rounded-sm" style={{ background: i === 7 ? c : `${c}18` }} />
      ))}
    </div>
  </div>
);

const WChat = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col justify-end gap-1.5">
    <div className="self-start rounded-full h-2 w-3/5" style={{ background: `${c}20` }} />
    <div className="self-end rounded-full h-2 w-2/5" style={{ background: c }} />
    <div className="self-start rounded-full h-2 w-1/2" style={{ background: `${c}20` }} />
  </div>
);

const WLines = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[1, 0.5, 0.3].map((op, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c, opacity: op }} />
        <div className="h-1.5 rounded-full flex-1" style={{ background: `${c}18` }} />
      </div>
    ))}
  </div>
);

const WDots = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex items-center justify-center">
    <div className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i === 4 ? c : `${c}20` }} />
      ))}
    </div>
  </div>
);

const WBars = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex items-end justify-center gap-1">
    {[35, 55, 45, 70, 60, 80, 50].map((h, i) => (
      <div key={i} className="w-1.5 rounded-t" style={{ height: `${h}%`, background: c, opacity: 0.3 + (h / 100) * 0.7 }} />
    ))}
  </div>
);

const WChecks = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[true, true, false, false].map((on, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: on ? c : `${c}20` }} />
        <div className="h-1 rounded-full flex-1" style={{ background: `${c}${on ? '12' : '20'}` }} />
      </div>
    ))}
  </div>
);

const WWave = ({ c }: { c: string }) => (
  <div className="w-full h-full flex items-center justify-center gap-px px-3">
    {[3, 5, 8, 6, 10, 5, 7, 11, 6, 4, 9, 5, 7].map((h, i) => (
      <div key={i} className="w-1 rounded-full" style={{ height: h * 3, background: c, opacity: 0.4 + (h / 11) * 0.6 }} />
    ))}
  </div>
);

const WKanban = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex gap-1.5">
    {[3, 2, 4].map((n, i) => (
      <div key={i} className="flex-1 flex flex-col gap-1">
        <div className="h-1 rounded-full" style={{ background: c, opacity: 0.3 + i * 0.25 }} />
        {Array.from({ length: n }).map((_, j) => (
          <div key={j} className="h-2.5 rounded-sm" style={{ background: `${c}${12 + i * 6}` }} />
        ))}
      </div>
    ))}
  </div>
);

const WPath = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 50 30" className="w-full h-full">
      <path d="M4,24 Q15,2 25,15 T46,6" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="4" cy="24" r="3" fill={c} opacity="0.7" />
      <circle cx="46" cy="6" r="3" fill={c} opacity="0.7" />
    </svg>
  </div>
);

const WTimer = ({ c }: { c: string }) => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative" style={{ borderColor: `${c}30` }}>
      <div className="absolute w-0.5 h-3 rounded-full origin-bottom -translate-y-1/2 rotate-[-30deg]" style={{ background: c }} />
      <div className="absolute w-0.5 h-2 rounded-full origin-bottom -translate-y-1/2 rotate-[60deg]" style={{ background: `${c}60` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
    </div>
  </div>
);

const WPeople = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[0.8, 0.5, 0.3].map((op, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c, opacity: op }} />
        <div className="h-1 rounded-full flex-1" style={{ background: `${c}15` }} />
      </div>
    ))}
  </div>
);

const WCard = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2.5 flex items-center justify-center">
    <div className="w-full h-full rounded-lg flex flex-col justify-between p-2" style={{ background: `${c}12` }}>
      <div className="w-4 h-3 rounded-sm" style={{ background: `${c}35` }} />
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-1 w-2.5 rounded-full" style={{ background: `${c}25` }} />)}
      </div>
    </div>
  </div>
);

const WTree = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 28" className="w-full h-full">
      <rect x="15" y="1" width="10" height="6" rx="1.5" fill={c} opacity="0.4" />
      <line x1="20" y1="7" x2="20" y2="10" stroke={c} strokeWidth="1" opacity="0.3" />
      <line x1="7" y1="10" x2="33" y2="10" stroke={c} strokeWidth="1" opacity="0.3" />
      <rect x="1" y="12" width="10" height="6" rx="1.5" fill={c} opacity="0.2" />
      <rect x="15" y="12" width="10" height="6" rx="1.5" fill={c} opacity="0.2" />
      <rect x="29" y="12" width="10" height="6" rx="1.5" fill={c} opacity="0.2" />
    </svg>
  </div>
);

const WNodes = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 30" className="w-full h-full">
      <circle cx="20" cy="15" r="4.5" fill={c} opacity="0.35" />
      <circle cx="6" cy="6" r="3" fill={c} opacity="0.15" />
      <circle cx="34" cy="7" r="3" fill={c} opacity="0.15" />
      <circle cx="7" cy="25" r="3" fill={c} opacity="0.15" />
      <circle cx="35" cy="24" r="3" fill={c} opacity="0.15" />
      <line x1="17" y1="12" x2="8" y2="8" stroke={c} strokeWidth="0.8" opacity="0.2" />
      <line x1="23" y1="12" x2="32" y2="8" stroke={c} strokeWidth="0.8" opacity="0.2" />
      <line x1="17" y1="18" x2="9" y2="23" stroke={c} strokeWidth="0.8" opacity="0.2" />
      <line x1="23" y1="18" x2="33" y2="23" stroke={c} strokeWidth="0.8" opacity="0.2" />
    </svg>
  </div>
);

const WMap = ({ c }: { c: string }) => (
  <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: `${c}08` }}>
    {[0, 1, 2].map(i => <div key={`h${i}`} className="absolute border-b left-0 right-0" style={{ top: `${25 + i * 25}%`, borderColor: `${c}10` }} />)}
    {[0, 1].map(i => <div key={`v${i}`} className="absolute border-r top-0 bottom-0" style={{ left: `${33 + i * 33}%`, borderColor: `${c}10` }} />)}
    <div className="absolute w-2.5 h-2.5 rounded-full" style={{ background: c, top: '22%', left: '28%', opacity: 0.7 }} />
    <div className="absolute w-2 h-2 rounded-full" style={{ background: c, top: '55%', left: '65%', opacity: 0.5 }} />
    <div className="absolute w-2 h-2 rounded-full" style={{ background: c, top: '72%', left: '22%', opacity: 0.35 }} />
  </div>
);

const WBlocks = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1">
    <div className="h-2.5 rounded-sm" style={{ background: `${c}15` }} />
    <div className="flex-1 rounded-sm flex items-center justify-center" style={{ background: `${c}08` }}>
      <div className="w-6 h-4 rounded-sm" style={{ background: `${c}20` }} />
    </div>
    <div className="flex gap-1">
      <div className="flex-1 h-2.5 rounded-sm" style={{ background: `${c}12` }} />
      <div className="flex-1 h-2.5 rounded-sm" style={{ background: `${c}12` }} />
    </div>
  </div>
);

const WFunnel = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 30" className="w-full h-full">
      <path d="M4,4 L36,4 L30,12 L10,12 Z" fill={c} opacity="0.2" />
      <path d="M10,14 L30,14 L26,22 L14,22 Z" fill={c} opacity="0.35" />
      <path d="M14,24 L26,24 L23,28 L17,28 Z" fill={c} opacity="0.55" />
    </svg>
  </div>
);

const WSlide = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2.5 flex items-center justify-center">
    <div className="w-full h-full rounded border flex flex-col items-center justify-center gap-1.5" style={{ borderColor: `${c}20`, background: `${c}05` }}>
      <div className="w-3/5 h-1 rounded-full" style={{ background: `${c}30` }} />
      <div className="w-2/5 h-1 rounded-full" style={{ background: `${c}15` }} />
    </div>
  </div>
);

const WForm = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="h-1 rounded-full w-2/5" style={{ background: `${c}25` }} />
    <div className="h-3 rounded border" style={{ borderColor: `${c}20`, background: `${c}05` }} />
    <div className="h-1 rounded-full w-1/2" style={{ background: `${c}25` }} />
    <div className="h-3 rounded border" style={{ borderColor: `${c}20`, background: `${c}05` }} />
  </div>
);

const WDoc = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1">
    <div className="h-1.5 rounded-full w-3/5" style={{ background: `${c}30` }} />
    <div className="h-1 rounded-full w-full" style={{ background: `${c}10` }} />
    <div className="h-1 rounded-full w-full" style={{ background: `${c}10` }} />
    <div className="h-1 rounded-full w-4/5" style={{ background: `${c}10` }} />
    <div className="h-1 rounded-full w-3/5" style={{ background: `${c}10` }} />
  </div>
);

const WAgent = ({ c }: { c: string }) => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${c}12` }}>
      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: `${c}22` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: c }} />
      </div>
    </div>
  </div>
);

const WTag = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: `${c}55` }} /><div className="h-1 rounded-full flex-1" style={{ background: `${c}15` }} /></div>
    <div className="flex gap-1 mt-auto">
      <div className="h-2 rounded-full" style={{ background: `${c}15`, width: '35%' }} />
      <div className="h-2 rounded-full" style={{ background: `${c}10`, width: '25%' }} />
    </div>
  </div>
);

const WSlots = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1">
    {[0.12, 0.45, 0.12, 0.25].map((op, i) => (
      <div key={i} className="h-2.5 rounded-sm" style={{ background: c, opacity: op }} />
    ))}
  </div>
);

const WLink = ({ c }: { c: string }) => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: `${c}35` }}>
      <div className="w-3 h-3 rounded-full" style={{ background: `${c}30` }} />
    </div>
  </div>
);

const WFiles = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 grid grid-cols-3 gap-1">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-sm" style={{ background: `${c}${10 + (i % 3) * 5}` }} />
    ))}
  </div>
);

const WSearch = ({ c }: { c: string }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="h-3 rounded-full" style={{ background: `${c}08`, border: `1px solid ${c}18` }} />
    <div className="h-1 rounded-full w-full" style={{ background: `${c}10` }} />
    <div className="h-1 rounded-full w-4/5" style={{ background: `${c}08` }} />
  </div>
);

const WWatch = ({ c }: { c: string }) => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: '#1e293b' }}>
      <div className="absolute w-0.5 h-3 rounded-full origin-bottom -translate-y-1/2 rotate-[-30deg]" style={{ background: c }} />
      <div className="absolute w-0.5 h-2 rounded-full origin-bottom -translate-y-1/2 rotate-[60deg]" style={{ background: '#94a3b8' }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
    </div>
  </div>
);

/* ─── App list with estimated standalone prices ─────────────────────────── */

type AppDef = { label: string; color: string; W: React.FC<{ c: string }>; price: number };

const apps: AppDef[] = [
  { label: 'Email', color: '#3b82f6', W: WLines, price: 6 },
  { label: 'Messenger', color: '#8b5cf6', W: WChat, price: 15 },
  { label: 'Phone', color: '#22c55e', W: WDots, price: 25 },
  { label: 'Tickets', color: '#f59e0b', W: WTag, price: 20 },
  { label: 'Calendar', color: '#6366f1', W: WCalendar, price: 8 },
  { label: 'Bookings', color: '#ec4899', W: WSlots, price: 25 },
  { label: 'Scheduling Links', color: '#14b8a6', W: WLink, price: 10 },
  { label: 'Dispatch', color: '#f97316', W: WMap, price: 40 },
  { label: 'Routes', color: '#84cc16', W: WPath, price: 30 },
  { label: 'Projects', color: '#a855f7', W: WKanban, price: 10 },
  { label: 'Tasks', color: '#ef4444', W: WChecks, price: 5 },
  { label: 'Time Tracking', color: '#06b6d4', W: WTimer, price: 10 },
  { label: 'CRM', color: '#3b82f6', W: WPeople, price: 25 },
  { label: 'Products', color: '#22c55e', W: WCard, price: 15 },
  { label: 'Invoicing', color: '#f59e0b', W: WDoc, price: 20 },
  { label: 'Payments', color: '#8b5cf6', W: WCard, price: 15 },
  { label: 'Voice Notes', color: '#ef4444', W: WWave, price: 8 },
  { label: 'Meeting Notes', color: '#6366f1', W: WDoc, price: 10 },
  { label: 'Assistant', color: '#a855f7', W: WChat, price: 20 },
  { label: 'Playbooks', color: '#14b8a6', W: WChecks, price: 15 },
  { label: 'Website Builder', color: '#06b6d4', W: WBlocks, price: 20 },
  { label: 'Creative Studio', color: '#ec4899', W: WAgent, price: 15 },
  { label: 'Marketing', color: '#f97316', W: WBars, price: 30 },
  { label: 'Reports', color: '#3b82f6', W: WBars, price: 15 },
  { label: 'Org Chart', color: '#8b5cf6', W: WTree, price: 5 },
  { label: 'Brain', color: '#ec4899', W: WNodes, price: 10 },
  { label: 'Slides', color: '#22c55e', W: WSlide, price: 12 },
  { label: 'Research', color: '#6366f1', W: WSearch, price: 15 },
  { label: 'Team Map', color: '#f59e0b', W: WMap, price: 10 },
  { label: 'Files', color: '#84cc16', W: WFiles, price: 8 },
  { label: 'Forms', color: '#14b8a6', W: WForm, price: 10 },
  { label: 'Agents', color: '#a855f7', W: WAgent, price: 20 },
  { label: 'People', color: '#f97316', W: WPeople, price: 8 },
  { label: 'Briefs', color: '#06b6d4', W: WDoc, price: 10 },
  { label: 'Watch', color: '#ef4444', W: WWatch, price: 5 },
  { label: 'Funnels', color: '#f59e0b', W: WFunnel, price: 20 },
];

const TOTAL_PRICE = apps.reduce((s, a) => s + a.price, 0);

/* ─── Grid layout ───────────────────────────────────────────────────────── */

const COLS = 8;
const CELL = 100;
const GAP = 12;
const BOX_R = 2;
const BOX_C = 3;

function isBox(r: number, c: number) {
  return r >= BOX_R && r < BOX_R + 2 && c >= BOX_C && c < BOX_C + 2;
}

function buildLayout() {
  const out: { app: AppDef; row: number; col: number; x: number; y: number }[] = [];
  let idx = 0;
  const rows = Math.ceil((apps.length + 4) / COLS);
  for (let r = 0; r < rows && idx < apps.length; r++) {
    for (let c = 0; c < COLS && idx < apps.length; c++) {
      if (isBox(r, c)) continue;
      out.push({ app: apps[idx], row: r, col: c, x: c * (CELL + GAP), y: r * (CELL + GAP) });
      idx++;
    }
  }
  return { items: out, rows };
}

const { items: layoutItems, rows: ROWS } = buildLayout();
const GW = COLS * CELL + (COLS - 1) * GAP;
const GH = ROWS * CELL + (ROWS - 1) * GAP;
const BOX_CX = BOX_C * (CELL + GAP) + CELL + GAP / 2;
const BOX_CY = BOX_R * (CELL + GAP) + CELL + GAP / 2;

/* ─── Isometric box ─────────────────────────────────────────────────────── */

/*
  Box coordinates:
    Opening: T(150,20) R(260,75) B(150,130) L(40,75)
    Bottom:  Tb(150,160) Rb(260,215) Bb(150,270) Lb(40,215)
    Wall height = 140
*/
const BOX_VB = "-60 -40 420 380";
const BOX_W = 240;
const BOX_H = 220;

// Magic colors that cycle for the shimmer rays
const MAGIC_HUES = ['#818cf8', '#c084fc', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#a78bfa'];

// Back half of the box — rendered BEHIND flying items (z-5)
const BoxBack: React.FC<{ progress: number; currentPrice: number }> = ({ progress, currentPrice }) => {
  const m = Math.min(1, progress * 1.5);
  // Wall colors shift from pale blue to vibrant as progress increases
  const wallL = progress > 0.3 ? `rgba(129,140,248,${0.12 + m * 0.15})` : undefined;
  const wallR = progress > 0.3 ? `rgba(167,139,250,${0.1 + m * 0.12})` : undefined;

  return (
    <div className="relative">
      {/* Multi-layer ambient glow — gets more colorful */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 35%,
            rgba(129,140,248,${0.05 + progress * 0.3}) 0%,
            rgba(192,132,252,${progress * 0.2}) 20%,
            rgba(244,114,182,${progress * 0.15}) 35%,
            rgba(251,146,60,${progress * 0.08}) 50%,
            transparent 65%)`,
          opacity: progress > 0 ? 1 : 0,
          transform: 'scale(3.5)',
          transition: 'opacity 0.5s',
        }}
      />
      {/* (rays rendered inside SVG below) */}
      <svg viewBox={BOX_VB} width={BOX_W} height={BOX_H} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="bxMagicB" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={m * 0.6} />
            <stop offset="25%" stopColor="#c084fc" stopOpacity={m * 0.45} />
            <stop offset="50%" stopColor="#f472b6" stopOpacity={m * 0.3} />
            <stop offset="75%" stopColor="#fb923c" stopOpacity={m * 0.15} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Shimmer highlight */}
          <linearGradient id="bxShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity={m * 0.15} />
            <stop offset="50%" stopColor="white" stopOpacity={m * 0.3} />
            <stop offset="100%" stopColor="white" stopOpacity={m * 0.1} />
          </linearGradient>
        </defs>

        {/* Light rays from box opening — thin lines fanning upward */}
        {m > 0.15 && [
          { angle: -25, color: '#818cf8' },
          { angle: -15, color: '#c084fc' },
          { angle: -5, color: '#f472b6' },
          { angle: 5, color: '#fb923c' },
          { angle: 15, color: '#34d399' },
          { angle: 25, color: '#818cf8' },
          { angle: -10, color: '#a78bfa' },
          { angle: 10, color: '#60a5fa' },
        ].map(({ angle, color }, i) => {
          const len = 120 + m * 180;
          const rad = (angle - 90) * Math.PI / 180;
          const x2 = 150 + Math.cos(rad) * len;
          const y2 = 75 + Math.sin(rad) * len;
          return (
            <line
              key={i}
              x1="150" y1="75"
              x2={x2} y2={y2}
              stroke={color}
              strokeWidth={0.6}
              opacity={m * 0.35}
              strokeLinecap="round"
            />
          );
        })}

        {/* Back flaps */}
        <path d="M150,20 L40,75 L-80,40 L30,-15 Z" fill={wallL || '#e0e7ff'} stroke="#a5b4fc" strokeWidth="1" />
        <path d="M150,20 L260,75 L380,40 L270,-15 Z" fill={wallR || '#dbeafe'} stroke="#a5b4fc" strokeWidth="1" />

        {/* Back walls */}
        <path d="M150,20 L40,75 L40,215 L150,160 Z" fill={wallL || '#e0e7ff'} stroke="#a5b4fc" strokeWidth="1" />
        <path d="M150,20 L260,75 L260,215 L150,160 Z" fill={wallR || '#dbeafe'} stroke="#a5b4fc" strokeWidth="1" />

        {/* Floor */}
        <path d="M40,215 L150,270 L260,215 L150,160 Z" fill="#eef2ff" stroke="#a5b4fc" strokeWidth="1" />

        {/* Magic glow on interior — multi-color */}
        {m > 0 && (
          <>
            <path d="M40,215 L150,270 L260,215 L150,160 Z" fill="url(#bxMagicB)" />
            <path d="M150,20 L40,75 L40,215 L150,160 Z" fill="url(#bxMagicB)" opacity={m * 0.5} />
            <path d="M150,20 L260,75 L260,215 L150,160 Z" fill="url(#bxMagicB)" opacity={m * 0.4} />
            {/* Shimmer on walls */}
            <path d="M150,20 L40,75 L40,215 L150,160 Z" fill="url(#bxShimmer)" />
            <path d="M150,20 L260,75 L260,215 L150,160 Z" fill="url(#bxShimmer)" />
          </>
        )}

        {/* Running price inside the box */}
        {currentPrice > 0 && (
          <text
            x="150" y="210"
            textAnchor="middle"
            fill="#818cf8"
            fontSize="22"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            opacity={Math.min(1, m + 0.3)}
          >
            ${currentPrice}/mo
          </text>
        )}
      </svg>
    </div>
  );
};

// Front half of the box — rendered IN FRONT of flying items (z-30)
const BoxFront: React.FC<{ progress: number }> = ({ progress }) => {
  const m = Math.min(1, progress * 1.5);
  const wallL = progress > 0.3 ? `rgba(129,140,248,${0.1 + m * 0.12})` : undefined;
  const wallR = progress > 0.3 ? `rgba(167,139,250,${0.08 + m * 0.1})` : undefined;

  return (
    <svg viewBox={BOX_VB} width={BOX_W} height={BOX_H} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="bxMagicF" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity={m * 0.35} />
          <stop offset="40%" stopColor="#c084fc" stopOpacity={m * 0.2} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bxShimF" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity={m * 0.1} />
          <stop offset="50%" stopColor="white" stopOpacity={m * 0.25} />
          <stop offset="100%" stopColor="white" stopOpacity={m * 0.08} />
        </linearGradient>
      </defs>

      {/* Front walls */}
      <path d="M40,75 L40,215 L150,270 L150,130 Z" fill={wallL || '#e8eeff'} stroke="#a5b4fc" strokeWidth="1" />
      <path d="M260,75 L260,215 L150,270 L150,130 Z" fill={wallR || '#dce5fd'} stroke="#a5b4fc" strokeWidth="1" />

      {/* Front wall magic + shimmer */}
      {m > 0 && (
        <>
          <path d="M40,75 L40,215 L150,270 L150,130 Z" fill="url(#bxMagicF)" />
          <path d="M260,75 L260,215 L150,270 L150,130 Z" fill="url(#bxMagicF)" />
          <path d="M40,75 L40,215 L150,270 L150,130 Z" fill="url(#bxShimF)" />
          <path d="M260,75 L260,215 L150,270 L150,130 Z" fill="url(#bxShimF)" />
        </>
      )}

      {/* Front flaps */}
      <path d="M40,75 L150,130 L50,200 L-60,145 Z" fill={wallL || '#e0e7ff'} stroke="#a5b4fc" strokeWidth="1" />
      <path d="M260,75 L150,130 L250,200 L360,145 Z" fill={wallR || '#dbeafe'} stroke="#a5b4fc" strokeWidth="1" />

      {/* Opening edge highlight — gets brighter */}
      <path d="M40,75 L150,20 L260,75 L150,130 Z" fill="none" stroke="#818cf8" strokeWidth={1.5 + m} opacity={0.4 + m * 0.4} />
    </svg>
  );
};

// Animated closing box — flaps fold shut, then ribbon/bow appear
const ClosingBox: React.FC<{ phase: 'closing' | 'present' }> = ({ phase }) => {
  const [ribbonIn, setRibbonIn] = useState(false);

  useEffect(() => {
    if (phase === 'closing') {
      const t = setTimeout(() => setRibbonIn(true), 900);
      return () => clearTimeout(t);
    } else {
      setRibbonIn(true);
    }
  }, [phase]);

  // Flap paths: open → closed
  // Open positions (same as the open box flaps)
  // Closed positions: each flap folds flat onto its quarter of the top diamond
  const flaps = [
    {
      // Back-left: hinge T→L
      open: 'M150,20 L40,75 L-80,40 L30,-15 Z',
      closed: 'M150,20 L40,75 L150,75 L150,20 Z',
      fill: '#818cf8',
    },
    {
      // Back-right: hinge T→R
      open: 'M150,20 L260,75 L380,40 L270,-15 Z',
      closed: 'M150,20 L260,75 L150,75 L150,20 Z',
      fill: '#7c3aed',
    },
    {
      // Front-left: hinge L→B
      open: 'M40,75 L150,130 L50,200 L-60,145 Z',
      closed: 'M40,75 L150,130 L150,75 L40,75 Z',
      fill: '#6366f1',
    },
    {
      // Front-right: hinge R→B
      open: 'M260,75 L150,130 L250,200 L360,145 Z',
      closed: 'M260,75 L150,130 L150,75 L260,75 Z',
      fill: '#a78bfa',
    },
  ];

  return (
    <div className="relative">
      {/* Celebration glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(129,140,248,0.3) 0%, rgba(192,132,252,0.2) 25%, rgba(244,114,182,0.1) 40%, transparent 55%)',
          transform: 'scale(3.5)',
        }}
      />
      <svg viewBox={BOX_VB} width={BOX_W} height={BOX_H} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gWallL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="gWallR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="gFloor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="gRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Walls — transition from pale to vivid */}
        <motion.path
          d="M150,20 L40,75 L40,215 L150,160 Z"
          initial={{ fill: '#e0e7ff' }}
          animate={{ fill: '#6366f1' }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d="M150,20 L260,75 L260,215 L150,160 Z"
          initial={{ fill: '#dbeafe' }}
          animate={{ fill: '#7c3aed' }}
          transition={{ duration: 0.6 }}
        />
        {/* Floor */}
        <path d="M40,215 L150,270 L260,215 L150,160 Z" fill="url(#gFloor)" />
        {/* Front walls */}
        <motion.path
          d="M40,75 L40,215 L150,270 L150,130 Z"
          initial={{ fill: '#e8eeff' }}
          animate={{ fill: '#818cf8' }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d="M260,75 L260,215 L150,270 L150,130 Z"
          initial={{ fill: '#dce5fd' }}
          animate={{ fill: '#a78bfa' }}
          transition={{ duration: 0.6 }}
        />

        {/* Highlight on left wall */}
        <path d="M50,85 L58,82 L58,195 L50,198 Z" fill="white" opacity="0.1" />

        {/* Animated flaps — morph from open to closed */}
        {flaps.map((flap, i) => (
          <motion.path
            key={i}
            initial={{ d: flap.open, fill: i < 2 ? '#e0e7ff' : '#e8eeff' }}
            animate={{ d: flap.closed, fill: flap.fill }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: i * 0.08 }}
            stroke="#a5b4fc"
            strokeWidth="1"
          />
        ))}

        {/* Opening edge — fades as flaps close */}
        <motion.path
          d="M40,75 L150,20 L260,75 L150,130 Z"
          fill="none"
          stroke="white"
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        />

        {/* Ribbon + bow — appear after flaps close */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: ribbonIn ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ribbon stripe on left wall */}
          <path d="M90,75 L90,215 L100,220 L100,80 Z" fill="url(#gRibbon)" opacity="0.8" />
          {/* Ribbon stripe on right wall */}
          <path d="M200,75 L200,215 L210,220 L210,80 Z" fill="url(#gRibbon)" opacity="0.8" />
          {/* Ribbon on front-left wall */}
          <path d="M90,75 L90,215 L95,218 L95,78 Z" fill="url(#gRibbon)" opacity="0.6" />
          {/* Ribbon cross on top */}
          <path d="M135,75 L150,20 L165,75 L150,130 Z" fill="url(#gRibbon)" opacity="0.7" />
          {/* Ribbon cross perpendicular */}
          <path d="M40,75 L150,60 L260,75 L150,90 Z" fill="url(#gRibbon)" opacity="0.5" />
          {/* Bow loops */}
          <ellipse cx="132" cy="14" rx="18" ry="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" transform="rotate(-20 132 14)" />
          <ellipse cx="168" cy="14" rx="18" ry="12" fill="#fcd34d" stroke="#f59e0b" strokeWidth="0.8" transform="rotate(20 168 14)" />
          {/* Bow knot */}
          <circle cx="150" cy="20" r="6" fill="#f59e0b" />
          <circle cx="150" cy="20" r="3.5" fill="#fbbf24" />
        </motion.g>
      </svg>
    </div>
  );
};

/* ─── Component ─────────────────────────────────────────────────────────── */

export const AppGridBox: React.FC = () => {
  const [absorbed, setAbsorbed] = useState<Set<string>>(new Set());
  const [absorbing, setAbsorbing] = useState<Set<string>>(new Set());
  const [descending, setDescending] = useState<Set<string>>(new Set());
  const [boxPhase, setBoxPhase] = useState<'open' | 'closing' | 'present'>('open');
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAutoAbsorbed = useRef(false);

  const absorbApp = useCallback((label: string) => {
    if (absorbed.has(label) || absorbing.has(label)) return;
    setAbsorbing(prev => new Set(prev).add(label));
    setTimeout(() => {
      setDescending(prev => new Set(prev).add(label));
    }, 280);
    setTimeout(() => {
      setAbsorbing(prev => { const n = new Set(prev); n.delete(label); return n; });
      setDescending(prev => { const n = new Set(prev); n.delete(label); return n; });
      setAbsorbed(prev => new Set(prev).add(label));
    }, 800);
  }, [absorbed, absorbing]);

  const absorbAll = useCallback(() => {
    const remaining = layoutItems.filter(p => !absorbed.has(p.app.label) && !absorbing.has(p.app.label));
    remaining.forEach((p, i) => {
      setTimeout(() => absorbApp(p.app.label), i * 70);
    });
  }, [absorbed, absorbing, absorbApp]);

  const resetAll = useCallback(() => {
    hasAutoAbsorbed.current = false;
    setAbsorbed(new Set());
    setAbsorbing(new Set());
    setBoxPhase('open');
  }, []);

  // When all absorbed → closing → present (chained so cleanup doesn't cancel the second step)
  const allAbsorbed = absorbed.size === apps.length && absorbing.size === 0;
  useEffect(() => {
    if (allAbsorbed && boxPhase === 'open') {
      const t = setTimeout(() => setBoxPhase('closing'), 400);
      return () => clearTimeout(t);
    }
  }, [allAbsorbed, boxPhase]);

  useEffect(() => {
    if (boxPhase === 'closing') {
      const t = setTimeout(() => setBoxPhase('present'), 1500);
      return () => clearTimeout(t);
    }
  }, [boxPhase]);

  // Auto-absorb on scroll-past
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && !hasAutoAbsorbed.current) {
          hasAutoAbsorbed.current = true;
          absorbAll();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [absorbAll]);

  const progress = absorbed.size / apps.length;

  const currentPrice = layoutItems
    .filter(p => absorbed.has(p.app.label))
    .reduce((sum, p) => sum + p.app.price, 0);

  return (
    <div ref={sectionRef} className="relative py-24 md:py-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
            One platform. <span className="italic">Every tool.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            36 apps your business needs — all in a single box.
          </p>
        </motion.div>

        {/* Grid + Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto"
          style={{ width: GW, maxWidth: '100%' }}
        >
          <div className="pb-4">
            <div className="relative" style={{ width: GW, height: GH }}>

              {(boxPhase === 'closing' || boxPhase === 'present') ? (
                /* ── Closing / Present — flaps animate shut, then ribbon ── */
                <div
                  className="absolute z-30 flex items-center justify-center pointer-events-none"
                  style={{
                    left: BOX_C * (CELL + GAP) - 25,
                    top: BOX_R * (CELL + GAP) - 25,
                    width: 2 * CELL + GAP + 50,
                    height: 2 * CELL + GAP + 50,
                  }}
                >
                  <ClosingBox phase={boxPhase} />
                </div>
              ) : (
                <>
                  {/* LAYER 1: Box back half — behind items (z-5) */}
                  <motion.div
                    className="absolute z-[5] flex items-center justify-center pointer-events-none"
                    style={{
                      left: BOX_C * (CELL + GAP) - 25,
                      top: BOX_R * (CELL + GAP) - 25,
                      width: 2 * CELL + GAP + 50,
                      height: 2 * CELL + GAP + 50,
                    }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BoxBack progress={progress} currentPrice={currentPrice} />
                  </motion.div>

                  {/* LAYER 2: App widgets — fly between box layers */}
                  <AnimatePresence>
                    {layoutItems.map(({ app, x, y }) => {
                      const gone = absorbed.has(app.label);
                      const flying = absorbing.has(app.label);
                      const Widget = app.W;
                      if (gone) return null;

                      const cardCX = x + CELL / 2;
                      const cardCY = y + CELL / 2;
                      const dx = BOX_CX - cardCX;
                      const dy = BOX_CY - cardCY;

                      return (
                        <motion.div
                          key={app.label}
                          className="absolute cursor-pointer select-none"
                          style={{
                            width: CELL, height: CELL, left: x, top: y,
                            zIndex: flying ? (descending.has(app.label) ? 20 : 40) : 10,
                          }}
                          initial={false}
                          animate={flying ? {
                            x: [0, dx * 0.7, dx],
                            y: [0, dy - 200, dy],
                            scale: [1, 0.7, 0.12],
                            opacity: 1,
                          } : {
                            x: 0, y: 0, scale: 1, opacity: 1,
                          }}
                          transition={flying ? {
                            duration: 0.8,
                            ease: 'easeInOut',
                            times: [0, 0.35, 1],
                          } : {
                            duration: 0.35, ease: 'easeOut',
                          }}
                          onMouseEnter={() => absorbApp(app.label)}
                        >
                          <div
                            className="w-full h-full rounded-xl overflow-hidden border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                            style={{
                              borderColor: `${app.color}20`,
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            }}
                          >
                            <Widget c={app.color} />
                            <div
                              className="absolute bottom-0 inset-x-0 text-center text-[9px] font-semibold pb-1.5 truncate px-1 rounded-b-xl"
                              style={{ color: app.color, background: 'linear-gradient(to top, white 60%, transparent)' }}
                            >
                              {app.label}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* LAYER 3: Box front half — in front of items (z-30) */}
                  <motion.div
                    className="absolute z-30 flex items-center justify-center pointer-events-none"
                    style={{
                      left: BOX_C * (CELL + GAP) - 25,
                      top: BOX_R * (CELL + GAP) - 25,
                      width: 2 * CELL + GAP + 50,
                      height: 2 * CELL + GAP + 50,
                    }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BoxFront progress={progress} />
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Button / Price reveal */}
          <div className="flex justify-center mt-12 gap-3">
            {boxPhase === 'present' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col items-center gap-5"
              >
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Separately, these tools cost</p>
                  <p className="text-2xl font-mono font-bold text-slate-300 line-through">${TOTAL_PRICE}/mo</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-sm text-blue-500 font-semibold mb-1">Everything in one box</p>
                  <p className="text-4xl font-serif font-bold text-slate-900">$49<span className="text-lg text-slate-400 font-normal">/mo</span></p>
                </motion.div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  onClick={resetAll}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg mt-2"
                >
                  Take them back out
                </motion.button>
              </motion.div>
            ) : !allAbsorbed ? (
              <button
                onClick={absorbAll}
                className="px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg"
              >
                Put them all in the box
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
