import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const emails = [
  { id: 1, sender: 'Sarah K.', initials: 'SK', subject: 'Q1 Report — final review needed', time: '10:23 AM', score: 92, category: 'Action Required', catColor: '#ef4444' },
  { id: 2, sender: 'Mike T.', initials: 'MT', subject: 'Updated design specs attached', time: '9:41 AM', score: 78, category: 'Action Required', catColor: '#ef4444' },
  { id: 3, sender: 'Calendar', initials: 'Ca', subject: 'Board meeting moved to Thursday', time: '8:55 AM', score: 65, category: 'Scheduling', catColor: '#6366f1' },
  { id: 4, sender: 'HR Team', initials: 'HR', subject: 'Quarterly survey — please complete', time: '8:30 AM', score: 35, category: 'FYI', catColor: '#94a3b8' },
  { id: 5, sender: 'Newsletter', initials: 'NL', subject: 'This week in AI — Feb roundup', time: '7:00 AM', score: 12, category: 'Newsletter', catColor: '#94a3b8' },
];

const MailDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); setExpanded(false); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 400));
    t.push(setTimeout(() => setPhase(2), 1400));
    t.push(setTimeout(() => setPhase(3), 2400));
    t.push(setTimeout(() => setExpanded(true), 3200));
    t.push(setTimeout(() => { setPhase(0); setExpanded(false); setCycle(c => c + 1); }, 7500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  const sorted = phase >= 3
    ? [...emails].sort((a, b) => b.score - a.score)
    : emails;

  return (
    <div ref={ref} className="p-4 md:p-6 min-h-[320px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-900">Inbox</span>
        <motion.span
          className="text-[10px] text-sky-600 font-medium bg-sky-50 px-2 py-0.5 rounded-full"
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          AI Categorized
        </motion.span>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {sorted.map((email, i) => (
            <motion.div
              key={email.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 10 }}
              transition={{
                opacity: { duration: 0.25, delay: i * 0.08 },
                layout: { duration: 0.5 },
              }}
              className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: email.catColor + '80' }}
                >
                  {email.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-900 truncate">{email.sender}</span>
                    <span className="text-[9px] text-slate-400 flex-shrink-0">{email.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{email.subject}</p>
                </div>
                {/* Score badge */}
                <motion.div
                  className="flex flex-col items-center gap-0.5 flex-shrink-0"
                  animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.8 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: email.score >= 70 ? '#fef2f2' : email.score >= 50 ? '#fffbeb' : '#f8fafc',
                      color: email.score >= 70 ? '#ef4444' : email.score >= 50 ? '#f59e0b' : '#94a3b8',
                    }}
                  >
                    {email.score}
                  </span>
                </motion.div>
              </div>

              {/* Expanded reply preview */}
              <AnimatePresence>
                {expanded && email.id === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Suggested Reply</span>
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug italic">
                        "Hi Sarah, I'll have the final review done by end of day. I've flagged two items that need your input — see comments in the doc."
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MailDemo;
