import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Check } from 'lucide-react';

const docLines = [
  { type: 'heading', text: 'Project Status Update — Q1' },
  { type: 'subtitle', text: 'Prepared for Board Review, March 4 2026' },
  { type: 'section', text: 'Executive Summary' },
  { type: 'body', text: 'Revenue is up 12% QoQ with strong pipeline growth across all segments.' },
  { type: 'section', text: 'Key Highlights' },
  { type: 'bullet', text: 'Enterprise deals increased by 34%' },
  { type: 'bullet', text: 'Customer churn reduced to 2.1%' },
  { type: 'bullet', text: 'New product launch on track for April' },
  { type: 'section', text: 'Risks & Mitigations' },
  { type: 'body', text: 'Engineering capacity is tight. Proposed mitigation: defer non-critical features to Q2.' },
];

const DocumentsDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setPhase(0); setLineCount(0); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 300));
    // Reveal lines one by one
    docLines.forEach((_, i) => {
      t.push(setTimeout(() => setLineCount(i + 1), 800 + i * 350));
    });
    t.push(setTimeout(() => setPhase(2), 800 + docLines.length * 350 + 300));
    t.push(setTimeout(() => { setPhase(0); setLineCount(0); setCycle(c => c + 1); }, 800 + docLines.length * 350 + 3500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="p-5 md:p-7 min-h-[340px] flex flex-col">
      {/* Voice indicator */}
      <motion.div
        className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100"
        animate={{ opacity: phase >= 1 && phase < 2 ? 1 : 0.4 }}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${phase >= 1 && phase < 2 ? 'bg-red-100' : 'bg-slate-100'}`}>
          <Mic size={13} className={phase >= 1 && phase < 2 ? 'text-red-500' : 'text-slate-400'} />
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-slate-500 font-medium">
            {phase >= 2 ? 'Document generated' : phase >= 1 ? 'Speaking...' : 'Ready'}
          </span>
          <div className="flex gap-0.5 mt-1 h-4 items-end">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-red-400 rounded-full"
                animate={{
                  height: phase >= 1 && phase < 2 ? [3, 8 + Math.random() * 8, 3] : 0,
                  opacity: phase >= 1 && phase < 2 ? 1 : 0,
                }}
                transition={{
                  height: { duration: 0.5, repeat: Infinity, delay: i * 0.05 },
                  opacity: { duration: 0.2 },
                }}
              />
            ))}
          </div>
        </div>
        {phase >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <Check size={11} className="text-emerald-600" />
          </motion.div>
        )}
      </motion.div>

      {/* Document */}
      <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 overflow-hidden">
        <div className="space-y-1">
          {docLines.map((line, i) => (
            <motion.div
              key={i}
              animate={{ opacity: lineCount > i ? 1 : 0, y: lineCount > i ? 0 : 6 }}
              transition={{ duration: 0.25 }}
            >
              {line.type === 'heading' && (
                <p className="text-[13px] font-serif font-medium text-slate-900 mb-1">{line.text}</p>
              )}
              {line.type === 'subtitle' && (
                <p className="text-[9px] text-slate-400 mb-2">{line.text}</p>
              )}
              {line.type === 'section' && (
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mt-2 mb-0.5">{line.text}</p>
              )}
              {line.type === 'body' && (
                <p className="text-[10px] text-slate-600 leading-snug">{line.text}</p>
              )}
              {line.type === 'bullet' && (
                <p className="text-[10px] text-slate-600 leading-snug pl-3">• {line.text}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsDemo;
