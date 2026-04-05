import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, Palette, Code2, Users, Clock, Target } from 'lucide-react';

const tasks = [
  {
    id: 1, title: 'Finalize Q1 report', project: 'Q1 Report', score: 94,
    time: '45m', due: 'Today',
    icon: BarChart3,
    gradient: ['#6366f1', '#818cf8'] as const, color: '#6366f1',
  },
  {
    id: 2, title: 'Review design mockups', project: 'Redesign', score: 72,
    time: '30m', due: 'Today',
    icon: Palette,
    gradient: ['#ec4899', '#f472b6'] as const, color: '#ec4899',
  },
  {
    id: 3, title: 'Update API docs', project: 'Platform', score: 58,
    time: '25m', due: 'Wed',
    icon: Code2,
    gradient: ['#10b981', '#34d399'] as const, color: '#10b981',
  },
  {
    id: 4, title: 'Team feedback survey', project: 'People', score: 45,
    time: '15m', due: 'Thu',
    icon: Users,
    gradient: ['#f59e0b', '#fbbf24'] as const, color: '#f59e0b',
  },
];

type Task = typeof tasks[number];
const sortedTasks = [...tasks].sort((a, b) => b.score - a.score);

/* ── Score ring ───────────────────────────────────────────────── */
const ScoreBadge: React.FC<{ score: number; active: boolean }> = ({ score, active }) => {
  const r = 11;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : '#10b981';
  return (
    <div className="relative w-7 h-7 flex-shrink-0">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={r} fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
        <motion.circle
          cx="14" cy="14" r={r}
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: active ? circ - (circ * score) / 100 : circ }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 14 14)"
        />
      </svg>
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
        style={{ color }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ delay: 0.5 }}
      >
        {score}
      </motion.span>
    </div>
  );
};

/* ── Gradient app icon ────────────────────────────────────────── */
const AppIcon: React.FC<{ task: Task; visible: boolean; size?: 'sm' | 'md' }> = ({ task, visible, size = 'md' }) => {
  const Icon = task.icon;
  const cls = size === 'sm' ? 'w-6 h-6 rounded-[6px]' : 'w-10 h-10 rounded-[10px]';
  const iconPx = size === 'sm' ? 12 : 18;
  return (
    <motion.div
      className={`${cls} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${task.gradient[0]} 0%, ${task.gradient[1]} 100%)`,
        boxShadow: `0 2px 8px ${task.color}40, 0 1px 3px ${task.color}30`,
      }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.3, type: 'spring', damping: 15 }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 50%)' }}
      />
      <Icon size={iconPx} className="text-white relative z-10" strokeWidth={2.2} />
    </motion.div>
  );
};

/* ── Calendar hours ───────────────────────────────────────────── */
const calHours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM'];

/* ══════════════════════════════════════════════════════════════════
   Phase 0  — blank
   Phase 1  — tasks appear with detail
   Phase 2  — "Analyzing…" scan line
   Phase 3  — scores revealed
   Phase 4  — sorted + top highlighted
   Phase 5  — collapse into focus block
   Phase 6  — place into calendar
   ══════════════════════════════════════════════════════════════════ */

const TasksDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [sorted, setSorted] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); setSorted(false); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 400));
    t.push(setTimeout(() => setPhase(2), 1400));
    t.push(setTimeout(() => setPhase(3), 2400));
    t.push(setTimeout(() => setSorted(true), 3200));
    t.push(setTimeout(() => setPhase(4), 3500));
    t.push(setTimeout(() => setPhase(5), 5200));
    t.push(setTimeout(() => setPhase(6), 7000));
    t.push(setTimeout(() => { setPhase(0); setSorted(false); setCycle(c => c + 1); }, 10800));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  const displayTasks = sorted ? sortedTasks : tasks;

  return (
    <div ref={ref} className="p-5 md:p-6 h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ────────── Phase 1–4: Task list ────────── */}
        {phase <= 4 && (
          <motion.div
            key="task-list"
            className="flex flex-col flex-1"
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-900">Today's Tasks</span>
              <AnimatePresence mode="wait">
                {phase >= 3 ? (
                  <motion.span
                    key="sorted"
                    className="text-[10px] text-slate-400 font-medium"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    Sorted by AI score
                  </motion.span>
                ) : phase >= 2 ? (
                  <motion.span
                    key="analyzing"
                    className="inline-flex items-center gap-1 text-[10px] text-indigo-500 font-medium"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <motion.span
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="inline-flex"
                    >
                      <Sparkles size={10} />
                    </motion.span>
                    Analyzing…
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="space-y-2 relative">
              {phase === 2 && (
                <motion.div
                  className="absolute left-0 right-0 h-[2px] rounded-full z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%)' }}
                  initial={{ top: 0, opacity: 0 }}
                  animate={{ top: ['0%', '100%', '0%'], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              <AnimatePresence mode="popLayout">
                {displayTasks.map((task, i) => {
                  const isTop = sorted && i === 0;
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 16 }}
                      transition={{
                        opacity: { duration: 0.3, delay: i * 0.1 },
                        layout: { duration: 0.5, ease: 'easeInOut' },
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 border transition-colors duration-300"
                      style={{
                        backgroundColor: isTop && phase >= 4 ? '#eef2ff' : '#f8fafc',
                        borderColor: isTop && phase >= 4 ? '#c7d2fe' : '#f1f5f9',
                      }}
                    >
                      <AppIcon task={task} visible={phase >= 1} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[9px] font-semibold" style={{ color: task.color + 'cc' }}>
                            {task.project}
                          </span>
                          <span className="text-[9px] text-slate-300">·</span>
                          <span className="text-[9px] text-slate-400">{task.due}</span>
                          <span className="text-[9px] text-slate-300">·</span>
                          <span className="text-[9px] text-slate-400 inline-flex items-center gap-0.5">
                            <Clock size={8} />
                            {task.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <ScoreBadge score={task.score} active={phase >= 3} />
                        {isTop && phase >= 4 && (
                          <motion.span
                            className="text-[7px] font-bold text-white bg-indigo-500 px-1.5 py-[1px] rounded-full uppercase tracking-wider"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            Top
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ────────── Phase 5: Focus block ────────── */}
        {phase === 5 && (
          <motion.div
            key="focus-block"
            className="flex flex-col items-center justify-center flex-1"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <motion.div
              className="w-full bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 rounded-2xl border border-indigo-100/80 p-5 shadow-lg shadow-indigo-100/40"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-300/40">
                  <Target size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Morning Focus</p>
                  <p className="text-[11px] text-slate-500">4 tasks · 1h 55m</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {sortedTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    className="flex items-center gap-2.5 px-3 py-2 bg-white/60 rounded-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.25 }}
                  >
                    <AppIcon task={task} visible size="sm" />
                    <span className="text-[10px] font-medium text-slate-700 flex-1 truncate">
                      {task.title}
                    </span>
                    <span className="text-[9px] text-slate-400 flex-shrink-0">{task.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ────────── Phase 6: Calendar ────────── */}
        {phase === 6 && (
          <motion.div
            key="calendar"
            className="flex flex-col flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-900">Today's Schedule</span>
              <span className="text-[10px] text-slate-400">Thursday, Feb 27</span>
            </div>

            <div className="relative flex-1">
              {calHours.map((hour, i) => (
                <div
                  key={hour}
                  className="flex items-start"
                  style={{ height: i < calHours.length - 1 ? 50 : 14 }}
                >
                  <span className="text-[9px] text-slate-400 w-11 pt-px flex-shrink-0 text-right pr-2.5">
                    {hour}
                  </span>
                  <div className="flex-1 border-t border-slate-100 h-full" />
                </div>
              ))}

              {/* Focus block: 9–11 AM */}
              <motion.div
                className="absolute right-0 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-200/60 px-3 py-2.5 overflow-hidden"
                style={{ left: 44, top: 50, height: 96 }}
                initial={{ opacity: 0, scale: 0.92, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Target size={10} className="text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-700">Morning Focus</span>
                  <span className="text-[9px] text-indigo-400 ml-auto">1h 55m</span>
                </div>
                <p className="text-[9px] text-indigo-500/70 mb-1.5">4 tasks · AI-scheduled</p>
                <div className="flex gap-1">
                  {sortedTasks.map((task) => (
                    <AppIcon key={task.id} task={task} visible size="sm" />
                  ))}
                </div>
              </motion.div>

              {/* Team standup: 11–11:30 AM */}
              <motion.div
                className="absolute right-0 bg-emerald-50 rounded-xl border border-emerald-200/60 px-3 py-2"
                style={{ left: 44, top: 152, height: 42 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                <span className="text-[10px] font-bold text-emerald-700">Team Standup</span>
                <span className="text-[9px] text-emerald-500 block">11:00 – 11:30</span>
              </motion.div>

              {/* Lunch: 12 PM */}
              <motion.div
                className="absolute right-0 bg-amber-50/60 rounded-xl border border-amber-200/40 px-3 py-1.5"
                style={{ left: 44, top: 202, height: 32 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <span className="text-[10px] font-semibold text-amber-600">Lunch Break</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksDemo;
