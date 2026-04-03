import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* ─── Shared transition constant ──────────────────────────────────────── */
const T = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

/* ─── Abstract mini-widgets ─────────────────────────────────────────────── */

const WCalendar = ({ c, h }: { c: string; h?: boolean }) => {
  // "Today" cell (i===7) gets bright glow + scale. Other cells stagger-brighten radiating OUT from center.
  const center = 7;
  return (
    <div className="w-full h-full p-2 flex flex-col gap-0.5">
      <div className="h-1.5 rounded-full w-1/2" style={{
        background: c,
        transition: T,
        transform: h ? 'scaleX(1.08)' : 'none',
        transformOrigin: 'left',
        filter: h ? 'brightness(1.2)' : 'none',
      }} />
      <div className="flex-1 grid grid-cols-5 grid-rows-3 gap-px">
        {Array.from({ length: 15 }).map((_, i) => {
          const isToday = i === center;
          const dist = Math.abs(i - center);
          return (
            <div key={i} className="rounded-sm" style={{
              background: isToday ? c : `${c}18`,
              transition: T,
              transitionDelay: h ? `${dist * 35}ms` : '0ms',
              transform: h && isToday ? 'scale(1.3)' : 'none',
              boxShadow: h && isToday ? `0 0 8px 2px ${c}40` : `0 0 0px 0px ${c}00`,
              filter: h && !isToday ? `brightness(${1.2 - dist * 0.05})` : 'none',
            }} />
          );
        })}
      </div>
    </div>
  );
};

const WChat = ({ c, h }: { c: string; h?: boolean }) => {
  // Bubbles breathe apart. Sent bubble gets brighter. Received bubbles get slightly more opaque.
  const bubbles = [
    { align: 'self-start', w: 'w-3/5', bg: `${c}20`, hoverBg: `${c}30`, dir: -3, isSent: false },
    { align: 'self-end', w: 'w-2/5', bg: c, hoverBg: c, dir: 3, isSent: true },
    { align: 'self-start', w: 'w-1/2', bg: `${c}20`, hoverBg: `${c}30`, dir: -2, isSent: false },
  ];
  return (
    <div className="w-full h-full p-2 flex flex-col justify-end gap-1.5">
      {bubbles.map((b, i) => (
        <div key={i} className={`${b.align} rounded-full h-2 ${b.w}`} style={{
          background: h ? b.hoverBg : b.bg,
          transition: T,
          transitionDelay: h ? `${i * 80}ms` : '0ms',
          transform: h ? `translateX(${b.dir}px)` : 'none',
          filter: h && b.isSent ? 'brightness(1.25)' : 'none',
        }} />
      ))}
    </div>
  );
};

// Email: envelope with @ symbol
const WLines = ({ c }: { c: string; h?: boolean }) => (
  <div className="w-full h-full flex items-center justify-center p-2">
    <svg viewBox="0 0 64 48" className="w-full h-full">
      {/* Envelope body */}
      <rect x="4" y="10" width="56" height="34" rx="4" fill={`${c}15`} stroke={c} strokeWidth="2" />
      {/* Envelope flap */}
      <path d="M4,12 L32,30 L60,12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* @ symbol */}
      <circle cx="32" cy="24" r="6" fill="none" stroke={c} strokeWidth="1.5" opacity="0.5" />
      <path d="M35,24 A3,3 0 1,0 32,27 L35,27" fill="none" stroke={c} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    </svg>
  </div>
);

const WDots = ({ c, h }: { c: string; h?: boolean }) => {
  // Center dot pulses + glow. Outer dots spread out with staggered hue-rotate (rainbow ripple).
  const offsets = [
    [-1,-1],[0,-1],[1,-1],
    [-1,0],[0,0],[1,0],
    [-1,1],[0,1],[1,1],
  ];
  const hueShifts = [0, 30, 60, 90, 0, 120, 150, 180, 210];
  return (
    <div className="w-full h-full p-2 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => {
          const isCenter = i === 4;
          const [dx, dy] = offsets[i];
          return (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{
              background: isCenter ? c : `${c}20`,
              transition: T,
              transitionDelay: h && !isCenter ? `${i * 30}ms` : '0ms',
              transform: h
                ? (isCenter ? 'scale(1.3)' : `translate(${dx * 2}px, ${dy * 2}px)`)
                : 'none',
              boxShadow: h && isCenter ? `0 0 8px 3px ${c}50` : `0 0 0px 0px ${c}00`,
              filter: h && !isCenter ? `hue-rotate(${hueShifts[i]}deg) brightness(1.3)` : 'none',
            }} />
          );
        })}
      </div>
    </div>
  );
};

const WBars = ({ c, h }: { c: string; h?: boolean }) => (
  // Bars grow 15% taller. Each bar gets staggered brightness wave left to right. Tallest bar = most brightness.
  <div className="w-full h-full p-2 flex items-end justify-center gap-1">
    {[35, 55, 45, 70, 60, 80, 50].map((ht, i) => (
      <div key={i} className="w-1.5 rounded-t" style={{
        height: `${ht}%`,
        background: c,
        opacity: 0.3 + (ht / 100) * 0.7,
        transition: T,
        transitionDelay: h ? `${i * 40}ms` : '0ms',
        transform: h ? 'scaleY(1.15)' : 'none',
        transformOrigin: 'bottom',
        filter: h ? `brightness(${1 + (ht / 100) * 0.4})` : 'none',
      }} />
    ))}
  </div>
);

const WChecks = ({ c, h }: { c: string; h?: boolean }) => (
  // Unchecked boxes get color on hover (background transitions toward filled). Checked boxes glow. Lines brighten.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[true, true, false, false].map((on, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{
          background: on ? c : (h ? `${c}60` : `${c}20`),
          transition: T,
          transitionDelay: h ? `${i * 80}ms` : '0ms',
          boxShadow: h && on ? `0 0 6px 2px ${c}35` : `0 0 0px 0px ${c}00`,
        }} />
        <div className="h-1 rounded-full flex-1" style={{
          background: `${c}${on ? '12' : '20'}`,
          transition: T,
          transitionDelay: h ? `${i * 80 + 40}ms` : '0ms',
          filter: h && on ? 'brightness(1.3)' : 'none',
          transform: h ? 'scaleX(1.05)' : 'none',
          transformOrigin: 'left',
        }} />
      </div>
    ))}
  </div>
);

const WPlaybook = ({ c, h }: { c: string; h?: boolean }) => (
  // Steps "advance" — inactive steps (i>=2) brighten on hover. Step 3 becomes semi-active. Numbers glow.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    {[1, 2, 3, 4].map((n, i) => {
      const isActive = i < 2;
      const isActivating = h && i === 2;
      return (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center text-[5px] font-bold" style={{
            background: isActive || isActivating ? c : `${c}15`,
            color: isActive || isActivating ? 'white' : c,
            opacity: isActive ? 0.7 : (isActivating ? 0.55 : 0.5),
            transition: T,
            transitionDelay: h ? `${i * 90}ms` : '0ms',
            boxShadow: h ? `0 0 5px 1px ${c}25` : `0 0 0px 0px ${c}00`,
            filter: h && i >= 2 ? 'brightness(1.3)' : 'none',
          }}>
            {n}
          </div>
          <div className="flex-1 flex gap-0.5">
            <div className="h-1 rounded-full" style={{
              width: '60%',
              background: `${c}${isActive ? '20' : '10'}`,
              transition: T,
              transitionDelay: h ? `${i * 90 + 50}ms` : '0ms',
              filter: h && i >= 2 ? 'brightness(1.2)' : 'none',
            }} />
            <div className="h-1 rounded-full" style={{
              width: '25%',
              background: `${c}${isActive ? '12' : '06'}`,
              transition: T,
              transitionDelay: h ? `${i * 90 + 80}ms` : '0ms',
            }} />
          </div>
        </div>
      );
    })}
  </div>
);

const WWave = ({ c, h }: { c: string; h?: boolean }) => {
  // Bars animate to DIFFERENT heights (unique scaleY per bar). Color ripples left to right.
  const barHeights = [3, 5, 8, 6, 10, 5, 7, 11, 6, 4, 9, 5, 7];
  const hoverScales = [1.3, 0.8, 1.5, 0.7, 1.2, 1.6, 0.9, 0.7, 1.4, 1.1, 0.8, 1.3, 1.0];
  return (
    <div className="w-full h-full flex items-center justify-center gap-px px-3">
      {barHeights.map((ht, i) => (
        <div key={i} className="w-1 rounded-full" style={{
          height: ht * 3,
          background: c,
          opacity: 0.4 + (ht / 11) * 0.6,
          transition: T,
          transitionDelay: h ? `${i * 25}ms` : '0ms',
          transform: h ? `scaleY(${hoverScales[i]})` : 'none',
          transformOrigin: 'center',
          filter: h ? `brightness(${1.1 + (i / 13) * 0.3})` : 'none',
        }} />
      ))}
    </div>
  );
};

const WKanban = ({ c, h }: { c: string; h?: boolean }) => (
  // Cards float UP. Column headers brighten + slightly wider. Top card in each column gets most lift.
  <div className="w-full h-full p-2 flex gap-1.5">
    {[3, 2, 4].map((n, colIdx) => (
      <div key={colIdx} className="flex-1 flex flex-col gap-1">
        <div className="h-1 rounded-full" style={{
          background: c,
          opacity: 0.3 + colIdx * 0.25,
          transition: T,
          filter: h ? 'brightness(1.3)' : 'none',
          transform: h ? 'scaleX(1.05)' : 'none',
          transformOrigin: 'left',
        }} />
        {Array.from({ length: n }).map((_, j) => (
          <div key={j} className="h-2.5 rounded-sm" style={{
            background: `${c}${12 + colIdx * 6}`,
            transition: T,
            transitionDelay: h ? `${colIdx * 60 + j * 40}ms` : '0ms',
            transform: h ? `translateY(${j === 0 ? -3 : -2}px)` : 'none',
          }} />
        ))}
      </div>
    ))}
  </div>
);

const WPath = ({ c, h }: { c: string; h?: boolean }) => (
  // Endpoints glow. Path line brightens. Whole path gets brightness shift.
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 50 30" className="w-full h-full">
      <path d="M4,24 Q15,2 25,15 T46,6" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"
        style={{ transition: T, opacity: h ? 0.7 : 0.5, filter: h ? 'brightness(1.15)' : 'none' }} />
      <circle cx="4" cy="24" r="3" fill={c}
        style={{
          transition: T,
          transitionDelay: h ? '200ms' : '0ms',
          opacity: 0.7,
          filter: h ? 'brightness(1.2)' : 'none',
        }} />
      <circle cx="46" cy="6" r="3" fill={c}
        style={{
          transition: T,
          transitionDelay: h ? '350ms' : '0ms',
          opacity: 0.7,
          filter: h ? 'brightness(1.2)' : 'none',
        }} />
    </svg>
  </div>
);

const WTimer = ({ c, h }: { c: string; h?: boolean }) => (
  // Hands tick forward. Ring gets color glow. Center dot brightens.
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative" style={{
      borderColor: `${c}30`,
      transition: T,
      boxShadow: h ? `0 0 8px 2px ${c}30` : `0 0 0px 0px ${c}00`,
    }}>
      <div className="absolute w-0.5 h-3 rounded-full origin-bottom" style={{
        background: c,
        transition: T,
        transform: h ? 'translateY(-50%) rotate(15deg)' : 'translateY(-50%) rotate(-30deg)',
      }} />
      <div className="absolute w-0.5 h-2 rounded-full origin-bottom" style={{
        background: `${c}60`,
        transition: T,
        transform: h ? 'translateY(-50%) rotate(120deg)' : 'translateY(-50%) rotate(60deg)',
      }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{
        background: c,
        transition: T,
        filter: h ? 'brightness(1.3)' : 'none',
      }} />
    </div>
  </div>
);

const WPeople = ({ c, h }: { c: string; h?: boolean }) => (
  // Each row slides right staggered. Avatar circles get warm glow. Top person glows brightest.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[0.8, 0.5, 0.3].map((op, i) => (
      <div key={i} className="flex items-center gap-1.5" style={{
        transition: T,
        transitionDelay: h ? `${i * 80}ms` : '0ms',
        transform: h ? `translateX(${3 - i}px)` : 'none',
        opacity: op,
      }}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
          background: c,
          opacity: op,
          transition: T,
          transitionDelay: h ? `${i * 80}ms` : '0ms',
          boxShadow: h ? `0 0 ${6 - i * 2}px ${2 - i * 0.5}px ${c}${40 - i * 10}` : `0 0 0px 0px ${c}00`,
        }} />
        <div className="h-1 rounded-full flex-1" style={{ background: `${c}15` }} />
      </div>
    ))}
  </div>
);

const WPeopleGrid = ({ c, h }: { c: string; h?: boolean }) => (
  // Avatars scale with stagger. Online status dots get brighter/glow. Name lines extend.
  <div className="w-full h-full p-2 flex flex-col justify-center gap-1.5">
    {[0.8, 0.55, 0.35].map((op, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center" style={{
          background: `${c}20`,
          transition: T,
          transitionDelay: h ? `${i * 50}ms` : '0ms',
          transform: h ? 'scale(1.12)' : 'none',
        }}>
          <div className="w-1.5 h-1 rounded-full" style={{
            background: c,
            opacity: op,
            transition: T,
            filter: h ? 'brightness(1.3)' : 'none',
            boxShadow: h ? `0 0 4px 1px ${c}30` : `0 0 0px 0px ${c}00`,
          }} />
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="h-1 rounded-full" style={{
            background: c,
            opacity: op,
            width: `${55 + i * 12}%`,
            transition: T,
            transitionDelay: h ? `${i * 50 + 30}ms` : '0ms',
            transform: h ? 'scaleX(1.08)' : 'none',
            transformOrigin: 'left',
          }} />
          <div className="h-0.5 rounded-full w-3/5" style={{ background: `${c}12` }} />
        </div>
      </div>
    ))}
  </div>
);

const WCard = ({ c, h }: { c: string; h?: boolean }) => (
  // Card lifts. Chip/tag gets brightness + subtle glow. Bottom dots shimmer with stagger.
  <div className="w-full h-full p-2.5 flex items-center justify-center">
    <div className="w-full h-full rounded-lg flex flex-col justify-between p-2" style={{
      background: `${c}12`,
      transition: T,
      transform: h ? 'translateY(-2px)' : 'none',
    }}>
      <div className="w-4 h-3 rounded-sm" style={{
        background: `${c}35`,
        transition: T,
        filter: h ? 'brightness(1.3)' : 'none',
        boxShadow: h ? `0 0 6px 1px ${c}25` : `0 0 0px 0px ${c}00`,
      }} />
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1 w-2.5 rounded-full" style={{
            background: `${c}25`,
            transition: T,
            transitionDelay: h ? `${i * 50}ms` : '0ms',
            filter: h ? `brightness(${1.2 + i * 0.1})` : 'none',
          }} />
        ))}
      </div>
    </div>
  </div>
);

const WTree = ({ c, h }: { c: string; h?: boolean }) => (
  // Root node brightens first, then cascades DOWN. Child nodes scale up. Lines get brighter with delay.
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 28" className="w-full h-full">
      <rect x="15" y="1" width="10" height="6" rx="1.5" fill={c} opacity="0.4"
        style={{ transition: T, transform: h ? 'scale(1.1)' : 'none', transformOrigin: '20px 4px', filter: h ? 'brightness(1.3)' : 'none' }} />
      <line x1="20" y1="7" x2="20" y2="10" stroke={c} strokeWidth="1" opacity="0.3"
        style={{ transition: T, transitionDelay: h ? '120ms' : '0ms', filter: h ? 'brightness(1.4)' : 'none' }} />
      <line x1="7" y1="10" x2="33" y2="10" stroke={c} strokeWidth="1" opacity="0.3"
        style={{ transition: T, transitionDelay: h ? '180ms' : '0ms', filter: h ? 'brightness(1.4)' : 'none' }} />
      <rect x="1" y="12" width="10" height="6" rx="1.5" fill={c} opacity="0.2"
        style={{ transition: T, transitionDelay: h ? '280ms' : '0ms', transform: h ? 'scale(1.15)' : 'none', transformOrigin: '6px 15px', filter: h ? 'brightness(1.2)' : 'none' }} />
      <rect x="15" y="12" width="10" height="6" rx="1.5" fill={c} opacity="0.2"
        style={{ transition: T, transitionDelay: h ? '320ms' : '0ms', transform: h ? 'scale(1.15)' : 'none', transformOrigin: '20px 15px', filter: h ? 'brightness(1.2)' : 'none' }} />
      <rect x="29" y="12" width="10" height="6" rx="1.5" fill={c} opacity="0.2"
        style={{ transition: T, transitionDelay: h ? '360ms' : '0ms', transform: h ? 'scale(1.15)' : 'none', transformOrigin: '34px 15px', filter: h ? 'brightness(1.2)' : 'none' }} />
    </svg>
  </div>
);

const WNodes = ({ c, h }: { c: string; h?: boolean }) => (
  // Center node pulses + glow. Outer nodes drift outward. Connection lines brighten + thicken.
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 30" className="w-full h-full">
      <circle cx="20" cy="15" r="4.5" fill={c} opacity="0.35"
        style={{ transition: T, transform: h ? 'scale(1.2)' : 'none', transformOrigin: '20px 15px', filter: h ? 'brightness(1.3)' : 'none' }} />
      <circle cx="6" cy="6" r="3" fill={c} opacity="0.15"
        style={{ transition: T, transform: h ? 'translate(-2px, -2px)' : 'none' }} />
      <circle cx="34" cy="7" r="3" fill={c} opacity="0.15"
        style={{ transition: T, transform: h ? 'translate(2px, -2px)' : 'none' }} />
      <circle cx="7" cy="25" r="3" fill={c} opacity="0.15"
        style={{ transition: T, transform: h ? 'translate(-2px, 2px)' : 'none' }} />
      <circle cx="35" cy="24" r="3" fill={c} opacity="0.15"
        style={{ transition: T, transform: h ? 'translate(2px, 2px)' : 'none' }} />
      <line x1="17" y1="12" x2="8" y2="8" stroke={c} strokeWidth="0.8"
        style={{ transition: T, opacity: h ? 0.4 : 0.2 }} />
      <line x1="23" y1="12" x2="32" y2="8" stroke={c} strokeWidth="0.8"
        style={{ transition: T, opacity: h ? 0.4 : 0.2 }} />
      <line x1="17" y1="18" x2="9" y2="23" stroke={c} strokeWidth="0.8"
        style={{ transition: T, opacity: h ? 0.4 : 0.2 }} />
      <line x1="23" y1="18" x2="33" y2="23" stroke={c} strokeWidth="0.8"
        style={{ transition: T, opacity: h ? 0.4 : 0.2 }} />
    </svg>
  </div>
);

const WMap = ({ c, h }: { c: string; h?: boolean }) => (
  // Location dots get pulsing glow rings. Grid lines brighten. Each dot's glow staggered.
  <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: `${c}08` }}>
    {[0, 1, 2].map(i => <div key={`h${i}`} className="absolute border-b left-0 right-0" style={{
      top: `${25 + i * 25}%`,
      borderColor: h ? `${c}18` : `${c}10`,
      transition: T,
    }} />)}
    {[0, 1].map(i => <div key={`v${i}`} className="absolute border-r top-0 bottom-0" style={{
      left: `${33 + i * 33}%`,
      borderColor: h ? `${c}18` : `${c}10`,
      transition: T,
    }} />)}
    <div className="absolute w-2.5 h-2.5 rounded-full" style={{
      background: c, top: '22%', left: '28%', opacity: 0.7,
      transition: T,
      boxShadow: h ? `0 0 8px 3px ${c}40` : `0 0 0px 0px ${c}00`,
    }} />
    <div className="absolute w-2 h-2 rounded-full" style={{
      background: c, top: '55%', left: '65%', opacity: 0.5,
      transition: T,
      transitionDelay: h ? '100ms' : '0ms',
      boxShadow: h ? `0 0 8px 3px ${c}35` : `0 0 0px 0px ${c}00`,
    }} />
    <div className="absolute w-2 h-2 rounded-full" style={{
      background: c, top: '72%', left: '22%', opacity: 0.35,
      transition: T,
      transitionDelay: h ? '200ms' : '0ms',
      boxShadow: h ? `0 0 8px 3px ${c}30` : `0 0 0px 0px ${c}00`,
    }} />
  </div>
);

const WBlocks = ({ c, h }: { c: string; h?: boolean }) => (
  // Blocks shift apart. Center content area brightens. "Layout editing" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    <div className="h-2.5 rounded-sm" style={{
      background: `${c}15`,
      transition: T,
      transform: h ? 'translateY(-2px)' : 'none',
    }} />
    <div className="flex-1 rounded-sm flex items-center justify-center" style={{
      background: `${c}08`,
      transition: T,
      filter: h ? 'brightness(1.2)' : 'none',
    }}>
      <div className="w-6 h-4 rounded-sm" style={{
        background: `${c}20`,
        transition: T,
        filter: h ? 'brightness(1.3)' : 'none',
      }} />
    </div>
    <div className="flex gap-1">
      <div className="flex-1 h-2.5 rounded-sm" style={{
        background: `${c}12`,
        transition: T,
        transitionDelay: h ? '80ms' : '0ms',
        transform: h ? 'translateX(-2px)' : 'none',
      }} />
      <div className="flex-1 h-2.5 rounded-sm" style={{
        background: `${c}12`,
        transition: T,
        transitionDelay: h ? '80ms' : '0ms',
        transform: h ? 'translateX(2px)' : 'none',
      }} />
    </div>
  </div>
);

const WFunnel = ({ c, h }: { c: string; h?: boolean }) => (
  // Each layer gets different hue shift. Top=cool, middle=neutral, bottom=warm. Brightness staggered from top.
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 30" className="w-full h-full">
      <path d="M4,4 L36,4 L30,12 L10,12 Z" fill={c}
        style={{
          transition: T,
          opacity: h ? 0.3 : 0.2,
          filter: h ? 'hue-rotate(-10deg) brightness(1.3)' : 'none',
        }} />
      <path d="M10,14 L30,14 L26,22 L14,22 Z" fill={c}
        style={{
          transition: T,
          transitionDelay: h ? '80ms' : '0ms',
          opacity: h ? 0.45 : 0.35,
          filter: h ? 'brightness(1.2)' : 'none',
        }} />
      <path d="M14,24 L26,24 L23,28 L17,28 Z" fill={c}
        style={{
          transition: T,
          transitionDelay: h ? '160ms' : '0ms',
          opacity: h ? 0.65 : 0.55,
          filter: h ? 'hue-rotate(15deg) brightness(1.15)' : 'none',
        }} />
    </svg>
  </div>
);

const WSlide = ({ c, h }: { c: string; h?: boolean }) => (
  // Slide lifts up. Content lines brighten and extend. Border gets subtle glow.
  <div className="w-full h-full p-2.5 flex items-center justify-center">
    <div className="w-full h-full rounded border flex flex-col items-center justify-center gap-1.5" style={{
      borderColor: `${c}20`,
      background: `${c}05`,
      transition: T,
      transform: h ? 'translateY(-2px)' : 'none',
      boxShadow: h ? `0 0 6px 1px ${c}20` : `0 0 0px 0px ${c}00`,
    }}>
      <div className="w-3/5 h-1 rounded-full" style={{
        background: `${c}30`,
        transition: T,
        transitionDelay: h ? '100ms' : '0ms',
        filter: h ? 'brightness(1.3)' : 'none',
        transform: h ? 'scaleX(1.08)' : 'none',
        transformOrigin: 'center',
      }} />
      <div className="w-2/5 h-1 rounded-full" style={{
        background: `${c}15`,
        transition: T,
        transitionDelay: h ? '180ms' : '0ms',
        filter: h ? 'brightness(1.2)' : 'none',
        transform: h ? 'scaleX(1.1)' : 'none',
        transformOrigin: 'center',
      }} />
    </div>
  </div>
);

const WForm = ({ c, h }: { c: string; h?: boolean }) => (
  // Input fields get focus-like glow. Labels brighten. "Filling out form" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="h-1 rounded-full w-2/5" style={{
      background: `${c}25`,
      transition: T,
      filter: h ? 'brightness(1.3)' : 'none',
    }} />
    <div className="h-3 rounded border" style={{
      borderColor: h ? `${c}40` : `${c}20`,
      background: `${c}05`,
      transition: T,
      transitionDelay: h ? '60ms' : '0ms',
      boxShadow: h ? `0 0 6px 1px ${c}20` : `0 0 0px 0px ${c}00`,
    }} />
    <div className="h-1 rounded-full w-1/2" style={{
      background: `${c}25`,
      transition: T,
      transitionDelay: h ? '120ms' : '0ms',
      filter: h ? 'brightness(1.3)' : 'none',
    }} />
    <div className="h-3 rounded border" style={{
      borderColor: h ? `${c}40` : `${c}20`,
      background: `${c}05`,
      transition: T,
      transitionDelay: h ? '180ms' : '0ms',
      boxShadow: h ? `0 0 6px 1px ${c}20` : `0 0 0px 0px ${c}00`,
    }} />
  </div>
);

const WDoc = ({ c, h }: { c: string; h?: boolean }) => (
  // Title brightens first, then body lines extend cascading down. "Text appearing" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    {[
      { w: 'w-3/5', bg: `${c}30` },
      { w: 'w-full', bg: `${c}10` },
      { w: 'w-full', bg: `${c}10` },
      { w: 'w-4/5', bg: `${c}10` },
      { w: 'w-3/5', bg: `${c}10` },
    ].map((line, i) => (
      <div key={i} className={`rounded-full ${line.w}`} style={{
        background: line.bg,
        height: i === 0 ? 6 : 4,
        transition: T,
        transitionDelay: h ? `${i * 50}ms` : '0ms',
        transform: h && i > 0 ? 'scaleX(1.03)' : 'none',
        transformOrigin: 'left',
        filter: h && i === 0 ? 'brightness(1.3)' : (h && i > 0 ? 'brightness(1.15)' : 'none'),
      }} />
    ))}
  </div>
);

const WAgent = ({ c, h }: { c: string; h?: boolean }) => (
  // Concentric rings pulse outward — outer scales MORE. Each ring gets different brightness. Center glows.
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
      background: `${c}12`,
      transition: T,
      transform: h ? 'scale(1.18)' : 'none',
      filter: h ? 'brightness(1.1)' : 'none',
    }}>
      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{
        background: `${c}22`,
        transition: T,
        transitionDelay: h ? '60ms' : '0ms',
        transform: h ? 'scale(1.12)' : 'none',
        filter: h ? 'brightness(1.2)' : 'none',
      }}>
        <div className="w-2 h-2 rounded-full" style={{
          background: c,
          transition: T,
          transitionDelay: h ? '120ms' : '0ms',
          filter: h ? 'brightness(1.35)' : 'none',
          boxShadow: h ? `0 0 8px 3px ${c}50` : `0 0 0px 0px ${c}00`,
        }} />
      </div>
    </div>
  </div>
);

const WCreative = ({ c, h }: { c: string; h?: boolean }) => (
  // Brush stroke brightens. SVG shapes fade in with more opacity. Color swatches bounce up + brighter.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="flex-1 rounded-lg relative overflow-hidden" style={{ background: `${c}06` }}>
      <svg viewBox="0 0 40 24" className="w-full h-full">
        <path d="M5,18 Q12,4 20,12 T35,8" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: T, opacity: h ? 0.6 : 0.35, filter: h ? 'brightness(1.25)' : 'none' }} />
        <circle cx="8" cy="8" r="3" fill={c} style={{
          transition: T,
          transitionDelay: h ? '150ms' : '0ms',
          opacity: h ? 0.3 : 0.1,
        }} />
        <rect x="26" y="14" width="8" height="6" rx="1" fill={c} style={{
          transition: T,
          transitionDelay: h ? '250ms' : '0ms',
          opacity: h ? 0.28 : 0.08,
        }} />
      </svg>
    </div>
    <div className="flex gap-1 justify-center">
      {['#f472b6', '#fbbf24', '#34d399', c].map((col, i) => (
        <div key={i} className="w-2 h-2 rounded-full" style={{
          background: col,
          opacity: 0.5,
          transition: T,
          transitionDelay: h ? `${200 + i * 60}ms` : '0ms',
          transform: h ? 'translateY(-3px) scale(1.15)' : 'none',
          filter: h ? 'brightness(1.3)' : 'none',
        }} />
      ))}
    </div>
  </div>
);

const WAssistant = ({ c, h }: { c: string; h?: boolean }) => (
  // Sparkle rotates 72deg + brightness. Response lines slide in + get brighter background. AI "thinking" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0" style={{
        transition: T,
        transform: h ? 'rotate(72deg)' : 'none',
        filter: h ? 'brightness(1.3)' : 'none',
      }}>
        <path d="M8,1 L9.5,5.5 L14,4 L10,7.5 L14,11 L9.5,9.5 L8,14 L6.5,9.5 L2,11 L6,7.5 L2,4 L6.5,5.5 Z" fill={c} opacity="0.5" />
      </svg>
      <div className="h-1.5 rounded-full flex-1" style={{ background: `${c}20` }} />
    </div>
    <div className="self-start rounded-lg h-2 w-4/5 ml-5" style={{
      background: h ? `${c}15` : `${c}10`,
      transition: T,
      transitionDelay: h ? '100ms' : '0ms',
      transform: h ? 'translateX(3px)' : 'none',
    }} />
    <div className="self-start rounded-lg h-2 w-3/5 ml-5" style={{
      background: h ? `${c}12` : `${c}08`,
      transition: T,
      transitionDelay: h ? '180ms' : '0ms',
      transform: h ? 'translateX(3px)' : 'none',
    }} />
  </div>
);

const WPayment = ({ c, h }: { c: string; h?: boolean }) => (
  // Card tilts. Chip gets gold glow. Contactless arcs pulse outward. Card number dots brighten.
  <div className="w-full h-full p-2.5 flex items-center justify-center">
    <div className="w-full h-full rounded-lg flex flex-col justify-between p-2 relative" style={{
      background: `${c}10`,
      transition: T,
      transform: h ? 'rotate(-1deg)' : 'none',
    }}>
      <div className="flex justify-between items-start">
        <div className="w-3 h-2.5 rounded-sm" style={{
          background: `${c}40`,
          transition: T,
          boxShadow: h ? `0 0 6px 2px #fbbf2440` : `0 0 0px 0px ${c}00`,
        }} />
        <svg viewBox="0 0 12 12" className="w-3 h-3">
          {[3, 5, 7].map((r, i) => (
            <path key={i} d={`M${6+r*0.5},${6-r*0.4} A${r},${r} 0 0,1 ${6+r*0.5},${6+r*0.4}`} fill="none" stroke={c} strokeWidth="0.8"
              style={{
                transition: T,
                transitionDelay: h ? `${i * 100}ms` : '0ms',
                opacity: h ? 0.2 + i * 0.15 + 0.25 : 0.2 + i * 0.15,
                transform: h ? `scale(${1 + i * 0.08})` : 'none',
                transformOrigin: '6px 6px',
              }} />
          ))}
        </svg>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1 w-1.5 rounded-full" style={{
            background: `${c}${i === 3 ? '35' : '20'}`,
            transition: T,
            filter: h ? 'brightness(1.3)' : 'none',
          }} />
        ))}
      </div>
    </div>
  </div>
);

const WMeetingNotes = ({ c, h }: { c: string; h?: boolean }) => (
  // Speaker dots glow. Transcript lines shift right. Staggered timing = "conversation" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[0.6, 0.4, 0.5].map((op, i) => (
      <div key={i} className="flex items-start gap-1" style={{
        transition: T,
        transitionDelay: h ? `${i * 90}ms` : '0ms',
        transform: h ? 'translateX(3px)' : 'none',
      }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{
          background: c,
          opacity: op,
          transition: T,
          transitionDelay: h ? `${i * 90}ms` : '0ms',
          boxShadow: h ? `0 0 5px 2px ${c}30` : `0 0 0px 0px ${c}00`,
        }} />
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="h-1 rounded-full w-full" style={{
            background: `${c}12`,
            transition: T,
            transitionDelay: h ? `${i * 90 + 50}ms` : '0ms',
            transform: h ? 'scaleX(1.05)' : 'none',
            transformOrigin: 'left',
          }} />
          {i < 2 && <div className="h-1 rounded-full w-3/5" style={{ background: `${c}08` }} />}
        </div>
      </div>
    ))}
  </div>
);

const WBrief = ({ c, h }: { c: string; h?: boolean }) => (
  // Title brightens. Divider extends + brightens. KV rows slide right staggered. Values get brighter.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    <div className="h-1.5 rounded-full w-2/5" style={{
      background: `${c}35`,
      transition: T,
      filter: h ? 'brightness(1.3)' : 'none',
    }} />
    <div className="border-t my-0.5" style={{
      borderColor: `${c}12`,
      transition: T,
      transitionDelay: h ? '80ms' : '0ms',
      transform: h ? 'scaleX(1.08)' : 'none',
      transformOrigin: 'left',
      filter: h ? 'brightness(1.3)' : 'none',
    }} />
    {[0.7, 0.5, 0.6].map((w, i) => (
      <div key={i} className="flex items-center gap-2" style={{
        transition: T,
        transitionDelay: h ? `${120 + i * 70}ms` : '0ms',
        transform: h ? 'translateX(3px)' : 'none',
      }}>
        <div className="h-1 rounded-full w-4" style={{ background: `${c}20` }} />
        <div className="h-1 rounded-full" style={{
          width: `${w * 60}%`,
          background: `${c}10`,
          transition: T,
          filter: h ? 'brightness(1.2)' : 'none',
        }} />
      </div>
    ))}
  </div>
);

const WTeamBubbles = ({ c, h }: { c: string; h?: boolean }) => (
  // Location pins drift outward. Pin dots get glow. Connecting pin lines get more visible.
  <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ background: `${c}06` }}>
    {[0, 1, 2, 3].map(i => <div key={`h${i}`} className="absolute left-0 right-0" style={{ top: `${20 + i * 22}%`, height: 1, background: `${c}08` }} />)}
    {[0, 1, 2].map(i => <div key={`v${i}`} className="absolute top-0 bottom-0" style={{ left: `${25 + i * 28}%`, width: 1, background: `${c}08` }} />)}
    <div className="absolute flex flex-col items-center" style={{
      top: '18%', left: '25%',
      transition: T,
      transform: h ? 'translate(-2px, -1px)' : 'none',
    }}>
      <div className="w-2 h-2 rounded-full" style={{
        background: c, opacity: 0.8,
        transition: T,
        boxShadow: h ? `0 0 6px 2px ${c}35` : `0 0 0px 0px ${c}00`,
      }} />
      <div className="w-0.5 h-1.5" style={{
        background: c,
        opacity: h ? 0.55 : 0.4,
        transition: T,
        transitionDelay: h ? '100ms' : '0ms',
      }} />
    </div>
    <div className="absolute flex flex-col items-center" style={{
      top: '45%', left: '62%',
      transition: T,
      transform: h ? 'translate(2px, 1px)' : 'none',
    }}>
      <div className="w-2.5 h-2.5 rounded-full" style={{
        background: c, opacity: 0.6,
        transition: T,
        boxShadow: h ? `0 0 6px 2px ${c}30` : `0 0 0px 0px ${c}00`,
      }} />
      <div className="w-0.5 h-1.5" style={{
        background: c,
        opacity: h ? 0.45 : 0.3,
        transition: T,
        transitionDelay: h ? '150ms' : '0ms',
      }} />
    </div>
    <div className="absolute flex flex-col items-center" style={{
      top: '65%', left: '35%',
      transition: T,
      transform: h ? 'translate(-1px, 2px)' : 'none',
    }}>
      <div className="w-2 h-2 rounded-full" style={{
        background: c, opacity: 0.5,
        transition: T,
        boxShadow: h ? `0 0 6px 2px ${c}28` : `0 0 0px 0px ${c}00`,
      }} />
      <div className="w-0.5 h-1.5" style={{
        background: c,
        opacity: h ? 0.42 : 0.3,
        transition: T,
        transitionDelay: h ? '200ms' : '0ms',
      }} />
    </div>
  </div>
);

const WTag = ({ c, h }: { c: string; h?: boolean }) => (
  // Tag dot pulses with glow. Tag line extends. Bottom pills float up + brightness boost.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 rounded-full" style={{
        background: `${c}55`,
        transition: T,
        transform: h ? 'scale(1.3)' : 'none',
        boxShadow: h ? `0 0 6px 2px ${c}35` : `0 0 0px 0px ${c}00`,
      }} />
      <div className="h-1 rounded-full flex-1" style={{
        background: `${c}15`,
        transition: T,
        transitionDelay: h ? '60ms' : '0ms',
        transform: h ? 'scaleX(1.08)' : 'none',
        transformOrigin: 'left',
      }} />
    </div>
    <div className="flex gap-1 mt-auto">
      <div className="h-2 rounded-full" style={{
        background: `${c}15`,
        width: '35%',
        transition: T,
        transitionDelay: h ? '100ms' : '0ms',
        transform: h ? 'translateY(-2px)' : 'none',
        filter: h ? 'brightness(1.25)' : 'none',
      }} />
      <div className="h-2 rounded-full" style={{
        background: `${c}10`,
        width: '25%',
        transition: T,
        transitionDelay: h ? '150ms' : '0ms',
        transform: h ? 'translateY(-2px)' : 'none',
        filter: h ? 'brightness(1.25)' : 'none',
      }} />
    </div>
  </div>
);

const WSlots = ({ c, h }: { c: string; h?: boolean }) => (
  // "Booked" slot (highest opacity) gets brighter + glow. Others get slight brightness. "Selecting time" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    {[0.12, 0.45, 0.12, 0.25].map((op, i) => {
      const isBooked = op === 0.45;
      return (
        <div key={i} className="h-2.5 rounded-sm" style={{
          background: c,
          opacity: h && isBooked ? 0.6 : op,
          transition: T,
          transitionDelay: h ? `${i * 70}ms` : '0ms',
          filter: h ? (isBooked ? 'brightness(1.3)' : 'brightness(1.1)') : 'none',
          boxShadow: h && isBooked ? `0 0 6px 1px ${c}30` : `0 0 0px 0px ${c}00`,
        }} />
      );
    })}
  </div>
);

const WLink = ({ c, h }: { c: string; h?: boolean }) => (
  // Dashed circle rotates 45deg. Inner dot glows + pulses (scale 1.3). "Link activating" feel.
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center" style={{
      borderColor: `${c}35`,
      transition: T,
      transform: h ? 'rotate(45deg)' : 'none',
    }}>
      <div className="w-3 h-3 rounded-full" style={{
        background: `${c}30`,
        transition: T,
        transform: h ? 'scale(1.3)' : 'none',
        boxShadow: h ? `0 0 8px 3px ${c}40` : `0 0 0px 0px ${c}00`,
      }} />
    </div>
  </div>
);

const WFiles = ({ c, h }: { c: string; h?: boolean }) => {
  // Files pop with staggered brightness in zigzag order. Each file gets slight hue-shift.
  const zigzag = [0, 5, 1, 4, 2, 3];
  const hueShifts = [0, 15, -10, 20, -15, 10];
  return (
    <div className="w-full h-full p-2 grid grid-cols-3 gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-sm" style={{
          background: `${c}${10 + (i % 3) * 5}`,
          transition: T,
          transitionDelay: h ? `${zigzag.indexOf(i) * 40}ms` : '0ms',
          filter: h ? `hue-rotate(${hueShifts[i]}deg) brightness(1.3)` : 'none',
        }} />
      ))}
    </div>
  );
};

const WSearch = ({ c, h }: { c: string; h?: boolean }) => (
  // Search bar gets focus glow. Result lines brighten + shift down. "Searching" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    <div className="h-3 rounded-full" style={{
      background: `${c}08`,
      border: `1px solid ${h ? `${c}30` : `${c}18`}`,
      transition: T,
      boxShadow: h ? `0 0 6px 1px ${c}20` : `0 0 0px 0px ${c}00`,
    }} />
    <div className="h-1 rounded-full w-full" style={{
      background: `${c}10`,
      transition: T,
      transitionDelay: h ? '80ms' : '0ms',
      transform: h ? 'translateY(2px)' : 'none',
      filter: h ? 'brightness(1.2)' : 'none',
    }} />
    <div className="h-1 rounded-full w-4/5" style={{
      background: `${c}08`,
      transition: T,
      transitionDelay: h ? '140ms' : '0ms',
      transform: h ? 'translateY(2px)' : 'none',
      filter: h ? 'brightness(1.2)' : 'none',
    }} />
  </div>
);

const WWatch = ({ c, h }: { c: string; h?: boolean }) => (
  // Hands tick forward. Face gets warm glow. Keep existing boxShadow behavior.
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{
      background: '#1e293b',
      transition: T,
      boxShadow: h ? `0 0 8px 1px ${c}40` : 'none',
    }}>
      <div className="absolute w-0.5 h-3 rounded-full origin-bottom" style={{
        background: c,
        transition: T,
        transform: h ? 'translateY(-50%) rotate(0deg)' : 'translateY(-50%) rotate(-30deg)',
      }} />
      <div className="absolute w-0.5 h-2 rounded-full origin-bottom" style={{
        background: '#94a3b8',
        transition: T,
        transform: h ? 'translateY(-50%) rotate(90deg)' : 'translateY(-50%) rotate(60deg)',
      }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
    </div>
  </div>
);

const WGauges = ({ c, h }: { c: string; h?: boolean }) => (
  // Gauge arcs brighten significantly. Status dots glow. "Monitoring" feel.
  <div className="w-full h-full p-2 flex items-center justify-center gap-2">
    {[0.8, 0.55, 0.9].map((v, i) => (
      <div key={i} className="flex flex-col items-center gap-0.5">
        <svg viewBox="0 0 24 14" className="w-6 h-4">
          <path d="M2,13 A10,10 0 0,1 22,13" fill="none" stroke={`${c}20`} strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M2,13 A10,10 0 0,1 ${2 + 20 * v},${13 - Math.sin(Math.PI * v) * 10}`} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"
            style={{
              transition: T,
              transitionDelay: h ? `${i * 80}ms` : '0ms',
              opacity: h ? 0.6 + v * 0.4 : 0.4 + v * 0.5,
              filter: h ? 'brightness(1.3)' : 'none',
            }} />
        </svg>
        <div className="w-1 h-1 rounded-full" style={{
          background: c,
          transition: T,
          transitionDelay: h ? `${i * 80 + 120}ms` : '0ms',
          opacity: v > 0.7 ? 0.8 : 0.3,
          boxShadow: h ? `0 0 5px 2px ${c}35` : `0 0 0px 0px ${c}00`,
        }} />
      </div>
    ))}
  </div>
);

const WLineChart = ({ c, h }: { c: string; h?: boolean }) => (
  // $ sign brightens + larger. Line brightens. Area fill grows opacity. "Growth" feel.
  <div className="w-full h-full p-2 flex flex-col">
    <div className="text-[8px] font-bold mb-1" style={{
      color: `${c}60`,
      transition: T,
      transform: h ? 'scale(1.15)' : 'none',
      transformOrigin: 'left top',
      filter: h ? 'brightness(1.3)' : 'none',
    }}>$</div>
    <div className="flex-1 flex items-end">
      <svg viewBox="0 0 50 20" className="w-full h-full">
        <path d="M2,16 Q10,14 18,10 T34,6 Q42,4 48,2" fill="none" stroke={c} strokeWidth="1.5"
          style={{ transition: T, opacity: h ? 0.7 : 0.5, filter: h ? 'brightness(1.2)' : 'none' }} />
        <path d="M2,16 Q10,14 18,10 T34,6 Q42,4 48,2 V20 H2 Z" fill={c}
          style={{ transition: T, transitionDelay: h ? '200ms' : '0ms', opacity: h ? 0.16 : 0.06 }} />
      </svg>
    </div>
  </div>
);

const WReceipt = ({ c, h }: { c: string; h?: boolean }) => (
  // Lines slide right staggered. Amount numbers get brighter. Total line gets glow + emphasis.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[0.7, 0.5, 0.6, 0.4].map((w, i) => (
      <div key={i} className="flex items-center justify-between" style={{
        transition: T,
        transitionDelay: h ? `${i * 60}ms` : '0ms',
        transform: h ? 'translateX(2px)' : 'none',
      }}>
        <div className="h-1 rounded-full" style={{ width: `${w * 60}%`, background: `${c}18` }} />
        <div className="h-1 rounded-full w-3" style={{
          background: c,
          opacity: 0.3 + i * 0.1,
          transition: T,
          filter: h ? 'brightness(1.3)' : 'none',
        }} />
      </div>
    ))}
    <div className="border-t mt-auto pt-1 flex justify-end" style={{
      borderColor: `${c}15`,
      transition: T,
      transitionDelay: h ? '300ms' : '0ms',
    }}>
      <div className="h-1.5 rounded-full w-5" style={{
        background: c,
        opacity: 0.5,
        transition: T,
        filter: h ? 'brightness(1.3)' : 'none',
        boxShadow: h ? `0 0 5px 1px ${c}25` : `0 0 0px 0px ${c}00`,
      }} />
    </div>
  </div>
);

const WShipping = ({ c, h }: { c: string; h?: boolean }) => (
  // Boxes slide right + brightness boost. Lines extend. "Package tracking" feel.
  <div className="w-full h-full p-2 flex flex-col gap-1.5">
    {[
      { bgOp: '25', lineOp: '12', mt: false },
      { bgOp: '35', lineOp: '12', mt: false },
      { bgOp: '15', lineOp: '08', mt: true },
    ].map((item, i) => (
      <div key={i} className={`flex items-center gap-1 ${item.mt ? 'mt-auto' : ''}`} style={{
        transition: T,
        transitionDelay: h ? `${i * 100}ms` : '0ms',
        transform: h ? 'translateX(3px)' : 'none',
      }}>
        <div className="w-4 h-3 rounded-sm" style={{
          background: `${c}${item.bgOp}`,
          transition: T,
          filter: h ? 'brightness(1.25)' : 'none',
        }} />
        <div className="h-1 rounded-full flex-1" style={{
          background: `${c}${item.lineOp}`,
          transition: T,
          transitionDelay: h ? `${i * 100 + 60}ms` : '0ms',
          transform: h ? 'scaleX(1.06)' : 'none',
          transformOrigin: 'left',
        }} />
      </div>
    ))}
  </div>
);

const WDocBlocks = ({ c, h }: { c: string; h?: boolean }) => (
  // Title extends. Content blocks expand (scaleY). Footer tags bounce up. Brightness cascades down.
  <div className="w-full h-full p-2.5 flex flex-col gap-2">
    <div className="h-2 rounded-full w-3/5" style={{
      background: `${c}30`,
      transition: T,
      transform: h ? 'scaleX(1.06)' : 'none',
      transformOrigin: 'left',
      filter: h ? 'brightness(1.3)' : 'none',
    }} />
    <div className="flex-1 flex flex-col gap-1">
      <div className="h-5 rounded" style={{
        background: `${c}08`,
        transition: T,
        transitionDelay: h ? '80ms' : '0ms',
        transform: h ? 'scaleY(1.08)' : 'none',
        transformOrigin: 'top',
        filter: h ? 'brightness(1.2)' : 'none',
      }} />
      <div className="h-3 rounded" style={{
        background: `${c}06`,
        transition: T,
        transitionDelay: h ? '140ms' : '0ms',
        transform: h ? 'scaleY(1.08)' : 'none',
        transformOrigin: 'top',
        filter: h ? 'brightness(1.15)' : 'none',
      }} />
    </div>
    <div className="flex gap-1">
      <div className="h-1.5 rounded-full w-6" style={{
        background: c,
        opacity: 0.25,
        transition: T,
        transitionDelay: h ? '220ms' : '0ms',
        transform: h ? 'translateY(-2px)' : 'none',
      }} />
      <div className="h-1.5 rounded-full w-4" style={{
        background: `${c}15`,
        transition: T,
        transitionDelay: h ? '270ms' : '0ms',
        transform: h ? 'translateY(-2px)' : 'none',
      }} />
    </div>
  </div>
);

const WSocial = ({ c, h }: { c: string; h?: boolean }) => (
  // Photo grid items brighten with stagger. Heart GLOWS RED — hue-rotate + brightness + scale bounce.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    <div className="flex-1 grid grid-cols-3 gap-0.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-sm" style={{
          background: c,
          opacity: 0.08 + (i % 3) * 0.06,
          transition: T,
          transitionDelay: h ? `${i * 40}ms` : '0ms',
          filter: h ? `brightness(${1.3 + (i % 3) * 0.1})` : 'none',
        }} />
      ))}
    </div>
    <div className="flex items-center gap-1 mt-0.5">
      <svg viewBox="0 0 12 11" className="w-3 h-3" style={{
        transition: T,
        transitionDelay: h ? '250ms' : '0ms',
        transform: h ? 'scale(1.35)' : 'none',
        filter: h ? 'hue-rotate(-15deg) brightness(1.4) saturate(1.5)' : 'none',
      }}>
        <path d="M6,9.5 L1.5,5 A2.5,2.5 0 0,1 6,2 A2.5,2.5 0 0,1 10.5,5 Z" fill={c} opacity="0.4" />
      </svg>
      <div className="h-1 rounded-full w-4" style={{ background: `${c}20` }} />
    </div>
  </div>
);

const WJobSteps = ({ c, h }: { c: string; h?: boolean }) => (
  // Steps "progress" — dots brighten staggered. "Active" step pulses with glow. "Pending" activates.
  <div className="w-full h-full p-2 flex flex-col gap-1">
    <div className="h-1.5 rounded-full w-2/5 mb-0.5" style={{ background: `${c}25` }} />
    {['done', 'done', 'active', 'pending'].map((s, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
          background: s === 'done' ? c : s === 'active' ? c : (h ? `${c}40` : `${c}15`),
          opacity: s === 'done' ? 0.3 : s === 'active' ? 0.7 : 1,
          transition: T,
          transitionDelay: h ? `${i * 100}ms` : '0ms',
          filter: h ? `brightness(${s === 'active' ? 1.4 : s === 'done' ? 1.2 : 1.15})` : 'none',
          boxShadow: h && s === 'active' ? `0 0 6px 2px ${c}40` : `0 0 0px 0px ${c}00`,
        }} />
        <div className="h-1 rounded-full flex-1" style={{ background: `${c}${s === 'active' ? '20' : '10'}` }} />
      </div>
    ))}
  </div>
);

const WPuzzle = ({ c, h }: { c: string; h?: boolean }) => {
  // Pieces drift INWARD (closing gap) + each gets different hue-rotate. "Assembling" feel.
  const hueShifts = [0, 30, -20, 15];
  return (
    <div className="w-full h-full p-2 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-1">
        {[0.3, 0.2, 0.15, 0.25].map((op, i) => (
          <div key={i} className="w-4 h-4 rounded-lg" style={{
            background: c,
            opacity: op,
            transition: T,
            transform: h ? `translate(${i % 2 === 0 ? 2 : -2}px, ${i < 2 ? 2 : -2}px)` : 'none',
            filter: h ? `hue-rotate(${hueShifts[i]}deg) brightness(1.3)` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
};

const WPieChart = ({ c, h }: { c: string; h?: boolean }) => (
  // Pie segments brighten staggered. Legend lines extend. Whole chart gets slight scale.
  <div className="w-full h-full p-2 flex items-center justify-center gap-2">
    <svg viewBox="0 0 24 24" className="w-8 h-8" style={{
      transition: T,
      transform: h ? 'scale(1.05)' : 'none',
    }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={`${c}12`} strokeWidth="4" />
      <circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="4" strokeDasharray="22 41" strokeLinecap="round" transform="rotate(-90 12 12)"
        style={{ transition: T, opacity: h ? 0.55 : 0.35, filter: h ? 'brightness(1.2)' : 'none' }} />
      <circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="4" strokeDasharray="12 51" strokeDashoffset="-22" strokeLinecap="round" transform="rotate(-90 12 12)"
        style={{ transition: T, transitionDelay: h ? '120ms' : '0ms', opacity: h ? 0.35 : 0.2, filter: h ? 'brightness(1.2)' : 'none' }} />
    </svg>
    <div className="flex flex-col gap-0.5">
      <div className="h-1 rounded-full w-4" style={{
        background: `${c}20`,
        transition: T,
        transitionDelay: h ? '200ms' : '0ms',
        transform: h ? 'scaleX(1.15)' : 'none',
        transformOrigin: 'left',
      }} />
      <div className="h-1 rounded-full w-3" style={{
        background: `${c}12`,
        transition: T,
        transitionDelay: h ? '260ms' : '0ms',
        transform: h ? 'scaleX(1.15)' : 'none',
        transformOrigin: 'left',
      }} />
    </div>
  </div>
);

const WMegaphone = ({ c, h }: { c: string; h?: boolean }) => (
  // Body brightens. Sound wave arcs pulse OUTWARD with stagger. Each arc gets brighter. "Broadcasting" feel.
  <div className="w-full h-full p-2 flex items-center justify-center">
    <svg viewBox="0 0 40 30" className="w-full h-full">
      <path d="M8,10 L8,20 L14,20 L14,10 Z" fill={c} opacity="0.3"
        style={{ transition: T, filter: h ? 'brightness(1.25)' : 'none' }} />
      <path d="M14,8 L28,4 L28,26 L14,22 Z" fill={c} opacity="0.2"
        style={{ transition: T, filter: h ? 'brightness(1.2)' : 'none' }} />
      {[0.15, 0.1, 0.06].map((op, i) => (
        <path key={i} d={`M29,${15 - (i + 1) * 3} Q${33 + i * 2},15 29,${15 + (i + 1) * 3}`} fill="none" stroke={c} strokeWidth="1.5"
          style={{
            transition: T,
            transitionDelay: h ? `${i * 120}ms` : '0ms',
            opacity: h ? op * 5 : op * 2.5,
            transform: h ? `scale(${1.1 + i * 0.08})` : 'none',
            transformOrigin: '29px 15px',
            filter: h ? `brightness(${1.2 + i * 0.15})` : 'none',
          }} />
      ))}
    </svg>
  </div>
);

/* ─── Additional widgets for missing apps ──────────────────────────────── */

const WStrategy = ({ c, h }: { c: string; h?: boolean }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1 justify-center items-center">
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <circle cx="20" cy="20" r="14" fill="none" stroke={`${c}30`} strokeWidth="1.5" />
      <circle cx="20" cy="20" r="8" fill="none" stroke={`${c}50`} strokeWidth="1.5" style={{ transition: T, opacity: h ? 1 : 0.6 }} />
      <circle cx="20" cy="20" r="2.5" fill={c} style={{ transition: T, transform: h ? 'scale(1.3)' : 'none', transformOrigin: '20px 20px' }} />
      <line x1="20" y1="2" x2="20" y2="10" stroke={c} strokeWidth="1.5" opacity={h ? 0.8 : 0.4} style={{ transition: T }} />
      <line x1="20" y1="30" x2="20" y2="38" stroke={c} strokeWidth="1.5" opacity={h ? 0.8 : 0.4} style={{ transition: T }} />
      <line x1="2" y1="20" x2="10" y2="20" stroke={c} strokeWidth="1.5" opacity={h ? 0.8 : 0.4} style={{ transition: T }} />
      <line x1="30" y1="20" x2="38" y2="20" stroke={c} strokeWidth="1.5" opacity={h ? 0.8 : 0.4} style={{ transition: T }} />
    </svg>
  </div>
);

const WAIPhone = ({ c, h }: { c: string; h?: boolean }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1 justify-center items-center">
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <path d="M10,14 Q10,8 16,8 L18,8 L18,16 L14,18 Q12,26 20,28 L22,24 L30,24 L30,26 Q30,32 24,32 Q10,30 10,14Z"
        fill={`${c}20`} stroke={c} strokeWidth="1.5" strokeLinejoin="round"
        style={{ transition: T, filter: h ? 'brightness(1.2)' : 'none' }} />
      <path d="M26,10 Q30,14 26,18" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"
        style={{ transition: T, opacity: h ? 0.9 : 0.4 }} />
      <path d="M30,7 Q36,14 30,21" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"
        style={{ transition: T, opacity: h ? 0.7 : 0.25 }} />
    </svg>
  </div>
);

const WKnowledge = ({ c, h }: { c: string; h?: boolean }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1 justify-center items-center">
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <rect x="6" y="12" width="20" height="22" rx="2" fill={`${c}15`} stroke={`${c}40`} strokeWidth="1.5" />
      <line x1="10" y1="18" x2="22" y2="18" stroke={`${c}30`} strokeWidth="1" />
      <line x1="10" y1="22" x2="20" y2="22" stroke={`${c}30`} strokeWidth="1" />
      <line x1="10" y1="26" x2="18" y2="26" stroke={`${c}30`} strokeWidth="1" />
      <circle cx="28" cy="16" r="7" fill="none" stroke={c} strokeWidth="2" style={{ transition: T, opacity: h ? 1 : 0.6 }} />
      <line x1="33" y1="21" x2="37" y2="25" stroke={c} strokeWidth="2.5" strokeLinecap="round" style={{ transition: T, opacity: h ? 1 : 0.6 }} />
    </svg>
  </div>
);

const WAutomation = ({ c, h }: { c: string; h?: boolean }) => (
  <div className="w-full h-full p-2 flex flex-col gap-1 justify-center items-center">
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <path d="M22,4 L14,20 L20,20 L18,36 L28,18 L22,18 Z"
        fill={`${c}25`} stroke={c} strokeWidth="1.5" strokeLinejoin="round"
        style={{ transition: T, filter: h ? 'brightness(1.3)' : 'none' }} />
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const r = 17;
        const cx = 20 + r * Math.cos((angle - 90) * Math.PI / 180);
        const cy = 20 + r * Math.sin((angle - 90) * Math.PI / 180);
        return <circle key={i} cx={cx} cy={cy} r="1.5" fill={c}
          style={{ transition: T, transitionDelay: h ? `${i * 50}ms` : '0ms', opacity: h ? 0.8 : 0.3 }} />;
      })}
    </svg>
  </div>
);

/* ─── App list with estimated standalone prices ─────────────────────────── */

type AppDef = { label: string; color: string; W: React.FC<{ c: string; h?: boolean }>; price: number; icon?: string };

const apps: AppDef[] = [
  { label: 'Email', color: '#3b82f6', W: WLines, price: 6, icon: '/icons/svg/email.svg' },
  { label: 'Messenger', color: '#8b5cf6', W: WChat, price: 15, icon: '/icons/svg/messenger.svg' },
  { label: 'Phone', color: '#22c55e', W: WDots, price: 25, icon: '/icons/svg/phone.svg' },
  { label: 'Tickets', color: '#f59e0b', W: WTag, price: 20, icon: '/icons/svg/tickets.svg' },
  { label: 'Calendar', color: '#6366f1', W: WCalendar, price: 8, icon: '/icons/svg/calendar.svg' },
  { label: 'Bookings', color: '#ec4899', W: WSlots, price: 25, icon: '/icons/svg/bookings.svg' },
  { label: 'Scheduling Links', color: '#14b8a6', W: WLink, price: 10, icon: '/icons/svg/scheduling-links.svg' },
  { label: 'Dispatch', color: '#f97316', W: WMap, price: 40, icon: '/icons/svg/dispatch.svg' },
  { label: 'Jobs', color: '#84cc16', W: WJobSteps, price: 30, icon: '/icons/svg/jobs.svg' },
  { label: 'Routes', color: '#0ea5e9', W: WPath, price: 30, icon: '/icons/svg/routes.svg' },
  { label: 'Projects', color: '#a855f7', W: WKanban, price: 10, icon: '/icons/svg/projects.svg' },
  { label: 'Tasks', color: '#ef4444', W: WChecks, price: 5, icon: '/icons/svg/tasks.svg' },
  { label: 'Operations', color: '#64748b', W: WGauges, price: 25, icon: '/icons/svg/operations.svg' },
  { label: 'Time Tracking', color: '#06b6d4', W: WTimer, price: 10, icon: '/icons/svg/time-tracking.svg' },
  { label: 'CRM', color: '#3b82f6', W: WPeople, price: 25, icon: '/icons/svg/crm.svg' },
  { label: 'Products', color: '#22c55e', W: WCard, price: 15, icon: '/icons/svg/products.svg' },
  { label: 'Orders', color: '#f97316', W: WReceipt, price: 20, icon: '/icons/svg/orders.svg' },
  { label: 'Finance', color: '#059669', W: WLineChart, price: 25, icon: '/icons/svg/finance.svg' },
  { label: 'Invoicing', color: '#f59e0b', W: WDoc, price: 20, icon: '/icons/svg/invoicing.svg' },
  { label: 'Payments', color: '#8b5cf6', W: WPayment, price: 15, icon: '/icons/svg/payments.svg' },
  { label: 'Purchasing', color: '#b45309', W: WShipping, price: 15, icon: '/icons/svg/purchasing.svg' },
  { label: 'Voice Notes', color: '#ef4444', W: WWave, price: 8, icon: '/icons/svg/voice-notes.svg' },
  { label: 'Meeting Notes', color: '#6366f1', W: WMeetingNotes, price: 10, icon: '/icons/svg/meeting-notes.svg' },
  { label: 'Documents', color: '#0891b2', W: WDocBlocks, price: 10, icon: '/icons/svg/documents.svg' },
  { label: 'Assistant', color: '#a855f7', W: WAssistant, price: 20, icon: '/icons/svg/assistant.svg' },
  { label: 'Brain', color: '#ec4899', W: WNodes, price: 10, icon: '/icons/svg/brain.svg' },
  { label: 'Agents', color: '#7c3aed', W: WAgent, price: 20, icon: '/icons/svg/agents.svg' },
  { label: 'Research', color: '#6366f1', W: WSearch, price: 15, icon: '/icons/svg/research.svg' },
  { label: 'Playbooks', color: '#14b8a6', W: WPlaybook, price: 15, icon: '/icons/svg/playbooks.svg' },
  { label: 'Org Chart', color: '#8b5cf6', W: WTree, price: 5, icon: '/icons/svg/org-chart.svg' },
  { label: 'Team Map', color: '#d97706', W: WTeamBubbles, price: 10, icon: '/icons/svg/team-map.svg' },
  { label: 'People', color: '#f97316', W: WPeopleGrid, price: 8, icon: '/icons/svg/people.svg' },
  { label: 'Website Builder', color: '#06b6d4', W: WBlocks, price: 20, icon: '/icons/svg/website-builder.svg' },
  { label: 'Creative Studio', color: '#ec4899', W: WCreative, price: 15, icon: '/icons/svg/creative-studio.svg' },
  { label: 'Marketing', color: '#f97316', W: WMegaphone, price: 30, icon: '/icons/svg/marketing.svg' },
  { label: 'Social', color: '#e11d48', W: WSocial, price: 15, icon: '/icons/svg/social.svg' },
  { label: 'Funnels', color: '#f59e0b', W: WFunnel, price: 20, icon: '/icons/svg/funnels.svg' },
  { label: 'Reports', color: '#3b82f6', W: WPieChart, price: 15, icon: '/icons/svg/reports.svg' },
  { label: 'Slides', color: '#22c55e', W: WSlide, price: 12, icon: '/icons/svg/slides.svg' },
  { label: 'Briefs', color: '#06b6d4', W: WBrief, price: 10, icon: '/icons/svg/briefs.svg' },
  { label: 'Files', color: '#84cc16', W: WFiles, price: 8, icon: '/icons/svg/files.svg' },
  { label: 'Forms', color: '#14b8a6', W: WForm, price: 10, icon: '/icons/svg/forms.svg' },
  { label: 'Custom Apps', color: '#a855f7', W: WPuzzle, price: 10, icon: '/icons/svg/custom-apps.svg' },
  { label: 'Watch', color: '#ef4444', W: WWatch, price: 5, icon: '/icons/svg/watch.svg' },
  { label: 'Strategy Analysis', color: '#0d9488', W: WStrategy, price: 30 },
  { label: 'AI Phone & SMS', color: '#16a34a', W: WAIPhone, price: 25 },
  { label: 'Knowledge Search', color: '#7c3aed', W: WKnowledge, price: 10 },
  { label: 'Automation', color: '#eab308', W: WAutomation, price: 20 },
];

const TOTAL_PRICE = apps.reduce((s, a) => s + a.price, 0);


/* ─── Isometric box — hero colors ────────────────────────────────────────── */
// Matching the 3D hero box: '#FF9ED4','#60C0FF','#FFB878','#50EE90','#D09CFF','#FFD060','#40D8F0','#FF9898','#50EAAC'
// Gray base: #6a7a96

const BOX_VB = "-60 -40 420 380";
const BOX_W = 240;
const BOX_H = 220;

// Pastel versions of the hero palette for the open box walls
const BX_BACK_L = '#b8d8ff';  // light blue (from #60C0FF)
const BX_BACK_R = '#e4c6ff';  // light purple (from #D09CFF)
const BX_FRONT_L = '#ffc8e8'; // light pink (from #FF9ED4)
const BX_FRONT_R = '#ffe0b0'; // light orange (from #FFB878)
const BX_FLOOR = '#c0f5d8';   // light green (from #50EE90)
const BX_FLAP_BL = '#b8eef8'; // light cyan (from #40D8F0)
const BX_FLAP_BR = '#ffe4a0'; // light yellow (from #FFD060)
const BX_FLAP_FL = '#ffc4c4'; // light salmon (from #FF9898)
const BX_FLAP_FR = '#b8f5d8'; // light mint (from #50EAAC)
const BX_STROKE = '#94a3b8';

const BoxBack: React.FC<{ progress: number; currentPrice: number }> = ({ progress, currentPrice }) => (
  <div className="relative">
    <svg viewBox={BOX_VB} width={BOX_W} height={BOX_H} style={{ overflow: 'visible' }}>
      {/* Back flaps */}
      <path d="M150,20 L40,75 L-80,40 L30,-15 Z" fill={BX_FLAP_BL} stroke={BX_STROKE} strokeWidth="1" />
      <path d="M150,20 L260,75 L380,40 L270,-15 Z" fill={BX_FLAP_BR} stroke={BX_STROKE} strokeWidth="1" />
      {/* Back walls */}
      <path d="M150,20 L40,75 L40,215 L150,160 Z" fill={BX_BACK_L} stroke={BX_STROKE} strokeWidth="1" />
      <path d="M150,20 L260,75 L260,215 L150,160 Z" fill={BX_BACK_R} stroke={BX_STROKE} strokeWidth="1" />
      {/* Floor */}
      <path d="M40,215 L150,270 L260,215 L150,160 Z" fill={BX_FLOOR} stroke={BX_STROKE} strokeWidth="1" />
      {/* Price inside */}
      {currentPrice > 0 && (
        <text x="150" y="210" textAnchor="middle" fill="#6a7a96" fontSize="22" fontWeight="700" fontFamily="ui-monospace, monospace" opacity="0.6">
          ${currentPrice}/mo
        </text>
      )}
    </svg>
  </div>
);

const BoxFront: React.FC<{ progress: number }> = () => (
  <svg viewBox={BOX_VB} width={BOX_W} height={BOX_H} style={{ overflow: 'visible' }}>
    {/* Front walls */}
    <path d="M40,75 L40,215 L150,270 L150,130 Z" fill={BX_FRONT_L} stroke={BX_STROKE} strokeWidth="1" />
    <path d="M260,75 L260,215 L150,270 L150,130 Z" fill={BX_FRONT_R} stroke={BX_STROKE} strokeWidth="1" />
    {/* Front flaps */}
    <path d="M40,75 L150,130 L50,200 L-60,145 Z" fill={BX_FLAP_FL} stroke={BX_STROKE} strokeWidth="1" />
    <path d="M260,75 L150,130 L250,200 L360,145 Z" fill={BX_FLAP_FR} stroke={BX_STROKE} strokeWidth="1" />
    {/* Opening edge */}
    <path d="M40,75 L150,20 L260,75 L150,130 Z" fill="none" stroke="#6a7a96" strokeWidth="1.5" opacity="0.4" />
  </svg>
);

const ClosingBox: React.FC<{ phase: 'closing' | 'present' }> = () => (
  <div className="relative">
    <svg viewBox={BOX_VB} width={BOX_W} height={BOX_H}>
      {/* Walls — vivid hero colors */}
      <path d="M150,20 L40,75 L40,215 L150,160 Z" fill="#60C0FF" />
      <path d="M150,20 L260,75 L260,215 L150,160 Z" fill="#D09CFF" />
      <path d="M40,215 L150,270 L260,215 L150,160 Z" fill="#50EE90" />
      <path d="M40,75 L40,215 L150,270 L150,130 Z" fill="#FF9ED4" />
      <path d="M260,75 L260,215 L150,270 L150,130 Z" fill="#FFB878" />
      {/* Closed flaps — flat on top */}
      <path d="M150,20 L40,75 L150,75 L150,20 Z" fill="#60C0FF" stroke={BX_STROKE} strokeWidth="1" />
      <path d="M150,20 L260,75 L150,75 L150,20 Z" fill="#FFD060" stroke={BX_STROKE} strokeWidth="1" />
      <path d="M40,75 L150,130 L150,75 L40,75 Z" fill="#FF9ED4" stroke={BX_STROKE} strokeWidth="1" />
      <path d="M260,75 L150,130 L150,75 L260,75 Z" fill="#50EAAC" stroke={BX_STROKE} strokeWidth="1" />
    </svg>
  </div>
);

/* ─── Scroll-driven component ───────────────────────────────────────────── */

/* no scroll constants needed — click-driven */

export const AppGridBox: React.FC = () => {
  const { t } = useTranslation('app-grid-box');
  const appLabels = t('apps', { returnObjects: true }) as Record<string, string>;
  const appLabel = (key: string) => appLabels[key] ?? key;
  const [absorbed, setAbsorbed] = useState<Set<string>>(new Set());
  const [absorbing, setAbsorbing] = useState<Set<string>>(new Set());
  const [descending, setDescending] = useState<Set<string>>(new Set());
  const [boxPhase, setBoxPhase] = useState<'open' | 'closing' | 'present'>('open');
  const [hoveredApp, setHoveredApp] = useState<AppDef | null>(null);
  const [hoverRect, setHoverRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const arcTargets = useRef<Map<string, { dx: number; dy: number }>>(new Map());

  // boxRect captured once at click time so it doesn't shift mid-animation
  const boxRectRef = useRef<{ cx: number; cy: number } | null>(null);

  const absorbApp = useCallback((label: string) => {
    const cardEl = cardRefs.current.get(label);
    const br = boxRectRef.current;
    if (cardEl && br) {
      const cr = cardEl.getBoundingClientRect();
      arcTargets.current.set(label, {
        dx: br.cx - (cr.left + cr.width / 2),
        dy: br.cy - (cr.top + cr.height / 2),
      });
    }
    setAbsorbing(prev => new Set(prev).add(label));
    setTimeout(() => { setDescending(prev => new Set(prev).add(label)); }, 420);
    setTimeout(() => {
      setAbsorbing(prev => { const n = new Set(prev); n.delete(label); return n; });
      setDescending(prev => { const n = new Set(prev); n.delete(label); return n; });
      setAbsorbed(prev => new Set(prev).add(label));
    }, 1400);
  }, []);

  // Click box → capture box position once, then absorb all with random stagger
  const absorbAll = useCallback(() => {
    const boxEl = boxRef.current;
    if (boxEl) {
      const r = boxEl.getBoundingClientRect();
      boxRectRef.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    }
    const indices = apps.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    indices.forEach((appIdx, order) => {
      const delay = order * 50 + Math.random() * 120;
      setTimeout(() => absorbApp(apps[appIdx].label), delay);
    });
  }, [absorbApp]);

  const resetAll = useCallback(() => {
    setAbsorbed(new Set());
    setAbsorbing(new Set());
    setDescending(new Set());
    setBoxPhase('open');
    arcTargets.current.clear();
  }, []);

  // Phase transitions
  const allAbsorbed = absorbed.size === apps.length && absorbing.size === 0;
  useEffect(() => {
    if (allAbsorbed && boxPhase === 'open') { const t = setTimeout(() => setBoxPhase('closing'), 400); return () => clearTimeout(t); }
  }, [allAbsorbed, boxPhase]);
  useEffect(() => {
    if (boxPhase === 'closing') { const t = setTimeout(() => setBoxPhase('present'), 1500); return () => clearTimeout(t); }
  }, [boxPhase]);

  const progress = absorbed.size / apps.length;
  const currentPrice = apps.filter(a => absorbed.has(a.label)).reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="relative py-24 md:py-36">
      {/* Header — normal flow */}
      <div className="text-center pt-24 pb-12 px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-slate-900 mb-4">
          One platform. <span className="italic">Every tool.</span>
        </h2>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          {apps.length} apps your business needs — all in a single box.
        </p>
      </div>

      {/* Card grid — normal flow, scrolls with page */}
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {apps.map(app => {
            const Widget = app.W;
            const gone = absorbed.has(app.label);
            const flying = absorbing.has(app.label);
            const target = arcTargets.current.get(app.label);
            const dx = target?.dx ?? 0;
            const dy = target?.dy ?? 0;

            return (
              <motion.div
                key={app.label}
                ref={(el) => { if (el) cardRefs.current.set(app.label, el); }}
                className="relative select-none"
                style={{
                  zIndex: flying ? (descending.has(app.label) ? 20 : 50) : 10,
                  visibility: gone ? 'hidden' : 'visible',
                }}
                initial={false}
                animate={flying ? {
                  x: dx,
                  y: dy + 60,
                  scale: 0.05,
                  opacity: 1,
                } : gone ? undefined : {
                  x: 0, y: 0, scale: 1, opacity: 1,
                }}
                transition={flying ? {
                  duration: 1.2, ease: [0.15, 0, 0.4, 1],
                } : {
                  duration: 0,
                }}
                onMouseEnter={(e) => {
                  if (gone || flying) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setHoverRect({ x: r.left + r.width / 2, y: r.top, w: r.width, h: r.height });
                  setHoveredApp(app);
                }}
                onMouseLeave={() => setHoveredApp(null)}
              >
                <div
                  className="w-full aspect-square rounded-xl overflow-hidden border bg-white shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
                  style={{ borderColor: `${app.color}20`, transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                >
                  <Widget c={app.color} h={hoveredApp?.label === app.label} />
                  <div
                    className="absolute bottom-0 inset-x-0 text-center text-[9px] font-semibold pb-1.5 truncate px-1 rounded-b-xl"
                    style={{ color: app.color, background: 'linear-gradient(to top, white 60%, transparent)' }}
                  >
                    {appLabel(app.label)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hover popup */}
        <AnimatePresence>
          {hoveredApp && hoverRect && (() => {
            const popW = 400;
            const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
            let left = hoverRect.x - popW / 2;
            left = Math.max(12, Math.min(left, vw - popW - 12));
            const above = hoverRect.y - 16;
            const placeAbove = above > 300;
            const top = placeAbove ? undefined : hoverRect.y + hoverRect.h + 12;
            const bottom = placeAbove ? (typeof window !== 'undefined' ? window.innerHeight - above : 400) : undefined;
            return (
              <motion.div
                key={hoveredApp.label}
                initial={{ opacity: 0, y: placeAbove ? 8 : -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="fixed z-[60] pointer-events-none"
                style={{ left, top, bottom, width: popW }}
              >
                <div className="rounded-2xl border bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden" style={{ borderColor: `${hoveredApp.color}30` }}>
                  <div className="px-5 pt-4 pb-3 border-b flex items-center gap-3" style={{ borderColor: `${hoveredApp.color}15` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${hoveredApp.color}12` }}>
                      <hoveredApp.W c={hoveredApp.color} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{appLabel(hoveredApp.label)}</h3>
                      <p className="text-xs text-slate-400">{t('standalone', { price: hoveredApp.price })}</p>
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <div className="space-y-2">
                      <div className="h-2.5 rounded-full w-4/5" style={{ background: `${hoveredApp.color}12` }} />
                      <div className="h-2.5 rounded-full w-full" style={{ background: `${hoveredApp.color}08` }} />
                      <div className="h-2.5 rounded-full w-3/5" style={{ background: `${hoveredApp.color}08` }} />
                    </div>
                    <p className="text-center text-xs text-slate-300 mt-4 italic">{t('previewComingSoon')}</p>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Box — BELOW grid, clickable */}
      <div className="z-20 flex flex-col items-center mt-20">
        <div
          ref={boxRef}
          className="relative cursor-pointer"
          onClick={() => { if (boxPhase === 'open' && absorbed.size < apps.length) absorbAll(); }}
        >
          {(boxPhase === 'closing' || boxPhase === 'present') ? (
            <ClosingBox phase={boxPhase} />
          ) : (
            <>
              <div className="relative z-[5]"><BoxBack progress={progress} currentPrice={currentPrice} /></div>
              <div className="absolute inset-0 z-30"><BoxFront progress={progress} /></div>
            </>
          )}
        </div>

        {/* Fixed-height area below box — prevents layout shift */}
        <div className="relative w-full" style={{ minHeight: 200 }}>
          <AnimatePresence mode="wait">
            {boxPhase === 'open' && absorbed.size === 0 && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-0 top-4 text-sm text-slate-400 flex items-center justify-center gap-2"
              >
                <span className="inline-block w-5 h-5 rounded-full border-2 border-slate-300 animate-pulse" />
                Click the box to put them all in
              </motion.p>
            )}

            {boxPhase === 'present' && (
              <motion.div
                key="price"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute inset-x-0 top-4 flex flex-col items-center gap-4"
              >
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Separately, these tools cost</p>
                  <p className="text-2xl font-mono font-bold text-slate-300 line-through">${TOTAL_PRICE}/mo</p>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="text-center">
                  <p className="text-sm text-blue-500 font-semibold mb-1">Everything in one box</p>
                  <p className="text-4xl font-serif font-bold text-slate-900">$49<span className="text-lg text-slate-400 font-normal">/mo</span></p>
                </motion.div>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} onClick={resetAll}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg mt-2">
                  Take them back out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
