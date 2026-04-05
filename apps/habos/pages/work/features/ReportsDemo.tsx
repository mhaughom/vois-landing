import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Check } from 'lucide-react';

const fields = [
  { label: 'Report Title', value: 'Site Inspection — Building C' },
  { label: 'Inspector', value: 'John Mitchell' },
  { label: 'Date', value: 'March 4, 2026' },
  { label: 'Status', value: 'Passed with notes' },
  { label: 'Key Findings', value: 'Structural integrity confirmed. Minor water damage noted in NE corner, level 3.' },
  { label: 'Recommendations', value: 'Schedule waterproofing repair within 2 weeks. Follow-up inspection recommended.' },
];

const ReportsDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [filledCount, setFilledCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [micActive, setMicActive] = useState(-1);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isInView) { setFilledCount(0); setComplete(false); setMicActive(-1); return; }
    const t: ReturnType<typeof setTimeout>[] = [];
    fields.forEach((_, i) => {
      t.push(setTimeout(() => setMicActive(i), 500 + i * 700));
      t.push(setTimeout(() => { setFilledCount(i + 1); setMicActive(-1); }, 500 + i * 700 + 400));
    });
    t.push(setTimeout(() => setComplete(true), 500 + fields.length * 700 + 200));
    t.push(setTimeout(() => { setFilledCount(0); setComplete(false); setMicActive(-1); setCycle(c => c + 1); }, 500 + fields.length * 700 + 3500));
    return () => t.forEach(clearTimeout);
  }, [isInView, cycle]);

  return (
    <div ref={ref} className="p-5 md:p-7 min-h-[320px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-900">Report Template</span>
        {complete && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"
          >
            <Check size={10} /> Complete
          </motion.span>
        )}
      </div>

      <div className="space-y-2.5">
        {fields.map((field, i) => {
          const isFilled = filledCount > i;
          const isActive = micActive === i;
          return (
            <div key={field.label} className="relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block">
                {field.label}
              </span>
              <div
                className={`rounded-lg px-3 py-2 text-[11px] transition-all duration-300 ${
                  isFilled
                    ? 'bg-white border border-slate-200 text-slate-700'
                    : 'bg-slate-50 border border-dashed border-slate-300 text-slate-300'
                }`}
              >
                {isFilled ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {field.value}
                  </motion.span>
                ) : (
                  <span className="italic">Waiting...</span>
                )}
              </div>
              {/* Mic indicator */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-2 top-5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"
                >
                  <Mic size={10} className="text-red-500" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsDemo;
