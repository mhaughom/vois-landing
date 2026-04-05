import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Bot, Globe, BarChart3, FileText, Check, Sparkles } from 'lucide-react';

const subAgents = [
  { name: 'Web Scraper', icon: Globe, task: 'Crawling 4 competitor sites', color: '#3b82f6' },
  { name: 'Data Analyst', icon: BarChart3, task: 'Processing pricing data', color: '#f59e0b' },
  { name: 'Report Writer', icon: FileText, task: 'Drafting insights report', color: '#10b981' },
];

const AgentsDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 500));     // Agent card appears
    t.push(setTimeout(() => setPhase(2), 1500));    // Sub-agents reveal
    t.push(setTimeout(() => setPhase(3), 3500));    // "Hire" button tapped
    t.push(setTimeout(() => setPhase(4), 4300));    // Working state — agents active
    t.push(setTimeout(() => setPhase(5), 5300));    // First sub-agent done
    t.push(setTimeout(() => setPhase(6), 6300));    // Second done
    t.push(setTimeout(() => setPhase(7), 7300));    // All done — mission complete
    t.push(setTimeout(() => { setPhase(0); setCycle(c => c + 1); }, 10000));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  const hired = phase >= 4;
  const doneCount = phase >= 7 ? 3 : phase >= 6 ? 2 : phase >= 5 ? 1 : 0;

  return (
    <div ref={ref} className="p-4 md:p-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-900">Hire AI Agents</span>
        <AnimatePresence mode="wait">
          {phase >= 7 ? (
            <motion.span
              key={`complete-${cycle}`}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Check size={9} />
              Mission complete
            </motion.span>
          ) : hired ? (
            <motion.span
              key={`working-${cycle}`}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-flex"
              >
                <Sparkles size={9} />
              </motion.span>
              Working...
            </motion.span>
          ) : phase >= 1 ? (
            <motion.span
              key={`new-${cycle}`}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Sparkles size={9} />
              New agent
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Agent profile card */}
      <motion.div
        className="rounded-xl border border-slate-200 bg-white flex-1 flex flex-col overflow-hidden"
        animate={{
          opacity: phase >= 1 ? 1 : 0,
          y: phase >= 1 ? 0 : 16,
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Agent header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: hired ? '#6366f115' : '#f1f5f9' }}
              animate={hired ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <Bot size={20} style={{ color: hired ? '#6366f1' : '#94a3b8' }} />
            </motion.div>
            <div>
              <span className="text-[12px] font-semibold text-slate-900 block">
                Research Director
              </span>
              <span className="text-[10px] text-slate-400">
                {hired ? 'Mission: Competitor pricing analysis' : 'Competitive Intelligence Specialist'}
              </span>
            </div>
            {hired && (
              <motion.div
                className="ml-auto w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0"
                animate={phase < 7 ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                transition={phase < 7 ? { duration: 1, repeat: Infinity } : {}}
                style={{ backgroundColor: phase >= 7 ? '#10b981' : '#6366f1' }}
              />
            )}
          </div>
        </div>

        {/* Sub-agents */}
        <div className="px-4 py-3 flex-1">
          <motion.span
            className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block mb-2"
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
          >
            {hired ? 'Sub-agents working' : 'Comes with 3 expert sub-agents'}
          </motion.span>

          <div className="space-y-2">
            {subAgents.map((agent, i) => {
              const isDone = hired && i < doneCount;
              const isWorking = hired && i === doneCount && doneCount < 3;
              return (
                <motion.div
                  key={agent.name}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 border"
                  style={{
                    backgroundColor: isDone
                      ? agent.color + '08'
                      : isWorking
                        ? '#fefce8'
                        : '#fafafa',
                    borderColor: isDone
                      ? agent.color + '25'
                      : isWorking
                        ? '#fef08a'
                        : '#f1f5f9',
                  }}
                  animate={{
                    opacity: phase >= 2 ? 1 : 0,
                    x: phase >= 2 ? 0 : 16,
                  }}
                  transition={{ duration: 0.3, delay: i * 0.2 }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isDone || isWorking ? agent.color + '15' : '#f1f5f9',
                    }}
                  >
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                      >
                        <Check size={13} style={{ color: agent.color }} />
                      </motion.div>
                    ) : (
                      <agent.icon
                        size={13}
                        style={{ color: isDone || isWorking || !hired ? agent.color : '#94a3b8' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-800 block">
                      {agent.name}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {isDone ? 'Done' : hired ? agent.task : agent.task.split(' ')[0] + '...'}
                    </span>
                  </div>
                  {isWorking && (
                    <motion.div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.color }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom action */}
        <div className="px-4 pb-4">
          <AnimatePresence mode="wait">
            {phase >= 7 ? (
              <motion.div
                key={`done-${cycle}`}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 border border-emerald-100"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check size={12} className="text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-700">
                  Report delivered to your inbox
                </span>
              </motion.div>
            ) : hired ? (
              <motion.div
                key={`progress-${cycle}`}
                className="relative h-2 rounded-full bg-slate-100 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                  animate={{
                    width: phase >= 6 ? '90%' : phase >= 5 ? '60%' : '30%',
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </motion.div>
            ) : phase >= 1 ? (
              <motion.div
                key={`hire-${cycle}`}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="relative flex-1 py-2 rounded-lg text-[11px] font-semibold text-white bg-indigo-500 text-center overflow-hidden"
                  animate={phase === 3 ? { scale: [1, 0.93, 1.02, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  Hire Agent
                  {phase === 3 && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)',
                      }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 0.6, 0], scale: [0.4, 1.3] }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </motion.div>
                <div className="flex-1 py-2 rounded-lg text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 text-center">
                  View more
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentsDemo;
