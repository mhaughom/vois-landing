import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ListTodo, Calendar, StickyNote, User, Clock, MapPin, Folder, CircleDot } from 'lucide-react';

const WAVE_COUNT = 28;
const outputs = [
  {
    icon: ListTodo, label: 'Task',
    title: 'Send report to Sarah',
    detail: 'Due Friday',
    tag: 'Work',
    tagColor: '#3b82f6',
    color: '#22c55e',
    gradientFrom: 'rgba(220,252,231,0.98)',
    gradientTo: 'rgba(187,247,208,0.98)',
    detailIcon: Clock,
  },
  {
    icon: Calendar, label: 'Event',
    title: 'Team standup',
    detail: 'Tue 10:00 AM',
    tag: 'Zoom',
    tagColor: '#6366f1',
    color: '#3b82f6',
    gradientFrom: 'rgba(219,234,254,0.98)',
    gradientTo: 'rgba(191,219,254,0.98)',
    detailIcon: MapPin,
  },
  {
    icon: StickyNote, label: 'Note',
    title: 'Redesign feels focused',
    detail: 'Redesign',
    tag: '',
    tagColor: '',
    color: '#eab308',
    gradientFrom: 'rgba(254,252,232,0.98)',
    gradientTo: 'rgba(254,249,195,0.98)',
    detailIcon: Folder,
  },
  {
    icon: User, label: 'Person',
    title: 'Sarah',
    detail: 'Needs Q1 data',
    tag: 'Work',
    tagColor: '#3b82f6',
    color: '#a855f7',
    gradientFrom: 'rgba(243,232,255,0.98)',
    gradientTo: 'rgba(233,213,255,0.98)',
    detailIcon: CircleDot,
  },
];

const VoiceNotesDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 400));   // Start recording
    t.push(setTimeout(() => setPhase(2), 1800));   // Detect intents, highlight segment 1
    t.push(setTimeout(() => setPhase(3), 2300));   // Highlight segment 2
    t.push(setTimeout(() => setPhase(4), 2800));   // Highlight segment 3
    t.push(setTimeout(() => setPhase(5), 3300));   // Highlight segment 4
    t.push(setTimeout(() => {
      setPhase(0);
      setCycle(c => c + 1);
    }, 7000));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  const recording = phase >= 1 && phase < 2;

  return (
    <div ref={ref} className="p-5 md:p-7 h-full flex flex-col">
      {/* Recording indicator */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: recording ? '#ef4444' : '#6366f1' }}
          animate={{
            opacity: recording ? [1, 0.3, 1] : phase >= 2 ? 1 : 0,
            scale: recording ? [1, 1.3, 1] : 1,
          }}
          transition={recording ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
        <motion.span
          className="text-[11px] font-medium"
          style={{ color: phase >= 2 ? '#6366f1' : '#ef4444' }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {phase >= 2 ? 'Smart Router — 4 intents detected' : 'Recording...'}
        </motion.span>
      </div>

      {/* Waveform */}
      <div className="flex items-center justify-center gap-[3px] h-14 mb-3">
        {Array.from({ length: WAVE_COUNT }).map((_, i) => {
          const segmentIdx = Math.floor(i / (WAVE_COUNT / 4));
          const isHighlighted = phase >= 2 && segmentIdx <= (phase - 2);
          const baseH = 14 + Math.sin(i * 0.7) * 10 + Math.cos(i * 1.3) * 8;

          // During recording, bars pulse continuously via keyframe arrays
          const pulseHeights = [
            baseH * 0.5,
            baseH * 1.1,
            baseH * 0.7,
            baseH * 0.95,
            baseH * 0.5,
          ];

          return (
            <motion.div
              key={i}
              className="rounded-full w-[6px] md:w-[7px]"
              style={{
                backgroundColor: isHighlighted ? outputs[segmentIdx]?.color : '#cbd5e1',
              }}
              animate={{
                height: recording ? pulseHeights : phase >= 2 ? baseH : 4,
                opacity: phase >= 1 ? 1 : 0.3,
              }}
              transition={
                recording
                  ? {
                      height: {
                        duration: 0.7 + (i % 5) * 0.12,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.04,
                      },
                      opacity: { duration: 0.3 },
                    }
                  : { duration: 0.4, delay: i * 0.015 }
              }
            />
          );
        })}
      </div>

      {/* Output cards */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {outputs.map((out, i) => (
          <motion.div
            key={out.label}
            className="rounded-xl overflow-hidden border relative"
            style={{
              background: `linear-gradient(135deg, ${out.gradientFrom} 0%, ${out.gradientTo} 100%)`,
              borderColor: out.color + '25',
              boxShadow: `0 2px 8px ${out.color}10, 0 1px 3px rgba(0,0,0,0.04)`,
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: phase >= (i + 2) ? 1 : 0,
              y: phase >= (i + 2) ? 0 : 20,
              scale: phase >= (i + 2) ? 1 : 0.9,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Glass overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)' }}
            />
            <div className="relative z-10 p-2.5">
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: out.color + '20' }}
                  >
                    <out.icon size={10} style={{ color: out.color }} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: out.color }}>
                    {out.label}
                  </span>
                </div>
                {out.tag && (
                  <span
                    className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-full"
                    style={{ backgroundColor: out.tagColor + '18', color: out.tagColor }}
                  >
                    {out.tag}
                  </span>
                )}
              </div>
              {/* Title */}
              <p className="text-[11px] font-semibold text-slate-800 leading-tight mb-1">{out.title}</p>
              {/* Detail row */}
              <div className="flex items-center gap-1">
                <out.detailIcon size={8} className="text-slate-400 flex-shrink-0" />
                <span className="text-[9px] text-slate-500">{out.detail}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VoiceNotesDemo;
