import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FileText, Radio, CheckSquare } from 'lucide-react';

const tabs = [
  { key: 'before', label: 'Before', icon: FileText },
  { key: 'during', label: 'During', icon: Radio },
  { key: 'after', label: 'After', icon: CheckSquare },
] as const;

const prepPoints = [
  'Q1 revenue was up 12% — mention during growth discussion',
  'Sarah flagged concerns about timeline in last meeting',
  'Competitor launched new pricing tier last week',
];

const transcriptLines = [
  { speaker: 'You', text: "Let's start with the Q1 numbers...", isAI: false },
  { speaker: 'Sarah', text: 'The pipeline looks strong but delivery timelines concern me.', isAI: false },
  { speaker: 'AI', text: "Suggested question: What's the contingency if Q2 targets slip?", isAI: true },
];

const actionItems = [
  'Send updated timeline to Sarah by Friday',
  'Schedule follow-up with engineering lead',
  'Prepare risk assessment for Q2 board meeting',
  'Review competitor pricing analysis',
];

const MeetingNotesDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [activeTab, setActiveTab] = useState(0);
  const [revealCount, setRevealCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Auto-cycle — only when not user-paused
  useEffect(() => {
    if (!isInView) { setActiveTab(0); setRevealCount(0); return; }
    if (userPaused) return;

    const t: ReturnType<typeof setTimeout>[] = [];
    // Before
    t.push(setTimeout(() => setRevealCount(1), 500));
    t.push(setTimeout(() => setRevealCount(2), 900));
    t.push(setTimeout(() => setRevealCount(3), 1300));
    // During
    t.push(setTimeout(() => { setActiveTab(1); setRevealCount(0); }, 2500));
    t.push(setTimeout(() => setRevealCount(1), 3000));
    t.push(setTimeout(() => setRevealCount(2), 3600));
    t.push(setTimeout(() => setRevealCount(3), 4200));
    // After
    t.push(setTimeout(() => { setActiveTab(2); setRevealCount(0); }, 5400));
    t.push(setTimeout(() => setRevealCount(4), 5800));
    // Restart
    t.push(setTimeout(() => { setActiveTab(0); setRevealCount(0); setCycle(c => c + 1); }, 9000));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle, userPaused]);

  const handleTabClick = useCallback((tabIndex: number) => {
    // Clear any running reveal timers
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];

    setUserPaused(true);
    setActiveTab(tabIndex);
    setRevealCount(0);

    // Progressively reveal items for this tab
    const maxItems = tabIndex === 2 ? 4 : 3;
    for (let i = 1; i <= maxItems; i++) {
      revealTimersRef.current.push(
        setTimeout(() => setRevealCount(i), i * 350),
      );
    }

    // Resume auto-cycle after 6 seconds of no interaction
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setUserPaused(false);
      setActiveTab(0);
      setRevealCount(0);
      setCycle(c => c + 1);
    }, 6000);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    revealTimersRef.current.forEach(clearTimeout);
  }, []);

  return (
    <div ref={ref} className="p-5 md:p-7 min-h-[320px]">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(i)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              i === activeTab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div
            key="before"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-indigo-50 rounded-xl p-3.5 mb-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Personal Brief</span>
              <p className="text-[11px] text-indigo-800 mt-1">2pm with Investor X — Board Review</p>
            </div>
            <div className="space-y-2">
              {prepPoints.map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug"
                  animate={{ opacity: revealCount > i ? 1 : 0, x: revealCount > i ? 0 : 8 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="text-indigo-400 mt-0.5">-</span>
                  {point}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div
            key="during"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-medium text-red-600">Live Transcription</span>
            </div>
            {transcriptLines.map((line, i) => (
              <motion.div
                key={i}
                className={`rounded-lg p-2.5 ${line.isAI ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}
                animate={{ opacity: revealCount > i ? 1 : 0, y: revealCount > i ? 0 : 8 }}
                transition={{ duration: 0.3 }}
              >
                <span className={`text-[10px] font-bold ${line.isAI ? 'text-amber-600' : 'text-slate-500'}`}>
                  {line.speaker}
                </span>
                <p className={`text-[11px] ${line.isAI ? 'text-amber-800 italic' : 'text-slate-700'} mt-0.5`}>
                  {line.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div
            key="after"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 block">
              Action Items Extracted
            </span>
            <div className="space-y-2">
              {actionItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
                  animate={{ opacity: revealCount > i ? 1 : 0, x: revealCount > i ? 0 : 12 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <div className="w-4 h-4 rounded border-2 border-emerald-400 flex items-center justify-center flex-shrink-0">
                    <motion.div
                      className="w-2 h-2 rounded-sm bg-emerald-400"
                      animate={{ scale: revealCount > i ? 1 : 0 }}
                      transition={{ delay: 0.2 }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingNotesDemo;
