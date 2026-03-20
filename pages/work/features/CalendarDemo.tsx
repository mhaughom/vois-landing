import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, X, Plus, Utensils } from 'lucide-react';

const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM'];

const ROW_H = 30;

interface CalBlock {
  id: string;
  label: string;
  subtitle: string;
  start: number;
  span: number;
  color: string;
  bg: string;
  before: boolean;
  after: boolean;
}

const allBlocks: CalBlock[] = [
  { id: 'sync', label: 'Team Sync', subtitle: 'Daily standup', start: 0, span: 1, color: '#10b981', bg: '#ecfdf5', before: true, after: true },
  { id: 'budget', label: 'Budget Review', subtitle: 'Q1 numbers', start: 3, span: 1, color: '#f59e0b', bg: '#fffbeb', before: true, after: true },
  { id: 'status', label: 'Status Update', subtitle: 'Weekly sync', start: 5, span: 1, color: '#ec4899', bg: '#fdf2f8', before: true, after: false },
  { id: 'deep', label: 'Deep Work', subtitle: 'Q1 Report', start: 1, span: 2, color: '#6366f1', bg: '#eef2ff', before: false, after: true },
  { id: 'lunch', label: 'Lunch w/ Jamie', subtitle: '1:1 catch-up', start: 4, span: 1, color: '#8b5cf6', bg: '#f5f3ff', before: false, after: true },
  { id: 'client', label: 'Client Call', subtitle: 'Acme follow-up', start: 5, span: 1, color: '#3b82f6', bg: '#dbeafe', before: false, after: true },
];

const deepWorkTasks = [
  'Draft executive summary',
  'Review Q1 financials',
  'Final proofread',
];

const suggestions = [
  { icon: 'cancel' as const, text: 'Cancel Status Update', reason: 'Already covered in Team Sync', color: '#ef4444' },
  { icon: 'add' as const, text: 'Add Deep Work, 9–11 AM', reason: '2h focus block for your Q1 report', color: '#6366f1' },
  { icon: 'add' as const, text: 'Client Call at 1 PM', reason: 'Acme follow-up overdue by 3 days', color: '#3b82f6' },
  { icon: 'lunch' as const, text: 'Lunch with Jamie as 1:1', reason: 'Combine your pending catch-up over lunch', color: '#8b5cf6' },
];

const CalendarDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 500));     // Grid fades in
    t.push(setTimeout(() => setPhase(2), 1500));    // 3 meetings slide in
    t.push(setTimeout(() => setPhase(3), 3500));    // Suggestion card slides up
    t.push(setTimeout(() => setPhase(4), 8800));    // Approve tapped
    t.push(setTimeout(() => setPhase(5), 9600));    // Calendar changes + tasks appear
    t.push(setTimeout(() => setPhase(6), 11200));   // Done bar
    t.push(setTimeout(() => setPhase(7), 13000));   // First task checked off
    t.push(setTimeout(() => {
      setPhase(0);
      setCycle(c => c + 1);
    }, 15500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  const rearranged = phase >= 5;

  return (
    <div ref={ref} className="relative h-full overflow-hidden">
      <div className="p-4 md:p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-900">Tuesday, Mar 4</span>
          <AnimatePresence mode="wait">
            {phase >= 6 ? (
              <motion.span
                key={`done-${cycle}`}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Check size={9} />
                Optimized
              </motion.span>
            ) : phase >= 2 ? (
              <motion.span
                key={`count-${cycle}`}
                className="text-[10px] text-slate-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                3 meetings
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Calendar grid */}
        <div className="relative flex-1">
          <div className="space-y-0">
            {hours.map((h, i) => (
              <div
                key={h}
                className="flex items-start border-t border-slate-100"
                style={{ height: ROW_H }}
              >
                <motion.span
                  className="text-[9px] text-slate-400 w-9 flex-shrink-0 pt-0.5"
                  animate={{ opacity: phase >= 1 ? 1 : 0.3 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {h}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Time blocks */}
          <div className="absolute top-0 left-9 right-0 h-full">
            {allBlocks.map((block, i) => {
              const shouldShow = rearranged
                ? block.after
                : block.before && phase >= 2;

              const top = block.start * ROW_H;
              const height = block.span * ROW_H - 2;

              const afterOnlyIndex = !block.before && block.after
                ? allBlocks.filter((b, j) => j < i && !b.before && b.after).length
                : 0;

              return (
                <motion.div
                  key={block.id}
                  className="absolute left-1 right-1 rounded-lg px-2 py-1 overflow-hidden"
                  style={{
                    top,
                    height,
                    backgroundColor: block.bg,
                    borderLeft: `3px solid ${block.color}`,
                  }}
                  animate={{
                    opacity: shouldShow ? 1 : 0,
                    x: shouldShow ? 0 : rearranged ? 0 : 30,
                    scale: shouldShow ? 1 : rearranged && !block.after ? 0.95 : 1,
                  }}
                  transition={{
                    duration: rearranged ? 0.5 : 0.4,
                    delay: rearranged
                      ? !block.before && block.after
                        ? 0.15 + afterOnlyIndex * 0.18
                        : 0
                      : block.before
                        ? i * 0.12
                        : 0,
                    ease: 'easeOut',
                  }}
                >
                  <span
                    className="text-[10px] font-semibold block leading-tight"
                    style={{ color: block.color }}
                  >
                    {block.label}
                  </span>

                  {/* Deep Work tasks */}
                  {block.id === 'deep' && rearranged ? (
                    <div className="mt-[2px] space-y-[1px]">
                      {deepWorkTasks.map((task, ti) => (
                        <motion.div
                          key={`${cycle}-${ti}`}
                          className="flex items-center gap-1"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + ti * 0.25, duration: 0.3 }}
                        >
                          <motion.div
                            className="w-[9px] h-[9px] rounded-[2px] border flex-shrink-0 flex items-center justify-center"
                            style={{ borderColor: block.color + '60' }}
                            animate={
                              phase >= 7 && ti === 0
                                ? { backgroundColor: block.color, borderColor: block.color }
                                : {}
                            }
                            transition={{ duration: 0.25 }}
                          >
                            {phase >= 7 && ti === 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                              >
                                <Check size={6} className="text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.div>
                          <span
                            className="text-[7px] leading-tight"
                            style={{
                              color: phase >= 7 && ti === 0 ? '#94a3b8' : '#64748b',
                              textDecoration: phase >= 7 && ti === 0 ? 'line-through' : 'none',
                            }}
                          >
                            {task}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    block.subtitle && block.span >= 0.8 && (
                      <span className="text-[8px] text-slate-500 block">
                        {block.subtitle}
                      </span>
                    )
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Suggestion — slides up from bottom */}
      <AnimatePresence>
        {phase >= 3 && phase < 5 && (
          <motion.div
            key={`suggestion-${cycle}`}
            className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-indigo-100 shadow-[0_-8px_30px_rgba(99,102,241,0.08)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          >
            <div className="px-4 pt-3 pb-3.5">
              {/* Card header */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={10} className="text-indigo-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-800">
                  4 suggestions for your day
                </span>
              </div>

              {/* Suggestion bullets — stagger in */}
              <div className="space-y-2 mb-3 ml-7">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-1.5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.7 }}
                  >
                    {s.icon === 'cancel' ? (
                      <X size={10} className="text-red-400 mt-[3px] flex-shrink-0" />
                    ) : s.icon === 'lunch' ? (
                      <Utensils size={10} className="mt-[3px] flex-shrink-0" style={{ color: s.color }} />
                    ) : (
                      <Plus size={10} className="mt-[3px] flex-shrink-0" style={{ color: s.color }} />
                    )}
                    <div>
                      <span
                        className="text-[10px] font-semibold"
                        style={{
                          color: s.icon === 'cancel' ? '#ef4444' : s.color,
                          textDecoration: s.icon === 'cancel' ? 'line-through' : 'none',
                        }}
                      >
                        {s.text}
                      </span>
                      <span className="text-[9px] text-slate-400 block leading-snug">
                        {s.reason}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 ml-7">
                <motion.div
                  className="relative flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-indigo-500 text-center overflow-hidden"
                  animate={
                    phase === 4 ? { scale: [1, 0.91, 1.03, 1] } : {}
                  }
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  Approve all
                  {phase === 4 && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.45) 0%, transparent 70%)',
                      }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 0.7, 0], scale: [0.4, 1.3] }}
                      transition={{ duration: 0.45 }}
                    />
                  )}
                </motion.div>
                <div className="flex-1 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 text-center">
                  Dismiss
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done bar */}
      <AnimatePresence>
        {phase >= 6 && (
          <motion.div
            key={`done-${cycle}`}
            className="absolute bottom-0 left-0 right-0 bg-emerald-50/95 backdrop-blur-sm border-t border-emerald-100"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          >
            <div className="flex items-center justify-center gap-2 py-3.5">
              <motion.div
                className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.15 }}
              >
                <Check size={11} className="text-emerald-600" />
              </motion.div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Day optimized
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarDemo;
