import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';

const cols = ['', 'A', 'B', 'C', 'D'];
const rows = [
  ['1', 'Department', 'Q1', 'Q2', 'Budget'],
  ['2', 'Engineering', '$45,200', '$48,100', '$180K'],
  ['3', 'Marketing', '$32,800', '$35,400', '$140K'],
  ['4', 'Sales', '$28,600', '$31,200', '$120K'],
  ['5', 'Design', '$18,400', '$19,800', '$78K'],
  ['6', 'Operations', '$22,100', '$23,600', '$92K'],
  ['7', 'Support', '$15,300', '$16,700', '$64K'],
];

const dockApps = [
  { color: '#3b82f6', label: 'Fi' },
  { color: '#10b981', label: 'Nu' },
  { color: '#f59e0b', label: 'Pa' },
  { color: '#ec4899', label: 'Mu' },
  { color: '#8b5cf6', label: 'Xc' },
  { color: '#64748b', label: 'Te' },
];

const LiveViewDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 400));     // Desktop + menu bar
    t.push(setTimeout(() => setPhase(2), 1000));    // App window
    t.push(setTimeout(() => setPhase(3), 2200));    // VOIS button pulses
    t.push(setTimeout(() => setPhase(4), 3400));    // Chat opens
    t.push(setTimeout(() => setPhase(5), 4200));    // System msg
    t.push(setTimeout(() => setPhase(6), 5200));    // User msg
    t.push(setTimeout(() => setPhase(7), 6400));    // AI response
    t.push(setTimeout(() => setPhase(8), 8000));    // Quick action
    t.push(setTimeout(() => { setPhase(0); setCycle(c => c + 1); }, 11000));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="h-full relative overflow-hidden">
      {/* macOS wallpaper */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 55%, #533483 100%)',
        }}
      />

      {/* macOS menu bar */}
      <motion.div
        className="relative z-20 flex items-center justify-between px-2.5"
        style={{
          height: 22,
          backgroundColor: 'rgba(30,30,40,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
      >
        <div className="flex items-center gap-2.5">
          <svg width="10" height="12" viewBox="0 0 14 17" fill="rgba(255,255,255,0.85)">
            <path d="M10.3 0c.1 1.2-.4 2.3-1.1 3.1-.8.8-1.9 1.4-3 1.3-.1-1.1.4-2.3 1.1-3.1C8 .5 9.3 0 10.3 0zm2.4 5.8c-1.4.8-2.3 2.2-2.2 3.8.1 1.8 1.2 3 2.5 3.7-.3.9-.8 1.8-1.5 2.6-.8 1-1.6 2-2.9 2s-1.6-.6-3-.6-1.8.6-3 .6S1 16.9.3 15.9c-.8-1-1.5-2.7-1.5-4.3 0-2.5 1.6-3.9 3.2-3.9 1.2 0 2.2.8 2.8.8.6 0 1.8-.9 3.2-.8.6 0 2 .2 3 1.5-.1 0-1.7 1-1.7 2.8 0 2.1 1.8 2.8 1.8 2.9 0 0-.3 1-.9 2-.6.8-1.2 1.6-2 1.6s-1.1-.5-2.1-.5c-1 0-1.4.5-2.2.5s-1.4-.8-2-1.7" />
          </svg>
          <span className="text-[9px] text-white/80 font-semibold">Numbers</span>
          <span className="text-[9px] text-white/50">File</span>
          <span className="text-[9px] text-white/50">Edit</span>
          <span className="text-[9px] text-white/50">Insert</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-white/40">Tue 9:41</span>
          {/* VOIS menu bar button */}
          <motion.div
            className="w-[15px] h-[15px] rounded-[3px] flex items-center justify-center"
            style={{ backgroundColor: '#6366f1' }}
            animate={
              phase === 3
                ? {
                    scale: [1, 1.25, 1],
                    boxShadow: [
                      '0 0 0 0px rgba(99,102,241,0)',
                      '0 0 0 3px rgba(99,102,241,0.35)',
                      '0 0 0 0px rgba(99,102,241,0)',
                    ],
                  }
                : {}
            }
            transition={phase === 3 ? { duration: 0.9, repeat: Infinity } : { duration: 0.2 }}
          >
            <Sparkles size={8} className="text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* App window */}
      <motion.div
        className="relative z-10 mx-2 mt-1.5 rounded-lg overflow-hidden flex flex-col"
        style={{
          height: 'calc(100% - 56px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
        }}
        animate={{
          opacity: phase >= 2 ? 1 : 0,
          y: phase >= 2 ? 0 : 10,
        }}
        transition={{ duration: 0.35 }}
      >
        {/* Title bar */}
        <div
          className="flex items-center px-2.5 flex-shrink-0"
          style={{ height: 28, backgroundColor: '#e8e8e8' }}
        >
          <div className="flex gap-[6px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57] border border-[#e0443e]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e] border border-[#dea123]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#28c840] border border-[#1aab29]" />
          </div>
          <span className="flex-1 text-center text-[9px] text-[#4d4d4d] font-medium -ml-8">
            Q1 Budget.numbers
          </span>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-1.5 px-2.5 flex-shrink-0 border-b"
          style={{ height: 24, backgroundColor: '#f0f0f0', borderColor: '#d4d4d4' }}
        >
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#d0d0d0]" />
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#d0d0d0]" />
          <div className="w-[1px] h-3 bg-[#d0d0d0] mx-0.5" />
          <span className="text-[8px] text-[#888] font-medium">Sheet 1</span>
          <span className="text-[8px] text-[#bbb] ml-1">Sheet 2</span>
        </div>

        {/* Spreadsheet */}
        <div className="flex-1 bg-white overflow-hidden">
          {/* Column headers */}
          <div className="flex" style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            {cols.map((col, ci) => (
              <div
                key={ci}
                className="text-[7px] font-medium text-center py-[3px]"
                style={{
                  width: ci === 0 ? 20 : ci === 1 ? '28%' : '18%',
                  color: '#999',
                  borderRight: '1px solid #ececec',
                }}
              >
                {col}
              </div>
            ))}
          </div>
          {/* Rows */}
          {rows.map((row, ri) => (
            <div
              key={ri}
              className="flex"
              style={{ borderBottom: '1px solid #f0f0f0' }}
            >
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  className="text-[7px] py-[3px] px-1 truncate"
                  style={{
                    width: ci === 0 ? 20 : ci === 1 ? '28%' : '18%',
                    borderRight: '1px solid #f3f3f3',
                    backgroundColor:
                      ri === 0 ? '#f8f8f8' : ci === 0 ? '#fafafa' : 'white',
                    color:
                      ri === 0 ? '#555' : ci === 0 ? '#aaa' : '#333',
                    fontWeight: ri === 0 ? 600 : 400,
                    textAlign: ci === 0 ? 'center' : 'left',
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dock */}
      <motion.div
        className="absolute bottom-[5px] left-1/2 -translate-x-1/2 z-20 flex items-end gap-[5px] px-1.5 py-[3px] rounded-xl"
        style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}
        transition={{ delay: 0.2 }}
      >
        {dockApps.map((app, i) => (
          <div
            key={i}
            className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}cc 100%)`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            <span className="text-[6px] text-white/90 font-bold">{app.label}</span>
          </div>
        ))}
        {/* Active dot under Numbers */}
        <div
          className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-white/50"
          style={{ marginLeft: -16 }}
        />
      </motion.div>

      {/* VOIS Chat Dropdown */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            className="absolute z-30 right-2 w-[60%]"
            style={{ top: 26 }}
            initial={{ opacity: 0, y: -6, scale: 0.96, transformOrigin: 'top right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-1.5 px-2.5 py-[6px] border-b border-slate-100">
                <div className="w-3.5 h-3.5 rounded-[3px] bg-indigo-500 flex items-center justify-center">
                  <Sparkles size={7} className="text-white" />
                </div>
                <span className="text-[9px] font-bold text-slate-800">VOIS</span>
                <span className="text-[7px] text-slate-400 ml-auto">Numbers Help</span>
              </div>

              {/* Messages */}
              <div className="px-2 py-2 space-y-1.5">
                {/* System detection */}
                <motion.div
                  className="text-[7px] text-slate-400 text-center bg-slate-50 rounded-md py-[3px] px-2"
                  animate={{ opacity: phase >= 5 ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Connected to Numbers documentation
                </motion.div>

                {/* User message */}
                <motion.div
                  className="flex justify-end"
                  animate={{ opacity: phase >= 6 ? 1 : 0, y: phase >= 6 ? 0 : 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-indigo-500 text-white rounded-lg rounded-tr-sm px-2 py-1.5 max-w-[88%]">
                    <p className="text-[8px] leading-snug">
                      How do I make a pivot table from this data?
                    </p>
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  className="flex justify-start"
                  animate={{ opacity: phase >= 7 ? 1 : 0, y: phase >= 7 ? 0 : 4 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="bg-slate-50 rounded-lg rounded-tl-sm px-2 py-1.5 max-w-[92%] border border-slate-100">
                    <p className="text-[8px] text-slate-700 leading-snug mb-1">
                      Select <span className="font-semibold bg-indigo-50 px-0.5 rounded">A1:D7</span>, go to{' '}
                      <span className="font-semibold">Insert &rarr; Pivot Table</span>.
                      Group by &ldquo;Department&rdquo; and sum the quarterly columns.
                    </p>
                    <div className="flex items-center gap-1 text-[7px] text-indigo-500 mt-1">
                      <BookOpen size={7} />
                      <span className="font-medium italic">Numbers User Guide, Ch. 12</span>
                    </div>
                  </div>
                </motion.div>

                {/* Quick action */}
                <motion.div
                  animate={{ opacity: phase >= 8 ? 1 : 0, y: phase >= 8 ? 0 : 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-2 py-[5px] border border-indigo-100 cursor-pointer">
                    <ArrowRight size={8} className="text-indigo-500" />
                    <span className="text-[8px] font-semibold text-indigo-600">
                      Create pivot table now
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveViewDemo;
