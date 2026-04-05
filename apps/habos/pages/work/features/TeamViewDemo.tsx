import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, User } from 'lucide-react';

/* ── SVG curved connections ───────────────────────────────────── */
/* Symmetric layout:
   Row 0:  [Strategy AI] ─── [You] ─── [Research AI]
   Row 1:        [Sarah C.]        [Marcus R.]
   Row 2:     [UI]  [UX]         [Code]  [QA]
*/

const connections = [
  // You → AI agents (horizontal)
  { id: 'you-strat',    d: 'M 44,10 C 38,10 32,11 28,11', phase: 1, color: '#6366f1' },
  { id: 'you-research', d: 'M 56,10 C 62,10 68,11 72,11', phase: 1, color: '#8b5cf6' },
  // You → People (vertical)
  { id: 'you-sarah',    d: 'M 50,16 C 50,27 30,27 30,36', phase: 2, color: '#ec4899' },
  { id: 'you-marcus',   d: 'M 50,16 C 50,27 70,27 70,36', phase: 2, color: '#3b82f6' },
  // Sarah → her AI agents
  { id: 'sarah-ui',     d: 'M 30,54 C 30,63 20,63 20,70', phase: 3, color: '#ec4899' },
  { id: 'sarah-ux',     d: 'M 30,54 C 30,63 40,63 40,70', phase: 3, color: '#ec4899' },
  // Marcus → his AI agents
  { id: 'marcus-code',  d: 'M 70,54 C 70,63 60,63 60,70', phase: 3, color: '#3b82f6' },
  { id: 'marcus-qa',    d: 'M 70,54 C 70,63 80,63 80,70', phase: 3, color: '#3b82f6' },
];

/* ── Agent node ───────────────────────────────────────────────── */

const AgentNode: React.FC<{ name: string; color: string; show: boolean; pulse: boolean; active: boolean }> = ({
  name, color, show, pulse, active,
}) => (
  <motion.div
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
    style={{
      background: `linear-gradient(135deg, ${color}10 0%, ${color}06 100%)`,
      border: `1.5px dashed ${color}50`,
    }}
    animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8 }}
    transition={{ duration: 0.3 }}
  >
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: color + '18' }}
    >
      <Bot size={11} style={{ color }} />
    </div>
    <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color }}>{name}</span>
    {pulse && active && (
      <motion.div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    )}
  </motion.div>
);

/* ── Person node ──────────────────────────────────────────────── */

const PersonNode: React.FC<{
  name: string; role: string; initials: string; color: string; show: boolean; delay?: number;
}> = ({ name, role, initials, color, show, delay = 0 }) => (
  <motion.div
    className="flex flex-col items-center"
    animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
    transition={{ duration: 0.35, delay }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 shadow-sm"
      style={{ backgroundColor: color + '15', border: `1.5px solid ${color}25` }}
    >
      <span className="text-[11px] font-bold" style={{ color }}>{initials}</span>
    </div>
    <span className="text-[11px] font-semibold text-slate-900 whitespace-nowrap leading-tight">{name}</span>
    <span className="text-[8px] text-slate-400 leading-none">{role}</span>
  </motion.div>
);

/* ── Main component ───────────────────────────────────────────── */

const TeamViewDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 400));
    t.push(setTimeout(() => setPhase(2), 1400));
    t.push(setTimeout(() => setPhase(3), 2600));
    t.push(setTimeout(() => setPhase(4), 3600));
    t.push(setTimeout(() => { setPhase(0); setCycle(c => c + 1); }, 9500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="p-4 md:p-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-900">Your Team</span>
        <motion.span className="text-[9px] text-slate-400 font-medium" animate={{ opacity: phase >= 1 ? 1 : 0 }}>
          3 people · 6 AI agents
        </motion.span>
      </div>

      {/* Org chart */}
      <div className="relative flex-1">

        {/* ── SVG curves ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            {connections.map(c => (
              <linearGradient key={`g-${c.id}`} id={`g-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0.6" />
              </linearGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.35" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connections.map(c => (
            <g key={c.id}>
              {/* Base curve */}
              <motion.path
                d={c.d}
                stroke={`url(#g-${c.id})`}
                strokeWidth="0.5"
                strokeLinecap="round"
                filter="url(#glow)"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: phase >= c.phase ? 1 : 0,
                  opacity: phase >= c.phase ? 1 : 0,
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              {/* Flowing dashes on active */}
              {phase >= 4 && (
                <motion.path
                  d={c.d}
                  stroke={c.color}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeDasharray="1.5 4"
                  strokeOpacity="0.4"
                  vectorEffect="non-scaling-stroke"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -5.5 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </g>
          ))}
        </svg>

        {/* ── Row 0: You + AI agents ── */}

        {/* You (dead center) */}
        <div className="absolute inset-x-0 flex justify-center" style={{ top: '0%' }}>
          <motion.div
            animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.85 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-2xl shadow-lg shadow-slate-900/25">
              <User size={15} />
              <span className="text-sm font-bold">You</span>
            </div>
          </motion.div>
        </div>

        {/* Strategy AI (left of You) */}
        <div className="absolute -translate-x-1/2" style={{ left: '28%', top: '6%' }}>
          <AgentNode name="Strategy AI" color="#6366f1" show={phase >= 1} pulse={phase >= 4} active />
        </div>

        {/* Research AI (right of You) */}
        <div className="absolute -translate-x-1/2" style={{ left: '72%', top: '6%' }}>
          <AgentNode name="Research AI" color="#8b5cf6" show={phase >= 1} pulse={phase >= 4} active />
        </div>

        {/* ── Row 1: Sarah + Marcus ── */}

        <div className="absolute -translate-x-1/2" style={{ left: '30%', top: '32%' }}>
          <PersonNode name="Sarah C." role="VP Design" initials="SC" color="#ec4899" show={phase >= 2} delay={0.1} />
        </div>

        <div className="absolute -translate-x-1/2" style={{ left: '70%', top: '32%' }}>
          <PersonNode name="Marcus R." role="VP Eng" initials="MR" color="#3b82f6" show={phase >= 2} delay={0.2} />
        </div>

        {/* ── Row 2: AI agents under Sarah & Marcus ── */}

        {/* Sarah's agents */}
        <div className="absolute -translate-x-1/2" style={{ left: '20%', top: '68%' }}>
          <AgentNode name="UI Agent" color="#ec4899" show={phase >= 3} pulse={phase >= 4} active />
        </div>
        <div className="absolute -translate-x-1/2" style={{ left: '40%', top: '68%' }}>
          <AgentNode name="UX Agent" color="#ec4899" show={phase >= 3} pulse={phase >= 4} active={false} />
        </div>

        {/* Marcus's agents */}
        <div className="absolute -translate-x-1/2" style={{ left: '60%', top: '68%' }}>
          <AgentNode name="Code AI" color="#3b82f6" show={phase >= 3} pulse={phase >= 4} active />
        </div>
        <div className="absolute -translate-x-1/2" style={{ left: '80%', top: '68%' }}>
          <AgentNode name="QA Agent" color="#3b82f6" show={phase >= 3} pulse={phase >= 4} active />
        </div>

      </div>
    </div>
  );
};

export default TeamViewDemo;
