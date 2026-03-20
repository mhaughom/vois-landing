import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const projects = [
  { name: 'Q1 Report', tasks: '12/15 done', health: 85, color: '#10b981', status: 'On Track' },
  { name: 'Product Redesign', tasks: '8/20 done', health: 52, color: '#f59e0b', status: 'At Risk' },
  { name: 'API Migration', tasks: '3/18 done', health: 25, color: '#ef4444', status: 'Stalled', stall: true },
];

const ProjectsDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 300));
    t.push(setTimeout(() => setPhase(2), 1000));
    t.push(setTimeout(() => setPhase(3), 2000));
    t.push(setTimeout(() => setPhase(4), 2800));
    t.push(setTimeout(() => { setPhase(0); setCycle(c => c + 1); }, 7000));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="p-5 md:p-7 min-h-[300px]">
      <span className="text-xs font-semibold text-slate-900 mb-4 block">Project Health</span>

      <div className="space-y-3">
        {projects.map((proj, i) => (
          <motion.div
            key={proj.name}
            className={`rounded-xl p-3.5 border ${proj.stall && phase >= 3 ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50'}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{
              opacity: phase >= 1 ? 1 : 0,
              y: phase >= 1 ? 0 : 14,
            }}
            transition={{ duration: 0.3, delay: i * 0.12 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-slate-900">{proj.name}</span>
              <motion.span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: proj.color + '15', color: proj.color }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
              >
                {proj.status}
              </motion.span>
            </div>

            {/* Health bar */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: proj.color }}
                initial={{ width: 0 }}
                animate={{ width: phase >= 2 ? `${proj.health}%` : '0%' }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{proj.tasks}</span>
              <motion.span
                className="text-[10px] font-bold"
                style={{ color: proj.color }}
                animate={{ opacity: phase >= 2 ? 1 : 0 }}
              >
                {proj.health}%
              </motion.span>
            </div>

            {/* Stall alert */}
            {proj.stall && (
              <motion.div
                className="mt-2 pt-2 border-t border-red-200 flex items-start gap-2"
                animate={{ opacity: phase >= 3 ? 1 : 0, height: phase >= 3 ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertTriangle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-semibold text-red-600 block">No activity in 5 days</span>
                  <motion.span
                    className="text-[10px] text-slate-500 block mt-0.5"
                    animate={{ opacity: phase >= 4 ? 1 : 0 }}
                  >
                    Suggestion: Break next milestone into smaller tasks?
                  </motion.span>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsDemo;
